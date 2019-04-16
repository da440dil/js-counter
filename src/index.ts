/** ErrInvalidTTL is the error message returned when createCounter receives invalid value of ttl. */
export const ErrInvalidTTL = 'ttl must be an integer greater than zero'
/** ErrInvalidLimit is the error message returned when createCounter receives invalid value of limit. */
export const ErrInvalidLimit = 'limit must be an integer greater than zero'

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
export function createCounter(storage: Storage, { ttl, limit = 1, prefix = '' }: {
  /** TTL of key in milliseconds (must be greater than 0). */
  ttl: number;
  /** Maximum key value (must be greater than 0, by default equals 1). */
  limit?: number;
  /** Prefix of a key. */
  prefix?: string;
}): Counter {
  if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
    throw new Error(ErrInvalidTTL)
  }
  if (!(Number.isSafeInteger(limit) && limit > 0)) {
    throw new Error(ErrInvalidLimit)
  }
  return new CounterImpl(storage, ttl, limit, prefix)
}

class CounterImpl {
  private _storage: Storage;
  private _ttl: number;
  private _limit: number;
  private _prefix: string;
  constructor(storage: Storage, ttl: number, limit: number, prefix: string) {
    this._storage = storage
    this._ttl = ttl
    this._limit = limit > 0 ? limit : 1
    this._prefix = prefix
  }
  count(key: string): Promise<number> {
    return this._storage.incr(this._prefix + key, this._limit, this._ttl)
  }
}
