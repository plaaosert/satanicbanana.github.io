game_id = "runner";

const pixel_id_info = [
    {id: 0, solid: false, priority: 0, name: "EMPTY", col: Colour.black},
    {id: 1, solid: true, priority: 998, name: "WALL", col: null},
    {id: 2, solid: false, priority: 999, name: "DANGER", col: Colour.white},
    {id: 3, solid: false, priority: 2, name: "JUMPPAD", col: Colour.from_hex("#fffc40")},
    {id: 4, solid: false, priority: 1, name: "SLOWFALL", col: Colour.from_hex("#333941")},
]

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

const player_standing = {name: "standing", sprites: [new Image(7, 8)]};
player_standing.sprites[0].src = "img/sprite_guy_standing_000.png";

const player_jumping = {name: "jumping", sprites: [new Image(7, 8), new Image(7, 8)]};
player_jumping.sprites[0].src = "img/sprite_guy_jumping_000.png";
player_jumping.sprites[1].src = "img/sprite_guy_jumping_001.png";

const player_ascending = {name: "ascending", sprites: [new Image(7, 8)]};
player_ascending.sprites[0].src = "img/sprite_guy_ascending_000.png";

const player_descending = {name: "descending", sprites: [new Image(7, 8)]};
player_descending.sprites[0].src = "img/sprite_guy_descending_000.png";

const player_running = {name: "running", sprites: [new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8)]};
player_running.sprites[0].src = "img/sprite_guy_running_000.png";
player_running.sprites[1].src = "img/sprite_guy_running_001.png";
player_running.sprites[2].src = "img/sprite_guy_running_002.png";
player_running.sprites[3].src = "img/sprite_guy_running_003.png";
player_running.sprites[4].src = "img/sprite_guy_running_004.png";
player_running.sprites[5].src = "img/sprite_guy_running_005.png";
player_running.sprites[6].src = "img/sprite_guy_running_006.png";

const player_running_rev = {name: "running_rev", sprites: [new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8), new Image(7, 8)]};
player_running_rev.sprites[0].src = "img/sprite_guy_running_rev_000.png";
player_running_rev.sprites[1].src = "img/sprite_guy_running_rev_001.png";
player_running_rev.sprites[2].src = "img/sprite_guy_running_rev_002.png";
player_running_rev.sprites[3].src = "img/sprite_guy_running_rev_003.png";
player_running_rev.sprites[4].src = "img/sprite_guy_running_rev_004.png";
player_running_rev.sprites[5].src = "img/sprite_guy_running_rev_005.png";
player_running_rev.sprites[6].src = "img/sprite_guy_running_rev_006.png";

const prerender_canvas = document.getElementById("hidden-prerender-canvas");
const prerender_ctx = prerender_canvas.getContext("2d");

const load_progress = document.getElementById("load-progress")

let num_textures_loaded = 0;
let num_textures_needed = 0;

const fps = 30;
const level_fps = 15;

const full_texture_atlas = new Array(1).fill(0).map((v, i) => {
    let ts = [];

    return ts;
});

let layers = {};
let keys_down = {};

let drag_start_pos = null;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);
//let mouse_select_pos = new Vector2(0, 0);

let wtsp = null;
let stwp = null;
let canvas_zoom_factor = null;

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
    canvas_height = Math.round(vh(90) / 8);
    canvas_width = Math.round(((canvas_height * 16) / 9));

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        ctx.canvas.width = canvas_width;
        ctx.canvas.height = canvas_height;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
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
        this.level = null;
        this.curframe = 0;
        this.cur_subframe = 0;

        this.player = null;

        this.player_sprite_frame = 0;
        this.player_sprite_looping = 0;
        this.player_sprite_fps = 30;
        this.player_sprite_curimg = player_standing.sprites[0];
        this.player_sprite_set = player_standing;
        this.player_sprite_finished = false;

        this.player_movespeed = 4/60;

        this.player_fall_maxspeed = 6/60;
        this.player_gravity = (60/60)/1000;

        this.player_jump_speed = 5/60;
        this.player_jump_float = 0;
        this.player_jump_float_max = 100;
        this.player_jump_timeout_max = 200;
        this.player_jump_timeout = 0;  // if jump timeout is 0, velocity is moved downwards by 1/60 until it reaches 2/60.
                                       // if it isn't, it's set to -2/60.
    }

    player_jump() {
        if (this.player_can_jump()) {
            this.player_jump_timeout = this.player_jump_timeout_max;
            this.player_jump_float = this.player_jump_float_max;

            this.set_new_player_sprite_set(player_jumping);
        }
    }

    player_end_jump() {
        if (this.player_jump_timeout > 0) {
            this.player_jump_timeout = 0;
            this.player.velocity.y = 0;
        }
    }

    player_can_jump() {
        // player can jump if any of the pixels in a 3x1 rect directly below them are solid
        let pos = this.player.position;
        for (let xt=0; xt<3; xt++) {
            for (let yt=0; yt<1; yt++) {
                let pix = this.get_pixel_in_level(pos.x + xt+2, pos.y + 8 + yt);
                let pix_info = pixel_id_info[pix];
                if (pix_info.solid) {
                    return true;
                }
            }
        }

        return false;
    }

    wall_in_above_player() {
        // check 3x4 rect (top half)
        let pos = this.player.position;
        for (let xt=0; xt<3; xt++) {
            for (let yt=0; yt<4; yt++) {
                let pix = this.get_pixel_in_level(pos.x + xt+2, pos.y + yt);
                let pix_info = pixel_id_info[pix];
                if (pix_info.solid) {
                    return true;
                }
            }
        }

        return false;
    }

    wall_in_below_player() {
        // check 3x4 rect (bottom half; y offset 4)
        let pos = this.player.position;
        for (let xt=0; xt<3; xt++) {
            for (let yt=0; yt<4; yt++) {
                let pix = this.get_pixel_in_level(pos.x + xt+2, pos.y + 4 + yt);
                let pix_info = pixel_id_info[pix];
                if (pix_info.solid) {
                    return true;
                }
            }
        }

        return false;
    }

    step(delta_time) {
        if (!this.level || !this.player) {
            return;
        }

        this.player_step(delta_time);
        this.physics_step(delta_time);
        this.level_step(delta_time);
    }

    set_new_player_sprite_set(set, looping, start_frame) {
        this.player_sprite_frame = start_frame ? start_frame : 0;
        this.player_sprite_looping = looping ? true : false;
        this.player_sprite_set = set;
        this.player_sprite_curimg = set.sprites[this.player_sprite_frame];
    }

    player_step(delta_time) {
        this.player_sprite_frame += (delta_time / 1000) * this.player_sprite_fps;
        if (this.player_sprite_looping) {
            this.player_sprite_frame = this.player_sprite_frame % this.player_sprite_set.sprites.length;
        } else {
            // cap at last frame
            this.player_sprite_frame = Math.min(this.player_sprite_set.sprites.length - 1, this.player_sprite_frame);
            if (this.player_sprite_frame == this.player_sprite_set.sprites.length - 1) {
                this.player_sprite_finished = true;
            }
        }

        this.player_sprite_curimg = this.player_sprite_set.sprites[Math.floor(this.player_sprite_frame)];

        this.player_jump_timeout -= delta_time;
        if (this.player_jump_timeout <= 0) {
            if (this.player_jump_float <= 0) {
                if (!this.player_can_jump()) {
                    this.player.velocity.y = Math.min(this.player_fall_maxspeed, this.player.velocity.y + (this.player_gravity * delta_time))
                } else {
                    this.player.velocity.y = 0;
                }
            } else {
                this.player.velocity.y = 0;
                this.player_jump_float -= delta_time;
            }
        } else {
            this.player.velocity.y = -this.player_jump_speed;
        }

        // get unstuck if necessary
        if (this.wall_in_below_player()) {
            // push up
            this.player.position.y -= 1;
        } else if (this.wall_in_above_player()) {
            // push down
            this.player.position.y += 1;
        }

        let running = false;

        this.player.velocity.x = 0;
        if (keys_down["ArrowLeft"]) {
            this.player.velocity.x = -this.player_movespeed;
            running = true;
        }

        if (keys_down["ArrowRight"]) {
            this.player.velocity.x = this.player_movespeed;
            running = true;
        }

        // if there's ground below the player, look at running/standing sprites
        if (this.player_can_jump() && (this.player_sprite_set.name != "jumping" || this.player_jump_timeout <= 0)) {
            if (running) {
                // if not already in run sprite, do that
                let target = this.player.velocity.x > 0 ? player_running : player_running_rev
                if (target.name != this.player_sprite_set.name) {
                    this.set_new_player_sprite_set(target, true)
                }
            } else {
                // enter stand sprite
                if (this.player_sprite_set.name != "standing") {
                    this.set_new_player_sprite_set(player_standing)
                }
            }
        } else {
            // otherwise we're either jumping, ascending or falling
            // if at the end of jumping, switch to either descending or falling
            let target = (this.player.velocity.y > 0) ? player_descending : player_ascending;
            if (this.player_sprite_finished && this.player_sprite_set.name != target.name) {
                this.set_new_player_sprite_set(target);
            }
        }
    }

    level_step(delta_time) {
        this.cur_subframe += delta_time;

        while (this.cur_subframe >= (1000/level_fps)) {
            this.cur_subframe -= (1000/level_fps);

            this.curframe = (this.curframe + 1) % this.level.num_frames;
        }
    }

    physics_step(delta_time) {
        // add the velocity multiplied by delta time to subposition
        // pull out the whole number components of that and use them for movement
        this.player.subposition = this.player.subposition.add(this.player.velocity.mul(delta_time));

        // move player by velocity, stopping if intersecting an obstacle
        // move in a line but only ever move by one pixel in one direction per step
        let nx = Math.trunc(Math.abs(this.player.subposition.x));
        let ny = Math.trunc(Math.abs(this.player.subposition.y));

        this.player.subposition = this.player.subposition.sub(new Vector2(
            Math.trunc(this.player.subposition.x),
            Math.trunc(this.player.subposition.y)
        ))

        let xpoints = new Array(nx).fill(0).map((_, i) => ["x", (i+1) / nx]);
        let ypoints = new Array(ny).fill(0).map((_, i) => ["y", (i+1) / ny]);

        let points = [...xpoints, ...ypoints].sort((a, b) => a[1] - b[1] == 0 ? (a[0] == "y" ? 1 : -1) : a[1] - b[1]);

        let sthis = this;
        points.forEach(point => {
            let newpos = null;
            if (point[0] == "x") {
                let d = Math.sign(sthis.player.velocity.x);
                newpos = sthis.player.position.add(new Vector2(d, 0));
            } else {
                let d = Math.sign(sthis.player.velocity.y);
                newpos = sthis.player.position.add(new Vector2(0, d));
            }

            let coll = sthis.check_player_collision_at(newpos);
            if (coll) {
                // look up its data. if it's solid, don't let the move happen
                if (pixel_id_info[coll].solid) {
                    return;
                }
            }

            sthis.player.position = newpos;
        })
    }

    check_player_collision_at(pos) {
        // the player sprites are 7x8 - player collision box is a centered 3x8 box (so offset by (2, 0))
        // returns the highest priority tile touched 

        //             id prio
        let selected = [0, 0];

        for (let xt=0; xt<3; xt++) {
            for (let yt=0; yt<8; yt++) {
                let pix = this.get_pixel_in_level(pos.x + xt+2, pos.y + yt);
                let pix_info = pixel_id_info[pix];
                if (pix_info.priority > selected[1]) {
                    selected = [pix, pix_info.priority];
                }
            }
        }

        return selected[0];
    }

    get_pixel_in_level(x, y) {
        if (x < 0 || x >= this.level.dimensions.x || y < 0 || y >= this.level.dimensions.y) {
            return 0;
        }

        return this.level.frames[this.curframe][y][x];
    }
}

class Level {
    constructor(frames, wall_col) {
        /*
        [
            [
                [0, 0, 0, 0, 1, 0, 0, 0],           #   
                [1, 1, 0, 1, 1, 0, 0, 0],       ## ##   
                [0, 0, 0, 1, 1, 0, 0, 0],          ##   
                [0, 0, 1, 1, 1, 0, 1, 1],         ### ##
            ],

            [
                [0, 0, 0, 0, 1, 0, 0, 0],           #  
                [1, 1, 0, 1, 1, 0, 0, 0],       ## ##   
                [0, 0, 0, 1, 1, 0, 0, 0],          ##   
                [0, 0, 1, 1, 1, 0, 1, 1],         ### ##
            ]
        ]
        */
        this.frames = frames;
        this.wall_col = wall_col;
        this.num_frames = frames.length;
        this.dimensions = new Vector2(
            frames[0][0].length, frames[0].length
        )
    }
}

class Player {
    constructor() {
        this.position = new Vector2(0, 0);
        this.subposition = new Vector2(0, 0);
        
        this.velocity = new Vector2(0, 0);
    }
}

function render_game(game) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);  // player
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);  // level

    let canvas_pixels = new Vector2(
        canvas_width / zoom_level, canvas_height / zoom_level
    );

    for (let xt=0; xt<=canvas_pixels.x; xt++) {
        for (let yt=0; yt<=canvas_pixels.y; yt++) {
            let x = xt;
            let y = yt;

            let col = pixel_id_info[game.get_pixel_in_level(x, y)].col;
            if (!col) {
                col = game.level.wall_col;
            }

            layers.fg3.ctx.fillStyle = col.css();
            layers.fg3.ctx.fillRect(xt*zoom_level, yt*zoom_level, zoom_level, zoom_level);
        }
    }

    write_rotated_image(
        layers.fg2.canvas, layers.fg2.ctx,
        game.player.position.x, game.player.position.y,
        game.player_sprite_curimg, 7, 8
    )
}

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();

let game_container = {game: null};

game_container.game = new Game();
game_container.game.player = new Player();
game_container.game.level = new Level([
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
], new Colour(0, 255, 0));

let need_to_redraw = true;
let zoom_level = 1;

function game_loop() {
    let frame_start_time = Date.now();

    wait_durations.push(frame_start_time - last_frame_time);
    wait_durations = wait_durations.slice(-120);

    // render game here
    render_game(game_container.game, layers.fg3.canvas, layers.fg3.ctx);
    //render_diagnostics();

    let render_end_time = Date.now();

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    // step game here
    game_container.game.step(delta_time);

    need_to_redraw = false;

    let calc_end_time = Date.now();

    time_deltas.push(delta_time);
    time_deltas = time_deltas.slice(-120);

    render_durations.push(render_end_time - frame_start_time);
    render_durations = render_durations.slice(-120);

    calc_durations.push(calc_end_time - render_end_time);
    calc_durations = calc_durations.slice(-120);

    let frame_end_time = Date.now();
    let time_since_last_frame = frame_end_time - last_frame_time;
    last_frame_time = frame_end_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // next frame should arrive (1000/fps) ms later, so get the time left and compare it with the end time
    let expected_next_frame = frame_start_time + (1000/fps);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

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
            case "ArrowUp":
                break;

            case "ArrowDown":
                break;

            case "ArrowLeft":
                break;

            case "ArrowRight":
                break;

            case "Space":
            case "KeyA":
            case "KeyZ":
                if (!keys_down[code]) {
                    game_container.game.player_jump();
                }
                break;
        }

        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;

        switch (code) {
            case "ArrowUp":
                break;

            case "ArrowDown":
                break;

            case "ArrowLeft":
                break;

            case "ArrowRight":
                break;

            case "Space":
            case "KeyA":
            case "KeyZ":
                game_container.game.player_end_jump();
                break;
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
})

window.addEventListener("resize", handle_resize)