# Newlink Blockchain Module

The Blockchain module provides an easy-to-use and flexible integration for blockchain-related features, starting with Hedera Hashgraph support. It simplifies interaction with blockchain networks by managing configurations and providing pre-built services and controllers.

---

## Features

1. **Configurable Blockchain Options**  
   Supports dynamic configuration of blockchain providers, networks, accounts, and keys.

2. **Hedera Hashgraph Support**  
   Includes built-in services and controllers for working with Hedera.

3. **Dynamic Module Registration**  
   Easily register and configure the Blockchain module based on your application's needs.

4. **Extensible**  
   Additional blockchain providers can be supported in future implementations.

---

## Installation

Install the module via npm:

---
## API Endpoints
### Hedera Endpoints
1. `POST /hedera/accounts` - Create a new account.
2. `GET /hedera/accounts/{accountId}` - Fetch details of a specific account, including its balance (if needed).
3. `POST /hedera/transfers` - Execute a fund transfer operation.
4. `GET /hedera/accounts/{accountId}/transactions` - List transactions for a specific account.
5. `GET /hedera/transactions/{transactionId}` - Get details of a specific transaction.

---

```bash
npm install @newput-newlink/blockchain
```

---

## Environment Variables

The Blockchain module requires several environment variables for proper configuration. Below is a table describing each variable, whether it is required, its purpose, and its default value:

| Environment Variable         | Required | Description                                     | Default   |
| ---------------------------- | -------- | ----------------------------------------------- | --------- |
| `BLOCKCHAIN`                 | Yes      | Blockchain provider (e.g., `hedera`)            | `hedera`  |
| `BLOCKCHAIN_NETWORK`         | Yes      | Blockchain network (e.g., `mainnet`, `testnet`) | `testnet` |
| `BLOCKCHAIN_ACCOUNT_ID`      | Yes      | Account ID for blockchain transactions          | None      |
| `BLOCKCHAIN_PRIVATE_KEY`     | Yes      | Private key for blockchain account              | None      |
| `BLOCKCHAIN_INITIAL_BALANCE` | No       | Initial balance for new accounts (in tinybars)  | `1000`    |

---

### Example `.env` File

Create a `.env` file in the root directory of your project and populate it with the necessary environment variables:

```env
BLOCKCHAIN=hedera
BLOCKCHAIN_NETWORK=testnet
BLOCKCHAIN_ACCOUNT_ID=your-account-id
BLOCKCHAIN_PRIVATE_KEY=your-private-key
BLOCKCHAIN_INITIAL_BALANCE=1000
```

---

## Usage

### Importing the Module

To use the Blockchain module, import and register it in your application:

```typescript
import { BlockchainModule } from '@newput-newlink/blockchain';

@Module({
	imports: [
		BlockchainModule.register({
			blockchain: 'hedera',
			network: 'testnet',
			account_id: process.env.BLOCKCHAIN_ACCOUNT_ID,
			private_key: process.env.BLOCKCHAIN_PRIVATE_KEY,
			initial_balance: parseInt(process.env.BLOCKCHAIN_INITIAL_BALANCE || '1000', 10),
		}),
	],
})
export class AppModule {}
```

---

### Example: Creating a New Account (Hedera)

Use the `HederaService` to create a new account:

```typescript
import { Injectable } from '@nestjs/common';
import { HederaService } from '@newput-newlink/blockchain';

@Injectable()
export class ExampleService {
	constructor(private readonly hederaService: HederaService) {}

	async createAccount() {
		const newAccount = await this.hederaService.createAccount({
			initialBalance: 1000,
		});
		console.log('New Account:', newAccount);
		return newAccount;
	}
}
```

---

### Example: Controller Integration

Use the `HederaController` to expose blockchain functionalities via APIs:

```typescript
import { Controller, Post } from '@nestjs/common';
import { HederaService } from '@newput-newlink/blockchain';

@Controller('hedera')
export class ExampleController {
	constructor(private readonly hederaService: HederaService) {}

	@Post('create-account')
	async createAccount() {
		return await this.hederaService.createAccount({ initialBalance: 1000 });
	}
}
```

---

## Testing

Run the unit tests to verify the module's functionality:

```bash
npm test
```

---

## Supported Blockchain Providers

| Blockchain Provider  | Status          |
| -------------------- | --------------- |
| **Hedera Hashgraph** | Fully Supported |
| Ethereum             | Coming Soon     |
| Solana               | Coming Soon     |

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
