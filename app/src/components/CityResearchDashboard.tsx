import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as echarts from 'echarts';
import { BarChart3, Check, ChevronRight, GitCompareArrows, MapPinned, Search, X } from 'lucide-react';
import { loadCityHistory, loadCityMetadata, loadCityYear } from '@/lib/cityData';
import { cityInsights, formatMetric, metricValue, percentileColor, rankRecords } from '@/lib/cityInsights';
import type { CityMetadata, CityMetricKey, CityRecord } from '@/types/city';

interface CityResearchDashboardProps { mode?: 'atlas' | 'compare' }

export function CityResearchDashboard({ mode = 'atlas' }: CityResearchDashboardProps) {
  const [metadata, setMetadata] = useState<CityMetadata | null>(null);
  const [records, setRecords] = useState<CityRecord[]>([]);
  const [year, setYear] = useState(2024);
  const [metric, setMetric] = useState<CityMetricKey>('gdp');
  const [province, setProvince] = useState('全部');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CityRecord | null>(null);
  const [comparisonKeys, setComparisonKeys] = useState<string[]>([]);
  const [history, setHistory] = useState<CityRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCityMetadata().then((value) => { setMetadata(value); setYear(value.defaultYear); }).catch((reason) => setError(String(reason)));
  }, []);

  useEffect(() => {
    if (!metadata) return;
    let active = true;
    loadCityYear(year)
      .then(value => { if (active) setRecords(value); })
      .catch(reason => { if (active) setError(String(reason)); });
    return () => { active = false; };
  }, [metadata, year]);

  useEffect(() => {
    const keys = [...comparisonKeys, ...(selected ? [selected.regionKey] : [])];
    if (!metadata || keys.length === 0) return;
    let active = true;
    loadCityHistory([...new Set(keys)], metadata.years)
      .then(value => { if (active) setHistory(value); })
      .catch(reason => { if (active) setError(String(reason)); });
    return () => { active = false; };
  }, [comparisonKeys, metadata, selected]);

  const metricDefinition = metadata?.metrics.find((item) => item.key === metric);
  const provinces = useMemo(() => ['全部', ...new Set(records.map((record) => record.province))], [records]);
  const filtered = useMemo(() => records.filter((record) =>
    (province === '全部' || record.province === province)
    && (!query || `${record.province}${record.city}`.includes(query.trim()))), [records, province, query]);
  const ranked = useMemo(() => rankRecords(filtered, metric), [filtered, metric]);
  const values = useMemo(() => ranked.map((record) => metricValue(record, metric)!).sort((a, b) => a - b), [ranked, metric]);
  const coverage = filtered.filter((record) => metricValue(record, metric) !== null).length;

  const toggleCompare = (record: CityRecord) => {
    setComparisonKeys((current) => current.includes(record.regionKey)
      ? current.filter((key) => key !== record.regionKey)
      : current.length < 8 ? [...current, record.regionKey] : current);
  };

  if (error) return <div className="p-8 text-red-300">{error}</div>;
  if (!metadata) return <div className="p-8 text-slate-400">正在加载地市研究数据…</div>;

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="relative mb-6 overflow-hidden rounded-3xl border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-6 md:p-8">
          <div className="absolute right-8 top-0 h-32 w-32 rounded-full border border-cyan-400/10" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">Municipal fiscal observatory</p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{mode === 'compare' ? '地市对比研究' : '地市经济财政图谱'}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">多维呈现地市经济财政表现，支持地区筛选、指标比较与趋势分析。</p></div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-center">
              <Kpi label="地区" value={`${filtered.length}`} /><Kpi label="有效" value={`${coverage}`} /><Kpi label="完整率" value={`${filtered.length ? (coverage / filtered.length * 100).toFixed(0) : 0}%`} />
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:grid-cols-[130px_220px_220px_1fr]">
          <label className="control-label">年份<select value={year} onChange={(event) => setYear(Number(event.target.value))} className="research-control">{metadata.years.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="control-label">研究指标<select value={metric} onChange={(event) => setMetric(event.target.value as CityMetricKey)} className="research-control">{metadata.metrics.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <label className="control-label">省份<select value={province} onChange={(event) => setProvince(event.target.value)} className="research-control">{provinces.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="control-label">搜索<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="城市、自治州、地区…" className="research-control pl-9" /></div></label>
        </div>

        {mode === 'atlas' ? <AtlasView ranked={ranked} metric={metric} unit={metricDefinition?.unit ?? ''} values={values} selected={selected} onSelect={setSelected} comparisonKeys={comparisonKeys} onCompare={toggleCompare} />
          : <CompareView records={records} history={history} metadata={metadata} comparisonKeys={comparisonKeys} onToggle={toggleCompare} />}

        {selected && <CityDetail record={selected} history={history.filter((item) => item.regionKey === selected.regionKey)} metadata={metadata} onClose={() => setSelected(null)} onCompare={() => toggleCompare(selected)} isCompared={comparisonKeys.includes(selected.regionKey)} />}
      </div>
    </main>
  );
}

function AtlasView({ ranked, metric, unit, values, selected, onSelect, comparisonKeys, onCompare }: {
  ranked: CityRecord[]; metric: CityMetricKey; unit: string; values: number[]; selected: CityRecord | null;
  onSelect: (record: CityRecord) => void; comparisonKeys: string[]; onCompare: (record: CityRecord) => void;
}) {
  return <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
    <section className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
      <div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2 text-white"><MapPinned className="h-5 w-5 text-cyan-400" /><h3 className="font-semibold">地市热力矩阵</h3></div><p className="mt-1 text-xs text-slate-500">颜色表示当前筛选范围内的分位；灰色为缺失。</p></div><span className="font-mono text-xs text-slate-500">{ranked.length} VALID</span></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {ranked.map((record) => {
          const value = metricValue(record, metric);
          const active = selected?.regionKey === record.regionKey;
          return <button key={record.regionKey} onClick={() => onSelect(record)} className={`group min-h-20 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-white/40 ${active ? 'border-white/60 ring-1 ring-cyan-300/40' : 'border-white/10'}`} style={{ background: `linear-gradient(135deg, ${percentileColor(value, values)}55, rgba(2,6,23,.92) 78%)` }}>
            <div className="truncate text-sm font-medium text-white">{record.city}</div><div className="mt-1 text-[10px] text-slate-400">{record.province}</div><div className="mt-2 font-mono text-xs text-slate-200">{formatMetric(value, unit)}</div>
          </button>;
        })}
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
      <div className="border-b border-white/10 p-5"><div className="flex items-center gap-2 text-white"><BarChart3 className="h-5 w-5 text-amber-400" /><h3 className="font-semibold">地区排名</h3></div><p className="mt-1 text-xs text-slate-500">点击查看详情，勾选加入跨年比较。</p></div>
      <div className="max-h-[760px] overflow-y-auto">
        {ranked.slice(0, 100).map((record, index) => <div key={record.regionKey} className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 hover:bg-white/[0.03]">
          <span className="w-7 font-mono text-xs text-slate-600">{String(index + 1).padStart(2, '0')}</span><button onClick={() => onSelect(record)} className="min-w-0 flex-1 text-left"><div className="truncate text-sm text-slate-200">{record.city}</div><div className="text-[10px] text-slate-500">{record.province}</div></button><div className="font-mono text-xs text-slate-300">{formatMetric(metricValue(record, metric), unit)}</div><button title="加入比较" onClick={() => onCompare(record)} className={`rounded-md p-1.5 ${comparisonKeys.includes(record.regionKey) ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-500 hover:text-cyan-300'}`}>{comparisonKeys.includes(record.regionKey) ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}</button>
        </div>)}
      </div>
    </section>
  </div>;
}

function CompareView({ records, history, metadata, comparisonKeys, onToggle }: { records: CityRecord[]; history: CityRecord[]; metadata: CityMetadata; comparisonKeys: string[]; onToggle: (record: CityRecord) => void }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const scatterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const selectedRecords = records.filter((record) => comparisonKeys.includes(record.regionKey));
    chart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis' }, legend: { textStyle: { color: '#94a3b8' } }, grid: { left: 64, right: 24, top: 50, bottom: 42 }, xAxis: { type: 'category', data: metadata.years, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#334155' } } }, yAxis: { type: 'value', name: 'GDP（亿元）', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } }, series: selectedRecords.map((record) => ({ name: record.city, type: 'line', smooth: true, symbolSize: 7, data: metadata.years.map((year) => history.find((item) => item.year === year && item.regionKey === record.regionKey)?.gdp ?? null) })) });
    const resize = () => chart.resize(); window.addEventListener('resize', resize); return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [comparisonKeys, history, metadata.years, records]);
  useEffect(() => {
    if (!scatterRef.current) return;
    const chart = echarts.init(scatterRef.current);
    chart.setOption({ tooltip: { formatter: ({ data }: { data: [number, number, string, string] }) => `${data[2]}<br/>GDP：${data[0].toLocaleString()} 亿元<br/>一般预算收入：${data[1].toLocaleString()} 亿元` }, grid: { left: 64, right: 24, top: 34, bottom: 48 }, xAxis: { name: 'GDP（亿元）', nameLocation: 'middle', nameGap: 30, type: 'log', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } }, yAxis: { name: '一般预算收入', type: 'log', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.1)' } } }, series: [{ type: 'scatter', symbolSize: 9, itemStyle: { color: '#22d3ee', opacity: .68 }, data: records.filter((record) => record.gdp && record.generalBudgetRevenue).map((record) => [record.gdp!, record.generalBudgetRevenue!, record.city, record.regionKey]) }] });
    const resize = () => chart.resize(); window.addEventListener('resize', resize); return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [records]);
  return <div className="space-y-6"><div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-white">选择比较地区</h3><p className="mt-1 text-xs text-slate-500">最多八个；趋势数据仅在选择后加载。</p></div><span className="font-mono text-xs text-cyan-300">{comparisonKeys.length}/8</span></div><div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">{records.slice().sort((a,b) => a.city.localeCompare(b.city,'zh-CN')).map((record) => <button key={record.regionKey} onClick={() => onToggle(record)} className={`rounded-full border px-3 py-1.5 text-xs ${comparisonKeys.includes(record.regionKey) ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>{record.city}</button>)}</div></div>
    <div className="grid gap-6 xl:grid-cols-2"><ChartShell title="多城市 GDP 趋势"><div ref={chartRef} className="h-[420px]" /></ChartShell><ChartShell title="GDP 与一般预算收入关系"><div ref={scatterRef} className="h-[420px]" /></ChartShell></div></div>;
}

function CityDetail({ record, history, metadata, onClose, onCompare, isCompared }: { record: CityRecord; history: CityRecord[]; metadata: CityMetadata; onClose: () => void; onCompare: () => void; isCompared: boolean }) {
  const insights = cityInsights(history);
  return <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/65 backdrop-blur-sm" onClick={onClose}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#070d18] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
    <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[.25em] text-cyan-400">{record.province} · {record.regionType}</p><h3 className="mt-2 text-3xl font-semibold text-white">{record.city}</h3></div><button onClick={onClose} className="rounded-lg bg-white/5 p-2 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button></div>
    <button onClick={onCompare} className="mt-5 flex items-center gap-2 rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-300"><GitCompareArrows className="h-4 w-4" />{isCompared ? '移出比较' : '加入比较'}</button>
    <div className="mt-7 grid grid-cols-2 gap-3"><Metric label="GDP" value={formatMetric(record.gdp)} /><Metric label="一般预算收入" value={formatMetric(record.generalBudgetRevenue)} /><Metric label="基金收入" value={formatMetric(record.governmentFundRevenue)} /><Metric label="窄口径债务率" value={formatMetric(record.debtRatio, '%')} /><Metric label="宽口径债务率" value={formatMetric(record.adjustedDebtRatio, '%')} /></div>
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h4 className="text-sm font-semibold text-white">规则洞察</h4><div className="mt-3 space-y-3">{insights.map((item) => <div key={item} className="flex gap-2 text-sm leading-6 text-slate-300"><ChevronRight className="mt-1 h-4 w-4 flex-none text-cyan-400" />{item}</div>)}</div></section>
    <section className="mt-7"><h4 className="mb-3 text-sm font-semibold text-white">历史记录</h4><div className="space-y-2">{metadata.years.map((itemYear) => { const item = history.find((candidate) => candidate.year === itemYear); return <div key={itemYear} className="grid grid-cols-[55px_1fr_1fr] gap-3 rounded-lg border border-white/[0.06] px-3 py-2 text-xs"><span className="font-mono text-cyan-300">{itemYear}</span><span className="text-slate-400">GDP {formatMetric(item?.gdp ?? null)}</span><span className="text-slate-400">一般预算 {formatMetric(item?.generalBudgetRevenue ?? null)}</span></div>; })}</div></section>
    <div className="mt-7 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">来源：{metadata.sourceWorkbook}<br/>原始空值和不可确认的零值不参与计算。</div>
  </aside></div>;
}

function Kpi({ label, value }: { label: string; value: string }) { return <div className="bg-slate-950/80 px-4 py-3"><div className="font-mono text-xl text-white">{value}</div><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[11px] text-slate-500">{label}</div><div className="mt-2 font-mono text-lg text-white">{value}</div></div>; }
function ChartShell({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-slate-950/55 p-5"><h3 className="mb-3 font-semibold text-white">{title}</h3>{children}</section>; }
