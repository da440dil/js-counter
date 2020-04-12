import { IGateway } from './IGateway';
import { MemoryGateway } from './gateway/MemoryGateway';
import { TTLError } from './TTLError';

/** Counter implements distributed rate limiting. */
export class Counter {
  /** Error message which is thrown when Counter constructor receives invalid value of TTL. */
  public static readonly ErrInvalidTTL = 'ttl must be an integer greater than 0';
  /** Error message which is thrown when Counter constructor receives invalid value of limit. */
  public static readonly ErrInvalidLimit = 'limit must be an integer greater than 0';
  /** Error message which is thrown when key size is greater than 512 MB. */
  public static readonly ErrInvalidKey = 'key size must be less than or equal to 512 MB';
  /** Maximum key size in bytes. */
  public static readonly MaxKeySize = 512000000;

  private static validateKey(key: string): void {
    if (!isValidKey(key)) {
      throw new Error(Counter.ErrInvalidKey);
    }
  }

  private static validateLimit(limit: number): void {
    if (!isPositiveInteger(limit)) {
      throw new Error(Counter.ErrInvalidLimit);
    }
  }

  private static validateTTL(ttl: number): void {
    if (!isPositiveInteger(ttl)) {
      throw new Error(Counter.ErrInvalidTTL);
    }
  }

  private gateway: IGateway;
  private ttl: number;
  private limit: number;
  private prefix: string;

  constructor({ ttl, limit, gateway, prefix }: {
    /** TTL of a key in milliseconds. Must be greater than 0. */
    ttl: number;
    /** Maximum key value. Must be greater than 0. */
    limit: number;
    /**
     * Gateway to storage to store a counter value.
     * If gateway not defined counter creates new memory gateway
     * with expired keys cleanup every 100 milliseconds.
     */
    gateway?: IGateway;
    /** Prefix of a key. By default empty string. */
    prefix?: string;
  }) {
    Counter.validateLimit(limit);
    Counter.validateTTL(ttl);
    if (prefix === undefined) {
      prefix = '';
    } else {
      Counter.validateKey(prefix);
    }
    this.gateway = gateway === undefined ? new MemoryGateway(100) : gateway;
    this.ttl = ttl;
    this.limit = limit;
    this.prefix = prefix;
  }

  /** Increments key value. Returns limit remainder. Throws TTLError if limit exceeded. */
  public async count(key: string): Promise<number> {
    key = this.prefix + key;
    Counter.validateKey(key);
    const res = await this.gateway.incr(key, this.ttl);
    const rem = this.limit - res.value;
    if (rem < 0) {
      throw new TTLError(res.ttl);
    }
    return rem;
  }
}

function isValidKey(key: string): boolean {
  return Buffer.byteLength(key, 'utf8') <= Counter.MaxKeySize;
}

function isPositiveInteger(v: number): boolean {
  return Number.isSafeInteger(v) && v > 0;
}
