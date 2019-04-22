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
export const ErrInvalidTTL = 'ttl must be an integer greater than zero'
/** ErrInvalidLimit is the error message returned when Counter constructor receives invalid value of limit. */
export const ErrInvalidLimit = 'limit must be an integer greater than zero'
/** ErrInvalidRetryDelay is the error message returned when Counter constructor receives invalid value of retryDelay. */
export const ErrInvalidRetryDelay = 'retryDelay must be an integer greater than or equal to zero'

/**
 * Counter implements distributed rate limiting.
 */
export class Counter {
  private _storage: Storage;
  private _ttl: number;
  private _limit: number;
  private _retryDelay: number;
  private _prefix: string;
  constructor(storage: Storage, { ttl, limit = 1, retryDelay = 0, prefix = '' }: {
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
  }) {
    if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
      throw new Error(ErrInvalidTTL)
    }
    if (!(Number.isSafeInteger(limit) && limit > 0)) {
      throw new Error(ErrInvalidLimit)
    }
    if (!(Number.isSafeInteger(retryDelay) && retryDelay >= 0)) {
      throw new Error(ErrInvalidRetryDelay)
    }
    this._storage = storage
    this._ttl = ttl
    this._limit = limit
    this._retryDelay = retryDelay
    this._prefix = prefix
  }
  /**
   * Increments key value, 
   * returns -1 if key value less than or equal limit, 
   * returns ttl in milliseconds if key value greater than limit.
   */
  count(key: string): Promise<number> {
    return this._count(this._prefix + key)
  }
  private async _count(key: string): Promise<number> {
    const v = await this._storage.incr(key, this._limit, this._ttl)
    if (v === -1) {
      return v
    }
    if (v >= this._retryDelay) {
      return v
    }
    await sleep(v)
    return this._storage.incr(key, this._limit, this._ttl)
  }
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
