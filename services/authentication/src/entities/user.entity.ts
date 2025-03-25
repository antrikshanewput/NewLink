import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserSchema } from './user.schema';
@Entity('users')
export class User {
	static schemaName = 'User';
	static schema = UserSchema;
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
}
