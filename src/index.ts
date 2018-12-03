import * as _ from "lodash";

export class Context {
    map: number[][];
    width: number;
    height: number;

    constructor() {
        this.init();
    }

    setTile(x: number, y: number, val: number): void {
        _.set(this.map, [y, x], val);
    }

    protected init(): void {}
};

export type MapGenerator = (ctx: Context) => void;

export type Transformer = (ctx: Context) => void;

export function blank<ContextType extends Context>(width: number, height: number, ctxCtor = Context): ContextType {
    const context = new ctxCtor();
    context.height = height;
    context.width = width;
    context.map = _.range(height).map(y => _.range(width).map(() => 0));
    return <ContextType>context;
}

export function generateMap<ContextType extends Context>(gen: MapGenerator, ctx: ContextType): ContextType {
    gen(ctx);
    return ctx;
}

export function transformMap(tf: Transformer): MapGenerator {
    return tf;
}

export interface Bounds {
    x: number; 
    y: number;
    width: number; 
    height: number;
}

export interface BoundsOptional {
    x: number; 
    y: number; 
    width?: number; 
    height?: number;
}

export function dims<ContextType extends Context>(ctx: ContextType) {
    return { height: ctx.map.length, width: ctx.map[0] == null ? 0 : ctx.map[0].length };
};

export function copy2dRange<ContextType extends Context>(ctx: ContextType, bounds: Bounds): Context {
    const outCtx = blank(bounds.width, bounds.height);
    copyOnto(outCtx, ctx, bounds);
    return outCtx;
}

export function copyOnto<ContextType extends Context>(baseCtx: ContextType, ctxToInsert: Context, bounds: BoundsOptional) {
    const { x, y } = bounds;
    const ctiDims = dims(ctxToInsert);
    const { width, height } = (bounds.width != null && bounds.height != null) ? bounds : ctiDims;

    for(let tx = x; tx < x+width; tx++) {
        for(let ty = y; ty < y+height; ty++) {
            baseCtx.map[ty - y][tx - x] = ctxToInsert.map[ty][tx];
        }
    }
}

export function subset<ContextType extends Context>(mapGen: MapGenerator, bounds: Bounds): MapGenerator {
    return (ctx: ContextType) => {
        const subCtx = copy2dRange(ctx, bounds);
        mapGen(subCtx);
        copyOnto(ctx, subCtx, bounds);
    };
}

export function debug<ContextType extends Context>(ctx: ContextType, formatter: (val: number, x?: number, y?: number) => string = (val: number, x?: number, y?: number) => val.toString()): string {
    let mapString = '';

    for(let y = 0; y < ctx.map.length; y++) {
        for(let x = 0; x < ctx.map[y].length; x++) {
            mapString += formatter(ctx.map[y][x], x, y);
        }
        mapString += '\n';
    }

    return mapString;
}