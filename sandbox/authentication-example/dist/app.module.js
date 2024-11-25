"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const authentication_1 = require("@newlink/authentication");
const user_entities_1 = require("./entities/user.entities");
const user_controller_1 = require("./user.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            authentication_1.AuthModule.register({
                authenticationField: 'email',
                registrationFields: ['name', 'email', 'phone', 'password', 'username', 'address', 'pincode', 'gender'],
                userEntity: user_entities_1.User,
            }, {
                entities: [user_entities_1.User],
                synchronize: true,
            }),
        ],
        controllers: [user_controller_1.TestController],
    })
], AppModule);
