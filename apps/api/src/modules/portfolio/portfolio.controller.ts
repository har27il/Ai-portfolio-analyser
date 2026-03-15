import type { FastifyRequest, FastifyReply } from 'fastify';
import { portfolioService } from './portfolio.service.js';
import { parsePortfolioFile } from './parsers/index.js';

export const portfolioController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    // For MVP, return demo portfolios without auth
    const portfolios = await portfolioService.listPortfolios();
    return { portfolios };
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { name: string; description?: string; currency?: string };
    const portfolio = await portfolioService.createPortfolio(body);
    reply.code(201);
    return portfolio;
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.getPortfolio(id);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return portfolio;
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; description?: string; isPrimary?: boolean };
    const portfolio = await portfolioService.updatePortfolio(id, body);
    return portfolio;
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await portfolioService.deletePortfolio(id);
    reply.code(204);
  },

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = await request.file();

    if (!data) {
      reply.code(400);
      return { error: 'No file uploaded' };
    }

    const buffer = await data.toBuffer();
    const filename = data.filename;
    const broker = (data.fields as any)?.broker?.value;

    const result = await parsePortfolioFile(buffer, filename, broker);

    if (result.holdings.length > 0) {
      await portfolioService.addHoldings(id, result.holdings);
    }

    return result;
  },

  async addHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { symbol: string; name: string; quantity: number; avgCost: number; exchange?: string };
    const holding = await portfolioService.addHolding(id, body);
    reply.code(201);
    return holding;
  },

  async updateHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id, holdingId } = request.params as { id: string; holdingId: string };
    const body = request.body as { quantity?: number; avgCost?: number };
    const holding = await portfolioService.updateHolding(holdingId, body);
    return holding;
  },

  async removeHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id, holdingId } = request.params as { id: string; holdingId: string };
    await portfolioService.removeHolding(holdingId);
    reply.code(204);
  },

  async refreshPrices(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const portfolio = await portfolioService.refreshPrices(id);
    return portfolio;
  },
};
