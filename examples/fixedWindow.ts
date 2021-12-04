import { promisify } from 'util';
import { createClient } from 'redis';
import { Counter, Result } from '../src';

const sleep = promisify(setTimeout);

async function main() {
	const client = createClient();
	const counter = Counter.fixedWindow(client, 1000, 100);

	const key = 'key';
	const count = async (value: number): Promise<Result> => {
		const result = await counter.count(key, value);
		console.log(
			'Value: %d, result: { ok: %s, counter: %d, remainder: %d, ttl: %d }',
			value, result.ok, result.counter, result.remainder, result.ttl
		);
		return result;
	};

	await count(101);
	await Promise.all([count(20), count(30), count(51)]);
	await sleep(1000); // wait for the next window to start
	await count(70);
	// Output:
	// Value: 101, result: { ok: false, counter: 0, remainder: 100, ttl: 0 }
	// Value: 20, result: { ok: true, counter: 20, remainder: 80, ttl: -1 }
	// Value: 30, result: { ok: true, counter: 50, remainder: 50, ttl: -1 }
	// Value: 51, result: { ok: false, counter: 50, remainder: 50, ttl: 1000 }
	// Value: 70, result: { ok: true, counter: 70, remainder: 30, ttl: -1 }

	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
