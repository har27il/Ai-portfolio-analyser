import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fjwt from '@fastify/jwt';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js';
import { analysisRoutes } from './modules/analysis/analysis.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { marketRoutes } from './modules/market/market.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    // Never log request/response bodies (may contain sensitive data)
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
    },
  },
});

// ── Security Headers (Helmet) ──────────────────────────────────
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading external resources
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
});

// ── Rate Limiting ──────────────────────────────────────────────
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  // Stricter limit for auth endpoints (added in route-level hooks)
});

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

await app.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      cb(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});

// ── JWT Authentication ─────────────────────────────────────────
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    app.log.error('FATAL: JWT_SECRET must be set to a strong value (min 32 chars) in production.');
    process.exit(1);
  }
  app.log.warn('JWT_SECRET is not set — using insecure dev-only secret. DO NOT use in production.');
}

await app.register(fjwt, {
  secret: jwtSecret || 'dev-only-insecure-secret-not-for-production',
  sign: { expiresIn: '15m' },
});

// Auth decorator — adds authenticate method to Fastify
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
});

// ── File Upload ────────────────────────────────────────────────
await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (reduced from 10MB)
    files: 1, // Only 1 file per request
    fields: 5, // Max 5 form fields
  },
  attachFieldsToBody: false,
});

// ── Global Error Handler ───────────────────────────────────────
app.setErrorHandler((error, request, reply) => {
  // Never expose internal error details
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    request.log.error({ err: { message: error.message, code: error.code } }, 'Internal server error');
    reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  } else if (statusCode === 429) {
    reply.code(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  } else {
    reply.code(statusCode).send({
      error: error.name || 'Error',
      message: error.message || 'Request failed',
    });
  }
});

// ── Health check (public) ──────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Public routes ──────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/v1/auth' });

// ── Protected routes (require JWT) ─────────────────────────────
await app.register(async function protectedRoutes(app) {
  // Add auth hook to all routes in this scope
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  });

  await app.register(portfolioRoutes, { prefix: '/v1/portfolios' });
  await app.register(analysisRoutes, { prefix: '/v1/portfolios' });
  await app.register(chatRoutes, { prefix: '/v1/conversations' });
  await app.register(marketRoutes, { prefix: '/v1/market' });
});

// ── Start server ───────────────────────────────────────────────
const port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`Server running on port ${port}`);
} catch (err) {
  app.log.error('Failed to start server');
  process.exit(1);
}

export default app;
