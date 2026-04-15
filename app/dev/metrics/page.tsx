// Server Component - 防白屏优化版：抽样读取 + 降维解析
import { Redis } from '@upstash/redis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EscalateButton } from './escalate-button';
import { getDisputedStats } from './actions';
import type { ShadowLogEntry } from '@/lib/feedback/shadow-logger';
import { assertInternalPageAccess } from '@/lib/internal-access';

type ParsedShadowLog = ShadowLogEntry & { serverTime?: number; environment?: string };

interface ShadowMetrics {
  total: number;
  verdictDistribution: { rent: number; cautious: number; avoid: number; unknown: number };
  confidenceDistribution: { high: number; medium: number; low: number };
  goalDistribution: Record<string, number>;
  feedbackStats: { total: number; positive: number; negative: number };
  avgScore: number;
}

interface TrimmedLog {
  id: string;
  verdict?: ShadowLogEntry['result']['verdict'];
  score?: number;
  goal?: string;
  confidence?: NonNullable<ShadowLogEntry['inputQuality']>['confidence'];
  hasFeedback: boolean;
  feedbackAccurate?: boolean;
  timestamp?: number;
}

type ShadowMetricsResult =
  | { success: true; metrics: ShadowMetrics; logs: TrimmedLog[]; sampleSize: number }
  | { success: false; error: string };

function isParsedShadowLog(value: unknown): value is ParsedShadowLog {
  return typeof value === 'object' && value !== null && 'id' in value;
}

export const dynamic = 'force-dynamic';

// 严格限制抽样大小，防止 Vercel Serverless 超时/内存溢出
const SAMPLE_SIZE = 50;
const REDIS_KEY = 'shadow:logs:beta';
const TIMEOUT_MS = 5000; // 5秒超时兜底

/**
 * 安全解析单条日志
 */
function safeParseLog(logStr: string): ParsedShadowLog | null {
  try {
    const data: unknown = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
    if (!isParsedShadowLog(data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * 优化的数据抓取：只读最新 50 条，带超时兜底
 */
async function getOptimizedShadowMetrics(): Promise<ShadowMetricsResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const redis = Redis.fromEnv();
    
    // 核心优化 1：严格限制拉取数量，避免内存爆炸
    const rawLogs = await redis.lrange(REDIS_KEY, 0, SAMPLE_SIZE - 1);
    clearTimeout(timeoutId);
    
    // 核心优化 2：流式解析，脏数据自动过滤
    const parsedLogs = rawLogs
      .map(safeParseLog)
      .filter((log): log is ParsedShadowLog => log !== null);
    
    // 核心优化 3：服务端做轻量聚合，不传输原始大对象到客户端
    const metrics: ShadowMetrics = {
      total: parsedLogs.length,
      verdictDistribution: { rent: 0, cautious: 0, avoid: 0, unknown: 0 },
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      goalDistribution: {} as Record<string, number>,
      feedbackStats: { total: 0, positive: 0, negative: 0 },
      avgScore: 0,
    };
    
    let totalScore = 0;
    let scoreCount = 0;
    
    parsedLogs.forEach((log) => {
      // Verdict 统计
      const verdict = log.result?.verdict;
      if (verdict && metrics.verdictDistribution.hasOwnProperty(verdict)) {
        metrics.verdictDistribution[verdict as keyof typeof metrics.verdictDistribution]++;
      } else {
        metrics.verdictDistribution.unknown++;
      }
      
      // 置信度统计
      const confidence = log.inputQuality?.confidence;
      if (confidence && metrics.confidenceDistribution.hasOwnProperty(confidence)) {
        metrics.confidenceDistribution[confidence as keyof typeof metrics.confidenceDistribution]++;
      }
      
      // 目标场景统计
      const goal = log.input?.primaryGoal;
      if (goal) {
        metrics.goalDistribution[goal] = (metrics.goalDistribution[goal] || 0) + 1;
      }
      
      // 反馈统计
      if (log.feedback !== undefined) {
        metrics.feedbackStats.total++;
        if (log.feedback.isAccurate) {
          metrics.feedbackStats.positive++;
        } else {
          metrics.feedbackStats.negative++;
        }
      }
      
      // 平均分
      if (typeof log.result?.overallScore === 'number') {
        totalScore += log.result.overallScore;
        scoreCount++;
      }
    });
    
    metrics.avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    
    // 核心优化 4：降维渲染 - 只保留展示必需字段，剔除庞大的 rawInput
    const trimmedLogs: TrimmedLog[] = parsedLogs.map((log) => ({
      id: log.id,
      verdict: log.result?.verdict,
      score: log.result?.overallScore,
      goal: log.input?.primaryGoal,
      confidence: log.inputQuality?.confidence,
      hasFeedback: !!log.feedback,
      feedbackAccurate: log.feedback?.isAccurate,
      timestamp: log.serverTime || log.timestamp,
      // 故意不传递: input, result.risks, result.actions 等大对象
    }));
    
    return {
      success: true,
      metrics,
      logs: trimmedLogs,
      sampleSize: SAMPLE_SIZE,
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Redis 连接超时 (5s)，请检查网络或 Upstash 状态',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

export default async function MetricsPage() {
  assertInternalPageAccess();

  // 并行获取：Redis 抽样 + PostgreSQL 统计
  const [shadowData, disputedStats] = await Promise.all([
    getOptimizedShadowMetrics(),
    getDisputedStats().catch(() => ({ total: 0, byStatus: {} })),
  ]);
  
  // 错误兜底：即使 Redis 挂了，页面也能渲染
  if (!shadowData.success) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Rental Tool Metrics</h1>
          <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-lg">
            <h2 className="text-xl text-red-400 font-bold mb-2">⚠️ 数据引擎异常</h2>
            <p className="text-red-300">{shadowData.error}</p>
            <p className="text-slate-500 text-sm mt-4">
              这通常是 Redis 连接问题。请检查环境变量或 Upstash 控制台。
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const { metrics, logs, sampleSize } = shadowData;
  
  // 计算 Rent Rate by Goal
  const rentByGoal = Object.entries(metrics.goalDistribution).map(([goal, total]) => {
    const totalNum = Number(total) || 0;
    const rentCount = logs.filter((log) => log.goal === goal && log.verdict === 'rent').length;
    return { goal, total: totalNum, rentRate: totalNum > 0 ? Math.round((rentCount / totalNum) * 100) : 0 };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rental Tool Metrics</h1>
          <p className="text-slate-400">Beta 内测数据面板 · 抽样模式 (Top {sampleSize})</p>
          <p className="text-xs text-slate-500 mt-1">
            防白屏优化：只读取最新 {sampleSize} 条，服务端聚合后降维传输
          </p>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 mb-1">总样本数</div>
              <div className="text-3xl font-mono font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 mb-1">平均分</div>
              <div className="text-3xl font-mono font-bold">{metrics.avgScore}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 mb-1">争议案例</div>
              <div className="text-3xl font-mono font-bold text-yellow-400">
                {disputedStats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 mb-1">反馈数</div>
              <div className="text-3xl font-mono font-bold">
                {metrics.feedbackStats.total}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verdict 分布 */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400">Verdict</Badge>
                判决分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(metrics.verdictDistribution).map(([key, count]) => (
                  <div key={key} className="text-center p-3 bg-slate-800/50 rounded">
                    <div className={`text-2xl font-bold ${
                      key === 'rent' ? 'text-green-400' :
                      key === 'cautious' ? 'text-yellow-400' :
                      key === 'avoid' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {count as number}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 置信度分布 */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400">Confidence</Badge>
                置信度分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(metrics.confidenceDistribution).map(([key, count]) => (
                  <div key={key} className="text-center p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold">{count as number}</div>
                    <div className="text-xs text-slate-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rent Rate by Goal */}
        {rentByGoal.length > 0 && (
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Rent Rate by Primary Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rentByGoal.map(({ goal, total, rentRate }) => (
                  <div key={goal} className="text-center p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold">{rentRate}%</div>
                    <div className="text-xs text-slate-400 capitalize">{goal.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-slate-600">n={total}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最近日志 - 降维展示 */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recent Logs (Top {logs.length})</CardTitle>
            <p className="text-xs text-slate-500">降维展示：只显示核心字段，隐藏大对象</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex justify-between items-center p-3 bg-slate-800/30 rounded border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Verdict Badge */}
                    <Badge className={
                      log.verdict === 'rent' ? 'bg-green-500/20 text-green-400 shrink-0' :
                      log.verdict === 'cautious' ? 'bg-yellow-500/20 text-yellow-400 shrink-0' :
                      log.verdict === 'avoid' ? 'bg-red-500/20 text-red-400 shrink-0' :
                      'bg-slate-500/20 text-slate-400 shrink-0'
                    }>
                      {log.verdict || '?'}
                    </Badge>
                    
                    {/* 核心信息 */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs text-slate-300 truncate">
                        {log.id.slice(0, 20)}...
                      </span>
                      <span className="text-xs text-slate-500">
                        {log.goal || 'no-goal'} · {log.score ?? 'N/A'}分 · {log.confidence || 'unknown'}
                      </span>
                    </div>
                    
                    {/* 反馈标记 */}
                    {log.hasFeedback && (
                      <Badge className={log.feedbackAccurate ? 
                        'bg-green-500/10 text-green-400 text-[10px]' : 
                        'bg-red-500/10 text-red-400 text-[10px]'
                      }>
                        {log.feedbackAccurate ? '👍' : '👎'}
                      </Badge>
                    )}
                  </div>

                  {/* 干预按钮 */}
                  <EscalateButton 
                    logId={log.id} 
                    currentVerdict={log.verdict}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
