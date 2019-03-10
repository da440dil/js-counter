import 'mocha'
import assert from 'assert'
import { createClient, RedisClient } from 'redis'
import * as RedisStorage from './redis'
import * as MemoryStorage from './memory'
import { createCounter, Counter } from '.'

describe('counter with redis storage', () => {
  let client: RedisClient
  let storage: RedisStorage.Storage
  let couter: Counter

  const db = 10
  const key = 'key'
  const limit = 2
  const ttl = 1000

  before(async () => {
    client = createClient({ db: db })
    await removeKey(client, key)
    storage = RedisStorage.createStorage(client)
    couter = createCounter(storage, { limit: limit, ttl: ttl })
  })

  after(async () => {
    await removeKey(client, key)
    client.quit()
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
    assert(v === -1)
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
    assert(v === -1)
  })

  it('count should return v >= 0 && v <= ttl', async () => {
    const v = await couter.count(key)
    assert(v >= 0 && v <= ttl)
  })

  it('delete key', async () => {
    await removeKey(client, key)
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
    assert(v === -1)
  })
})

describe('couter with memory storage', () => {
  let storage: MemoryStorage.Storage
  let couter: Counter

  const key = 'key'
  const limit = 2
  const ttl = 1000

  before(() => {
    storage = MemoryStorage.createStorage(ttl)
    couter = createCounter(storage, { limit: limit, ttl: ttl })
  })

  after(() => {
    storage.quit()
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
    assert(v === -1)
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
    assert(v === -1)
  })

  it('count should return v >= 0 && v <= ttl', async () => {
    const v = await couter.count(key)
    assert(v >= 0 && v <= ttl)
  })

  it('delete key', () => {
    storage.del(key)
  })

  it('count should return -1', async () => {
    const v = await couter.count(key)
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
