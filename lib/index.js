"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates new Counter.
 */
function createCounter(storage, params) {
    return new CounterImpl(storage, params);
}
exports.createCounter = createCounter;
class CounterImpl {
    constructor(storage, { ttl, limit = 1, prefix = '' }) {
        this._storage = storage;
        this._ttl = ttl;
        this._limit = limit > 0 ? limit : 1;
        this._prefix = prefix;
    }
    count(key) {
        return this._storage.incr(this._prefix + key, this._limit, this._ttl);
    }
}
