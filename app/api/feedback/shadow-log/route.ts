/**
 * Shadow Log API - 高频日志接收端（Upstash Redis 版）
 * 
 * 架构设计：
 * - 生产环境：写入 Upstash Redis（7天过期 + 5000条限制）
 * - 开发环境：打印到控制台
 * - 使用 waitUntil 确保 Serverless 环境下不丢日志
 * - Pipeline 批量操作减少网络往返
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { waitUntil } from '@vercel/functions';

// Redis 客户端（从环境变量自动读取）
const redis = Redis.fromEnv();

// 配置常量
const CONFIG = {
  REDIS_KEY: 'shadow:logs:beta',
  MAX_LOGS: 4999,           // 保留最新 5000 条
  EXPIRE_SECONDS: 60 * 60 * 24 * 7,  // 7天过期
};

/**
 * 接收客户端批量日志
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logs } = body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid logs format' },
        { status: 400 }
      );
    }

    // 富化日志数据
    const enrichedLogs = logs.map((log: any) => ({
      ...log,
      serverTime: Date.now(),
      environment: process.env.NODE_ENV,
    }));

    if (process.env.NODE_ENV === 'production') {
      // 构建异步写入任务（不阻塞主线程）
      const writeLogTask = async () => {
        const pipeline = redis.pipeline();
        
        // 使用 lpush 将每条日志推入列表头部（最新的在前面）
        enrichedLogs.forEach((log) => {
          pipeline.lpush(CONFIG.REDIS_KEY, JSON.stringify(log));
        });
        
        // 重置过期时间
        pipeline.expire(CONFIG.REDIS_KEY, CONFIG.EXPIRE_SECONDS);
        
        // 限制列表最大长度，防止爆仓
        pipeline.ltrim(CONFIG.REDIS_KEY, 0, CONFIG.MAX_LOGS);
        
        await pipeline.exec();
      };

      // Vercel 优化：等待异步任务完成再冻结容器
      waitUntil(writeLogTask());
      
      // 检测负面反馈（用于争议案例标记）
      const disputedLogs = enrichedLogs.filter(
        (log) => log.feedback && !log.feedback.isAccurate
      );
      
      if (disputedLogs.length > 0) {
        // 异步将争议案例存入 PostgreSQL（黄金样本永久保存）
        waitUntil(persistDisputedCases(disputedLogs));
      }
    } else {
      // 开发环境：打印到控制台
      console.log(`[ShadowLog] Received ${enrichedLogs.length} logs:`);
      enrichedLogs.forEach((log: any, i: number) => {
        console.log(`  [${i + 1}] ${log.id}: ${log.result.verdict} (${log.result.overallScore}分)`);
        if (log.feedback) {
          console.log(`      Feedback: ${log.feedback.isAccurate ? '✓' : '✗'} ${log.feedback.userComment || ''}`);
        }
      });
    }

    return NextResponse.json({ 
      status: 'ok',
      message: 'Log dispatched',
      received: logs.length,
    }, { status: 202 });

  } catch (error) {
    console.error('[ShadowLog] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 将争议案例永久存入 PostgreSQL（黄金样本）
 * 这是"漏斗式存储"的第二层：Redis 挡高频，Postgres 存精华
 */
async function persistDisputedCases(logs: any[]) {
  try {
    // 这里将来接入 Prisma，将争议案例写入 disputed_cases 表
    // 示例：
    // await prisma.disputedCase.createMany({
    //   data: logs.map(log => ({
    //     logId: log.id,
    //     input: log.input,
    //     systemVerdict: log.result.verdict,
    //     userComment: log.feedback.userComment,
    //     correctedVerdict: log.feedback.correctedVerdict,
    //   })),
    // });
    
    console.log(`[DisputedCases] ${logs.length} case(s) marked for persistence`);
  } catch (e) {
    console.error('[DisputedCases] Failed to persist:', e);
  }
}

/**
 * 获取日志（用于调试）
 * GET /api/feedback/shadow-log?limit=100
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // 验证调试密钥（简单防护）
    const debugKey = req.headers.get('x-debug-key');
    if (debugKey !== process.env.DEBUG_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从 Redis 获取日志
    const rawLogs = await redis.lrange(CONFIG.REDIS_KEY, 0, limit - 1);
    
    // 解析并清洗数据
    const parsedLogs = rawLogs.map((logStr) => {
      try {
        return typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
      } catch (e) {
        return { id: 'error', meta: { error: 'Failed to parse log' } };
      }
    });

    return NextResponse.json({
      logs: parsedLogs,
      count: parsedLogs.length,
      redisKey: CONFIG.REDIS_KEY,
    });

  } catch (error) {
    console.error('[ShadowLog] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
