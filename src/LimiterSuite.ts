import { ILimiter, LimitResult } from './ILimiter';

export class LimiterSuite implements ILimiter {
	private limiters: ILimiter[];

	constructor(limiters: ILimiter[]) {
		this.limiters = limiters;
	}

	public async next(key: string): Promise<LimitResult> {
		const results = await Promise.all(this.limiters.map((limiter) => limiter.next(key)));
		let ok = true;
		let ttl = -1;
		for (const result of results) {
			if (!result.ok) {
				ok = false;
				if (ttl < result.ttl) {
					ttl = result.ttl;
				}
			}
		}
		return { ok, ttl };
	}
}
