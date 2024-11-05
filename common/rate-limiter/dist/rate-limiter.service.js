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
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RateLimiterService = class RateLimiterService {
    constructor(configService) {
        this.configService = configService;
    }
    /**
     * Returns custom throttle options for specific routes or controllers.
     * @param limit - Maximum number of requests.
     * @param ttl - Time-to-live (TTL) in seconds for rate limiting.
     * @returns ThrottlerModuleOptions with custom settings.
     */
    getCustomThrottleOptions(limit, ttl) {
        return {
            throttlers: [
                {
                    ttl,
                    limit,
                },
            ],
        };
    }
    /**
     * Returns default rate limiting options.
     * This could be configured to fetch environment-based defaults if needed.
     * @returns Default ThrottlerModuleOptions.
     */
    getDefaultRateLimitOptions() {
        return {
            throttlers: [
                {
                    ttl: this.configService.get('RATE_LIMIT_TTL', 60),
                    limit: this.configService.get('RATE_LIMIT_LIMIT', 10),
                }
            ]
        };
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RateLimiterService);
