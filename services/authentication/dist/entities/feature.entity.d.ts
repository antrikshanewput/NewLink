import { Role } from './role.entity';
import { UserTenant } from './user-tenant.entity';
export declare class Feature {
    id: string;
    name: string;
    description: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    userTenants: UserTenant[];
}
