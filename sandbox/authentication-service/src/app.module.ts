import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@newput-newlink/authentication';

@Module({
  imports: [
ConfigModule.forRoot({ isGlobal: true }),
AuthenticationModule.register(
          {
            authenticationField: 'phone',
          },
          {
            synchronize: true,
          }
        )
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
