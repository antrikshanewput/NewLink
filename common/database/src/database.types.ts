export type DbType =
	| 'mysql'
	| 'mariadb'
	| 'postgres'
	| 'cockroachdb'
	| 'sqlite'
	| 'mssql'
	| 'sap'
	| 'oracle'
	| 'cordova'
	| 'nativescript'
	| 'react-native'
	| 'sqljs'
	| 'mongodb'
	| 'aurora-mysql'
	| 'aurora-postgres'
	| 'expo'
	| 'better-sqlite3'
	| 'spanner';

// Type for MongoDB schema definition
export interface MongoSchemaDefinition {
	name: string;
	schema: any;
}

export interface DatabaseOptionsType {
	// Common options
	type?: DbType;
	host?: string;
	port?: number;
	username?: string;
	password?: string;
	database?: string;

	// Connection options
	synchronize?: boolean;
	logging?: boolean;

	// Entity options (support both TypeORM entities and Mongoose schemas)
	entities?: Array<Function | MongoSchemaDefinition>;

	// MongoDB specific options
	uri?: string;
	useNewUrlParser?: boolean;
	useUnifiedTopology?: boolean;

	// TypeORM specific options
	ssl?: boolean;
	extra?: Record<string, any>;
	poolSize?: number;
	connectionTimeout?: number;
	maxQueryExecutionTime?: number;
	migrationsRun?: boolean;
	migrations?: Function[];
	migrationsTableName?: string;
	subscribers?: Function[];
}
