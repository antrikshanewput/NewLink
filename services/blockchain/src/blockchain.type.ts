interface BlockchainOptionsType {
    blockchain?: string;
    network?: 'mainnet' | 'testnet' | 'previewnet';
    account_id?: string;
    private_key?: string;
    initial_balance?: number;
}