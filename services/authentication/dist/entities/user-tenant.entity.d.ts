import { BaseUser } from './user.entity';
import { Tenant } from './tenant.entity';
import { Role } from './role.entity';
import { Feature } from './feature.entity';
import { Group } from './group.entity';
export declare class UserTenant {
    id: number;
    user: BaseUser;
    tenant: Tenant;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    features: Feature[];
    groups: Group[];
}
