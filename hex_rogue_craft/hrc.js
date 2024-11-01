game_id = "hrc";

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
const hex_size_x = 16;
const hex_size_y = 10;
const hex_height = 3;

const hex_scaling_ratio = (Math.sqrt(3)/2) * Math.cos(Math.PI / 3);

class TileTemplate {
    constructor(id, name, resource_name, num_sprites, max_hp, drop_table) {
        this.id = id;
        this.name = name;
        this.resource_name = resource_name;
        this.num_sprites = num_sprites;

        this.max_hp = max_hp;
        this.drop_table = drop_table;

        // later add other stuff like tags for enemy ai
    }
}

const tile_templates = {
    "blank": new TileTemplate("blank", "Blank", "blank", 1, 1, []),
    "grass1": new TileTemplate("grass1", "Grass", "grass1", 1, 1, [])
}

const entity_sprites = new Map(Object.values(tile_templates).map((v, i) => {
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
}));

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

function seeded_xy_random(seed, x, y) {
    return seeded_random(seed + "-" + x + "-" + y);
}

class Tile {
    constructor(template, damage, placed_by_player) {
        this.template = template;
        this.damage = damage;
        this.placed_by_player = placed_by_player;
    }
}

class Game {
    constructor(diameter, max_height) {
        this.board = [];
        for (let x=0; x<diameter; x++) {
            this.board.push(new Array(diameter).fill(0).map((_, y) => {
                let n = random_int(28, 34);
                n = Math.round(6*Math.sin(x / 6) + 0)
                n += Math.round(6*Math.cos(y / 3) + 30)

                return new Array(max_height).fill(0).map((_, h) => {
                    return h < n ? (h < 24 ? new Tile(tile_templates.blank) : new Tile(tile_templates.grass1)) : null
                })
            }));
        }
    }

    player_can_see(position) {
        return this.position_can_see(new Vector3(32, 32, 64), position)
    }

    entity_can_see(ent, position) {
        // unimplemented
    }

    position_can_see(pos1, pos2) {

    }

    distance_between(pos1, pos2) {
        let pos1_cube = this.axial_to_cube(pos1.x, pos1.y);
        let pos2_cube = this.axial_to_cube(pos2.x, pos2.y);

        let vector = pos2_cube.sub(pos1_cube);
        return (Math.abs(vector.x) + Math.abs(vector.y) + Math.abs(vector.z)) / 2
    }

    axial_to_cube(q, r) {
        return new Vector3(q, r, -q-r);
    }
}

class Viewer {
    constructor(game, layers) {
        this.game = game
        this.layers = layers

        this.zoom_scale = 16;
        this.view_offset = new Vector2(32, 32);
        this.view_height = 36;

        this.refresh_stwp_wtsp();
    }

    set_zoom_scale(to) {
        this.zoom_scale = to;

        this.refresh_stwp_wtsp();
    }

    refresh_stwp_wtsp() {
        this.tile_to_screen_pos = this.tile_to_screen_pos_fn();
        this.ttsp = this.tile_to_screen_pos;

        this.screen_to_tile_pos = this.screen_to_tile_pos_fn();
        this.sttp = this.screen_to_tile_pos;
    }

    tile_to_screen_pos_fn() {
        // hex tiles, so this is actually pretty complicated.
        // +-12, +-3 for "diagonals".
        // 0, +-6 for "verticals",
        // +-3 per height level.
        // use https://www.redblobgames.com/grids/hexagons/#hex-to-pixel, making sure to scale the axes, then also apply the height modifier (+-3px).
        // remember we're going to screen pos, so include zoom scale and offset!
        return function(pos) {
            let x = 12 * this.zoom_scale * pos.x;
            let y = (this.zoom_scale) * ((3 * pos.x) + (6 * pos.y));

            return new Vector2(x, y).add(new Vector2(0, (this.view_height - pos.z)*3*this.zoom_scale)).add(this.view_offset).div(this.zoom_scale).floor().mul(this.zoom_scale);
        }
    }

    screen_to_tile_pos_fn() {
        // this one is even harder, because there can actually be an infinite number of possible hexes.
        // should basically check for every possible height offset (that's +-r) that it could be.
        // if hex is at (0, 0) height 10, need to check (0, -1) (up) height 12 (down), (0, 1) height 8, etc. 
        // we can make this a bit more reasonable by picking a starting height based on the current view height.
        // we're looking for the tile closest to the camera (y value is highest) that isn't being culled.
        // a tile is culled (made translucent) if (AND):
        //  - it exactly covers (+r, -2h) a visible empty tile
        //  - this condition is not true for any tiles that exactly cover the culled tile (there should be a chain of solid/out of LOS tiles and nothing else)
        // in other words, space "behind" it, no space "in front of" it.
        // because of how this works, tiles after the first culled tile ("after" meaning "+r, +2h") will also always be culled,
        // so we can finish the search here in that direction. as for the other direction (searching empty space), use the render distance limit

        return function(pos) {
            
        }
    }

    render_world() {
        layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    
        let enqueued_renders = [];

        this.game.board.forEach((qh, q) => {
            qh.forEach((rh, r) => {
                rh.forEach((tile, h) => {
                    let screen_pos = this.tile_to_screen_pos(new Vector3(q, r, h));
                    // console.log(screen_pos)
    
                    if (tile) {
                        let img = entity_sprites.get(tile.template.resource_name)[0];
                        enqueued_renders.push([img, screen_pos, Math.abs(r) + Math.abs(-q-r)]);
                    }
                })
            })
        });

        enqueued_renders.sort((a, b) => a[2] - b[2]);

        enqueued_renders.forEach(e => {
            let img = e[0];
            let screen_pos = e[1];

            write_rotated_image(this.layers.fg2.canvas, this.layers.fg2.ctx, screen_pos.x, screen_pos.y, img, hex_size_x * this.zoom_scale, hex_size_y * this.zoom_scale, 0);
        })
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
    
    if (true) {
        // game step using deltatime (but this is turn based so doesnt matter)
    }

    last_frame = this_frame;

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    game = new Game(64, 48);
    viewer = new Viewer(game, layers);
    game.viewer = viewer;

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
