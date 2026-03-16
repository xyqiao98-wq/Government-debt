import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { provinceDebtData, getDebtHeatmapColor } from '@/data/debtData';
import { BarChart3 } from 'lucide-react';

export function BarChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 组件是否已挂载的标志
    let mounted = true;
    // 确保 DOM 元素存在
    const chartElement = chartRef.current;
    if (!chartElement) return;

    // 再次检查组件是否仍挂载
    if (!mounted) return;

    chartInstance.current = echarts.init(chartElement, 'dark', {
      renderer: 'canvas',
    });

    // 获取调整后债务率最高的10个省份
    const topDebtRatioProvinces = [...provinceDebtData]
      .sort((a, b) => b.adjustedDebtRatio - a.adjustedDebtRatio)
      .slice(0, 10);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        textStyle: {
          color: '#f9fafb',
        },
        formatter: (params: any) => {
          const item = params[0];
          return `
            <div style="font-weight:600;margin-bottom:8px;">${item.name}</div>
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};"></span>
              <span style="color:#9ca3af;">调整后债务率 (2024):</span>
              <span style="font-weight:600;color:#ef4444;">${item.value}%</span>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: topDebtRatioProvinces.map(item => item.province),
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisLabel: {
          color: '#9ca3af',
          rotate: 45,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        name: '%',
        nameTextStyle: {
          color: '#6b7280',
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#9ca3af',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
      series: [
        {
          name: '调整后债务率',
          type: 'bar',
          barWidth: '60%',
          data: topDebtRatioProvinces.map(item => ({
            value: item.adjustedDebtRatio,
            itemStyle: {
              color: getDebtHeatmapColor(item.adjustedDebtRatio),
              borderRadius: [4, 4, 0, 0],
            },
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl bg-[#111827] border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">债务风险 Top 10</h3>
        <span className="text-xs text-gray-500">(按宽口径债务率 · 2024年末)</span>
      </div>
      <div ref={chartRef} className="w-full h-[280px]" />
    </motion.div>
  );
}
