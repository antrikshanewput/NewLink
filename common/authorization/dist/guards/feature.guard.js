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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const feature_decorator_1 = require("../decorators/feature.decorator");
const jwt_1 = require("@nestjs/jwt");
let FeatureGuard = class FeatureGuard {
    constructor(reflector, jwtService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        var _a;
        const requiredFeatures = this.reflector.getAllAndOverride(feature_decorator_1.FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!(requiredFeatures === null || requiredFeatures === void 0 ? void 0 : requiredFeatures.length)) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const tenantId = request.headers['tenant'];
        if (!tenantId) {
            throw new common_1.ForbiddenException('Tenant not provided in header');
        }
        if (!authHeader) {
            throw new common_1.ForbiddenException('Authorization header not provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new common_1.ForbiddenException('Token not provided in authorization header');
        }
        try {
            const payload = this.jwtService.verify(token);
            const features = ((_a = payload.permissions) === null || _a === void 0 ? void 0 : _a[tenantId]) || [];
            const hasRequiredFeature = requiredFeatures.some(feature => features.includes(feature));
            if (!hasRequiredFeature) {
                throw new common_1.ForbiddenException(`Access denied. Required feature(s): ${requiredFeatures.join(', ')}`);
            }
            return true;
        }
        catch (error) {
            throw new common_1.ForbiddenException('Invalid or expired token');
        }
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService])
], FeatureGuard);
//# sourceMappingURL=feature.guard.js.map