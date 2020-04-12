import { IValueTTL } from '../IGateway';

interface IValueExpiresAt {
  value: number;
  expiresAt: number;
}

export class MemoryStorage {
  private items: Map<string, IValueExpiresAt>;

  constructor() {
    this.items = new Map();
  }

  public incr(key: string, ttl: number): IValueTTL {
    const now = Date.now();
    const item = this.items.get(key);
    if (item !== undefined) {
      const exp = item.expiresAt - now;
      if (exp > 0) {
        item.value++;
        return { value: item.value, ttl: exp };
      }
    }
    this.items.set(key, { value: 1, expiresAt: now + ttl });
    return { value: 1, ttl };
  }

  /** Deletes expired keys. Expected to be called at regular intervals. */
  public deleteExpired() {
    const now = Date.now();
    for (const [k, v] of this.items) {
      const exp = v.expiresAt - now;
      if (exp <= 0) {
        this.items.delete(k);
      }
    }
  }

  /** Gets value and TTL of a key. For testing. */
  public get(key: string): IValueTTL {
    const item = this.items.get(key);
    if (item !== undefined) {
      const exp = item.expiresAt - Date.now();
      if (exp > 0) {
        return { value: item.value, ttl: exp };
      }
    }
    return { value: 0, ttl: -2 };
  }
}
