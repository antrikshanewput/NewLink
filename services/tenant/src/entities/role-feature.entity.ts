import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('role_features')
export class RoleFeature {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'role_id' })
    roleId!: string;

    @Column({ name: 'feature_id' })
    featureId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date;
}