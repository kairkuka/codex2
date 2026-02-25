export type SessionStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'STOPPED'
  | 'DONE'
  | 'ERROR'
  | 'REQUIRES_MANUAL_CONFIRMATION';

export type SessionStepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'DONE'
  | 'ERROR'
  | 'REQUIRES_MANUAL_CONFIRMATION';

export type SessionStep = {
  stepIndex: number;
  action: string;
  status: SessionStepStatus;
  url: string;
  screenshotUrl?: string;
  error?: string;
  ts: number;
};

export type Session = {
  id: string;
  startUrl: string;
  command: string;
  mode: 'agent' | 'manual';
  status: SessionStatus;
  stopRequested: boolean;
  createdAt: number;
  updatedAt: number;
  endedAt: number | null;
  lastUrl: string;
  steps: SessionStep[];
  lastResponseId?: string | null;
};
