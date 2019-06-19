import { createClient } from 'redis'
import Counter from '..'

// Decorator to log output of Counter methods call
class MyCounter {
  private _counter: Counter
  private _key: string
  private _id: number
  constructor(counter: Counter, key: string, id: number) {
    this._counter = counter
    this._key = key
    this._id = id
  }
  public async count(): Promise<void> {
    try {
      await this._counter.count(this._key)
      console.log(`Counter#${this._id} has counted the key`)
    } catch (err) {
      if (err instanceof Counter.Error) {
        console.log(`Counter#${this._id} has reached the limit, retry after ${err.ttl} ms`)
      } else {
        throw err
      }
    }
  }
}

(async function main() {
  const client = createClient()
  const limit = 2
  const ttl = 100
  const params = { ttl, limit }
  const key = 'key'
  const counter1 = new MyCounter(Counter(client, params), key, 1)
  const counter2 = new MyCounter(Counter(client, params), key, 2)

  await counter1.count() // Counter#1 has counted the key
  await counter2.count() // Counter#2 has counted the key
  await counter1.count() // Counter#1 has reached the limit, retry after 97 ms
  await counter2.count() // Counter#2 has reached the limit, retry after 96 ms
  await sleep(200)
  console.log('Timeout 200 ms is up')
  await counter1.count() // Counter#1 has counted the key
  await counter2.count() // Counter#2 has counted the key

  client.quit()
})()

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
