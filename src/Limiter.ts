import { Counter, Result } from './Counter';
import { ILimiter } from './ILimiter';

export class Limiter implements ILimiter {
	private name: string;
	private rate: number;
	private counter: Counter;

	constructor(name: string, rate: number, counter: Counter) {
		this.name = name;
		this.rate = rate;
		this.counter = counter;
	}

	public limit(key: string): Promise<Result> {
		return this.counter.count(`${this.name}:${key}`, this.rate);
	}
}
