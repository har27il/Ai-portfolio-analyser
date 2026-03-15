'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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
  'Show me my top holdings by weight',
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

    try {
      // Try API first, fall back to demo response
      let response: any;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/conversations/demo/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
        });
        if (res.ok) {
          response = await res.json();
        }
      } catch {
        // API not available, use demo response
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response?.assistantMessage?.content || generateDemoResponse(content),
        suggestedFollowUps: response?.assistantMessage?.metadata?.suggestedFollowUps || generateDemoFollowUps(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-lg font-bold">AI Portfolio Chat</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <h2 className="text-2xl font-bold mb-2">Ask about your portfolio</h2>
              <p className="text-gray-500 mb-6">
                Get AI-powered insights about your investments, risk, and opportunities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left p-3 bg-white rounded-lg border text-sm hover:border-primary-500 hover:bg-primary-50 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestedFollowUps.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
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
                <div className="bg-white border rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-xl border p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about your portfolio..."
            className="flex-1 text-sm outline-none px-2"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          Disclaimer: This is for informational purposes only and not financial advice.
        </p>
      </main>
    </div>
  );
}

function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('health') || q.includes('how') && q.includes('portfolio')) {
    return `Your portfolio health score is 68/100, which is rated "Fair". Here's the breakdown:

• Diversification: 20/25 — Good with 10 holdings
• Sector Balance: 14/20 — IT sector is overweight at 22.8% vs benchmark 14%
• Geographic Spread: 0/15 — No international exposure detected
• Correlation Risk: 10/15 — Moderate correlation between holdings
• Cost Efficiency: 15/15 — No high-cost funds
• Volatility: 9/10 — Portfolio beta close to 1.0

The biggest area for improvement is adding international diversification. Consider allocating 20-30% to US or global ETFs/funds.

Disclaimer: This is for informational purposes only and not financial advice.`;
  }

  if (q.includes('bank') || q.includes('financial')) {
    return `Your Financial Services sector allocation is 35.2%, which is close to the Nifty 50 benchmark of 37%.

Your banking/financial holdings:
• HDFC Bank: 13.7% of portfolio
• ICICI Bank: 10.2%
• SBI: 7.8%
• Total: 31.7% in banking stocks

While close to the benchmark, having 3 large bank positions means your portfolio is sensitive to banking sector risks like rising NPAs or rate changes.

Disclaimer: This is for informational purposes only and not financial advice.`;
  }

  if (q.includes('risk')) {
    return `Here are your top risk factors:

1. No International Diversification (Critical)
   — 100% India exposure increases country-specific risk

2. IT Sector Overweight (Warning)
   — 22.8% vs 14% benchmark (+8.8% deviation)

3. Missing Sectors (Info)
   — No exposure to Metals, Construction, or Power sectors

4. Moderate Holding Concentration
   — Top 3 holdings make up ~36% of portfolio

Consider adding global ETFs and diversifying into missing sectors to reduce these risks.

Disclaimer: This is for informational purposes only and not financial advice.`;
  }

  if (q.includes('sector') || q.includes('missing') || q.includes('diversif')) {
    return `Here's your sector allocation vs Nifty 50:

• Financial Services: 35.2% (benchmark: 37%) ✅
• IT: 22.8% (benchmark: 14%) ⚠️ Overweight
• Oil & Gas: 12.5% (benchmark: 12%) ✅
• Consumer Goods: 8.3% (benchmark: 10%) ✅
• Automobile: 7.8% (benchmark: 5%) ⚠️ Slight overweight
• Pharma: 6.9% (benchmark: 4%) ✅
• Telecom: 6.5% (benchmark: 3%) ✅

Missing sectors: Metals, Construction, Power

Consider reducing IT allocation and adding exposure to missing sectors.

Disclaimer: This is for informational purposes only and not financial advice.`;
  }

  if (q.includes('top') || q.includes('holding') || q.includes('weight') || q.includes('largest')) {
    return `Your top holdings by portfolio weight:

1. HDFC Bank — ₹84,000 (13.7%)
2. ICICI Bank — ₹63,000 (10.2%)
3. Reliance — ₹49,600 (8.1%)
4. Infosys — ₹60,800 (9.9%)
5. TCS — ₹51,750 (8.4%)

Top 5 holdings account for 50.3% of your portfolio, which is moderately concentrated. A well-diversified portfolio typically has the top 5 at 40% or less.

Disclaimer: This is for informational purposes only and not financial advice.`;
  }

  return `Based on your portfolio of 10 holdings worth approximately ₹26.68L:

Your portfolio is primarily invested in Indian equities across Financial Services (35%), IT (23%), Oil & Gas (13%), and other sectors.

Key highlights:
• Health Score: 68/100 (Fair)
• Unrealized P&L: +₹1.23L (+4.8%)
• No international diversification
• Good cost efficiency

What would you like to know more about? Try asking about specific sectors, risks, or holdings.

Disclaimer: This is for informational purposes only and not financial advice.`;
}

function generateDemoFollowUps(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('sector')) return ['Which sector should I reduce?', 'How do I add metals exposure?', 'Show me my risks'];
  if (q.includes('risk')) return ['How can I reduce concentration?', 'Should I add international?', 'Show me sector allocation'];
  if (q.includes('bank') || q.includes('financial')) return ['Should I reduce banking?', 'Show me all sectors', 'What are my risks?'];
  return ['How is my portfolio doing?', 'What are my risks?', 'Show me sector allocation'];
}
