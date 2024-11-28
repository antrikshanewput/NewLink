import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserTenant } from '../entities/user-tenant.entity';

@Injectable()
export class GroupService {
    constructor(
        @Inject('GROUP_REPOSITORY')
        private readonly groupRepository: Repository<any>, // Dynamic repository for Group
    ) { }

    async createGroup(groupData: Record<string, any>): Promise<any> {
        const group = this.groupRepository.create(groupData);
        return this.groupRepository.save(group);
    }

    async updateGroup(groupId: string, updateData: Record<string, any>): Promise<any> {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        Object.assign(group, updateData);
        return this.groupRepository.save(group);
    }

    async deleteGroup(groupId: string): Promise<void> {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        await this.groupRepository.remove(group);
    }

    async getAllGroups(): Promise<any[]> {
        return this.groupRepository.find();
    }

    async getGroupById(groupId: string): Promise<any> {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        return group;
    }

    async addUserTenantToGroup(groupId: string, userTenantId: string): Promise<any> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['userTenants'],
        });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        const userTenant = { id: userTenantId }; // Placeholder for UserTenant relation
        if (!group.userTenants.find((ut: UserTenant) => ut.id === Number(userTenantId))) {
            group.userTenants.push(userTenant);
            return this.groupRepository.save(group);
        }
        throw new Error(`UserTenant "${userTenantId}" is already in Group "${group.name}"`);
    }

    async removeUserTenantFromGroup(groupId: string, userTenantId: string): Promise<any> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
            relations: ['userTenants'],
        });
        if (!group) {
            throw new Error(`Group with ID "${groupId}" not found`);
        }
        group.userTenants = group.userTenants.filter((ut: UserTenant) => ut.id !== Number(userTenantId));
        return this.groupRepository.save(group);
    }
}