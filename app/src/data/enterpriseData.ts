import { provinceDebtData } from './debtData';
import type { EnterpriseData } from '@/types';

// 扩展企业数据：添加市值估算（基于简单启发式规则）
// 注意：市值数据为估算值，实际数据可能需要从其他来源获取
const estimateMarketCap = (_province: string, listedCompanies: number): number | undefined => {
  // 简单估算：假设每家公司平均市值
  // 这是一个占位符，实际应使用真实数据
  const avgMarketCapPerCompany = 150; // 亿元/家（粗略估算）
  return listedCompanies * avgMarketCapPerCompany;
};

// 解析行业分布（从keyIndustries字符串中提取）
const parseIndustryDistribution = (keyIndustries: string = ''): Record<string, number> => {
  // keyIndustries格式示例："高端装备、半导体、生物医药、新能源"
  const industries = keyIndustries.split('、').filter(i => i.trim());
  const distribution: Record<string, number> = {};
  if (industries.length > 0) {
    // 简单分配：假设每个行业企业数量均匀分布
    const avgCount = 100 / industries.length; // 百分比
    industries.forEach(industry => {
      distribution[industry] = avgCount;
    });
  }
  return distribution;
};

export const enterpriseData: EnterpriseData[] = provinceDebtData.map(province => {
  const listedCompanies = province.listedCompanies || 0;
  return {
    province: province.province,
    listedCompanies,
    listedCompaniesRank: province.listedCompaniesRank || 0,
    keyIndustries: province.keyIndustries || '',
    leadingCompanies: province.leadingCompanies || '',
    totalMarketCap: estimateMarketCap(province.province, listedCompanies),
    industryDistribution: parseIndustryDistribution(province.keyIndustries),
  };
});

// 按上市公司数量排序
export const enterpriseDataByCompanies = [...enterpriseData].sort(
  (a, b) => b.listedCompanies - a.listedCompanies
);

// 按市值排序（估算）
export const enterpriseDataByMarketCap = [...enterpriseData].sort(
  (a, b) => (b.totalMarketCap || 0) - (a.totalMarketCap || 0)
);

// 按省份获取
export function getEnterpriseDataByProvince(province: string): EnterpriseData | undefined {
  return enterpriseData.find(item => item.province === province);
}

// 获取Top N省份
export function getTopProvincesByCompanies(n: number = 10): EnterpriseData[] {
  return enterpriseDataByCompanies.slice(0, n);
}

// 获取行业分布汇总
export function getIndustryDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  enterpriseData.forEach(item => {
    if (item.keyIndustries) {
      const industries = item.keyIndustries.split('、');
      industries.forEach(industry => {
        if (industry.trim()) {
          distribution[industry.trim()] = (distribution[industry.trim()] || 0) + 1;
        }
      });
    }
  });
  return distribution;
}