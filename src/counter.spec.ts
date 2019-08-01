import {
  Gateway,
  ValueTTL,
  Counter,
  ErrInvalidTTL,
  ErrInvalidLimit,
  ErrTooManyRequests,
  ErrInvalidKey,
  TTLError,
  MaxKeySize,
} from './counter'

const gateway = {} as jest.Mocked<Gateway>

const invalidKey = Buffer.alloc(MaxKeySize + 1).toString()

describe('Counter', () => {
  const key = 'key'
  const limit = 1
  let counter: Counter

  beforeEach(() => {
    counter = new Counter(gateway, { ttl: 100, limit })
  })

  describe('count', () => {
    it('should throw Error if gateway#incr throws Error', async () => {
      const err = new Error('any')
      gateway.incr = jest.fn().mockRejectedValue(err)

      await expect(counter.count(key)).rejects.toThrow(err)
    })

    it('should throw TTLError if gateway#incr returns value greater than limit', async () => {
      const res: ValueTTL = { value: limit + 1, ttl: 42 }
      gateway.incr = jest.fn().mockResolvedValue(res)

      await expect(counter.count(key)).rejects.toThrow(new TTLError(res.ttl))
    })

    it('should throw Error if got invalid key', async () => {
      await expect(counter.count(invalidKey)).rejects.toThrow(new Error(ErrInvalidKey))
    })

    it('should return limit remainder if gateway#incr returns value less than or equals limit', async () => {
      const res: ValueTTL = { value: limit, ttl: 42 }
      gateway.incr = jest.fn().mockResolvedValue(res)

      await expect(counter.count(key)).resolves.toBe(0)
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

  it('should throw Error if got invalid prefix parameter', () => {
    expect(() => new Counter(gateway, { ttl: 1, limit: 1, prefix: invalidKey })).toThrow(new Error(ErrInvalidKey))
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
