game_id = "evol";

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

const entity_sprites = new Map( /* Object.values(tile_templates).map((v, i) => {
    let ts = [];

    for (let fc=0; fc<v.num_sprites; fc++) {
        let t = new Image(hex_size_x, hex_size_y);
        t.src = `img/hexes/${v.resource_name}_${fc.toString().padStart(3, "0")}.png`
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        t.addEventListener("load", function() {
            num_textures_loaded++;
        })

        ts.push(t);
    }

    return [v.resource_name, ts]
}) */ );

let num_textures_loaded = 0;
let num_textures_needed = 0;

const fps = 144;

let layers = {};
let keys_down = {};

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    })
}

class Viewer {
    constructor(game, layers) {
        this.game = game
        this.layers = layers

        this.zoom_scale = 8;
        this.zoom_offset = new Vector2(0, 0);

        this.refresh_stwp_wtsp();
    }

    set_zoom_scale(to) {
        this.zoom_scale = to
        this.tile_size = this.base_tile_scale * this.zoom_scale;

        this.refresh_stwp_wtsp();
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
            return pos.mul(zoom).add(offset);
        }
    }

    render_world() {
        this.layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
        let ctx = this.layers.fg2.ctx;

        this.game.features.forEach(feature => {
            let cols = [new Colour(64, 0, 0), new Colour(96, 0, 0)];
            let sizs = [3, 2.8]
            let screenpos = this.wtsp(feature.position);

            // border then main
            ctx.fillStyle = cols[1].css(true);
            ctx.beginPath();
            ctx.arc(screenpos.x, screenpos.y, sizs[0] * this.zoom_scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = cols[0].css(true);
            ctx.beginPath();
            ctx.arc(screenpos.x, screenpos.y, sizs[1] * this.zoom_scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        })

        this.game.entities.forEach(ent => {
            let cols = ent.get_colour();
            let sizs = ent.get_size();
            let screenpos = this.wtsp(ent.position);

            // border then main
            ctx.fillStyle = cols[1].css(true);
            ctx.beginPath();
            ctx.arc(screenpos.x, screenpos.y, sizs[0] * this.zoom_scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = cols[0].css(true);
            ctx.beginPath();
            ctx.arc(screenpos.x, screenpos.y, sizs[1] * this.zoom_scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            // statistics display

            // debug stuff
            if (true && ent instanceof GeneralLifeform) {
                ctx.strokeStyle = "darkred";
                ctx.beginPath();
                ctx.arc(screenpos.x, screenpos.y, ent.stats.sight_range * this.zoom_scale, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();

                ctx.strokeStyle = "darkgreen";
                ctx.beginPath();
                ctx.moveTo(screenpos.x, screenpos.y);
                ctx.lineTo(screenpos.x + (ent.stats.speed * this.zoom_scale * 4), screenpos.y - (ent.stats.speed * this.zoom_scale * 4));
                ctx.stroke();
                ctx.closePath();

                if (ent.target instanceof Vector2) {
                    let targetpos = this.wtsp(ent.target);
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc(targetpos.x, targetpos.y, 0.4 * this.zoom_scale, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.closePath();
                } else if (ent.target instanceof Entity || ent.target instanceof Feature) {
                    let targetpos = this.wtsp(ent.target.position);
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.arc(targetpos.x, targetpos.y, ent.target.get_size()[0] + 1, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        })

        // write_rotated_image(this.layers.fg2.canvas, this.layers.fg2.ctx, screen_pos.x, screen_pos.y, img, hex_size_x * this.zoom_scale, hex_size_y * this.zoom_scale, 0);
    }
}

class Game {
    constructor(dimensions, friction, random_seed=null) {
        this.dimensions = dimensions;
        this.friction = friction;
    
        this.entities = new Map();
        this.features = new Map();

        this.new_entities = [];

        this.random = get_seeded_randomiser(random_seed ? random_seed : Math.random().toString());
    }

    pass_time(delta_time) {
        this.entities.forEach(e => e.pass_time(delta_time));
        this.features.forEach(e => e.pass_time(delta_time));

        // cull dead entities and features after (so iterate through the list twice)

        // add newly spawned entities to the list
        this.new_entities.forEach(e => {
            this.entities.set(e.id, e);
        })

        this.new_entities = [];
    }

    spawn_entity(ent) {
        this.new_entities.push(ent);
    }

    find_entities_in_circle(center, radius) {
        let rsqr = radius*radius;
        return [...this.entities.values()].filter(ent => ent.position.sqr_distance(center) <= rsqr);
    }
}

class UniqueObject {
    static id_inc = 0;
    
    constructor() {
        this.id = UniqueObject.id_inc;
        UniqueObject.id_inc++;
    }
}

class Entity extends UniqueObject {
    constructor(game, position) {
        super();

        this.game = game;
        this.position = position;
        this.velocity = Vector2.zero;

        this.exists = true;  // TODO make game cull any of these out of the list (make pass_time return true/false so we dont need to iterate twice)
    }

    get_colour() {
        return [new Colour(192, 192, 192), new Colour(128, 128, 128)]
    }

    get_mass() {
        return 1;
    }

    get_size() {
        return [1, 0.8]
    }

    pass_time(delta_time) {
        this.physics_step(delta_time);
    }

    physics_step(delta_time) {
        // move from velocity, apply friction
        this.position = this.position.add(this.velocity.mul(delta_time));
        this.velocity = this.velocity.mul(Math.pow(this.game.friction, delta_time));

        // f = umg for actual friction but we're in "water" so not this time (drag instead, ish)
    }

    apply_force(force) {
        this.velocity = this.velocity.add(force.div(this.get_mass()));
    }
}

class Feature extends UniqueObject {
    constructor(game, position) {
        super();
        
        this.game = game;
        this.position = position;
    }

    pass_time(delta_time) {

    }
}

class WaterSource extends Feature {
    constructor(game, position) {
        super(game, position);
    }
}

class FoodSource extends Feature {
    constructor(game, position, typ, delay, size_spread, decay_spread, cur_delay=0) {
        super(game, position)

        this.typ = typ;
        this.delay = delay;
        this.size_spread = size_spread;
        this.decay_spread = decay_spread;
        this.cur_delay = cur_delay ? cur_delay : this.delay;
    }

    pass_time(delta_time) {
        this.cur_delay -= delta_time;
        while (this.cur_delay <= 0) {
            this.cur_delay += this.delay;

            // make a new food source item
            let food_ent = new Food(this.game, this.position, this.typ, random_float(...this.size_spread, this.game.random), random_float(...this.decay_spread, this.game.random));
            this.game.spawn_entity(food_ent);
            food_ent.velocity = random_on_circle(food_ent.max_size * this.game.random() + 0.8, this.game.random).mul(25);
        }
    }
}

class Food extends Entity {
    static border_size = 0.2;

    static FoodType = {
        PLANT: "PLANT",
        PLANT_HARD: "PLANT_HARD",
        PLANT_WATER: "PLANT_WATER",
        MEAT: "MEAT",
        MEAT_HARD: "MEAT_HARD",
        MEAT_WATER: "MEAT_WATER",
    }

    static FoodCols = {
        [Food.FoodType.PLANT]: [new Colour(64, 255, 64), new Colour(32, 128, 32)],
        [Food.FoodType.PLANT_HARD]: [new Colour(160, 255, 64), new Colour(80, 128, 32)],
        [Food.FoodType.PLANT_WATER]: [new Colour(64, 255, 128), new Colour(32, 128, 64)],
        [Food.FoodType.MEAT]: [new Colour(255, 32, 64), new Colour(128, 32, 32)],
        [Food.FoodType.MEAT_HARD]: [new Colour(180, 80, 80), new Colour(90, 32, 32)],
        [Food.FoodType.MEAT_WATER]: [new Colour(64, 32, 64), new Colour(32, 32, 32)]
    }

    constructor(game, position, typ, max_size, decay_max, cur_size=0, decay_remaining=0) {
        super(game, position);

        this.typ = typ;
        this.max_size = max_size;
        this.cur_size = cur_size ? cur_size : this.max_size;
        this.decay_max = decay_max;
        this.decay_remaining = decay_remaining ? decay_remaining : this.decay_max;
    }
    
    pass_time(delta_time) {
        this.physics_step(delta_time);

        this.decay_remaining -= delta_time;
        if (this.decay_remaining <= 0) {
            // TODO remove the object
        }
    }

    get_colour() {
        let factor = 1 - ((1 - (this.decay_remaining / this.decay_max)) * 0.65)

        let cols = Food.FoodCols[this.typ];
        let cols_hsv = cols.map(c => rgbToHsv(...c.data));
        cols_hsv.forEach(c => c[2] *= factor);

        return [
            new Colour(...hsvToRgb(...cols_hsv[0]).map(t => Math.floor(t))),
            new Colour(...hsvToRgb(...cols_hsv[1]).map(t => Math.floor(t)))
        ]
    }

    get_mass() {
        return this.cur_size;
    }

    get_size() {
        return [
            this.cur_size,
            Math.max(0, this.cur_size - Food.border_size)
        ]
    }
}

class GeneralLifeform extends Entity {
    static min_gestation_period = 2;
    static max_gestation_period = 30;

    static min_refactory_period = 0.2;
    static max_refactory_period = 20;

    static min_refactory_period_female = 0.2;
    static max_refactory_period_female = 20;

    static old_age_penalty = 0.001;  // multiplier to the resource usage of the entity per second it remains alive (TODO)

    static base_size = 1;
    static base_mass_per_size = 1;

    static border_size = 0.2;
    static hunger_size_variance = 0.08;
    static thirst_desaturation_factor = 0.4;

    static base_max_hunger = 20;
    static base_max_thirst = 10;

    static base_hunger_usage = 1;
    static base_thirst_usage = 1;

    static base_speed = 1;
    static base_sight_range = 8;

    // all are (0, 1) with both 0 and 1 being excluded
    // TODO all of this
    static gene_names = [
        "red", "green", "blue",
        "border_red", "border_green", "border_blue",

        "hunger_satiation_factor",  // how much it cares about hunger
        "thirst_satiation_factor",  // and thirst
        // to inform its overall evaluation of its own satiation level

        "growth_proportion",  // level of satiation needed to grow parts
        "mating_threshold",  // level of satiation needed to consider mating
        "mating_evaluation_variance",
        /* 
        life forms pick mates based on attractiveness. every second when the life form has all stats above mating threshold,
        they will look through every entity in their sight range, sort them by attractiveness (+- some variance) and pick the top one.
        if both life forms pick each other, they mate.

        attractiveness is based on recent "success" rating, which is essentially the average of both hunger and thirst satisfaction level.
        */
        "gestation_period",  // how long a child is kept inside the entity (and given nutrients)
        "refactory_period",  // how long until an entity is able to breed again after mating (male role)
        "refactory_period_female",  // same for female
        "child_nutrients_share_immediate",  // the proportion of hunger/thirst immediately transferred to the child on creation 
        "child_nutrients_share_continuous",  // the proportion of hunger/thirst transferred to the child per second while gestating
    ]

    constructor(game, position, genes, instructions) {
        // "instructions" encode a series of things to grow, to which excess energy will be devoted (exact amount dependent on genes)
        // after reaching maturity (all parts grown), the lifeform will start to reproduce when its stats reach a specific threshold (again, dependent on genes)
        super(game, position);

        this.game = game;

        this.genes = {};
        GeneralLifeform.gene_names.forEach(g => {
            this.genes[g] = genes[g];
            while (!this.genes[g]) {
                this.genes[g] = game.random();
            }
        })

        this.instructions = instructions;

        this.stats = {
            max_hunger: GeneralLifeform.base_max_hunger,
            max_thirst: GeneralLifeform.base_max_thirst,

            hunger: GeneralLifeform.base_max_hunger,
            thirst: GeneralLifeform.base_max_thirst,

            hunger_usage: GeneralLifeform.base_hunger_usage,
            thirst_usage: GeneralLifeform.base_thirst_usage,

            speed: GeneralLifeform.base_speed,
            sight_range: GeneralLifeform.base_sight_range
        }

        this.state = "WANDER";
        this.target = null;
    }

    calculate_stats() {
        // needs to be done every time the entity gains a new part, or something happens to it
    }

    pass_time(delta_time) {
        // lose hunger and thirst, do growth actions, e t c
        this.physics_step(delta_time);

        this.stats.hunger = Math.max(0, this.stats.hunger - (this.stats.hunger_usage * delta_time));
        this.stats.thirst = Math.max(0, this.stats.thirst - (this.stats.thirst_usage * delta_time));

        this.think(delta_time);
    }

    look_for_food() {
        let entities = this.game.find_entities_in_circle(this.position, this.stats.sight_range).filter(e => e instanceof Food);
        // TODO later filter based on parts grown (don't try to path towards inedible food items)

        // pick the closest
        let closest = [null, Number.POSITIVE_INFINITY];
        entities.forEach(e => {
            let sq_dist = e.position.sqr_distance(this.position);
            if (sq_dist < closest[1]) {
                closest = [e, sq_dist];
            }
        })

        if (closest[0]) {
            this.target = closest[0];
            this.state = "GETFOOD";
        }
    }

    think(delta_time) {
        let should_move = false;

        switch (this.state) {
            case "WANDER": {
                if (!this.target || this.target.distance(this.position) <= 1) {
                    this.target = this.position.add(random_on_circle(this.stats.sight_range, this.game.random))
                }

                this.look_for_food();

                should_move = true;
                break;
            }
            
            case "GETFOOD": {
                if (!this.target.exists) {
                    this.target = null;
                    should_move = false;
                    this.state = "WANDER";
                } else {
                    should_move = true;
                }

                this.look_for_food();

                break;
            }
        }

        if (should_move) {
            this.move_to(this.target, delta_time);
        }
    }

    move_to(target, delta_time) {
        if (target instanceof Vector2) {
            this.apply_force(target.sub(this.position).normalize().mul(delta_time * this.stats.speed * 100));
        } else if (target instanceof Entity || target instanceof Feature) {
            this.apply_force(target.position.sub(this.position).normalize().mul(delta_time * this.stats.speed * 100));
        }
    }

    get_size() {
        // size of an entity is based on the number of things it's grown, modified slightly by its current hunger satisfaction (hungrier = smaller)
        let hunger_size_mult = 1 + (((this.stats.hunger / this.stats.max_hunger) - 0.5) * GeneralLifeform.hunger_size_variance * 2);

        let size = GeneralLifeform.base_size * hunger_size_mult;

        return [size, size - GeneralLifeform.border_size];
    }

    get_mass() {
        let mass = this.get_size()[0] * GeneralLifeform.base_mass_per_size;

        // things go here

        return mass;
    }

    get_colour() {
        // colour of an entity is based on its current thirst satisfaction. lower = more desaturated
        let thirst_desaturation_mult = 1 - ((1 - (this.stats.thirst / this.stats.max_thirst)) * GeneralLifeform.thirst_desaturation_factor)

        let col_rgb = [
            this.genes["red"] * 256,
            this.genes["green"] * 256,
            this.genes["blue"] * 256,
        ];

        let col_border_rgb = [
            this.genes["border_red"] * 256,
            this.genes["border_green"] * 256,
            this.genes["border_blue"] * 256,
        ];

        let col_hsv = rgbToHsv(...col_rgb);
        let col_border_hsv = rgbToHsv(...col_border_rgb);

        col_hsv[2] *= thirst_desaturation_mult;
        col_border_hsv[2] *= thirst_desaturation_mult;
        col_border_hsv[2] *= 0.5; // border is darker (usually)

        return [
            new Colour(...hsvToRgb(...col_hsv).map(t => Math.floor(t)), 255),
            new Colour(...hsvToRgb(...col_border_hsv).map(t => Math.floor(t)), 255)
        ]
    }
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

let last_frame = Date.now();

function game_loop() {
    let this_frame = Date.now();
    let delta_time = (this_frame - last_frame) / 1000;
    
    if (true) {
        // game step using deltatime
        let e = game.entities.get(0);
        if (rmb_down) {
            e.apply_force(viewer.stwp(mouse_position).sub(e.position).mul(delta_time * 10));
        }

        game.pass_time(delta_time);

        viewer.render_world();
    }

    last_frame = this_frame;

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    game = new Game(new Vector2(512, 512), 0.004);
    viewer = new Viewer(game, layers);
    game.viewer = viewer;

    let num = 100;
    for (let i=0; i<num; i++) {
        let ent = new GeneralLifeform(game, new Vector2(64, 64), {}, []);
        game.entities.set(ent.id, ent);

        ent.stats.speed += (i/8)/(0.2*num);
        ent.stats.sight_range += (i/4)/(0.2*num);
    }

    let feature = new FoodSource(game, new Vector2(160, 64), Food.FoodType.PLANT, 1.5, [0.3, 0.9], [6, 10])
    game.features.set(feature.id, feature);

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
            lmb_down = true;
        } else if (event.button == 2) {
            rmb_down = true;
        }

        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mouseup", function(event) {
        if (event.button == 0) {
            if (drag_start_pos) {
                drag_start_pos = null;
            }
            lmb_down = false;
        } else if (event.button == 2) {
            rmb_down = false;
        }
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

    // window.addEventListener("resize", handle_resize);

    viewer.render_world();
})


let game = null;
let viewer = null;
