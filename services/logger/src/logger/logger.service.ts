import { Injectable, Inject } from '@nestjs/common';
import * as winston from 'winston';
import * as consola from 'consola';
import TransportStream, * as Transport from 'winston-transport';
import GraylogTransport from 'winston-graylog2';
import { LoggerConfig } from './interface/logger-config.interface';
import chalk from 'chalk';
@Injectable()
export class LoggerService {
  private logger: any;
  private timers: Map<string, number> = new Map();

  constructor(@Inject('LOGGER_CONFIG') private readonly config: LoggerConfig) {
    this.initializeLogger();
  }

  private initializeLogger() {
    switch (this.config.type) {
      case 'winston':
        this.logger = winston.createLogger({
          level: this.config.level || 'info',
          transports: this.createWinstonTransports(),
          format: winston.format.printf(({ level, message }) =>
            this.colorizeLog(level, message),
          ),
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
        }) as unknown as TransportStream,
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

  private colorizeLog(level: string, message: any): string {
    const colorMap: Record<string, (msg: string) => string> = {
      error: chalk.red.bold,
      warn: chalk.yellow.bold,
      info: chalk.blue,
      debug: chalk.green,
      trace: chalk.magenta,
      verbose: chalk.cyan,
      silly: chalk.gray,
      http: chalk.magenta,
    };

    return colorMap[level] ? colorMap[level](`[${level.toUpperCase()}] ${message}`) : message;
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

  silly(message: string) {
    this.logger.silly(message);
  }

  http(message: string) {
    this.logger.http(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  time(label: string) {
    this.timers.set(label, Date.now());
  }

  timeEnd(label: string) {
    if (this.timers.has(label)) {
      const duration = Date.now() - this.timers.get(label);
      this.timers.delete(label);
      this.logger.info(`Method '${label}' took ${duration}ms`);
    } else {
      this.logger.warn(`No active timer found for label '${label}'`);
    }
  }
}
