import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Acme Corporation',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'Address of the tenant',
        example: '1234 Elm Street',
        required: false,
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({
        description: 'City where the tenant is located',
        example: 'New York',
        required: false,
    })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({
        description: 'State where the tenant is located',
        example: 'NY',
        required: false,
    })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({
        description: 'ZIP code for the tenant',
        example: '10001',
        required: false,
    })
    @IsString()
    @IsOptional()
    zip?: string;

    @ApiProperty({
        description: 'Country of the tenant',
        example: 'USA',
        required: false,
    })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({
        description: 'Status of the tenant (e.g., active, inactive)',
        example: 'active',
        required: false,
    })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({
        description: 'ID of the user who created this tenant',
        example: 'user123',
    })
    @IsString()
    @IsNotEmpty()
    createdBy!: string;
}

export class UpdateTenantDto {
    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Acme Corporation',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Address of the tenant',
        example: '1234 Elm Street',
        required: false,
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({
        description: 'City where the tenant is located',
        example: 'New York',
        required: false,
    })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({
        description: 'State where the tenant is located',
        example: 'NY',
        required: false,
    })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({
        description: 'ZIP code for the tenant',
        example: '10001',
        required: false,
    })
    @IsString()
    @IsOptional()
    zip?: string;

    @ApiProperty({
        description: 'Country of the tenant',
        example: 'USA',
        required: false,
    })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({
        description: 'Status of the tenant (e.g., active, inactive)',
        example: 'inactive',
        required: false,
    })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({
        description: 'ID of the user who last modified this tenant',
        example: 'admin456',
    })
    @IsString()
    @IsNotEmpty()
    modifiedBy!: string;
}