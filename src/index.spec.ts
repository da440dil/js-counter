import 'mocha'
import assert from 'assert'
import sinon from 'sinon'
import {
  Counter,
  Storage,
  ErrInvalidTTL,
  ErrInvalidLimit,
  ErrInvalidRetryCount,
  ErrInvalidRetryDelay
} from '.'

const key = 'key'
const value = -1
const ttl = 1000
const limit = 5
const retryCount = 2
const retryDelay = 20
const prefix = 'count#'

describe('Counter constructor', () => {
  const storage = <Storage>{}

  it('should create Counter', () => {
    assert.doesNotThrow(() => {
      new Counter(storage, { ttl, limit, prefix })
    })
  })

  it('should throw if ttl is less than or equals to zero', () => {
    assert.throws(() => {
      new Counter(storage, { ttl: 0, limit, prefix })
    }, new Error(ErrInvalidTTL))
  })

  it('should throw if type of ttl is not integer', () => {
    assert.throws(() => {
      new Counter(storage, { ttl: 4.2, limit, prefix })
    }, new Error(ErrInvalidTTL))
  })

  it('should throw if limit is less than or equals to zero', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, limit: 0, prefix })
    }, new Error(ErrInvalidLimit))
  })

  it('should throw if type of limit is not integer', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, limit: 4.2, prefix })
    }, new Error(ErrInvalidLimit))
  })
  it('should throw if retryCount is less than zero', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, retryCount: -1, retryDelay, prefix })
    }, new Error(ErrInvalidRetryCount))
  })

  it('should throw if retryCount is not integer', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, retryCount: 4.2, retryDelay, prefix })
    }, new Error(ErrInvalidRetryCount))
  })

  it('should throw if retryDelay is less than zero', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, retryCount, retryDelay: -1, prefix })
    }, new Error(ErrInvalidRetryDelay))
  })

  it('should throw if retryDelay is not integer', () => {
    assert.throws(() => {
      new Counter(storage, { ttl, retryCount, retryDelay: 4.2, prefix })
    }, new Error(ErrInvalidRetryDelay))
  })
})

describe('Counter', () => {
  const storage = <Storage>{}
  const incr = sinon.stub().resolves(value)
  storage.incr = incr

  const counter = new Counter(storage, { ttl, limit, retryCount, retryDelay, prefix })

  it('should count', async () => {
    const v = await counter.count(key)
    assert(v === value)
    assert(incr.calledOnceWithExactly(prefix + key, limit, ttl))
  })

  it('should retry count', async () => {
    const incr = sinon.stub().resolves(1)
    storage.incr = incr

    const v = await counter.count(key)
    assert(v === 1)
    assert(incr.callCount === retryCount + 1)
  })
})
