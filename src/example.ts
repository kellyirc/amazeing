import { blank, wrapGen, generateMap } from "./index";

/*
    Map generator that generates a bunch of random rectangles in current context.
    Returns some extra info as well (array of sizes and positions of houses, positions of exits, etc...)
*/
const newHouses = () => wrapGen(function*() { /* impl... */ });

/* Map generator that generates room-y stuff in current context */
const room = () => wrapGen(function*() { /* impl... */ });

/*
    Map generator that creates a map of given dimensions
    and fills with houses randomly positioned across it
*/
const villageMap = () => wrapGen(function*() {
    const houses = yield newHouses();

    for (const house of houses) {
        const houseInsideBbox = {
            x: house.x + 1, y: house.y + 1,
            width: house.width - 2, height: house.height - 2
        };

        // yield subset(room, houseInsideBbox);
    }
});

// create a 100x100 map of a village
generateMap(villageMap(), blank(100, 100));

console.log("Hello world!");
