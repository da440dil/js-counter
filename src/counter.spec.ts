import {
  Storage,
  Counter,
  ErrInvalidTTL,
  ErrInvalidLimit,
  CounterError,
} from './counter'

const storage = {} as jest.Mocked<Storage>
const key = 'key'

it('should throw Error if got invalid ttl parameter', () => {
  expect(() => new Counter(storage, { ttl: 0 })).toThrow(new Error(ErrInvalidTTL))
})

it('should throw Error if got invalid limit parameter', () => {
  expect(() => new Counter(storage, { ttl: 1, limit: 0 })).toThrow(new Error(ErrInvalidLimit))
})

it('should count', async () => {
  storage.incr = jest.fn().mockResolvedValue(-1)

  const counter = new Counter(storage, { ttl: 1, limit: 1 })
  await expect(counter.count(key)).resolves.toBe(undefined)
})

it('should throw CounterError if count failed', async () => {
  const ttl = 42
  const err = new CounterError(ttl)
  expect(err.ttl).toBe(ttl)

  storage.incr = jest.fn().mockResolvedValue(ttl)

  const counter = new Counter(storage, { ttl: 1, limit: 1 })
  await expect(counter.count(key)).rejects.toThrow(err)
})
