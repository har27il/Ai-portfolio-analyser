import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate, searchQuerySchema, historyQuerySchema } from '../../common/validation.js';

export const marketController = {
  async search(request: FastifyRequest, reply: FastifyReply) {
    const result = validate(searchQuerySchema, request.query);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }
    const { q, type, limit } = result.data;
    // TODO: Integrate with Yahoo Finance / NSE APIs
    return { results: [], query: q };
  },

  async getQuote(request: FastifyRequest, reply: FastifyReply) {
    const { symbol } = request.params as { symbol: string };
    // Validate symbol format
    if (!symbol || !/^[A-Za-z0-9._&-]{1,50}$/.test(symbol)) {
      reply.code(400);
      return { error: 'Invalid symbol format' };
    }
    // TODO: Integrate with market data providers
    return { symbol, price: 0, change: 0, changePercent: 0, message: 'Market data integration coming soon' };
  },

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const { symbol } = request.params as { symbol: string };
    if (!symbol || !/^[A-Za-z0-9._&-]{1,50}$/.test(symbol)) {
      reply.code(400);
      return { error: 'Invalid symbol format' };
    }

    const result = validate(historyQuerySchema, request.query || {});
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }
    const { from, to, interval } = result.data;
    return { symbol, data: [], message: 'Price history coming soon' };
  },
};
