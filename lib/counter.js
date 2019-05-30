"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Error message returned when Counter constructor receives invalid value of ttl. */
exports.ErrInvalidTTL = 'ttl must be an integer greater than zero';
/** Error message returned when Counter constructor receives invalid value of limit. */
exports.ErrInvalidLimit = 'limit must be an integer greater than zero';
/** Error message returned when count failed. */
exports.ErrTooManyRequests = 'Too Many Requests';
/**
 * Error returned when count failed.
 */
class CounterError extends Error {
    constructor(ttl) {
        super(exports.ErrTooManyRequests);
        this._ttl = ttl;
    }
    get ttl() {
        return this._ttl;
    }
}
exports.CounterError = CounterError;
/**
 * Counter implements distributed rate limiting.
 */
class Counter {
    constructor(storage, { ttl, limit = 1, prefix = '' }) {
        if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
            throw new Error(exports.ErrInvalidTTL);
        }
        if (!(Number.isSafeInteger(limit) && limit > 0)) {
            throw new Error(exports.ErrInvalidLimit);
        }
        this._storage = storage;
        this._ttl = ttl;
        this._limit = limit;
        this._prefix = prefix;
    }
    /**
     * Increments key value.
     * Returns -1 if key value less than or equal limit.
     * Returns ttl in milliseconds if key value greater than limit.
     */
    async count(key) {
        const v = await this._storage.incr(this._prefix + key, this._limit, this._ttl);
        if (v === -1) {
            return;
        }
        throw new CounterError(v);
    }
}
exports.Counter = Counter;
