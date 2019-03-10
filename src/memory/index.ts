/**
 * Storage implements storage in memory.
 */
export interface Storage {
  incr(key: string, limit: number, ttl: number): Promise<number>;
  /** Stops refresh cycle. */
  quit(): void;
  /** Deletes key. */
  del(key: string): void;
}

/**
 * Creates new Storage.
 * @param refreshInterval Interval to remove stale keys in milliseconds.
 */
export function createStorage(refreshInterval: number): Storage {
  return new MemoryStorage(refreshInterval)
}

type Data = {
  value: number;
  ttl: number;
}

class MemoryStorage {
  private _db: Map<string, Data>;
  private _timeout: number;
  private _timer?: NodeJS.Timeout;
  constructor(timeout: number) {
    this._db = new Map()
    this._timeout = timeout
    this._init()
  }
  private _init() {
    this._timer = setTimeout(() => {
      if (this._timer === undefined) {
        return
      }
      for (let [k, v] of this._db) {
        v.ttl = v.ttl - this._timeout
        if (v.ttl <= 0) {
          this._db.delete(k)
        }
      }
      this._init()
    }, this._timeout)
  }
  quit() {
    if (this._timer === undefined) {
      return
    }
    clearTimeout(this._timer)
    this._timer = undefined
  }
  del(key: string): void {
    this._db.delete(key)
  }
  async incr(key: string, limit: number, ttl: number): Promise<number> {
    const v = this._db.get(key)
    if (v !== undefined) {
      v.value = v.value + 1
      if (v.value > limit) {
        return v.ttl
      }
      return -1
    }
    this._db.set(key, { value: 1, ttl: ttl })
    return -1
  }  
}
