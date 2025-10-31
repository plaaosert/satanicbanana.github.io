game_id = "reactor";

/*
react funny particles together in a reactor.

reactor frame is a 4x4 (by default) grid, with particles inside. the goal is to gain as much power as possible in a round.
reactor operation methods can vary wildly; they are similar only in that they will repeat until no particles remain. they can be chosen at the start of a run. for example:
Hotspot - go from right-to-left, top to bottom, activate each particle in each position then destroy the particle in that position
Gravity Kiln - go from right-to-left, activating each particle on the bottom of the frame, moving all particles down, then destroying each particle on the bottom of the frame, then moving down again

particles have a set of abilities that do stuff on certain triggers. abilities can do anything!!
particle rarity (generally) dictates what a particle can do:
Fundamental - basic, common
Composite - uncommon, usually more powerful/complex
Exotic - rare and usually build-defining particles

particle type dictates what kind of effect a particle has:
Particle - "normal" - usually strictly positive
Antiparticle - usually mostly negative with a conditional very positive effect, or positive with a knock-on negative effect
Quasiparticle - breaks the rules of the game, usually rarer

each particle has two values, x (blue) and y (red), which interact with the particle type. for example:

Metastatic Matter (Θ)
[Fundamental]
[Particle]

-> Activated
Double this particle's x value.

-> Destroyed
Generate power equal to x*y.
*/

const FRAME_WIDTH = 4;
const FRAME_HEIGHT = 4;
const MAX_INDEX = (FRAME_WIDTH*FRAME_HEIGHT) - 1;

// inner width (outside is 7x13)
const CELL_HEIGHT = 5;
const CELL_WIDTH = 11;

function vector_to_index(v) {
    return xy_to_index(v.x, v.y);
}

function xy_to_index(x, y) {
    return x + (y * FRAME_WIDTH);
}

function index_to_xy(index) {
    return [(index % FRAME_WIDTH), Math.floor(index / FRAME_WIDTH)];
}

function index_to_vector(index) {
    return new Vector2(...index_to_xy(index));
}

function xy_to_vector(x, y) {
    return new Vector2(x, y);
}

function get_cell_element(index) {
    return [...document.querySelectorAll(".reactor .cell")][index];
}

const ReactorNumberFormat = {
    SCIENTIFIC: 0,
    SHORT: 1,
    METRIC: 2,
    BRAILLE: 3,
}

const short_strings = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const metric_strings = [
    "",
    "k",
    "M",
    "G",
    "T",
    "P",
    "E",
    "Z",
    "Y",
    "R",
    "Q"
]

const braille_counters = " ⡀⣀⣄⣤⣦⣶⣷⣿";

function number_format(v, fmt, suffix="") {
    let sign_char = "";
    if (v < 0) {
        sign_char += "-";
    }

    let result = "";

    switch (fmt) {
        case ReactorNumberFormat.SCIENTIFIC:
            sign_char = "";
            if (v.toString().length > 7) {
                result = v.toExponential(3).replaceAll("+", "") + suffix;
            } else {
                result = v;
            }
            break;

        case ReactorNumberFormat.SHORT: {
            if (v == 0) {
                result = 0 + suffix;
                break;
            }

            let factor = Math.floor(Math.log10(v) / 3)
            let factor_count = factor;
            let suffix_txt = "";
            while (factor_count > 0) {
                let index = factor_count % short_strings.length;
                suffix_txt += short_strings[index];
                factor_count -= index;
            }

            let divisor = Math.pow(1000, factor);
            result = (Math.round((v / divisor) * 1000) / 1000) + suffix_txt + suffix;
            break;
        }
        
        case ReactorNumberFormat.METRIC: {
            if (v == 0) {
                result = 0 + " " + suffix;
                break;
            }

            let factor = Math.floor(Math.log10(v) / 3);
            let factor_count = factor;
            let suffix_txt = " ";
            if (factor_count > 0) {
                let index = factor_count % metric_strings.length;
                suffix_txt += metric_strings[index];
                factor_count -= index;
            }

            if (factor_count > 0) {
                result = "∞" + suffix;
            }

            let divisor = Math.pow(1000, factor);
            result = (Math.round((v / divisor) * 1000) / 1000) + suffix_txt + suffix;
            break;
        }
        
        case ReactorNumberFormat.BRAILLE: {
            // base 8 with some funky chars
            let val = Math.abs(v);
            
            while (val > 0) {
                let amt = Math.min(8, val);

                result += braille_counters[amt];
                val -= amt;
            }
        }
    }

    return sign_char + result;
}

function pad_center(string, maxlen) {
    let spare_chars = maxlen - string.toString().length;
    let lside = Math.floor(spare_chars / 2);
    let rside = spare_chars - lside;

    return `${" ".repeat(lside)}${string}${" ".repeat(rside)}`;
}

const ParticleTriggers = {
    START: "aOn reaction start",
    CREATED: "bWhen created",
    ACTIVATED: "cWhen activated",
    DESTROYED: "dWhen destroyed",
    X_INCREASED: "eWhen α increased",
    X_REDUCED: "fWhen α reduced",
    Y_INCREASED: "gWhen β increased",
    Y_REDUCED: "hWhen β reduced",
    INDEX_CHANGED: "iWhen position changed",
    POWER_GAINED: "jWhen power gained",
    POWER_LOST: "kWhen power lost",
    ON_STATS: "-When stats are calculated"
}

const Heats = {
    NOTHING: 0,
    ABOUT_TO_TRIGGER: 1,
    TRIGGERING: 2,
    DESTROYING: 3,
    DESTROYED: 4
}

const OperationTypes = {
    HOTSPOT: "HOTSPOT"
}

const OperationTypeInfo = {
    [OperationTypes.HOTSPOT]: {
        name: "Hotspot",
        desc: "Hotspot moves from left to right, top to bottom. Activates the particle in the hotspot, then destroys the particle in the hotspot."
    }
}

class Reactor {
    constructor(run, start_particles, particles, items, operation_type) {
        this.run = run;
        
        this.start_particles = start_particles;
        this.particles = particles;
        this.items = items;

        this.operation_type = operation_type;

        this.ready = false;
        this.running = false;

        this.power = 0;
        this.operation_data = {};
        this.heats = [];

        this.queued_triggers = [];

        this.stats = {
            activations: 0,
            destructions: 0
        }
    }

    in_bounds(vec) {
        return (
            vec.x >= 0 &&
            vec.x < FRAME_WIDTH &&
            vec.y >= 0 &&
            vec.y < FRAME_HEIGHT
        )
    }

    get_adjacent(index, directs=true, diagonals=false) {
        let adjs = [];
        if (directs) {
            adjs.push(...[
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1]
            ])
        }

        if (diagonals) {
            adjs.push(...[
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            ])
        }

        let outputs = this.get_offsets(index, adjs, true);

        return outputs;
    }

    get_offsets(index, offsets, remove_nulls=false) {
        let outputs = [];

        offsets.forEach(t => {
            let px = index % FRAME_WIDTH;
            let py = Math.floor(index / FRAME_WIDTH);

            let tx = px + t[0];
            let ty = py + t[1];

            if (
                tx >= 0 && tx < FRAME_WIDTH &&
                ty >= 0 && ty < FRAME_HEIGHT
            ) {
                // we're in bounds
                let t_index = (ty * FRAME_WIDTH) + tx;
                let part = this.particles[t_index];
                if (part) {
                    outputs.push(part);
                } else if (!remove_nulls) {
                    outputs.push(null);
                }
            } else {
                if (!remove_nulls) {
                    outputs.push(null);
                }
            }
        })

        return outputs;
    }

    for_all_particles(fn, reverse=false) {
        if (reverse) {
            for (let i=MAX_INDEX; i>=0; i--) {
                fn(this.particles[i], i);
            }
        } else {
            for (let i=0; i<=MAX_INDEX; i++) {
                fn(this.particles[i], i);
            }
        }
    }

    is_empty() {
        return this.particles.every(p => !p);
    }

    start_operation() {
        // setup operation_data
        this.ready = true;
        this.power = 0;
        this.heats = new Array(FRAME_WIDTH * FRAME_HEIGHT).fill(Heats.NOTHING);
        this.particles = new Array(FRAME_WIDTH * FRAME_HEIGHT).fill(null);

        // enqueue a start trigger for every particle
        this.for_all_particles((p, i) => {
            this.create_particle(i, this.start_particles[i] ? new Particle(this, this.start_particles[i]) : null, -1, false);
        })

        this.for_all_particles((p, i) => {
            if (!p) return;

            this.enqueue_trigger(p, ParticleTriggers.START, [], true);
        });

        this.for_all_particles((p, i) => {
            if (!p) return;

            this.enqueue_trigger(p, ParticleTriggers.CREATED, [false], true);
        });

        switch (this.operation_type) {
            case OperationTypes.HOTSPOT:
                this.operation_data = {index: 0, hot_level: 0}
                break;
        }
    }

    refresh_operation() {
        switch (this.operation_type) {
            case OperationTypes.HOTSPOT: {
                this.operation_data = {index: 0, hot_level: 0}
                break;
            }
        }
    }

    step_operation() {
        if (!this.ready) {
            return;
        }

        // return true when operation is finished
        let result = false;
        switch (this.operation_type) {
            case OperationTypes.HOTSPOT: {
                this.heats[this.operation_data.index] = this.operation_data.hot_level;
                let skip = false;

                if (this.operation_data.index+1 <= MAX_INDEX && this.operation_data.hot_level >= Heats.DESTROYING) {
                    this.heats[this.operation_data.index+1] = Heats.ABOUT_TO_TRIGGER;
                }
                if (this.operation_data.hot_level == Heats.TRIGGERING) {
                    // activate
                    if (!this.activate_particle(this.operation_data.index)) {
                        skip = true;
                    };
                } else if (this.operation_data.hot_level == Heats.DESTROYING) {
                    this.destroy_particle(this.operation_data.index)
                }
                
                this.operation_data.hot_level++;
                if (this.operation_data.hot_level >= 4 || skip) {
                    this.operation_data.hot_level = Heats.ABOUT_TO_TRIGGER;
                    this.operation_data.index++;
                    if (this.operation_data.index > MAX_INDEX) {
                        result = true;
                    }

                    if (skip) {
                        this.heats[this.operation_data.index-1] = Heats.NOTHING;
                    }
                }

                break;
            }
        }

        this.for_all_particles((p, i) => {
            if (this.heats[i] == Heats.DESTROYED) {
                this.heats[i] = Heats.NOTHING;
            }
        })

        return result;
    }

    render_particles() {
        // render everything, then remove their changes. do this after every trigger pop
        for (let i=0; i<=MAX_INDEX; i++) {
            set_cell_heat(i, this.heats[i]);
            set_cell_info(i, this.particles[i]);
            if (this.particles[i]) {
                this.particles[i].update_changes();
            }
        }
    }

    _final_destroy_particle(index) {
        this.stats.destructions++;

        if (this.run.destruction_skips_max > 0 && this.run.destruction_skips > 0) {
            // destruction skip instead
            this.run.destruction_skips--;
        } else {
            this.particles[index] = null;
        }
        this.heats[index] = Heats.DESTROYED;
    }
    
    destroy_particle(index, end=false) {
        if (this.particles[index]) {
            this.enqueue_trigger(this.particles[index], ParticleTriggers.DESTROYED, [], end);
            
            // count up destroy-mult studies here
            let destroy_mult_study_count = this.run.items.reduce((cnt, item) => item.template.name == "A new form of localised nanoparticle energy maximisation?" ? cnt + 1 : cnt, 0);
            
            if (destroy_mult_study_count > 0) {
                let p = this.particles[index];
                let factor = Math.pow(4, destroy_mult_study_count);

                p.set_x(p.x * factor);
                p.set_y(p.y * factor);
            }

            return true;
        }
    }

    create_particle(index, particle, trigger=true, overwrite=false) {
        if (!this.particles[index] || overwrite) {
            this.particles[index] = particle;
            if (particle) {
                particle.index = index;
            }
            if (trigger && particle) {
                this.enqueue_trigger(particle, ParticleTriggers.CREATED, [true]);
            }
        }
    }

    activate_particle(index) {
        if (this.particles[index]) {
            this.stats.activations++;

            this.enqueue_trigger(this.particles[index], ParticleTriggers.ACTIVATED);
            return true;
        }
    }

    swap_particles(idx1, idx2) {
        let buff = this.particles[idx1];
        this.particles[idx1] = this.particles[idx2];
        this.particles[idx2] = buff;

        this.particles[idx1]?.set_index(idx1);
        this.particles[idx2]?.set_index(idx2);
    }

    copy_particle(p, idx) {
        let newpart = p.copy();

        newpart?.set_index(idx);
        this.particles[idx] = newpart;
    }

    find_empty_spaces() {
        return this.particles.map((_, i) => i).filter((_, i) => !this.particles[i]);
    }

    modify_power(by) {
        console.log(`Power ${by > 0 ? "+" : ""}${by}`);

        this.power += by;
        if (by > 0) {
            this.for_all_particles((p, i) => {
                if (!p) return;

                this.enqueue_trigger(p, ParticleTriggers.POWER_GAINED, [by])
            }, true)
        } else {
            this.for_all_particles((p, i) => {
                if (!p) return;

                this.enqueue_trigger(p, ParticleTriggers.POWER_LOST, [-by])
            }, true)
        }
    }

    enqueue_trigger(particle, trigger_type, data=[], end=false) {
        if (particle.index < 0 || particle.index > MAX_INDEX) {
            // invalid index so discard
            return;
        }

        let v = {idx: particle.index, part: particle, typ: trigger_type, data: data}
        if (end) {
            this.queued_triggers.push(v);
        } else {
            this.queued_triggers.unshift(v);
        }
    }

    pop_trigger() {
        let trigger = this.queued_triggers.shift();
        if (trigger) {
            let part = trigger.part;
            if (trigger.typ == ParticleTriggers.ACTIVATED && part) {
                part.last_values.just_activated = true;
                part.has_been_activated = true;
            }

            let out = part?.trigger(trigger.typ, trigger.data);

            if (part) {
                // broadcast the event to all items as well. they will manage their own mutable data so we just need to tell them something's happening
                this.items.forEach(item => {
                    item.trigger(trigger.typ, part, trigger.data);
                })

                if (trigger.typ == ParticleTriggers.DESTROYED) {
                    this._final_destroy_particle(part.index);

                    this.heats[trigger.idx] = Heats.DESTROYED;
                }
            }

            if (out) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    }
}

const ParticleRarity = {
    FUNDAMENTAL: "Fundamental",
    COMPOSITE: "Composite",
    EXOTIC: "Exotic"
}

const ParticleType = {
    PARTICLE: "Particle",
    ANTIPARTICLE: "Antiparticle",
    QUASIPARTICLE: "Quasiparticle"
}

const rarity_cols = {
    [ParticleRarity.FUNDAMENTAL]: "#ccc",
    [ParticleRarity.COMPOSITE]: "#8df",
    [ParticleRarity.EXOTIC]: "#8f0",
}

const type_cols = {
    [ParticleType.PARTICLE]: "#ccc",
    [ParticleType.ANTIPARTICLE]: "#fa0",
    [ParticleType.QUASIPARTICLE]: "#0fa",
}

const drop_chance_mods = {
    [ParticleRarity.FUNDAMENTAL]: 1,
    [ParticleRarity.COMPOSITE]: 0.2,
    [ParticleRarity.EXOTIC]: 0.04,
    [ParticleType.PARTICLE]: 1,
    [ParticleType.ANTIPARTICLE]: 0.2,
    [ParticleType.QUASIPARTICLE]: 0.075,
}

class ParticleTemplate {
    constructor(name, icon, col, value, rarity, type, triggers) {
        this.name = name;
        this.icon = icon;
        this.col = col;
        this.value = value;
        this.rarity = rarity;
        this.typ = type;
        this.triggers = triggers;

        this.desc = this.describe();
    }

    describe() {
        return `${this.name} (<span style="color:${this.col}">${this.icon}</span>)
<span style="color:${rarity_cols[this.rarity]}">[${this.rarity}]</span>
<span style="color:${type_cols[this.typ]}">[${this.typ}]</span>

${Object.keys(this.triggers).sort().map(k => `<span class="triggername">${k.slice(1)} -></span>
${this.triggers[k].desc.replaceAll(
    "[[", "<span class='calculation'>"
).replaceAll(
    "]]", "</span>"
).replaceAll(
    "α", "<span class='cell-value-x'>α</span>"
).replaceAll(
    "β", "<span class='cell-value-y'>β</span>"
).replaceAll(
    "MW", "<span class='powerdisplay'>MW</span>"
).replaceAll(
    "generate", "<span class='powerdisplay'>generate</span>"
).replaceAll(
    "Generate", "<span class='powerdisplay'>Generate</span>"
).replaceAll(
    "lose", "<span class='negative-tooltip'>lose</span>"
).replaceAll(
    "Lose", "<span class='negative-tooltip'>Lose</span>"
)}
`).join("\n")}`
    }
}

class Particle {
    static id_inc = 0;

    constructor(reactor, template, index, x=1, y=1) {
        this.id = Particle.id_inc;
        Particle.id_inc++;

        this.reactor = reactor;
        this.template = template;
        this.index = index;

        this.x = x;
        this.y = y;

        this.power = 0;  // just a tracker of how much power this thing has made

        this.has_been_activated = false;

        this.last_values = {
            just_activated: false,
            x: x,
            y: y,
            index: index,
            power: this.power
        }
    }

    copy() {
        return new Particle(this.reactor, this.template, 0, this.x, this.y);
    }

    update_changes() {
        this.last_values = {
            just_activated: false,
            x: this.x,
            y: this.y,
            index: this.index,
            power: this.power
        }
    }

    modify_power(by) {
        this.reactor.modify_power(by);

        this.power += by;
    }

    set_var(v, to) {
        let difference = to - this[v];
        
        let original = this[v];

        this[v] = to;

        if (Math.abs(difference) <= 0) {
            return;
        }

        let suffix = "CHANGED";
        let data = [];
        if (v != "index") {
            if (difference > 0) {
                suffix = "INCREASED";
                data = [difference];
            } else if (difference < 0) {
                suffix = "REDUCED";
                data = [-difference];
            }
        } else {
            data = [original, to]
        }

        this.reactor.enqueue_trigger(this, ParticleTriggers[`${v.toUpperCase()}_${suffix}`], data);
    }

    set_x(to) {
        this.set_var("x", to);
    }

    set_y(to) {
        this.set_var("y", to);
    }

    add_x(by) {
        this.set_x(this.x + by);
    }

    add_y(by) {
        this.set_y(this.y + by);
    }

    set_index(to) {
        this.set_var("index", to);
    }

    trigger(typ, data) {
        let trigger = this.template.triggers[typ];
        if (trigger) {
            trigger.fn(this, data);
            return true;
        }

        return false;
    }
}

const ItemType = {
    MOD: "Modification",
    STUDY: "Study"
}

class ItemTemplate {
    static id_inc = 0;

    constructor(name, icon, typ, col, bgcol, desc, rarity, value, subscriptions) {
        this.id = ItemTemplate.id_inc;
        ItemTemplate.id_inc++;

        this.name = name;
        this.icon = icon;
        this.typ = typ;
        this.col = col;
        this.bgcol = bgcol;

        // TODO turn this into its own function that's a little smarter (LOL)
        this.desc = desc.replaceAll(
            "[[", "<span class='calculation'>"
        ).replaceAll(
            "]]", "</span>"
        ).replaceAll(
            "α", "<span class='cell-value-x'>α</span>"
        ).replaceAll(
            "β", "<span class='cell-value-y'>β</span>"
        ).replaceAll(
            "MW", "<span class='powerdisplay'>MW</span>"
        ).replaceAll(
            "generate", "<span class='powerdisplay'>generate</span>"
        ).replaceAll(
            "Generate", "<span class='powerdisplay'>Generate</span>"
        ).replaceAll(
            "lose", "<span class='negative-tooltip'>lose</span>"
        ).replaceAll(
            "Lose", "<span class='negative-tooltip'>Lose</span>"
        );

        this.rarity = rarity;  // items are spawned using weighted random, so lower number = lower spawn chance
        this.value = value;
        this.subscriptions = subscriptions;
    }
}

class Item {
    constructor(template, persistent_data) {
        this.template = template;
        this.persistent_data = persistent_data;
        this.temporary_data = {};
    }

    reset() {
        this.temporary_data = {};
    }

    trigger(typ, p, data) {
        let tr = this.template.subscriptions[typ];
        if (tr) {
            tr(this, p, data);
            return true;
        }

        return false;
    }
}

function set_cell_info(index, particle) {
    let element = get_cell_element(index);

    if (particle) {
        element.classList.remove("nothing");

        element.querySelector(".cell-value-x").textContent = pad_center(number_format(particle.x, ReactorNumberFormat.SCIENTIFIC), CELL_WIDTH);
        element.querySelector(".cell-value-y").textContent = pad_center(number_format(particle.y, ReactorNumberFormat.SCIENTIFIC), CELL_WIDTH);
        element.querySelector(".cell-icon").textContent = particle.template.icon;
        element.querySelector(".cell-icon").style.color = particle.template.col;

        Object.keys(particle.last_values).forEach(k => {
            if (k != "just_activated") {
                if (particle[k] != particle.last_values[k]) {
                    element.classList.add(`${k}change`);
                } else {
                    element.classList.remove(`${k}change`);
                }
            }
        })


        if (particle.last_values.just_activated) {
            element.classList.add("activated");
        } else {
            element.classList.remove("activated");
        }
    } else {
        element.classList.add("nothing");
        element.classList.remove("indexchange");
    }
}

function set_cell_heat(index, heat) {
    let element = get_cell_element(index);

    element.classList.remove(`hot1`);
    element.classList.remove(`hot2`);
    element.classList.remove(`hot3`);
    element.classList.remove(`hot4`);

    element.classList.add(`hot${heat}`);
}

function show_active_tab() {
    document.querySelector("#bottombar .active-screen").classList.remove("hidden");
    document.querySelector("#bottombar .shop-items").classList.add("hidden");

    render_active_tab();
}

function show_shop_tab() {
    document.querySelector("#bottombar .active-screen").classList.add("hidden");
    document.querySelector("#bottombar .shop-items").classList.remove("hidden");
}

function render_active_tab() {
    let tab = document.querySelector("#bottombar .active-screen");
    // only make trial start button interactable if the reactor isn't running
    if (run.reactor.running || run.trial > run.max_trials) {
        tab.querySelector("#trial_start_button").classList.add("disabled");
    } else {
        tab.querySelector("#trial_start_button").classList.remove("disabled");
    }
    
    // only make the send results button and summary enabled when the power proportion is above 100%
    if (run.get_current_goal_pct() >= 1 && !run.reactor.running) {
        tab.querySelector("#phase_end_button").classList.remove("disabled");
        tab.querySelector("#trial_results_summary").classList.remove("disabled");
    } else {
        tab.querySelector("#phase_end_button").classList.add("disabled");
        tab.querySelector("#trial_results_summary").classList.add("disabled");
    }

    tab.querySelector("#base-reward").textContent = `◕${run.get_base_money_gain()}`.padStart(9);
    tab.querySelector("#base-reward-visual").textContent = `${"◕".repeat(run.get_base_money_gain())}`.padEnd(16);

    tab.querySelector("#trials-reward").textContent = `◕${run.get_unused_trials_money_gain()}`.padStart(9);
    tab.querySelector("#trials-reward-visual").textContent = `${"◕".repeat(run.get_unused_trials_money_gain())}`.padEnd(16);
    
    tab.querySelector("#goal-reward").textContent = `◕${run.get_goal_achievement_money_gain()}`.padStart(9);
    tab.querySelector("#goal-reward-visual").textContent = `${"◕".repeat(run.get_goal_achievement_money_gain())}`.padEnd(16);

    tab.querySelector("#interest-rate").textContent = `${Math.round(run.base_stats.interest_rate * 100)}`;
    tab.querySelector("#interest-max").textContent = `${run.base_stats.interest_max >= 100 ? " " : ": "}${run.base_stats.interest_max}`;
    tab.querySelector("#interest-reward").textContent = `◕${run.get_interest_money_gain()}`.padStart(9);
    tab.querySelector("#interest-reward-visual").textContent = `${"◕".repeat(run.get_interest_money_gain())}`.padEnd(16);

    tab.querySelector("#total-reward").textContent = `◕${run.get_phase_end_money_gain()}`.padStart(9);
    tab.querySelector("#total-reward-visual").textContent = `${number_format(run.get_phase_end_money_gain(), ReactorNumberFormat.BRAILLE)}`.padEnd(16);
}

function render_shop(run) {
    // show reroll price, set shop particles, set shop items, set destroy price

    let shop_elem = document.querySelector("#shop_items");

    shop_elem.querySelector(".reroll-price").textContent = pad_center(`◕${run.shop_items.reroll_price}`, 12);
    if (run.money < run.shop_items.reroll_price) {
        shop_elem.querySelector("#shop_reroll_button").classList.add("disabled");
    } else {
        shop_elem.querySelector("#shop_reroll_button").classList.remove("disabled");
    }

    shop_elem.querySelector(".remove-price").textContent = pad_center(`◕${run.shop_items.remove_price}`, 10);
    if (run.money < run.shop_items.remove_price) {
        shop_elem.querySelector("#shop_remove_button").classList.add("disabled");
    } else {
        shop_elem.querySelector("#shop_remove_button").classList.remove("disabled");
    }

    let item_template = document.querySelector(".templates .item");
    let item_template_study = document.querySelector(".templates .item.study");

    let particles_list = shop_elem.querySelector(".particles-list");
    let items_list = shop_elem.querySelector(".items-list");

    particles_list.replaceChildren();
    items_list.replaceChildren();
    [[run.shop_items.particles, particles_list, show_cell_info, "particle"], [run.shop_items.items, items_list, show_item_info, "item"]].forEach(c => {
        c[0].forEach((p, i) => {
            let clone = (p[0].typ == ItemType.STUDY ? item_template_study : item_template).cloneNode(true);
            clone.querySelector(".item-icon").textContent = p[0].icon;
            clone.querySelector(".item-icon").style.color = p[0].col;
            clone.style.color = p[0].bgcol;
            clone.setAttribute("itemid", p[0].id);

            let price_elem = document.createElement("span");
            price_elem.textContent = `\n${pad_center(`◕${p[1]}`, 5)}`;
            clone.appendChild(price_elem);

            clone.addEventListener("mouseover", e => {
                c[2](p[0], run);
            });

            clone.addEventListener("mouseout", e => {
                c[2](null, run);
            })

            if (p[1] > run.money) {
                clone.classList.add("disabled");
            } else {
                // only register click events if it's affordable :)
                clone.addEventListener("click", e => {
                    if (clone.classList.contains("selected")) {
                        // depends on if particle or item. if particle, deselect - if item, purchase.
                        if (c[3] == "particle") {
                            clone.classList.remove("selected");
                            document.querySelector("#reactor").classList.remove("buyingitem");
                            run.selected_shop_item = null;
                        } else {
                            run.purchase_item(p, i);
                        }
                    } else {
                        // deselect the previously selected item if any
                        if (run.selected_shop_item) {
                            run.selected_shop_item.element.classList.remove("selected");
                            if (run.selected_shop_item.typ == "particle" || run.selected_shop_item.typ == "reactor_particle") {
                                document.querySelector("#reactor").classList.remove("buyingitem");
                            }
                        }

                        clone.classList.add("selected");
                        if (c[3] == "particle") {
                            document.querySelector("#reactor").classList.add("buyingitem");
                        }

                        // set this as the new selected item
                        run.selected_shop_item = {
                            element: clone,
                            typ: c[3],
                            data: p,
                            index: i
                        }
                    }

                    e.stopPropagation();
                })
            }

            c[1].appendChild(clone);

            if (i < c[0].length-1) {
                let padding_span = document.createElement("span");
                padding_span.textContent = " ";
                c[1].appendChild(padding_span);
            }
        })
    });
}

function render_items(items) {
    let item_template = document.querySelector(".templates .item");
    let item_template_study = document.querySelector(".templates .item.study")

    let items_list = document.querySelector(".run-status .items");

    items_list.replaceChildren();
    items.forEach(item_obj => {
        let item = item_obj.template;

        let clone = (item.typ == ItemType.STUDY ? item_template_study : item_template).cloneNode(true);
        clone.querySelector(".item-icon").textContent = item.icon;
        clone.querySelector(".item-icon").style.color = item.col;
        clone.style.color = item.bgcol;
        clone.setAttribute("itemid", item.id);
        clone.addEventListener("mouseover", e => {
            show_item_info(item, run);
        })
        
        clone.addEventListener("mouseout", e => {
            show_item_info(null, run);
        })

        items_list.appendChild(clone);
    })
}

function show_item_info(item, run) {
    if (!item) {
        document.querySelector(".info-area .infobox").innerHTML = "";
        return;
    }

    let typecol = item.typ == ItemType.STUDY ? "lime" : "white";
    let italics = item.typ == ItemType.STUDY ? "italic" : "";
    
    let desc_final = item.desc.replaceAll(
        "{{RANDOM_COUNT_MUL}}",
        Math.floor(run.num_random_rolls / 100) + 1
    ).replaceAll(
        "{{RANDOM_COUNT}}",
        run.num_random_rolls
    );

    document.querySelector(".info-area .infobox").innerHTML = `<span style="white-space:inherit; font-style:${italics}; color:${item.col}">${item.name}</span>\n<span style="color:${typecol}">[${item.typ}]</span>\n\n${desc_final}`;
}

function show_cell_info(particle, run) {
    if (!particle) {
        document.querySelector(".info-area .infobox").innerHTML = "";
        return;
    }

    let desc = particle.desc ? particle.desc : particle.template.desc;

    document.querySelector(".info-area .infobox").innerHTML = desc;
}

function render_ingame_stats(run) {
    document.querySelector(".stats .roundnumber").textContent = run.round;
    document.querySelector(".stats .phasenumber").textContent = run.phase;

    document.querySelector(".stats .trialnumber").textContent = Math.min(run.trial, run.max_trials);
    document.querySelector(".stats .trialmaxnumber").textContent = run.max_trials;

    document.querySelector(".stats .powernumber").textContent = number_format(run.get_current_power(), ReactorNumberFormat.METRIC, "W");
    document.querySelector(".stats .powerreq").textContent = number_format(run.get_goal(), ReactorNumberFormat.METRIC, "W")

    document.querySelector(".stats .moneynumber").textContent = number_format(run.money, ReactorNumberFormat.SCIENTIFIC);
    
    let bar_length = 33;
    let power_proportion = Math.max(0, run.get_current_goal_pct());
    bar_level = Math.max(0, Math.min(4, Math.floor(power_proportion)));
    bar_point = Math.min(bar_length, Math.floor((power_proportion - bar_level) * bar_length));

    let bar_str = `[<span class="p${bar_level+1}">${"#".repeat(bar_point)}</span><span class="p${bar_level}">${"#".repeat(bar_length - bar_point)}</span>]`

    document.querySelector(".stats .powerbar").innerHTML = bar_str;
}

let particle_template2 = new ParticleTemplate("Recreator Matter", "ᘏ", "lightgreen", 6, ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
    [ParticleTriggers.ACTIVATED]: {
        desc: "Add 1 to own β.",
        fn: (p, data) => { p.set_y(p.y + 1); }
    },
    [ParticleTriggers.DESTROYED]: {
        desc: "Activate all directly adjacent particles, β times.",
        fn: (p, data) => {
            let vecs = [
                new Vector2(1, 0),
                new Vector2(-1, 0),
                new Vector2(0, 1),
                new Vector2(0, -1)
            ]

            vecs.forEach(t => {
                let v = index_to_vector(p.index);
                v = v.add(t)

                let r_index = vector_to_index(v);
                if (p.reactor.in_bounds(v)) {
                    for (let i=0; i<p.y; i++) {
                        p.reactor.activate_particle(r_index);
                    }
                }
            });
        }
    },
})

let particle_template3 = new ParticleTemplate("Propagator Matter", "ᗛ", "lightsalmon", 9, ParticleRarity.EXOTIC, ParticleType.QUASIPARTICLE, {
    [ParticleTriggers.ACTIVATED]: {
        desc: "Create a copy of self to the left.",
        fn: (p, data) => { 
            let v = index_to_vector(p.index);
            v.x -= 1;

            let r_index = vector_to_index(v);
            if (p.reactor.in_bounds(v)) {
                p.reactor.create_particle(r_index, p.copy())
            }
        }
    },
    [ParticleTriggers.DESTROYED]: {
        desc: "If [[β<10]], set β to [[β*β+1]] then create a copy of self to the right.",
        fn: (p, data) => {
            if (p.y < 10) {
                p.set_y(p.y * p.y + 1);

                let v = index_to_vector(p.index);
                v.x += 1;

                let r_index = vector_to_index(v);
                if (p.reactor.in_bounds(v)) {
                    p.reactor.create_particle(r_index, p.copy())
                }
            }
        }
    },
})

let particles_list = [
    new ParticleTemplate(
        "Superstatic Matter", "Θ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Gain +1 α and +1 β.",
                fn: (p, data) => {
                    p.add_x(1);
                    p.add_y(1);
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Generate α+β MW.",
                fn: (p, data) => { p.modify_power(p.x + p.y); }
            },
        }
    ),

    new ParticleTemplate(
        "Alion", "φ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate 4 MW.",
                fn: (p, data) => { p.modify_power(4); }
            },
        }
    ),

    new ParticleTemplate(
        "Elequon", "Δ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Gain +1 α and +1 β.",
                fn: (p, data) => {
                    p.add_x(1);
                    p.add_y(1);
                }
            },
            [ParticleTriggers.X_INCREASED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => { p.modify_power(1); }
            },
            [ParticleTriggers.Y_INCREASED]: {
                desc: "Generate 2 MW.",
                fn: (p, data) => { p.modify_power(2); }
            },
        }
    ),

    new ParticleTemplate(
        "Sophon", "Π", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Add +1 α to all particles.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(pt => {
                        if (pt) {
                            pt.add_x(1);
                        }
                    })
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Generate β MW.",
                fn: (p, data) => { p.modify_power(p.y); }
            },
        }
    ),

    new ParticleTemplate(
        "Deshelled Nucleus", "λ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.CREATED]: {
                desc: "Gain α equal to 0.5x own α (rounded down).",
                fn: (p, data) => {
                    p.add_x(Math.floor(p.x * 0.5));
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Add own α to all other particles' α.",
                fn: (p, data) => { 
                    p.reactor.particles.forEach(pt => {
                        if (pt && p.id != pt.id) {
                            pt.add_x(p.x);
                        }
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Memion", "Ψ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate 1 MW for every particle destroyed this trial.",
                fn: (p, data) => {
                    p.modify_power(p.reactor.stats.destructions * 1);
                }
            },
        }
    ),

    new ParticleTemplate(
        "B+ Qualion", "ω", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Add +1 β to all particles.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(pt => {
                        if (pt) {
                            pt.add_y(1);
                        }
                    })
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Remove -1 β from all particles.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(pt => {
                        if (pt) {
                            pt.add_y(-1);
                        }
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Hare's Matter", "Ξ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Activate a random other particle that hasn't activated yet this trial.",
                fn: (p, data) => {
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id && !pt.has_been_activated
                    })

                    if (targets.length > 0) {
                        let p_s = obj_seeded_random_from_array(targets, p.reactor.run);
                        p.reactor.activate_particle(p_s.index);
                    }
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Activate a random other particle that has activated at least once this trial.",
                fn: (p, data) => {
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id && pt.has_been_activated
                    })

                    if (targets.length > 0) {
                        let p_s = obj_seeded_random_from_array(targets, p.reactor.run);
                        p.reactor.activate_particle(p_s.index);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Troson", "σ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Activate a random particle with the highest α, then destroy it. If that is this particle, does nothing instead.",
                fn: (p, data) => {
                    // filter particles by highest x, then select a random one that isn't this one's index
                    let max_x = p.reactor.particles.reduce((prev, cur) => cur ? Math.max(cur.x, prev) : prev, 0);

                    let parts = p.reactor.particles.filter(pt => pt && pt.x >= max_x && pt.id != p.id);

                    if (parts.length > 0) {
                        let p_s = obj_seeded_random_from_array(parts, p.reactor.run);
                        
                        // REMEMBER: put trigger enqueues backwards, because everything gets put onto a stack
                        p.reactor.destroy_particle(p_s.index);
                        p.reactor.activate_particle(p_s.index);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "General Condensate", "ξ", "white", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate 16-α-β MW, then gain +4 β.",
                fn: (p, data) => {
                    p.modify_power(16 - p.x - p.y);
                    p.add_y(4);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Antiwave", "ᔷ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Remove 1 α from every adjacent particle.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    parts.forEach(pt => pt.add_x(-1))
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Remove 1 β from every diagonally adjancent particle.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, false, true);

                    parts.forEach(pt => pt.add_y(-1))
                }
            },
        }
    ),

    // untested
    new ParticleTemplate(
        "Quoton", "ᕒ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Destroy a random other particle then gain α and β equal to its α and β.",
                fn: (p, data) => {
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id;
                    })

                    if (targets.length > 0) {
                        let p_s = obj_seeded_random_from_array(targets, p.reactor.run);
                        
                        p.add_x(p_s.x);
                        p.add_y(p_s.y);

                        p.reactor.destroy_particle(p_s.index);
                    }
                }
            },
            [ParticleTriggers.DESTROYED]: {
                desc: "Grant a random other particle 75% of own α and β (rounded up).",
                fn: (p, data) => {
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id;
                    })

                    if (targets.length > 0) {
                        let p_s = obj_seeded_random_from_array(targets, p.reactor.run);

                        p_s.add_x(Math.ceil(p.x * 0.75));
                        p_s.add_y(Math.ceil(p.y * 0.75));
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Subalic Memate", "ᗩ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.Y_INCREASED]: {
                desc: "Generate 0.1*β MW (rounded up)",
                fn: (p, data) => {
                    p.modify_power(Math.ceil(0.1 * p.y));
                }
            },
            [ParticleTriggers.Y_REDUCED]: {
                desc: "Lose 0.2*β MW (rounded up)",
                fn: (p, data) => {
                    p.modify_power(-Math.ceil(0.2 * p.y));
                }
            },
        }
    ),

    new ParticleTemplate(
        "Antisophon", "ᙫ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.X_REDUCED]: {
                desc: "Generate the same amount of MW.",
                fn: (p, data) => {
                    p.modify_power(data[0]);
                }
            },
            [ParticleTriggers.Y_REDUCED]: {
                desc: "Generate MW equal to 2x the β lost.",
                fn: (p, data) => {
                    p.modify_power(data[0] * 2);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Antisuperstatic Matter", "ᗯ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Remove -1 β and add +3 α to all adjacent particles.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    parts.forEach(pt => {
                        pt.add_x(3);
                        pt.add_y(-1);
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "L-moton", "ᖳ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Destroy the particle directly to the right. Activate the particle directly below.",
                fn: (p, data) => {
                    let parts = p.reactor.get_offsets(p.index, [
                        [1, 0], [0, 1]
                    ])

                    p.reactor.destroy_particle(parts[0]?.index);
                    p.reactor.activate_particle(parts[1]?.index);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Jill's Particle", "ᕫ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Destroy 3 random adjacent particles.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    for (let i=0; i<3; i++) {
                        if (parts.length > 0) {
                            let pt_idx = obj_random_int(0, parts.length, p.reactor.run);
                            let pt = parts[pt_idx];
                            p.reactor.destroy_particle(pt.index);

                            parts.splice(pt_idx, 1);
                        }
                    }
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Activate 2 random adjacent particles (can select the same one twice).",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    for (let i=0; i<2; i++) {
                        if (parts.length > 0) {
                            let pt_idx = obj_random_int(0, parts.length, p.reactor.run);
                            let pt = parts[pt_idx];
                            p.reactor.activate_particle(pt.index);
                        }
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Anti-antisophon", "ᗫ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Destroy a random adjacent particle then generate MW equal to 3x its β.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    if (parts.length > 0) {
                        let part = obj_seeded_random_from_array(parts, p.reactor.run);

                        p.modify_power(part.y * 3);
                        p.reactor.destroy_particle(part.index);
                    }
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate MW equal to the sum of all adjacent particles' α.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    let sum = 0;
                    parts.forEach(part => {
                        sum += part.x * 1;
                    });

                    p.modify_power(sum);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Erion", "ᘹ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "If α+β is 0 or less, generate 40 MW.",
                fn: (p, data) => {
                    if (p.x + p.y <= 0) {
                        p.modify_power(40);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Antisubspokes", "ᘞ", "moccasin", 3,
        ParticleRarity.FUNDAMENTAL, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.DESTROYED]: {
                desc: "Reduce the α and β of all diagonally adjacent particles by half (rounded down), then activate them.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, false, true);

                    parts.forEach(part => {
                        p.reactor.activate_particle(part.index);
                        part.add_x(-Math.floor(part.x * 0.5));
                        part.add_y(-Math.floor(part.y * 0.5));
                    });
                }
            },
        }
    ),

    new ParticleTemplate(
        "Thought Experiment", "⧗", "palegreen", 5,
        ParticleRarity.FUNDAMENTAL, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.START]: {
                desc: "Add +3 α to all particles and remove -2 β.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(part => {
                        if (part) {
                            part.add_x(3);
                            part.add_y(-2);
                        }
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Atomic Battery", "⧳", "palegreen", 5,
        ParticleRarity.FUNDAMENTAL, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.CREATED]: {
                desc: "Destroy this particle.",
                fn: (p, data) => {
                    p.reactor.destroy_particle(p.index);
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate 8 MW.",
                fn: (p, data) => {
                    p.modify_power(8);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Subwave", "⦄", "palegreen", 5,
        ParticleRarity.FUNDAMENTAL, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Set all adjacent particles' α and β to the average of all adjacent particles (rounded up). Each average is calculated separately.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    let sum_x = 0;
                    let sum_y = 0;
                    let count = 0;
                    parts.forEach(part => {
                        sum_x += part.x;
                        sum_y += part.y;
                        count++;
                    });

                    sum_x = Math.ceil(sum_x / count);
                    sum_y = Math.ceil(sum_y / count);

                    parts.forEach(part => {
                        part.set_x(sum_x);
                        part.set_y(sum_y);
                    });
                }
            },
        }
    ),

    new ParticleTemplate(
        "Flickermatter", "⥉", "palegreen", 5,
        ParticleRarity.FUNDAMENTAL, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.INDEX_CHANGED]: {
                desc: "Generate (0.2*α)+(0.4*β) MW (rounded up).",
                fn: (p, data) => {
                    p.modify_power(Math.ceil((p.x * 0.2) + (p.y * 0.4)));
                }
            },
        }
    ),

    new ParticleTemplate(
        "Platonid", "⧫", "palegreen", 5,
        ParticleRarity.FUNDAMENTAL, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.CREATED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.X_INCREASED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.Y_INCREASED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.INDEX_CHANGED]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },

            [ParticleTriggers.POWER_LOST]: {
                desc: "Generate 1 MW.",
                fn: (p, data) => {
                    p.modify_power(1);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Ion Conglomerate", "ἐ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.START]: {
                desc: "Add +2 β to all adjacent particles.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);
                    parts.forEach(part => {
                        part.add_y(2);
                    });
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Add +2 α to all adjacent particles.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);
                    parts.forEach(part => {
                        part.add_x(2);
                    });
                }
            },
        }
    ),

    new ParticleTemplate(
        "Dane's Autobalancer", "ἐ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Activate the particle directly to the right.",
                fn: (p, data) => {
                    let parts = p.reactor.get_offsets(p.index, [[1, 0]], true);
                    parts.forEach(part => {
                        p.reactor.activate_particle(part.index);
                    })
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Add +4 β and +4 α to a random other particle.",
                fn: (p, data) => {
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id;
                    })

                    if (targets.length > 0) {
                        let p_s = obj_seeded_random_from_array(targets, p.reactor.run);

                        p_s.add_x(4);
                        p_s.add_y(4);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "High-density Substrate", "ἐ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Move as far downwards as possible without intersecting another particle. Gain +2 β for each tile moved then generate 2*β MW.",
                fn: (p, data) => {
                    // index +length, until out of bounds or occupied position
                    let new_index = p.index;
                    let n = 0;
                    while (true) {
                        new_index += FRAME_WIDTH;
                        let p2 = p.reactor.particles[new_index];
                        if (p2 || new_index > p.reactor.particles.length) {
                            // hit something, move back and finish
                            new_index -= FRAME_WIDTH;
                            break;
                        }

                        n++;
                    }

                    p.reactor.particles[p.index] = null;
                    p.reactor.particles[new_index] = p;
                    p.set_index(new_index);

                    p.add_y(n * 2);
                    p.modify_power(p.y * 2);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Catalytic Mixture", "Ῠ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Multiply the α of two random adjacent particles by 2 (can select the same one twice).",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    if (parts.length > 0) {
                        for (let i=0; i<2; i++) {
                            let part = obj_seeded_random_from_array(parts, p.reactor.run);
                            part.add_x(part.x);
                        }
                    }
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Multiply the β of a random adjacent particle by 2.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    if (parts.length > 0) {
                        for (let i=0; i<1; i++) {
                            let part = obj_seeded_random_from_array(parts, p.reactor.run);
                            part.add_y(part.y);
                        }
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Stepped Reaction Mix", "ᾰ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.X_INCREASED]: {
                desc: "If α is >10, set α to 0 and generate 10 MW.",
                fn: (p, data) => {
                    if (p.x > 10) {
                        p.add_x(-p.x);
                        p.modify_power(10);
                    }
                }
            },

            [ParticleTriggers.Y_INCREASED]: {
                desc: "If β is >10, set β to 0 and generate 15 MW.",
                fn: (p, data) => {
                    if (p.y > 10) {
                        p.add_x(-p.y);
                        p.modify_power(15);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Doped Supernucleus", "ὠ", "skyblue", 6,
        ParticleRarity.COMPOSITE, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "If β is >5, lose -5 β then copy this particle to a random empty position twice.",
                fn: (p, data) => {
                    if (p.y > 5) {
                        p.add_y(-5);

                        for (let i=0; i<2; i++) {
                            let empty_spaces = p.reactor.find_empty_spaces();
                            if (empty_spaces.length > 0) {
                                let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                                p.reactor.copy_particle(p, newpos);
                            }
                        }
                    }
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate 6 MW then add +2 α and +1 β to all adjacent particles.",
                fn: (p, data) => {
                    if (p.y > 5) {
                        p.modify_power(6);

                        let parts = p.reactor.get_adjacent(p.index, true, true);
                        parts.forEach(part => {
                            part.add_x(2);
                            part.add_y(1);
                        });
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Viral Conglomerate", "ⴍ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Turn a random adjacent particle into a copy of this particle (does not trigger destruction or creation effects).",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    if (parts.length > 0) {
                        let part = obj_seeded_random_from_array(parts, p.reactor.run);

                        let newpart = p.copy();
                        newpart.index = part.index;
                        newpart.update_changes();

                        p.reactor.particles[part.index] = newpart;
                    }
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate (the count of the most common particle)^2 MW.",
                fn: (p, data) => {
                    let cnts = new Map();
                    p.reactor.particles.forEach(part => {
                        if (part) {
                            cnts.set(part.template.icon, (cnts.get(part.template.icon) ?? 0) + 1);
                        }
                    });

                    let highest_cnt = cnts.keys().reduce(
                        (p,c) => cnts.get(c) > p ? cnts.get(c) : p, 0
                    );

                    p.modify_power(highest_cnt * highest_cnt);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Anti/Real Semisuspension", "ⴟ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Destroy a random adjacent particle then generate MW equal to 3x its α+β.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    if (parts.length > 0) {
                        let part = obj_seeded_random_from_array(parts, p.reactor.run);

                        let gen = 3 * (part.x + part.y);

                        p.modify_power(gen);
                        p.reactor.destroy_particle(part.index);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Porous Membrane", "ⴥ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Swap the α of the two vertically opposite adjacent particles and generate MW equal to the difference. Then do the same for the β of the two horizontally opposite particles. Each swap only works if particles on both sides exist.",
                fn: (p, data) => {
                    let vparts = p.reactor.get_offsets(p.index, [0, 1], [0, -1]);
                    if (vparts[0] && vparts[1]) {
                        let x1 = vparts[0].x;
                        let x2 = vparts[1].x;

                        let diff = Math.abs(x2 - x1);

                        vparts[0].set_x(x2);
                        vparts[1].set_x(x1);

                        p.modify_power(diff);
                    }

                    let hparts = p.reactor.get_offsets(p.index, [1, 0], [-1, 0]);
                    if (hparts[0] && hparts[1]) {
                        let y1 = hparts[0].y;
                        let y2 = hparts[1].y;

                        let diff = Math.abs(y2 - y1);

                        hparts[0].set_y(y2);
                        hparts[1].set_y(y1);

                        p.modify_power(diff);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Antiphotonic Mass", "ⴃ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.START]: {
                desc: "Set all other particles' α and β to -10.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(part => {
                        part?.set_x(-10);
                        part?.set_y(-10);
                    })
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate α*β MW.",
                fn: (p, data) => {
                    p.modify_power(p.x * p.y);
                }
            }
        }
    ),

    new ParticleTemplate(
        "Superlensing Structure", "ⴝ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "If β is >0, multiply the α of a random particle by 1.2x (rounded up), then lose -1 β, then activate this particle again.",
                fn: (p, data) => {
                    if (p.y > 0) {
                        // enqueue the trigger first, so everything else resolves before the next activation
                        p.reactor.activate_particle(p.index);

                        let parts = p.reactor.get_adjacent(p.index, true, true);

                        if (parts.length > 0) {
                            let part = obj_seeded_random_from_array(parts, p.reactor.run);

                            part.set_x(Math.ceil(part.x * 1.2));
                        }

                        p.add_y(-1);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Rebounce Matrix", "ⴡ", "plum", 6,
        ParticleRarity.COMPOSITE, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.X_INCREASED]: {
                desc: "Generate α MW, then lose α equal to the α gained.",
                fn: (p, data) => {
                    p.modify_power(p.x);
                    p.add_x(-data[0]);
                }
            },

            [ParticleTriggers.Y_INCREASED]: {
                desc: "Generate β MW, then lose β equal to the β gained.",
                fn: (p, data) => {
                    p.modify_power(p.y);
                    p.add_y(-data[0]);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Low-excitement Superweb", "⍢", "mediumaquamarine", 8,
        ParticleRarity.COMPOSITE, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.CREATED]: {
                desc: "Reduce every particle's α and β by -1.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(part => {
                        part?.add_x(-1);
                        part?.add_y(-1);
                    })
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Activate every other particle in a random order, then destroy every other particle in a different random order.",
                fn: (p, data) => {
                    let trigger_order = new Array(p.reactor.particles.length).fill(0).map((_, i) => i);
                    trigger_order = obj_random_shuffle(trigger_order, p.reactor.run);

                    // this is gonna be real fun because we have to do the whole thing backwards.
                    // so we'll apply all the destroy triggers
                    // then apply all the activate triggers.
                    // the fun part is that because it's random we don't care about the order being reversed
                    trigger_order.forEach(t => {
                        p.reactor.destroy_particle(t);
                    })

                    trigger_order = obj_random_shuffle(trigger_order, p.reactor.run);
                    trigger_order.forEach(t => {
                        p.reactor.activate_particle(t);
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Capacitative Semistructure", "⍬", "mediumaquamarine", 8,
        ParticleRarity.COMPOSITE, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.POWER_GAINED]: {
                desc: "Lose power equal to the power gained. Gain +1 β per MW lost.",
                fn: (p, data) => {
                    p.modify_power(-data[0]);
                    p.add_y(data[0]);
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate β MW.",
                fn: (p, data) => {
                    p.modify_power(p.y)
                }
            }
        }
    ),

    new ParticleTemplate(
        "Tau Metastructure", "⍝", "mediumaquamarine", 8,
        ParticleRarity.COMPOSITE, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.INDEX_CHANGED]: {
                desc: "Activate all particles with the same α as this particle, then gain +1 α.",
                fn: (p, data) => {
                    p.add_x(1);
                    p.reactor.particles.forEach(part => {
                        if (part) {
                            if (part.x == p.x) {
                                p.reactor.activate_particle(part.index);
                            }
                        }
                    });
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Increase the β of all particles with the same β as this particle by +1.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(part => {
                        if (part) {
                            if (part.y == p.y) {
                                part.add_y(1);
                            }
                        }
                    });
                }
            }
        }
    ),

    new ParticleTemplate(
        "Supernucleus", "ᛃ", "lawngreen", 9,
        ParticleRarity.EXOTIC, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Double all adjacent particles' α.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    parts.forEach(part => {
                        part.add_x(part.x);
                    })
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Double all adjacent particles' β.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    parts.forEach(part => {
                        part.add_y(part.y);
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Chameleon Particle", "ᚧ", "lawngreen", 9,
        ParticleRarity.EXOTIC, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Become a copy of the particle with the highest α, ignoring particles named Chameleon Particle (without triggering creation or destruction effects), then gain +3 α and +3 β, then activate this particle (the copy) again.",
                fn: (p, data) => {
                    // try to ignore chameleon particles
                    let best_particle = p.reactor.particles.reduce((p, c) => {
                        return (p && c) ? (c.x > p.x && c.template.name != "Chameleon Particle" ? c : p) : (c && c.template.name != "Chameleon Particle" ? c : p)
                    }, null);

                    let newpart = best_particle.copy();
                    p.reactor.particles[p.index] = newpart;
                    newpart.index = p.index;
                    newpart.update_changes();

                    p.reactor.activate_particle(p.index);

                    newpart.add_x(3);
                    newpart.add_y(3);
                }
            },
        }
    ),

    new ParticleTemplate(
        "XV-1552 \"Replicator\"", "ᚤ", "lawngreen", 9,
        ParticleRarity.EXOTIC, ParticleType.PARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Generate α MW for every empty cell in the reactor.",
                fn: (p, data) => {
                    let empty_part_count = 0;
                    p.reactor.particles.forEach(part => {
                        if (!part) {
                            empty_part_count++;
                        }
                    })

                    p.modify_power(empty_part_count * p.x);
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Copy three random other particles into three random empty positions, then activate a random one of those copies.",
                fn: (p, data) => {
                    let copy_positions = [];

                    for (let i=0; i<3; i++) {
                        let parts = p.reactor.particles.filter(pt => pt && pt.id != p.id);

                        if (parts.length > 0) {
                            let p_s = obj_seeded_random_from_array(parts, p.reactor.run);

                            let empty_spaces = p.reactor.find_empty_spaces();
                            if (empty_spaces.length > 0) {
                                let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                                p.reactor.copy_particle(p_s, newpos);
                                copy_positions.push(newpos);
                            }
                        }
                    }

                    // select a random copied position and activate the particle
                    if (copy_positions.length > 0) {
                        let activate_index = obj_seeded_random_from_array(copy_positions, p.reactor.run);

                        p.reactor.activate_particle(activate_index);
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "V-Capacitance Container", "⸸", "yellowgreen", 9,
        ParticleRarity.EXOTIC, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Lose all power!",
                fn: (p, data) => {
                    p.modify_power(-p.reactor.power);
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate 10 MW, then generate power equal to 6x current power.",
                fn: (p, data) => {
                    p.modify_power(10);
                    p.modify_power(p.reactor.power * 6);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Subreal Fabric", "⸮", "yellowgreen", 9,
        ParticleRarity.EXOTIC, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.X_INCREASED]: {
                desc: "Gain the same amount of β.",
                fn: (p, data) => {
                    p.add_y(data[0]);
                }
            },

            [ParticleTriggers.Y_REDUCED]: {
                desc: "Gain the same amount of α and remove 20% of the amount (rounded up) from every other particle's α.",
                fn: (p, data) => {
                    p.add_x(data[0]);
                    
                    let reduce_amt = Math.ceil(data[0] * 0.2);
                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id
                    })

                    targets.forEach(part => {
                        part.add_x(-reduce_amt);
                    });
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Lose 10% β (rounded up), and add the same amount as β to every other particle.",
                fn: (p, data) => {
                    let reduce_amt = Math.ceil(p.y * 0.1);

                    p.add_y(-reduce_amt);

                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id
                    })

                    targets.forEach(part => {
                        part.add_y(reduce_amt);
                    });
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Generate α+β MW.",
                fn: (p, data) => {
                    p.modify_power(p.x * p.y);
                }
            },
        }
    ),

    new ParticleTemplate(
        "Inversion Propagator", "⸖", "yellowgreen", 9,
        ParticleRarity.EXOTIC, ParticleType.ANTIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "Remove α from the particle with the highest α equal to the amount of β on the particle with the highest β. Then do the same in the opposite direction. If there is a tie, the bottom-rightmost is selected.",
                fn: (p, data) => {
                    let highest_x = p.reactor.particles.reduce((p, c) => (p && c) ? (c.x >= p.x ? c : p) : (c ? c : p), null);
                    let highest_y = p.reactor.particles.reduce((p, c) => (p && c) ? (c.y >= p.y ? c : p) : (c ? c : p), null);

                    highest_x.add_x(-highest_y.y);

                    highest_x = p.reactor.particles.reduce((p, c) => (p && c) ? (c.x >= p.x ? c : p) : (c ? c : p), null);
                    highest_y = p.reactor.particles.reduce((p, c) => (p && c) ? (c.y >= p.y ? c : p) : (c ? c : p), null);

                    highest_y.add_y(-highest_x.x);
                }
            },

            [ParticleTriggers.X_INCREASED]: {
                desc: "Remove α and β from every other particle equal to 10% of the α gained, rounded up.",
                fn: (p, data) => {
                    let amt = Math.ceil(p.y * 0.1);

                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id
                    })

                    targets.forEach(part => {
                        part.add_x(-amt);
                        part.add_y(-amt);
                    });
                }
            },

            [ParticleTriggers.Y_INCREASED]: {
                desc: "Remove α and β from every other particle equal to 25% of the α gained, rounded up.",
                fn: (p, data) => {
                    let amt = Math.ceil(p.y * 0.25);

                    let targets = p.reactor.particles.filter(pt => {
                        return pt && pt.id != p.id
                    })

                    targets.forEach(part => {
                        part.add_x(-amt);
                        part.add_y(-amt);
                    });
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Multiply the α of every adjacent particle by -1 and their β by -2.",
                fn: (p, data) => {
                    let parts = p.reactor.get_adjacent(p.index, true, true);

                    parts.forEach(pt => {
                        pt.set_x(pt.x * -1);
                        pt.set_y(pt.y * -2);
                    })
                }
            },
        }
    ),

    new ParticleTemplate(
        "Particle Man", "m", "lime", 12,
        ParticleRarity.EXOTIC, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.START]: {
                desc: "Randomise the position of all particles, then add +8 α and +4 β to them.",
                fn: (p, data) => {
                    // we need to get the particles, get a new reorder, then move them as necessary
                    // make sure to trigger index change effects
                    let new_order = new Array(p.reactor.particles.length).fill(0).map((_, i) => i);
                    new_order = obj_random_shuffle(new_order, p.reactor.run);

                    let new_particles_list = [];
                    new_order.forEach((o, i) => {
                        new_particles_list.push(p.reactor.particles[o]);
                        if (p.reactor.particles[o]) {
                            p.reactor.particles[o].set_index(i);
                            p.reactor.particles[o].add_x(8);
                            p.reactor.particles[o].add_y(4);
                        }
                    })

                    p.reactor.particles = new_particles_list;
                }
            },

            [ParticleTriggers.CREATED]: {
                desc: "Activate two random particles not named Particle Man.",
                fn: (p, data) => {
                    let parts = p.reactor.particles.filter(pt => pt && pt.template.name != "Particle Man");

                    for (let i=0; i<2; i++) {
                        if (parts.length > 0) {
                            let pt_idx = obj_random_int(0, parts.length, p.reactor.run);
                            let pt = parts[pt_idx];
                            p.reactor.activate_particle(pt.index);
                        }
                    }
                }
            },

            [ParticleTriggers.ACTIVATED]: {
                desc: "Copy a random particle not named Particle Man to a random other empty position if possible.",
                fn: (p, data) => {
                    let parts = p.reactor.particles.filter(pt => pt && pt.template.name != "Particle Man");

                    if (parts.length > 0) {
                        let p_s = obj_seeded_random_from_array(parts, p.reactor.run);

                        let empty_spaces = p.reactor.find_empty_spaces();
                        if (empty_spaces.length > 0) {
                            let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                            p.reactor.copy_particle(p_s, newpos);
                        }
                    }
                }
            },

            [ParticleTriggers.DESTROYED]: {
                desc: "Randomise the position of all particles.",
                fn: (p, data) => {
                    // we need to get the particles, get a new reorder, then move them as necessary
                    // make sure to trigger index change effects
                    let new_order = new Array(p.reactor.particles.length).fill(0).map((_, i) => i);
                    new_order = obj_random_shuffle(new_order, p.reactor.run);

                    let new_particles_list = [];
                    new_order.forEach((o, i) => {
                        new_particles_list.push(p.reactor.particles[o]);
                        if (p.reactor.particles[o]) {
                            p.reactor.particles[o].set_index(i);
                        }
                    })

                    p.reactor.particles = new_particles_list;
                }
            },
        }
    ),

    new ParticleTemplate(
        "Greedy Particle", "g", "lime", 12,
        ParticleRarity.EXOTIC, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.ACTIVATED]: {
                desc: "If you have any ◕, lose 1 ◕ then activate every adjacent particle 1 time plus 1 more time for every 10 ◕ currently held.",
                fn: (p, data) => {
                    if (p.reactor.run.money > 0) {
                        p.reactor.run.modify_money(-1, p.template.name);

                        let activations = Math.floor(p.reactor.run.money / 10) + 1;
                        let parts = p.reactor.get_adjacent(p.index, true, true);

                        parts.forEach(pt => {
                            for (let i=0; i<activations; i++) {
                                p.reactor.activate_particle(pt.index);
                            }
                        })
                    }
                }
            },
        }
    ),

    new ParticleTemplate(
        "Particle Jiggler", "j", "lime", 12,
        ParticleRarity.EXOTIC, ParticleType.QUASIPARTICLE, {
            [ParticleTriggers.POWER_GAINED]: {
                desc: "Move all particles to the right if possible.",
                fn: (p, data) => {
                    // start from the rightmost side
                    for (let x=FRAME_WIDTH-1; x>=0; x--) {
                        for (let y=0; y<FRAME_HEIGHT; y++) {
                            let index = xy_to_index(x, y);
                            let pt = p.reactor.particles[index];

                            if (pt) {
                                let p_right = p.reactor.get_offsets(index, [[1, 0]])[0];

                                let new_index = xy_to_index(x+1, y);
                                if (!p_right && p.reactor.in_bounds(xy_to_vector(x+1, y))) {
                                    // move it
                                    p.reactor.particles[pt.index] = null;
                                    p.reactor.particles[new_index] = pt;
                                    pt.set_index(new_index);
                                }
                            }
                        }
                    }
                }
            },

            [ParticleTriggers.POWER_LOST]: {
                desc: "Move all particles to the left if possible.",
                fn: (p, data) => {
                    // start from the leftmost side
                    for (let x=0; x<FRAME_WIDTH; x++) {
                        for (let y=0; y<FRAME_HEIGHT; y++) {
                            let index = xy_to_index(x, y);
                            let pt = p.reactor.particles[index];

                            if (pt) {
                                let p_left = p.reactor.get_offsets(index, [[-1, 0]])[0];

                                let new_index = xy_to_index(x-1, y);
                                if (!p_left && p.reactor.in_bounds(xy_to_vector(x-1, y))) {
                                    // move it
                                    p.reactor.particles[pt.index] = null;
                                    p.reactor.particles[new_index] = pt;
                                    pt.set_index(new_index);
                                }
                            }
                        }
                    }
                }
            },

            [ParticleTriggers.INDEX_CHANGED]: {
                desc: "Add +2 α and +2 β to all particles.",
                fn: (p, data) => {
                    p.reactor.particles.forEach(pt => {
                        if (pt) {
                            pt.add_x(2);
                            pt.add_y(2);
                        }
                    })
                }
            },
        }
    ),
]

let particles_lookup = new Map();
let particles_drop_table = [];

particles_list.forEach(p => {
    particles_lookup.set(p.name, p);
    particles_drop_table.push([drop_chance_mods[p.rarity] * drop_chance_mods[p.typ], p]);
})

let items_list = [
    // mods
    new ItemTemplate(
        "Refined Power Reclamation Apparatus", "P", ItemType.MOD, "red", "yellow",
        "When a particle is destroyed and has positive β, generate MW equal to 25% of its β, rounded up.",
        1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                if (p.y > 0) {
                    p.reactor.modify_power(Math.ceil(p.y * 0.25));
                }
            }
        }
    ),

    new ItemTemplate(
        "Elastic Batteries", "E", ItemType.MOD, "orange", "yellow",
        "When 4 MW or more is lost at once, generate 1 MW.",
        1, 10, {
            [ParticleTriggers.POWER_LOST]: (item, p, data) => { if (data[0] >= 4) { p.reactor.modify_power(1) } }
        }
    ),

    new ItemTemplate(
        "Gold-Lined Capacitors", "G", ItemType.MOD, "gold", "yellow",
        "When a particle is destroyed, generate 1 MW for every ◕ currently held.",
        1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => { if (p.reactor.run.money > 0) { p.reactor.modify_power(p.reactor.run.money) } }
        }
    ),

    new ItemTemplate(
        "Powerflow Sidecouplings", "S", ItemType.MOD, "powderblue", "yellow",
        "When a particle is destroyed and has positive α, generate 2 MW.",
        1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                if (p.x > 0) { p.reactor.modify_power(2) }
            }
        }
    ),

    new ItemTemplate(
        "Magnetic Suspension Rails", "S", ItemType.MOD, "lightgray", "lightcoral",
        "When a particle is activated, it gains +1 α and +1 β.",
        1, 10, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                p.add_x(1);
                p.add_y(1);
            }
        }
    ),

    new ItemTemplate(
        "First-Emission Reflectivity Guard", "G", ItemType.MOD, "powderblue", "yellow",
        "When a particle is created, generate MW equal to 20% of its α, rounded up.",
        1, 10, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                p.reactor.modify_power(Math.ceil(p.x * 0.2));
            }
        }
    ),

    new ItemTemplate(
        "Twisted Edge Loops", "L", ItemType.MOD, "violet", "lime",
        "When the reaction starts, copy the particle in the top-left to the bottom-right. Will not overwrite if not empty.",
        1, 10, {
            [ParticleTriggers.START]: (item, p, data) => {
                let last_particle_index = p.reactor.particles.length-1;

                let p1 = p.reactor.particles[0];
                let p2 = p.reactor.particles[last_particle_index];

                if (p1 && !p2) {
                    p.reactor.copy_particle(p1, last_particle_index);
                }
            }
        }
    ),

    new ItemTemplate(
        "Crystalline Redirectors", "R", ItemType.MOD, "magenta", "lightgray",
        "When a particle is created, if no other particles are directly adjacent to it, activate it twice.",
        1, 10, {
            [ParticleTriggers.CREATED]: (item, p, data) => {
                let adjs = p.reactor.get_adjacent(p.index, true);
                if (!adjs.some(pt => pt)) {
                    p.reactor.activate_particle(p.index);
                    p.reactor.activate_particle(p.index);
                }
            }
        }
    ),

    new ItemTemplate(
        "Cyclic Prefiller", "P", ItemType.MOD, "lightcoral", "lightgray",
        "When a particle is created after the reaction starts, grant it +1 α and +1 β. This number increases by 1 every time this item activates in the current trial.",
        1, 10, {
            [ParticleTriggers.CREATED]: (item, p, data) => {
                if (data[0]) {  // true/false value for "was created after init?"
                    let activations = (item.temporary_data["prefiller_activations"]!==undefined ? item.temporary_data["prefiller_activations"] : 0);

                    activations++;

                    p.add_x(activations);
                    p.add_y(activations);

                    item.temporary_data["prefiller_activations"] = activations;
                }
            }
        }
    ),

    new ItemTemplate(
        "Surge Capture Bulbs", "B", ItemType.MOD, "violet", "yellow",
        "When the reaction starts, generate 10 MW per empty particle slot.",
        1, 10, {
            [ParticleTriggers.START]: (item, p, data) => {
                let empty_slot_count = p.reactor.particles.reduce((p, c) => {
                    return p + (!c ? 1 : 0)
                }, 0);

                p.reactor.modify_power(empty_slot_count * 10);
            }
        }
    ),

    new ItemTemplate(
        "Dynamic Capturing Cages", "C", ItemType.MOD, "powderblue", "yellow",
        "When a particle is activated, 20% chance to move it to another random empty position and generate 1 MW for every 8 α it has.",
        1, 10, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let chance = p.reactor.run.random();
                if (chance < 0.2) {
                    let available_positions = new Array(p.reactor.particles.length).fill(0).map((_, i) => i).filter(pt_i => {
                        return p.reactor.particles[pt_i] ? true : false;
                    });

                    if (available_positions.length > 0) {
                        let new_index = obj_seeded_random_from_array(available_positions, p.reactor.run);

                        p.reactor.particles[p.index] = null;
                        p.reactor.particles[new_index] = p;
                        p.set_index(new_index);
                    }

                    let x_gen = Math.floor(p.x / 8);
                    if (x_gen > 0) {
                        p.reactor.modify_power(x_gen);
                    }
                }
            }
        }
    ),

    new ItemTemplate(
        "Inverted Containment Suspensions", "S", ItemType.MOD, "red", "lime",
        "When a particle is destroyed, move all other particles at the same height upwards if possible.",
        1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                let p_y = index_to_xy(p.index)[1];
                for (let x=0; x<CELL_WIDTH; x++) {
                    let pt_i = xy_to_index(x, p_y);
                    let pt = p.reactor.particles[pt_i];
                    if (p.id != pt.id) {
                        // find the index above, check it's in bounds and empty, then move up
                        let up_vec = new Vector2(x, p_y - 1);
                        let new_index = vector_to_index(up_vec);
                        if (p.reactor.in_bounds(up_vec) && !p.reactor.particles[new_index]) {
                            p.reactor.particles[pt.index] = null;
                            p.reactor.particles[new_index] = pt;
                            pt.set_index(new_index);
                        }
                    }
                }
            }
        }
    ),

    new ItemTemplate(
        "Automated Ring Aligners", "A", ItemType.MOD, "lightcoral", "lightcoral",
        "When a particle's β increases by 2 or more at once, it gains +1 β.",
        0.5, 12, {
            [ParticleTriggers.Y_INCREASED]: (item, p, data) => {
                if (data[0] >= 2) {
                    p.add_y(1);
                }
            }
        }
    ),

    new ItemTemplate(
        "Movable Containment Fields", "F", ItemType.MOD, "lightcoral", "yellow",
        "When a particle's β increases, move it to the right if possible. When a particle's β decreases, move it to the left if possible. When any particle moves, generate 1 MW.",
        0.5, 12, {
            [ParticleTriggers.Y_INCREASED]: (item, p, data) => {
                let xy = index_to_xy(p.index);
                let displaced_vec = new Vector2(xy[0]+1, xy[1]);
                let new_index = vector_to_index(displaced_vec);
                if (p.reactor.in_bounds(displaced_vec) && !p.reactor.particles[new_index]) {
                    p.reactor.particles[p.index] = null;
                    p.reactor.particles[new_index] = p;
                    p.set_index(new_index);
                }
            },

            [ParticleTriggers.Y_REDUCED]: (item, p, data) => {
                let xy = index_to_xy(p.index);
                let displaced_vec = new Vector2(xy[0]-1, xy[1]);
                let new_index = vector_to_index(displaced_vec);
                if (p.reactor.in_bounds(displaced_vec) && !p.reactor.particles[new_index]) {
                    p.reactor.particles[p.index] = null;
                    p.reactor.particles[new_index] = p;
                    p.set_index(new_index);
                }
            },

            [ParticleTriggers.INDEX_CHANGED]: (item, p, data) => {
                p.reactor.modify_power(1);
            }
        }
    ),

    new ItemTemplate(
        "Automatic Feeding Pipelines", "P", ItemType.MOD, "lime", "lime",
        "When a particle moves, move a random adjacent particle into its original position if possible and activate it.",
        0.5, 12, {
            [ParticleTriggers.INDEX_CHANGED]: (item, p, data) => {
                let original_index = data[0];
                
                let adjs = p.reactor.get_adjacent(p.index);
                if (adjs.length > 0) {
                    let pt = obj_seeded_random_from_array(adjs, p.reactor.run);
                    if (!p.reactor.particles[original_index]) {
                        p.reactor.particles[pt.index] = null;
                        p.reactor.particles[original_index] = pt;
                        pt.set_index(original_index);
                    }

                    p.reactor.activate_particle(pt.index);
                }
            }
        }
    ),

    new ItemTemplate(
        "Improved Power Runoffs", "R", ItemType.MOD, "powderblue", "yellow",
        "When a particle's α increases, generate 0.1x as much MW (rounded up).",
        0.5, 12, {
            [ParticleTriggers.X_INCREASED]: (item, p, data) => {
                p.reactor.modify_power(Math.ceil(data[0] * 0.1));
            }
        }
    ),

    new ItemTemplate(
        "Ring Containment Field Containment Field", "F", ItemType.MOD, "lightcoral", "yellow",
        "When a particle's β increases, generate 0.15x as much MW (rounded up).",
        0.5, 12, {
            [ParticleTriggers.Y_INCREASED]: (item, p, data) => {
                p.reactor.modify_power(Math.ceil(data[0] * 0.15));
            }
        }
    ),

    new ItemTemplate(
        "Overvoltage Correction Matrices", "M", ItemType.MOD, "orange", "lightgray",
        "When power is generated to above 25% of the current phase's power goal, activate the two particles with the highest α and β. If these are the same particle, activate it twice. Then increase the power requirement by 25% of the current phase's power goal. Stops activating past 500%.",
        0.5, 12, {
            [ParticleTriggers.POWER_GAINED]: (item, p, data) => {
                let threshold_factor = (item.temporary_data["powergen_threshold"]!==undefined ? item.temporary_data["powergen_threshold"] : 0.25);
                let threshold = p.reactor.run.get_goal() * threshold_factor;
                
                // if power is now greater than threshold, do the effect and raise threshold_factor by 0.25
                if (p.reactor.power > threshold && threshold_factor ) {
                    threshold_factor += 0.25;

                    let highest_x = p.reactor.particles.reduce((p, c) => (p && c) ? (c.x >= p.x ? c : p) : (c ? c : p), null);
                    let highest_y = p.reactor.particles.reduce((p, c) => (p && c) ? (c.y >= p.y ? c : p) : (c ? c : p), null);

                    p.reactor.activate_particle(highest_x.index);
                    p.reactor.activate_particle(highest_y.index);
                }

                item.temporary_data["powergen_threshold"] = threshold_factor;
            }
        }
    ),

    new ItemTemplate(
        "Tenure", "T", ItemType.MOD, "pink", "pink",
        "Gain one additional trial per phase.",
        0.5, 12, {
            // yes, this is meant to be empty
        }
    ),

    new ItemTemplate(
        "Self-Intensifying Memory Cells", "M", ItemType.MOD, "lightcoral", "yellow",
        "When a particle is activated, generate (0.07*α)+(0.1*β) MW multiplied by the number of trials already completed this phase, rounded up.",
        0.5, 12, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                p.reactor.modify_power(Math.ceil((0.07 * p.x) + (0.1 * p.y)) * (p.reactor.run.trial - 1));
            }
        }
    ),

    new ItemTemplate(
        "Exclusive Publishing Deal", "D", ItemType.MOD, "red", "gold",
        "When a particle is destroyed, gain 1 ◕ if this is the first particle with that name destroyed this trial.",
        0.25, 15, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                let activateds = (item.temporary_data["activateds"]!==undefined ? item.temporary_data["activateds"] : new Set());
                
                if (!activateds.has(p.template.name)) {
                    activateds.add(p.template.name);
                    p.reactor.run.modify_money(1, item.template.name);
                }

                item.temporary_data["activateds"] = activateds;
            }
        }
    ),

    new ItemTemplate(
        "Resonance Preamplifier", "P", ItemType.MOD, "lightgray", "powderblue",
        "When a particle is activated, increase the α of all adjacent particles by 1.",
        0.25, 15, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let adjs = p.reactor.get_adjacent(p.index, true, true);
                adjs.forEach(pt => {
                    pt.add_x(1);
                })
            }
        }
    ),

    new ItemTemplate(
        "Continuous Remodulation Fields", "F", ItemType.MOD, "red", "lightcoral",
        "When a particle is destroyed, increase the β of all adjacent particles by 1.",
        0.25, 15, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                let adjs = p.reactor.get_adjacent(p.index, true, true);
                adjs.forEach(pt => {
                    pt.add_y(1);
                })
            }
        }
    ),

    new ItemTemplate(
        "Integrated Centrifuge Arms", "C", ItemType.MOD, "lightgray", "lime",
        "When a particle is activated, if it has lower α than an adjacent particle, swap those two particles' positions. Chooses randomly if there are multiple.",
        0.1, 20, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let adjs = p.reactor.get_adjacent(p.index, true, true);
                adjs = adjs.filter(pt => pt.x > p.x);
                if (adjs.length > 0) {
                    let pt = obj_seeded_random_from_array(adjs, p.reactor.run);

                    let idx_original = p.index;
                    let idx_swap = pt.index;

                    p.reactor.particles[idx_original] = p.reactor.particles[idx_swap];
                    p.reactor.particles[idx_swap] = p;

                    pt.set_index(idx_original);
                    p.set_index(idx_swap);
                }
            }
        }
    ),

    new ItemTemplate(
        "Integrated Sophon Traps", "T", ItemType.MOD, "orange", "orange",
        "Reduce the required MW for each phase by 20%.",
        0.1, 20, {
            // this is deliberately empty
        }
    ),

    // studies
    new ItemTemplate(
        "On the Spontaneous Genesis of Activated Nanoparticles in High Electromagnetism Environments", "⧉", ItemType.STUDY,
        "white", "limegreen",
        "When a particle is activated, 100% chance to copy it to a random empty location. Every time this effect triggers, the chance decreases by 12.5% for the current trial.",
        1, 25, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let chance = (item.temporary_data["copy_on_trigger_chance"]!==undefined ? item.temporary_data["copy_on_trigger_chance"] : 1);
                if (p.reactor.run.random() < chance) {
                    let empty_spaces = p.reactor.find_empty_spaces();
                    if (empty_spaces.length > 0) {
                        let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                        p.reactor.copy_particle(p, newpos);

                        chance -= 0.125;
                        item.temporary_data["copy_on_trigger_chance"] = chance;
                    }
                }
            }
        }
    ),

    new ItemTemplate(
        "Experimental observations of stochastic phenomena at the sub-nano scale", "⧮", ItemType.STUDY,
        "powderblue", "limegreen",
        "When a particle is activated, grant it +2 α and +1 β and generate 2 MW, multiplied by <span class='specialnumber'>{{RANDOM_COUNT_MUL}}</span>. For every 100 times a random chance has been rolled for any reason in the entire run (current: <span class='specialnumber'>{{RANDOM_COUNT}}</span>), this multiplier increases by 1.",
        1, 25, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let mul = Math.floor(p.reactor.run.num_random_rolls / 100) + 1;

                p.add_x(2 * mul);
                p.add_y(1 * mul);
                p.reactor.modify_power(2 * mul);
            }
        }
    ),

    new ItemTemplate(
        "Progress toward a unified model of particle conductance", "⦒", ItemType.STUDY,
        "lightcoral", "limegreen",
        "When a particle gains β, it gains α equal to 50% of the amount (rounded down).",
        1, 25, {
            [ParticleTriggers.Y_INCREASED]: (item, p, data) => {
                let amt = Math.floor(data[0] * 0.5);

                p.add_x(amt);
            }
        }
    ),

    new ItemTemplate(
        "Effective production of beta-positive exotic particles using tight-mesh particle conglomerates", "⩯", ItemType.STUDY,
        "lime", "limegreen",
        `When a <span style='color:${rarity_cols[ParticleRarity.COMPOSITE]}'>[Composite]</span> particle is activated, 15% chance to create a random <span style='color:${rarity_cols[ParticleRarity.EXOTIC]}'>[Exotic]</span> particle in a random empty position, with the same particle type as the activated particle. Every time this effect triggers, the chance decreases by 1% for the current trial.`,
        1, 25, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                if (p.template.rarity == ParticleRarity.COMPOSITE) {
                    let chance = (item.temporary_data["copy_on_trigger_chance"]!==undefined ? item.temporary_data["copy_on_trigger_chance"] : 0.15);
                    if (p.reactor.run.random() < chance) {
                        let empty_spaces = p.reactor.find_empty_spaces();
                        if (empty_spaces.length > 0) {
                            // get the type of the particle and filter the particle list for only exotic particles with that type
                            let parts = particles_list.filter(pt => pt.typ == p.template.typ && pt.rarity == ParticleRarity.EXOTIC);
                            if (parts.length > 0) {
                                chance -= 0.01;

                                let p_template = obj_seeded_random_from_array(parts, p.reactor.run);
                                let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                                p.reactor.create_particle(newpos, new Particle(
                                    p.reactor, p_template, newpos
                                ));
                            }
                        }
                    }

                    item.temporary_data["copy_on_trigger_chance"] = chance;
                }
            }
        }
    ),

    new ItemTemplate(
        "A new form of localised nanoparticle energy maximisation?", "⭙", ItemType.STUDY,
        "red", "limegreen",
        "When a particle is about to be destroyed, multiply its α and β by 4.",
        1, 25, {
            // because of sequencing, this needs to be done as a special case
            // so nothing here!
        }
    ),

    new ItemTemplate(
        "A proposal for controlled magnetogenesis", "∬", ItemType.STUDY,
        "white", "limegreen",
        "When a particle is created, it gains +15 α and +12 β.",
        1, 25, {
            [ParticleTriggers.CREATED]: (item, p, data) => {
                p.add_x(15);
                p.add_y(12);
            }
        }
    ),

    new ItemTemplate(
        "Report on the efficacy of fixed-line supermagnetic arrays for high-energy particle containment", "⧦", ItemType.STUDY,
        "orange", "limegreen",
        "When a particle with positive β changes position, it moves back to its previous position if possible and loses -1 β.",
        0.5, 25, {
            [ParticleTriggers.INDEX_CHANGED]: (item, p, data) => {
                let original_index = data[0];

                if (p.y > 0 && original_index != p.index) {
                    if (!p.reactor.particles[original_index]) {
                        p.reactor.particles[p.index] = null;
                        p.reactor.particles[original_index] = p;
                        p.set_index(original_index);

                        p.add_y(-1);
                    }
                }
            }
        }
    ),

    new ItemTemplate(
        "Creation of low-uniformity metastructures as a unique signature for high-alpha nanoparticle collisions", "⦒", ItemType.STUDY,
        "magenta", "limegreen",
        "When a particle is destroyed, if it has >16 α, create a new random particle with the same rarity and type at a random empty position with 50% less α (rounded down) and the same β. Every time this effect triggers, the α requirement increases by 2 for the current trial.",
        0.5, 25, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                let req = (item.temporary_data["destroy_recreate_trigger_req"]!==undefined ? item.temporary_data["destroy_recreate_trigger_req"] : 16);
                if (p.x > req) {
                    let parts = particles_list.filter(
                        pt => pt.typ == p.template.typ && pt.rarity == p.template.rarity
                    );

                    let empty_spaces = p.reactor.find_empty_spaces();

                    if (parts.length > 0 && empty_spaces.length > 0) {
                        let p_template = obj_seeded_random_from_array(parts, p.reactor.run);
                        let newpos = obj_seeded_random_from_array(empty_spaces, p.reactor.run);

                        p.reactor.create_particle(newpos, new Particle(
                            p.reactor, p_template, newpos, Math.floor(p.x * 0.5), p.y
                        ));
                        
                        req += 2;
                    }
                }

                item.temporary_data["destroy_recreate_trigger_req"] = req;
            }
        }
    ),

    new ItemTemplate(
        "Nanoparticle Physics for Humans: A macro-sized encyclopedia of the world's smallest things", "⍌", ItemType.STUDY,
        "pink", "limegreen",
        "When a particle's α or β increases, multiply it by 1.1x (rounded down), without triggering other change effects.",
        0.5, 25, {
            [ParticleTriggers.X_INCREASED]: (item, p, data) => {
                p.x = Math.floor(p.x * 1.1);
            },

            [ParticleTriggers.Y_INCREASED]: (item, p, data) => {
                p.y = Math.floor(p.y * 1.1);
            }
        }
    ),

    new ItemTemplate(
        "The nanoparticle smasher's guide", "⤓", ItemType.STUDY,
        "yellow", "limegreen",
        "When a particle is destroyed, generate MW equal to (0.6*α)+(0.9*β), rounded up.",
        0.5, 25, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                p.reactor.modify_power(Math.ceil((p.x * 0.6) + (p.y * 0.9)));
            }
        }
    ),

    new ItemTemplate(
        "Economics and electricity: a comparison of methods for effective waste reuse and repurposing", "⟠", ItemType.STUDY,
        "gold", "limegreen",
        "When a particle is destroyed, 40% chance to gain 1 ◕. This is capped at a maximum of 10 ◕ per trial.",
        0.5, 25, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                let trial_destroy_money_cnt = (item.temporary_data["trial_destroy_money_cnt"]!==undefined ? item.temporary_data["trial_destroy_money_cnt"] : 0);
                if (trial_destroy_money_cnt < 10) {
                    trial_destroy_money_cnt++;

                    p.reactor.run.modify_money(1, item.template.name);
                }

                item.temporary_data["trial_destroy_money_cnt"] = trial_destroy_money_cnt;
            }
        }
    ),

    new ItemTemplate(
        "\"We have ignition!\": A new way forward for clean, infinite energy", "⟔", ItemType.STUDY,
        "red", "limegreen",
        "The first 16 particles to be destroyed are no longer destroyed when they would be (on-destroy effects still trigger).",
        0.5, 25, {
            // No effects - special case again
        }
    ),
]

let overflow_study = new ItemTemplate(
    "The beauty of excess and the means to channel it", "∅", ItemType.STUDY,
    "lightgreen", "forestgreen",
    "When the reaction starts, gain 1 ◕.",
    0, 25, {
        [ParticleTriggers.START]: (item, p, data) => {
            p.reactor.run.modify_money(1, item.template.name)
        }
    }
)

let items_lookup = new Map();
let items_drop_table_mods = [];
let items_drop_table_studies = [];

items_list.forEach(i => {
    items_lookup.set(i.name, i);

    if (i.typ == ItemType.MOD) {
        items_drop_table_mods.push([i.rarity, i]);
    } else if (i.typ == ItemType.STUDY) {
        items_drop_table_studies.push([i.rarity, i]);
    }
})

particles_drop_table = balance_weighted_array(particles_drop_table);
items_drop_table_mods = balance_weighted_array(items_drop_table_mods);
items_drop_table_studies = balance_weighted_array(items_drop_table_studies);



function start_run(run) {
    run.setup_reactor();

    run.reactor.start_operation();
    run.reactor.render_particles();
    render_ingame_stats(run);
}

sw = true;

function step_reactor(run) {
    // console.log(run.reactor.queued_triggers);
    // console.log(run.reactor.operation_data);

    if (run.reactor.is_empty()) {
        run.reactor.for_all_particles((p, i) => {
            run.reactor.heats[i] = Heats.NOTHING;
        })

        run.reactor.render_particles();
        return false;
    }

    if (sw) {
        let result = 0;
        while (result == 0) {
            result = run.reactor.pop_trigger();
        }

        if (result == -1) {
            if (run.reactor.step_operation()) {
                // console.log("Looping");
                run.reactor.refresh_operation();
            }
        }
    } else {
        
    }

    sw = !sw;

    run.reactor.render_particles();
    render_ingame_stats(run);

    return true;
}

class Run {
    constructor(seed, reactor, reactor_operation_type, particle_order, items, money, round, phase, in_shop) {
        this.reactor = reactor;
        this.particle_order = particle_order;
        this.reactor_operation_type = reactor_operation_type;

        this.items = items;
        this.money = money;
        this.round = round;  // big rounds
        this.phase = phase;  // small phases
        this.trial = 1;      // 3 max trials per phase (by default), ends after reaching 1x threshold, bonus money for unused trials
        this.max_trials = 3;

        this.current_phase_power = 0;

        this.destruction_skips_max = 0;
        this.destruction_skips = 0;

        this.seed = seed;

        this.num_random_rolls = 0;
        this._random = get_seeded_randomiser(seed);

        this.in_shop = in_shop;

        this.shop_items = {
            reroll_price: 5,
            remove_price: 2,
            num_rerolls: 0,
            particles: [],
            items: [],
        }

        this.base_stats = {
            reroll_base_cost: 2,
            reroll_cost_scaling: 3,

            remove_base_cost: 2,

            shop_particles_count: 4,
            shop_items_count: 3,

            interest_rate: 0.2,
            interest_max: 10,
        }

        this.money_gain_sources = {
            game: 0,
            items: 0
        }

        this.money_gain_sources_cur = {
            game: 0,
            items: 0
        }

        this.selected_shop_item = null;
    }

    random() {
        this.num_random_rolls++;
        return this._random();
    }

    get_base_money_gain() {
        return 3;
    }

    get_unused_trials_money_gain() {
        return (this.max_trials - Math.max(1, this.trial + (this.reactor.running ? 1 : 0) - 1)) * 2
    }

    get_goal_achievement_money_gain() {
        let pct = Math.max(0, Math.min(5, this.get_current_goal_pct()));
        let pct_rounded = Math.floor(pct);

        return pct_rounded * 2;
    }

    get_interest_money_gain() {
        return Math.max(0, Math.min(this.base_stats.interest_max, Math.round(this.money * this.base_stats.interest_rate)));
    }

    get_phase_end_money_gain() {
        return Math.round(this.get_base_money_gain() + this.get_unused_trials_money_gain() + this.get_goal_achievement_money_gain() + this.get_interest_money_gain());
    }

    get_current_power() {
        return this.current_phase_power + this.reactor.power;
    }

    get_current_goal_pct() {
        let pct = this.get_current_power() / this.get_goal();
        return pct;
    }

    next_trial() {
        this.trial++;
        if (this.trial <= this.max_trials) {
            // reset reactor
            this.setup_reactor();
            this.reactor.start_operation();
            this.reactor.render_particles();

            return true;
        } else {
            return false;
        }
    }

    end_current_phase() {
        // only do so if we have enough power
        if (this.get_current_goal_pct() >= 1) {
            let gained_money = this.get_phase_end_money_gain();
            this.money += gained_money;

            this.current_phase_power = 0;
            this.money_gain_sources_cur = {
                game: 0,
                items: 0
            }
            this.trial = 1;

            let progressed_round = false;
            this.phase++;
            if (this.phase >= 4) {
                this.phase = 1;
                this.round++;

                progressed_round = true;
            }

            // and remake the reactor just to be sure
            this.setup_reactor();
            this.reactor.start_operation();
            this.reactor.render_particles();
            document.querySelector(".reactor").classList.add("interactable");

            // reopen the shop, and reroll it for free
            // if progressed round, items are studies instead
            if (progressed_round) {
                this.reroll_shop(true, true, null, 2);
            } else {
                this.reroll_shop(true, true);
            }

            show_shop_tab();
            render_shop(this);
            render_ingame_stats(this);
            this.in_shop = true;
        }
    }

    modify_money(by, source) {
        this.money += by;

        this.money_gain_sources[source] += by;
        this.money_gain_sources_cur[source] += by;

        render_ingame_stats(this);
    }

    purchase_item(data, index) {
        // add to the list of items, re-render items, re-render shop, remove money
        if (this.money >= data[1]) {
            this.modify_money(-data[1], "shop_items");

            this.items.push(new Item(data[0], {}));
            this.shop_items.items.splice(index, 1);

            // if this is Tenure, add an additional trial
            if (data[0].name == "Tenure") {
                this.max_trials++;
            }

            render_shop(this);
            render_items(this.items, this);
            render_ingame_stats(this);
        }
    }

    swap_particles(idx2) {
        let idx1 = this.selected_shop_item.index;

        let swp = this.particle_order[idx2];
        this.particle_order[idx2] = this.particle_order[idx1];
        this.particle_order[idx1] = swp;

        run.selected_shop_item.element.classList.remove("selected");
        document.querySelector("#reactor").classList.remove("buyingitem");

        this.selected_shop_item = null;

        this.setup_reactor();
        this.reactor.start_operation();
        this.reactor.render_particles();
        render_shop(this);
        render_ingame_stats(this);
    }

    purchase_particle(item_index, reactor_index) {
        let data = this.selected_shop_item.data;
        if (this.money >= data[1]) {
            this.modify_money(-data[1], "shop_particles");

            this.particle_order[reactor_index] = data[0];

            run.selected_shop_item.element.classList.remove("selected");
            if (run.selected_shop_item.typ == "particle") {
                document.querySelector("#reactor").classList.remove("buyingitem");
            }

            if (item_index != null) { 
                this.shop_items.particles.splice(item_index, 1);
            }

            this.selected_shop_item = null;
            
            this.setup_reactor();
            this.reactor.start_operation();
            this.reactor.render_particles();
            render_shop(this);
            render_ingame_stats(this);
        }
    }

    roll_shop_particles(forced_particle_spawns=null) {
        let shop_particles = [];
        for (let i=0; i<Math.min(forced_particle_spawns ? forced_particle_spawns.length : 0, this.base_stats.shop_particles_count); i++) {
            let fp = forced_particle_spawns[i];
            // fp can either be a particle, a specific rarity, a specific type, or both
            let particle_template = null;
            if (fp.particle) {
                particle_template = fp.particle;
            } else {
                let drop_table = balance_weighted_array(particles_drop_table.filter(ps => (!fp.rarity || ps[1].rarity == fp.rarity) && (!fp.typ || ps[1].typ == fp.typ)));
                particle_template = obj_weighted_seeded_random_from_arr(drop_table, this)[1];
            }

            shop_particles.push([particle_template, particle_template.value]);
        }

        let particles_n = this.base_stats.shop_particles_count - shop_particles.length;
        for (let i=0; i<particles_n; i++) {
            let particle_template = obj_weighted_seeded_random_from_arr(particles_drop_table, this)[1];
            shop_particles.push([particle_template, particle_template.value]);
        }

        this.shop_items.particles = shop_particles;
    }

    roll_shop_items(num_mods_override=-1, num_studies_override=-1) {
        let shop_items = [];
        for (let i=0; i<(num_mods_override != -1 ? num_mods_override : this.base_stats.shop_items_count); i++) {
            let item_template = obj_weighted_seeded_random_from_arr(items_drop_table_mods, this)[1];
            shop_items.push([item_template, item_template.value]);
        }

        // duplicate studies can never roll, except for the last one (filler) which has a drop rate of 0 otherwise
        for (let i=0; i<(num_studies_override != -1 ? num_studies_override : 0); i++) {
            let studies_drop_table = balance_weighted_array(items_drop_table_studies.filter(
                it1 => ![...run.items.map(m => m.template), ...shop_items.map(m => m[0])].some(it2 => it1[1].id == it2.id)
            ));
            
            let item_template = overflow_study; // default to the overflow study
            if (studies_drop_table.length > 0) {
                item_template = obj_weighted_seeded_random_from_arr(studies_drop_table, this)[1];
            }
            shop_items.push([item_template, item_template.value]);
        }

        this.shop_items.items = shop_items;
    }

    get_goal(round, phase) {
        let base_goal = Math.ceil(Math.pow(4, (round ? round : this.round)-1) * (10 * (2 + (((phase ? phase : this.phase)/0.5))))) - 20;
        let final_goal = base_goal - Math.ceil(base_goal * 0.2 * this.items.reduce((cnt, item) => item.template.name == "Integrated Sophon Traps" ? cnt + 1 : cnt, 0))
        return final_goal;
    }

    setup_reactor() {
        // clear out items' temporary data
        this.items.forEach(item => item.reset())

        let destruction_skip_study_count = this.items.reduce((cnt, item) => item.template.name == "\"We have ignition!\": A new way forward for clean, infinite energy" ? cnt + 1 : cnt, 0);
        this.destruction_skips_max = destruction_skip_study_count * 16;
        this.destruction_skips = this.destruction_skips_max;

        this.reactor = new Reactor(this, this.particle_order, [], this.items, this.reactor_operation_type);
    }

    set_particle_order(to) {
        if (this.reactor && !this.reactor.running) {
            this.particle_order = to;
            if (this.reactor.ready) {
                // reset it
                this.reactor.start_operation();
            }
        } else {
            throw Error("Tried to set particle order with no or busy reactor!");
        }
    }
    
    reroll_shop(reset_rerolls=false, roll_items=false, num_mods_override=-1, num_studies_override=-1) {
        this.shop_items.num_rerolls++;
        if (reset_rerolls) {
            this.shop_items.num_rerolls = 0;
        }

        this.shop_items.reroll_price = this.base_stats.reroll_base_cost + (this.base_stats.reroll_cost_scaling * this.shop_items.num_rerolls);

        this.roll_shop_particles(null);
        if (roll_items) {
            this.roll_shop_items(num_mods_override, num_studies_override);
        }
    }
}

let run = new Run(Date.now().toString(), null, OperationTypes.HOTSPOT, new Array(16).fill(null), [], 16, 1, 1, true);

function reactor_start_trial(run) {
    run.reactor.running = true;
    document.querySelector(".reactor").classList.remove("interactable");
}

function reactor_end_trial(run) {
    // save power
    run.current_phase_power += run.reactor.power;

    run.reactor.running = false;
    run.reactor.power = 0;

    render_ingame_stats(run);
    render_active_tab();

    if (run.next_trial()) {
        document.querySelector(".reactor").classList.add("interactable");
        return true;
    } else {
        console.log("no more trials! (check if player has enough to progress, if they don't the game ends)");
        return false;
    }
}

const ms_per_action = 25;
let speed_mult = 1;

let last_reactor_tick = Date.now();

document.addEventListener("DOMContentLoaded", function(e) {
    start_run(run);

    game_loop = function() {
        // if reactor is running, step it
        if (run.reactor.running) {
            // consider delta time here
            if (Date.now() > last_reactor_tick + (ms_per_action * (1/speed_mult))) {
                last_reactor_tick = Date.now();
                
                let result = step_reactor(run);
                if (!result) {
                    // reactor is done
                    reactor_end_trial(run);
                }

                render_active_tab();
            }
        }

        // if it isn't, don't do anything

        // then go agane!
        window.requestAnimationFrame(game_loop);
    }

    window.requestAnimationFrame(game_loop);

    document.addEventListener("keydown", e => {
        if (e.code == "KeyR") {
            // shortcut to start maybe? idk
        }

        if (e.code == "Escape") {
            if (run.in_shop) {
                run.selected_shop_item = null;
                document.querySelector("#shop_remove_button").classList.remove("selected");
                document.querySelector("#reactor").classList.remove("buyingitem");

                render_shop(run);
            }
        }
    })

    document.body.addEventListener("click", e => {
        run.selected_shop_item = null;
        document.querySelector("#shop_remove_button").classList.remove("selected");
        document.querySelector("#reactor").classList.remove("buyingitem");

        render_shop(run);
    })

    document.querySelectorAll(".reactor .cell").forEach((c, i) => {
        c.setAttribute("cell_index", i);
        c.addEventListener("mouseover", e => {
            show_cell_info(run.reactor.particles[i]);
        })
        c.addEventListener("mouseout", e => {
            show_cell_info(null);
        })
        c.addEventListener("click", e => {
            if (run.selected_shop_item?.typ == "particle") {
                if (run.selected_shop_item.data[0] || run.reactor.particles[i]) {
                    run.purchase_particle(run.selected_shop_item.index, i);
                }
            } else {
                // check if the reactor is active. if it isn't:
                // if a particle is selected, perform the swap
                // if a particle isn't selected, check if this has a particle. if it does, select it
                if (!run.reactor.running) {
                    if (run.selected_shop_item?.typ == "reactor_particle") {
                        // need to swap the positions. this is actually pretty easy... i think
                        run.swap_particles(i);
                    } else {
                        if (run.particle_order[i]) {
                            c.classList.add("selected");
                            document.querySelector("#reactor").classList.add("buyingitem");

                            run.selected_shop_item = {
                                element: c,
                                typ: "reactor_particle",
                                data: null,
                                index: i
                            }

                            render_shop(run);
                        }
                    }
                }
            }

            e.stopPropagation();
        })
    })

    document.querySelector("#shop_reroll_button").addEventListener("click", e => {
        if (run.money >= run.shop_items.reroll_price) {
            run.modify_money(-run.shop_items.reroll_price, "shop_rerolls");

            run.reroll_shop();
            render_shop(run);
        }
    })

    document.querySelector("#shop_continue_button").addEventListener("click", e => {
        run.in_shop = false;
        show_active_tab();
    })


    let remove_button = document.querySelector("#shop_remove_button");
    remove_button.addEventListener("click", e => {
        if (run.money >= run.shop_items.remove_price) {
            if (remove_button.classList.contains("selected")) {
                run.selected_shop_item = null;
                remove_button.classList.remove("selected");
                document.querySelector("#reactor").classList.remove("buyingitem");
            } else {
                document.querySelector("#reactor").classList.add("buyingitem");
                run.selected_shop_item?.element.classList.remove("selected");
                
                run.selected_shop_item = {
                    element: remove_button,
                    typ: "particle",
                    data: [null, run.shop_items.remove_price],
                    index: null
                }

                remove_button.classList.add("selected");
            }

            e.stopPropagation();
        }
    })

    document.querySelector("#trial_start_button").addEventListener("click", function(e) {
        if (!e.target.classList.contains("disabled")) {
            reactor_start_trial(run);
            render_active_tab();
        }
    })

    document.querySelector("#phase_end_button").addEventListener("click", function(e) {
        if (!e.target.classList.contains("disabled")) {
            run.end_current_phase();
        }
    })

    render_items(run.items);

    run.reroll_shop(true, true);
    render_shop(run);
});
