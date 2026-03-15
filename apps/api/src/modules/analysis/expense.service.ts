// Sample expense ratios for common funds
const EXPENSE_DATA: Record<string, { expenseRatio: number; category: string; categoryAverage: number }> = {
  'HDFCTOP100': { expenseRatio: 1.62, category: 'Large Cap', categoryAverage: 1.5 },
  'ABORALFUND': { expenseRatio: 0.95, category: 'Flexi Cap', categoryAverage: 1.2 },
  'ABORSMALLCAP': { expenseRatio: 1.78, category: 'Small Cap', categoryAverage: 1.8 },
  'PPFAS': { expenseRatio: 0.72, category: 'Flexi Cap', categoryAverage: 1.2 },
  'MOTILALMIDCAP': { expenseRatio: 0.58, category: 'Mid Cap', categoryAverage: 1.4 },
  'ABORELSS': { expenseRatio: 1.04, category: 'ELSS', categoryAverage: 1.3 },
  'NIFTYBEES': { expenseRatio: 0.04, category: 'Index ETF', categoryAverage: 0.1 },
  'UTINIFTY': { expenseRatio: 0.17, category: 'Index Fund', categoryAverage: 0.2 },
};

// Alternative fund suggestions
const ALTERNATIVES: Record<string, { fund: string; er: number }> = {
  'Large Cap': { fund: 'Nifty 50 Index Fund', er: 0.2 },
  'Flexi Cap': { fund: 'Parag Parikh Flexi Cap (Direct)', er: 0.63 },
  'Small Cap': { fund: 'Nippon Small Cap (Direct)', er: 0.87 },
  'Mid Cap': { fund: 'Motilal Oswal Midcap (Direct)', er: 0.58 },
  'ELSS': { fund: 'Quant ELSS (Direct)', er: 0.57 },
};

function rateExpenseRatio(er: number): 'excellent' | 'good' | 'average' | 'high' | 'very_high' {
  if (er < 0.5) return 'excellent';
  if (er < 1.0) return 'good';
  if (er < 1.5) return 'average';
  if (er < 2.0) return 'high';
  return 'very_high';
}

interface HoldingData {
  symbol: string;
  name: string;
  quantity: string;
  avgCost: string;
  assetClass?: string | null;
}

export const expenseService = {
  auditExpenses(holdings: HoldingData[]) {
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.quantity) * parseFloat(h.avgCost), 0);

    const auditedHoldings = holdings
      .filter(h => EXPENSE_DATA[h.symbol] || h.assetClass === 'mutual_fund')
      .map(h => {
        const data = EXPENSE_DATA[h.symbol] || { expenseRatio: 1.0, category: 'Unknown', categoryAverage: 1.0 };
        return {
          name: h.name,
          symbol: h.symbol,
          expenseRatio: data.expenseRatio,
          category: data.category,
          categoryAverage: data.categoryAverage,
          rating: rateExpenseRatio(data.expenseRatio),
        };
      });

    // Calculate WAER
    let waer = 0;
    holdings.forEach(h => {
      const value = parseFloat(h.quantity) * parseFloat(h.avgCost);
      const weight = totalValue > 0 ? value / totalValue : 0;
      const data = EXPENSE_DATA[h.symbol];
      if (data) {
        waer += weight * data.expenseRatio;
      }
    });

    const annualCostImpact = totalValue * (waer / 100);

    // Generate recommendations
    const recommendations = auditedHoldings
      .filter(h => h.rating === 'high' || h.rating === 'very_high')
      .map(h => {
        const alt = ALTERNATIVES[h.category];
        if (!alt) return null;
        const holdingValue = holdings.find(hd => hd.symbol === h.symbol);
        const value = holdingValue ? parseFloat(holdingValue.quantity) * parseFloat(holdingValue.avgCost) : 0;
        return {
          fund: h.name,
          currentER: h.expenseRatio,
          alternativeFund: alt.fund,
          alternativeER: alt.er,
          potentialSavings: Math.round(value * (h.expenseRatio - alt.er) / 100),
        };
      })
      .filter(Boolean);

    return {
      holdings: auditedHoldings,
      portfolioWAER: Math.round(waer * 100) / 100,
      annualCostImpact: Math.round(annualCostImpact),
      recommendations,
    };
  },
};
