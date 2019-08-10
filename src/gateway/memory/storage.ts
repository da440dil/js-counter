interface Item {
  value: number
  expiresAt: number
}

export interface ValueTTL {
  value: number
  ttl: number
}

export class Storage {
  private _items: Map<string, Item>
  constructor() {
    this._items = new Map()
  }
  async incr(key: string, ttl: number): Promise<ValueTTL> {
    const now = Date.now()
    const item = this._items.get(key)
    if (item !== undefined) {
      const exp = item.expiresAt - now
      if (exp > 0) {
        item.value++
        return { value: item.value, ttl: exp }
      }
    }
    this._items.set(key, { value: 1, expiresAt: now + ttl })
    return { value: 1, ttl }
  }
  deleteExpired() {
    const now = Date.now()
    for (const [k, v] of this._items) {
      const exp = v.expiresAt - now
      if (exp <= 0) {
        this._items.delete(k)
      }
    }
  }
  get(key: string): ValueTTL {
    const item = this._items.get(key)
    if (item !== undefined) {
      const exp = item.expiresAt - Date.now()
      if (exp > 0) {
        return { value: item.value, ttl: exp }
      }
    }
    return { value: 0, ttl: -2 }
  }
}
