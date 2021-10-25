import { hrtime } from 'process';
import { createClient, RedisClient } from 'redis';
import { fixedWindow, slidingWindow, ICounter } from '../src';

async function main() {
	const client = createClient();
	await app(client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

async function app(client: RedisClient): Promise<void> {
	await flushdb(client);

	const key = 'test';
	const value = 1;
	const batchSize = parseInt(process.env.BENCHMARK_SIZE || '10000', 10);

	const size = 60000;
	const limit = batchSize + 1;

	const fixedWindowCounter = fixedWindow(client, { size, limit });
	const fixedWindowTime = await test(client, fixedWindowCounter, key, value, batchSize);

	const slidingWindowCounter = slidingWindow(client, { size, limit });
	const slidingWindowTime = await test(client, slidingWindowCounter, key, value, batchSize);

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
		}
	});
}

async function test(client: RedisClient, counter: ICounter, key: string, value: number, batchSize: number): Promise<number> {
	await counter.count(key, value);
	const start = hrtime.bigint();
	await Promise.all(Array.from({ length: batchSize }, () => counter.count(key, value)));
	const end = hrtime.bigint();
	await flushdb(client);
	return Math.round(Number(end - start) * 1e-6 * 100) / 100;
}

function flushdb(client: RedisClient): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		client.flushdb((err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
}

function toReqPerSec(batchSize: number, timeMs: number): number {
	return Math.round(((batchSize * 1000) / timeMs) * 100) / 100;
}
