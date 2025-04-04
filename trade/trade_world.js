const DEBUG = true;
const SUPER_DEBUG = false;

function seeded_xy_random(seed, x, y) {
    return seeded_random(seed + "-" + x + "-" + y);
}

const TileType = {
    PLAINS: "PLAINS",
    FOREST: "FOREST",
    PATH: "PATH",
    HILL: "HILL",
    HILL_PATH: "HILL_PATH",
    MARSH: "MARSH",
    BOG: "BOG",
    DESERT: "DESERT",
    DESERT_HILLS: "DESERT_HILLS",
    DESERT_PATH: "DESERT_PATH",
    ROCK: "ROCK",
    MOUNTAIN: "MOUNTAIN",
    MOUNTAIN_PASS: "MOUNTAIN_PASS",
    ROAD: "ROAD",
    WATER: "WATER",
    ICE: "ICE",
}

const tile_info = {
    [TileType.PLAINS]: {speed: 1, col: Colour.from_hex("#41980a"), spawn_info: {
        spawnable: true,
        priority: 1,  // higher number is higher priority
        min: {
            temp: 273 + 10,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: 273 + 18,
            height: 11,
            water: 16,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        // [res, chance, chance_normal, chance_rich, chance_plentiful]
        // default is sparse; each chance is rolled to upgrade
        // only if the previous chance was also successful
        // e.g. for ["meat", 0.2, 0.5, 0.5, 0.5],
        // chance for a sparse deposit is 20%
        // normal 10%, rich 5%, plentiful 2.5%
        // sparse: -50% production. normal 0%, rich +25%, plentiful +50%
        ["meat", 0.04, 0.5, 0.5, 0.5],
        ["fruit", 0.04, 0.5, 0.5, 0.5],
        ["vegetables", 0.1, 0.5, 0.5, 0.5],
    ]},

    [TileType.FOREST]: {speed: 1, col: Colour.from_hex("#136d15"), spawn_info: {
        spawnable: true,
        priority: 2,
        min: {
            temp: 273 + 8,
            height: -18,
            water: 0.001,
            cumulative_water: 0.2
        },

        max: {
            temp: 273 + 16,
            height: 9,
            water: 24,
            cumulative_water: 30
        }
    }, possible_resources: [
        ["hunting_meat", 0.2, 0.5, 0.5, 0.5],
        ["fruit", 0.1, 0.5, 0.5, 0.5],
        ["vegetables", 0.07, 0.5, 0.5, 0.5],
        ["wood", 1, 1, 0, 0],
    ]},

    [TileType.PATH]: {speed: 1, col: Colour.from_hex("#ead0a8"), spawn_info: {
        spawnable: false,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.HILL]: {speed: 1, col: Colour.from_hex("#268b07"), spawn_info: {
        spawnable: true,
        priority: 2,
        min: {
            temp: 273 + 10,
            height: 11,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: 273 + 18,
            height: 25,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        ["meat", 0.03, 0.4, 0.4, 0],
        ["fruit", 0.07, 0.4, 0.4, 0],
        ["vegetables", 0.05, 0.4, 0.4, 0],
    ]},

    [TileType.HILL_PATH]: {speed: 1, col: Colour.from_hex("#d9f669"), spawn_info: {
        spawnable: false,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.MARSH]: {speed: 1, col: Colour.from_hex("#638713"), spawn_info: {
        spawnable: true,
        priority: 1,
        min: {
            temp: 273 + 10,
            height: Number.NEGATIVE_INFINITY,
            water: 4,
            cumulative_water: 8
        },

        max: {
            temp: 273 + 25,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.BOG]: {speed: 1, col: Colour.from_hex("#5e6717"), spawn_info: {
        spawnable: true,
        priority: 2,
        min: {
            temp: 273 + 10,
            height: Number.NEGATIVE_INFINITY,
            water: 6,
            cumulative_water: 10
        },

        max: {
            temp: 273 + 20,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.DESERT]: {speed: 1, col: Colour.from_hex("#ffe29c"), spawn_info: {
        spawnable: true,
        priority: 2,
        min: {
            temp: 273 + 20,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: 0.2,
            cumulative_water: 2
        }
    }, possible_resources: [
        
    ]},

    [TileType.DESERT_HILLS]: {speed: 1, col: Colour.from_hex("#eabf7d"), spawn_info: {
        spawnable: true,
        priority: 3,
        min: {
            temp: 273 + 20,
            height: 7,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: 0.25,
            cumulative_water: 2
        }
    }, possible_resources: [
        ["gold_ore", 0.03, 0.3, 0, 0],
        ["gemstones", 0.005, 0.3, 0, 0],
    ]},

    [TileType.DESERT_PATH]: {speed: 1, col: Colour.from_hex("#fddda0"), spawn_info: {
        spawnable: false,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.ROCK]: {speed: 1, col: Colour.from_hex("#4a515d"), spawn_info: {
        spawnable: true,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0.5,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: 4,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        ["copper_ore", 0.08, 0.5, 0.5, 0.5],
        ["iron_ore", 0.08, 0.5, 0.5, 0.5],
        ["gold_ore", 0.03, 0.5, 0.5, 0.5],
        ["gemstones", 0.0075, 0.5, 0.5, 0.5],
        ["coal", 0.1, 0.5, 0.5, 0.5],
    ]},

    [TileType.MOUNTAIN]: {speed: 1, col: Colour.from_hex("#93a2ba"), spawn_info: {
        spawnable: true,
        priority: 4,
        min: {
            temp: 0,
            height: 50,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        ["copper_ore", 0.1, 1, 0.6, 0.6],
        ["iron_ore", 0.1, 1, 0.6, 0.6],
        ["gold_ore", 0.05, 1, 0.6, 0.6],
        ["gemstones", 0.01, 1, 0.6, 0.6],
        ["coal", 0.14, 1, 0.6, 0.6],
    ]},
    
    [TileType.MOUNTAIN_PASS]: {speed: 1, col: Colour.from_hex("#768295"), spawn_info: {
        spawnable: false,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.ROAD]: {speed: 1, col: Colour.from_hex("#eda469"), spawn_info: {
        spawnable: false,
        priority: 0,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 0,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},

    [TileType.WATER]: {speed: 1, col: Colour.from_hex("#2389da"), spawn_info: {
        spawnable: true,
        priority: 999,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 7,
            cumulative_water: 0
        },

        max: {
            temp: Number.POSITIVE_INFINITY,
            height: 30,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        ["fish", 0.07, 0.5, 0.5, 0.4],
    ]},

    [TileType.ICE]: {speed: 1, col: Colour.from_hex("#b9e8ea"), spawn_info: {
        spawnable: true,
        priority: 1000,
        min: {
            temp: 0,
            height: Number.NEGATIVE_INFINITY,
            water: 8,
            cumulative_water: 0
        },

        max: {
            temp: 273 + 2,
            height: 30,
            water: Number.POSITIVE_INFINITY,
            cumulative_water: Number.POSITIVE_INFINITY
        }
    }, possible_resources: [
        
    ]},
}

class Tile {
    constructor(tiletype) {
        this.tiletype = tiletype;
    }
}

// todo struggling to get tile picking working

class World {
    // traders take up a 4x4 space, settlements start at 8x8 and get bigger over time
    // worldgen like crpg
    // regions selected based on conditions to be sources of base resources (ore, meat, fish, fruit, vegetables)
    constructor(size) {
        this.size = size;
        this.tilemap = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => new Tile(TileType.PLAINS)))
    }

    static generate(size, seed) {
        /*
        1) assume base temperature of 15C. create some "heat" sources and some "cold" sources (areas with different temperature) randomly at the map edges.
        2) assign each temp source a wind direction pointing randomly inwards. magnitude is wind strength
        3) generate heightmap by picking a random height for every single tile
        4) generate 1-3 plate boundaries and determine if they are convergent (reduces height) or divergent (adds height)
        5) generate 0 or more infinite water sources at the edge of the map with random height
        6) do this many times:
            - propagate wind by pushing it through the world. altitude above sea level will disrupt wind and push it outwards, altitude below sea level will pull it inwards
            - after propagating wind, update temperatures by "smearing" them in the direction of the wind
            - then, normalise the temperatures based on altitude (higher = cooler) and over water (push temperature towards base temperature based on how high the water is)
            - generate rain regions (circles) on the map sides and move them in the wind direction (take average of wind direction from entire region radius) across the map, depositing rainfall on each movement
              also add the rainfall to the water content of that tile 
            - perform erosion:
                - remove some height from any tiles with higher altitude than their neighbours, near heavy wind
                - tiles with high water content try to spread their water to adjacent tiles with lower altitude and less water
                  this process reduces the height of the involved tiles and any neighbouring tiles with higher altitude (to a lesser extent)
                  water also increases the effective height of the tile when it tries to spread (0.1 height per unit of water)
            - perform plate tectonics; add height to tiles near divergent plates and remove height from tiles near convergent plates
            - decay some of the water from each tile
        */
        let p = {
            initial: {
                base_height: 0,
                height_variation: 40,
                base_temperature: 273 + 15,
                base_water_level: 0.2,
            },

            tectonics: {
                min_plates: 4,
                max_plates: 8,
                plate_variation_strength: 0.1,
                plate_max_effect_per_step: 0.004,
                plate_effect_range: 64,  // effect scales linearly downwards based on distance
                divergent_plate_chance: 0.5,
                plate_boundary_accuracy: 0.05, // chance to miss a plate boundary point when finding the distance of a tile from it
            },

            heat: {
                water_temperature_normalisation: 0.001,      // Amount that the temperature tends back to the base temperature over water, based on water level.
                max_water_temperature_normalisation: 0.01, // Maximum amount to normalise per smear step.
                heat_loss_on_wind: 0.001,          // Amount of heat to lose over the course of a smear step (so faster winds pull more heat a greater distance)
                heat_application_on_wind: 0.95,     // Amount of heat to apply (not lose) per smear substep.
                altitude_heat_dissipation: 0.0007,  // Amount of heat to remove per altitude level

                min_source_temp: 273 + 0,
                max_source_temp: 273 + 35,

                temperature_spread_proportion: 0.7,
                temperature_spread_steps: 4,
            },

            water: {
                min_infinite_water_sources: 1,
                max_infinite_water_sources: 4,

                min_infinite_water_source_flow_amt: 40,
                max_infinite_water_source_flow_amt: 100,

                water_spread_factor: 0.7,
                water_spread_steps: 3,

                evaporation_base: 0.06,
                evaporation_per_temp_above_273: 0.03,
                evaporation_per_wind: 0.025,

                evaporation_condensation_proportion: 0.005,  // this proportion of evaporated water will be spread equally to neighbouring tiles below (including the one evaporated from)
                evaporation_condensation_range: 3
            },

            rainfall: {
                min_rain_regions: 16,
                max_rain_regions: 32,

                min_rain_region_size: 8,
                max_rain_region_size: 32,

                min_rain_region_intensity: 0.2,
                max_rain_region_intensity: 0.5,

                rain_region_movement_multiplier: 1,
                rain_region_decay: 0.998
            },

            wind: {
                min_permanent_wind_sources: 4,
                max_permanent_wind_sources: 8,

                min_temporary_wind_sources: 2,
                max_temporary_wind_sources: 4,

                min_wind_source_intensity: 3,
                max_wind_source_intensity: 10,

                min_wind_source_r: 32,
                max_wind_source_r: 128,

                altitude_wind_push: 0.05,  // positive altitude
                altitude_wind_pull: 0.02, // negative altitude

                wind_strength_falloff: 0.99,
                wind_granularity: 4,
                wind_dir_variation: 0.1,
            },

            erosion: {
                wind_erosion_strength: 0.0004,  // tries to shave off the difference between the tile and the next tallest immediate neighbour
                                              // proportion is based on this
                wind_erosion_range: 3,        // range of tiles to check for wind - totals together all wind sources above 0 and averages them
                water_direct_erosion_strength: 0.045,  // height removed in direct water movement path, per unit of water moved

                water_neighbour_erosion_range: 2,  // strength of erosion scales linearly
                water_neighbour_erosion_strength: 0.0235,  // height removed from taller neighbours, per unit of water moved
            
                min_height: -20,
            },

            simulation: {
                steps: 150
            }
        }

        // TODO other stuff looks good - figure out how to make temperature a bit more      temperature
        // i'm pretty sure wind is propagating wrong and being pushed away by negative altitude instead of being pulled in (and vice versa)

        let start_time = Date.now();

        function time_from_start() {
            return `${Math.round((Date.now() - start_time) / 10) / 100}s`;
        }

        function gen_log(msg) {
            console.log(`${time_from_start().padEnd(8)} ${msg}`);
        }

        gen_log(`[Initial setup]`);

        let world_obj = new World(size);
        let rnd = get_seeded_randomiser(seed);

        function pick(from, to) {
            return Math.floor(rnd() * (to - from)) + from;
        }

        function in_map(pos, clearance=0) {
            return (
                pos.x >= -clearance && 
                pos.y >= -clearance &&
                pos.x < size.x + clearance &&
                pos.y < size.y + clearance
            )
        }

        let temperature_map = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => p.initial.base_temperature));
        let water_map = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => p.initial.base_water_level));
        let cumulative_water_map = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => p.initial.base_water_level)); 
        let height_map = new Array(size.x).fill(0).map((_, x) => new Array(size.y).fill(0).map((__, y) => {
            return (p.initial.height_variation * rnd()) - (p.initial.height_variation / 2)
        }));

        // generate wind sources
        let permanent_wind_sources = [];
        let num_wind_sources = pick(p.wind.min_permanent_wind_sources, p.wind.max_permanent_wind_sources);
        for (let i=0; i<num_wind_sources; i++) {
            let wind_source_location = null;
            let d = true;
            if (rnd() < 0.5) {
                wind_source_location = new Vector2(rnd() < 0.5 ? 0 : size.x-1, Math.floor(rnd() * size.y));
            } else {
                wind_source_location = new Vector2(Math.floor(rnd() * size.x), rnd() < 0.5 ? 0 : size.y-1);
                d = false;
            }

            let wind_source_intensity = pick(p.wind.min_wind_source_intensity, p.wind.max_wind_source_intensity);
            let wind_source_direction = random_on_circle(1, rnd);

            // make sure the direction is pointing inwards
            let inwards_vector = new Vector2(size.x / 2, size.y / 2).sub(wind_source_location);

            // pull the random vector so it's pointing inwards, then multiply it up by the intensity
            wind_source_direction = wind_source_direction.add(inwards_vector.normalize().mul(1.1)).normalize().mul(wind_source_intensity);

            let wind_source_r = pick(p.wind.min_wind_source_r, p.wind.max_wind_source_r);

            let temperature = pick(p.heat.min_source_temp, p.heat.max_source_temp);

            permanent_wind_sources.push({
                pos: wind_source_location,
                dir: wind_source_direction,
                r: wind_source_r,
                is_vertical: d,
                temperature: temperature
            });
        }

        // generate plate boundaries
        let plate_boundaries = [];
        let num_plates = pick(p.tectonics.min_plates, p.tectonics.max_plates);
        for (let i=0; i<num_plates; i++) {
            // pick a random position and a direction
            // pick a forward direction and backward direction, iterate this until the positions are both off the map
            let start_position = new Vector2(pick(0, size.x), pick(0, size.y));
            let start_direction = random_on_circle(1, rnd);

            let forward_pos = start_position.copy();
            let forward_dir = start_direction.copy();

            let backward_pos = start_position.copy();
            let backward_dir = start_direction.mul(-1);
            
            let boundary = [];
            let carving_fwd = true;
            let carving_bkw = true;
            while (carving_fwd || carving_bkw) {
                if (carving_fwd) {
                    if (!boundary.some(p => p.equals(forward_pos.round()))) {
                        boundary.push(forward_pos.round());
                    }

                    forward_pos = forward_pos.add(forward_dir);
                    forward_dir = forward_dir.add(random_on_circle(p.tectonics.plate_variation_strength, rnd)).normalize();

                    if (!in_map(forward_pos, p.tectonics.plate_effect_range)) {
                        carving_fwd = false;
                    }
                }

                if (carving_bkw) {
                    if (!boundary.some(p => p.equals(backward_pos.round()))) {
                        boundary.push(backward_pos.round());
                    }

                    backward_pos = backward_pos.add(backward_dir);
                    backward_dir = backward_dir.add(random_on_circle(p.tectonics.plate_variation_strength, rnd)).normalize();

                    if (!in_map(backward_pos, p.tectonics.plate_effect_range)) {
                        carving_bkw = false;
                    }
                }
            }

            plate_boundaries.push({
                divergent: rnd() < p.tectonics.divergent_plate_chance,  // divergent means increase height
                boundary: boundary
            });
        }

        // generate some infinite water sources
        let infinite_water_sources = [];
        let num_water_sources = pick(p.water.min_infinite_water_sources, p.water.max_infinite_water_sources)
        for (let i=0; i<num_water_sources; i++) {
            let water_source_location = null;
            if (rnd() < 0.5) {
                water_source_location = new Vector2(rnd() < 0.5 ? 0 : size.x-1, Math.floor(rnd() * size.y));
            } else {
                water_source_location = new Vector2(Math.floor(rnd() * size.x), rnd() < 0.5 ? 0 : size.y-1);
            }

            let water_source_level = pick(p.water.min_infinite_water_source_flow_amt, p.water.max_infinite_water_source_flow_amt);

            infinite_water_sources.push({
                pos: water_source_location,
                level: water_source_level
            });
        }

        /*
        permanent_wind_sources.push({
            pos: new Vector2(0, size.y / 2),
            dir: new Vector2(4, 0),
            r: size.y + 2,
            is_vertical: true,
            temperature: p.initial.base_temperature
        });
        */

        let neighbour_vecs = [new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(0, -1)];
        for (let sim_step=0; sim_step<p.simulation.steps; sim_step++) {
            gen_log(`[Step ${sim_step+1}/${p.simulation.steps}]`);

            gen_log(` - Propagating wind sources`);
            // - propagate wind by pushing it through the world. altitude above sea level will disrupt wind and push it outwards, altitude below sea level will pull it inwards
            // set wind for infinite wind source locations
            let wind_sources_to_propagate = [];
            let wind_map = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => new Vector2(0, 0)));
            
            let temp_wind_sources = [];
            let num_wind_sources = pick(p.wind.min_temporary_wind_sources, p.wind.max_temporary_wind_sources);
            for (let i=0; i<num_wind_sources; i++) {
                let wind_source_location = null;
                let d = true;
                if (rnd() < 0.5) {
                    wind_source_location = new Vector2(rnd() < 0.5 ? 0 : size.x-1, Math.floor(rnd() * size.y));
                } else {
                    wind_source_location = new Vector2(Math.floor(rnd() * size.x), rnd() < 0.5 ? 0 : size.y-1);
                    d = false;
                }

                let wind_source_intensity = pick(p.wind.min_wind_source_intensity, p.wind.max_wind_source_intensity);
                let wind_source_direction = random_on_circle(1, rnd);

                // make sure the direction is pointing inwards
                let inwards_vector = new Vector2(size.x / 2, size.y / 2).sub(wind_source_location);

                // pull the random vector so it's pointing inwards, then multiply it up by the intensity
                wind_source_direction = wind_source_direction.add(inwards_vector.normalize().mul(1.1)).normalize().mul(wind_source_intensity);

                let wind_source_r = pick(p.wind.min_wind_source_r, p.wind.max_wind_source_r);

                let temperature = pick(p.heat.min_source_temp, p.heat.max_source_temp);

                temp_wind_sources.push({
                    pos: wind_source_location,
                    dir: wind_source_direction,
                    r: wind_source_r,
                    is_vertical: d,
                    temperature: temperature
                });
            }

            let wind_sources = [...permanent_wind_sources, ...temp_wind_sources];

            wind_sources.forEach(source => {
                gen_log(`     - Start: ${source.pos.round_dp(0).toString().padEnd(12)} | Direction: ${source.dir.round_dp(2).toString().padEnd(16)} | Width: ${source.r.toString().padEnd(4)} | Temperature: ${source.temperature}`)

                let dir_mag = source.dir.magnitude();

                for (let wind_w = -source.r; wind_w <= source.r; wind_w += (1 / p.wind.wind_granularity)) {
                    let offset_pos = source.pos.add(
                        source.is_vertical ? new Vector2(0, wind_w) : new Vector2(wind_w, 0)
                    ).round();

                    let dir_adjusted = source.dir.add(random_on_circle(dir_mag * p.wind.wind_dir_variation, rnd))

                    if (in_map(offset_pos)) {
                        wind_sources_to_propagate.push({
                            pos: offset_pos,
                            dir: dir_adjusted,
                            temp: source.temperature
                        })
                    }
                }
            })

            if (SUPER_DEBUG) {
                layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);
            }

            // propagate - do each wind source in turn and push them through the world
            // altitude above or below 0 affects the wind by pushing it out or pulling it in
            wind_sources_to_propagate.forEach(source => {
                let current_src_pos = source.pos;
                let current_src_dir = source.dir;
                let current_src_temp = source.temp;

                while (in_map(current_src_pos.round())) {
                    if (SUPER_DEBUG) {
                        let rpos = current_src_pos.round();

                        let c = new Colour(
                            Math.max(0, Math.min(255, 32 * (temperature_map[rpos.x][rpos.y] - p.initial.base_temperature))),
                            64,
                            Math.max(0, Math.min(255, 32 * (p.initial.base_temperature - temperature_map[rpos.x][rpos.y]))),
                            255
                        );

                        let start_pos = current_src_pos;
                        let end_pos = start_pos.add(current_src_dir);

                        layers.debug_front.ctx.strokeStyle = c.css();
                        layers.debug_front.ctx.beginPath();
                        layers.debug_front.ctx.moveTo(start_pos.x, start_pos.y);
                        layers.debug_front.ctx.lineTo(end_pos.x, end_pos.y);
                        layers.debug_front.ctx.stroke();
                        layers.debug_front.ctx.closePath();
                    }

                    let smear_steps = Math.round(current_src_dir.magnitude());
                    
                    // Temperature is affected on each smear substep by the difference between the wind temperature and the tile temperature.
                    // It imparts its temperature on the tile in return for moving closer to the temperature of the tile it just imparted on.
                    let normalised_direction = current_src_dir.div(smear_steps);
                    let did_anything = false;
                    for (let i=0; i<smear_steps; i++) {
                        did_anything = true;
                        let rounded_src = current_src_pos.round();

                        if (in_map(rounded_src)) {
                            let temperature_diff = current_src_temp - temperature_map[rounded_src.x][rounded_src.y];
                            
                            let amt_to_push = temperature_diff * (p.heat.heat_application_on_wind / smear_steps);
                            let amt_to_lose = temperature_diff * (p.heat.heat_loss_on_wind / smear_steps);

                            temperature_map[rounded_src.x][rounded_src.y] += amt_to_push;
                            wind_map[rounded_src.x][rounded_src.y] = wind_map[rounded_src.x][rounded_src.y].add(current_src_dir);

                            if (amt_to_lose == Number.NEGATIVE_INFINITY || temperature_map[rounded_src.x][rounded_src.y] <= 0) {
                                console.log(temperature_map[rounded_src.x][rounded_src.y], temperature_diff, amt_to_lose, current_src_temp);

                                debugger;
                            }

                            current_src_temp -= amt_to_lose;

                            // lose temperature based on altitude
                            let altitude_loss = Math.max(0, p.heat.altitude_heat_dissipation * height_map[rounded_src.x][rounded_src.y]);
                            current_src_temp -= altitude_loss;

                            // bring temperature closer to base temperature when over water
                            let water_normalisation_factor = Math.min(
                                p.heat.water_temperature_normalisation * water_map[rounded_src.x][rounded_src.y],
                                p.heat.max_water_temperature_normalisation
                            );
                            let base_temp_diff = p.initial.base_temperature - current_src_temp;
                            let water_change = water_normalisation_factor * base_temp_diff;
                            current_src_temp += water_change;

                            // of the surrounding 4 tiles, push the wind away if higher and pull towards if lower
                            neighbour_vecs.forEach(vec => {
                                let neighbour = current_src_pos.add(vec).round();
                                if (in_map(neighbour)) {
                                    let own_height = height_map[rounded_src.x][rounded_src.y];
                                    let neighbour_height = height_map[neighbour.x][neighbour.y];

                                    let height_diff = neighbour_height - own_height;
                                    // if neighbour is higher (height_diff positive), push away - otherwise pull
                                    let amt = 0;
                                    if (height_diff > 0) {
                                        amt = p.wind.altitude_wind_push * height_diff;
                                    } else {
                                        amt = -p.wind.altitude_wind_pull * height_diff;
                                    }

                                    // - keeps magnitude the same
                                    // let m = current_src_dir.magnitude();
                                    // current_src_dir = current_src_dir.normalize().add(vec.neg().mul(amt)).normalize().mul(m);

                                    // - affects magnitude
                                    current_src_dir = current_src_dir.add(vec.neg().mul(amt));
                                }
                            })
                        }

                        if (Number.isNaN(current_src_temp)) {
                            debugger;
                        }
                        
                        current_src_pos = current_src_pos.add(normalised_direction);
                    }

                    current_src_dir = current_src_dir.mul(p.wind.wind_strength_falloff);

                    if (!did_anything) {
                        break;
                    }
                }
            })

            gen_log(` - Simulating rain regions`);
            // generate rain regions (circles) on the map sides and move them in the wind direction 
            // (take average of wind direction from entire region radius) across the map, depositing rainfall on each movement
            let rain_regions = [];
            let num_rain_regions = pick(p.rainfall.min_rain_regions, p.rainfall.max_rain_regions)
            for (let i=0; i<num_rain_regions; i++) {
                let intensity = pick(p.rainfall.min_rain_region_intensity, p.rainfall.max_rain_region_intensity);
                let region_size = pick(p.rainfall.min_rain_region_size, p.rainfall.max_rain_region_size);

                let location = null;
                let location_offset = region_size - 2;
                if (rnd() < 0.5) {
                    location = new Vector2(rnd() < 0.5 ? -location_offset : size.x-1+location_offset, Math.floor(rnd() * size.y));
                } else {
                    location = new Vector2(Math.floor(rnd() * size.x), rnd() < 0.5 ? -location_offset : size.y-1+location_offset);
                }

                rain_regions.push({
                    pos: location,
                    intensity: intensity,
                    size: region_size  // radius
                });
            }

            rain_regions.forEach(region => {
                let cur_pos = region.pos;
                let offset = region.size - 2;
                let cur_intensity = region.intensity;
                let siz = region.size;

                while (in_map(cur_pos, offset) && cur_intensity > 0.01) {
                    let sum_wind = new Vector2(0, 0);
                    let cnt_wind = 0;
                    for (let x=-siz; x<=siz; x++) {
                        for (let y=-siz; y<=siz; y++) {
                            // in circle if distance from center is <= siz
                            let delta = new Vector2(x, y);
                            let loc = delta.add(cur_pos).round();
                            let sq_dist = delta.sqr_magnitude();
                            if (sq_dist <= siz*siz && in_map(loc)) {
                                // do averages
                                sum_wind = sum_wind.add(wind_map[loc.x][loc.y]);
                                cnt_wind++;

                                // add water
                                water_map[loc.x][loc.y] += cur_intensity;
                            }
                        }
                    }

                    let avg_wind = sum_wind.div(cnt_wind);
                    cur_pos = cur_pos.add(avg_wind.mul(p.rainfall.rain_region_movement_multiplier));

                    cur_intensity *= p.rainfall.rain_region_decay;
                }
            })

            // infinite water sources
            infinite_water_sources.forEach(source => {
                // add the amount of water to the position just straight up
                water_map[source.pos.x][source.pos.y] += source.level;
            })

            // erosion time!
            gen_log(` - Erosion`);
            let height_deltas = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => 0));

            // water spread
            gen_log(`     - Water (${p.water.water_spread_steps} steps)`);
            for (let ws=0; ws<p.water.water_spread_steps; ws++) {
                let water_deltas = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => 0));

                for (let x=0; x<size.x; x++) {
                    for (let y=0; y<size.y; y++) {
                        let loc = new Vector2(x, y);

                        let altitude = height_map[loc.x][loc.y];
                        let water = water_map[loc.x][loc.y];
                        let total_height = altitude + (0.1 * water);
                        if (water > 0) {
                            let total_of_neighbour_height_diffs = 0;
                            let max_height_diff = Number.NEGATIVE_INFINITY;
                            let height_differences = neighbour_vecs.map(vec => {
                                let neighbour = loc.add(vec);
                                if (in_map(neighbour)) {
                                    let n_altitude = height_map[neighbour.x][neighbour.y];
                                    let n_water = water_map[neighbour.x][neighbour.y];
                                    let n_total_height = n_altitude + (0.1 * n_water);

                                    let height_diff = Math.max(0, total_height - n_total_height);

                                    total_of_neighbour_height_diffs += height_diff;
                                    max_height_diff = Math.max(max_height_diff, height_diff);

                                    return [height_diff, neighbour];
                                }

                                return [0, neighbour]
                            });

                            // normalise them so we have the proportions of water to send to each
                            height_differences = height_differences.map(d => {
                                return [
                                    d[0] / (total_of_neighbour_height_diffs == 0 ? 1 : total_of_neighbour_height_diffs), d[1]
                                ]
                            })

                            // then send them - the total amount of water to send is equal to Math.min(max_height_diff * 10, water)
                            let amt_total = Math.min(max_height_diff * 10, water) * p.water.water_spread_factor;
                            height_differences.forEach(d => {
                                let factor = d[0];

                                if (factor <= 0) {
                                    return;    
                                }

                                let vec = d[1];
                                
                                let water_amt = factor * amt_total

                                if (isNaN(water_amt)) {
                                    debugger;
                                }

                                water_deltas[loc.x][loc.y] -= water_amt;
                                water_deltas[vec.x][vec.y] += water_amt;

                                // then do erosion based on this. erode both the source and the target
                                height_deltas[loc.x][loc.y] -= p.erosion.water_direct_erosion_strength * water_amt;
                                height_deltas[vec.x][vec.y] -= p.erosion.water_direct_erosion_strength * water_amt;

                                // and erode their neighbours
                                for (let xt=-p.erosion.water_neighbour_erosion_range; xt<=p.erosion.water_neighbour_erosion_range; xt++) {
                                    for (let yt=-p.erosion.water_neighbour_erosion_range; yt<=p.erosion.water_neighbour_erosion_range; yt++) {
                                        let off = new Vector2(xt, yt);

                                        let o_loc = loc.add(off);
                                        let o_vec = vec.add(off);
    
                                        if (in_map(o_loc)) {
                                            height_deltas[o_loc.x][o_loc.y] -= p.erosion.water_neighbour_erosion_strength * water_amt;
                                        }
    
                                        if (in_map(o_vec)) {
                                            height_deltas[o_vec.x][o_vec.y] -= p.erosion.water_neighbour_erosion_strength * water_amt;
                                        }
                                    }
                                }
                            })
                        }
                    }
                }

                for (let x=0; x<size.x; x++) {
                    for (let y=0; y<size.y; y++) {
                        water_map[x][y] += water_deltas[x][y];
                    }
                }
            }

            gen_log(`     - Wind`);
            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    // get the height of the highest adjacent neighbour with less height than this
                    let loc = new Vector2(x, y);
                    let tile_height = height_map[loc.x][loc.y];

                    let highest = Number.NEGATIVE_INFINITY;
                    neighbour_vecs.forEach(vec => {
                        let neighbour = loc.add(vec);
                        if (in_map(neighbour)) {
                            let n_height = height_map[neighbour.x][neighbour.y];
                            if (n_height < tile_height && n_height > highest) {
                                highest = n_height;
                            }
                        }
                    });

                    if (highest != Number.NEGATIVE_INFINITY) {
                        let diff = tile_height - highest;

                        // get the average wind strength (ignoring 0s)
                        let sum_strengths = 0;
                        let cnt_strengths = 0;
                        for (let xt=-p.erosion.wind_erosion_range; xt<=p.erosion.wind_erosion_range; xt++) {
                            for (let yt=-p.erosion.wind_erosion_range; yt<p.erosion.wind_erosion_range; yt++) {
                                let pos = loc.add(new Vector2(xt, yt));
                                if (in_map(pos)) {
                                    let wind = wind_map[pos.x][pos.y];
                                    let wind_mag = wind.magnitude();
                                    if (wind_mag > 0) {
                                        sum_strengths += wind_mag;
                                        cnt_strengths++;
                                    }
                                }
                            }
                        }

                        let avg_strength = cnt_strengths <= 0 ? 0 : sum_strengths / cnt_strengths;
                        let factor = Math.max(0, Math.min(1, p.erosion.wind_erosion_strength * avg_strength));

                        let change = diff * factor;
                        height_deltas[loc.x][loc.y] -= change;
                    }
                }
            }

            // apply height deltas
            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    height_map[x][y] += height_deltas[x][y];
                    height_map[x][y] = Math.max(p.erosion.min_height, height_map[x][y]);
                }
            }

            gen_log(` - Tectonics`);
            // plate tectonics
            plate_boundaries.forEach((plate, plate_index) => {
                gen_log(`     - Plate ${plate_index} (accuracy: ${p.tectonics.plate_boundary_accuracy})`);
                let divergent = plate.divergent;
                let boundary = plate.boundary;

                let cut_boundary = boundary.filter(_ => {
                    return rnd() < p.tectonics.plate_boundary_accuracy
                });

                gen_log(`         - ${plate.divergent ? "Divergent (add height)" : "Convergent (remove height)"}`);
                gen_log(`         - Boundary length changed from ${boundary.length} to ${cut_boundary.length}`);

                for (let x=0; x<size.x; x++) {
                    for (let y=0; y<size.y; y++) {
                        let loc = new Vector2(x, y);

                        // for each position, get the distance from the plate - sum it together to get the total effect
                        let effect_sum = cut_boundary.reduce((prev, c) => {
                            return Math.max(0, p.tectonics.plate_effect_range - c.distance(loc)) + prev
                        }, 0);

                        let effect_amount = p.tectonics.plate_max_effect_per_step * (effect_sum / p.tectonics.plate_effect_range) * (divergent ? 1 : -1);

                        effect_amount /= p.tectonics.plate_boundary_accuracy;

                        height_map[x][y] += effect_amount;
                    }
                }
            });

            // water decay, add water to cumulative water
            let water_deltas = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => 0));
            let condense_range_factor = Math.pow((p.water.evaporation_condensation_range * 2) + 1, 2);

            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    let evaporation_factor = p.water.evaporation_base + (
                        (temperature_map[x][y] - 273) * p.water.evaporation_per_temp_above_273
                    ) + (
                        (wind_map[x][y].magnitude()) * p.water.evaporation_per_wind
                    );
                    evaporation_factor = Math.max(0, evaporation_factor);

                    cumulative_water_map[x][y] += water_map[x][y];

                    let evaporation_amount = Math.min(water_map[x][y], evaporation_factor);
                    let neighbour_condense_amount = (p.water.evaporation_condensation_proportion * evaporation_amount) / condense_range_factor;

                    water_deltas[x][y] -= evaporation_amount;
                    for (let xt=-p.water.evaporation_condensation_range; xt<=p.water.evaporation_condensation_range; xt++) {
                        for (let yt=-p.water.evaporation_condensation_range; yt<=p.water.evaporation_condensation_range; yt++) {
                            let v = new Vector2(x + xt, y + yt);
                            if (in_map(v)) {
                                water_deltas[v.x][v.y] += neighbour_condense_amount
                            }
                        }
                    }
                }
            }

            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    water_map[x][y] += water_deltas[x][y];
                }
            }

            gen_log(` - Temperature spread (${p.heat.temperature_spread_steps} steps)`);
            for (let sc=0; sc<p.heat.temperature_spread_steps; sc++) {
                let temperature_deltas = new Array(size.x).fill(0).map(_ => new Array(size.y).fill(0).map(__ => 0));
                for (let x=0; x<size.x; x++) {
                    for (let y=0; y<size.y; y++) {
                        let pos = new Vector2(x, y);
                        let spread_amt = temperature_map[x][y] * p.heat.temperature_spread_proportion;
                        let cnt = 0;
                        neighbour_vecs.forEach(v => {
                            let n = pos.add(v);
                            if (in_map(n)) {
                                cnt++;
                            }
                        });

                        neighbour_vecs.forEach(v => {
                            let n = pos.add(v);
                            if (in_map(n)) {
                                temperature_deltas[n.x][n.y] += spread_amt / 4;
                            }
                        });

                        temperature_deltas[x][y] -= spread_amt * (cnt / 4);
                    }
                }

                for (let x=0; x<size.x; x++) {
                    for (let y=0; y<size.y; y++) {
                        temperature_map[x][y] += temperature_deltas[x][y];
                    }
                }
            }

            gen_log(" - Debug drawing");
            if (DEBUG) {
                layers.debug_back.ctx.clearRect(0, 0, canvas_width, canvas_height);
                layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);
                layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);
                layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);

                if (!SUPER_DEBUG) {
                    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);
                    for (let x=0; x<size.x; x++) {
                        for (let y=0; y<size.y; y++) {
                            let c = new Colour((x+y)%2 == 0 ? 128 : 255, 0, 0, Math.min(255, wind_map[x][y].magnitude() * 16));
        
                            let start_pos = new Vector2(x, y);
                            let end_pos = start_pos.add(wind_map[x][y].mul(1));
        
                            layers.debug_front.ctx.strokeStyle = c.css();
                            layers.debug_front.ctx.beginPath();
                            layers.debug_front.ctx.moveTo(start_pos.x, start_pos.y);
                            layers.debug_front.ctx.lineTo(end_pos.x, end_pos.y);
                            layers.debug_front.ctx.stroke();
                            layers.debug_front.ctx.closePath();
                        }
                    }
                }
            }
        }

        for (let x=0; x<size.x; x++) {
            for (let y=0; y<size.y; y++) {
                cumulative_water_map[x][y] /= p.simulation.steps;
            }
        }

        if (DEBUG) {
            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    let c = new Colour(0, 64, 255, Math.min(255, 1 * cumulative_water_map[x][y]));

                    layers.debug_back.ctx.fillStyle = c.css();
                    layers.debug_back.ctx.fillRect(x, y, 1, 1);
                }
            }

            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    let c = new Colour(0, 128, 255, Math.min(255, 1 * water_map[x][y]));

                    layers.fg1.ctx.fillStyle = c.css();
                    layers.fg1.ctx.fillRect(x, y, 1, 1);
                }
            }

            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    let c = new Colour(
                        Math.max(0, Math.min(255, 32 * (temperature_map[x][y] - p.initial.base_temperature))),
                        64,
                        Math.max(0, Math.min(255, 32 * (p.initial.base_temperature - temperature_map[x][y]))),
                        255
                    );

                    layers.ui1.ctx.fillStyle = c.css();
                    layers.ui1.ctx.fillRect(x, y, 1, 1);
                }
            }

            let maps = [
                [height_map, "height"],
                [temperature_map, "temp"],
                [water_map, "water"],
                [cumulative_water_map, "cumulative water"]
            ]

            maps.forEach(map => {
                map.push(Number.POSITIVE_INFINITY);
                map.push(Number.NEGATIVE_INFINITY);
            })

            for (let x=0; x<size.x; x++) {
                for (let y=0; y<size.y; y++) {
                    let ct = 5 * (height_map[x][y] + 20);
                    let c = new Colour(ct, ct, ct, 255);
                    if (Math.abs(height_map[x][y]) < 0.5) {
                        c = new Colour(128, 255, 128, 255);
                    }

                    maps.forEach(map => {
                        let v = map[0][x][y]
                        map[2] = Math.min(map[2], v);
                        map[3] = Math.max(map[3], v);
                    })

                    layers.ui2.ctx.fillStyle = c.css();
                    layers.ui2.ctx.fillRect(x, y, 1, 1);
                }
            }

            maps.forEach(map => {
                gen_log(` - ${map[1]}`);
                gen_log(`     - Lowest:  ${map[2]}`);
                gen_log(`     - Highest: ${map[3]}`);
            })
        }

        gen_log("[All completed!]");

        return World.map_tiles(
            size, seed, temperature_map, height_map, water_map, cumulative_water_map, true
        );
    }

    static map_tiles(size, seed, temperature_map, height_map, water_map, cumulative_water_map, save_debug) {
        if (save_debug) {
            save_maps_debug(temperature_map, height_map, water_map, cumulative_water_map);
        }

        let world = new World(size);

        let tiles_list = {};

        for (let x=0; x<size.x; x++) {
            for (let y=0; y<size.y; y++) {
                let stats = {
                    temp: temperature_map[x][y],
                    height: height_map[x][y],
                    water: water_map[x][y],
                    cumulative_water: cumulative_water_map[x][y]
                }

                let candidate_tiles = Object.keys(TileType).reduce((prev, cur) => {
                    if (tile_info[cur].spawn_info.spawnable && Object.keys(stats).every(s => tile_info[cur].spawn_info.min[s] <= stats[s] && tile_info[cur].spawn_info.max[s] > stats[s])) {
                        if (tile_info[cur].spawn_info.priority > prev.priority) {
                            return {items: [cur], priority: tile_info[cur].spawn_info.priority};
                        } else if (tile_info[cur].spawn_info.priority == prev.priority) {
                            return {items: [...prev.items, cur], priority: prev.priority};
                        }
                    }

                    return prev;
                }, {items: [TileType.ROCK], priority: Number.NEGATIVE_INFINITY});

                let tile = candidate_tiles.items[Math.floor(seeded_xy_random(seed, x, y) * candidate_tiles.items.length)];

                if (DEBUG) {
                    let c = tile_info[tile].col;
                    layers.debug_front.ctx.fillStyle = c.css();
                    layers.debug_front.ctx.fillRect(x, y, 1, 1);

                    tiles_list[tile] = tiles_list[tile] ? (tiles_list[tile] + 1) : 1;
                }

                world.tilemap[x][y] = tile;
            }
        }

        if (DEBUG) {
            console.log(tiles_list);

            document.addEventListener("keypress", e => {
                switch (e.code) {
                    case "Digit1":
                        layers.debug_front.canvas.style.display = "";
                        layers.debug_back.canvas.style.display = "none";
                        layers.ui1.canvas.style.display = "none";
                        layers.ui2.canvas.style.display = "none";
                        layers.fg1.canvas.style.display = "none";
                        break;

                    case "Digit2":
                        layers.debug_front.canvas.style.display = "none";
                        layers.debug_back.canvas.style.display = "";
                        layers.ui1.canvas.style.display = "none";
                        layers.ui2.canvas.style.display = "none";
                        layers.fg1.canvas.style.display = "none";
                        break;

                    case "Digit3":
                        layers.debug_front.canvas.style.display = "none";
                        layers.debug_back.canvas.style.display = "none";
                        layers.ui1.canvas.style.display = "";
                        layers.ui2.canvas.style.display = "none";
                        layers.fg1.canvas.style.display = "none";
                        break;

                    case "Digit4":
                        layers.debug_front.canvas.style.display = "none";
                        layers.debug_back.canvas.style.display = "none";
                        layers.ui1.canvas.style.display = "none";
                        layers.ui2.canvas.style.display = "";
                        layers.fg1.canvas.style.display = "none";
                        break;

                    case "Digit5":
                        layers.debug_front.canvas.style.display = "none";
                        layers.debug_back.canvas.style.display = "none";
                        layers.ui1.canvas.style.display = "none";
                        layers.ui2.canvas.style.display = "none";
                        layers.fg1.canvas.style.display = "";
                        break;

                    case "Digit6":
                        layers.debug_front.canvas.style.display = "";
                        layers.debug_back.canvas.style.display = "";
                        layers.ui1.canvas.style.display = "";
                        layers.ui2.canvas.style.display = "";
                        layers.fg1.canvas.style.display = "";
                        break;

                    case "KeyQ":
                        layers.debug_front.canvas.style.display = "";
                        break;
        
                    case "KeyW":
                        layers.debug_back.canvas.style.display = "";
                        break;
            
                    case "KeyE":
                        layers.ui1.canvas.style.display = "";
                        break;
                
                    case "KeyR":
                        layers.ui2.canvas.style.display = "";
                        break;  
                
                    case "KeyT":
                        layers.fg1.canvas.style.display = "";
                        break;  
                }
            });
        }

        return world;
    }
}


async function debug_load_maps_then_tile(seed) {
    let result = await load_maps_debug();

    return World.map_tiles(new Vector2(1024, 1024), seed, result.temperature_map, result.height_map, result.water_map, result.cumulative_water_map);
}


function save_maps_debug(temperature_map, height_map, water_map, cumulative_water_map) {
    let req = indexedDB.deleteDatabase("trade_debug_maps");
    req.onsuccess = function () {
        console.log("Deleted database successfully");

        let data = [
            {maptype: "temperature_map", mapdata: temperature_map},
            {maptype: "height_map", mapdata: height_map},
            {maptype: "water_map", mapdata: water_map},
            {maptype: "cumulative_water_map", mapdata: cumulative_water_map}
        ]
        
        const request = indexedDB.open("trade_debug_maps", 1);
        request.onerror = (event) => {
            console.error("user said no");
        };
    
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
    
            const object_store = db.createObjectStore("maps", {keyPath: "maptype"});
    
            object_store.createIndex("maptype", "maptype", {unique: true});
    
            object_store.transaction.oncomplete = (event) => {
                const map_store = db.transaction("maps", "readwrite").objectStore("maps");
                data.forEach(d => {
                    map_store.add(d);
                })
            }
        }
    };

    req.onerror = function () {
        console.log("Couldn't delete database");
    };

    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}


async function load_maps_debug() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("trade_debug_maps", 1);
        request.onerror = (event) => {
            console.error("user said no");
        };
    
        request.onsuccess = (event) => {
            const db = event.target.result;
    
            const map_store = db.transaction("maps", "readonly").objectStore("maps");
            map_store.getAll().onsuccess = (event) => {
                let objs = {};
                event.target.result.forEach(r => {
                    objs[r.maptype] = r.mapdata;
                })

                resolve(objs);
            }
        }
    })
}
