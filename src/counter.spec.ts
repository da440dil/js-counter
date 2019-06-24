import {
  Gateway,
  Counter,
  ErrInvalidTTL,
  ErrInvalidLimit,
  ErrTooManyRequests,
  TTLError,
} from './counter'

const gateway = {} as jest.Mocked<Gateway>

describe('Counter', () => {
  const key = 'key'
  let counter: Counter

  beforeEach(() => {
    counter = new Counter(gateway, { ttl: 1, limit: 1 })
  })

  describe('count', () => {
    it('should throw Error if gateway#incr throws Error', async () => {
      const err = new Error('any')
      gateway.incr = jest.fn().mockRejectedValue(err)

      await expect(counter.count(key)).rejects.toThrow(err)
    })

    it('should throw TTLError if gateway#incr fails', async () => {
      const ttl = 42
      gateway.incr = jest.fn().mockResolvedValue(ttl)

      await expect(counter.count(key)).rejects.toThrow(new TTLError(ttl))
    })

    it('should not throw Error if gateway#incr does not fail', async () => {
      gateway.incr = jest.fn().mockResolvedValue(-1)

      await expect(counter.count(key)).resolves.toBeUndefined()
    })
  })
})

describe('Counter constructor', () => {
  it('should throw Error if got invalid ttl parameter', () => {
    expect(() => new Counter(gateway, { ttl: 0, limit: 0 })).toThrow(new Error(ErrInvalidTTL))
  })

  it('should throw Error if got invalid limit parameter', () => {
    expect(() => new Counter(gateway, { ttl: 1, limit: 0 })).toThrow(new Error(ErrInvalidLimit))
  })
})

describe('TTLError constructor', () => {
  it('should create TTLError with ttl property', () => {
    const ttl = 42
    const err = new TTLError(ttl)
    expect(err.message).toBe(ErrTooManyRequests)
    expect(err.ttl).toBe(ttl)
  })
})
