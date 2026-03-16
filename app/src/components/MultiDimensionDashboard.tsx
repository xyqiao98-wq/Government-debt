import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { provinceStatsHistorical } from '@/data/provinceStats_historical';
import type { ProvinceMasterData } from '@/data/provinceStats_master';
import { Search, TrendingUp, DollarSign, Scale, ArrowUpDown, ArrowUp, ArrowDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 指标分类定义
type MetricCategory = 'economic' | 'fiscal' | 'debt';

// 指标配置
interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  category: MetricCategory;
  color: string;
  format?: (value: number) => string;
  sortable?: boolean;
}

// 经济指标
const economicMetrics: MetricConfig[] = [
  { key: 'gdp', label: 'GDP总量', unit: '亿元', category: 'economic', color: '#3b82f6', format: (v) => (v / 10000).toFixed(2) + '万亿' },
  { key: 'gdpGrowth', label: 'GDP增速', unit: '%', category: 'economic', color: '#8b5cf6' },
  { key: 'fixedAssetInvestmentGrowth', label: '固定资产投资增速', unit: '%', category: 'economic', color: '#10b981' },
];

// 财政指标
const fiscalMetrics: MetricConfig[] = [
  { key: 'fiscalRevenue', label: '一般公共预算收入', unit: '亿元', category: 'fiscal', color: '#3b82f6', format: (v) => v.toFixed(2) },
  { key: 'taxRevenue', label: '税收收入', unit: '亿元', category: 'fiscal', color: '#8b5cf6', format: (v) => v.toFixed(2) },
  { key: 'govFundRevenue', label: '政府性基金收入', unit: '亿元', category: 'fiscal', color: '#10b981', format: (v) => v.toFixed(2) },
  { key: 'landTransferRevenue', label: '土地出让收入', unit: '亿元', category: 'fiscal', color: '#ef4444', format: (v) => v.toFixed(2) },
];

// 债务指标
const debtMetrics: MetricConfig[] = [
  { key: 'govDebtBalance', label: '政府性债务余额', unit: '亿元', category: 'debt', color: '#3b82f6', format: (v) => (v / 10000).toFixed(2) + '万亿' },
  { key: 'cityInvestDebt', label: '城投带息债务', unit: '亿元', category: 'debt', color: '#8b5cf6', format: (v) => (v / 10000).toFixed(2) + '万亿' },
  { key: 'adjustedDebtRatio', label: '宽口径债务率', unit: '%', category: 'debt', color: '#10b981', format: (v) => v.toFixed(2) },
  { key: 'govDebtRatio', label: '窄口径债务率', unit: '%', category: 'debt', color: '#ef4444', format: (v) => v.toFixed(2) },
  { key: 'govDebtRiskColor', label: '政府债务风险', unit: '', category: 'debt', color: '#f59e0b', format: (v) => v.toString(), sortable: false },
  { key: 'adjustedDebtRiskColor', label: '宽口径债务风险', unit: '', category: 'debt', color: '#ec4899', format: (v) => v.toString(), sortable: false },
];

// 所有指标
const allMetrics = [...economicMetrics, ...fiscalMetrics, ...debtMetrics];

// 获取指标显示值
const getMetricValue = (provinceData: any, metricKey: string): number | string => {
  if (metricKey in provinceData.macro) {
    return provinceData.macro[metricKey as keyof typeof provinceData.macro] ?? 0;
  }
  if (metricKey in provinceData.debt) {
    const value = provinceData.debt[metricKey as keyof typeof provinceData.debt];
    // 处理风险颜色字段
    if (metricKey.includes('RiskColor')) {
      return value || '';
    }
    return value ?? 0;
  }
  return 0;
};

// 获取风险颜色样式
const getRiskColorStyle = (riskColor: string) => {
  switch (riskColor) {
    case '红': return { backgroundColor: '#ef444420', color: '#ef4444' };
    case '橙': return { backgroundColor: '#f9731620', color: '#f97316' };
    case '黄': return { backgroundColor: '#eab30820', color: '#eab308' };
    case '绿': return { backgroundColor: '#10b98120', color: '#10b981' };
    default: return { backgroundColor: '#6b728020', color: '#6b7280' };
  }
};

export function MultiDimensionDashboard() {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('economic');
  const [sortField, setSortField] = useState<string>('gdp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // 获取当前分类的指标
  const currentMetrics = useMemo(() => {
    switch (activeCategory) {
      case 'economic': return economicMetrics;
      case 'fiscal': return fiscalMetrics;
      case 'debt': return debtMetrics;
      default: return economicMetrics;
    }
  }, [activeCategory]);

  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  // 处理数据排序和筛选
  const processedData = useMemo(() => {
    // 从历史数据中筛选当前年份的数据
    let data = provinceStatsHistorical.filter(item => item.year === selectedYear);

    // 搜索筛选
    if (searchTerm) {
      data = data.filter(item =>
        item.province.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    data.sort((a, b) => {
      const aValue = getMetricValue(a, sortField);
      const bValue = getMetricValue(b, sortField);

      // 处理字符串比较（如风险颜色）
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') return aValue.localeCompare(bValue);
        return bValue.localeCompare(aValue);
      }

      // 数值比较
      const aNum = typeof aValue === 'number' ? aValue : 0;
      const bNum = typeof bValue === 'number' ? bValue : 0;

      if (sortOrder === 'asc') return aNum - bNum;
      return bNum - aNum;
    });

    return data;
  }, [searchTerm, sortField, sortOrder, selectedYear]);

  // 获取指标配置
  const getMetricConfig = (key: string): MetricConfig | undefined => {
    return allMetrics.find(metric => metric.key === key);
  };


  // 静态数字组件（无动画）
  const StaticNumber = ({ value, metricKey }: { value: number; metricKey: string }) => {
    const config = getMetricConfig(metricKey);

    if (!config) return <span>{value}</span>;

    // 处理零值显示为'-'
    if (value === 0) {
      return <span className="text-gray-500">-</span>;
    }

    if (config.format) {
      return <span>{config.format(value)}</span>;
    }

    if (config.unit === '%') {
      return <span>{value.toFixed(2)}%</span>;
    }

    if (value >= 10000 && config.unit === '亿元') {
      return <span>{(value / 10000).toFixed(2)}万亿</span>;
    }

    return <span>{value.toLocaleString('zh-CN')}{config.unit}</span>;
  };

  // 获取省份的GDP时间序列数据（2019-2025）
  const getGdpTrend = (province: string): number[] => {
    const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    return years.map(year => {
      const data = provinceStatsHistorical.find(d => d.province === province && d.year === year);
      return data ? data.macro.gdp : 0;
    });
  };

  // Sparkline SVG组件
  const Sparkline = ({ data, width = 60, height = 20 }: { data: number[]; width?: number; height?: number }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    // 计算颜色（基于趋势）
    const first = data[0];
    const last = data[data.length - 1];
    const trendColor = last >= first ? '#10b981' : '#ef4444';

    return (
      <svg width={width} height={height} className="inline-block ml-2">
        <polyline
          points={points}
          fill="none"
          stroke={trendColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // 通用指标单元格渲染函数
  const renderMetricCell = (item: ProvinceMasterData, metric: MetricConfig) => {
    const value = getMetricValue(item, metric.key);

    // 处理风险颜色字段
    if (metric.key.includes('RiskColor') && typeof value === 'string') {
      return (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          style={getRiskColorStyle(value)}
        >
          {value || '-'}
        </span>
      );
    }

    // 数值字段使用动画
    if (typeof value === 'number') {
      return (
        <div className="tabular-nums flex items-center justify-end">
          <StaticNumber value={value} metricKey={metric.key} />
          {/* 在GDP单元格旁添加Sparkline */}
          {metric.key === 'gdp' && activeCategory === 'economic' && (
            <Sparkline data={getGdpTrend(item.province)} />
          )}
        </div>
      );
    }

    // 其他情况（字符串）
    return <div className="tabular-nums text-gray-300">{String(value)}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1400px] mx-auto px-6 py-8"
    >
      {/* 标题区域 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">多维指标对比仪表盘</h2>
          <p className="text-gray-400">{selectedYear}年各省经济、财政与债务指标综合对比</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-white/5">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-300">数据更新至{selectedYear}年12月</span>
        </div>
      </div>

      {/* 年份滑动条 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-300">时间轴</h3>
              <p className="text-xs text-gray-500">选择年份查看历史数据变化</p>
            </div>
          </div>
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setSelectedYear(prev => Math.max(2019, prev - 1))}
                disabled={selectedYear <= 2019}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center flex-1 mx-4">
                <span className="text-xl font-bold text-white">{selectedYear}</span>
                <span className="text-sm text-gray-400 ml-2">年</span>
              </div>
              <button
                onClick={() => setSelectedYear(prev => Math.min(2025, prev + 1))}
                disabled={selectedYear >= 2025}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4">
              <input
                type="range"
                min="2019"
                max="2025"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {[2019, 2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                  <span
                    key={year}
                    className={`cursor-pointer ${year === selectedYear ? 'text-blue-400 font-medium' : ''}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">数据范围</div>
            <div className="text-sm font-medium text-white">2019 - 2025</div>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 分类切换 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-blue-400" />
              <label className="text-sm font-medium text-gray-300">指标分类</label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === 'economic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('economic')}
                className={activeCategory === 'economic' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border-white/10 text-gray-400 hover:text-white'}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                经济指标
              </Button>
              <Button
                variant={activeCategory === 'fiscal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('fiscal')}
                className={activeCategory === 'fiscal' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-white/10 text-gray-400 hover:text-white'}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                财政指标
              </Button>
              <Button
                variant={activeCategory === 'debt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('debt')}
                className={activeCategory === 'debt' ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-white/10 text-gray-400 hover:text-white'}
              >
                <Scale className="w-4 h-4 mr-2" />
                债务指标
              </Button>
            </div>
          </div>

          {/* 搜索框 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-medium text-gray-300">搜索省份</label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="输入省份名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0a0f1c] border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-gray-300">统计概览</label>
            </div>
            <div className="bg-[#0a0f1c] rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">数据范围</div>
              <div className="text-xl font-bold text-white">
                {processedData.length} 个省份
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {currentMetrics.length} 个指标 · {activeCategory === 'economic' ? '经济' : activeCategory === 'fiscal' ? '财政' : '债务'}分类
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2025年债务指标标注 */}
      {selectedYear === 2025 && activeCategory === 'debt' && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">!</div>
            <div className="text-sm text-amber-300">
              <span className="font-medium">2025年末城投带息债务尚未披露：</span>
              2025年债务指标暂待更新，当前显示数据为2024年债务指标的预测值或占位数据。
            </div>
          </div>
        </div>
      )}

      {/* 数据表格 */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('province')}
                >
                  <div className="flex items-center gap-2">
                    <span>省份</span>
                    {getSortIcon('province')}
                  </div>
                </th>
                {currentMetrics.map(metric => (
                  <th
                    key={metric.key}
                    className="px-4 py-4 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => metric.sortable !== false && handleSort(metric.key)}
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span>{metric.label}</span>
                        {metric.sortable !== false && getSortIcon(metric.key)}
                      </div>
                      <span className="text-xs text-gray-500">{metric.unit}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => (
                <motion.tr
                  key={item.province}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-medium text-white whitespace-nowrap">
                    {item.province}
                  </td>
                  {currentMetrics.map(metric => (
                    <td
                      key={metric.key}
                      className="px-4 py-4 text-right whitespace-nowrap"
                    >
                      {renderMetricCell(item, metric)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 表格页脚 */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>共 {processedData.length} 个省份 · 数据来源：各省{selectedYear}年统计公报、预算执行报告</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">点击表头可排序</span>
            </div>
          </div>
        </div>
      </div>

      {/* 指标说明 */}
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-2">
          <span className="font-medium text-gray-400">指标说明：</span>
          经济指标反映各省经济发展水平，财政指标反映政府财力状况，债务指标反映债务风险水平。
        </p>
        <p>
          <span className="font-medium text-gray-400">数据口径：</span>
          所有数据均为2024年最新数据，债务率为债务余额与综合财力的比值，宽口径债务率包含城投带息债务。
        </p>
      </div>
    </motion.div>
  );
}