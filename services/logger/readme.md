# Newlink Logger Service

The **Logger Service** provides a powerful and configurable logging solution for your NestJS applications. It supports multiple logging providers, including **Winston** and **Consola**, and allows integration with transports such as **Graylog**, **New Relic**, and **file-based logging**. 

---

## Features

1. **Configurable Logging Framework**  
   - Choose between `Winston` and `Consola` for logging.  
   - Set logging levels dynamically.  

2. **Multiple Transport Support**  
   - Console logging  
   - File-based logging (Daily Rotate Logs)  
   - Graylog integration  
   - New Relic integration  

3. **Time-based Logging**  
   - Measure execution time using `time` and `timeEnd` methods.  

4. **Structured and Colored Logging**  
   - JSON-formatted logs for structured logging.  
   - Colorized console output for better readability.  

---

## Installation

Install the Logger Service package:

```bash
npm install @newput-newlink/logger
```

---

## Configuration

The logger service requires configuration to define the logging type and transports. You can provide this configuration via **environment variables** or directly in the module.

### Environment Variables

| Environment Variable  | Required | Description                              | Default  |
| --------------------- | -------- | ---------------------------------------- | -------- |
| `LOGGER_TYPE`        | Yes      | Logger type (`winston` or `consola`)     | `winston` |
| `LOGGER_LEVEL`       | No       | Logging level (`info`, `debug`, `error`) | `info`   |
| `LOGGER_TRANSPORTS`  | No       | Comma-separated transports (`console,file,graylog,newrelic`) | `console` |
| `GRAYLOG_HOST`       | No       | Graylog host if enabled                   | None     |
| `GRAYLOG_PORT`       | No       | Graylog port if enabled                   | None     |
| `NEWRELIC_HOST`      | No       | New Relic host if enabled                 | None     |
| `NEWRELIC_PORT`      | No       | New Relic port if enabled                 | None     |
| `NEWRELIC_PATH`      | No       | New Relic API path                        | None     |

### Example `.env` File

```env
LOGGER_TYPE=winston
LOGGER_LEVEL=info
LOGGER_TRANSPORTS=console,file,graylog
GRAYLOG_HOST=localhost
GRAYLOG_PORT=12201
```

---

## Usage

### Importing the Logger Module

```typescript
import { LoggerModule } from '@newput-newlink/logger';

@Module({
  imports: [
    LoggerModule.register({
      type: process.env.LOGGER_TYPE || 'winston',
      level: process.env.LOGGER_LEVEL || 'info',
      transports: process.env.LOGGER_TRANSPORTS?.split(',') || ['console'],
      graylog: {
        host: process.env.GRAYLOG_HOST,
        port: Number(process.env.GRAYLOG_PORT),
      },
      newrelic: {
        host: process.env.NEWRELIC_HOST,
        port: Number(process.env.NEWRELIC_PORT),
        path: process.env.NEWRELIC_PATH,
      },
    }),
  ],
})
export class AppModule {}
```

---

## Logging Methods

### Basic Logging

```typescript
import { LoggerService } from '@newput-newlink/logger';

@Injectable()
export class ExampleService {
  constructor(private readonly logger: LoggerService) {}

  executeTask() {
    this.logger.log('Task execution started');
    try {
      // Business logic
      this.logger.info('Processing data...');
    } catch (error) {
      this.logger.error('Error occurred:', error);
    }
  }
}
```

### Timing Execution

Measure execution time of a function:

```typescript
this.logger.time('databaseQuery');
// Execute database query...
this.logger.timeEnd('databaseQuery');
```

This will log the execution time:

```
[INFO] databaseQuery: 150ms
```

---

## Testing

Run unit tests to verify the logger functionality:

```bash
npm test
```

---

## Contributing

We welcome contributions to enhance the logging service. To contribute:

1. Fork the repository.  
2. Create a new feature branch.  
3. Implement your changes.  
4. Submit a pull request with a detailed explanation.  

---

## License

This module is licensed under the [MIT License](LICENSE).