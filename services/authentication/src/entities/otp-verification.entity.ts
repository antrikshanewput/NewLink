import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OtpVerificationSchema } from './otp-verification.schema';

@Entity('otp_verifications')
export class OtpVerification {
	static schemaName = 'OtpVerification';
	static schema = OtpVerificationSchema;
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
