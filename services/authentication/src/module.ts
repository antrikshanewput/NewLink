// authentication.module.ts
import { DynamicModule, Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EntityRegistry } from 'entities';
import { OtpVerification } from 'entities/otp-verification.entity';
import { User } from 'entities/user.entity';
import { AuthenticationService } from 'services/authentication.service';
import { UserService } from 'services/user.service';

import { AuthController } from 'controllers/auth.controller';
import { UserController } from 'controllers/user.controller';

import { JwtStrategy } from 'strategies/jwt.strategy';

import { AuthenticationOptionsType } from 'authentication.type';
import { DatabaseOptionsType } from 'database.types';

import { DefaultDTO } from 'dto';

import { DatabaseModule } from '@newput-newlink/database';

@Global()
@Module({})
export class AuthenticationModule {
	static async resolveConfig(options: AuthenticationOptionsType, configService: ConfigService): Promise<AuthenticationOptionsType> {
		const entities = [User, OtpVerification].map((entity) => {
			return options.entities?.find((optionsEntity) => optionsEntity.name === entity.name) || entity;
		});

		entities!.forEach((entity) => {
			EntityRegistry.registerEntity(entity.name, entity);
		});

		options.dto = options.dto
			? DefaultDTO.map((defaultDto) => {
					const customDto = options.dto?.find((dto) => dto.provide === defaultDto.provide) || defaultDto;
					return { provide: customDto.provide, useValue: customDto.useValue };
				})
			: DefaultDTO;

		options.authenticationField = options.authenticationField || 'email';
		options.private_key = options.private_key || configService.get<string>('JWT_SECRET', '');
		options.token_expiration = options.token_expiration || configService.get<string>('JWT_EXPIRATION', '1d');
		options.entities = entities;

		if (!options.hashingStrategy && !options.hashValidation) {
			try {
				const argon2 = await import('argon2');
				options.hashingStrategy = async (password: string) => await argon2.hash(password);
				options.hashValidation = async (password: string, encrypted: string) => await argon2.verify(encrypted, password);
			} catch (error) {
				throw new Error('Argon2 module is required for default encryption strategy. Please install it using "npm install argon2".');
			}
		}
		return options;
	}

	static async register(configuration: AuthenticationOptionsType, database: DatabaseOptionsType = {}): Promise<DynamicModule> {
		const config = await this.resolveConfig(configuration, new ConfigService());
		// Create a database module dynamically
		const databaseModule = DatabaseModule.register(database, config.entities);

		const imports = [
			ConfigModule.forRoot({ isGlobal: true }),
			PassportModule.register({}),
			JwtModule.registerAsync({
				useFactory: () => ({
					secret: config.private_key,
					signOptions: { expiresIn: Number(config.token_expiration) },
				}),
			}),
			databaseModule,
		];

		// Base providers that are needed regardless of database type
		const providers = [
			{
				provide: 'AUTHENTICATION_OPTIONS',
				useValue: config,
			},
			{
				provide: APP_PIPE,
				useFactory: () => {
					return new ValidationPipe({
						whitelist: true,
						transform: true,
						forbidNonWhitelisted: true,
						transformOptions: {
							enableImplicitConversion: true,
						},
					});
				},
			},
			...config.dto,
			AuthenticationService,
			UserService,
			JwtStrategy,
		];

		const controllers = [AuthController, UserController];
		const exports = [AuthenticationService, UserService];

		return {
			module: AuthenticationModule,
			imports: imports,
			providers: providers,
			controllers: controllers,
			exports: exports,
		};
	}
}
