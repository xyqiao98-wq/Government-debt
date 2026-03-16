import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { provinceDebtData, getDebtHeatmapColor } from '@/data/debtData';
import { ScatterChart as ScatterIcon } from 'lucide-react';

export function ScatterChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark', {
      renderer: 'canvas',
    });

    // 准备散点数据：综合财力 vs 调整后债务率
    const scatterData = provinceDebtData.map(item => ({
      name: item.province,
      value: [item.comprehensiveFinance, item.adjustedDebtRatio, item.totalDebt],
      itemStyle: {
        color: getDebtHeatmapColor(item.adjustedDebtRatio),
      },
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        textStyle: {
          color: '#f9fafb',
        },
        formatter: (params: any) => {
          return `
            <div style="font-weight:600;margin-bottom:8px;">${params.name}</div>
            <div style="display:grid;grid-template-columns:auto auto;gap:4px 12px;font-size:12px;">
              <span style="color:#9ca3af;">综合财力 (2024):</span>
              <span>${params.value[0].toLocaleString()}亿元</span>
              <span style="color:#9ca3af;">调整后债务率 (2024):</span>
              <span style="color:${getDebtHeatmapColor(params.value[1])};font-weight:600;">${params.value[1].toFixed(2)}%</span>
              <span style="color:#9ca3af;">总债务 (2024):</span>
              <span>${(params.value[2] / 10000).toFixed(2)}万亿</span>
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
        type: 'value',
        name: '综合财力(亿元)',
        nameTextStyle: {
          color: '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisLabel: {
          color: '#9ca3af',
          formatter: (value: number) => (value / 10000).toFixed(0) + '万',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '调整后债务率(%)',
        nameTextStyle: {
          color: '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
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
          name: '省份',
          type: 'scatter',
          symbolSize: (data: number[]) => {
            // 根据总债务大小调整点的大小
            const debt = data[2];
            return Math.max(8, Math.min(30, debt / 5000));
          },
          data: scatterData,
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl bg-[#111827] border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <ScatterIcon className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">财力与债务关系</h3>
        <span className="text-xs text-gray-500">(2024年末)</span>
      </div>
      <div ref={chartRef} className="w-full h-[280px]" />
    </motion.div>
  );
}
