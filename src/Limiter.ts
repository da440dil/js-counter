import { Counter } from './Counter';
import { Result } from './Result';
import { ILimiter } from './ILimiter';

export class Limiter implements ILimiter {
	private counter: Counter;
	private prefix: string;
	private rate: number;

	constructor(counter: Counter, prefix: string, rate: number) {
		this.counter = counter;
		this.prefix = prefix;
		this.rate = rate;
	}

	public limit(key: string): Promise<Result> {
		return this.counter.count(`${this.prefix}${key}`, this.rate);
	}
}
