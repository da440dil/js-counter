import { RedisClient } from 'redis'
import { Gateway } from './redis'
import { Counter, CounterError, Params } from './counter'

export { Gateway, Counter, CounterError }

/**
 * Creates new Counter.
 * @param client Redis client.
 * @param params Counter params.
 */
export default function createCounter(client: RedisClient, params: Params): Counter {
  return new Counter(new Gateway(client), params)
}

createCounter.Counter = Counter
createCounter.Error = CounterError
