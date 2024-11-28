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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let GroupService = class GroupService {
    constructor(groupRepository) {
        this.groupRepository = groupRepository;
    }
    async createGroup(groupData) {
        const group = this.groupRepository.create(groupData);
        return this.groupRepository.save(group);
    }
    async updateGroup(groupId, updateData) {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        Object.assign(group, updateData);
        return this.groupRepository.save(group);
    }
    async deleteGroup(groupId) {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        await this.groupRepository.remove(group);
    }
    async getAllGroups() {
        return this.groupRepository.find();
    }
    async getGroupById(groupId) {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        return group;
    }
    async addUserTenantToGroup(groupId, userTenantId) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['userTenants'],
        });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        const userTenant = { id: userTenantId }; // Placeholder for UserTenant relation
        if (!group.userTenants.find((ut) => ut.id === Number(userTenantId))) {
            group.userTenants.push(userTenant);
            return this.groupRepository.save(group);
        }
        throw new Error(`UserTenant "${userTenantId}" is already in Group "${group.name}"`);
    }
    async removeUserTenantFromGroup(groupId, userTenantId) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['userTenants'],
        });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        group.userTenants = group.userTenants.filter((ut) => ut.id !== Number(userTenantId));
        return this.groupRepository.save(group);
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('GROUP_REPOSITORY')),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], GroupService);
