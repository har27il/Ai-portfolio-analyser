'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

const HEALTH_SCORE = {
  overall: 68,
  components: [
    { name: 'Diversification', score: 20, max: 25, icon: '🎯', description: '10 holdings, HHI = 12.5%' },
    { name: 'Sector Balance', score: 14, max: 20, icon: '⚖️', description: 'Slight overweight in IT sector' },
    { name: 'Geographic Spread', score: 0, max: 15, icon: '🌍', description: 'No international exposure' },
    { name: 'Correlation Risk', score: 10, max: 15, icon: '🔗', description: 'Estimated correlation: 52%' },
    { name: 'Cost Efficiency', score: 15, max: 15, icon: '💰', description: 'No high-cost mutual funds' },
    { name: 'Volatility', score: 9, max: 10, icon: '📉', description: 'Portfolio beta: 1.08' },
  ],
  alerts: [
    { severity: 'critical' as const, message: 'No international diversification — 100% India exposure', action: 'Add global ETFs' },
    { severity: 'warning' as const, message: 'IT sector overweight at 22.8% vs 14% benchmark', action: 'Rebalance sectors' },
    { severity: 'info' as const, message: 'Cost efficiency is excellent — no high expense ratio funds', action: '' },
  ],
};

export default function HealthScorePage() {
  const { overall, components, alerts } = HEALTH_SCORE;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overall / 100) * circumference;
  const scoreColor = overall >= 75 ? '#10B981' : overall >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-white">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Health Score</h1>
      </header>

      <main className="px-5 space-y-4">
        {/* Score Ring */}
        <div className="card-dark shadow-card-lg flex flex-col items-center py-8">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#2D2D44" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{overall}</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">
            {overall >= 75 ? 'Good' : overall >= 50 ? 'Fair' : 'Needs Improvement'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Portfolio Health Score</p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2">
          <p className="section-title px-1">Breakdown</p>
          {components.map(c => {
            const pct = (c.score / c.max) * 100;
            const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={c.name} className="card !p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.icon}</span>
                    <span className="text-sm font-semibold">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{c.score}/{c.max}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-sm h-2 mb-1.5">
                  <div className={`h-2 rounded-sm ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-400">{c.description}</p>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <p className="section-title px-1">Recommendations</p>
          {alerts.map((alert, i) => {
            const styles = {
              critical: 'border-l-red-500 bg-red-50',
              warning: 'border-l-amber-400 bg-amber-50',
              info: 'border-l-blue-400 bg-blue-50',
            };
            const icons = { critical: '🔴', warning: '🟡', info: '🟢' };
            return (
              <div key={i} className={`rounded-lg p-4 border-l-4 border-2 border-black/10 ${styles[alert.severity]}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs">{icons[alert.severity]}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{alert.message}</p>
                    {alert.action && (
                      <p className="text-[10px] text-accent font-semibold mt-1">{alert.action} →</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav active="more" />
    </div>
  );
}
