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
    {name: "ally", x: 16, y: 16},
    {name: "enemy", x: 16, y: 16},
    {name: "enemy_bullet", x: 4, y: 8},
]

let num_textures_loaded = 0;
let num_textures_needed = 0;

const entity_sprites = new Map(sprites_manifest.map((v, i) => {
    let ts = [];

    for (let fc=0; fc<(v.num_sprites ? v.num_sprites : 1); fc++) {
        // will need to load sprites better from a manifest later
        let t = new Image(v.x, v.y);
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

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let game_resolution = new Vector2(256, 384);

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
        canvas.style.top = "256px";
    
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


class Game {
    constructor() {
        this.objects = [];
        this.player_ent = null;
    }

    step(delta_time) {
        this.objects.forEach(o => o.step(delta_time));

        this.objects = this.objects.filter(o => !o.removing);
    }

    add_object(obj) {
        this.objects.push(obj);
    }
}


class GameObject {
    static id_inc = 0;

    constructor(game, position, size) {
        this.get_new_id();

        this.game = game;

        this.position = position;

        this.removing = false;
    }

    step(delta_time) {
        // nothing!
    }

    check_for_collisions() {
        return 
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
    constructor(game, position, velocity, size, name, sprite, team, dmg) {
        super(game, position, size);
        
        this.name = name;
        this.sprite = sprite;
        this.team = team;
        this.dmg = dmg;
        this.velocity = velocity;
    }

    step(delta_time) {
        this.position = this.position.add(this.velocity);
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
    }

    step(delta_time) {
        // nothing!
    }

    take_dmg(amt) {
        this.hp -= amt;
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
                    this.game, shoot_pos, shoot_vel,
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
        ), duration: 2},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 4) - 8,
            64
        ), duration: 2},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / (4/3)) - 8,
            64
        ), duration: 1},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            64
        ), duration: 0.3},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            128
        ), duration: 3},
        {end_pos: new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            -64
        ), duration: 0.4},
    ]
}

let example_pattern = {
    delay: 0.8,
    initial: 2,
    offset: new Vector2(6, 4),
    target_type: ShootTargetingType.STATIC_DIR,
    angle: 90 * (Math.PI / 180),  // for STATIC_DIR
    inaccuracy: 0 * (Math.PI / 180),
    speed: 2,
    bullet_proto: Bullet,
    params: {
        size: 1,
        name: "Test bullet",
        sprite: "enemy_bullet",
        team: 1,
        dmg: 1
    },
    extra_params: []  // for custom bullet prototypes
}


let example_pattern2 = new Array(16).fill(0).map((_, i) => {
    return {
        delay: 6,
        initial: 0.01 * i,
        offset: new Vector2(6, 4),
        target_type: ShootTargetingType.DIRECT,
        angle: null,  // for STATIC_DIR
        inaccuracy: 10 * (Math.PI / 180),
        speed: 0.4 + (Math.random() * 2),
        bullet_proto: Bullet,
        params: {
            size: 4,
            name: "Test bullet",
            sprite: "enemy_bullet",
            team: 1,
            dmg: 1
        },
        extra_params: []  // for custom bullet prototypes
    }
})


let last_frame = Date.now();


function render_game(game) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    game.objects.forEach(obj => {
        write_rotated_image(
            layers.fg2.canvas,
            layers.fg2.ctx,
            obj.position.x,
            obj.position.y,
            entity_sprites.get(obj.sprite)[0],
            entity_sprites.get(obj.sprite)[0].width, entity_sprites.get(obj.sprite)[0].height, 0
        )
    })
}

function game_loop() {
    let this_frame = Date.now();
    let delta_time = (this_frame - last_frame) / 1000;
    
    if (true) {
        // game step using deltatime
        game.step(delta_time);
        render_game(game);
        
        let spd = 128 * delta_time;
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
    }

    last_frame = this_frame;

    window.requestAnimationFrame(game_loop);
}

let game = null;
let player_ent = null;

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    game = new Game();
    player_ent = new PlayerEnt(
        game,
        new Vector2(
            Math.floor(game_resolution.x / 2) - 8,
            game_resolution.y - 64
        ), 16, "Player", "ally", 10, 10
    )

    for (let i=0; i<8; i++) {
        setTimeout(() => {
                enemy_ent = new GenericEnemyEnt(
                game,
                new Vector2(
                    Math.floor(game_resolution.x / 2) - 8,
                    64
                ), 16, "Enemy", "enemy", 10, 10, [...example_pattern2, example_pattern], example_path
            )
            game.add_object(enemy_ent);
        }, 827 * i)
    }

    game.add_object(player_ent);
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

    let interval = setInterval(function() {
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            game_loop();
        }
    }, 200)

    window.addEventListener("resize", handle_resize);
})
