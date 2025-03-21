import { Inject, Injectable } from '@nestjs/common';
import * as plivo from 'plivo';

@Injectable()
export class PlivoService {
	constructor(
		@Inject('PLIVO_CLIENT') private client: plivo.Client,
		@Inject('PLIVO_FROM_NUMBER') private from_number: string,
    @Inject('PLIVO_WHATSAPP_FROM_NUMBER') private whatsapp_from_number: string,
    @Inject('PLIVO_WHATSAPP_TEMPLATE') private whatsapp_template: string
	) {}

	async sendSms(dst: string, text: string): Promise<void> {
		const response = await this.client.messages.create(this.from_number, dst, text);
		console.log('SMS Response:', response);
	}

  async sendWhatsApp(dst: string, text: string) {
    const template = {
      name: this.whatsapp_template,
      language: 'en_US',
      components: [
        {
          type: 'header',
          parameters: []
        },
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: text
            }
          ]
        }
      ]
    };
  
    const response = await this.client.messages.create({
      src: this.whatsapp_from_number,
      dst,
      type: 'whatsapp',
      template: template,
    });

    console.log('WhatsApp response:', response);
    return response;
  }
}
