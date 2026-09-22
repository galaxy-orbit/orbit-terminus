import { HealthIndicator } from './base.indicator';
import type { HealthIndicatorResult, HttpHealthIndicatorOptions } from '../interfaces/health.interface';

export class HttpHealthIndicator extends HealthIndicator {
  async pingCheck(key: string, url: string, options?: Partial<HttpHealthIndicatorOptions>): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout || 5000;
    const expectedStatus = options?.expectedStatus || 200;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const isHealthy = response.status === expectedStatus;
      
      return this.getStatus(key, isHealthy, {
        details: {
          statusCode: response.status,
          responseTime: 'N/A',
        },
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    throw new Error('Use pingCheck() method with URL parameter');
  }
}
