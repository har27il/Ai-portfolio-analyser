import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js';
import { analysisRoutes } from './modules/analysis/analysis.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { marketRoutes } from './modules/market/market.routes.js';

const app = Fastify({
  logger: true,
});

// Plugins
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
await app.register(portfolioRoutes, { prefix: '/v1/portfolios' });
await app.register(analysisRoutes, { prefix: '/v1/portfolios' });
await app.register(chatRoutes, { prefix: '/v1/conversations' });
await app.register(marketRoutes, { prefix: '/v1/market' });

// Start server
const port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export default app;
