import { RedisClient } from 'redis';

export interface IWindowParam {
    /** Redis [client](https://github.com/NodeRedis/node-redis). */
    client: RedisClient;
    /** Window size in milliseconds. Must be greater than 0. */
    size: number;
    /** Maximum key value per window. Must be greater than 0. */
    limit: number;
}
