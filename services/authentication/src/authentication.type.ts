

interface ProviderDtoType {
    provide: string;
    useValue: any;
}

export interface AuthenticationOptionsType {
    authenticationField?: string;
    registrationFields?: string[];
    hashingStrategy?: (password: string) => Promise<string>;
    hashValidation?: (password: string, encrypted: string) => Promise<boolean>;
    entities?: Function[];
    private_key?: string;
    public_key?: string;
    token_expiration?: string;
    dto?: ProviderDtoType[];
}