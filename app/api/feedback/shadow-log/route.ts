/**
 * Shadow Log API - 接收客户端影子日志
 * 
 * 存储方式：
 * - 开发环境：直接打印到控制台
 * - 生产环境：可接入数据库（Supabase/PostgreSQL）
 */

import { NextRequest, NextResponse } from 'next/server';

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

    // 开发环境：打印到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ShadowLog] Received ${logs.length} logs:`);
      logs.forEach((log: any, i: number) => {
        console.log(`  [${i + 1}] ${log.id}: ${log.result.verdict} (${log.result.overallScore}分)`);
        if (log.feedback) {
          console.log(`      Feedback: ${log.feedback.isAccurate ? '✓' : '✗'} ${log.feedback.userComment || ''}`);
        }
      });
    }

    // 生产环境：存储到数据库（示例）
    // await prisma.shadowLog.createMany({ data: logs });
    
    // 自动测试集扩充逻辑（可选）
    // 如果用户反馈 isAccurate=false，且置信度高，可自动加入测试集
    const feedbackLogs = logs.filter((log: any) => log.feedback && !log.feedback.isAccurate);
    if (feedbackLogs.length > 0) {
      console.log(`[ShadowLog] ${feedbackLogs.length} negative feedback(s) detected, candidates for test case expansion:`);
      feedbackLogs.forEach((log: any) => {
        console.log(`  - ${log.id}: ${log.result.verdict} -> ${log.feedback.correctedVerdict || 'unknown'}`);
      });
    }

    return NextResponse.json({ 
      success: true, 
      received: logs.length,
      feedbackCount: feedbackLogs.length,
    });

  } catch (error) {
    console.error('[ShadowLog] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取日志（仅用于调试）
export async function GET(req: NextRequest) {
  // 验证调试密钥
  const debugKey = req.headers.get('x-debug-key');
  if (debugKey !== process.env.DEBUG_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 返回最近的日志（从数据库或缓存）
  return NextResponse.json({
    logs: [], // 从数据库查询
    count: 0,
  });
}
