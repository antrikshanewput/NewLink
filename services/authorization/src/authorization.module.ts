import { Module, DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule, DatabaseOptionsType } from "@newlink/database";
import { DataSource } from "typeorm";

import {
    AuthorizationOptionsType,
    validateAuthorizationOptions,
} from "./authorization.types";

import { Role } from "./entities/role.entity";
import { Feature } from "./entities/feature.entity";
import { UserRole } from "./entities/user-role.entity";
import { UserFeature } from "./entities/user-feature.entity";

import { AuthorizationService } from "./services/authorization.service";
@Module({})
export class AuthorizationModule {
    constructor(
        private readonly dataSource: DataSource,
        private readonly config: AuthorizationOptionsType
    ) {}
    private static async resolveConfig(options: AuthorizationOptionsType): Promise<AuthorizationOptionsType> {
        options.entities = options.entities || [Role, Feature, UserRole, UserFeature];
        validateAuthorizationOptions(options);
        return options;
    }

    private static async resolveDatabaseConfig(database: DatabaseOptionsType, configService: ConfigService, entities: Function[]): Promise<DatabaseOptionsType> {
        return {
            type: (database.type || configService.get<string>("AUTHORIZATION_DB_TYPE") ||"postgres") as DatabaseOptionsType["type"],
            host: database.host || configService.get<string>("AUTHORIZATION_DB_HOST") || "localhost",
            port: database.port || configService.get<number>("AUTHORIZATION_DB_PORT") || 5432,
            username: database.username || configService.get<string>("AUTHORIZATION_DB_USERNAME") || "postgres",
            password: database.password || configService.get<string>("AUTHORIZATION_DB_PASSWORD") || "postgres",
            database: database.database || configService.get<string>("AUTHORIZATION_DB_NAME") || "postgres",
            entities: entities,
            synchronize: database.synchronize ?? configService.get<boolean>("DB_SYNCHRONIZE") ?? false,
        };
    }

    static async register(configuration: AuthorizationOptionsType, db: DatabaseOptionsType): Promise<DynamicModule> {
        const config = await this.resolveConfig(configuration);

        return {
            module: AuthorizationModule,
            imports: [
                ConfigModule.forRoot(),
                DatabaseModule.register(await this.resolveDatabaseConfig(db, new ConfigService(), config.entities!)),
                TypeOrmModule.forFeature(config.entities!),
            ],
            providers: [
                {
                    provide: "AUTHORIZATION_OPTIONS",
                    useValue: config,
                },
            ],
            exports: [AuthorizationService],
        };
    }

    async onApplicationBootstrap() {
        const roleRepository = this.dataSource.getRepository(Role);
        const featureRepository = this.dataSource.getRepository(Feature);


        for (const roleName of this.config.roles || []) {
            const existingRole = await roleRepository.findOne({ where: { name: roleName } });
            if (!existingRole) {
                await roleRepository.save(roleRepository.create({ name: roleName }));
            }
        }


        for (const featureName of this.config.features || []) {
            const existingFeature = await featureRepository.findOne({ where: { name: featureName } });
            if (!existingFeature) {
                await featureRepository.save(featureRepository.create({ name: featureName }));
            }
        }

        for (const permission of this.config.permissions || []) {
            const role = await roleRepository.findOne({ where: { name: permission.role }, relations: ['features'] });
            if (role) {
                for (const featureName of permission.features) {
                const feature = await featureRepository.findOne({ where: { name: featureName } });
                if (feature && !role.features.find((f) => f.id === feature.id)) {
                role.features.push(feature);
                }
            }
            await roleRepository.save(role);
            }
        }
    }
}