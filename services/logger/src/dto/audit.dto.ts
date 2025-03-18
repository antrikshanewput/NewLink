import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class AuditDto {
	@ApiProperty({ description: 'Please provide valid changed body' })
	@IsObject()
  @IsOptional()
	oldData: object;

  @ApiProperty({ description: 'Please provide valid changed body' })
	@IsObject()
  @IsOptional()
	newData: object;

  @ApiProperty({ description: 'Please provider valid action' })
	@IsString()
  @IsNotEmpty()
	action: string;

  @ApiProperty({ description: 'Please provider valid tableName' })
	@IsString()
  @IsNotEmpty()
	tableName: string;
}
