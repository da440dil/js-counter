import { promisify } from 'util';
import { createClient, RedisClient } from 'redis';
import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter, createLimiter, Params, Algorithm } from '.';
import { Limiter } from './Limiter';
import { LimiterSuite } from './LimiterSuite';

const sleep = promisify(setTimeout);

describe('counter', () => {
	let client: RedisClient;
	beforeAll(() => {
		client = createClient();
	});
	afterAll((cb) => {
		client.quit(cb);
	});

	const key = 'key';
	beforeEach((cb) => {
		client.del(key, cb);
	});

	it('fixedWindow', async () => {
		const size = 1000;
		const limit = 100;
		const counter = Counter.fixedWindow(client, size, limit);
		expect(counter).toBeInstanceOf(Counter);

		let result = await counter.count(key, 101);
		expect(result.ok).toEqual(false);
		expect(result.counter).toEqual(0);
		expect(result.remainder).toEqual(100);
		expect(result.ttl).toEqual(0);

		result = await counter.count(key, 20);
		expect(result.ok).toEqual(true);
		expect(result.counter).toEqual(20);
		expect(result.remainder).toEqual(80);
		expect(result.ttl).toEqual(-1);

		result = await counter.count(key, 30);
		expect(result.ok).toEqual(true);
		expect(result.counter).toEqual(50);
		expect(result.remainder).toEqual(50);
		expect(result.ttl).toEqual(-1);

		result = await counter.count(key, 51);
		expect(result.ok).toEqual(false);
		expect(result.counter).toEqual(50);
		expect(result.remainder).toEqual(50);
		expect(result.ttl).toBeGreaterThanOrEqual(0);
		expect(result.ttl).toBeLessThanOrEqual(size);

		await sleep(result.ttl + 100); // wait for the next window to start

		result = await counter.count(key, 70);
		expect(result.ok).toEqual(true);
		expect(result.counter).toEqual(70);
		expect(result.remainder).toEqual(30);
		expect(result.ttl).toEqual(-1);
	});

	it('slidingWindow', async () => {
		const size = 1000;
		const limit = 100;
		const counter = Counter.slidingWindow(client, size, limit);
		expect(counter).toBeInstanceOf(Counter);

		let result = await counter.count(key, 101);
		expect(result.ok).toEqual(false);
		expect(result.counter).toEqual(0);
		expect(result.remainder).toEqual(100);
		expect(result.ttl).toBeGreaterThanOrEqual(0);
		expect(result.ttl).toBeLessThanOrEqual(size);

		await sleep(result.ttl); // wait for the next window to start

		result = await counter.count(key, 20);
		expect(result.ok).toEqual(true);
		expect(result.counter).toEqual(20);
		expect(result.remainder).toEqual(80);
		expect(result.ttl).toEqual(-1);

		result = await counter.count(key, 30);
		expect(result.ok).toEqual(true);
		expect(result.counter).toEqual(50);
		expect(result.remainder).toEqual(50);
		expect(result.ttl).toEqual(-1);

		result = await counter.count(key, 51);
		expect(result.ok).toEqual(false);
		expect(result.counter).toEqual(50);
		expect(result.remainder).toEqual(50);
		expect(result.ttl).toBeGreaterThanOrEqual(0);
		expect(result.ttl).toBeLessThanOrEqual(size);

		await sleep(result.ttl); // wait for the next window to start

		result = await counter.count(key, 70);
		expect(result.ok).toEqual(false);
		expect(result.counter).toBeGreaterThan(30);
		expect(result.counter).toBeLessThanOrEqual(limit);
		expect(result.remainder).toBeGreaterThanOrEqual(0);
		expect(result.remainder).toBeLessThan(70);
		expect(result.ttl).toBeGreaterThanOrEqual(0);
		expect(result.ttl).toBeLessThanOrEqual(size);

		await sleep(700); // wait for the most time of the current window to pass

		result = await counter.count(key, 70);
		expect(result.ok).toEqual(true);
		expect(result.counter).toBeGreaterThan(70);
		expect(result.counter).toBeLessThanOrEqual(limit);
		expect(result.remainder).toBeGreaterThanOrEqual(0);
		expect(result.remainder).toBeLessThanOrEqual(30);
		expect(result.ttl).toEqual(-1);
	});
});

describe('createLimiter', () => {
	const fixedWindow = jest.spyOn(Counter, 'fixedWindow');
	const slidingWindow = jest.spyOn(Counter, 'slidingWindow');

	afterEach(() => {
		jest.resetAllMocks();
	});

	const client = {} as IRedisClient;
	const params: Params = { size: 1000, limit: 100 };

	it('should create Limiter with single param', () => {
		expect(createLimiter(client, params)).toBeInstanceOf(Limiter);
	});

	it('should create LimiterSuite with multiple params', () => {
		expect(createLimiter(client, params, params)).toBeInstanceOf(LimiterSuite);
	});

	it('should use fixed fixed window algorithm without param.algorithm', () => {
		createLimiter(client, params);
		expect(fixedWindow.mock.calls.length).toBe(1);
		expect(slidingWindow.mock.calls.length).toBe(0);
	});

	it(`should use fixed fixed window algorithm with "${Algorithm.Fixed}" param.algorithm`, () => {
		createLimiter(client, { ...params, algorithm: Algorithm.Fixed });
		expect(fixedWindow.mock.calls.length).toBe(1);
		expect(slidingWindow.mock.calls.length).toBe(0);
	});

	it(`should use fixed fixed window algorithm with "${Algorithm.Sliding}" param.algorithm`, () => {
		createLimiter(client, { ...params, algorithm: Algorithm.Sliding });
		expect(fixedWindow.mock.calls.length).toBe(0);
		expect(slidingWindow.mock.calls.length).toBe(1);
	});
});
