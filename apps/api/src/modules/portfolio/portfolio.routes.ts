import type { FastifyInstance } from 'fastify';
import { portfolioController } from './portfolio.controller.js';

export async function portfolioRoutes(app: FastifyInstance) {
  app.get('/', portfolioController.list);
  app.post('/', portfolioController.create);
  app.get('/:id', portfolioController.getById);
  app.put('/:id', portfolioController.update);
  app.delete('/:id', portfolioController.remove);
  app.post('/:id/upload', portfolioController.upload);
  app.post('/:id/holdings', portfolioController.addHolding);
  app.put('/:id/holdings/:holdingId', portfolioController.updateHolding);
  app.delete('/:id/holdings/:holdingId', portfolioController.removeHolding);
  app.post('/:id/refresh-prices', portfolioController.refreshPrices);
}
