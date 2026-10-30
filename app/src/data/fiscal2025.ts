// 单位：亿元。财力按用户提供的2025年截图最后一列原值录入，不补齐截图空白项。
// 政府债务采用财政部2025年全国财政决算：一般债务余额+专项债务余额，非限额、非发行额。
// 省份行已含计划单列市，不重复加总；新疆政府债务含新疆生产建设兵团。
export const fiscal2025Sources = {
  generalDebt: 'https://yss.mof.gov.cn/2025zyjs/202609/t20260916_3997523.htm',
  specialDebt: 'https://yss.mof.gov.cn/2025zyjs/202609/t20260916_3997518.htm',
  finance: '用户提供的2025年综合财力截图（2026-10-30）',
  publicationDate: '2026-09-16',
};

export interface Fiscal2025Record {
  comprehensiveFinance: number;
  generalDebt: number;
  specialDebt: number;
}

export const fiscal2025: Record<string, Fiscal2025Record> = {
  '北京': { comprehensiveFinance: 11245, generalDebt: 2927.78, specialDebt: 11006.45 },
  '天津': { comprehensiveFinance: 4618, generalDebt: 3783.04, specialDebt: 11316.83 },
  '河北': { comprehensiveFinance: 11597, generalDebt: 8013.57, specialDebt: 15644.72 },
  '山西': { comprehensiveFinance: 3681, generalDebt: 3693.66, specialDebt: 5949.51 },
  '内蒙古': { comprehensiveFinance: 3458, generalDebt: 8157.04, specialDebt: 5106.37 },
  '辽宁': { comprehensiveFinance: 9673, generalDebt: 7964.06, specialDebt: 7726.25 },
  '吉林': { comprehensiveFinance: 6977, generalDebt: 4805.18, specialDebt: 6633.82 },
  '黑龙江': { comprehensiveFinance: 1716, generalDebt: 5953.22, specialDebt: 4866.32 },
  '上海': { comprehensiveFinance: 14383, generalDebt: 4211.01, specialDebt: 6209.09 },
  '江苏': { comprehensiveFinance: 24737, generalDebt: 8538.11, specialDebt: 25389.44 },
  '浙江': { comprehensiveFinance: 20584, generalDebt: 8495.37, specialDebt: 23577.75 },
  '安徽': { comprehensiveFinance: 12692, generalDebt: 4953.63, specialDebt: 16446.77 },
  '福建': { comprehensiveFinance: 7906, generalDebt: 4155.16, specialDebt: 14763.63 },
  '江西': { comprehensiveFinance: 10496, generalDebt: 4904.15, specialDebt: 12518.06 },
  '山东': { comprehensiveFinance: 21737, generalDebt: 8324.55, specialDebt: 30219.21 },
  '河南': { comprehensiveFinance: 15461, generalDebt: 6877.80, specialDebt: 18010.30 },
  '湖北': { comprehensiveFinance: 14179, generalDebt: 6462.01, specialDebt: 15158.67 },
  '湖南': { comprehensiveFinance: 12800, generalDebt: 8726.31, specialDebt: 15562.72 },
  '广东': { comprehensiveFinance: 22536, generalDebt: 8456.99, specialDebt: 33002.49 },
  '广西': { comprehensiveFinance: 8657, generalDebt: 5843.23, specialDebt: 8911.23 },
  '海南': { comprehensiveFinance: 3220, generalDebt: 2048.57, specialDebt: 3734.56 },
  '重庆': { comprehensiveFinance: 9073, generalDebt: 3956.88, specialDebt: 12825.00 },
  '四川': { comprehensiveFinance: 20248, generalDebt: 8515.25, specialDebt: 19499.49 },
  '贵州': { comprehensiveFinance: 9623, generalDebt: 8827.22, specialDebt: 10541.44 },
  '云南': { comprehensiveFinance: 9129, generalDebt: 7400.36, specialDebt: 10920.32 },
  '西藏': { comprehensiveFinance: 3980, generalDebt: 569.97, specialDebt: 920.05 },
  '陕西': { comprehensiveFinance: 4362, generalDebt: 5529.52, specialDebt: 8820.28 },
  '甘肃': { comprehensiveFinance: 7774, generalDebt: 3047.76, specialDebt: 6476.08 },
  '青海': { comprehensiveFinance: 2798, generalDebt: 2835.51, specialDebt: 991.06 },
  '宁夏': { comprehensiveFinance: 2062, generalDebt: 1853.30, specialDebt: 1131.77 },
  '新疆': { comprehensiveFinance: 9316, generalDebt: 5293.45, specialDebt: 9228.62 },
};
