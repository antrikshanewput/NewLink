import { APP_PIPE } from '@nestjs/core';
import { DynamicModule, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { HederaService } from "hedera/services/hedera.service";
import { HederaController } from "hedera/controllers/hedera.controller";
import { BlockchainOptionsType } from "blockchain.type";

import { DefaultDTO } from "dto";

@Module({})
export class BlockchainModule {

    static resolveConfig(options: BlockchainOptionsType, configService: ConfigService): BlockchainOptionsType {
        options.blockchain = options.blockchain || configService.get<string>('BLOCKCHAIN', 'hedera');
        options.network = options.network || configService.get<string>('BLOCKCHAIN_NETWORK', 'testnet') as BlockchainOptionsType['network'];
        options.account_id = options.account_id || configService.get<string>('BLOCKCHAIN_ACCOUNT_ID');
        options.private_key = options.private_key || configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
        options.initial_balance = options.initial_balance || Number(configService.get<number>('BLOCKCHAIN_INITIAL_BALANCE', 10000000));
        if (!options.account_id || !options.private_key) {
            throw new Error('Blockchain account_id and private_key are required.');
        }
        if (!['mainnet', 'testnet', 'previewnet'].includes(options.network!)) {
            throw new Error('Invalid blockchain network. Supported networks: mainnet, testnet, previewnet.');
        }

        options.dto = options.dto
            ? DefaultDTO.map(defaultDto => {
                const customDto = options.dto?.find(dto => dto.provide === defaultDto.provide) || defaultDto;
                return { provide: customDto.provide, useValue: customDto.useValue }
            })
            : DefaultDTO;
        return options;
    }



    static register(configuration: BlockchainOptionsType): DynamicModule {
        const options = this.resolveConfig(configuration, new ConfigService());
        const imports = [ConfigModule.forRoot({ isGlobal: true })];
        const exports: any[] = ['BLOCKCHAIN_CONFIG'];
        const providers: any[] = [
            {
                provide: 'BLOCKCHAIN_CONFIG',
                useValue: options,
            },
            {
                provide: APP_PIPE,
                useFactory: () => {
                    return new ValidationPipe({
                        whitelist: true,
                        transform: true,
                        forbidNonWhitelisted: true,
                    });
                },
            },
            ...options.dto
        ];
        const controllers = [];

        switch (options.blockchain) {
            case 'hedera':

                providers.push(HederaService);
                exports.push(HederaService);
                controllers.push(HederaController);
                break;
            default:
                throw new Error(`Invalid blockchain provider: ${options.blockchain}. Supported providers: 'hedera'.`);
        }

        return {
            module: BlockchainModule,
            imports: imports,
            providers: providers,
            controllers: controllers,
            exports: exports,
        };
    }
}