import { Context, blank, generateMap, subset } from "./index";

/*
    Map generator that generates a bunch of random rectangles in current context.
    Returns some extra info as well (array of sizes and positions of houses, positions of exits, etc...)
*/
const newHouses = function(ctx: Context): any { /* impl... */ };

/* Map generator that generates room-y stuff in current context */
const room = function (ctx: Context): any { /* impl... */ };

/*
    Map generator that creates a map of given dimensions
    and fills with houses randomly positioned across it
*/
const villageMap = function (ctx: Context) {
    const houses = newHouses(ctx);

    for (const house of houses) {
        const houseInsideBbox = {
            x: house.x + 1, y: house.y + 1,
            width: house.width - 2, height: house.height - 2
        };

        subset(room, houseInsideBbox)(ctx);
    }
}

// create a 100x100 map of a village
const ctx = generateMap(villageMap, blank(100, 100));

console.log("Hello world!");
