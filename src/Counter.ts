import { readFileSync } from 'fs';
import { resolve } from 'path';
import { IRedisClient, IRedisScript, createScript } from '@da440dil/js-redis-script';

const fwsrc = readFileSync(resolve(__dirname, '../fixedwindow.lua')).toString();
const swsrc = readFileSync(resolve(__dirname, '../slidingwindow.lua')).toString();

export class Counter {
	/**
	 * Creates new counter which implements distributed counter using fixed window algorithm.
	 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
	 * @param size Window size in milliseconds. Must be greater than 0.
	 * @param limit Maximum key value per window. Must be greater than 0.
	 */
	public static fixedWindow(client: IRedisClient, size: number, limit: number): Counter {
		return new Counter(client, size, limit, fwsrc);
	}

	/**
	 * Creates new counter which implements distributed counter using sliding window algorithm.
	 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
	 * @param size Window size in milliseconds. Must be greater than 0.
	 * @param limit Maximum key value per window. Must be greater than 0.
	 */
	public static slidingWindow(client: IRedisClient, size: number, limit: number): Counter {
		return new Counter(client, size, limit, swsrc);
	}

	private size: number;
	private limit: number;
	private script: IRedisScript<[number, number]>;

	private constructor(client: IRedisClient, size: number, limit: number, src: string) {
		this.size = size;
		this.limit = limit;
		this.script = createScript<[number, number]>({ client, src, numberOfKeys: 1 });
	}

	/**
	 * Increments key value by specified value.
	 * @param key The key to be incremented.
	 * @param value The value the key value to be incremented by.
	 */
	public async count(key: string, value: number): Promise<Result> {
		const res = await this.script.run(key, value, this.size, this.limit);
		return {
			ok: res[1] === -1,
			counter: res[0],
			remainder: this.limit - res[0],
			ttl: res[1] === -2 ? 0 : res[1]
		};
	}
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
