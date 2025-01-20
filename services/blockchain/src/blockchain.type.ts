import { TokenSupplyType, TokenType } from "@hashgraph/sdk";
interface ProviderDtoType {
    provide: string;
    useValue: any;
}

export interface BlockchainOptionsType {
    blockchain?: string;
    network?: 'mainnet' | 'testnet' | 'previewnet';
    account_id?: string;
    private_key?: string;
    initial_balance?: number;
    dto?: ProviderDtoType[];
}

export interface BlockchainTokenTypes {
    name: string;
    symbol: string;
    treasuryAccountId: string;
    treasuryPrivateKey: string;
    initialSupply: number;
    decimals: number;
    tokenType?: TokenType;
    supplyType?: TokenSupplyType;
    maxSupply?: number | undefined;

}