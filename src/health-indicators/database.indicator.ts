import { HealthIndicator } from './base.indicator';
import type { HealthIndicatorResult } from '../interfaces/health.interface';

export class DatabaseHealthIndicator extends HealthIndicator {
  async pingCheck(
    key: string,
    connection: any,
    timeout: number = 5000
  ): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();
      
      if (connection.isInitialized !== undefined) {
        if (!connection.isInitialized) {
          return this.getStatus(key, false, {
            message: 'Database not initialized',
          });
        }
        
        if (typeof connection.query === 'function') {
          await Promise.race([
            connection.query('SELECT 1'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            ),
          ]);
        }
      } else if (typeof connection.query === 'function') {
        await Promise.race([
          connection.query('SELECT 1'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          ),
        ]);
      } else if (typeof connection.ping === 'function') {
        await Promise.race([
          connection.ping(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          ),
        ]);
      }
      
      const responseTime = Date.now() - startTime;
      
      return this.getStatus(key, true, {
        details: {
          responseTime: `${responseTime}ms`,
        },
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Database connection failed',
      });
    }
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    throw new Error('Use pingCheck() method with connection parameter');
  }
}
