// src/app.service.ts

import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getInfo(): string {
    this.logger.log('Getting information...');
    return 'Information fetched!';
  }
}
