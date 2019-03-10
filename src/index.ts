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
 * Params defines parameters for creating new Counter.
 */
export type Params = {
  /** TTL of key. */
  ttl: number;
  /** Maximum key value (should be greater than 0, by default equals 1). */
  limit?: number;
  /** Prefix of key. */
  prefix?: string;
}

/**
 * Creates new Counter.
 */
export function createCounter(storage: Storage, params: Params): Counter {
  return new CounterImpl(storage, params)
}

class CounterImpl {
  private _storage: Storage;
  private _ttl: number;
  private _limit: number;
  private _prefix: string;
  constructor(storage: Storage, { ttl, limit = 1, prefix = '' }: Params) {
    this._storage = storage
    this._ttl = ttl
    this._limit = limit > 0 ? limit : 1
    this._prefix = prefix
  }
  count(key: string): Promise<number> {
    return this._storage.incr(this._prefix + key, this._limit, this._ttl)
  }
}
