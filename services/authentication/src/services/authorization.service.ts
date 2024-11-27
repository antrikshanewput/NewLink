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
        @Inject('USERROLE_REPOSITORY')
        private readonly userRoleRepository: Repository<any>,
        @Inject('USERFEATURE_REPOSITORY')
        private readonly userFeatureRepository: Repository<any>
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

        if (!role.features.some((feat:any) => feat.id === feature.id)) {
            role.features.push(feature);
            return this.roleRepository.save(role);
        }

        throw new Error(`Feature "${feature.name}" is already assigned to Role "${role.name}"`);
    }

    async assignUserRole(userId: string, roleId: string): Promise<any> {
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

    async revokeUserRole(userId: string, roleId: string): Promise<void> {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, role: { id: roleId } },
        });

        if (!userRole) {
            throw new Error(`Role with ID "${roleId}" not assigned to User "${userId}"`);
        }

        await this.userRoleRepository.remove(userRole);
    }

    async assignUserFeature(userId: string, featureId: string): Promise<any> {
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

    async revokeUserFeature(userId: string, featureId: string): Promise<void> {
        const userFeature = await this.userFeatureRepository.findOne({
            where: { userId, feature: { id: featureId } },
        });

        if (!userFeature) {
            throw new Error(`Feature with ID "${featureId}" not assigned to User "${userId}"`);
        }

        await this.userFeatureRepository.remove(userFeature);
    }

    async validateRole(userId: string, roleName: string): Promise<boolean> {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, role: { name: roleName } },
            relations: ['role'],
        });
        return !!userRole;
    }

    async validateFeature(userId: string, featureName: string): Promise<boolean> {
        const userFeature = await this.userFeatureRepository.findOne({
            where: { userId, feature: { name: featureName } },
            relations: ['feature'],
        });
        return !!userFeature;
    }
}