import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createScript, IRedisClient, INodeRedisClient, IRedisScript } from '@da440dil/js-redis-script';
import { Result } from './Result';
import { ILimiter } from './ILimiter';

const src = readFileSync(resolve(__dirname, '../limit.lua')).toString();

export class BatchLimiter implements ILimiter {
	private script: IRedisScript<Response>;
	private prefixes: string[] = [];
	private args: number[] = [];

	constructor(client: IRedisClient | INodeRedisClient, prefixes: string[], args: number[]) {
		this.script = createScript<Response>(client, src, prefixes.length);
		this.prefixes = prefixes;
		this.args = args;
	}

	public async limit(key: string): Promise<Result> {
		const v = await this.script.run(...this.prefixes.map((v) => `${v}${key}`), ...this.args);
		return new Result(v[0], v[1], v[2]);
	}
}

type Response = [number, number, number];
