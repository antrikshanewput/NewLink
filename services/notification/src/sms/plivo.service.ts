import { Injectable, Inject } from '@nestjs/common';
import * as plivo from 'plivo';

@Injectable()
export class PlivoService {
    constructor(@Inject('PLIVO_CLIENT') private client: plivo.Client, @Inject('PLIVO_FROM_NUMBER') private from_number: string) { }

    async sendSms(dst: string, text: string): Promise<void> {
        const response = await this.client.messages.create(this.from_number, dst, text);
        console.log('SMS Response:', response);

    }
}