import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Query
} from '@nestjs/common';
import { HederaService } from '../services/hedera.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('hedera')
@ApiTags('Hedera')
export class HederaController {
    private readonly logger = new Logger(HederaController.name);

    constructor(private readonly hederaService: HederaService) { }

    @Post('create-account')
    @ApiOperation({
        summary: 'Create a new Hedera account',
        description: 'Creates a new Hedera account with a randomly generated private key.',
    })
    @ApiResponse({
        status: 201,
        description: 'Account created successfully.',
        schema: {
            example: {
                accountId: '0.0.12345',
                privateKey: '302e020100300506032b657004220420...',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Error while creating the account.',
    })
    async createAccount(): Promise<{ accountId: string; privateKey: string }> {
        try {
            this.logger.log('Creating a new Hedera account...');
            const account = await this.hederaService.createAccount();
            this.logger.log(`New account created: ${account.accountId}`);
            return account;
        } catch (error) {
            this.logger.error('Error creating a new account:', error);
            throw error;
        }
    }

    @Get('balance/:accountId')
    @ApiOperation({
        summary: 'Get account balance',
        description: 'Fetches the HBAR balance of the specified Hedera account.',
    })
    @ApiParam({
        name: 'accountId',
        type: String,
        description: 'The ID of the Hedera account (e.g., 0.0.12345).',
        example: '0.0.12345',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully fetched the account balance.',
        schema: {
            example: {
                accountId: '0.0.12345',
                balance: '1000 ℏ',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Error while fetching the account balance.',
    })
    async getAccountBalance(@Param('accountId') accountId: string): Promise<{ accountId: string; balance: string }> {
        try {
            this.logger.log(`Fetching balance for account ${accountId}...`);
            const balance = await this.hederaService.getAccountBalance(accountId);
            this.logger.log(`Balance for account ${accountId}: ${balance}`);
            return { accountId, balance };
        } catch (error) {
            this.logger.error(`Error fetching balance for account ${accountId}:`, error);
            throw error;
        }
    }

    @Post('transfer')
    @ApiOperation({
        summary: 'Transfer HBAR',
        description: 'Transfers HBAR tokens from one Hedera account to another.',
    })
    @ApiBody({
        description: 'Transfer details',
        schema: {
            example: {
                from: '0.0.12345',
                to: '0.0.67890',
                amount: 100,
                privateKey: '302e020100300506032b657004220420...',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully transferred HBAR.',
        schema: {
            example: {
                status: 'SUCCESS',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Validation error or transfer failure.',
    })
    async transferHbar(
        @Body() transferRequest: { from: string; to: string; amount: number; privateKey: string },
    ): Promise<{ status: string }> {
        const { from, to, amount, privateKey } = transferRequest;

        if (!from || !to || !amount || !privateKey) {
            throw new BadRequestException('Invalid request: from, to, amount, and privateKey are required.');
        }

        if (!this.hederaService.isValidAccountId(from)) {
            throw new BadRequestException(`Invalid 'from' account ID: ${from}`);
        }
        if (!this.hederaService.isValidAccountId(to)) {
            throw new BadRequestException(`Invalid 'to' account ID: ${to}`);
        }

        if (amount <= 0) {
            throw new BadRequestException('Transfer amount must be greater than zero.');
        }

        if (!this.hederaService.isValidPrivateKey(privateKey)) {
            throw new BadRequestException('Invalid private key provided.');
        }

        if (!this.hederaService.doesPrivateKeyMatchAccount(from, privateKey)) {
            throw new BadRequestException('The private key does not represent the "from" account.');
        }

        try {
            this.logger.log(`Transferring ${amount} tinybars from ${from} to ${to}...`);
            const status = await this.hederaService.transferHbar(from, to, amount);
            this.logger.log(`Transfer completed with status: ${status}`);
            return { status };
        } catch (error) {
            this.logger.error('Error transferring Hbar:', error);
            throw new BadRequestException('Failed to transfer Hbar. Please check your input and try again.');
        }
    }


    @Get('transaction/:accountId')
    @ApiOperation({
        summary: 'List all transactions for an account',
        description: 'Fetches and returns all transactions for the specified Hedera account.',
    })
    @ApiParam({
        name: 'accountId',
        type: String,
        description: 'The ID of the Hedera account (e.g., 0.0.12345).',
        example: '0.0.12345',
    })
    @ApiResponse({
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
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid account ID or error during transaction fetch.',
    })
    async listAllTransactions(@Param('accountId') accountId: string, @Param('limit') limit: number): Promise<any> {
        try {
            this.logger.log(`Request to list all transactions for account ${accountId}.`);
            if (!this.hederaService.isValidAccountId(accountId)) {
                throw new Error(`Invalid account ID: ${accountId}`);
            }

            const transaction = await this.hederaService.listAllTransactions(accountId, limit);

            return transaction;
        } catch (error) {
            this.logger.error(`Error fetching transactions for account ${accountId}: ${error}`);
            throw error;
        }
    }


    @Get('transaction/details/:transactionId')
    @ApiOperation({
        summary: 'Get transaction details by transaction ID',
        description: 'Fetches the details of a specific transaction for the provided transaction ID using Hedera SDK.',
    })
    @ApiParam({
        name: 'transactionId',
        type: String,
        description: 'The ID of the transaction (e.g., 0.0.12345@1680000000.123456789).',
        example: '0.0.12345@1680000000.123456789',
    })
    @ApiResponse({
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
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid transaction ID format.',
    })
    @ApiResponse({
        status: 404,
        description: 'Transaction not found.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while fetching transaction details.',
    })
    async getTransactionDetails(
        @Param('transactionId') transactionId: string
    ): Promise<any> {
        try {
            // Log the request
            this.logger.log(`Fetching transaction details for ID: ${transactionId}`);

            if (!transactionId) {
                this.logger.warn(`Invalid transaction ID provided: ${transactionId}`);
                throw new BadRequestException(`Invalid transaction ID format: ${transactionId}`);
            }

            const transactionDetails = await this.hederaService.getTransactionDetails(transactionId);

            this.logger.log(`Transaction details fetched successfully for ID: ${transactionId}`);
            return transactionDetails;
        } catch (error) {

            if (error) {
                throw new Error(`Error fetching transaction details for ID ${transactionId}: ${error}`);
            }
            this.logger.error(
                `Error fetching transaction details for ID ${transactionId}: ${error}`,
            );
        }
    }
}