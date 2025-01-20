import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
    @ApiProperty({
        description: 'Name of the group',
        example: 'Marketing Team',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Description of the group',
        example: 'A group for all marketing team members',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'ID of the user who is creating this group',
        example: 'user123',
    })
    @IsString()
    @IsNotEmpty()
    createdBy: string;
}

export class UpdateGroupDto {
    @ApiProperty({
        description: 'Name of the group',
        example: 'Sales Team',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of the group',
        example: 'Updated description for the sales team',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'ID of the user who is modifying this group',
        example: 'user456',
        required: false,
    })
    @IsString()
    @IsOptional()
    modifiedBy?: string;
}