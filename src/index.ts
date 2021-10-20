import { readFileSync } from 'fs';
import { resolve } from 'path';
import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter, WindowParams } from './Counter';
import { ICounter, Result } from './ICounter';
import { Limiter } from './Limiter';
import { LimiterSuite } from './LimiterSuite';
import { ILimiter } from './ILimiter';

export { IRedisClient, WindowParams, ICounter, Result, ILimiter };

let fixedWindowSrc: string;

/**
 * Creates new counter which implements distributed counter using fixed window algorithm.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param params Window params.
 */
export const fixedWindow = (client: IRedisClient, { size, limit }: WindowParams): ICounter => {
	if (!fixedWindowSrc) {
		fixedWindowSrc = readFileSync(resolve(__dirname, '../fixedwindow.lua')).toString();
	}
	return new Counter(client, { size, limit, src: fixedWindowSrc });
};

let slidingWindowSrc: string;

/**
 * Creates new counter which implements distributed counter using sliding window algorithm.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) and [ioredis](https://github.com/luin/ioredis) both implement it.
 * @param params Window params.
 */
export const slidingWindow = (client: IRedisClient, { size, limit }: WindowParams): ICounter => {
	if (!slidingWindowSrc) {
		slidingWindowSrc = readFileSync(resolve(__dirname, '../slidingwindow.lua')).toString();
	}
	return new Counter(client, { size, limit, src: slidingWindowSrc });
};

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
} & WindowParams;

function fromWindowType(client: IRedisClient, { name = String(Math.random()).slice(2), type = WindowType.Fixed, rate = 1, size, limit }: LimiterParams): ILimiter {
	const counter = type === WindowType.Sliding ? slidingWindow(client, { size, limit }) : fixedWindow(client, { size, limit });
	return new Limiter(name, rate, counter);
}
