export interface SessionInfo {
  username: string;
  platform: string;
  task: string;
  concreteTask: string;
  startTime: number;
}

import { createContext } from 'react';
export const SessionContext = createContext<SessionInfo | null>(null);
