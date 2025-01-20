import 'reflect-metadata';

export class EntityRegistry {
    private static registry: { [key: string]: any } = {};

    static registerEntity(alias: string, entity: any) {
        this.registry[alias] = entity;
    }

    static getEntity(alias: string): any {
        return this.registry[alias];
    }
}