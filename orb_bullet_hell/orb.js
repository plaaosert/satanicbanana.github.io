game_id = "orb";

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

const sprites_manifest = [
    {name: "ally"},
    {name: "enemy"},
    {name: "enemy_bullet"},
    {name: "orb_back_tile"},
    {name: "orb_empty"},
    {name: "orb_juice_red", num_sprites: 12},
    {name: "orb_juice_blue", num_sprites: 12},
    {name: "orb_juice_magenta", num_sprites: 12},
    {name: "ui_tile"},
]

let num_textures_loaded = 0;
let num_textures_needed = 0;

const entity_sprites = new Map(sprites_manifest.map((v, i) => {
    let ts = [];

    for (let fc=0; fc<(v.num_sprites ? v.num_sprites : 1); fc++) {
        // will need to load sprites better from a manifest later
        let t = new Image();
        t.src = `img/${v.name}_${fc.toString().padStart(3, "0")}.png`
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        t.addEventListener("load", function() {
            num_textures_loaded++;
        })

        ts.push(t);
    }

    return [v.name, ts]
}));

const fps = 144;

let layers = {};
let keys_down = {};
let keys_down_this_frame = {};

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let game_resolution = new Vector2(480, 640);

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

function handle_resize(event) {
    let sf_y = Math.floor(vh(100) / game_resolution.y);
    let sf_x = Math.floor(vw(100) / game_resolution.x)
    let sf = Math.min(sf_x, sf_y);

    canvas_height = sf * game_resolution.y;
    canvas_width = sf * game_resolution.x;

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

        canvas.style.left = "256px";
        canvas.style.top = "84px";
    
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

class PlayerStats {
    constructor(
        energy_cur, energy_max, pure_essences, pure_essences_max,
        spell_cost_mult,
        current_invoke_order
    ) {
        this.energy_cur = energy_cur;
        this.energy_max = energy_max;

        this.pure_essences = pure_essences;
        this.pure_essences_max = pure_essences_max;

        this.spell_cost_mult = spell_cost_mult;

        this.current_invoke_order = current_invoke_order;
    }
}

class Game {
    constructor(dimensions, player_stats) {
        this.objects = [];
        this.registered_colliders = [new Map(), new Map(), new Map()];

        this.player_ent = null;

        this.player_stats = player_stats;

        this.dimensions = dimensions;
    }

    step(delta_time) {
        this.objects.forEach(o => o.step(delta_time));

        this.objects = this.objects.filter(o => {
            if (o.removing) {
                // remove from registered colliders
                this.registered_colliders[o.team].delete(o.id);
                return false;
            } else {
                return true;
            }
        });
    }

    add_object(obj, register_collision=false) {
        this.objects.push(obj);
        if (register_collision) {
            // this is for RECEIVING collisions, not sending them (so, really, only put entities in here!)
            this.registered_colliders[obj.team].set(obj.id, obj);
        }
    }

    check_for_collisions(position, radius, team_mask=null) {
        let sq_rad = radius*radius;
        // only look @ the collision map for any teams that aren't our own
        let check_objs = this.registered_colliders.flatMap((v, i) => {
            if (!team_mask || i!=team_mask) {
                return [...v.values()];
            }

            return [];
        });

        return check_objs.filter(obj => {
            // if something collides, the distance between the two objects must be <= the sum of their radii
            let dist = position.sqr_distance(obj.position);
            return dist <= sq_rad + (obj.size * obj.size);
        })
    }

    check_in_bounds(object) {
        // an object is in bounds if its position is within the playfield, with an additional buffer zone of its size + 16px
        let s_mod = 16 + object.size;
        let bbox = [-s_mod, -s_mod, this.dimensions.x + s_mod, this.dimensions.y + s_mod];
        let pos = object.position;

        // im a big boy so i am ordering the checks so it short circuits quicker for the more common cases
        let out_of_bounds = (
            pos.y > bbox[3] ||
            pos.x < bbox[0] ||
            pos.x > bbox[2] ||
            pos.y < bbox[1]
        );

        return !out_of_bounds;
    }

    deal_dmg(source, amount, target) {
        if (target.take_dmg(source, amount)) {
            // return true if this kills the target
            target.removing = true;
            return true;
        } else {
            return false;
        }
    }
}


class GameObject {
    static id_inc = 0;

    constructor(game, position, size) {
        this.get_new_id();

        this.game = game;

        this.position = position;
        this.size = size;  // size is radius! at least for the moment, we're treating everything like a circle.

        this.removing = false;
    }

    step(delta_time) {
        // nothing!
    }

    check_for_collisions(mask_team=true) {
        return this.game.check_for_collisions(this.position, this.size, mask_team ? this.team : null);
    }

    get_new_id() {
        this.id = Entity.id_inc;
        Entity.id_inc++;
    }

    copy() {
        new_obj = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        new_obj.get_new_id();

        return new_obj;
    }
}

class Bullet extends GameObject {
    constructor(game, position, velocity, source, size, name, sprite, team, dmg, piercing=false) {
        super(game, position, size);
        
        this.source = source;
        this.name = name;
        this.sprite = sprite;
        this.team = team;
        this.dmg = dmg;
        this.velocity = velocity;
        this.piercing = piercing;
    }

    step(delta_time) {
        this.position = this.position.add(this.velocity.mul(delta_time));

        // check for collisions
        let colls = this.check_for_collisions(true);
        if (colls.length > 0) {
            // if piercing, pick every collision, else pick only the closest one
            // only destroy after if the bullet is not piercing
            let targets = [];
            if (this.piercing) {
                targets = colls;
            } else {
                targets = [colls.sort((a, b) => this.position.sqr_distance(a.position) - this.position.sqr_distance(b.position))[0]];

                this.removing = true;
            }

            targets.forEach(t => {
                // deal dmg to all relevant targets
                this.game.deal_dmg(this, this.dmg, t);
            });
        }

        // finally destroy if oob
        this.check_if_oob();
    }

    check_if_oob() {
        if (!this.game.check_in_bounds(this)) {
            this.removing = true;
            return true;
        }

        return false;
    }
}

class Entity extends GameObject {
    constructor(game, position, size, name, sprite, team, hp, max_hp) {
        super(game, position, size);
        
        this.name = name;
        this.sprite = sprite;
        this.team = team;

        this.hp = hp;
        this.max_hp = max_hp;

        this.last_hit = null;
    }

    step(delta_time) {
        // nothing!
    }

    take_dmg(source, amt) {
        this.hp -= amt;
        this.last_hit = source;
        if (this.hp <= 0) {
            return true;
        }
    }

    heal(amt) {
        this.hp = Math.min(this.max_hp, this.hp + amt);
    }
}

class PlayerEnt extends Entity {
    constructor(game, position, size, name, sprite, hp, max_hp) {
        super(game, position, size, name, sprite, 0, hp, max_hp);

        this.move_dir = new Vector2(0, 0);
        this.stats = {
            speed: 1
        }
    }

    step(delta_time) {
        this.position = this.position.add(this.move_dir.mul(this.stats.speed).mul(delta_time))
    }
}

const ShootTargetingType = {
    DIRECT: "DIRECT",
    STATIC_DIR: "STATIC_DIR"
}

class GenericEnemyEnt extends Entity {
    constructor(game, position, size, name, sprite, hp, max_hp, shooting_pattern, path) {
        super(game, position, size, name, sprite, 1, hp, max_hp);

        this.shooting_pattern = shooting_pattern;
        this.path = path;
        
        this.shooting_delays = shooting_pattern.map((t, i) => -this.shooting_pattern[i].initial);
        this.path_index = 0;
        this.path_cur_index_timer = 0;
    }

    step(delta_time) {
        this.shooting_delays.forEach((v, i) => {
            this.shooting_delays[i] += delta_time;
            let new_t = this.shooting_delays[i];

            let pattern = this.shooting_pattern[i];
            while (new_t >= pattern.delay) {
                this.shooting_delays[i] -= pattern.delay;
                new_t = this.shooting_delays[i];

                let shoot_pos = this.position.add(pattern.offset);
                let shoot_angle = 0;

                switch (pattern.target_type) {
                    case ShootTargetingType.DIRECT:
                        shoot_angle = this.game.player_ent.position.sub(this.position).angle();
                        break;

                    case ShootTargetingType.STATIC_DIR:
                        shoot_angle = pattern.angle;
                        break;
                }

                let random_mod = (Math.random() * pattern.inaccuracy) - (pattern.inaccuracy / 2);

                shoot_angle += random_mod;

                let shoot_vel = new Vector2(1, 0).rotate(shoot_angle).mul(pattern.speed);

                let bullet = new pattern.bullet_proto(
                    this.game, shoot_pos, shoot_vel, this,
                    pattern.params.size,
                    pattern.params.name,
                    pattern.params.sprite,
                    pattern.params.team,
                    pattern.params.dmg
                );

                this.game.add_object(bullet);
            }
        })

        if (this.path && this.path_index < this.path.points.length) {
            this.path_cur_index_timer += delta_time;
            this.path_cur_index_timer = Math.min(this.path_cur_index_timer, this.path.points[this.path_index].duration);

            // snap to position along path
            // TODO stuff like bezier as well as just linear direction
            let start_pos = this.path.start_pos;
            if (this.path_index > 0) {
                start_pos = this.path.points[this.path_index-1].end_pos;
            }

            let end_pos = this.path.points[this.path_index].end_pos;

            let pos = start_pos.lerp(end_pos, this.path_cur_index_timer / this.path.points[this.path_index].duration);

            this.position = pos;

            while (this.path_cur_index_timer >= this.path.points[this.path_index].duration) {
                // move to next
                this.path_cur_index_timer -= this.path.points[this.path_index].duration;
                this.path_index++;

                if (this.path_index >= this.path.points.length && !this.path.remain_at_end) {
                    this.removing = true;  // delete if reached end of path
                    break;
                }
            }
        }
    }
}

let example_path = {
    start_pos: new Vector2(
        Math.floor(game_resolution.x / 2) - 8,
        -64
    ),
    remain_at_end: false,
    points: [
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            64
        ), duration: 8},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 4) - 8,
            64
        ), duration: 8},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / (4/3)) - 8,
            64
        ), duration: 4},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            64
        ), duration: 1.2},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            128
        ), duration: 12},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            -128
        ), duration: 1.6},
    ]
}

let example_pattern = {
    delay: 0.6,
    initial: 2,
    offset: new Vector2(0, 0),
    target_type: ShootTargetingType.STATIC_DIR,
    angle: 90 * (Math.PI / 180),  // for STATIC_DIR
    inaccuracy: 0 * (Math.PI / 180),
    speed: 100,
    bullet_proto: Bullet,
    params: {
        size: 3,
        name: "Test bullet",
        sprite: "enemy_bullet",
        team: 1,
        dmg: 1
    },
    extra_params: []  // for custom bullet prototypes
}


let example_pattern2 = new Array(16).fill(0).map((_, i) => {
    return {
        delay: 4.5,
        initial: 0.01 * i,
        offset: new Vector2(0, 0),
        target_type: ShootTargetingType.DIRECT,
        angle: null,  // for STATIC_DIR
        inaccuracy: 10 * (Math.PI / 180),
        speed: 20 + (Math.random() * 100),
        bullet_proto: Bullet,
        params: {
            size: 3,
            name: "Test bullet",
            sprite: "enemy_bullet",
            team: 1,
            dmg: 1
        },
        extra_params: []  // for custom bullet prototypes
    }
})


let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];


function render_diagnostics(game) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.debug_back.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16, "#fff", "MS Gothic", 12
    )

    let frame_time_splits = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100).toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28, "#fff", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw", 10, 28+12, "#0f0", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc", 10, 28+12+12, "#f00", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait", 10, 28+12+12+12, "#666", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, `gameobject count: ${game.objects.length}`, 10, 28+12+12+12+16, "cyan", "MS Gothic", 12
    );

    write_text(
        layers.debug_front.ctx, `entities: ${game.objects.filter(o => o instanceof Entity).length}`, 10, 28+12+12+12+16+12, "lime", "MS Gothic", 12
    );
    
    write_text(
        layers.debug_front.ctx, `bullets: ${game.objects.filter(o => o instanceof Bullet).length}`, 10, 28+12+12+12+16+12+12, "coral", "MS Gothic", 12
    );

    game.objects.forEach(obj => {
        if (obj.team == 0) {
            draw_circle(
                layers.debug_back.ctx, obj.position.x, obj.position.y, obj.size, "white", 0, Math.PI*2, "red"
            )
        } else {
            draw_circle(
                layers.debug_back.ctx, obj.position.x, obj.position.y, obj.size, "coral"
            )
        }
    })
}


let r_info = {
    energy_amounts_display: [0, 0, 0],
    energy_amounts_lerp_speed: 0.08,

    energy_sphere_frames: [0, 5, 9],
    energy_sphere_frames_max: entity_sprites.get("orb_juice_red").length,
    energy_sphere_frame_delay: 0.006,
    energy_sphere_backing_sprites: [
        [
            entity_sprites.get("orb_empty"),
            entity_sprites.get("orb_back_tile"),
        ], // front
        [
            // will probably need to change this to accommodate UI decoration
        ]  // back
    ],
    energy_sphere_water_sprites: [
        entity_sprites.get("orb_juice_blue"),
        entity_sprites.get("orb_juice_magenta"),
        entity_sprites.get("orb_juice_red")
    ]
}


function render_game(game, delta_time) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);

    write_text(layers.ui2.ctx, `hp: ${game.player_ent.hp}/${game.player_ent.max_hp}`, 16, canvas_height - 16 - 12, "red", "MS Gothic", 12);
    if (game.player_ent.last_hit) {
        write_text(
            layers.ui2.ctx, 
            `last hit: ${game.player_ent.last_hit.name} (${game.player_ent.last_hit.id}) from ${game.player_ent.last_hit.source.name} (${game.player_ent.last_hit.source.id})`, 
            16, canvas_height - 16, "red", "MS Gothic", 9
        );
    }

    write_text(layers.ui2.ctx, `orbs: `, 16, canvas_height-16-12-96+12, "white", "MS Gothic", 12);
    write_text(layers.ui2.ctx, `        -   -  `, 16, canvas_height-16-12-96+12, "grey", "MS Gothic", 12);
    for (let i=0; i<3; i++) {
        write_text(
            layers.ui2.ctx, `${game.player_stats.current_invoke_order[i] ? game.player_stats.current_invoke_order[i] : ""}`, 16+(6*6)+(6*4*i), canvas_height-16-12-96+12, 
            ["", "cyan", "magenta", "coral", "white"][game.player_stats.current_invoke_order[i]], "MS Gothic", 12
        );
    }

    for (let i=0; i<3; i++) {
        r_info.energy_amounts_display[i] = lerp(r_info.energy_amounts_display[i], game.player_stats.energy_cur[i], r_info.energy_amounts_lerp_speed);
        e_display = Math.round(r_info.energy_amounts_display[i]);
        write_text(layers.ui2.ctx, `essence${i}: ${e_display}`, 16, canvas_height-16-12-96+12+12+(12*i), ["cyan", "magenta", "coral"][i], "MS Gothic", 12);
    }
    write_text(layers.ui2.ctx, `pure:     ${game.player_stats.pure_essences}`, 16, canvas_height-16-12-96+12+12+(12*3), "white", "MS Gothic", 12);

    // try to render the juice!
    // juice will need to be rendered in 3 steps - first, render the juice on ui2, then render the frame on ui1 (so it goes over it)
    let orbs_start = new Vector2(canvas_width - 96, canvas_height - 512);
    for (let i=0; i<3; i++) {
        let sp = r_info.energy_sphere_water_sprites[i][Math.floor(r_info.energy_sphere_frames[i])];
        let sp2 = r_info.energy_sphere_backing_sprites[0][0][0];
        let sp3 = r_info.energy_sphere_backing_sprites[0][1][0];

        write_rotated_image(
            layers.ui1.canvas, layers.ui1.ctx, orbs_start.x, orbs_start.y + (i*128) + 64, 
            entity_sprites.get("ui_tile")[0], entity_sprites.get("ui_tile")[0].width*2, entity_sprites.get("ui_tile")[0].height*2, 0
        );

        write_rotated_image(
            layers.ui1.canvas, layers.ui1.ctx, orbs_start.x, orbs_start.y + (i*128) + 64, 
            entity_sprites.get("ui_tile")[0], entity_sprites.get("ui_tile")[0].width*2, entity_sprites.get("ui_tile")[0].height*2, 0
        );

        write_rotated_image(
            layers.ui1.canvas, layers.ui1.ctx, orbs_start.x, orbs_start.y + (i*128) + 64, 
            entity_sprites.get("ui_tile")[0], entity_sprites.get("ui_tile")[0].width*2, entity_sprites.get("ui_tile")[0].height*2, 0
        );

        let pct = r_info.energy_amounts_display[i] / game.player_stats.energy_max[i];
        write_rotated_image(
            layers.ui2.canvas, layers.ui2.ctx, orbs_start.x, orbs_start.y + (i*128) - 32 + Math.floor(((1 - pct) * 64)), 
            sp, sp.width*2, sp.height*2, 0
        );
        r_info.energy_sphere_frames[i] = (r_info.energy_sphere_frames[i]+(r_info.energy_sphere_frame_delay * delta_time)) % r_info.energy_sphere_frames_max;

        write_rotated_image(
            layers.ui1.canvas, layers.ui1.ctx, orbs_start.x, orbs_start.y + (i*128), 
            sp2, sp2.width*2, sp2.height*2, 0
        );

        write_rotated_image(
            layers.ui1.canvas, layers.ui1.ctx, orbs_start.x, orbs_start.y + (i*128), 
            sp3, sp3.width*2, sp3.height*2, 0
        );
    }

    // game objects are centered, so offset the rendering here
    game.objects.forEach(obj => {
        write_rotated_image(
            layers.fg2.canvas,
            layers.fg2.ctx,
            obj.position.x - (entity_sprites.get(obj.sprite)[0].width / 2),
            obj.position.y - (entity_sprites.get(obj.sprite)[0].height / 2),
            entity_sprites.get(obj.sprite)[0],
            entity_sprites.get(obj.sprite)[0].width, entity_sprites.get(obj.sprite)[0].height, 0
        )
    })
}

let last_calc_time = Date.now();

function game_loop() {
    // ** Frame start
    let frame_start_time = Date.now();

    // ** [A] Wait period
    // amount of time since the end of the last frame and this one is the wait time
    let time_waited = Math.max(0, frame_start_time - last_frame_time);

    wait_durations.push(time_waited);
    wait_durations = wait_durations.slice(-120);

    // ** Game step
    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    let delta_time_real = delta_time / 1000;
    last_calc_time = calc_start_time;

    // step the game in substeps for better collision accuracy
    let substep_count = 16;
    for (let i=0; i<substep_count; i++) {
        game.step(delta_time_real / substep_count);
    }
    
    // TODO think about a better way of handling inputs here possibly also supporting rebinding
    let spd = 128 * delta_time_real;

    // - movement
    if (keys_down["KeyA"]) {
        player_ent.position = player_ent.position.add(new Vector2(-1, 0).mul(spd));
    }

    if (keys_down["KeyD"]) {
        player_ent.position = player_ent.position.add(new Vector2(1, 0).mul(spd));
    }

    if (keys_down["KeyS"]) {
        player_ent.position = player_ent.position.add(new Vector2(0, 1).mul(spd));
    }

    if (keys_down["KeyW"]) {
        player_ent.position = player_ent.position.add(new Vector2(0, -1).mul(spd));
    }

    // - invoking
    let invoking_essence = 0;
    if (keys_down_this_frame["Digit1"]) {
        invoking_essence = 1;
    } else if (keys_down_this_frame["Digit2"]) {
        invoking_essence = 2;
    } else if (keys_down_this_frame["Digit3"]) {
        invoking_essence = 3;
    } else if (keys_down_this_frame["Digit4"]) {
        invoking_essence = 4;
    }

    if (keys_down_this_frame["Backquote"]) {
        invoking_essence = 0;
        game.player_stats.current_invoke_order = [];
    }

    // TODO can definitely pull this out into a separate function lol
    if (invoking_essence) {
        game.player_stats.current_invoke_order.push(invoking_essence);

        if (game.player_stats.current_invoke_order.length >= 3) {
            // perform the spell invoke
            // sort out pure essences and calculate stat multipliers here
            let raw_order = game.player_stats.current_invoke_order;
            let actual_spell_order = [];
            let spell_id = 1;
            let spell_multipliers = [1, 1, 1];
            let orb_counts = [0, 0, 0, 0];

            for (let i=2; i>=0; i--) {
                let e = raw_order[i];
                let e_c = 0;
                if (e == 4) {
                    if (i == 0) {
                        e_c = raw_order[i+1];
                    } else {
                        e_c = raw_order[i-1];
                    }

                    for (let j=0; j<3; j++) {
                        spell_multipliers[j] += 1;
                    }
                } else {
                    spell_multipliers[e-1] += 1 - (i / 4);
                    e_c = e;
                }

                actual_spell_order.push(e_c);
                spell_id *= e_c;
                orb_counts[e-1]++;
            };

            // now we have the actual orb order, we can match that up to a spell by looking it up in the list
            // TODO make this properly (lao)
            // Order, Entropy, Chaos
            /*
            111
            112
            113
            122
            133
            222
            223
            332
            333
            123
            */
            // TODO put the actual writeup's names for the spells here 
            let spells_map = new Map([
                [1*1*1, "1-1-1"],
                [1*1*2, "1-1-2"],
                [1*1*3, "1-1-3"],
                [1*2*2, "1-2-2"],
                [1*3*3, "1-3-3"],
                [2*2*2, "2-2-2"],
                [2*2*3, "2-2-3"],
                [3*3*2, "3-3-2"],
                [3*3*3, "3-3-3"],
                [1*2*3, "1-2-3"],
                [4*4*4, "4-4-4 (Pure Purity)"]
            ]);

            let spell_to_cast = spells_map.get(spell_id);

            console.log(spell_to_cast);
            console.log(spell_multipliers);

            // cost of the spell is based on the orbs used to cast it
            let can_cast = true;
            for (let i=0; i<3; i++) {
                can_cast = can_cast & (orb_counts[i] * game.player_stats.spell_cost_mult <= game.player_stats.energy_cur[i]);   
            }

            can_cast = can_cast & (orb_counts[3] <= game.player_stats.pure_essences);

            if (can_cast) {
                console.log("It worked!");

                for (let i=0; i<3; i++) {
                    game.player_stats.energy_cur[i] -= orb_counts[i] * game.player_stats.spell_cost_mult;   
                }
    
                game.player_stats.pure_essences -= orb_counts[3];
            } else {
                console.log("Not enough resources :(");
            }

            game.player_stats.current_invoke_order = [];
        }
    }

    let calc_end_time = Date.now();

    // ** Render
    let render_start_time = Date.now();

    render_game(game, delta_time);
    render_diagnostics(game);

    let render_end_time = Date.now();

    // ** [A] Count up frame times
    time_deltas.push(delta_time);
    time_deltas = time_deltas.slice(-120);

    render_durations.push(render_end_time - render_start_time);
    render_durations = render_durations.slice(-120);

    calc_durations.push(calc_end_time - calc_start_time);
    calc_durations = calc_durations.slice(-120);

    let frame_end_time = Date.now();
    let time_since_last_frame = frame_end_time - last_frame_time;
    last_frame_time = frame_end_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // ** Clean up
    keys_down_this_frame = {};

    // ** Enqueue next frame
    window.requestAnimationFrame(game_loop);
}

let last_frame_time = Date.now();

let game = null;
let player_ent = null;

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    handle_resize();

    game = new Game(new Vector2(canvas_width, canvas_height), new PlayerStats(
        [100, 100, 100], [100, 100, 100], 3, 3, 20, []
    ));
    player_ent = new PlayerEnt(
        game,
        new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            game_resolution.y - 64
        ), 5, "Player", "ally", 10, 10
    )

    for (let i=0; i<8; i++) {
        setTimeout(() => {
                enemy_ent = new GenericEnemyEnt(
                game,
                new Vector2(
                    Math.floor(game_resolution.x / 2) - 8,
                    64
                ), 12, "Enemy", "enemy", 10, 10, [...example_pattern2, example_pattern], example_path
            )
            game.add_object(enemy_ent, true);
        }, 827 * i)
    }

    game.add_object(player_ent, true);
    game.player_ent = player_ent;

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

        }

        keys_down_this_frame[code] = true;
        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;

        switch (code) {

        }
    });

    let interval = setInterval(function() {
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            last_calc_time = Date.now();
            game_loop();
        }
    }, 200)

    // window.addEventListener("resize", handle_resize);
})
