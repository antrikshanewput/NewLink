"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var HederaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@hashgraph/sdk");
let HederaService = HederaService_1 = class HederaService {
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(HederaService_1.name);
        switch (options.network) {
            case 'mainnet':
                this.client = sdk_1.Client.forMainnet().setOperator(options.account_id, options.private_key);
                break;
            case 'testnet':
                this.client = sdk_1.Client.forTestnet().setOperator(options.account_id, options.private_key);
                break;
            case 'previewnet':
                this.client = sdk_1.Client.forPreviewnet().setOperator(options.account_id, options.private_key);
                break;
            default:
                throw new Error('Invalid network');
        }
        this.logger.log('Hedera client initialized successfully!');
    }
    async createAccount() {
        var _a;
        try {
            const privateKey = await sdk_1.PrivateKey.generate();
            const publicKey = privateKey.publicKey;
            const transaction = await new sdk_1.AccountCreateTransaction()
                .setKey(publicKey)
                .setInitialBalance(sdk_1.Hbar.fromTinybars(this.options.initial_balance))
                .execute(this.client);
            const receipt = await transaction.getReceipt(this.client);
            const newAccountId = (_a = receipt.accountId) === null || _a === void 0 ? void 0 : _a.toString();
            this.logger.log(`Created new account: ${newAccountId}`);
            return {
                accountId: newAccountId,
                privateKey: privateKey.toString(),
            };
        }
        catch (error) {
            this.logger.error('Error creating account:', error);
            throw new Error('Failed to create account on Hedera.');
        }
    }
    async getAccountBalance(accountId) {
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
                .execute(this.client);
            this.logger.log(`Balance for account ${accountId}: ${balance.hbars.toString()}`);
            return balance.hbars.toString();
        }
        catch (error) {
            this.logger.error(`Error fetching balance for account ${accountId}:`, error);
            throw new Error('Failed to fetch account balance.');
        }
    }
    async transferHbar(from, to, amount) {
        if (amount <= 0) {
            throw new Error('Transfer amount must be greater than zero.');
        }
        try {
            const transaction = await new sdk_1.TransferTransaction()
                .addHbarTransfer(from, sdk_1.Hbar.fromTinybars(-amount))
                .addHbarTransfer(to, sdk_1.Hbar.fromTinybars(amount))
                .execute(this.client);
            const receipt = await transaction.getReceipt(this.client);
            this.logger.log(`Transferred ${amount} tinybars from ${from} to ${to}`);
            return receipt.status.toString();
        }
        catch (error) {
            this.logger.error(`Error transferring Hbar from ${from} to ${to}:`, error);
            throw new Error('Failed to transfer Hbar.');
        }
    }
    async isValidPrivateKey(privateKey) {
        try {
            sdk_1.PrivateKey.fromString(privateKey);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async isValidAccountId(accountId) {
        try {
            sdk_1.AccountId.fromString(accountId);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async doesPrivateKeyMatchAccount(accountId, privateKey) {
        try {
            let privateKeyObj;
            if (privateKey.startsWith('302e020100')) {
                privateKeyObj = sdk_1.PrivateKey.fromStringDer(privateKey);
            }
            else if (privateKey.length === 64 || privateKey.length === 66) {
                privateKeyObj = sdk_1.PrivateKey.fromStringED25519(privateKey);
            }
            else {
                throw new Error('Unsupported private key format.');
            }
            const publicKey = privateKeyObj.publicKey;
            const derivedAccountId = sdk_1.AccountId.fromString(accountId);
            return derivedAccountId.toString().endsWith(publicKey.toString());
        }
        catch (error) {
            this.logger.error(`Error validating private key for account ${accountId}:`, error);
            return false;
        }
    }
};
exports.HederaService = HederaService;
exports.HederaService = HederaService = HederaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('BLOCKCHAIN_CONFIG')),
    __metadata("design:paramtypes", [Object])
], HederaService);
