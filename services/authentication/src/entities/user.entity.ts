
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';

import { UserTenant } from './user-tenant.entity';
@Entity('users')
export class BaseUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  first_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  last_login!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => UserTenant, (userTenant) => userTenant.user)
  userTenants!: UserTenant[];
}