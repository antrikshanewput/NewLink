import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({ description: 'Email', example: 'user@email.com' })
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ description: 'Password', example: 'password' })
	@IsString()
	@IsNotEmpty()
	password: string;
}

export enum LoginType {
	OTP = 'otp',
	LINK = 'link',
}
export class LoginSmsDto {
	@ApiProperty()
	@IsMobilePhone()
	phone: string;

	@ApiProperty({ enum: LoginType })
	@IsEnum(LoginType)
	type: LoginType;
}

export class VerifySmsDto {
	@ApiProperty()
	@IsString()
	code: string;

	@ApiProperty({ enum: LoginType })
	@IsEnum(LoginType)
	type: LoginType;
}
