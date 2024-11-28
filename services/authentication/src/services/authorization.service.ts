import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Feature } from '../entities/feature.entity';

@Injectable()
export class AuthorizationService {
    constructor(
        @Inject('ROLE_REPOSITORY')
        private readonly roleRepository: Repository<any>,
        @Inject('FEATURE_REPOSITORY')
        private readonly featureRepository: Repository<any>,
        @Inject('USERTENANT_REPOSITORY')
        private readonly userTenantRepository: Repository<any>,
    ) { }

    async createRole(name: string, description?: string): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({ where: { name } });
        if (existingRole) {
            throw new Error(`Role "${name}" already exists`);
        }
        const role = this.roleRepository.create({ name, description });
        return this.roleRepository.save(role);
    }

    async createFeature(name: string, description?: string): Promise<Feature> {
        const existingFeature = await this.featureRepository.findOne({ where: { name } });
        if (existingFeature) {
            throw new Error(`Feature "${name}" already exists`);
        }
        const feature = this.featureRepository.create({ name, description });
        return this.featureRepository.save(feature);
    }

    async assignRoleFeature(roleId: string, featureId: string): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['features'] });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }

        const feature = await this.featureRepository.findOne({ where: { id: featureId } });
        if (!feature) {
            throw new Error(`Feature with ID "${featureId}" not found`);
        }

        if (!role.features.some((feat: Feature) => feat.id === feature.id)) {
            role.features.push(feature);
            return this.roleRepository.save(role);
        }

        throw new Error(`Feature "${feature.name}" is already assigned to Role "${role.name}"`);
    }

    async assignTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<any> {
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

    async revokeTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<void> {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId }, role: { id: roleId } },
        });

        if (!userTenant) {
            throw new Error(`Role with ID "${roleId}" not assigned to User "${userId}" in Tenant "${tenantId}"`);
        }

        await this.userTenantRepository.remove(userTenant);
    }

    async assignTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<any> {
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

        if (!userTenant.features.find((f: Feature) => f.id === featureId)) {
            userTenant.features.push(feature);
            return this.userTenantRepository.save(userTenant);
        }

        throw new Error(`Feature "${feature.name}" already assigned to User "${userId}" in Tenant "${tenantId}"`);
    }

    async revokeTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<void> {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId } },
            relations: ['features'],
        });

        if (!userTenant) {
            throw new Error(`User "${userId}" is not associated with Tenant "${tenantId}"`);
        }

        const featureIndex = userTenant.features.findIndex((f: Feature) => f.id === featureId);
        if (featureIndex === -1) {
            throw new Error(`Feature with ID "${featureId}" not assigned to User "${userId}" in Tenant "${tenantId}"`);
        }

        userTenant.features.splice(featureIndex, 1);
        await this.userTenantRepository.save(userTenant);
    }

    async validateRole(userId: string, tenantId: string, roleName: string): Promise<boolean> {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId }, role: { name: roleName } },
            relations: ['role'],
        });

        return !!userTenant;
    }

    async validateFeature(userId: string, tenantId: string, featureName: string): Promise<boolean> {
        const userTenant = await this.userTenantRepository.findOne({
            where: { user: { id: userId }, tenant: { id: tenantId } },
            relations: ['features'],
        });

        if (!userTenant) return false;

        return !!userTenant.features.find((f: Feature) => f.name === featureName);
    }
}