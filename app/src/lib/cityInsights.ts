import type { CityMetricKey, CityRecord } from '@/types/city';

export function metricValue(record: CityRecord, metric: CityMetricKey) {
  return record[metric] as number | null;
}

export function formatMetric(value: number | null, unit = '亿元') {
  if (value === null || !Number.isFinite(value)) return '暂无数据';
  if (unit === '%' || Math.abs(value) < 100) return `${value.toFixed(1)}${unit}`;
  return `${value.toLocaleString('zh-CN', { maximumFractionDigits: 1 })}${unit}`;
}

export function rankRecords(records: CityRecord[], metric: CityMetricKey) {
  return records
    .filter((record) => metricValue(record, metric) !== null)
    .sort((a, b) => (metricValue(b, metric) ?? 0) - (metricValue(a, metric) ?? 0));
}

export function percentileColor(value: number | null, sortedValues: number[]) {
  if (value === null || sortedValues.length === 0) return 'rgba(71, 85, 105, 0.28)';
  const rank = sortedValues.findIndex((candidate) => candidate >= value);
  const percentile = rank < 0 ? 1 : rank / Math.max(sortedValues.length - 1, 1);
  if (percentile >= 0.8) return '#ef4444';
  if (percentile >= 0.6) return '#f97316';
  if (percentile >= 0.4) return '#eab308';
  if (percentile >= 0.2) return '#22c55e';
  return '#0ea5e9';
}

export function cityInsights(history: CityRecord[]) {
  const sorted = [...history].sort((a, b) => a.year - b.year);
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);
  if (!latest) return ['暂无可分析数据'];
  const insights: string[] = [];
  if (latest.completeness < 3) insights.push('核心指标存在缺失，排名和同比仅使用有效数据。');
  if (previous) {
    const fundNow = latest.governmentFundRevenue;
    const fundBefore = previous.governmentFundRevenue;
    if (fundNow !== null && fundBefore) {
      const change = (fundNow - fundBefore) / fundBefore;
      if (change <= -0.3) insights.push(`政府性基金收入同比下降 ${Math.abs(change * 100).toFixed(1)}%。`);
    }
    if (latest.gdp !== null && previous.gdp && latest.generalBudgetRevenue !== null && previous.generalBudgetRevenue) {
      if (latest.gdp > previous.gdp && latest.generalBudgetRevenue < previous.generalBudgetRevenue) {
        insights.push('GDP增长而一般公共预算收入下降，财政收入与经济增长出现背离。');
      }
    }
  }
  const consecutiveRevenueDecline = sorted.slice(-3).every((record, index, rows) =>
    index === 0 || (record.generalBudgetRevenue !== null && rows[index - 1].generalBudgetRevenue !== null
      && record.generalBudgetRevenue! < rows[index - 1].generalBudgetRevenue!));
  if (sorted.length >= 3 && consecutiveRevenueDecline) insights.push('一般公共预算收入已连续两年下降。');
  if (insights.length === 0) insights.push('当前指标未触发显著异常规则。');
  return insights;
}
