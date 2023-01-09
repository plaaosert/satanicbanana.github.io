const stat_names = [
    "hp", "atk", "def", "spd", "grow_speed"
];

const Effect = {
    Erosion: 'Erosion',
    Compaction: 'Compaction',
    Degradation: 'Degradation',
    Salinisation: 'Salinisation',
    Contamination: 'Contamination',
    Desertification: 'Desertification'
}

class UnitTemplate {
	constructor(name, short_desc, desc, stats, growth, skills, specials) {
		this.name = name;
        this.short_desc = short_desc;
        this.desc = desc;
        this.stats = stats;
        this.growth = growth;
        this.skills = skills;
        this.specials = specials;
		
		/*
        stats:
            - hp
            - atk
            - def
            - spd
            - grow_speed [the amount of xp gained towards the next size level every round]

        skills:
            a list of [skill_obj, level].
            remember that levels are per-battle.

        specials:
            - controllable [when true, the player can pick the order of skills used. when false, they are shuffled randomly. both types can enable/disable moves.]
            - hp_regen [per round]
            - dodge_chance [0-1, additive]
            - damage_block [flat damage reduction from all attacks]
            - bonus_turns [1 means the unit takes 2 turns every round (twice in a row)]
        */
	}
}

class Unit {
    constructor(template, team, name, plan) {
        this.template = template;
        this.team = team;
        this.battle = undefined;

        // Determined when setting up the battle. You can name your own summons.
        // You can't use the same name for multiple summons and the game should automatically name enemies' summons to avoid duplicates.
        this.name = name;

        this.current_hp = this.template.stats.hp;
        
        this.alive = true;
        this.targetable = true;

        this.level = 1;
        this.xp = 0;
        this.xp_required = get_xp_required(this.level);

        /*
        effects:
            - Erosion           | damage every turn, defense reduces by 10% permanently every turn
            - Compaction        | treated as having zero speed and no dodge chance for the duration
            - Degradation       | all stats reduce by 5% per turn. attack reduces by 12% instead
            - Salinisation      | attack reduces by 10% per turn. damage every turn
            - Contamination     | all stats are halved when the effect is applied and doubled when the effect ends
            - Desertification   | when this effect ends, the unit immediately dies
        */
        this.effects = [];

        this.stats = {
            hp: this.template.stats.hp,
            atk: this.template.stats.atk,
            def: this.template.stats.def,
            spd: this.template.stats.spd,
            grow_speed: this.template.stats.grow_speed
        }

        // Array of moves in the order they will be used.
        // If "controllable" is false in the template, this is randomised here.
        if (!this.template.specials.controllable) {
            this.plan = shuffle(plan);
        } else {
            this.plan = plan;
        }

        this.plan_index = 0;
    }

    mult_stat(stat, val) {
        this.stats[stat] *= val;
    }

    add_stat(stat, val) {
        this.stats[stat] += val;
    }

    die() {
        this.alive = false;
        this.targetable = false;
    }

    take_damage(amount, ignore_def) {
        if (alive) {
            this.current_hp -= Math.round(amount * (ignore_def ? 1 : get_def_reduction(this.stats.def)));
            if (this.current_hp <= 0) {
                this.die();
            }
        }
    }

    level_up() {
        this.level += 1;
        this.xp -= this.xp_required;
        this.xp_required = get_xp_required(this.level);

        stat_names.forEach(stat => {
            this.stats.stat += this.template.growth.stat
        });
    }

    try_level_up() {
		while (this.xp >= this.xp_required && alive) {
			this.level_up();
		}
	}

    play_turn() {
        // Pick the next item in the plan, do it then increment the plan index. If we're at the end, reset the index and shuffle if the unit is not controllable.
        var plan_item = this.plan[this.plan_index];

        // Each plan item should be a move, which has a function use().
        // Targets are selected randomly depending on the move's targeting behaviour.
        var targets = plan_item.target(this, this.battle);
        
        console.log("Using " + plan_item.name + " on:");
        console.log(targets);

        plan_item.use(this, targets, this.battle);

        this.plan_index++;
        if (this.plan_index >= this.plan.length) {
            if (!this.template.specials.controllable) {
                this.plan = shuffle(this.plan);
            }

            this.plan_index = 0;
        }
    }

    end_turn(battle) {
        // add battle logging stuff here
        if (alive) {
            // do turn-end effects
            /*
            effects:
                - Erosion           | 7% current HP as damage every turn, defense reduces by 10% permanently every turn
                - Compaction        | treated as having zero speed and no dodge chance for the duration
                - Degradation       | all stats (except growth speed) reduce by 5% per turn. attack reduces by 12% instead
                - Salinisation      | attack reduces by 10% per turn. 7% max HP as damage every turn
                - Contamination     | ALL stats are halved when the effect is applied and doubled when the effect ends
                - Desertification   | when this effect ends naturally (not purged), the unit immediately dies
            */
            this.effects.forEach(effect => {
                switch (effect[0]) {
                    case Effect.Erosion:
                        this.take_damage(this.current_hp * 0.07, true);
                        this.mult_stat("def", 0.9);
                        break;

                    case Effect.Degradation:
                        this.mult_stat("hp", 0.95);
                        this.mult_stat("atk", 0.88);
                        this.mult_stat("def", 0.95);
                        this.mult_stat("spd", 0.95);
                        break;

                    case Effect.Salinisation:
                        this.take_damage(this.stats.hp * 0.07, true);
                        this.mult_stat("atk", 0.9);
                        break;

                    case Effect.Contamination:
                        if (effect[1] == 0) {
                            stat_names.forEach(stat => {
                                this.mult_stat(stat, 2);
                            });
                        }
                        break;

                    case Effect.Desertification:
                        if (effect[1] == 0) {
                            this.current_hp = 0;
                        }
                        break;
                }
            });

            // do growth
            this.xp += this.stats.grow_speed;

            // check lvlup
            this.try_level_up();
        }
    }
}

function get_xp_required(level) {
    // XP required to reach the next level given a level
    return 14 + (5 * level) + (Math.pow(level, 2));
}

function get_def_reduction(def) {
    // damage multiplier given certain def
    return 1 - ((def - (0.002 * (Math.pow(def, 2)))) / 100);
}