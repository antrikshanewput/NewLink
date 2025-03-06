import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '@newput-newlink/notification';

@Module({
  imports: [
ConfigModule.forRoot({ isGlobal: true }),
NotificationModule.register({})
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
