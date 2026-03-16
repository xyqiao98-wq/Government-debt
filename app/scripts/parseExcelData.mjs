import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = join(__dirname, '..', '..', '各省财政及债务精简版数据.xlsx');
console.log('Reading Excel file:', excelPath);

const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Data dimensions: ${data.length} rows, ${data[0] ? data[0].length : 0} columns`);

// Column headers from first row (row 0)
const headerRow = data[0];
console.log('Header row:', headerRow);

// Map column indices to meaningful names based on header row
const columnMapping = {
  province: 0, // Assuming first column is province name
  fiscalRevenue: 1, // 全省一般公共预算收入
  govFundRevenue: 2, // 政府性基金收入
  comprehensiveFinance: 3, // 综合财力
  govDebtBalance: 4, // 政府性债务余额
  localDebtLimit: 5, // 地方政府债务限额
  govDebtRatio: 6, // 测算的政府债务率 (窄口径债务率)
  cityInvestDebt: 7, // 城投带息债务余额
  adjustedDebtRatio: 8, // 调整后债务率 (宽口径债务率)
  govDebtRiskColor: 9, // 政府债务率红橙黄绿
  adjustedDebtRiskColor: 10, // 调整后债务率红橙黄绿
};

// Find year blocks
const yearBlocks = [];
for (let i = 0; i < data.length; i++) {
  if (data[i] && data[i][0] && typeof data[i][0] === 'string') {
    const val = data[i][0];
    if (val.includes('2024年') || val.includes('2023年') || val.includes('2022年') ||
        val.includes('2021年') || val.includes('2020年') || val.includes('2019年')) {
      yearBlocks.push({
        yearRow: i,
        year: val.replace('年', ''),
        startRow: i + 1, // Data starts next row
      });
    }
  }
}

console.log('Year blocks found:', yearBlocks);

// Process each year block
const yearData = {};
for (const block of yearBlocks) {
  const { year, startRow } = block;
  const yearDataItems = [];

  // Collect rows until next year block or end
  let row = startRow;
  while (row < data.length && data[row] && data[row][0] &&
         !(typeof data[row][0] === 'string' &&
           (data[row][0].includes('202') || data[row][0].includes('注：')))) {
    const rowData = data[row];
    // Check if this row is a province data row (first cell should be province name)
    if (rowData[0] && typeof rowData[0] === 'string' && rowData[0].length <= 4) {
      // Likely a province name (short Chinese name)
      const item = {
        province: rowData[columnMapping.province],
        fiscalRevenue: rowData[columnMapping.fiscalRevenue],
        govFundRevenue: rowData[columnMapping.govFundRevenue],
        comprehensiveFinance: rowData[columnMapping.comprehensiveFinance],
        govDebtBalance: rowData[columnMapping.govDebtBalance],
        localDebtLimit: rowData[columnMapping.localDebtLimit],
        govDebtRatio: rowData[columnMapping.govDebtRatio] ? rowData[columnMapping.govDebtRatio] * 100 : null, // Convert to percentage
        cityInvestDebt: rowData[columnMapping.cityInvestDebt],
        adjustedDebtRatio: rowData[columnMapping.adjustedDebtRatio] ? rowData[columnMapping.adjustedDebtRatio] * 100 : null, // Already percentage?
        govDebtRiskColor: rowData[columnMapping.govDebtRiskColor],
        adjustedDebtRiskColor: rowData[columnMapping.adjustedDebtRiskColor],
      };
      yearDataItems.push(item);
    }
    row++;
  }

  yearData[year] = yearDataItems;
  console.log(`Year ${year}: ${yearDataItems.length} provinces`);
}

// Convert to TypeScript data structure
const tsContent = `// Auto-generated from Excel: 各省财政及债务精简版数据.xlsx
// Generated on ${new Date().toISOString()}

export interface HistoricalDebtData {
  year: number;
  province: string;
  fiscalRevenue: number; // 全省一般公共预算收入（亿元）
  govFundRevenue: number; // 政府性基金收入（亿元）
  comprehensiveFinance: number; // 综合财力（亿元）
  govDebtBalance: number; // 政府性债务余额（亿元）
  localDebtLimit: number; // 地方政府债务限额（亿元）
  govDebtRatio: number; // 测算的政府债务率（窄口径债务率，%）
  cityInvestDebt: number; // 城投带息债务余额（亿元）
  adjustedDebtRatio: number; // 调整后债务率（宽口径债务率，%）
  govDebtRiskColor: string; // 政府债务率红橙黄绿
  adjustedDebtRiskColor: string; // 调整后债务率红橙黄绿
}

export const historicalDebtData: HistoricalDebtData[] = [
${Object.entries(yearData).flatMap(([year, items]) =>
  items.map(item => `  {
    year: ${parseInt(year)},
    province: '${item.province}',
    fiscalRevenue: ${item.fiscalRevenue || 0},
    govFundRevenue: ${item.govFundRevenue || 0},
    comprehensiveFinance: ${item.comprehensiveFinance || 0},
    govDebtBalance: ${item.govDebtBalance || 0},
    localDebtLimit: ${item.localDebtLimit || 0},
    govDebtRatio: ${item.govDebtRatio || 0},
    cityInvestDebt: ${item.cityInvestDebt || 0},
    adjustedDebtRatio: ${item.adjustedDebtRatio || 0},
    govDebtRiskColor: '${item.govDebtRiskColor || ''}',
    adjustedDebtRiskColor: '${item.adjustedDebtRiskColor || ''}',
  }`).join(',\n')
).join(',\n')}
];

// Helper functions
export function getHistoricalDataByYear(year: number): HistoricalDebtData[] {
  return historicalDebtData.filter(item => item.year === year);
}

export function getHistoricalDataByProvince(province: string): HistoricalDebtData[] {
  return historicalDebtData.filter(item => item.province === province);
}

export function getAvailableYears(): number[] {
  return Array.from(new Set(historicalDebtData.map(item => item.year))).sort();
}

export function getAvailableProvinces(): string[] {
  return Array.from(new Set(historicalDebtData.map(item => item.province))).sort();
}
`;

// Write to src/data/historicalDebtData.ts
const outputPath = join(__dirname, '..', 'src', 'data', 'historicalDebtData.ts');
writeFileSync(outputPath, tsContent, 'utf-8');
console.log(`Generated historical data at: ${outputPath}`);

// Also generate a summary JSON for inspection
const summary = {
  generatedAt: new Date().toISOString(),
  years: Object.keys(yearData),
  provinceCount: Object.values(yearData)[0]?.length || 0,
  totalRecords: Object.values(yearData).reduce((sum, items) => sum + items.length, 0),
};
console.log('Summary:', summary);