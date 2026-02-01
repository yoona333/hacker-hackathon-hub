/**
 * Performance Metrics Dashboard Component
 * 
 * 性能指标仪表盘组件
 * - 显示 API 性能指标
 * - AI 调用统计
 * - 支付成功率
 * - 风险评估统计
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Metrics {
  api: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  ai: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageLatency: number;
    cacheHitRate: number;
    providerBreakdown: Record<string, {
      calls: number;
      averageLatency: number;
      errors: number;
    }>;
  };
  payments: {
    totalAttempts: number;
    successfulPayments: number;
    rejectedPayments: number;
    averageProcessingTime: number;
    rejectionReasons: Record<string, number>;
  };
  risk: {
    totalAssessments: number;
    averageScore: number;
    scoreDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  policy: {
    totalChecks: number;
    allowed: number;
    rejected: number;
    rejectionReasons: Record<string, number>;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    nodeVersion: string;
  };
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/metrics`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // 每 5 秒更新一次

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-4 text-center text-red-500">
        <XCircle className="w-6 h-6 mx-auto mb-2" />
        <p className="text-sm">{error || 'Failed to load metrics'}</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* API Performance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-primary/30 bg-primary/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">API Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Total Requests</p>
            <p className="text-lg font-mono">{metrics.api.totalRequests}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Success Rate</p>
            <p className="text-lg font-mono text-green-500">
              {metrics.api.totalRequests > 0
                ? ((metrics.api.successfulRequests / metrics.api.totalRequests) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Response</p>
            <p className="text-lg font-mono">{metrics.api.averageResponseTime.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">P95 Response</p>
            <p className="text-lg font-mono">{metrics.api.p95ResponseTime.toFixed(0)}ms</p>
          </div>
        </div>
      </motion.div>

      {/* AI Performance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">AI Performance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Total Calls</p>
            <p className="text-lg font-mono">{metrics.ai.totalCalls}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cache Hit Rate</p>
            <p className="text-lg font-mono text-green-500">
              {(metrics.ai.cacheHitRate * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Latency</p>
            <p className="text-lg font-mono">{metrics.ai.averageLatency.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">Success Rate</p>
            <p className="text-lg font-mono text-green-500">
              {metrics.ai.totalCalls > 0
                ? ((metrics.ai.successfulCalls / metrics.ai.totalCalls) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
        {Object.keys(metrics.ai.providerBreakdown).length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-xs text-muted-foreground mb-2">Provider Breakdown:</p>
            <div className="space-y-1">
              {Object.entries(metrics.ai.providerBreakdown).map(([provider, stats]) => (
                <div key={provider} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{provider}</span>
                  <span className="font-mono">{stats.calls} calls, {stats.averageLatency.toFixed(0)}ms avg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Payment & Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-green-500/30 bg-green-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-foreground">Payments</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Attempts</span>
              <span className="font-mono">{metrics.payments.totalAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-mono text-green-500">
                {metrics.payments.totalAttempts > 0
                  ? ((metrics.payments.successfulPayments / metrics.payments.totalAttempts) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Processing</span>
              <span className="font-mono">{metrics.payments.averageProcessingTime.toFixed(0)}ms</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Risk Assessment</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Assessments</span>
              <span className="font-mono">{metrics.risk.totalAssessments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Score</span>
              <span className="font-mono">{metrics.risk.averageScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Low Risk</span>
              <span className="font-mono text-green-500">{metrics.risk.scoreDistribution.low}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">High Risk</span>
              <span className="font-mono text-red-500">{metrics.risk.scoreDistribution.high}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg border border-muted p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">System Info</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <p className="font-mono">{formatUptime(metrics.system.uptime)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Memory</p>
            <p className="font-mono">{formatMemory(metrics.system.memoryUsage.heapUsed)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Node Version</p>
            <p className="font-mono">{metrics.system.nodeVersion}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Policy Checks</p>
            <p className="font-mono">
              {metrics.policy.totalChecks > 0
                ? ((metrics.policy.allowed / metrics.policy.totalChecks) * 100).toFixed(1)
                : 0}% allowed
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
