/** Implements distributed counter. */
export interface ICounter {
	/**
	 * Increments key value by specified value.
	 * @param key The key to be incremented.
	 * @param value The value the key value to be incremented by.
	 */
	count(key: string, value: number): Promise<Result>;
}

/** Counter value increment result. */
export type Result = {
	/** Operation success flag. */
	ok: boolean;
	/** Current counter value. */
	counter: number;
	/** Diff between limit and current counter value. */
	remainder: number;
	/**
	 * TTL of the current window in milliseconds.
	 * Makes sense if operation failed, otherwise ttl is less than 0.
	 */
	ttl: number;
};
