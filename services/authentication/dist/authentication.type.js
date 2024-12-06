"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthorizationOptions = validateAuthorizationOptions;
function validateAuthorizationOptions(options) {
    const { roles, features, permissions } = options;
    permissions.forEach(({ role }) => {
        if (!roles.includes(role)) {
            throw new Error(`Role "${role}" in permissions is not defined in roles.`);
        }
    });
    permissions.forEach(({ role, features: roleFeatures }) => {
        roleFeatures.forEach((feature) => {
            if (!features.includes(feature)) {
                throw new Error(`Feature "${feature}" in permissions for role "${role}" is not defined in features.`);
            }
        });
    });
}
//# sourceMappingURL=authentication.type.js.map