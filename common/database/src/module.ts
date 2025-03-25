// database.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseOptionsType } from './database.types';
import { MongoModule } from './mongo/mongo.module';
import { PostgresModule } from './postgres/postgres.module';

@Module({})
export class DatabaseModule {
	static resolveConfig(database: DatabaseOptionsType, configService: ConfigService): any {
		const dbType = database.type || configService.get<string>('DB_TYPE') || 'postgres';

		const config = {
			type: dbType,
			host: database.host || configService.get<string>('DB_HOST') || 'localhost',
			port: (database.port || configService.get<number>('DB_PORT') || (dbType === 'mongodb' ? 27017 : 5432)) as number,
			username: database.username || configService.get<string>('DB_USERNAME') || (dbType === 'mongodb' ? '' : 'postgres'),
			password: database.password || configService.get<string>('DB_PASSWORD') || (dbType === 'mongodb' ? '' : 'postgres'),
			database: database.database || configService.get<string>('DB_NAME') || (dbType === 'mongodb' ? 'test' : 'postgres'),
			synchronize: database.synchronize ?? configService.get<boolean>('DB_SYNCHRONIZE', false) ?? false,
			logging: database.logging ?? configService.get<boolean>('DB_LOGGING', false) ?? false,
			autoLoadEntities: true,
			entities: database.entities || [],
		};

		if (dbType === 'mongodb') {
			const auth = config.username && config.password ? `${config.username}:${config.password}@` : '';
			config['uri'] = database.uri || configService.get<string>('DB_URI') || `mongodb://${auth}${config.host}:${config.port}/${config.database}`;
		}

		return config;
	}

	static register(configuration: DatabaseOptionsType = {}, entities: any[] = []): DynamicModule {
		const config = this.resolveConfig(configuration, new ConfigService());

		if (entities && entities.length > 0) {
			config.entities = [...(config.entities || []), ...entities];
		}

		switch (config.type) {
			case 'mongodb':
				return MongoModule.register(config);
			case 'postgres':
				return PostgresModule.register(config);
			default:
				throw new Error(`Database type ${config.type} not supported`);
		}
	}

	// Add a forFeature method that can be used separately
	static forFeature(entities: any[]): DynamicModule {
		return {
			module: DatabaseModule,
			providers: entities.map((entity) => ({
				provide: `${entity.name.toUpperCase()}_REPOSITORY`,
				useFactory: (dataSource: any) => dataSource.getRepository(entity),
				inject: ['DATA_SOURCE'],
			})),
			exports: entities.map((entity) => `${entity.name.toUpperCase()}_REPOSITORY`),
		};
	}
}
