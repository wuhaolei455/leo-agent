export interface FiberNode {
  type: string;
  props: any;
  child?: FiberNode;
  sibling?: FiberNode;
  parent?: FiberNode;
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  alternate?: FiberNode;
}

export type EffectTag = 'PLACEMENT' | 'UPDATE' | 'DELETION' | null;

export interface VirtualElement {
  type: string;
  props: Record<string, any>;
  children: VirtualElement[];
}

export enum Priority {
  IMMEDIATE = 1,
  USER_BLOCKING = 2,
  NORMAL = 3,
  LOW = 4,
  IDLE = 5
}

export interface Task {
  id: number;
  priority: Priority;
  execute: () => void;
  name: string;
}

