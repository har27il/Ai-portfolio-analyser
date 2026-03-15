import { db } from '../../db/index.js';
import { portfolios, holdings } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export const portfolioService = {
  async listPortfolios(userId: string) {
    // Only return portfolios owned by the authenticated user
    return db.select().from(portfolios).where(eq(portfolios.userId, userId));
  },

  async getPortfolio(id: string, userId?: string) {
    const conditions = userId
      ? and(eq(portfolios.id, id), eq(portfolios.userId, userId))
      : eq(portfolios.id, id);

    const [portfolio] = await db.select().from(portfolios).where(conditions);
    if (!portfolio) return null;

    const holdingsList = await db.select().from(holdings).where(eq(holdings.portfolioId, id));

    return {
      ...portfolio,
      holdings: holdingsList,
    };
  },

  async createPortfolio(userId: string, data: { name: string; description?: string; currency?: string }) {
    const [portfolio] = await db.insert(portfolios).values({
      userId,
      name: data.name,
      description: data.description,
      currency: data.currency || 'INR',
    }).returning();
    return portfolio;
  },

  async updatePortfolio(id: string, userId: string, data: { name?: string; description?: string; isPrimary?: boolean }) {
    // Verify ownership before update
    const [existing] = await db.select({ id: portfolios.id })
      .from(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)));

    if (!existing) return null;

    const [portfolio] = await db.update(portfolios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  },

  async deletePortfolio(id: string, userId: string) {
    // Verify ownership before delete
    await db.delete(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)));
  },

  async addHolding(portfolioId: string, data: { symbol: string; name: string; quantity: number; avgCost: number; exchange?: string }) {
    const [holding] = await db.insert(holdings).values({
      portfolioId,
      symbol: data.symbol,
      name: data.name,
      quantity: String(data.quantity),
      avgCost: String(data.avgCost),
      exchange: data.exchange,
      source: 'manual',
    }).returning();
    return holding;
  },

  async addHoldings(portfolioId: string, holdingsData: any[]) {
    const values = holdingsData.map(h => ({
      portfolioId,
      symbol: String(h.symbol).slice(0, 50),
      name: String(h.name || h.symbol).slice(0, 255),
      quantity: String(h.quantity),
      avgCost: String(h.avgCost),
      assetClass: h.assetClass || 'equity',
      source: 'csv_upload' as const,
      broker: h.broker ? String(h.broker).slice(0, 50) : undefined,
    }));
    return db.insert(holdings).values(values).returning();
  },

  async updateHolding(holdingId: string, data: { quantity?: number; avgCost?: number }) {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (data.quantity !== undefined) updateData.quantity = String(data.quantity);
    if (data.avgCost !== undefined) updateData.avgCost = String(data.avgCost);

    const [holding] = await db.update(holdings)
      .set(updateData)
      .where(eq(holdings.id, holdingId))
      .returning();
    return holding;
  },

  async removeHolding(holdingId: string) {
    await db.delete(holdings).where(eq(holdings.id, holdingId));
  },

  async refreshPrices(portfolioId: string, userId: string) {
    return this.getPortfolio(portfolioId, userId);
  },
};
