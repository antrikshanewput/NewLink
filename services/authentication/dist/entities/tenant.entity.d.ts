import { UserTenant } from "./user-tenant.entity";
export declare class Tenant {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    modifiedBy: string;
    deletedAt: Date;
    deletedBy: string;
    userTenants: UserTenant[];
}
