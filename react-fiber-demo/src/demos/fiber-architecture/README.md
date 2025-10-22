# Fiber 架构模块

这是从 `FiberArchitecture.tsx` 重构拆分出来的模块化代码结构。

## 📁 目录结构

```
fiber-architecture/
├── types/
│   └── fiber.types.ts          # Fiber 相关类型定义
├── core/
│   └── SimpleFiber.ts          # Fiber 节点核心类
├── utils/
│   ├── fiberTree.ts            # Fiber 树构建工具
│   ├── reconciliation.ts       # Diff 算法（协调）
│   └── domUtils.ts             # DOM 转换工具
├── schedulers/
│   ├── PriorityScheduler.ts    # 优先级调度器
│   └── FiberScheduler.ts       # Fiber 工作循环调度器
├── index.ts                    # 统一导出入口
└── README.md                   # 本文档
```

## 📦 模块说明

### 1. **types/fiber.types.ts**
定义了 Fiber 架构中使用的所有类型：
- `FiberNode` - 标准 Fiber 节点接口
- `EffectTag` - 副作用标记类型
- `VirtualElement` - 虚拟 DOM 元素
- `Priority` - 优先级枚举
- `Task` - 任务接口

### 2. **core/SimpleFiber.ts**
实现了简化版的 Fiber 节点类，包含：
- 基本属性：type, props
- 链表关系：child, sibling, parent
- 双缓冲：alternate
- 副作用：effectTag
- DOM 引用：stateNode

### 3. **utils/fiberTree.ts**
Fiber 树相关工具函数：
- `createFiberTree()` - 使用 Generator 创建可中断的 Fiber 树
- `renderFiberTreeText()` - 将 Fiber 树转换为文本格式

### 4. **utils/reconciliation.ts**
Diff 算法实现：
- `reconcileChildren()` - 比较新旧节点，标记增删改操作

### 5. **utils/domUtils.ts**
DOM 转换工具：
- `fiberToDOM()` - Fiber 节点转 DOM 节点
- `createDOMTree()` - 递归创建完整 DOM 树
- `commitWork()` - 提交阶段，应用 DOM 操作
- `updateDOM()` - 更新 DOM 属性

### 6. **schedulers/PriorityScheduler.ts**
优先级调度器：
- 管理不同优先级的任务
- 按优先级顺序执行

### 7. **schedulers/FiberScheduler.ts**
Fiber 工作循环调度器：
- 时间切片管理
- 可中断的工作循环
- 任务队列管理

## 🚀 使用方式

### 导入所有模块
```typescript
import {
  // 类型
  Priority,
  Task,
  VirtualElement,
  
  // 核心类
  SimpleFiber,
  
  // 工具函数
  createFiberTree,
  reconcileChildren,
  createDOMTree,
  
  // 调度器
  PriorityScheduler,
  FiberScheduler,
} from './fiber-architecture';
```

### 按需导入
```typescript
import { SimpleFiber } from './fiber-architecture/core/SimpleFiber';
import { createFiberTree } from './fiber-architecture/utils/fiberTree';
import { PriorityScheduler } from './fiber-architecture/schedulers/PriorityScheduler';
```

## 💡 重构优势

1. **模块化**: 代码按功能拆分，职责清晰
2. **可维护**: 每个模块独立，易于维护和测试
3. **可扩展**: 新功能只需扩展对应模块
4. **可复用**: 工具函数可在其他地方复用
5. **类型安全**: 类型定义集中管理

## 📝 对比

### 重构前
- 单文件 975 行
- 所有代码混在一起
- 难以维护和测试

### 重构后
- 8 个模块文件
- 平均每个文件 50-150 行
- 结构清晰，易于理解

## 🔄 迁移指南

如果要从旧版本迁移到新版本：

1. 将 `FiberArchitecture.tsx` 替换为 `FiberArchitecture2.tsx`
2. 确保 `fiber-architecture/` 目录存在
3. 更新路由或导入路径

原文件 (`FiberArchitecture.tsx`) 仍然保留，可以对比学习。

