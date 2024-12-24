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

let layers = {};
let keys_down = {};

let drag_start_pos = null;

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

        this.base_tile_scale = 1
        this.zoom_scale = 8
        this.tile_size = this.base_tile_scale * this.zoom_scale;
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
            return pos.round().mul(zoom).add(offset);
        }
    }

    render_world() {
        // create an image with canvas_width and canvas_height
        let pix_data = this.layers.bg2.ctx.createImageData(canvas_width, canvas_height);

        xy_map(canvas_width, canvas_height, (x, y) => {
            let world_pos = this.screen_to_world_pos(new Vector2(x, y)).floor();

            let tile = this.game.world.tilemap[world_pos.x][world_pos.y];

            let col = tile_info[tile].col;

            let main_index = ((y * canvas_width) + x) * 4;

            pix_data.data[main_index + 0] = col.r;
            pix_data.data[main_index + 1] = col.g;
            pix_data.data[main_index + 2] = col.b;
            pix_data.data[main_index + 3] = 255;
        });

        this.layers.bg2.ctx.putImageData(pix_data, 0, 0);
    }

    render_entities_from_list(list, override_col=null) {
        // entities must have position and get_size().
        // they must also have get_col(), unless override_col is set.
        let tl = new Vector2(0, 0);
        let br = new Vector2(canvas_width-1, canvas_height-1);

        list.forEach(ent => {
            let screen_pos = this.wtsp(ent.position);
            let siz = ent.get_size() * this.zoom_scale;

            if (in_rect(screen_pos, tl, br, siz)) {
                this.layers.fg2.ctx.fillStyle = (override_col ? override_col : ent.get_col()).css();

                this.layers.fg2.ctx.fillRect(screen_pos.x, screen_pos.y, siz, siz);
            }
        })
    }

    render_settlements() {
        // for now, render them as pink boxes
        this.render_entities_from_list(this.game.settlements, Colour.from_hex("#ff2bff"));
    }

    render_traders() {
        // for now, render them as brown boxes
        this.render_entities_from_list(this.game.traders, Colour.from_hex("#562b00"));
    }
}

function in_rect(pos, tl, br, clearance=0) {
    return (
        pos.x + clearance >= tl.x && 
        pos.y + clearance >= tl.y &&
        pos.x - clearance < br.x &&
        pos.y - clearance < br.y
    )
}

function xy_map(xm, ym, fn) {
    for (let x=0; x<xm; x++) {
        for (let y=0; y<ym; y++) {
            fn(x, y);
        }
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