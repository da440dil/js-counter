import 'mocha'
import assert from 'assert'
import { createStorage, Storage } from '.'

describe('memory storage', () => {
  let storage: Storage

  const key = 'key'
  const limit = 2
  const ttl = 1000

  before(() => {
    storage = createStorage(ttl)
  })

  after(() => {
    storage.quit()
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

  it('delete key', () => {
    storage.del(key)
  })

  it('incr should return -1', async () => {    
    const v = await storage.incr(key, limit, ttl)
    assert(v === -1)
  })
})

describe('memory storage ttl', () => {
  let storage: Storage

  const key = 'key'
  const limit = 2
  const ttl = 100

  before(() => {
    storage = createStorage(ttl)
  })

  after(() => {
    storage.quit()
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

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
