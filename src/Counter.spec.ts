import { RedisClient } from 'redis';
import { Counter } from './Counter';

const runMock = jest.fn();
jest.mock('@da440dil/js-redis-script', () => {
	return {
		RedisScript: jest.fn().mockImplementation(() => {
			return { run: runMock };
		})
	};
});

it('Counter', async () => {
	const counter = new Counter({ client: {} as RedisClient, size: 1000, limit: 100, src: '' });

	runMock.mockImplementation(() => Promise.resolve([1, -1]));
	await expect(counter.count('', 1)).resolves.toMatchObject({ ok: true, counter: 1, ttl: -1 });

	runMock.mockImplementation(() => Promise.resolve([1, 2]));
	await expect(counter.count('', 1)).resolves.toMatchObject({ ok: false, counter: 1, ttl: 2 });
});
