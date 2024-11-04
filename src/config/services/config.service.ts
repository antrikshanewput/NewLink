import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) { }

  get(key: string): string {
    return this.configService.get<string>(key);
  }

  getDatabaseConfig(): TypeOrmModuleOptions {
    const dbType = this.configService.get<string>('DB_TYPE');

    if (dbType === 'mongodb') {
      return {
        type: 'mongodb',
        url: this.configService.get<string>('DB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        synchronize: true, // Only for development; disable in production
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      };
    } else if (dbType === 'postgres') {
      return {
        type: 'postgres',
        host: this.configService.get<string>('DB_HOST'),
        port: Number(this.configService.get<string>('DB_PORT')),
        username: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASS'),
        database: this.configService.get<string>('DB_NAME'),
        synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      };
    }
    throw new Error('Unsupported database type');
  }
  // Rate Limiter Configuration
  getRateLimitTTL(): number {
    return parseInt(this.configService.get<string>('RATE_LIMITER_TTL') || '60', 10); // Defaults to 60 seconds
  }

  getRateLimitCount(): number {
    return parseInt(this.configService.get<string>('RATE_LIMITER_LIMIT') || '10', 10); // Defaults to 10 requests
  }


  getRedisConfig() {
    return {
      host: this.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.get('REDIS_PORT') || '6379', 10),
      password: this.get('REDIS_PASSWORD') || undefined,
      db: parseInt(this.get('REDIS_DB') || '0', 10),
    };
  }


  getJwtConfig() {
    return {
      secret: this.get('JWT_SECRET'),
      signOptions: { expiresIn: this.get('JWT_EXPIRATION') || '1h' },
    };
  }


  getOAuthConfig() {
    return {
      clientID: this.get('OAUTH_CLIENT_ID'),
      clientSecret: this.get('OAUTH_CLIENT_SECRET'),
      callbackURL: this.get('OAUTH_CALLBACK_URL'),
      authorizationURL: this.get('OAUTH_AUTHORIZATION_URL') || 'https://example.com/oauth/authorize',
      tokenURL: this.get('OAUTH_TOKEN_URL') || 'https://example.com/oauth/token',
    };
  }




  // Logging configuration
  getLogLevel(): string {
    return this.get('LOG_LEVEL') || 'info';
  }

  shouldLogToFile(): boolean {
    return this.get('LOG_TO_FILE') === 'true';
  }

  getLogFilePath(): string {
    return this.get('LOG_FILE_PATH') || 'logs/combined.log';
  }

  getErrorLogFilePath(): string {
    return this.get('ERROR_LOG_FILE_PATH') || 'logs/error.log';
  }



}