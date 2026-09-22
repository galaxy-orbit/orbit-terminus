import type { HealthIndicatorResult } from '../interfaces/health.interface';

export abstract class HealthIndicator {
  protected getStatus(
    key: string,
    isHealthy: boolean,
    data?: Record<string, any>
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    };
  }

  abstract check(key: string): Promise<HealthIndicatorResult>;
}
