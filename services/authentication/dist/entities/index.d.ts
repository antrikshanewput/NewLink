import 'reflect-metadata';
export declare class EntityRegistry {
    private static registry;
    static registerEntity(alias: string, entity: any): void;
    static getEntity(alias: string): any;
}
