import { RedisClient } from 'redis';
/**
 * ErrInvalidResponse is the error message returned when Redis command returns response of invalid type.
 */
export declare const ErrInvalidResponse = "Invalid response";
/**
 * ErrKeyNameClash is the error message returned when Redis key exists and has no TTL.
 */
export declare const ErrKeyNameClash = "Key name clash";
export declare class Storage {
    private _client;
    constructor(client: RedisClient);
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
