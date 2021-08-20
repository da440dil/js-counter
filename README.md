# js-counter

[![Build Status](https://travis-ci.com/da440dil/js-counter.svg?branch=master)](https://travis-ci.com/da440dil/js-counter)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-counter/badge.svg?branch=master)](https://coveralls.io/github/da440dil/js-counter?branch=master)

Distributed rate limiting using [Redis](https://redis.io/).

[Example](./src/examples/fixedWindow.ts) using [fixed window](./src/fixedWindow.ts) algorithm:

```typescript
import { promisify } from 'util';
import { createClient } from 'redis';
import { fixedWindow, IResult } from '@da440dil/js-counter';

const sleep = promisify(setTimeout);

async function main() {
    const client = createClient();
    const counter = fixedWindow({ client, size: 1000, limit: 100 });

    const key = 'key';
    const count = async (value: number): Promise<IResult> => {
        const result = await counter.count(key, value);
        console.log('Value: %d, result: %O', value, result);
        return result;
    };

    await count(101);
    await Promise.all([count(20), count(30), count(51)]);
    await sleep(1000); // wait for the next window to start
    await count(70);
    // Output:
    // Value: 101, result: { ok: false, counter: 0, ttl: -2 }
    // Value: 20, result: { ok: true, counter: 20, ttl: -1 }
    // Value: 30, result: { ok: true, counter: 50, ttl: -1 }
    // Value: 51, result: { ok: false, counter: 50, ttl: 1000 }
    // Value: 70, result: { ok: true, counter: 70, ttl: -1 }

    client.quit();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

```
npm run file src/examples/fixedWindow.ts
```

[Example](./src/examples/slidingWindow.ts) using [sliding window](./src/slidingWindow.ts) algorithm:

```typescript
import { promisify } from 'util';
import { createClient } from 'redis';
import { slidingWindow, IResult } from '@da440dil/js-counter';

const sleep = promisify(setTimeout);

async function main() {
    const client = createClient();
    const counter = slidingWindow({ client, size: 1000, limit: 100 });

    const key = 'key';
    const count = async (value: number): Promise<IResult> => {
        const result = await counter.count(key, value);
        console.log('Value: %d, result: %O', value, result);
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
    // Value: 101, result: { ok: false, counter: 0, ttl: 340 }
    // Value: 20, result: { ok: true, counter: 20, ttl: -1 }
    // Value: 30, result: { ok: true, counter: 50, ttl: -1 }
    // Value: 51, result: { ok: false, counter: 50, ttl: 991 }
    // Value: 70, result: { ok: false, counter: 49, ttl: 982 }
    // Value: 70, result: { ok: true, counter: 83, ttl: -1 }

    client.quit();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

```
npm run file src/examples/slidingWindow.ts
```
