export type SourceType = 'url' | 'file' | 'video';
export type SourceStatus = 'pending' | 'extracted' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Source {
  id: string;
  jobId: string;
  type: SourceType;
  url?: string;
  title?: string;
  content?: string;
  status: SourceStatus;
  createdAt: string;
}

export interface InsightCard {
  id: string;
  jobId: string;
  title: string;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  sourceRef: string;
  sourceUrl?: string;
}

export interface AnalysisJob {
  id: string;
  userId?: string;
  status: JobStatus;
  mode: 'insights';
  sources: Source[];
  cards: InsightCard[];
  createdAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  avatar: string;
  occupation: string;
  plan: 'free';
  createdAt: string;
}
