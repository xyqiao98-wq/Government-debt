# 技术规范文档 - 中国地方债务监测平台

---

## 1. 组件清单

### shadcn/ui 内置组件
| 组件 | 用途 | 安装命令 |
|-----|------|---------|
| Card | 数据卡片、图表容器 | `npx shadcn add card` |
| Button | 交互按钮 | `npx shadcn add button` |
| Badge | 标签、状态标识 | `npx shadcn add badge` |
| Table | 数据表格 | `npx shadcn add table` |
| Input | 搜索框 | `npx shadcn add input` |
| Select | 筛选器、时间选择 | `npx shadcn add select` |
| Tabs | 图表切换 | `npx shadcn add tabs` |
| Tooltip | 数据提示 | `npx shadcn add tooltip` |
| Skeleton | 加载占位 | `npx shadcn add skeleton` |
| Separator | 分隔线 | `npx shadcn add separator` |

### 第三方组件
无需额外第三方组件，使用 ECharts 处理图表和地图。

### 自定义组件
| 组件 | 用途 | 位置 |
|-----|------|------|
| Header | 顶部导航 | `src/components/Header.tsx` |
| StatCard | 数据统计卡片 | `src/components/StatCard.tsx` |
| ChinaMap | 中国地图可视化 | `src/components/ChinaMap.tsx` |
| TrendChart | 趋势折线图 | `src/components/TrendChart.tsx` |
| BarChart | 柱状图 | `src/components/BarChart.tsx` |
| PieChart | 饼图 | `src/components/PieChart.tsx` |
| ScatterChart | 散点图 | `src/components/ScatterChart.tsx` |
| DataTable | 数据表格 | `src/components/DataTable.tsx` |
| Footer | 页脚 | `src/components/Footer.tsx` |
| AnimatedNumber | 数字动画 | `src/components/AnimatedNumber.tsx` |

---

## 2. 动画实现方案

### 动画库选择
- **Framer Motion**: 页面过渡、组件动画、手势交互
- **ECharts 内置动画**: 图表数据更新动画

### 动画实现表

| 动画 | 库 | 实现方式 | 复杂度 |
|-----|---|---------|-------|
| 页面加载序列 | Framer Motion | `motion.div` + `staggerChildren` | 中 |
| 滚动触发显示 | Framer Motion | `whileInView` + `viewport` | 低 |
| 卡片悬停上浮 | Framer Motion | `whileHover` + `transition` | 低 |
| 数字滚动动画 | 自定义 Hook | `useCountUp` + `requestAnimationFrame` | 中 |
| 地图省份高亮 | ECharts | `emphasis` + `select` 配置 | 低 |
| 图表数据更新 | ECharts | `setOption` + `animation` 配置 | 低 |
| 表格行悬停 | Tailwind CSS | `hover:bg-gray-800` | 低 |
| 按钮悬停 | Tailwind CSS | `hover:scale-102` | 低 |

### 关键动画参数

```typescript
// 通用缓动函数
const easing = [0.4, 0, 0.2, 1]; // cubic-bezier

// 页面加载动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing,
    },
  },
};

// 卡片悬停配置
const cardHover = {
  y: -4,
  boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.4)",
  transition: { duration: 0.3, ease: easing },
};

// 滚动触发配置
const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: easing },
};
```

---

## 3. 项目结构

```
/mnt/okcomputer/output/app/
├── public/
│   └── china.json              # 中国地图 GeoJSON
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── ChinaMap.tsx
│   │   ├── TrendChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── ScatterChart.tsx
│   │   ├── DataTable.tsx
│   │   ├── Footer.tsx
│   │   └── AnimatedNumber.tsx
│   ├── hooks/
│   │   ├── useCountUp.ts
│   │   └── useInView.ts
│   ├── data/
│   │   └── debtData.ts         # 各省债务数据
│   ├── lib/
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── components/ui/              # shadcn/ui 组件
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 4. 依赖列表

### 核心依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "echarts": "^5.4.3",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

### 开发依赖
```json
{
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 5. 数据结构定义

```typescript
// types/index.ts

export interface ProvinceDebtData {
  province: string;           // 省份名称
  provinceCode: string;       // 省份代码
  localBondBalance: number;   // 地方债券余额（亿元）
  cityInvestDebt: number;     // 城投债务余额（亿元）
  totalDebt: number;          // 总债务（亿元）
  growthRate: number;         // 增速（%）
  gdpTarget: number;          // GDP目标（亿元）
  fiscalRevenue: number;      // 财政收入（亿元）
  debtRatio: number;          // 负债率（%）
  riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险等级
}

export interface NationalOverview {
  localBondBalance: number;   // 全国地方债券余额
  cityInvestDebt: number;     // 全国城投债务余额
  growthRate: number;         // 全国债务增速
  avgDebtRatio: number;       // 平均负债率
  updateTime: string;         // 更新时间
}

export interface TrendData {
  year: string;
  localBond: number;
  cityInvest: number;
}
```

---

## 6. 关键实现细节

### 6.1 中国地图加载
```typescript
// 使用 ECharts 加载中国地图
import * as echarts from 'echarts';

// 加载 GeoJSON 数据
const response = await fetch('/china.json');
const chinaGeoJson = await response.json();
echarts.registerMap('china', chinaGeoJson);
```

### 6.2 数字动画 Hook
```typescript
// hooks/useCountUp.ts
export function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0
) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(start + (end - start) * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  
  return count;
}
```

### 6.3 风险等级颜色映射
```typescript
const riskColorMap = {
  low: '#10b981',      // 绿色
  medium: '#f59e0b',   // 橙色
  high: '#f97316',     // 深橙
  critical: '#dc2626', // 红色
};

const debtHeatmapColors = ['#10b981', '#f59e0b', '#f97316', '#dc2626'];
```

---

## 7. 性能优化策略

1. **代码分割**: 使用 React.lazy 懒加载图表组件
2. **地图优化**: 使用简化的 GeoJSON 数据
3. **图表优化**: 使用 Canvas 渲染，限制数据点数量
4. **动画优化**: 使用 transform 和 opacity，启用 GPU 加速
5. **数据优化**: 表格使用虚拟滚动处理大量数据

---

## 8. 构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
});
```
