import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { historicalDebtData } from '@/data/historicalDebtData';
import type { HistoricalDebtData } from '@/data/historicalDebtData';
import { LineChart, TrendingUp, BarChart3, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 可用的指标配置
const metricOptions = [
  { value: 'fiscalRevenue', label: '一般公共预算收入', unit: '亿元', color: '#3b82f6' },
  { value: 'govFundRevenue', label: '政府性基金收入', unit: '亿元', color: '#8b5cf6' },
  { value: 'comprehensiveFinance', label: '综合财力', unit: '亿元', color: '#10b981' },
  { value: 'govDebtBalance', label: '政府性债务余额', unit: '亿元', color: '#ef4444' },
  { value: 'cityInvestDebt', label: '城投带息债务', unit: '亿元', color: '#f59e0b' },
  { value: 'adjustedDebtRatio', label: '宽口径债务率', unit: '%', color: '#ec4899' },
  { value: 'govDebtRatio', label: '窄口径债务率', unit: '%', color: '#06b6d4' },
];

// 获取所有不重复的省份列表
const allProvinces = Array.from(new Set((historicalDebtData?.filter((item): item is HistoricalDebtData => item !== undefined) ?? []).map(item => item.province))).sort();

// 获取所有年份
const allYears = [2019, 2020, 2021, 2022, 2023, 2024];

export function HistoricalChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(['江苏', '浙江', '广东']);
  const [selectedMetric, setSelectedMetric] = useState<string>('adjustedDebtRatio');
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    setChartInstance(chart);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstance) return;

    const currentMetric = metricOptions.find(m => m.value === selectedMetric);
    if (!currentMetric) return;

    // 准备系列数据
    const series = selectedProvinces.map(province => {
      const provinceData = (historicalDebtData?.filter((item): item is HistoricalDebtData => item !== undefined && item.province === province) ?? []).sort((a, b) => a.year - b.year);

      return {
        name: province,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
        },
        data: provinceData.map(item => ({
          name: item.year.toString(),
          value: Number((item as any)?.[selectedMetric] ?? 0),
        })),
      };
    });

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 31, 46, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        formatter: (params: any) => {
          const year = params[0]?.name ?? '';
          let html = `<div class="text-sm font-semibold text-white mb-2">${year}年 · ${currentMetric?.label ?? ''}</div>`;
          params.forEach((param: any) => {
            const numValue = Number(param.value); const value = isNaN(numValue) ? '-' : numValue.toFixed(2);
            html += `
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${param.color}"></div>
                  <span class="text-gray-300">${param.seriesName}</span>
                </div>
                <div>
                  <span class="text-white font-medium">${value}</span>
                  <span class="text-gray-400 text-xs ml-1">${currentMetric?.unit ?? ''}</span>
                </div>
              </div>
            `;
          });
          return html;
        },
      },
      legend: {
        top: 10,
        textStyle: { color: '#9ca3af' },
        itemStyle: { borderWidth: 0 },
        selectedMode: 'multiple',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allYears,
        axisLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' },
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 12,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: currentMetric?.unit ?? '',
        nameTextStyle: {
          color: '#9ca3af',
          fontSize: 12,
          padding: [0, 0, 0, 10],
        },
        axisLine: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' },
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
            type: 'dashed',
          },
        },
      },
      series,
    };

    chartInstance.setOption(option);
  }, [chartInstance, selectedProvinces, selectedMetric]);

  // 添加省份
  const handleAddProvince = (province: string) => {
    if (!selectedProvinces.includes(province)) {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  // 移除省份
  const handleRemoveProvince = (province: string) => {
    setSelectedProvinces(selectedProvinces.filter(p => p !== province));
  };

  // 获取当前指标的全国平均值（2024年）
  const getNationalAverage = () => {
    const data2024 = historicalDebtData.filter((item): item is HistoricalDebtData =>
      item !== undefined && item.year === 2024);
    if (data2024.length === 0) return 0;

    const sum = data2024.reduce((acc, item) => {
      return acc + (Number((item as any)?.[selectedMetric] ?? 0));
    }, 0);

    return sum / data2024.length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1400px] mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">历史趋势分析</h2>
          <p className="text-gray-400">2019-2024年各省地方财政与债务变化趋势</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-white/5">
          <LineChart className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-300">数据更新至2024年</span>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 指标选择 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <label className="text-sm font-medium text-gray-300">选择分析指标</label>
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="bg-[#0a0f1c] border-white/10">
                <SelectValue placeholder="选择指标" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-white/10">
                {metricOptions.map(metric => (
                  <SelectItem key={metric.value} value={metric.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: metric.color }}
                      />
                      <span>{metric.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 省份选择 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-medium text-gray-300">选择省份对比</label>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedProvinces.map(province => (
                <Badge
                  key={province}
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                >
                  {province}
                  <button
                    onClick={() => handleRemoveProvince(province)}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={handleAddProvince}>
              <SelectTrigger className="bg-[#0a0f1c] border-white/10">
                <SelectValue placeholder="添加省份对比" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-white/10">
                {allProvinces
                  .filter(p => !selectedProvinces.includes(p))
                  .map(province => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 统计信息 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-gray-300">统计概览</label>
            </div>
            <div className="bg-[#0a0f1c] rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">全国平均值 (2024)</div>
              <div className="text-xl font-bold text-white">
                {isNaN(getNationalAverage()) ? '-' : getNationalAverage().toFixed(2)}
                <span className="text-sm text-gray-400 ml-1">
                  {metricOptions.find(m => m.value === selectedMetric)?.unit ?? ''}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                共 {selectedProvinces.length} 个省份，{allYears.length} 年数据
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 mb-6">
        <div className="h-[500px]" ref={chartRef} />
      </div>

      {/* 数据表格摘要 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">数据摘要</h3>
          <Button variant="outline" size="sm" className="border-white/10">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">年份</th>
                {selectedProvinces.map(province => (
                  <th key={province} className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                    {province}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allYears.map(year => (
                <tr key={year} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-sm font-medium text-gray-300">{year}</td>
                  {selectedProvinces.map(province => {
                    const data = historicalDebtData.find(
                      (item): item is HistoricalDebtData =>
                        item !== undefined && item.year === year && item.province === province
                    );
                    const value = data ? Number((data as any)?.[selectedMetric] ?? 0) : 0;
                    return (
                      <td key={province} className="text-right py-3 px-4 tabular-nums">
                        <span className="text-white">{isNaN(value) ? '-' : value.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {metricOptions.find(m => m.value === selectedMetric)?.unit ?? ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}