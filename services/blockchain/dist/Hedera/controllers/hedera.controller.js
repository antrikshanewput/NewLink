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
var HederaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaController = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../services/hedera.service");
const swagger_1 = require("@nestjs/swagger");
let HederaController = HederaController_1 = class HederaController {
    constructor(hederaService) {
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(HederaController_1.name);
    }
    async createAccount() {
        try {
            this.logger.log('Creating a new Hedera account...');
            const account = await this.hederaService.createAccount();
            this.logger.log(`New account created: ${account.accountId}`);
            return account;
        }
        catch (error) {
            this.logger.error('Error creating a new account:', error);
            throw error;
        }
    }
    async getAccountBalance(accountId) {
        try {
            this.logger.log(`Fetching balance for account ${accountId}...`);
            const balance = await this.hederaService.getAccountBalance(accountId);
            this.logger.log(`Balance for account ${accountId}: ${balance}`);
            return { accountId, balance };
        }
        catch (error) {
            this.logger.error(`Error fetching balance for account ${accountId}:`, error);
            throw error;
        }
    }
    async transferHbar(transferRequest) {
        const { from, to, amount, privateKey } = transferRequest;
        if (!from || !to || !amount || !privateKey) {
            throw new common_1.BadRequestException('Invalid request: from, to, amount, and privateKey are required.');
        }
        if (!this.hederaService.isValidAccountId(from)) {
            throw new common_1.BadRequestException(`Invalid 'from' account ID: ${from}`);
        }
        if (!this.hederaService.isValidAccountId(to)) {
            throw new common_1.BadRequestException(`Invalid 'to' account ID: ${to}`);
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Transfer amount must be greater than zero.');
        }
        if (!this.hederaService.isValidPrivateKey(privateKey)) {
            throw new common_1.BadRequestException('Invalid private key provided.');
        }
        if (!this.hederaService.doesPrivateKeyMatchAccount(from, privateKey)) {
            throw new common_1.BadRequestException('The private key does not represent the "from" account.');
        }
        try {
            this.logger.log(`Transferring ${amount} tinybars from ${from} to ${to}...`);
            const status = await this.hederaService.transferHbar(from, to, amount);
            this.logger.log(`Transfer completed with status: ${status}`);
            return { status };
        }
        catch (error) {
            this.logger.error('Error transferring Hbar:', error);
            throw new common_1.BadRequestException('Failed to transfer Hbar. Please check your input and try again.');
        }
    }
    async listAllTransactions(accountId, limit) {
        try {
            this.logger.log(`Request to list all transactions for account ${accountId}.`);
            if (!this.hederaService.isValidAccountId(accountId)) {
                throw new Error(`Invalid account ID: ${accountId}`);
            }
            const transaction = await this.hederaService.listAllTransactions(accountId, limit);
            return transaction;
        }
        catch (error) {
            this.logger.error(`Error fetching transactions for account ${accountId}: ${error}`);
            throw error;
        }
    }
    async getTransactionDetails(transactionId) {
        try {
            this.logger.log(`Fetching transaction details for ID: ${transactionId}`);
            if (!transactionId) {
                this.logger.warn(`Invalid transaction ID provided: ${transactionId}`);
                throw new common_1.BadRequestException(`Invalid transaction ID format: ${transactionId}`);
            }
            const transactionDetails = await this.hederaService.getTransactionDetails(transactionId);
            this.logger.log(`Transaction details fetched successfully for ID: ${transactionId}`);
            return transactionDetails;
        }
        catch (error) {
            if (error) {
                throw new Error(`Error fetching transaction details for ID ${transactionId}: ${error}`);
            }
            this.logger.error(`Error fetching transaction details for ID ${transactionId}: ${error}`);
        }
    }
};
exports.HederaController = HederaController;
__decorate([
    (0, common_1.Post)('create-account'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new Hedera account',
        description: 'Creates a new Hedera account with a randomly generated private key.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Account created successfully.',
        schema: {
            example: {
                accountId: '0.0.12345',
                privateKey: '302e020100300506032b657004220420...',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Error while creating the account.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('balance/:accountId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account balance',
        description: 'Fetches the HBAR balance of the specified Hedera account.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'accountId',
        type: String,
        description: 'The ID of the Hedera account (e.g., 0.0.12345).',
        example: '0.0.12345',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully fetched the account balance.',
        schema: {
            example: {
                accountId: '0.0.12345',
                balance: '1000 ℏ',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Error while fetching the account balance.',
    }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer HBAR',
        description: 'Transfers HBAR tokens from one Hedera account to another.',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Transfer details',
        schema: {
            example: {
                from: '0.0.12345',
                to: '0.0.67890',
                amount: 100,
                privateKey: '302e020100300506032b657004220420...',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully transferred HBAR.',
        schema: {
            example: {
                status: 'SUCCESS',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error or transfer failure.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "transferHbar", null);
__decorate([
    (0, common_1.Get)('transaction/:accountId'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all transactions for an account',
        description: 'Fetches and returns all transactions for the specified Hedera account.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'accountId',
        type: String,
        description: 'The ID of the Hedera account (e.g., 0.0.12345).',
        example: '0.0.12345',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully fetched all transactions for the account.',
        schema: {
            example: [
                {
                    transactionId: '0.0.12345@1680000000.123456789',
                    status: 'SUCCESS',
                    memo: 'Transfer transaction',
                    transfers: [
                        { account: '0.0.12345', amount: -1000, isApproval: false },
                        { account: '0.0.67890', amount: 1000, isApproval: false },
                    ],
                    timestamp: '2023-12-01T12:00:00Z',
                },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid account ID or error during transaction fetch.',
    }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Param)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "listAllTransactions", null);
__decorate([
    (0, common_1.Get)('transaction/details/:transactionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction details by transaction ID',
        description: 'Fetches the details of a specific transaction for the provided transaction ID using Hedera SDK.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'transactionId',
        type: String,
        description: 'The ID of the transaction (e.g., 0.0.12345@1680000000.123456789).',
        example: '0.0.12345@1680000000.123456789',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction details fetched successfully.',
        schema: {
            example: {
                transactionId: '0.0.12345@1680000000.123456789',
                status: 'SUCCESS',
                memo: 'Test transaction memo',
                transfers: [
                    { account: '0.0.12345', amount: -1000, isApproval: false },
                    { account: '0.0.67890', amount: 1000, isApproval: false },
                ],
                timestamp: '2023-12-01T12:00:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid transaction ID format.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transaction not found.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error while fetching transaction details.',
    }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTransactionDetails", null);
exports.HederaController = HederaController = HederaController_1 = __decorate([
    (0, common_1.Controller)('hedera'),
    (0, swagger_1.ApiTags)('Hedera'),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], HederaController);
