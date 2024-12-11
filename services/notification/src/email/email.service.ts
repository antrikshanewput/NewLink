import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    constructor(@Inject('SMTP_TRANSPORTER') private transporter: nodemailer.Transporter) { }

    async sendMail(from: string, to: string, subject: string, text: string, html?: string): Promise<void> {
        const mailOptions = {
            from,
            to,
            subject,
            text,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}