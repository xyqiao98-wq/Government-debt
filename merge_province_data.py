import csv
import json
import os

def read_csv_file(filepath):
    """读取CSV文件，处理BOM，返回行列表"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        return list(csv.reader(f))

def parse_macro_data(csv_rows):
    """解析宏观经济数据CSV"""
    # 第一行：年份行
    year_row = csv_rows[0]
    # 第二行：指标行
    metric_row = csv_rows[1]
    # 第三行开始：各省数据
    data_rows = csv_rows[2:]

    # 找到2024年的列索引
    # 每个年份组包含7个指标：GDP(亿元)、GDP(亿元)...实际上每个年份重复相同的指标
    # 但我们需要找到2024年对应的列组

    # 先打印前几列用于调试
    print("前10列年份:", year_row[:10])
    print("前10列指标:", metric_row[:10])

    # 查找包含"2024年"的列
    year_2024_indices = [i for i, cell in enumerate(year_row) if '2024' in cell]
    print(f"2024年列索引: {year_2024_indices}")

    # 每个年份组有7个指标
    # 指标顺序：GDP(亿元)、GDP增速(%)、固定资产投资增速(%)、一般公共预算收入(亿元)、政府性基金收入(亿元)、一般公共预算收入:税收收入(亿元)、政府性基金收入:土地出让收入(亿元)
    # 但实际可能更多，需要根据指标行确认

    # 构建指标映射
    # 对于每个2024年列组，找到对应的指标
    macro_data = {}

    for idx in year_2024_indices:
        # 获取该列组的指标名称
        metric = metric_row[idx] if idx < len(metric_row) else ''
        print(f"列{idx}: 指标 '{metric}'")

    # 简化：假设第一个2024年列是GDP(亿元)，第二个是GDP增速(%)，等等
    # 但根据文件结构，年份重复7次，每个年份组有7个指标

    # 重新分析结构：第一行有7个年份重复
    # 计数年份出现次数
    year_counts = {}
    for cell in year_row:
        if cell:
            year_counts[cell] = year_counts.get(cell, 0) + 1

    print(f"年份出现次数: {year_counts}")

    # 假设每个年份组有7个指标（如文件所示）
    # 找到2024年组的起始索引
    try:
        start_idx = year_row.index('2024年')
    except ValueError:
        # 尝试其他格式
        for i, cell in enumerate(year_row):
            if '2024' in cell:
                start_idx = i
                break
        else:
            start_idx = -1

    if start_idx == -1:
        print("未找到2024年数据")
        return {}

    print(f"2024年组起始索引: {start_idx}")

    # 提取指标映射
    metrics = []
    for i in range(7):  # 假设7个指标
        col_idx = start_idx + i
        if col_idx < len(metric_row):
            metrics.append((col_idx, metric_row[col_idx]))

    print(f"2024年指标映射: {metrics}")

    # 提取各省数据
    for row in data_rows:
        if not row or len(row) <= start_idx:
            continue

        province = row[0].strip()
        if not province:
            continue

        # 提取各指标值
        values = {}
        for col_idx, metric_name in metrics:
            if col_idx < len(row):
                value_str = row[col_idx].strip()
                # 清理数据：移除逗号、引号等
                value_str = value_str.replace(',', '').replace('"', '').replace("'", "")
                if value_str:
                    try:
                        # 尝试转换为浮点数
                        value = float(value_str)
                        values[metric_name] = value
                    except ValueError:
                        values[metric_name] = value_str

        macro_data[province] = values

    return macro_data

def parse_debt_data(csv_rows):
    """解析债务数据CSV"""
    # 第一行：年份行
    year_row = csv_rows[0]
    # 第二行：指标行
    metric_row = csv_rows[1]
    # 第三行开始：各省数据
    data_rows = csv_rows[2:]

    print("债务数据年份行前20列:", year_row[:20])
    print("债务数据指标行前20列:", metric_row[:20])

    # 找到2024年的列索引
    year_2024_indices = [i for i, cell in enumerate(year_row) if '2024' in cell]
    print(f"债务数据2024年列索引: {year_2024_indices}")

    # 债务数据每个年份组有10个指标
    # 指标顺序：全省一般公共预算收入、政府性基金收入、综合财力、政府性债务余额、地方政府债务限额、测算的政府债务率、城投带息债务余额、调整后债务率、政府债务率红橙黄绿、调整后债务率红橙黄绿

    # 找到2024年组的起始索引
    try:
        start_idx = year_row.index('2024年')
    except ValueError:
        for i, cell in enumerate(year_row):
            if '2024' in cell:
                start_idx = i
                break
        else:
            start_idx = -1

    if start_idx == -1:
        print("债务数据未找到2024年")
        return {}

    print(f"债务数据2024年组起始索引: {start_idx}")

    # 提取指标映射
    metrics = []
    for i in range(10):  # 10个指标
        col_idx = start_idx + i
        if col_idx < len(metric_row):
            metrics.append((col_idx, metric_row[col_idx]))

    print(f"债务数据2024年指标映射: {metrics}")

    debt_data = {}

    for row in data_rows:
        if not row or len(row) <= start_idx:
            continue

        province = row[0].strip()
        if not province:
            continue

        # 提取各指标值
        values = {}
        for col_idx, metric_name in metrics:
            if col_idx < len(row):
                value_str = row[col_idx].strip()
                # 清理数据：移除逗号、引号、空格、百分号等
                value_str = value_str.replace(',', '').replace('"', '').replace("'", "").replace(' ', '').replace('%', '')
                if value_str:
                    try:
                        # 尝试转换为浮点数
                        value = float(value_str)
                        values[metric_name] = value
                    except ValueError:
                        values[metric_name] = value_str

        debt_data[province] = values

    return debt_data

def merge_data(macro_data, debt_data):
    """合并宏观经济和债务数据"""
    merged = {}

    # 收集所有省份
    all_provinces = set(list(macro_data.keys()) + list(debt_data.keys()))

    for province in all_provinces:
        merged[province] = {
            'macro': macro_data.get(province, {}),
            'debt': debt_data.get(province, {})
        }

    return merged

def generate_typescript(merged_data):
    """生成TypeScript代码"""
    ts_lines = []
    ts_lines.append('// 2024年全国31个省份宏观经济与债务数据（合并版）')
    ts_lines.append('// 数据来源：')
    ts_lines.append('// 1. all_province_macro_data.csv - 宏观经济指标')
    ts_lines.append('// 2. 各省债务精简版数据.csv - 债务指标')
    ts_lines.append('// 生成时间：2026-03-13')
    ts_lines.append('')
    ts_lines.append('export interface ProvinceMacroData {')
    ts_lines.append('  // 宏观经济指标')
    ts_lines.append('  gdp: number;                // GDP总量（亿元）')
    ts_lines.append('  gdpGrowth: number;         // GDP增速（%）')
    ts_lines.append('  fixedAssetInvestmentGrowth?: number; // 固定资产投资增速（%）')
    ts_lines.append('  fiscalRevenue: number;     // 一般公共预算收入（亿元）')
    ts_lines.append('  govFundRevenue: number;    // 政府性基金收入（亿元）')
    ts_lines.append('  taxRevenue: number;        // 税收收入（亿元）')
    ts_lines.append('  landTransferRevenue?: number; // 土地出让收入（亿元）')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export interface ProvinceDebtData {')
    ts_lines.append('  // 债务指标')
    ts_lines.append('  fiscalRevenue: number;     // 全省一般公共预算收入（亿元）')
    ts_lines.append('  govFundRevenue: number;    // 政府性基金收入（亿元）')
    ts_lines.append('  comprehensiveFinance: number; // 综合财力（亿元）')
    ts_lines.append('  govDebtBalance: number;   // 政府性债务余额（亿元）')
    ts_lines.append('  localDebtLimit: number;   // 地方政府债务限额（亿元）')
    ts_lines.append('  govDebtRatio: number;     // 测算的政府债务率（%）')
    ts_lines.append('  cityInvestDebt: number;   // 城投带息债务余额（亿元）')
    ts_lines.append('  adjustedDebtRatio: number; // 调整后债务率（%）')
    ts_lines.append('  govDebtRiskColor: string; // 政府债务率红橙黄绿')
    ts_lines.append('  adjustedDebtRiskColor: string; // 调整后债务率红橙黄绿')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export interface ProvinceMasterData {')
    ts_lines.append('  province: string;')
    ts_lines.append('  year: number;')
    ts_lines.append('  macro: ProvinceMacroData;')
    ts_lines.append('  debt: ProvinceDebtData;')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('// 2024年各省份完整数据')
    ts_lines.append('export const provinceStatsMaster: ProvinceMasterData[] = [')

    # 按省份名称排序
    sorted_provinces = sorted(merged_data.keys())

    for province in sorted_provinces:
        data = merged_data[province]
        macro = data['macro']
        debt = data['debt']

        # 提取宏观经济数据
        gdp = macro.get('GDP(亿元)', 0)
        gdp_growth = macro.get('GDP增速(%)', 0)
        fiscal_revenue_macro = macro.get('一般公共预算收入(亿元)', 0)
        gov_fund_revenue_macro = macro.get('政府性基金收入(亿元)', 0)
        tax_revenue = macro.get('一般公共预算收入:税收收入(亿元)', 0)
        land_transfer = macro.get('政府性基金收入:土地出让收入(亿元)', 0)
        investment_growth = macro.get('固定资产投资增速(%)', 0)

        # 提取债务数据
        fiscal_revenue_debt = debt.get('全省一般公共预算收入', 0)
        gov_fund_revenue_debt = debt.get('政府性基金收入', 0)
        comprehensive_finance = debt.get('综合财力', 0)
        gov_debt_balance = debt.get('政府性债务余额', 0)
        local_debt_limit = debt.get('地方政府债务限额', 0)
        gov_debt_ratio = debt.get('测算的政府债务率', 0)
        city_invest_debt = debt.get('城投带息债务余额', 0)
        adjusted_debt_ratio = debt.get('调整后债务率', 0)
        gov_debt_risk_color = debt.get('政府债务率红橙黄绿', '')
        adjusted_debt_risk_color = debt.get('调整后债务率红橙黄绿', '')

        # 转换字符串为实际字符串
        if isinstance(gov_debt_risk_color, (int, float)):
            gov_debt_risk_color = str(gov_debt_risk_color)
        if isinstance(adjusted_debt_risk_color, (int, float)):
            adjusted_debt_risk_color = str(adjusted_debt_risk_color)

        ts_lines.append('  {')
        ts_lines.append(f'    province: "{province}",')
        ts_lines.append('    year: 2024,')
        ts_lines.append('    macro: {')
        ts_lines.append(f'      gdp: {gdp},')
        ts_lines.append(f'      gdpGrowth: {gdp_growth},')
        if investment_growth:
            ts_lines.append(f'      fixedAssetInvestmentGrowth: {investment_growth},')
        ts_lines.append(f'      fiscalRevenue: {fiscal_revenue_macro},')
        ts_lines.append(f'      govFundRevenue: {gov_fund_revenue_macro},')
        ts_lines.append(f'      taxRevenue: {tax_revenue},')
        if land_transfer:
            ts_lines.append(f'      landTransferRevenue: {land_transfer},')
        ts_lines.append('    },')
        ts_lines.append('    debt: {')
        ts_lines.append(f'      fiscalRevenue: {fiscal_revenue_debt},')
        ts_lines.append(f'      govFundRevenue: {gov_fund_revenue_debt},')
        ts_lines.append(f'      comprehensiveFinance: {comprehensive_finance},')
        ts_lines.append(f'      govDebtBalance: {gov_debt_balance},')
        ts_lines.append(f'      localDebtLimit: {local_debt_limit},')
        ts_lines.append(f'      govDebtRatio: {gov_debt_ratio},')
        ts_lines.append(f'      cityInvestDebt: {city_invest_debt},')
        ts_lines.append(f'      adjustedDebtRatio: {adjusted_debt_ratio},')
        ts_lines.append(f'      govDebtRiskColor: "{gov_debt_risk_color}",')
        ts_lines.append(f'      adjustedDebtRiskColor: "{adjusted_debt_risk_color}",')
        ts_lines.append('    },')
        ts_lines.append('  },')

    ts_lines.append('];')
    ts_lines.append('')
    ts_lines.append('// 按省份名称查找数据')
    ts_lines.append('export function getProvinceData(provinceName: string): ProvinceMasterData | undefined {')
    ts_lines.append('  return provinceStatsMaster.find(p => p.province === provinceName);')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('// 获取所有省份名称')
    ts_lines.append('export function getAllProvinceNames(): string[] {')
    ts_lines.append('  return provinceStatsMaster.map(p => p.province);')
    ts_lines.append('}')

    return '\n'.join(ts_lines)

def main():
    # 文件路径
    macro_file = 'all_province_macro_data.csv'
    debt_file = '各省债务精简版数据.csv'

    # 读取CSV文件
    print(f"正在读取宏观经济数据文件: {macro_file}")
    macro_rows = read_csv_file(macro_file)
    print(f"宏观经济数据行数: {len(macro_rows)}")

    print(f"正在读取债务数据文件: {debt_file}")
    debt_rows = read_csv_file(debt_file)
    print(f"债务数据行数: {len(debt_rows)}")

    # 解析数据
    print("\n解析宏观经济数据...")
    macro_data = parse_macro_data(macro_rows)
    print(f"解析到 {len(macro_data)} 个省份的宏观经济数据")

    print("\n解析债务数据...")
    debt_data = parse_debt_data(debt_rows)
    print(f"解析到 {len(debt_data)} 个省份的债务数据")

    # 合并数据
    merged_data = merge_data(macro_data, debt_data)
    print(f"\n合并后数据包含 {len(merged_data)} 个省份")

    # 生成TypeScript代码
    ts_code = generate_typescript(merged_data)

    # 输出到文件
    output_file = 'src/data/provinceStats_master.ts'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"\nTypeScript文件已生成: {output_file}")

    # 打印前几个省份的数据摘要
    print("\n前5个省份数据摘要:")
    sorted_provinces = sorted(merged_data.keys())
    for i, province in enumerate(sorted_provinces[:5]):
        data = merged_data[province]
        print(f"{i+1}. {province}:")
        print(f"   宏观经济: GDP={data['macro'].get('GDP(亿元)', 'N/A')}亿元")
        print(f"   债务: 政府债务余额={data['debt'].get('政府性债务余额', 'N/A')}亿元")

if __name__ == '__main__':
    main()