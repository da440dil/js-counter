import { Counter } from './Counter';
import { Result } from './Result';
import { Limiter } from './Limiter';

it('should return counter result', async () => {
	const result = 42 as unknown as Result;
	const counter = { count: jest.fn().mockResolvedValue(result) } as unknown as Counter;
	const limiter = new Limiter(counter, '', 1);
	await expect(limiter.limit('key')).resolves.toEqual(result);
});
