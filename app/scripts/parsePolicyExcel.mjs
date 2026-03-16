import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Excel文件路径
const excelPath = join(__dirname, '..', '..', '2023年以来化债主要政策脉络梳理-202603.xlsx');
console.log('Reading policy Excel file:', excelPath);

const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Found ${data.length - 1} policy entries (excluding header)`);

// 转换Excel序列日期为YYYY-MM格式
function excelSerialToDate(serial) {
  // Excel日期从1899-12-30开始
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// 从文件/会议字符串提取文号和标题
function parseDocumentInfo(str) {
  if (!str) return { documentNumber: '', title: '' };

  // 查找文号模式：如（国办发[2023]35号）或银发[2024]134号文
  const docNumberMatch = str.match(/[（\(]?([^\）\)\r\n]+?[\]\d]+号)[）\)]?/);
  let documentNumber = '';
  let title = str.trim();

  if (docNumberMatch) {
    documentNumber = docNumberMatch[1].replace(/[（）\(\)]/g, '').trim();
    // 从标题中移除文号部分
    title = str.replace(docNumberMatch[0], '').replace(/[（）\(\)]/g, '').trim();
  }

  // 清理标题中的换行和多余空格
  title = title.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();

  return { documentNumber, title };
}

// 从发文机关文号推断发文机关
function getIssuingAuthority(docNumber) {
  if (docNumber.includes('国办发')) return '国务院办公厅';
  if (docNumber.includes('银发')) return '中国人民银行';
  if (docNumber.includes('财预')) return '财政部';
  if (docNumber.includes('发改')) return '国家发改委';
  if (docNumber.includes('证监')) return '证监会';
  if (docNumber.includes('银保监')) return '银保监会';
  return '相关部门';
}

// 从内容提取核心要点数组
function extractKeyPoints(content) {
  if (!content) return [];

  // 清理内容
  let cleanContent = content.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();

  // 尝试按编号分割：（1）、（2）、（3）等
  const points = [];
  const pointRegex = /（(\d+)）([^（]+)/g;
  let match;

  while ((match = pointRegex.exec(cleanContent)) !== null) {
    const pointText = match[2].trim().replace(/^：|^:/, '').trim();
    if (pointText) {
      points.push(pointText);
    }
  }

  // 如果没有找到编号要点，尝试按分号、句号分割
  if (points.length === 0) {
    const sentences = cleanContent.split(/[；。]/).filter(s => s.trim());
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed) points.push(trimmed);
    });
  }

  // 如果还是没有，返回整个内容作为一个要点
  if (points.length === 0 && cleanContent) {
    points.push(cleanContent);
  }

  return points.slice(0, 5); // 限制最多5个要点
}

// 推断政策类别
function inferCategory(title, content) {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (lowerTitle.includes('化债') || lowerContent.includes('化债') ||
      lowerTitle.includes('债务风险化解') || lowerContent.includes('债务风险化解')) {
    return 'guideline'; // 化债类
  }

  if (lowerTitle.includes('监管') || lowerContent.includes('监管') ||
      lowerTitle.includes('严控') || lowerContent.includes('严控') ||
      lowerTitle.includes('管理') || lowerContent.includes('管理')) {
    return 'regulation'; // 监管类
  }

  if (lowerTitle.includes('通知') || lowerContent.includes('通知')) {
    return 'notice';
  }

  if (lowerTitle.includes('意见') || lowerContent.includes('意见')) {
    return 'directive';
  }

  return 'guideline'; // 默认
}

// 推断影响程度
function inferImpactLevel(content) {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('重点省份') || lowerContent.includes('高风险') ||
      lowerContent.includes('严控') || lowerContent.includes('严禁')) {
    return 'high';
  }
  return 'medium';
}

// 提取相关省份关键词
function extractRelatedProvinces(content) {
  const provinceKeywords = ['重点省份', '高风险省份', '非重点省份', '特定地区'];
  const found = provinceKeywords.filter(keyword => content.includes(keyword));
  if (found.length > 0) {
    // 通用提示，不指定具体省份
    return ['相关重点省份'];
  }
  return [];
}

// 处理数据行（从第1行开始，第0行是表头）
const policies = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length < 3) continue;

  const excelDate = row[0];
  const documentInfo = row[1] || '';
  const content = row[2] || '';

  // 跳过空行
  if (!excelDate && !documentInfo && !content) continue;

  // 转换日期
  let dateStr;
  if (typeof excelDate === 'number') {
    dateStr = excelSerialToDate(excelDate);
  } else if (typeof excelDate === 'string') {
    // 如果是字符串格式的日期，尝试解析
    dateStr = excelDate;
  } else {
    dateStr = '2023-01'; // 默认
  }

  // 提取文号和标题
  const { documentNumber, title } = parseDocumentInfo(documentInfo);

  // 提取核心要点
  const keyPoints = extractKeyPoints(content);

  // 推断信息
  const issuingAuthority = getIssuingAuthority(documentNumber);
  const category = inferCategory(title, content);
  const impactLevel = inferImpactLevel(content);
  const relatedProvinces = extractRelatedProvinces(content);

  // 生成唯一ID
  const id = `policy-${String(i).padStart(3, '0')}`;

  policies.push({
    id,
    documentNumber: documentNumber || `政策${i}`,
    title: title || '未命名政策',
    date: dateStr,
    issuingAuthority,
    category,
    keyPoints,
    impactLevel,
    relatedProvinces: relatedProvinces.length > 0 ? relatedProvinces : undefined,
  });
}

console.log(`Processed ${policies.length} policies`);

// 生成TypeScript文件内容
const tsContent = `import type { DebtPolicy } from '@/types';

// 化债政策时间线数据 - 从Excel自动生成
// 源文件: 2023年以来化债主要政策脉络梳理-202603.xlsx
// 生成时间: ${new Date().toISOString()}

export const debtPolicies: DebtPolicy[] = [
  ${policies.map(policy => `{
    id: '${policy.id}',
    documentNumber: '${policy.documentNumber.replace(/'/g, "\\'")}',
    title: '${policy.title.replace(/'/g, "\\'")}',
    date: '${policy.date}',
    issuingAuthority: '${policy.issuingAuthority}',
    category: '${policy.category}',
    keyPoints: [
      ${policy.keyPoints.map(point => `'${point.replace(/'/g, "\\'")}'`).join(',\n      ')}
    ],
    impactLevel: '${policy.impactLevel}',
    ${policy.relatedProvinces ? `relatedProvinces: [${policy.relatedProvinces.map(p => `'${p}'`).join(', ')}],` : ''}
  }`).join(',\n  ')}
];

// 按时间排序（最新在前）
export const debtPoliciesByDate = [...debtPolicies].sort((a, b) =>
  b.date.localeCompare(a.date)
);

// 按影响程度排序
export const debtPoliciesByImpact = [...debtPolicies].sort((a, b) => {
  const impactOrder = { high: 3, medium: 2, low: 1 };
  return impactOrder[b.impactLevel] - impactOrder[a.impactLevel];
});

// 按类别筛选
export function getPoliciesByCategory(category: DebtPolicy['category']): DebtPolicy[] {
  return debtPolicies.filter(policy => policy.category === category);
}

// 按年份筛选
export function getPoliciesByYear(year: string): DebtPolicy[] {
  return debtPolicies.filter(policy => policy.date.startsWith(year));
}

// 按相关省份筛选
export function getPoliciesByProvince(province: string): DebtPolicy[] {
  return debtPolicies.filter(policy =>
    !policy.relatedProvinces || policy.relatedProvinces.includes(province)
  );
}

// 获取所有政策年份
export function getPolicyYears(): string[] {
  const years = debtPolicies.map(policy => policy.date.substring(0, 4));
  return Array.from(new Set(years)).sort();
}

// 搜索政策
export function searchPolicies(keyword: string): DebtPolicy[] {
  const lowerKeyword = keyword.toLowerCase();
  return debtPolicies.filter(policy =>
    policy.documentNumber.toLowerCase().includes(lowerKeyword) ||
    policy.title.toLowerCase().includes(lowerKeyword) ||
    policy.keyPoints.some(point => point.toLowerCase().includes(lowerKeyword))
  );
}
`;

// 写入文件
const outputPath = join(__dirname, '..', 'src', 'data', 'policyData.ts');
writeFileSync(outputPath, tsContent, 'utf-8');
console.log(`Successfully generated policy data at: ${outputPath}`);
console.log(`Total policies: ${policies.length}`);