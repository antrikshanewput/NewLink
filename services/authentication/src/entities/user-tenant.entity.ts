import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Unique,
    ManyToMany,
    JoinTable,
} from 'typeorm';

import { EntityRegistry } from '.';

@Entity('user_tenant')
@Unique(['user', 'tenant', 'role'])
export class UserTenant {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @ManyToOne(() => EntityRegistry.getEntity('User'), (user: any) => user.userTenants, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: any;


    @ManyToOne(() => EntityRegistry.getEntity('Tenant'), (tenant: any) => tenant.userTenants, { eager: true })
    @JoinColumn({ name: 'tenant_id' })
    tenant!: any;

    @ManyToOne(() => EntityRegistry.getEntity('Role'), (role: any) => role.userTenants, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;

    @ManyToMany(() => EntityRegistry.getEntity('Feature'), (feature: any) => feature.userTenants)
    @JoinTable({
        name: 'user_tenant_features',
        joinColumn: {
            name: 'user_tenant_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'feature_id',
            referencedColumnName: 'id',
        },
    })
    features!: any[];

    @ManyToMany(() => EntityRegistry.getEntity('Group'), (group: any) => group.userTenants)
    @JoinTable({
        name: 'user_tenant_groups',
        joinColumn: {
            name: 'user_tenant_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'group_id',
            referencedColumnName: 'id',
        },
    })
    groups!: any[];
}