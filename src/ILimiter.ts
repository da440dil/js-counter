import { Result } from './ICounter';

/**
 * Implements distributed rate limiting. Contains one or more distributed counters.
 */
export interface ILimiter {
	/**
	 * Increments key value of each distributed counters.
	 * @param key The key to be incremented.
	 */
	next(key: string): Promise<Result>;
}
