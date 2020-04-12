/** Error which is thrown when Counter failed to count. */
export class TTLError extends Error {
  /** Error message which is thrown when Counter failed to count. */
  public static readonly ErrTooManyRequests = 'Too Many Requests';

  /** TTL of a key in milliseconds. */
  public readonly ttl: number;

  constructor(ttl: number) {
    super(TTLError.ErrTooManyRequests);
    this.ttl = ttl;
  }
}
