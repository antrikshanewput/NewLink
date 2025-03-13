export type LoggerType = 'winston' | 'consola';
export type TransportType = 'console' | 'graylog' | 'newrelic';

export interface GraylogConfig {
  host: string;
  port: number;
}

export interface NewRelicConfig {
  host: string;
  port: number;
  path: string;
  ssl: boolean;
}

export interface LoggerConfig {
  type: LoggerType;
  transports: TransportType[];
  level?: string;
  graylog?: GraylogConfig;
  newrelic?: NewRelicConfig;
}
