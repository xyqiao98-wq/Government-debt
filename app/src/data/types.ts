// 重新导出类型定义
export type { HistoricalDebtData } from '@/types';
export type { EnterpriseData } from '@/types';
export type { DebtPolicy } from '@/types';
export type { ProvinceDebtData, NationalOverview } from '@/types';

// 数据查询相关类型
export interface YearRange {
  startYear: number;
  endYear: number;
}

export interface ProvinceFilter {
  provinces: string[];
}

export interface MetricOption {
  value: string;
  label: string;
  unit: string;
  color: string;
}