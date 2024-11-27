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
import { BaseUser } from './user.entity';
import { Tenant } from './tenant.entity';
import { Role } from './role.entity';
import { Feature } from './feature.entity';
import { Group } from './group.entity';

@Entity('user_tenant')
@Unique(['user', 'tenant', 'role'])
export class UserTenant {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @ManyToOne(() => BaseUser, (user) => user.userTenants, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: BaseUser;

    @ManyToOne(() => Tenant, (tenant) => tenant.userTenants, { eager: true })
    @JoinColumn({ name: 'tenant_id' })
    tenant!: Tenant;

    @ManyToOne(() => Role, (role) => role.userTenants, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;

    @ManyToMany(() => Feature, (feature) => feature.userTenants)
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
    features!: Feature[];

    @ManyToMany(() => Group, (group) => group.userTenants)
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
    groups!: Group[];
}