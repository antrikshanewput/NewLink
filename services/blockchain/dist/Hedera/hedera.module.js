"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HederaModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaModule = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("./services/hedera.service");
const hedera_controller_1 = require("./controllers/hedera.controller");
let HederaModule = HederaModule_1 = class HederaModule {
    static async register() {
        return {
            module: HederaModule_1,
            providers: [hedera_service_1.HederaService],
            controllers: [hedera_controller_1.HederaController],
            exports: [hedera_service_1.HederaService],
        };
    }
};
exports.HederaModule = HederaModule;
exports.HederaModule = HederaModule = HederaModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [hedera_service_1.HederaService],
        exports: [hedera_service_1.HederaService],
    })
], HederaModule);
