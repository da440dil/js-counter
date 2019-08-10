import { createClient, RedisClient, Callback } from 'redis'
import { Gateway, ErrInvalidResponse, ErrKeyNameClash } from './gateway'

const redisUrl = 'redis://localhost:6379/10'
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

    await expect(gateway.incr(key, ttl)).rejects.toThrow(new Error(ErrKeyNameClash))
  })

  it('should throw Error if redis throws Error', async () => {
    const evalMock = jest.spyOn(client, 'eval')
    const err = new Error('any')
    evalMock.mockImplementation(makeEvalFn(err, []))

    await expect(gateway.incr(key, ttl)).rejects.toThrow(err)

    evalMock.mockRestore()
  })

  it('should throw Error if redis returns response of invalid type', async () => {
    const evalMock = jest.spyOn(client, 'eval')
    const err = new Error(ErrInvalidResponse)

    evalMock.mockImplementation(makeEvalFn(null, ['', 42]))
    await expect(gateway.incr(key, ttl)).rejects.toThrow(err)

    evalMock.mockImplementation(makeEvalFn(null, [42, '']))
    await expect(gateway.incr(key, ttl)).rejects.toThrow(err)

    evalMock.mockRestore()
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

function makeEvalFn(err: Error | null, res: Array<string | number>) {
  return (...args: Array<string | number | Callback<Array<string | number>>>): boolean => {
    const cb = args[args.length - 1]
    if (typeof cb === 'function') {
      cb(err, res)
    }
    return false
  }
}
