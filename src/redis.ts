import { RedisClient } from 'redis'

/**
 * ErrInvalidResponse is the error message returned when Redis command returns response of invalid type.
 */
export const ErrInvalidResponse = 'Invalid response'
/**
 * ErrKeyNameClash is the error message returned when Redis key exists and has no TTL.
 */
export const ErrKeyNameClash = 'Key name clash'

const incr = 'local v = redis.call("incr", KEYS[1]) if v > tonumber(ARGV[1]) then return redis.call("pttl", KEYS[1]) end if v == 1 then redis.call("pexpire", KEYS[1], ARGV[2]) end return nil'

export class Storage {
  private _client: RedisClient;
  constructor(client: RedisClient) {
    this._client = client
  }
  incr(key: string, limit: number, ttl: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this._client.eval(incr, 1, key, String(limit), String(ttl), (err, res) => {
        if (err) {
          return reject(err)
        }
        if (res == null) {
          return resolve(-1)
        }
        if (typeof res !== 'number') {
          return reject(new Error(ErrInvalidResponse))
        }
        if (res === -1) {
          return reject(new Error(ErrKeyNameClash))
        }
        resolve(res)
      })
    })
  }
}
