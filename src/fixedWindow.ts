import { readFileSync } from 'fs';
import { join } from 'path';
import { Counter, ICounter, WindowParams } from './Counter';

let src: string;

/** Creates new counter which implements distributed rate limiting using fixed window algorithm. */
export function fixedWindow({ client, size, limit }: WindowParams): ICounter {
	if (!src) {
		src = readFileSync(join(__dirname, 'fixedwindow.lua')).toString();
	}
	return new Counter({ client, size, limit, src });
}
