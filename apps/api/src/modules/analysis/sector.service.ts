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
  'Power': 0.03,
  'Others': 0.06,
};

const STOCK_SECTORS: Record<string, string> = {
  'HDFCBANK': 'Financial Services', 'ICICIBANK': 'Financial Services', 'KOTAKBANK': 'Financial Services',
  'SBIN': 'Financial Services', 'AXISBANK': 'Financial Services', 'BAJFINANCE': 'Financial Services',
  'TCS': 'Information Technology', 'INFY': 'Information Technology', 'WIPRO': 'Information Technology',
  'HCLTECH': 'Information Technology', 'TECHM': 'Information Technology',
  'RELIANCE': 'Oil & Gas', 'ONGC': 'Oil & Gas', 'BPCL': 'Oil & Gas',
  'HINDUNILVR': 'Consumer Goods', 'ITC': 'Consumer Goods', 'NESTLEIND': 'Consumer Goods',
  'BRITANNIA': 'Consumer Goods', 'TITAN': 'Consumer Goods', 'ASIANPAINT': 'Consumer Goods',
  'TATAMOTORS': 'Automobile', 'MARUTI': 'Automobile', 'M&M': 'Automobile',
  'SUNPHARMA': 'Pharma', 'DRREDDY': 'Pharma', 'CIPLA': 'Pharma',
  'TATASTEEL': 'Metals', 'JSWSTEEL': 'Metals', 'HINDALCO': 'Metals',
  'BHARTIARTL': 'Telecom', 'POWERGRID': 'Power', 'NTPC': 'Power',
};

interface HoldingData {
  symbol: string;
  name: string;
  quantity: string;
  avgCost: string;
}

export const sectorService = {
  analyzeSectors(holdings: HoldingData[], benchmark?: string) {
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.quantity) * parseFloat(h.avgCost), 0);
    if (totalValue === 0) {
      return { sectors: [], warnings: [], herfindahlIndex: 0, effectiveCount: 0 };
    }

    const sectorData: Record<string, { weight: number; holdings: string[] }> = {};

    holdings.forEach(h => {
      const value = parseFloat(h.quantity) * parseFloat(h.avgCost);
      const weight = value / totalValue;
      const sector = STOCK_SECTORS[h.symbol] || 'Others';

      if (!sectorData[sector]) sectorData[sector] = { weight: 0, holdings: [] };
      sectorData[sector].weight += weight;
      sectorData[sector].holdings.push(h.symbol);
    });

    const sectors = Object.entries(sectorData).map(([name, data]) => {
      const benchmarkWeight = BENCHMARK_SECTOR_WEIGHTS[name] || 0;
      const deviation = data.weight - benchmarkWeight;
      let risk: 'low' | 'medium' | 'high' = 'low';
      if (data.weight > 0.3) risk = 'high';
      else if (data.weight > 0.2) risk = 'medium';

      return {
        name,
        weight: Math.round(data.weight * 10000) / 100,
        benchmarkWeight: Math.round(benchmarkWeight * 10000) / 100,
        deviation: Math.round(deviation * 10000) / 100,
        holdings: data.holdings,
        risk,
      };
    }).sort((a, b) => b.weight - a.weight);

    const warnings: any[] = [];
    sectors.forEach(s => {
      if (s.deviation > 10) {
        warnings.push({
          type: 'overweight',
          sector: s.name,
          currentWeight: s.weight,
          benchmarkWeight: s.benchmarkWeight,
          recommendation: `Consider reducing ${s.name} allocation by ${s.deviation.toFixed(1)}%`,
        });
      } else if (s.deviation < -10) {
        warnings.push({
          type: 'underweight',
          sector: s.name,
          currentWeight: s.weight,
          benchmarkWeight: s.benchmarkWeight,
          recommendation: `Consider adding ${s.name} exposure`,
        });
      }
    });

    // Check for missing benchmark sectors
    Object.entries(BENCHMARK_SECTOR_WEIGHTS).forEach(([sector, weight]) => {
      if (!sectorData[sector] && weight >= 0.03) {
        warnings.push({
          type: 'missing',
          sector,
          currentWeight: 0,
          benchmarkWeight: Math.round(weight * 100),
          recommendation: `No exposure to ${sector} sector`,
        });
      }
    });

    const sectorWeights = Object.values(sectorData).map(s => s.weight);
    const hhi = sectorWeights.reduce((sum, w) => sum + w * w, 0);

    return {
      sectors,
      warnings,
      herfindahlIndex: Math.round(hhi * 10000) / 100,
      effectiveCount: hhi > 0 ? Math.round(1 / hhi) : 0,
    };
  },
};
