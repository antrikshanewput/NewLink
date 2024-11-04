import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '../../config/services/config.service';

@Injectable()
export class LoggingService implements LoggerService, OnModuleInit {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    // Initialize Winston logger with configurations from ConfigService
    this.logger = winston.createLogger({
      level: this.configService.getLogLevel(),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        ...(this.configService.shouldLogToFile()
          ? [
            new winston.transports.File({
              filename: this.configService.getErrorLogFilePath(),
              level: 'error',
            }),
            new winston.transports.File({
              filename: this.configService.getLogFilePath(),
            }),
          ]
          : []),
      ],
    });
  }

  // Log methods for each level, making use of ConfigService
  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  // Standard log method for NestJS LoggerService interface
  log(message: string, meta?: any) {
    this.info(message, meta);
  }
}