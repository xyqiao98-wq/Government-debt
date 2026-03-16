import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { debtStructureData } from '@/data/debtData';
import { PieChart as PieIcon } from 'lucide-react';

export function PieChart() {
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
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color};"></span>
              <span style="color:#9ca3af;">金额 (2024年末):</span>
              <span style="font-weight:600;">${params.value}万亿元</span>
              <span style="color:#9ca3af;">占比:</span>
              <span style="font-weight:600;">${params.percent}%</span>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          color: '#9ca3af',
        },
      },
      series: [
        {
          name: '债务结构',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#111827',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: debtStructureData.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
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
      transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl bg-[#111827] border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <PieIcon className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">债务结构</h3>
        <span className="text-xs text-gray-500">(2024年末)</span>
      </div>
      <div ref={chartRef} className="w-full h-[280px]" />
    </motion.div>
  );
}
