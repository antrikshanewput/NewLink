import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget, FindOptionsWhere, ObjectLiteral, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class PostgresService {
	constructor(@InjectDataSource() private dataSource: DataSource) {}

	/**
	 * Get repository for entity
	 */
	getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
		return this.dataSource.getRepository(entity);
	}

	/**
	 * Start a transaction
	 */
	async startTransaction(): Promise<QueryRunner> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		return queryRunner;
	}

	/**
	 * Commit a transaction
	 */
	async commitTransaction(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.commitTransaction();
		await queryRunner.release();
	}

	/**
	 * Rollback a transaction
	 */
	async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.rollbackTransaction();
		await queryRunner.release();
	}

	/**
	 * Execute function within a transaction
	 */
	async withTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
		const queryRunner = await this.startTransaction();
		try {
			const result = await callback(queryRunner);
			await this.commitTransaction(queryRunner);
			return result;
		} catch (error) {
			await this.rollbackTransaction(queryRunner);
			throw error;
		}
	}

	/**
	 * Create an entity
	 */
	async create<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, data: Partial<Entity>, queryRunner?: QueryRunner): Promise<Entity> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		// Use type assertion to match TypeORM's expected DeepPartial type
		const newEntity = repository.create(data as any);
		// Make sure we're saving a single entity and getting a single entity back
		const result = await repository.save(newEntity as any);
		return Array.isArray(result) ? result[0] : result;
	}

	/**
	 * Create multiple entities
	 */
	async createMany<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, data: Partial<Entity>[], queryRunner?: QueryRunner): Promise<Entity[]> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		// Create entities one by one with proper typing
		const entities: any[] = [];
		for (const item of data) {
			const created = repository.create(item as any);
			entities.push(created);
		}

		// Save all entities at once
		return await repository.save(entities as any);
	}

	/**
	 * Find entities
	 */
	async find<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, options: any = {}): Promise<Entity[]> {
		const repository = this.getRepository(entity);
		return repository.find(options);
	}

	/**
	 * Find one entity
	 */
	async findOne<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, options: any): Promise<Entity | null> {
		const repository = this.getRepository(entity);
		return repository.findOne(options);
	}

	/**
	 * Find entity by ID
	 */
	async findById<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, id: string | number): Promise<Entity | null> {
		const repository = this.getRepository(entity);
		return repository.findOneBy({ id } as unknown as FindOptionsWhere<Entity>);
	}

	/**
	 * Update an entity
	 */
	async update<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, id: string | number, data: Partial<Entity>, queryRunner?: QueryRunner): Promise<Entity | null> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		// Cast to any to bypass TypeORM's strict typing
		await repository.update(id, data as any);
		return this.findById(entity, id);
	}

	/**
	 * Update many entities
	 */
	async updateMany<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, criteria: FindOptionsWhere<Entity>, data: Partial<Entity>, queryRunner?: QueryRunner): Promise<number> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		// Cast to any to bypass TypeORM's strict typing
		const result = await repository.update(criteria, data as any);
		return result.affected || 0;
	}

	/**
	 * Delete an entity
	 */
	async delete<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, id: string | number, queryRunner?: QueryRunner): Promise<boolean> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		const result = await repository.delete(id);
		return (result.affected || 0) > 0;
	}

	/**
	 * Delete many entities
	 */
	async deleteMany<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, criteria: FindOptionsWhere<Entity>, queryRunner?: QueryRunner): Promise<number> {
		const repository = queryRunner ? queryRunner.manager.getRepository(entity) : this.getRepository(entity);

		const result = await repository.delete(criteria);
		return result.affected || 0;
	}

	/**
	 * Count entities
	 */
	async count<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, options: any = {}): Promise<number> {
		const repository = this.getRepository(entity);
		return repository.count(options);
	}

	/**
	 * Execute raw SQL query
	 */
	async query(sql: string, parameters?: any[], queryRunner?: QueryRunner): Promise<any> {
		if (queryRunner) {
			return queryRunner.query(sql, parameters);
		}
		return this.dataSource.query(sql, parameters);
	}
}
