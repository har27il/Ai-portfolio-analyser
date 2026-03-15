'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';
import { formatCurrency, formatPercent } from '@/lib/utils';

const DEMO_PORTFOLIO = {
  name: 'My Portfolio',
  currency: 'INR',
  totalInvested: 2545000,
  currentValue: 2668000,
  unrealizedPnL: 123000,
  unrealizedPnLPercent: 4.83,
  dayChange: 12500,
  dayChangePercent: 0.47,
  holdings: [
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', quantity: 50, avgCost: 1450, currentPrice: 1680, sector: 'Financial Services' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 15, avgCost: 3200, currentPrice: 3450, sector: 'Information Technology' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 20, avgCost: 2350, currentPrice: 2480, sector: 'Oil & Gas' },
    { symbol: 'INFY', name: 'Infosys Ltd', quantity: 40, avgCost: 1380, currentPrice: 1520, sector: 'Information Technology' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', quantity: 60, avgCost: 920, currentPrice: 1050, sector: 'Financial Services' },
    { symbol: 'SBIN', name: 'State Bank of India', quantity: 100, avgCost: 580, currentPrice: 620, sector: 'Financial Services' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', quantity: 20, avgCost: 2450, currentPrice: 2380, sector: 'Consumer Goods' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', quantity: 30, avgCost: 1100, currentPrice: 1250, sector: 'Pharma' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', quantity: 50, avgCost: 620, currentPrice: 710, sector: 'Automobile' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', quantity: 25, avgCost: 850, currentPrice: 920, sector: 'Telecom' },
  ],
};

function getHealthScore() {
  const holdings = DEMO_PORTFOLIO.holdings;
  const total = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const weights = holdings.map(h => (h.quantity * h.currentPrice) / total);
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  const diversScore = 25 * (1 - hhi);
  return Math.round(diversScore + 45);
}

const TABS = ['Summary', 'Individual', 'Sectors', 'Health'];

export default function DashboardPage() {
  const healthScore = getHealthScore();
  const portfolio = DEMO_PORTFOLIO;

  const holdings = portfolio.holdings.map(h => ({
    ...h,
    currentValue: h.quantity * h.currentPrice,
    pnl: (h.currentPrice - h.avgCost) * h.quantity,
    pnlPercent: ((h.currentPrice - h.avgCost) / h.avgCost) * 100,
  }));

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const sortedHoldings = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  const sectorMap = new Map<string, number>();
  holdings.forEach(h => {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.currentValue);
  });
  const sectors = Array.from(sectorMap.entries())
    .map(([name, value]) => ({ name, value, weight: (value / totalValue) * 100 }))
    .sort((a, b) => b.weight - a.weight);

  const sectorColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/upload" className="p-2 rounded-xl bg-white shadow-card">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                i === 0
                  ? 'bg-card-dark text-white'
                  : 'bg-white text-gray-500 shadow-card'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </header>

      <main className="px-5 space-y-4">
        {/* Portfolio Value — Dark Card */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 font-medium">Portfolio Value</p>
            <span className="pill-green">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l4-4m0 0l4 4m-4-4V3" transform="rotate(180 12 12)" />
              </svg>
              {formatPercent(portfolio.unrealizedPnLPercent)}
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="text-[10px] text-gray-500">Invested</p>
              <p className="text-sm font-semibold text-gray-300">{formatCurrency(portfolio.totalInvested)}</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div>
              <p className="text-[10px] text-gray-500">Day Change</p>
              <p className="text-sm font-semibold text-emerald-400">
                {formatCurrency(portfolio.dayChange)} ({formatPercent(portfolio.dayChangePercent)})
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/health" className="card hover:shadow-card-lg transition">
            <p className="stat-label">Health Score</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {healthScore}
              </div>
              <div>
                <p className="text-sm font-bold">{healthScore >= 75 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Poor'}</p>
                <p className="text-[10px] text-gray-400">out of 100</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <p className="stat-label">Unrealized P&L</p>
            <p className={`text-lg font-bold mt-2 ${portfolio.unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(portfolio.unrealizedPnL)}
            </p>
            <p className={`text-xs font-medium ${portfolio.unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatPercent(portfolio.unrealizedPnLPercent)}
            </p>
          </div>
        </div>

        {/* Sector Allocation — Mini */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Sector Allocation</p>
            <Link href="/dashboard/sectors" className="text-xs text-accent font-medium">View All</Link>
          </div>
          {/* Stacked bar */}
          <div className="flex rounded-full h-3 overflow-hidden mb-3">
            {sectors.map((s, i) => (
              <div
                key={s.name}
                className="h-full"
                style={{ width: `${s.weight}%`, backgroundColor: sectorColors[i % sectorColors.length] }}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {sectors.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sectorColors[i % sectorColors.length] }} />
                <span className="text-[10px] text-gray-500">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings List */}
        <div className="card !p-0">
          <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
            <p className="text-sm font-semibold">Holdings ({holdings.length})</p>
            <Link href="/upload" className="text-xs text-accent font-medium">+ Add</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {sortedHoldings.map(h => (
              <div key={h.symbol} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.symbol}</p>
                  <p className="text-[10px] text-gray-400 truncate">{h.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(h.currentValue)}</p>
                  <p className={`text-[10px] font-medium ${h.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatPercent(h.pnlPercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <p className="section-title px-1">Insights</p>
          {sectors[0] && sectors[0].weight > 30 && (
            <div className="card !p-3 flex items-start gap-3 border-l-4 border-amber-400">
              <span className="text-amber-500 text-sm">⚠</span>
              <p className="text-xs text-gray-600">High concentration in {sectors[0].name} ({sectors[0].weight.toFixed(1)}%)</p>
            </div>
          )}
          <div className="card !p-3 flex items-start gap-3 border-l-4 border-blue-400">
            <span className="text-blue-500 text-sm">ℹ</span>
            <p className="text-xs text-gray-600">No international exposure — consider global diversification</p>
          </div>
        </div>
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}
