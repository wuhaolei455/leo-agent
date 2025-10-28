import React, { useState, useCallback, memo, useTransition } from 'react';
import { Card, Input, Alert, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import './Demo.css';

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

export default function OptimizedWithTransition() {
  const [keyword, setKeyword] = useState('');
  const [listKeyword, setListKeyword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    startTransition(() => {
      setListKeyword(value);
    });
  }, [startTransition]);

  return (
    <div className="demo-wrapper">
      <Alert
        message="useTransition 方案（正确实现）"
        description="✨ Input立即响应，List逐步更新。关键：Input状态立即更新 + List状态通过startTransition延迟"
        type="success"
        icon={<CheckCircleOutlined />}
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Card
        title={
          <div className="card-title">
            <Input
              placeholder="输入词条..."
              value={keyword}
              onChange={handleChange}
              style={{ width: '200px' }}
            />
            <span style={{ marginLeft: '20px', color: '#666' }}>
              输入框显示: {keyword || '(无)'}
            </span>
            {isPending && (
              <span style={{ marginLeft: '20px', color: '#ff7a45', fontWeight: 'bold' }}>
                ⏳ 列表更新中...
              </span>
            )}
          </div>
        }
        bordered={false}
        style={{ marginTop: '20px' }}
      >
        <Spin spinning={isPending} tip="更新中...">
          <List keyword={listKeyword} />
        </Spin>
      </Card>

      <div className="explanation">
        <h3>工作原理:</h3>
        <ul>
          <li>
            <strong>关键区别</strong>: setKeyword 立即执行，setListKeyword 在 startTransition 中延迟
          </li>
          <li>输入框绑定 keyword（立即值），所以Input立即响应</li>
          <li>列表绑定 listKeyword（延迟值），所以List更新被推迟</li>
          <li>在updateQueue中，高优先级的setKeyword先执行，触发Input重新渲染</li>
          <li>等浏览器有空闲时间，低优先级的setListKeyword才执行，触发List更新</li>
          <li>这样就保证了Input的流畅性，同时让List在后台逐步更新</li>
        </ul>
      </div>
    </div>
  );
}
