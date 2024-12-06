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
exports.AuthorizationSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AuthorizationSeederService = class AuthorizationSeederService {
    constructor(config, roleRepository, featureRepository) {
        this.config = config;
        this.roleRepository = roleRepository;
        this.featureRepository = featureRepository;
    }
    async onApplicationBootstrap() {
        for (const roleName of this.config.roles || []) {
            const existingRole = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!existingRole) {
                await this.roleRepository.save(this.roleRepository.create({ name: roleName }));
            }
        }
        for (const featureName of this.config.features || []) {
            const existingFeature = await this.featureRepository.findOne({ where: { name: featureName } });
            if (!existingFeature) {
                await this.featureRepository.save(this.featureRepository.create({ name: featureName }));
            }
        }
        for (const permission of this.config.permissions || []) {
            const role = await this.roleRepository.findOne({
                where: { name: permission.role },
                relations: ['features'],
            });
            if (role) {
                for (const featureName of permission.features) {
                    const feature = await this.featureRepository.findOne({ where: { name: featureName } });
                    if (feature && !role.features.find((f) => f.id === feature.id)) {
                        role.features.push(feature);
                    }
                }
                await this.roleRepository.save(role);
            }
        }
    }
};
exports.AuthorizationSeederService = AuthorizationSeederService;
exports.AuthorizationSeederService = AuthorizationSeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('AUTHENTICATION_OPTIONS')),
    __param(1, (0, common_1.Inject)('ROLE_REPOSITORY')),
    __param(2, (0, common_1.Inject)('FEATURE_REPOSITORY')),
    __metadata("design:paramtypes", [Object, typeorm_1.Repository,
        typeorm_1.Repository])
], AuthorizationSeederService);
//# sourceMappingURL=seeder.service.js.map