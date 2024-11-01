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

        this.equipped_items = equipped_items;
        this.setup_stats();
        this.refresh();
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

        // effects just refer to an item!
        [...this.equipped_items, ...this.effects.map(e => [e.item, 0])].forEach(item => {
            // items apply on bonus stats in both cases and are additive with each other.
            // this means that a sword with +20 ATK and a ring with +15% ATK will apply as follows on a character with 100 ATK:
            // - Sword: +20 bonus ATK
            // - Ring:  +15 bonus ATK
            // - Total: +35 bonus ATK
            // Base and bonus ATK are summed together to get the final value. Some debuffs affect only base stats, some affect final stats.

            // Bonuses from skill levels are modelled as items ingame, equipped in "bonus slots".
            item[0].apply_to_stats(this.base_stats, this.bonus_stats, mults, item[1]);
            item[0].specials.forEach(s => this.specials.add(s));

            total_weight += item[0].weight;
        });

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

        this.stats.SPD = Math.round(Math.max(0, this.stats.SPD - this.weight));
        this.stats.ACC = Math.round(Math.max(0, this.stats.ACC - (this.weight * 0.25)));
        this.stats.EVA = Math.round(Math.max(0, this.stats.EVA - (this.weight * 0.25)));

        if (this.name == "You")
            document.getElementById("test_label").textContent = `${this.stats.SPD} SPD (x${this.get_speed_mult()})`;
    }

    refresh() {
        this.hp = this.stats.MHP;
        this.set_starting_delays();
    }

    set_starting_delays() {
        for (let i=0; i<this.delays.length; i++) {
            this.delays[i] = this.template.abilities[i].max_delay;
        }
    }

    time_until_next_action() {
        return Math.min(...this.delays);
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

        let f = 100;
        let final_dmg = dmg * (f / (def + f));

        let variance = 0.2;
        let variance_mult = 1 + (-(variance / 2) + (grandom() * variance));
        final_dmg *= variance_mult;

        return Math.round(final_dmg);
    }

    get_hit_chance(source_acc) {
        // hit chance is (source ACC / (source ACC + target EVA)) + 0.25
        return (source_acc / (source_acc + this.stats.EVA)) + 0.25
    }

    initiate_move(target, dmg, dmgtype, crit_chance_bonus, acc_bonus, def_ignore_flat, def_ignore_mul) {
        // some specials will change the DEF ignore amount of certain things, for example
        target.receive_move(dmg, dmgtype, crit_chance_bonus, acc_bonus, def_ignore_flat, def_ignore_mul, this.stats.ACC);
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
            // TODO roll for crit here

            let d = this.calc_damage(dmg, dmgtype, def_ignore_flat, def_ignore_mul);

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
        this.hp = Math.max(0, Math.min(this.stats.MHP, this.hp + by));
    }

    pass_time(time, include_speed_bonus=false) {
        let t = time * (include_speed_bonus ? this.get_speed_mult() : 1);
        this.delays = this.delays.map((d, i) => {
            if (!this.template.abilities[i].not_affected_by_spd) {
                return d - t;
            } else {
                return d - time;
            }
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
            this.calculate_stats();
        }

        // trigger any item, ability or (de)buff effects
    }

    receive_effect(effect, time) {
        this.effects.push(effect.make(time));
        this.calculate_stats();
    }

    apply_effect(target, effect, time) {
        target.receive_effect(effect, time);
    }

    put_ability_on_cooldown(index) {
        this.increase_ability_cooldown(index, this.template.abilities[index].max_delay);
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
        this.template.abilities[index].effect(battle, this, target);
        this.put_ability_on_cooldown(index);
        
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


const ABILITY_GLOBAL_DELAY = 1;
let grandom = get_seeded_randomiser("whatever123");


class EntityTemplate {
    constructor(name, base_stats, xp_value, abilities) {
        this.name = name;
        this.base_stats = base_stats;
        this.xp_value = xp_value;
        this.abilities = abilities;

        this.bar_style = new BarStyle(
            BarStyle.DisplayType.BAR_CHANGE_COL,
            new Colour(192, 0, 0), new Colour(0, 128, 0)
        );
    }
}

class Ability {
    static and(f1, f2) {
        return (b, s, t) => {
            f1(b, s, t);
            f2(b, s, t);
        }
    }

    static regular_attack(mult, crit_chance_bonus=0, acc_bonus=0) {
        return (b, s, t) => s.initiate_move(
            t, s.stats.ATK * mult, DamageType.PHYSICAL,
            crit_chance_bonus, acc_bonus, 0, 0
        )
    }

    static apply_effect(effect, time) {
        return (b, s, t) => s.apply_effect(t, effect, time);
    }

    static gain_effect(effect, time) {
        return (b, s, t) => s.apply_effect(s, effect, time);
    }

    constructor(name, bar_colours, max_delay, effect, global_delay_mult, not_affected_by_spd) {
        this.name = name
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
    constructor(name, bar_style, max_level, xp_multiplier, max_num_applicable_items, items_for_proficiency, level_milestones) {
        this.name = name;
        this.bar_style = bar_style;

        this.max_level = max_level;
        this.xp_multiplier = xp_multiplier;
        this.max_num_applicable_items = max_num_applicable_items;

        this.items_for_proficiency = items_for_proficiency;
        this.level_milestones = level_milestones;
    }

    xp_to_next(lvl) {
        return (lvl * lvl) + (5 * lvl) + 4;
    }
}

class Item {
    static abstract_stats(stats_flat, stats_mult) {
        return new Item(
            "Abstract item", "", null, 0, stats_flat, stats_mult, "", []
        );
    }

    static abstract_special(special) {
        return new Item(
            "Abstract item", "", null, 0, {}, {}, "", [special]
        );
    }

    constructor(name, description, type, weight, stats_flat, stats_mult, unlock_ability, specials) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.weight = weight;

        this.stats_flat = stats_flat;
        this.stats_mult = stats_mult;
        this.unlock_ability = unlock_ability;

        this.specials = specials;
    }

    apply_to_stats(base_stats, bonus_stats, mults, proficiency) {
        switch (this.type) {
            case ITEM_TYPE.KNIFE:
            case ITEM_TYPE.SWORD:
            case ITEM_TYPE.POLEARM:
            case ITEM_TYPE.AXE:
            case ITEM_TYPE.HAMMER:
            case ITEM_TYPE.MARTIAL_WEAPON:
                bonus_stats.ATK += (base_stats.ATK ? base_stats.ATK : 0) * proficiency * 0.01
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

        this.refresh_entity();
    }

    refresh_entity(force_hp=0, keep_hp_value=false, keep_hp_percentage=false) {
        let pl_abilities = [];
        let pl_items = [];

        let last_hp = this.stored_entity?.hp;
        let last_hp_pct = last_hp ? (last_hp / this.stored_entity?.stats.MHP) : undefined;

        // the attack ability might be different based on sect
        pl_abilities.push(ability_list["attack"]);

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

        let total_item_types = {};
        Object.keys(this.equipped_items).forEach(p => {
            if (this.equipped_items[p]) {
                total_item_types[this.equipped_items[p].type] = total_item_types[this.equipped_items[p]] ? total_item_types[this.equipped_items[p]] + 1 : 1;
            }
        });

        if (!this.equipped_items.WEAPON) {
            total_item_types["unarmed"] = 1;
        }

        Object.keys(skills_list).forEach(k => {
            let skill = skills_list[k];

            Object.keys(this.equipped_items).forEach(p => {
                let item = this.equipped_items[p];
                if (!item) {
                    return;
                }

                // check the item type of the equipped item, and if it matches the skill,
                // increase the proficiency of the given slot by the skill level
                if (skill.items_for_proficiency == "ALL" || skill.items_for_proficiency.includes(item.type)) {
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
                        }
                    }
                }
            })
        })

        // add abilities from items
        Object.keys(this.equipped_items).forEach(k => {
            if (this.equipped_items[k]) {
                if (this.equipped_items[k].unlock_ability) {
                    pl_abilities.push(ability_list[
                        this.equipped_items[k].unlock_ability
                    ]);
                }

                pl_items.push([
                    this.equipped_items[k], proficiencies[k]
                ])
            }
        })

        let template = new EntityTemplate(
            "Player", entity_template_list["player"].base_stats, 0, pl_abilities
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
            this.stored_entity.hp = this.stored_entity.stats.MHP * last_hp_pct;
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


// TODO NONE IMPLEMENTED YET
const ITEM_SPECIAL = {
    none: 0,
    light_armour_no_weight: 1,
    medium_armour_mastery_ender: 2,
    heavy_armour_mastery_ender: 3,

    faster_inner_artifacts: 4,
    faster_outer_artifacts: 5,
    faster_divine_artifacts: 6,

    inner_artifact_mastery_ender: 7,
    outer_artifact_mastery_ender: 8,
    divine_artifact_mastery_ender: 9
}


let skills_list = {
    "knife_mastery": new Skill(
        "Knife Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.KNIFE], [
            {lvl: 10,  req: [ITEM_TYPE.KNIFE, 1], item: new Item("Knife 1", "", null, 0, {SPD: 10}, {}, null, [])},
            {lvl: 20,  req: null,                 item: new Item("Knife 2", "", null, 0, {SPD: 7},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.KNIFE, 1], item: new Item("Knife 3", "", null, 0, {}, {}, "combo", [])},
            {lvl: 40,  req: null,                 item: new Item("Knife 4", "", null, 0, {ACC: 6}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.KNIFE, 1], item: new Item("Knife 5", "", null, 0, {EVA: 7}, {}, null, [])},
            {lvl: 60,  req: null,                 item: new Item("Knife 6", "", null, 0, {EVA: 4}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.KNIFE, 1], item: new Item("Knife 7", "", null, 0, {CRIT_CHANCE: 20}, {}, null, [])},
            {lvl: 80,  req: null,                 item: new Item("Knife 8", "", null, 0, {ATK: 15}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.KNIFE, 1], item: new Item("Knife 9", "", null, 0, {}, {}, "fatal_finisher", [])}
        ]
    ),

    "sword_mastery": new Skill(
        "Sword Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.SWORD], [
            {lvl: 10,  req: [ITEM_TYPE.SWORD, 1], item: new Item("Sword 1", "", null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 20,  req: null,                 item: new Item("Sword 2", "", null, 0, {ATK: 8},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.SWORD, 1], item: new Item("Sword 3", "", null, 0, {}, {}, "parry", [])},
            {lvl: 40,  req: null,                 item: new Item("Sword 4", "", null, 0, {SPD: 7}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.SWORD, 1], item: new Item("Sword 5", "", null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 60,  req: null,                 item: new Item("Sword 6", "", null, 0, {ACC: 9}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.SWORD, 1], item: new Item("Sword 7", "", null, 0, {WEIGHT_MODIFIER: -10}, {}, null, [])},
            {lvl: 80,  req: null,                 item: new Item("Sword 8", "", null, 0, {EVA: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.SWORD, 1], item: new Item("Sword 9", "", null, 0, {}, {}, "thousandfold_divide", [])}
        ]
    ),

    "polearm_mastery": new Skill(
        "Polearm Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.POLEARM], [
            {lvl: 10,  req: [ITEM_TYPE.POLEARM, 1], item: new Item("Polearm 1", "", null, 0, {CRIT_CHANCE: 10}, {}, null, [])},
            {lvl: 20,  req: null,                   item: new Item("Polearm 2", "", null, 0, {SPD: 6},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.POLEARM, 1], item: new Item("Polearm 3", "", null, 0, {}, {}, "expose", [])},
            {lvl: 40,  req: null,                   item: new Item("Polearm 4", "", null, 0, {EVA: 7}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.POLEARM, 1], item: new Item("Polearm 5", "", null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 60,  req: null,                   item: new Item("Polearm 6", "", null, 0, {ACC: 10}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.POLEARM, 1], item: new Item("Polearm 7", "", null, 0, {SPD: 10}, {}, null, [])},
            {lvl: 80,  req: null,                   item: new Item("Polearm 8", "", null, 0, {ATK: 12}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.POLEARM, 1], item: new Item("Polearm 9", "", null, 0, {}, {}, "vorpal_strike", [])}
        ]
    ),

    "axe_mastery": new Skill(
        "Axe Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.AXE], [
            {lvl: 10,  req: [ITEM_TYPE.AXE, 1], item: new Item("Axe 1", "", null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 20,  req: null,               item: new Item("Axe 2", "", null, 0, {MHP: 30},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.AXE, 1], item: new Item("Axe 3", "", null, 0, {}, {}, "headhunter", [])},
            {lvl: 40,  req: null,               item: new Item("Axe 4", "", null, 0, {ATK: 11}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.AXE, 1], item: new Item("Axe 5", "", null, 0, {CRIT_CHANCE: 10}, {}, null, [])},
            {lvl: 60,  req: null,               item: new Item("Axe 6", "", null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.AXE, 1], item: new Item("Axe 7", "", null, 0, {MHP: 80}, {}, null, [])},
            {lvl: 80,  req: null,               item: new Item("Axe 8", "", null, 0, {MHP: 80}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.AXE, 1], item: new Item("Axe 9", "", null, 0, {}, {}, "demonic_soul_tribute", [])}
        ]
    ),

    "hammer_mastery": new Skill(
        "Hammer Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.HAMMER], [
            {lvl: 10,  req: [ITEM_TYPE.HAMMER, 1], item: new Item("Hammer 1", "", null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 20,  req: null,                  item: new Item("Hammer 2", "", null, 0, {ATK: 9},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.HAMMER, 1], item: new Item("Hammer 3", "", null, 0, {}, {}, "crush", [])},
            {lvl: 40,  req: null,                  item: new Item("Hammer 4", "", null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.HAMMER, 1], item: new Item("Hammer 5", "", null, 0, {SPD: 5}, {}, null, [])},
            {lvl: 60,  req: null,                  item: new Item("Hammer 6", "", null, 0, {MHP: 70}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.HAMMER, 1], item: new Item("Hammer 7", "", null, 0, {MDF: 13}, {}, null, [])},
            {lvl: 80,  req: null,                  item: new Item("Hammer 8", "", null, 0, {ATK: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.HAMMER, 1], item: new Item("Hammer 9", "", null, 0, {}, {}, "nine_heavens_shattering", [])}
        ]
    ),

    "martial_weapon_mastery": new Skill(
        "Martial Weapon Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 1, [ITEM_TYPE.MARTIAL_WEAPON], [
            {lvl: 10,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new Item("Martial Weapon 1", "", null, 0, {DEF: 7}, {}, null, [])},
            {lvl: 20,  req: null,                          item: new Item("Martial Weapon 2", "", null, 0, {DEF: 6},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new Item("Martial Weapon 3", "", null, 0, {}, {}, "defensive_rush", [])},
            {lvl: 40,  req: null,                          item: new Item("Martial Weapon 4", "", null, 0, {ATK: 8}, {}, null, [])},
            {lvl: 50,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new Item("Martial Weapon 5", "", null, 0, {DEF: 10}, {}, null, [])},
            {lvl: 60,  req: null,                          item: new Item("Martial Weapon 6", "", null, 0, {MDF: 10}, {}, null, [])},
            {lvl: 75,  req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new Item("Martial Weapon 7", "", null, 0, {ATK: 18}, {}, null, [])},
            {lvl: 80,  req: null,                          item: new Item("Martial Weapon 8", "", null, 0, {MHP: 100}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.MARTIAL_WEAPON, 1], item: new Item("Martial Weapon 9", "", null, 0, {}, {}, "martial_soul", [])}
        ]
    ),

    "unarmed_mastery": new Skill(
        "Unarmed Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 1, 0, [], [
            {lvl: 10,  req: ["unarmed", 1], item: new Item("Unarmed 1", "", null, 0, {}, {}, null, [])},
            {lvl: 20,  req: null,           item: new Item("Unarmed 2", "", null, 0, {}, {}, null, [])},
            {lvl: 25,  req: ["unarmed", 1], item: new Item("Unarmed 3", "", null, 0, {}, {}, null, [])},
            {lvl: 40,  req: null,           item: new Item("Unarmed 4", "", null, 0, {}, {}, null, [])},
            {lvl: 50,  req: ["unarmed", 1], item: new Item("Unarmed 5", "", null, 0, {}, {}, null, [])},
            {lvl: 60,  req: null,           item: new Item("Unarmed 6", "", null, 0, {}, {}, null, [])},
            {lvl: 75,  req: ["unarmed", 1], item: new Item("Unarmed 7", "", null, 0, {}, {}, null, [])},
            {lvl: 80,  req: null,           item: new Item("Unarmed 8", "", null, 0, {}, {}, null, [])},
            {lvl: 100, req: ["unarmed", 1], item: new Item("Unarmed 9", "", null, 0, {}, {}, null, [])}
        ]
    ),

    "light_armour_mastery": new Skill(
        "Light Armour Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(128, 128, 128)
        ), 100, 4, 4, [ITEM_TYPE.LIGHT_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new Item("Light Armour 1", "", null, 0, {DEF: 1}, {}, null, [])},
            {lvl: 20,  req: null,                                        item: new Item("Light Armour 2", "", null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                        item: new Item("Light Armour 3", "", null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new Item("Light Armour 4", "", null, 0, {DEF: 3}, {}, null, [])},
            {lvl: 60,  req: null,                                        item: new Item("Light Armour 5", "", null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.LIGHT_ARMOUR, 1], item: new Item("Light Armour 6", "", null, 0, {EVA: 2}, {}, null, [])},
            {lvl: 80,  req: null,                                        item: new Item("Light Armour 7", "", null, 0, {ACC: 8}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.LIGHT_ARMOUR, 1],                 item: new Item("Light Armour 8", "", null, 0, {}, {}, "", [ITEM_SPECIAL.light_armour_no_weight])}
        ]
    ),

    "medium_armour_mastery": new Skill(
        "Medium Armour Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(128, 128, 128)
        ), 100, 4, 4, [ITEM_TYPE.MEDIUM_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new Item("Medium Armour 1", "", null, 0, {DEF: 1}, {}, null, [])},
            {lvl: 20,  req: null,                                         item: new Item("Medium Armour 2", "", null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                         item: new Item("Medium Armour 3", "", null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new Item("Medium Armour 4", "", null, 0, {MHP: 25}, {}, null, [])},
            {lvl: 60,  req: null,                                         item: new Item("Medium Armour 5", "", null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.MEDIUM_ARMOUR, 1], item: new Item("Medium Armour 6", "", null, 0, {SPD: 3}, {}, null, [])},
            {lvl: 80,  req: null,                                         item: new Item("Medium Armour 7", "", null, 0, {EVA: 9}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.MEDIUM_ARMOUR, 3],                 item: new Item("Medium Armour 8", "", null, 0, {}, {}, "", [ITEM_SPECIAL.medium_armour_mastery_ender])}
        ]
    ),

    "heavy_armour_mastery": new Skill(
        "Heavy Armour Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(128, 128, 128)
        ), 100, 4, 4, [ITEM_TYPE.HEAVY_ARMOUR], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new Item("Heavy Armour 1", "", null, 0, {DEF: 2}, {}, null, [])},
            {lvl: 20,  req: null,                                        item: new Item("Heavy Armour 2", "", null, 0, {SPD: 4},  {}, null, [])},
            {lvl: 40,  req: null,                                        item: new Item("Heavy Armour 3", "", null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new Item("Heavy Armour 4", "", null, 0, {SPD: 2}, {}, null, [])},
            {lvl: 60,  req: null,                                        item: new Item("Heavy Armour 5", "", null, 0, {MHP: 50}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.HEAVY_ARMOUR, 1], item: new Item("Heavy Armour 6", "", null, 0, {DEF: 4}, {}, null, [])},
            {lvl: 80,  req: null,                                        item: new Item("Heavy Armour 7", "", null, 0, {DEF: 12}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.HEAVY_ARMOUR, 3],                 item: new Item("Heavy Armour 8", "", null, 0, {}, {}, "", [ITEM_SPECIAL.heavy_armour_mastery_ender])}
        ]
    ),

    "inner_artifact_mastery": new Skill(
        "Inner Artifact Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(96, 96, 192)
        ), 100, 2, 2, [ITEM_TYPE.INNER_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new Item("Inner Artifact 1", "", null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                          item: new Item("Inner Artifact 2", "", null, 0, {MDF: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.INNER_ARTIFACT, 1],                 item: new Item("Inner Artifact 3", "", null, 0, {}, {}, "", [ITEM_SPECIAL.faster_inner_artifacts])},
            {lvl: 40,  req: null,                                          item: new Item("Inner Artifact 4", "", null, 0, {ATT: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new Item("Inner Artifact 5", "", null, 0, {SPD: 3}, {}, null, [])},
            {lvl: 60,  req: null,                                          item: new Item("Inner Artifact 6", "", null, 0, {SPD: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.INNER_ARTIFACT, 1], item: new Item("Inner Artifact 7", "", null, 0, {DEF: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                          item: new Item("Inner Artifact 8", "", null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.INNER_ARTIFACT, 1],                 item: new Item("Inner Artifact 9", "", null, 0, {}, {}, "", [ITEM_SPECIAL.inner_artifact_mastery_ender])}
        ]
    ),

    "outer_artifact_mastery": new Skill(
        "Outer Artifact Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(96, 96, 192)
        ), 100, 2, 2, [ITEM_TYPE.OUTER_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new Item("Outer Artifact 1", "", null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                          item: new Item("Outer Artifact 2", "", null, 0, {ATT: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.OUTER_ARTIFACT, 1],                 item: new Item("Outer Artifact 3", "", null, 0, {}, {}, "", [ITEM_SPECIAL.faster_outer_artifacts])},
            {lvl: 40,  req: null,                                          item: new Item("Outer Artifact 4", "", null, 0, {SPD: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new Item("Outer Artifact 5", "", null, 0, {ACC: 4}, {}, null, [])},
            {lvl: 60,  req: null,                                          item: new Item("Outer Artifact 6", "", null, 0, {MDF: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.OUTER_ARTIFACT, 1], item: new Item("Outer Artifact 7", "", null, 0, {ATK: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                          item: new Item("Outer Artifact 8", "", null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.OUTER_ARTIFACT, 1],                 item: new Item("Outer Artifact 9", "", null, 0, {}, {}, "", [ITEM_SPECIAL.outer_artifact_mastery_ender])}
        ]
    ),

    "divine_artifact_mastery": new Skill(
        "Divine Artifact Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(96, 96, 192)
        ), 100, 2, 2, [ITEM_TYPE.DIVINE_ARTIFACT], [
            {lvl: 10,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new Item("Divine Artifact 1", "", null, 0, {ATT: 4}, {}, null, [])},
            {lvl: 20,  req: null,                                           item: new Item("Divine Artifact 2", "", null, 0, {MDF: 3},  {}, null, [])},
            {lvl: 25,  req: [ITEM_TYPE.DIVINE_ARTIFACT, 1],                 item: new Item("Divine Artifact 3", "", null, 0, {}, {}, "", [ITEM_SPECIAL.faster_divine_artifacts])},
            {lvl: 40,  req: null,                                           item: new Item("Divine Artifact 4", "", null, 0, {MDF: 5}, {}, null, [])},
            {lvl: 50,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new Item("Divine Artifact 5", "", null, 0, {EVA: 4}, {}, null, [])},
            {lvl: 60,  req: null,                                           item: new Item("Divine Artifact 6", "", null, 0, {ATT: 7}, {}, null, [])},
            {lvl: 75,  per_item: true, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1], item: new Item("Divine Artifact 7", "", null, 0, {ATT: 5}, {}, null, [])},
            {lvl: 80,  req: null,                                           item: new Item("Divine Artifact 8", "", null, 0, {ATT: 10}, {}, null, [])},
            {lvl: 100, req: [ITEM_TYPE.DIVINE_ARTIFACT, 1],                 item: new Item("Divine Artifact 9", "", null, 0, {}, {}, "", [ITEM_SPECIAL.divine_artifact_mastery_ender])}
        ]
    ),

    "combat": new Skill(
        "Combat", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(160, 96, 96)
        ), 100, 8, 7, "ALL", [
            
        ]
    ),

    "artifact_mastery": new Skill(
        "Artifact Mastery", new BarStyle(
            BarStyle.DisplayType.GRADIENT,
            new Colour(128, 32, 32), new Colour(96, 96, 192)
        ), 100, 8, 2, [ITEM_TYPE.INNER_ARTIFACT, ITEM_TYPE.OUTER_ARTIFACT, ITEM_TYPE.DIVINE_ARTIFACT], [

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
}


let ability_list = {
    "attack": new Ability(
        "Attack",
        default_cols.attack,
        8, Ability.regular_attack(1)
    ),

    // add alternate attacks here

    "wooden_sword_moment": new Ability(
        "Wooden sword moment",
        default_cols.magic,
        60, Ability.regular_attack(3)
    ),

    "combo": new Ability(
        "Combo",
        default_cols.defense,
        30, Ability.gain_effect(
            new Effect(
                Item.abstract_stats({SPD: 60}, {}), true
            ), 8
        )
    ),

    "fatal_finisher": new Ability(
        "Fatal Finisher",
        default_cols.ult_attack,
        600, Ability.regular_attack(10), -1
    ),

    "parry": new Ability(
        "Parry",
        default_cols.defense,
        90, Ability.gain_effect(
            new Effect(
                Item.abstract_stats({}, {DEF: 9}), true
            ), 7
        )
    ),

    "thousandfold_divide": new Ability(
        "Thousandfold Divide",
        default_cols.ult_attack,
        120, Ability.and(
            Ability.regular_attack(7.5),
            Ability.apply_effect(new Effect(Item.abstract_stats({}, {SPD: -1}), false), 24)
        )
    ),

    // TODO all below untested
    // also add descriptions to everything!!!!
    "expose": new Ability(
        "Expose",
        default_cols.attack,
        48, Ability.and(
            Ability.regular_attack(0.5),
            Ability.gain_effect(new Effect(Item.abstract_stats({CRIT_CHANCE: 0.3}, {}), true), 16)
        )
    ),

    "vorpal_strike": new Ability(
        "Vorpal Strike",
        default_cols.ult_attack,
        48, Ability.regular_attack(400, 999, 99999999)
    ),

    "headhunter": new Ability(
        "Headhunter",
        default_cols.attack,
        70, (b, s, t) => s.initiate_move(
            t, (s.stats.ATK * 0.4) + (t.hp * 0.25), DamageType.PHYSICAL,
            0, 0, 0, 0
        )
    ),

    "demonic_soul_tribute": new Ability(
        "Demonic Soul Tribute",
        default_cols.ult_defense,
        120, Ability.gain_effect(
            new Effect(
                Item.abstract_stats({ATK: 200}, {ATK: 0.6}), true
            ), 30
        )
    ),

    "crush": new Ability(
        "Crush",
        default_cols.attack,
        80, Ability.and(
            Ability.regular_attack(1.2),
            Ability.apply_effect(
                new Effect(
                    Item.abstract_stats({DEF: -15, MDF: -15, SPD: -15, EVA: -15}, {}), false
                ), 20
            )
        )
    ),

    "nine_heavens_shattering": new Ability(
        "Nine Heavens Shattering",
        default_cols.ult_attack,
        100, (b, s, t) => s.initiate_move(
            t, (s.stats.ATK * 1) + (s.stats.MHP * 0.2) + (s.stats.DEF * 3),
            DamageType.PHYSICAL,
            0, 0, 0, 0
        )
    ),

    "defensive_rush": new Ability(
        "Defensive Rush",
        default_cols.attack,
        24, Ability.and(
            Ability.regular_attack(0.8),
            Ability.gain_effect(
                new Effect(
                    Item.abstract_stats({}, {DEF: 0.8}), true
                ), 8
            )
        )
    ),

    "martial_soul": new Ability(
        "Martial Soul",
        default_cols.ult_defense,
        60, Ability.gain_effect(
            new Effect(
                Item.abstract_stats({}, {ATK: 1, DEF: 1, MDF: 1, SPD: 1, ACC: 1, EVA: 1}), true
            ), 20
        ), 1, true
    ),

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
    )
}