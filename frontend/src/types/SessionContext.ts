export interface TaskSequence {
  index: number;            // 任务ID
  type: string;             // 任务类型
  task: string;             // 任务内容
  platform: string;         // 平台类型
  startTime: number;        // 任务开始时间
}

export interface SessionInfo {
  username: string;               // 用户名
  userId: number;                 // 用户分组编号 (0-15)
  taskSequence: TaskSequence[];   // 任务序列
  currentTaskId: number;          // 当前任务ID
}

import { createContext } from 'react';
export const SessionContext = createContext<SessionInfo | null>(null);
