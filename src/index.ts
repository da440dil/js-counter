import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter, Result } from './Counter';
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
export const createLimiter = (client: IRedisClient, first: LimiterParams, ...rest: LimiterParams[]): ILimiter => {
	if (rest.length === 0) {
		return fromWindowType(client, first);
	}
	return new LimiterSuite([first].concat(rest).map((v) => fromWindowType(client, v)));
};

export const WindowType = {
	/** Fixed window. */
	Fixed: 'fixed',
	/** Sliding window. */
	Sliding: 'sliding'
} as const;

export type WindowType = typeof WindowType[keyof typeof WindowType];

export type LimiterParams = {
	/** Window size in milliseconds. Must be greater than 0. */
	size: number;
	/** Maximum key value per window. Must be greater than 0. */
	limit: number;
	/** Unique limiter name, every Redis key will be prefixed with this name. */
	name?: string;
	/**
	 * One of algorithms: "fixed" for the fixed window algorithm, "sliding" for the sliding window algorithm.
	 * By default equal "fixed".
	 */
	type?: WindowType;
	/**
	 * The rate of decreasing the window size on each next limiter call.
	 * Must be greater than 0. By default equal 1.
	 */
	rate?: number;
};

function fromWindowType(client: IRedisClient, { name = String(Math.random()).slice(2), type = WindowType.Fixed, rate = 1, size, limit }: LimiterParams): ILimiter {
	const counter = type === WindowType.Sliding ? Counter.slidingWindow(client, size, limit) : Counter.fixedWindow(client, size, limit);
	return new Limiter(name, rate, counter);
}
