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

interface ProviderDtoType {
  provide: string;
  useValue: any;
}

export interface LoggerConfig {
  type: LoggerType;
  transports: TransportType[];
  level?: string;
  graylog?: GraylogConfig;
  entities?: Function[];
  newrelic?: NewRelicConfig;
  dto?: ProviderDtoType[];
}
