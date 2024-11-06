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
// Export the main AuthModule
__exportStar(require("./auth/auth.module"), exports);
// Export controllers, services, guards, and strategies if users want to access them directly
__exportStar(require("./auth/auth.controller"), exports);
__exportStar(require("./auth/auth.service"), exports);
__exportStar(require("./auth/jwt-auth.guard"), exports);
__exportStar(require("./auth/jwt.strategy"), exports);
// Export the User entity for use in other modules or to extend the model
__exportStar(require("./auth/user.entity"), exports);
