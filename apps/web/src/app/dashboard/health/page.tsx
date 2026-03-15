'use client';

import Link from 'next/link';

const HEALTH_SCORE = {
  overall: 68,
  components: [
    { name: 'Diversification', score: 20, max: 25, description: '10 holdings, HHI = 12.5%' },
    { name: 'Sector Balance', score: 14, max: 20, description: 'Slight overweight in Financial Services' },
    { name: 'Geographic Spread', score: 0, max: 15, description: 'No international exposure' },
    { name: 'Correlation Risk', score: 10, max: 15, description: 'Estimated correlation: 52%' },
    { name: 'Cost Efficiency', score: 15, max: 15, description: 'No high-cost mutual funds' },
    { name: 'Volatility', score: 9, max: 10, description: 'Portfolio beta: 1.08' },
  ],
  alerts: [
    { severity: 'warning', message: 'Financial Services sector at 35.2% (benchmark: 37%) — close to benchmark but concentrated' },
    { severity: 'critical', message: 'No international diversification — 100% India exposure' },
    { severity: 'info', message: 'Cost efficiency is excellent — no high expense ratio funds' },
  ],
};

export default function HealthScorePage() {
  const { overall, components, alerts } = HEALTH_SCORE;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-lg font-bold">Health Score</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overall Score */}
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto ${
            overall >= 75 ? 'bg-green-500' : overall >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {overall}
          </div>
          <p className="mt-3 text-xl font-semibold">
            {overall >= 75 ? 'Good' : overall >= 50 ? 'Fair' : 'Needs Improvement'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Portfolio Health Score out of 100</p>
        </div>

        {/* Component Breakdown */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {components.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-sm text-gray-600">{c.score}/{c.max}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      c.score / c.max >= 0.75 ? 'bg-green-500' :
                      c.score / c.max >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(c.score / c.max) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Alerts & Recommendations</h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`px-4 py-3 rounded-lg border text-sm ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
