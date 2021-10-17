/** Implements distributed counter. */
export interface ICounter {
	/**
	 * Increments key value by specified value.
	 * @param key The key to be incremented.
	 * @param value The value the key value to be incremented by.
	 */
	count(key: string, value: number): Promise<CountResult>;
}

/** Result of count() operation. */
export type CountResult = {
	/** Operation success flag. */
	ok: boolean;
	/**
	 * Counter after increment.
	 * With fixed window algorithm in use counter is current window counter.
	 * With sliding window algorithm in use counter is sliding window counter.
	 */
	counter: number;
	/**
	 * TTL of the current window in milliseconds.
	 * Makes sense if operation failed, otherwise ttl is less than 0.
	 */
	ttl: number;
};
