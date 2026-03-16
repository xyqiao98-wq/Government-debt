import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  change?: number;
  changeLabel?: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  delay?: number;
  dataYear?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  orange: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    gradient: 'from-amber-500 to-amber-600',
  },
  purple: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    gradient: 'from-violet-500 to-violet-600',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    gradient: 'from-red-500 to-red-600',
  },
};

export function StatCard({
  title,
  value,
  unit,
  change,
  changeLabel = '同比',
  color,
  delay = 0,
  dataYear = '2024',
}: StatCardProps) {
  const animatedValue = useCountUp(value, 2000, 0, 1);
  const colors = colorMap[color];

  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-400';
    if (change > 0) return 'text-red-400';
    if (change < 0) return 'text-emerald-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden rounded-xl bg-[#111827] border border-white/5 p-6 cursor-pointer group`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

      {/* Hover glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.bg}`} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-400">{title}</h3>
          <span className="text-xs text-gray-600">({dataYear})</span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl font-bold text-white tabular-nums">
            {animatedValue.toLocaleString('zh-CN')}
          </span>
          <span className={`text-sm font-medium ${colors.text}`}>{unit}</span>
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}
      </div>

      {/* Decorative corner */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${colors.bg} blur-2xl opacity-50`} />
    </motion.div>
  );
}
