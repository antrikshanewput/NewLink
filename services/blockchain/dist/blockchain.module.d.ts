import { DynamicModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BlockchainOptionsType, BlockchainTokenTypes } from "./blockchain.type";
export declare class BlockchainModule {
    private static createdTokens;
    static resolveConfig(options: BlockchainOptionsType, configService: ConfigService): BlockchainOptionsType;
    static register(options: BlockchainOptionsType, tokens: BlockchainTokenTypes[]): DynamicModule;
}
