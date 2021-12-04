import { IRedisClient } from '@da440dil/js-redis-script';
import { Counter } from './Counter';

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
const size = 1000;
const limit = 100;

const ts: { name: string; counter: Counter; }[] = [
	{
		name: 'fixedWindow',
		counter: Counter.fixedWindow(client, size, limit)
	},
	{
		name: 'slidingWindow',
		counter: Counter.slidingWindow(client, size, limit)
	}
];
for (const { name, counter } of ts) {
	it(`Counter.${name}`, async () => {
		run.mockImplementation(() => Promise.resolve([1, -2]));
		await expect(counter.count('', 1)).resolves.toMatchObject({ ok: false, counter: 1, remainder: 99, ttl: 0 });

		run.mockImplementation(() => Promise.resolve([1, -1]));
		await expect(counter.count('', 1)).resolves.toMatchObject({ ok: true, counter: 1, remainder: 99, ttl: -1 });

		run.mockImplementation(() => Promise.resolve([74, 75]));
		await expect(counter.count('', 1)).resolves.toMatchObject({ ok: false, counter: 74, remainder: 26, ttl: 75 });
	});
}
