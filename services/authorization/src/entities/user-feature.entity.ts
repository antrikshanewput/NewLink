import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Feature } from './feature.entity';

@Entity('user_features')
export class UserFeature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @ManyToOne(() => Feature, (feature) => feature.id, { nullable: false, onDelete: 'CASCADE' })
  feature!: Feature; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date; 

  @UpdateDateColumn({ name: 'updated_at', nullable: true  })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true  })
  deletedAt!: Date;
}