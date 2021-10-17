import { readFileSync } from 'fs';
import { resolve } from 'path';
import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter, WindowParams } from './Counter';
import { ICounter } from './ICounter';
import { Limiter } from './Limiter';
import { LimiterSuite } from './LimiterSuite';
import { ILimiter, LimitResult } from './ILimiter';

export { ICounter, CountResult } from './ICounter';
export { IRedisClient, WindowParams, LimitResult };

let fixedWindowSrc: string;

/** Creates new counter which implements distributed counter using fixed window algorithm. */
export const fixedWindow = (client: IRedisClient, { size, limit }: WindowParams): ICounter => {
	if (!fixedWindowSrc) {
		fixedWindowSrc = readFileSync(resolve(__dirname, '../fixedwindow.lua')).toString();
	}
	return new Counter(client, { size, limit, src: fixedWindowSrc });
};

let slidingWindowSrc: string;

/** Creates new counter which implements distributed counter using sliding window algorithm. */
export const slidingWindow = (client: IRedisClient, { size, limit }: WindowParams): ICounter => {
	if (!slidingWindowSrc) {
		slidingWindowSrc = readFileSync(resolve(__dirname, '../slidingwindow.lua')).toString();
	}
	return new Counter(client, { size, limit, src: slidingWindowSrc });
};

/** Creates new limiter which implements distributed rate limiting. */
export const createLimiter = (client: IRedisClient, param: LimiterParams, ...params: LimiterParams[]): ILimiter => {
	if (params.length === 0) {
		return fromWindowType(client, param);
	}
	return new LimiterSuite(params.concat(param).map((v) => fromWindowType(client, v)));
};

export const WindowType = {
	/** Fixed window. */
	Fixed: 'fixed',
	/** Sliding window. */
	Sliding: 'sliding'
} as const;

export type WindowType = typeof WindowType[keyof typeof WindowType];

export type LimiterParams = {
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

function fromWindowType(client: IRedisClient, { type = WindowType.Fixed, rate = 1, size, limit }: LimiterParams): ILimiter {
	const counter = type === WindowType.Sliding ? slidingWindow(client, { size, limit }) : fixedWindow(client, { size, limit });
	return new Limiter(rate, counter);
}
