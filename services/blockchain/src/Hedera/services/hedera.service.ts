import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    AccountId,
    PrivateKey,
    Client,
    Hbar,
    AccountBalanceQuery,
    AccountCreateTransaction,
    TransferTransaction,
    TransactionRecordQuery,
    TransactionId,

} from '@hashgraph/sdk';

@Injectable()
export class HederaService {
    private readonly logger = new Logger(HederaService.name);
    private client: Client;


    constructor(@Inject('BLOCKCHAIN_CONFIG') private readonly options: BlockchainOptionsType) {
        switch (options.network) {
            case 'mainnet':
                this.client = Client.forMainnet().setOperator(options.account_id!, options.private_key!);

                break;
            case 'testnet':
                this.client = Client.forTestnet().setOperator(options.account_id!, options.private_key!);

                break;
            case 'previewnet':
                this.client = Client.forPreviewnet().setOperator(options.account_id!, options.private_key!);

                break;
            default:
                throw new Error('Invalid network');
        }
        this.logger.log('Hedera client initialized successfully!');
    }

    async createAccount(): Promise<{ accountId: string; privateKey: string }> {
        try {
            const privateKey = await PrivateKey.generate();
            const publicKey = privateKey.publicKey;

            const transaction = await new AccountCreateTransaction()
                .setKey(publicKey)
                .setInitialBalance(Hbar.fromTinybars(this.options.initial_balance))
                .execute(this.client);

            const receipt = await transaction.getReceipt(this.client);
            const newAccountId = receipt.accountId?.toString();

            this.logger.log(`Created new account: ${newAccountId}`);
            return {
                accountId: newAccountId!,
                privateKey: privateKey.toString(),
            };
        } catch (error) {
            this.logger.error('Error creating account:', error);
            throw new Error('Failed to create account on Hedera.');
        }
    }

    async getAccountBalance(accountId: string): Promise<string> {
        try {
            const balance = await new AccountBalanceQuery()
                .setAccountId(AccountId.fromString(accountId))
                .execute(this.client);

            this.logger.log(`Balance for account ${accountId}: ${balance.hbars.toString()}`);
            return balance.hbars.toString();
        } catch (error) {
            this.logger.error(`Error fetching balance for account ${accountId}:`, error);
            throw new Error('Failed to fetch account balance.');
        }
    }

    async transferHbar(from: string, to: string, amount: number): Promise<string> {
        if (amount <= 0) {
            throw new Error('Transfer amount must be greater than zero.');
        }

        try {
            const transaction = await new TransferTransaction()
                .addHbarTransfer(from, Hbar.fromTinybars(-amount))
                .addHbarTransfer(to, Hbar.fromTinybars(amount))
                .execute(this.client);

            const receipt = await transaction.getReceipt(this.client);
            this.logger.log(`Transferred ${amount} tinybars from ${from} to ${to}`);
            return receipt.status.toString();
        } catch (error) {
            this.logger.error(`Error transferring Hbar from ${from} to ${to}:`, error);
            throw new Error('Failed to transfer Hbar.');
        }
    }

    async isValidPrivateKey(privateKey: string): Promise<boolean> {
        try {
            PrivateKey.fromString(privateKey);
            return true;
        } catch {
            return false;
        }
    }

    async isValidAccountId(accountId: string): Promise<boolean> {
        try {
            AccountId.fromString(accountId);
            return true;
        } catch {
            return false;
        }
    }

    async doesPrivateKeyMatchAccount(accountId: string, privateKey: string): Promise<boolean> {
        try {
            let privateKeyObj: PrivateKey;

            if (privateKey.startsWith('302e020100')) {
                privateKeyObj = PrivateKey.fromStringDer(privateKey);
            } else if (privateKey.length === 64 || privateKey.length === 66) {
                privateKeyObj = PrivateKey.fromStringED25519(privateKey);
            } else {
                throw new Error('Unsupported private key format.');
            }

            const publicKey = privateKeyObj.publicKey;

            const derivedAccountId = AccountId.fromString(accountId);
            return derivedAccountId.toString().endsWith(publicKey.toString());
        } catch (error) {
            this.logger.error(`Error validating private key for account ${accountId}:`, error);
            return false;
        }
    }

}