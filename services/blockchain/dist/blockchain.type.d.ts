import { TokenSupplyType, TokenType } from "@hashgraph/sdk";
export interface BlockchainOptionsType {
    blockchain?: string;
    network?: 'mainnet' | 'testnet' | 'previewnet';
    account_id?: string;
    private_key?: string;
    initial_balance?: number;
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
