import { db } from '../../db/index.js';
import { portfolios, holdings } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export const portfolioService = {
  async listPortfolios(userId?: string) {
    const result = await db.select().from(portfolios);
    return result;
  },

  async getPortfolio(id: string) {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    if (!portfolio) return null;

    const holdingsList = await db.select().from(holdings).where(eq(holdings.portfolioId, id));

    return {
      ...portfolio,
      holdings: holdingsList,
    };
  },

  async createPortfolio(data: { name: string; description?: string; currency?: string }) {
    const [portfolio] = await db.insert(portfolios).values({
      name: data.name,
      description: data.description,
      currency: data.currency || 'INR',
    }).returning();
    return portfolio;
  },

  async updatePortfolio(id: string, data: { name?: string; description?: string; isPrimary?: boolean }) {
    const [portfolio] = await db.update(portfolios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  },

  async deletePortfolio(id: string) {
    await db.delete(portfolios).where(eq(portfolios.id, id));
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
      symbol: h.symbol,
      name: h.name || h.symbol,
      quantity: String(h.quantity),
      avgCost: String(h.avgCost),
      assetClass: h.assetClass || 'equity',
      source: 'csv_upload' as const,
      broker: h.broker,
    }));
    return db.insert(holdings).values(values).returning();
  },

  async updateHolding(holdingId: string, data: { quantity?: number; avgCost?: number }) {
    const updateData: any = { updatedAt: new Date() };
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

  async refreshPrices(portfolioId: string) {
    // TODO: Integrate with market data providers
    return this.getPortfolio(portfolioId);
  },
};
