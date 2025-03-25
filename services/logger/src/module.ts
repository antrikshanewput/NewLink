

import { APP_PIPE } from '@nestjs/core';
import { DynamicModule, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraylogConfig, LoggerConfig, LoggerType, NewRelicConfig, TransportType, DatabaseConfig, AuditConfig } from 'logger/interface/logger-config.interface';
import { LoggerService } from 'logger/logger.service';
import { AuditService } from 'logger/audit.service';
import { LoggerController } from 'logger/logger.controller';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({})
export class LoggerModule {

    static resolveConfig(options: LoggerConfig, configService: ConfigService): LoggerConfig {
        options.type = options.type || configService.get<LoggerType>('LOGGER_TYPE', 'winston');
        options.transports = options.transports || configService.get<TransportType[]>('LOGGER_TRANSPORTS', ["console", "graylog"]);
        options.level = options.level || configService.get<string>('LOGGER_LEVEL', 'info');
        options.graylog = options.graylog || configService.get<GraylogConfig>('GRAYLOG_HOST');
        options.newrelic = options.newrelic || configService.get<NewRelicConfig>('NEWRELIC_HOST');
        options.dbaudit = options.dbaudit || configService.get<AuditConfig>('AUDIT_OPTIONS');
        return options;
    }

    static async resolveDatabaseConfig(database: DatabaseConfig, configService: ConfigService): Promise<TypeOrmModuleOptions> {
      return {
        type: (database.type || configService.get<string>('DB_TYPE', 'postgres')) as DatabaseConfig['type'],
        host: database.host || configService.get<string>('DB_HOST', 'localhost'),
        port: (database.port || configService.get<number>('DB_PORT', 5432)) as number,
        username: database.username || configService.get<string>('DB_USERNAME', 'postgres'),
        password: database.password || configService.get<string>('DB_PASSWORD', 'password'),
        database: database.database || configService.get<string>('DB_NAME', 'ah_db_old'),
        synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE', false) ?? false,
        autoLoadEntities: true,
      } as TypeOrmModuleOptions;
    }

    static register(configuration: LoggerConfig, db: DatabaseConfig = {}): DynamicModule {
        const options = this.resolveConfig(configuration, new ConfigService());
        const imports = [
          ConfigModule.forRoot({ isGlobal: true }),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => await this.resolveDatabaseConfig(db, configService),
          }),
        ];
        const exports: any[] = ['LOGGER_CONFIG', AuditService, TypeOrmModule];
        const providers: any[] = [
            {
                provide: 'LOGGER_CONFIG',
                useValue: options,
            },
            {
                provide: APP_PIPE,
                useFactory: () => {
                    return new ValidationPipe({
                        whitelist: true,
                        transform: true,
                        forbidNonWhitelisted: true,
                        transformOptions: {
                            enableImplicitConversion: true,
                        },
                    });
                },
            },
            AuditService
        ];
        const controllers = [];

        if (options.graylog || options.newrelic) { // since i have a single logger service
            providers.push(LoggerService);
            exports.push(LoggerService);
            controllers.push(LoggerController);
        }

        return {
            module: LoggerModule,
            imports: imports,
            providers: providers,
            controllers: controllers,
            exports: exports,
        };
    }
}