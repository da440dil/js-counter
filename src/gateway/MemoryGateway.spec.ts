import { MemoryGateway } from './MemoryGateway';

const key = 'key';
const ttl = 100;
let gateway: MemoryGateway;

describe('MemoryGateway', () => {
  beforeEach(() => {
    gateway = new MemoryGateway(Math.floor(ttl / 2));
  });

  afterAll(() => {
    gateway.stopCleanupTimer();
  });

  it('should set key value and TTL of key if key not exists', async () => {
    const res = await gateway.incr(key, ttl);
    expect(res.value).toBe(1);
    expect(res.ttl).toBe(ttl);

    let k = gateway.get(key);
    expect(k.value).toBe(1);
    expect(k.ttl).toBeGreaterThan(0);
    expect(k.ttl).toBeLessThanOrEqual(ttl);

    await sleep(ttl);

    k = gateway.get(key);
    expect(k.value).toBe(0);
    expect(k.ttl).toBe(-2);
  });

  it('should increment key value if key exists', async () => {
    await gateway.incr(key, ttl);

    const res = await gateway.incr(key, ttl);
    expect(res.value).toBe(2);
    expect(res.ttl).toBeGreaterThan(0);
    expect(res.ttl).toBeLessThanOrEqual(ttl);

    let k = gateway.get(key);
    expect(k.value).toBe(2);
    expect(k.ttl).toBeGreaterThan(0);
    expect(k.ttl).toBeLessThanOrEqual(ttl);

    await sleep(ttl);

    k = gateway.get(key);
    expect(k.value).toBe(0);
    expect(k.ttl).toBe(-2);
  });
});

function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
