import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from 'typeorm';

@Entity('user_tenant')
@Unique(['user_id', 'tenant_id', 'role_id'])
export class UserTenant {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column({ name: 'user_id' })
    userId!: number;

    @Column({ name: 'tenant_id' })
    tenantId!: number;

    @Column({ name: 'role_id' })
    roleId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;
}
