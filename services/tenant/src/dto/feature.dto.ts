import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeatureDto {
    @ApiProperty({
        description: 'Name of the feature',
        example: 'Manage Users',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Description of the feature',
        example: 'Allows managing users, including creating, editing, and deleting user accounts',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateFeatureDto {
    @ApiProperty({
        description: 'Name of the feature',
        example: 'Manage Roles',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of the feature',
        example: 'Updated description for managing roles in the system',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}