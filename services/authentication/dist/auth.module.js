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
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_service_1 = require("./services/auth.service");
const auth_controller_1 = require("./controllers/auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const user_entity_1 = require("./entity/user.entity");
const database_1 = require("@newlink/database");
let AuthModule = AuthModule_1 = class AuthModule {
    static async resolveConfig(options) {
        options.authenticationField = options.authenticationField || 'email';
        options.registrationFields = options.registrationFields || ['email', 'password', 'name'];
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
        options.userEntity = options.userEntity || user_entity_1.BaseUser;
        return options;
    }
    static async resolveDatabaseConfig(database, configService, userEntity) {
        var _a, _b;
        return {
            type: (database.type || configService.get('AUTH_DB_TYPE') || 'postgres'),
            host: database.host || configService.get('AUTH_DB_HOST') || 'localhost',
            port: database.port || configService.get('AUTH_DB_PORT') || 5432,
            username: database.username || configService.get('AUTH_DB_USERNAME') || 'postgres',
            password: database.password || configService.get('AUTH_DB_PASSWORD') || 'postgres',
            database: database.database || configService.get('AUTH_DB_NAME') || 'postgres',
            entities: [userEntity],
            synchronize: (_b = (_a = database.synchronize) !== null && _a !== void 0 ? _a : configService.get('DB_SYNCHRONIZE')) !== null && _b !== void 0 ? _b : false,
        };
    }
    static async register(configuration, db) {
        const config = await this.resolveConfig(configuration);
        const userEntity = config.userEntity || user_entity_1.BaseUser;
        return {
            module: AuthModule_1,
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
                database_1.DatabaseModule.register(await this.resolveDatabaseConfig(db, new config_1.ConfigService(), userEntity)),
                typeorm_1.TypeOrmModule.forFeature([userEntity]),
            ],
            providers: [
                {
                    provide: 'AUTH_OPTIONS',
                    useValue: config,
                },
                {
                    provide: 'USER_REPOSITORY',
                    useFactory: (dataSource) => dataSource.getRepository(userEntity),
                    inject: [typeorm_2.DataSource],
                },
                auth_service_1.AuthService,
                jwt_strategy_1.JwtStrategy,
            ],
            controllers: [auth_controller_1.AuthController],
            exports: [auth_service_1.AuthService],
        };
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = AuthModule_1 = __decorate([
    (0, common_1.Module)({})
], AuthModule);
