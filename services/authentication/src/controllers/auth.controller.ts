import { Controller, Get, Post, Body, BadRequestException, Inject } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { AuthenticationService } from '../services/authentication.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from 'dto/login.dto';
import { RegisterDto } from 'dto/register.dto';


@Controller('authentication')
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    const user = await this.authenticationService.validateUser(body as LoginDto);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authenticationService.login(user);
  }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully logged in' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid credentials' })
  async register(@Body() body: RegisterDto) {
    const authField = this.authenticationService.getAuthenticationField();
    body['username'] = body.email.split('@')[0];
    const existingUser = await this.authenticationService.findUserByAuthField(body[authField]) || await this.authenticationService.findUserByUsername(body['username']);

    if (existingUser) {
      throw new BadRequestException(`username or ${authField} already exists`);
    }
    return this.authenticationService.register(body);
  }
}

