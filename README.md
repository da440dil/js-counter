# js-counter

[![Build Status](https://travis-ci.com/da440dil/js-counter.svg?branch=master)](https://travis-ci.com/da440dil/js-counter)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-counter/badge.svg?branch=master)](https://coveralls.io/github/da440dil/js-counter?branch=master)

Distributed rate limiting using [Redis](https://redis.io/).

[Example](./src/examples/limiter.ts) usage:
```typescript
import { promisify } from 'util';
import { createClient } from 'redis';
import { createLimiter } from '@da440dil/js-counter';

const sleep = promisify(setTimeout);

async function main() {
	const client = createClient();
	const limiter = createLimiter(
		client,
		{ name: '1s', size: 1000, limit: 3 },
		{ name: '2s', size: 2000, limit: 5 }
	);

	const key = 'key';
	const next = async (): Promise<void> => {
		const result = await limiter.next(key);
		console.log('Result: %O', result);
	};

	await Promise.all([next(), next(), next(), next()]);
	await sleep(1000); // wait for the next window to start
	await Promise.all([next(), next()]);
	// Output:
	// Result: { ok: true, counter: 1, remainder: 2, ttl: -1 }
	// Result: { ok: true, counter: 2, remainder: 1, ttl: -1 }
	// Result: { ok: true, counter: 3, remainder: 0, ttl: -1 }
	// Result: { ok: false, counter: 3, remainder: 0, ttl: 1000 }
	// Result: { ok: true, counter: 5, remainder: 0, ttl: -1 }
	// Result: { ok: false, counter: 5, remainder: 0, ttl: 990 }

	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
```

```
npm run file src/examples/limiter.ts
```

[Benchmarks](./src/benchmarks)
```
npm run file src/benchmarks/benchmark.ts
```
