import React, { useState, useCallback, memo } from 'react';
import { Card, Input, Alert, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import './Demo.css';
import { useMyDeferredValue } from '../hooks/useMyDeferredValue';

const Item = ({ keyword }: { keyword: string }) => {
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {}

  return (
    <div className="item">
      <span>搜索词条: {keyword}</span>
    </div>
  );
};

const List = memo(({ keyword }: { keyword: string }) => {
  return (
    <div className="list-container">
      {Array(300)
        .fill(null)
        .map((_, index) => (
          <Item key={index} keyword={keyword} />
        ))}
    </div>
  );
});

List.displayName = 'List';

// 分离Input组件，避免重新渲染Input本身
const SearchInput = memo(({ 
  keyword, 
  onChange 
}: { 
  keyword: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="card-title">
      <Input
        placeholder="输入词条..."
        value={keyword}
        onChange={onChange}
        style={{ width: '200px' }}
      />
      <span style={{ marginLeft: '20px', color: '#666' }}>
        当前输入: {keyword || '(无)'}
      </span>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default function OptimizedWithDeferredValue() {
  const [keyword, setKeyword] = useState('');
  // 延迟更新的keyword，优先级较低
  // const deferredKeyword = useDeferredValue(keyword);
  const deferredKeyword = useMyDeferredValue(keyword);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const isPending = keyword !== deferredKeyword;

  return (
    <div className="demo-wrapper">
      <Alert
        message="useDeferredValue 方案（推荐）"
        description="✨ 最优雅的解决方案：Input立即响应，List自动延迟。原始值立即更新，延迟值自动派生。"
        type="success"
        icon={<CheckCircleOutlined />}
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Card
        title={
          <SearchInput keyword={keyword} onChange={handleChange} />
        }
        bordered={false}
        style={{ marginTop: '20px' }}
      >
        <Spin spinning={isPending} tip="搜索中...">
          <List keyword={deferredKeyword} />
        </Spin>
        {isPending && (
          <span style={{ marginLeft: '20px', color: '#ff7a45', fontWeight: 'bold' }}>
            ⏳ 列表更新中...
          </span>
        )}
      </Card>

      <div className="explanation">
        <h3>工作原理（为什么这个方案最优雅）:</h3>
        <ul>
          <li>
            <strong>useDeferredValue</strong> 会自动创建两个值：原始值 + 延迟值
          </li>
          <li>原始值 keyword：立即更新，用于Input显示 → Input立即响应</li>
          <li>延迟值 deferredKeyword：自动推迟更新，用于List计算 → List逐步更新</li>
          <li>
            对比 useTransition：不需要两个setState，更简洁、不容易出错
          </li>
          <li>
            自动使用浏览器空闲时间更新，无需手动管理优先级
          </li>
          <li>最适合：搜索/筛选 + 结果展示 的场景</li>
        </ul>

        <h3>性能表现:</h3>
        <ul>
          <li>输入延迟: 0ms (立即响应)</li>
          <li>列表更新: ~100-300ms (低优先级推迟)</li>
          <li>用户体验: 流畅输入 + 后台更新</li>
        </ul>
      </div>
    </div>
  );
}
