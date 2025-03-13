import { Injectable } from '@nestjs/common';
import { LoggerService } from '@newput-newlink/logger';

@Injectable()
export class AppService {
  constructor(private readonly loggerService: LoggerService) {}
  getHello(): string {
    this.loggerService.time('getHello');
    this.loggerService.log('Hello Hemant!');
    this.loggerService.warn('Hello Hemant!');
    this.loggerService.error('Hello Hemant!');
    this.loggerService.debug('Hello Hemant!');
    this.loggerService.verbose('Hello Hemant!');
    this.loggerService.http('Hello Hemant!');
    this.loggerService.silly('Hello Hemant!');
    this.loggerService.timeEnd('getHello');
    return 'Hello World!';
  }
}
