'use client';

import Link from 'next/link';

const SECTOR_DATA = [
  { name: 'Financial Services', weight: 35.2, benchmark: 37.0, holdings: ['HDFCBANK', 'ICICIBANK', 'SBIN'] },
  { name: 'Information Technology', weight: 22.8, benchmark: 14.0, holdings: ['TCS', 'INFY'] },
  { name: 'Oil & Gas', weight: 12.5, benchmark: 12.0, holdings: ['RELIANCE'] },
  { name: 'Consumer Goods', weight: 8.3, benchmark: 10.0, holdings: ['HINDUNILVR'] },
  { name: 'Automobile', weight: 7.8, benchmark: 5.0, holdings: ['TATAMOTORS'] },
  { name: 'Pharma', weight: 6.9, benchmark: 4.0, holdings: ['SUNPHARMA'] },
  { name: 'Telecom', weight: 6.5, benchmark: 3.0, holdings: ['BHARTIARTL'] },
];

export default function SectorAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-lg font-bold">Sector Analysis</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sector Comparison */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Portfolio vs Nifty 50 Benchmark</h2>
          <div className="space-y-4">
            {SECTOR_DATA.map(s => {
              const deviation = s.weight - s.benchmark;
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      Math.abs(deviation) > 5 ? (deviation > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700') : 'bg-green-100 text-green-700'
                    }`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <div className="bg-primary-500 h-4 rounded" style={{ width: `${s.weight}%` }} title={`Portfolio: ${s.weight}%`} />
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div className="bg-gray-300 h-4 rounded" style={{ width: `${s.benchmark}%` }} title={`Benchmark: ${s.benchmark}%`} />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-xs text-primary-600">{s.weight}%</p>
                      <p className="text-xs text-gray-400">{s.benchmark}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Holdings: {s.holdings.join(', ')}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-2">Key Observations</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">●</span>
              IT sector is significantly overweight (+8.8%) compared to Nifty 50
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">●</span>
              Financial Services allocation is close to benchmark
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">●</span>
              Missing exposure to Metals, Construction, Power sectors
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
