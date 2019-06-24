# js-counter

Distributed rate limiting using [Redis](https://redis.io/).

## Example

```javascript
import { createClient } from 'redis'
import { createCounter, TTLError } from '@da440dil/js-counter'

(async function main() {
  const client = createClient()
  const counter = createCounter(client, { ttl: 100, limit: 1 })
  const key = 'key'

  try {
    await counter.count(key)
    console.log('Counter has counted the key')
    await counter.count(key)
  } catch (err) {
    if (err instanceof TTLError) {
      console.log('Counter has reached the limit, retry after %d ms', err.ttl)
    } else {
      throw err
    }
  }

  client.quit()
})()
```