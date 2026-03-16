import { useMemo } from 'react';
import { Search, DollarSign, Building2, TrendingDown, Shield, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { provinceExpressions } from '@/data/provinceExpressions2026';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface ProvinceExpressionCardProps {
  expression: {
    province: string;
    hiddenDebtResolution: string;
    financingPlatformExit: string;
    riskLevelChange: string;
    otherMeasures: string;
  };
}

function ProvinceExpressionCard({ expression }: ProvinceExpressionCardProps) {
  const {
    province,
    hiddenDebtResolution,
    financingPlatformExit,
    riskLevelChange,
    otherMeasures
  } = expression;


  // 判断是否有内容
  const hasContent = [hiddenDebtResolution, financingPlatformExit, riskLevelChange, otherMeasures]
    .some(item => item && item !== '-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-gradient-to-br from-gray-800/40 via-gray-800/20 to-blue-900/10 border border-blue-500/30 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-300 overflow-hidden backdrop-blur-sm group">
        {/* 省份标题 */}
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-900/30 to-blue-800/10 border-b border-blue-500/20">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
            {province}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 隐性债务化解 */}
          {hiddenDebtResolution && hiddenDebtResolution !== '-' && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-blue-400" />
                </div>
                <h4 className="text-sm font-medium text-blue-300">隐性债务化解</h4>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed pl-1">
{hiddenDebtResolution}
              </p>
            </div>
          )}

          {/* 融资平台退出/转型 */}
          {financingPlatformExit && financingPlatformExit !== '-' && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-emerald-400" />
                </div>
                <h4 className="text-sm font-medium text-emerald-300">融资平台退出/转型</h4>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed pl-1">
{financingPlatformExit}
              </p>
            </div>
          )}

          {/* 风险等级变化 */}
          {riskLevelChange && riskLevelChange !== '-' && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 text-orange-400" />
                </div>
                <h4 className="text-sm font-medium text-orange-300">风险等级变化</h4>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed pl-1">
{riskLevelChange}
              </p>
            </div>
          )}

          {/* 其他化债举措 */}
          {otherMeasures && otherMeasures !== '-' && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-violet-900/20 to-violet-800/10 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-violet-400" />
                </div>
                <h4 className="text-sm font-medium text-violet-300">其他化债举措</h4>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed pl-1">
{otherMeasures}
              </p>
            </div>
          )}

          {/* 空状态 */}
          {!hasContent && (
            <div className="text-center py-6 p-3 rounded-lg bg-gradient-to-r from-gray-800/20 to-gray-700/10 border border-gray-600/20">
              <div className="w-10 h-10 rounded-full bg-gray-700/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm">暂无具体化债表述</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProvinceExpressionProps {
  searchQuery?: string;
}

export function ProvinceExpression({ searchQuery = '' }: ProvinceExpressionProps) {

  // 过滤省份
  const filteredExpressions = useMemo(() => {
    if (!searchQuery.trim()) {
      return provinceExpressions;
    }
    const query = searchQuery.toLowerCase().trim();
    return provinceExpressions.filter(expr =>
      expr.province.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0f1c]">

      {/* 瀑布流卡片布局 */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-blue-900/20 via-gray-800/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">2026年各省化债表述</h1>
          </div>
          <p className="text-gray-300 mb-2">
            收录各省关于隐性债务化解、融资平台退出、风险等级变化等化债表述
          </p>
          {searchQuery && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-sm">
              <Search className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">找到 <span className="font-semibold text-blue-300">{filteredExpressions.length}</span> 个结果</span>
            </div>
          )}
        </div>

        {/* 响应式网格布局 */}
        {filteredExpressions.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-xl bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/20 border border-gray-700/30 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-3">未找到匹配的省份</h3>
            <p className="text-gray-500 mb-6">请尝试其他搜索关键词</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <span className="text-sm text-blue-300">尝试搜索如：</span>
              <span className="text-sm text-gray-400">"北京"、"广东"、"江苏"</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExpressions.map((expression) => (
              <ProvinceExpressionCard
                key={expression.province}
                expression={expression}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}