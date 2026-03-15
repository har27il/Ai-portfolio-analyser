import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">Portfolio Intelligence</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Portfolio Analysis
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Upload your portfolio, get instant health scores, discover mutual fund overlaps,
            and chat with AI about your investments. Built for Indian retail investors.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/upload"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition"
            >
              Upload Portfolio
            </Link>
            <Link
              href="/chat"
              className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Try AI Chat
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <FeatureCard
              title="Health Score"
              description="Get a 0-100 score based on diversification, sector balance, costs, and risk."
            />
            <FeatureCard
              title="MF Overlap Detection"
              description="Find hidden overlaps between your mutual funds with detailed analysis."
            />
            <FeatureCard
              title="AI Portfolio Chat"
              description="Ask questions about your portfolio in natural language and get data-backed answers."
            />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        <p>Portfolio Intelligence Tool — Not financial advice. For educational purposes only.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
