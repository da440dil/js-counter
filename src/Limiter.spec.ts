import { Result } from './ICounter';
import { Limiter } from './Limiter';

it('should return ok if counter returns ok', async () => {
	const ok: Result = { ok: true, counter: 1, remainder: 99, ttl: -1 };
	const limiter = new Limiter(1, { count: jest.fn().mockResolvedValue(ok) });
	await expect(limiter.next('key')).resolves.toEqual(ok);
});

it('should return not ok if counter returns not ok', async () => {
	const ok: Result = { ok: false, counter: 1, remainder: 99, ttl: 42 };
	const limiter = new Limiter(1, { count: jest.fn().mockResolvedValue(ok) });
	await expect(limiter.next('key')).resolves.toEqual(ok);
});
