"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_KEY = void 0;
exports.Role = Role;
const common_1 = require("@nestjs/common");
const role_guard_1 = require("../guards/role.guard");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
exports.ROLE_KEY = 'roles';
function Role(...roles) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.ROLE_KEY, roles), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard));
}
