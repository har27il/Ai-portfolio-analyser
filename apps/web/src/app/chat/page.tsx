'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';
import { DesktopSidebar } from '@/components/desktop-sidebar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedFollowUps?: string[];
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'How is my portfolio doing?',
  'Am I overexposed to banking?',
  'What are my biggest risks?',
  'Which sectors am I missing?',
  'How diversified is my portfolio?',
  'Show me my top holdings',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Small delay for natural typing feel
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let aiContent: string | undefined;
      let aiFollowUps: string[] | undefined;

      // Only call real API if explicitly configured
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(`${apiUrl}/v1/conversations/demo/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content.trim() }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const response = await res.json();
            aiContent = response?.assistantMessage?.content;
            aiFollowUps = response?.assistantMessage?.metadata?.suggestedFollowUps;
          }
        } catch {
          // API not available — use demo response
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent || generateDemoResponse(content),
        suggestedFollowUps: aiFollowUps || generateDemoFollowUps(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <DesktopSidebar active="chat" />

      {/* Chat container: h-screen flex-col so header/messages/input stack without overlap */}
      <div className="flex-1 h-screen flex flex-col lg:ml-[280px]">
        {/* Header — fixed height */}
        <header className="shrink-0 px-5 pt-6 pb-4 flex items-center gap-3 border-b-[3px] border-black/20 bg-surface">
          <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white border-2 border-transparent hover:border-black/20 transition-all">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">AI Chat</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ask about your portfolio</p>
          </div>
        </header>

        {/* Messages area — scrollable, takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 bg-surface">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center w-full max-w-lg mx-auto py-8">
                <div className="w-16 h-16 bg-card-dark border-[3px] border-black/40 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider mb-1">Portfolio Assistant</h2>
                <p className="text-xs text-gray-400 mb-6">Get AI-powered insights about your investments</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="card !p-3 text-left text-xs font-black text-gray-600 hover:shadow-card-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all cursor-pointer relative z-10"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] lg:max-w-[65%] px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-card-dark text-white border-[3px] border-black/40 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]'
                      : 'bg-white border-[3px] border-black/30 shadow-[4px_4px_0px_rgba(0,0,0,0.15)]'
                  }`}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map(q => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => sendMessage(q)}
                            className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 border-2 border-black/20 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="card !p-3">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area — fixed at bottom of flex, NOT sticky/fixed position */}
        <div className="shrink-0 px-5 py-3 border-t-[3px] border-black/20 bg-surface mb-16 lg:mb-0 relative z-10">
          <div className="flex items-center gap-2 card !p-2 max-w-lg mx-auto lg:max-w-2xl">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask about your portfolio..."
              className="flex-1 text-xs outline-none px-2 py-1.5 bg-transparent"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="bg-card-dark text-white p-2 border-[3px] border-black/40 shadow-[3px_3px_0px_rgba(0,0,0,0.3)] disabled:opacity-30 active:scale-[0.95] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[8px] text-gray-400 text-center mt-1.5">
            Not financial advice. For educational purposes only.
          </p>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
}

function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('health') || (q.includes('how') && q.includes('portfolio'))) {
    return `Your portfolio health score is 68/100 (Fair).\n\n• Diversification: 20/25 — Good with 10 holdings\n• Sector Balance: 14/20 — IT sector overweight at 22.8%\n• Geographic Spread: 0/15 — No international exposure\n• Correlation Risk: 10/15 — Moderate correlation\n• Cost Efficiency: 15/15 — Excellent\n• Volatility: 9/10 — Beta close to 1.0\n\nBiggest improvement: Add international diversification (20-30% to global ETFs).\n\nDisclaimer: Not financial advice.`;
  }

  if (q.includes('bank') || q.includes('financial')) {
    return `Financial Services: 35.2% (benchmark 37%)\n\n• HDFC Bank: 13.7%\n• ICICI Bank: 10.2%\n• SBI: 7.8%\n• Total banking: 31.7%\n\nClose to benchmark but 3 large bank positions creates sector-specific risk.\n\nDisclaimer: Not financial advice.`;
  }

  if (q.includes('risk')) {
    return `Top risk factors:\n\n1. No International Diversification 🔴\n   100% India exposure\n\n2. IT Sector Overweight ⚠️\n   22.8% vs 14% benchmark\n\n3. Missing Sectors ℹ️\n   No Metals, Construction, Power\n\n4. Moderate Concentration\n   Top 3 = ~36% of portfolio\n\nDisclaimer: Not financial advice.`;
  }

  if (q.includes('sector') || q.includes('missing') || q.includes('diversif')) {
    return `Sector allocation vs Nifty 50:\n\n• Financial Services: 35.2% (37%) ✅\n• IT: 22.8% (14%) ⚠️ Overweight\n• Oil & Gas: 12.5% (12%) ✅\n• Consumer Goods: 8.3% (10%) ✅\n• Automobile: 7.8% (5%) ⚠️\n• Pharma: 6.9% (4%) ✅\n• Telecom: 6.5% (3%) ✅\n\nMissing: Metals, Construction, Power\n\nDisclaimer: Not financial advice.`;
  }

  if (q.includes('top') || q.includes('holding') || q.includes('weight') || q.includes('largest')) {
    return `Top holdings by weight:\n\n1. HDFC Bank — ₹84,000 (13.7%)\n2. ICICI Bank — ₹63,000 (10.2%)\n3. Infosys — ₹60,800 (9.9%)\n4. TCS — ₹51,750 (8.4%)\n5. Reliance — ₹49,600 (8.1%)\n\nTop 5 = 50.3% (target: <40%)\n\nDisclaimer: Not financial advice.`;
  }

  return `Portfolio: 10 holdings worth ~₹26.68L\n\n• Health Score: 68/100 (Fair)\n• P&L: +₹1.23L (+4.8%)\n• Sectors: Financial Services (35%), IT (23%), Oil & Gas (13%)\n• No international diversification\n\nTry asking about specific sectors, risks, or holdings.\n\nDisclaimer: Not financial advice.`;
}

function generateDemoFollowUps(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('sector')) return ['Reduce which sector?', 'Add metals exposure?', 'Show risks'];
  if (q.includes('risk')) return ['Reduce concentration?', 'Add international?', 'Sector allocation'];
  if (q.includes('bank')) return ['Reduce banking?', 'All sectors', 'My risks'];
  return ['Portfolio health?', 'My risks?', 'Sector allocation'];
}
