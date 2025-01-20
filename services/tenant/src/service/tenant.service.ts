import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class TenantService {
    static CreateTenantDTO: any;
    static UpdateTenantDTO: any;
    static CreateUserTenantDTO: any;

    constructor(
        @Inject('TENANT_REPOSITORY')
        private readonly tenantRepository: Repository<any>,
        @Inject('USER_TENANT_REPOSITORY')
        private readonly userTenantRepository: Repository<any>,
        @Inject('CREATE_TENANT_DTO')
        private readonly CreateTenantDTO: any,
        @Inject('UPDATE_TENANT_DTO')
        private readonly UpdateTenantDTO: any,
        @Inject('CREATE_USER_TENANT_DTO')
        private readonly CreateUserTenantDTO: any,
    ) {
        TenantService.CreateTenantDTO = CreateTenantDTO;
        TenantService.UpdateTenantDTO = UpdateTenantDTO;
        TenantService.CreateUserTenantDTO = CreateUserTenantDTO;
    }

    async createTenant(createTenantDto: InstanceType<typeof this.CreateTenantDTO>): Promise<any> {
        const tenant = this.tenantRepository.create(createTenantDto);
        return this.tenantRepository.save(tenant);
    }

    async updateTenant(tenantId: string, updateTenantDto: InstanceType<typeof this.UpdateTenantDTO>): Promise<any> {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID "${tenantId}" not found`);
        }
        Object.assign(tenant, updateTenantDto);
        return this.tenantRepository.save(tenant);
    }

    async deleteTenant(tenantId: string): Promise<void> {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID "${tenantId}" not found`);
        }
        await this.tenantRepository.softDelete(tenantId);
    }

    async getAllTenants(): Promise<any[]> {
        return this.tenantRepository.find({
            where: { deletedAt: null }
        });
    }

    async getTenantById(tenantId: string): Promise<any> {
        const tenant = await this.tenantRepository.findOne({
            where: {
                id: tenantId,
                deletedAt: null
            }
        });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID "${tenantId}" not found`);
        }
        return tenant;
    }

    async getUserTenants(userId: number): Promise<any[]> {
        return this.userTenantRepository.find({
            where: {
                userId: userId,
                deletedAt: null
            }
        });
    }

    async getTenantUsers(tenantId: string): Promise<any[]> {
        return this.userTenantRepository.find({
            where: {
                tenantId: tenantId,
                deletedAt: null
            }
        });
    }

    async assignUserToTenant(createUserTenantDto: InstanceType<typeof this.CreateUserTenantDTO>): Promise<any> {
        const { userId, tenantId, roleId } = createUserTenantDto;

        const existingAssignment = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                deletedAt: null
            }
        });

        if (existingAssignment) {
            throw new Error('User is already assigned to this tenant');
        }

        const userTenant = this.userTenantRepository.create({
            userId,
            tenantId,
            roleId
        });

        return this.userTenantRepository.save(userTenant);
    }

    async removeUserFromTenant(userId: number, tenantId: string): Promise<void> {
        const userTenant = await this.userTenantRepository.findOne({
            where: {
                userId,
                tenantId,
                deletedAt: null
            }
        });

        if (!userTenant) {
            throw new NotFoundException('User-tenant assignment not found');
        }

        await this.userTenantRepository.softDelete(userTenant.id);
    }
}