export type SessionUpdatePayload = {
  stepIndex: number;
  action: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR' | 'REQUIRES_MANUAL_CONFIRMATION';
  url: string;
  screenshotUrl?: string;
  error?: string;
};

export type SessionDonePayload = {
  summary: string;
  finalUrl?: string;
  finalStatus: string;
};
