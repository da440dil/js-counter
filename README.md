# js-counter

Distributed rate limiting with pluggable storage.

## Example

```javascript
import { createClient } from 'redis'
import { Counter, CounterError } from '@da440dil/js-counter'
import { Storage } from '@da440dil/js-counter/lib/redis'

(async function main() {
  const db = 10
  const limit = 1
  const ttl = 100
  const key = 'key'
  // Create Redis client
  const client = createClient({ db })
  // Create Redis storage
  const storage = new Storage(client)
  const params = { limit, ttl }
  // Create counter
  const counter = new Counter(storage, params)

  try {
    await counter.count(key)
    console.log('Counter has counted the key')
    await counter.count(key)
  } catch (err) {
    if (err instanceof CounterError) {
      console.log('Counter has reached the limit, retry after %d ms', err.ttl)
    } else {
      throw err
    }
  }

  // Close Redis connection
  client.quit()
})()
```