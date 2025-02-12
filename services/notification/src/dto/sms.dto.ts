import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SmsDto {
	@ApiProperty({
		description: 'The destination phone number in E.164 format',
		example: '+1234567890',
	})
	@IsString()
	@IsNotEmpty()
	dst: string;

	@ApiProperty({
		description: 'The text message to be sent',
		example: 'Hello, this is a test SMS from our service.',
	})
	@IsString()
	@IsNotEmpty()
	text: string;
}
