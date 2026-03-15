import type { FastifyRequest, FastifyReply } from 'fastify';
import { healthService } from './health.service.js';
import { sectorService } from './sector.service.js';
import { overlapService } from './overlap.service.js';
import { expenseService } from './expense.service.js';
import { portfolioService } from '../portfolio/portfolio.service.js';

export const analysisController = {
  async getHealthScore(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return healthService.calculateHealthScore(portfolio.holdings);
  },

  async getSectorAnalysis(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    const { benchmark } = request.query as { benchmark?: string };
    return sectorService.analyzeSectors(portfolio.holdings, benchmark);
  },

  async getOverlapAnalysis(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return overlapService.analyzeOverlap(portfolio.holdings);
  },

  async getExpenseAudit(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return expenseService.auditExpenses(portfolio.holdings);
  },

  async getBenchmarkComparison(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { benchmark, period } = request.query as { benchmark?: string; period?: string };
    // TODO: Implement benchmark comparison
    return { message: 'Benchmark comparison coming soon', benchmark, period };
  },
};
