# js-counter

Distributed rate limiting using [Redis](https://redis.io/).

## Example

```javascript
import { createClient } from 'redis'
import Counter from '@da440dil/js-counter'

(async function main() {
  const client = createClient()
  const ttl = 100
  const limit = 1
  const counter = Counter(client, { ttl, limit })
  const key = 'key'

  try {
    await counter.count(key)
    console.log('Counter has counted the key')
  } catch (err) {
    if (err instanceof Counter.Error) {
      console.log('Counter has reached the limit, retry after %d ms', err.ttl)
    } else {
      throw err
    }
  }

  client.quit()
})()
```