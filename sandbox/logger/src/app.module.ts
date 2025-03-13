import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@newput-newlink/logger';
@Module({
  imports: [
    LoggerModule.register({
      type: 'winston',
      transports: ['console', 'graylog'],
      level: 'silly',
      graylog: {
        host: 'localhost',
        port: 12201,
        protocol: 'http',
      },
      newrelic: {
        host: 'localhost',
        port: 12201,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
