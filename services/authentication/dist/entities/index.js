"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRegistry = void 0;
require("reflect-metadata");
class EntityRegistry {
    static registerEntity(alias, entity) {
        this.registry[alias] = entity;
    }
    static getEntity(alias) {
        return this.registry[alias];
    }
}
exports.EntityRegistry = EntityRegistry;
EntityRegistry.registry = {};
//# sourceMappingURL=index.js.map