import { Storage } from './storage'

export interface ValueTTL {
  value: number
  ttl: number
}

export class Gateway {
  private _storage: Storage
  private _timer: NodeJS.Timer
  constructor(cleanupInterval: number) {
    this._storage = new Storage()
    this._timer = setInterval(() => {
      this._storage.deleteExpired()
    }, cleanupInterval)
    this._timer.unref()
  }
  incr(key: string, ttl: number): Promise<ValueTTL> {
    return this._storage.incr(key, ttl)
  }
  get(key: string): ValueTTL {
    return this._storage.get(key)
  }
  stopCleanupTimer() {
    clearInterval(this._timer)
  }
}
