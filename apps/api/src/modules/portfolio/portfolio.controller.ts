import type { FastifyRequest, FastifyReply } from 'fastify';
import { portfolioService } from './portfolio.service.js';
import { parsePortfolioFile } from './parsers/index.js';
import {
  validate,
  uuidParam,
  createPortfolioSchema,
  updatePortfolioSchema,
  addHoldingSchema,
  updateHoldingSchema,
  uploadBrokerSchema,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '../../common/validation.js';

function getUserId(request: FastifyRequest): string {
  const sub = (request.user as any)?.sub;
  if (!sub) throw new Error('Unauthorized: missing user identity');
  return sub;
}

export const portfolioController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const portfolios = await portfolioService.listPortfolios(userId);
    return { portfolios };
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = validate(createPortfolioSchema, request.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.createPortfolio(userId, result.data);
    reply.code(201);
    return portfolio;
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.getPortfolio(idResult.data, userId);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return portfolio;
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    const result = validate(updatePortfolioSchema, request.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.updatePortfolio(idResult.data, userId, result.data);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }
    return portfolio;
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    const userId = getUserId(request);
    await portfolioService.deletePortfolio(idResult.data, userId);
    reply.code(204);
  },

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    // Verify ownership
    const userId = getUserId(request);
    const portfolio = await portfolioService.getPortfolio(idResult.data, userId);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }

    const data = await request.file();
    if (!data) {
      reply.code(400);
      return { error: 'No file uploaded' };
    }

    // ── File security checks ───────────────────────────────────
    const filename = data.filename;
    const mimetype = data.mimetype;

    // 1. Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      reply.code(400);
      return { error: 'Unsupported file type. Allowed: CSV, XLSX, XLS' };
    }

    // 2. Check file extension (prevent double extensions like .csv.exe)
    const ext = '.' + filename.toLowerCase().split('.').pop();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      reply.code(400);
      return { error: `Unsupported file extension: ${ext}` };
    }

    // 3. Reject filenames with path traversal characters
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      reply.code(400);
      return { error: 'Invalid filename' };
    }

    const buffer = await data.toBuffer();

    // 4. Check actual file size
    if (buffer.length > 5 * 1024 * 1024) {
      reply.code(400);
      return { error: 'File too large. Maximum 5MB allowed.' };
    }

    // 5. Validate broker param
    const brokerField = (data.fields as any)?.broker?.value;
    const brokerResult = uploadBrokerSchema.safeParse(brokerField);
    const broker = brokerResult.success ? brokerResult.data : undefined;

    const result = await parsePortfolioFile(buffer, filename, broker);

    if (result.holdings.length > 0) {
      await portfolioService.addHoldings(idResult.data, result.holdings);
    }

    return result;
  },

  async addHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    const result = validate(addHoldingSchema, request.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.getPortfolio(idResult.data, userId);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }

    const holding = await portfolioService.addHolding(idResult.data, result.data);
    reply.code(201);
    return holding;
  },

  async updateHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id, holdingId } = request.params as { id: string; holdingId: string };
    if (!uuidParam.safeParse(id).success || !uuidParam.safeParse(holdingId).success) {
      reply.code(400);
      return { error: 'Invalid ID format' };
    }

    const result = validate(updateHoldingSchema, request.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.getPortfolio(id, userId);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }

    const holding = await portfolioService.updateHolding(id, holdingId, result.data);
    return holding;
  },

  async removeHolding(request: FastifyRequest, reply: FastifyReply) {
    const { id, holdingId } = request.params as { id: string; holdingId: string };
    if (!uuidParam.safeParse(id).success || !uuidParam.safeParse(holdingId).success) {
      reply.code(400);
      return { error: 'Invalid ID format' };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.getPortfolio(id, userId);
    if (!portfolio) {
      reply.code(404);
      return { error: 'Portfolio not found' };
    }

    await portfolioService.removeHolding(id, holdingId);
    reply.code(204);
  },

  async refreshPrices(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const idResult = uuidParam.safeParse(id);
    if (!idResult.success) {
      reply.code(400);
      return { error: 'Invalid portfolio ID' };
    }

    const userId = getUserId(request);
    const portfolio = await portfolioService.refreshPrices(idResult.data, userId);
    return portfolio;
  },
};
