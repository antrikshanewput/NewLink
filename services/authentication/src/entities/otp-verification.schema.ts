import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
	collection: 'otp_verifications',
	timestamps: { createdAt: 'createdAt' },
})
export class OtpVerification extends Document {
	@Prop()
	id: number;

	@Prop({ required: true })
	phone: string;

	@Prop({ required: true })
	code: string;

	@Prop({ required: true })
	type: string;

	@Prop({ default: false })
	isVerified: boolean;

	@Prop()
	createdAt: Date;

	@Prop({ default: 300 })
	expiresIn: number;
}

export const OtpVerificationSchema = SchemaFactory.createForClass(OtpVerification);
