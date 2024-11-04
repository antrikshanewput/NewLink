import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import helmet from 'helmet';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { OAuthStrategy } from '../common/strategies/oauth.strategy';

import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { ConfigService } from './services/config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getJwtConfig(),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.getRateLimitTTL(),
            limit: configService.getRateLimitCount(),
          },
        ],
      }),
    }),
  ],
  providers: [ConfigService, JwtStrategy, OAuthStrategy],
  exports: [ConfigService, PassportModule, JwtModule],
})
export class ConfigModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Configure Helmet with options from environment variables
    consumer.apply(
      helmet({
        contentSecurityPolicy: process.env.HELMET_CSP === 'true',
        crossOriginEmbedderPolicy: process.env.HELMET_COEP === 'true',
        crossOriginResourcePolicy: process.env.HELMET_CORP === 'true',
        dnsPrefetchControl: { allow: process.env.HELMET_DNS_PREFETCH === 'true' },
        frameguard: {
          action: (process.env.HELMET_FRAMEGUARD === 'sameorigin' ? 'sameorigin' : 'deny')
        },
        hidePoweredBy: process.env.HELMET_HIDE_POWERED_BY === 'true',
        hsts: { maxAge: parseInt(process.env.HELMET_HSTS_MAX_AGE || '15552000') },
        ieNoOpen: process.env.HELMET_IE_NO_OPEN === 'true',
        noSniff: process.env.HELMET_NO_SNIFF === 'true',
        originAgentCluster: process.env.HELMET_ORIGIN_AGENT_CLUSTER === 'true',
        permittedCrossDomainPolicies: process.env.HELMET_PERMITTED_CDP === 'by-content-type',
        referrerPolicy: {
          policy: (['no-referrer', 'origin', 'same-origin', 'strict-origin'].includes(process.env.HELMET_REFERRER_POLICY)
            ? process.env.HELMET_REFERRER_POLICY
            : 'no-referrer') as 'no-referrer' | 'origin' | 'same-origin' | 'strict-origin'
        },
        xssFilter: process.env.HELMET_XSS_FILTER === 'true',
      })
    ).forRoutes('*'); // Applies Helmet globally
  }
}