import { useState } from 'react';
import { motion } from 'framer-motion';
import { provinceDebtData } from '@/data/debtData';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function DebtPolicyTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = provinceDebtData.filter(item => 
    item.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.debtPolicy2026?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      id="policy"
      className="py-16 px-6"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">2026年各省债务政策核心表述</h2>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="搜索省份或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111827] border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <motion.div
              key={item.province}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="rounded-xl bg-[#111827] border border-white/5 p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{item.province}</h3>
                <span className="text-xs text-gray-500">来源：2026年政府工作报告</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {item.debtPolicy2026}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>共 {filteredData.length} 个省份</span>
          <span>数据来源：各省2026年政府工作报告 · 华泰固收团队整理</span>
        </div>
      </div>
    </motion.section>
  );
}
