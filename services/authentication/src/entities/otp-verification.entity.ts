import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('otp_verifications')
export class OtpVerification {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	phone: string;

	@Column()
	code: string;

	@Column()
	type: string;

	@Column({ default: false })
	isVerified: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@Column({ default: 300 })
	expiresIn: number;
}
