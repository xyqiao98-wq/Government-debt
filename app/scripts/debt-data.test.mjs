import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

// Compile only the data modules in memory, including on the deployment's Node 20.
const cache = new Map();
function loadData(name) {
  const filename = fileURLToPath(new URL(`../src/data/${name.replace(/\.ts$/, '')}.ts`, import.meta.url));
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const requireData = specifier => {
    assert.ok(specifier.startsWith('./'), `Unexpected data dependency: ${specifier}`);
    return loadData(specifier.slice(2));
  };
  new Function('require', 'module', 'exports', outputText)(requireData, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const { provinceDebtData, nationalOverview, trendData } = loadData('debtData');
const { cityInvestmentDebtByPeriod } = loadData('cityInvestmentDebt');
const { historicalDebtData } = loadData('historicalDebtData');
const { provinceStatsMaster } = loadData('provinceStats_master');
const { provinceStatsHistorical } = loadData('provinceStats_historical');
const { refreshAnnualDebt } = loadData('debtRefresh');
const { fiscal2025 } = loadData('fiscal2025');

const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('31 provinces reconcile to source national total, ratios and rankings', () => {
  assert.equal(provinceDebtData.length, 31);
  close(nationalOverview.cityInvestDebt, 70.30526043622972);
  close(nationalOverview.localBondBalance, 54.823196);
  close(Object.values(fiscal2025).reduce((s, p) => s + p.generalDebt, 0), 175123.66);
  close(Object.values(fiscal2025).reduce((s, p) => s + p.specialDebt, 0), 373108.30);
  close(provinceDebtData.reduce((sum, p) => sum + p.cityInvestDebt, 0) / 10000, nationalOverview.cityInvestDebt);
  const totalOrder = [...provinceDebtData].sort((a, b) => b.totalDebt - a.totalDebt);
  const ratioOrder = [...provinceDebtData].sort((a, b) => a.adjustedDebtRatio - b.adjustedDebtRatio);
  for (const p of provinceDebtData) {
    close(p.cityInvestDebt, cityInvestmentDebtByPeriod['2025-12-31'][p.province]);
    close(p.localBondBalance, fiscal2025[p.province].generalDebt + fiscal2025[p.province].specialDebt);
    close(p.comprehensiveFinance, fiscal2025[p.province].comprehensiveFinance);
    close(p.totalDebt, p.localBondBalance + p.cityInvestDebt);
    close(p.debtRatio, p.localBondBalance / p.comprehensiveFinance * 100);
    close(p.adjustedDebtRatio, p.totalDebt / p.comprehensiveFinance * 100);
    const annual = provinceStatsHistorical.find(item => item.province === p.province && item.year === 2025)?.debt;
    assert.ok(annual);
    close(annual.govDebtBalance, p.localBondBalance);
    close(annual.comprehensiveFinance, p.comprehensiveFinance);
    close(annual.cityInvestDebt, p.cityInvestDebt);
    close(annual.adjustedDebtRatio, p.adjustedDebtRatio);
    assert.equal(p.totalDebtRank, totalOrder.indexOf(p) + 1);
    assert.equal(p.adjustedDebtRatioRank, ratioOrder.indexOf(p) + 1);
  }
});

test('every historical provincial view uses same-year debt and recalculated ratios', () => {
  const records = [
    ...historicalDebtData.filter(Boolean).map(p => ({ province: p.province, year: p.year, debt: p })),
    ...provinceStatsMaster, ...provinceStatsHistorical,
  ];
  for (const { province, year, debt } of records) {
    close(debt.cityInvestDebt, cityInvestmentDebtByPeriod[`${year}-12-31`][province]);
    if (debt.comprehensiveFinance > 0 && debt.govDebtBalance > 0) {
      close(debt.govDebtRatio, debt.govDebtBalance / debt.comprehensiveFinance * 100);
      close(debt.adjustedDebtRatio, (debt.govDebtBalance + debt.cityInvestDebt) / debt.comprehensiveFinance * 100);
    } else {
      assert.equal(debt.govDebtRatio, 0);
      assert.equal(debt.adjustedDebtRatio, 0);
      assert.equal(debt.adjustedDebtRiskColor, '');
    }
  }
});

test('missing historical finance is not substituted and current periods are all 2025', () => {
  const p = refreshAnnualDebt('江苏', 2024, { govDebtBalance: 0, comprehensiveFinance: 0, cityInvestDebt: 0, govDebtRatio: 0, adjustedDebtRatio: 0, govDebtRiskColor: '', adjustedDebtRiskColor: '' });
  assert.ok(p.cityInvestDebt > 0);
  assert.equal(p.adjustedDebtRatio, 0);
  assert.equal(trendData.at(-1).year, '2025');
  assert.equal(cityInvestmentDebtByPeriod['2026-06-30'], undefined);
  close(trendData.at(-1).govDebt, nationalOverview.localBondBalance);
  close(trendData.find(p => p.year === '2025').ctDebt, 70.30526043622972);
});

test('all generated city ratios are percentages, with missing inputs excluded', () => {
  for (let year = 2019; year <= 2024; year += 1) {
    const records = JSON.parse(fs.readFileSync(path.join(appDir, 'public/data/cities', `${year}.json`)));
    for (const p of records) {
      if (p.debtRatio !== null) close(p.debtRatio, p.governmentDebt / p.comprehensiveFinance * 100, 0.05);
      if (p.adjustedDebtRatio !== null) close(p.adjustedDebtRatio, (p.governmentDebt + p.cityInvestmentDebt) / p.comprehensiveFinance * 100, 0.05);
      if (p.comprehensiveFinance === null || p.comprehensiveFinance <= 0 || p.governmentDebt === null || p.cityInvestmentDebt === null) assert.equal(p.adjustedDebtRatio, null);
    }
  }
});
