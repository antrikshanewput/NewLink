import { EmailDto } from 'dto/email.dto';
import { SmsDto } from 'dto/sms.dto';

export const DefaultDTO = [
    {
        provide: 'EMAIL_DTO',
        useValue: EmailDto
    },
    {
        provide: 'SMS_DTO',
        useValue: SmsDto
    }
];