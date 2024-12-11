"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BlockchainModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hedera_service_1 = require("./Hedera/services/hedera.service");
const hedera_controller_1 = require("./Hedera/controllers/hedera.controller");
let BlockchainModule = BlockchainModule_1 = class BlockchainModule {
    static resolveConfig(options, configService) {
        options.blockchain = options.blockchain || configService.get('BLOCKCHAIN', 'hedera');
        options.network = options.network || configService.get('BLOCKCHAIN_NETWORK', 'testnet');
        options.account_id = options.account_id || configService.get('BLOCKCHAIN_ACCOUNT_ID');
        options.private_key = options.private_key || configService.get('BLOCKCHAIN_PRIVATE_KEY');
        options.initial_balance = options.initial_balance || Number(configService.get('BLOCKCHAIN_INITIAL_BALANCE', 1000));
        if (!options.account_id || !options.private_key) {
            throw new Error('Blockchain account_id and private_key are required.');
        }
        if (!['mainnet', 'testnet', 'previewnet'].includes(options.network)) {
            throw new Error('Invalid blockchain network. Supported networks: mainnet, testnet, previewnet.');
        }
        return options;
    }
    static register(options, tokens) {
        options = this.resolveConfig(options, new config_1.ConfigService());
        const importsArray = [
            config_1.ConfigModule.forRoot(),
        ];
        const exportsArray = ['BLOCKCHAIN_CONFIG'];
        const providersArray = [{
                provide: 'BLOCKCHAIN_CONFIG',
                useValue: options,
            },
        ];
        const controllersArray = [];
        switch (options.blockchain) {
            case 'hedera':
                providersArray.push(hedera_service_1.HederaService);
                exportsArray.push(hedera_service_1.HederaService);
                controllersArray.push(hedera_controller_1.HederaController);
                break;
            default:
                throw new Error(`Invalid blockchain provider: ${options.blockchain}. Supported providers: 'hedera'.`);
        }
        return {
            module: BlockchainModule_1,
            imports: importsArray,
            providers: providersArray,
            exports: exportsArray,
            controllers: controllersArray,
        };
    }
};
exports.BlockchainModule = BlockchainModule;
BlockchainModule.createdTokens = [];
exports.BlockchainModule = BlockchainModule = BlockchainModule_1 = __decorate([
    (0, common_1.Module)({})
], BlockchainModule);
