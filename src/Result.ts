export type Response = [number, number];

/** Counter value increment result. */
export class Result {
	private response: Response;
	private limit: number;

	constructor(response: Response, limit: number) {
		this.response = response;
		this.limit = limit;
	}

	/** Operation success flag. */
	get ok(): boolean {
		return this.response[1] === -1;
	}

	/** Current counter value. */
	get counter(): number {
		return this.response[0];
	}

	/** Diff between limit and current counter value. */
	get remainder(): number {
		return this.limit - this.response[0];
	}

	/**
	 * TTL of the current window in milliseconds.
	 * Makes sense if operation failed, otherwise ttl is less than 0.
	 */
	get ttl(): number {
		if (this.response[1] === -2) {
			return 0;
		}
		return this.response[1];
	}
}
