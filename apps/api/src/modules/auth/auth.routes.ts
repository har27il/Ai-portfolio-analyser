import type { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  // Stricter rate limit for auth endpoints (prevent brute force)
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes',
      },
    },
  };

  app.post('/register', authController.register);
  app.post('/login', authController.login);
  app.post('/refresh', authController.refresh);
  app.post('/logout', { preHandler: [(app as any).authenticate] }, authController.logout);
}
