"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthorizationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_service_1 = require("./jwt/jwt.service");
let AuthorizationModule = AuthorizationModule_1 = class AuthorizationModule {
    static register() {
        return {
            module: AuthorizationModule_1,
            imports: [
                config_1.ConfigModule.forRoot(),
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        secret: configService.get('JWT_SECRET') || 'default-secret',
                        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') || '1d' },
                    }),
                }),
            ],
            providers: [jwt_service_1.JwtServiceWrapper],
            exports: [jwt_service_1.JwtServiceWrapper, jwt_1.JwtModule],
        };
    }
};
exports.AuthorizationModule = AuthorizationModule;
exports.AuthorizationModule = AuthorizationModule = AuthorizationModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], AuthorizationModule);
//# sourceMappingURL=module.js.map