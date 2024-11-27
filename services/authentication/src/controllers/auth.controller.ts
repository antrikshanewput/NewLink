import { Controller, Get, Post, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { AuthenticationService } from '../services/authentication.service';
import { Authentication } from '../decorators/auth.decorator';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  async login(@Body() body: Record<string, any>) {
    const authField = this.authenticationService.getAuthenticationField();
    const authValue = body[authField];
    const { password } = body;

    const missingFields: string[] = [];
    if (!authValue) missingFields.push(authField);
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
    }

    const user = await this.authenticationService.validateUser(authValue, password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authenticationService.login(user);
  }

  @Post('register')
  async register(@Body() body: Record<string, any>) {

    const missingFields = this.authenticationService.getRegistrationFields().filter(field => !body[field]);

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
    }

    return this.authenticationService.register(body);
  }
}