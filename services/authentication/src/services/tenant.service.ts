import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';


@Injectable()
export class TenantService {
    constructor(
        @Inject('TENANT_REPOSITORY')
        private readonly tenantRepository: Repository<any>, // Dynamic repository
    ) { }

    async createTenant(object: Record<string, any>): Promise<any> {
        const tenant = this.tenantRepository.create(object);
        return this.tenantRepository.save(tenant);
    }

    async updateTenant(tenantId: string, updateData: Record<string, any>): Promise<any> {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        Object.assign(tenant, updateData);
        return this.tenantRepository.save(tenant);
    }

    async deleteTenant(tenantId: string): Promise<void> {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        await this.tenantRepository.remove(tenant);
    }

    async getAllTenants(): Promise<any[]> {
        return this.tenantRepository.find();
    }

    async getTenantById(tenantId: string): Promise<any> {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        return tenant;
    }
}