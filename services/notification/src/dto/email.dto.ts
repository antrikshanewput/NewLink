import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
    @ApiProperty({
        description: 'The recipient email address',
        example: 'recipient@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @ApiProperty({
        description: 'The subject of the email',
        example: 'Welcome to Notification Service!',
    })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({
        description: 'The plain text content of the email',
        example: 'Hello, this is a test email from our service.',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({
        description: 'The optional HTML content of the email',
        example: '<h1>Hello!</h1> <p>This is a test email.</p>',
        required: false,
    })
    @IsString()
    @IsOptional()
    html?: string;
}