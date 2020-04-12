import { IGateway, IValueTTL } from './IGateway';
import { Counter } from './Counter';
import { TTLError } from './TTLError';
import { MemoryGateway } from './gateway/MemoryGateway';

const gateway = {} as jest.Mocked<IGateway>;

const invalidKey = Buffer.alloc(Counter.MaxKeySize + 1).toString();

describe('Counter', () => {
  const key = 'key';
  const limit = 1;
  let counter: Counter;

  beforeEach(() => {
    counter = new Counter({ gateway, limit, ttl: 100 });
  });

  describe('count', () => {
    it('should throw Error if gateway#incr throws Error', async () => {
      const err = new Error('any');
      gateway.incr = jest.fn().mockRejectedValue(err);

      await expect(counter.count(key)).rejects.toThrow(err);
    });

    it('should throw TTLError if gateway#incr returns value greater than limit', async () => {
      const res: IValueTTL = { value: limit + 1, ttl: 42 };
      gateway.incr = jest.fn().mockResolvedValue(res);

      await expect(counter.count(key)).rejects.toThrow(new TTLError(res.ttl));
    });

    it('should throw Error if got invalid key', async () => {
      await expect(counter.count(invalidKey)).rejects.toThrow(new Error(Counter.ErrInvalidKey));
    });

    it('should return limit remainder if gateway#incr returns value less than or equals limit', async () => {
      const res: IValueTTL = { value: limit, ttl: 42 };
      gateway.incr = jest.fn().mockResolvedValue(res);

      await expect(counter.count(key)).resolves.toBe(0);
    });
  });
});

describe('Counter constructor', () => {
  it('should create Counter with gateway', () => {
    expect(new Counter({ limit: 1, ttl: 1, gateway: new MemoryGateway(100) })).toBeInstanceOf(Counter);
  });

  it('should create Counter with default gateway', () => {
    expect(new Counter({ limit: 1, ttl: 1 })).toBeInstanceOf(Counter);
  });

  it('should throw Error if got invalid limit parameter', () => {
    expect(() => new Counter({ limit: 0, ttl: 1 })).toThrow(new Error(Counter.ErrInvalidLimit));
  });

  it('should throw Error if got invalid ttl parameter', () => {
    expect(() => new Counter({ limit: 1, ttl: 0 })).toThrow(new Error(Counter.ErrInvalidTTL));
  });

  it('should throw Error if got invalid prefix parameter', () => {
    expect(() => new Counter({ limit: 1, ttl: 1, prefix: invalidKey })).toThrow(new Error(Counter.ErrInvalidKey));
  });
});
