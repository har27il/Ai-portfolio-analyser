import { z } from 'zod';

// ── Common validators ──────────────────────────────────────────
export const uuidParam = z.string().uuid('Invalid ID format');

// Sanitize string: trim + strip control characters
const safeString = (max: number) =>
  z.string().max(max).trim().transform(s => s.replace(/[\x00-\x1F\x7F]/g, ''));

// ── Portfolio schemas ──────────────────────────────────────────
export const createPortfolioSchema = z.object({
  name: safeString(255).pipe(z.string().min(1, 'Name is required')),
  description: safeString(1000).optional(),
  currency: z.enum(['INR', 'USD']).optional().default('INR'),
});

export const updatePortfolioSchema = z.object({
  name: safeString(255).optional(),
  description: safeString(1000).optional(),
  isPrimary: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field required');

// ── Holding schemas ────────────────────────────────────────────
export const addHoldingSchema = z.object({
  symbol: safeString(50).pipe(z.string().min(1).regex(/^[A-Za-z0-9._&-]+$/, 'Invalid symbol format')),
  name: safeString(255).pipe(z.string().min(1)),
  quantity: z.number().positive().max(999999999),
  avgCost: z.number().nonnegative().max(999999999),
  exchange: safeString(20).optional(),
});

export const updateHoldingSchema = z.object({
  quantity: z.number().positive().max(999999999).optional(),
  avgCost: z.number().nonnegative().max(999999999).optional(),
}).refine(data => data.quantity !== undefined || data.avgCost !== undefined, 'At least one field required');

// ── Chat schemas ───────────────────────────────────────────────
export const createConversationSchema = z.object({
  portfolioId: z.string().uuid().optional(),
});

export const sendMessageSchema = z.object({
  content: safeString(5000).pipe(z.string().min(1, 'Message content is required')),
});

// ── Query schemas ──────────────────────────────────────────────
export const benchmarkQuerySchema = z.object({
  benchmark: z.enum(['nifty50', 'niftynext50', 'nifty500', 'sp500', 'msciworld']).optional(),
  period: z.enum(['1M', '3M', '6M', '1Y', '3Y', '5Y', 'YTD']).optional(),
});

export const searchQuerySchema = z.object({
  q: safeString(100).pipe(z.string().min(1)),
  type: z.enum(['stock', 'etf', 'mf', 'crypto']).optional(),
  exchange: safeString(20).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const historyQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  interval: z.enum(['1d', '1w', '1m']).optional().default('1d'),
});

// ── Upload schemas ─────────────────────────────────────────────
export const uploadBrokerSchema = z.enum(['zerodha', 'groww', 'upstox', 'generic']).optional();

// Allowed MIME types for file uploads
export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'text/plain', // Some CSVs come as text/plain
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

// ── Helper ─────────────────────────────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) };
}
