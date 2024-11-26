import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @ManyToOne(() => Role, (role) => role.id, { nullable: false, onDelete: 'CASCADE' })
  role!: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true  })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true  })
  deletedAt!: Date;
}