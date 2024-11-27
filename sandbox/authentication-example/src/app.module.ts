import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@newlink/authentication';
import { User } from './entities/user.entities';
import { TestController } from './user.controller';
import { AuthorizationModule } from '@newlink/authorization';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.register({
      authenticationField: 'email',
      registrationFields: ['name', 'email', 'phone', 'password', 'username', 'address', 'pincode', 'gender'],
      userEntity: User,
    }),
    AuthorizationModule.register(
      {
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
      }
    ),
  ],
  controllers: [TestController],
})
export class AppModule { }