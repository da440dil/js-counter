import { RedisClient } from 'redis'
import { Gateway as RedisGateway } from './redis'
import { Gateway, Params, Counter, TTLError } from './counter'

export { Gateway, Params, Counter, TTLError }

/**
 * Creates new Counter.
 * @param client Redis client.
 * @param params Counter params.
 */
export function createCounter(client: RedisClient, params: Params): Counter {
  return new Counter(new RedisGateway(client), params)
}
