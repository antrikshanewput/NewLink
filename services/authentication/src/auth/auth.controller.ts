import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: Record<string, any>) {
    const authField = this.authService.options.authenticationField;
    const authValue = body[authField];
    const { password } = body;

    if (!authValue || !password) {
      throw new BadRequestException('Missing credentials');
    }

    const user = await this.authService.validateUser(authValue, password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: Record<string, any>) {
    return this.authService.register(body);
  }
}