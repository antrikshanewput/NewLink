import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  phone!: string;

  @Column({ type: 'varchar', nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  username!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  pincode!: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender!: 'male' | 'female' | 'other';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}