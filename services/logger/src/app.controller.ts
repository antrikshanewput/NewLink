import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Controller()
export class AppController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  getInformation(): string {
    this.logger.log('Getting Information');
    return 'Information Fetched';
  }
}
