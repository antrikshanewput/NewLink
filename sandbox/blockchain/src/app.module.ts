import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BlockchainModule } from '@newlink/blockchain';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BlockchainModule.register({})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
