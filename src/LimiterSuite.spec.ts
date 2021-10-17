import { LimiterSuite } from './LimiterSuite';

it('should return ok if all limiters ok', async () => {
	const ok = { ok: true, ttl: -1 };
	const lm = { next: jest.fn().mockResolvedValue(ok) };
	const limiter = new LimiterSuite([lm, lm, lm]);
	await expect(limiter.next('key')).resolves.toEqual(ok);
});

it('should return not ok if one of limiters is not ok', async () => {
	const ok = { ok: true, ttl: -1 };
	const okLm = { next: jest.fn().mockResolvedValue(ok) };
	const notOk = { ok: false, ttl: 42 };
	const notOkLm = { next: jest.fn().mockResolvedValue(notOk) };
	const limiter = new LimiterSuite([okLm, notOkLm, okLm]);
	await expect(limiter.next('key')).resolves.toEqual(notOk);
});

it('should return max TTL if more than one of limiters is not ok', async () => {
	const notOk1 = { ok: false, ttl: 42 };
	const notOkLm1 = { next: jest.fn().mockResolvedValue(notOk1) };
	const notOk2 = { ok: false, ttl: 75 };
	const notOkLm2 = { next: jest.fn().mockResolvedValue(notOk2) };
	const notOk3 = { ok: false, ttl: 74 };
	const notOkLm3 = { next: jest.fn().mockResolvedValue(notOk3) };
	const limiter = new LimiterSuite([notOkLm1, notOkLm2, notOkLm3]);
	await expect(limiter.next('key')).resolves.toEqual(notOk2);
});
