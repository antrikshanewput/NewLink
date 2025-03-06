import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerConfig } from './interface/logger-config.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class LoggerModule {
  static register(config: LoggerConfig): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        { provide: 'LOGGER_CONFIG', useValue: config },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }

  static registerAsync(p0: {
    imports: (typeof ConfigModule)[];
    inject: (typeof ConfigService)[];
    useFactory: (configService: ConfigService) => LoggerConfig;
  }): DynamicModule {
    console.log(p0);
    return {
      module: LoggerModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'LOGGER_CONFIG',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: configService.get<'winston' | 'consola'>(
              'LOGGER_TYPE',
              'winston',
            ),
            transports: configService.get<string[]>('LOGGER_TRANSPORTS', [
              'console',
            ]) as any,
            level: configService.get<string>('LOGGER_LEVEL', 'info'),
            graylog: configService.get('GRAYLOG_CONFIG') || undefined,
            newrelic: configService.get('NEWRELIC_CONFIG') || undefined,
          }),
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
