import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@newput-newlink/authentication';
import { LoginDto } from './login.dto';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.register({
      authenticationField: 'phone',
      dto: [
        {
          provide: 'LOGIN_DTO',
          useValue: LoginDto
        }
      ]
    }),
  ],
  controllers: [AppController],

})
export class AppModule { }
