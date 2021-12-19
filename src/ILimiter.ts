import { Result } from './Result';

/**
 * Implements distributed rate limiting. Contains one or more distributed counters.
 */
export interface ILimiter {
	/**
	 * Applies the limit: increments key value of each distributed counter.
	 * @param key The key to be incremented.
	 */
	limit(key: string): Promise<Result>;
}
