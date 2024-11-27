import { Feature } from './feature.entity';
import { UserTenant } from './user-tenant.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    features: Feature[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    userTenants: UserTenant[];
}
