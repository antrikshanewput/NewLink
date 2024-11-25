export interface AuthOptionsType {
    authenticationField?: string;
    registrationFields?: string[];
    hashingStrategy?: (password: string) => Promise<string>;
    hashValidation?: (password: string, encrypted: string) => Promise<boolean>;
    userEntity?: Function;
}
