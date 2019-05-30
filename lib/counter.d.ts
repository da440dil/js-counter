/**
 * Storage to store a counter value.
 */
export interface Storage {
    /**
     * Sets key value and ttl of key if key not exists or increment key value if key exists.
     * Returns -1 if key value less than or equal limit.
     * Returns ttl in milliseconds if key value greater than limit.
     */
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
/** Error message returned when Counter constructor receives invalid value of ttl. */
export declare const ErrInvalidTTL = "ttl must be an integer greater than zero";
/** Error message returned when Counter constructor receives invalid value of limit. */
export declare const ErrInvalidLimit = "limit must be an integer greater than zero";
/** Error message returned when count failed. */
export declare const ErrTooManyRequests = "Too Many Requests";
/**
 * Error returned when count failed.
 */
export declare class CounterError extends Error {
    private _ttl;
    constructor(ttl: number);
    readonly ttl: number;
}
/**
 * Counter implements distributed rate limiting.
 */
export declare class Counter {
    private _storage;
    private _ttl;
    private _limit;
    private _prefix;
    constructor(storage: Storage, { ttl, limit, prefix }: {
        /**
         * TTL of key in milliseconds.
         * Must be greater than 0.
         */
        ttl: number;
        /**
         * Maximum key value.
         * Must be greater than 0, by default equals 1.
         */
        limit?: number;
        /** Prefix of a key. */
        prefix?: string;
    });
    /**
     * Increments key value.
     * Returns -1 if key value less than or equal limit.
     * Returns ttl in milliseconds if key value greater than limit.
     */
    count(key: string): Promise<void>;
}
