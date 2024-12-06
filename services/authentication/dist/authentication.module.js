"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var AuthenticationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_service_1 = require("./services/authentication.service");
const auth_controller_1 = require("./controllers/auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const user_entity_1 = require("./entities/user.entity");
const authentication_type_1 = require("./authentication.type");
const feature_entity_1 = require("./entities/feature.entity");
const role_entity_1 = require("./entities/role.entity");
const group_entity_1 = require("./entities/group.entity");
const tenant_entity_1 = require("./entities/tenant.entity");
const user_tenant_entity_1 = require("./entities/user-tenant.entity");
const authorization_service_1 = require("./services/authorization.service");
const seeder_service_1 = require("./services/seeder.service");
const entities_1 = require("./entities");
let AuthenticationModule = AuthenticationModule_1 = class AuthenticationModule {
    static async resolveConfig(options) {
        const entities = [];
        for (const entity of [user_entity_1.BaseUser, feature_entity_1.Feature, role_entity_1.Role, group_entity_1.Group, tenant_entity_1.Tenant, user_tenant_entity_1.UserTenant]) {
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
        entities.forEach((entity) => {
            const alias = entity.name === 'BaseUser' ? 'User' : entity.name;
            entities_1.EntityRegistry.registerEntity(alias, entity);
        });
        options = Object.assign(Object.assign({}, options), { authenticationField: options.authenticationField || 'email', registrationFields: options.registrationFields || ['email', 'password', 'name'], entities: entities });
        if (!options.hashingStrategy && !options.hashValidation) {
            try {
                const argon2 = await Promise.resolve().then(() => __importStar(require('argon2')));
                options.hashingStrategy = async (password) => await argon2.hash(password);
                options.hashValidation = async (password, encrypted) => await argon2.verify(encrypted, password);
            }
            catch (error) {
                throw new Error('Argon2 module is required for default encryption strategy. Please install it using "npm install argon2".');
            }
        }
        (0, authentication_type_1.validateAuthorizationOptions)(options);
        return options;
    }
    static async resolveDatabaseConfig(database, configService, config) {
        var _a, _b;
        return {
            type: (database.type || configService.get('AUTH_DB_TYPE') || configService.get('DB_TYPE') || 'postgres'),
            host: database.host || configService.get('AUTH_DB_HOST') || configService.get('DB_HOST') || 'localhost',
            port: (database.port || configService.get('AUTH_DB_PORT') || configService.get('DB_PORT') || 5432),
            username: database.username || configService.get('AUTH_DB_USERNAME') || configService.get('DB_USERNAME') || 'postgres',
            password: database.password || configService.get('AUTH_DB_PASSWORD') || configService.get('DB_PASSWORD') || 'postgres',
            database: database.database || configService.get('AUTH_DB_NAME') || configService.get('DB_NAME') || 'postgres',
            entities: config.entities,
            synchronize: (_b = (_a = database.synchronize) !== null && _a !== void 0 ? _a : configService.get('DB_SYNCHRONIZE')) !== null && _b !== void 0 ? _b : false,
        };
    }
    static async register(configuration, db = {}) {
        const config = await this.resolveConfig(configuration);
        const dataSourceToken = (0, typeorm_1.getDataSourceToken)('authenticationDataSource');
        return {
            module: AuthenticationModule_1,
            imports: [
                config_1.ConfigModule.forRoot(),
                passport_1.PassportModule,
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') || '1d' },
                    }),
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    name: 'authenticationDataSource',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (configService) => await this.resolveDatabaseConfig(db, configService, config),
                }),
                typeorm_1.TypeOrmModule.forFeature(config.entities, 'authenticationDataSource'),
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
                authentication_service_1.AuthenticationService,
                authorization_service_1.AuthorizationService,
                seeder_service_1.AuthorizationSeederService,
                jwt_strategy_1.JwtStrategy,
                ...config.entities.map((entity) => ({
                    provide: `${(entity.name === "BaseUser") ? "USER" : entity.name.toUpperCase()}_REPOSITORY`,
                    useFactory: (dataSource) => dataSource.getRepository(entity),
                    inject: [dataSourceToken],
                })),
            ],
            controllers: [auth_controller_1.AuthController],
            exports: [
                authentication_service_1.AuthenticationService,
                authorization_service_1.AuthorizationService
            ],
        };
    }
};
exports.AuthenticationModule = AuthenticationModule;
exports.AuthenticationModule = AuthenticationModule = AuthenticationModule_1 = __decorate([
    (0, common_1.Module)({})
], AuthenticationModule);
//# sourceMappingURL=authentication.module.js.map