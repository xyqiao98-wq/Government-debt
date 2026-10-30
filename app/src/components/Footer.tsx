import { motion } from 'framer-motion';
import { Database, Shield, AlertTriangle } from 'lucide-react';
import { fiscal2025Sources } from '@/data/fiscal2025';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 px-6 border-t border-white/10"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Data sources */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">数据来源</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>各省历年预算执行报告；2025年政府债务采用财政部决算</li>
                <li>各省财政厅公开数据</li>
                <li>国家统计局</li>
                <li>Wind金融终端</li>
                <li>华泰固收城投有息债务数据库（20260630）</li>
                <li><a className="hover:text-blue-300 underline" href={fiscal2025Sources.generalDebt} target="_blank" rel="noreferrer">财政部2025年一般债务分地区余额</a></li>
                <li><a className="hover:text-blue-300 underline" href={fiscal2025Sources.specialDebt} target="_blank" rel="noreferrer">财政部2025年专项债务分地区余额</a></li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">数据说明</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>政府性债务：政府显性债务余额</li>
                <li>城投带息债务：根据华泰固收发债城投名单财报估算</li>
                <li>窄口径债务率 = 政府债务 / 综合财力</li>
                <li>宽口径债务率 = (政府债务+城投债务) / 综合财力</li>
                <li>综合财力=一般预算财力+政府性基金预算财力，其中一般预算财力=全省一般预算收入+中央预算补助收入+上年结余+调入资金+调入预算稳定调节基金-上解中央支出-调出资金，政府性基金预算财力=全省政府性基金收入+中央政府性基金预算补助收入+上年结余+调入资金-上解中央支出-调出资金</li>
                <li>省级债务及财力统一采用2025年口径，历史数据按对应年度计算。部分省份综合财力分项尚不完整，债务率可能偏高。</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">免责声明</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                本网站数据仅供参考，不构成投资建议。城投债务数据为测算值，
                具体数据以官方发布为准，使用者应自行核实并承担使用风险。
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">债</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold">地方债务监测平台</span>
                <span className="text-xs text-blue-400">华泰固收团队出品</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              © 华泰固收团队 · 数据驱动决策
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
