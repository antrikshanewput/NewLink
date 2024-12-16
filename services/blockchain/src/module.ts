import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HederaService } from "./Hedera/services/hedera.service";
import { HederaController } from "./Hedera/controllers/hedera.controller";
import { BlockchainOptionsType } from "./blockchain.type";

@Module({})
export class BlockchainModule {

    static resolveConfig(options: BlockchainOptionsType, configService: ConfigService): BlockchainOptionsType {
        options.blockchain = options.blockchain || configService.get<string>('BLOCKCHAIN', 'hedera');
        options.network = options.network || configService.get<string>('BLOCKCHAIN_NETWORK', 'testnet') as BlockchainOptionsType['network'];
        options.account_id = options.account_id || configService.get<string>('BLOCKCHAIN_ACCOUNT_ID');
        options.private_key = options.private_key || configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
        options.initial_balance = options.initial_balance || Number(configService.get<number>('BLOCKCHAIN_INITIAL_BALANCE', 1000));
        if (!options.account_id || !options.private_key) {
            throw new Error('Blockchain account_id and private_key are required.');
        }
        if (!['mainnet', 'testnet', 'previewnet'].includes(options.network!)) {
            throw new Error('Invalid blockchain network. Supported networks: mainnet, testnet, previewnet.');
        }

        return options;
    }



    static register(options: BlockchainOptionsType): DynamicModule {
        options = this.resolveConfig(options, new ConfigService());


        const importsArray = [
            ConfigModule.forRoot(),
        ];
        const exportsArray: any[] = ['BLOCKCHAIN_CONFIG'];
        const providersArray: any[] = [{
            provide: 'BLOCKCHAIN_CONFIG',
            useValue: options,
        },
        ];
        const controllersArray: any[] = [];
        switch (options.blockchain) {
            case 'hedera':
                providersArray.push(HederaService);
                exportsArray.push(HederaService);
                controllersArray.push(HederaController);
                break;
            default:
                throw new Error(`Invalid blockchain provider: ${options.blockchain}. Supported providers: 'hedera'.`);
        }

        return {
            module: BlockchainModule,
            imports: importsArray,
            providers: providersArray,
            exports: exportsArray,
            controllers: controllersArray,
        };
    }
}