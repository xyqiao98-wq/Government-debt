import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { hiddenDebtData } from '@/data/debtData';
import { TrendingDown } from 'lucide-react';

export function HiddenDebtChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark', {
      renderer: 'canvas',
    });

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
            <div style="font-weight:600;margin-bottom:8px;">${item.axisValue}年</div>
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};"></span>
              <span style="color:#9ca3af;">隐债规模:</span>
              <span style="font-weight:600;">${item.value}万亿元</span>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: hiddenDebtData.map(item => item.year),
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisLabel: {
          color: '#9ca3af',
        },
      },
      yAxis: {
        type: 'value',
        name: '万亿元',
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
          name: '隐债规模',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#f59e0b',
          },
          itemStyle: {
            color: '#f59e0b',
            borderWidth: 2,
            borderColor: '#fff',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.01)' },
            ]),
          },
          data: hiddenDebtData.map(item => item.value),
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
      transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl bg-[#111827] border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">隐债规模变化</h3>
        <span className="text-xs text-gray-500">(2018-2025年)</span>
      </div>
      <div ref={chartRef} className="w-full h-[280px]" />
    </motion.div>
  );
}
