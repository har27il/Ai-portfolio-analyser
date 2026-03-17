'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

const SECTOR_DATA = [
  { name: 'Financial Services', weight: 35.2, benchmark: 37.0, holdings: ['HDFCBANK', 'ICICIBANK', 'SBIN'] },
  { name: 'Information Technology', weight: 22.8, benchmark: 14.0, holdings: ['TCS', 'INFY'] },
  { name: 'Oil & Gas', weight: 12.5, benchmark: 12.0, holdings: ['RELIANCE'] },
  { name: 'Consumer Goods', weight: 8.3, benchmark: 10.0, holdings: ['HINDUNILVR'] },
  { name: 'Automobile', weight: 7.8, benchmark: 5.0, holdings: ['TATAMOTORS'] },
  { name: 'Pharma', weight: 6.9, benchmark: 4.0, holdings: ['SUNPHARMA'] },
  { name: 'Telecom', weight: 6.5, benchmark: 3.0, holdings: ['BHARTIARTL'] },
];

const SECTOR_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function SectorAnalysisPage() {
  const maxWeight = Math.max(...SECTOR_DATA.map(s => Math.max(s.weight, s.benchmark)));

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 border-b-[3px] border-black/20">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white border-2 border-transparent hover:border-black/20 transition-all">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wider">Sector Analysis</h1>
      </header>

      <main className="px-5 space-y-4">
        {/* Donut Chart Card */}
        <div className="card-dark shadow-card-lg flex items-center gap-5 py-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
              {(() => {
                let offset = 0;
                return SECTOR_DATA.map((s, i) => {
                  const pct = (s.weight / 100) * (2 * Math.PI * 40);
                  const total = 2 * Math.PI * 40;
                  const el = (
                    <circle
                      key={s.name}
                      cx="50" cy="50" r="40" fill="none"
                      stroke={SECTOR_COLORS[i % SECTOR_COLORS.length]}
                      strokeWidth="12"
                      strokeDasharray={`${pct} ${total - pct}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += pct;
                  return el;
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-white">7</span>
              <span className="text-[8px] text-gray-400">sectors</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {SECTOR_DATA.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                <span className="text-[10px] text-gray-400 flex-1 truncate">{s.name}</span>
                <span className="text-[10px] font-semibold text-white">{s.weight}%</span>
              </div>
            ))}
            {SECTOR_DATA.length > 5 && (
              <p className="text-[10px] text-gray-500 pl-4">+{SECTOR_DATA.length - 5} more</p>
            )}
          </div>
        </div>

        {/* Bar Chart Comparison */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Portfolio vs Nifty 50</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-gray-400">Portfolio</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-[10px] text-gray-400">Benchmark</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SECTOR_DATA.map((s, i) => {
              const deviation = s.weight - s.benchmark;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700">{s.name}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 border-2 border-black/20 ${
                      Math.abs(deviation) > 5
                        ? deviation > 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 h-3 border-2 border-black/30">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${(s.weight / maxWeight) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold w-10 text-right">{s.weight}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 h-3 border-2 border-black/30">
                        <div
                          className="h-full bg-gray-300 transition-all"
                          style={{ width: `${(s.benchmark / maxWeight) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-10 text-right">{s.benchmark}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Observations */}
        <div className="card">
          <p className="text-sm font-semibold mb-3">Key Observations</p>
          <div className="space-y-2.5">
            <Observation color="#F59E0B" text="IT sector significantly overweight (+8.8%) vs Nifty 50" />
            <Observation color="#10B981" text="Financial Services close to benchmark allocation" />
            <Observation color="#4F46E5" text="Missing exposure to Metals, Construction, Power sectors" />
          </div>
        </div>
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}

function Observation({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: color }} />
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
