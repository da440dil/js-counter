import { readFileSync } from 'fs';
import { join } from 'path';
import { Counter, ICounter, WindowParams } from './Counter';

let src: string;

/** Creates new counter which implements distributed rate limiting using sliding window algorithm. */
export function slidingWindow({ client, size, limit }: WindowParams): ICounter {
	if (!src) {
		src = readFileSync(join(__dirname, './slidingwindow.lua')).toString();
	}
	return new Counter({ client, size, limit, src });
}
