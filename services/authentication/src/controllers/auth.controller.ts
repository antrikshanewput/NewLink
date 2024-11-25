import { Controller, Get, Post, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Authentication } from '../decorator/auth.decorator';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: Record<string, any>) {
    const authField = this.authService.getAuthenticationField();
    const authValue = body[authField];
    const { password } = body;

    const missingFields: string[] = [];
    if (!authValue) missingFields.push(authField);
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
    }

    const user = await this.authService.validateUser(authValue, password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: Record<string, any>) {

    const missingFields = this.authService.getRegistrationFields().filter(field => !body[field]);

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
    }

    return this.authService.register(body);
  }

  @Get('check')
  @Authentication()
  async check(@Req() req: any) {
    return req.user;
  }
}