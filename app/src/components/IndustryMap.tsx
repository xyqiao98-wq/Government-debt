import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts';
import { enterpriseData } from '@/data/enterpriseData';
import { provinceStatsMaster } from '@/data/provinceStats_master';
import { provinceDebtData } from '@/data/debtData';
import { industryPolicy } from '@/data/industryPolicy2026';
import type { IndustryPolicy } from '@/data/industryPolicy2026';
import { Building2, X, Factory } from 'lucide-react';

// 省份名称映射：将简称映射为地图GeoJSON中的完整名称
const provinceNameMap: Record<string, string> = {
  '北京': '北京市',
  '天津': '天津市',
  '河北': '河北省',
  '山西': '山西省',
  '内蒙古': '内蒙古自治区',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '上海': '上海市',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '广西': '广西壮族自治区',
  '海南': '海南省',
  '重庆': '重庆市',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '西藏': '西藏自治区',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '台湾': '台湾省',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区',
};

// 企业数量颜色映射
const getEnterpriseColor = (count: number): string => {
  if (count < 50) return '#10b981';      // 绿色
  if (count < 150) return '#f59e0b';     // 黄色
  if (count < 300) return '#f97316';     // 橙色
  return '#dc2626';                      // 红色
};

// 省份名片组件 - 悬停时显示
interface ProvinceCardProps {
  province: typeof enterpriseData[0] | null;
  position: { x: number; y: number };
}

function ProvinceCard({ province, position }: ProvinceCardProps) {
  if (!province) return null;

  // 确保名片不会超出屏幕边界
  const cardWidth = 320;
  const cardHeight = 280;
  const adjustedX = Math.min(position.x + 20, window.innerWidth - cardWidth - 20);
  const adjustedY = Math.min(Math.max(position.y - 100, 20), window.innerHeight - cardHeight - 20);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: adjustedX,
        top: adjustedY,
        width: cardWidth
      }}
    >
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 shadow-2xl">
        {/* 省份名称 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">{province.province}</h3>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${getEnterpriseColor(province.listedCompanies)}30`,
              color: getEnterpriseColor(province.listedCompanies),
            }}
          >
            上市公司数量
          </span>
        </div>

        {/* 企业数据 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">上市公司数量</div>
            <div className="text-sm font-semibold text-white">{province?.listedCompanies ?? '-'}家</div>
            <div className="text-xs text-gray-500 mt-1">全国第{province?.listedCompaniesRank ?? '-'}名</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">总市值（估算）</div>
            <div className="text-sm font-semibold text-white">
              {province.totalMarketCap ? `${(province.totalMarketCap / 10000).toFixed(2)}万亿` : '暂无数据'}
            </div>
          </div>
        </div>

        {/* 行业信息 */}
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-sm">
            <Factory className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400">核心产业:</span>
            <span className="text-white font-medium truncate">{province?.keyIndustries ?? '暂无'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">头部企业:</span>
            <span className="text-white font-medium truncate">{province?.leadingCompanies ?? '暂无'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 省份详情侧边栏
interface ProvinceDetailProps {
  province: typeof enterpriseData[0] | null;
  onClose: () => void;
}

function ProvinceDetail({ province, onClose }: ProvinceDetailProps) {
  if (!province) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-16 bottom-0 w-full max-w-md bg-[#111827] border-l border-white/10 z-50 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{province.province}</h2>
            <p className="text-sm text-gray-500 mt-1">产业禀赋数据</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Enterprise Stats */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">上市公司数据</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">上市公司数量</div>
              <div className="text-base font-semibold text-white">{province?.listedCompanies ?? '-'}家</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province?.listedCompaniesRank ?? '-'}名</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">总市值（估算）</div>
              <div className="text-base font-semibold text-white">
                {province.totalMarketCap ? `${(province.totalMarketCap / 10000).toFixed(2)}万亿` : '暂无数据'}
              </div>
            </div>
          </div>
        </div>

        {/* Industry Info */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">产业信息</h3>

          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-500 mb-2">核心产业</div>
            <div className="text-sm text-white">{province?.keyIndustries ?? '暂无数据'}</div>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-500 mb-2">头部企业</div>
            <div className="text-sm text-white">{province?.leadingCompanies ?? '暂无数据'}</div>
          </div>
        </div>

        {/* Industry Distribution */}
        {province?.industryDistribution && Object.keys(province.industryDistribution).length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">行业分布（估算）</h3>
            <div className="space-y-2">
              {Object.entries(province.industryDistribution).map(([industry, percentage]) => (
                <div key={industry} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{industry}</span>
                  <span className="text-sm text-white font-medium">{percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="text-xs text-gray-500 mt-8">
          <p>注：市值数据为估算值，基于上市公司数量及行业平均市值计算。实际数据可能有所不同。</p>
        </div>
      </div>
    </motion.div>
  );
}

// 产业政策卡片组件
interface IndustryPolicyCardProps {
  province: string;
  tags: string[];
  desc: string;
  detail: string;
  onClick: () => void;
}

function IndustryPolicyCard({ province, tags, desc, detail: _detail, onClick }: IndustryPolicyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-[#1a1f2e] to-[#111827] border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-bold text-white">{province}</h3>
      </div>

      {/* 产业标签 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(tags?.slice(0, 4) ?? []).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
          >
            {tag}
          </span>
        ))}
        {(tags?.length ?? 0) > 4 && (
          <span className="px-2 py-1 text-xs text-gray-400">+{(tags?.length ?? 0) - 4}</span>
        )}
      </div>

      {/* 举措描述 */}
      <div className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
        {desc}
      </div>

      {/* 底部装饰 */}
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-xs text-gray-500">点击查看详情</span>
        <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
      </div>
    </motion.div>
  );
}

// 产业政策详情弹窗组件
interface DetailModalProps {
  policy: IndustryPolicy | null;
  onClose: () => void;
}

function DetailModal({ policy, onClose }: DetailModalProps) {
  if (!policy) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* 毛玻璃背景 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a1f2e]/90 to-[#111827]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{policy.province} 2026年产业发展规划</h2>
            <p className="text-sm text-gray-400 mt-1">基于2026年政府工作报告</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 重点产业标签 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">重点发展产业</h3>
            <div className="flex flex-wrap gap-2">
              {(policy?.tags ?? []).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm font-medium rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 具体举措 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">具体举措简述</h3>
            <p className="text-gray-300 leading-relaxed">{policy.desc}</p>
          </div>

          {/* 详细发展规划 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">详细发展规划</h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">{policy.detail}</p>
            </div>
          </div>

          {/* 数据说明 */}
          <div className="text-xs text-gray-500 pt-4 border-t border-white/10">
            <p>注：以上内容基于{policy.province} 2026年政府工作报告整理，具体实施以官方发布为准。</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function IndustryMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const economicChartRef = useRef<HTMLDivElement>(null);
  const capitalChartRef = useRef<HTMLDivElement>(null);
  const economicChartInstance = useRef<echarts.ECharts | null>(null);
  const capitalChartInstance = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<typeof enterpriseData[0] | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<typeof enterpriseData[0] | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedPolicy, setSelectedPolicy] = useState<IndustryPolicy | null>(null);

  // 获取完整省份名称
  const getFullProvinceName = (shortName: string): string => {
    return provinceNameMap[shortName] || shortName;
  };

  // 通过完整名称查找省份数据
  const findProvinceByFullName = (fullName: string) => {
    // 尝试逆向查找：从完整名称找到简称
    const shortName = Object.keys(provinceNameMap).find(
      key => provinceNameMap[key] === fullName
    ) || fullName;

    return enterpriseData.find(p => p.province === shortName);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePolicyClick = useCallback((policy: IndustryPolicy) => {
    setSelectedPolicy(policy);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    // 组件是否已挂载的标志
    let mounted = true;
    // 确保 DOM 元素存在
    const chartElement = chartRef.current;
    if (!chartElement) return;

    const initChart = async () => {
      try {
        const response = await fetch('/china.json');
        if (!response.ok) {
          throw new Error('Failed to load China map data');
        }
        const chinaGeoJson = await response.json();
        console.log('China GeoJSON loaded:', chinaGeoJson);

        echarts.registerMap('china', chinaGeoJson);

        // 再次检查组件是否仍挂载且元素存在
        if (!mounted || !chartRef.current) {
          return;
        }

        chartInstance.current = echarts.init(chartElement, 'dark', {
          renderer: 'canvas',
        });

        // 准备地图数据 - 使用上市公司数量进行着色
        // 过滤掉 provinceNameMap 中不存在的省份（如台湾、香港、澳门等）
        const mapData = enterpriseData
          .filter(item => provinceNameMap[item.province]) // 只映射有数据的省份
          .map(item => ({
            name: getFullProvinceName(item.province),
            value: item.listedCompanies,
            itemStyle: {
              areaColor: getEnterpriseColor(item.listedCompanies),
            },
          }));
        console.log('Industry Data Status:', enterpriseData);
        console.log('Map Data:', mapData);

        const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          tooltip: {
            show: false,
          },
          visualMap: {
            type: 'piecewise',
            min: 0,
            max: 900,
            left: '20',
            bottom: '20',
            textStyle: {
              color: '#9ca3af',
            },
            pieces: [
              { min: 0, max: 50, label: '企业较少 (<50家)', color: '#10b981' },
              { min: 50, max: 150, label: '企业中等 (50-150家)', color: '#f59e0b' },
              { min: 150, max: 300, label: '企业较多 (150-300家)', color: '#f97316' },
              { min: 300, label: '企业密集 (>300家)', color: '#dc2626' },
            ],
          },
          series: [
            {
              name: '上市公司数量',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.2,
              center: [105, 36],
              label: {
                show: true,
                fontSize: 10,
                color: '#fff',
                textBorderColor: 'transparent',
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 12,
                  fontWeight: 'bold',
                },
                itemStyle: {
                  areaColor: '#3b82f6',
                  shadowBlur: 20,
                  shadowColor: 'rgba(59, 130, 246, 0.5)',
                },
              },
              select: {
                itemStyle: {
                  areaColor: '#3b82f6',
                },
              },
              itemStyle: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
              },
              data: mapData,
            },
          ],
        };

        chartInstance.current.setOption(option);
        setLoading(false);

        // 鼠标悬停事件
        chartInstance.current.on('mouseover', (params: any) => {
          const province = findProvinceByFullName(params.name);
          if (province) {
            setHoveredProvince(province);
          }
        });

        chartInstance.current.on('mouseout', () => {
          setHoveredProvince(null);
        });

        // 点击事件
        chartInstance.current.on('click', (params: any) => {
          const province = findProvinceByFullName(params.name);
          if (province) {
            setSelectedProvince(province);
          }
        });

        const handleResize = () => {
          chartInstance.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chartInstance.current?.dispose();
        };
      } catch (error) {
        console.error('Failed to load map:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initChart();

    // 清理函数
    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 初始化经济对比图和资本实力图
  useEffect(() => {
    // 组件是否已挂载的标志
    let mounted = true;
    // 确保 DOM 元素存在
    const economicChartElement = economicChartRef.current;
    const capitalChartElement = capitalChartRef.current;
    if (!economicChartElement || !capitalChartElement) return;

    // 准备经济对比图数据：2025 GDP (Bar) 和 2024 税收收入 (Line)
    const economicData = provinceDebtData
      .map(item => {
        const provinceStat = provinceStatsMaster.find(p => p.province === item.province);
        return {
          province: item.province,
          gdp2025: item.gdp2025 ?? 0,
          taxRevenue2024: provinceStat?.macro.taxRevenue ?? 0,
        };
      })
      .filter(item => item.gdp2025 > 0 && item.taxRevenue2024 > 0)
      .sort((a, b) => b.gdp2025 - a.gdp2025); // 按GDP降序排列

    // 准备资本实力图数据：上市公司数量 (Bar)，按数值降序排列
    const capitalData = [...enterpriseData]
      .sort((a, b) => b.listedCompanies - a.listedCompanies);

    // 再次检查组件是否仍挂载且元素存在
    if (!mounted || !economicChartRef.current || !capitalChartRef.current) {
      return;
    }

    // 初始化经济对比图
    economicChartInstance.current = echarts.init(economicChartElement, 'dark', { renderer: 'canvas' });
    const economicOption: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: any) => {
          const gdpParam = params.find((p: any) => p.seriesName === '2025 GDP');
          const taxParam = params.find((p: any) => p.seriesName === '2024 税收收入');
          let result = `${params[0].name}<br/>`;
          if (gdpParam) result += `${gdpParam.marker} ${gdpParam.seriesName}: ${gdpParam.value.toLocaleString()} 亿元<br/>`;
          if (taxParam) result += `${taxParam.marker} ${taxParam.seriesName}: ${taxParam.value.toLocaleString()} 亿元`;
          return result;
        }
      },
      legend: {
        data: ['2025 GDP', '2024 税收收入'],
        textStyle: { color: '#9ca3af' },
        top: '10',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: economicData.map(item => item.province),
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#374151' } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: [
        {
          type: 'value',
          name: 'GDP (亿元)',
          nameTextStyle: { color: '#9ca3af' },
          axisLabel: { color: '#9ca3af' },
          axisLine: { lineStyle: { color: '#374151' } },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        {
          type: 'value',
          name: '税收收入 (亿元)',
          nameTextStyle: { color: '#9ca3af' },
          axisLabel: { color: '#9ca3af' },
          axisLine: { lineStyle: { color: '#374151' } },
          splitLine: { show: false },
        }
      ],
      series: [
        {
          name: '2025 GDP',
          type: 'bar',
          data: economicData.map(item => item.gdp2025),
          itemStyle: { color: '#3b82f6' },
          barWidth: '60%',
          yAxisIndex: 0,
        },
        {
          name: '2024 税收收入',
          type: 'line',
          data: economicData.map(item => item.taxRevenue2024),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
          yAxisIndex: 1,
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          bottom: '5%',
          height: 20,
          handleSize: '80%',
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          fillerColor: 'rgba(59, 130, 246, 0.2)',
          textStyle: { color: '#9ca3af' },
        }
      ],
    };
    economicChartInstance.current.setOption(economicOption);

    // 初始化资本实力图
    capitalChartInstance.current = echarts.init(capitalChartElement, 'dark', { renderer: 'canvas' });
    const capitalOption: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.marker} 上市公司数量: ${param.value.toLocaleString()} 家`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: capitalData.map(item => item.province),
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          rotate: 45,
        },
        axisLine: { lineStyle: { color: '#374151' } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        name: '上市公司数量 (家)',
        nameTextStyle: { color: '#9ca3af' },
        axisLabel: { color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#374151' } },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
      },
      series: [
        {
          name: '上市公司数量',
          type: 'bar',
          data: capitalData.map(item => item.listedCompanies),
          itemStyle: { color: '#8b5cf6' },
          barWidth: '60%',
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          bottom: '5%',
          height: 20,
          handleSize: '80%',
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          fillerColor: 'rgba(139, 92, 246, 0.2)',
          textStyle: { color: '#9ca3af' },
        }
      ],
    };
    capitalChartInstance.current.setOption(capitalOption);

    // 响应窗口大小变化
    const handleResize = () => {
      economicChartInstance.current?.resize();
      capitalChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (economicChartInstance.current) {
        economicChartInstance.current.dispose();
        economicChartInstance.current = null;
      }
      if (capitalChartInstance.current) {
        capitalChartInstance.current.dispose();
        capitalChartInstance.current = null;
      }
    };
  }, []);

  // 获取Top10省份（按上市公司数量）
  const top10Provinces = [...enterpriseData]
    .sort((a, b) => b.listedCompanies - a.listedCompanies)
    .slice(0, 10);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        id="industry-map"
        className="py-16 px-6"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">各省产业禀赋分布</h2>
            <span className="text-sm text-gray-500 ml-4">按上市公司数量着色 · 悬停查看名片 · 点击查看详情</span>
            <span className="text-xs text-gray-600 ml-auto">数据口径：2024年末</span>
          </div>

          {/* 顶部双图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 经济对比图 */}
            <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">经济对比图 (2025 GDP vs 2024 税收收入)</h3>
              <div ref={economicChartRef} className="w-full h-[300px]" />
            </div>
            {/* 资本实力图 */}
            <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">资本实力图 (上市公司数量)</h3>
              <div ref={capitalChartRef} className="w-full h-[300px]" />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 rounded-xl bg-[#111827] border border-white/5 p-4 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111827]">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>加载地图中...</span>
                  </div>
                </div>
              )}
              <div ref={chartRef} className="w-full h-[550px]" />
            </div>

            <div className="rounded-xl bg-[#111827] border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">上市公司 Top 10</h3>
              </div>
              <div className="text-xs text-gray-500 mb-4">数据口径：2024年末</div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {top10Provinces.map((province, index) => (
                  <div
                    key={province.province}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedProvince(province)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          index < 3
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-white">{province.province}</span>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: getEnterpriseColor(province.listedCompanies) }}
                      >
                        {province.listedCompanies}家
                      </div>
                      <div className="text-xs text-gray-500">
                        {province.totalMarketCap ? `${(province.totalMarketCap / 1000).toFixed(1)}千亿` : '市值估算中'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2026年产业规划卡片展示 */}
          <div className="mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">2026年各省产业规划概览</h2>
                <span className="text-sm text-gray-500 ml-4">基于各省2026年政府工作报告整理</span>
              </div>
              <p className="text-gray-400 mt-2 ml-4">点击卡片查看详细产业政策，支持标签筛选和搜索</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(industryPolicy ?? []).filter(policy => policy?.province && Array.isArray(policy?.tags)).map((policy) => (
                <IndustryPolicyCard
                  key={policy.province}
                  province={policy.province}
                  tags={policy?.tags ?? []}
                  desc={policy?.desc ?? ''}
                  detail={policy?.detail ?? ''}
                  onClick={() => handlePolicyClick(policy)}
                />
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>数据说明：产业规划数据基于各省公开的2026年政府工作报告整理，仅供参考。</p>
            </div>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {hoveredProvince && !selectedProvince && (
          <ProvinceCard
            province={hoveredProvince}
            position={mousePosition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProvince && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedProvince(null)}
            />
            <ProvinceDetail
              province={selectedProvince}
              onClose={() => setSelectedProvince(null)}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPolicy && (
          <DetailModal
            policy={selectedPolicy}
            onClose={() => setSelectedPolicy(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}