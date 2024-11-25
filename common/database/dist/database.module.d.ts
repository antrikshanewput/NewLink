import { DynamicModule } from '@nestjs/common';
import { DatabaseOptionsType } from './database.types';
export declare class DatabaseModule {
    static register(database: DatabaseOptionsType): DynamicModule;
}
