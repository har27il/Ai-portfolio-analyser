import type { FastifyInstance } from 'fastify';
import { analysisController } from './analysis.controller.js';

export async function analysisRoutes(app: FastifyInstance) {
  app.get('/:id/analysis/health', analysisController.getHealthScore);
  app.get('/:id/analysis/sectors', analysisController.getSectorAnalysis);
  app.get('/:id/analysis/overlap', analysisController.getOverlapAnalysis);
  app.get('/:id/analysis/expenses', analysisController.getExpenseAudit);
  app.get('/:id/analysis/benchmark', analysisController.getBenchmarkComparison);
}
