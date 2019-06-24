/** Gateway to storage to store a counter value. */
export interface Gateway {
  /**
   * Sets key value and ttl of key if key not exists.
   * Increments key value if key exists.
   * Returns -1 if key value less than or equal limit.
   * Returns ttl in milliseconds if key value greater than limit.
   */
  incr(key: string, limit: number, ttl: number): Promise<number>
}

/** Error message which is thrown when Counter constructor receives invalid value of ttl. */
export const ErrInvalidTTL = 'ttl must be an integer greater than zero'

/** Error message which is thrown when Counter constructor receives invalid value of limit. */
export const ErrInvalidLimit = 'limit must be an integer greater than zero'

/** Parameters for creating new Counter. */
export interface Params {
  /** TTL of a key in milliseconds. Must be greater than 0. */
  ttl: number
  /** Maximum key value. Must be greater than 0. */
  limit: number
  /** Prefix of a key. By default empty string. */
  prefix?: string
}

/** Counter implements distributed rate limiting. */
export class Counter {
  private _gateway: Gateway
  private _ttl: number
  private _limit: number
  private _prefix: string
  constructor(gateway: Gateway, { ttl, limit, prefix = '' }: Params) {
    if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
      throw new Error(ErrInvalidTTL)
    }
    if (!(Number.isSafeInteger(limit) && limit > 0)) {
      throw new Error(ErrInvalidLimit)
    }
    this._gateway = gateway
    this._ttl = ttl
    this._limit = limit
    this._prefix = prefix
  }
  /** Increments key value. Throws TTLError if limit exceeded. */
  public async count(key: string): Promise<void> {
    const v = await this._gateway.incr(this._prefix + key, this._limit, this._ttl)
    if (v !== -1) {
      throw new TTLError(v)
    }
  }
}

/** Error message which is thrown when Counter failed to count. */
export const ErrTooManyRequests = 'Too Many Requests'

/** Error which is thrown when Counter failed to count. */
export class TTLError extends Error {
  private _ttl: number
  constructor(ttl: number) {
    super(ErrTooManyRequests)
    this._ttl = ttl
  }
  /** TTL of a key in milliseconds. */
  get ttl() {
    return this._ttl
  }
}
