import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';

export function Header() {
  // 生成当前年月
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() 返回 0-11
  const updateTime = `${currentYear}年${currentMonth}月`;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight">
              地方债务监测平台
            </h1>
            <span className="text-xs text-blue-400">华泰固收团队</span>
          </div>
        </div>


        {/* Update Time */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>最后更新: {updateTime}</span>
        </div>
      </div>
    </motion.header>
  );
}
