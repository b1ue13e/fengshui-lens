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
import type { ShadowLogEntry } from '@/lib/feedback/shadow-logger';

const REDIS_KEY = 'shadow:logs:beta';
const SEARCH_LIMIT = 500; // 只在最近500条里找，性能优化

// 延迟初始化 Redis（避免构建时失败）
let redis: ReturnType<typeof Redis.fromEnv> | null = null;
function getRedis() {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

function isShadowLogEntry(value: unknown): value is ShadowLogEntry {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// 强制动态渲染，防止构建时静态生成
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isMissingTableError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'P2021';
}

async function createDisputedCase(
  targetLog: ShadowLogEntry,
  userFeedback?: string,
  expectedVerdict?: string,
) {
  return prisma.disputedCase.create({
    data: {
      sessionId: targetLog.sessionId || targetLog.id,
      originalUrl: targetLog.meta?.url,
      engineVersion: targetLog.meta?.version || '1.2.0',
      rawInput: JSON.stringify(targetLog.input || {}),
      verdictIssued: targetLog.result?.verdict || 'unknown',
      userFeedback,
      correctedVerdict: expectedVerdict,
      status: 'PENDING',
      syncedToTest: false,
    }
  });
}

export async function POST(req: Request) {
  try {
    const { logId, userFeedback, expectedVerdict, logSnapshot } = await req.json();
    
    if (!logId && !isShadowLogEntry(logSnapshot)) {
      return NextResponse.json(
        { error: 'Missing logId or logSnapshot' },
        { status: 400 }
      );
    }

    // 1. 遍历抽样池，精准捞取那条被标记的日志
    // 进阶技巧：为了性能，只在最近的 500 条里找
    let targetLog: ShadowLogEntry | null = null;

    if (isShadowLogEntry(logSnapshot)) {
      targetLog = logSnapshot;
    } else {
      const rawLogs = await getRedis().lrange(REDIS_KEY, 0, SEARCH_LIMIT - 1);

      for (const logStr of rawLogs) {
        try {
          const log: unknown = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
          if (isShadowLogEntry(log) && log.id === logId) {
            targetLog = log;
            break;
          }
        } catch {
          // 跳过脏数据，继续搜索
          continue;
        }
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
    const disputedCase = await createDisputedCase(targetLog, userFeedback, expectedVerdict);

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
    if (isMissingTableError(error)) {
      return NextResponse.json({
        total: 0,
        byStatus: {},
        warning: 'disputed_cases table has not been created locally yet',
      });
    }

    console.error('[Dispute] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
