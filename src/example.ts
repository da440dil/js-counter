import { createClient } from 'redis'
import { createStorage } from './redis'
import { createCounter, Counter } from '.'

class MyCounter {
  private _counter: Counter;
  private _key: string;
  private _id: number;
  constructor(counter: Counter, key: string, id: number) {
    this._counter = counter
    this._key = key
    this._id = id
  }
  async count(): Promise<void> {
    const v = await this._counter.count(this._key)
    if (v === -1) {
      console.log(`Counter#${this._id} has counted the key`)
    } else {
      console.log(`Counter#${this._id} has reached the limit, retry after ${v} ms`)
    }
  }
}

main()

async function main() {
  const db = 10
  const limit = 2
  const ttl = 100
  const key = 'key'
  // Create Redis client
  const client = createClient({ db: db })
  // Create Redis storage
  const storage = createStorage(client)
  const params = { limit: limit, ttl: ttl }
  // Create first counter
  const counter1 = new MyCounter(createCounter(storage, params), key, 1)
  // Create second counter
  const counter2 = new MyCounter(createCounter(storage, params), key, 2)

  await counter1.count() // Counter#1 has counted the key
  await counter2.count() // Counter#2 has counted the key
  await counter1.count() // Counter#1 has reached the limit, retry after 96 ms
  await counter2.count() // Counter#2 has reached the limit, retry after 95 ms
  await sleep(200)
  console.log("Timeout 200 ms is up")
  await counter1.count() // Counter#1 has counted the key
  await counter2.count() // Counter#2 has counted the key

  // Close Redis connection
  client.quit()
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
