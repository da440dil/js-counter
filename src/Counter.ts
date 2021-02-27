import { RedisClient } from 'redis';
import { RedisScript } from 'js-redis-script';

export type WindowParams = {
    /** Redis [client](https://github.com/NodeRedis/node-redis). */
    client: RedisClient;
    /** Window size in milliseconds. Must be greater than 0. */
    size: number;
    /** Maximum key value per window. Must be greater than 0. */
    limit: number;
};

export type ScriptResponse = [number, number];

export type CounterParams = Omit<WindowParams, 'client'> & {
    script: RedisScript<ScriptResponse>;
};

/** Result of count() operation. */
export interface IResult {
    /** Operation success flag. */
    ok: boolean;
    /**
     * Counter after increment.
     * With fixed window algorithm in use counter is current window counter.
     * With sliding window algorithm in use counter is sliding window counter.
     */
    counter: number;
    /**
     * TTL of the current window in milliseconds.
     * Makes sense if operation failed, otherwise ttl is less than 0.
     */
    ttl: number;
}

/** Implements distributed rate limiting. */
export interface ICounter {
    /** Increments key by value. */
    count(key: string, value: number): Promise<IResult>;
}

export class Counter implements ICounter {
    private size: number;
    private limit: number;
    private script: RedisScript<ScriptResponse>;

    constructor({ size, limit, script }: CounterParams) {
        this.size = size;
        this.limit = limit;
        this.script = script;
    }

    public async count(key: string, value: number): Promise<IResult> {
        const res = await this.script.run(1, key, value, this.size, this.limit);
        return { ok: res[1] === -1, counter: res[0], ttl: res[1] };
    }
}
