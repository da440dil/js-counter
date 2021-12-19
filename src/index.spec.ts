import { IRedisClient } from '@da440dil/js-redis-script';
import { Limiter } from './Limiter';
import { BatchLimiter } from './BatchLimiter';
import { createLimiter, Algorithm } from '.';

const client = {} as IRedisClient;

it('should create Limiter with single param', () => {
	expect(createLimiter(client, { size: 1000, limit: 3 })).toBeInstanceOf(Limiter);
	expect(createLimiter(client, { size: 1000, limit: 3, name: 'x' })).toBeInstanceOf(Limiter);
	expect(createLimiter(client, { size: 1000, limit: 3, rate: 2 })).toBeInstanceOf(Limiter);
	expect(createLimiter(client, { size: 1000, limit: 3, algorithm: Algorithm.Fixed })).toBeInstanceOf(Limiter);
	expect(createLimiter(client, { size: 1000, limit: 3, algorithm: Algorithm.Sliding })).toBeInstanceOf(Limiter);
});

it('should create BatchLimiter with multiple param', () => {
	expect(createLimiter(client, { size: 1000, limit: 3 }, { size: 2000, limit: 5 })).toBeInstanceOf(BatchLimiter);
});
