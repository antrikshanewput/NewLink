import { Controller, Post, Body, HttpStatus, BadRequestException, Inject } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthenticationService } from 'services/authentication.service';



@Controller('authentication')
export class AuthController {
  static LoginDTO: any;
  static RegisterDTO: any;

  constructor(
    private readonly authenticationService: AuthenticationService,
    @Inject('LOGIN_DTO') private readonly LoginDTO: any,
    @Inject('REGISTER_DTO') private readonly RegisterDTO: any,
  ) {
    AuthController.LoginDTO = LoginDTO;
    AuthController.RegisterDTO = RegisterDTO;
  }

  @Post('login')
  @ApiBody({ type: () => AuthController.LoginDTO })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() body: InstanceType<typeof this.LoginDTO>) {
    const user = await this.authenticationService.validateUser(body as typeof this.LoginDTO);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authenticationService.login(user);
  }

  @Post('register')
  @ApiBody({ type: () => AuthController.RegisterDTO })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully logged in' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid credentials' })
  async register(@Body() body: InstanceType<typeof this.RegisterDTO>) {
    const authField = this.authenticationService.getAuthenticationField();
    body['username'] = body.email.split('@')[0];
    const existingUser = await this.authenticationService.findUserByAuthField(body[authField]) || await this.authenticationService.findUserByUsername(body['username']);

    if (existingUser) {
      throw new BadRequestException(`username or ${authField} already exists`);
    }
    return this.authenticationService.register(body);
  }
}

