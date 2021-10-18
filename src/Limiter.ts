import { ICounter, Result } from './ICounter';
import { ILimiter } from './ILimiter';

export class Limiter implements ILimiter {
	private rate: number;
	private counter: ICounter;

	constructor(rate: number, counter: ICounter) {
		this.rate = rate;
		this.counter = counter;
	}

	public next(key: string): Promise<Result> {
		return this.counter.count(key, this.rate);
	}
}
