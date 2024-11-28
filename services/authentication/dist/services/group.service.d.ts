import { Repository } from 'typeorm';
export declare class GroupService {
    private readonly groupRepository;
    constructor(groupRepository: Repository<any>);
    createGroup(groupData: Record<string, any>): Promise<any>;
    updateGroup(groupId: string, updateData: Record<string, any>): Promise<any>;
    deleteGroup(groupId: string): Promise<void>;
    getAllGroups(): Promise<any[]>;
    getGroupById(groupId: string): Promise<any>;
    addUserTenantToGroup(groupId: string, userTenantId: string): Promise<any>;
    removeUserTenantFromGroup(groupId: string, userTenantId: string): Promise<any>;
}
