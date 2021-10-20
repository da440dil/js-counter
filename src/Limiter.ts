import { ICounter, Result } from './ICounter';
import { ILimiter } from './ILimiter';

export class Limiter implements ILimiter {
	private name: string;
	private rate: number;
	private counter: ICounter;

	constructor(name: string, rate: number, counter: ICounter) {
		this.name = name;
		this.rate = rate;
		this.counter = counter;
	}

	public next(key: string): Promise<Result> {
		return this.counter.count(`${this.name}:${key}`, this.rate);
	}
}
