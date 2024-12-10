"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = Authentication;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
function Authentication() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard));
}
//# sourceMappingURL=auth.decorator.js.map