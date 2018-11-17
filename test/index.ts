import test from 'ava';

import { generateMap, blank, transformMap, wrapGen } from '../src/index';

function setAt(x: number, y: number, type: number) {
    return transformMap(ctx => {
        ctx[y][x] = type;
    });
}

test('can generate simple map', t => {
    const testGen = setAt(1, 1, 1);

    const map = generateMap(testGen, blank(2, 2));

    t.deepEqual(map, [
        [0, 0],
        [0, 1]
    ]);
});

test('can compose generators using ES6 generators', t => {
    const testGen1 = setAt(1, 1, 1);
    const testGen2 = setAt(0, 0, 1);

    const composedMapGen = wrapGen(function*() {
        yield testGen1;
        yield testGen2;
    });

    const map = generateMap(composedMapGen, blank(2, 2));

    t.deepEqual(map, [
        [1, 0],
        [0, 1]
    ]);
});

test('can get result from composed generator in ES6 generator', t => {
    const testGen1Fn = () => wrapGen(function*() {
        yield setAt(0, 0, 1);
        return 1;
    });

    const testGen2Fn = (i: number) => setAt(i, i, 1);

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
