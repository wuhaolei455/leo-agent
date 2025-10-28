import React, { useState, useCallback, memo, useRef } from 'react';
import { Card, Input, Alert } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import './Demo.css';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 10;
const TOTAL_ITEMS = 300;

const Item = ({ keyword, style }: { keyword: string; style: React.CSSProperties }) => {
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {}

  return (
    <div className="item" style={style}>
      <span>搜索词条: {keyword}</span>
    </div>
  );
};

interface VirtualListProps {
  keyword: string;
  itemCount: number;
  itemHeight: number;
  visibleCount: number;
}

const VirtualList = memo(({ keyword, itemCount, itemHeight, visibleCount }: VirtualListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, itemCount);
  const visibleItems = Array.from({ length: endIndex - startIndex });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: `${visibleCount * itemHeight}px`,
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          height: `${itemCount * itemHeight}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            width: '100%',
          }}
        >
          {visibleItems.map((_, i) => (
            <Item
              key={startIndex + i}
              keyword={keyword}
              style={{
                height: `${itemHeight}px`,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

export default function OptimizedWithVirtualization() {
  const [keyword, setKeyword] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  return (
    <div className="demo-wrapper">
      <Alert
        message="虚拟列表方案"
        description="只渲染可见的列表项。无论列表有多少项，DOM 中只存在需要显示的元素，大大减少了渲染时间。"
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
              当前输入: {keyword || '(无)'}
            </span>
          </div>
        }
        bordered={false}
        style={{ marginTop: '20px' }}
      >
        <VirtualList
          keyword={keyword}
          itemCount={TOTAL_ITEMS}
          itemHeight={ITEM_HEIGHT}
          visibleCount={VISIBLE_ITEMS}
        />
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
          <p style={{ color: '#666', fontSize: '12px' }}>
            💡 提示: 尝试快速输入，感受虚拟列表的响应速度。尽管每个Item仍需1ms渲染时间，
            但由于只渲染了~10个可见项，总时间仅为~10ms，而不是300ms。
          </p>
        </div>
      </Card>

      <div className="explanation">
        <h3>工作原理:</h3>
        <ul>
          <li>
            <strong>虚拟列表</strong>（Virtual Scrolling）只渲染在视口内的元素
          </li>
          <li>监听滚动事件，计算应显示的起始和结束索引</li>
          <li>使用 transform: translateY 快速定位可见区域</li>
          <li>极大减少 DOM 节点数量，提升性能</li>
          <li>特别适合处理大列表数据</li>
        </ul>
      </div>
    </div>
  );
}
