import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('user_tenant_features')
export class UserTenantFeature {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_tenant_id' })
    userTenantId!: number;

    @Column({ name: 'feature_id' })
    featureId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;
}