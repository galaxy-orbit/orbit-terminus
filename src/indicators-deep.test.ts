import { describe, test, expect } from 'bun:test';
import { DatabaseHealthIndicator } from './health-indicators/database.indicator';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import Database from 'bun:sqlite';

const indicator = new DatabaseHealthIndicator();

describe('DatabaseHealthIndicator — pingCheck with bun:sqlite via drizzle', () => {
  test('up when the connection answers SELECT 1', async () => {
    const sqlite = new Database(':memory:');
    const db = drizzle(sqlite);
    (db as any).isInitialized = true;

    const result = await indicator.pingCheck('sqlite', db as any);
    expect(result.sqlite).toBeDefined();
    expect(result.sqlite.status).toBe('up');
    expect((result.sqlite as any).details?.responseTime).toMatch(/ms$/);
  });

  test('down when connection reports isInitialized: false', async () => {
    const fake = { isInitialized: false };
    const result = await indicator.pingCheck('lazyDb', fake as any);
    expect(result.lazyDb.status).toBe('down');
    expect((result.lazyDb as any).message).toBe('Database not initialized');
  });

  test('down when the query rejects', async () => {
    const failing = {
      isInitialized: true,
      query: async () => { throw new Error('disk I/O error'); },
    };
    const result = await indicator.pingCheck('broken', failing as any);
    expect(result.broken.status).toBe('down');
    expect((result.broken as any).message).toBe('disk I/O error');
  });

  test('down on query timeout', async () => {
    const hanging = {
      isInitialized: true,
      query: () => new Promise(() => {}),
    };
    const result = await indicator.pingCheck('hanging', hanging as any, 50);
    expect(result.hanging.status).toBe('down');
    expect((result.hanging as any).message).toBe('Timeout');
  });

  test('connection with only ping() is supported', async () => {
    const pingOnly = {
      isInitialized: true,
      ping: async () => 'pong',
    };
    const result = await indicator.pingCheck('pingy', pingOnly as any);
    expect(result.pingy.status).toBe('up');
  });

  test('connection with neither query nor ping still reports up', async () => {
    const bare = { isInitialized: true };
    const result = await indicator.pingCheck('bare', bare as any);
    expect(result.bare.status).toBe('up');
  });

  test('check() without a connection throws a guiding error', async () => {
    await expect(indicator.check('db' as any)).rejects.toThrow('Use pingCheck()');
  });
});
