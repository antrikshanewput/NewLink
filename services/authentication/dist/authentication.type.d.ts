export interface AuthenticationOptionsType {
    authenticationField?: string;
    registrationFields?: string[];
    hashingStrategy?: (password: string) => Promise<string>;
    hashValidation?: (password: string, encrypted: string) => Promise<boolean>;
    entities?: Function[];
    roles: string[];
    features: string[];
    permissions: {
        role: string;
        features: string[];
    }[];
}
export declare function validateAuthorizationOptions(options: AuthenticationOptionsType): void;
