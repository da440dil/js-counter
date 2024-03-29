import { promisify } from 'util';
import { createClient } from 'redis';
import { createLimiter } from '../src';

const sleep = promisify(setTimeout);

async function main() {
	const client = createClient();
	await client.connect();

	// Create limiter with 2 limits.
	const limiter = createLimiter(
		client,
		// First limit: no more than 3 limiter calls within 1 second.
		{ size: 1000, limit: 3 },
		// Second limit: no more than 5 limiter calls within 2 seconds.
		{ size: 2000, limit: 5 }
	);

	const key = 'key';
	const limit = async (): Promise<void> => {
		const result = await limiter.limit(key);
		console.log(
			'Result: { ok: %s, counter: %d, remainder: %d, ttl: %d }',
			result.ok, result.counter, result.remainder, result.ttl
		);
	};

	await Promise.all([limit(), limit(), limit(), limit()]);
	await sleep(1000); // wait for the next window to start
	await Promise.all([limit(), limit()]);
	// Output:
	// Result: { ok: true, counter: 1, remainder: 2, ttl: 1000 }
	// Result: { ok: true, counter: 2, remainder: 1, ttl: 1000 }
	// Result: { ok: true, counter: 3, remainder: 0, ttl: 1000 }
	// Result: { ok: false, counter: 3, remainder: 0, ttl: 1000 }
	// Result: { ok: true, counter: 5, remainder: 0, ttl: 978 }
	// Result: { ok: false, counter: 5, remainder: 0, ttl: 978 }

	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
