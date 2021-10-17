import { IRedisClient, IRedisScript, createScript } from '@da440dil/js-redis-script';

import { ICounter, CountResult } from './ICounter';

export class Counter implements ICounter {
	private size: number;
	private limit: number;
	private script: IRedisScript<[number, number]>;

	constructor(client: IRedisClient, { size, limit, src }: WindowParams & { src: string; }) {
		this.size = size;
		this.limit = limit;
		this.script = createScript<[number, number]>({ client, src, numberOfKeys: 1 });
	}

	public async count(key: string, value: number): Promise<CountResult> {
		const res = await this.script.run(key, value, this.size, this.limit);
		return { ok: res[1] === -1, counter: res[0], ttl: res[1] };
	}
}

export type WindowParams = {
	/** Window size in milliseconds. Must be greater than 0. */
	size: number;
	/** Maximum key value per window. Must be greater than 0. */
	limit: number;
};
