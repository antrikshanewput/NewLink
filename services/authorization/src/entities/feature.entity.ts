import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name!: string; 

  @Column({ type: 'text', nullable: true })
  description!: string; 

  @ManyToMany(() => Role, (role) => role.features)
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true  })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true  })
  deletedAt!: Date;
}