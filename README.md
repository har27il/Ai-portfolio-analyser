# Portfolio Intelligence Tool

AI-powered portfolio analysis dashboard for retail investors. Upload your portfolio, get instant health scores, discover mutual fund overlaps, and chat with AI about your investments.

## Features

- **Portfolio Upload** — CSV/Excel upload with Zerodha, Groww, and generic format support
- **Health Score** — 0-100 score based on diversification, sector balance, costs, and risk
- **Sector Analysis** — Portfolio vs benchmark sector comparison (Nifty 50)
- **MF Overlap Detection** — Find hidden overlaps between mutual funds
- **Expense Audit** — Audit mutual fund expense ratios with cheaper alternatives
- **AI Chat** — Natural language Q&A about your portfolio powered by Claude

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Shadcn/UI |
| Backend | Fastify, TypeScript, Drizzle ORM |
| Database | PostgreSQL 15 |
| Cache | Redis |
| AI | Claude API (Anthropic) |
| Charts | Recharts |
| Monorepo | Turborepo, pnpm |

## Project Structure

```
portfolio-intelligence/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend
├── packages/
│   └── shared/       # Shared types and utilities
├── turbo.json        # Turborepo config
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+ (or use Docker)
- Redis (or use Docker)

### Setup

```bash
# Install dependencies
pnpm install

# Start databases (Docker)
docker compose up -d postgres redis

# Set up environment
cp .env.example .env
# Edit .env with your values

# Push database schema
cd apps/api && pnpm db:push && cd ../..

# Start development
pnpm dev
```

### Environment Variables

Copy `.env.example` and configure:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `ANTHROPIC_API_KEY` — For AI chat (optional, falls back to demo mode)
- `NEXT_PUBLIC_API_URL` — Backend API URL

## Development

```bash
pnpm dev         # Start all apps in dev mode
pnpm build       # Build all packages
pnpm test        # Run tests
pnpm typecheck   # TypeScript check
pnpm lint        # Lint all packages
```

## API Endpoints

### Portfolio
- `GET /v1/portfolios` — List portfolios
- `POST /v1/portfolios` — Create portfolio
- `POST /v1/portfolios/:id/upload` — Upload CSV/Excel
- `POST /v1/portfolios/:id/holdings` — Add holding

### Analysis
- `GET /v1/portfolios/:id/analysis/health` — Health score
- `GET /v1/portfolios/:id/analysis/sectors` — Sector analysis
- `GET /v1/portfolios/:id/analysis/overlap` — MF overlap
- `GET /v1/portfolios/:id/analysis/expenses` — Expense audit

### Chat
- `POST /v1/conversations` — Start conversation
- `POST /v1/conversations/:id/messages` — Send message

## License

Private — Internal use only.
