"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Error message returned when Redis command returns response of invalid type.
 */
exports.ErrInvalidResponse = 'Invalid response';
/**
 * Error message returned when Redis key exists and has no TTL.
 */
exports.ErrKeyNameClash = 'Key name clash';
const INCR = '' +
    'local v = redis.call("incr", KEYS[1]) ' +
    'if v > tonumber(ARGV[1]) then ' +
    'return redis.call("pttl", KEYS[1]) ' +
    'end ' +
    'if v == 1 then ' +
    'redis.call("pexpire", KEYS[1], ARGV[2]) ' +
    'end ' +
    'return nil';
/** Implements Counter#Storage */
class Storage {
    constructor(client) {
        this._client = client;
    }
    /**
     * Sets key value and ttl of key if key not exists or increment key value if key exists.
     * Returns -1 if key value less than or equal limit.
     * Returns ttl in milliseconds if key value greater than limit.
     */
    incr(key, limit, ttl) {
        return new Promise((resolve, reject) => {
            this._client.eval(INCR, 1, key, limit, ttl, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res == null) {
                    return resolve(-1);
                }
                if (typeof res !== 'number') {
                    return reject(new Error(exports.ErrInvalidResponse));
                }
                if (res === -1) {
                    return reject(new Error(exports.ErrKeyNameClash));
                }
                resolve(res);
            });
        });
    }
}
exports.Storage = Storage;
