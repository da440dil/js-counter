import { RedisClient } from 'redis';
/**
 * ErrInvalidResponse is the error message returned when Redis command returns response of invalid type.
 */
export declare const ErrInvalidResponse = "Invalid response";
/**
 * ErrKeyNameClash is the error message returned when Redis key exists and has no TTL.
 */
export declare const ErrKeyNameClash = "Key name clash";
/**
 * Storage implements storage using Redis.
 */
export interface Storage {
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
/**
 * Creates new Storage.
 * @param client
 */
export declare function createStorage(client: RedisClient): Storage;
