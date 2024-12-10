import { Inject, Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly sesClient: SESClient;
    private readonly emailFrom: string;

    constructor(
        @Inject('NOTIFICATION_OPTIONS') private readonly options: any,
    ) {
        const { region, accessKeyId, secretAccessKey, emailFrom } = this.options;

        this.sesClient = new SESClient({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.emailFrom = emailFrom;
    }

    /**
     * Sends an email using AWS SES.
     * @param to - Recipient email address.
     * @param subject - Email subject.
     * @param body - Email body (HTML or plain text).
     * @returns A promise resolving with the SES response.
     */
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
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
            const command = new SendEmailCommand(params);
            const response = await this.sesClient.send(command);
            this.logger.log(`Email sent successfully: ${JSON.stringify(response)}`);
        } catch (error) {
            this.logger.error(`Failed to send email: ${error}`);
            throw error;
        }
    }
}