import type { DebtPolicy } from '@/types';

// 化债政策时间线数据 - 从Excel自动生成
// 源文件: 2023年以来化债主要政策脉络梳理-202603.xlsx
// 生成时间: 2026-03-13T02:09:33.467Z

export const debtPolicies: DebtPolicy[] = [
  {
    id: 'policy-001',
    documentNumber: '国办发[2023]35号',
    title: '《关于金融支持融资平台债务风险化解的指导意见》',
    date: '2023-09',
    issuingAuthority: '国务院办公厅',
    category: 'guideline',
    keyPoints: [
      '支持地方化债：支持重点省份融资平台今明两年债务存量化解，明确城投标债至少在2025年以前不出现兑付风险',
      '差异化管理债务融资：严控城投债务新增，按照地方融资平台名单（“3899名单”）分类管理'
    ],
    impactLevel: 'high',
  },
  {
    id: 'policy-002',
    documentNumber: '国办发[2023]47号',
    title: '《国务院办公厅关于印发《重点省份分类加强政府投资项目管理办法（试行）》的通知》',
    date: '2023-12',
    issuingAuthority: '国务院办公厅',
    category: 'regulation',
    keyPoints: [
      '严控高风险省份新增基建项目：总投资完成率低于50%的大部分项目要缓建或停建（尤其低于30%）'
    ],
    impactLevel: 'high',
  },
  {
    id: 'policy-003',
    documentNumber: '国办发[2024]14号',
    title: '《关于进一步统筹做好地方债务风险防范化解工作的通知》',
    date: '2024-02',
    issuingAuthority: '国务院办公厅',
    category: 'notice',
    keyPoints: [
      '拓展重点化债区域至非重点省份部分地区：非重点省份可自主上报地区，获批后参照重点省份的相关政策化债'
    ],
    impactLevel: 'medium',
  },
  {
    id: 'policy-004',
    documentNumber: '银发[2024]134号',
    title: '《优化金融支持地方政府平台债务风险化解的通知》',
    date: '2024-07',
    issuingAuthority: '中国人民银行',
    category: 'notice',
    keyPoints: [
      '延期化债支持至2027年6月，支持双非债务、境外债的置换',
      '城投退平台后，地方政府对该主体要做至少1年的风险监测'
    ],
    impactLevel: 'medium',
  },
  {
    id: 'policy-005',
    documentNumber: '银发[2024]150号',
    title: '《中国人民银行等四部委关于规范退出融资平台公司的通知》',
    date: '2024-08',
    issuingAuthority: '中国人民银行',
    category: 'notice',
    keyPoints: [
      '退出平台名单不晚于2027年6月末；',
      '退出平台名单应征得2/3债权人同意，不同意退出者应出具证据，由地方政府出具判定意见'
    ],
    impactLevel: 'medium',
  },
  {
    id: 'policy-006',
    documentNumber: '人大常委会新闻发布会',
    title: '人大常委会新闻发布会',
    date: '2024-11',
    issuingAuthority: '全国人大常委会',
    category: 'guideline',
    keyPoints: [
      '一次性增加6万亿元地方政府债务限额置换存量隐性债务',
      '从2024年开始，将连续5年每年从新增地方政府专项债券中安排8000亿元，专门用于化债，共计4万亿元',
      '2029年及以后到期的棚户区改造隐性债务2万亿元，仍按原合同偿还'
    ],
    impactLevel: 'high',
  },
  {
    id: 'policy-007',
    documentNumber: '银发[2024]226号',
    title: '《中国人民银行金融监管总局中国证监会关于严肃化债纪律做好金融支持融资平台债务风险化解的通知》',
    date: '2024-12',
    issuingAuthority: '中国人民银行',
    category: 'notice',
    keyPoints: [
      '严肃化债纪律',
      '促进金融机构积极参与非标债务的化解，加快非标置换。对退平台企业一视同仁提供融资，但不能依据政府信用，“打破城投信仰”'
    ],
    impactLevel: 'medium',
  },
  {
    id: 'policy-008',
    documentNumber: '国办发[2025]40号',
    title: '《国务院办公厅关于推动地方政府融资平台改革转型的指导意见》',
    date: '2025-11',
    issuingAuthority: '国务院办公厅',
    category: 'guideline',
    keyPoints: [
      '引导融资平台转型指导意见，无法在27年6月前完成隐债清零的地区可成立市级托管企业承接隐债、不承担经营活动，进一步强调债务化解工作'
    ],
    impactLevel: 'medium',
  }
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
