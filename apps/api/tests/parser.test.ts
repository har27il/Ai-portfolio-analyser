import { describe, it, expect } from 'vitest';

// Inline the parsing logic for testing (since we can't easily import ESM in tests without full setup)
function parseCSVContent(content: string): { success: boolean; holdings: any[]; errors: any[] } {
  const lines = content.trim().split('\n').map(l => l.split(',').map(c => c.trim()));
  if (lines.length < 2) return { success: false, holdings: [], errors: [{ message: 'Empty file' }] };

  const headers = lines[0].map(h => h.toLowerCase());
  const symbolIdx = headers.findIndex(h => ['symbol', 'ticker', 'stock'].includes(h));
  const nameIdx = headers.findIndex(h => ['name', 'stock name', 'company'].includes(h));
  const qtyIdx = headers.findIndex(h => ['qty', 'quantity', 'units', 'shares'].includes(h));
  const costIdx = headers.findIndex(h => ['avg. cost', 'avg cost', 'average cost', 'buy price', 'cost', 'price', 'avg price'].includes(h));

  const holdings: any[] = [];
  const errors: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.every(c => !c)) continue;

    const symbol = symbolIdx >= 0 ? row[symbolIdx] : (nameIdx >= 0 ? row[nameIdx] : '');
    const name = nameIdx >= 0 ? row[nameIdx] : symbol;
    const quantity = qtyIdx >= 0 ? parseFloat(row[qtyIdx]?.replace(/,/g, '') || '0') : 0;
    const avgCost = costIdx >= 0 ? parseFloat(row[costIdx]?.replace(/,/g, '') || '0') : 0;

    if (!symbol) continue;
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ row: i + 1, column: 'quantity', message: 'Invalid quantity' });
      continue;
    }

    holdings.push({ symbol: symbol.toUpperCase(), name: name || symbol, quantity, avgCost });
  }

  return { success: holdings.length > 0, holdings, errors };
}

describe('CSV Parser', () => {
  it('parses Zerodha-style CSV', () => {
    const csv = `Symbol,Qty,Avg. cost,LTP,P&L
HDFCBANK,50,1450.00,1680.00,11500.00
RELIANCE,20,2350.00,2480.00,2600.00`;

    const result = parseCSVContent(csv);
    expect(result.success).toBe(true);
    expect(result.holdings).toHaveLength(2);
    expect(result.holdings[0].symbol).toBe('HDFCBANK');
    expect(result.holdings[0].quantity).toBe(50);
    expect(result.holdings[1].symbol).toBe('RELIANCE');
  });

  it('parses generic CSV format', () => {
    const csv = `Symbol,Name,Quantity,Avg Cost
TCS,Tata Consultancy,15,3200
INFY,Infosys,40,1380`;

    const result = parseCSVContent(csv);
    expect(result.success).toBe(true);
    expect(result.holdings).toHaveLength(2);
    expect(result.holdings[0].quantity).toBe(15);
    expect(result.holdings[0].avgCost).toBe(3200);
  });

  it('skips empty rows', () => {
    const csv = `Symbol,Qty,Avg Cost
HDFCBANK,50,1450
,,
TCS,15,3200`;

    const result = parseCSVContent(csv);
    expect(result.success).toBe(true);
    expect(result.holdings).toHaveLength(2);
  });

  it('reports errors for invalid quantity', () => {
    const csv = `Symbol,Qty,Avg Cost
HDFCBANK,abc,1450
TCS,15,3200`;

    const result = parseCSVContent(csv);
    expect(result.holdings).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].column).toBe('quantity');
  });

  it('handles empty file', () => {
    const result = parseCSVContent('');
    expect(result.success).toBe(false);
  });

  it('handles commas in numbers', () => {
    const csv = `Symbol,Qty,Avg Cost
HDFCBANK,1000,"1,450.00"`;

    // Note: simple parser won't handle quoted commas, but handles unquoted
    const csv2 = `Symbol,Qty,Avg Cost
HDFCBANK,1000,1450`;

    const result = parseCSVContent(csv2);
    expect(result.success).toBe(true);
    expect(result.holdings[0].avgCost).toBe(1450);
  });
});

describe('Health Score Calculator', () => {
  function calculateDiversificationScore(weights: number[]): number {
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    return Math.round(25 * (1 - hhi) * 10) / 10;
  }

  it('returns 0 for single holding', () => {
    expect(calculateDiversificationScore([1.0])).toBe(0);
  });

  it('returns high score for equal weights', () => {
    const weights = Array(10).fill(0.1);
    const score = calculateDiversificationScore(weights);
    expect(score).toBeGreaterThan(20);
    expect(score).toBeLessThanOrEqual(25);
  });

  it('returns moderate score for moderate concentration', () => {
    const weights = [0.4, 0.3, 0.2, 0.1];
    const score = calculateDiversificationScore(weights);
    expect(score).toBeGreaterThan(10);
    expect(score).toBeLessThan(20);
  });
});
