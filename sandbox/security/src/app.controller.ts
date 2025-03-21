import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { SqlInjectionPipe } from '@newput-newlink/security';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('secure')
  @UsePipes(SqlInjectionPipe) // Another way of calling the security measure
  getHello(@Query() query: any): string {
    return this.appService.getQueryData(query);
  }

  @Post('secure')
  @UsePipes(SqlInjectionPipe)
  getBody(@Body() body: any): string {
    return this.appService.getBodyData(body);
  }
}
