"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationModule = exports.Feature = exports.Role = void 0;
var role_decorator_1 = require("./decorators/role.decorator");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return role_decorator_1.Role; } });
var feature_decorator_1 = require("./decorators/feature.decorator");
Object.defineProperty(exports, "Feature", { enumerable: true, get: function () { return feature_decorator_1.Feature; } });
__exportStar(require("./guards/role.guard"), exports);
__exportStar(require("./guards/feature.guard"), exports);
var module_1 = require("./module");
Object.defineProperty(exports, "AuthorizationModule", { enumerable: true, get: function () { return module_1.AuthorizationModule; } });
//# sourceMappingURL=index.js.map