import { IGateway, IValueTTL } from '../IGateway';
import { RedisClient } from 'redis';

const INCR = '' +
  'local v = redis.call("incr", KEYS[1]) ' +
  'if v == 1 then ' +
  'redis.call("pexpire", KEYS[1], ARGV[1]) ' +
  'return {v, -2} ' +
  'end ' +
  'local t = redis.call("pttl", KEYS[1]) ' +
  'return {v, t}';

/** Implements gateway to Redis storage. */
export class RedisGateway implements IGateway {
  /** Error message which is thrown when Redis command returns response of invalid type. */
  public static readonly ErrInvalidResponse = 'Invalid response';
  /** Error message which is thrown when Redis key exists and has no TTL. */
  public static readonly ErrKeyNameClash = 'Key name clash';

  private client: RedisClient;

  constructor(client: RedisClient) {
    this.client = client;
  }

  public incr(key: string, ttl: number): Promise<IValueTTL> {
    return new Promise((resolve, reject) => {
      this.client.eval(INCR, 1, key, ttl, (err, res) => {
        if (err) {
          return reject(err);
        }
        const v = parseInt(res[0], 10);
        if (isNaN(v)) {
          return reject(new Error(RedisGateway.ErrInvalidResponse));
        }
        const t = parseInt(res[1], 10);
        if (isNaN(t)) {
          return reject(new Error(RedisGateway.ErrInvalidResponse));
        }
        if (t === -1) {
          return reject(new Error(RedisGateway.ErrKeyNameClash));
        }
        if (t === -2) {
          return resolve({ value: v, ttl });
        }
        resolve({ value: v, ttl: t });
      });
    });
  }
}
