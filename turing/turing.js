game_id = "turing";

let display_canvas = null;
let canvas_img = null;
let canvas_img_buff = null;

let canvas_size = 512;

const movement_vectors = [
    new Vector2(1, 0),    // R
    new Vector2(-1, 0),   // L
    new Vector2(0, -1),   // U
    new Vector2(0, 1),    // D
    new Vector2(-1, -1),  // UL
    new Vector2(1, -1),   // UR
    new Vector2(1, 1),    // DR
    new Vector2(-1, 1),   // DL
    new Vector2(0, 0)     // N
]

const MachineType = {
    TURING: "turing"
}

class Board {
    constructor(dimensions) {
        this.dimensions = dimensions;

        this.grid = new Uint32Array(dimensions.x * dimensions.y).fill(0);

        this.changes = new Set();
    }

    get(x, y) {
        return this.grid[(y * this.dimensions.y) + x];
    }

    set(x, y, to) {
        let idx = (y * this.dimensions.y) + x;
        if (this.grid[idx] != to || true) {
            this.grid[idx] = to;
            
            this.changes.add(idx);
        }
    }

    render(to_canvas, palette) {
        let ctx = to_canvas.getContext("2d");

        // draw all the changes to the board since last render, then clear the changes list
        this.changes.forEach(change => {
            canvas_img_buff[change] = palette[this.grid[change]]
        });

        ctx.putImageData(canvas_img, 0, 0);

        this.changes.clear();
    }
}

class Machine {
    constructor() {
        
    }

    step(board) {
        // do nothing
    }
}

class TuringMachine extends Machine {
    // The Turing Machine interprets the state of the pixel at its head position as an instruction:
    // [state_0_newstate, state_0_symbol_to_write, state_0_movement_direction, state_1_newstate, ...]

    constructor(instructions, num_symbols) {
        super();

        this.instructions = instructions;

        this.num_symbols = num_symbols;
        this.num_states = Math.floor((instructions.length / 3) / num_symbols);

        this.head_position = new Vector2(0, 0);
        this.state = 0;
    }

    mod_x(by) {
        this.head_position.x = (this.head_position.x + by) % canvas_size;
        if (this.head_position.x < 0) {
            this.head_position.x += canvas_size;
        }
    }

    mod_y(by) {
        this.head_position.y = (this.head_position.y + by) % canvas_size;
        if (this.head_position.y < 0) {
            this.head_position.y += canvas_size;
        }
    }

    step(board) {
        let pos_f = board.get(this.head_position.x, this.head_position.y);
        let state_f = this.state;

        let state_idx = ((pos_f * this.num_states) + state_f) * 3;

        let new_state = this.instructions[state_idx + 0];
        let symbol_write = this.instructions[state_idx + 1];
        let mov_dir = this.instructions[state_idx + 2];

        this.state = new_state;

        board.set(this.head_position.x, this.head_position.y, symbol_write);

        let vec = movement_vectors[mov_dir];
        this.mod_x(vec.x);
        this.mod_y(vec.y);
    }
}

class SimulationController {
    constructor(board, machine, canvas, num_symbols, prewarm_steps=0) {
        this.board = board;
        this.machine = machine;
        this.canvas = canvas;

        // precalculate colours here
        this.num_symbols = num_symbols;

        this.palette = [
            (255 << 24 >>> 0) + (0 << 16) + (0 << 8) + 255,
            (0 << 24 >>> 0) + (0 << 16) + (0 << 8) + 255,
            (255 << 24 >>> 0) + (255 << 16) + (255 << 8) + 255
        ];
        let num_new_symbols_needed = this.num_symbols - 3 + 1;
        for (let i=1; i<num_new_symbols_needed; i++) {
            // rotate hsv
            // console.log(i / num_new_symbols_needed);
            let rgb = hsvToRgb(i / num_new_symbols_needed, 1, 1);
            rgb[3] = 255;
            // console.log(rgb);

            this.palette.push((rgb[3] << 24 >>> 0) + (rgb[2] << 16) + (rgb[1] << 8) + (rgb[0] << 1));
        }

        this.sim_steps = 0;

        this.prewarm_steps = prewarm_steps;

        if (this.prewarm_steps) {
            for (let i=0; i<this.prewarm_steps; i++) {
                this.machine.step(this.board);
            }
        }
    }

    step(n_repeats) {
        for (let i=0; i<n_repeats; i++) {
            this.machine.step(this.board);
        }

        this.sim_steps++;
    }
}

function mod_simulation_speed(event, mul) {
    // console.log(event);
    if (event && event.shiftKey) {
        mul = (mul - 1) * Number.POSITIVE_INFINITY;
    }

    max_updates_per_interval *= mul;
    max_updates_per_interval = Math.max(1562.5, Math.min(6400000, max_updates_per_interval));

    update_sim_speed_display();
}

function reset_simulation_speed() {
    max_updates_per_interval = original_max_updates;
    update_sim_speed_display();
}

function update_sim_speed_display() {
    update_batch_size = Math.floor(Math.min(max_updates_per_interval, Math.max(min_update_batch_size, max_updates_per_interval / (original_max_updates / original_update_batch_size))));

    if (paused) {
        document.getElementById("speed_display").textContent = `- Paused -`;
    } else {
        document.getElementById("speed_display").textContent = `${max_updates_per_interval / original_max_updates}x`;
    }

    document.getElementById("speed_display_detailed").textContent = `${Math.floor(max_updates_per_interval).toLocaleString()} steps / ${max_time_wait}ms (${update_batch_size.toLocaleString()} per batch)`;
}

let sim_controller = null;
let t = Date.now();

const original_max_updates = 50000;
let max_updates_per_interval = original_max_updates;

const original_update_batch_size = 10000;
const min_update_batch_size = 5000;

let paused = false;

let update_batch_size = original_update_batch_size;

let max_time_wait = 25;

const url_params = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", function(e) {
    display_canvas = document.getElementById("display-canvas");

    canvas_img = new ImageData(canvas_size, canvas_size);
    canvas_img_buff = new Uint32Array(canvas_img.data.buffer);

    let machine_type = url_params.get("machine");
    let instructions = url_params.get("instructions");
    let num_symbols = Number.parseInt(url_params.get("num_symbols"));

    switch (machine_type) {
        case MachineType.TURING:
            let instructions_parsed = instructions.replaceAll(" ", "").split(",").map(t => Number.parseInt(t));

            sim_controller = new SimulationController(
                new Board(new Vector2(canvas_size, canvas_size)),
                new TuringMachine(instructions_parsed, num_symbols),
                display_canvas, num_symbols
            )
            break;

        default:
            alert(`Unrecognised machine type (${machine_type})`);
            break;
    }

    update_sim_speed_display();

    frame_fn = function() {
        if (!paused) {
            let start_time = Date.now();

            let num_updates = 0;
            while (Date.now() - start_time < max_time_wait && num_updates < max_updates_per_interval) {
                sim_controller.step(update_batch_size);
                num_updates += update_batch_size
            }
    
            sim_controller.board.render(sim_controller.canvas, sim_controller.palette);
        }

        window.requestAnimationFrame(frame_fn);
    };

    frame_fn();
});
