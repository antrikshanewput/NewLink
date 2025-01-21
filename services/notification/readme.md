# Newlink Notification Module

The Notification module provides a robust and extensible system for sending notifications across various channels, including email and SMS. It is designed to help developers integrate notification functionalities into their applications efficiently.

---

## Features

1. **Email Notifications**  
   Send transactional and promotional emails using configurable SMTP settings.

2. **SMS Notifications**  
   Send SMS using Plivo integration.

3. **Future Support for Push Notifications**  
   Push notifications are planned for future releases to extend the module's capabilities.

---

## Installation

Use the module via newlink-cli:

```bash
npx @newput-newlink/cli
```

### Installation Process

During installation, the CLI will guide you through two key configuration steps:

-> Architecture Selection: Choose between Monolithic or Microservice architecture based on your project requirements.
-> Notification Setup: You'll be prompted to enable the notification service. Enter 'Y' to include this feature in your installation.

The CLI tool handles all dependency installation and initial setup automatically, creating a production-ready service configured to your specifications.
What Happens Next?
After completing these steps, the NewLink CLI will:

Install all required dependencies
Generate necessary configuration files
Set up your chosen architecture
Configure the notification service (if selected)
Initialize your project with the selected settings

Now your NewLink service is ready for development and deployment.

---

## Environment Variables

The Notification module requires several environment variables for proper configuration. Below is a table describing each variable, whether it is required, its purpose, and its default value:

| Environment Variable | Required | Description                                    | Default |
| -------------------- | -------- | ---------------------------------------------- | ------- |
| `EMAIL_HOST`         | Yes      | SMTP host for sending emails                   | None    |
| `EMAIL_PORT`         | Yes      | SMTP port for sending emails                   | `587`   |
| `EMAIL_USER`         | Yes      | SMTP username                                  | None    |
| `EMAIL_PASS`         | Yes      | SMTP password                                  | None    |
| `EMAIL_FROM`         | Yes      | Default "From" email address for notifications | None    |
| `PLIVO_AUTH_ID`      | Yes      | Authentication ID for Plivo SMS integration    | None    |
| `PLIVO_AUTH_TOKEN`   | Yes      | Authentication token for Plivo SMS integration | None    |
| `PLIVO_FROM_NUMBER`  | Yes      | Default sender number for Plivo SMS            | None    |

---

### Example `.env` File

Create a `.env` file in the root directory of your project and populate it with the necessary environment variables:

```env
EMAIL_HOST=smpt
EMAIL_PORT=587
EMAIL_USER=username
EMAIL_PASS=password
EMAIL_FROM=email@dummy.com

PLIVO_AUTH_ID=auth_id
PLIVO_AUTH_TOKEN=auth_token
PLIVO_FROM_NUMBER=plivo_number
```

---

## Usage

### Importing the Module

To use the Notification module, import and configure it in your application:

```typescript
import { NotificationModule } from '@newput-newlink/notification';

@Module({
	imports: [
		NotificationModule.register({
			email: {
				host: process.env.EMAIL_HOST,
				port: Number(process.env.EMAIL_PORT),
				username: process.env.EMAIL_USER,
				password: process.env.EMAIL_PASS,
				from: process.env.EMAIL_FROM,
			},
			sms: {
				plivoAuthId: process.env.PLIVO_AUTH_ID,
				plivoAuthToken: process.env.PLIVO_AUTH_TOKEN,
				plivoFromNumber: process.env.PLIVO_FROM_NUMBER,
			},
		}),
	],
})
export class AppModule {}
```

---

### Example: Sending an Email Notification

Use the `NotificationService` to send an email:

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService } from '@newput-newlink/notification';

@Injectable()
export class ExampleService {
	constructor(private readonly notificationService: NotificationService) {}

	async sendEmailNotification() {
		await this.notificationService.sendEmail({
			to: 'user@example.com',
			subject: 'Welcome to Newlink!',
			body: '<h1>Thank you for signing up!</h1>',
		});
	}
}
```

---

### Example: Sending an SMS Notification

```typescript
await this.notificationService.sendSMS({
	to: '+1234567890',
	message: 'Your verification code is 123456',
});
```

---

## Future Features

### Push Notifications

Push notifications are planned for future releases to allow developers to send app-based notifications to devices.

---

## Testing

Run the tests to verify the module's functionality:

```bash
npm test
```

---

## Contributing

We welcome contributions to extend the module's capabilities. Please follow these steps:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request with a detailed explanation.

---

## License

This module is licensed under the [MIT License](LICENSE).
