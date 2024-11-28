"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TenantService = class TenantService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async createTenant(object) {
        const tenant = this.tenantRepository.create(object);
        return this.tenantRepository.save(tenant);
    }
    async updateTenant(tenantId, updateData) {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        Object.assign(tenant, updateData);
        return this.tenantRepository.save(tenant);
    }
    async deleteTenant(tenantId) {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        await this.tenantRepository.remove(tenant);
    }
    async getAllTenants() {
        return this.tenantRepository.find();
    }
    async getTenantById(tenantId) {
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
        }
        return tenant;
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TENANT_REPOSITORY')),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], TenantService);
