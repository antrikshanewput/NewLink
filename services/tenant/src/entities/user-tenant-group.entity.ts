import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('user_tenant_groups')
export class UserTenantGroup {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_tenant_id' })
    userTenantId!: number;

    @Column({ name: 'group_id' })
    groupId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;
}