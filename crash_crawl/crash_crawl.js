// each entity has a set of abilities. each ability has a different base speed, 
//  which is how many time units (delay) they have to wait before using the next one.
// some abilities (usually magic) also have cooldowns, which tick down separately.
// entities can learn any number of abilities, but usually abilities will upgrade previous ones (so that the move list doesn't get too full).
// AI conditions work on a "weighting" basis. abilities have associated factors which will contribute to weighting if they are true
//  then the attack will be selected using a weighted random.
// 
// HP - max HP
// ATK - physical base attack, used for physical abilities (as well as other scalers).
// STR - used for strength-scaling abilities, and increases HP.
// DEX - used for dexterity-scaling abilities, increases the base speed of abilities and reduces starting global delay.
// MAG - used for magic-scaling abilities, and increases MDEF.
// WIS - used for wisdom-scaling abilities, and reduces the cooldown of abilities.
// OCC - used for occult-scaling abilities, and increases luck (better chance for positive outcomes)
// DEF - used for defense against physical abilities.
// MDEF - used for defense against magical abilities.

class Battle {
    constructor(teams) {
        this.teams = teams  // array of entities which will have their teams set

        this.entities = this.teams.flatMap(t => t);
    }

    start_battle() {
        // setup teams
        this.teams.forEach((team, index) => {
            team.forEach(ent => {
                ent.team = index;
            });
        });

        // set up starting global delay
        this.entities.forEach(ent => {
            ent.delay += ent.get_starting_delay();
        })
    }

    step() {
        this.entities = this.entities.sort((a, b) => a.time_until_next_action() - b.time_until_next_action());

        // find out the time to pass by taking the lowest entry in this list
        let time_to_pass = this.entities[0].time_until_next_action();

        // pass time, then tell entity to take their turn (they check if they can act)
        this.entities.forEach(ent => {
            ent.pass_time(time_to_pass);
        })

        this.entities.forEach(ent => {
            ent.try_take_turn();
        })
    }
}


class Entity {
    static stat_names = [
        "MAX_HP", "STR", "DEX", "INT", "WIS", "OCC", "DEF", "MDEF"
    ];

    static calc_starting_delay(dex) {
        return Math.floor(Math.max(1, 100 - (0.5*dex)));
    }

    constructor(template, name, level, equipped_items) {
        this.template = template;
        
        this.name = name;

        this.delay = 0;
        this.cooldown = 0;
        this.hp = 0;

        this.team = -1;

        this.base_stats = {
            MAX_HP: 0,
            ATK: 0,
            STR: 0,
            DEX: 0,
            MAG: 0,
            WIS: 0,
            OCC: 0,
            DEF: 0,
            MDEF: 0
        }

        this.bonus_stats = {
            MAX_HP: 0,
            ATK: 0,
            STR: 0,
            DEX: 0,
            MAG: 0,
            WIS: 0,
            OCC: 0,
            DEF: 0,
            MDEF: 0
        }

        this.stats = {
            MAX_HP: 0,
            ATK: 0,
            STR: 0,
            DEX: 0,
            MAG: 0,
            WIS: 0,
            OCC: 0,
            DEF: 0,
            MDEF: 0
        }

        this.level = level;
        this.abilities = [];
        this.specials = new Set();

        this.equipped_items = equipped_items;
        this.setup_stats();
        this.refresh();
    }

    setup_stats() {
        // run on instantiation, and on level change
        Entity.stat_names.forEach(stat => {
            this.base_stats[stat] = this.template.base_stats[stat] + (this.template.base_stats[stat] * this.level);
        });

        let raw_abilities = [
            ...this.template.base_abilities,
            ...this.template.abilities_by_level.filter(a => a.at <= this.level).map(a => a.ability)
        ];

        this.abilities = raw_abilities.filter(a => {
            return !raw_abilities.some(ab => ab.overwrites.has(a.id));
        })

        this.calculate_stats();
    }

    calculate_stats() {
        // run whenever items or effects change
        this.bonus_stats.MAX_HP = 0;
        this.bonus_stats.ATK = 0;
        this.bonus_stats.STR = 0;
        this.bonus_stats.DEX = 0;
        this.bonus_stats.MAG = 0;
        this.bonus_stats.WIS = 0;
        this.bonus_stats.OCC = 0;
        this.bonus_stats.DEF = 0;
        this.bonus_stats.MDEF = 0;

        this.equipped_items.forEach(item => {
            // items apply on bonus stats in both cases and are additive with each other.
            // this means that a sword with +20 ATK and a ring with +15% ATK will apply as follows on a character with 100 ATK:
            // - Sword: +20 bonus ATK
            // - Ring:  +15 bonus ATK
            // - Total: +35 bonus ATK
            // Base and bonus ATK are summed together to get the final value. Some debuffs affect only base stats, some affect final stats.
            item.apply_to_stats(this.base_stats, this.bonus_stats);
            item.specials.forEach(s => this.specials.add(s));
        });

        Entity.stat_names.forEach(stat => {
            this.stats[stat] = this.base_stats[stat] + this.bonus_stats[stat];
        })
    }

    refresh() {
        this.hp = this.stats.MAX_HP;
        this.delay = 0;
        this.cooldown = 0;
    }

    time_until_next_action() {
        return Math.min(this.delay, this.cooldown);
    }

    pass_time(time) {
        this.delay -= time
        this.cooldown -= time;

        // trigger any item, ability or (de)buff effects
    }

    try_take_turn(battle) {
        if (this.time_until_next_action() <= 0) {
            return this.take_turn(battle);
        }

        return false;
    }

    take_turn(battle) {
        // pick a move to use, then pick its targets
        let move_weights = this.abilities.map(ability => {
            let total_weight = 0;
            ability.weighting.forEach(weight => {
                switch (weight.weight) {
                    case NONE:
                        break;

                    case NUM_KILLABLE_TARGETS:
                        // need to implement some sort of move damage testing function, so implement using moves first before moving forward here
                        break;

                    case TARGET_MISSING_HP:
                        break;

                    case TARGET_REMAINING_HP:
                        break;

                    case TARGET_HAS_EFFECT:
                        break;

                    case TARGET_CAN_ACT_IN:
                        break;

                    case ALL_TARGETS_CANNOT_ACT_FOR:
                        break;

                    case NUM_ALLIES_DEAD:
                        break;

                    case NUM_ENEMIES_DEAD:
                        break;

                    default:
                        break;
                }
            })

            return total_weight;
        })
    }
}


class EntityTemplate {
    constructor(base_stats, stats_per_level, base_abilities, abilities_by_level) {
        this.base_stats = base_stats;
        this.stats_per_level = stats_per_level;
        this.base_abilities = base_abilities;
        this.abilities_by_level = abilities_by_level;
    }
}

class EffectTemplate {
    constructor(name, description, fn, positive, ticks_down, dispel_level, effect_on_stats, effect_per_second, effect_on_expire, effect_on_purge) {
        this.name = name;
        this.description = description;
        this.fn = fn;
        this.positive = positive;
        this.ticks_down = ticks_down;
        this.dispel_level = dispel_level;
        
        this.effect_on_stats = effect_on_stats;
        this.effect_per_second = effect_per_second;
        this.effect_on_expire = effect_on_expire;
        this.effect_on_purge = effect_on_purge;
    }
}

class Effect {
    constructor(template, duration) {
        this.template = template;
        this.max_duration = duration;
        this.cur_duration = duration;
    }

    pass_time(time) {
        if (this.template.ticks_down) {
            this.cur_duration -= time;
        }

        if (this.cur_duration <= 0) {
            // entity is responsible for calling the effect_on_expire and effect_per_second functions
            return false;
        }

        return true;
    }
}

class Ability {
    static id_inc = 0;
    static SpecialScalers = {
        MISSING_HP: "max $MULx (based on missing HP)",
        FULL_HP: "max $MULx (based on remaining HP)",
        NUM_ENEMIES: "max $MULx (based on number of enemies remaining)",
        RANDOM: "$P1-$MULx (random)"
    }
    
    static UniqueEffects = {

    }

    static TargetAdvice = {
        NONE: 0,
        LOWEST_HP: 1,
        HIGHEST_HP: 2,
        MOST_HP_MISSING: 3,
        LEAST_HP_MISSING: 4,
        MOST_PHYS_DAMAGE: 5,
        MOST_MAG_DAMAGE: 6
    }

    // Combined with one parameter if relevant. Most of these mean "at least one valid target meets these conditions",
    // and are completely separate from targeting advice.
    // Negative and fractional weights are valid. A weight of 0 means the ability will never be used.
    // Different weightings are additive with each other.
    static Weightings = {
        NONE: 0,
        NUM_KILLABLE_TARGETS: 1,
        TARGET_MISSING_HP: 2,  // parameter defines % of missing HP for this to trigger
        TARGET_REMAINING_HP: 3,
        TARGET_HAS_EFFECT: 4,
        TARGET_CAN_ACT_IN: 5,  // parameter defines number of milliseconds before target can act for this to trigger
        ALL_TARGETS_CANNOT_ACT_FOR: 6,  // only triggers if all targets cannot act for the next N millis
        NUM_ALLIES_DEAD: 7,
        NUM_ENEMIES_DEAD: 8,
    }

    constructor(name, target_advice, target_all=false, can_target_enemies=true, can_target_allies=false, can_target_self=false, unique_effect=null) {
        this.name = name;
        this.description = "";

        this.weighting = [];
        this.target_advice = target_advice;

        this.scalers = [];
        this.status_effects = [];

        this.target_all = target_all;
        this.can_target_enemies = can_target_enemies;
        this.can_target_allies = can_target_allies;
        this.can_target_self = can_target_self;

        this.unique_effect = unique_effect;
    }

    and_scale_on(stat, mul) {
        this.scalers.push({mul: mul, on: stat});
        return this;
    }

    and_scale_special(stat, special, p1=null) {
        this.scalers.push({smul: special, on: stat, p1: p1});
        return this;
    }

    and_apply_effect(effect, chance, duration) {
        this.status_effects.push({effect: effect, chance: chance, duration: duration});
    }

    add_weighting(weight, amount) {
        this.weighting.push({weight: weight, amount: amount});
    }

    generate_description() {
        this.description = "";

        if (this.scalers.length > 0) {
            let scalers_text = "";
            let scaler_fmt = (s => {
                if (s.smul) {
                    // special scaler
                    return `${s.smul} ${s.on}`.replace("$P1", s.p1);
                } else if (s.on) {
                    // regular scaling
                    return `${s.mul}x ${s.on}`;
                } else if (s.mul) {
                    // flat damage
                    return `${s.mul}`;
                }
            });

            if (this.scalers.length >= 2) {
                scalers_text = `Deals ${this.scalers.slice(0, -1).map(scaler_fmt).join(", ")} and ${scaler_fmt(this.scalers[this.scalers.length-1])} damage.`;
            } else {
                scalers_text = `Deals ${scaler_fmt(this.scalers[0])} damage.`
            }

            this.description += scalers_text;
        }

        let status_effects_text = this.status_effects.map(
            s => `${Math.round(s.chance * 100)}% chance to apply ${s.effect.template.name}${s.effect.template.ticks_down ? ` for ${s.duration} seconds` : ``}`
        ).join("\n");

        if (status_effects_text) {
            this.description += `\n\n${status_effects_text}`;
        }

        if (this.unique_effect) {
            this.description += `\n\n${this.unique_effect}`;
        }

        this.description += `\n\nCan target enemies: ${this.can_target_enemies ? (this.target_all ? "affects all enemies" : "yes") : "no"}`;
        this.description += `\nCan target allies: ${this.can_target_allies ? (this.target_all ? "affects all allies" : "yes") : "no"}`;
        this.description += `\nCan target self: ${this.can_target_self ? "yes" : "no"}`;
    }
}
