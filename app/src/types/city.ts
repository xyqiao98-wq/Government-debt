export type CityMetricKey =
  | 'gdp'
  | 'generalBudgetRevenue'
  | 'governmentFundRevenue'
  | 'governmentDebt'
  | 'cityInvestmentDebt'
  | 'debtRatio'
  | 'adjustedDebtRatio';

export interface CityMetricDefinition {
  key: CityMetricKey;
  label: string;
  unit: string;
}

export interface CityRecord {
  year: number;
  regionKey: string;
  province: string;
  city: string;
  regionType: string;
  gdp: number | null;
  generalBudgetRevenue: number | null;
  governmentFundRevenue: number | null;
  comprehensiveFinance: number | null;
  governmentDebt: number | null;
  cityInvestmentDebt: number | null;
  debtRatio: number | null;
  adjustedDebtRatio: number | null;
  completeness: number;
  sourceSheets: string[];
}

export interface CityCoverage {
  records: number;
  completeCore: number;
  metricCoverage: Record<'gdp' | 'generalBudgetRevenue' | 'governmentFundRevenue', number>;
}

export interface CityMetadata {
  years: number[];
  defaultYear: number;
  sourceWorkbook: string;
  metrics: CityMetricDefinition[];
  coverage: Record<string, CityCoverage>;
}
