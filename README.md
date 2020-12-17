# js-counter

[![Build Status](https://travis-ci.com/da440dil/js-counter.svg?branch=master)](https://travis-ci.com/da440dil/js-counter)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-counter/badge.svg?branch=master)](https://coveralls.io/github/da440dil/js-counter?branch=master)

Distributed rate limiting using [Redis](https://redis.io/).

Example usage:

- [example](./src/examples/fixedWindow.ts) using [fixed window](./src/fixedWindow.ts) algorithm 

    ```npm run file src/examples/fixedWindow.ts```
- [example](./src/examples/slidingWindow.ts) using [sliding window](./src/slidingWindow.ts) algorithm

    ```npm run file src/examples/slidingWindow.ts```
