import { createClient, RedisClient } from 'redis'
import { Gateway } from './redis'

const redisUrl = 'redis://127.0.0.1:6379/10'
let client: RedisClient

const key = 'key'
const limit = 2
const ttl = 500
let gateway: Gateway

beforeAll(async () => {
  client = createClient({ url: redisUrl })
  await delKey()
})

afterAll(() => {
  client.quit()
})

describe('Gateway', () => {
  beforeEach(() => {
    gateway = new Gateway(client)
  })

  afterEach(async () => {
    await delKey()
  })

  it('should set key value and ttl of key if key not exists or increment key value if key exists', async () => {
    const t1 = await gateway.incr(key, limit, ttl)
    expect(t1).toBe(-1)
    const r1 = await getKey()
    expect(r1.v).toBe('1')
    expect(r1.ttl).toBeGreaterThan(0)
    expect(r1.ttl).toBeLessThanOrEqual(ttl)

    const t2 = await gateway.incr(key, limit, ttl)
    expect(t2).toBe(-1)
    const r2 = await getKey()
    expect(r2.v).toBe('2')
    expect(r2.ttl).toBeGreaterThan(0)
    expect(r2.ttl).toBeLessThanOrEqual(ttl)

    const t3 = await gateway.incr(key, limit, ttl)
    expect(t3).toBeGreaterThan(0)
    expect(t3).toBeLessThanOrEqual(ttl)
    const r3 = await getKey()
    expect(r3.v).toBe('3')
    expect(r3.ttl).toBeGreaterThan(0)
    expect(r3.ttl).toBeLessThanOrEqual(ttl)

    await sleep(ttl)
    const r = await getKey()
    expect(r.v).toBe(null)
    expect(r.ttl).toBe(-2)

    const t4 = await gateway.incr(key, limit, ttl)
    expect(t4).toBe(-1)
    const r4 = await getKey()
    expect(r4.v).toBe('1')
    expect(r4.ttl).toBeGreaterThan(0)
    expect(r4.ttl).toBeLessThanOrEqual(ttl)
  })
})

function delKey(): Promise<void> {
  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function getKey(): Promise<{ v: string; ttl: number; }> {
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
