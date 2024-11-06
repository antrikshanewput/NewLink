import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
interface AuthModuleOptions {
  authenticationField: string;
  registrationFields: string[];
  encryptionStrategy: (password: string) => Promise<string>;
}

@Module({})
export class AuthModule {
  static register(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
          }),
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useValue: options,
        },
        AuthService,
        JwtStrategy],
      controllers: [AuthController],
      exports: [AuthService],
    };
  }
}