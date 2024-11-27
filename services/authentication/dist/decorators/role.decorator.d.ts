export declare const ROLE_KEY = "roles";
export declare function Role(...roles: string[]): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
