import { DynamicModule, Module } from "@nestjs/common";
import { NotificationModuleOptions } from "./notification.type";
import { EmailService } from "./service/email.service";

@Module({})
export class NotificationModule {
    static register(options: NotificationModuleOptions): DynamicModule {
        return {
            module: NotificationModule,

            providers: [
                {
                    provide: 'NOTIFICATION_OPTIONS',
                    useValue: options,
                },
                EmailService,
            ],
            exports: [EmailService],
        };
    }
}