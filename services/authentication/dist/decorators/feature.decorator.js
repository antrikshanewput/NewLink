"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_KEY = void 0;
exports.Feature = Feature;
const common_1 = require("@nestjs/common");
const feature_guard_1 = require("../guards/feature.guard");
exports.FEATURE_KEY = 'features';
function Feature(...features) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.FEATURE_KEY, features), (0, common_1.UseGuards)(feature_guard_1.FeatureGuard));
}
