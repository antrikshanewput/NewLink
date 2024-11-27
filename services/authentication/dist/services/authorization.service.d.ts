import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Feature } from '../entities/feature.entity';
export declare class AuthorizationService {
    private readonly roleRepository;
    private readonly featureRepository;
    private readonly userRoleRepository;
    private readonly userFeatureRepository;
    constructor(roleRepository: Repository<any>, featureRepository: Repository<any>, userRoleRepository: Repository<any>, userFeatureRepository: Repository<any>);
    createRole(name: string, description?: string): Promise<Role>;
    createFeature(name: string, description?: string): Promise<Feature>;
    assignRoleFeature(roleId: string, featureId: string): Promise<Role>;
    assignUserRole(userId: string, roleId: string): Promise<any>;
    revokeUserRole(userId: string, roleId: string): Promise<void>;
    assignUserFeature(userId: string, featureId: string): Promise<any>;
    revokeUserFeature(userId: string, featureId: string): Promise<void>;
    validateRole(userId: string, roleName: string): Promise<boolean>;
    validateFeature(userId: string, featureName: string): Promise<boolean>;
}
