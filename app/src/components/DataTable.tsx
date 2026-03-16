import { useState } from 'react';
import { motion } from 'framer-motion';
import { provinceDebtData, getRiskColor, getRiskText } from '@/data/debtData';
import { Table2, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type SortField = 'province' | 'localBondBalance' | 'cityInvestDebt' | 'totalDebt' | 
                 'debtRatio' | 'adjustedDebtRatio' | 'gdp2025' | 'gdpGrowth2025' | 'population';
type SortOrder = 'asc' | 'desc';

export function DataTable() {
  const [sortField, setSortField] = useState<SortField>('adjustedDebtRatio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  const filteredAndSortedData = provinceDebtData
    .filter(item => 
      item.province.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const formatNumber = (num: number | undefined, decimals: number = 2) => {
    if (num === undefined) return '-';
    return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (num: number | undefined) => {
    if (num === undefined) return '-';
    if (num >= 10000) {
      return `${(num / 10000).toFixed(2)}万亿`;
    }
    return `${formatNumber(num)}亿`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      id="table"
      className="py-16 px-6"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Table2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">各省债务详细数据</h2>
            <span className="text-xs text-gray-500">(债务数据口径：2024年末)</span>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="搜索省份..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111827] border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-[#111827] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('province')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>省份</span>
                      {getSortIcon('province')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('localBondBalance')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>政府性债务</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                      {getSortIcon('localBondBalance')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('cityInvestDebt')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>城投债务</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                      {getSortIcon('cityInvestDebt')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('adjustedDebtRatio')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>宽口径债务率</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                      {getSortIcon('adjustedDebtRatio')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('debtRatio')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>窄口径债务率</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                      {getSortIcon('debtRatio')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('gdp2025')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>GDP</span>
                      <span className="text-xs text-gray-500">(2025)</span>
                      {getSortIcon('gdp2025')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('gdpGrowth2025')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>GDP增速</span>
                      <span className="text-xs text-gray-500">(2025)</span>
                      {getSortIcon('gdpGrowth2025')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('population')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>常住人口</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                      {getSortIcon('population')}
                    </div>
                  </th>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-gray-300 whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <span>风险等级</span>
                      <span className="text-xs text-gray-500">(2024)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((item, index) => (
                  <motion.tr
                    key={item.province}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-3 py-4 text-sm font-medium text-white text-center whitespace-nowrap">
                      {item.province}
                    </td>
                    <td className="px-3 py-4 text-sm text-right text-gray-300 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.localBondBalance)}
                    </td>
                    <td className="px-3 py-4 text-sm text-right text-gray-300 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.cityInvestDebt)}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums whitespace-nowrap">
                      <span style={{ color: getRiskColor(item.riskLevel) }}>
                        {item.adjustedDebtRatio.toFixed(2)}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">(第{item.adjustedDebtRatioRank ? (32 - item.adjustedDebtRatioRank) : '?'}高)</span>
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums whitespace-nowrap">
                      <span className={item.debtRatio > 150 ? 'text-orange-400' : 'text-emerald-400'}>
                        {item.debtRatio.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-gray-300 tabular-nums whitespace-nowrap">
                      {item.gdp2025 ? (
                        <>
                          {(item.gdp2025 / 10000).toFixed(2)}万亿
                          <span className="text-xs text-gray-500 ml-1">(第{item.gdp2025Rank}名)</span>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums whitespace-nowrap">
                      {item.gdpGrowth2025 ? (
                        <>
                          <span className={item.gdpGrowth2025 > 5 ? 'text-emerald-400' : 'text-yellow-400'}>
                            {item.gdpGrowth2025}%
                          </span>
                          <span className="text-xs text-gray-500 ml-1">(第{item.gdpGrowth2025Rank}名)</span>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-4 text-right text-gray-300 tabular-nums whitespace-nowrap">
                      {item.population ? (
                        <>
                          {item.population}万
                          <span className="text-xs text-gray-500 ml-1">(第{item.populationRank}名)</span>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-4 text-center whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getRiskColor(item.riskLevel)}20`,
                          color: getRiskColor(item.riskLevel),
                        }}
                      >
                        {getRiskText(item.riskLevel)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>共 {filteredAndSortedData.length} 个省份</span>
          <span>数据来源：各省2024年预算执行报告 · 华泰固收团队整理</span>
        </div>
      </div>
    </motion.section>
  );
}
