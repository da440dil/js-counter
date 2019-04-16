import 'mocha'
import assert from 'assert'
import sinon from 'sinon'
import {
  createCounter,
  Storage,
  ErrInvalidTTL,
  ErrInvalidLimit
} from '.'

const key = 'key'
const value = -1
const ttl = 1000
const limit = 5
const prefix = 'count#'

describe('createCounter', () => {
  const storage = <Storage>{}

  it('should create Counter', () => {
    assert.doesNotThrow(() => {
      createCounter(storage, { ttl, limit, prefix })
    })
  })

  it('should throw if ttl is less than or equals to zero', () => {
    assert.throws(() => {
      createCounter(storage, { ttl: 0, limit, prefix })
    }, new Error(ErrInvalidTTL))
  })

  it('should throw if type of ttl is not integer', () => {
    assert.throws(() => {
      createCounter(storage, { ttl: 4.2, limit, prefix })
    }, new Error(ErrInvalidTTL))
  })

  it('should throw if limit is less than or equals to zero', () => {
    assert.throws(() => {
      createCounter(storage, { ttl, limit: 0, prefix })
    }, new Error(ErrInvalidLimit))
  })

  it('should throw if type of limit is not integer', () => {
    assert.throws(() => {
      createCounter(storage, { ttl, limit: 4.2, prefix })
    }, new Error(ErrInvalidLimit))
  })
})

describe('Counter', () => {
  const storage = <Storage>{}
  const incr = sinon.stub().resolves(value)
  storage.incr = incr

  const counter = createCounter(storage, { ttl, limit, prefix })

  it('should count', async () => {
    const v = await counter.count(key)
    assert(v === value)
    assert(incr.calledOnceWithExactly(prefix + key, limit, ttl))
  })
})
