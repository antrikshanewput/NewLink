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
    constructor(roleRepository, featureRepository, userRoleRepository, userFeatureRepository) {
        this.roleRepository = roleRepository;
        this.featureRepository = featureRepository;
        this.userRoleRepository = userRoleRepository;
        this.userFeatureRepository = userFeatureRepository;
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
    async assignUserRole(userId, roleId) {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }
        const existingUserRole = await this.userRoleRepository.findOne({
            where: { userId, role: { id: roleId } },
        });
        if (!existingUserRole) {
            const userRole = this.userRoleRepository.create({ userId, role });
            return this.userRoleRepository.save(userRole);
        }
        throw new Error(`User "${userId}" already has Role "${role.name}"`);
    }
    async revokeUserRole(userId, roleId) {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, role: { id: roleId } },
        });
        if (!userRole) {
            throw new Error(`Role with ID "${roleId}" not assigned to User "${userId}"`);
        }
        await this.userRoleRepository.remove(userRole);
    }
    async assignUserFeature(userId, featureId) {
        const feature = await this.featureRepository.findOne({ where: { id: featureId } });
        if (!feature) {
            throw new Error(`Feature with ID "${featureId}" not found`);
        }
        const existingUserFeature = await this.userFeatureRepository.findOne({
            where: { userId, feature: { id: featureId } },
        });
        if (!existingUserFeature) {
            const userFeature = this.userFeatureRepository.create({ userId, feature });
            return this.userFeatureRepository.save(userFeature);
        }
        throw new Error(`User "${userId}" already has Feature "${feature.name}"`);
    }
    async revokeUserFeature(userId, featureId) {
        const userFeature = await this.userFeatureRepository.findOne({
            where: { userId, feature: { id: featureId } },
        });
        if (!userFeature) {
            throw new Error(`Feature with ID "${featureId}" not assigned to User "${userId}"`);
        }
        await this.userFeatureRepository.remove(userFeature);
    }
    async validateRole(userId, roleName) {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, role: { name: roleName } },
            relations: ['role'],
        });
        return !!userRole;
    }
    async validateFeature(userId, featureName) {
        const userFeature = await this.userFeatureRepository.findOne({
            where: { userId, feature: { name: featureName } },
            relations: ['feature'],
        });
        return !!userFeature;
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ROLE_REPOSITORY')),
    __param(1, (0, common_1.Inject)('FEATURE_REPOSITORY')),
    __param(2, (0, common_1.Inject)('USERROLE_REPOSITORY')),
    __param(3, (0, common_1.Inject)('USERFEATURE_REPOSITORY')),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AuthorizationService);
