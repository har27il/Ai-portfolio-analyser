// Simulated MF holdings for demo purposes
// In production, this would come from AMFI API or fund house data
const SAMPLE_MF_HOLDINGS: Record<string, Record<string, number>> = {
  'HDFCTOP100': {
    'HDFCBANK': 0.09, 'ICICIBANK': 0.08, 'RELIANCE': 0.07, 'INFY': 0.06,
    'TCS': 0.05, 'SBIN': 0.04, 'BHARTIARTL': 0.04, 'HINDUNILVR': 0.04,
    'ITC': 0.03, 'KOTAKBANK': 0.03, 'AXISBANK': 0.03, 'BAJFINANCE': 0.03,
  },
  'ABORALFUND': {
    'HDFCBANK': 0.08, 'RELIANCE': 0.07, 'ICICIBANK': 0.06, 'INFY': 0.05,
    'TCS': 0.05, 'SBIN': 0.04, 'HINDUNILVR': 0.04, 'BHARTIARTL': 0.03,
    'TATAMOTORS': 0.03, 'SUNPHARMA': 0.03, 'KOTAKBANK': 0.03, 'M&M': 0.02,
  },
  'ABORSMALLCAP': {
    'POLYCAB': 0.03, 'PERSISTENT': 0.03, 'COFORGE': 0.02, 'TRENT': 0.02,
    'SUPREMEIND': 0.02, 'APLAPOLLO': 0.02, 'SONACOMS': 0.02, 'KALYANKJIL': 0.02,
  },
};

interface HoldingData {
  symbol: string;
  name: string;
  quantity: string;
  avgCost: string;
  assetClass?: string | null;
}

export const overlapService = {
  analyzeOverlap(holdings: HoldingData[]) {
    const mutualFunds = holdings.filter(h => h.assetClass === 'mutual_fund');

    if (mutualFunds.length < 2) {
      return {
        pairwiseOverlap: [],
        overlapMatrix: { funds: [], matrix: [] },
        portfolioOverlapScore: 0,
        recommendations: [{
          severity: 'info' as const,
          message: mutualFunds.length === 0
            ? 'No mutual funds found in portfolio'
            : 'Need at least 2 mutual funds to analyze overlap',
          affectedFunds: [],
          suggestedAction: 'Add mutual funds to your portfolio to see overlap analysis',
        }],
      };
    }

    const fundSymbols = mutualFunds.map(f => f.symbol);
    const pairwiseOverlap: any[] = [];
    const n = fundSymbols.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    // Calculate pairwise overlap
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 100;
      for (let j = i + 1; j < n; j++) {
        const holdingsA = SAMPLE_MF_HOLDINGS[fundSymbols[i]] || {};
        const holdingsB = SAMPLE_MF_HOLDINGS[fundSymbols[j]] || {};

        const allStocks = new Set([...Object.keys(holdingsA), ...Object.keys(holdingsB)]);
        let overlapPercent = 0;
        const commonStocks: any[] = [];

        allStocks.forEach(stock => {
          const wA = holdingsA[stock] || 0;
          const wB = holdingsB[stock] || 0;
          if (wA > 0 && wB > 0) {
            overlapPercent += Math.min(wA, wB);
            commonStocks.push({
              symbol: stock,
              name: stock,
              weightInFund1: Math.round(wA * 10000) / 100,
              weightInFund2: Math.round(wB * 10000) / 100,
            });
          }
        });

        overlapPercent = Math.round(overlapPercent * 10000) / 100;
        matrix[i][j] = overlapPercent;
        matrix[j][i] = overlapPercent;

        pairwiseOverlap.push({
          fund1: { symbol: fundSymbols[i], name: mutualFunds[i].name },
          fund2: { symbol: fundSymbols[j], name: mutualFunds[j].name },
          overlapPercent,
          commonStocksCount: commonStocks.length,
          commonStocks: commonStocks.sort((a, b) => b.weightInFund1 - a.weightInFund1),
        });
      }
    }

    // Generate recommendations
    const recommendations: any[] = [];
    pairwiseOverlap.forEach(pair => {
      if (pair.overlapPercent > 70) {
        recommendations.push({
          severity: 'critical',
          message: `${pair.fund1.name} and ${pair.fund2.name} have ${pair.overlapPercent}% overlap — nearly identical`,
          affectedFunds: [pair.fund1.symbol, pair.fund2.symbol],
          suggestedAction: 'Consider replacing one fund with a different category',
        });
      } else if (pair.overlapPercent > 40) {
        recommendations.push({
          severity: 'warning',
          message: `${pair.fund1.name} and ${pair.fund2.name} have ${pair.overlapPercent}% overlap`,
          affectedFunds: [pair.fund1.symbol, pair.fund2.symbol],
          suggestedAction: 'Monitor overlap and consider if both funds are needed',
        });
      }
    });

    const avgOverlap = pairwiseOverlap.length > 0
      ? pairwiseOverlap.reduce((sum, p) => sum + p.overlapPercent, 0) / pairwiseOverlap.length
      : 0;

    return {
      pairwiseOverlap,
      overlapMatrix: { funds: fundSymbols, matrix },
      portfolioOverlapScore: Math.round(avgOverlap * 100) / 100,
      recommendations,
    };
  },
};
