import { Repository } from 'typeorm';
export declare class TenantService {
    private readonly tenantRepository;
    constructor(tenantRepository: Repository<any>);
    createTenant(object: Record<string, any>): Promise<any>;
    updateTenant(tenantId: string, updateData: Record<string, any>): Promise<any>;
    deleteTenant(tenantId: string): Promise<void>;
    getAllTenants(): Promise<any[]>;
    getTenantById(tenantId: string): Promise<any>;
}
