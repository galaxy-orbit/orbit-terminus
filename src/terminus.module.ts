import type { DynamicModule } from '@galaxy-stack/orbit-core';
import type { TerminusModuleOptions } from './interfaces/health.interface';
import { HealthCheckService } from './health-check.service';
import { MemoryHealthIndicator } from './health-indicators/memory.indicator';
import { HttpHealthIndicator } from './health-indicators/http.indicator';
import { DatabaseHealthIndicator } from './health-indicators/database.indicator';

export const TERMINUS_OPTIONS = Symbol('TERMINUS_OPTIONS');
export const HEALTH_CHECK_SERVICE = Symbol('HEALTH_CHECK_SERVICE');

export class TerminusModule {
  static forRoot(options: TerminusModuleOptions = {}): DynamicModule {
    return {
      module: TerminusModule,
      global: true,
      providers: [
        {
          provide: TERMINUS_OPTIONS,
          useValue: options,
        },
        {
          provide: HEALTH_CHECK_SERVICE,
          useFactory: () => new HealthCheckService(),
        },
        {
          provide: HealthCheckService,
          useExisting: HEALTH_CHECK_SERVICE,
        },
        {
          provide: MemoryHealthIndicator,
          useFactory: () => new MemoryHealthIndicator(),
        },
        {
          provide: HttpHealthIndicator,
          useFactory: () => new HttpHealthIndicator(),
        },
        {
          provide: DatabaseHealthIndicator,
          useFactory: () => new DatabaseHealthIndicator(),
        },
      ],
      exports: [
        TERMINUS_OPTIONS,
        HEALTH_CHECK_SERVICE,
        HealthCheckService,
        MemoryHealthIndicator,
        HttpHealthIndicator,
        DatabaseHealthIndicator,
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<TerminusModuleOptions> | TerminusModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: TerminusModule,
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: TERMINUS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: HEALTH_CHECK_SERVICE,
          useFactory: () => new HealthCheckService(),
        },
        {
          provide: HealthCheckService,
          useExisting: HEALTH_CHECK_SERVICE,
        },
        {
          provide: MemoryHealthIndicator,
          useFactory: () => new MemoryHealthIndicator(),
        },
        {
          provide: HttpHealthIndicator,
          useFactory: () => new HttpHealthIndicator(),
        },
        {
          provide: DatabaseHealthIndicator,
          useFactory: () => new DatabaseHealthIndicator(),
        },
      ],
      exports: [
        TERMINUS_OPTIONS,
        HEALTH_CHECK_SERVICE,
        HealthCheckService,
        MemoryHealthIndicator,
        HttpHealthIndicator,
        DatabaseHealthIndicator,
      ],
    };
  }
}
