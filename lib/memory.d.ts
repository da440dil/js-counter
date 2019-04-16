export declare class Storage {
    private _db;
    private _timeout;
    private _timer?;
    /**
     * @param refreshInterval Interval to remove stale keys in milliseconds.
     */
    constructor(refreshInterval: number);
    private _init;
    quit(): void;
    del(key: string): void;
    incr(key: string, limit: number, ttl: number): Promise<number>;
}
