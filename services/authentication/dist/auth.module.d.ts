import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseOptionsType } from '@newlink/database';
import { AuthOptionsType } from './auth.types';
export declare class AuthModule {
    static resolveConfig(options: AuthOptionsType): Promise<AuthOptionsType>;
    static resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, userEntity: Function): Promise<TypeOrmModuleOptions>;
    static register(configuration: AuthOptionsType, db?: DatabaseOptionsType): Promise<DynamicModule>;
}
