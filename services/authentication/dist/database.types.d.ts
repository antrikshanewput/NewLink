export interface DatabaseOptionsType {
    type?: 'mysql' | 'mariadb' | 'postgres' | 'cockroachdb' | 'sqlite' | 'mssql' | 'sap' | 'oracle' | 'cordova' | 'nativescript' | 'react-native' | 'sqljs' | 'mongodb' | 'aurora-mysql' | 'aurora-postgres' | 'expo' | 'better-sqlite3' | 'spanner';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    synchronize?: boolean;
    logging?: boolean;
    entities?: Function[];
}
