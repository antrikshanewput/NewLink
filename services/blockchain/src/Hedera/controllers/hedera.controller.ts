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
@ApiTags('Hedera') // Groups the endpoints under the "Hedera" tag in Swagger
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

}