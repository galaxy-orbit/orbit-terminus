import type { HealthCheckResult, HealthIndicatorResult, HealthCheckOptions } from './interfaces/health.interface';

export class HealthCheckService {
  private shutdownInProgress = false;

  async check(
    key: string,
    healthIndicators: Array<() => Promise<HealthIndicatorResult>>,
    options?: HealthCheckOptions
  ): Promise<HealthCheckResult> {
    if (this.shutdownInProgress) {
      return {
        status: 'shutting_down',
        details: {},
      };
    }

    const timeout = options?.timeout || 10000;
    const results: Record<string, any> = {};
    const errors: Record<string, any> = {};
    let hasError = false;

    const indicatorPromises = healthIndicators.map(async (indicator) => {
      try {
        const result = await Promise.race([
          indicator(),
          new Promise<HealthIndicatorResult>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), timeout)
          ),
        ]);
        
        for (const [indicatorKey, value] of Object.entries(result)) {
          if (value.status === 'down') {
            hasError = true;
            errors[indicatorKey] = value;
          } else {
            results[indicatorKey] = value;
          }
        }
      } catch (error) {
        hasError = true;
        errors[key] = {
          status: 'down',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    await Promise.all(indicatorPromises);

    return {
      status: hasError ? 'error' : 'ok',
      info: Object.keys(results).length > 0 ? results : undefined,
      error: Object.keys(errors).length > 0 ? errors : undefined,
      details: { ...results, ...errors },
    };
  }

  setShuttingDown(): void {
    this.shutdownInProgress = true;
  }

  isShuttingDown(): boolean {
    return this.shutdownInProgress;
  }
}
