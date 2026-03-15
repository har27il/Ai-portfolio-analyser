import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, jsonb, date, bigint, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }),
  oauthProvider: varchar('oauth_provider', { length: 50 }),
  oauthId: varchar('oauth_id', { length: 255 }),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const portfolios = pgTable('portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  currency: varchar('currency', { length: 3 }).default('INR'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const holdings = pgTable('holdings', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
  avgCost: decimal('avg_cost', { precision: 18, scale: 4 }).notNull(),
  assetClass: varchar('asset_class', { length: 50 }),
  exchange: varchar('exchange', { length: 20 }),
  isin: varchar('isin', { length: 12 }),
  source: varchar('source', { length: 50 }),
  broker: varchar('broker', { length: 50 }),
  notes: text('notes'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  holdingId: uuid('holding_id').references(() => holdings.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 10 }).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
  price: decimal('price', { precision: 18, scale: 4 }).notNull(),
  fees: decimal('fees', { precision: 18, scale: 4 }).default('0'),
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const analysisSnapshots = pgTable('analysis_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }),
  analysisType: varchar('analysis_type', { length: 50 }).notNull(),
  data: jsonb('data').notNull(),
  marketDate: date('market_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  portfolioId: uuid('portfolio_id').references(() => portfolios.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const securities = pgTable('securities', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: varchar('symbol', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  exchange: varchar('exchange', { length: 20 }),
  isin: varchar('isin', { length: 12 }),
  assetClass: varchar('asset_class', { length: 50 }),
  sector: varchar('sector', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  country: varchar('country', { length: 3 }),
  marketCapCategory: varchar('market_cap_category', { length: 20 }),
  isMutualFund: boolean('is_mutual_fund').default(false),
  fundHouse: varchar('fund_house', { length: 100 }),
  fundCategory: varchar('fund_category', { length: 100 }),
  expenseRatio: decimal('expense_ratio', { precision: 5, scale: 4 }),
  data: jsonb('data'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const priceHistory = pgTable('price_history', {
  securityId: uuid('security_id').references(() => securities.id),
  date: date('date').notNull(),
  open: decimal('open', { precision: 18, scale: 4 }),
  high: decimal('high', { precision: 18, scale: 4 }),
  low: decimal('low', { precision: 18, scale: 4 }),
  close: decimal('close', { precision: 18, scale: 4 }).notNull(),
  volume: bigint('volume', { mode: 'number' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.securityId, table.date] }),
}));

export const mfHoldings = pgTable('mf_holdings', {
  mfSecurityId: uuid('mf_security_id').references(() => securities.id),
  stockSymbol: varchar('stock_symbol', { length: 50 }).notNull(),
  stockName: varchar('stock_name', { length: 255 }),
  weight: decimal('weight', { precision: 5, scale: 4 }).notNull(),
  asOfDate: date('as_of_date').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.mfSecurityId, table.stockSymbol, table.asOfDate] }),
}));
