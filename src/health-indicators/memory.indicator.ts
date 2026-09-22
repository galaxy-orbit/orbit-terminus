import { HealthIndicator } from './base.indicator';
import type { HealthIndicatorResult, MemoryHealthIndicatorOptions } from '../interfaces/health.interface';

export class MemoryHealthIndicator extends HealthIndicator {
  async checkHeap(key: string, options: MemoryHealthIndicatorOptions): Promise<HealthIndicatorResult> {
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const threshold = options.heapUsedThreshold || 150 * 1024 * 1024;
    
    const isHealthy = heapUsed < threshold;
    
    return this.getStatus(key, isHealthy, {
      details: {
        heapUsed: this.formatBytes(heapUsed),
        heapTotal: this.formatBytes(memUsage.heapTotal),
        threshold: this.formatBytes(threshold),
      },
    });
  }

  async checkRSS(key: string, options: MemoryHealthIndicatorOptions): Promise<HealthIndicatorResult> {
    const memUsage = process.memoryUsage();
    const rss = memUsage.rss;
    const threshold = options.rssThreshold || 300 * 1024 * 1024;
    
    const isHealthy = rss < threshold;
    
    return this.getStatus(key, isHealthy, {
      details: {
        rss: this.formatBytes(rss),
        threshold: this.formatBytes(threshold),
      },
    });
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    return this.checkHeap(key, { heapUsedThreshold: 150 * 1024 * 1024 });
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
}
