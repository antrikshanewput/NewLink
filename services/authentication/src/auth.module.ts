import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BaseUser } from './entity/user.entity';
import { DatabaseModule, DatabaseOptionsType } from '@newlink/database';
import { AuthOptionsType } from './auth.types';



@Module({})
export class AuthModule {
  static async resolveConfig(options: AuthOptionsType): Promise<AuthOptionsType> {
    options.authenticationField = options.authenticationField || 'email';
    options.registrationFields = options.registrationFields || ['email', 'password', 'name'];

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

    options.userEntity = options.userEntity || BaseUser;
    return options;
  }

  static async resolveDatabaseConfig(
    database: DatabaseOptionsType,
    configService: ConfigService,
    userEntity: Function
  ): Promise<DatabaseOptionsType> {
    return {
      type: (database.type || configService.get<string>('AUTH_DB_TYPE') || 'postgres') as DatabaseOptionsType['type'],
      host: database.host || configService.get<string>('AUTH_DB_HOST') || 'localhost',
      port: database.port || configService.get<number>('AUTH_DB_PORT') || 5432,
      username: database.username || configService.get<string>('AUTH_DB_USERNAME') || 'postgres',
      password: database.password || configService.get<string>('AUTH_DB_PASSWORD') || 'postgres',
      database: database.database || configService.get<string>('AUTH_DB_NAME') || 'postgres',
      entities: [userEntity],
      synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE') ?? false,
    };
  }

  static async register(configuration: AuthOptionsType, db: DatabaseOptionsType): Promise<DynamicModule> {
    const config = await this.resolveConfig(configuration);
    const userEntity = config.userEntity || BaseUser
    return {
      module: AuthModule,
      imports: [
        ConfigModule.forRoot(), 
        PassportModule, 
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d' },
          }),
        }),
        DatabaseModule.register(await this.resolveDatabaseConfig(db, new ConfigService(), userEntity)),
        TypeOrmModule.forFeature([userEntity]),
      ],
      providers: [
        {
          provide: 'AUTH_OPTIONS',
          useValue: config,
        },
        {
          provide: 'USER_REPOSITORY',
          useFactory: (dataSource: DataSource) => dataSource.getRepository(userEntity),
          inject: [DataSource],
        },
        AuthService,
        JwtStrategy,
      ],
      controllers: [AuthController],
      exports: [AuthService],
    };
  }
}