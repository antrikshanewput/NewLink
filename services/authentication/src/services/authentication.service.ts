import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import { AuthenticationOptionsType } from 'authentication.type';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly jwtService: JwtService,
		@Inject('AUTHENTICATION_OPTIONS') private readonly options: AuthenticationOptionsType,
		@Inject('USER_REPOSITORY') private readonly userRepository: Repository<any>,
		@Inject('OTPVERIFICATION_REPOSITORY') private readonly otpRepository: Repository<any>,
		@Inject('LOGIN_DTO') private readonly LoginDTO: any,
		@Inject('REGISTER_DTO') private readonly RegisterDTO: any,
		@Inject('LOGIN_SMS_DTO') private readonly LoginSmsDto: any,
		@Inject('VERIFY_SMS_DTO') private readonly VerifySmsDto: any,
	) {}

	async findUserByAuthField(value: string): Promise<any | null> {
		const field = this.options.authenticationField!;

		if (value === undefined) {
			return null;
		}

		const user = await this.userRepository.findOne({ where: { [field]: value } });
		return user || null;
	}

	async findUserByUsername(username: string): Promise<any | null> {
		const user = await this.userRepository.findOne({ where: { username } });
		return user || null;
	}

	async validateUser(data: InstanceType<typeof this.LoginDTO>): Promise<any | null> {
		const { password } = data;
		const field = this.options.authenticationField;
		const value = data[field];

		const user = await this.findUserByAuthField(value);

		if (user && (await this.options.hashValidation!(password, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: any): Promise<{ access_token: string; user: string }> {
		const payload = {
			[this.options.authenticationField!]: user[this.options.authenticationField!],
			id: user.id,
		};

		await this.userRepository.update(user.id, { last_login: new Date() });
		return {
			access_token: this.options.private_key !== '' ? this.jwtService.sign(payload, { privateKey: this.options.private_key }) : this.jwtService.sign(payload),
			user: user[this.options.authenticationField!],
		};
	}

	async register(userDetails: InstanceType<typeof this.RegisterDTO>): Promise<any> {
		const encryptedPassword = await this.options.hashingStrategy!(userDetails.password);
		let newUser = this.userRepository.create({ ...userDetails, password: encryptedPassword, username: `user_${userDetails.phone}` });
		newUser = await this.userRepository.save(newUser);

		return await this.login(newUser);
	}
	getAuthenticationField(): string {
		return this.options.authenticationField!;
	}
	getRegistrationFields(): string[] {
		return this.options.registrationFields!;
	}

	private generateOTP(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	async createOrGetUser(phone: string): Promise<any> {
		let user = await this.userRepository.findOne({ where: { phone } });

		if (!user) {
			const password = randomBytes(20).toString('hex');
			const email = `${phone}@temporary.com`;

			user = await this.register({
				phone,
				password,
				email,
				first_name: 'Anonymous',
			});
		}

		return user;
	}

	async initiatePhoneLogin(data: InstanceType<typeof this.LoginSmsDto>): Promise<{ code: string; message: string }> {
		const recentOtp = await this.otpRepository.findOne({
			where: { phone: data.phone },
			order: { createdAt: 'DESC' },
		});

		if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < 60000) {
			throw new BadRequestException('Please wait before requesting another code');
		}

		const code = this.generateOTP();

		await this.otpRepository.save({
			phone: data.phone,
			code,
			type: data.type,
		});

		// TODO: Implement SMS sending logic here
		console.log(`Sending ${data.type}: ${code} to ${data.phone}`);

		return { code: code, message: 'Verification code sent successfully' };
	}

	async verifyPhoneLogin(data: InstanceType<typeof this.VerifySmsDto>): Promise<{ access_token: string; refresh_token: string }> {
		const verification = await this.otpRepository.findOne({
			where: {
				code: data.code,
				type: data.type,
				isVerified: false,
			},
			order: { createdAt: 'DESC' },
		});

		if (!verification) {
			throw new BadRequestException('Invalid code');
		}

		const expiryTime = new Date(verification.createdAt);
		expiryTime.setSeconds(expiryTime.getSeconds() + verification.expiresIn);
		if (expiryTime < new Date()) {
			throw new BadRequestException('Code expired');
		}

		await this.otpRepository.update(verification.id, { isVerified: true });

		const user = await this.createOrGetUser(verification.phone);
		const tokens = await this.login(user);

		return {
			access_token: tokens.access_token,
			refresh_token: await this.generateRefreshToken(user),
		};
	}

	private async generateRefreshToken(user: any): Promise<string> {
		const payload = { sub: user.id };
		return this.jwtService.sign(payload, { expiresIn: '7d' });
	}
}
