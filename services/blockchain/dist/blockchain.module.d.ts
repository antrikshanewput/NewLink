import { DynamicModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export declare class BlockchainModule {
    static resolveConfig(options: BlockchainOptionsType, configService: ConfigService): BlockchainOptionsType;
    static register(options: BlockchainOptionsType): DynamicModule;
}
