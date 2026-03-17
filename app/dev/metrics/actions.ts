'use server';

import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import { revalidatePath } from 'next/cache';

const REDIS_KEY = 'shadow:logs:beta';

/**
 * 将争议案例从 Redis 转移至 PostgreSQL（琥珀封存）
 */
export async function escalateToPostgres(logId: string, userFeedback?: string) {
  try {
    const redis = Redis.fromEnv();
    
    // 1. 从 Redis 拉取最新数据，在内存中定位目标 Log
    // 注意：Redis list 不支持直接按 ID 查找，需要遍历
    const rawLogs = await redis.lrange(REDIS_KEY, 0, 1000);
    
    let targetLog: any = null;
    let targetLogStr: string | null = null;
    
    for (const logStr of rawLogs) {
      try {
        const parsed = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
        if (parsed.id === logId) {
          targetLog = parsed;
          targetLogStr = logStr as string;
          break;
        }
      } catch {
        // 跳过脏数据
        continue;
      }
    }

    if (!targetLog) {
      throw new Error('Log expired or not found in Redis');
    }

    // 2. 将高危样本写入 PostgreSQL
    const disputedCase = await prisma.disputedCase.create({
      data: {
        sessionId: targetLog.sessionId || targetLog.id,
        originalUrl: targetLog.meta?.url,
        engineVersion: targetLog.meta?.version || '1.2.0',
        rawInput: JSON.stringify(targetLog.input || {}),
        verdictIssued: targetLog.result?.verdict || 'unknown',
        userFeedback: userFeedback,
        correctedVerdict: undefined, // 等待用户后续补充
        status: 'PENDING',
        syncedToTest: false,
      },
    });

    // 3. 强制刷新看板
    revalidatePath('/dev/metrics');

    return {
      success: true,
      caseId: disputedCase.id,
      message: '争议案例已封存至 PostgreSQL',
    };

  } catch (error) {
    console.error('[Escalate] Failed:', error);
    throw error;
  }
}

/**
 * 批量获取争议案例统计
 */
export async function getDisputedStats() {
  try {
    const stats = await prisma.disputedCase.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const total = await prisma.disputedCase.count();
    
    return {
      total,
      byStatus: stats.reduce((acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('[Stats] Failed:', error);
    return { total: 0, byStatus: {} };
  }
}

/**
 * 更新争议案例状态（人工确认后）
 */
export async function updateCaseStatus(
  caseId: string, 
  status: 'PENDING' | 'RESOLVED' | 'IGNORED',
  correctedVerdict?: string
) {
  try {
    await prisma.disputedCase.update({
      where: { id: caseId },
      data: {
        status,
        correctedVerdict,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dev/metrics');
    return { success: true };
  } catch (error) {
    console.error('[UpdateStatus] Failed:', error);
    throw error;
  }
}
