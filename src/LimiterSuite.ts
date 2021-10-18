import { Result } from './ICounter';
import { ILimiter } from './ILimiter';

const maxInt = Number.MAX_SAFE_INTEGER;

export class LimiterSuite implements ILimiter {
	private limiters: ILimiter[];

	constructor(limiters: ILimiter[]) {
		this.limiters = limiters;
	}

	public async next(key: string): Promise<Result> {
		const results = await Promise.all(this.limiters.map((limiter) => limiter.next(key)));
		let ok = true;
		let counter = 0;
		let remainder = maxInt;
		let ttl = -1;
		for (const v of results) {
			if (v.ok) {
				if (ok && remainder > v.remainder) { // minimal remainder
					counter = v.counter;
					remainder = v.remainder;
				}
				continue;
			}
			if (ok) { // not ok first time
				ok = false;
				ttl = v.ttl;
				counter = v.counter;
				remainder = v.remainder;
				continue;
			}
			if (ttl < v.ttl) { // maximum TTL
				ttl = v.ttl;
				counter = v.counter;
				remainder = v.remainder;
			}
		}
		return { ok, counter, remainder, ttl };
	}
}
