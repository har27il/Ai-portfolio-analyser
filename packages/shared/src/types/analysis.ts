export interface HealthScore {
  overall: number;
  components: {
    diversification: ScoreComponent;
    sectorBalance: ScoreComponent;
    geographicSpread: ScoreComponent;
    correlationRisk: ScoreComponent;
    costEfficiency: ScoreComponent;
    volatility: ScoreComponent;
  };
  alerts: HealthAlert[];
  lastUpdated: Date;
}

export interface ScoreComponent {
  score: number;
  max: number;
  factors: string[];
}

export interface HealthAlert {
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  affectedHoldings?: string[];
  recommendation?: string;
}

export interface SectorAnalysis {
  sectors: {
    name: string;
    weight: number;
    benchmarkWeight: number;
    deviation: number;
    holdings: string[];
    risk: 'low' | 'medium' | 'high';
  }[];
  warnings: {
    type: 'overweight' | 'underweight' | 'missing';
    sector: string;
    currentWeight: number;
    benchmarkWeight: number;
    recommendation: string;
  }[];
  herfindahlIndex: number;
  effectiveCount: number;
}

export interface OverlapAnalysis {
  pairwiseOverlap: PairwiseOverlap[];
  overlapMatrix: { funds: string[]; matrix: number[][] };
  portfolioOverlapScore: number;
  recommendations: OverlapRecommendation[];
}

export interface PairwiseOverlap {
  fund1: { symbol: string; name: string };
  fund2: { symbol: string; name: string };
  overlapPercent: number;
  commonStocksCount: number;
  commonStocks: {
    symbol: string;
    name: string;
    weightInFund1: number;
    weightInFund2: number;
  }[];
}

export interface OverlapRecommendation {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedFunds: string[];
  suggestedAction: string;
}

export interface ExpenseAudit {
  holdings: {
    name: string;
    expenseRatio: number;
    category: string;
    categoryAverage: number;
    rating: 'excellent' | 'good' | 'average' | 'high' | 'very_high';
  }[];
  portfolioWAER: number;
  annualCostImpact: number;
  recommendations: {
    fund: string;
    currentER: number;
    alternativeFund: string;
    alternativeER: number;
    potentialSavings: number;
  }[];
}

export interface BenchmarkComparison {
  benchmark: string;
  period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'YTD';
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  portfolioVolatility: number;
  benchmarkVolatility: number;
  sharpeRatio: number;
  informationRatio: number;
  maxDrawdown: {
    portfolio: number;
    benchmark: number;
  };
  correlation: number;
  beta: number;
}
