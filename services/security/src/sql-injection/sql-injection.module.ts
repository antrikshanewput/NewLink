import { Module } from '@nestjs/common';
import { SqlInjectionService } from './sql-injection.service';
import { SqlInjectionPipe } from './sql-injection.pipe';

@Module({
  providers: [SqlInjectionService, SqlInjectionPipe],
  controllers: [SqlInjectionPipe]
})
export class SqlInjectionModule {}
