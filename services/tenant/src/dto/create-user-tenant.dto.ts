import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserTenantDto {
    @ApiProperty({
        description: 'ID of the user',
        example: 1,
    })
    @IsNotEmpty()
    userId!: number;

    @ApiProperty({
        description: 'ID of the tenant',
        example: 'tenant-uuid',
    })
    @IsNotEmpty()
    tenantId!: string;

    @ApiProperty({
        description: 'ID of the role',
        example: 'role-uuid',
    })
    @IsNotEmpty()
    roleId!: string;
}