import { createHash } from 'crypto';
import { RedisClient } from 'redis';
import { IWindowParam } from './IWindowParam';

interface ICounterParam extends IWindowParam {
    script: string;
}

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

/** Error message which is thrown when Redis command returns response of invalid type. */
export const errMsgInvalidResponse = 'Invalid redis response';

export class Counter implements ICounter {
    private client: RedisClient;
    private size: number;
    private limit: number;
    private script: string;
    private hash: string;

    constructor({ client, size, limit, script }: ICounterParam) {
        this.client = client;
        this.size = size;
        this.limit = limit;
        this.script = script;
        this.hash = createHash('sha1').update(script).digest('hex');
    }

    public async count(key: string, value: number): Promise<IResult> {
        try {
            return await this.evalsha(key, value);
        } catch (err) {
            if (!isNoScriptErr(err)) {
                throw err;
            }
            await this.load(this.script);
            return this.evalsha(key, value);
        }
    }

    private evalsha(key: string, value: number): Promise<IResult> {
        return new Promise((resolve, reject) => {
            this.client.evalsha(this.hash, 1, key, value, this.size, this.limit, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (!Array.isArray(res)) {
                    return reject(new Error(errMsgInvalidResponse));
                }
                if (typeof res[0] !== 'number') {
                    return reject(new Error(errMsgInvalidResponse));
                }
                if (typeof res[1] !== 'number') {
                    return reject(new Error(errMsgInvalidResponse));
                }
                resolve({ ok: res[1] === -1, counter: res[0], ttl: res[1] });
            });
        });
    }

    private load(script: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.script('load', script, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}

function isNoScriptErr(err: unknown): boolean {
    return err instanceof Error && err.message.startsWith('NOSCRIPT ');
}
