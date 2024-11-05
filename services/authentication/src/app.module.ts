import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RateLimiterModule } from '@newlink/rate-limiter';
import { DatabaseModule } from '@newlink/database';
import { CacheModule } from '@newlink/cache';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.register({
      authenticationField: 'email',
      registrationFields: ['name', 'email', 'phone', 'password'],
      encryptionStrategy: async (password: string) => {
        return password;
      },
    }),
    RateLimiterModule,
    DatabaseModule.forRoot(),
    CacheModule,
  ],
})
export class AppModule { }