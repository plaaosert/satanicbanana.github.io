game_id = "plorp";

const layer_names = [
    "front",
    "debug_front",
    "debug_back",
    "ui1",
    "ui2",
    "fg1",
    "fg2",
    "fg3",
    "bg1",
    "bg2",
    "bg3"
]

let imgs = {};

const prerender_canvas = document.getElementById("hidden-prerender-canvas");
const prerender_ctx = prerender_canvas.getContext("2d");

let num_textures_loaded = 0;
let num_textures_needed = 0;

const fps = 144;

class Entity {
    static num_sprites = 4;
    static sprite_size_x = 8;
    static sprite_size_y = 8;
    static entity_name = "Unknown";
    static resource_name = "default";
    static offset = new Vector2(0, 0);

    constructor(game, position, animation_speed) {
        this.game = game;

        this.name = this.constructor.entity_name;
        this.resource_name = this.constructor.resource_name;

        this.position = position;
        this.animation_speed = animation_speed;

        this.anim_frame = 0;
        this.anim_frame_real = 0;
        this.framecount = this.constructor.num_sprites;

        this.collision_box_offset = new Vector2(0, 0);
        this.collision_box_size = new Vector2(8, 8);
    }

    animate(delta_time) {
        this.anim_frame_real = (this.anim_frame_real + delta_time) % this.framecount;
        this.anim_frame = Math.floor(this.anim_frame_real);
    }

    step(delta_time) {
        // nothing!
    }
}

// i think i need to redo everything here. it's too confused, too contrived and doesn't make any sense
// there has to be a simpler way. i think it starts with fixing the way i refer to the entity's position
// as right now we're dealing with an offset that sometimes matters and sometimes doesn't
// so normalise the position to the actual dude first, then we can talk about the rest, i think
class Miner extends Entity {
    static num_sprites = 70;
    static sprite_size_x = 40;
    static sprite_size_y = 24;
    static entity_name = "Miner";
    static resource_name = "miner";
    static offset = new Vector2(16, 16);

    static State = {
        MOVING: 1,
        SWINGING: 2,
        COOLDOWN: 3,
        JUMP_WINDUP: 4,
        JUMPING: 5,
        FALLING: 6
    }

    constructor(game, position, animation_speed) {
        super(game, position, animation_speed);

        this.orientation = 0;
        this.single_orient_framecount = this.framecount / 5;

        this.target_xy = null;
        this.state = Miner.State.FALLING;
        this.dealt_swing_damage = false;

        this.cooldown_time = 0.5;
        this.cooldown_cur = 0;

        this.damage = 8;

        // randomise each jump
        this.elevation_change_threshold = 4;

        this.jump_windup_cur = 0;
        this.jump_windup_per_tile = 0.2;
        this.jump_target_xy = null;
        this.y_velocity = 0;
        this.x_air_velocity = 0;

        this.walk_speed = 10;
        this.gravity = 1;
        this.terminal_velocity = 1000000;

        this.animation_speed = animation_speed;
    }

    animate(delta_time) {
        // each block of 14 sprites is a separate orientation
        switch (this.state) {
            case Miner.State.MOVING:
            case Miner.State.COOLDOWN:
            case Miner.State.JUMP_WINDUP:
            case Miner.State.JUMPING:
            case Miner.State.FALLING:
                this.anim_frame_real = 0;
                break;

            case Miner.State.SWINGING:
                this.anim_frame_real = (this.anim_frame_real + (delta_time * this.animation_speed * 15));
                break;
        }

        if (this.anim_frame_real >= (this.orientation == 4 ? 9 : 10) && !this.dealt_swing_damage && this.state == Miner.State.SWINGING) {
            this.game.deal_damage(this.target_xy, this.damage);
            this.dealt_swing_damage = true;
        }

        if (this.anim_frame_real >= this.single_orient_framecount) {
            this.state = this.orientation == 4 ? Miner.State.JUMPING : Miner.State.COOLDOWN;
            this.anim_frame_real = 0;
            this.cooldown_cur = this.cooldown_time;
            this.dealt_swing_damage = false;

            this.target_xy = null;
        }

        this.anim_frame = Math.floor(this.anim_frame_real) + (this.single_orient_framecount * this.orientation);
    }

    step(delta_time) {
        if (this.cooldown_cur > 0) {
            this.cooldown_cur -= delta_time;
            return;
        }

        // if no tile underneath:
        let tile_under_pos = this.position.div(this.game.viewer.base_tile_scale).floor().sub(new Vector2(0, -1));
        let tile_under = this.game.get_tile(tile_under_pos);

        if ((!tile_under && this.y_velocity <= 0) || (this.state == Miner.State.FALLING || this.state == Miner.State.JUMPING)) {
            console.log("set status to falling")
            this.state = Miner.State.FALLING;
            this.position.y += this.y_velocity * delta_time;
            this.position.x += this.x_air_velocity * delta_time;

            let tile_pos = this.position.div(this.game.viewer.base_tile_scale).floor().sub(new Vector2(0, -1));
            let tile_in_pos = this.game.get_tile(tile_pos);

            if (tile_in_pos && this.y_velocity >= 0) {
                if (!this.jump_target_xy || this.jump_target_xy.y == tile_under_pos.y-2) {
                    this.position = new Vector2(this.position.x, Math.floor(this.position.y / 8) * 8);
                    this.y_velocity = 0;
                    this.x_air_velocity = 0;
                    this.state = Miner.State.MOVING;
                    this.jump_target_xy = null;
                }
            } else {
                this.y_velocity = Math.min(this.y_velocity + (this.gravity * delta_time), this.terminal_velocity);
            }
        }

        // if no target, acquire one
        if (!this.target_xy && this.state != Miner.State.SWINGING && this.state != Miner.State.FALLING) {
            // only consider tiles in a 13x13 area around self (6 tiles in each direction)
            // if there's any available ores, go to the closest one
            // otherwise, pick the tallest tile (sorted by closest)
            let tile_pos = Math.floor(this.position.x / this.game.viewer.base_tile_scale);
            let xmin = Math.max(0, tile_pos - 6);
            let xmax = Math.min(this.game.diggable_area_size, tile_pos + 6);

            // currently this assumes that there are no holes in the terrain... we'll see if that holds up
            let positions = Array.from(new Array(xmax-xmin), (x, i) => xmin+i+this.game.diggable_area[0]);

            let positions_value_sorted = positions.sort(
                (a, b) => this.game.get_highest_tile_at(b).tile.tiletype.hardness - this.game.get_highest_tile_at(a).tile.tiletype.hardness
            )

            // sort ores by tallest then closest
            let choices_ores = positions_value_sorted.filter(p => this.game.get_highest_tile_at(p).tile.tiletype.resources.length > 1).sort(
                (a, b) => this.game.get_highest_tile_at(a).xy.y - this.game.get_highest_tile_at(b).xy.y
            ).sort(
                (a, b) => Math.abs(tile_pos - a) - Math.abs(tile_pos - b)
            )

            // sort stones by closest then tallest
            let choices_normal = positions_value_sorted.filter(p => this.game.get_highest_tile_at(p).tile.tiletype.resources.length <= 1).sort(
                (a, b) => Math.abs(tile_pos - a) - Math.abs(tile_pos - b)
            ).sort(
                (a, b) => this.game.get_highest_tile_at(a).xy.y - this.game.get_highest_tile_at(b).xy.y
            )

            let choice_x = null;
            let choice_arr = choices_ores.length > 0 ? choices_ores : choices_normal;
            if (choice_arr.length > 0) {
                if (choice_arr.length > 1 && Math.random() < 0) {
                    choice_x = choice_arr[1];
                } else {
                    choice_x = choice_arr[0];
                }
            }

            /*
            let choice = positions.sort(
                (a, b) => this.game.get_highest_tile_at(b).tile.tiletype.hardness - this.game.get_highest_tile_at(a).tile.tiletype.hardness
            ).sort(
                (a, b) => this.game.get_highest_tile_at(b).xy.y - this.game.get_highest_tile_at(a).xy.y
            ).sort(
                (a, b) => Math.abs(tile_pos - a) - Math.abs(tile_pos - b)
            ).sort(
                (a, b) => {
                    let tile_a = this.game.get_highest_tile_at(a).tile.tiletype.resources.length;
                    let tile_b = this.game.get_highest_tile_at(b).tile.tiletype.resources.length;

                    if (tile_a <= 1 && tile_b <= 1) {
                        return 0;
                    }

                    if (tile_a > 1 && tile_b <= 1) {
                        return -1;
                    }

                    if (tile_a <= 1 && tile_b > 1) {
                        return 1;
                    }

                    return 0;
                }
            )[0]
            */

            let choice_y = this.game.get_highest_tile_at(choice_x).xy.y;

            this.target_xy = new Vector2(choice_x, choice_y);
            this.state = Miner.State.MOVING;

            if (this.tile_pos < this.target_xy.x) {
                this.orientation = 1;
            } else {
                this.orientation = 0;
            }
        }

        // if MOVING, move towards target
        // if there is a change in elevation [elevation_change_threshold] units from the current position, jump
        // jumping has a windup time based on height difference (only for jumping up)
        // jump movement is done by finding out the initial velocity needed to jump assuming gravity of 1px/s2
        if (this.state == Miner.State.MOVING) {
            let tile_pos = this.position.div(this.game.viewer.base_tile_scale).floor();
            let unrounded_tile_pos = this.position.div(this.game.viewer.base_tile_scale);

            if (tile_pos.x > this.target_xy.x) {
                this.orientation = 1;
            } else {
                this.orientation = 0;
            }

            // move towards target_xy
            // if there is a height difference on the next tile over and current subtile position is > elevation_change_threshold,
            // stop moving and start jump windup
            //
            // if the next tile is the target tile and the current subtile position is > elevation_change_threshold,
            // stop and enter swinging animation
            let direction_n = new Vector2(this.orientation == 0 ? 1 : -1, 0)
            let direction = direction_n.mul(delta_time).mul(this.walk_speed);
            this.position = this.position.add(direction);

            let dist = this.position.x % this.game.viewer.base_tile_scale
            let subtile_dist = this.orientation == 0 ? dist : (this.game.viewer.base_tile_scale - dist);

            if (true) {
                // if on the target tile, set subtile position to 0 then play swinging animation with orient 4
                // if the next tile is the target tile and is below (+1), play swinging animation and use orient 2/3. if above, use 0/1.
                // if the target tile is lower (2+), jump down to it first
                // if the next tile has an upwards elevation change, jump up to it
                // if the next tile has a downwards elevation change, jump down to it
                let next_tile = unrounded_tile_pos.add(direction_n);
                let next_tile_jump = next_tile.add(new Vector2(direction_n.x * (this.elevation_change_threshold) / this.game.viewer.base_tile_scale, 0)).floor();
                let next_tile_sides = next_tile.add(new Vector2(direction_n.x * (this.elevation_change_threshold) / this.game.viewer.base_tile_scale, 0)).floor();
                // console.log(`on: ${tile_pos.x} next: ${next_tile.x} jump: ${next_tile_jump}`);
                if (tile_pos.x == this.target_xy.x) {
                    this.state = Miner.State.SWINGING;
                    this.orientation = 4;
                    this.position = this.position.div(this.game.viewer.base_tile_scale).floor().mul(this.game.viewer.base_tile_scale);
                } else if (next_tile_sides.x == this.target_xy.x && this.game.get_highest_tile_at(next_tile_sides.x).xy.y - tile_pos.y == 1) {
                    this.state = Miner.State.SWINGING;
                    this.orientation = direction.x > 0 ? 2 : 3;
                } else if (next_tile_sides.x == this.target_xy.x && this.game.get_highest_tile_at(next_tile_sides.x).xy.y - tile_pos.y < 1) {
                    this.state = Miner.State.SWINGING;
                    this.orientation = direction.x > 0 ? 0 : 1;
                } else if (this.game.get_highest_tile_at(next_tile_jump.x).xy.y <= tile_pos.y) {
                    // up
                    let height = tile_pos.y - this.game.get_highest_tile_at(next_tile_jump.x).xy.y;

                    console.log("entered windup")
                    this.state = Miner.State.JUMP_WINDUP;
                    this.jump_windup_cur = this.jump_windup_per_tile * (height + 1);
                    this.jump_target_xy = this.game.get_highest_tile_at(next_tile_jump.x).xy.add(new Vector2(0, -2));
                } else if (this.game.get_highest_tile_at(next_tile_jump.x).xy.y > (tile_pos.y + 1)) {
                    // down
                    console.log("entered windup")
                    this.state = Miner.State.JUMP_WINDUP;
                    this.jump_windup_cur = this.jump_windup_per_tile * 1;
                    this.jump_target_xy = this.game.get_highest_tile_at(next_tile_jump.x).xy.add(new Vector2(0, -2));
                }
            }
        } else if (this.state == Miner.State.JUMPING) {
            // apply gravity of 1px / s2
            // clamped by terminal_velocity
            // move down, if would intersect tile, end jump, go back to moving
        } else if (this.state == Miner.State.JUMP_WINDUP) {
            // decrement windup counter until ready to jump
            this.jump_windup_cur -= delta_time;
            if (this.jump_windup_cur <= 0) {
                this.state = Miner.State.JUMPING;
                let tile_pos = this.position.div(this.game.viewer.base_tile_scale).floor();

                // target distance is from current position to jump_target_xy
                // v2 = u2 + 2as
                // v = 0
                // u = ?
                // a = gravity
                //
                // u2 = 2as - v2
                // u = sqrt(2as)
                let s = this.game.viewer.base_tile_scale * Math.max(1, tile_pos.y - this.jump_target_xy.y)
                this.y_velocity = -Math.sqrt(2 * this.gravity * s);
                
                // find the x velocity needed; we know how long it'll take to land given our variables
                // s = ut + 1/2at2
                // 1/2at2 + ut - s = 0
                function solve(a, b, c) {
                    var result = ((-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a))
                    var result2 = ((-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a))
                    return [result, result2];
                }

                // in the upward situation, starting velocity is the same sign as the final displacement we want.
                // in the downward situation, it's the opposite. our starting velocity is away from our final position
                let s_actual = this.game.viewer.base_tile_scale * (tile_pos.y - this.jump_target_xy.y);

                let vals = solve(0.5 * this.gravity, this.y_velocity, -s_actual * (tile_pos.y < this.jump_target_xy.y ? -1 : 1));

                console.log(vals);
                let time_needed = Math.max(...vals);

                let dist = this.position.x % this.game.viewer.base_tile_scale;
                let subtile_dist = this.orientation == 0 ? dist : (this.game.viewer.base_tile_scale - dist);

                // round up subtitle_dist since we want to get to the next tile. if subtitle_dist is 0, we only need to add one, not 2
                console.log(subtile_dist)
                let dist_abs = subtile_dist + (this.game.viewer.base_tile_scale * (subtile_dist >= 1 ? 2 : 1));

                this.x_air_velocity = (dist_abs * (this.orientation == 0 ? 1 : -1)) / time_needed;
            }
        }
    }
}

const entity_classes = [
    Entity, Miner
]

const entity_sprites = new Map(entity_classes.map((v, i) => {
    let ts = [];

    for (let fc=0; fc<v.num_sprites; fc++) {
        let t = new Image(v.sprite_size_x, v.sprite_size_y);
        t.src = `img/entities/${v.resource_name}/${fc.toString().padStart(3, "0")}.png`
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        t.addEventListener("load", function() {
            num_textures_loaded++;
        })

        ts.push(t);
    }

    return [v.resource_name, ts]
}));

let layers = {};
let keys_down = {};

let drag_start_pos = null;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);

function seeded_xy_random(seed, x, y) {
    return seeded_random(seed + "-" + x + "-" + y);
}

const tile_damage_fx_sprites = [
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    
    [
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    
    [
        [0, 0, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 1],
    ],
    
    [
        [1, 0, 1, 0, 1, 0, 0, 1],
        [0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 1],
    ]
]

const Resource = {
    STONE: "STONE",
    COPPER: "COPPER",
    IRON: "IRON",
    GOLD: "GOLD",
    COBALT: "COBALT",
    PLATINUM: "PLATINUM",
    URANIUM: "URANIUM",
    THORIUM: "THORIUM",
    ADAMANTINE: "ADAMANTINE",
}

class TileType {
    constructor(name, description, colour, hardness, stone_richness, other_resource, other_resource_richness) {
        this.name = name;
        this.description = description;
        this.colour = colour;
        this.hardness = hardness;  // health

        this.resources = [
            [Resource.STONE, stone_richness]
        ];

        if (other_resource && other_resource_richness) {
            this.resources.push([other_resource, other_resource_richness])
        }
    }
}

const VeinGenerator = {
    RandomDots: function(seed, local_origin, start_y, chunks, tiletype, scale, richness) {
        // origin is x,y
        // chunks is a list of lists, should be centered on the chunk being generated with one chunk below and above (total 34x96 - one on left and right)
        // scale is the factor to scale the vein by

        // RandomDots will place at random positions up to 8 tiles away with chance ((8-distance)/8)
        let dist = 8 * scale;
        let x_start = Math.max(0, local_origin.x - dist);
        let x_end = Math.min(chunks.length, local_origin.x + dist);

        // ASSUME ORIGIN IS CENTERED AROUND THE FULL CHUNKS SET
        let y_start = Math.max(0, local_origin.y - dist);
        let y_end = Math.min(chunks[0].length, local_origin.y + dist);

        for (let x=x_start; x<x_end; x++) {
            for (let y=y_start; y<y_end; y++) {
                let distance = Math.abs(x - local_origin.x) + Math.abs(y - local_origin.y);
                let chance = ((dist - distance) / dist) * richness;

                if (seeded_xy_random(seed, x, y+start_y) < chance) {
                    chunks[x][y] = new Tile(tiletype);
                }
            }
        }
    }

}

class VeinType {
    constructor(min_depth, max_depth, generator, frequency, scale, richness, material) {
        this.min_depth = min_depth;
        this.max_depth = max_depth;
        this.generator = generator;
        this.frequency = frequency;
        this.scale = scale;
        this.richness = richness;
        this.material = material;
    }
}

let tile_types = new Map(Object.entries({
    "rock": new TileType("Rock", "Rock.", Colour.white, 8, 8, null, 0),
    "chalcopyrite_low": new TileType("Chalcopyrite (Impure)", "A low-yield ore of copper.", Colour.from_hex("#733720"), 16, 6, Resource.COPPER, 2)
}));

let veins = [
    new VeinType(0, 256, VeinGenerator.RandomDots, 0.001, 1, 1, tile_types.get("chalcopyrite_low"))
].sort((a, b) => a.frequency - b.frequency)

class Tile {
    constructor(tiletype) {
        this.tiletype = tiletype;
        this.damage = 0;
        this.destroyed = false;
    }

    take_damage(amount) {
        this.damage += amount;
        this.damage = Math.max(0, Math.min(this.tiletype.hardness, this.damage));
        if (this.damage >= this.tiletype.hardness) {
            this.destroyed = true;
        }

        return amount;
    }
}

class TileColumn {
    constructor(start_depth, sequence) {
        this.start_depth = start_depth;
        this.sequence = sequence;
    }
}

class Game {
    constructor(xsiz, diggable_area, seed) {
        this.xsiz = xsiz;
        this.diggable_area = diggable_area
        this.diggable_area_size = diggable_area[1] - diggable_area[0];
        this.tiles = new Array(xsiz).fill(0).map((_, x) => new TileColumn(0, x < diggable_area[0] || x >= diggable_area[1] ? [new Tile(tile_types.get("rock"))] : []));
        this.seed = seed ? seed : Math.random().toString();

        this.entities = [];

        this.viewer = null;

        this.generate_chunk(0);

        /*
        for (let x=this.diggable_area[0]; x<this.diggable_area[1]; x++) {
            this.tiles[x].start_depth = Math.floor(Math.random() * 5) + Math.floor(Math.random() * 5)
            this.tiles[x].sequence = [];
            while (Math.random() < 0.5 || this.tiles[x].sequence.length <= 0 || !this.tiles[x].sequence[this.tiles[x].sequence.length-1]) {
                this.tiles[x].sequence.push(Math.random() < 0.3 ? null : new Tile(tile_types.get(Math.random() < 0.2 ? "chalcopyrite_low" : "rock")));
            }
        }
        */
    }

    entities_step(delta_time) {
        this.entities.forEach(ent => {
            ent.step(delta_time);
            ent.animate(delta_time);
        })
        
        this.viewer.draw_entities(this.entities);
    }

    generate_chunk(chunk_y) {
        let start_y = chunk_y * 32;

        let chunks = [];
        let chosen_veins = [];

        for (let i=0; i<34; i++) {
            // TODO later this will actually care about height (harder rocks lower down)
            chunks.push(new Array(96).fill(0).map(_ => new Tile(tile_types.get("rock"))));

            for (let y=0; y<96; y++) {
                let yt = start_y + y;
                let valid_veins = veins.filter(v => yt >= v.min_depth && yt < v.max_depth);
                let vein_id = 0;
                while (vein_id < valid_veins.length) {
                    if (seeded_xy_random(this.seed, i, y+start_y) < valid_veins[vein_id].frequency) {
                        chosen_veins.push([valid_veins[vein_id], new Vector2(i, y)]);
                        break;
                    }

                    vein_id++;
                }
            }
        }

        chosen_veins.forEach(v => {
            // seed, local_origin, start_y, chunks, tiletype, scale, richness
            v[0].generator(this.seed, v[1], start_y, chunks, v[0].material, v[0].scale, v[0].richness)
        })

        let generated_chunk = chunks.map(c => c.slice(32, 64));
        
        for (let x=0; x<generated_chunk.length; x++) {
            this.tiles[x + this.diggable_area[0]-1].sequence.push(...generated_chunk[x]);
        }
    }

    get_highest_tile_at(x) {
        return {
            tile: this.tiles[x].sequence[0],
            xy: new Vector2(x, this.tiles[x].start_depth)
        }
    }

    get_tile(xy) {
        // if y < 0, it's in the sky, so it's always empty
        if (xy.y < 0) {
            return 0;
        }

        // out of bounds tiles are also empty
        if (xy.x < 0 || xy.x >= this.xsiz) {
            return 0;
        }

        // pick the right column, then scale the array index of the column sequence by the y index
        let col = this.tiles[xy.x];

        // e.g. if start depth is 5 and y is 6, 6-5 = 1 (second item in sequence)
        let y_index = xy.y - col.start_depth;

        // if unknown (not in sequence, therefore too deep or too shallow), return value is 0 if too shallow and 1 if too deep
        if (y_index < 0) {
            return 0;
        } else if (y_index >= col.sequence.length) {
            return 1;
        } else {
            return col.sequence[y_index]
        }
    }

    destroy_tile(xy) {
        // replace the relevant offset with null. then, prune off nulls from the start (increasing start_depth each time) until the first element is non-null
        // if the sequence becomes length 2 or lower, generate a new chunk
        let y_offset = xy.y - this.tiles[xy.x].start_depth;

        let col = this.tiles[xy.x];
        col.sequence[y_offset] = null;

        while (!col.sequence[0]) {
            col.sequence.shift();
            col.start_depth++;

            if (col.sequence.length <= 2) {
                this.generate_chunk(Math.ceil(col.start_depth / 32));
            }
        }
    }

    deal_damage(to_xy, amount) {
        let tile = this.get_tile(to_xy);

        let before_resources = tile.tiletype.resources.map(r => [r[0], Math.floor(r[1] * 0.25 * (tile.damage / tile.tiletype.hardness))]);

        let dmg = tile.take_damage(amount);

        let after_resources = tile.tiletype.resources.map(r => [r[0], Math.floor(r[1] * 0.25 * (tile.damage / tile.tiletype.hardness))]);

        let result_resources = after_resources.map((r, i) => [
            r[0], r[1] - before_resources[i][1] + (
                tile.destroyed ? Math.ceil(tile.tiletype.resources[i][1] * 0.75) : 0
            )
        ]);

        if (tile.destroyed) {
            this.destroy_tile(to_xy);
        }

        this.viewer.draw_damage_fx(to_xy, dmg < 0);

        // spawn those resources
        console.log(result_resources)
    }
}

class Viewer {
    constructor(game, layers) {
        this.game = game
        this.layers = layers

        this.base_tile_scale = 8
        this.zoom_scale = 2
        this.tile_size = this.base_tile_scale * this.zoom_scale;
        this.zoom_offset = new Vector2(128, 128);

        this.refresh_stwp_wtsp();
    }

    set_zoom_scale(to) {
        this.zoom_scale = to
        this.tile_size = this.base_tile_scale * this.zoom_scale;

        this.refresh_stwp_wtsp();

        this.clear_all_fx();

        // need to find all tiles in range and call draw_damage_fx on them. same concept as when we come to culling tiles and entities that are out of the canvas
    }

    refresh_stwp_wtsp() {
        this.screen_to_world_pos = this.screen_to_world_pos_fn();
        this.stwp = this.screen_to_world_pos;

        this.world_to_screen_pos = this.world_to_screen_pos_fn();
        this.wtsp = this.world_to_screen_pos;
    }

    screen_to_world_pos_fn() {
        let zoom = this.zoom_scale;
        let offset = this.zoom_offset.copy();

        return function(pos) {
            return pos.sub(offset).div(zoom);
        }
    }
    
    world_to_screen_pos_fn() {
        let zoom = this.zoom_scale
        let offset = this.zoom_offset.copy();

        return function(pos) {
            return pos.round().mul(zoom).add(offset);
        }
    }

    tile_to_screen_pos(xy) {
        return this.wtsp(xy.mul(this.base_tile_scale));
    }

    ttsp(xy) {
        return this.tile_to_screen_pos(xy);
    }

    screen_to_tile_pos(xy) {
        return this.stwp(xy).div(this.base_tile_scale);
    }

    sttp(xy) {
        return this.screen_to_tile_pos(xy);
    }

    draw_entities(entities) {
        layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);

        entities.forEach(ent => {
            this.draw_entity(ent);
        })
    }

    draw_entity(entity) {
        // Entities have a specific position (origin; top left).
        let screen_pos = this.wtsp(entity.position.sub(entity.constructor.offset));

        let img = entity_sprites.get(entity.constructor.resource_name)[entity.anim_frame];
        write_rotated_image(this.layers.fg3.canvas, this.layers.fg3.ctx, screen_pos.x, screen_pos.y, img, img.width * this.zoom_scale, img.height * this.zoom_scale, 0);
    }

    clear_all_fx() {
        this.layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    }

    draw_damage_fx(xy, clear_last) {
        // don't need to clear last fx unless the tile changed or it restored hp
        let tile = this.game.get_tile(xy);

        if (!tile || !tile.tiletype) {
            this.clear_damage_fx(xy);
            return;
        }

        if (clear_last) {
            this.clear_damage_fx(xy);
        }

        let damage_fx = tile_damage_fx_sprites;
        let damage_level = Math.ceil(damage_fx.length * (tile.damage / tile.tiletype.hardness));

        // undamaged so no fx
        if (damage_level == 0) {
            return;
        }

        damage_level--;

        let spr = damage_fx[damage_level];
        let start_offset = this.ttsp(xy);

        this.layers.fg1.ctx.fillStyle = tile.tiletype.colour.css();

        let rotation = Math.floor(seeded_xy_random(this.game.seed, xy.x, xy.y) * 4);
        let rotation_fn = (x, y) => [x, y];
        switch (rotation) {
            case 1:
                rotation_fn = (x, y) => [-y, x];
                break;

            case 2:
                rotation_fn = (x, y) => [-x, -y];
                break;
    
            case 3:
                rotation_fn = (x, y) => [y, -x];
                break;            
        }

        let xsiz = spr[0].length-1;
        let ysiz = spr.length-1;

        for (let x=0; x<spr[0].length; x++) {
            for (let y=0; y<spr.length; y++) {
                let vec = rotation_fn(x-(xsiz/2), y-(ysiz/2));

                let pix = spr[vec[1]+(ysiz/2)][vec[0]+(xsiz/2)];
                if (pix) {
                    let pos = new Vector2(x, y).mul(this.zoom_scale).add(start_offset);
                    this.layers.fg1.ctx.fillRect(pos.x, pos.y, this.zoom_scale, this.zoom_scale);
                }
            }
        }
    }

    clear_damage_fx(xy) {
        let start_offset = this.ttsp(xy);

        this.layers.fg1.ctx.clearRect(start_offset.x, start_offset.y, this.tile_size, this.tile_size);
    }

    draw_tiles() {

    }

    draw_tile(xy) {
        // game will return OOB positions in x or y based on surface level (see concept.ase)
        // sides (6x1/1x6) are drawn if the corresponding area is empty
        // corners (1x1) are drawn if either of the corresponding areas are full
        let t = this.game.get_tile(xy)
        if (!t || t==1) {
            return;
        }

        let start_offset = this.ttsp(xy);

        // red is normal right now with this naive worldgen method
        // once we do it properly, we'll need to also take into account generating tiles on the sides of newly revealed tiles
        this.layers.fg2.ctx.fillStyle = t.tiletype.colour.css();

        let t_end_us = (this.base_tile_scale - 1);
        let t_len = (this.base_tile_scale - 2) * this.zoom_scale

        // sides first
        let sides = [
            [start_offset.add(new Vector2(1, 0).mul(this.zoom_scale)), t_len, this.zoom_scale, new Vector2(0, -1)],
            [start_offset.add(new Vector2(0, 1).mul(this.zoom_scale)), this.zoom_scale, t_len, new Vector2(-1, 0)],
            [start_offset.add(new Vector2(1, t_end_us).mul(this.zoom_scale)), t_len, this.zoom_scale, new Vector2(0, 1)],
            [start_offset.add(new Vector2(t_end_us, 1).mul(this.zoom_scale)), this.zoom_scale, t_len, new Vector2(1, 0)],
        ]

        sides.forEach((l, i) => {
            if (!this.game.get_tile(xy.add(l[3]))) {
                this.layers.fg2.ctx.fillRect(l[0].x, l[0].y, l[1], l[2]);
            }
        })

        // then corners
        let corners = [
            [start_offset.add(new Vector2(0, 0).mul(this.zoom_scale)), new Vector2(0, -1), new Vector2(-1, 0)],
            [start_offset.add(new Vector2(0, t_end_us).mul(this.zoom_scale)), new Vector2(0, 1), new Vector2(-1, 0)],
            [start_offset.add(new Vector2(t_end_us, 0).mul(this.zoom_scale)), new Vector2(0, -1), new Vector2(1, 0)],
            [start_offset.add(new Vector2(t_end_us, t_end_us).mul(this.zoom_scale)), new Vector2(0, 1), new Vector2(1, 0)],
        ]

        corners.forEach((l, i) => {
            let c1 = this.game.get_tile(xy.add(l[1])) ? true : false;
            let c2 = this.game.get_tile(xy.add(l[2])) ? true : false;
            if (c1 ^ c2) {
                this.layers.fg2.ctx.fillRect(l[0].x, l[0].y, this.zoom_scale, this.zoom_scale);
            }
        })
    }
}

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    })
}

function handle_resize(event) {
    canvas_height = Math.round(vh(100, true));
    canvas_width = Math.round(vw(100));

    const DPR = window.devicePixelRatio ?? 1;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        // might work, might not
        ctx.canvas.width = canvas_width * DPR;
        ctx.canvas.height = canvas_height * DPR;
        ctx.scale(DPR, DPR);

        ctx.imageSmoothingEnabled = false;
        ctx.moz
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = "0px";
        canvas.style.top = "0px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    //refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_diagnostics() {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16, "#fff", "MS Gothic", 9
    )

    let frame_time_splits = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100).toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28, "#fff", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw", 10, 28+12, "#0f0", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc", 10, 28+12+12, "#f00", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait", 10, 28+12+12+12, "#666", "MS Gothic", 9
    )
}

let last_frame = 0;

function game_loop() {
    let this_frame = Date.now();
    let delta_time = (this_frame - last_frame) / 1000;
    
    if (last_frame) {
        game.entities_step(delta_time);

        test();
    }

    last_frame = this_frame;

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    game = new Game(48, [4, 36]);
    viewer = new Viewer(game, layers);
    game.viewer = viewer;

    game.entities.push(new Miner(game, new Vector2(8, -8), 1));

    for (let i=0; i<12; i++) {
        game.tiles[i].start_depth = 10;
    }

    game.tiles[4].start_depth -= 6;

    game.tiles[6].start_depth += 1;
    game.tiles[7].start_depth += 5;
    game.tiles[7].sequence[0] = new Tile(tile_types.get("chalcopyrite_low"));
    game.tiles[8].sequence[0] = new Tile(tile_types.get("chalcopyrite_low"));

    /*
    let brushes = [];

    layer_names.forEach((k,i) => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        ctx.imageSmoothingEnabled = false;

        let wh = 24 - ((i*2)+1);

        let brush = layers.bg3.ctx.createImageData(wh, wh);
        write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(wh, wh), new Colour(i*25, 255, 255, 25))
        brushes.push(brush);
    })
    */

    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    layers.front.canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
        //if (mouse_select_pos.x == 0 && mouse_select_pos.y == 0) {
            //mouse_select_pos = mouse_position.copy();
        //}
    });

    layers.front.canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            drag_start_pos = mouse_position.copy();
        }

        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mouseup", function(event) {
        /*
        if (event.button == 0) {
            if (drag_start_pos) {
                combat_control.process_dragclick(drag_start_pos, mouse_position, keys_down);

                drag_start_pos = null;
                return;
            }

            combat_control.process_mouseclick(mouse_position.copy(), keys_down);
        } else {
            combat_control.process_rightclick(mouse_position.copy(), keys_down)
        }
        */

        event.preventDefault();
    });

    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        switch (code) {
            case "Digit1":
            case "Digit2":
            case "Digit3":
            case "Digit4":
            case "Digit5":
            case "Digit6":
            case "Digit7":
            case "Digit8":
            case "Digit9":
            case "Digit0":
                let v = Number.parseInt(code.charAt(5));
                if (v == 0) {
                    v = game.diggable_area[1] - 1;
                } else if (v >= 6) {
                    v = game.diggable_area[1] - 1 - (10 - v);
                } else {
                    v = v + game.diggable_area[0] - 1;
                }

                game.deal_damage(new Vector2(v, game.tiles[v].start_depth + (event.shiftKey ? 1 : (event.ctrlKey ? 2 : 0))), 1);
                break;

            case "Minus":
                viewer.set_zoom_scale(viewer.zoom_scale / 2);
                break;

            case "Equal":
                viewer.set_zoom_scale(viewer.zoom_scale * 2);
                break;
        }

        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;

        switch (code) {

        }
    });

    handle_resize();

    imgs.pixel = layers.fg2.ctx.createImageData(1, 1);
    write_rect_to_imagedata(imgs.pixel, new Vector2(0, 0), new Vector2(1, 1), new Colour(0, 255, 0, 128))

    imgs.brush = layers.fg2.ctx.createImageData(8, 8);
    write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(8, 8), new Colour(0, 255, 0, 255))

    imgs.line = layers.fg2.ctx.createImageData(5, 1);
    write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(5, 1), new Colour(255, 255, 255, 255));

    let interval = setInterval(function() {
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            game_loop();
        }
    }, 200)

    window.addEventListener("resize", handle_resize);
})


function test() {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    for (let x=1; x<game.xsiz-1; x++) {
        for (let y=-3; y<128; y++) {
            viewer.draw_tile(new Vector2(x, y));
        }
    }
}


let game = null;
let viewer = null;
