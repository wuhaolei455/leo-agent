# 🎙️ Audio Recorder Demo

一个基于 React + TypeScript 和 js-audio-recorder 库实现的音频录制器 Demo 应用。

## ✨ 功能特性

- ✅ **开始录音** - 点击即可开始录制音频
- ✅ **暂停/继续** - 支持录音过程中暂停和继续
- ✅ **停止录音** - 结束录音并生成音频文件
- ✅ **实时时长** - 显示录音进行的时长（格式：MM:SS）
- ✅ **状态指示** - 带动画的状态指示器（录音中/已暂停/已完成）
- ✅ **音频预览** - 录音完成后可以直接播放
- ✅ **下载功能** - 支持下载 WAV 格式的音频文件
- ✅ **重新录制** - 一键重置重新开始
- ✅ **响应式设计** - 支持桌面和移动端

## 🎨 UI 设计

- **渐变背景**：紫色渐变（#667eea → #764ba2）
- **状态动画**：录音中的脉动动画效果
- **毛玻璃效果**：backdrop-filter 实现半透明效果
- **现代化按钮**：带悬停和点击效果

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

构建结果会输出到 `build` 目录。

## 📦 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **js-audio-recorder** - 音频录制核心库
- **React Hooks** - 状态管理
- **CSS3** - 样式和动画

## 📂 项目结构

```
audio-recorder-demo/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── types.ts                    # TypeScript 类型定义
│   ├── useAudioRecorder.ts         # 录音逻辑 Hook
│   ├── AudioRecorderPanel.tsx      # 主面板组件
│   ├── AudioRecorderPanel.css      # 样式文件
│   ├── App.tsx                     # 应用入口
│   ├── App.css                     # 应用样式
│   ├── index.tsx                   # React 入口
│   └── index.css                   # 全局样式
├── package.json
└── README.md
```

## 🔧 核心代码说明

### 1. useAudioRecorder Hook

自定义 Hook，封装了所有录音逻辑：

```typescript
const {
  state,              // { isRecording, isPaused, duration, audioUrl }
  status,             // RecorderStatus 枚举
  startRecording,     // 开始录音
  pauseRecording,     // 暂停录音
  resumeRecording,    // 恢复录音
  stopRecording,      // 停止录音
  playRecording,      // 播放录音
  stopPlayback,       // 停止播放
  downloadRecording,  // 下载录音
  reset,              // 重置
  formatDuration,     // 格式化时长
} = useAudioRecorder();
```

### 2. 录音配置

```typescript
{
  sampleBits: 16,      // 16位采样
  sampleRate: 16000,   // 16kHz采样率
  numChannels: 1,      // 单声道
}
```

### 3. 使用示例

```typescript
import { AudioRecorderPanel } from './AudioRecorderPanel';

function App() {
  return <AudioRecorderPanel />;
}
```

## 🌐 浏览器兼容性

### 最低要求

- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

### 安全要求

⚠️ **必须在 HTTPS 环境下使用**（或 localhost 开发环境）

录音功能需要访问麦克风，浏览器要求必须在安全上下文中运行。

### 权限要求

首次使用需要授予麦克风访问权限。浏览器会弹出权限请求对话框。

## 📝 使用说明

1. **访问页面** - 在浏览器中打开应用
2. **授予权限** - 首次使用时允许浏览器访问麦克风
3. **开始录音** - 点击"开始录音"按钮
4. **控制录音** - 可以暂停、继续或停止
5. **查看结果** - 录音完成后会显示音频播放器
6. **保存录音** - 点击"下载"按钮保存为 WAV 文件
7. **重新录制** - 点击"重新录制"开始新的录音

## 🔒 隐私说明

- 所有录音处理都在浏览器本地完成
- 不会上传任何音频数据到服务器
- 录音文件仅保存在浏览器内存中，可以下载到本地

## 🐛 常见问题

### Q: 为什么无法开始录音？

**A:** 请检查：
1. 是否在 HTTPS 环境下（或 localhost）
2. 是否授予了麦克风权限
3. 麦克风设备是否正常工作
4. 其他应用是否正在使用麦克风

### Q: 如何改变录音音质？

**A:** 修改 `useAudioRecorder.ts` 中的配置：

```typescript
recorderRef.current = new Recorder({
  sampleBits: 16,
  sampleRate: 44100,  // 更高的采样率 = 更好的音质
  numChannels: 1,
});
```

### Q: 支持其他音频格式吗？

**A:** 目前只支持 WAV 格式，这是为了确保最大兼容性。如需其他格式，需要额外的编码库。

### Q: 录音文件大小如何？

**A:** 以 16kHz 采样率、16位、单声道为例：
- 1分钟录音 ≈ 2MB
- 5分钟录音 ≈ 10MB

## 📚 依赖说明

### 主要依赖

- `react`: ^18.x - React 核心库
- `react-dom`: ^18.x - React DOM 库
- `typescript`: ^4.x - TypeScript 编译器
- `js-audio-recorder`: ^1.x - 音频录制库

### 开发依赖

- `react-scripts`: ^5.x - Create React App 工具链
- `@types/react`: ^18.x - React 类型定义
- `@types/react-dom`: ^18.x - React DOM 类型定义

## 🎓 学习资源

- [js-audio-recorder 官方文档](https://www.npmjs.com/package/js-audio-recorder)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [React Hooks 文档](https://react.dev/reference/react)

## 🔮 未来改进

- [ ] 支持 MP3 格式导出
- [ ] 添加音频波形可视化
- [ ] 实现音量监测和显示
- [ ] 支持音频剪辑功能
- [ ] 添加音频效果（降噪、增益等）
- [ ] 支持多段录音管理
- [ ] 云端存储集成

## 📄 License

MIT License

## 👨‍💻 作者

Demo 项目 - 用于演示 js-audio-recorder 库的使用

## 🙏 致谢

感谢 js-audio-recorder 库的作者提供了如此优秀的音频录制解决方案。

---

**注意：** 本项目仅用于学习和演示目的。在生产环境中使用前，请根据实际需求进行安全性和性能优化。
