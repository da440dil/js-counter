import { createClient } from 'redis'
import { createCounter, Counter, TTLError } from '..'

(async function main() {
  const client = createClient()
  const params = { ttl: 100, limit: 2 }
  const key = 'key'
  const count = async (counter: Counter, id: number) => {
    try {
      const remainder = await counter.count(key)
      console.log('Counter#%d has counted the key, remainder %d', id, remainder)
    } catch (err) {
      if (err instanceof TTLError) {
        console.log('Counter#%d has reached the limit, retry after %d ms', id, err.ttl)
      } else {
        throw err
      }
    }
  }
  const counter1 = createCounter(client, params)
  const counter2 = createCounter(client, params)

  await count(counter1, 1) // Counter#1 has counted the key, remainder 1
  await count(counter2, 2) // Counter#2 has counted the key, remainder 0
  await count(counter1, 1) // Counter#1 has reached the limit, retry after 97 ms
  await count(counter2, 2) // Counter#2 has reached the limit, retry after 96 ms
  await sleep(200)
  console.log('Timeout 200 ms is up')
  await count(counter1, 1) // Counter#1 has counted the key, remainder 1
  await count(counter2, 2) // Counter#2 has counted the key, remainder 0

  client.quit()
})()

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
