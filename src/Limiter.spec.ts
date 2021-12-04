import { Counter } from './Counter';
import { Result } from './Result';
import { Limiter } from './Limiter';

it('should return ok if counter returns ok', async () => {
	const ok = { ok: true, counter: 1, remainder: 99, ttl: -1 } as Result;
	const counter = { count: jest.fn().mockResolvedValue(ok) } as unknown as Counter;
	const limiter = new Limiter('', 1, counter);
	await expect(limiter.limit('key')).resolves.toEqual(ok);
});

it('should return not ok if counter returns not ok', async () => {
	const ok = { ok: false, counter: 1, remainder: 99, ttl: 42 } as Result;
	const counter = { count: jest.fn().mockResolvedValue(ok) } as unknown as Counter;
	const limiter = new Limiter('', 1, counter);
	await expect(limiter.limit('key')).resolves.toEqual(ok);
});
