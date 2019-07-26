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

  await count() // Counter has counted the key, remainder 1
  await count() // Counter has counted the key, remainder 0
  await count() // Counter has reached the limit, retry after 97 ms

  client.quit()
})()
