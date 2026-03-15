import type { FastifyRequest, FastifyReply } from 'fastify';
import { healthService } from './health.service.js';
import { sectorService } from './sector.service.js';
import { overlapService } from './overlap.service.js';
import { expenseService } from './expense.service.js';
import { portfolioService } from '../portfolio/portfolio.service.js';
import { uuidParam, validate, benchmarkQuerySchema } from '../../common/validation.js';

function getUserId(request: FastifyRequest): string {
  return (request.user as any)?.sub || '';
}

async function getPortfolioOrFail(id: string, userId: string, reply: FastifyReply) {
  const idResult = uuidParam.safeParse(id);
  if (!idResult.success) {
    reply.code(400);
    return null;
  }

  const portfolio = await portfolioService.getPortfolio(idResult.data, userId);
  if (!portfolio) {
    reply.code(404);
    reply.send({ error: 'Portfolio not found' });
    return null;
  }
  return portfolio;
}

export const analysisController = {
  async getHealthScore(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await getPortfolioOrFail(id, getUserId(request), reply);
    if (!portfolio) return;
    return healthService.calculateHealthScore(portfolio.holdings);
  },

  async getSectorAnalysis(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await getPortfolioOrFail(id, getUserId(request), reply);
    if (!portfolio) return;

    const result = validate(benchmarkQuerySchema, request.query || {});
    const benchmark = result.success ? result.data.benchmark : undefined;
    return sectorService.analyzeSectors(portfolio.holdings, benchmark);
  },

  async getOverlapAnalysis(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await getPortfolioOrFail(id, getUserId(request), reply);
    if (!portfolio) return;
    return overlapService.analyzeOverlap(portfolio.holdings);
  },

  async getExpenseAudit(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await getPortfolioOrFail(id, getUserId(request), reply);
    if (!portfolio) return;
    return expenseService.auditExpenses(portfolio.holdings);
  },

  async getBenchmarkComparison(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await getPortfolioOrFail(id, getUserId(request), reply);
    if (!portfolio) return;

    const result = validate(benchmarkQuerySchema, request.query || {});
    const { benchmark, period } = result.success ? result.data : { benchmark: undefined, period: undefined };
    return { message: 'Benchmark comparison coming soon', benchmark, period };
  },
};
