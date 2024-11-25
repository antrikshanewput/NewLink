"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static register(database) {
        return {
            module: DatabaseModule_1,
            imports: [
                config_1.ConfigModule.forRoot(),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => {
                        var _a, _b, _c, _d;
                        return {
                            type: (database.type || configService.get('DB_TYPE') || 'postgres'),
                            host: database.host || configService.get('DB_HOST') || 'localhost',
                            port: database.port || configService.get('DB_PORT') || 5432,
                            username: database.username || configService.get('DB_USERNAME') || 'postgres',
                            password: database.password || configService.get('DB_PASSWORD') || 'postgres',
                            database: database.database || configService.get('DB_NAME') || 'postgres',
                            synchronize: (_b = (_a = database.synchronize) !== null && _a !== void 0 ? _a : configService.get('DB_SYNC')) !== null && _b !== void 0 ? _b : false,
                            entities: database.entities || [],
                            logging: (_d = (_c = database.logging) !== null && _c !== void 0 ? _c : configService.get('DB_LOGGING')) !== null && _d !== void 0 ? _d : false,
                        };
                    },
                }),
            ],
        };
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);
