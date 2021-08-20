import { IRedisClient, IRedisScript, createScript } from '@da440dil/js-redis-script';

export class Counter implements ICounter {
	private size: number;
	private limit: number;
	private script: IRedisScript<[number, number]>;

	constructor({ client, size, limit, src }: WindowParams & { src: string; }) {
		this.size = size;
		this.limit = limit;
		this.script = createScript<[number, number]>({ client, src, numberOfKeys: 1 });
	}

	public async count(key: string, value: number): Promise<IResult> {
		const res = await this.script.run(key, value, this.size, this.limit);
		return { ok: res[1] === -1, counter: res[0], ttl: res[1] };
	}
}

/** Implements distributed rate limiting. */
export interface ICounter {
	/** Increments key by value. */
	count(key: string, value: number): Promise<IResult>;
}

/** Result of count() operation. */
export interface IResult {
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
}

export type WindowParams = {
	/** Redis client: [node-redis](https://github.com/NodeRedis/node-redis) or [ioredis](https://github.com/luin/ioredis). */
	client: IRedisClient;
	/** Window size in milliseconds. Must be greater than 0. */
	size: number;
	/** Maximum key value per window. Must be greater than 0. */
	limit: number;
};
