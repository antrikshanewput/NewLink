import { BadRequestException, Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthenticationService } from 'services/authentication.service';
@Controller('authentication')
export class AuthController {
	static LoginDTO: any;
	static RegisterDTO: any;
	static LoginSmsDto: any;
	static VerifySmsDto: any;

	constructor(
		private readonly authenticationService: AuthenticationService,
		@Inject('LOGIN_DTO') private readonly LoginDTO: any,
		@Inject('REGISTER_DTO') private readonly RegisterDTO: any,
		@Inject('LOGIN_SMS_DTO') private readonly LoginSmsDto: any,
		@Inject('VERIFY_SMS_DTO') private readonly VerifySmsDto: any,
	) {
		AuthController.LoginDTO = LoginDTO;
		AuthController.RegisterDTO = RegisterDTO;
		AuthController.LoginSmsDto = LoginSmsDto;
		AuthController.VerifySmsDto = VerifySmsDto;
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

	@Post('login/sms')
	@ApiBody({ type: () => AuthController.LoginSmsDto })
	@ApiResponse({ status: HttpStatus.OK, description: 'Login SMS sent successfully' })
	async loginWithSms(@Body() body: InstanceType<typeof this.LoginSmsDto>) {
		return this.authenticationService.initiatePhoneLogin(body);
	}

	@Post('login/sms/verify')
	@ApiBody({ type: () => AuthController.VerifySmsDto })
	@ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
	async verifySmsLogin(@Body() body: InstanceType<typeof this.VerifySmsDto>) {
		return this.authenticationService.verifyPhoneLogin(body);
	}

	@Post('register')
	@ApiBody({ type: () => AuthController.RegisterDTO })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully logged in' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid credentials' })
	async register(@Body() body: InstanceType<typeof this.RegisterDTO>) {
		const authField = this.authenticationService.getAuthenticationField();
		body['username'] = body.email.split('@')[0];
		const existingUser = (await this.authenticationService.findUserByAuthField(body[authField])) || (await this.authenticationService.findUserByUsername(body['username']));

		if (existingUser) {
			throw new BadRequestException(`username or ${authField} already exists`);
		}
		return this.authenticationService.register(body);
	}
}
