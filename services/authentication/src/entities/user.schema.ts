import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
	collection: 'users',
	timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class User extends Document {
	@Prop()
	id: number;

	@Prop({ required: true })
	first_name: string;

	@Prop()
	last_name: string;

	@Prop({ required: true, unique: true })
	username: string;

	@Prop({ required: true })
	email: string;

	@Prop()
	phone: string;

	@Prop({ required: true })
	password: string;

	@Prop()
	last_login: Date;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;

	@Prop()
	deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
