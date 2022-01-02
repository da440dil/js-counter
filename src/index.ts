import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter, Algorithm } from './Counter';
import { Result } from './Result';
import { Limiter } from './Limiter';
import { BatchLimiter } from './BatchLimiter';
import { ILimiter } from './ILimiter';

export { IRedisClient, Counter, Result, Algorithm, ILimiter };

/**
 * Creates new counter which implements distributed counter using fixed window algorithm.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param size Window size in milliseconds. Must be greater than 0.
 * @param limit Maximum key value per window. Must be greater than 0.
 */
export const fixedWindow = (client: IRedisClient, size: number, limit: number): Counter => {
	return new Counter(client, size, limit, Algorithm.Fixed);
};

/**
 * Creates new counter which implements distributed counter using sliding window algorithm.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param size Window size in milliseconds. Must be greater than 0.
 * @param limit Maximum key value per window. Must be greater than 0.
 */
export const slidingWindow = (client: IRedisClient, size: number, limit: number): Counter => {
	return new Counter(client, size, limit, Algorithm.Sliding);
};

/**
 * Creates new limiter which implements distributed rate limiting.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param first Params of the first limit.
 * @param rest Params of the rest limits.
 */
export const createLimiter = (client: IRedisClient, first: Params, ...rest: Params[]): ILimiter => {
	if (rest.length === 0) {
		const { size, limit, prefix, rate, algorithm } = withDefaults(first);
		const counter = new Counter(client, size, limit, algorithm);
		return new Limiter(counter, prefix, rate);
	}
	const params = [first].concat(rest).map(withDefaults);
	const prefixes: string[] = [];
	const args: number[] = [];
	for (const param of params) {
		prefixes.push(param.prefix);
		args.push(param.rate, param.size, param.limit, param.algorithm);
	}
	return new BatchLimiter(client, prefixes, args);
};

/** Parameters to build a limit. */
export type Params = {
	/** Window size in milliseconds. Must be greater than 0. */
	size: number;
	/** Maximum key value per window. Must be greater than 0. */
	limit: number;
	/** 
	 * Unique limit name, every Redis key will be prefixed with this name.
	 * By default is pseudo-random string.
	 */
	name?: string;
	/**
	 * The rate of decreasing the window size on each next application of the limit.
	 * Must be greater than 0. By default equal 1.
	 */
	rate?: number;
	/**
	 * One of algorithms: 1 stands for the fixed window algorithm, 2 stands for the sliding window algorithm.
	 * By default equal 1.
	 */
	algorithm?: Algorithm;
};

function withDefaults(params: Params): Required<Omit<Params, 'name'>> & { prefix: string; } {
	return {
		size: params.size,
		limit: params.limit,
		prefix: params.name ? `${params.name}:` : `${String(Math.random()).slice(2)}:`,
		rate: params.rate || 1,
		algorithm: params.algorithm === Algorithm.Sliding ? Algorithm.Sliding : Algorithm.Fixed
	};
}
