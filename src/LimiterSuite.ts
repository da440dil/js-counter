import { Result } from './Counter';
import { ILimiter } from './ILimiter';

const maxInt = Number.MAX_SAFE_INTEGER;

export class LimiterSuite implements ILimiter {
	private limiters: ILimiter[];

	constructor(limiters: ILimiter[]) {
		this.limiters = limiters;
	}

	public async limit(key: string): Promise<Result> {
		const results = await Promise.all(this.limiters.map((limiter) => limiter.limit(key)));
		let result: Result = { ok: true, counter: 0, remainder: maxInt, ttl: -1 };
		for (const v of results) {
			if (v.ok) {
				if (result.ok && result.remainder > v.remainder) { // minimal remainder
					result = v;
				}
				continue;
			}
			if (result.ok) { // not ok first time
				result = v;
				continue;
			}
			if (result.ttl < v.ttl) { // maximum TTL
				result = v;
			}
		}
		return result;
	}
}
