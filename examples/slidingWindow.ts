import { promisify } from 'util';
import { createClient } from 'redis';
import { slidingWindow, Result } from '../src';

const sleep = promisify(setTimeout);

async function main() {
	const client = createClient();
	await client.connect();

	const counter = slidingWindow(client, 1000, 100);

	const key = 'key';
	const count = async (value: number): Promise<Result> => {
		const result = await counter.count(key, value);
		console.log(
			'Value: %d, result: { ok: %s, counter: %d, remainder: %d, ttl: %d }',
			value, result.ok, result.counter, result.remainder, result.ttl
		);
		return result;
	};

	const result = await count(101);
	await sleep(result.ttl); // wait for the next window to start
	await Promise.all([count(20), count(30), count(51)]);
	await sleep(1000); // wait for the next window to start
	await count(70);
	await sleep(700); // wait for the most time of the current window to pass
	await count(70);
	// Output:
	// Value: 101, result: { ok: false, counter: 0, remainder: 100, ttl: 714 }
	// Value: 20, result: { ok: true, counter: 20, remainder: 80, ttl: 986 }
	// Value: 30, result: { ok: true, counter: 50, remainder: 50, ttl: 986 }
	// Value: 51, result: { ok: false, counter: 50, remainder: 50, ttl: 986 }
	// Value: 70, result: { ok: false, counter: 48, remainder: 52, ttl: 973 }
	// Value: 70, result: { ok: true, counter: 83, remainder: 17, ttl: 261 }

	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
