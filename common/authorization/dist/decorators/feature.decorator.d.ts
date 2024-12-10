export declare const FEATURE_KEY = "features";
export declare function Feature(...featuresOrArray: (string | string[])[]): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
