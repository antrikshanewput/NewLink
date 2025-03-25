import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoService } from './mongo.service';

@Global()
@Module({})
export class MongoModule {
	static register(config: any): DynamicModule {
		return {
			module: MongoModule,
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				MongooseModule.forRoot(config.uri),
				...(config.entities && config.entities.length > 0
					? [
							MongooseModule.forFeature(
								config.entities.map((entity) => {
									if (entity.schema) {
										return {
											name: entity.schemaName || entity.constructor.name,
											schema: entity.schema,
										};
									}
									return entity;
								}),
							),
						]
					: []),
			],
			providers: [MongoService],
			exports: [MongoService, MongooseModule],
		};
	}
}
