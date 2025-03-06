import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { LoggerConfig } from './logger/interface/logger-config.interface';
import { AppController } from './app.controller';

const loggerConfigFactory = (configService: ConfigService): LoggerConfig => ({
  type: configService.get<'winston' | 'consola'>('LOGGER_TYPE', 'winston'),
  transports: configService.get<string[]>('LOGGER_TRANSPORTS', [
    'console',
  ]) as any,
  level: configService.get<string>('LOGGER_LEVEL', 'info'),
  graylog: configService.get('GRAYLOG_CONFIG') || undefined,
  newrelic: configService.get('NEWRELIC_CONFIG') || undefined,
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    LoggerModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: loggerConfigFactory,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
