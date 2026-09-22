export interface HealthIndicatorResult {
  [key: string]: {
    status: 'up' | 'down';
    message?: string;
    details?: Record<string, any>;
  };
}

export interface HealthCheckResult {
  status: 'ok' | 'error' | 'shutting_down';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

export interface HealthIndicator {
  check(key: string): Promise<HealthIndicatorResult>;
}

export interface HealthCheckOptions {
  timeout?: number;
}

export interface TerminusModuleOptions {
  endpoints?: TerminusEndpoint[];
  gracefulShutdownTimeout?: number;
}

export interface TerminusEndpoint {
  url: string;
  healthIndicators: Array<() => Promise<HealthIndicatorResult>>;
}

export interface DiskHealthIndicatorOptions {
  path: string;
  thresholdPercent: number;
}

export interface MemoryHealthIndicatorOptions {
  heapUsedThreshold?: number;
  rssThreshold?: number;
}

export interface HttpHealthIndicatorOptions {
  url: string;
  timeout?: number;
  expectedStatus?: number;
}

export interface DatabaseHealthIndicatorOptions {
  connection: any;
  timeout?: number;
}
