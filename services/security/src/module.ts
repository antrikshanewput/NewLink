import { DynamicModule, Module, MiddlewareConsumer, NestModule, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CsrfMiddleware } from 'csrf/csrf.middleware';
import { SecurityOptions } from 'interface/security-config.interface';
import { RateLimitMiddleware } from 'rate-limiter/rate-limiter.middleware';
import { SqlInjectionMiddleware } from 'sql-injection/sql-injection.middleware';
import { SqlInjectionService } from 'sql-injection/sql-injection.service';
import { XssMiddleware } from 'xss/xss.middleware';
import { XssService } from 'xss/xss.service';
import cookieParser from 'cookie-parser';
import { SqlInjectionPipe } from 'sql-injection/sql-injection.pipe';
import { RateLimitPipe } from 'rate-limiter/rate-limiter.pipe';
import { CsrfPipe } from 'csrf/csrf.pipe';
import { EncryptionMiddleware } from 'encryption/encryption.middleware';

@Module({
  imports: [ConfigModule], // Ensure config module is imported
})
export class SecurityModule implements NestModule {
  constructor(
    private readonly configService: ConfigService, // Inject ConfigService
    @Inject('SECURITY_OPTIONS') private readonly options: SecurityOptions, // Inject SECURITY_OPTIONS - we need this in configure method
  ) {}

  static resolveConfig(options: SecurityOptions, configService: ConfigService): SecurityOptions {
    console.log('Options in resolve Config')
    console.log(options);
    return {
      xssProtection: options.xssProtection ?? configService.get<boolean>('SECURITY_ENABLE_XSS', true),
      sqlInjectionProtection: options.sqlInjectionProtection ?? configService.get<boolean>('SECURITY_ENABLE_SQL_INJECTION', true),
      enableRateLimiter: options.enableRateLimiter ?? configService.get<boolean>('SECURITY_ENABLE_RATE_LIMITER', true),
      enableCsrfProtection: options.enableCsrfProtection ?? configService.get<boolean>('SECURITY_ENABLE_CSRF', true),
      rateLimiter: options.rateLimiter ?? {
        windowMs: options.rateLimiter.windowMs ?? configService.get<number>('RATE_LIMITER_WINDOW_MS', 15 * 60 * 1000),
        maxRequests: options.rateLimiter.maxRequests ?? configService.get<number>('RATE_LIMITER_MAX_REQUESTS', 100),
      },
      csrfProtection: options.csrfProtection ?? {
        secret: options.csrfProtection.secret ?? configService.get<string>('CSRF_SECRET', 'default-secret'),
        cookie: options.csrfProtection.cookie ?? configService.get<boolean>('CSRF_COOKIE', true),
      },
      useEncryption: options.useEncryption ?? configService.get<boolean>('USE_ENCRYPTION', true),
      rsaConfig: options.rsaConfig ?? {
        privateKey:options.rsaConfig?.privateKey ?? configService.get<string>('RSA_PRIVATE_KEY'),
        publicKey: options.rsaConfig?.publicKey ?? configService.get<string>('RSA_PUBLIC_KEY'),
      }
    };
  }

  static register(options: SecurityOptions): DynamicModule {
    const configService = new ConfigService();
    const resolvedOptions = this.resolveConfig(options, configService);

    return {
      module: SecurityModule,
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        {
          provide: 'SECURITY_OPTIONS',
          useValue: resolvedOptions,
        },
        XssService,
        SqlInjectionService,
        SqlInjectionPipe,
        RateLimitPipe,
        CsrfPipe
      ],
      exports: ['SECURITY_OPTIONS', XssService, SqlInjectionService, RateLimitPipe, CsrfPipe],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
    if (this.options?.xssProtection) {
      consumer.apply(XssMiddleware).forRoutes('*');
    }
    if(this.options?.useEncryption) {
      consumer.apply(EncryptionMiddleware).forRoutes('*');
    }
    if (this.options?.sqlInjectionProtection) {
      consumer.apply(SqlInjectionMiddleware).forRoutes('*');
    }
    if (this.options?.enableRateLimiter) {
      consumer.apply(RateLimitMiddleware).forRoutes('*');
    }
    if (this.options?.enableCsrfProtection) {
      consumer.apply(CsrfMiddleware).forRoutes('*');
    }
  }
}
