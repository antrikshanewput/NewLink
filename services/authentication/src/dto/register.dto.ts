import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
	@ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ description: 'First name of the user', example: 'John' })
	@IsString()
	@IsNotEmpty()
	first_name: string;

	@ApiProperty({ description: 'Last name of the user', example: 'Doe' })
	@IsString()
	@IsOptional()
	last_name: string;

	@ApiProperty({ description: 'Phone number of the user', example: '+1234567890' })
	@IsString()
	@IsNotEmpty()
	phone: string;

	@ApiProperty({ description: 'Password for the user account', example: 'StrongP@ssword123' })
	@IsString()
	@IsNotEmpty()
	password: string;
}
