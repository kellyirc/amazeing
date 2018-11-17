import * as _ from "lodash";

export type Context = number[][];
export type MapGenerator = (ctx: Context) => [Context, any];

export function blank(width: number, height: number): Context {
    return _.range(height).map(y => _.range(width).map(() => 0));
}

export function generateMap(gen: MapGenerator, ctx: Context): Context {
    const [finalCtx, resVal] = gen(ctx);
    return finalCtx;
}

export type Transformer = (ctx: Context) => (Context | void);

export function transformMap(tf: Transformer): MapGenerator {
    return (ctx: Context) => [tf(ctx) || ctx, undefined];
}

export type MonadicGeneratorMapGen<T> = () => Iterator<MapGenerator | T>;

export function wrapGen<T>(genFn: MonadicGeneratorMapGen<T>): MapGenerator {
    return (ctx: Context) => {
        const iter = genFn();
        let done = false;
        let curCtx = ctx;
        let nextYieldResult: any = undefined;
        while(!done) {
            const state = iter.next(nextYieldResult);
            if(state.done) {
                done = true;
                const resultValue: T = state.value as T;
                return [curCtx, resultValue];
            }
            else {
                const subMapGen: MapGenerator = state.value as MapGenerator;
                const [nextCtx, resVal] = subMapGen(ctx);
                curCtx = nextCtx;
                nextYieldResult = resVal;
            }
        }
    };
}

export interface Bounds {
    x: number, y: number, width: number, height: number;
}

export interface BoundsOptional {
    x: number, y: number, width?: number, height?: number;
}

export const dims = (ctx: Context) => ({ height: ctx.length, width: ctx[0] == null ? 0 : ctx[0].length });

export function copy2dRange(ctx: Context, bounds: Bounds): Context {
    const outCtx = blank(bounds.width, bounds.height);
    copyOnto(outCtx, ctx, bounds);
    return outCtx;
}

export function copyOnto(baseCtx: Context, ctxToInsert: Context, bounds: BoundsOptional) {
    const { x, y } = bounds;
    const ctiDims = dims(ctxToInsert);
    const { width, height } = (bounds.width != null && bounds.height != null) ? bounds : ctiDims;

    for(let tx = x; tx < x+width; tx++) {
        for(let ty = y; ty < y+height; ty++) {
            baseCtx[ty-y][tx-x] = ctxToInsert[ty][tx];
        }
    }
}

export function subset(mapGen: MapGenerator, bounds: Bounds): MapGenerator {
    return (ctx: Context) => {
        const subCtx = copy2dRange(ctx, bounds);
        const [outSubCtx, resVal] = mapGen(subCtx);
        copyOnto(ctx, outSubCtx, bounds);
        return [ctx, resVal];
    };
}
