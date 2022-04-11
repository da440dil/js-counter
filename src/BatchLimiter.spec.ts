import { IRedisClient } from '@da440dil/js-redis-script';
import { BatchLimiter } from './BatchLimiter';
import { Algorithm } from './Counter';

const run = jest.fn();
jest.mock('@da440dil/js-redis-script', () => {
	return {
		createScript: jest.fn().mockImplementation(() => {
			return { run };
		})
	};
});

afterAll(() => {
	jest.unmock('@da440dil/js-redis-script');
});

const client = {} as IRedisClient;
const prefixes = ['x:', 'y:'];
const rate = 1;
const size = 1000;
const limit = 100;
const args = [rate, size, limit, Algorithm.Fixed, rate, size, limit, Algorithm.Fixed];

it('should return result', async () => {
	const limiter = new BatchLimiter(client, prefixes, args);
	run.mockImplementation(() => Promise.resolve([1, 1, size, limit]));
	const result = await limiter.limit('');
	expect(result.ok).toEqual(true);
	expect(result.counter).toEqual(1);
	expect(result.remainder).toEqual(limit - 1);
	expect(result.ttl).toEqual(size);
});
