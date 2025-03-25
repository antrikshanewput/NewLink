import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, FilterQuery, Model, UpdateQuery } from 'mongoose';

@Injectable()
export class MongoService {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	/**
	 * Get model by name
	 */
	getModel<T>(modelName: string): Model<T> {
		return this.connection.model<T>(modelName);
	}

	/**
	 * Start a transaction session
	 */
	async startTransaction(): Promise<ClientSession> {
		const session = await this.connection.startSession();
		session.startTransaction();
		return session;
	}

	/**
	 * Commit a transaction
	 */
	async commitTransaction(session: ClientSession): Promise<void> {
		await session.commitTransaction();
		await session.endSession();
	}

	/**
	 * Abort a transaction
	 */
	async abortTransaction(session: ClientSession): Promise<void> {
		await session.abortTransaction();
		await session.endSession();
	}

	/**
	 * Execute a function within a transaction
	 */
	async withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
		const session = await this.startTransaction();
		try {
			const result = await callback(session);
			await this.commitTransaction(session);
			return result;
		} catch (error) {
			await this.abortTransaction(session);
			throw error;
		}
	}

	/**
	 * Create a document
	 */
	async create<T>(modelName: string, data: Partial<T>, session?: ClientSession): Promise<T> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		const document = new model(data);
		return (await document.save(options)) as unknown as T;
	}

	/**
	 * Create multiple documents
	 */
	async createMany<T>(modelName: string, data: Partial<T>[], session?: ClientSession): Promise<T[]> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		return (await model.insertMany(data, options)) as unknown as T[];
	}

	/**
	 * Find documents
	 */
	async find<T>(modelName: string, filter: FilterQuery<T> = {}, projection: any = {}, options: any = {}): Promise<T[]> {
		const model = this.getModel<T>(modelName);
		return (await model.find(filter, projection, options).exec()) as unknown as T[];
	}

	/**
	 * Find one document
	 */
	async findOne<T>(modelName: string, filter: FilterQuery<T> = {}, projection: any = {}, options: any = {}): Promise<T | null> {
		const model = this.getModel<T>(modelName);
		return (await model.findOne(filter, projection, options).exec()) as unknown as T | null;
	}

	/**
	 * Find document by ID
	 */
	async findById<T>(modelName: string, id: string, projection: any = {}, options: any = {}): Promise<T | null> {
		const model = this.getModel<T>(modelName);
		return (await model.findById(id, projection, options).exec()) as unknown as T | null;
	}

	/**
	 * Update one document
	 */
	async updateOne<T>(modelName: string, filter: FilterQuery<T>, update: UpdateQuery<T>, session?: ClientSession): Promise<boolean> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		const result = await model.updateOne(filter, update, options).exec();
		return result.modifiedCount > 0;
	}

	/**
	 * Update many documents
	 */
	async updateMany<T>(modelName: string, filter: FilterQuery<T>, update: UpdateQuery<T>, session?: ClientSession): Promise<number> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		const result = await model.updateMany(filter, update, options).exec();
		return result.modifiedCount;
	}

	/**
	 * Delete one document
	 */
	async deleteOne<T>(modelName: string, filter: FilterQuery<T>, session?: ClientSession): Promise<boolean> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		const result = await model.deleteOne(filter, options).exec();
		return result.deletedCount > 0;
	}

	/**
	 * Delete many documents
	 */
	async deleteMany<T>(modelName: string, filter: FilterQuery<T>, session?: ClientSession): Promise<number> {
		const model = this.getModel<T>(modelName);
		const options = session ? { session } : {};
		const result = await model.deleteMany(filter, options).exec();
		return result.deletedCount;
	}

	/**
	 * Count documents
	 */
	async count<T>(modelName: string, filter: FilterQuery<T> = {}): Promise<number> {
		const model = this.getModel<T>(modelName);
		return model.countDocuments(filter).exec();
	}
}
