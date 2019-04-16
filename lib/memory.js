"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Storage {
    /**
     * @param refreshInterval Interval to remove stale keys in milliseconds.
     */
    constructor(refreshInterval) {
        this._db = new Map();
        this._timeout = refreshInterval;
        this._init();
    }
    _init() {
        this._timer = setTimeout(() => {
            if (this._timer === undefined) {
                return;
            }
            for (let [k, v] of this._db) {
                v.ttl = v.ttl - this._timeout;
                if (v.ttl <= 0) {
                    this._db.delete(k);
                }
            }
            this._init();
        }, this._timeout);
    }
    quit() {
        if (this._timer === undefined) {
            return;
        }
        clearTimeout(this._timer);
        this._timer = undefined;
    }
    del(key) {
        this._db.delete(key);
    }
    async incr(key, limit, ttl) {
        const v = this._db.get(key);
        if (v !== undefined) {
            v.value = v.value + 1;
            if (v.value > limit) {
                return v.ttl;
            }
            return -1;
        }
        this._db.set(key, { value: 1, ttl: ttl });
        return -1;
    }
}
exports.Storage = Storage;
