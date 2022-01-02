import { Result } from './Result';

/**
 * Implements distributed rate limiting.
 */
export interface ILimiter {
	/**
	 * Applies the limit.
	 * @param key The key to be incremented.
	 */
	limit(key: string): Promise<Result>;
}
