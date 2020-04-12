/** Gateway to storage to store a counter value. */
export interface IGateway {
  /**
   * Sets key value and TTL of key if key not exists.
   * Increments key value if key exists.
   */
  incr(key: string, ttl: number): Promise<IValueTTL>;
}

/** Result of increment operation. */
export interface IValueTTL {
  /** Key value after increment. */
  value: number;
  /** TTL of a key in milliseconds. */
  ttl: number;
}
