import test from 'ava';
import * as fc from 'fast-check';
import * as _ from 'lodash';

import { Context, dims, copy2dRange, Bounds } from '../src/index';

const contextArb = fc.integer(1, 100)
    .chain(w => {
        return fc.array(fc.array(fc.integer(), w, w), 1, 100);
    });

const nonEmptyBoundsArb = (maxWidth: number, maxHeight: number) =>
    fc.tuple(fc.nat(maxWidth), fc.nat(maxWidth), fc.nat(maxHeight), fc.nat(maxHeight))
        .map(([x1, x2, y1, y2]) => {
            return {
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.max(x1, x2) - Math.min(x1, x2),
                height: Math.max(y1, y2) - Math.min(y1, y2)
            };
        })
        .filter(bounds => bounds.width > 0 && bounds.height > 0);

const sizeAndBoundsArb = fc.tuple(fc.nat(), fc.nat())
    .filter(([w, h]) => w > 0 && h > 0)
    .chain(([w, h]) =>
        nonEmptyBoundsArb(w, h).map(bounds => [w, h, bounds] as [number, number, Bounds])
    );

const contextAndBoundsArb = contextArb.chain(ctx => {
    const ctxDims = dims(ctx);
    return fc.tuple(fc.constant(ctx), nonEmptyBoundsArb(ctxDims.width, ctxDims.height));
});

test('bounds always inside given width and height', t => {
    t.notThrows(() => {
        fc.assert(fc.property(sizeAndBoundsArb, ([width, height, bounds]) => {
            return bounds.x < width && bounds.y < height
                && bounds.x + bounds.width <= width && bounds.y + bounds.height <= height;
        }));
    });
});

test('bounds always inside context', t => {
    fc.assert(fc.property(contextAndBoundsArb, ([ctx, bounds]) => {
        const { width, height } = dims(ctx);
        return bounds.x < width && bounds.y < height &&
            (bounds.x + bounds.width <= width) && (bounds.y + bounds.height <= height);
    }));

    t.pass();
});

function copy2dRangeTest(ctx: Context, bounds: Bounds): Context {
    return _.range(bounds.y, bounds.y + bounds.height)
        .map(y => _.range(bounds.x, bounds.x + bounds.width)
            .map(x => {
                return ctx[y][x];
            })
        );
}

test('copy 2D range works same whether based on copyOnto or not', t => {
    fc.assert(fc.property(contextAndBoundsArb, ([ctx, bounds]) => {
        return _.isEqual(
            copy2dRangeTest(ctx, bounds),
            copy2dRange(ctx, bounds)
        );
    }));

    t.pass();
});