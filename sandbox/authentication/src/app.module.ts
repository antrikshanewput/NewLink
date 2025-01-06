import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@newput-newlink/authentication';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.register(
      {
        authenticationField: 'phone',
        roles: ['Admin', 'Editor', 'Viewer'],
        features: ['Create Post', 'Edit Post', 'View Post'],
        permissions: [
          {
            role: 'Admin',
            features: ['Create Post', 'Edit Post', 'View Post'],
          },
          {
            role: 'Editor',
            features: ['Edit Post', 'View Post'],
          },
          {
            role: 'Viewer',
            features: ['View Post'],
          },
        ],
      },
      {
        synchronize: true,
      }
    ),
  ],
  controllers: [AppController],

})
export class AppModule { }
