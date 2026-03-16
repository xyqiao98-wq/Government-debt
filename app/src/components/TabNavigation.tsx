import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hero } from './Hero';
import { StatCard } from './StatCard';
import { ChinaMap } from './ChinaMap';
// import { IndustryMap } from './IndustryMap';
import { DataTable } from './DataTable';
import { MultiDimensionDashboard } from './MultiDimensionDashboard';
import { PolicyTimeline } from './PolicyTimeline';
import { ProvinceExpression } from './ProvinceExpression';
import { TrendChart } from './TrendChart';
import { HiddenDebtBarChart } from './HiddenDebtBarChart';
import { Top10DebtRatioHorizontalBarChart } from './Top10DebtRatioHorizontalBarChart';
import { Top10TotalDebtStackedBarChart } from './Top10TotalDebtStackedBarChart';
import { nationalOverview } from '@/data/debtData';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Tabs
      defaultValue="overview"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="sticky top-16 z-40 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex-1 flex justify-center">
            <div className="overflow-x-auto w-full md:w-auto scrollbar-hide">
              <TabsList className="h-12 bg-transparent border-0 p-0 min-w-max">
                <TabsTrigger
                  value="overview"
                  className="h-11 px-4 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 whitespace-nowrap"
                >
                  全国概览
                </TabsTrigger>
                {/* <TabsTrigger
                  value="industry-map"
                  className="h-11 px-4 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 whitespace-nowrap"
                >
                  产业地图
                </TabsTrigger> */}
                <TabsTrigger
                  value="historical-trend"
                  className="h-11 px-4 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 whitespace-nowrap"
                >
                  历史趋势
                </TabsTrigger>
                <TabsTrigger
                  value="policy-timeline"
                  className="h-11 px-4 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 whitespace-nowrap"
                >
                  政策脉络
                </TabsTrigger>
                <TabsTrigger
                  value="debt-expressions"
                  className="h-11 px-4 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 whitespace-nowrap"
                >
                  化债表述
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* 搜索框 - 仅化债表述页面显示 */}
        {activeTab === 'debt-expressions' && (
          <div className="flex-1 flex justify-end">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                type="search"
                placeholder="搜索省份..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-900 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 概览选项卡 */}
      <TabsContent value="overview" className="focus-visible:outline-none">
        <main className="pt-6">
          {/* Hero Section */}
          <Hero />

          {/* Data Overview Cards */}
          <section id="overview" className="py-8 px-6">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <StatCard
                  title="全国政府性债务余额"
                  value={nationalOverview.localBondBalance}
                  unit="万亿元"
                  change={8.5}
                  color="blue"
                  delay={0}
                  dataYear="2024"
                />
                <StatCard
                  title="城投带息债务余额"
                  value={nationalOverview.cityInvestDebt}
                  unit="万亿元"
                  change={12.3}
                  color="red"
                  delay={0.1}
                  dataYear="2024"
                />
                <StatCard
                  title="债务总规模"
                  value={Number((nationalOverview.localBondBalance + nationalOverview.cityInvestDebt).toFixed(2))}
                  unit="万亿元"
                  change={10.8}
                  changeLabel="同比增长"
                  color="orange"
                  delay={0.2}
                  dataYear="2024"
                />
                <StatCard
                  title="平均政府债务率"
                  value={Number(nationalOverview.avgDebtRatio.toFixed(2))}
                  unit="%"
                  change={5.2}
                  changeLabel="同比上升"
                  color="purple"
                  delay={0.3}
                  dataYear="2024"
                />
              </motion.div>
            </div>
          </section>

          {/* 全国债务地图 */}
          <section id="debt-map" className="py-8 px-6">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-4"
              >
                <h2 className="text-2xl font-bold text-white mb-2">全国地方债务地图</h2>
                <p className="text-gray-400">点击各省份查看详细债务数据与风险等级</p>
              </motion.div>
              <ChinaMap />
            </div>
          </section>

          {/* 全国债务总览 */}
          <section id="national-overview" className="py-8 px-6">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">全国债务总览</h2>
                <p className="text-gray-400">全国政府性债务、城投带息债务、隐债规模及省份债务排名</p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart />
                <HiddenDebtBarChart />
                <Top10DebtRatioHorizontalBarChart />
                <Top10TotalDebtStackedBarChart />
              </div>
            </div>
          </section>

          {/* 数据表格 */}
          <section id="data-table" className="py-8 px-6">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-4"
              >
                <h2 className="text-2xl font-bold text-white mb-2">各省债务数据详情表</h2>
                <p className="text-gray-400">支持排序、筛选、搜索，点击表头可排序</p>
              </motion.div>
              <DataTable />
            </div>
          </section>
        </main>
      </TabsContent>


      {/* 产业地图选项卡 - 暂时隐藏
      <TabsContent value="industry-map" className="focus-visible:outline-none">
        <main className="pt-6">
          <IndustryMap />
        </main>
      </TabsContent>
      */}


      {/* 历史趋势选项卡 */}
      <TabsContent value="historical-trend" className="focus-visible:outline-none">
        <main className="pt-6">
          <MultiDimensionDashboard />
        </main>
      </TabsContent>

      {/* 政策时间线选项卡 */}
      <TabsContent value="policy-timeline" className="focus-visible:outline-none">
        <main className="pt-6">
          <PolicyTimeline />
        </main>
      </TabsContent>

      {/* 化债表述选项卡 */}
      <TabsContent value="debt-expressions" className="focus-visible:outline-none">
        <main className="pt-6">
          <ProvinceExpression searchQuery={searchQuery} />
        </main>
      </TabsContent>
    </Tabs>
  );
}