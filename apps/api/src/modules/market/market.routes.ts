import type { FastifyInstance } from 'fastify';
import { marketController } from './market.controller.js';

export async function marketRoutes(app: FastifyInstance) {
  app.get('/search', marketController.search);
  app.get('/quote/:symbol', marketController.getQuote);
  app.get('/history/:symbol', marketController.getHistory);
}
