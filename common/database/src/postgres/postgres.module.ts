// postgres.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresService } from './postgres.service';

@Global()
@Module({})
export class PostgresModule {
	static register(config: any): DynamicModule {
		// Create base imports
		const imports = [
			ConfigModule.forRoot({ isGlobal: true }),
			TypeOrmModule.forRoot({
				type: config.type,
				host: config.host,
				port: config.port,
				username: config.username,
				password: config.password,
				database: config.database,
				entities: config.entities,
				synchronize: config.synchronize,
				logging: config.logging,
				autoLoadEntities: config.autoLoadEntities,
			}),
		];

		// Add TypeOrmModule.forFeature if entities are provided
		if (config.entities && config.entities.length > 0) {
			imports.push(TypeOrmModule.forFeature(config.entities));
		}

		// Create repository providers
		const repositoryProviders =
			config.entities && config.entities.length > 0
				? config.entities.map((entity) => ({
						provide: `${entity.name.toUpperCase()}_REPOSITORY`,
						useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
						inject: [DataSource],
					}))
				: [];

		return {
			module: PostgresModule,
			imports: imports,
			providers: [
				PostgresService,
				{
					provide: 'DATA_SOURCE',
					useFactory: (dataSource: DataSource) => dataSource,
					inject: [DataSource],
				},
				...repositoryProviders,
			],
			exports: [PostgresService, TypeOrmModule, 'DATA_SOURCE', ...repositoryProviders.map((provider) => provider.provide)],
		};
	}
}
