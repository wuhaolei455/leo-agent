import { useEffect, useRef } from 'react';
import './VolumeVisualizer.css';

interface VolumeVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export function VolumeVisualizer({ analyser, isActive }: VolumeVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isActive) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 40; // 显示的柱子数量
    const barWidth = rect.width / barCount;
    const barGap = 2;

    const draw = () => {
      if (!isActive) return;

      analyser.getByteFrequencyData(dataArray);

      // 清空画布
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 绘制频谱柱
      for (let i = 0; i < barCount; i++) {
        // 采样数据
        const index = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[index];
        
        // 归一化高度 (0-1)
        const normalizedHeight = value / 255;
        const barHeight = normalizedHeight * rect.height * 0.8;
        
        // 计算颜色 (从蓝到紫渐变)
        const hue = 240 - normalizedHeight * 60; // 240(蓝) -> 280(紫)
        const saturation = 70 + normalizedHeight * 30;
        const lightness = 50 + normalizedHeight * 20;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // 绘制柱子 (从中心向上下扩展)
        const x = i * barWidth;
        const y = (rect.height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - barGap, barHeight);
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser, isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="volume-visualizer">
      <canvas ref={canvasRef} className="volume-canvas" />
    </div>
  );
}

