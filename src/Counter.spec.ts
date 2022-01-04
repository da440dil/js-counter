import { promisify } from 'util';
import { createClient } from 'redis';
import { fixedWindow, slidingWindow } from '.';

const sleep = promisify(setTimeout);

const client = createClient();
beforeAll(async () => {
	await client.connect();
});
afterAll(async () => {
	await client.quit();
});

const key = 'key';
beforeEach(async () => {
	await client.del(key);
});

it('fixedWindow', async () => {
	const size = 1000;
	const limit = 100;
	const counter = fixedWindow(client, size, limit);

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
	const counter = slidingWindow(client, size, limit);

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
