import { Inject, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { MongoService } from '@newput-newlink/database';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private dbType: 'postgres' | 'mongodb';
	private userModel: string = 'User';

	constructor(
		configService: ConfigService,
		@Optional() @Inject('USER_REPOSITORY') private readonly userRepository?: Repository<any>,
		@Optional() private readonly mongoService?: MongoService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET'),
		});

		// Determine which database type to use based on available services
		this.dbType = this.mongoService ? 'mongodb' : 'postgres';
	}

	async validate(payload: any) {
		console.log('JWT Payload:', payload);

		let user;

		// Get user by ID from the appropriate database
		if (this.dbType === 'postgres' && this.userRepository) {
			user = await this.userRepository.findOne({ where: { id: payload.id } });
		} else if (this.dbType === 'mongodb' && this.mongoService) {
			if (payload.id && payload.id.length === 24 && /^[0-9a-fA-F]{24}$/.test(payload.id)) {
				user = await this.mongoService.findOne(this.userModel, { _id: payload.id });
			} else {
				user = await this.mongoService.findOne(this.userModel, { id: payload.id });
			}
		}

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
