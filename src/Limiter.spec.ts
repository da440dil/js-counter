import { Limiter } from './Limiter';

it('Limiter', async () => {
	const ok = { ok: true, ttl: -1 };
	const limiter = new Limiter(42, { count: jest.fn().mockResolvedValue(ok) });
	await expect(limiter.next('key')).resolves.toEqual(ok);
});
