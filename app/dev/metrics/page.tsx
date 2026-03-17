// Server Component - 服务端直接读取 Redis
import { Redis } from '@upstash/redis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EscalateButton } from './escalate-button';
import { getDisputedStats } from './actions';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REDIS_KEY = 'shadow:logs:beta';
const MAX_LOGS = 1000;

/**
 * 健壮的数据解析 - 防御性装甲
 * 遇到脏数据不崩溃，而是降级展示
 */
function safeParseLog(logStr: string): any {
  try {
    const data = typeof logStr === 'string' ? JSON.parse(logStr) : logStr;
    
    // 深度校验：确保至少存在核心锚点
    if (!data || typeof data !== 'object') {
      throw new Error('Not an object');
    }
    
    // 检查必要字段
    if (!data.id) {
      throw new Error('Missing id');
    }
    
    return {
      ...data,
      _isValid: true,
      _parseError: null,
    };
  } catch (e) {
    // 降级展示：让你能在面板上揪出 Bug
    return {
      id: `corrupted-${Date.now()}`,
      _isValid: false,
      _parseError: e instanceof Error ? e.message : 'Unknown parse error',
      _raw: logStr,
      result: { verdict: 'unknown' },
      input: {},
      meta: {},
    };
  }
}

/**
 * 从 Redis 获取 Shadow Logs
 */
async function getShadowLogs(limit = MAX_LOGS) {
  try {
    const redis = Redis.fromEnv();
    const rawLogs = await redis.lrange(REDIS_KEY, 0, limit - 1);
    
    // 健壮解析：每个日志独立处理，脏数据不传染
    const parsedLogs = rawLogs.map(safeParseLog);
    
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
      valid: 0,
      corrupted: 0,
      verdictDistribution: { rent: 0, cautious: 0, avoid: 0, unknown: 0 },
      confidenceDistribution: { high: 0, medium: 0, low: 0, unknown: 0 },
      avgWarnings: 0,
      feedbackCount: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
    };
  }

  const validLogs = logs.filter(l => l._isValid);
  const corruptedCount = logs.filter(l => !l._isValid).length;

  // Verdict 分布（包含 unknown）
  const verdictDist = { rent: 0, cautious: 0, avoid: 0, unknown: 0 };
  validLogs.forEach((log) => {
    const v = log.result?.verdict;
    if (v && verdictDist.hasOwnProperty(v)) {
      verdictDist[v as keyof typeof verdictDist]++;
    } else {
      verdictDist.unknown++;
    }
  });

  // 置信度分布
  const confidenceDist = { high: 0, medium: 0, low: 0, unknown: 0 };
  validLogs.forEach((log) => {
    const c = log.inputQuality?.confidence;
    if (c && confidenceDist.hasOwnProperty(c)) {
      confidenceDist[c as keyof typeof confidenceDist]++;
    } else {
      confidenceDist.unknown++;
    }
  });

  // 平均警告数
  const logsWithWarnings = validLogs.filter((l) => l.inputQuality?.warningCount !== undefined);
  const avgWarnings = logsWithWarnings.length > 0
    ? logsWithWarnings.reduce((sum, l) => sum + (l.inputQuality.warningCount || 0), 0) / logsWithWarnings.length
    : 0;

  // 反馈统计
  const feedbackLogs = validLogs.filter((l) => l.feedback !== undefined);
  const positiveCount = feedbackLogs.filter((l) => l.feedback?.isAccurate).length;
  const negativeCount = feedbackLogs.filter((l) => !l.feedback?.isAccurate).length;

  return {
    total: logs.length,
    valid: validLogs.length,
    corrupted: corruptedCount,
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
  const validLogs = logs.filter(l => l._isValid);
  const byGoal: Record<string, { total: number; rent: number }> = {};
  
  validLogs.forEach((log) => {
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
  const disputedStats = await getDisputedStats();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'insufficient': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
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
              {metrics.corrupted > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-red-400">Corrupted Logs</span>
                  <Badge className={getStatusColor('error')}>
                    {metrics.corrupted}
                  </Badge>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Valid Logs</span>
                <span className="font-mono text-green-400">{metrics.valid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">High Confidence</span>
                <span className="font-mono">
                  {metrics.confidenceDistribution.high}
                  <span className="text-slate-500 ml-1">
                    ({metrics.valid > 0 ? Math.round((metrics.confidenceDistribution.high / metrics.valid) * 100) : 0}%)
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
                  {metrics.valid > 0 ? Math.round((metrics.verdictDistribution.rent / metrics.valid) * 100) : 0}%
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
                  {metrics.verdictDistribution.unknown > 0 && (
                    <Badge className="bg-slate-500/20 text-slate-400">
                      unknown: {metrics.verdictDistribution.unknown}
                    </Badge>
                  )}
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

          {/* Disputed Cases */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400">Amber</Badge>
                Disputed Cases
              </CardTitle>
              <p className="text-xs text-slate-500">PostgreSQL 琥珀封存</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Disputed</span>
                <Badge className={getStatusColor(disputedStats.total > 0 ? 'warning' : 'good')}>
                  {disputedStats.total}
                </Badge>
              </div>
              {Object.entries(disputedStats.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm capitalize">{status.toLowerCase()}</span>
                  <span className="font-mono text-sm">{count}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                争议案例自动从 Redis 转移至 PostgreSQL 永久保存
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

        {/* 最近日志预览 - 带干预按钮 */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recent Logs (Latest 10)</CardTitle>
            <p className="text-xs text-slate-500">Raw data from Redis · 可标记误判</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div 
                  key={log.id} 
                  className={`flex justify-between items-center p-3 rounded border ${
                    log._isValid 
                      ? 'bg-slate-800/50 border-slate-700' 
                      : 'bg-red-900/20 border-red-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Verdict Badge */}
                    <Badge className={
                      log.result?.verdict === 'rent' ? 'bg-green-500/20 text-green-400' :
                      log.result?.verdict === 'cautious' ? 'bg-yellow-500/20 text-yellow-400' :
                      log.result?.verdict === 'avoid' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {log.result?.verdict || 'unknown'}
                    </Badge>
                    
                    {/* ID & Info */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs truncate">
                        {log.id}
                      </span>
                      {log._isValid ? (
                        <span className="text-xs text-slate-500">
                          {log.input?.primaryGoal || 'no-goal'} · {log.result?.overallScore || 'N/A'}分
                        </span>
                      ) : (
                        <span className="text-xs text-red-400">
                          Parse Error: {log._parseError}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 干预按钮 - 仅对有效日志显示 */}
                  {log._isValid && (
                    <EscalateButton 
                      logId={log.id} 
                      currentVerdict={log.result?.verdict}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
