import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [ConfigModule, CommonModule, UserModule, BlockchainModule],
})
export class FacadeModule { }