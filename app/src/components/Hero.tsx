import { motion } from 'framer-motion';
import { Shield, MapPin, BarChart3 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative max-w-[1400px] mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
        >
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">华泰固收团队 · 官方数据 · 实时更新</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          全国地方债务
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            监测平台
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          全国各省地方债券、城投债务数据可视化分析，助力风险监测与决策支持
        </motion.p>

        {/* Stats badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-wrap justify-center gap-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-white/5">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">覆盖31省市</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-white/5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">实时数据更新</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-white/5">
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-gray-300">多维度分析</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
