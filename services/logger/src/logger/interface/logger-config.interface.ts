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

export interface AuditConfig {
  enableAudit: boolean;
  disableAudit: boolean;
}

export interface DatabaseConfig {
  type?: 'mysql' | 'mariadb' | 'postgres' | 'cockroachdb' | 'sqlite' | 'mssql' | 'sap' | 'oracle' | 'cordova' | 'nativescript' | 'react-native' | 'sqljs' | 'mongodb' | 'aurora-mysql' | 'aurora-postgres' | 'expo' | 'better-sqlite3' | 'spanner';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  synchronize?: boolean;
  logging?: boolean;
}

export interface LoggerConfig {
  type: LoggerType;
  transports: TransportType[];
  level?: string;
  graylog?: GraylogConfig;
  newrelic?: NewRelicConfig;
  dbaudit?: AuditConfig;
}
