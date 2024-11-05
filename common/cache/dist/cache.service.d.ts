import { CacheStore } from '@nestjs/cache-manager';
export declare class CacheService {
    private readonly cache;
    constructor(cache: CacheStore);
    /**
     * Retrieve a value from the cache by key.
     * @param key - The cache key
     * @returns The cached value or null if not found
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Store a value in the cache with an optional TTL.
     * @param key - The cache key
     * @param value - The value to cache
     * @param ttl - Optional time-to-live in seconds
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Remove a value from the cache by key.
     * @param key - The cache key to remove
     */
    del(key: string): Promise<void>;
}
