import { Result } from './ICounter';
import { LimiterSuite } from './LimiterSuite';

it('should return ok using minimal remainder algorithm if all limiters ok', async () => {
	const r1: Result = { ok: true, counter: 25, remainder: 75, ttl: -1 };
	const lm1 = { next: jest.fn().mockResolvedValue(r1) };
	const r2: Result = { ok: true, counter: 58, remainder: 42, ttl: -1 };
	const lm2 = { next: jest.fn().mockResolvedValue(r2) };
	const r3: Result = { ok: true, counter: 26, remainder: 74, ttl: -1 };
	const lm3 = { next: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.next('key')).resolves.toEqual(r2);
});

it('should return not ok if one of limiters is not ok', async () => {
	const r1: Result = { ok: true, counter: 25, remainder: 75, ttl: -1 };
	const lm1 = { next: jest.fn().mockResolvedValue(r1) };
	const r2: Result = { ok: false, counter: 58, remainder: 42, ttl: 42 };
	const lm2 = { next: jest.fn().mockResolvedValue(r2) };
	const r3: Result = { ok: true, counter: 26, remainder: 74, ttl: -1 };
	const lm3 = { next: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.next('key')).resolves.toEqual(r2);
});

it('should return not ok using maximum TTL algorithm if more than one of limiters is not ok', async () => {
	const r1: Result = { ok: false, counter: 58, remainder: 42, ttl: 42 };
	const lm1 = { next: jest.fn().mockResolvedValue(r1) };
	const r2: Result = { ok: false, counter: 25, remainder: 75, ttl: 75 };
	const lm2 = { next: jest.fn().mockResolvedValue(r2) };
	const r3: Result = { ok: false, counter: 26, remainder: 74, ttl: 74 };
	const lm3 = { next: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.next('key')).resolves.toEqual(r2);
});
