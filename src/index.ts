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
