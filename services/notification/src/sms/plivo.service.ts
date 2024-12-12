import { Injectable, Inject } from '@nestjs/common';
import * as plivo from 'plivo';

@Injectable()
export class PlivoService {
    constructor(@Inject('PLIVO_CLIENT') private client: plivo.Client) { }

    async sendSms(src: string, dst: string, text: string): Promise<void> {
        const response = await this.client.messages.create(src, dst, text);
        console.log('SMS Response:', response);
    }
}