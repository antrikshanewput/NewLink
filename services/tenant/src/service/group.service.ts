import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class GroupService {
    static CreateGroupDTO: any;
    static UpdateGroupDTO: any;

    constructor(
        @Inject('GROUP_REPOSITORY')
        private readonly groupRepository: Repository<any>,
        @Inject('USER_TENANT_GROUP_REPOSITORY')
        private readonly userTenantGroupRepository: Repository<any>,
        @Inject('CREATE_GROUP_DTO')
        private readonly CreateGroupDTO: any,
        @Inject('UPDATE_GROUP_DTO')
        private readonly UpdateGroupDTO: any,
    ) {
        GroupService.CreateGroupDTO = CreateGroupDTO;
        GroupService.UpdateGroupDTO = UpdateGroupDTO;
    }

    async createGroup(createGroupDto: InstanceType<typeof this.CreateGroupDTO>): Promise<any> {
        const existingGroup = await this.groupRepository.findOne({
            where: { name: createGroupDto.name, deletedAt: null }
        });

        if (existingGroup) {
            throw new Error(`Group "${createGroupDto.name}" already exists`);
        }

        const group = this.groupRepository.create(createGroupDto);
        return this.groupRepository.save(group);
    }

    async updateGroup(groupId: string, updateGroupDto: InstanceType<typeof this.UpdateGroupDTO>): Promise<any> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, deletedAt: null }
        });

        if (!group) {
            throw new NotFoundException(`Group with ID "${groupId}" not found`);
        }

        Object.assign(group, updateGroupDto);
        return this.groupRepository.save(group);
    }

    async deleteGroup(groupId: string): Promise<void> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, deletedAt: null }
        });

        if (!group) {
            throw new NotFoundException(`Group with ID "${groupId}" not found`);
        }

        await this.groupRepository.softDelete(groupId);
    }

    async getAllGroups(): Promise<any[]> {
        return this.groupRepository.find({
            where: { deletedAt: null }
        });
    }

    async getGroupById(groupId: string): Promise<any> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, deletedAt: null }
        });

        if (!group) {
            throw new NotFoundException(`Group with ID "${groupId}" not found`);
        }

        return group;
    }

    async addUserTenantToGroup(groupId: string, userTenantId: string): Promise<any> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, deletedAt: null }
        });

        if (!group) {
            throw new NotFoundException(`Group with ID "${groupId}" not found`);
        }

        const existingAssignment = await this.userTenantGroupRepository.findOne({
            where: {
                groupId,
                userTenantId,
                deletedAt: null
            }
        });

        if (existingAssignment) {
            throw new Error(`UserTenant "${userTenantId}" is already in Group "${group.name}"`);
        }

        const userTenantGroup = this.userTenantGroupRepository.create({
            groupId,
            userTenantId
        });

        return this.userTenantGroupRepository.save(userTenantGroup);
    }

    async removeUserTenantFromGroup(groupId: string, userTenantId: string): Promise<void> {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, deletedAt: null }
        });

        if (!group) {
            throw new NotFoundException(`Group with ID "${groupId}" not found`);
        }

        const userTenantGroup = await this.userTenantGroupRepository.findOne({
            where: {
                groupId,
                userTenantId,
                deletedAt: null
            }
        });

        if (!userTenantGroup) {
            throw new NotFoundException(
                `UserTenant "${userTenantId}" is not a member of Group "${group.name}"`
            );
        }

        await this.userTenantGroupRepository.softDelete(userTenantGroup.id);
    }

    async getUserTenantGroups(userTenantId: string): Promise<any[]> {
        return this.userTenantGroupRepository.find({
            where: {
                userTenantId,
                deletedAt: null
            }
        });
    }

    async getGroupUserTenants(groupId: string): Promise<any[]> {
        return this.userTenantGroupRepository.find({
            where: {
                groupId,
                deletedAt: null
            }
        });
    }
}