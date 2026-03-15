'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

// Demo portfolio data for MVP
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
  // Calculate a simple health score for demo
  const holdings = DEMO_PORTFOLIO.holdings;
  const total = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const weights = holdings.map(h => (h.quantity * h.currentPrice) / total);
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  const diversScore = 25 * (1 - hhi);
  return Math.round(diversScore + 45); // Add rough estimate for other components
}

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

  // Sector allocation
  const sectorMap = new Map<string, number>();
  holdings.forEach(h => {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.currentValue);
  });
  const sectors = Array.from(sectorMap.entries())
    .map(([name, value]) => ({ name, value, weight: (value / totalValue) * 100 }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-primary-600">Portfolio Intelligence</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{portfolio.name}</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/upload" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100">
              Upload
            </Link>
            <Link href="/chat" className="text-sm bg-primary-500 text-white px-3 py-1.5 rounded hover:bg-primary-600">
              AI Chat
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Summary */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-baseline gap-6 flex-wrap">
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unrealized P&L</p>
              <p className={`text-xl font-semibold ${portfolio.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolio.unrealizedPnL)} ({formatPercent(portfolio.unrealizedPnLPercent)})
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Day Change</p>
              <p className={`text-lg ${portfolio.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolio.dayChange)} ({formatPercent(portfolio.dayChangePercent)})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Health Score</h2>
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                healthScore >= 75 ? 'bg-green-500' : healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {healthScore}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {healthScore >= 75 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Needs Work'}
                </p>
                <p className="text-sm text-gray-500">Out of 100</p>
              </div>
            </div>
            <Link href="/dashboard/health" className="block mt-4 text-sm text-primary-500 hover:text-primary-600">
              View Details →
            </Link>
          </div>

          {/* Sector Allocation */}
          <div className="bg-white rounded-xl border p-6 lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Sector Allocation</h2>
            <div className="space-y-3">
              {sectors.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm w-40 truncate">{s.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div
                      className="bg-primary-500 h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(s.weight, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-14 text-right">{s.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/sectors" className="block mt-4 text-sm text-primary-500 hover:text-primary-600">
              Sector Analysis →
            </Link>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-xl border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Holdings ({holdings.length})</h2>
            <Link href="/upload" className="text-sm text-primary-500 hover:text-primary-600">
              + Add Holdings
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Symbol</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Avg Cost</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Current</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Value</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">P&L</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedHoldings.map(h => (
                  <tr key={h.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">{h.symbol}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{h.name}</td>
                    <td className="px-6 py-3 text-sm text-right">{h.quantity}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(h.avgCost)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(h.currentPrice)}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">{formatCurrency(h.currentValue)}</td>
                    <td className={`px-6 py-3 text-sm text-right ${h.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(h.pnlPercent)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      {((h.currentValue / totalValue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Alerts & Insights</h2>
          <div className="space-y-3">
            {sectors[0] && sectors[0].weight > 30 && (
              <Alert severity="warning" message={`High concentration in ${sectors[0].name} (${sectors[0].weight.toFixed(1)}%)`} />
            )}
            <Alert severity="info" message="No international exposure detected — consider adding global diversification" />
            <Alert severity="info" message="Upload mutual funds to check for overlap analysis" />
          </div>
        </div>
      </main>
    </div>
  );
}

function Alert({ severity, message }: { severity: 'info' | 'warning' | 'critical'; message: string }) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    critical: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${colors[severity]}`}>
      {message}
    </div>
  );
}
