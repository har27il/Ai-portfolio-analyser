import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  assetClass?: string;
  broker?: string;
}

interface ParseResult {
  success: boolean;
  holdings: ParsedHolding[];
  errors: { row: number; column: string; value: string; message: string }[];
  warnings: { type: string; symbol?: string; message: string; suggestion?: string }[];
}

// Column name mappings for different brokers
const COLUMN_MAPS: Record<string, Record<string, string>> = {
  zerodha: {
    'symbol': 'symbol', 'instrument': 'symbol',
    'qty': 'quantity', 'quantity': 'quantity',
    'avg. cost': 'avgCost', 'avg cost': 'avgCost', 'average price': 'avgCost',
    'ltp': 'currentPrice',
  },
  groww: {
    'stock name': 'name', 'scheme name': 'name', 'company name': 'name',
    'symbol': 'symbol',
    'quantity': 'quantity', 'units': 'quantity',
    'avg. buy price': 'avgCost', 'avg price': 'avgCost', 'avg buy price': 'avgCost', 'avg nav': 'avgCost',
    'current price': 'currentPrice', 'current nav': 'currentPrice',
  },
  generic: {
    'symbol': 'symbol', 'ticker': 'symbol', 'stock': 'symbol', 'name': 'name',
    'stock name': 'name', 'company': 'name', 'scheme name': 'name', 'scheme': 'name',
    'quantity': 'quantity', 'qty': 'quantity', 'units': 'quantity', 'shares': 'quantity',
    'avg cost': 'avgCost', 'avg. cost': 'avgCost', 'average cost': 'avgCost',
    'buy price': 'avgCost', 'cost': 'avgCost', 'price': 'avgCost',
    'avg price': 'avgCost', 'average price': 'avgCost',
    'current price': 'currentPrice', 'ltp': 'currentPrice', 'cmp': 'currentPrice',
  },
};

function detectBroker(headers: string[]): string {
  const headerStr = headers.join(',').toLowerCase();
  if (headerStr.includes('avg. cost') && headerStr.includes('ltp')) return 'zerodha';
  if (headerStr.includes('stock name') || headerStr.includes('avg. buy price')) return 'groww';
  return 'generic';
}

function mapColumns(headers: string[], broker: string): Record<number, string> {
  const mapping = COLUMN_MAPS[broker] || COLUMN_MAPS.generic;
  const columnMap: Record<number, string> = {};

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    if (mapping[normalized]) {
      columnMap[index] = mapping[normalized];
    }
  });

  return columnMap;
}

function parseCSV(content: string, broker?: string): ParseResult {
  const errors: ParseResult['errors'] = [];
  const warnings: ParseResult['warnings'] = [];
  const holdings: ParsedHolding[] = [];

  const parsed = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.data.length < 2) {
    return { success: false, holdings: [], errors: [{ row: 0, column: '', value: '', message: 'File appears empty or has no data rows' }], warnings: [] };
  }

  const headers = (parsed.data[0] as string[]).map(h => String(h).trim());
  const detectedBroker = broker || detectBroker(headers);
  const columnMap = mapColumns(headers, detectedBroker);

  // Check required columns
  const mappedFields = Object.values(columnMap);
  const hasSymbolOrName = mappedFields.includes('symbol') || mappedFields.includes('name');
  const hasQuantity = mappedFields.includes('quantity');
  const hasCost = mappedFields.includes('avgCost');

  if (!hasSymbolOrName) {
    return { success: false, holdings: [], errors: [{ row: 0, column: 'symbol', value: '', message: 'Could not identify symbol/name column' }], warnings: [] };
  }

  for (let i = 1; i < parsed.data.length; i++) {
    const row = parsed.data[i] as string[];
    if (!row || row.every(cell => !cell || !String(cell).trim())) continue;

    const mapped: Record<string, string> = {};
    Object.entries(columnMap).forEach(([colIndex, field]) => {
      mapped[field] = String(row[Number(colIndex)] || '').trim();
    });

    const symbol = mapped.symbol || mapped.name || '';
    const name = mapped.name || mapped.symbol || '';
    const quantityStr = (mapped.quantity || '0').replace(/,/g, '');
    const avgCostStr = (mapped.avgCost || '0').replace(/,/g, '');

    const quantity = parseFloat(quantityStr);
    const avgCost = parseFloat(avgCostStr);

    if (!symbol && !name) {
      warnings.push({ type: 'empty_row', message: `Row ${i + 1}: Empty symbol/name, skipped` });
      continue;
    }

    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ row: i + 1, column: 'quantity', value: quantityStr, message: 'Invalid or missing quantity' });
      continue;
    }

    if (isNaN(avgCost) || avgCost < 0) {
      errors.push({ row: i + 1, column: 'avgCost', value: avgCostStr, message: 'Invalid cost value' });
      continue;
    }

    holdings.push({
      symbol: symbol.toUpperCase(),
      name: name || symbol,
      quantity,
      avgCost: avgCost || 0,
      broker: detectedBroker,
    });
  }

  return { success: holdings.length > 0, holdings, errors, warnings };
}

function parseExcel(buffer: Buffer, broker?: string): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const csvContent = XLSX.utils.sheet_to_csv(sheet);
  return parseCSV(csvContent, broker);
}

export async function parsePortfolioFile(buffer: Buffer, filename: string, broker?: string): Promise<ParseResult> {
  const ext = filename.toLowerCase().split('.').pop();

  if (ext === 'csv') {
    const content = buffer.toString('utf-8');
    return parseCSV(content, broker);
  }

  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(buffer, broker);
  }

  return {
    success: false,
    holdings: [],
    errors: [{ row: 0, column: '', value: filename, message: `Unsupported file format: ${ext}` }],
    warnings: [],
  };
}
