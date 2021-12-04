import { Result } from './Result';
import { LimiterSuite } from './LimiterSuite';

it('should return ok using minimal remainder algorithm if all limiters ok', async () => {
	const r1 = new Result([25, -1], 100);
	const lm1 = { limit: jest.fn().mockResolvedValue(r1) };
	const r2 = new Result([58, -1], 100);
	const lm2 = { limit: jest.fn().mockResolvedValue(r2) };
	const r3 = new Result([26, -1], 100);
	const lm3 = { limit: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.limit('key')).resolves.toEqual(r2);
});

it('should return not ok if one of limiters is not ok', async () => {
	const r1 = new Result([25, -1], 100);
	const lm1 = { limit: jest.fn().mockResolvedValue(r1) };
	const r2 = new Result([58, 42], 100);
	const lm2 = { limit: jest.fn().mockResolvedValue(r2) };
	const r3 = new Result([26, -1], 100);
	const lm3 = { limit: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.limit('key')).resolves.toEqual(r2);
});

it('should return not ok using maximum TTL algorithm if more than one of limiters is not ok', async () => {
	const r1 = new Result([58, 42], 100);
	const lm1 = { limit: jest.fn().mockResolvedValue(r1) };
	const r2 = new Result([25, 75], 100);
	const lm2 = { limit: jest.fn().mockResolvedValue(r2) };
	const r3 = new Result([25, 74], 100);
	const lm3 = { limit: jest.fn().mockResolvedValue(r3) };
	const limiter = new LimiterSuite([lm1, lm2, lm3]);
	await expect(limiter.limit('key')).resolves.toEqual(r2);
});
