import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@newlink/authentication';
import { User } from './entities/user.entities';
import { TestController } from './user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.register(
      {
        authenticationField: 'phone',
        registrationFields: ['first_name', 'last_name', 'email', 'phone', 'password', 'username', 'address', 'pincode', 'gender'],
        entities: [User],
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
  controllers: [TestController],
})
export class AppModule { }