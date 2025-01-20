import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({})
export class TenantModule {
    static resolveConfig(options: any, configService: ConfigService) {
        return options;
    }

    static register(options: any): DynamicModule {
        options = this.resolveConfig(options, new ConfigService());

        const imports: Promise<DynamicModule>[] = [ConfigModule.forRoot()];
        const providers: [] = [];
        const controllers: [] = [];
        const exports: [] = [];

        return {
            module: TenantModule,
            imports: imports,
            providers: providers,
            exports: exports,
            controllers: controllers,
        }
    }

}