import { APP_PIPE } from '@nestjs/core';
import { Module, DynamicModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";

import * as nodemailer from 'nodemailer';
import * as plivo from 'plivo';

import { EmailService } from 'email/email.service';
import { PlivoService } from 'sms/plivo.service';
import { NotificationController } from 'controllers/notification.controller';
import { NotificationModuleOptions } from 'notification.type';

import { DefaultDTO } from 'dto';

@Module({})
export class NotificationModule {
    static resolveConfig(options: NotificationModuleOptions, configService: ConfigService): NotificationModuleOptions {

        options.email = {
            host: configService.get('EMAIL_HOST', ''),
            port: configService.get('EMAIL_PORT', 587),
            user: configService.get('EMAIL_USER', ''),
            pass: configService.get('EMAIL_PASS', ''),
            from: configService.get('EMAIL_FROM', ''),
        }

        options.sms = {
            provider: configService.get('SMS_PROVIDER', 'plivo'),
            authId: configService.get('PLIVO_AUTH_ID', ''),
            authToken: configService.get('PLIVO_AUTH_TOKEN', ''),
            from: configService.get('PLIVO_FROM_NUMBER', '')
        };

        if (options.email.host && (!options.email.user || !options.email.pass)) {
            throw new Error('Email configuration is invalid. Provide both user and pass.');
        }

        if ((options.sms.authId && !options.sms.authToken) || (!options.sms.authId && options.sms.authToken)) {
            throw new Error('Both SMS authId and authToken are required.');
        }




        options.dto = options.dto
            ? DefaultDTO.map(defaultDto => {
                const customDto = options.dto?.find(dto => dto.provide === defaultDto.provide) || defaultDto;
                return { provide: customDto.provide, useValue: customDto.useValue }
            })
            : DefaultDTO;

        return options;
    }

    static register(configuration: NotificationModuleOptions): DynamicModule {
        const options = this.resolveConfig(configuration, new ConfigService());
        const imports = [ConfigModule.forRoot({ isGlobal: true })];
        const providers: any[] = [
            {
                provide: APP_PIPE,
                useFactory: () => {
                    return new ValidationPipe({
                        whitelist: true,
                        transform: true,
                        forbidNonWhitelisted: true,
                    });
                },
            },
            ...options.dto,
        ];
        const exports = [];
        const controllers = [NotificationController];

        if (options.email) {
            providers.push({
                provide: 'EMAIL_TRANSPORTER',
                useFactory: () => {
                    return nodemailer.createTransport({
                        host: options.email.host,
                        port: options.email.port,
                        secure: options.email.port === 465,
                        auth: {
                            user: options.email.user,
                            pass: options.email.pass,
                        },
                    });
                },
            });
            providers.push({
                provide: 'EMAIL_FROM',
                useValue: options.email.from,
            });
            providers.push(EmailService);
            exports.push(EmailService);
        }

        if (options.sms) {
            providers.push({
                provide: 'PLIVO_CLIENT',
                useFactory: () => {
                    if (!options.sms.authId || !options.sms.authToken) {
                        throw new Error('Plivo credentials are missing.');
                    }
                    return new plivo.Client(options.sms.authId, options.sms.authToken);
                },
            });
            providers.push({
                provide: 'PLIVO_FROM_NUMBER',
                useValue: options.sms.from,
            });
            providers.push(PlivoService);
            exports.push(PlivoService);
        }

        return {
            module: NotificationModule,
            imports: imports,
            providers: providers,
            exports: exports,
            controllers: controllers,
        };
    }
}