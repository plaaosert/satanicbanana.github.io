/*
gonna go with a similar system to crpg, but with 100 skill levels
in each category instead, and unique (maybe +procgen) equipment

stats:
- MHP: max hp
- ATK: attack; damage of physical abilities.
- ATT: attunement; damage of magical abilities.
- DEF: defense; physical damage reduction.
- MDF: magical defense: magical damage reduction.
- SPD: speed; determines the speed multiplier of all abilities.
- ACC: accuracy; hit modifier bonus. (magical abilities cannot miss)
- EVA: evasion; dodge chance bonus.
- [crit chance] - crit chance. based mostly on equipment and skill used. crits are 2x damage and pierce 50% defense.
    magical damage can crit, but does not use this as a bonus (only innate crit chance).
- [weight] - based on equipment. mostly reduces SPD, as well as ACC/EVA less so.

for equipment,
each skill level grants +1 proficiency in relevant items which translates into:
weapons:
    - +1% ATK
    - +0.05 ACC
armour:
    - -0.2% effective weight
artifacts:
    - nothing

gain unique bonuses at milestones in level:
10   | stat bonus only available w/ equipment
20   | permanent stat bonus
25   | (weapons only) unique skill only available w/ weapon
40   | permanent stat bonus
50   | stat bonus only available w/ equipment
60   | permanent stat bonus
75   | stat bonus only available w/ equipment
80   | permanent stat bonus
100  | unique ultimate skill (only available for that item), passive skill for armour

other, non-combat skills also have 100 levels, but differ in their bonuses.
most are one bonus every 10 levels though

there is also the "Combat" skill which is kind of like an overarching player level, and needs WAY more xp than any of the weapon skills
combat grants proficiency to every item

Artifact Mastery grants proficiency to all artifacts
*/
const WEIGHT_SPD_PENALTY_FACTOR = 1;
const WEIGHT_ACC_EVA_PENALTY_FACTOR = 0.25;

class Battle {
    constructor(ent1, ent2) {
        this.ent1 = ent1;
        this.ent2 = ent2;

        this.entities = [ent1, ent2];
    }

    start_battle() {
        // set up starting global delay
        this.entities.forEach(ent => {
            ent.set_starting_delays();
        })
    }

    step(delta_time) {
        // find out the time to pass by taking the lowest entry in this list
        let shortest_time_to_pass = Math.min(
            ...this.entities.map(e => e.time_until_next_action())
        )

        // but because we're rendering it, just pass 1 time unit for now
        let time_to_pass = delta_time;

        // pass time, then tell entity to take their turn (they check if they can act)
        this.entities.forEach(ent => {
            ent.pass_time(time_to_pass, true);
        })

        this.ent1.try_take_turn(this, this.ent2);
        this.ent2.try_take_turn(this, this.ent1);
    }
}


const DamageType = {
    PHYSICAL: "Physical",
    MAGICAL: "Magical",
    UNTYPED: "Untyped",
}


class Effect {
    constructor(item, positive, forever) {
        this.item = item;
        this.positive = positive;
        this.forever = forever;
        
        this.time_left = 0;
    }

    effect_string() {
        // get the different values for each stat, then add each of them to the string
        let stat_values = new Set();
        Entity.stat_names.forEach(v => {
            let st = "";
            if (this.item.stats_flat[v]) {
                if (this.item.stats_flat[v] > 0) {
                    st += "+";
                }
                st += `${this.item.stats_flat[v]}`;
            }

            if (this.item.stats_flat[v] && this.item.stats_mult[v]) {
                st += " and ";
            }

            if (this.item.stats_mult[v]) {
                if (this.item.stats_mult[v] > 0) {
                    st += "+";
                }
                st += `${Math.round(this.item.stats_mult[v] * 100)}%`;
            }

            if (st) {
                stat_values.add(st);
            }
        });

        
        let final = Array.from(stat_values).map(val => {
            let matches = [];
            Entity.stat_names.forEach(v => {
                let st = "";
                if (this.item.stats_flat[v]) {
                    if (this.item.stats_flat[v] > 0) {
                        st += "+";
                    }
                    st += `${this.item.stats_flat[v]}`;
                }
    
                if (this.item.stats_flat[v] && this.item.stats_mult[v]) {
                    st += " and ";
                }
    
                if (this.item.stats_mult[v]) {
                    if (this.item.stats_mult[v] > 0) {
                        st += "+";
                    }
                    st += `${Math.round(this.item.stats_mult[v] * 100)}%`;
                }

                if (st == val) {
                    matches.push(v);
                }
            });

            return `${val} ${matches.join("+")}`;
        })

        return format_effect_string(final.join(", "));
    }

    make(for_turns) {
        let t = new Effect(this.item, this.positive, this.forever);
        t.time_left = for_turns;

        return t;
    }

    pass_time(time) {
        if (!this.forever) {
            this.time_left -= time;
        }
        
        return this.expired();
    }

    expired() {
        if (this.time_left <= 0) {
            return true;
        }

        return false;
    }
}


class Entity {
    static stat_names = [
        "MHP",
        "ATK",
        "ATT",
        "DEF",
        "MDF",
        "SPD",
        "ACC",
        "EVA",
        "CRIT_CHANCE",
        "WEIGHT_MODIFIER"
    ];

    constructor(template, name, equipped_items) {
        this.template = template;
        
        this.name = name;

        this.delays = new Array(template.abilities.length).fill(0);
        this.last_uses = new Array(template.abilities.length).fill(Date.now());

        this.hp = 0;

        this.base_stats = {
            MHP: 0,
            ATK: 0,
            ATT: 0,
            DEF: 0,
            MDF: 0,
            SPD: 0,
            ACC: 0,
            EVA: 0,
            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }

        this.crit_chance = 0;
        this.weight = 0;

        this.bonus_stats = {
            MHP: 0,
            ATK: 0,
            ATT: 0,
            DEF: 0,
            MDF: 0,
            SPD: 0,
            ACC: 0,
            EVA: 0,
            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }

        this.stats = {
            MHP: 0,
            ATK: 0,
            ATT: 0,
            DEF: 0,
            MDF: 0,
            SPD: 0,
            ACC: 0,
            EVA: 0,
            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }

        this.specials = new Set();
        this.effects = [];

        this.changes = {
            hp: true,
            effects: true,
            abilities: true,
            stats: true,
        }

        this.move_flags = {
            DEF_PIERCE_MUL: 0
        }

        this.equipped_items = equipped_items;
        this.setup_stats();
        this.refresh();
    }

    mark_change(typ) {
        this.changes[typ] = true;
    }

    check_change(typ) {
        if (this.changes[typ]) {
            this.changes[typ] = false;
            return true;
        }

        return false;
    }

    setup_stats() {
        // run on instantiation, and on level change
        Entity.stat_names.forEach(stat => {
            this.base_stats[stat] = this.template.base_stats[stat]
        });

        this.calculate_stats();
    }

    calculate_stats() {
        // run whenever items or effects change
        this.bonus_stats.MHP = 0;
        this.bonus_stats.ATK = 0;
        this.bonus_stats.ATT = 0;
        this.bonus_stats.DEF = 0;
        this.bonus_stats.MDF = 0;
        this.bonus_stats.SPD = 0;
        this.bonus_stats.ACC = 0;
        this.bonus_stats.EVA = 0;

        this.bonus_stats.CRIT_CHANCE = 0;
        this.bonus_stats.WEIGHT_MODIFIER = 0;

        let mults = {
            MHP: 1,
            ATK: 1,
            ATT: 1,
            DEF: 1,
            MDF: 1,
            SPD: 1,
            ACC: 1,
            EVA: 1,
            CRIT_CHANCE: 1,
            WEIGHT_MODIFIER: 1,
        }

        let total_weight = 0;

        // effects just refer to an item's equip component!
        let apply_items = [...this.equipped_items.map(e => [e[0].equip_component ? e[0].equip_component : e[0], e[1]]), ...this.effects.map(e => [e.item, 0])]
        apply_items.forEach(item => {
            // items apply on bonus stats in both cases and are additive with each other.
            // this means that a sword with +20 ATK and a ring with +15% ATK will apply as follows on a character with 100 ATK:
            // - Sword: +20 bonus ATK
            // - Ring:  +15 bonus ATK
            // - Total: +35 bonus ATK
            // Base and bonus ATK are summed together to get the final value. Some debuffs affect only base stats, some affect final stats.

            // Bonuses from skill levels are modelled as items ingame, equipped in "bonus slots".
            item[0].apply_to_stats(this.base_stats, this.bonus_stats, mults, item[1]);
            item[0].specials.forEach(s => this.specials.add(s));

            if (!(this.specials.has(ITEM_SPECIAL.light_armour_mastery_ender) && item[0].equippable_type == ITEM_TYPE.LIGHT_ARMOUR)) {
                total_weight += item[0].weight;
            }
        });

        if (this.specials.has(ITEM_SPECIAL.heavy_armour_mastery_ender) && apply_items.reduce((prev, cur) => {
            if (prev[0].equippable_type == ITEM_TYPE.HEAVY_ARMOUR) {
                return prev + 1;
            }
        }, 0) >= 3) {
            this.bonus_stats.ATT += total_weight * 1;
        }

        Entity.stat_names.forEach(stat => {
            this.base_stats[stat] = Math.round(this.base_stats[stat]);
            this.bonus_stats[stat] = Math.round(this.bonus_stats[stat]);

            if (stat != "WEIGHT_MODIFIER" && stat != "CRIT_CHANCE") {
                this.stats[stat] = (this.base_stats[stat] + this.bonus_stats[stat]) * mults[stat];
            } else {
                this.stats[stat] = (Math.max(0, this.base_stats[stat] + this.bonus_stats[stat])) * mults[stat];
            }

            this.stats[stat] = Math.round(this.stats[stat]);
        })

        total_weight -= this.stats.WEIGHT_MODIFIER;

        this.weight = total_weight;

        this.stats.SPD = Math.round(Math.max(0, this.stats.SPD - (this.weight * WEIGHT_SPD_PENALTY_FACTOR)));
        this.stats.ACC = Math.round(Math.max(0, this.stats.ACC - (this.weight * WEIGHT_ACC_EVA_PENALTY_FACTOR)));
        this.stats.EVA = Math.round(Math.max(0, this.stats.EVA - (this.weight * WEIGHT_ACC_EVA_PENALTY_FACTOR)));

        if (this.specials.has(ITEM_SPECIAL.medium_armour_mastery_ender) && apply_items.reduce((prev, cur) => {
            if (prev[0].equippable_type == ITEM_TYPE.MEDIUM_ARMOUR) {
                return prev + 1;
            }
        }, 0) >= 3) {
            this.stats.DEF += Math.round(this.stats.MDF * 0.25);
        }

        if (this.name == "You") {
            // MHP
            // ATK
            // ATT
            // DEF
            // MDF
            // SPD
            // ACC
            // EVA
            // CRIT_CHANCE
            // WEIGHT_MODIFIER

            document.getElementById("test_label1").textContent = `${this.stats.MHP} MHP`;

            document.getElementById("test_label2").textContent = `${this.stats.ATK} ATK`;
            document.getElementById("test_label3").textContent = `${this.stats.ATT} ATT`;

            document.getElementById("test_label4").textContent = `${this.stats.DEF} DEF (x${Math.round(100 * this.get_def_mul(this.stats.DEF)) / 100})`;
            document.getElementById("test_label5").textContent = `${this.stats.MDF} MDF (x${Math.round(100 * this.get_def_mul(this.stats.MDF)) / 100})`;
            
            document.getElementById("test_label6").textContent = `${this.stats.SPD} SPD (x${Math.round(100 * this.get_speed_mult()) / 100})`;

            document.getElementById("test_label7").textContent = `${this.stats.ACC} ACC`;
            document.getElementById("test_label8").textContent = `${this.stats.EVA} EVA`;

            document.getElementById("test_label9").textContent = `${this.stats.CRIT_CHANCE} CRIT_CHANCE`;
            document.getElementById("test_label10").textContent = `${this.stats.WEIGHT_MODIFIER} WEIGHT_MODIFIER`;
        }

        this.changes.hp = true;
        this.changes.stats = true;
        this.changes.abilities = true;
    }

    refresh() {
        this.changes.hp = true;

        this.hp = this.stats.MHP;
        this.set_starting_delays();
    }

    set_starting_delays() {
        this.changes.abilities = true;

        for (let i=0; i<this.delays.length; i++) {
            this.delays[i] = this.template.abilities[i].max_delay;
        }
    }

    time_until_next_action() {
        return Math.min(...this.delays);
    }

    get_def_mul(def) {
        let f = 100;
        return (f / (def + f));
    }

    calc_damage(dmg, dmgtype, def_ignore_flat, def_ignore_mul) {
        let def = 0;
        switch (dmgtype) {
            case DamageType.PHYSICAL:
                def = this.stats.DEF;
                break;

            case DamageType.MAGICAL:
                def = this.stats.MDF
                break;
        }

        def = def - def_ignore_flat - (def * def_ignore_mul);

        let final_dmg = dmg * this.get_def_mul(def);

        let variance = 0.2;
        let variance_mult = 1 + (-(variance / 2) + (grandom() * variance));
        final_dmg *= variance_mult;

        return Math.round(final_dmg);
    }

    get_hit_chance(source_acc) {
        // hit chance is (2x source ACC / (source ACC + target EVA)) + 0.1
        return Math.max(0, Math.min(1, ((2 * source_acc) / (source_acc + this.stats.EVA)) + 0.1));
    }

    initiate_move(target, dmg, dmgtype, crit_chance_bonus, acc_bonus, def_ignore_flat, def_ignore_mul) {
        // some specials will change the DEF ignore amount of certain things, for example
        target.receive_move(dmg, dmgtype, crit_chance_bonus, acc_bonus, def_ignore_flat, def_ignore_mul + this.move_flags.DEF_PIERCE_MUL, this.stats.ACC);
    }

    receive_move(dmg, dmgtype, crit_chance_bonus, acc_bonus, def_ignore_flat, def_ignore_mul, source_acc) {
        let will_hit = false;
        if (dmgtype != DamageType.PHYSICAL) {
            will_hit = true;
        }

        if (grandom() < this.get_hit_chance(source_acc + acc_bonus)) {
            will_hit = true;
        }

        if (will_hit) {
            let total_crit = crit_chance_bonus;
            let final_dmg = dmg;
            let final_def_ignore_mul = def_ignore_mul;

            if (dmgtype == DamageType.PHYSICAL) {
                total_crit += this.stats.CRIT_CHANCE;
            }

            // CRIT
            if (grandom() < (total_crit/100)) {
                final_dmg *= 2;
                final_def_ignore_mul += 0.5;
            }

            let d = this.calc_damage(final_dmg, dmgtype, def_ignore_flat, final_def_ignore_mul);

            this.lose_hp(d);

            this.say(`i just took ${d} ${dmgtype} damage!`);
            return d;
        } else {
            this.say(`i just dodged an attack`);
            return -1;
        }
    }

    say(msg) {
        // console.log(`[${this.name.padEnd(16)}] ${msg}`)
    }

    lose_hp(dmg) {
        this.mod_hp(-dmg);
    }

    gain_hp(amt) {
        this.mod_hp(amt);
    }

    mod_hp(by) {
        this.changes.hp = true;

        this.hp = Math.round(Math.max(0, Math.min(this.stats.MHP, this.hp + by)));
    }

    pass_time(time, include_speed_bonus=false) {
        this.changes.abilities = true;

        let time_unscaled = time;
        let time_after_spd = time_unscaled * (include_speed_bonus ? this.get_speed_mult() : 1);

        this.delays = this.delays.map((d, i) => {
            let final_time = time_after_spd;
            if (this.template.abilities[i].not_affected_by_spd) {
                final_time = time_unscaled;
            }

            let time_multiplier = 1;
            if (this.specials.has(ITEM_SPECIAL.faster_inner_artifacts) && this.template.ability_sources[i] == ITEM_TYPE.INNER_ARTIFACT) {
                time_multiplier += 0.25;
            }
            if (this.specials.has(ITEM_SPECIAL.faster_outer_artifacts) && this.template.ability_sources[i] == ITEM_TYPE.OUTER_ARTIFACT) {
                time_multiplier += 0.25;
            }
            if (this.specials.has(ITEM_SPECIAL.faster_divine_artifacts) && this.template.ability_sources[i] == ITEM_TYPE.DIVINE_ARTIFACT) {
                time_multiplier += 0.25;
            }
            if (this.specials.has(ITEM_SPECIAL.inner_artifact_mastery_ender) && this.hp / this.stats.MHP < 0.33 && this.template.ability_sources[i] == ITEM_TYPE.INNER_ARTIFACT) {
                time_multiplier += 1;
            }

            final_time *= time_multiplier;

            return d - final_time;
        });

        // count down effects
        let changed = false;
        let new_effects = [];
        this.effects.forEach(e => {
            if (e.pass_time(time)) {
                changed = true;
            } else {
                new_effects.push(e);
            }
        });

        this.effects = new_effects;
        if (changed) {
            this.changes.effects = true;
            this.calculate_stats();
        }

        // trigger any item, ability or (de)buff effects
    }

    receive_effect(effect, time) {
        this.changes.effects = true;

        this.effects.push(effect.make(time));
        this.calculate_stats();
    }

    apply_effect(target, effect, time) {
        target.receive_effect(effect, time);
    }

    put_ability_on_cooldown(index, cooldown_ratio=1) {
        this.increase_ability_cooldown(index, this.template.abilities[index].max_delay * cooldown_ratio);
    }

    increase_ability_cooldown(index, by) {
        this.delays[index] = Math.min(
            this.delays[index] + by,
            this.template.abilities[index].max_delay
        )
    }

    get_speed_mult() {
        return 1 + (0.01 * this.stats.SPD);
    }

    try_take_turn(battle, target) {
        if (this.time_until_next_action() <= 0) {
            return this.take_turn(battle, target);
        }

        return false;
    }

    activate_ability(battle, target, index) {
        if (this.specials.has(ITEM_SPECIAL.outer_artifact_mastery_ender) && this.template.ability_sources[index] == ITEM_TYPE.OUTER_ARTIFACT) {
            this.move_flags.DEF_PIERCE_MUL = 0.2;
        }

        this.template.abilities[index].effect.fn(battle, this, target);

        this.move_flags.DEF_PIERCE_MUL = 0;

        if (this.specials.has(ITEM_SPECIAL.divine_artifact_mastery_ender) && this.template.ability_sources[index] == ITEM_TYPE.DIVINE_ARTIFACT && grandom() < 0.25) {
            this.put_ability_on_cooldown(index, 0.5);
        } else {
            this.put_ability_on_cooldown(index);
        }
        
        let timedif = Date.now() - this.last_uses[index];
        this.say(`Used ${this.template.abilities[index].name} after ${
            Math.round((timedif * game_speed) / 10) / 100
        }s of not using it`);

        this.last_uses[index] = Date.now();

        for (let j=0; j<this.delays.length; j++) {
            if (j != index) {
                this.increase_ability_cooldown(j, ABILITY_GLOBAL_DELAY * this.template.abilities[j].global_delay_mult);
            }
        }
    }

    take_turn(battle, target) {
        // use the first move with delay < 0, then add max delay to that move's current delay,
        // then apply global delay to all other moves (up to max delay)
        for (let i=0; i<this.delays.length; i++) {
            if (this.delays[i] <= 0) {
                this.activate_ability(battle, target, i);

                break;
            }
        }
    }
}


const ABILITY_GLOBAL_DELAY = 0.25;
let grandom = get_seeded_randomiser("whatever123");


class EntityTemplate {
    constructor(name, base_stats, xp_value, abilities, ability_sources=null) {
        this.name = name;
        this.base_stats = base_stats;
        this.xp_value = xp_value;
        this.abilities = abilities;

        this.ability_sources = ability_sources;

        this.bar_style = new BarStyle(
            BarStyle.DisplayType.BAR_CHANGE_COL,
            new Colour(192, 0, 0), new Colour(0, 128, 0)
        );
    }
}

class Ability {
    static and(f1, f2) {
        return {
            fn: (b, s, t) => {
                f1.fn(b, s, t);
                f2.fn(b, s, t);
            },
            desc: f1.desc + "\n" + f2.desc
        }
    }

    static regular_attack(mult, crit_chance_bonus=0, acc_bonus=0, stat="ATK") {
        return {
            fn: (b, s, t) => s.initiate_move(
                t, s.stats[stat] * mult, DamageType.PHYSICAL,
                crit_chance_bonus, acc_bonus, 0, 0
            ),
            desc: format_effect_string(` - Deal ${Math.round(mult * 100)}% ${stat} as physical damage`)
        }
    }

    static magical_attack(mult, crit_chance_bonus=0, stat="ATT") {
        return {
            fn: (b, s, t) => s.initiate_move(
                t, s.stats[stat] * mult, DamageType.MAGICAL,
                crit_chance_bonus, 0, 0, 0
            ),
            desc: format_effect_string(` - Deal ${Math.round(mult * 100)}% ${stat} as magical damage`)
        }
    }

    static apply_effect(effect, time) {
        return {
            fn: (b, s, t) => s.apply_effect(t, effect, time),
            desc: ` - Apply ${effect.effect_string()} to the target for [[--col-highlight]]${time}[[clear]] seconds`
        }
    }

    static gain_effect(effect, time) {
        return {
            fn: (b, s, t) => s.apply_effect(s, effect, time),
            desc: ` - Gain ${effect.effect_string()} for [[--col-highlight]]${time}[[clear]] seconds`
        }
    }

    constructor(name, description, bar_colours, max_delay, effect, global_delay_mult, not_affected_by_spd) {
        this.name = name;
        this.description = parse_format_text(description);
        if (this.description) {
            this.description = "\n" + this.description;
        }

        this.description = effect.desc + this.description;

        this.bar_colour1 = bar_colours[0];
        this.bar_colour2 = bar_colours[1];
        this.max_delay = max_delay;
        this.effect = effect;
    
        this.bar_style = new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            this.bar_colour1, this.bar_colour2
        )

        this.global_delay_mult = global_delay_mult ? global_delay_mult : 1;
        this.not_affected_by_spd = not_affected_by_spd ? true : false;
    }
}

class Skill {
    constructor(id, name, description, sort_key, hide_if_locked, bar_style, max_level, xp_multiplier, max_num_applicable_items, items_for_proficiency, level_milestones) {
        this.id = id;
        this.name = name;
        this.description = parse_format_text(description);

        this.sort_key = sort_key;
        this.hide_if_locked = hide_if_locked;

        this.bar_style = bar_style;

        this.max_level = max_level;
        this.xp_multiplier = xp_multiplier;
        this.max_num_applicable_items = max_num_applicable_items;

        this.items_for_proficiency = items_for_proficiency;
        this.level_milestones = level_milestones;
    }

    xp_to_next(lvl) {
        return ((lvl * lvl) + (5 * lvl) + 4) * this.xp_multiplier;
    }
}

/*
equippable: slight grey background
    - weapons: white if same type as currently equipped, else light grey
    - armour: light brown if same type as currently equipped, else medium brown
    - artifacts:
        - red for unusable artifacts (cultivation level too low)
        - lilac for outer artifacts
        - lightgreen for inner artifacts
        - orange for divine artifacts
usable: slight green background, redder if not consumed
    - battle only; light orange
    - field only; light cyan
    - both; white
quest: slight yellow background
spiritual: slight cyan background, light cyan name
*/
function format_effect_string(txt) {
    // format numbers as --col-highlight
    // format MHP/ATK/ATT/DEF/MDF/SPD/ACC/EVA as their respective colours
    // format keywords as --col-highlight ("crit chance", "weight")
    let desc_str = txt;

    desc_str = desc_str.replaceAll(/( |^)(([^-]|\+)?\d+(?:\.\d+)?[%x]?)/g, `$1[[--col-highlight]]$2[[clear]]`);

    desc_str = desc_str.replaceAll(/( |^)((-)\d+(?:\.\d+)?[%x]?)/g, `$1[[--col-highlight-negative]]$2[[clear]]`);

    desc_str = desc_str.replaceAll(" HP", " SCRIMBLO");
    let stats = ["MHP", "ATK", "ATT", "DEF", "MDF", "SPD", "ACC", "EVA", "SCRIMBLO"];
    stats.forEach((s, i) => {
        desc_str = desc_str.split(s).join(`[[--stat-${stats[i]}]]${s}[[clear]]`);
    })
    desc_str = desc_str.replaceAll("SCRIMBLO", "HP");

    let keywords = ["crit chance", "weight", "physical", "magical"];
    let cols = ["--col-highlight", "--col-highlight", "--col-ability-physical", "--col-ability-magical"]

    keywords.forEach((k, i) => {
        desc_str = desc_str.split(k).join(`[[${cols[i]}]]${k}[[clear]]`);
    })

    return desc_str;
}

function parse_format_text(txt, autoformat=true) {
    let html = "";
    if (autoformat) {
        // console.log(txt);
        // console.log(format_effect_string(txt));
        txt = format_effect_string(txt);
    }

    // add each character. if we reach a format block, enter span building mode, then make a span
    // end the span if we reach another format block, or if we hit the end of the html
    let made_a_span = false;

    let primed_format_block = false;
    let span_building_mode = false;
    let ignore_next_endbracket = false;
    let col_read = "";
    Array.from(txt).forEach(char => {
        if (char == "[") {
            if (primed_format_block) {
                span_building_mode = true;
                primed_format_block = false;
            } else {
                primed_format_block = true;
            }
        } else {
            if (span_building_mode) {
                if (char == "]") {
                    // build the span with col_read and clear everything because we're back to normal text now
                    if (col_read == "clear") {
                        col_read = "";
                    }
                    if (col_read.startsWith("--")) {
                        // it's a CSS variable, so make it var(X)
                        col_read = `var(${col_read})`;
                    }
                    if (made_a_span) {
                        html += "</span>";
                    }

                    html += `<span style="color:${col_read};">`;

                    col_read = "";
                    span_building_mode = false;
                    primed_format_block = false;
                    ignore_next_endbracket = true;
                    made_a_span = true;
                } else {
                    col_read += char;
                }
            } else if (primed_format_block) {
                // it was just a single [, so add it back and turn it off
                html += "[";
                primed_format_block = false;
            } else if (ignore_next_endbracket && char == "]") {
                ignore_next_endbracket = false;
            } else {
                html += char;
            }
        }
    })

    if (made_a_span) {
        html += "</span>";
    }

    return html;
}

class Item {
    static Tag = {
        EQUIPPABLE: "Equippable",
        USABLE: "Usable",
        QUEST: "Quest",

        SPIRITUAL: "Spiritual",
    }

    constructor(name, description, effect_desc, sell_value, equip_component=null, use_component=null, tags=[], requires_skills=[]) {
        this.name = name;
        this.description = parse_format_text(description, false);
        this.effect_desc = parse_format_text(effect_desc);

        this.sell_value = sell_value;  // -1 means "not sellable", 0 means "junk"

        this.equip_component = equip_component;      // if present, can be equipped
        this.use_component = use_component;  // if present, can be used
    
        this.tags = [...tags];
        if (this.equip_component) {
            this.tags.push(Item.Tag.EQUIPPABLE);
        }

        if (this.use_component) {
            this.tags.push(Item.Tag.USABLE);
        }

        this.requires_skills = requires_skills;

        this.full_item_descriptor = this.get_full_descriptor();
    }

    get_full_descriptor() {
        let item_usage = "";
        let item_type = "Item";
        let item_extra_info = ""
        if (this.equip_component) {
            item_usage += "Equippable ";
            item_type = this.equip_component.equippable_type;
            if (this.equip_component.subtype) {
                item_extra_info = this.equip_component.subtype;
            }
        }
        
        if (this.use_component) {
            item_usage += "Usable ";
        }

        this.tags.forEach(tag => {
            switch(tag) {
                case Item.Tag.QUEST:
                    item_usage += "Quest ";
                    break;
                
                case Item.Tag.SPIRITUAL:
                    item_usage += "Spiritual ";
                    break;
            }
        })

        let str = "";
        if (item_usage) {
            str += item_usage;
        }

        str += item_type;

        if (item_extra_info) {
            str += ` (${item_extra_info})`;
        }

        return str;
    }

    determine_cols(player) {
        let col = "--col-item-type-default-fg";
        let bgcol = "--col-item-type-default-bg";
        let sub_bgcol = "--col-item-type-default-sbg";
        let icon = " ";

        if (this.tags.includes(Item.Tag.SPIRITUAL)) {
            col = "--col-item-type-spiritual-fg";
            bgcol = "--col-item-type-spiritual-bg";
            sub_bgcol = "--col-item-type-spiritual-sbg";
            icon = "◎";
        } else if (this.tags.includes(Item.Tag.QUEST)) {
            col = "--col-item-type-quest-fg";
            bgcol = "--col-item-type-quest-bg";
            sub_bgcol = "--col-item-type-quest-sbg";
            icon = "※";
        } else if (this.tags.includes(Item.Tag.EQUIPPABLE)) {
            col = "--col-item-type-equippable-default-fg";
            switch (this.equip_component.equippable_type) {
                case ITEM_TYPE.KNIFE:
                case ITEM_TYPE.SWORD:
                case ITEM_TYPE.POLEARM:
                case ITEM_TYPE.AXE:
                case ITEM_TYPE.HAMMER:
                case ITEM_TYPE.MARTIAL_WEAPON:
                    if (this.equip_component.equippable_type == player.equipped_items.WEAPON?.equip_component.equippable_type) {
                        col = "--col-item-type-equippable-weapon-sametype-fg";
                    } else {
                        col ="--col-item-type-equippable-weapon-difftype-fg";
                    }
                    icon = "⌠";
                    break;

                case ITEM_TYPE.LIGHT_ARMOUR:
                case ITEM_TYPE.MEDIUM_ARMOUR:
                case ITEM_TYPE.HEAVY_ARMOUR:
                    if (player.get_equipped_item_types()[this.equip_component.equippable_type]) {
                        col = "--col-item-type-equippable-armour-sametype-fg";
                    } else {
                        col = "--col-item-type-equippable-armour-difftype-fg";
                    }
                    icon = "∇"
                    break;

                case ITEM_TYPE.INNER_ARTIFACT:
                case ITEM_TYPE.OUTER_ARTIFACT:
                case ITEM_TYPE.DIVINE_ARTIFACT:
                    if (false) {  // artifact unusable? (this is handled by the overall skill reqs system now)
                        // col = new Colour(255, 0, 0);
                    } else {
                        switch (this.equip_component.equippable_type) {
                            case ITEM_TYPE.INNER_ARTIFACT:
                                col = "--col-item-type-equippable-artifact-inner-fg"
                                icon = "▣"
                                break;

                            case ITEM_TYPE.OUTER_ARTIFACT:
                                col = "--col-item-type-equippable-artifact-outer-fg"
                                icon = "▢"
                                break;

                            case ITEM_TYPE.DIVINE_ARTIFACT:
                                col = "--col-item-type-equippable-artifact-divine-fg"
                                icon = "◧"
                                break; 
                        }
                    }
                    break;
            }
            bgcol = "--col-item-type-equippable-bg";
            sub_bgcol = "--col-item-type-equippable-sbg";
        } else if (this.tags.includes(Item.Tag.USABLE)) {
            if (this.use_component.consumed_when_used) {
                bgcol = "--col-item-type-usable-consumed-bg";
                sub_bgcol = "--col-item-type-usable-consumed-sbg";
                icon = "▷";
            } else {
                bgcol = "--col-item-type-usable-notconsumed-bg";
                sub_bgcol = "--col-item-type-usable-notconsumed-sbg";
                icon = "▶";
            }
            if (this.use_component.battle_effect && this.use_component.field_effect) {
                col = "--col-item-type-usable-both-fg";
            } else if (this.use_component.battle_effect) {
                col = "--col-item-type-usable-battle-fg";
            } else if (this.use_component.field_effect) {
                col = "--col-item-type-usable-field-fg";
            }
        }
        
        this.requires_skills.forEach(skill_req => {
            if (player.skill_levels[skill_req[0]] < skill_req[1]) {
                col = "--col-skill-needed";
            }
        })

        return [col, bgcol, icon, sub_bgcol].map(t => `var(${t})`);
    }
}

class UseComponent {
    constructor(consumed_when_used, battle_effect=null, field_effect=null) {
        this.consumed_when_used = consumed_when_used;
        this.battle_effect = battle_effect;
        this.field_effect = field_effect;
    }
}

class EquipComponent {
    static abstract_stats(stats_flat, stats_mult) {
        return new EquipComponent(
            null, 0, stats_flat, stats_mult, "", []
        );
    }

    static abstract_special(special) {
        return new EquipComponent(
            null, 0, {}, {}, "", [special]
        );
    }

    static SubType = {
        HEAD: "Head",
        BODY: "Body",
        ARMS: "Arms",
        LEGS: "Legs"
    }

    constructor(equippable_type, weight, stats_flat, stats_mult, unlock_ability, specials, subtype=null) {
        this.equippable_type = equippable_type;
        this.weight = weight;

        this.stats_flat = stats_flat;
        this.stats_mult = stats_mult;
        this.unlock_ability = unlock_ability;

        this.specials = specials;

        this.subtype = subtype;
    }

    apply_to_stats(base_stats, bonus_stats, mults, proficiency) {
        switch (this.equippable_type) {
            case ITEM_TYPE.KNIFE:
            case ITEM_TYPE.SWORD:
            case ITEM_TYPE.POLEARM:
            case ITEM_TYPE.AXE:
            case ITEM_TYPE.HAMMER:
            case ITEM_TYPE.MARTIAL_WEAPON:
                bonus_stats.ATK += (this.stats_flat.ATK ? this.stats_flat.ATK : 0) * proficiency * 0.01
                bonus_stats.ACC += proficiency * 0.05
                
                break;
            
            case ITEM_TYPE.LIGHT_ARMOUR:
            case ITEM_TYPE.MEDIUM_ARMOUR:
            case ITEM_TYPE.HEAVY_ARMOUR:
                bonus_stats.WEIGHT_MODIFIER -= this.weight * proficiency * 0.002;

                break;
        } 

        Object.keys(this.stats_flat).forEach(k => {
            bonus_stats[k] += this.stats_flat[k];
        })

        Object.keys(this.stats_mult).forEach(k => {
            mults[k] += this.stats_mult[k];
        })
    }
}

class Player {
    static new(name) {
        let new_skill_levels = {};
        let new_skill_xp = {};
        Object.keys(skills_list).forEach(s => {
            new_skill_levels[s] = 0;
            new_skill_xp[s] = 0;
        })

        return new Player(
            name, new_skill_levels, new_skill_xp, [], {
                HEAD: null,
                BODY: null,
                ARMS: null,
                LEGS: null,

                WEAPON: null,
                ARTIFACT1: null,
                ARTIFACT2: null,
            }, ["combat", null, null]
        )
    }

    constructor(name, skill_levels, skill_xp, inventory, equipped_items, tracked_skills) {
        this.name = name;
        this.skill_levels = skill_levels;
        this.skill_xp = skill_xp;

        this.tracked_skills = tracked_skills;

        this.inventory = inventory;
        this.inventory_max_slots = 32;
        /*
            {
                HEAD,
                BODY,
                ARMS,
                LEGS,

                WEAPON,
                ARTIFACT1,
                ARTIFACT2
            }
        */
        this.equipped_items = equipped_items;

        this.current_hp = 99999;
        this.stored_entity = null;

        this.changes = {
            skills: true,  // skill levels, not cooldowns. those are abilities. silly
            skills_unlocked: true,
            inventory: true,
            equipment: true,
        }

        this.refresh_entity();
    }

    mark_change(typ) {
        this.changes[typ] = true;
    }

    check_change(typ) {
        if (this.changes[typ]) {
            this.changes[typ] = false;
            return true;
        }

        return false;
    }

    can_equip_item(item, slot) {
        // check skills, dont worry about slot matching
        return item.requires_skills.reduce((prev, skill_req) => {
            return prev && this.skill_levels[skill_req[0]] >= skill_req[1]
        }, true)
    }

    equip_item(item, slot, place_replaced_in_inventory=true) {
        let replaced_item = this.equipped_items[slot];
        this.equipped_items[slot] = item;

        this.mark_change("inventory");
        this.mark_change("equipment");

        this.refresh_entity(null, true);

        if (place_replaced_in_inventory && replaced_item) {
            this.add_item_to_inventory(replaced_item);
            return true;
        } else {
            return replaced_item;
        }
    }

    add_item_to_inventory(item, insert_at_index, bypass_inventory_cap=false) {
        let item_container = {
            item: item,
            is_new: true
        }

        if (this.inventory.length < this.inventory_max_slots || bypass_inventory_cap) {
            if (insert_at_index) {
                this.inventory.splice(insert_at_index, 0, item_container);
            } else {
                this.inventory.push(item_container);
            }
            this.mark_change("inventory");
            return true;
        } else {
            return false;
        }
    }

    remove_item_from_inventory(index) {
        this.mark_change("inventory");
        return this.inventory.splice(index, 1);
    }

    unequip_item_from_slot(slot, place_item_in_inventory=true) {
        this.mark_change("inventory");
        this.mark_change("equipment");

        let unequipped_item = this.equipped_items[slot];
        if (unequipped_item) {
            if (place_item_in_inventory) {
                this.add_item_to_inventory(unequipped_item);
            }
            this.equipped_items[slot] = null;

            this.refresh_entity(null, true);
            return true;
        } else {
            return false;
        }
    }

    get_equipped_item_types() {
        let total_item_types = {};
        Object.keys(this.equipped_items).forEach(p => {
            if (this.equipped_items[p]) {
                let comp = this.equipped_items[p].equip_component;
                total_item_types[comp.equippable_type] = total_item_types[comp] ? total_item_types[comp] + 1 : 1;
            }
        });

        if (!this.equipped_items.WEAPON) {
            total_item_types["unarmed"] = 1;
        }

        return total_item_types;
    }

    should_show_skill(category) {
        return !skills_list[category].hide_if_locked || this.skill_xp[category] != 0 || this.skill_levels[category] != 0
    }

    gain_skill_xp(category, amount) {
        if (amount != 0) {
            if (!this.should_show_skill(category)) {
                // we need to make a new skill visible
                this.mark_change("skills_unlocked");
            }

            let req_to_next = skills_list[category].xp_to_next(this.skill_levels[category]);

            // console.log(`Gained ${amount} XP for skill ${category}`);
            this.skill_xp[category] += amount;
            while (this.skill_xp[category] >= req_to_next && this.skill_levels[category] < skills_list[category].max_level) {
                this.levelup_skill(category);
                req_to_next = skills_list[category].xp_to_next(this.skill_levels[category]);
            }

            this.mark_change("skills")
        }
    }

    levelup_skill(category, lose_xp=true) {
        this.skill_levels[category] += 1;

        // inventory might change as a result
        player.mark_change("inventory");

        console.log(`Skill ${category} levelled up! (${this.skill_levels[category] - 1} => ${this.skill_levels[category]})`);
        if (lose_xp) {
            this.skill_xp[category] -= skills_list[category].xp_to_next(this.skill_levels[category] - 1);
        }
    }

    set_skill_level(category, to) {
        // always mark a change here to be safe
        this.mark_change("skills_unlocked");
        this.mark_change("skills");

        this.skill_levels[category] = to;
    }

    set_skill_xp(category, to) {
        this.mark_change("skills_unlocked");
        this.mark_change("skills");

        this.skill_xp[category] = to-1;
        this.gain_skill_xp(category, 1);  // to trigger levelup
    }

    refresh_entity(force_hp=0, keep_hp_value=false, keep_hp_percentage=false) {
        this.mark_change("entity");

        let pl_abilities = [];
        let ability_sources = [];  // for item types. damn my silly feature crafting! null means "innate", otherwise it's "skill" or ITEM_TYPE 

        let pl_items = [];

        let last_hp = this.stored_entity?.hp;
        let last_hp_pct = last_hp ? (last_hp / this.stored_entity?.stats.MHP) : undefined;

        // the attack ability might be different based on sect
        pl_abilities.push(ability_list["attack"]);
        ability_sources.push(null);

        // add abilities from skills
        let proficiencies = {
            HEAD: 0,
            BODY: 0,
            ARMS: 0,
            LEGS: 0,
            WEAPON: 0,
            ARTIFACT1: 0,
            ARTIFACT2: 0
        }

        let total_item_types = this.get_equipped_item_types();

        Object.keys(skills_list).forEach(k => {
            let skill = skills_list[k];

            Object.keys(this.equipped_items).forEach(p => {
                let item = this.equipped_items[p]?.equip_component;
                if (!item) {
                    return;
                }

                // check the item type of the equipped item, and if it matches the skill,
                // increase the proficiency of the given slot by the skill level
                if (skill.items_for_proficiency == "ALL" || skill.items_for_proficiency.includes(item.equippable_type)) {
                    proficiencies[p] += this.skill_levels[k];
                }
            });

            // now do abilities and bonus items
            skill.level_milestones.forEach(m => {
                if (this.skill_levels[k] >= m.lvl) {
                    if (!m.req || total_item_types[m.req[0]] >= m.req[1]) {
                        // if per_item, add one item per equipped item, otherwise just one
                        let num_items_to_add = 1;
                        if (m.per_item) {
                            num_items_to_add = total_item_types[m.req[0]];
                        }

                        for (let i=0; i<num_items_to_add; i++) {
                            pl_items.push([
                                m.item, 0
                            ]);
                        }

                        if (m.item.unlock_ability) {
                            pl_abilities.push(ability_list[m.item.unlock_ability]);
                            ability_sources.push("skill");
                        }
                    }
                }
            })
        })

        // add abilities from items
        Object.keys(this.equipped_items).forEach(k => {
            if (this.equipped_items[k]) {
                if (this.equipped_items[k].equip_component.unlock_ability) {
                    pl_abilities.push(ability_list[
                        this.equipped_items[k].equip_component.unlock_ability
                    ]);
                    ability_sources.push(this.equipped_items[k].equip_component.equippable_type);
                }

                pl_items.push([
                    this.equipped_items[k], proficiencies[k]
                ])
            }
        })

        let template = new EntityTemplate(
            "Player", entity_template_list["player"].base_stats, 0, pl_abilities, ability_sources
        )

        this.stored_entity = new Entity(
            template, "You", pl_items
        )

        if (force_hp) {
            this.stored_entity.hp = force_hp;
            this.stored_entity.gain_hp(0);
        } else if (keep_hp_value && last_hp) {
            this.stored_entity.hp = last_hp;
            this.stored_entity.gain_hp(0);
        } else if (keep_hp_percentage && last_hp_pct) {
            this.stored_entity.hp = Math.round(this.stored_entity.stats.MHP * last_hp_pct);
            this.stored_entity.gain_hp(0);
        }

        return this.stored_entity;
    }
}


const ITEM_TYPE = {
    KNIFE: "Knife",
    SWORD: "Sword",
    POLEARM: "Polearm",
    AXE: "Axe",
    HAMMER: "Hammer",
    MARTIAL_WEAPON: "Martial Weapon",
    LIGHT_ARMOUR: "Light Armour",
    MEDIUM_ARMOUR: "Medium Armour",
    HEAVY_ARMOUR: "Heavy Armour",
    INNER_ARTIFACT: "Inner Artifact",
    OUTER_ARTIFACT: "Outer Artifact",
    DIVINE_ARTIFACT: "Divine Artifact"
}


const ITEM_SPECIAL = {
    none: 0,

    light_armour_mastery_ender: 1,
    medium_armour_mastery_ender: 2,
    heavy_armour_mastery_ender: 3,

    faster_inner_artifacts: 4,
    faster_outer_artifacts: 5,
    faster_divine_artifacts: 6,

    inner_artifact_mastery_ender: 7,
    outer_artifact_mastery_ender: 8,
    divine_artifact_mastery_ender: 9,
}

const item_special_desc = {
    [ITEM_SPECIAL.none]: "No special effects",

    [ITEM_SPECIAL.light_armour_mastery_ender]: "Light armour has zero weight",
    [ITEM_SPECIAL.medium_armour_mastery_ender]: "gain +25% DEF as MDF",
    [ITEM_SPECIAL.heavy_armour_mastery_ender]: "gain +1 ATT per point of total equipment weight (before reductions)",

    [ITEM_SPECIAL.faster_inner_artifacts]: "Abilities from inner artifacts recharge 25% faster",
    [ITEM_SPECIAL.faster_outer_artifacts]: "Abilities from outer artifacts recharge 25% faster",
    [ITEM_SPECIAL.faster_divine_artifacts]: "Abilities from divine artifacts recharge 25% faster",

    [ITEM_SPECIAL.inner_artifact_mastery_ender]: "When under 33% HP, abilities from inner artifacts recharge 100% faster",
    [ITEM_SPECIAL.outer_artifact_mastery_ender]: "Damage from abilities from outer artifacts ignores 20% of enemy MDF",
    [ITEM_SPECIAL.divine_artifact_mastery_ender]: "Abilities from divine artifacts have a 25% chance to only go on half cooldown",
}


let skill_combat_bar_style = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(160, 96, 96)
)
let skill_combat_bar_style2 = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(192, 32, 32)
)

let skill_armour_bar_style = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(128, 128, 128)
)

let skill_artifact_bar_style1 = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(96, 192, 96)
)
let skill_artifact_bar_style2 = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(192, 96, 192)
)
let skill_artifact_bar_style3 = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(192, 192, 96)
)
let skill_artifact_bar_style4 = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(128, 32, 32), new Colour(96, 130, 192)
)

let skill_cultivation_bar_style = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(32, 96, 128), new Colour(96, 128, 200)
)


let skills_list = {
    "knife_mastery": new Skill(
        "knife_mastery",
        "Knife Mastery",
        "Skill at wielding a knife in combat. Equipped knives gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.KNIFE], [
            {lvl: 10,  req: [ITEM_TYPE.KNIFE, 1], item: new EquipComponent(null, 0, {SPD: 10}, {}, null, [])},
            {lvl: 20,  req: null,                 item: new EquipComponent(null, 0, {SPD: 7},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.KNIFE, 1], item: new EquipComponent(null, 0, {}, {}, "combo", [])},
            {lvl: 40,  req: null,                 item: new EquipComponent(null, 0, {ACC: 6}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.KNIFE, 1], item: new EquipComponent(null, 0, {EVA: 7}, {}, null, [])},
            {lvl: 60,  req: null,                 item: new EquipComponent(null, 0, {EVA: 4}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.KNIFE, 1], item: new EquipComponent(null, 0, {CRIT_CHANCE: 20}, {}, null, [])},
            {lvl: 80,  req: null,                 item: new EquipComponent(null, 0, {ATK: 15}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.KNIFE, 1], item: new EquipComponent(null, 0, {}, {}, "fatal_finisher", [])},
        ]
    ),

    "sword_mastery": new Skill(
        "sword_mastery",
        "Sword Mastery", 
        "Skill at wielding a sword in combat. Equipped swords gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.SWORD], [
            {lvl: 10,  req: [ITEM_TYPE.SWORD, 1], item: new EquipComponent(null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 20,  req: null,                 item: new EquipComponent(null, 0, {ATK: 8},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.SWORD, 1], item: new EquipComponent(null, 0, {}, {}, "parry", [])},
            {lvl: 40,  req: null,                 item: new EquipComponent(null, 0, {SPD: 7}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.SWORD, 1], item: new EquipComponent(null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 60,  req: null,                 item: new EquipComponent(null, 0, {ACC: 9}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.SWORD, 1], item: new EquipComponent(null, 0, {WEIGHT_MODIFIER: -10}, {}, null, [])},
            {lvl: 80,  req: null,                 item: new EquipComponent(null, 0, {EVA: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.SWORD, 1], item: new EquipComponent(null, 0, {}, {}, "thousandfold_divide", [])}
        ]
    ),

    "polearm_mastery": new Skill(
        "polearm_mastery",
        "Polearm Mastery",
        "Skill at wielding a polearm in combat. Equipped polearms gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.POLEARM], [
            {lvl: 10,  req: [ITEM_TYPE.POLEARM, 1], item: new EquipComponent(null, 0, {CRIT_CHANCE: 10}, {}, null, [])},
            {lvl: 20,  req: null,                   item: new EquipComponent(null, 0, {SPD: 6},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.POLEARM, 1], item: new EquipComponent(null, 0, {}, {}, "expose", [])},
            {lvl: 40,  req: null,                   item: new EquipComponent(null, 0, {EVA: 7}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.POLEARM, 1], item: new EquipComponent(null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 60,  req: null,                   item: new EquipComponent(null, 0, {ACC: 10}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.POLEARM, 1], item: new EquipComponent(null, 0, {SPD: 10}, {}, null, [])},
            {lvl: 80,  req: null,                   item: new EquipComponent(null, 0, {ATK: 12}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.POLEARM, 1], item: new EquipComponent(null, 0, {}, {}, "vorpal_strike", [])}
        ]
    ),

    "axe_mastery": new Skill(
        "axe_mastery",
        "Axe Mastery", 
        "Skill at wielding an axe in combat. Equipped axes gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.AXE], [
            {lvl: 10,  req: [ITEM_TYPE.AXE, 1], item: new EquipComponent(null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 20,  req: null,               item: new EquipComponent(null, 0, {MHP: 30},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.AXE, 1], item: new EquipComponent(null, 0, {}, {}, "headhunter", [])},
            {lvl: 40,  req: null,               item: new EquipComponent(null, 0, {ATK: 11}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.AXE, 1], item: new EquipComponent(null, 0, {CRIT_CHANCE: 10}, {}, null, [])},
            {lvl: 60,  req: null,               item: new EquipComponent(null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.AXE, 1], item: new EquipComponent(null, 0, {MHP: 80}, {}, null, [])},
            {lvl: 80,  req: null,               item: new EquipComponent(null, 0, {MHP: 80}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.AXE, 1], item: new EquipComponent(null, 0, {}, {}, "demonic_soul_tribute", [])}
        ]
    ),

    "hammer_mastery": new Skill(
        "hammer_mastery",
        "Hammer Mastery", 
        "Skill at wielding a hammer in combat. Equipped hammers gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.HAMMER], [
            {lvl: 10,  req: [ITEM_TYPE.HAMMER, 1], item: new EquipComponent(null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 20,  req: null,                  item: new EquipComponent(null, 0, {ATK: 9},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.HAMMER, 1], item: new EquipComponent(null, 0, {}, {}, "crush", [])},
            {lvl: 40,  req: null,                  item: new EquipComponent(null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.HAMMER, 1], item: new EquipComponent(null, 0, {SPD: 5}, {}, null, [])},
            {lvl: 60,  req: null,                  item: new EquipComponent(null, 0, {MHP: 70}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.HAMMER, 1], item: new EquipComponent(null, 0, {MDF: 13}, {}, null, [])},
            {lvl: 80,  req: null,                  item: new EquipComponent(null, 0, {ATK: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.HAMMER, 1], item: new EquipComponent(null, 0, {}, {}, "nine_heavens_shattering", [])}
        ]
    ),

    "martial_weapon_mastery": new Skill(
        "martial_weapon_mastery",
        "Martial Weapon Mastery", 
        "Skill at wielding a martial weapon in combat. Equipped martial weapons gain +1% ATK and +0.05 ACC per skill level.",
        0, false, skill_combat_bar_style, 100, 1, 1, [ITEM_TYPE.MARTIAL_WEAPON], [
            {lvl: 10,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new EquipComponent(null, 0, {DEF: 7}, {}, null, [])},
            {lvl: 20,  req: null,                          item: new EquipComponent(null, 0, {DEF: 6},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new EquipComponent(null, 0, {}, {}, "defensive_rush", [])},
            {lvl: 40,  req: null,                          item: new EquipComponent(null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new EquipComponent(null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 60,  req: null,                          item: new EquipComponent(null, 0, {MDF: 10}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new EquipComponent(null, 0, {ATK: 18}, {}, null, [])},
            {lvl: 80,  req: null,                          item: new EquipComponent(null, 0, {MHP: 100}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new EquipComponent(null, 0, {}, {}, "martial_soul", [])}
        ]
    ),

    "unarmed_mastery": new Skill(
        "unarmed_mastery",
        "Unarmed Mastery", 
        "Skill at fighting unarmed in combat. Levels in this skill grant no inherent bonus, aside from the level milestones.",
        0, true, skill_combat_bar_style, 100, 1, 0, [], [
            {lvl: 10,  req: ["unarmed", 1], item: new EquipComponent(null, 0, {MHP: 10, ATK: 10, ATT: 10, DEF: 10, MDF: 10, SPD: 10, ACC: 10, EVA: 10}, {}, null, [])},
            {lvl: 20,  req: null,           item: new EquipComponent(null, 0, {WEIGHT_MODIFIER: -5}, {}, null, [])},
            {lvl: 25,  req: ["unarmed", 1], item: new EquipComponent(null, 0, {}, {}, "flurry", [])},
            {lvl: 40,  req: null,           item: new EquipComponent(null, 0, {MHP: 4, ATK: 4, ATT: 4, DEF: 4, MDF: 4, SPD: 4, ACC: 4, EVA: 4}, {}, null, [])},
            {lvl: 50,  req: ["unarmed", 1], item: new EquipComponent(null, 0, {}, {SPD: 0.25}, null, [])},
            {lvl: 60,  req: null,           item: new EquipComponent(null, 0, {}, {ATK: 0.06}, null, [])},
            {lvl: 75,  req: ["unarmed", 1], item: new EquipComponent(null, 0, {ATT: 24}, {}, null, [])},
            {lvl: 80,  req: null,           item: new EquipComponent(null, 0, {}, {MHP: 0.04, ATK: 0.04, ATT: 0.04, DEF: 0.04, MDF: 0.04, SPD: 0.04, ACC: 0.04, EVA: 0.04}, null, [])},
            {lvl: 100, req: ["unarmed", 1], item: new EquipComponent(null, 0, {}, {}, "eight_palms", [])}
        ]
    ),

    "light_armour_mastery": new Skill(
        "light_armour_mastery",
        "Light Armour Mastery", 
        "Skill at using light armour in combat. Equipped  light armour gains -0.2% reduced weight per skill level.",
        1, false, skill_armour_bar_style, 100, 4, 4, [ITEM_TYPE.LIGHT_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new EquipComponent(null, 0, {DEF: 1}, {}, null, [])},
            {lvl: 20,  req: null,                                        item: new EquipComponent(null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                        item: new EquipComponent(null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new EquipComponent(null, 0, {DEF: 3}, {}, null, [])},
            {lvl: 60,  req: null,                                        item: new EquipComponent(null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new EquipComponent(null, 0, {EVA: 2}, {}, null, [])},
            {lvl: 80,  req: null,                                        item: new EquipComponent(null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 100, req: null,                                        item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.light_armour_mastery_ender])}
        ]
    ),

    "medium_armour_mastery": new Skill(
        "medium_armour_mastery",
        "Medium Armour Mastery", 
        "Skill at using medium armour in combat. Equipped medium armour gains -0.2% reduced weight per skill level.",
        1, false, skill_armour_bar_style, 100, 4, 4, [ITEM_TYPE.MEDIUM_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new EquipComponent(null, 0, {DEF: 1}, {}, null, [])},
            {lvl: 20,  req: null,                                         item: new EquipComponent(null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                         item: new EquipComponent(null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new EquipComponent(null, 0, {MHP: 25}, {}, null, [])},
            {lvl: 60,  req: null,                                         item: new EquipComponent(null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new EquipComponent(null, 0, {SPD: 3}, {}, null, [])},
            {lvl: 80,  req: null,                                         item: new EquipComponent(null, 0, {EVA: 9}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.MEDIUM_ARMOUR, 3],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.medium_armour_mastery_ender])}
        ]
    ),

    "heavy_armour_mastery": new Skill(
        "heavy_armour_mastery",
        "Heavy Armour Mastery", 
        "Skill at using heavy armour in combat. Equipped heavy armour gains -0.2% reduced weight per skill level.",
        1, false, skill_armour_bar_style, 100, 4, 4, [ITEM_TYPE.HEAVY_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new EquipComponent(null, 0, {DEF: 2}, {}, null, [])},
            {lvl: 20,  req: null,                                        item: new EquipComponent(null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                        item: new EquipComponent(null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new EquipComponent(null, 0, {SPD: 2}, {}, null, [])},
            {lvl: 60,  req: null,                                        item: new EquipComponent(null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new EquipComponent(null, 0, {DEF: 4}, {}, null, [])},
            {lvl: 80,  req: null,                                        item: new EquipComponent(null, 0, {DEF: 12}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.HEAVY_ARMOUR, 3],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.heavy_armour_mastery_ender])}
        ]
    ),

    "inner_artifact_mastery": new Skill(
        "inner_artifact_mastery",
        "Inner Artifact Mastery", 
        "Skill at using inner artifacts in combat. Levels in this skill grant no inherent bonus, aside from the level milestones.",
        2, false, skill_artifact_bar_style1, 100, 2, 2, [ITEM_TYPE.INNER_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new EquipComponent(null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                          item: new EquipComponent(null, 0, {MDF: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.INNER_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.faster_inner_artifacts])},
            {lvl: 40,  req: null,                                          item: new EquipComponent(null, 0, {ATT: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new EquipComponent(null, 0, {SPD: 3}, {}, null, [])},
            {lvl: 60,  req: null,                                          item: new EquipComponent(null, 0, {SPD: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new EquipComponent(null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                          item: new EquipComponent(null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.INNER_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.inner_artifact_mastery_ender])}
        ]
    ),

    "outer_artifact_mastery": new Skill(
        "outer_artifact_mastery",
        "Outer Artifact Mastery", 
        "Skill at using outer artifacts in combat. Levels in this skill grant no inherent bonus, aside from the level milestones.",
        2, false, skill_artifact_bar_style2, 100, 2, 2, [ITEM_TYPE.OUTER_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new EquipComponent(null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                          item: new EquipComponent(null, 0, {ATT: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.OUTER_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.faster_outer_artifacts])},
            {lvl: 40,  req: null,                                          item: new EquipComponent(null, 0, {SPD: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new EquipComponent(null, 0, {ACC: 4}, {}, null, [])},
            {lvl: 60,  req: null,                                          item: new EquipComponent(null, 0, {MDF: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new EquipComponent(null, 0, {ATK: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                          item: new EquipComponent(null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.OUTER_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.outer_artifact_mastery_ender])}
        ]
    ),

    "divine_artifact_mastery": new Skill(
        "divine_artifact_mastery",
        "Divine Artifact Mastery", 
        "Skill at using divine artifacts in combat. Levels in this skill grant no inherent bonus, aside from the level milestones.",
        2, false, skill_artifact_bar_style3, 100, 2, 2, [ITEM_TYPE.DIVINE_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new EquipComponent(null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                           item: new EquipComponent(null, 0, {MDF: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.DIVINE_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.faster_divine_artifacts])},
            {lvl: 40,  req: null,                                           item: new EquipComponent(null, 0, {MDF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new EquipComponent(null, 0, {EVA: 4}, {}, null, [])},
            {lvl: 60,  req: null,                                           item: new EquipComponent(null, 0, {ATT: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new EquipComponent(null, 0, {ATT: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                           item: new EquipComponent(null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1],                 item: new EquipComponent(null, 0, {}, {}, "", [ITEM_SPECIAL.divine_artifact_mastery_ender])}
        ]
    ),

    "combat": new Skill(
        "combat",
        "Combat",
        "Overall fighting skill. Levels in this skill grant +1% ATK and +0.05 ACC to equipped weapons and -0.2% effective weight to equipped armours.",
        3, false, skill_combat_bar_style2, 100, 8, 7, "ALL", [
            
        ]
    ),

    "artifact_mastery": new Skill(
        "artifact_mastery",
        "Artifact Mastery", 
        "Overall skill at using artifacts in combat. Levels in this skill grant no inherent bonus, aside from the level milestones.",
        3, false, skill_artifact_bar_style4, 100, 8, 2, [ITEM_TYPE.INNER_ARTIFACT, ITEM_TYPE.OUTER_ARTIFACT, ITEM_TYPE.DIVINE_ARTIFACT], [

        ]
    ),
}


const default_cols = {
    attack: [new Colour(128, 0, 0), new Colour(192, 0, 0)],
    defense: [new Colour(96, 96, 96), new Colour(160, 160, 160)],
    magic: [new Colour(0, 64, 128), new Colour(0, 96, 192)],
    ult_attack: [new Colour(128, 0, 0), new Colour(160, 110, 0)],
    ult_defense: [new Colour(96, 96, 96), new Colour(200, 200, 160)],
    ult_magic: [new Colour(0, 64, 128), new Colour(64, 128, 192)],
    ult_chinese: [new Colour(128, 0, 0), new Colour(192, 128, 192)],
}


let ability_list = {
    "attack": new Ability(
        "Attack", "",
        default_cols.attack,
        2, Ability.regular_attack(1),
    ),

    // add alternate attacks here

    "wooden_sword_moment": new Ability(
        "Wooden sword moment", " - [[#f00]]for real",
        default_cols.magic,
        5, Ability.regular_attack(2)
    ),

    "combo": new Ability(
        "Combo", "",
        default_cols.defense,
        4, Ability.gain_effect(
            new Effect(
                EquipComponent.abstract_stats({SPD: 60}, {}), true
            ), 1.5
        )
    ),

    "fatal_finisher": new Ability(
        "Fatal Finisher", " - Using other abilities reduces this ability's cooldown by twice the amount instead of increasing it.",
        default_cols.ult_attack,
        60, Ability.regular_attack(10), -2
    ),

    "parry": new Ability(
        "Parry", "",
        default_cols.defense,
        4, Ability.gain_effect(
            new Effect(
                EquipComponent.abstract_stats({}, {DEF: 9}), true
            ), 1.2
        )
    ),

    "thousandfold_divide": new Ability(
        "Thousandfold Divide", "",
        default_cols.ult_attack,
        20, Ability.and(
            Ability.regular_attack(7.5),
            Ability.apply_effect(new Effect(EquipComponent.abstract_stats({}, {SPD: -1}), false), 8)
        )
    ),

    "expose": new Ability(
        "Expose", "",
        default_cols.attack,
        8, Ability.and(
            Ability.regular_attack(0.5),
            Ability.gain_effect(new Effect(EquipComponent.abstract_stats({CRIT_CHANCE: 30}, {}), true), 3)
        )
    ),

    "vorpal_strike": new Ability(
        "Vorpal Strike", "",
        default_cols.ult_attack,
        15, Ability.regular_attack(400, 999, 99999999)
    ),

    "headhunter": new Ability(
        "Headhunter", "",
        default_cols.attack,
        12, {
            fn: (b, s, t) => s.initiate_move(
                t, Math.min(s.stats.ATK * 15, (s.stats.ATK * 0.4) + (t.hp * 0.25)), DamageType.PHYSICAL,
                0, 0, 0, 0
            ),
            desc: " - 40% ATK + 25% enemy current HP (max 1500% ATK) damage"
        }
    ),

    "demonic_soul_tribute": new Ability(
        "Demonic Soul Tribute", "",
        default_cols.ult_defense,
        20, Ability.gain_effect(
            new Effect(
                EquipComponent.abstract_stats({ATK: 200}, {ATK: 0.6}), true
            ), 8
        )
    ),

    "crush": new Ability(
        "Crush", "",
        default_cols.attack,
        15, Ability.and(
            Ability.regular_attack(1.2),
            Ability.apply_effect(
                new Effect(
                    EquipComponent.abstract_stats({DEF: -15, MDF: -15, SPD: -15, EVA: -15}, {}), false
                ), 6
            )
        )
    ),

    "nine_heavens_shattering": new Ability(
        "Nine Heavens Shattering", "",
        default_cols.ult_attack,
        25, {
            fn: (b, s, t) => s.initiate_move(
                t, (s.stats.ATK * 1) + (s.stats.MHP * 0.2) + (s.stats.DEF * 3),
                DamageType.PHYSICAL,
                0, 0, 0, 0
            ),
            desc: " - 100% ATK + 20% MHP + 300% DEF damage"
        }
    ),

    "defensive_rush": new Ability(
        "Defensive Rush", "",
        default_cols.attack,
        8, Ability.and(
            Ability.regular_attack(0.8),
            Ability.gain_effect(
                new Effect(
                    EquipComponent.abstract_stats({}, {DEF: 0.8}), true
                ), 3
            )
        )
    ),

    "martial_soul": new Ability(
        "Martial Soul", "Cooldown unaffected by SPD",
        default_cols.ult_defense,
        16, Ability.gain_effect(
            new Effect(
                EquipComponent.abstract_stats({}, {ATK: 1, DEF: 1, MDF: 1, SPD: 1, ACC: 1, EVA: 1}), true
            ), 8
        ), 1, true
    ),

    "flurry": new Ability(
        "Flurry", "",
        default_cols.defense,
        3, {
            fn: (b, s, t) => s.delays[0] = -ABILITY_GLOBAL_DELAY,
            desc: " - Resets the cooldown of your basic attack ability"
        }
    ),

    "eight_palms": new Ability(
        "Eight Palms of the Heavenly Fist: Conclusion", " - Cooldown unaffected by SPD\n - Using other abilities does not affect this ability's cooldown",
        default_cols.ult_chinese,
        60, Ability.and(
            Ability.regular_attack(88.88),
            Ability.magical_attack(88.88)
        ), 0, true
    )

    // then it's just artifact abilities. include 3 different colours for inner/outer/divine
    // (blue-green, blue-red, blue-yellow)
}


let entity_template_list = {
    "player": new EntityTemplate(
        "player", {
            MHP: 30,
            ATK: 10,
            ATT: 5,
            DEF: 2,
            MDF: 2,
            SPD: 5,
            ACC: 5,
            EVA: 5,

            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }, 0, []
    ),

    "training_dummy": new EntityTemplate(
        "Training Dummy", {
            MHP: 50,
            ATK: 1,
            ATT: 1,
            DEF: 1,
            MDF: 1,
            SPD: 1,
            ACC: 1,
            EVA: 1,

            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }, 2, [ability_list["attack"]]
    ),

    "training_dummy_2": new EntityTemplate(
        "Training Dummy 2", {
            MHP: 150,
            ATK: 3,
            ATT: 1,
            DEF: 1,
            MDF: 1,
            SPD: 1,
            ACC: 1,
            EVA: 1,

            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }, 30, [ability_list["attack"]]
    ),

    "training_dummy_3": new EntityTemplate(
        "Training Dummy 3", {
            MHP: 25000,
            ATK: 70,
            ATT: 100,
            DEF: 100,
            MDF: 1,
            SPD: 1,
            ACC: 1,
            EVA: 1,

            CRIT_CHANCE: 0,
            WEIGHT_MODIFIER: 0
        }, 10000, [ability_list["attack"]]
    )
}