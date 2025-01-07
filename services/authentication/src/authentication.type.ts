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
    private_key?: string;
    public_key?: string;
}


export function validateAuthorizationOptions(options: AuthenticationOptionsType): void {
    const { roles, features, permissions } = options;

    permissions.forEach(({ role }) => {
        if (!roles.includes(role)) {
            throw new Error(`Role "${role}" in permissions is not defined in roles.`);
        }
    });

    permissions.forEach(({ role, features: roleFeatures }) => {
        roleFeatures.forEach((feature) => {
            if (!features.includes(feature)) {
                throw new Error(
                    `Feature "${feature}" in permissions for role "${role}" is not defined in features.`
                );
            }
        });
    });
}