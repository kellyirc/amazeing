import test from 'ava';

import { generateMap, blank, transformMap, wrapGen } from '../src/index';

test('can generate simple map', t => {
    const testTf = transformMap(ctx => {
        ctx[1][1] = 1;
    });

    const map = generateMap(testTf, blank(2, 2));

    t.deepEqual(map, [
        [0, 0],
        [0, 1]
    ]);
});

test('can compose generators using ES6 generators', t => {
    const testTf1 = transformMap(ctx => {
        ctx[1][1] = 1;
    });

    const testTf2 = transformMap(ctx => {
        ctx[0][0] = 1;
    });

    const composedMapGen = wrapGen(function*() {
        yield testTf1;
        yield testTf2;
    });

    const map = generateMap(composedMapGen, blank(2, 2));

    t.deepEqual(map, [
        [1, 0],
        [0, 1]
    ]);
});

test('can get result from composed generator in ES6 generator', t => {
    const testGen1Fn = () => wrapGen(function*() {
        yield transformMap(ctx => { ctx[0][0] = 1; });
        return 1;
    });

    const testGen2Fn = (i: number) => transformMap(ctx => {
        ctx[i][i] = 1;
    });

    const composedMapGen = wrapGen(function* () {
        const i: number = yield testGen1Fn();
        t.is(i, 1);

        yield testGen2Fn(i);
    });

    const map = generateMap(composedMapGen, blank(2, 2));

    t.deepEqual(map, [
        [1, 0],
        [0, 1]
    ]);
});
