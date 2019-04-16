"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ErrInvalidTTL is the error message returned when createCounter receives invalid value of ttl. */
exports.ErrInvalidTTL = 'ttl must be an integer greater than zero';
/** ErrInvalidLimit is the error message returned when createCounter receives invalid value of limit. */
exports.ErrInvalidLimit = 'limit must be an integer greater than zero';
/**
 * Creates new Counter.
 */
function createCounter(storage, { ttl, limit = 1, prefix = '' }) {
    if (!(Number.isSafeInteger(ttl) && ttl > 0)) {
        throw new Error(exports.ErrInvalidTTL);
    }
    if (!(Number.isSafeInteger(limit) && limit > 0)) {
        throw new Error(exports.ErrInvalidLimit);
    }
    return new CounterImpl(storage, ttl, limit, prefix);
}
exports.createCounter = createCounter;
class CounterImpl {
    constructor(storage, ttl, limit, prefix) {
        this._storage = storage;
        this._ttl = ttl;
        this._limit = limit > 0 ? limit : 1;
        this._prefix = prefix;
    }
    count(key) {
        return this._storage.incr(this._prefix + key, this._limit, this._ttl);
    }
}
