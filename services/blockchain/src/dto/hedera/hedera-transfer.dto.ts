import { IsString, IsNotEmpty, IsNumber, IsPositive, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HederaTransferDto {
    @ApiProperty({
        description: 'Sender account ID',
        example: '0.0.12345',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^0\.0\.\d+$/, { message: 'Invalid account format for "from"' })
    from: string;

    @ApiProperty({
        description: 'Recipient account ID',
        example: '0.0.67890',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^0\.0\.\d+$/, { message: 'Invalid account format for "to"' })
    to: string;

    @ApiProperty({
        description: 'Transaction amount',
        example: 100,
    })
    @IsNumber()
    @IsPositive({ message: 'Amount must be greater than zero' })
    amount: number;

    @ApiProperty({
        description: 'Private key for authorization',
        example: '302e020100300506032b657004220420...',
    })
    @IsString()
    @IsNotEmpty()
    privateKey: string;
}