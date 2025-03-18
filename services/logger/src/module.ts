

import { APP_PIPE } from '@nestjs/core';
import { DynamicModule, Module, Global, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraylogConfig, LoggerConfig, LoggerType, NewRelicConfig, TransportType } from 'logger/interface/logger-config.interface';
import { LoggerService } from 'logger/logger.service';
import { LoggerController } from 'logger/logger.controller';
import { AuditController } from './controllers/audit.controller';
import { AuditService } from 'services/audit.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { EntityRegistry } from 'entities';

import { DatabaseOptionsType } from 'database.types';

import { AuditLog } from 'entities/audit.entity';

import { DefaultDTO } from 'dto';

@Global()
@Module({})
export class LoggerModule {

    static resolveConfig(options: LoggerConfig, configService: ConfigService): LoggerConfig {
        const entities = [AuditLog].map((entity) => {
          return options.entities?.find((optionsEntity) => optionsEntity.name === entity.name) || entity;
        });

        entities.forEach((entity) => {
          EntityRegistry.registerEntity(entity.name, entity);
        });

        options.dto = options.dto
        ? DefaultDTO.map((defaultDto) => {
            const customDto = options.dto?.find((dto) => dto.provide === defaultDto.provide) || defaultDto;
            return { provide: customDto.provide, useValue: customDto.useValue };
          })
        : DefaultDTO;
        options.type = options.type || configService.get<LoggerType>('LOGGER_TYPE', 'winston');
        options.transports = options.transports || configService.get<TransportType[]>('LOGGER_TRANSPORTS', ["console", "graylog"]);
        options.level = options.level || configService.get<string>('LOGGER_LEVEL', 'info');
        options.graylog = options.graylog || configService.get<GraylogConfig>('GRAYLOG_HOST');
        options.newrelic = options.newrelic || configService.get<NewRelicConfig>('NEWRELIC_HOST');
        options.entities = entities;
        return options;
    }

    static async resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, config: LoggerConfig): Promise<TypeOrmModuleOptions> {
      return {
        type: (database.type || configService.get<string>('DB_TYPE', 'postgres')) as DatabaseOptionsType['type'],
        host: database.host || configService.get<string>('DB_HOST', 'localhost'),
        port: (database.port || configService.get<number>('DB_PORT', 5432)) as number,
        username: database.username || configService.get<string>('DB_USERNAME', 'postgres'),
        password: database.password || configService.get<string>('DB_PASSWORD', 'password'),
        database: database.database || configService.get<string>('DB_NAME', 'ah_db_old'),
        synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE', false) ?? false,
        entities: config.entities,
        autoLoadEntities: true,
      } as TypeOrmModuleOptions;
    }

    static async register(configuration: LoggerConfig, db: DatabaseOptionsType = {}): Promise<DynamicModule> {
        const options = this.resolveConfig(configuration, new ConfigService());
        const imports = [
          ConfigModule.forRoot({ isGlobal: true }),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => await this.resolveDatabaseConfig(db, configService, options),
          }),
          TypeOrmModule.forFeature([AuditLog]),
        ];
        const exports: any[] = ['LOGGER_CONFIG', AuditService];
        const providers: any[] = [
            {
                provide: 'LOGGER_CONFIG',
                useValue: options,
            },
            ...options.entities!.map((entity) => ({
              provide: `${entity.name.toUpperCase()}_REPOSITORY`,
              useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
              inject: [DataSource],
            })),
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
            ...options.dto,
            AuditService
        ];
        const controllers: any[] = [AuditController];

        if (options.graylog || options.newrelic) { // since i have a single logger service
            providers.push(LoggerService);
            exports.push(LoggerService);
            controllers.push(LoggerController);
        }

        exports.push(TypeOrmModule);

        return {
            module: LoggerModule,
            imports: imports,
            providers: providers,
            controllers: controllers,
            exports: exports,
        };
    }
}