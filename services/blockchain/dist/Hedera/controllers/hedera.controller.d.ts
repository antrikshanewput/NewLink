import { HederaService } from '../services/hedera.service';
export declare class HederaController {
    private readonly hederaService;
    private readonly logger;
    constructor(hederaService: HederaService);
    createAccount(): Promise<{
        accountId: string;
        privateKey: string;
    }>;
    getAccountBalance(accountId: string): Promise<{
        accountId: string;
        balance: string;
    }>;
    transferHbar(transferRequest: {
        from: string;
        to: string;
        amount: number;
        privateKey: string;
    }): Promise<{
        status: string;
    }>;
}
