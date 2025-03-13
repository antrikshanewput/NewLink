export default () => ({
  LOGGER_TYPE: process.env.LOGGER_TYPE || 'winston',
  LOGGER_TRANSPORTS: (process.env.LOGGER_TRANSPORTS || 'console').split(','),
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'info',
  GRAYLOG_CONFIG: process.env.GRAYLOG_HOST
    ? { host: process.env.GRAYLOG_HOST, port: Number(process.env.GRAYLOG_PORT) }
    : undefined,
  NEWRELIC_CONFIG: process.env.NEWRELIC_HOST
    ? {
        host: process.env.NEWRELIC_HOST,
        port: Number(process.env.NEWRELIC_PORT),
        path: process.env.NEWRELIC_PATH || '/',
        ssl: process.env.NEWRELIC_SSL === 'true',
      }
    : undefined,
});
