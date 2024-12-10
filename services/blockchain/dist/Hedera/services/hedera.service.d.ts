import { TokenSupplyType, TokenType, TransactionReceipt } from '@hashgraph/sdk';
import { BlockchainOptionsType } from '../../blockchain.type';
export declare class HederaService {
    private readonly options;
    private readonly logger;
    private client;
    private mirrorNodeUrl;
    constructor(options: BlockchainOptionsType);
    createAccount(): Promise<{
        accountId: string;
        privateKey: string;
    }>;
    getAccountBalance(accountId: string): Promise<string>;
    transferHbar(from: string, to: string, amount: number): Promise<string>;
    isValidPrivateKey(privateKey: string): Promise<boolean>;
    isValidAccountId(accountId: string): Promise<boolean>;
    doesPrivateKeyMatchAccount(accountId: string, privateKey: string): Promise<boolean>;
    listAllTransactions(accountId: string, limit?: number): Promise<any[]>;
    getTransactionDetails(transactionId: string): Promise<any>;
    createToken(tokenDetails: {
        name: string;
        symbol: string;
        treasuryAccountId: string;
        treasuryPrivateKey: string;
        initialSupply: number;
        decimals: number;
        tokenType?: TokenType;
        supplyType?: TokenSupplyType;
        maxSupply?: number;
    }): Promise<{
        tokenId: string;
        receipt: TransactionReceipt;
    }>;
    convertToMirrorNodeTransactionId(transactionId: string): string;
}
