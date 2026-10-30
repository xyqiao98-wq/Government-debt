import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { extractCityDebt, sourceName as debtSourceName } from './build-debt-data.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, '..');
const projectDir = path.resolve(appDir, '..');

const provinceAliases = {
  北京市: '北京', 天津市: '天津', 上海市: '上海', 重庆市: '重庆',
  内蒙古自治区: '内蒙古', 广西壮族自治区: '广西', 西藏自治区: '西藏',
  宁夏回族自治区: '宁夏', 新疆维吾尔自治区: '新疆',
};

const hubeiDirect = new Set(['仙桃市', '潜江市', '天门市', '神农架林区']);
const xinjiangCorps = new Set([
  '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市',
  '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市',
]);
const hainanPrefecture = new Set(['海口市', '三亚市', '三沙市', '儋州市']);

export function normalizeProvince(value) {
  const name = String(value ?? '').trim();
  if (provinceAliases[name]) return provinceAliases[name];
  return name.replace(/省$/, '').replace(/市$/, '');
}

export function classifyRegion(province, city) {
  if (city === '兵团') return 'corps';
  if (xinjiangCorps.has(city)) return 'corps_city';
  if (hubeiDirect.has(city)) return 'province_direct_county';
  if (province === '海南' && !hainanPrefecture.has(city)) return 'province_direct_county';
  if (city.endsWith('自治州')) return 'autonomous_prefecture';
  if (city.endsWith('地区')) return 'prefecture';
  if (city.endsWith('盟')) return 'league';
  if (city.endsWith('林区')) return 'forest_district';
  if (city.endsWith('县')) return 'county';
  return 'prefecture_city';
}

export function normalizeValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const cleaned = value.trim().replaceAll(',', '').replace('%', '');
    if (!cleaned || cleaned === '-' || cleaned === '—' || cleaned === '–') return null;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed) || parsed === 0) return null;
    return parsed;
  }
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0 ? value : null;
  return null;
}

export function parseYear(value) {
  const match = String(value ?? '').match(/20\d{2}/);
  return match ? Number(match[0]) : null;
}

export function normalizeMetric(value) {
  const text = String(value ?? '').replace(/^20\d{2}年?/, '').replaceAll(' ', '');
  if (text === 'GDP(亿元)') return 'gdp';
  if (text.includes('一般公共预算收入') || text === '一般预算收入') return 'generalBudgetRevenue';
  if (text === '政府性基金收入') return 'governmentFundRevenue';
  if (text.includes('综合财力') && !text.includes('简化版')) return 'comprehensiveFinance';
  if (text === '简化版综合财力') return 'comprehensiveFinance';
  if (text.includes('地方政府债务余额')) return 'governmentDebt';
  if (text.includes('城投债务余额')) return 'cityInvestmentDebt';
  if (text === '债务率') return 'debtRatio';
  if (text === '调整后债务率') return 'adjustedDebtRatio';
  return null;
}

function findWorkbook(explicitPath) {
  const candidates = [];
  if (explicitPath) candidates.push(path.resolve(explicitPath));
  if (process.env.CITY_DATA_WORKBOOK) candidates.push(path.resolve(process.env.CITY_DATA_WORKBOOK));
  candidates.push(path.join(projectDir, '【华泰固收】2019-2024省地县经济财政债务数据库.xlsx'));

  const rawRoot = path.join(projectDir, 'data', 'raw');
  if (fs.existsSync(rawRoot)) {
    const visit = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) visit(fullPath);
        else if (/\.xlsx$/i.test(entry.name) && !entry.name.startsWith('~$')) candidates.push(fullPath);
      }
    };
    visit(rawRoot);
  }

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error('未找到地市数据库 Excel。请将文件放入 data/raw/<年份>/ 或传入文件路径。');
  return found;
}

function sheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`工作簿缺少工作表：${sheetName}`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
}

function discoverColumns(rows) {
  const yearRow = rows[0] ?? [];
  const metricRow = rows[1] ?? [];
  let activeYear = null;
  return metricRow.map((metric, index) => {
    const candidateYear = parseYear(yearRow[index]);
    if (candidateYear) activeYear = candidateYear;
    return { index, year: activeYear, metric: normalizeMetric(metric) };
  }).filter((column) => column.year && column.metric);
}

function extractSheet(rows, sourceName) {
  const columns = discoverColumns(rows);
  const records = new Map();
  const duplicates = [];
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const province = normalizeProvince(row[0]);
    const city = String(row[1] ?? '').trim();
    if (!province || !city) continue;
    const regionKey = `${province}-${city}`;
    for (const column of columns) {
      const key = `${column.year}|${regionKey}`;
      const record = records.get(key) ?? {
        year: column.year,
        regionKey,
        province,
        city,
        regionType: classifyRegion(province, city),
        sourceSheets: [],
      };
      if (!record.sourceSheets.includes(sourceName)) record.sourceSheets.push(sourceName);
      const value = normalizeValue(row[column.index]);
      if (record[column.metric] !== undefined && record[column.metric] !== value) {
        duplicates.push({ key, metric: column.metric, row: rowIndex + 1 });
      }
      record[column.metric] = value;
      records.set(key, record);
    }
  }
  return { records, duplicates };
}

function mergeRecords(...collections) {
  const merged = new Map();
  for (const collection of collections) {
    for (const [key, incoming] of collection.entries()) {
      const current = merged.get(key) ?? {};
      const sources = [...new Set([...(current.sourceSheets ?? []), ...(incoming.sourceSheets ?? [])])];
      merged.set(key, { ...current, ...incoming, sourceSheets: sources });
    }
  }
  return merged;
}

function round(value, digits = 2) {
  if (value === null || value === undefined) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function publicRecord(record) {
  const metrics = {
    gdp: round(record.gdp),
    generalBudgetRevenue: round(record.generalBudgetRevenue),
    governmentFundRevenue: round(record.governmentFundRevenue),
    comprehensiveFinance: round(record.comprehensiveFinance),
    governmentDebt: round(record.governmentDebt),
    cityInvestmentDebt: round(record.cityInvestmentDebt),
    debtRatio: record.comprehensiveFinance > 0 && record.governmentDebt !== null && record.governmentDebt !== undefined
      ? round(record.governmentDebt / record.comprehensiveFinance * 100, 4) : null,
    adjustedDebtRatio: record.comprehensiveFinance > 0 && record.governmentDebt !== null && record.governmentDebt !== undefined && record.cityInvestmentDebt !== null && record.cityInvestmentDebt !== undefined
      ? round((record.governmentDebt + record.cityInvestmentDebt) / record.comprehensiveFinance * 100, 4) : null,
  };
  const available = ['gdp', 'generalBudgetRevenue', 'governmentFundRevenue'].filter((key) => metrics[key] !== null);
  return {
    year: record.year,
    regionKey: record.regionKey,
    province: record.province,
    city: record.city,
    regionType: record.regionType,
    ...metrics,
    completeness: available.length,
    sourceSheets: record.sourceSheets,
  };
}

export function buildData(workbookPath, debtWorkbookPath = path.join(projectDir, debtSourceName)) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const economySheet = '2019-2024地市经济数据';
  const fiscalSheet = '2019-2024地级单位综合财力与债务率';
  const economy = extractSheet(sheetRows(workbook, economySheet), economySheet);
  const fiscal = extractSheet(sheetRows(workbook, fiscalSheet), fiscalSheet);
  const merged = mergeRecords(economy.records, fiscal.records);
  if (fs.existsSync(debtWorkbookPath)) {
    const cityDebts = extractCityDebt(XLSX.readFile(debtWorkbookPath));
    // Match by province AND city; provincial platforms are never allocated to cities.
    const normalized = new Map([...cityDebts].map(([key, value]) => {
      const [year, province, city] = key.split('|');
      return [`${year}|${normalizeProvince(province)}-${city}`, value];
    }));
    for (const [key, record] of merged) {
      if (normalized.has(key)) {
        record.cityInvestmentDebt = normalized.get(key);
        record.sourceSheets.push(`${debtSourceName} / 统计（地市）`);
      } else {
        // No matched row is missing data, not zero debt or the obsolete estimate.
        record.cityInvestmentDebt = null;
      }
    }
  }
  const records = [...merged.values()].map(publicRecord).sort((a, b) =>
    a.year - b.year || a.province.localeCompare(b.province, 'zh-CN') || a.city.localeCompare(b.city, 'zh-CN'));
  return { records, duplicates: [...economy.duplicates, ...fiscal.duplicates] };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main() {
  const workbookPath = findWorkbook(process.argv[2]);
  const { records, duplicates } = buildData(workbookPath);
  const years = [...new Set(records.map((record) => record.year))].sort();
  const publicRoot = path.join(appDir, 'public', 'data');
  const report = { sourceWorkbook: path.basename(workbookPath), years: {}, duplicates };

  for (const year of years) {
    const yearRecords = records.filter((record) => record.year === year);
    const metricCoverage = {};
    for (const metric of ['gdp', 'generalBudgetRevenue', 'governmentFundRevenue']) {
      metricCoverage[metric] = yearRecords.filter((record) => record[metric] !== null).length;
    }
    const completeCore = yearRecords.filter((record) => record.completeness === 3).length;
    report.years[year] = { records: yearRecords.length, completeCore, metricCoverage };
    writeJson(path.join(publicRoot, 'cities', `${year}.json`), yearRecords);
  }

  const metadata = {
    years,
    defaultYear: years.at(-1),
    sourceWorkbook: `${path.basename(workbookPath)}；${debtSourceName}（同年末城投债务）`,
    metrics: [
      { key: 'gdp', label: 'GDP', unit: '亿元' },
      { key: 'generalBudgetRevenue', label: '一般公共预算收入', unit: '亿元' },
      { key: 'governmentFundRevenue', label: '政府性基金收入', unit: '亿元' },
      { key: 'governmentDebt', label: '地方政府债务余额', unit: '亿元' },
      { key: 'cityInvestmentDebt', label: '城投债务余额', unit: '亿元' },
      { key: 'debtRatio', label: '窄口径债务率', unit: '%' },
      { key: 'adjustedDebtRatio', label: '宽口径债务率', unit: '%' },
    ],
    coverage: report.years,
  };
  writeJson(path.join(publicRoot, 'metadata.json'), metadata);
  writeJson(path.join(projectDir, 'data', 'generated', 'validation-report.json'), report);
  console.log(`已生成 ${years.join('、')} 年地市数据，共 ${records.length} 条年度记录。`);
  console.log(`校验报告：${path.relative(projectDir, path.join(projectDir, 'data', 'generated', 'validation-report.json'))}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
