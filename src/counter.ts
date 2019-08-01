/** Gateway to storage to store a counter value. */
export interface Gateway {
  /**
   * Sets key value and TTL of key if key not exists.
   * Increments key value if key exists.
   */
  incr(key: string, ttl: number): Promise<ValueTTL>
}

export interface ValueTTL {
  /** Key value after increment. */
  value: number
  /** TTL of a key in milliseconds. */
  ttl: number
}

/** Error message which is thrown when Counter constructor receives invalid value of TTL. */
export const ErrInvalidTTL = 'ttl must be an integer greater than zero'

/** Error message which is thrown when Counter constructor receives invalid value of limit. */
export const ErrInvalidLimit = 'limit must be an integer greater than zero'

/** Error message which is thrown when when key size is greater than 512 MB. */
export const ErrInvalidKey = 'key size must be less than or equal to 512 MB'

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
    if (!isValidKey(prefix)) {
      throw new Error(ErrInvalidKey)
    }
    this._gateway = gateway
    this._ttl = ttl
    this._limit = limit
    this._prefix = prefix
  }
  /** Increments key value. Returns limit remainder. Throws TTLError if limit exceeded. */
  async count(key: string): Promise<number> {
    key = this._prefix + key
    if (!isValidKey(key)) {
      throw new Error(ErrInvalidKey)
    }
    const res = await this._gateway.incr(key, this._ttl)
    const rem = this._limit - res.value
    if (rem < 0) {
      throw new TTLError(res.ttl)
    }
    return rem
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

/** Maximum key size in bytes. */
export const MaxKeySize = 512000000

function isValidKey(key: string): boolean {
  return Buffer.byteLength(key, 'utf8') <= MaxKeySize
}
