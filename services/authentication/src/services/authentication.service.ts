import { BadRequestException, Inject, Injectable, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongoService, PostgresService } from '@newput-newlink/database';
import { AuthenticationOptionsType } from 'authentication.type';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class AuthenticationService {
	private dbType: 'postgres' | 'mongodb';
	private userModel: string = 'User';
	private otpModel: string = 'OtpVerification';

	constructor(
		private readonly jwtService: JwtService,
		@Inject('AUTHENTICATION_OPTIONS') private readonly options: AuthenticationOptionsType,
		@Inject('LOGIN_DTO') private readonly LoginDTO: any,
		@Inject('REGISTER_DTO') private readonly RegisterDTO: any,
		@Inject('LOGIN_SMS_DTO') private readonly LoginSmsDto: any,
		@Inject('VERIFY_SMS_DTO') private readonly VerifySmsDto: any,
		@Optional() @Inject('USER_REPOSITORY') private readonly userRepository?: Repository<any>,
		@Optional() @Inject('OTPVERIFICATION_REPOSITORY') private readonly otpRepository?: Repository<any>,
		@Optional() private readonly mongoService?: MongoService,
		@Optional() private readonly postgresService?: PostgresService,
	) {
		// Determine database type based on which service is available
		this.dbType = this.mongoService ? 'mongodb' : 'postgres';
	}

	async findUserByAuthField(value: string): Promise<any | null> {
		const field = this.options.authenticationField!;

		if (value === undefined) {
			return null;
		}

		if (this.dbType === 'postgres' && this.userRepository) {
			return this.userRepository.findOne({ where: { [field]: value } });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			return this.mongoService.findOne(this.userModel, { [field]: value });
		}

		return null;
	}

	async findUserByUsername(username: string): Promise<any | null> {
		if (this.dbType === 'postgres' && this.userRepository) {
			return this.userRepository.findOne({ where: { username } });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			return this.mongoService.findOne(this.userModel, { username });
		}

		return null;
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
		user = this.dbType === 'mongodb' ? user._doc || user : user;

		console.log('user', user);
		const payload = {
			[this.options.authenticationField!]: user[this.options.authenticationField!],
			id: user.id || user._id,
		};

		// Update last login
		if (this.dbType === 'postgres' && this.userRepository) {
			await this.userRepository.update(user.id, { last_login: new Date() });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			await this.mongoService.updateOne(this.userModel, { _id: user.id || user._id }, { $set: { last_login: new Date() } });
		}

		return {
			access_token: this.options.private_key !== '' ? this.jwtService.sign(payload, { privateKey: this.options.private_key }) : this.jwtService.sign(payload),
			user: user[this.options.authenticationField!],
		};
	}

	async register(userDetails: InstanceType<typeof this.RegisterDTO>): Promise<any> {
		const encryptedPassword = await this.options.hashingStrategy!(userDetails.password);
		const userData = {
			...userDetails,
			password: encryptedPassword,
			username: `user_${userDetails.phone}`,
		};

		let newUser;

		if (this.dbType === 'postgres' && this.userRepository) {
			newUser = this.userRepository.create(userData);
			newUser = await this.userRepository.save(newUser);
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			newUser = await this.mongoService.create(this.userModel, userData);
		}

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
		let user;

		if (this.dbType === 'postgres' && this.userRepository) {
			user = await this.userRepository.findOne({ where: { phone } });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			user = await this.mongoService.findOne(this.userModel, { phone });
		}

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
		let recentOtp;

		if (this.dbType === 'postgres' && this.otpRepository) {
			recentOtp = await this.otpRepository.findOne({
				where: { phone: data.phone },
				order: { createdAt: 'DESC' },
			});
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			const otps = await this.mongoService.find(this.otpModel, { phone: data.phone }, {}, { sort: { createdAt: -1 }, limit: 1 });
			recentOtp = otps[0] || null;
		}

		if (recentOtp && Date.now() - new Date(recentOtp.createdAt).getTime() < 60000) {
			throw new BadRequestException('Please wait before requesting another code');
		}

		const code = this.generateOTP();
		const otpData = {
			phone: data.phone,
			code,
			type: data.type,
			createdAt: new Date(),
			expiresIn: 300, // 5 minutes
			isVerified: false,
		};

		if (this.dbType === 'postgres' && this.otpRepository) {
			await this.otpRepository.save(otpData);
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			await this.mongoService.create(this.otpModel, otpData);
		}

		// TODO: Implement SMS sending logic here
		console.log(`Sending ${data.type}: ${code} to ${data.phone}`);

		return { code: code, message: 'Verification code sent successfully' };
	}

	async verifyPhoneLogin(data: InstanceType<typeof this.VerifySmsDto>): Promise<{ access_token: string; refresh_token: string }> {
		let verification;

		if (this.dbType === 'postgres' && this.otpRepository) {
			verification = await this.otpRepository.findOne({
				where: {
					code: data.code,
					type: data.type,
					isVerified: false,
				},
				order: { createdAt: 'DESC' },
			});
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			const verifications = await this.mongoService.find(
				this.otpModel,
				{
					code: data.code,
					type: data.type,
					isVerified: false,
				},
				{},
				{ sort: { createdAt: -1 }, limit: 1 },
			);
			verification = verifications[0] || null;
		}

		if (!verification) {
			throw new BadRequestException('Invalid code');
		}

		const expiryTime = new Date(verification.createdAt);
		expiryTime.setSeconds(expiryTime.getSeconds() + verification.expiresIn);
		if (expiryTime < new Date()) {
			throw new BadRequestException('Code expired');
		}

		if (this.dbType === 'postgres' && this.otpRepository) {
			await this.otpRepository.update(verification.id, { isVerified: true });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			await this.mongoService.updateOne(this.otpModel, { _id: verification.id || verification._id }, { $set: { isVerified: true } });
		}

		const user = await this.createOrGetUser(verification.phone);
		const tokens = await this.login(user);

		return {
			access_token: tokens.access_token,
			refresh_token: await this.generateRefreshToken(user),
		};
	}

	private async generateRefreshToken(user: any): Promise<string> {
		const payload = { sub: user.id || user._id };
		return this.jwtService.sign(payload, { expiresIn: '7d' });
	}
}
