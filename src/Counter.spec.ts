import { RedisClient } from 'redis';
import { RedisScript } from 'js-redis-script';
import { Counter, ScriptResponse } from './Counter';

it('Counter', async () => {
    const script = new RedisScript<ScriptResponse>({
        client: {} as RedisClient,
        src: 'return {1,-1}'
    });
    const counter = new Counter({ size: 1000, limit: 100, script });
    const scriptMock = jest.spyOn(script, 'run');

    scriptMock.mockImplementation(() => Promise.resolve([1, -1]));
    await expect(counter.count('', 1)).resolves.toMatchObject({ ok: true, counter: 1, ttl: -1 });

    scriptMock.mockImplementation(() => Promise.resolve([1, 2]));
    await expect(counter.count('', 1)).resolves.toMatchObject({ ok: false, counter: 1, ttl: 2 });

    scriptMock.mockRestore();
});
