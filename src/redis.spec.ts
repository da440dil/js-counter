import { createClient, RedisClient } from 'redis'
import { Storage } from './redis'

const redisUrl = 'redis://127.0.0.1:6379/10'
let client: RedisClient

const k = 'k'
const ttl = 1000
let storage: Storage

beforeAll(async () => {
  client = createClient({ url: redisUrl })
  await delKey(k)
})

afterAll(() => {
  client.quit()
})

beforeEach(() => {
  storage = new Storage(client)
})

afterEach(async () => {
  await delKey(k)
})

it('should set key value and ttl of key if key not exists', async () => {
  const limit = 1
  const t1 = await storage.incr(k, limit, ttl)
  expect(t1).toBe(-1)
  const r = await getKey(k)
  expect(r.v).toBe('1')
  expect(r.ttl > 0 && r.ttl <= ttl).toBe(true)

  const t2 = await storage.incr(k, limit, ttl)
  expect(t2 > 0 && t2 <= ttl).toBe(true)

  await sleep(ttl)
  const t3 = await storage.incr(k, limit, ttl)
  expect(t3).toBe(-1)
})

it('should increment key value if key exists', async () => {
  const t = ttl / 2
  const limit = 1
  const t1 = await storage.incr(k, limit, ttl)
  expect(t1).toBe(-1)

  await sleep(t)
  const t2 = await storage.incr(k, limit, ttl)
  expect(t2 > 0 && t2 <= t).toBe(true)
  const r = await getKey(k)
  expect(r.v).toBe('2')
  expect(r.ttl > 0 && r.ttl <= t).toBe(true)

  await sleep(t)
  const t3 = await storage.incr(k, limit, ttl)
  expect(t3).toBe(-1)
})

function delKey(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function getKey(key: string): Promise<{
  v: string;
  ttl: number;
}> {
  return new Promise((resolve, reject) => {
    client.multi().get(key).pttl(key).exec((err, res) => {
      if (err) {
        return reject(err)
      }
      resolve({
        v: res[0],
        ttl: res[1],
      })
    })
  })
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
