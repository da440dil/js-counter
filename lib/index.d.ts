/** ErrInvalidTTL is the error message returned when createCounter receives invalid value of ttl. */
export declare const ErrInvalidTTL = "ttl must be an integer greater than zero";
/** ErrInvalidLimit is the error message returned when createCounter receives invalid value of limit. */
export declare const ErrInvalidLimit = "limit must be an integer greater than zero";
/**
 * Counter implements distributed rate limiting.
 */
export interface Counter {
    /**
     * Increments key value,
     * returns -1 if key value less than or equal limit,
     * returns ttl in milliseconds if key value greater than limit.
     */
    count(key: string): Promise<number>;
}
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
/**
 * Creates new Counter.
 */
export declare function createCounter(storage: Storage, { ttl, limit, prefix }: {
    /** TTL of key in milliseconds (must be greater than 0). */
    ttl: number;
    /** Maximum key value (must be greater than 0, by default equals 1). */
    limit?: number;
    /** Prefix of a key. */
    prefix?: string;
}): Counter;
