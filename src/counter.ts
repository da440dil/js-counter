/**
 * Storage to store a counter value.
 */
export interface Storage {
  /**
   * Sets key value and ttl of key if key not exists or increment key value if key exists.
   * Returns -1 if key value less than or equal limit.
   * Returns ttl in milliseconds if key value greater than limit.
   */
  incr(key: string, limit: number, ttl: number): Promise<number>
}

/** Error message returned when Counter constructor receives invalid value of ttl. */
export const ErrInvalidTTL = 'ttl must be an integer greater than zero'
/** Error message returned when Counter constructor receives invalid value of limit. */
export const ErrInvalidLimit = 'limit must be an integer greater than zero'

/** Error message returned when count failed. */
export const ErrTooManyRequests = 'Too Many Requests'
/**
 * Error returned when count failed.
 */
export class CounterError extends Error {
  private _ttl: number
  constructor(ttl: number) {
    super(ErrTooManyRequests)
    this._ttl = ttl
  }
  get ttl() {
    return this._ttl
  }
}

/**
 * Counter implements distributed rate limiting.
 */
export class Counter {
  private _storage: Storage
  private _ttl: number
  private _limit: number
  private _prefix: string
  constructor(storage: Storage, { ttl, limit = 1, prefix = '' }: {
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
  }) {
    if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
      throw new Error(ErrInvalidTTL)
    }
    if (!(Number.isSafeInteger(limit) && limit > 0)) {
      throw new Error(ErrInvalidLimit)
    }
    this._storage = storage
    this._ttl = ttl
    this._limit = limit
    this._prefix = prefix
  }
  /**
   * Increments key value.
   * Returns -1 if key value less than or equal limit.
   * Returns ttl in milliseconds if key value greater than limit.
   */
  public async count(key: string): Promise<void> {
    const v = await this._storage.incr(this._prefix + key, this._limit, this._ttl)
    if (v === -1) {
      return
    }
    throw new CounterError(v)
  }
}
