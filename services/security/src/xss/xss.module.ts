import { Module, Global } from '@nestjs/common';
import { XssService } from './xss.service';
import { XssPipe } from './xss.pipe';

@Global()
@Module({
  providers: [XssService, XssPipe],
  exports: [XssService, XssPipe],
})
export class XssModule {}
