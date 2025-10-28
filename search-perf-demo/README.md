# React 性能优化 Demo - 搜索卡顿问题

这是一个展示如何解决 React 输入框搜索场景性能卡顿问题的完整 Demo 项目。

## 问题描述

当输入框关联一个大列表（如300项），每次输入时都会重新渲染整个列表，导致明显的卡顿现象。

```tsx
const Item = ({ keyword }) => {
  // 模拟1ms渲染时间
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {}
  
  return <div>输入词条: {keyword}</div>;
};

const List = memo(({ keyword }) => {
  return Array(300)
    .fill("a")
    .map((v, index) => <Item key={index} keyword={keyword} />);
});
```

**问题分析：**
- 300个Item × 1ms = 300ms 总渲染时间
- 用户快速输入时会被冻结
- 输入框的响应延迟明显

## 解决方案

项目提供了 **4 种优化方案**：

### 1️⃣ **问题演示 - 卡顿**
原始代码，展示性能问题的严重程度。可以快速输入来感受卡顿。

### 2️⃣ **方案 1 - useDeferredValue**

使用 React 18 的 `useDeferredValue` Hook：

```tsx
const deferredKeyword = useDeferredValue(keyword);
const isPending = keyword !== deferredKeyword;

return (
  <>
    <Input value={keyword} onChange={handleChange} />
    <List keyword={deferredKeyword} />
  </>
);
```

**优点：**
- ✅ 输入框立即响应（高优先级）
- ✅ 列表更新被推迟到低优先级
- ✅ 代码改动最小
- ✅ 自动使用浏览器空闲时间更新

**适用场景：**
- 列表需要同步显示搜索关键词
- 希望保留所有信息但分阶段渲染

### 3️⃣ **方案 2 - useTransition**

使用 React 18 的 `useTransition` Hook：

```tsx
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  const value = e.target.value;
  setKeyword(value); // 立即更新
  startTransition(() => {
    // 其他低优先级更新
  });
};
```

**优点：**
- ✅ 精细控制更新优先级
- ✅ 可以获取过渡状态（isPending）
- ✅ 允许更新被中断
- ✅ 支持 Suspense 集成

**适用场景：**
- 需要显示加载状态
- 有异步操作关联更新
- 需要手动控制优先级

### 4️⃣ **方案 3 - 虚拟列表**

只渲染可见区域的列表项：

```tsx
const VirtualList = ({ keyword, itemCount, itemHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = startIndex + visibleCount;
  
  // 只渲染 startIndex 到 endIndex 的项
  return visibleItems.map(i => <Item key={i} />);
};
```

**优点：**
- ✅ 最激进的性能优化
- ✅ DOM 节点数量最少
- ✅ 适合海量数据列表
- ✅ 输入框响应几乎无延迟

**缺点：**
- ❌ 实现复杂度较高
- ❌ 需要固定高度的列表项
- ❌ 可能需要占位符处理

**适用场景：**
- 列表项数量非常多（> 500）
- 列表项高度固定
- 需要最优的性能

## 性能对比

| 方案 | 输入响应 | 列表更新 | 总渲染时间 | 实现难度 |
|------|---------|---------|-----------|---------|
| 问题演示 | ❌ 卡顿 | 同步 | 300ms | - |
| useDeferredValue | ✅ 流畅 | 延迟 | 300ms+ | 低 |
| useTransition | ✅ 流畅 | 延迟 | 300ms+ | 低 |
| 虚拟列表 | ✅ 流畅 | 快速 | ~10ms | 高 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
search-perf-demo/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Demo.css                          # 共同样式
│   │   ├── ProblemDemo.tsx                   # 性能问题演示
│   │   ├── OptimizedWithDeferredValue.tsx    # useDeferredValue 方案
│   │   ├── OptimizedWithTransition.tsx       # useTransition 方案
│   │   └── OptimizedWithVirtualization.tsx   # 虚拟列表方案
│   ├── App.tsx                               # 主应用
│   ├── App.css                               # App 样式
│   ├── index.tsx                             # 入口文件
│   └── index.css                             # 全局样式
├── package.json
├── tsconfig.json
└── README.md
```

## 使用建议

1. **先观看问题演示** - 快速输入感受卡顿
2. **尝试 useDeferredValue** - 了解并发渲染基础
3. **体验 useTransition** - 了解优先级控制
4. **最后尝试虚拟列表** - 了解最优方案的权衡

## 相关资源

- [React 18 Concurrent Features](https://react.dev/reference/react/useTransition)
- [useDeferredValue Hook](https://react.dev/reference/react/useDeferredValue)
- [Virtual Scrolling 原理](https://bvaughn.github.io/react-window/)

## 性能测量

在浏览器开发者工具中：

1. 打开 **Performance** 标签
2. 点击录制，快速输入
3. 停止录制
4. 观察：
   - FPS 帧率
   - 脚本执行时间
   - 渲染时间

## 许可证

MIT
