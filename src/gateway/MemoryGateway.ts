import { IGateway, IValueTTL } from '../IGateway';
import { MemoryStorage } from './MemoryStorage';

/** Implements gateway to memory storage. */
export class MemoryGateway implements IGateway {
  private storage: MemoryStorage;
  private timer: NodeJS.Timer;

  constructor(cleanupInterval: number) {
    this.storage = new MemoryStorage();
    this.timer = setInterval(() => {
      this.storage.deleteExpired();
    }, cleanupInterval);
    this.timer.unref();
  }

  public async incr(key: string, ttl: number): Promise<IValueTTL> {
    return this.storage.incr(key, ttl);
  }

  /** Gets value and TTL of a key. For testing. */
  public get(key: string): IValueTTL {
    return this.storage.get(key);
  }

  /** Stops timer created at constructor. */
  public stopCleanupTimer() {
    clearInterval(this.timer);
  }
}
