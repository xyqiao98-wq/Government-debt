import { cityInvestmentDebtByPeriod } from './cityInvestmentDebt.ts';
import { fiscal2025 } from './fiscal2025.ts';

export const debtPeriod = '2025-12-31';
export const debtPeriodLabel = '2025年末';
export const debtBasisNote = '政府债务及城投债务截至2025年末，综合财力采用2025年度数据。';
export const finance2025Note = '部分省份综合财力分项尚不完整，债务率可能偏高；新疆政府债务含兵团。';

export function riskLevel(ratio: number): 'low' | 'medium' | 'high' | 'critical' {
  return ratio < 150 ? 'low' : ratio < 250 ? 'medium' : ratio < 400 ? 'high' : 'critical';
}

interface AnnualDebt {
  govDebtBalance: number;
  comprehensiveFinance: number;
  cityInvestDebt: number;
  govDebtRatio: number;
  adjustedDebtRatio: number;
  govDebtRiskColor: string;
  adjustedDebtRiskColor: string;
}

// Historical views always use December of the selected year, never the latest balance.
export function refreshAnnualDebt<T extends AnnualDebt>(province: string, year: number, debt: T): T {
  const cityInvestDebt = cityInvestmentDebtByPeriod[`${year}-12-31`]?.[province];
  if (cityInvestDebt === undefined) return debt;
  const source = year === 2025 ? fiscal2025[province] : undefined;
  const govDebtBalance = source ? source.generalDebt + source.specialDebt : debt.govDebtBalance;
  const comprehensiveFinance = source ? source.comprehensiveFinance : debt.comprehensiveFinance;
  const available = comprehensiveFinance > 0 && govDebtBalance > 0;
  const govDebtRatio = available ? govDebtBalance / comprehensiveFinance * 100 : 0;
  const adjustedDebtRatio = available ? (govDebtBalance + cityInvestDebt) / comprehensiveFinance * 100 : 0;
  const color = (value: number) => value < 100 ? '绿' : value < 200 ? '黄' : value < 300 ? '橙' : '红';
  return { ...debt, govDebtBalance, comprehensiveFinance, cityInvestDebt, govDebtRatio, adjustedDebtRatio,
    govDebtRiskColor: available ? color(govDebtRatio) : '',
    adjustedDebtRiskColor: available ? color(adjustedDebtRatio) : '',
  };
}

export function nationalCityInvestmentDebt(period: string): number {
  return Object.values(cityInvestmentDebtByPeriod[period]).reduce((sum, value) => sum + value, 0) / 10000;
}
