import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Feature } from '../entities/feature.entity';
export declare class AuthorizationService {
    private readonly roleRepository;
    private readonly featureRepository;
    private readonly userTenantRepository;
    constructor(roleRepository: Repository<any>, featureRepository: Repository<any>, userTenantRepository: Repository<any>);
    createRole(name: string, description?: string): Promise<Role>;
    createFeature(name: string, description?: string): Promise<Feature>;
    assignRoleFeature(roleId: string, featureId: string): Promise<Role>;
    assignTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<any>;
    revokeTenantUserRole(userId: string, tenantId: string, roleId: string): Promise<void>;
    assignTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<any>;
    revokeTenantUserFeature(userId: string, tenantId: string, featureId: string): Promise<void>;
    validateRole(userId: string, tenantId: string, roleName: string): Promise<boolean>;
    validateFeature(userId: string, tenantId: string, featureName: string): Promise<boolean>;
}
