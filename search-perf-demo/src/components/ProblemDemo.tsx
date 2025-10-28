import React, { useState, useCallback, memo } from 'react';
import { Card, Input } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import './Demo.css';

// 模拟耗时的Item组件 - 每个增加1ms渲染时间
const Item = ({ keyword }: { keyword: string }) => {
  // 增加渲染时间以模拟复杂的DOM操作
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {}

  return (
    <div className="item">
      <span>搜索词条: {keyword}</span>
    </div>
  );
};

// 使用memo包装List，但由于keyword始终变化，依然会重新渲染所有Item
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

export default function ProblemDemo() {
  const [keyword, setKeyword] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  return (
    <div className="demo-wrapper">
      <div className="warning-box">
        <WarningOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
        <span>
          输入文字时会感觉到明显卡顿 - 因为每次keyword变化都会重新渲染所有300个Item
          (300ms的总渲染时间)
        </span>
      </div>

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
              当前输入: {keyword || '(无)'}
            </span>
          </div>
        }
        bordered={false}
        style={{ marginTop: '20px' }}
      >
        <List keyword={keyword} />
      </Card>
    </div>
  );
}
