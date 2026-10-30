import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyRegion,
  normalizeMetric,
  normalizeProvince,
  normalizeValue,
  parseYear,
} from './build-city-data.mjs';

test('normalizes province suffixes and autonomous-region names', () => {
  assert.equal(normalizeProvince('广西壮族自治区'), '广西');
  assert.equal(normalizeProvince('安徽省'), '安徽');
  assert.equal(normalizeProvince('北京'), '北京');
});

test('classifies prefecture and special directly administered regions', () => {
  assert.equal(classifyRegion('四川', '阿坝藏族羌族自治州'), 'autonomous_prefecture');
  assert.equal(classifyRegion('内蒙古', '锡林郭勒盟'), 'league');
  assert.equal(classifyRegion('湖北', '仙桃市'), 'province_direct_county');
  assert.equal(classifyRegion('新疆', '石河子市'), 'corps_city');
  assert.equal(classifyRegion('广东', '广州市'), 'prefecture_city');
});

test('converts missing placeholders and zero to null', () => {
  assert.equal(normalizeValue(''), null);
  assert.equal(normalizeValue('-'), null);
  assert.equal(normalizeValue(0), null);
  assert.equal(normalizeValue('1,234.5'), 1234.5);
});

test('discovers years and canonical metrics from workbook headers', () => {
  assert.equal(parseYear('2024年'), 2024);
  assert.equal(parseYear(2023), 2023);
  assert.equal(normalizeMetric('2024全市一般公共预算收入'), 'generalBudgetRevenue');
  assert.equal(normalizeMetric('GDP(亿元)'), 'gdp');
  assert.equal(normalizeMetric('2022调整后债务率'), 'adjustedDebtRatio');
});
