# Newlink Authentication Module

The Authentication module is a secure and scalable solution for handling user authentication. It provides robust tools to manage user login, registration, and session handling, allowing developers to focus on building application features without reinventing the wheel.

---

## Features

1. **JWT Authentication**  
   Secure token-based authentication for users.

2. **Password Encryption**  
   Automatically hash and store passwords securely.

3. **User Registration**  
   Easy-to-use methods for registering new users.

4. **Session Management**  
   Manage user sessions with built-in tools.

5. **Extensible**  
   Integrates seamlessly with other Newlink modules, such as Authorization and Notification.

---

## API Endpoints

1. `POST /authentication/login` - Authenticate a user and generate a JWT token.
2. `POST /authentication/register` - Register a new user.
---


## Installation

Install the module via npm:

```bash
npm install @newput-newlink/authentication
```

---

## Environment Variables

The Authentication module requires several environment variables for proper configuration. Below is a table describing each variable, whether it is required, its purpose, and its default value:

| Environment Variable  | Required | Description                          | Default     |
| --------------------- | -------- | ------------------------------------ | ----------- |
| `JWT_SECRET`          | Yes      | Secret key used for signing JWTs     | None        |
| `JWT_EXPIRATION`      | No       | JWT expiration time in seconds       | `3600`      |
| `OAUTH_CLIENT_ID`     | No       | Client ID for OAuth integrations     | None        |
| `OAUTH_CLIENT_SECRET` | No       | Client Secret for OAuth integrations | None        |
| `DB_HOST`             | Yes      | Database host                        | `localhost` |
| `DB_PORT`             | No       | Database port                        | `5432`      |
| `DB_USERNAME`         | Yes      | Database username                    | None        |
| `DB_PASSWORD`         | Yes      | Database password                    | None        |
| `DB_NAME`             | Yes      | Name of the authentication database  | None        |

---

### Example `.env` File

Create a `.env` file in the root directory of your project and populate it with the necessary environment variables:

```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=auth_user
DB_PASSWORD=auth_password
DB_NAME=auth_db
```

---

## Usage

### Importing the Module

To use the Authentication module, import and configure it in your application:

```typescript
import { AuthModule } from '@newput-newlink/authentication';

@Module({
	imports: [
		AuthModule.register({
			jwtSecret: process.env.JWT_SECRET,
			jwtExpiration: process.env.JWT_EXPIRATION || '3600',
			db: {
				host: process.env.DB_HOST,
				port: Number(process.env.DB_PORT),
				username: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
				name: process.env.DB_NAME,
			},
		}),
	],
})
export class AppModule {}
```

---

### Example: User Registration

```typescript
const user = await authService.register({
	username: 'john_doe',
	password: 'secure_password',
});
console.log('Registered user:', user);
```

---

### Example: User Login

```typescript
const token = await authService.login({
	username: 'john_doe',
	password: 'secure_password',
});
console.log('JWT Token:', token);
```

---

## Testing

Run the tests to verify the module's functionality:

```bash
npm test
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a pull request with a detailed description.

---

## License

This module is licensed under the [MIT License](LICENSE).
