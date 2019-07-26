import { createClient, RedisClient } from 'redis'
import { Gateway, ErrKeyNameClash } from './redis'

const redisUrl = 'redis://127.0.0.1:6379/10'
let client: RedisClient

const key = 'key'
const ttl = 100
let gateway: Gateway

beforeAll(async () => {
  client = createClient({ url: redisUrl })
  await delKey()
})

afterAll(() => {
  client.quit()
})

describe('Redis Gateway', () => {
  beforeEach(() => {
    gateway = new Gateway(client)
  })

  afterEach(async () => {
    await delKey()
  })

  it('should set key value and TTL of key if key not exists', async () => {
    const res = await gateway.incr(key, ttl)
    expect(res.value).toBe(1)
    expect(res.ttl).toBe(ttl)

    let k = await getKey()
    expect(k.value).toBe('1')
    expect(k.ttl).toBeGreaterThan(0)
    expect(k.ttl).toBeLessThanOrEqual(ttl)

    await sleep(ttl)

    k = await getKey()
    expect(k.value).toBe(null)
    expect(k.ttl).toBe(-2)
  })

  it('should increment key value if key exists', async () => {
    await gateway.incr(key, ttl)

    const res = await gateway.incr(key, ttl)
    expect(res.value).toBe(2)
    expect(res.ttl).toBeGreaterThan(0)
    expect(res.ttl).toBeLessThanOrEqual(ttl)

    let k = await getKey()
    expect(k.value).toBe('2')
    expect(k.ttl).toBeGreaterThan(0)
    expect(k.ttl).toBeLessThanOrEqual(ttl)

    await sleep(ttl)

    k = await getKey()
    expect(k.value).toBe(null)
    expect(k.ttl).toBe(-2)
  })

  it('should throw Error if key exists and has no TTL', async () => {
    await setKey('1')

    expect(gateway.incr(key, ttl)).rejects.toThrow(new Error(ErrKeyNameClash))
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

function getKey(): Promise<{ value: string; ttl: number; }> {
  return new Promise((resolve, reject) => {
    client.multi().get(key).pttl(key).exec((err, res) => {
      if (err) {
        return reject(err)
      }
      resolve({
        value: res[0],
        ttl: res[1],
      })
    })
  })
}

function setKey(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
