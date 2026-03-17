'use server';

import { Redis } from '@upstash/redis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 强制动态渲染，确保每次刷新都能拿到最新日志
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Redis 配置
const REDIS_KEY = 'shadow:logs:beta';
const MAX_LOGS = 1000; // 最多读取 1000 条用于统计

/**
 * 从 Redis 获取 Shadow Logs
 */
async function getShadowLogs(limit = MAX_LOGS) {
  try {
    const redis = Redis.fromEnv();
    const rawLogs = await redis.lrange(REDIS_KEY, 0, limit - 1);
    
    // 解析并清洗数据
    const parsedLogs = rawLogs.map((logStr: string) => {
      try {
        return typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return parsedLogs;
  } catch (e) {
    console.error('[Metrics] Failed to fetch logs:', e);
    return [];
  }
}

/**
 * 计算实时指标
 */
function calculateMetrics(logs: any[]) {
  if (logs.length === 0) {
    return {
      total: 0,
      verdictDistribution: { rent: 0, cautious: 0, avoid: 0 },
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      avgWarnings: 0,
      feedbackCount: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
    };
  }

  // Verdict 分布
  const verdictDist = { rent: 0, cautious: 0, avoid: 0 };
  logs.forEach((log) => {
    const v = log.result?.verdict;
    if (v && verdictDist.hasOwnProperty(v)) {
      verdictDist[v as keyof typeof verdictDist]++;
    }
  });

  // 置信度分布
  const confidenceDist = { high: 0, medium: 0, low: 0 };
  logs.forEach((log) => {
    const c = log.inputQuality?.confidence;
    if (c && confidenceDist.hasOwnProperty(c)) {
      confidenceDist[c as keyof typeof confidenceDist]++;
    }
  });

  // 平均警告数
  const logsWithWarnings = logs.filter((l) => l.inputQuality?.warningCount !== undefined);
  const avgWarnings = logsWithWarnings.length > 0
    ? logsWithWarnings.reduce((sum, l) => sum + (l.inputQuality.warningCount || 0), 0) / logsWithWarnings.length
    : 0;

  // 反馈统计
  const feedbackLogs = logs.filter((l) => l.feedback !== undefined);
  const positiveCount = feedbackLogs.filter((l) => l.feedback?.isAccurate).length;
  const negativeCount = feedbackLogs.filter((l) => !l.feedback?.isAccurate).length;

  return {
    total: logs.length,
    verdictDistribution: verdictDist,
    confidenceDistribution: confidenceDist,
    avgWarnings: Math.round(avgWarnings * 10) / 10,
    feedbackCount: feedbackLogs.length,
    positiveFeedback: positiveCount,
    negativeFeedback: negativeCount,
  };
}

/**
 * 按主目标统计 Rent Rate
 */
function calculateRentByGoal(logs: any[]) {
  const byGoal: Record<string, { total: number; rent: number }> = {};
  
  logs.forEach((log) => {
    const goal = log.input?.primaryGoal;
    if (!goal) return;
    
    if (!byGoal[goal]) {
      byGoal[goal] = { total: 0, rent: 0 };
    }
    byGoal[goal].total++;
    if (log.result?.verdict === 'rent') {
      byGoal[goal].rent++;
    }
  });

  const result: Record<string, number> = {};
  Object.entries(byGoal).forEach(([goal, stats]) => {
    result[goal] = stats.total > 0 ? Math.round((stats.rent / stats.total) * 100) : 0;
  });
  
  return result;
}

export default async function MetricsPage() {
  const logs = await getShadowLogs();
  const metrics = calculateMetrics(logs);
  const rentByGoal = calculateRentByGoal(logs);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'insufficient': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SpaceRisk Metrics</h1>
          <p className="text-slate-400">Beta 内测数据面板 · 实时 Redis 流</p>
          <p className="text-xs text-slate-500 mt-1">
            统一枚举: rent / cautious / avoid | 存储: Upstash Redis (7d TTL)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Quality */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">Input</Badge>
                Input Quality
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time from Redis Stream</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Evaluations</span>
                <Badge className={getStatusColor(metrics.total > 10 ? 'good' : 'neutral')}>
                  {metrics.total}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">High Confidence</span>
                <span className="font-mono">
                  {metrics.confidenceDistribution.high}
                  <span className="text-slate-500 ml-1">
                    ({metrics.total > 0 ? Math.round((metrics.confidenceDistribution.high / metrics.total) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Warnings/Input</span>
                <Badge className={getStatusColor(
                  metrics.avgWarnings < 1 ? 'good' : metrics.avgWarnings < 3 ? 'warning' : 'neutral'
                )}>
                  {metrics.avgWarnings}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Engine Output */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">Engine</Badge>
                Engine Output
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time from Redis Stream</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rent Rate</span>
                <span className="font-mono">
                  {metrics.total > 0 ? Math.round((metrics.verdictDistribution.rent / metrics.total) * 100) : 0}%
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-500">Verdict Distribution</span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge className="bg-green-500/20 text-green-400">
                    rent: {metrics.verdictDistribution.rent}
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    cautious: {metrics.verdictDistribution.cautious}
                  </Badge>
                  <Badge className="bg-red-500/20 text-red-400">
                    avoid: {metrics.verdictDistribution.avoid}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Feedback */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">Feedback</Badge>
                User Feedback
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time from Redis Stream</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.feedbackCount === 0 ? (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sample Size</span>
                  <Badge className={getStatusColor('insufficient')}>
                    n=0 (need ≥5)
                  </Badge>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Positive Rate</span>
                    <Badge className={getStatusColor(
                      (metrics.positiveFeedback / metrics.feedbackCount) > 0.7 ? 'good' : 'warning'
                    )}>
                      {Math.round((metrics.positiveFeedback / metrics.feedbackCount) * 100)}%
                      <span className="text-xs opacity-70 ml-1">(n={metrics.feedbackCount})</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Negative Rate</span>
                    <span className="font-mono">
                      {Math.round((metrics.negativeFeedback / metrics.feedbackCount) * 100)}%
                      <span className="text-xs text-slate-500 ml-1">(n={metrics.negativeFeedback})</span>
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400">Storage</Badge>
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Backend</span>
                <Badge className="bg-purple-500/20 text-purple-400">Upstash Redis</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Retention</span>
                <span className="font-mono text-slate-300">7 days (TTL)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Logs</span>
                <span className="font-mono text-slate-300">5,000</span>
              </div>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                Disputed cases auto-persist to PostgreSQL
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rent Rate by Primary Goal */}
        {Object.keys(rentByGoal).length > 0 && (
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Rent Rate by Primary Goal</CardTitle>
              <p className="text-xs text-slate-500">Real-time from Redis Stream</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(rentByGoal).map(([goal, rate]) => (
                  <div key={goal} className="text-center p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold">{rate}%</div>
                    <div className="text-xs text-slate-400 capitalize">{goal.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最近日志预览 */}
        {logs.length > 0 && (
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Logs (Latest 5)</CardTitle>
              <p className="text-xs text-slate-500">Raw data from Redis</p>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-950 text-green-400 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(logs.slice(0, 5).map((log) => ({
                  id: log.id,
                  verdict: log.result?.verdict,
                  score: log.result?.overallScore,
                  goal: log.input?.primaryGoal,
                  confidence: log.inputQuality?.confidence,
                })), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
