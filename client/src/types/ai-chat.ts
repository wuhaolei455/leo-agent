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

export interface ChatStreamMessage {
  content: string
  index: number
  type: number
}

export interface IAiCompanionHomepage {
  // 问候语
  greeting: IAiCompanionGreeting
  // 推荐问题
  recommendQuestions: string[]
  // 推荐问题类别, 1-百科类问题
  type: number
}

export interface IAiCompanionGreeting {
  // 问候内容
  content: string
  // 问候内容语音
  contentAudio: string
  // 问候语
  title: string
  // 问候语语音
  titleAudio: string
}

export interface IAiCompanionChatRequest {
  // 问候语内容
  greetingContent: string
  // 问候语标题
  greetingTitle: string
  // 重试请求中上一次的ID，非重试请求中无效
  lastEventId: number
  // 消息ID，客户端生成的唯一标示
  messageId: string
  // 是否需要生成语音
  requireSpeech: boolean
  // 会话ID
  sessionId: number
  // 用户输入
  userInput: string
}

export interface IAiCompanionFeedbackChatRequest {
  // 反馈内容
  feedbackContent: string
  // 反馈类型，使用位存储，多选则按位或。1：其他，2: 点赞，4：回答错误，8：回答过于简单，16：回答过于冗长，32：回复未解决问题，64：答非所问, 128: 回复内容重复
  feedbackType: number
  // 消息ID
  messageId: string
  // 会话ID
  sessionId: number
}

export interface IChatMessageHistory {
  // 消息列表
  sessionList: IChatSession[]
}

export interface IAicompanionGetChatHistoryParams {
  cursorTime: number
  limit: number
}

export interface IChatSession {
  // 问候语内容
  greetingContent: string
  // 问候语标题
  greetingTitle: string
  // 提问类型,1-针对问题提问,2-针对步骤提问
  chatType: number
  // createTime
  createTime: number
  // 用户提问的步骤序号，只有chatType=2时有效
  doubtStep: number
  // 消息列表
  messageList: IMessage[]
  // 会话ID
  sessionId: number
}

export interface IAiCompanionChatMessage {
  // 消息内容
  content: string
  // 反馈类型，没有反馈过为0，反馈过的话为所有反馈类型的按位或
  feedbackType: number
  // 消息ID
  messageId: string
  // 角色，user-用户，assistant-AI
  role: string
  // 语音合成地址
  ttsUrl?: string
}

export type IHistoryMessage = IAiCompanionChatMessage & {
  status: STATUS
  sessionId: number
  type: string
  playStatus: PlayStatus
}

export type IMessage = IAiCompanionChatMessage & {
  status: STATUS
  sessionId?: number
  lastEventId?: number
  type: string
  hasRetry?: boolean
  ttsList?: string[]
  ttsPartEnd?: boolean
  playStatus?: PlayStatus
}

export interface IAicompanionGenerateAudioParams {
  messageId: string
  sessionId: number
}

export interface AiCompanionMoreQuestionResponse {
  questions: AiCompanionQuestionVO[]; // 推荐问题列表
}

export interface AiCompanionQuestionVO {
  // 推荐问题内容
  content: string;
}