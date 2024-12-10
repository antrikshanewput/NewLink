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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var HederaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@hashgraph/sdk");
const axios_1 = __importDefault(require("axios"));
let HederaService = HederaService_1 = class HederaService {
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(HederaService_1.name);
        switch (options.network) {
            case 'mainnet':
                this.client = sdk_1.Client.forMainnet().setOperator(options.account_id, options.private_key);
                this.mirrorNodeUrl = 'https://mainnet-public.mirrornode.hedera.com';
                break;
            case 'testnet':
                this.client = sdk_1.Client.forTestnet().setOperator(options.account_id, options.private_key);
                this.mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
                break;
            case 'previewnet':
                this.client = sdk_1.Client.forPreviewnet().setOperator(options.account_id, options.private_key);
                this.mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
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
    async listAllTransactions(accountId, limit = 10) {
        var _a, _b;
        let url = `${this.mirrorNodeUrl}/api/v1/transactions?account.id=${accountId}&limit=${limit}`;
        const allTransactions = [];
        try {
            this.logger.log(`Fetching all transactions for account ${accountId}...`);
            while (url) {
                this.logger.debug(`Fetching transactions from URL: ${url}`);
                if (!url) {
                    throw new Error('URL is null or undefined during API request.');
                }
                const response = await axios_1.default.get(url);
                const transactions = response.data.transactions || [];
                const nextLink = ((_a = response.data.links) === null || _a === void 0 ? void 0 : _a.next) || null;
                if (transactions.length === 0 && allTransactions.length === 0) {
                    this.logger.log(`No transactions found for account ${accountId}.`);
                    break;
                }
                allTransactions.push(...transactions.map((tx) => ({
                    transactionId: tx.transaction_id,
                    status: tx.result,
                    memo: tx.memo_base64
                        ? Buffer.from(tx.memo_base64, 'base64').toString()
                        : 'No memo',
                    type: tx.name,
                    transfers: tx.transfers.map((transfer) => ({
                        account: transfer.account,
                        amount: transfer.amount,
                        isApproval: transfer.is_approval,
                    })),
                    timestamp: tx.consensus_timestamp,
                })));
                url = nextLink ? `${this.mirrorNodeUrl}${nextLink}` : null;
            }
            this.logger.log(`Finished fetching all transactions for account ${accountId}.`);
            return allTransactions;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
                this.logger.warn(`No transactions found for account: ${accountId}`);
                return [];
            }
            else {
                this.logger.error(`Error fetching transactions for account ${accountId}: ${error}`);
                throw new Error(`Failed to fetch transactions for account ${accountId}. Please try again later.`);
            }
        }
    }
    async getTransactionDetails(transactionId) {
        var _a;
        try {
            const mirrorNodeTransactionId = this.convertToMirrorNodeTransactionId(transactionId);
            const url = `${this.mirrorNodeUrl}/api/v1/transactions/${mirrorNodeTransactionId}`;
            this.logger.log(`Fetching transaction details from Mirror Node: ${url}`);
            const response = await axios_1.default.get(url);
            const transaction = response.data.transactions[0];
            return {
                transactionId: transaction.transaction_id,
                status: transaction.result,
                memo: transaction.memo_base64
                    ? Buffer.from(transaction.memo_base64, 'base64').toString()
                    : 'No memo',
                transfers: transaction.transfers.map((transfer) => ({
                    account: transfer.account,
                    amount: transfer.amount,
                    isApproval: transfer.is_approval,
                })),
                timestamp: transaction.consensus_timestamp,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                this.logger.warn(`Transaction with ID ${transactionId} not found on Mirror Node.`);
                throw new Error(`Transaction with ID ${transactionId} not found on Mirror Node.`);
            }
            this.logger.error(`Error fetching transaction details for ID ${transactionId}: ${error}`);
            throw new Error('Failed to fetch transaction details. Please try again later.');
        }
    }
    async createToken(tokenDetails) {
        var _a;
        try {
            this.logger.log('Creating a new token on the Hedera network...');
            const { name, symbol, treasuryAccountId, treasuryPrivateKey, initialSupply, decimals, tokenType = sdk_1.TokenType.FungibleCommon, supplyType = sdk_1.TokenSupplyType.Infinite, maxSupply, } = tokenDetails;
            if (!name || !symbol || !treasuryAccountId || !treasuryPrivateKey) {
                throw new Error('Missing required token details (name, symbol, treasuryAccountId, treasuryPrivateKey).');
            }
            if (supplyType === sdk_1.TokenSupplyType.Finite && maxSupply == null) {
                throw new Error('Max supply is required when supply type is FINITE.');
            }
            const treasuryKey = sdk_1.PrivateKey.fromString(treasuryPrivateKey);
            const tokenCreateTx = new sdk_1.TokenCreateTransaction()
                .setTokenName(name)
                .setTokenSymbol(symbol)
                .setTreasuryAccountId(sdk_1.AccountId.fromString(treasuryAccountId))
                .setInitialSupply(initialSupply)
                .setDecimals(decimals)
                .setTokenType(tokenType)
                .setSupplyType(supplyType);
            if (supplyType === sdk_1.TokenSupplyType.Finite) {
                tokenCreateTx.setMaxSupply(maxSupply);
            }
            const signedTx = await tokenCreateTx.freezeWith(this.client).sign(treasuryKey);
            const response = await signedTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const tokenId = (_a = receipt.tokenId) === null || _a === void 0 ? void 0 : _a.toString();
            this.logger.log(`Token created successfully with ID: ${tokenId}`);
            return { tokenId, receipt };
        }
        catch (error) {
            this.logger.error(`Error creating token: ${error}`);
            throw new Error('Failed to create token. Please check the input and try again.');
        }
    }
    convertToMirrorNodeTransactionId(transactionId) {
        if (transactionId.includes('-') && !transactionId.includes('@'))
            return transactionId;
        const [accountId, timestamp] = transactionId.split('@');
        if (!accountId || !timestamp)
            throw new Error(`Invalid transaction ID format: ${transactionId}`);
        const formattedTimestamp = timestamp.replace('.', '-');
        return `${accountId}-${formattedTimestamp}`;
    }
};
exports.HederaService = HederaService;
exports.HederaService = HederaService = HederaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('BLOCKCHAIN_CONFIG')),
    __metadata("design:paramtypes", [Object])
], HederaService);
