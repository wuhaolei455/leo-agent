import { Tabs } from 'antd';
import ProblemDemo from './components/ProblemDemo';
import OptimizedWithDeferredValue from './components/OptimizedWithDeferredValue';
import OptimizedWithTransition from './components/OptimizedWithTransition';
import OptimizedWithVirtualization from './components/OptimizedWithVirtualization';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1>React 性能优化 Demo</h1>
        <p>搜索输入框卡顿问题的解决方案对比</p>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: '问题演示 - 卡顿',
            children: <ProblemDemo />,
          },
          {
            key: '2',
            label: '方案1 - useDeferredValue',
            children: <OptimizedWithDeferredValue />,
          },
          {
            key: '3',
            label: '方案2 - useTransition',
            children: <OptimizedWithTransition />,
          },
          {
            key: '4',
            label: '方案3 - 虚拟化列表',
            children: <OptimizedWithVirtualization />,
          }
        ]}
      />
    </div>
  );
}
