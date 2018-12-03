import { Context, blank, generateMap, debug } from "./index";
import * as _ from "lodash";

// algo taken from https://github.com/ondras/rot.js/blob/master/src/map/ellermaze.ts

const MAX_HEIGHT = 12;
const MAX_WIDTH = 50;

enum MapTile {
  Wall = 0,
  Floor = 1
};

type List = number[];

export class MazeContext extends Context {
  init() {}
}

const maze = (ctx: MazeContext) => {

  /**
   * Join lists with "i" and "i+1"
   */
  function addToList(i: number, L: List, R: List) {
    R[L[i + 1]] = R[i];
    L[R[i]] = L[i + 1];
    R[i] = i + 1;
    L[i + 1] = i;
  }
  
  /**
   * Remove "i" from its list
   */
  function removeFromList(i: number, L: List, R: List) {
    R[L[i]] = R[i];
    L[R[i]] = L[i];
    R[i] = i;
    L[i] = i;
  }
  
  let w = Math.ceil((MAX_WIDTH - 2) / 2);
  
  let rand = 9 / 24;
  
  let L: List = [];
  let R: List = [];
  
  for(let i = 0; i < w; i++) {
    L.push(i);
    R.push(i);
  }

  L.push(w - 1); /* fake stop-block at the right side */

  let j;
  for(j = 1; j + 3 < MAX_HEIGHT; j += 2) {

    /* one row */
    for (let i = 0; i < w; i++) {

      /* cell coords (will be always empty) */
      let x = 2 * i + 1;
      let y = j;
      ctx.setTile(x, y, MapTile.Floor);
      
      /* right connection */
      if (i != L[i + 1] && Math.random() > rand) {
        addToList(i, L, R);
        ctx.setTile(x + 1, y, MapTile.Floor);
      }
      
      /* bottom connection */
      if (i != L[i] && Math.random() > rand) {

        /* remove connection */
        removeFromList(i, L, R);

      } else {

        /* create connection */
        ctx.setTile(x, y + 1, MapTile.Floor);
      }
    }
  }

  /* last row */
  for (let i = 0; i < w; i++) {

    /* cell coords (will be always empty) */
    let x = 2 * i + 1;
    let y = j;
    ctx.setTile(x, y, MapTile.Floor);
    
    /* right connection */
    if (i != L[i + 1] && (i == L[i] || Math.random() > rand)) {

      /* dig right also if the cell is separated, so it gets connected to the rest of maze */
      addToList(i, L, R);
      ctx.setTile(x + 1, y, MapTile.Floor);
    }
    
    removeFromList(i, L, R);
  }
};

const ctx: MazeContext = generateMap<MazeContext>(maze, blank(MAX_WIDTH, MAX_HEIGHT, MazeContext));

console.log(debug(ctx, (val, x, y) => {
  if(val === 0) return '#';
  return '.';
}));
