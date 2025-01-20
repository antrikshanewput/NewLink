import { Module, DynamicModule, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtServiceWrapper } from './jwt/jwt.service';

@Global()
@Module({})
export class AuthorizationModule {
  static register(): DynamicModule {
    return {
      module: AuthorizationModule,
      imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'default-secret',
            signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d' },
          }),
        }),
      ],
      providers: [JwtServiceWrapper],
      exports: [JwtServiceWrapper, JwtModule],
    };
  }
}