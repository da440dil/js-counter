import { Storage } from './storage'

const key = 'key'
const ttl = 100
let storage: Storage

describe('Memory Storage', () => {
  beforeEach(() => {
    storage = new Storage()
  })

  it('should set key value and TTL of key if key not exists', async () => {
    const res = await storage.incr(key, ttl)
    expect(res.value).toBe(1)
    expect(res.ttl).toBe(ttl)

    const k = storage.get(key)
    expect(k.value).toBe(1)
    expect(k.ttl).toBeGreaterThan(0)
    expect(k.ttl).toBeLessThanOrEqual(ttl)
  })

  it('should set key value and TTL of key if key exists and key is expired', async () => {
    await storage.incr(key, -ttl)

    const res = await storage.incr(key, ttl)
    expect(res.value).toBe(1)
    expect(res.ttl).toBe(ttl)

    const k = storage.get(key)
    expect(k.value).toBe(1)
    expect(k.ttl).toBeGreaterThan(0)
    expect(k.ttl).toBeLessThanOrEqual(ttl)
  })

  it('should increment key value if key exists', async () => {
    await storage.incr(key, ttl)

    const res = await storage.incr(key, ttl)
    expect(res.value).toBe(2)
    expect(res.ttl).toBeGreaterThan(0)
    expect(res.ttl).toBeLessThanOrEqual(ttl)

    const k = storage.get(key)
    expect(k.value).toBe(2)
    expect(k.ttl).toBeGreaterThan(0)
    expect(k.ttl).toBeLessThanOrEqual(ttl)
  })

  it('delete expired keys', async () => {
    await storage.incr(key, ttl)

    await sleep(ttl * 2)

    storage.deleteExpired()
    const k = storage.get(key)
    expect(k.value).toBe(0)
    expect(k.ttl).toBe(-2)
  })
})

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
