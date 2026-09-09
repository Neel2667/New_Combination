export const APP_NAME = 'Combination';
export const APP_VERSION = '0.1.0';

export interface HealthResponse {
  status: 'ok' | 'error';
  app: string;
  version: string;
  timestamp: string;
}

export * from './contracts/index';
