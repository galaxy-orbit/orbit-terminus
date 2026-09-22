# @galaxy-stack/orbit-terminus

[![npm version](https://img.shields.io/npm/v/@galaxy-stack/orbit-terminus.svg)](https://www.npmjs.com/package/@galaxy-stack/orbit-terminus)
[![docs](https://img.shields.io/badge/docs-galaxy--orbit--framework.vercel.app-blue)](https://galaxy-orbit-framework.vercel.app)

Part of the [Orbit framework](https://github.com/galaxy-orbit/orbit) — a NestJS-style backend framework for [Bun](https://bun.sh).

## Installation

```bash
bun add @galaxy-stack/orbit-terminus
```

# @galaxy-stack/orbit-terminus

## Mô tả
Module Health Check cho Orbit, giúp kiểm tra tình trạng của ứng dụng và các dependencies.

## Tính năng chính

### 1. Health Indicators
- **MemoryHealthIndicator**: Kiểm tra memory usage
- **HttpHealthIndicator**: Kiểm tra external HTTP services
- **DatabaseHealthIndicator**: Kiểm tra database connection

### 2. Health Check Service
```typescript
import { HealthCheckService } from '@galaxy-stack/orbit-terminus';

class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private db: DatabaseHealthIndicator,
  ) {}

  @Get('health')
  async check() {
    return this.health.check('app', [
      () => this.memory.checkHeap('memory', { heapUsedThreshold: 150 * 1024 * 1024 }),
      () => this.db.pingCheck('database', this.dataSource),
    ]);
  }
}
```

## Cấu hình Module

```typescript
import { TerminusModule } from '@galaxy-stack/orbit-terminus';

@Module({
  imports: [TerminusModule.forRoot()],
  controllers: [HealthController],
})
class AppModule {}
```

## Health Indicators

### Memory Check
```typescript
@Get('health')
async check() {
  return this.health.check('app', [
    () => this.memory.checkHeap('memory_heap', {
      heapUsedThreshold: 150 * 1024 * 1024,  // 150MB
    }),
    () => this.memory.checkRSS('memory_rss', {
      rssThreshold: 300 * 1024 * 1024,  // 300MB
    }),
  ]);
}
```

### HTTP Check
```typescript
() => this.http.pingCheck('google', 'https://google.com', {
  timeout: 5000,
  expectedStatus: 200,
})
```

### Database Check
```typescript
() => this.db.pingCheck('database', dataSource, 5000)
```

## Response Format

### Healthy
```json
{
  "status": "ok",
  "info": {
    "memory": { "status": "up", "details": { "heapUsed": "50.25 MB" } },
    "database": { "status": "up", "details": { "responseTime": "5ms" } }
  },
  "details": {
    "memory": { "status": "up" },
    "database": { "status": "up" }
  }
}
```

### Unhealthy
```json
{
  "status": "error",
  "error": {
    "database": { "status": "down", "message": "Connection refused" }
  },
  "details": {
    "memory": { "status": "up" },
    "database": { "status": "down" }
  }
}
```

## Graceful Shutdown

```typescript
import { HealthCheckService } from '@galaxy-stack/orbit-terminus';

// Đánh dấu app đang shutdown
healthService.setShuttingDown();

// Response sẽ trả về
{
  "status": "shutting_down",
  "details": {}
}
```

## Use Cases
- **Kubernetes liveness/readiness probes**
- **Load balancer health checks**
- **Monitoring systems**
- **Service mesh integration**
