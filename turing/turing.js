game_id = "turing";

let display_canvas = null;
let canvas_img = null;
let canvas_img_buff = null;

let canvas_size = 1;

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
    TURING: "turing",
    ET001B: "et001b"
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

        switch (machine_type) {
            case MachineType.ET001B: {
                machine.render_memory_cells(this);
                break;
            }
        }

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
        this.type = "Unknown";
        this.running = true;
    }

    step(board) {
        // do nothing
    }

    static random() {
        return Machine();
    }

    reset() {

    }

    status_string() {
        return "";
    }

    to_url_params() {
        return "";
    }
}

class TuringMachine extends Machine {
    // The Turing Machine interprets the state of the pixel at its head position as an instruction:
    // [state_0_newstate, state_0_symbol_to_write, state_0_movement_direction, state_1_newstate, ...]

    constructor(instructions, num_symbols) {
        super();

        this.type = "turing";

        this.instructions = instructions;

        this.num_symbols = num_symbols;
        this.num_states = Math.floor((instructions.length / 3) / num_symbols);

        this.head_position = new Vector2(0, 0);
        this.state = 0;
    }

    static random(num_states, num_symbols, include_cardinal=true, include_diagonal=false, include_neutral=false) {
        // make states x symbols sets of 3
        // newstate is [0, max_state),
        // symbol_to_write is [1, max_symbol),
        // movement direction is [0, 4) if cardinal, +[4, 8) if diagonal included and +[8] if neutral included
        let dir_choices = [];
        if (include_cardinal) {
            dir_choices = [...dir_choices, ...new Array(4).fill(0).map((_, i) => i)];
        }

        if (include_diagonal) {
            dir_choices = [...dir_choices, ...new Array(4).fill(0).map((_, i) => i+4)];
        }

        if (include_neutral) {
            dir_choices.push(8);
        }

        let instructions = [];

        let num_transitions = num_states * num_symbols;
        for (let i=0; i<num_transitions; i++) {
            instructions.push(random_int(0, num_states));
            instructions.push(random_int(1, num_symbols));
            instructions.push(random_from_array(dir_choices));
        }

        return new TuringMachine(instructions, num_symbols);
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

    reset() {
        this.head_position = new Vector2(0, 0);
        this.state = 0;
    }

    status_string() {
        return `machine_type: turing\nnum_states:  ${this.num_states}\nnum_symbols: ${this.num_symbols-1}`
    }

    to_url_params() {
        return `machine=${this.type}&num_symbols=${this.num_symbols}&instructions=${this.instructions.join(",")}`;
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
            (128 << 24 >>> 0) + (0 << 16) + (0 << 8) + 255,
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
    max_updates_per_interval = Math.max(12.20703125, Math.min(6400000, max_updates_per_interval));

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

function update_avg() {
    let avg = prev_steps_count.reduce((p, c) => p + c, 0) / prev_steps_count.length;
    average_element.textContent = `Actual performance: ${avg.toLocaleString()}`;
    if (avg < max_updates_per_interval-3) {
        average_element.classList.add("darkred");
        average_element.classList.remove("darkgreen");
    } else {
        average_element.classList.remove("darkred");
        average_element.classList.add("darkgreen");
    }
}

function generate_new_random() {
    switch (next_gen_machine_type) {
        case MachineType.TURING:
        default:
            let num_states = Number.parseInt(document.getElementById("turing_num_states").value);
            let num_symbols = Number.parseInt(document.getElementById("turing_num_symbols").value) + 1;

            machine = TuringMachine.random(
                num_states, num_symbols, 
                document.getElementById("turing_dir_cardinal").checked,
                document.getElementById("turing_dir_diagonal").checked,
                document.getElementById("turing_dir_neutral").checked
            );
            break;

        case MachineType.ET001B: {
            let rss = document.getElementById("et001b_register_start_state");
            let mss = document.getElementById("et001b_memory_start_state")

            machine = ET001BMachine.random(
                Number.parseInt(document.getElementById("et001b_num_registers").value),
                Number.parseInt(document.getElementById("et001b_num_symbols").value) + 1,
                Number.parseInt(document.getElementById("et001b_memory_block_size").value),
                Number.parseInt(document.getElementById("et001b_num_instructions").value),
                document.getElementById("et001b_random_seed").value,
                document.getElementById("et001b_muldiv").checked,
                document.getElementById("et001b_incdec").checked,
                document.getElementById("et001b_constantly_increment_registers").checked,
                ET001BMachine.StartState[rss.options[rss.selectedIndex].value],
                ET001BMachine.StartState[mss.options[mss.selectedIndex].value],
            )

            break;
        }
    }

    reset();
}

function reset(update_options=false) {
    machine.reset();
    machine_type = machine.type;

    sim_controller = new SimulationController(
        new Board(new Vector2(canvas_size, canvas_size)), machine, display_canvas, machine.num_symbols
    )

    display_canvas.getContext("2d").clearRect(0, 0, canvas_size, canvas_size);
    
    canvas_img = new ImageData(canvas_size, canvas_size);
    canvas_img_buff = new Uint32Array(canvas_img.data.buffer);

    for (let x=0; x<canvas_size; x++) {
        for (let y=0; y<canvas_size; y++) {
            canvas_img_buff[(y * canvas_size) + x] = sim_controller.palette[0];
        }
    }

    update_status_display();

    if (update_options) {
        update_options_display();
    }

    if (document.getElementById("autoset_url").checked) {
        copy_machine_url(true);
    }
}

function update_status_display() {
    let status_str = machine.status_string();

    document.getElementById("status_display").textContent = status_str;
    document.getElementById("machine_hash").textContent = `Hash: ${get_machine_hash()}`;
}

function update_options_display() {
    switch (machine_type) {
        case MachineType.TURING:
            document.getElementById("turing_num_states").value = machine.num_states
            document.getElementById("turing_num_symbols").value = machine.num_symbols - 1;

            document.getElementById("turing_dir_cardinal").checked = machine.instructions.some((t, i) => i % 3 == 2 && t >= 0 && t < 4),
            document.getElementById("turing_dir_diagonal").checked = machine.instructions.some((t, i) => i % 3 == 2 && t >= 4 && t < 8),
            document.getElementById("turing_dir_neutral").checked = machine.instructions.some((t, i) => i % 3 == 2 && t == 8)
            break;

        case MachineType.ET001B:
            document.getElementById("et001b_register_start_state").selectedIndex = Object.entries(ET001BMachine.StartState).sort((a, b) => a[1] - b[1])[machine.register_start_state][1];
            document.getElementById("et001b_memory_start_state").selectedIndex = Object.entries(ET001BMachine.StartState).sort((a, b) => a[1] - b[1])[machine.memory_start_state][1];

            document.getElementById("et001b_num_registers").value = machine.num_registers;
            document.getElementById("et001b_num_symbols").value = machine.num_symbols - 1;
            document.getElementById("et001b_memory_block_size").value = machine.memory_block_size;
            document.getElementById("et001b_num_instructions").value = machine.instructions.length - machine.additional_instruction_count;
            document.getElementById("et001b_random_seed").value = machine.random_seed;
            document.getElementById("et001b_muldiv").checked = machine.instructions.some(i => i[0] == ET001BMachine.Instruction.MUL || i[0] == ET001BMachine.Instruction.DIV);
            document.getElementById("et001b_incdec").checked = machine.instructions.some(i => i[0] == ET001BMachine.Instruction.INC || i[0] == ET001BMachine.Instruction.DEC);;
            document.getElementById("et001b_constantly_increment_registers").checked = machine.additional_instruction_count > 0;

            break;
    }
}

function copy_machine_url(straight_to_querybar=false) {
    let base = location.toString().replace(location.search, "");

    let full_url = `${base}?${machine.to_url_params()}`;
    
    if (straight_to_querybar) {
        window.history.replaceState(null, "", full_url);
    } else {
        navigator.clipboard.writeText(full_url).then(function() {
            document.getElementById("copy_button").innerHTML = "Copied!";
            document.getElementById("copy_button").classList.add("disabled");
            
            setTimeout(function() {
                document.getElementById("copy_button").innerHTML = "Copy machine URL"
                document.getElementById("copy_button").classList.remove("disabled");
            }, 1500);
        }, function(err) {
            console.error('Failed due to error: ', err);
        });
    }
}

function get_machine_hash() {
    return cyrb128(machine.to_url_params()).map(t => t.toString(16)).join("");
}

function set_selected_machine_type(typ) {
    next_gen_machine_type = typ;

    document.querySelectorAll("#machine_select_buttons>*").forEach(e => {
        if (e.id == `${typ}_select_button`) {
            e.classList.add("selected");
        } else {
            e.classList.remove("selected");
        }
    })

    document.querySelectorAll("#machine_settings_menu>.hideable-tab").forEach(e => {
        if (e.id == `options_${typ}`) {
            e.classList.add("visible");
        } else {
            e.classList.remove("visible");
        }
    })
}

let sim_controller = null;
let t = Date.now();

const original_max_updates = 50000;
let max_updates_per_interval = original_max_updates;

const original_update_batch_size = 10000;
const min_update_batch_size = 3125;

let paused = false;

let update_batch_size = original_update_batch_size;

let max_time_wait = 25;

const url_params = new URLSearchParams(window.location.search);

let machine_type = null;
let next_gen_machine_type = null;

let machine = null;

let prev_steps_count = new Array(10).fill(50000);
let average_element = null;

document.addEventListener("DOMContentLoaded", function(e) {
    display_canvas = document.getElementById("display-canvas");
    canvas_size = display_canvas.width;

    average_element = document.getElementById("speed_display_detailed_avg");
    
    machine_type = url_params.get("machine");

    switch (machine_type) {
        case MachineType.TURING:
            let instructions = url_params.get("instructions");

            if (instructions) {
                let num_symbols = Number.parseInt(url_params.get("num_symbols"));
                let instructions_parsed = instructions.replaceAll(" ", "").split(",").map(t => Number.parseInt(t));
                machine = new TuringMachine(instructions_parsed, num_symbols);
            }
            break;

        case MachineType.ET001B: {
            let instructions = url_params.get("instructions");

            if (instructions) {
                let num_registers = Number.parseInt(url_params.get("num_registers"));
                let num_symbols = Number.parseInt(url_params.get("num_symbols"));
                let memory_block_size = Number.parseInt(url_params.get("memory_block_size"));
                let random_seed = url_params.get("random_seed");
                let instructions_parsed = ET001BMachine.parse_string(url_params.get("instructions"));
                let additional_instruction_count = Number.parseInt(url_params.get("additional_instruction_count"));

                let register_start_state = Number.parseInt(url_params.get("register_start_state"));
                let memory_start_state = Number.parseInt(url_params.get("memory_start_state"));

                machine = new ET001BMachine(
                    num_registers, num_symbols, memory_block_size, instructions_parsed, additional_instruction_count, random_seed, register_start_state, memory_start_state
                )
            }

            break;
        }

        default:
            if (machine_type) {
                alert(`Unrecognised machine type (${machine_type})`);
            }
            break;
    }

    if (!machine) {
        // load the default demo machine
        let instructions = "1,1,3,3,3,0,3,1,2,2,3,0,2,2,1,3,3,1,2,3,0,3,3,2,0,1,0,3,3,2,3,2,1,0,1,0,1,2,1,1,2,2,2,3,3,2,1,0";
        let num_symbols = 4;
        let instructions_parsed = instructions.replaceAll(" ", "").split(",").map(t => Number.parseInt(t));
        machine = new TuringMachine(instructions_parsed, num_symbols);
    }

    machine_type = machine.type;
    set_selected_machine_type(machine_type);

    reset(true);

    update_sim_speed_display();

    frame_fn = function() {
        if (!paused && machine.running) {
            try {
                let start_time = Date.now();

                let num_updates = 0;
                while (Date.now() - start_time < max_time_wait && num_updates < max_updates_per_interval-1) {
                    sim_controller.step(update_batch_size);
                    num_updates += update_batch_size
                }

                prev_steps_count.push(num_updates);
                prev_steps_count.shift();
            } catch (e) {
                machine.running = false;
            }
    
            sim_controller.board.render(sim_controller.canvas, sim_controller.palette);
        }

        update_avg();
        window.requestAnimationFrame(frame_fn);
    };

    frame_fn();
});
