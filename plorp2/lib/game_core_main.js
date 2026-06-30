let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let cleanup_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();
let framecount = 0;

let fps_current = 0;

let fully_loaded = false;
let loading_checker_interval = null;

// Override these in the game script
let handlers = {
    render_fn: () => null,
    calc_fn: () => null,
    game_preload_fn: () => null,
    game_postload_fn: () => null,
}

let rendering_diagnostics = false;

let keys_down = {};
let keys_pressed_this_frame = {};

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let mouse_position = new Vector2(0, 0);

function game_loop() {
    framecount++;

    // ---- render step
    let frame_start_time = Date.now();

    if (rendering_diagnostics) {
        render_diagnostics();
    }

    handlers.render_fn();

    let render_end_time = Date.now();

    // ---- calculation step
    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    handlers.calc_fn(delta_time / 1000);
    keys_pressed_this_frame = {};

    let calc_end_time = Date.now();

    // ---- cleanup step
    let cleanup_start_time = Date.now();
    
    // cleanup audios
    audio_playing = cleanup_finished_audio();

    // push diagnostic info
    time_deltas.push(delta_time);
    time_deltas = time_deltas.slice(-120);

    render_durations.push(render_end_time - frame_start_time);
    render_durations = render_durations.slice(-120);

    calc_durations.push(calc_end_time - calc_start_time);
    calc_durations = calc_durations.slice(-120);

    // calc fps
    // discard any frames 50ms or longer for fps calcs (likely anomalous)
    let filtered_frame_times = last_frame_times.filter(f => f < 50);
    let avg_frame_time = filtered_frame_times.reduce((a, b) => a + b, 0) / filtered_frame_times.length;
    fps_current = 1000 / avg_frame_time;

    let cleanup_end_time = Date.now();

    // ---- final accounting
    cleanup_durations.push(cleanup_end_time - cleanup_start_time);
    cleanup_durations = calc_durations.slice(-120);

    // next frame
    let frame_end_time = Date.now();
    let time_since_last_frame = frame_end_time - last_frame_time;
    last_frame_time = frame_end_time;
    last_frame_start = frame_start_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    let expected_next_frame = frame_start_time + (1000 / fps_current);
    let time_to_wait = Math.max(0, expected_next_frame - last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    last_frame_time = frame_start_time;

    window.requestAnimationFrame(game_loop);
}

function loader_wait_interval() {
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
        document.getElementById("game-container").style.display = "";
        document.querySelector("#loading_reminder_text").style.display = "none";
        clearInterval(loading_checker_interval);
        
        fully_loaded = true;

        handle_resize();
        handlers.game_postload_fn();
        game_loop();
    }
}

function setup_input() {
    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mousemove", function(event) {
        let rect = get_canvas_rect();
        
        canvas_x = rect.x;
        canvas_y = rect.y;

        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
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

        if (!keys_down[code]) {
            keys_pressed_this_frame[code] = true;
        }

        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_pressed_this_frame[code] = false;
        keys_down[code] = false;
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    await load_audio();
});

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();
    window.addEventListener("resize", handle_resize);

    setup_input();
    
    loading_checker_interval = setInterval(loader_wait_interval, 50);

    handlers.game_preload_fn();
});