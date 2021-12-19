/** Counter value increment result. */
export class Result {
	private c: number;
	private t: number;
	private limit: number;

	constructor(counter: number, ttl: number, limit: number) {
		this.c = counter;
		this.t = ttl;
		this.limit = limit;
	}

	/** Operation success flag. */
	get ok(): boolean {
		return this.t === -1;
	}

	/** Current counter value. */
	get counter(): number {
		return this.c;
	}

	/** Diff between limit and current counter value. */
	get remainder(): number {
		return this.limit - this.c;
	}

	/**
	 * TTL of the current window in milliseconds.
	 * Makes sense if operation failed, otherwise ttl is less than 0.
	 */
	get ttl(): number {
		return this.t;
	}
}
