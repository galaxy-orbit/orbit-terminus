import { describe, test, expect } from 'bun:test';
import { HealthCheckService } from './health-check.service';
import { MemoryHealthIndicator } from './health-indicators/memory.indicator';
import type { HealthIndicatorResult } from './interfaces/health.interface';

describe('HealthCheckService', () => {
  test('reports ok when all indicators are up', async () => {
    const service = new HealthCheckService();
    const up = async (): Promise<HealthIndicatorResult> => ({ db: { status: 'up' } });
    const result = await service.check('health', [up]);
    expect(result.status).toBe('ok');
    expect(result.info?.db).toEqual({ status: 'up' });
    expect(result.error).toBeUndefined();
    expect(result.details.db).toEqual({ status: 'up' });
  });

  test('reports error when an indicator reports down', async () => {
    const service = new HealthCheckService();
    const down = async (): Promise<HealthIndicatorResult> => ({ db: { status: 'down', message: 'connection refused' } });
    const result = await service.check('health', [down]);
    expect(result.status).toBe('error');
    expect(result.error?.db.message).toBe('connection refused');
    expect(result.details.db.status).toBe('down');
  });

  test('indicator throwing marks the key as down', async () => {
    const service = new HealthCheckService();
    const boom = async () => { throw new Error('exploded'); };
    const result = await service.check('cache', [boom]);
    expect(result.status).toBe('error');
    expect(result.error?.cache).toEqual({ status: 'down', message: 'exploded' });
  });

  test('slow indicator times out and marks down', async () => {
    const service = new HealthCheckService();
    const slow = async () => new Promise<HealthIndicatorResult>(r => setTimeout(() => r({ slow: { status: 'up' } }), 500));
    const result = await service.check('health', [slow], { timeout: 30 });
    expect(result.status).toBe('error');
    expect(result.error?.health.message).toContain('timeout');
  });

  test('mixed up/down results merge into details', async () => {
    const service = new HealthCheckService();
    const up = async (): Promise<HealthIndicatorResult> => ({ cache: { status: 'up' } });
    const down = async (): Promise<HealthIndicatorResult> => ({ db: { status: 'down' } });
    const result = await service.check('health', [up, down]);
    expect(result.status).toBe('error');
    expect(result.info?.cache).toEqual({ status: 'up' });
    expect(result.error?.db.status).toBe('down');
  });

  test('shutting down mode short-circuits checks', async () => {
    const service = new HealthCheckService();
    service.setShuttingDown();
    expect(service.isShuttingDown()).toBe(true);
    const ran = [] as string[];
    const result = await service.check('health', [() => { ran.push('x'); return Promise.resolve({ a: { status: 'up' } }); }]);
    expect(result.status).toBe('shutting_down');
    expect(ran).toHaveLength(0);
  });
});

describe('MemoryHealthIndicator', () => {
  test('checkHeap reports up under threshold with formatted details', async () => {
    const mem = new MemoryHealthIndicator();
    const result = await mem.checkHeap('memory', { heapUsedThreshold: 1024 * 1024 * 1024 });
    expect(result.memory.status).toBe('up');
    expect(result.memory.details!.heapUsed).toMatch(/MB$/);
    expect(result.memory.details!.threshold).toMatch(/MB/);
  });

  test('checkHeap reports down over threshold', async () => {
    const mem = new MemoryHealthIndicator();
    const result = await mem.checkHeap('memory', { heapUsedThreshold: 1 });
    expect(result.memory.status).toBe('down');
  });

  test('checkRSS uses rss threshold', async () => {
    const mem = new MemoryHealthIndicator();
    const result = await mem.checkRSS('memory', { rssThreshold: 1 });
    expect(result.memory.status).toBe('down');
    expect(result.memory.details!.rss).toBeDefined();
  });
});
