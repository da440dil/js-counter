import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter } from './Counter';
import { Result } from './Result';
import { Limiter } from './Limiter';
import { LimiterSuite } from './LimiterSuite';
import { ILimiter } from './ILimiter';

export { IRedisClient, Counter, Result, ILimiter };

/**
 * Creates new limiter which implements distributed rate limiting.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param first Params of the first limiter.
 * @param rest Params of the rest limiters.
 */
export const createLimiter = (client: IRedisClient, first: Params, ...rest: Params[]): ILimiter => {
	if (rest.length === 0) {
		return fromAlgorithm(client, first);
	}
	return new LimiterSuite([first].concat(rest).map((v) => fromAlgorithm(client, v)));
};

export type Params = {
	/** Window size in milliseconds. Must be greater than 0. */
	size: number;
	/** Maximum key value per window. Must be greater than 0. */
	limit: number;
	/** Unique limiter name, every Redis key will be prefixed with this name. */
	name?: string;
	/**
	 * The rate of decreasing the window size on each next limiter call.
	 * Must be greater than 0. By default equal 1.
	 */
	rate?: number;
	/**
	 * One of algorithms: "fixed" for the fixed window algorithm, "sliding" for the sliding window algorithm.
	 * By default equal "fixed".
	 */
	algorithm?: Algorithm;
};

export const Algorithm = {
	/** Fixed window. */
	Fixed: 'fixed',
	/** Sliding window. */
	Sliding: 'sliding'
} as const;

export type Algorithm = typeof Algorithm[keyof typeof Algorithm];

function fromAlgorithm(client: IRedisClient, { size, limit, name = String(Math.random()).slice(2), rate = 1, algorithm = Algorithm.Fixed }: Params): ILimiter {
	const counter = algorithm === Algorithm.Sliding ? Counter.slidingWindow(client, size, limit) : Counter.fixedWindow(client, size, limit);
	return new Limiter(counter, name, rate);
}
