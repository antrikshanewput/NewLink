"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./service/email.service");
let NotificationModule = NotificationModule_1 = class NotificationModule {
    static register(options) {
        return {
            module: NotificationModule_1,
            providers: [
                {
                    provide: 'NOTIFICATION_OPTIONS',
                    useValue: options,
                },
                email_service_1.EmailService,
            ],
            exports: [email_service_1.EmailService],
        };
    }
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = NotificationModule_1 = __decorate([
    (0, common_1.Module)({})
], NotificationModule);
