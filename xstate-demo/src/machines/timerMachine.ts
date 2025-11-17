import { assign, setup } from 'xstate'

/**
 * 计时器状态机
 * 展示：时间相关状态、after转换、延迟事件
 */

type TimerContext = {
  duration: number
  elapsed: number
  interval: number
}

type TimerEvents =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SET_DURATION'; duration: number }

export const timerMachine = setup({
  types: {
    context: {} as TimerContext,
    events: {} as TimerEvents,
  },
  guards: {
    isFinished: ({ context }) => context.elapsed >= context.duration,
    canTick: ({ context }) => context.elapsed < context.duration,
  },
  actions: {
    tick: assign({
      elapsed: ({ context }) => 
        Math.min(context.elapsed + context.interval, context.duration),
    }),
    reset: assign({
      elapsed: 0,
    }),
    setDuration: assign({
      duration: ({ event }) => {
        if (event.type === 'SET_DURATION') return event.duration
        return 60
      },
      elapsed: 0,
    }),
  },
  delays: {
    tickInterval: ({ context }) => context.interval,
  },
}).createMachine({
  id: 'timer',
  initial: 'idle',
  context: {
    duration: 60, // 60秒
    elapsed: 0,
    interval: 1000, // 1秒间隔
  },
  states: {
    idle: {
      on: {
        START: 'running',
        SET_DURATION: {
          actions: 'setDuration',
        },
      },
    },
    running: {
      after: {
        tickInterval: {
          target: 'running',
          actions: 'tick',
          guard: 'canTick',
          reenter: true,
        },
      },
      always: {
        target: 'finished',
        guard: 'isFinished',
      },
      on: {
        PAUSE: 'paused',
        RESET: {
          target: 'idle',
          actions: 'reset',
        },
      },
    },
    paused: {
      on: {
        RESUME: 'running',
        RESET: {
          target: 'idle',
          actions: 'reset',
        },
      },
    },
    finished: {
      on: {
        RESET: {
          target: 'idle',
          actions: 'reset',
        },
        START: {
          target: 'running',
          actions: 'reset',
        },
      },
    },
  },
})














