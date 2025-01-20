import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'phone', example: '9770423319' })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ description: 'Password', example: 'password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}