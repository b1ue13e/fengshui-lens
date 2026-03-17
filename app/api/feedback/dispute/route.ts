/**
 * Dispute API - 天地桥：打通 Redis 到 PostgreSQL 的救援通道
 * 
 * 核心任务：
 * 1. 拿着 ID 去 Redis 捞出即将过期的全量现场数据
 * 2. 永久封存到 PostgreSQL (DisputedCase)
 * 3. 完成数据的"降维提取与升维固化"
 */

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';

const REDIS_KEY = 'shadow:logs:beta';
const SEARCH_LIMIT = 500; // 只在最近500条里找，性能优化

export async function POST(req: Request) {
  try {
    const { logId, userFeedback, expectedVerdict } = await req.json();
    
    if (!logId) {
      return NextResponse.json(
        { error: 'Missing logId' },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();

    // 1. 遍历抽样池，精准捞取那条被标记的日志
    // 进阶技巧：为了性能，只在最近的 500 条里找
    const rawLogs = await redis.lrange(REDIS_KEY, 0, SEARCH_LIMIT - 1);
    let targetLog: any = null;
    
    for (const logStr of rawLogs) {
      try {
        const log = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
        if (log.id === logId) {
          targetLog = log;
          break;
        }
      } catch {
        // 跳过脏数据，继续搜索
        continue;
      }
    }

    if (!targetLog) {
      return NextResponse.json(
        { error: 'Log expired or not found in recent 500 records' },
        { status: 404 }
      );
    }

    // 2. 琥珀封存：写入 PostgreSQL
    // 依据之前设计的 DisputedCase Schema
    const disputedCase = await prisma.disputedCase.create({
      data: {
        sessionId: targetLog.sessionId || targetLog.id,
        originalUrl: targetLog.meta?.url,
        engineVersion: targetLog.meta?.version || '1.2.0',
        rawInput: JSON.stringify(targetLog.input || {}), // 完整的输入数据
        verdictIssued: targetLog.result?.verdict || 'unknown',
        userFeedback: userFeedback,
        correctedVerdict: expectedVerdict, // 用户认为正确的判决
        status: 'PENDING',
        syncedToTest: false,
      }
    });

    console.log(`[Dispute] Case ${disputedCase.id} created for log ${logId}`);

    return NextResponse.json({
      success: true,
      caseId: disputedCase.id,
      message: '争议案例已琥珀封存至 PostgreSQL',
    });

  } catch (error) {
    console.error('[Dispute] Save Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET - 查询争议案例统计
 */
export async function GET() {
  try {
    const stats = await prisma.disputedCase.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const total = await prisma.disputedCase.count();

    return NextResponse.json({
      total,
      byStatus: stats.reduce((acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('[Dispute] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
