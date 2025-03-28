import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	/**
	 * Retrieve a value from the cache by key.
	 * @param key - The cache key
	 * @returns The cached value or null if not found
	 */
	async get<T>(key: string): Promise<T | undefined> {
		return this.cache.get<T>(key);
	}

	/**
	 * Store a value in the cache with an optional TTL.
	 * @param key - The cache key
	 * @param value - The value to cache
	 * @param ttl - Optional time-to-live in seconds
	 */
	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		const options = ttl ? ttl : undefined;
		await this.cache.set(key, value, options);
	}

	/**
	 * Remove a value from the cache by key.
	 * @param key - The cache key to remove
	 */
	async del(key: string): Promise<void> {
		if (this.cache && this.cache.del) {
			await this.cache.del(key);
		}
	}
}
