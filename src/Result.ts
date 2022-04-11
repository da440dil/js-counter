export type Result = {
	/** Operation success flag. */
	ok: boolean;
	/** Current counter value. */
	counter: number;
	/** Diff between limit and current counter value. */
	remainder: number;
	/** TTL of the current window in milliseconds. */
	ttl: number;
};
