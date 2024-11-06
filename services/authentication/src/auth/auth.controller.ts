import { Controller, Get, Post, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: Record<string, any>) {
    const authField = this.authService.options.authenticationField;
    const authValue = body[authField];
    const { password } = body;

    // Collect missing fields
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
    // List required fields for registration
    const requiredFields = this.authService.options.registrationFields;
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
    }

    return this.authService.register(body);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(@Req() req: any) {
    return req.user;
  }
}