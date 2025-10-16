export enum STATUS {
  NONE,
  LOADING,
  DONE,
  CANT_ANSWER,
  INTERRUPT,
  ERROR
}

export enum ChatStreamMessageType {
  END = -1, // 结束
  SESSION_ID = 1, // 会话ID
  MESSAGE_ID = 2, // 消息ID
  CONTENT = 3, // 文本
  TTS = 4, // 文本TTS地址
  REMAIN_TIME = 5, // 剩余可用次数
  TOKEN = 6, // 使用TOKEN
  SENSITIVE = 7, // 敏感词检测结果
  PART_TTS = 8, // 部分文本TTS内容
  PART_TTS_END = 9 // 部分文本TTS全部结束
}

// 反馈类型，使用位存储，多选则按位或。1：点踩，2: 点赞，4：回答错误，8：回答过于简单，16：回答过于冗长，32：回复未解决问题，64：答非所问, 128: 回复内容重复
export enum FeedbackType {
  NONE = 0,
  DISLIKE = 1,
  LIKE = 2,
  WRONG_ANSWER = 4,
  TOO_SIMPLE_ANSWER = 8,
  TOO_LONG_ANSWER = 16,
  UNRESOLVED_ANSWER = 32,
  IRRELEVANT_ANSWER = 64,
  REPEATED_ANSWER = 128
}

export enum PlayStatus {
  NONE,
  PLAYING,
  PAUSED,
  LOADING
}

export enum InputType {
  TEXT_INPUT = 1, // 文字输入
  AUDIO_INPUT // 语音输入
}

export const enum ORION_KEY {
  DEFAULT_INPUT_TYPE = 'leo.aichat.defaultInput.config'
}