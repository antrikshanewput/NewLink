import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    constructor(@Inject('EMAIL_TRANSPORTER') private transporter: nodemailer.Transporter, @Inject('EMAIL_FROM') private email: string) { }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
        const mailOptions = {
            from: this.email,
            to,
            subject,
            text,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}