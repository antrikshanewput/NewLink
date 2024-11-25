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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
let AuthService = class AuthService {
    constructor(jwtService, options, userRepository) {
        this.jwtService = jwtService;
        this.options = options;
        this.userRepository = userRepository;
    }
    async findUserByAuthField(value) {
        const field = this.options.authenticationField;
        const user = await this.userRepository.findOne({ where: { [field]: value } });
        return user || null;
    }
    async validateUser(authFieldValue, password) {
        const user = await this.findUserByAuthField(authFieldValue);
        if (user && (await this.options.hashValidation(password, user.password))) {
            return user;
        }
        return null;
    }
    async login(user) {
        const payload = { [this.options.authenticationField]: user[this.options.authenticationField], sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: user[this.options.authenticationField],
        };
    }
    async register(userDetails) {
        const encryptedPassword = await this.options.hashingStrategy(userDetails.password);
        const newUser = this.userRepository.create(Object.assign(Object.assign({}, userDetails), { password: encryptedPassword }));
        return await this.userRepository.save(newUser);
    }
    getAuthenticationField() {
        return this.options.authenticationField;
    }
    getRegistrationFields() {
        return this.options.registrationFields;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AUTH_OPTIONS')),
    __param(2, (0, common_1.Inject)('USER_REPOSITORY')),
    __metadata("design:paramtypes", [jwt_1.JwtService, Object, typeorm_1.Repository])
], AuthService);
