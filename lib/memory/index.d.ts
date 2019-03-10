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
export declare function createStorage(refreshInterval: number): Storage;
