import { Controller, Get } from '@nestjs/common';
import { Role } from '@newlink/authorization';

@Controller()
export class AppController {

  @Get()
  @Role('Admin')
  getHello(): { message: string } {
    return { 'message': 'Hello World!!' };
  }
}
