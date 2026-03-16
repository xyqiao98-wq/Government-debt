import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debtPolicies } from '@/data/policyData';
import { Calendar, ChevronDown, ChevronUp, FileText, Tag } from 'lucide-react';

// 格式化日期显示：从 "2023-09" 到 "2023年9月"
const formatDateDisplay = (dateStr: string): string => {
  const [year, month] = dateStr.split('-');
  const monthNum = parseInt(month, 10);
  return `${year}年${monthNum}月`;
};

// 获取简化的文号显示：如 "35号文"
const getDocumentShort = (documentNumber: string): string => {
  const match = documentNumber.match(/(\d+)号/);
  if (match) {
    return `${match[1]}号文`;
  }
  return documentNumber;
};

// 获取政策类型标签和颜色（深色主题）
const getPolicyTypeInfo = (category: string) => {
  switch (category) {
    case 'guideline':
      return {
        label: '', // 空字符串，不显示分类标签
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/100/10',
        borderColor: 'border-blue-500/20',
      };
    case 'regulation':
      return {
        label: '',
        color: 'text-red-300',
        bgColor: 'bg-red-500/100/10',
        borderColor: 'border-red-500/20',
      };
    case 'notice':
      return {
        label: '',
        color: 'text-emerald-300',
        bgColor: 'bg-emerald-500/100/10',
        borderColor: 'border-emerald-500/20',
      };
    case 'directive':
      return {
        label: '',
        color: 'text-purple-300',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
      };
    default:
      return {
        label: '',
        color: 'text-gray-300',
        bgColor: 'bg-white/50/10',
        borderColor: 'border-gray-500/20',
      };
  }
};

// 按日期排序（最新在前）
const sortedPolicies = [...debtPolicies].sort((a, b) => b.date.localeCompare(a.date));

export function PolicyTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* 标题区 */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-white mb-4">化债政策脉络梳理</h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          2023年以来化债政策脉络
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span className="text-sm">数据更新至2025年11月</span>
          <span className="text-gray-300 mx-2">•</span>
          <FileText className="w-5 h-5" />
          <span className="text-sm">共 {sortedPolicies.length} 项政策文件</span>
        </div>
      </div>

      {/* 时间线容器 */}
      <div className="relative">
        {/* 左侧时间轴线 */}
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-gray-500/30 to-transparent" />

        {/* 政策卡片列表 */}
        <div className="space-y-16 md:space-y-24 ml-8 md:ml-24">
          {sortedPolicies.map((policy, index) => {
            const policyType = getPolicyTypeInfo(policy.category);
            const isExpanded = expandedId === policy.id;
            const formattedDate = formatDateDisplay(policy.date);
            const documentShort = getDocumentShort(policy.documentNumber);

            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* 时间轴节点 */}
                <div className="absolute -left-11 md:-left-24 top-6 w-6 h-6 rounded-full bg-[#1a1f2e] border-4 border-blue-500 shadow-md z-10" />

                {/* 政策卡片 */}
                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  {/* 卡片头部 - 始终可见 */}
                  <button
                    onClick={() => toggleExpand(policy.id)}
                    className="w-full p-8 text-left focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-inset"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* 左侧：日期和基本信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="px-4 py-1.5 rounded-full bg-blue-500/100/10 border border-blue-500/20">
                            <span className="text-blue-300 font-medium text-sm">
                              {formattedDate}
                            </span>
                          </div>
                          {policyType.label && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${policyType.bgColor} ${policyType.color} ${policyType.borderColor} border`}>
                              <Tag className="w-3 h-3 inline mr-1.5" />
                              {policyType.label}
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {policy.title}
                        </h3>
                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="text-sm bg-white/5 text-gray-300 px-3 py-1 rounded-md">
                            {policy.documentNumber}
                          </span>
                          <span className="text-sm">发文机关：{policy.issuingAuthority}</span>
                        </div>
                      </div>

                      {/* 右侧：展开按钮和文号简称 */}
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                          <span className="text-gray-300 font-medium">{documentShort}</span>
                        </div>
                        <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-500/100/20 text-blue-300' : 'bg-white/10 text-gray-400'}`}>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* 展开内容 - 动画显示 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-8 pt-6">
                          {/* 核心要点 */}
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500/100" />
                              核心政策要点
                            </h4>
                            <ul className="space-y-3">
                              {policy.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-300 flex items-center justify-center text-sm font-medium mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <span className="text-gray-300 leading-relaxed">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 政策影响和相关信息 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                            <div>
                              <h5 className="text-sm font-medium text-gray-400 mb-2">政策影响程度</h5>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                policy.impactLevel === 'high'
                                  ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                  : policy.impactLevel === 'medium'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              }`}>
                                {policy.impactLevel === 'high' ? '高影响' :
                                 policy.impactLevel === 'medium' ? '中影响' : '低影响'}
                              </div>
                            </div>

                            {policy.relatedProvinces && policy.relatedProvinces.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-400 mb-2">相关地区</h5>
                                <div className="flex flex-wrap gap-2">
                                  {policy.relatedProvinces.map((province, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm border border-white/10"
                                    >
                                      {province}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 连接线（除了最后一项） */}
                {index < sortedPolicies.length - 1 && (
                  <div className="absolute -left-11 md:-left-24 top-32 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="mt-20 pt-8 border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          本时间线梳理了2023年以来中国地方政府债务化解与监管的主要政策文件。
          点击卡片可查看详细政策要点，按时间顺序排列，最新政策在前。
        </p>
      </div>
    </div>
  );
}