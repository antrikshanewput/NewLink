import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { EntityRegistry } from '.';
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;


  @ManyToMany(() => EntityRegistry.getEntity('Feature'), (feature: any) => feature.roles, { cascade: true })
  @JoinTable({
    name: 'role_features',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'feature_id', referencedColumnName: 'id' },
  })
  features!: any[];
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date;

  @OneToMany(() => EntityRegistry.getEntity('UserTenant'), (userTenant: any) => userTenant.role)
  userTenants!: any[];
}