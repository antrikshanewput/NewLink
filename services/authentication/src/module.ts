import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDataSourceToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthenticationService } from './services/authentication.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BaseUser } from './entities/user.entity';
import { DatabaseOptionsType } from './database.types';
import { AuthenticationOptionsType, validateAuthorizationOptions } from './authentication.type';
import { Feature } from './entities/feature.entity';
import { Role } from './entities/role.entity';
import { Group } from './entities/group.entity';
import { Tenant } from './entities/tenant.entity';
import { UserTenant } from './entities/user-tenant.entity';
import { AuthorizationService } from './services/authorization.service';
import { AuthorizationSeederService } from './services/seeder.service';
import { EntityRegistry } from './entities';
import { AuthorizationModule } from '@newlink/authorization';
@Module({})
export class AuthenticationModule {
  static async resolveConfig(options: AuthenticationOptionsType): Promise<AuthenticationOptionsType> {
    const entities = []
    for (const entity of [BaseUser, Feature, Role, Group, Tenant, UserTenant]) {
      let found = false;
      let name = (entity.name === 'BaseUser') ? 'User' : entity.name;
      for (const options_entity of options.entities || []) {
        if (name === options_entity.name) {
          entities.push(options_entity);
          found = true;
          break;
        }
      }
      if (!found) {
        entities.push(entity);
      }
    }

    entities!.forEach((entity) => {
      const alias = entity.name === 'BaseUser' ? 'User' : entity.name;
      EntityRegistry.registerEntity(alias, entity);
    });

    options = {
      ...options,
      authenticationField: options.authenticationField || 'email',
      registrationFields: options.registrationFields || ['email', 'password', 'name'],
      entities: entities,
    };

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

    validateAuthorizationOptions(options);
    return options;
  }

  static async resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, config: AuthenticationOptionsType): Promise<TypeOrmModuleOptions> {
    return {
      type: (database.type || configService.get<string>('AUTH_DB_TYPE') || configService.get<string>('DB_TYPE') || 'postgres') as DatabaseOptionsType['type'],
      host: database.host || configService.get<string>('AUTH_DB_HOST') || configService.get<string>('DB_HOST') || 'localhost',
      port: (database.port || configService.get<number>('AUTH_DB_PORT') || configService.get<string>('DB_PORT') || 5432) as number,
      username: database.username || configService.get<string>('AUTH_DB_USERNAME') || configService.get<string>('DB_USERNAME') || 'postgres',
      password: database.password || configService.get<string>('AUTH_DB_PASSWORD') || configService.get<string>('DB_PASSWORD') || 'postgres',
      database: database.database || configService.get<string>('AUTH_DB_NAME') || configService.get<string>('DB_NAME') || 'postgres',
      entities: config.entities!,
      synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE') ?? false,
    } as TypeOrmModuleOptions;
  }

  static async register(configuration: AuthenticationOptionsType, db: DatabaseOptionsType = {}): Promise<DynamicModule> {
    const config = await this.resolveConfig(configuration);
    const dataSourceToken = getDataSourceToken('authenticationDataSource');


    return {
      module: AuthenticationModule,
      imports: [
        ConfigModule.forRoot(),
        PassportModule,
        AuthorizationModule.register(),
        TypeOrmModule.forRootAsync({
          name: 'authenticationDataSource',
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) =>
            await this.resolveDatabaseConfig(db, configService, config),
        }),
        TypeOrmModule.forFeature(config.entities!, 'authenticationDataSource'),
      ],
      providers: [
        {
          provide: 'AUTHENTICATION_OPTIONS',
          useValue: config,
        },
        {
          provide: 'AUTHENTICATION_DATA_SOURCE',
          useExisting: dataSourceToken,
        },
        AuthenticationService,
        AuthorizationService,
        AuthorizationSeederService,
        JwtStrategy,
        ...config.entities!.map((entity) => ({
          provide: `${(entity.name === "BaseUser") ? "USER" : entity.name.toUpperCase()}_REPOSITORY`,
          useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
          inject: [dataSourceToken],
        })),
      ],
      controllers: [AuthController],
      exports: [
        AuthenticationService,
        AuthorizationService,
        AuthorizationModule
      ],
    };
  }
}