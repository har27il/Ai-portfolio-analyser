'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Welcome to</p>
            <h1 className="text-2xl font-bold tracking-tight">Portfolio Analyzer</h1>
          </div>
          <Link
            href="/dashboard"
            className="bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          >
            Go
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 space-y-4">
        {/* Hero Card */}
        <div className="card-dark">
          <p className="text-gray-400 text-xs font-medium mb-3">AI-POWERED INSIGHTS</p>
          <h2 className="text-xl font-bold mb-2">Analyze Your Portfolio</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Upload holdings, get health scores, discover mutual fund overlaps, and chat with AI about your investments.
          </p>
          <div className="flex gap-3">
            <Link href="/upload" className="btn-primary">
              Upload Portfolio
            </Link>
            <Link href="/chat" className="border border-gray-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition">
              AI Chat
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          <FeatureRow href="/dashboard" icon="📊" title="Dashboard" subtitle="Portfolio overview & holdings" />
          <FeatureRow href="/dashboard/health" icon="💯" title="Health Score" subtitle="0-100 score with 6 factors" />
          <FeatureRow href="/dashboard/sectors" icon="📈" title="Sector Analysis" subtitle="Compare with Nifty 50 benchmark" />
          <FeatureRow href="/chat" icon="🤖" title="AI Chat" subtitle="Ask questions in natural language" />
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="stat-label">Supported Brokers</p>
            <p className="stat-value mt-1">3+</p>
            <p className="text-xs text-gray-400 mt-0.5">Zerodha, Groww, Generic</p>
          </div>
          <div className="card">
            <p className="stat-label">Health Factors</p>
            <p className="stat-value mt-1">6</p>
            <p className="text-xs text-gray-400 mt-0.5">Diversification, Sector & more</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-4 text-center">
        <p className="text-[10px] text-gray-400">
          Portfolio Intelligence Tool — Not financial advice. For educational purposes only.
        </p>
      </footer>

      <BottomNav active="home" />
    </div>
  );
}

function FeatureRow({ href, icon, title, subtitle }: { href: string; icon: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="card flex items-center gap-4 hover:shadow-card-lg transition">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
