import { Module, DynamicModule } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({})
export class CacheModule {
  static register(): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        ConfigModule.forRoot(),
        NestCacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            store: configService.get<string>('REDIS_STORE', 'redis'),
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD'),
            ttl: configService.get<number>('REDIS_TTL', 600),
          }),
        }),
      ],
      providers: [CacheService],
      exports: [NestCacheModule, CacheService],
    };
  }
}




