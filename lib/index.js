"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ErrInvalidTTL is the error message returned when Counter constructor receives invalid value of ttl. */
exports.ErrInvalidTTL = 'ttl must be an integer greater than zero';
/** ErrInvalidLimit is the error message returned when Counter constructor receives invalid value of limit. */
exports.ErrInvalidLimit = 'limit must be an integer greater than zero';
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
     * Increments key value,
     * returns -1 if key value less than or equal limit,
     * returns ttl in milliseconds if key value greater than limit.
     */
    count(key) {
        return this._storage.incr(this._prefix + key, this._limit, this._ttl);
    }
}
exports.Counter = Counter;
