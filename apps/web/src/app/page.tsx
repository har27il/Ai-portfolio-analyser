'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { DesktopSidebar } from '@/components/desktop-sidebar';

/* ── Demo data (preserves existing data flow) ── */
const PORTFOLIO_ID = 'I0ITPdoHtm';
const TOTAL_VALUE = 145678;
const DAY_CHANGE_PERCENT = 2.4;
const TOP_PERFORMER = { symbol: 'AAPL', percent: 15.3 };

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'grid' | 'chart' | 'profile'>('grid');
  const [showSelector, setShowSelector] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar active="home" />

      {/* Main content area */}
      <div className="flex-1 min-h-screen flex flex-col lg:ml-[280px]">
        {/* ── BLUE HEADER BANNER ── */}
        <header className="bg-header-blue px-5 pt-5 pb-4 lg:px-8 lg:pt-6 lg:pb-5">
          <div className="flex items-center gap-3 mb-4 lg:mb-5">
            {/* Logo icon — black rounded square with white line-chart */}
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 4 4 6-8 4 4" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight lg:text-2xl">
              PORTFOLIO ANALYSER
            </h1>

            {/* Desktop: Edit with Grok button */}
            <div className="hidden lg:flex ml-auto">
              <button className="flex items-center gap-2 bg-content-green/90 hover:bg-content-green text-white text-xs font-semibold px-4 py-2 rounded-full transition">
                <span className="w-5 h-5 bg-content-green rounded-full flex items-center justify-center text-[10px] font-bold border border-white/30">G</span>
                Edit with Grok
              </button>
            </div>
          </div>

          {/* Navigation tabs — 3 icons matching screenshot */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('grid')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                activeTab === 'grid' ? 'bg-card-blue' : 'bg-white/10'
              }`}
            >
              {/* Grid/dashboard icon */}
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                activeTab === 'chart' ? 'bg-content-green' : 'bg-white/10'
              }`}
            >
              {/* Bar chart icon */}
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                activeTab === 'profile' ? 'bg-amber-800' : 'bg-white/10'
              }`}
            >
              {/* User/profile icon */}
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── GREEN CONTENT SECTION ── */}
        <main className="bg-green-grain flex-1 px-5 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-8 relative">
          {/* Title block */}
          <div className="mb-5 lg:mb-6">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-text-dark tracking-tight leading-tight mb-2">
              YOUR PORTFOLIOS
            </h2>
            <p className="text-xs lg:text-sm font-semibold text-text-dark/70 uppercase tracking-wide leading-relaxed max-w-md">
              Analyse your investments, grow your wealth one day at a time
            </p>
          </div>

          {/* Portfolio selector bar */}
          {showSelector && (
            <div className="bg-text-dark/80 backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center justify-between mb-5 max-w-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
                <span className="text-white text-xs font-mono tracking-wider">{PORTFOLIO_ID}</span>
              </div>
              <button
                onClick={() => setShowSelector(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* ── CARDS GRID ── */}
          {/* Mobile: stacked 2-col, Desktop: 3-col with risk card */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Total Value Card — Blue */}
            <Link
              href="/dashboard"
              className="bg-card-blue rounded-2xl p-5 lg:p-6 text-white group hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300"
            >
              {/* Pie chart icon */}
              <div className="w-10 h-10 lg:w-12 lg:h-12 mb-3 lg:mb-4 relative">
                <svg className="w-10 h-10 lg:w-12 lg:h-12" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="3" opacity="0.3" />
                  <path d="M20 4 A16 16 0 0 1 36 20 L20 20 Z" fill="#F97316" />
                  <path d="M36 20 A16 16 0 0 1 20 36 L20 20 Z" fill="#EF4444" />
                  <path d="M20 36 A16 16 0 0 1 4 20 L20 20 Z" fill="white" opacity="0.6" />
                  <path d="M4 20 A16 16 0 0 1 20 4 L20 20 Z" fill="white" opacity="0.3" />
                </svg>
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1">
                ${TOTAL_VALUE.toLocaleString()}
              </p>
              <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/80 mb-2">
                Total Value
              </p>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
                <span className="text-xs font-bold text-emerald-300">
                  {DAY_CHANGE_PERCENT}% TODAY
                </span>
              </div>
            </Link>

            {/* Top Performer Card — Orange */}
            <Link
              href="/dashboard"
              className="bg-card-orange rounded-2xl p-5 lg:p-6 text-white group hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300"
            >
              {/* Graph icon — black square with white arrow */}
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black/20 rounded-lg flex items-center justify-center mb-3 lg:mb-4">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 20l5.5-5.5m0 0l3 3L16 12m0 0l4-4m-4 4v4m0-4h4" />
                </svg>
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1">
                +{TOP_PERFORMER.percent}%
              </p>
              <p className="text-sm lg:text-base font-bold text-white/90 mb-0.5">
                {TOP_PERFORMER.symbol}
              </p>
              <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/70">
                Top Performer
              </p>
            </Link>

            {/* Risk Score Card — Desktop only (3rd column) */}
            <Link
              href="/dashboard/health"
              className="hidden lg:flex bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white flex-col hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300"
            >
              {/* Shield icon */}
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-3xl font-extrabold tracking-tight mb-1">68/100</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">
                Risk Score
              </p>
              <p className="text-xs text-white/60">Portfolio health assessment</p>
            </Link>
          </div>

          {/* ── Desktop: Recent Activity table ── */}
          <div className="hidden lg:block mt-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-dark">Recent Activity</h3>
                <Link href="/dashboard" className="text-xs text-card-blue font-semibold hover:underline">View All</Link>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-6 py-3">Asset</th>
                    <th className="text-left px-6 py-3">Action</th>
                    <th className="text-right px-6 py-3">Amount</th>
                    <th className="text-right px-6 py-3">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-semibold">AAPL</td>
                    <td className="px-6 py-3 text-xs text-gray-500">Buy</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">$12,450</td>
                    <td className="px-6 py-3 text-xs font-bold text-emerald-500 text-right">+15.3%</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-semibold">GOOGL</td>
                    <td className="px-6 py-3 text-xs text-gray-500">Hold</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">$34,200</td>
                    <td className="px-6 py-3 text-xs font-bold text-emerald-500 text-right">+8.7%</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-semibold">TSLA</td>
                    <td className="px-6 py-3 text-xs text-gray-500">Sell</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">$8,930</td>
                    <td className="px-6 py-3 text-xs font-bold text-red-500 text-right">-3.2%</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-semibold">MSFT</td>
                    <td className="px-6 py-3 text-xs text-gray-500">Buy</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">$45,098</td>
                    <td className="px-6 py-3 text-xs font-bold text-emerald-500 text-right">+11.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile: "Edit with Grok" floating pill ── */}
          <div className="lg:hidden fixed bottom-20 right-4 z-40">
            <button
              className="flex items-center gap-2 bg-text-dark/80 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-card-lg hover:bg-text-dark transition group"
              title="Edit with Grok"
            >
              <span className="w-5 h-5 bg-content-green rounded-full flex items-center justify-center text-[9px] font-bold">G</span>
              <span>Edit with Grok</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </main>

        {/* ── MOBILE BOTTOM BROWSER BAR ── (visible < lg only) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          {/* URL bar */}
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-xs text-gray-500 flex-1 truncate">portfolio-analyser-123abc.base44.app</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>
          {/* Bottom navigation icons */}
          <div className="bg-white px-6 py-2 flex justify-around items-center pb-[env(safe-area-inset-bottom,8px)]">
            <button className="p-2 text-card-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="p-2 text-card-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button className="p-2 text-card-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
            <button className="p-2 text-card-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
            <button className="p-2 text-card-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
