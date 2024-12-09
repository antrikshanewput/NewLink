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
    convertToMirrorNodeTransactionId(transactionId: string): string;
}
