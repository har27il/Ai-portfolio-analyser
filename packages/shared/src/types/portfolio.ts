export type AssetClass = 'equity' | 'etf' | 'mutual_fund' | 'crypto' | 'bond' | 'cash';

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  currency: string;
  isPrimary: boolean;
  holdings: Holding[];
  summary?: PortfolioSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;

  currentPrice?: number;
  currentValue?: number;
  unrealizedPnL?: number;
  unrealizedPnLPercent?: number;
  weight?: number;

  assetClass: AssetClass;
  exchange?: string;
  isin?: string;

  source: 'manual' | 'csv_upload' | 'broker_api';
  broker?: string;

  sector?: string;
  industry?: string;
  geography?: string;
  marketCapCategory?: 'large' | 'mid' | 'small' | 'micro';

  expenseRatio?: number;
  fundCategory?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;

  assetAllocation: { class: AssetClass; value: number; weight: number }[];
  sectorAllocation: { sector: string; value: number; weight: number }[];
  geoAllocation: { country: string; value: number; weight: number }[];

  topHoldings: { symbol: string; name: string; weight: number }[];
  topGainers: { symbol: string; name: string; pnlPercent: number }[];
  topLosers: { symbol: string; name: string; pnlPercent: number }[];
}

export interface UploadResult {
  success: boolean;
  holdings: Holding[];
  errors: UploadError[];
  warnings: UploadWarning[];
}

export interface UploadError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface UploadWarning {
  type: string;
  symbol?: string;
  message: string;
  suggestion?: string;
}
