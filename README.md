# js-counter

[![Build Status](https://travis-ci.com/da440dil/js-counter.svg?branch=master)](https://travis-ci.com/da440dil/js-counter)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-counter/badge.svg?branch=master)](https://coveralls.io/github/da440dil/js-counter?branch=master)

Distributed rate limiting with pluggable storage for storing counters state.

## Basic usage

```javascript
// Create counter
const counter = new Counter({ limit: 1, ttl: 100 })
// Increment counter and get remainder
try {
  const remainder = await counter.count('key')
  // Counter value equals 1
  // Remainder value equals 0
  // Next counter.count('key') call will return TTLError
} catch (err) {
  if (err instanceof TTLError) {
    // Use err.TTL() if need
  } else {
    // Handle err
  }
}
```

## Example usage

- [example](./src/examples/counter-gateway-default.ts) usage with default [gateway](./src/gateway/memory/gateway.ts)
- [example](./src/examples/counter-gateway-memory.ts) usage with memory [gateway](./src/gateway/memory/gateway.ts)
- [example](./src/examples/counter-gateway-redis.ts) usage with [Redis](https://redis.io/) [gateway](./src/gateway/redis/gateway.ts)
- [example](./src/examples/counter-gateway-redis-2.ts) usage with [Redis](https://redis.io/) [gateway](./src/gateway/redis/gateway.ts) (with alternating counters)