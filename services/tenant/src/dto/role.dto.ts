import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Name of the role',
        example: 'ADMIN',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'Description of the role',
        example: 'Administrator role with full access',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateRoleDto {
    @ApiProperty({
        description: 'Name of the role',
        example: 'SUPER_ADMIN',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of the role',
        example: 'Super Administrator role with enhanced privileges',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}
