import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@newlink/authentication';
import { User } from './entities/user.entities';
import { TestController } from './user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.register({
      authenticationField: 'email',
      registrationFields: ['name', 'email', 'phone', 'password', 'username', 'address', 'pincode', 'gender'],
      userEntity: User,
    },
    {
      entities: [User],
      synchronize: true,
    }
  ),

  ],
  controllers: [TestController],
})
export class AppModule { }