'use client';

import { useEffect, useState } from 'react';
import { getMetricsSummary, formatMetricsForDisplay, type MetricsSummary, type MetricsDisplay } from '@/lib/metrics/aggregate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MetricsPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [display, setDisplay] = useState<MetricsDisplay | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getMetricsSummary();
    setSummary(s);
    setDisplay(formatMetricsForDisplay(s));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">SpaceRisk Metrics</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!summary || !display) return null;

  const { inputQuality, engineOutput, userFeedback, calibration } = summary;
  const total = inputQuality.totalEvaluations || 1;

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
          <p className="text-slate-400">Beta 内测数据面板 · 12 核心指标</p>
          <p className="text-xs text-slate-500 mt-1">
            统一枚举: rent / cautious / avoid | 样本阈值: n≥5
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Quality */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">1-3</Badge>
                Input Quality
              </CardTitle>
              <p className="text-xs text-slate-500">{display.sections[0]?.dataSource}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Evaluations</span>
                <Badge className={getStatusColor(inputQuality.totalEvaluations > 10 ? 'good' : 'neutral')}>
                  {inputQuality.totalEvaluations}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">High Confidence</span>
                <span className="font-mono">
                  {inputQuality.confidenceDistribution.high} 
                  <span className="text-slate-500 ml-1">
                    ({Math.round(inputQuality.confidenceDistribution.high / total * 100)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Warnings/Input</span>
                <Badge className={getStatusColor(
                  inputQuality.avgWarningsPerInput < 1 ? 'good' : 
                  inputQuality.avgWarningsPerInput < 3 ? 'warning' : 'neutral'
                )}>
                  {inputQuality.avgWarningsPerInput}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Engine Output */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">4-7</Badge>
                Engine Output
              </CardTitle>
              <p className="text-xs text-slate-500">{display.sections[1]?.dataSource}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rent Rate</span>
                <span className="font-mono">
                  {Math.round(engineOutput.verdictDistribution.rent / total * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Override Trigger Rate</span>
                <span className="font-mono text-slate-500">
                  {engineOutput.overrideTriggerRate}%
                  <span className="text-xs ml-1">(validation)</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Decision Note Rate</span>
                <span className="font-mono">{engineOutput.decisionNoteRate}%</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-500">Verdict Distribution</span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge className="bg-green-500/20 text-green-400">
                    rent: {engineOutput.verdictDistribution.rent}
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    cautious: {engineOutput.verdictDistribution.cautious}
                  </Badge>
                  <Badge className="bg-red-500/20 text-red-400">
                    avoid: {engineOutput.verdictDistribution.avoid}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Feedback */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">8-10</Badge>
                User Feedback
              </CardTitle>
              <p className="text-xs text-slate-500">{display.sections[2]?.dataSource}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {userFeedback.positiveRate.status === 'insufficient' ? (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sample Size</span>
                  <Badge className={getStatusColor('insufficient')}>
                    n={userFeedback.positiveRate.sampleSize} (need ≥5)
                  </Badge>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Positive Rate</span>
                    <Badge className={getStatusColor(
                      (userFeedback.positiveRate as any).value > 70 ? 'good' : 'warning'
                    )}>
                      {(userFeedback.positiveRate as any).value}% 
                      <span className="text-xs opacity-70 ml-1">
                        (n={(userFeedback.positiveRate as any).sampleSize})
                      </span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Negative Rate</span>
                    <span className="font-mono">
                      {(userFeedback.negativeRate as any).value}%
                      <span className="text-xs text-slate-500 ml-1">
                        (n={(userFeedback.negativeRate as any).sampleSize})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cautious Negative Rate</span>
                    <span className="font-mono">
                      {(userFeedback.cautiousNegativeRate as any).value}%
                      <span className="text-xs text-slate-500 ml-1">
                        (n={(userFeedback.cautiousNegativeRate as any).sampleSize})
                      </span>
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Calibration */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">11-12</Badge>
                Calibration
              </CardTitle>
              <p className="text-xs text-slate-500">{display.sections[3]?.dataSource}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Top Risk Hit Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{calibration.topRiskHitRate}%</span>
                  <Badge className={getStatusColor(
                    calibration.topRiskHitRate > 60 ? 'good' : 'warning'
                  )}>
                    {calibration.topRiskHitRate > 60 ? '✓' : '⚠'}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">First Action Acceptable</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{calibration.firstActionAcceptableRate}%</span>
                  <Badge className={getStatusColor(
                    calibration.firstActionAcceptableRate > 70 ? 'good' : 'warning'
                  )}>
                    {calibration.firstActionAcceptableRate > 70 ? '✓' : '⚠'}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                Based on 15 static validation cases
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rent Rate by Primary Goal */}
        {Object.keys(engineOutput.rentByPrimaryGoal).length > 0 && (
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Rent Rate by Primary Goal</CardTitle>
              <p className="text-xs text-slate-500">Real-time shadow logs</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(engineOutput.rentByPrimaryGoal).map(([goal, rate]) => (
                  <div key={goal} className="text-center p-3 bg-slate-800/50 rounded">
                    <div className="text-2xl font-bold">{rate}%</div>
                    <div className="text-xs text-slate-400 capitalize">{goal.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 说明卡片 */}
        <Card className="bg-slate-900/50 border-slate-800 mt-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">指标说明</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• <strong>Verdict 统一枚举</strong>: rent (值得租) / cautious (谨慎) / avoid (避免)</li>
              <li>• <strong>实时指标</strong>: 来自 shadow logs，显示 n= 样本数</li>
              <li>• <strong>校准指标</strong>: 来自 15 套静态验证案例</li>
              <li>• <strong>样本不足</strong>: n&lt;5 时显示 N/A，避免误导</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
