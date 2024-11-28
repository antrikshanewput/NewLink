import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthenticationOptionsType } from '../authentication.types';

@Injectable()
export class AuthorizationSeederService implements OnApplicationBootstrap {
    constructor(
        @Inject('AUTHENTICATION_OPTIONS') private readonly config: AuthenticationOptionsType,
        @Inject('ROLE_REPOSITORY') private readonly roleRepository: Repository<any>,
        @Inject('FEATURE_REPOSITORY') private readonly featureRepository: Repository<any>,
    ) { }

    async onApplicationBootstrap() {

        for (const roleName of this.config.roles || []) {
            const existingRole = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!existingRole) {
                await this.roleRepository.save(this.roleRepository.create({ name: roleName }));
            }
        }

        for (const featureName of this.config.features || []) {
            const existingFeature = await this.featureRepository.findOne({ where: { name: featureName } });
            if (!existingFeature) {
                await this.featureRepository.save(this.featureRepository.create({ name: featureName }));
            }
        }

        // Seed permissions (assign features to roles)
        for (const permission of this.config.permissions || []) {
            const role = await this.roleRepository.findOne({
                where: { name: permission.role },
                relations: ['features'],
            });
            if (role) {
                for (const featureName of permission.features) {
                    const feature = await this.featureRepository.findOne({ where: { name: featureName } });
                    if (feature && !role.features.find((f: any) => f.id === feature.id)) {
                        role.features.push(feature);
                    }
                }
                await this.roleRepository.save(role);
            }
        }
    }
}