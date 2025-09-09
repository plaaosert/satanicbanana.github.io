game_id = "transport";

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

// Tiles have some associated stats
const TileType = {
    // Terrain
    GRASS: "GRASS",
    SAND: "SAND",
    WATER: "WATER",

    // Infrastructure
    ROAD: "ROAD",
    TRAIN_STATION: "TRAIN_STATION",
    RAILWAY: "RAILWAY",
    AIRPORT: "AIRPORT",
    SEAPORT: "SEAPORT",

    // Cities
    HOUSING: "HOUSING",
    COMMERCIAL: "COMMERCIAL",
    INDUSTRIAL: "INDUSTRIAL",
    OFFICES: "OFFICES",
}

const TileData = {
    [TileType.GRASS]: {col: "green"},
    [TileType.SAND]: {col: "goldenrod"},
    [TileType.WATER]: {col: "mediumblue"},
    [TileType.ROAD]: {col: "gray"},
    [TileType.TRAIN_STATION]: {col: "lightsalmon"},
    [TileType.RAILWAY]: {col: "darkgray"},
    [TileType.AIRPORT]: {col: "firebrick"},
    [TileType.SEAPORT]: {col: "dodgerblue"},
    [TileType.HOUSING]: {col: "darkolivegreen"},
    [TileType.COMMERCIAL]: {col: "darkcyan"},
    [TileType.INDUSTRIAL]: {col: "chocolate"},
    [TileType.OFFICES]: {col: "blueviolet"},
}

class GameWorld {
    constructor() {
        this.tilemap = new Map();
        this.navmeshes = {};
    }
}

// begin github test code

let perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}
perlin.seed();

// end github test code

class Viewer {
    static BASE_SIZE = 16;
    static ROTATION = 45;

    constructor(gameworld) {
        this.zoom_level = 1;
        this.position = new Vector2(40/this.zoom_level, -40/this.zoom_level);

        this.gameworld = gameworld;
    }

    render_tiles(canvas, ctx, lines_only=false) {
        ctx.clearRect(0, 0, canvas_width, canvas_height);

        // the side length of the squares is BASE_SIZE
        // the camera is rotated 45 degrees (so the square is pointing corner down), which means that the shape has a cross-length of:
        //   cos(45)*BASE_SIZE
        let cross_length = Math.cos(45 * (Math.PI / 180)) * Viewer.BASE_SIZE;
        
        // we then also need the cross height, which is based on the rotation angle.
        // we can find this by rotating the upper point in 2d around the center then discarding y-position, and getting the difference.
        let point_raw = new Vector2(Viewer.BASE_SIZE, 0);
        let point_rotated = point_raw.rotate(Viewer.ROTATION * (Math.PI / 180));

        let point_xdiff = cross_length - (point_raw.x - point_rotated.x);
        let cross_height = Math.abs(point_xdiff) * 1;

        cross_length *= this.zoom_level;
        cross_height *= this.zoom_level;

        // now we have the (half) cross height and cross length, we can calculate where to place each square:
        //   p_off = (cross_len * (x-y), cross_height * (y+x))
        // for now just do perlin noise
        for (let x=0; x<256; x++) {
            for (let y=0; y<256; y++) {
                let xt = x + this.position.x
                let yt = y + this.position.y;

                let p_off = new Vector2(cross_length * (xt-yt), cross_height * (yt+xt));

                // draw the square. the point offset is where the square starts, so move half cross_length across to start at the first corner
                ctx.beginPath();
                ctx.moveTo(p_off.x + cross_length, p_off.y);
                ctx.lineTo(p_off.x + (cross_length * 2), p_off.y + cross_height);
                ctx.lineTo(p_off.x + cross_length, p_off.y + (cross_height * 2));
                ctx.lineTo(p_off.x, p_off.y + cross_height);
                ctx.closePath();

                // if lines only, just do black lines here, else do the fill
                if (lines_only) {
                    ctx.strokeStyle = new Colour(128, 128, 128, 128).css();
                    ctx.stroke();
                } else {
                    let p = perlin.get(x/16, y/16);
                    if (p >= 0.2) {
                        ctx.fillStyle = TileData.WATER.col
                    } else if (p >= 0.1) {
                        ctx.fillStyle = TileData.SAND.col
                    } else {
                        ctx.fillStyle = TileData.GRASS.col
                    }
                    ctx.fill();
                }
            }
        }
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

let last_frame = Date.now();

function game_loop() {
    let this_frame = Date.now();
    let delta_time = (this_frame - last_frame) / 1000;
    
    if (true) {
        // game step using deltatime
        
    }

    last_frame = this_frame;

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

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

    let v = new Viewer(null);
    v.render_tiles(layers.fg2.canvas, layers.fg2.ctx);
    v.render_tiles(layers.fg1.canvas, layers.fg1.ctx, true);
})
