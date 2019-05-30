import { RedisClient } from 'redis';
/**
 * Error message returned when Redis command returns response of invalid type.
 */
export declare const ErrInvalidResponse = "Invalid response";
/**
 * Error message returned when Redis key exists and has no TTL.
 */
export declare const ErrKeyNameClash = "Key name clash";
/** Implements Counter#Storage */
export declare class Storage {
    private _client;
    constructor(client: RedisClient);
    /**
     * Sets key value and ttl of key if key not exists or increment key value if key exists.
     * Returns -1 if key value less than or equal limit.
     * Returns ttl in milliseconds if key value greater than limit.
     */
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
