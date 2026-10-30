import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Database, FileSpreadsheet } from 'lucide-react';
import { loadCityMetadata } from '@/lib/cityData';
import type { CityMetadata } from '@/types/city';
import { debtBasisNote, finance2025Note } from '@/data/debtRefresh';

export function DataQualityDashboard() {
  const [metadata, setMetadata] = useState<CityMetadata | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCityMetadata().then(setMetadata).catch((reason) => setError(String(reason)));
  }, []);

  if (error) return <div className="p-8 text-red-300">{error}</div>;
  if (!metadata) return <div className="p-8 text-slate-400">正在读取数据质量报告…</div>;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Data provenance</p>
            <h2 className="text-3xl font-semibold text-white">数据质量与来源</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">缺失值不会按零处理，也不会进入排名、同比和比率计算。</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">省级当前地图：{debtBasisNote} {finance2025Note} 地市视图按所选年度匹配同年末城投债务；未匹配地区显示缺失。地市综合财力沿用原库口径。</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400"><FileSpreadsheet className="h-4 w-4" />{metadata.sourceWorkbook}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <QualityCard icon={<Database />} label="年度范围" value={`${metadata.years[0]}—${metadata.years.at(-1)}`} />
          <QualityCard icon={<CheckCircle2 />} label="最新年度完整记录" value={`${metadata.coverage[metadata.defaultYear].completeCore} 个`} />
          <QualityCard icon={<AlertTriangle />} label="质量原则" value="缺失值不补零" />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.04] text-slate-300"><tr><th className="px-5 py-4 text-left">年份</th><th>地区记录</th><th>GDP有效</th><th>一般预算收入有效</th><th>基金收入有效</th><th>三项完整</th><th>完整率</th></tr></thead>
            <tbody>
              {metadata.years.map((year) => {
                const coverage = metadata.coverage[year];
                const rate = coverage.completeCore / coverage.records;
                return <tr key={year} className="border-t border-white/[0.06] text-center text-slate-300">
                  <td className="px-5 py-4 text-left font-mono text-cyan-300">{year}</td>
                  <td>{coverage.records}</td><td>{coverage.metricCoverage.gdp}</td><td>{coverage.metricCoverage.generalBudgetRevenue}</td><td>{coverage.metricCoverage.governmentFundRevenue}</td><td>{coverage.completeCore}</td>
                  <td><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-cyan-300">{(rate * 100).toFixed(1)}%</span></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function QualityCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
    <div className="mb-5 h-5 w-5 text-cyan-400">{icon}</div><div className="text-xs uppercase tracking-wider text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div>
  </div>;
}
