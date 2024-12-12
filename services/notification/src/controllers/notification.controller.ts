import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { PlivoService } from '../sms/plivo.service';
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly emailService: EmailService,
        private readonly plivoService: PlivoService,
    ) { }
    @Post('email')
    async sendEmail(
        @Body('from') from: string,
        @Body('to') to: string,
        @Body('subject') subject: string,
        @Body('text') text: string,
        @Body('html') html?: string,
    ): Promise<{ message: string }> {
        await this.emailService.sendMail(to, subject, text, html);
        return { message: 'Email sent successfully!' };
    }
    @Post('sms')
    async sendSms(
        @Body('src') src: string,
        @Body('dst') dst: string,
        @Body('text') text: string,
    ): Promise<{ message: string }> {
        await this.plivoService.sendSms(src, dst, text);
        return { message: 'SMS sent successfully!' };
    }
}