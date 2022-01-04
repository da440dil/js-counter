import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createScript, IRedisClient, INodeRedisClient, IRedisScript } from '@da440dil/js-redis-script';
import { Result } from './Result';

const fwsrc = readFileSync(resolve(__dirname, '../fixedwindow.lua')).toString();
const swsrc = readFileSync(resolve(__dirname, '../slidingwindow.lua')).toString();

/** One of algorithms: 1 stands for the fixed window algorithm, 2 stands for the sliding window algorithm. */
export const Algorithm = {
	/** Fixed window. */
	Fixed: 1,
	/** Sliding window. */
	Sliding: 2
} as const;

export type Algorithm = typeof Algorithm[keyof typeof Algorithm];

/** Implements distributed counter. */
export class Counter {
	private size: number;
	private limit: number;
	private script: IRedisScript<Response>;

	constructor(client: IRedisClient | INodeRedisClient, size: number, limit: number, algorithm: Algorithm) {
		this.size = size;
		this.limit = limit;
		this.script = createScript<Response>(client, algorithm === Algorithm.Sliding ? swsrc : fwsrc, 1);
	}

	/**
	 * Increments key value by specified value.
	 * @param key The key to be incremented.
	 * @param value The value the key value to be incremented by.
	 */
	public async count(key: string, value: number): Promise<Result> {
		const v = await this.script.run(key, value, this.size, this.limit);
		return new Result(v[0], v[1], this.limit);
	}
}

type Response = [number, number];
