import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    AccountId,
    PrivateKey,
    Client,
    Hbar,
    AccountBalanceQuery,
    AccountCreateTransaction,
    TransferTransaction,
    TokenCreateTransaction,
    TokenSupplyType,
    TokenType,
    TransactionReceipt,
    AccountInfoQuery,
    PublicKey,
    Status,

} from '@hashgraph/sdk';
import axios from 'axios';
import { BlockchainOptionsType } from '../../blockchain.type';

@Injectable()
export class HederaService {
    private readonly logger = new Logger(HederaService.name);
    private client: Client;
    private readonly originalOperator: { accountId: string; privateKey: string };

    private readonly mirrorNodeUrl: string;


    constructor(@Inject('BLOCKCHAIN_CONFIG') private readonly options: BlockchainOptionsType) {
        switch (options.network) {
            case 'mainnet':
                this.client = Client.forMainnet();
                this.mirrorNodeUrl = 'https://mainnet-public.mirrornode.hedera.com';

                break;
            case 'testnet':
                this.client = Client.forTestnet();
                this.mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';

                break;
            case 'previewnet':
                this.client = Client.forPreviewnet().setOperator(options.account_id!, options.private_key!);
                this.mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';

                break;
            default:
                throw new Error('Invalid network');
        }
        this.originalOperator = { accountId: options.account_id!, privateKey: options.private_key! };
        this.client.setOperator(this.originalOperator.accountId, this.originalOperator.privateKey);
        this.logger.log('Hedera client initialized successfully!');
    }
    private revertOperator() {
        this.client.setOperator(this.originalOperator.accountId, this.originalOperator.privateKey);
    }


    async createAccount(): Promise<{ accountId: string; privateKey: string }> {
        try {
            const privateKey = await PrivateKey.generate();
            const publicKey = privateKey.publicKey;

            const transaction = await new AccountCreateTransaction()
                .setKey(publicKey)
                .setInitialBalance(Hbar.fromTinybars(this.options.initial_balance ?? 0))
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

    async transferHbar(from: string, to: string, amount: number, privateKey: string): Promise<string> {
        if (amount <= 0) {
            throw new Error('Transfer amount must be greater than zero.');
        }


        try {
            this.client.setOperator(from, privateKey);

            const transferTx = await new TransferTransaction()
                .addHbarTransfer(from, Hbar.fromTinybars(-amount))
                .addHbarTransfer(to, Hbar.fromTinybars(amount))
                .freezeWith(this.client)
                .signWithOperator(this.client);

            const response = await transferTx.execute(this.client);

            const receipt = await response.getReceipt(this.client);
            if (receipt.status === Status.Success) {
                this.logger.log(`Successfully transferred ${amount} tinybars from ${from} to ${to}`);
            } else {
                this.logger.warn(`Transfer completed but with unexpected status: ${receipt.status}`);
            }

            this.logger.log(`Transferred ${amount} tinybars from ${from} to ${to}`);
            return response.transactionId.toString();

        } catch (error) {
            this.logger.error(`Error transferring Hbar from ${from} to ${to}:`, error);
            throw new Error('Failed to transfer Hbar.');
        }
        finally {
            this.revertOperator();
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
            let publicKey: PublicKey;
            if (privateKey.startsWith('302e020100')) {
                publicKey = PrivateKey.fromStringDer(privateKey).publicKey;
            } else if (privateKey.length === 64 || privateKey.length === 66) {
                publicKey = PrivateKey.fromStringED25519(privateKey).publicKey;
            } else {
                throw new Error('Unsupported private key format.');
            }

            const accountInfo = await new AccountInfoQuery().setAccountId(AccountId.fromString(accountId)).execute(this.client);
            return accountInfo.key.toString() === publicKey.toString();

        } catch (error) {
            this.logger.error(`Error validating private key for account ${accountId}:`, error);
            return false;
        }
    }

    async listAllTransactions(accountId: string, limit: number = 10): Promise<any[]> {
        let url: string | null = `${this.mirrorNodeUrl}/api/v1/transactions?account.id=${accountId}&limit=${limit}`;
        const allTransactions: any[] = [];

        try {
            this.logger.log(`Fetching all transactions for account ${accountId}...`);

            while (url) {
                this.logger.debug(`Fetching transactions from URL: ${url}`);

                if (!url) {
                    throw new Error('URL is null or undefined during API request.');
                }

                const response: any = await axios.get(url);

                const transactions = response.data.transactions || [];
                const nextLink = response.data.links?.next || null;

                if (transactions.length === 0 && allTransactions.length === 0) {
                    this.logger.log(`No transactions found for account ${accountId}.`);
                    break;
                }

                allTransactions.push(
                    ...transactions.map((tx: any) => ({
                        transactionId: tx.transaction_id,
                        status: tx.result,
                        memo: tx.memo_base64
                            ? Buffer.from(tx.memo_base64, 'base64').toString()
                            : 'No memo',
                        type: tx.name,
                        transfers: tx.transfers.map((transfer: any) => ({
                            account: transfer.account,
                            amount: transfer.amount,
                            isApproval: transfer.is_approval,
                        })),
                        timestamp: tx.consensus_timestamp,
                    }))
                );

                url = nextLink ? `${this.mirrorNodeUrl}${nextLink}` : null;
            }

            this.logger.log(`Finished fetching all transactions for account ${accountId}.`);
            return allTransactions;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`No transactions found for account: ${accountId}`);
                return [];
            } else {
                this.logger.error(
                    `Error fetching transactions for account ${accountId}: ${error}`,
                );
                throw new Error(`Failed to fetch transactions for account ${accountId}. Please try again later.`);
            }
        }
    }

    async getTransactionDetails(transactionId: string): Promise<any> {
        try {
            const mirrorNodeTransactionId = this.convertToMirrorNodeTransactionId(transactionId);


            const url = `${this.mirrorNodeUrl}/api/v1/transactions/${mirrorNodeTransactionId}`;
            this.logger.log(`Fetching transaction details from Mirror Node: ${url}`);

            const response = await axios.get(url);

            const transaction = response.data.transactions[0];

            return {
                transactionId: transaction.transaction_id,
                status: transaction.result,
                memo: transaction.memo_base64
                    ? Buffer.from(transaction.memo_base64, 'base64').toString()
                    : 'No memo',
                transfers: transaction.transfers.map((transfer: any) => ({
                    account: transfer.account,
                    amount: transfer.amount,
                    isApproval: transfer.is_approval,
                })),
                timestamp: transaction.consensus_timestamp,
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                this.logger.warn(`Transaction with ID ${transactionId} not found on Mirror Node.`);
                throw new Error(`Transaction with ID ${transactionId} not found on Mirror Node.`);
            }

            this.logger.error(
                `Error fetching transaction details for ID ${transactionId}: ${error}`
            );
            throw new Error('Failed to fetch transaction details. Please try again later.');
        }
    }

    async createToken(tokenDetails: {
        name: string;
        symbol: string;
        treasuryAccountId: string;
        treasuryPrivateKey: string;
        initialSupply: number;
        decimals: number;
        tokenType?: TokenType;
        supplyType?: TokenSupplyType;
        maxSupply?: number;
    }): Promise<{ tokenId: string; receipt: TransactionReceipt }> {
        try {
            this.logger.log('Creating a new token on the Hedera network...');

            const {
                name,
                symbol,
                treasuryAccountId,
                treasuryPrivateKey,
                initialSupply,
                decimals,
                tokenType = TokenType.FungibleCommon,
                supplyType = TokenSupplyType.Infinite,
                maxSupply,
            } = tokenDetails;

            if (!name || !symbol || !treasuryAccountId || !treasuryPrivateKey) {
                throw new Error('Missing required token details (name, symbol, treasuryAccountId, treasuryPrivateKey).');
            }
            if (supplyType === TokenSupplyType.Finite && maxSupply == null) {
                throw new Error('Max supply is required when supply type is FINITE.');
            }

            const treasuryKey = PrivateKey.fromString(treasuryPrivateKey);

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName(name)
                .setTokenSymbol(symbol)
                .setTreasuryAccountId(AccountId.fromString(treasuryAccountId))
                .setInitialSupply(initialSupply)
                .setDecimals(decimals)
                .setTokenType(tokenType)
                .setSupplyType(supplyType);

            if (supplyType === TokenSupplyType.Finite) {
                tokenCreateTx.setMaxSupply(maxSupply!);
            }

            const signedTx = await tokenCreateTx.freezeWith(this.client).sign(treasuryKey);

            const response = await signedTx.execute(this.client);

            const receipt = await response.getReceipt(this.client);

            const tokenId = receipt.tokenId?.toString()!;

            this.logger.log(`Token created successfully with ID: ${tokenId}`);

            return { tokenId, receipt };
        } catch (error) {
            this.logger.error(`Error creating token: ${error}`);
            throw new Error('Failed to create token. Please check the input and try again.');
        }
    }

    convertToMirrorNodeTransactionId(transactionId: string): string {
        if (transactionId.includes('-') && !transactionId.includes('@')) return transactionId;


        const [accountId, timestamp] = transactionId.split('@');

        if (!accountId || !timestamp) throw new Error(`Invalid transaction ID format: ${transactionId}`);

        const formattedTimestamp = timestamp.replace('.', '-');
        return `${accountId}-${formattedTimestamp}`;
    }
}