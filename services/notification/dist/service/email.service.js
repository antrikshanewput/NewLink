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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const client_ses_1 = require("@aws-sdk/client-ses");
let EmailService = EmailService_1 = class EmailService {
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(EmailService_1.name);
        const { region, accessKeyId, secretAccessKey, emailFrom } = this.options;
        this.sesClient = new client_ses_1.SESClient({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.emailFrom = emailFrom;
    }
    async sendEmail(to, subject, body) {
        const params = {
            Source: this.emailFrom,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Html: {
                        Data: body,
                    },
                },
            },
        };
        try {
            const command = new client_ses_1.SendEmailCommand(params);
            const response = await this.sesClient.send(command);
            this.logger.log(`Email sent successfully: ${JSON.stringify(response)}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error}`);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('NOTIFICATION_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], EmailService);
