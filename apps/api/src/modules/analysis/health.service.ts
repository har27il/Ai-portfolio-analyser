interface HoldingData {
  symbol: string;
  name: string;
  quantity: string;
  avgCost: string;
  assetClass?: string | null;
  exchange?: string | null;
}

interface HealthScoreResult {
  overall: number;
  components: {
    diversification: { score: number; max: number; factors: string[] };
    sectorBalance: { score: number; max: number; factors: string[] };
    geographicSpread: { score: number; max: number; factors: string[] };
    correlationRisk: { score: number; max: number; factors: string[] };
    costEfficiency: { score: number; max: number; factors: string[] };
    volatility: { score: number; max: number; factors: string[] };
  };
  alerts: { severity: 'info' | 'warning' | 'critical'; category: string; message: string; affectedHoldings?: string[]; recommendation?: string }[];
  lastUpdated: Date;
}

// Nifty 50 approximate sector weights
const BENCHMARK_SECTOR_WEIGHTS: Record<string, number> = {
  'Financial Services': 0.37,
  'Information Technology': 0.14,
  'Oil & Gas': 0.12,
  'Consumer Goods': 0.10,
  'Automobile': 0.05,
  'Pharma': 0.04,
  'Metals': 0.03,
  'Telecom': 0.03,
  'Construction': 0.03,
  'Others': 0.09,
};

// Simple sector classification based on common Indian stocks
const STOCK_SECTORS: Record<string, string> = {
  'HDFCBANK': 'Financial Services', 'ICICIBANK': 'Financial Services', 'KOTAKBANK': 'Financial Services',
  'SBIN': 'Financial Services', 'AXISBANK': 'Financial Services', 'BAJFINANCE': 'Financial Services',
  'BAJAJFINSV': 'Financial Services', 'HDFCLIFE': 'Financial Services', 'SBILIFE': 'Financial Services',
  'TCS': 'Information Technology', 'INFY': 'Information Technology', 'WIPRO': 'Information Technology',
  'HCLTECH': 'Information Technology', 'TECHM': 'Information Technology', 'LTIM': 'Information Technology',
  'RELIANCE': 'Oil & Gas', 'ONGC': 'Oil & Gas', 'BPCL': 'Oil & Gas', 'IOC': 'Oil & Gas',
  'HINDUNILVR': 'Consumer Goods', 'ITC': 'Consumer Goods', 'NESTLEIND': 'Consumer Goods',
  'BRITANNIA': 'Consumer Goods', 'DABUR': 'Consumer Goods', 'MARICO': 'Consumer Goods',
  'TATAMOTORS': 'Automobile', 'MARUTI': 'Automobile', 'M&M': 'Automobile', 'BAJAJ-AUTO': 'Automobile',
  'SUNPHARMA': 'Pharma', 'DRREDDY': 'Pharma', 'CIPLA': 'Pharma', 'DIVISLAB': 'Pharma',
  'TATASTEEL': 'Metals', 'JSWSTEEL': 'Metals', 'HINDALCO': 'Metals',
  'BHARTIARTL': 'Telecom', 'ADANIENT': 'Construction', 'LTTS': 'Information Technology',
  'POWERGRID': 'Power', 'NTPC': 'Power', 'TITAN': 'Consumer Goods',
  'ASIANPAINT': 'Consumer Goods', 'ULTRACEMCO': 'Construction', 'GRASIM': 'Construction',
};

function getHoldingValue(h: HoldingData): number {
  return parseFloat(h.quantity) * parseFloat(h.avgCost);
}

function getWeights(holdings: HoldingData[]): { symbol: string; weight: number }[] {
  const totalValue = holdings.reduce((sum, h) => sum + getHoldingValue(h), 0);
  if (totalValue === 0) return holdings.map(h => ({ symbol: h.symbol, weight: 0 }));
  return holdings.map(h => ({
    symbol: h.symbol,
    weight: getHoldingValue(h) / totalValue,
  }));
}

function calculateDiversificationScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 25;
  const factors: string[] = [];
  const weights = getWeights(holdings);

  if (holdings.length === 0) return { score: 0, max, factors: ['No holdings'] };
  if (holdings.length === 1) {
    factors.push('Portfolio has only 1 holding — extremely concentrated');
    return { score: 0, max, factors };
  }

  // HHI calculation
  const hhi = weights.reduce((sum, w) => sum + w.weight * w.weight, 0);
  const score = Math.round(max * (1 - hhi) * 10) / 10;
  const effectiveCount = Math.round(1 / hhi);

  factors.push(`${holdings.length} holdings with effective diversification of ${effectiveCount}`);
  factors.push(`Herfindahl-Hirschman Index: ${(hhi * 100).toFixed(1)}%`);

  // Top holding concentration
  const topWeight = Math.max(...weights.map(w => w.weight));
  const topHolding = weights.find(w => w.weight === topWeight);
  if (topWeight > 0.3) {
    factors.push(`Largest holding ${topHolding?.symbol} is ${(topWeight * 100).toFixed(1)}% — consider reducing`);
  }

  return { score: Math.min(score, max), max, factors };
}

function calculateSectorBalanceScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 20;
  const factors: string[] = [];
  const weights = getWeights(holdings);

  // Assign sectors
  const sectorWeights: Record<string, number> = {};
  let unclassified = 0;

  weights.forEach(({ symbol, weight }) => {
    const sector = STOCK_SECTORS[symbol] || 'Others';
    if (!STOCK_SECTORS[symbol]) unclassified++;
    sectorWeights[sector] = (sectorWeights[sector] || 0) + weight;
  });

  // Calculate deviation from benchmark
  const allSectors = new Set([...Object.keys(BENCHMARK_SECTOR_WEIGHTS), ...Object.keys(sectorWeights)]);
  let totalDeviation = 0;

  allSectors.forEach(sector => {
    const portfolioWeight = sectorWeights[sector] || 0;
    const benchmarkWeight = BENCHMARK_SECTOR_WEIGHTS[sector] || 0;
    const deviation = Math.abs(portfolioWeight - benchmarkWeight);
    totalDeviation += deviation;

    if (deviation > 0.1) {
      const direction = portfolioWeight > benchmarkWeight ? 'overweight' : 'underweight';
      factors.push(`${sector}: ${(portfolioWeight * 100).toFixed(1)}% (benchmark: ${(benchmarkWeight * 100).toFixed(1)}%) — ${direction}`);
    }
  });

  const score = Math.round(max * Math.max(0, 1 - totalDeviation / 0.5) * 10) / 10;

  if (Object.keys(sectorWeights).length <= 2) {
    factors.push('Portfolio spans very few sectors');
  }

  return { score: Math.min(score, max), max, factors };
}

function calculateGeographicScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 15;
  const factors: string[] = [];

  // For MVP, check for US-listed stocks or crypto
  const weights = getWeights(holdings);
  let internationalWeight = 0;

  weights.forEach(({ symbol, weight }) => {
    if (symbol.includes('.') || ['BTC', 'ETH', 'SOL', 'USDT'].includes(symbol)) {
      internationalWeight += weight;
    }
  });

  const score = Math.round(Math.min(max, internationalWeight * 50) * 10) / 10;

  if (internationalWeight === 0) {
    factors.push('No international exposure detected — consider adding global diversification');
  } else {
    factors.push(`International allocation: ${(internationalWeight * 100).toFixed(1)}%`);
  }

  factors.push('Target: 30% international for optimal diversification');

  return { score, max, factors };
}

function calculateCorrelationScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 15;
  const factors: string[] = [];

  // Simplified: estimate correlation based on sector concentration
  const weights = getWeights(holdings);
  const sectorWeights: Record<string, number> = {};

  weights.forEach(({ symbol, weight }) => {
    const sector = STOCK_SECTORS[symbol] || 'Others';
    sectorWeights[sector] = (sectorWeights[sector] || 0) + weight;
  });

  // Higher sector concentration = higher estimated correlation
  const sectorHHI = Object.values(sectorWeights).reduce((sum, w) => sum + w * w, 0);
  const estimatedCorrelation = 0.3 + 0.5 * sectorHHI; // Rough estimate

  const score = Math.round(max * (1 - Math.min(1, estimatedCorrelation)) * 10) / 10;

  factors.push(`Estimated average correlation: ${(estimatedCorrelation * 100).toFixed(0)}%`);
  if (estimatedCorrelation > 0.7) {
    factors.push('High correlation — holdings tend to move together');
  }

  return { score, max, factors };
}

function calculateCostScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 15;
  const factors: string[] = [];

  // For MVP, assume 0 expense for stocks and estimate for MFs
  const hasMutualFunds = holdings.some(h => h.assetClass === 'mutual_fund');

  if (!hasMutualFunds) {
    factors.push('No mutual funds detected — expense analysis limited to direct equity');
    return { score: max, max, factors };
  }

  // Default: good score since we can't fetch real expense ratios yet
  factors.push('Expense ratio data will be enriched with market data integration');
  return { score: 12, max, factors };
}

function calculateVolatilityScore(holdings: HoldingData[]): { score: number; max: number; factors: string[] } {
  const max = 10;
  const factors: string[] = [];

  // Simplified: estimate based on asset class mix
  const weights = getWeights(holdings);
  let estimatedBeta = 0;

  weights.forEach(({ symbol, weight }) => {
    const sector = STOCK_SECTORS[symbol];
    // Rough sector betas
    const sectorBetas: Record<string, number> = {
      'Financial Services': 1.1, 'Information Technology': 0.9, 'Oil & Gas': 1.0,
      'Consumer Goods': 0.7, 'Automobile': 1.2, 'Pharma': 0.8,
      'Metals': 1.3, 'Telecom': 0.8, 'Construction': 1.2, 'Power': 0.9,
    };
    estimatedBeta += weight * (sectorBetas[sector || ''] || 1.0);
  });

  const score = Math.round(max * Math.max(0, 1 - Math.abs(estimatedBeta - 1)) * 10) / 10;

  factors.push(`Estimated portfolio beta: ${estimatedBeta.toFixed(2)}`);
  if (estimatedBeta > 1.2) {
    factors.push('Portfolio is more volatile than the market');
  } else if (estimatedBeta < 0.8) {
    factors.push('Portfolio is less volatile than the market');
  }

  return { score, max, factors };
}

function generateAlerts(holdings: HoldingData[]): HealthScoreResult['alerts'] {
  const alerts: HealthScoreResult['alerts'] = [];
  const weights = getWeights(holdings);

  // Single holding concentration
  weights.forEach(({ symbol, weight }) => {
    if (weight > 0.3) {
      alerts.push({
        severity: 'critical',
        category: 'concentration',
        message: `${symbol} makes up ${(weight * 100).toFixed(1)}% of your portfolio`,
        affectedHoldings: [symbol],
        recommendation: 'Consider reducing position to below 20% for better diversification',
      });
    } else if (weight > 0.2) {
      alerts.push({
        severity: 'warning',
        category: 'concentration',
        message: `${symbol} is ${(weight * 100).toFixed(1)}% of your portfolio`,
        affectedHoldings: [symbol],
        recommendation: 'Monitor this position size',
      });
    }
  });

  // Few holdings
  if (holdings.length < 5) {
    alerts.push({
      severity: 'warning',
      category: 'diversification',
      message: `Only ${holdings.length} holdings — portfolio is underdiversified`,
      recommendation: 'Consider adding more holdings across different sectors',
    });
  }

  // Sector concentration
  const sectorWeights: Record<string, { weight: number; holdings: string[] }> = {};
  weights.forEach(({ symbol, weight }) => {
    const sector = STOCK_SECTORS[symbol] || 'Others';
    if (!sectorWeights[sector]) sectorWeights[sector] = { weight: 0, holdings: [] };
    sectorWeights[sector].weight += weight;
    sectorWeights[sector].holdings.push(symbol);
  });

  Object.entries(sectorWeights).forEach(([sector, { weight, holdings: sectorHoldings }]) => {
    if (weight > 0.3 && sector !== 'Others') {
      alerts.push({
        severity: weight > 0.4 ? 'critical' : 'warning',
        category: 'sector_concentration',
        message: `${(weight * 100).toFixed(1)}% concentrated in ${sector}`,
        affectedHoldings: sectorHoldings,
        recommendation: `Consider reducing ${sector} exposure and diversifying into other sectors`,
      });
    }
  });

  return alerts;
}

export const healthService = {
  calculateHealthScore(holdings: HoldingData[]): HealthScoreResult {
    const diversification = calculateDiversificationScore(holdings);
    const sectorBalance = calculateSectorBalanceScore(holdings);
    const geographicSpread = calculateGeographicScore(holdings);
    const correlationRisk = calculateCorrelationScore(holdings);
    const costEfficiency = calculateCostScore(holdings);
    const volatility = calculateVolatilityScore(holdings);

    const overall = Math.round(
      diversification.score +
      sectorBalance.score +
      geographicSpread.score +
      correlationRisk.score +
      costEfficiency.score +
      volatility.score
    );

    const alerts = generateAlerts(holdings);

    return {
      overall,
      components: { diversification, sectorBalance, geographicSpread, correlationRisk, costEfficiency, volatility },
      alerts,
      lastUpdated: new Date(),
    };
  },
};
