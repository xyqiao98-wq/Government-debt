import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts';
import { provinceDebtData, getDebtHeatmapColor, getRiskColor, getRiskText } from '@/data/debtData';
import { MapPin, AlertCircle, X, TrendingUp, Users, Building2 } from 'lucide-react';

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

// 省份名片组件 - 悬停时显示
interface ProvinceCardProps {
  province: typeof provinceDebtData[0] | null;
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
              backgroundColor: `${getRiskColor(province.riskLevel)}30`,
              color: getRiskColor(province.riskLevel),
            }}
          >
            {getRiskText(province.riskLevel)}
          </span>
        </div>

        {/* 债务数据 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">政府性债务</div>
            <div className="text-sm font-semibold text-white">{(province.localBondBalance / 10000).toFixed(2)}万亿</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">城投债务</div>
            <div className="text-sm font-semibold text-white">{(province.cityInvestDebt / 10000).toFixed(2)}万亿</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">窄口径债务率</div>
            <div className="text-sm font-semibold" style={{ color: getDebtHeatmapColor(province.debtRatio) }}>
              {province.debtRatio.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">宽口径债务率</div>
            <div className="text-sm font-semibold" style={{ color: getDebtHeatmapColor(province.adjustedDebtRatio) }}>
              {province.adjustedDebtRatio.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 经济数据 */}
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400">GDP:</span>
            <span className="text-white font-medium">{(province.gdp2025! / 10000).toFixed(2)}万亿</span>
            <span className="text-xs text-gray-500">(第{province.gdp2025Rank}名)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">人口:</span>
            <span className="text-white font-medium">{province.population}万人</span>
            <span className="text-xs text-gray-500">(第{province.populationRank}名)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-violet-400" />
            <span className="text-gray-400">上市公司:</span>
            <span className="text-white font-medium">{province.listedCompanies}家</span>
            <span className="text-xs text-gray-500">(第{province.listedCompaniesRank}名)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 省份详情侧边栏
interface ProvinceDetailProps {
  province: typeof provinceDebtData[0] | null;
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
            <p className="text-sm text-gray-500 mt-1">数据口径：2024年末</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Risk Level Badge */}
        <div className="mb-6">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getRiskColor(province.riskLevel)}20`,
              color: getRiskColor(province.riskLevel),
            }}
          >
            {getRiskText(province.riskLevel)}
          </span>
        </div>

        {/* Debt Data */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">债务数据 (2024年末)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">政府性债务</div>
              <div className="text-base font-semibold text-white">{(province.localBondBalance / 10000).toFixed(2)}万亿</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">城投带息债务</div>
              <div className="text-base font-semibold text-white">{(province.cityInvestDebt / 10000).toFixed(2)}万亿</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">总债务</div>
              <div className="text-base font-semibold text-white">{(province.totalDebt / 10000).toFixed(2)}万亿</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province.totalDebtRank}名</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">综合财力</div>
              <div className="text-base font-semibold text-white">{(province.comprehensiveFinance / 10000).toFixed(2)}万亿</div>
            </div>
          </div>
        </div>

        {/* Debt Ratio */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">债务率 (2024年末)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">窄口径债务率</div>
              <div className="text-base font-semibold" style={{ color: getDebtHeatmapColor(province.debtRatio) }}>
                {province.debtRatio.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">政府债务/综合财力</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">宽口径债务率</div>
              <div className="text-base font-semibold" style={{ color: getDebtHeatmapColor(province.adjustedDebtRatio) }}>
                {province.adjustedDebtRatio.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                全国第{province.adjustedDebtRatioRank ? (32 - province.adjustedDebtRatioRank) : '?'}高
              </div>
            </div>
          </div>
        </div>

        {/* Economic Data */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">经济数据 (2025年)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">GDP总量</div>
              <div className="text-base font-semibold text-white">{(province.gdp2025! / 10000).toFixed(2)}万亿</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province.gdp2025Rank}名</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">GDP增速</div>
              <div className="text-base font-semibold text-emerald-400">{province.gdpGrowth2025}%</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province.gdpGrowth2025Rank}名</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">2026年GDP目标</div>
              <div className="text-base font-semibold text-blue-400">{province.gdpTarget2026}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">2026年固投目标</div>
              <div className="text-base font-semibold text-blue-400">{province.investmentTarget2026}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">常住人口</div>
              <div className="text-base font-semibold text-white">{province.population}万人</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province.populationRank}名</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500 mb-1">A股上市公司</div>
              <div className="text-base font-semibold text-white">{province.listedCompanies}家</div>
              <div className="text-xs text-gray-500 mt-1">全国第{province.listedCompaniesRank}名</div>
            </div>
          </div>
        </div>

        {/* Industry Info */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">产业信息</h3>
          
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-500 mb-2">核心产业</div>
            <div className="text-sm text-white">{province.keyIndustries}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-500 mb-2">头部企业</div>
            <div className="text-sm text-white">{province.leadingCompanies}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ChinaMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<typeof provinceDebtData[0] | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<typeof provinceDebtData[0] | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    return provinceDebtData?.find(p => p.province === shortName);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
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

        echarts.registerMap('china', chinaGeoJson);

        // 再次检查组件是否仍挂载且元素存在
        if (!mounted || !chartRef.current) {
          return;
        }

        chartInstance.current = echarts.init(chartElement, 'dark', {
          renderer: 'canvas',
        });

        // 准备地图数据 - 使用调整后债务率进行着色
        // 过滤掉 provinceNameMap 中不存在的省份（如台湾、香港、澳门等）
        const mapData = (provinceDebtData?.filter(item => provinceNameMap[item?.province]) ?? []).map(item => ({
            name: getFullProvinceName(item?.province ?? ''),
            value: item?.adjustedDebtRatio ?? 0,
            itemStyle: {
              areaColor: getDebtHeatmapColor(item?.adjustedDebtRatio ?? 0),
            },
          }));

        const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          tooltip: {
            show: false,
          },
          visualMap: {
            type: 'piecewise',
            min: 0,
            max: 600,
            left: '20',
            bottom: '20',
            textStyle: {
              color: '#9ca3af',
            },
            pieces: [
              { min: 0, max: 150, label: '债务率偏低 (<150%)', color: '#10b981' },
              { min: 150, max: 250, label: '债务率适中 (150-250%)', color: '#f59e0b' },
              { min: 250, max: 400, label: '债务率偏高 (250-400%)', color: '#f97316' },
              { min: 400, label: '债务率较高 (>400%)', color: '#dc2626' },
            ],
          },
          series: [
            {
              name: '调整后债务率',
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
          const province = findProvinceByFullName(params?.name);
          if (province) {
            setHoveredProvince(province);
          }
        });

        chartInstance.current.on('mouseout', () => {
          setHoveredProvince(null);
        });

        // 点击事件
        chartInstance.current.on('click', (params: any) => {
          const province = findProvinceByFullName(params?.name);
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

  // 获取Top10省份（按调整后债务率）
  const top10Provinces = [...provinceDebtData ?? []]
    .sort((a, b) => (b?.adjustedDebtRatio ?? 0) - (a?.adjustedDebtRatio ?? 0))
    .slice(0, 10);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        id="map"
        className="py-16 px-6"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">各省债务分布</h2>
            <span className="text-sm text-gray-500 ml-4">按宽口径债务率着色 · 悬停查看名片 · 点击查看详情</span>
            <span className="text-xs text-gray-600 ml-auto">数据口径：2024年末</span>
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
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">宽口径债务率 Top 10</h3>
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
                            ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
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
                        style={{ color: getDebtHeatmapColor(province.adjustedDebtRatio) }}
                      >
                        {province.adjustedDebtRatio.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {(province.totalDebt / 10000).toFixed(1)}万亿
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
    </>
  );
}
