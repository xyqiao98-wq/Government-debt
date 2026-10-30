import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hero } from './Hero';
import { StatCard } from './StatCard';
import { ChinaMap } from './ChinaMap';
import { DataTable } from './DataTable';
import { MultiDimensionDashboard } from './MultiDimensionDashboard';
import { PolicyTimeline } from './PolicyTimeline';
import { ProvinceExpression } from './ProvinceExpression';
import { TrendChart } from './TrendChart';
import { HiddenDebtBarChart } from './HiddenDebtBarChart';
import { Top10DebtRatioHorizontalBarChart } from './Top10DebtRatioHorizontalBarChart';
import { Top10TotalDebtStackedBarChart } from './Top10TotalDebtStackedBarChart';
import { CityResearchDashboard } from './CityResearchDashboard';
import { nationalOverview } from '@/data/debtData';
import { debtBasisNote, debtPeriodLabel, finance2025Note } from '@/data/debtRefresh';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const tabs = [
  ['overview', '全国概览'], ['province', '省级研究'], ['cities', '地市图谱'],
  ['compare', '地市对比'], ['policy', '政策与化债'],
] as const;

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  return <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <div className="sticky top-16 z-40 border-b border-white/10 bg-[#0a0f1c]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center px-4 md:px-6"><div className="w-full overflow-x-auto scrollbar-hide"><TabsList className="h-13 min-w-max border-0 bg-transparent p-0">
        {tabs.map(([value, label]) => <TabsTrigger key={value} value={value} className="h-12 whitespace-nowrap rounded-none border-b-2 border-transparent px-4 text-sm font-medium text-slate-500 data-[state=active]:border-cyan-400 data-[state=active]:bg-cyan-400/[0.06] data-[state=active]:text-cyan-200">{label}</TabsTrigger>)}
      </TabsList></div></div>
      {activeTab === 'policy' && <div className="mx-auto flex max-w-[1500px] justify-end px-6 pb-3"><div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索省份…" className="border-white/10 bg-slate-900 pl-9 text-slate-200" /></div></div>}
    </div>

    <TabsContent value="overview" className="mt-0 focus-visible:outline-none"><main className="pt-6"><Hero />
      <section className="px-6 py-8"><div className="mx-auto max-w-[1400px]"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .3 }} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="全国政府性债务余额" value={Number(nationalOverview.localBondBalance.toFixed(2))} unit="万亿元" color="blue" delay={0} dataYear="2025" />
        <StatCard title="城投带息债务余额" value={Number(nationalOverview.cityInvestDebt.toFixed(2))} unit="万亿元" change={Number(nationalOverview.growthRate.toFixed(2))} color="red" delay={.1} dataYear={debtPeriodLabel} />
        <StatCard title="债务总规模" value={Number((nationalOverview.localBondBalance + nationalOverview.cityInvestDebt).toFixed(2))} unit="万亿元" color="orange" delay={.2} dataYear="2025年末" />
        <StatCard title="平均窄口径债务率" value={Number(nationalOverview.avgDebtRatio.toFixed(2))} unit="%" color="purple" delay={.3} dataYear="2025" />
      </motion.div><p className="mt-4 text-xs leading-6 text-slate-500">{debtBasisNote} 平均窄口径债务率为31省算术平均。{finance2025Note}</p></div></section>
      <section className="px-6 py-8"><div className="mx-auto max-w-[1400px]"><SectionTitle title="全国债务趋势" subtitle="政府性债务、城投债务、隐债规模与省份排名" /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><TrendChart /><HiddenDebtBarChart /><Top10DebtRatioHorizontalBarChart /><Top10TotalDebtStackedBarChart /></div></div></section>
    </main></TabsContent>

    <TabsContent value="province" className="mt-0 focus-visible:outline-none"><main className="pt-6"><section className="px-6 py-8"><div className="mx-auto max-w-[1400px]"><SectionTitle title="省级债务研究" subtitle="地图下钻、风险分层与省际明细比较" /><ChinaMap /></div></section><MultiDimensionDashboard /><DataTable /></main></TabsContent>
    <TabsContent value="cities" className="mt-0 focus-visible:outline-none"><CityResearchDashboard mode="atlas" /></TabsContent>
    <TabsContent value="compare" className="mt-0 focus-visible:outline-none"><CityResearchDashboard mode="compare" /></TabsContent>
    <TabsContent value="policy" className="mt-0 focus-visible:outline-none"><PolicyTimeline /><ProvinceExpression searchQuery={searchQuery} /></TabsContent>
  </Tabs>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-7 border-l-2 border-cyan-400 pl-4"><h2 className="text-2xl font-semibold text-white">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}
