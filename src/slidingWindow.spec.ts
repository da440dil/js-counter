import { promisify } from 'util';
import { createClient, RedisClient } from 'redis';
import { slidingWindow } from './slidingWindow';
import { Counter } from './Counter';

const sleep = promisify(setTimeout);

const key = 'sw';

let client: RedisClient;
beforeAll(() => {
	client = createClient();
});
afterAll((cb) => {
	client.quit(cb);
});
beforeEach((cb) => {
	client.del(key, cb);
});

it('slidingWindow', async () => {
	const size = 1000;
	const limit = 100;
	const counter = slidingWindow({ client, size, limit });
	expect(counter).toBeInstanceOf(Counter);

	let result = await counter.count(key, 101);
	expect(result.ok).toEqual(false);
	expect(result.counter).toEqual(0);
	expect(result.ttl).toBeGreaterThanOrEqual(0);
	expect(result.ttl).toBeLessThanOrEqual(size);

	await sleep(result.ttl); // wait for the next window to start

	result = await counter.count(key, 20);
	expect(result.ok).toEqual(true);
	expect(result.counter).toEqual(20);
	expect(result.ttl).toEqual(-1);

	result = await counter.count(key, 30);
	expect(result.ok).toEqual(true);
	expect(result.counter).toEqual(50);
	expect(result.ttl).toEqual(-1);

	result = await counter.count(key, 51);
	expect(result.ok).toEqual(false);
	expect(result.counter).toEqual(50);
	expect(result.ttl).toBeGreaterThanOrEqual(0);
	expect(result.ttl).toBeLessThanOrEqual(size);

	await sleep(result.ttl); // wait for the next window to start

	result = await counter.count(key, 70);
	expect(result.ok).toEqual(false);
	expect(result.counter).toBeGreaterThan(30);
	expect(result.counter).toBeLessThanOrEqual(limit);
	expect(result.ttl).toBeGreaterThanOrEqual(0);
	expect(result.ttl).toBeLessThanOrEqual(size);

	await sleep(700); // wait for the most time of the current window to pass

	result = await counter.count(key, 70);
	expect(result.ok).toEqual(true);
	expect(result.counter).toBeGreaterThan(70);
	expect(result.counter).toBeLessThanOrEqual(limit);
	expect(result.ttl).toEqual(-1);

	expect(slidingWindow({ client, size, limit })).toBeInstanceOf(Counter);
});
