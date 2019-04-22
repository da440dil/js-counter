/**
 * Storage imlements key value storage.
 */
export interface Storage {
    /**
     * Sets key value and ttl of key if key not exists or increment key value if key exists,
     * returns -1 if key value less than or equal limit,
     * returns ttl in milliseconds if key value greater than limit.
     */
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
/** ErrInvalidTTL is the error message returned when Counter constructor receives invalid value of ttl. */
export declare const ErrInvalidTTL = "ttl must be an integer greater than zero";
/** ErrInvalidLimit is the error message returned when Counter constructor receives invalid value of limit. */
export declare const ErrInvalidLimit = "limit must be an integer greater than zero";
/** ErrInvalidRetryDelay is the error message returned when Counter constructor receives invalid value of retryDelay. */
export declare const ErrInvalidRetryDelay = "retryDelay must be an integer greater than or equal to zero";
/**
 * Counter implements distributed rate limiting.
 */
export declare class Counter {
    private _storage;
    private _ttl;
    private _limit;
    private _retryDelay;
    private _prefix;
    constructor(storage: Storage, { ttl, limit, retryDelay, prefix }: {
        /** TTL of key in milliseconds (must be greater than 0). */
        ttl: number;
        /** Maximum key value (must be greater than 0, by default equals 1). */
        limit?: number;
        /**
         * Acceptable retry delay in milliseconds
         * (must be greater than or equal to 0, by default equals 0).
         * If TTL returned on count attempt is less than retryDelay,
         * Counter retries attempt to count once TTL expired.
         */
        retryDelay?: number;
        /** Prefix of a key. */
        prefix?: string;
    });
    /**
     * Increments key value,
     * returns -1 if key value less than or equal limit,
     * returns ttl in milliseconds if key value greater than limit.
     */
    count(key: string): Promise<number>;
    private _count;
}
