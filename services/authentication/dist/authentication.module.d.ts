import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseOptionsType } from '@newlink/database';
import { AuthenticationOptionsType } from './authentication.type';
export declare class AuthenticationModule {
    static resolveConfig(options: AuthenticationOptionsType): Promise<AuthenticationOptionsType>;
    static resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, config: AuthenticationOptionsType): Promise<TypeOrmModuleOptions>;
    static register(configuration: AuthenticationOptionsType, db?: DatabaseOptionsType): Promise<DynamicModule>;
}
