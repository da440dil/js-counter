import { ICounter } from './ICounter';
import { ILimiter, LimitResult } from './ILimiter';

export class Limiter implements ILimiter {
	private rate: number;
	private counter: ICounter;

	constructor(rate: number, counter: ICounter) {
		this.rate = rate;
		this.counter = counter;
	}

	public async next(key: string): Promise<LimitResult> {
		const { ok, ttl } = await this.counter.count(key, this.rate);
		return { ok, ttl };
	}
}
