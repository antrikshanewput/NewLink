import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationService {
    static CreateRoleDTO: any;
    static CreateFeatureDTO: any;

    constructor(
        @Inject('ROLE_REPOSITORY')
        private readonly roleRepository: Repository<any>,
        @Inject('FEATURE_REPOSITORY')
        private readonly featureRepository: Repository<any>,
        @Inject('USER_TENANT_REPOSITORY')
        private readonly userTenantRepository: Repository<any>,
        @Inject('ROLE_FEATURE_REPOSITORY')
        private readonly roleFeatureRepository: Repository<any>,
        @Inject('USER_TENANT_FEATURE_REPOSITORY')
        private readonly userTenantFeatureRepository: Repository<any>,
        @Inject('CREATE_ROLE_DTO')
        private readonly CreateRoleDTO: any,
        @Inject('CREATE_FEATURE_DTO')
        private readonly CreateFeatureDTO: any,
    ) {
        AuthorizationService.CreateRoleDTO = CreateRoleDTO;
        AuthorizationService.CreateFeatureDTO = CreateFeatureDTO;
    }

    async createRole(createRoleDto: InstanceType<typeof this.CreateRoleDTO>): Promise<any> {
        const existingRole = await this.roleRepository.findOne({
            where: { name: createRoleDto.name, deletedAt: null }
        });

        if (existingRole) {
            throw new Error(`Role "${createRoleDto.name}" already exists`);
        }

        const role = this.roleRepository.create(createRoleDto);
        return this.roleRepository.save(role);
    }

    async createFeature(createFeatureDto: InstanceType<typeof this.CreateFeatureDTO>): Promise<any> {
        const existingFeature = await this.featureRepository.findOne({
            where: { name: createFeatureDto.name, deletedAt: null }
        });

        if (existingFeature) {
            throw new Error(`Feature "${createFeatureDto.name}" already exists`);
        }

        const feature = this.featureRepository.create(createFeatureDto);
        return this.featureRepository.save(feature);
    }

    async assignRoleFeature(roleId: string, featureId: string): Promise<any> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, deletedAt: null }
        });
        if (!role) {
            throw new NotFoundException(`Role with ID "${roleId}" not found`);
        }

        const feature = await this.featureRepository.findOne({
            where: { id: featureId, deletedAt: null }
        });
        if (!feature) {
            throw new NotFoundException(`Feature with ID "${featureId}" not found`);
        }

        const existingAssignment = await this.roleFeatureRepository.findOne({
            where: {
                roleId,
                featureId,
                deletedAt: null
            }
        });

        if (existingAssignment) {
            throw new Error(`Feature "${feature.name}" is already assigned to Role "${role.name}"`);
        }

        const roleFeature = this.roleFeatureRepository.create({
            roleId,
            featureId
        });

        return this.roleFeatureRepository.save(roleFeature);
    }

    async assignTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<any> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId, deletedAt: null }
        });
        if (!role) {
            throw new NotFoundException(`Role with ID "${roleId}" not found`);
        }

        const existingAssignment = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                roleId,
                deletedAt: null
            }
        });

        if (existingAssignment) {
            throw new Error(`User "${userId}" already has Role "${role.name}" in Tenant "${tenantId}"`);
        }

        const userTenant = this.userTenantRepository.create({
            userId,
            tenantId,
            roleId
        });

        return this.userTenantRepository.save(userTenant);
    }

    async revokeTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<void> {
        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                roleId,
                deletedAt: null
            }
        });

        if (!userTenant) {
            throw new NotFoundException(
                `Role with ID "${roleId}" not assigned to User "${userId}" in Tenant "${tenantId}"`
            );
        }

        await this.userTenantRepository.softDelete(userTenant.id);
    }

    async assignTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<any> {
        const feature = await this.featureRepository.findOne({
            where: { id: featureId, deletedAt: null }
        });
        if (!feature) {
            throw new NotFoundException(`Feature with ID "${featureId}" not found`);
        }

        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                deletedAt: null
            }
        });

        if (!userTenant) {
            throw new NotFoundException(`User "${userId}" is not associated with Tenant "${tenantId}"`);
        }

        const existingAssignment = await this.userTenantFeatureRepository.findOne({
            where: {
                userTenantId: userTenant.id,
                featureId,
                deletedAt: null
            }
        });

        if (existingAssignment) {
            throw new Error(`Feature "${feature.name}" already assigned to User "${userId}" in Tenant "${tenantId}"`);
        }

        const userTenantFeature = this.userTenantFeatureRepository.create({
            userTenantId: userTenant.id,
            featureId
        });

        return this.userTenantFeatureRepository.save(userTenantFeature);
    }

    async revokeTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<void> {
        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                deletedAt: null
            }
        });

        if (!userTenant) {
            throw new NotFoundException(`User "${userId}" is not associated with Tenant "${tenantId}"`);
        }

        const userTenantFeature = await this.userTenantFeatureRepository.findOne({
            where: {
                userTenantId: userTenant.id,
                featureId,
                deletedAt: null
            }
        });

        if (!userTenantFeature) {
            throw new NotFoundException(
                `Feature with ID "${featureId}" not assigned to User "${userId}" in Tenant "${tenantId}"`
            );
        }

        await this.userTenantFeatureRepository.softDelete(userTenantFeature.id);
    }

    async validateRole(userId: string, tenantId: string, roleName: string): Promise<boolean> {
        const role = await this.roleRepository.findOne({
            where: { name: roleName, deletedAt: null }
        });

        if (!role) return false;

        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                roleId: role.id,
                deletedAt: null
            }
        });

        return !!userTenant;
    }

    async validateFeature(userId: string, tenantId: string, featureName: string): Promise<boolean> {
        const feature = await this.featureRepository.findOne({
            where: { name: featureName, deletedAt: null }
        });

        if (!feature) return false;

        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                deletedAt: null
            }
        });

        if (!userTenant) return false;

        const userTenantFeature = await this.userTenantFeatureRepository.findOne({
            where: {
                userTenantId: userTenant.id,
                featureId: feature.id,
                deletedAt: null
            }
        });

        return !!userTenantFeature;
    }
}