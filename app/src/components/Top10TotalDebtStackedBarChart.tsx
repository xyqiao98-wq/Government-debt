import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { provinceDebtData } from '@/data/debtData';
import { Layers } from 'lucide-react';

export function Top10TotalDebtStackedBarChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark', {
      renderer: 'canvas',
    });

    // 获取总债务最高的10个省份
    const topTotalDebtProvinces = [...provinceDebtData]
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, 10);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        textStyle: {
          color: '#f9fafb',
        },
        formatter: (params: any) => {
          let result = `<div style="font-weight:600;margin-bottom:8px;">${params[0].name}</div>`;
          let total = 0;
          params.forEach((item: any) => {
            result += `
              <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};"></span>
                <span style="color:#9ca3af;">${item.seriesName}:</span>
                <span style="font-weight:600;">${item.value.toLocaleString()}亿元</span>
              </div>
            `;
            total += item.value;
          });
          result += `
            <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:8px;padding-top:8px;">
              <span style="color:#9ca3af;">总债务:</span>
              <span style="font-weight:600;color:#fff;">${total.toLocaleString()}亿元</span>
            </div>
          `;
          return result;
        },
      },
      legend: {
        data: ['政府性债务', '城投带息债务'],
        top: 10,
        right: 10,
        textStyle: {
          color: '#9ca3af',
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
        data: topTotalDebtProvinces.map(item => item.province),
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
        name: '亿元',
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
          name: '政府性债务',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: topTotalDebtProvinces.map(item => item.localBondBalance),
        },
        {
          name: '城投带息债务',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#dc2626' },
              { offset: 1, color: '#991b1b' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: topTotalDebtProvinces.map(item => item.cityInvestDebt),
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
      transition={{ duration: 0.6, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl bg-[#111827] border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">总债务规模 Top 10</h3>
        <span className="text-xs text-gray-500">(2024年末 · 亿元)</span>
      </div>
      <div ref={chartRef} className="w-full h-[280px]" />
    </motion.div>
  );
}