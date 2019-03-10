import 'mocha'
import assert from 'assert'
import { createClient, RedisClient } from 'redis'
import { createStorage, Storage } from '.'

describe('redis storage', () => {
  let client: RedisClient
  let storage: Storage

  const db = 10
  const key = 'key'
  const limit = 2
  const ttl = 1000

  before(async () => {
    client = createClient({ db: db })
    await removeKey(client, key)
    storage = createStorage(client)
  })

  after(async () => {
    await removeKey(client, key)
    client.quit()
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })

  it('incr should return v >= 0 && v <= ttl', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v >= 0 && v <= ttl)
  })

  it('delete key', async () => {
    await removeKey(client, key)
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })
})

describe('redis storage ttl', () => {
  let client: RedisClient
  let storage: Storage

  const db = 10
  const key = 'key'
  const limit = 2
  const ttl = 100

  before(async () => {
    client = createClient({ db: db })
    await removeKey(client, key)
    storage = createStorage(client)
  })

  after(async () => {
    await removeKey(client, key)
    client.quit()
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })

  it('incr should return v >= 0 && v <= ttl', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v >= 0 && v <= ttl)
  })

  it('sleep 200 ms', async () => {
    await sleep(200)
  })

  it('incr should return -1', async () => {
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })
})

function removeKey(client: RedisClient, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
