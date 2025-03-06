import { Injectable, Inject } from '@nestjs/common';
import * as winston from 'winston';
import * as consola from 'consola';
import * as Transport from 'winston-transport';
import * as GraylogTransport from 'winston-graylog2';
import { LoggerConfig } from './interface/logger-config.interface';

@Injectable()
export class LoggerService {
  private logger: any;

  constructor(@Inject('LOGGER_CONFIG') private readonly config: LoggerConfig) {
    this.initializeLogger();
  }

  private initializeLogger() {
    switch (this.config.type) {
      case 'winston':
        this.logger = winston.createLogger({
          level: this.config.level || 'info',
          transports: this.createWinstonTransports(),
        });
        break;

      case 'consola':
        this.logger = consola;
        this.logger.level = this.mapConsolaLogLevel(
          this.config.level || 'info',
        );
        break;

      default:
        throw new Error(`Unsupported logger type: ${this.config.type}`);
    }
  }

  private createWinstonTransports(): Transport[] {
    const transports: Transport[] = [];

    if (this.config.transports.includes('console')) {
      transports.push(new winston.transports.Console());
    }

    if (this.config.transports.includes('graylog') && this.config.graylog) {
      transports.push(
        new GraylogTransport({
          graylog: {
            servers: [
              {
                host: this.config.graylog.host,
                port: this.config.graylog.port,
              },
            ],
          },
        }),
      );
    }

    if (this.config.transports.includes('newrelic') && this.config.newrelic) {
      transports.push(
        new winston.transports.Http({
          host: this.config.newrelic.host,
          port: this.config.newrelic.port,
          path: this.config.newrelic.path,
          ssl: this.config.newrelic.ssl,
        }),
      );
    }

    return transports;
  }

  private mapConsolaLogLevel(level: string): number {
    const levels: { [key: string]: number } = {
      fatal: 0,
      error: 1,
      warn: 2,
      log: 3,
      info: 3,
      debug: 4,
      trace: 5,
    };
    return levels[level] || 3;
  }

  log(message: string) {
    this.logger.log('info', message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
