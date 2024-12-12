import { Module, DynamicModule, Global } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { PlivoService } from './sms/plivo.service';
import * as nodemailer from 'nodemailer';
import * as plivo from 'plivo';
import { ConfigService } from '@nestjs/config';
import { NotificationController } from './controllers/notification.controller';
export interface NotificationModuleOptions {
    email?: {
        host?: string;
        port?: number;
        user?: string;
        pass?: string;
        from?: string;
    };
    sms?: {
        authId?: string;
        authToken?: string;
        from?: string;
    };
}

@Global()
@Module({})
export class NotificationModule {
    static resolveConfig(
        options: NotificationModuleOptions,
        configService: ConfigService,
    ): NotificationModuleOptions {
        // Resolve Email Configuration
        options.email = options.email || {};
        options.email.host = options.email.host || configService.get<string>('EMAIL_HOST', '');
        options.email.port = options.email.port || configService.get<number>('EMAIL_PORT', 587);
        options.email.user = options.email.user || configService.get<string>('EMAIL_USER', '');
        options.email.pass = options.email.pass || configService.get<string>('EMAIL_PASS', '');
        options.email.from = options.email.from || configService.get<string>('EMAIL_FROM', '');

        // Resolve SMS Configuration
        options.sms = options.sms || {};
        options.sms.authId = options.sms.authId || configService.get<string>('PLIVO_AUTH_ID', '');
        options.sms.authToken = options.sms.authToken || configService.get<string>('PLIVO_AUTH_TOKEN', '');
        options.sms.from = options.sms.from || configService.get<string>('PLIVO_FROM_NUMBER', '');

        // Validate Email Config
        if (options.email.host && (!options.email.user || !options.email.pass)) {
            throw new Error('Email user and pass are required when email host is provided.');
        }

        // Validate SMS Config
        if ((options.sms.authId && !options.sms.authToken) || (!options.sms.authId && options.sms.authToken)) {
            throw new Error('Both SMS authId and authToken are required for SMS configuration.');
        }

        return options;
    }

    static register(options: NotificationModuleOptions): DynamicModule {
        const providers = [];
        const exports = [];
        const configService = new ConfigService();

        options = this.resolveConfig(options, configService);

        if (options.email) {
            providers.push({
                provide: 'EMAIL_TRANSPORTER',
                useFactory: () => {
                    return nodemailer.createTransport({
                        host: options.email!.host,
                        port: options.email!.port,
                        secure: options.email!.port === 465,
                        auth: {
                            user: options.email!.user,
                            pass: options.email!.pass,
                        },
                    });
                },
            });
            providers.push({
                provide: 'EMAIL_FROM',
                useValue: options.email!.user,
            });
            providers.push(EmailService);
            exports.push(EmailService);
        }

        if (options.sms) {
            providers.push({
                provide: 'PLIVO_CLIENT',
                useFactory: () => new plivo.Client(options.sms!.authId, options.sms!.authToken),
            });
            providers.push({
                provide: 'PLIVO_FROM_NUMBER',
                useValue: options.sms!.from,
            })
            providers.push(PlivoService);

            exports.push(PlivoService);
        }

        return {
            module: NotificationModule,
            providers: [...providers],
            exports: [...exports],
            controllers: [NotificationController],
        };
    }
}