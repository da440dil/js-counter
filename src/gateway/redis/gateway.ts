import { Gateway as IGateway, ValueTTL } from '../../gateway'
import { RedisClient } from 'redis'

/** Error message which is thrown when Redis command returns response of invalid type. */
export const ErrInvalidResponse = 'Invalid response'

/** Error message which is thrown when Redis key exists and has no TTL. */
export const ErrKeyNameClash = 'Key name clash'

const INCR = '' +
  'local v = redis.call("incr", KEYS[1]) ' +
  'if v == 1 then ' +
  'redis.call("pexpire", KEYS[1], ARGV[1]) ' +
  'return {v, -2} ' +
  'end ' +
  'local t = redis.call("pttl", KEYS[1]) ' +
  'return {v, t}'

/** Implements gateway to Redis storage. */
export class Gateway implements IGateway {
  private _client: RedisClient
  constructor(client: RedisClient) {
    this._client = client
  }
  incr(key: string, ttl: number): Promise<ValueTTL> {
    return new Promise((resolve, reject) => {
      this._client.eval(INCR, 1, key, ttl, (err, res) => {
        if (err) {
          return reject(err)
        }
        const v = parseInt(res[0], 10)
        if (isNaN(v)) {
          return reject(new Error(ErrInvalidResponse))
        }
        const t = parseInt(res[1], 10)
        if (isNaN(t)) {
          return reject(new Error(ErrInvalidResponse))
        }
        if (t === -1) {
          return reject(new Error(ErrKeyNameClash))
        }
        if (t === -2) {
          return resolve({ value: v, ttl })
        }
        resolve({ value: v, ttl: t })
      })
    })
  }
}
