import { DynamicModule } from '@nestjs/common';
interface AuthModuleOptions {
    authenticationField: string;
    registrationFields: string[];
    encryptionStrategy: (password: string) => Promise<string>;
}
export declare class AuthModule {
    static register(options: AuthModuleOptions): DynamicModule;
}
export {};
