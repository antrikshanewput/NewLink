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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AuthorizationService = class AuthorizationService {
    constructor(roleRepository, featureRepository, userTenantRepository) {
        this.roleRepository = roleRepository;
        this.featureRepository = featureRepository;
        this.userTenantRepository = userTenantRepository;
    }
    async createRole(name, description) {
        const existingRole = await this.roleRepository.findOne({ where: { name } });
        if (existingRole) {
            throw new Error(`Role "${name}" already exists`);
        }
        const role = this.roleRepository.create({ name, description });
        return this.roleRepository.save(role);
    }
    async createFeature(name, description) {
        const existingFeature = await this.featureRepository.findOne({ where: { name } });
        if (existingFeature) {
            throw new Error(`Feature "${name}" already exists`);
        }
        const feature = this.featureRepository.create({ name, description });
        return this.featureRepository.save(feature);
    }
    async assignRoleFeature(roleId, featureId) {
        const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['features'] });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }
        const feature = await this.featureRepository.findOne({ where: { id: featureId } });
        if (!feature) {
            throw new Error(`Feature with ID "${featureId}" not found`);
        }
        if (!role.features.some((feat) => feat.id === feature.id)) {
            role.features.push(feature);
            return this.roleRepository.save(role);
        }
        throw new Error(`Feature "${feature.name}" is already assigned to Role "${role.name}"`);
    }
    async assignTenantUserRole(userId, tenantId, roleId) {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId }, role: { id: roleId } },
        });
        if (!userTenant) {
            const newUserTenant = this.userTenantRepository.create({
                user: { id: userId },
                tenant: { id: tenantId },
                role,
            });
            return this.userTenantRepository.save(newUserTenant);
        }
        throw new Error(`User "${userId}" already has Role "${role.name}" in Tenant "${tenantId}"`);
    }
    async revokeTenantUserRole(userId, tenantId, roleId) {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId }, role: { id: roleId } },
        });
        if (!userTenant) {
            throw new Error(`Role with ID "${roleId}" not assigned to User "${userId}" in Tenant "${tenantId}"`);
        }
        await this.userTenantRepository.remove(userTenant);
    }
    async assignTenantUserFeature(userId, tenantId, featureId) {
        const feature = await this.featureRepository.findOne({ where: { id: featureId } });
        if (!feature) {
            throw new Error(`Feature with ID "${featureId}" not found`);
        }
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId } },
            relations: ['features'],
        });
        if (!userTenant) {
            throw new Error(`User "${userId}" is not associated with Tenant "${tenantId}"`);
        }
        if (!userTenant.features.find((f) => f.id === featureId)) {
            userTenant.features.push(feature);
            return this.userTenantRepository.save(userTenant);
        }
        throw new Error(`Feature "${feature.name}" already assigned to User "${userId}" in Tenant "${tenantId}"`);
    }
    async revokeTenantUserFeature(userId, tenantId, featureId) {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId } },
            relations: ['features'],
        });
        if (!userTenant) {
            throw new Error(`User "${userId}" is not associated with Tenant "${tenantId}"`);
        }
        const featureIndex = userTenant.features.findIndex((f) => f.id === featureId);
        if (featureIndex === -1) {
            throw new Error(`Feature with ID "${featureId}" not assigned to User "${userId}" in Tenant "${tenantId}"`);
        }
        userTenant.features.splice(featureIndex, 1);
        await this.userTenantRepository.save(userTenant);
    }
    async validateRole(userId, tenantId, roleName) {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId }, role: { name: roleName } },
            relations: ['role'],
        });
        return !!userTenant;
    }
    async validateFeature(userId, tenantId, featureName) {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId } },
            relations: ['features'],
        });
        if (!userTenant)
            return false;
        return !!userTenant.features.find((f) => f.name === featureName);
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ROLE_REPOSITORY')),
    __param(1, (0, common_1.Inject)('FEATURE_REPOSITORY')),
    __param(2, (0, common_1.Inject)('USERTENANT_REPOSITORY')),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AuthorizationService);
