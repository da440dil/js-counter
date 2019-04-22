"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ErrInvalidTTL is the error message returned when Counter constructor receives invalid value of ttl. */
exports.ErrInvalidTTL = 'ttl must be an integer greater than zero';
/** ErrInvalidLimit is the error message returned when Counter constructor receives invalid value of limit. */
exports.ErrInvalidLimit = 'limit must be an integer greater than zero';
/** ErrInvalidRetryDelay is the error message returned when Counter constructor receives invalid value of retryDelay. */
exports.ErrInvalidRetryDelay = 'retryDelay must be an integer greater than or equal to zero';
/**
 * Counter implements distributed rate limiting.
 */
class Counter {
    constructor(storage, { ttl, limit = 1, retryDelay = 0, prefix = '' }) {
        if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
            throw new Error(exports.ErrInvalidTTL);
        }
        if (!(Number.isSafeInteger(limit) && limit > 0)) {
            throw new Error(exports.ErrInvalidLimit);
        }
        if (!(Number.isSafeInteger(retryDelay) && retryDelay >= 0)) {
            throw new Error(exports.ErrInvalidRetryDelay);
        }
        this._storage = storage;
        this._ttl = ttl;
        this._limit = limit;
        this._retryDelay = retryDelay;
        this._prefix = prefix;
    }
    /**
     * Increments key value,
     * returns -1 if key value less than or equal limit,
     * returns ttl in milliseconds if key value greater than limit.
     */
    count(key) {
        return this._count(this._prefix + key);
    }
    async _count(key) {
        const v = await this._storage.incr(key, this._limit, this._ttl);
        if (v === -1) {
            return v;
        }
        if (v >= this._retryDelay) {
            return v;
        }
        await sleep(v);
        return this._storage.incr(key, this._limit, this._ttl);
    }
}
exports.Counter = Counter;
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
