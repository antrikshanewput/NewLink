import { DynamicModule } from "@nestjs/common";
import { NotificationModuleOptions } from "./notification.type";
export declare class NotificationModule {
    static register(options: NotificationModuleOptions): DynamicModule;
}
