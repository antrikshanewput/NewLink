

import { APP_PIPE } from '@nestjs/core';
import { DynamicModule, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraylogConfig, LoggerConfig, LoggerType, NewRelicConfig, TransportType } from 'logger/interface/logger-config.interface';
import { LoggerService } from 'logger/logger.service';
import { LoggerController } from 'logger/logger.controller';

@Module({})
export class LoggerModule {

    static resolveConfig(options: LoggerConfig, configService: ConfigService): LoggerConfig {
        options.type = options.type || configService.get<LoggerType>('LOGGER_TYPE', 'winston');
        options.transports = options.transports || configService.get<TransportType[]>('LOGGER_TRANSPORTS', ["console", "graylog"]);
        options.level = options.level || configService.get<string>('LOGGER_LEVEL', 'info');
        options.graylog = options.graylog || configService.get<GraylogConfig>('GRAYLOG_HOST');
        options.newrelic = options.newrelic || configService.get<NewRelicConfig>('NEWRELIC_HOST');
        return options;
    }



    static register(configuration: LoggerConfig): DynamicModule {
        const options = this.resolveConfig(configuration, new ConfigService());
        const imports = [ConfigModule.forRoot({ isGlobal: true })];
        const exports: any[] = ['LOGGER_CONFIG'];
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