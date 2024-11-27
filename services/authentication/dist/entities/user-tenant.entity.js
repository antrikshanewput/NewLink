"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTenant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const tenant_entity_1 = require("./tenant.entity");
const role_entity_1 = require("./role.entity");
const feature_entity_1 = require("./feature.entity");
const group_entity_1 = require("./group.entity");
let UserTenant = class UserTenant {
};
exports.UserTenant = UserTenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", Number)
], UserTenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.BaseUser, (user) => user.userTenants, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.BaseUser)
], UserTenant.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (tenant) => tenant.userTenants, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], UserTenant.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.userTenants, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], UserTenant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserTenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], UserTenant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], UserTenant.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => feature_entity_1.Feature, (feature) => feature.userTenants),
    (0, typeorm_1.JoinTable)({
        name: 'user_tenant_features',
        joinColumn: {
            name: 'user_tenant_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'feature_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], UserTenant.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => group_entity_1.Group, (group) => group.userTenants),
    (0, typeorm_1.JoinTable)({
        name: 'user_tenant_groups',
        joinColumn: {
            name: 'user_tenant_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'group_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], UserTenant.prototype, "groups", void 0);
exports.UserTenant = UserTenant = __decorate([
    (0, typeorm_1.Entity)('user_tenant'),
    (0, typeorm_1.Unique)(['user', 'tenant', 'role'])
], UserTenant);
