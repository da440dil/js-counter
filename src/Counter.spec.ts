import { createClient, RedisClient, Callback } from 'redis';
import { Counter, errUnexpectedRedisResponse } from './Counter';

let client: RedisClient;
beforeAll(() => {
    client = createClient();
});
afterAll(() => {
    client.quit();
});

it('Counter', async () => {
    const counter = new Counter({ client, size: 1000, limit: 100, script: '' });

    const redisErr = new Error('Redis error');
    const resErr = new Error(errUnexpectedRedisResponse);

    const evalMock = jest.spyOn(client, 'evalsha');
    evalMock.mockImplementation(makeEvalFn(redisErr, []));
    await expect(counter.count('', 1)).rejects.toThrow(redisErr);

    evalMock.mockImplementation(makeEvalFn(null, undefined));
    await expect(counter.count('', 1)).rejects.toThrow(resErr);

    evalMock.mockImplementation(makeEvalFn(null, ['', -1]));
    await expect(counter.count('', 1)).rejects.toThrow(resErr);

    evalMock.mockImplementation(makeEvalFn(null, [1, '']));
    await expect(counter.count('', 1)).rejects.toThrow(resErr);

    evalMock.mockImplementation(makeEvalFn(null, [1, -1]));
    await expect(counter.count('', 1)).resolves.toMatchObject({ ok: true, counter: 1, ttl: -1 });

    evalMock.mockImplementation(makeEvalFn(null, [1, 0]));
    await expect(counter.count('', 1)).resolves.toMatchObject({ ok: false, counter: 1, ttl: 0 });

    const redisLoadErr = new Error('NOSCRIPT No matching script. Please use EVAL.');

    const loadMock = jest.spyOn(client, 'script');
    evalMock.mockImplementation(makeEvalFn(redisLoadErr, []));
    loadMock.mockImplementation(makeEvalFn(redisErr, undefined));
    await expect(counter.count('', 1)).rejects.toThrow(redisErr);

    evalMock.mockImplementationOnce(makeEvalFn(redisLoadErr, [])).mockImplementationOnce(makeEvalFn(null, [1, -1]));
    loadMock.mockImplementation(makeEvalFn(null, undefined));
    await expect(counter.count('', 1)).resolves.toMatchObject({ ok: true, counter: 1, ttl: -1 });

    loadMock.mockRestore();
    evalMock.mockRestore();
});

type Res = (string | number)[] | string | undefined;

function makeEvalFn(err: Error | null, res: Res) {
    return (...args: (string | number | Callback<Res>)[]): boolean => {
        const cb = args[args.length - 1];
        if (typeof cb === 'function') {
            cb(err, res);
        }
        return false;
    };
}
