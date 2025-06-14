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

function get_cell_element(index) {
    return [...document.querySelectorAll(".reactor .cell")][index];
}

const ReactorNumberFormat = {
    SCIENTIFIC: 0,
    SHORT: 1,
    METRIC: 2,
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

function number_format(v, fmt, suffix="") {
    switch (fmt) {
        case ReactorNumberFormat.SCIENTIFIC:
            if (v.toString().length > 7) {
                return v.toExponential(3).replaceAll("+", "") + suffix;
            } else {
                return v;
            }

        case ReactorNumberFormat.SHORT: {
            if (v == 0) {
                return 0 + suffix;
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
            return (Math.round((v / divisor) * 1000) / 1000) + suffix_txt + suffix;
        }
        
        case ReactorNumberFormat.METRIC: {
            if (v == 0) {
                return 0 + " " + suffix;
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
                return "∞" + suffix;
            }

            let divisor = Math.pow(1000, factor);
            return (Math.round((v / divisor) * 1000) / 1000) + suffix_txt + suffix;
        }
    }
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
    X_INCREASED: "eWhen X increased",
    X_REDUCED: "fWhen X reduced",
    Y_INCREASED: "gWhen Y increased",
    Y_REDUCED: "hWhen Y reduced",
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
    }

    in_bounds(vec) {
        return (
            vec.x >= 0 &&
            vec.x < FRAME_WIDTH &&
            vec.y >= 0 &&
            vec.y < FRAME_HEIGHT
        )
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
            this.enqueue_trigger(i, ParticleTriggers.START, [], true);
        });

        this.for_all_particles((p, i) => {
            this.enqueue_trigger(i, ParticleTriggers.CREATED, [], true);
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
        this.particles[index] = null;
        this.heats[index] = Heats.DESTROYED;
    }
    
    destroy_particle(index) {
        if (this.particles[index]) {
            this.enqueue_trigger(index, ParticleTriggers.DESTROYED);
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
                this.enqueue_trigger(index, ParticleTriggers.CREATED);
            }
        }
    }

    activate_particle(index) {
        if (this.particles[index]) {
            this.enqueue_trigger(index, ParticleTriggers.ACTIVATED);
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

    modify_power(by) {
        console.log(`Power ${by > 0 ? "+" : ""}${by}`);

        this.power += by;
        if (by > 0) {
            this.for_all_particles((p, i) => {
                this.enqueue_trigger(i, ParticleTriggers.POWER_GAINED, [by])
            }, true)
        } else {
            this.for_all_particles((p, i) => {
                this.enqueue_trigger(i, ParticleTriggers.POWER_LOST, [-by])
            }, true)
        }
    }

    enqueue_trigger(particle_index, trigger_type, data=[], end=false) {
        if (particle_index < 0 || particle_index > MAX_INDEX) {
            // invalid index so discard
            return;
        }

        let v = {idx: particle_index, typ: trigger_type, data: data}
        if (end) {
            this.queued_triggers.push(v);
        } else {
            this.queued_triggers.unshift(v);
        }
    }

    pop_trigger() {
        let trigger = this.queued_triggers.shift();
        if (trigger) {
            let part = this.particles[trigger.idx];
            let out = part?.trigger(trigger.typ, trigger.data);

            if (part) {
                // broadcast the event to all items as well. they will manage their own mutable data so we just need to tell them something's happening
                this.items.forEach(item => {
                    item.trigger(trigger.typ, part, trigger.data);
                })

                if (trigger.typ == ParticleTriggers.DESTROYED) {
                    this._final_destroy_particle(trigger.idx);
                } else if (trigger.typ == ParticleTriggers.ACTIVATED) {
                    this.particles[trigger.idx].last_values.just_activated = true;
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
    [ParticleType.ANTIPARTICLE]: 0.5,
    [ParticleType.QUASIPARTICLE]: 0.2,
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
${this.triggers[k].desc.replaceAll("[[", "<span class='calculation'>").replaceAll("]]", "</span>").replaceAll("α", "<span class='cell-value-x'>α</span>").replaceAll("β", "<span class='cell-value-y'>β</span>")}
`).join("\n")}`
    }
}

class Particle {
    constructor(reactor, template, index, x=1, y=1) {
        this.reactor = reactor;
        this.template = template;
        this.index = index;

        this.x = x;
        this.y = y;

        this.power = 0;  // just a tracker of how much power this thing has made

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
        
        this[v] = to;

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
        }

        this.reactor.enqueue_trigger(this.index, ParticleTriggers[`${v.toUpperCase()}_${suffix}`], data);
    }

    set_x(to) {
        this.set_var("x", to);
    }

    set_y(to) {
        this.set_var("y", to);
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
        this.desc = desc;
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

    trigger(typ, data) {
        let trigger = this.template.subscriptions[typ];
        if (trigger) {
            trigger(this, data);
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

    // get the stuff for the labels
    tab.querySelector("#base-reward").textContent = `◕${run.get_base_money_gain()}`.padStart(9);
    tab.querySelector("#trials-reward").textContent = `◕${run.get_unused_trials_money_gain()}`.padStart(9);
    tab.querySelector("#goal-reward").textContent = `◕${run.get_goal_achievement_money_gain()}`.padStart(9);
    
    tab.querySelector("#interest-rate").textContent = `${Math.round(run.base_stats.interest_rate * 100)}`;
    tab.querySelector("#interest-max").textContent = `${run.base_stats.interest_max >= 100 ? " " : ": "}${run.base_stats.interest_max}`;
    tab.querySelector("#interest-reward").textContent = `◕${run.get_interest_money_gain()}`.padStart(9);
   
    tab.querySelector("#total-reward").textContent = `◕${run.get_phase_end_money_gain()}`.padStart(9);
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
                c[2](p[0]);
            });

            clone.addEventListener("mouseout", e => {
                c[2](null);
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
                            if (run.selected_shop_item.typ == "particle") {
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
            show_item_info(item);
        })
        
        clone.addEventListener("mouseout", e => {
            show_item_info(null);
        })

        items_list.appendChild(clone);
    })
}

function show_item_info(item) {
    if (!item) {
        document.querySelector(".info-area .infobox").innerHTML = "";
        return;
    }

    let typecol = item.typ == ItemType.STUDY ? "lime" : "white";
    let italics = item.typ == ItemType.STUDY ? "italic" : "";
    document.querySelector(".info-area .infobox").innerHTML = `<span style="white-space:inherit; font-style:${italics}; color:${item.col}">${item.name}</span>\n<span style="color:${typecol}">[${item.typ}]</span>\n\n${item.desc}`;
}

function show_cell_info(particle) {
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
    let power_proportion = run.get_current_goal_pct();
    bar_level = Math.max(0, Math.min(4, Math.floor(power_proportion)));
    bar_point = Math.min(bar_length, Math.floor((power_proportion - bar_level) * bar_length));

    let bar_str = `[<span class="p${bar_level+1}">${"#".repeat(bar_point)}</span><span class="p${bar_level}">${"#".repeat(bar_length - bar_point)}</span>]`

    document.querySelector(".stats .powerbar").innerHTML = bar_str;
}

let particle_template = new ParticleTemplate("Metastatic Matter", "Θ", "white", 3, ParticleRarity.FUNDAMENTAL, ParticleType.PARTICLE, {
    [ParticleTriggers.ACTIVATED]: {
        desc: "Double own α.",
        fn: (p, data) => { p.set_x(p.x * 2); }
    },
    [ParticleTriggers.DESTROYED]: {
        desc: "Generate power equal to [[α*β]].",
        fn: (p, data) => { p.modify_power(p.x * p.y); }
    },
})

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
    particle_template,
    particle_template2,
    particle_template3
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
        "Refined Power Reclamation Apparatus", "P", ItemType.MOD, "yellow", "white", "When a particle is destroyed and has positive β, gain power equal to 10% of its β, rounded up.", 1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => {
                console.log("hi");
                if (p.y > 0) {
                    p.reactor.modify_power(Math.ceil(p.y / 10));
                }
            }
        }
    ),

    new ItemTemplate(
        "Elastic Batteries", "E", ItemType.MOD, "yellow", "white", "When 4 MW or more is lost at once, generate 1 MW.", 1, 10, {
            [ParticleTriggers.POWER_LOST]: (item, p, data) => { if (data[0] >= 4) { p.reactor.modify_power(1) } }
        }
    ),

    new ItemTemplate(
        "Gold-Lined Capacitors", "G", ItemType.MOD, "yellow", "gold", "When a particle is destroyed, generate 1 MW for every ◕ currently held.", 1, 10, {
            [ParticleTriggers.DESTROYED]: (item, p, data) => { if (p.reactor.run.money > 0) { p.reactor.modify_power(p.reactor.run.money) } }
        }
    ),

    // studies
    new ItemTemplate(
        "On the Spontaneous Genesis of Activated Nanoparticles in High Electromagnetism Environments", "∬", ItemType.STUDY,
        "white", "limegreen", "When a particle is activated, 50% chance to copy it to a random empty location. Every time this effect triggers, the chance decreases by 15% for the current trial.",
        1, 25, {
            [ParticleTriggers.ACTIVATED]: (item, p, data) => {
                let chance = (item.temporary_data["copy_on_trigger_chance"] ? item.temporary_data["copy_on_trigger_chance"] : 0.5);
                if (p.reactor.run.random() < chance) {
                    // TODO write code to copy the particle
                    // remember to have a way to export the current state of the random! we want to save games eventually
                    // :3
                    // also bring in the code to highlight stuff in here as well, to highlight keywords, numbers, money, power etc
                    // dont bother doing this right now

                    chance -= 0.15;
                    item.temporary_data["copy_on_trigger_chance"] = chance;
                }
            }
        }
    )
]

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

/*
Anti-neutrino
[Exotic]
Flip A/B for all surrounding particles.

TODO make items able to "subscribe" to events so they can do shit as well

then we need to make the gameplay loop, plus the shop
*/

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

        this.seed = seed;
        this.random = get_seeded_randomiser(seed);

        this.in_shop = in_shop;

        this.shop_items = {
            reroll_price: 5,
            remove_price: 2,
            num_rerolls: 0,
            particles: [],
            items: [],
        }

        this.base_stats = {
            reroll_base_cost: 5,
            reroll_cost_scaling: 3,

            remove_base_cost: 2,

            shop_particles_count: 4,
            shop_items_count: 2,

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

    get_base_money_gain() {
        return 3;
    }

    get_unused_trials_money_gain() {
        return (this.max_trials - Math.max(1, this.trial - 1)) * 2
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
            this.modify_money(-data[1]);

            this.items.push(new Item(data[0], {}));
            this.shop_items.items.splice(index, 1);

            render_shop(this);
            render_items(this.items);
        }
    }

    purchase_particle(item_index, reactor_index) {
        let data = this.selected_shop_item.data;
        if (this.money >= data[1]) {
            this.modify_money(-data[1]);

            this.particle_order[reactor_index] = data[0];

            run.selected_shop_item.element.classList.remove("selected");
            if (run.selected_shop_item.typ == "particle") {
                document.querySelector("#reactor").classList.remove("buyingitem");
            }

            if (item_index != null) { 
                this.shop_items.particles.splice(item_index, 1);
            }

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
                particle_template = weighted_seeded_random_from_arr(drop_table, this.random)[1];
            }

            shop_particles.push([particle_template, particle_template.value]);
        }

        let particles_n = this.base_stats.shop_particles_count - shop_particles.length;
        for (let i=0; i<particles_n; i++) {
            let particle_template = weighted_seeded_random_from_arr(particles_drop_table, this.random)[1];
            shop_particles.push([particle_template, particle_template.value]);
        }

        this.shop_items.particles = shop_particles;
    }

    roll_shop_items(num_mods_override=-1, num_studies_override=-1) {
        let shop_items = [];
        for (let i=0; i<(num_mods_override != -1 ? num_mods_override : this.base_stats.shop_items_count); i++) {
            let item_template = weighted_seeded_random_from_arr(items_drop_table_mods, this.random)[1];
            shop_items.push([item_template, item_template.value]);
        }

        for (let i=0; i<(num_studies_override != -1 ? num_studies_override : 0); i++) {
            let item_template = weighted_seeded_random_from_arr(items_drop_table_studies, this.random)[1];
            shop_items.push([item_template, item_template.value]);
        }

        this.shop_items.items = shop_items;
    }

    get_goal(round, phase) {
        return Math.ceil(Math.pow(4, (round ? round : this.round)-1) * (10 * (2 + (((phase ? phase : this.phase)/0.5))))) - 20;
    }

    setup_reactor() {
        // clear out items' temporary data
        this.items.forEach(item => item.reset())

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
    render_ingame_stats(run);

    run.current_phase_power += run.reactor.power;

    run.reactor.running = false;
    run.reactor.power = 0;
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
            if (Date.now() > last_reactor_tick + (ms_per_action * speed_mult)) {
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
            }

            e.stopPropagation();
        })
    })

    document.querySelector("#shop_reroll_button").addEventListener("click", e => {
        if (run.money >= run.shop_items.reroll_price) {
            run.modify_money(-run.shop_items.reroll_price);

            run.reroll_shop();
            render_shop(run);
        }
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
            render_active_tab();
        }
    })

    render_items(run.items);

    run.reroll_shop(true, true);
    render_shop(run);
});

// TODO implement continue button from shop and the active buttons from play