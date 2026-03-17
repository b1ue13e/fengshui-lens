/**
 * Shadow Log API - 高频日志接收端（Upstash Redis + PostgreSQL 双轨存储）
 * 
 * 架构设计：
 * - Redis: 扛高频写入，7天过期，5000条上限（流式数据）
 * - PostgreSQL: 永久保存争议案例（黄金样本）
 * 
 * 漏斗式存储：
 * 所有日志 → Redis → 争议案例标记 → PostgreSQL（DisputedCase）
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';

// 延迟初始化 Redis（避免构建时失败）
let redis: ReturnType<typeof Redis.fromEnv> | null = null;
function getRedis() {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

const CONFIG = {
  REDIS_KEY: 'shadow:logs:beta',
  MAX_LOGS: 4999,
  EXPIRE_SECONDS: 60 * 60 * 24 * 7, // 7天
};

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * POST - 接收日志
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

    const enrichedLogs = logs.map((log: any) => ({
      ...log,
      serverTime: Date.now(),
      environment: process.env.NODE_ENV,
    }));

    if (process.env.NODE_ENV === 'production') {
      // 写入 Redis（非阻塞）
      const writeLogTask = async () => {
        const pipeline = getRedis().pipeline();
        
        enrichedLogs.forEach((log) => {
          pipeline.lpush(CONFIG.REDIS_KEY, JSON.stringify(log));
        });
        
        pipeline.expire(CONFIG.REDIS_KEY, CONFIG.EXPIRE_SECONDS);
        pipeline.ltrim(CONFIG.REDIS_KEY, 0, CONFIG.MAX_LOGS);
        
        await pipeline.exec();
      };

      waitUntil(writeLogTask());
      
      // 争议案例 → PostgreSQL（永久保存）
      const disputedLogs = enrichedLogs.filter(
        (log) => log.feedback && !log.feedback.isAccurate
      );
      
      if (disputedLogs.length > 0) {
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
      
      // 开发环境也演示争议案例持久化
      const disputedLogs = enrichedLogs.filter(
        (log) => log.feedback && !log.feedback.isAccurate
      );
      if (disputedLogs.length > 0) {
        console.log(`[ShadowLog] ${disputedLogs.length} disputed case(s) detected (would persist to DB in production)`);
      }
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
 */
async function persistDisputedCases(logs: any[]) {
  try {
    for (const log of logs) {
      await prisma.disputedCase.create({
        data: {
          sessionId: log.sessionId,
          originalUrl: log.meta?.url,
          engineVersion: log.meta?.version || '1.2.0',
          rawInput: JSON.stringify(log.input),
          verdictIssued: log.result?.verdict,
          userFeedback: log.feedback?.userComment,
          correctedVerdict: log.feedback?.correctedVerdict,
          status: 'PENDING', // 等待人工确认
        },
      });
    }
    
    console.log(`[DisputedCases] ✅ ${logs.length} case(s) persisted to PostgreSQL`);
  } catch (e) {
    console.error('[DisputedCases] ❌ Failed to persist:', e);
  }
}

/**
 * GET - 获取日志（调试用）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const debugKey = req.headers.get('x-debug-key');
    if (debugKey !== process.env.DEBUG_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rawLogs = await getRedis().lrange(CONFIG.REDIS_KEY, 0, limit - 1);
    
    const parsedLogs = rawLogs.map((logStr: string) => {
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
