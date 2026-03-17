export interface ProvinceDebtData {
  province: string;
  localBondBalance: number;   // 政府性债务余额（亿元）
  cityInvestDebt: number;     // 城投带息债务余额（亿元）
  totalDebt: number;          // 总债务（亿元）
  debtRatio: number;          // 政府债务率（%）- 窄口径
  adjustedDebtRatio: number;  // 调整后债务率（%）- 宽口径
  fiscalRevenue: number;      // 一般公共预算收入（亿元）
  comprehensiveFinance: number; // 综合财力（亿元）
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  // 经济数据 (2025年)
  gdp2025?: number;           // GDP总量（亿元）
  gdpGrowth2025?: number;     // GDP增速（%）
  gdpTarget2026?: string;     // 2026年GDP增速目标
  population?: number;        // 常住人口（万人）
  listedCompanies?: number;   // A股上市公司数量
  keyIndustries?: string;     // 核心产业
  leadingCompanies?: string;  // 头部上市公司
  investmentTarget2026?: string; // 2026年固定资产投资增速目标
  debtPolicy2026?: string;    // 2026年债务政策核心表述
  // 排名数据
  gdp2025Rank?: number;       // GDP全国排名
  gdpGrowth2025Rank?: number; // GDP增速全国排名
  populationRank?: number;    // 人口全国排名
  listedCompaniesRank?: number; // 上市公司数量全国排名
  adjustedDebtRatioRank?: number; // 宽口径债务率全国排名（从低到高）
  totalDebtRank?: number;     // 总债务全国排名
}

export interface NationalOverview {
  localBondBalance: number;   // 全国政府性债务余额（万亿元）
  cityInvestDebt: number;     // 全国城投带息债务余额（万亿元）
  growthRate: number;         // 债务增速（%）
  avgDebtRatio: number;       // 平均窄口径债务率（%）
  updateTime: string;         // 更新时间
}

export interface TrendData {
  year: string;
  govDebt: number;
  ctDebt: number;
}

export interface HiddenDebtData {
  year: string;
  value: number;
}

// 历史债务数据 (2019-2024)
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

// 企业数据（用于产业地图）
export interface EnterpriseData {
  province: string;
  listedCompanies: number; // A股上市公司数量
  listedCompaniesRank: number; // 上市公司数量全国排名
  keyIndustries: string; // 核心产业（逗号分隔）
  leadingCompanies: string; // 头部上市公司（逗号分隔）
  totalMarketCap?: number; // 总市值（亿元，可选）
  industryDistribution?: Record<string, number>; // 行业分布（行业名称: 企业数量）
}

// 债务政策
export interface DebtPolicy {
  id: string;
  documentNumber: string; // 文号，如"15号文"
  title: string; // 文件标题
  date: string; // 发布日期，格式"YYYY-MM"
  issuingAuthority: string; // 发文机关
  category: 'regulation' | 'guideline' | 'notice' | 'directive';
  keyPoints: string[]; // 核心内容要点（3-5条）
  impactLevel: 'high' | 'medium' | 'low'; // 影响程度
  relatedProvinces?: string[]; // 相关重点省份
}
