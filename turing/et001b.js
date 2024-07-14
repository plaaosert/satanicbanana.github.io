// The ET001B was a cutting-edge CPU released in 2002 by SNTL Corporation.
// Far superior to its competitors at the time, it quickly catapulted SNTL and the then-launched ETERNA project to newfound fame with... just kidding.

class ET001BMachine extends Machine {
    static Instruction = {
        // instructions targeting registers will be hardcoded (e.g. "r2", remember r0 is the PC)
        // instructions targeting memory will use a specific register's value as the memory address (e.g. "m2" gets the value in r2 and uses it to address memory)
        // instructions can also target a constant ("c938"); constants are valid only in "read" operand locations. "write" will be ignored
        // all methods are always valid in any operation that takes a value
        ADD: "0",  // ADD t1 t2 r
        SUB: "1",  // SUB t1 t2 r
        CPY: "2",  // CPY t r
        CLR: "3",  // CLR r
        BRA: "4",  // BRA n
        BRZ: "5",  // BRZ t n
        BRP: "6",  // BRP t n
        BRN: "7",  // BRN t n
        MUL: "8",  // MUL t1 t2 r
        DIV: "9",  // DIV t1 t2 r
        INC: "A",  // INC r
        DEC: "B",  // DEC r
    }

    static DataSource = {
        REGISTER: "r",
        MEMORYADDR: "m",
        MEMORYCONST: "a",
        CONSTANT: "c",
    }

    static StartState = {
        ZERO: 0,
        ONE: 1,
        RANDOM: 2
    }

    static parse_string(instructions) {
        let instructions_strings = instructions.split(";");

        return instructions_strings.map(s => {
            let opcode = s.slice(0, 1);
            let operands = s.slice(1).split("~").map(t => [t.slice(0, 1), Number.parseInt(t.slice(1))]);

            return [opcode, operands];
        })
    }

    static random(num_registers, num_symbols, memory_block_size, num_instructions, random_seed, muldiv=true, incdec=true, constantly_increment_registers=false, register_start_state=ET001BMachine.StartState.ZERO, memory_start_state=ET001BMachine.StartState.ZERO) {
        // generate instructions for the cpu.
        let instruction_param_count = [
            [0.299, "ADD", [1, 1, 0]],
            [0.12, "SUB", [1, 1, 0]],
            [0.1, "CPY", [1, 0]],
            [0.06, "CLR", [0]],
            [0.002, "BRA", [1]],  // previously 0.0025
            [0.006, "BRZ", [0, 1]],  // previously 0.0025
            [0.004, "BRP", [0, 1]],  // previously 0.01
            [0.004, "BRN", [0, 1]],  // previously 0.01
            [0.18, "MUL", [1, 1, 0]],  // might want to make MUL/DIV optional (just have MUL become ADD and DIV become SUB)
            [0.075, "DIV", [1, 1, 0]],
            [0.075, "INC", [0]],
            [0.075, "DEC", [0]],
        ];

        let sum_weights = Math.round(instruction_param_count.reduce((p, c) => p + c[0], 0) * 1000) / 1000;
        if (sum_weights != 1) {
            alert(`Sum of instruction weights not =1 (${sum_weights})`);
        }

        let memory_grid_size = canvas_size / Math.pow(2, memory_block_size-1);
        let data_source_bounds_all = [
            [0.3, "r", 1, num_registers + 1],
            [0.4, "m", 0, num_registers + 1],
            [0.1, "a", 0, memory_grid_size * memory_grid_size],
            [0.2, "c", 0, "special"],
        ];

        let data_source_bounds_no_c = [
            [0.4, "r", 1, num_registers + 1],
            [0.5, "m", 0, num_registers + 1],
            [0.1, "a", 0, memory_grid_size * memory_grid_size],
            [0, "c", 0, "special"],
        ];

        // multiple "bands"
        let bands = [
            [0.2, 0, 2],
            [0.4, 0, 10],
            [0.2, 10, 100],
            [0.1, 100, 1000],
            [0.1, 1000, 10000]
        ]

        let instructions = [];

        if (constantly_increment_registers) {
            for (let i=0; i<num_registers; i++) {
                instructions.push([ET001BMachine.Instruction.ADD, [["r", i+1], ["c", 1], ["r", i+1]]]);
            }
        }

        for (let i=0; i<num_instructions; i++) {
            let opcode = weighted_random_from_arr(instruction_param_count);
            
            let opcode_v = opcode[1];
            if (!muldiv) {
                if (opcode_v == "MUL") {
                    opcode = instruction_param_count[0];
                } else if (opcode_v == "DIV") {
                    opcode = instruction_param_count[1];
                }
            }

            if (!incdec) {
                if (opcode_v == "INC") {
                    opcode = instruction_param_count[0];
                } else if (opcode_v == "DEC") {
                    opcode = instruction_param_count[1];
                }
            }

            let instruction = [ET001BMachine.Instruction[opcode[1]], []];
            for (let j=0; j<opcode[2].length; j++) {
                let data_source = weighted_random_from_arr(opcode[2][j] ? data_source_bounds_all : data_source_bounds_no_c);

                if (data_source[3] == "special") {
                    let band = weighted_random_from_arr(bands);
                    data_source[3] = random_int(band[1], band[2]);
                    data_source[2]++;
                }

                let val = random_int(data_source[2], data_source[3]);

                instruction[1].push([data_source[1], val]);
            }

            instructions.push(instruction);
        }

        return new ET001BMachine(
            num_registers, num_symbols, memory_block_size, instructions, constantly_increment_registers ? num_registers : 0, random_seed, register_start_state, memory_start_state
        );
    }

    constructor(num_registers, num_symbols, memory_block_size, instructions, additional_instruction_count, random_seed, register_start_state=ET001BMachine.StartState.ZERO, memory_start_state=ET001BMachine.StartState.ZERO) {
        super();

        this.type = "et001b";

        // the PC is also a register (index 0)
        // registers are the size required to represent the entire block space in memory (so, at size 1, 512*512, at size 4, 64*64),
        // or the size of a single block of memory, whichever is higher.
        this.num_registers = num_registers;
        this.num_symbols = num_symbols;
        this.memory_block_size = memory_block_size;

        this.memory_block_factor = Math.pow(2, memory_block_size-1);

        this.memory_grid_size = canvas_size / this.memory_block_factor
        this.memory_grid_num_pixels = this.memory_block_factor * this.memory_block_factor;

        this.memory_block_max_val = Math.pow(num_symbols-1, this.memory_grid_num_pixels);

        this.register_max_val = Math.max(this.memory_block_max_val, (this.memory_grid_size * this.memory_grid_size * 2))

        this.register_start_state = register_start_state;
        this.memory_start_state = memory_start_state;

        this.registers = new Array(num_registers + 1).fill(0);
        this.memory = new Array(this.memory_grid_size * this.memory_grid_size).fill(0);

        this.random_seed = random_seed;
        this.random = get_seeded_randomiser(random_seed);

        this.reset();

        this.memory_len = this.memory.length;

        // [ [operator, [[src1, addr1], ...]] ]
        this.instructions = instructions;
        this.instructions_length = instructions.length;
        this.additional_instruction_count = additional_instruction_count;
    }

    instructions_as_string() {
        // instruction looks like "XXXV1~V2"
        // instructions are delimited by semicolons:
        // "ADDr2~r4~m3;CLRm4;CLRm2" => "ADD r2 r4 m3 // CLR m4 // CLR m2"
        return this.instructions.map(ins => `${ins[0]}${ins[1].map(o => o.join("")).join("~")}`).join(";")
    }

    step(board) {
        // make sure ovf on pc is right
        this.registers[0] = this.ovf(this.registers[0], this.instructions_length);

        // read the instruction at the current PC value
        let pc = this.registers[0];
        let instruction = this.instructions[pc];
        if (!instruction) {
            // something went weird (WHY MUST INFORMATION BE LIMITED), reset the pc
            this.registers[0] = 0;
            return;
        }

        let opcode = instruction[0];
        let operands = instruction[1];
        
        switch (opcode) {
            case ET001BMachine.Instruction.ADD: {
                this.set_val(
                    operands[2][0], operands[2][1],
                    this.get_val(operands[0][0], operands[0][1]) + this.get_val(operands[1][0], operands[1][1])
                )

                break;
            }

            case ET001BMachine.Instruction.SUB: {
                this.set_val(
                    operands[2][0], operands[2][1],
                    this.get_val(operands[0][0], operands[0][1]) - this.get_val(operands[1][0], operands[1][1])
                )

                break;
            }

            case ET001BMachine.Instruction.MUL: {
                this.set_val(
                    operands[2][0], operands[2][1],
                    this.get_val(operands[0][0], operands[0][1]) * this.get_val(operands[1][0], operands[1][1])
                )

                break;
            }

            case ET001BMachine.Instruction.DIV: {
                let divisor = this.get_val(operands[1][0], operands[1][1]);

                if (divisor != 0) {
                    this.set_val(
                        operands[2][0], operands[2][1],
                        Math.floor(this.get_val(operands[0][0], operands[0][1]) / divisor)
                    )
                } else {
                    this.set_val(
                        operands[2][0], operands[2][1], 0
                    )
                }

                break;
            }

            case ET001BMachine.Instruction.INC: {
                this.set_val(
                    operands[0][0], operands[0][1],
                    this.get_val(operands[0][0], operands[0][1]) + 1
                )

                break;
            }

            case ET001BMachine.Instruction.DEC: {
                this.set_val(
                    operands[0][0], operands[0][1],
                    this.get_val(operands[0][0], operands[0][1]) - 1
                )

                break;
            }

            case ET001BMachine.Instruction.CPY: {
                this.set_val(
                    operands[1][0], operands[1][1],
                    this.get_val(operands[0][0], operands[0][1])
                )
                
                break;
            }

            case ET001BMachine.Instruction.CLR: {
                this.set_val(
                    operands[0][0], operands[0][1], 0
                )

                break;
            }

            case ET001BMachine.Instruction.BRA: {
                this.set_val(
                    "r", 0, this.get_val(operands[0][0], operands[0][1]), true
                )

                break;
            }

            case ET001BMachine.Instruction.BRZ: {
                let test_value = this.get_val(operands[0][0], operands[0][1])
                if (test_value == 0) {
                    this.set_val(
                        "r", 0, this.get_val(operands[1][0], operands[1][1]), true
                    )
                }

                break;
            }

            case ET001BMachine.Instruction.BRP: {
                let test_value = this.get_val(operands[0][0], operands[0][1])
                if (test_value > 0) {
                    this.set_val(
                        "r", 0, this.get_val(operands[1][0], operands[1][1]), true
                    )
                }

                break;
            }

            case ET001BMachine.Instruction.BRN: {
                let test_value = this.get_val(operands[0][0], operands[0][1])
                if (test_value < 0) {
                    this.set_val(
                        "r", 0, this.get_val(operands[1][0], operands[1][1]), true
                    )
                }

                break;
            }
        }

        // increment pc
        this.registers[0]++;
    }

    reset() {
        this.random = get_seeded_randomiser(this.random_seed);

        let r = (state, max_size) => {
            switch (state) {
                case ET001BMachine.StartState.ZERO: {
                    return 0;
                }

                case ET001BMachine.StartState.ONE: {
                    return 1;
                }

                case ET001BMachine.StartState.RANDOM: {
                    return Math.floor(this.random() * max_size);
                }
            }
        }

        this.registers = new Array(this.num_registers + 1).fill(0).map(_ => r(this.register_start_state, this.register_max_val));
        this.memory = new Array(this.memory_grid_size * this.memory_grid_size).fill(0).map(_ => r(this.memory_start_state, this.memory_block_max_val));
    }

    status_string() {
        return `machine_type:      et0018\nnum_registers:     ${this.num_registers}\nnum_symbols:       ${this.num_symbols-1}\nmemory_block_size: ${this.memory_block_size}`
    }

    to_url_params() {
        return `machine=${this.type}&num_registers=${this.num_registers}&num_symbols=${this.num_symbols}&memory_block_size=${this.memory_block_size}&random_seed=${this.random_seed}&register_start_state=${this.register_start_state}&memory_start_state=${this.memory_start_state}&additional_instruction_count=${this.additional_instruction_count}&instructions=${this.instructions_as_string()}`;
    }

    get_val(source, addr) {
        switch (source) {
            case ET001BMachine.DataSource.REGISTER:
                return this.registers[this.ovf(addr, this.num_registers+1)];

            case ET001BMachine.DataSource.MEMORYADDR:
                return this.memory[this.ovf(this.registers[this.ovf(addr, this.num_registers+1)], this.memory_len)];

            case ET001BMachine.DataSource.MEMORYCONST:
                return this.memory[this.ovf(addr, this.memory_len)];

            case ET001BMachine.DataSource.CONSTANT:
                return addr;
        }
    }

    set_val(source, addr, to, authorised_change_pc=false) {
        switch (source) {
            case ET001BMachine.DataSource.REGISTER:
                let reg = this.ovf(addr, this.num_registers+1);
                if (reg == 0 && !authorised_change_pc) {
                    return;
                }

                this.registers[
                    reg
                ] = this.ovf(to, this.register_max_val);
                break;

            case ET001BMachine.DataSource.MEMORYADDR: {
                let memory_addr = this.ovf(this.registers[
                    this.ovf(addr, this.num_registers+1)
                ], this.memory_len);

                this.memory[memory_addr] = this.ovf(to, this.memory_block_max_val);
                break;
            }

            case ET001BMachine.DataSource.MEMORYCONST: {
                let memory_addr = this.ovf(addr, this.memory_len)

                this.memory[memory_addr] = this.ovf(to, this.memory_block_max_val);
                break;
            }

            case ET001BMachine.DataSource.CONSTANT:
                return;
        }
    }

    render_memory_cells(board) {
        for (let i=0; i<this.memory_len; i++) {
            this.render_memory_cell(board, i);
        }
    }

    render_memory_cell(board, addr) {
        // TODO i think it works but not sure

        let x = addr % this.memory_grid_size;
        let y = Math.floor((addr - x) / this.memory_grid_size);

        let canvas_x = x * this.memory_block_factor;
        let canvas_y = y * this.memory_block_factor;

        let val = this.memory[addr];

        for (let t=this.memory_grid_num_pixels-1; t>=0; t--) {
            let xt = t % this.memory_block_factor;
            let yt = Math.floor((t - xt) / this.memory_block_factor);

            // get the highest value of the symbol that leaves val positive
            let factor = Math.pow(this.num_symbols-1, t);
            let max_factor = Math.max(0, Math.min(this.num_symbols-2, Math.floor(val / factor)));

            board.set(canvas_x + xt, canvas_y + yt, max_factor+1);
            val -= max_factor * factor;
        }
    }

    ovf(original, max_size) {
        let overflow_val = original;

        let factor = (overflow_val / max_size);
        if (factor >= 0 && factor < 1) {
            return overflow_val;
        }

        if (factor < 0) {
            overflow_val += max_size * Math.ceil(Math.abs(factor));
        } else {
            overflow_val -= max_size * Math.floor(Math.abs(factor));
        }

        if (isNaN(overflow_val)) {
            throw EvalError("lmao something went wrong");
        }

        if (overflow_val < 0) {
            overflow_val = 0;
        }

        if (overflow_val > max_size) {
            overflow_val = max_size-1;
        }

        return overflow_val;
    }
}