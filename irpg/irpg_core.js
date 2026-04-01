game_id = "irpg";

const FILES_PREFIX = "";

const GAME_VERSION = "18/03/2026";

const layer_names = [
    "front",
    "debug_front",
    "debug_back",
    "ui1",
    "ui2",
    "ui3",
    "ui4",
    "fg1",
    "fg2_raster",
    "fg2",
    "fg3",
    "bg1",
    "bg2",
    "bg3"
]

let imgs = {};

const local = window.location.href.startsWith("file://");

const prerender_canvas = document.getElementById("hidden-prerender-canvas");
const prerender_ctx = prerender_canvas.getContext("2d");

const CANVAS_FONTS = "MS Gothic, terminus, Roboto Mono, monospace";

let num_textures_loaded = 0;
let num_textures_needed = 0;

let view_offset = new Vector2(0, 0);
let zoom_level = 1;

let screen_scaling_factor = 1;
let true_zoom_level = 1;
let stwp = v => Vector2.zero;
let wtsp = v => Vector2.zero;

function refresh_wtsp_stwp() {
    screen_scaling_factor = canvas_width / board.size.x;
    true_zoom_level = zoom_level * screen_scaling_factor;

    wtsp = vec => vec.add(view_offset).mul(true_zoom_level);
    stwp = vec => vec.div(true_zoom_level).sub(view_offset);
}

const entity_sprites = new Map([
    ["rock", 1, "graphic/"],
].map((v, i) => {
    let ts = [];

    if (v[1] > 1) {
        for (let i=0; i<v[1]; i++) {
            let t = new Image();
            t.src = `${FILES_PREFIX}img/${v[2]}${v[0]}_${i.toString().padStart(3, "0")}.png`;
            t.style.imageRendering = "pixelated";

            num_textures_needed++;

            if (v[3]) {
                let e = false;
                t.addEventListener("error", function() {
                    if (!e) {
                        t.src = `${FILES_PREFIX}img/icons/unknown.png`;
                        e = true;
                    }
                })
            }

            ts.push(t);
        }
    } else {
        let t = new Image();
        t.src = `${FILES_PREFIX}img/${v[2]}/${v[0]}.png`;
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        if (v[3]) {
            let e = false;
            t.addEventListener("error", function() {
                if (!e) {
                    t.src = `${FILES_PREFIX}img/icons/unknown.png`;
                    e = true;
                }
            })
        }

        ts.push(t);
    }

    return [v[0], ts]
}));

let fps_current = 0;

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
let game_position = new Vector2(0, 0);

let screen_to_game_scaling_factor = 1;

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();
let framecount = 0;

let audios_list = [
    // ultrakill
    ["parry", 'snd/parry.mp3'],
]


let titles = [
    "", "", "Winter Morning"
]

if (new URLSearchParams(window.location.search).get("nomusic") !== "true") {
    for (let i=2; i<=2; i++) {
        audios_list.push([`2048_${i}`, `https://scrimblo.foundation/uploads/2048_${i}.mp3`, titles[i], "2048 (3DS)", true]);
    }
}

if (new URLSearchParams(window.location.search).get("noaudio") == "true") {
    audios_list = [];
}

let audios_required = audios_list.length;
let audios_loaded = 0;

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
    // size of window, with 8vw clearance on l/r,
    // 8vh on top, 16vh on bottom
    const DPR = window.devicePixelRatio ?? 1;

    canvas_width = vw(100 - 8);
    canvas_height = vh(100 - 16, true);
    
    // if canvas_width is > 16:9, limit it
    canvas_width = Math.min(canvas_height * (16/9), canvas_width)

    // same for canvas_height but other way round
    canvas_height = Math.min(canvas_width * (16/9), canvas_height)

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        // might work, might not
        if (true) {
            ctx.canvas.width = canvas_width * DPR;
            ctx.canvas.height = canvas_height * DPR;
            ctx.scale(DPR, DPR);
        }

        ctx.imageSmoothingEnabled = false;

        canvas.style.left = ((vw(100) - canvas_width) / 2) + "px"
        canvas.style.top = (vh(8, true) + ((vh(84, true) - canvas_height) / 2)) + "px"
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    document.querySelectorAll(".behind-canvases").forEach(elem => { if (!elem.classList.contains("popup")) { elem.style.width = canvas_smallest + "px" } else { elem.style.setProperty("--siz", canvas_smallest + "px") } });
    document.querySelectorAll(".behind-canvases").forEach(elem => { if (!elem.classList.contains("popup")) { elem.style.height = canvas_smallest + "px" } else { elem.style.setProperty("--siz", canvas_smallest + "px") } });

    layers.bg3.ctx.fillStyle = "black";
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);

    need_stwp_recache = true;
}

function render_diagnostics() {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    let offset = 0

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, offset + 16, "#fff", CANVAS_FONTS, 9
    )

    let frame_times_raw = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100);
    })

    let frame_time_splits = frame_times_raw.map(t => {
        return t.toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, offset + 28, "#fff", CANVAS_FONTS, 9
    )

    let total_bar_length = 48;
    let total_time = frame_times_raw[0] + frame_times_raw[1] + frame_times_raw[2]
    let bars = [
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[0] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[1] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[2] / total_time)))
    ]

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw" + " " + "#".repeat(bars[0]), 10, offset + 28+12, "#0f0", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc" + " " + "#".repeat(bars[1]), 10, offset + 28+12+12, "#f00", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait" + " " + "#".repeat(bars[2]), 10, offset + 28+12+12+12, "#666", CANVAS_FONTS, 9
    )
}

let last_frame = Date.now();
let last_frame_start = 0;

function game_loop() {
    framecount++;

    // discard any frames 50ms or longer for fps calcs (likely anomalous)
    let filtered_frame_times = last_frame_times.filter(f => f < 50);
    let avg_frame_time = filtered_frame_times.reduce((a, b) => a + b, 0) / filtered_frame_times.length;
    fps_current = 1000/avg_frame_time;

    let frame_start_time = Date.now();

    render_diagnostics();
    
    let render_end_time = Date.now();

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    // clean up old audio
    audio_playing = audio_playing.filter(audio => !audio.ended);

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
    last_frame_start = frame_start_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // next frame should arrive (1000/fps) ms later, so get the time left and compare it with the end time
    let expected_next_frame = frame_start_time + (1000/fps_current);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    window.requestAnimationFrame(game_loop);
}

document.addEventListener("DOMContentLoaded", async function() {
    await load_audio();
})

document.addEventListener("DOMContentLoaded", function() {
    get_canvases()

    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    layers.front.canvas.addEventListener("mousemove", function(event) {
        let rect = layers.front.canvas.getBoundingClientRect();
        
        canvas_x = rect.x;
        canvas_y = rect.y;

        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
        
        game_position = mouse_position.mul(screen_to_game_scaling_factor * window.devicePixelRatio);
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

    let interval = setInterval(function() {
        if (!entity_sprites)
            return;

        num_textures_loaded = [...entity_sprites.keys()].reduce((p, c) => {
            let loaded = entity_sprites.get(c).reduce((pt, ct) => {
                return pt + (ct.complete && ct.naturalWidth !== 0 ? 1 : 0);
            }, 0)
            
            return p + loaded;
        }, 0)

        audios_loaded = audios_list.reduce((p,c) => p + (audio.get(c[0]) ? 1 : 0), 0)

        if (document.querySelector("#graphics_loading")) {
            document.querySelector("#graphics_loading").textContent = `${num_textures_loaded}/${num_textures_needed}`;
            document.querySelector("#audios_loading").textContent = `${audios_loaded}/${audios_required}`;
            if (audios_loaded >= audios_required && num_textures_loaded >= num_textures_needed) {
                document.querySelector("#loading_prompt").classList.add("hidden");
                document.querySelectorAll(".enable-on-full-load").forEach(e => e.disabled = false);
            }
        }

        handle_resize();

        if (audios_loaded >= audios_required && num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.visibility = "";
            clearInterval(interval);
            
            handle_resize();
            game_loop();
        }
    }, 50)

    window.addEventListener("resize", handle_resize);
});
