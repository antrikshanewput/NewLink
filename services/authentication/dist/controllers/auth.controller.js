"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const auth_decorator_1 = require("../decorator/auth.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(body) {
        const authField = this.authService.getAuthenticationField();
        const authValue = body[authField];
        const { password } = body;
        const missingFields = [];
        if (!authValue)
            missingFields.push(authField);
        if (!password)
            missingFields.push('password');
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
        }
        const user = await this.authService.validateUser(authValue, password);
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        return this.authService.login(user);
    }
    async register(body) {
        const missingFields = this.authService.getRegistrationFields().filter(field => !body[field]);
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException(`Missing fields: ${missingFields.join(', ')}`);
        }
        return this.authService.register(body);
    }
    async check(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, auth_decorator_1.Authentication)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "check", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('authentication'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
