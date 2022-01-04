import { hrtime } from 'process';
import { createClient, RedisClientType } from 'redis';
import { fixedWindow, slidingWindow, Counter, Result, createLimiter, ILimiter } from '../src';

async function main() {
	const client = createClient();
	await client.connect();
	await app(client as RedisClientType);
	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

async function app(client: RedisClientType): Promise<void> {
	await client.FLUSHDB();

	const key = 'test';
	const value = 1;
	const batchSize = parseInt(process.env.BENCHMARK_SIZE || '10000', 10);

	const size = 60000;
	const limit = batchSize + 1;

	const fixedWindowCounter = fixedWindow(client, size, limit);
	const fixedWindowTime = await testCounter(client, fixedWindowCounter, key, value, batchSize);

	const slidingWindowCounter = slidingWindow(client, size, limit);
	const slidingWindowTime = await testCounter(client, slidingWindowCounter, key, value, batchSize);

	const limiterOne = createLimiter(client, { size, limit });
	const limiterOneTime = await testLimiter(client, limiterOne, key, batchSize);

	const limiterTwo = createLimiter(client, { size, limit }, { size: size * 2, limit: limit * 2 });
	const limiterTwoTime = await testLimiter(client, limiterTwo, key, batchSize);

	const limiterThree = createLimiter(client, { size, limit }, { size: size * 2, limit: limit * 2 }, { size: size * 3, limit: limit * 3 });
	const limiterThreeTime = await testLimiter(client, limiterThree, key, batchSize);

	const limiterFour = createLimiter(client, { size, limit }, { size: size * 2, limit: limit * 2 }, { size: size * 3, limit: limit * 3 }, { size: size * 4, limit: limit * 4 });
	const limiterFourTime = await testLimiter(client, limiterFour, key, batchSize);

	console.table({
		'Fixed Window': {
			'Total (req)': batchSize,
			'Total (ms)': fixedWindowTime,
			'Avg (req/sec)': toReqPerSec(batchSize, fixedWindowTime)
		},
		'Sliding Window': {
			'Total (req)': batchSize,
			'Total (ms)': slidingWindowTime,
			'Avg (req/sec)': toReqPerSec(batchSize, slidingWindowTime)
		},
		'Limiter One': {
			'Total (req)': batchSize,
			'Total (ms)': limiterOneTime,
			'Avg (req/sec)': toReqPerSec(batchSize, limiterOneTime)
		},
		'Limiter Two': {
			'Total (req)': batchSize,
			'Total (ms)': limiterTwoTime,
			'Avg (req/sec)': toReqPerSec(batchSize, limiterTwoTime)
		},
		'Limiter Three': {
			'Total (req)': batchSize,
			'Total (ms)': limiterThreeTime,
			'Avg (req/sec)': toReqPerSec(batchSize, limiterThreeTime)
		},
		'Limiter Four': {
			'Total (req)': batchSize,
			'Total (ms)': limiterFourTime,
			'Avg (req/sec)': toReqPerSec(batchSize, limiterFourTime)
		}
	});
}

async function testCounter(client: RedisClientType, counter: Counter, key: string, value: number, batchSize: number): Promise<number> {
	return test(client, batchSize, () => counter.count(key, value));
}

async function testLimiter(client: RedisClientType, limiter: ILimiter, key: string, batchSize: number): Promise<number> {
	return test(client, batchSize, () => limiter.limit(key));
}

async function test(client: RedisClientType, batchSize: number, fn: () => Promise<Result>): Promise<number> {
	await fn();
	const start = hrtime.bigint();
	await Promise.all(Array.from({ length: batchSize }, fn));
	const end = hrtime.bigint();
	await client.FLUSHDB();
	return Math.round(Number(end - start) * 1e-6 * 100) / 100;
}

function toReqPerSec(batchSize: number, timeMs: number): number {
	return Math.round(((batchSize * 1000) / timeMs) * 100) / 100;
}
