import { APP_PIPE } from '@nestjs/core';
import { DynamicModule, Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { EntityRegistry } from 'entities';
import { BaseUser } from 'entities/user.entity';

import { AuthenticationService } from 'services/authentication.service';
import { UserService } from 'services/user.service';

import { AuthController } from 'controllers/auth.controller';
import { UserController } from 'controllers/user.controller';

import { JwtStrategy } from 'strategies/jwt.strategy';

import { DatabaseOptionsType } from 'database.types';
import { AuthenticationOptionsType } from 'authentication.type';

import { DefaultDTO } from 'dto';

@Global()
@Module({})
export class AuthenticationModule {
  static async resolveConfig(options: AuthenticationOptionsType, configService: ConfigService): Promise<AuthenticationOptionsType> {
    const entities = [BaseUser].map((entity) => {
      return (
        options.entities?.find((optionsEntity) => optionsEntity.name === (entity.name === 'BaseUser' ? 'User' : entity.name)) ||
        entity
      );
    });

    entities!.forEach((entity) => {
      const alias = entity.name === 'BaseUser' ? 'User' : entity.name;
      EntityRegistry.registerEntity(alias, entity);
    });


    options.dto = options.dto
      ? DefaultDTO.map(defaultDto => {
        const customDto = options.dto?.find(dto => dto.provide === defaultDto.provide) || defaultDto;
        return { provide: customDto.provide, useValue: customDto.useValue }
      })
      : DefaultDTO;

    options.authenticationField = options.authenticationField || 'email';
    options.private_key = configService.get<string>('JWT_PRIVATE_KEY', '');
    options.public_key = configService.get<string>('JWT_PUBLIC_KEY', '');
    options.token_expiration = configService.get<string>('JWT_EXPIRATION', '1d');
    options.entities = entities;

    if (!options.hashingStrategy && !options.hashValidation) {
      try {
        const argon2 = await import('argon2');
        options.hashingStrategy = async (password: string) => await argon2.hash(password);
        options.hashValidation = async (password: string, encrypted: string) =>
          await argon2.verify(encrypted, password);
      } catch (error) {
        throw new Error(
          'Argon2 module is required for default encryption strategy. Please install it using "npm install argon2".'
        );
      }
    }
    return options;
  }

  static async resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, config: AuthenticationOptionsType): Promise<TypeOrmModuleOptions> {
    return {
      type: (database.type || configService.get<string>('AUTH_DB_TYPE') || configService.get<string>('DB_TYPE', 'postgres')) as DatabaseOptionsType['type'],
      host: database.host || configService.get<string>('AUTH_DB_HOST') || configService.get<string>('DB_HOST', 'localhost'),
      port: (database.port || configService.get<number>('AUTH_DB_PORT') || configService.get<number>('DB_PORT', 5432)) as number,
      username: database.username || configService.get<string>('AUTH_DB_USERNAME') || configService.get<string>('DB_USERNAME', 'postgres'),
      password: database.password || configService.get<string>('AUTH_DB_PASSWORD') || configService.get<string>('DB_PASSWORD', 'postgres'),
      database: database.database || configService.get<string>('AUTH_DB_NAME') || configService.get<string>('DB_NAME', 'postgres'),
      entities: config.entities!,
      synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE', false) ?? false,
      autoLoadEntities: true,
    } as TypeOrmModuleOptions;
  }

  static async register(configuration: AuthenticationOptionsType, db: DatabaseOptionsType = {}): Promise<DynamicModule> {
    const config = await this.resolveConfig(configuration, new ConfigService());

    const imports = [
      ConfigModule.forRoot({ isGlobal: true }),
      PassportModule.register({}),
      JwtModule.registerAsync({

        useFactory: () => ({
          secret: config.private_key,
          publicKey: config.public_key,
          signOptions: { expiresIn: config.token_expiration },
        }),
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) =>
          await this.resolveDatabaseConfig(db, configService, config),
      }),
      TypeOrmModule.forFeature(config.entities!),
    ];

    const providers = [
      {
        provide: 'AUTHENTICATION_OPTIONS',
        useValue: config,
      },
      ...config.entities!.map((entity) => ({
        provide: `${(entity.name === "BaseUser") ? "USER" : entity.name.toUpperCase()}_REPOSITORY`,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
        inject: [DataSource],
      })),
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

    const exports = [AuthenticationService, UserService, TypeOrmModule];

    return {
      module: AuthenticationModule,
      imports: imports,
      providers: providers,
      controllers: controllers,
      exports: exports,
    };
  }
}