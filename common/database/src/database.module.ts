import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseOptionsType } from './database.types';

@Module({})
export class DatabaseModule {
  static register(database: DatabaseOptionsType): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            return {
              type: (database.type || configService.get<string>('DB_TYPE') || 'postgres') as TypeOrmModuleOptions['type'],
              host: database.host || configService.get<string>('DB_HOST') || 'localhost',
              port: database.port || configService.get<number>('DB_PORT') || 5432,
              username: database.username || configService.get<string>('DB_USERNAME') || 'postgres',
              password: database.password || configService.get<string>('DB_PASSWORD') || 'postgres',
              database: database.database || configService.get<string>('DB_NAME') || 'postgres',
              synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNC') ?? false,
              entities: database.entities || [],
              logging: database.logging ?? configService.get<boolean>('DB_LOGGING') ?? false,
            } as TypeOrmModuleOptions;
          },
        }),
      ],
    };
  }
}