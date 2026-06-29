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

const local = window.location.href.startsWith("file://") || window.location.href.startsWith("http://localhost");

let num_textures_loaded = 0;
let num_textures_needed = 0;

let layers = {};

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let canvas_rect = null;

const entity_sprites = new Map(entity_sprite_defs.map((v, i) => {
    let ts = [];

    if (v[1] > 1) {
        for (let i=0; i<v[1]; i++) {
            let t = new Image(128, 128);
            t.src = `${FILES_PREFIX}assets/img/${v[2]}${v[0]}_${i.toString().padStart(3, "0")}.png`;
            t.style.imageRendering = "pixelated";

            num_textures_needed++;

            if (v[3]) {
                let e = false;
                t.addEventListener("error", function() {
                    if (!e) {
                        t.src = `${FILES_PREFIX}assets/img/icons/unknown.png`;
                        e = true;
                    }
                })
            }

            ts.push(t);
        }
    } else {
        let t = new Image(128, 128);
        t.src = `${FILES_PREFIX}assets/img/${v[2]}/${v[0]}.png`;
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        if (v[3]) {
            let e = false;
            t.addEventListener("error", function() {
                if (!e) {
                    t.src = `${FILES_PREFIX}assets/img/icons/unknown.png`;
                    e = true;
                }
            })
        }

        ts.push(t);
    }

    return [v[0], ts]
}))

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    });
}

function handle_resize(event) {
    // 8 for topbar, 16 for bottombar, 8 for top span item
    // let canvas_smallest = Math.min(vh(100 - 8 - 8 - 16, true), vw(100) - 128);

    // size on a 1920x1080p monitor on chrome because my
    // personal experience is more important than all of yalls.
    // i would apologise but im not sorry
    // canvas_base_size = 625;

    const DPR = window.devicePixelRatio ?? 1;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        // canvas.style.width = canvas_smallest + "px";
        // canvas.style.height = canvas_smallest + "px";
    
        // might work, might not
        // if (false) {
        //     ctx.canvas.width = canvas_width * DPR;
        //     ctx.canvas.height = canvas_height * DPR;
        //     ctx.scale(DPR, DPR);
        // } else {
        //     ctx.canvas.width = canvas_width;
        //     ctx.canvas.height = canvas_height;
        // }

        // ctx.imageSmoothingEnabled = false;
    
        // if (vw(100) % 1 == 0) {
        //     canvas.style.marginLeft = "0px";
        // } else {
        //     canvas.style.marginLeft = "0.5px";
        // }

        // canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        // canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        var rect = canvas.getBoundingClientRect();

        canvas_height = rect.height;
        canvas_width = rect.width;

        canvas.width = canvas_width;
        canvas.height = canvas_height;

        canvas_x = rect.x;
        canvas_y = rect.y;
        
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    })

    layers.bg3.ctx.fillStyle = "black";
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
}

function get_canvas_rect() {
    if (!canvas_rect) {
        canvas_rect = layers.front.canvas.getBoundingClientRect();   
    }

    return canvas_rect;
}

function render_diagnostics() {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    let offset = 0;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, offset + 16, "#fff", CANVAS_FONTS, 9
    )

    let frame_times_raw = [render_durations, calc_durations, cleanup_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100);
    })

    let frame_time_splits = frame_times_raw.map(t => {
        return t.toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, offset + 28, "#fff", CANVAS_FONTS, 9
    )

    let total_bar_length = 48;
    let total_time = frame_times_raw[0] + frame_times_raw[1] + frame_times_raw[2] + frame_times_raw[3]
    let bars = [
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[0] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[1] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[2] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[3] / total_time)))
    ]

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw " + " " + "#".repeat(bars[0]), 10, offset + 28+12, "#0f0", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc " + " " + "#".repeat(bars[1]), 10, offset + 28+12+12, "#f00", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "clean" + " " + "#".repeat(bars[2]), 10, offset + 28+12+12+12, "#9bf", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[3] + "wait " + " " + "#".repeat(bars[3]), 10, offset + 28+12+12+12+12, "#666", CANVAS_FONTS, 9
    )
}