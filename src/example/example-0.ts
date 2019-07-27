import { createClient } from 'redis'
import { createCounter, TTLError } from '..'

(async function main() {
  const client = createClient()
  const counter = createCounter(client, { ttl: 100, limit: 2 })
  const key = 'key'
  const count = async () => {
    try {
      const remainder = await counter.count(key)
      console.log('Counter has counted the key, remainder %d', remainder)
    } catch (err) {
      if (err instanceof TTLError) {
        console.log('Counter has reached the limit, retry after %d ms', err.ttl)
      } else {
        throw err
      }
    }
  }

  await Promise.all([count(), count(), count()])
  // Output:
  // Counter has counted the key, remainder 1
  // Counter has counted the key, remainder 0
  // Counter has reached the limit, retry after 100 ms

  client.quit()
})()
