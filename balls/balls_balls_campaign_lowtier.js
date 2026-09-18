class ShivBall extends WeaponBall {
    static ball_name = "Shiv";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Shiv";
        this.description_brief = "Has a shiv which is periodically thrown. The shiv applies rupture equal to damage while thrown and bounces once on hit or parry.";
        this.level_description = "Increases shiv throw and reload frequency.";
        this.max_level_description = "The thrown shiv reflects off walls up to twice.";
        this.quote = "I'm gonna getcha! Hehehehe!";

        this.pronoun = PRONOUN.HE;
        this.tagline = "A bloodthirsty and wicked ball stopped only by the fact that he was born under three months ago.";
        this.description = ""
        this.lore_description = "In recent times, prospective Arena combatants have been warned of a terrifying entity named Shiv, so violent and terrible that his time in the Arena isn't a job but a prison sentence... until they actually fight him and realise those rumours were actually about Dagger. Shiv might one day hold that reputation too, though, if his parents don't step in soon."
        this.weapon_relationship = "Hahahahahaha!! Blood! Kill! Death! Hehehehehe!!"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Deranged"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "16th Jun"

        this.default_colour = Colour.from_hex("#da2532")

        this.tier = TIERS.C;
        this.category = CATEGORIES.LOWTIER;
        this.tags = [
            TAGS.HYBRID,
            TAGS.OFFENSIVE,
            TAGS.AILMENTS,
            TAGS.PROJECTILES,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "shiv", [
                {pos: new Vector2(72, 64), radius: 12},
                {pos: new Vector2(56, 64), radius: 12},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-30, 0);

        // scales based on STARTING_HP
        this.max_hp = this.max_hp * (30 / 100);
        this.hp = this.max_hp;

        this.damage_base = 2;
        this.speeds_range = [160, 240];

        this.speed = random_float(...this.speeds_range, this.board.random);

        this.throw_cooldowns_max = [0.7, 1.6];
        this.throw_cooldown = random_float(...this.throw_cooldowns_max, this.board.random);
    
        this.reload_duration_max = [1.1, 2];
        this.reload_duration = 0;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);
        if (this.reload_duration > 0) {
            this.reload_duration -= time_delta;
            if (this.reload_duration <= 0) {
                this.weapon_data[0].hitboxes = [
                    {pos: new Vector2(72, 64), radius: 12},
                    {pos: new Vector2(56, 64), radius: 12},
                ];
                this.weapon_data[0].display = true;

                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();
            }
        } else {
            this.throw_cooldown -= time_delta;
            if (this.throw_cooldown <= 0) {
                this.throw_cooldown = random_float(...this.throw_cooldowns_max, this.board.random);
                this.reload_duration = random_float(...this.reload_duration_max, this.board.random);

                let pos = this.position.add(this.get_weapon_offset(0));
                let proj = new ShivProjectile(
                    this.board, this, 0, pos, this.damage_base, 1,
                    Vector2.forward.rotate(this.weapon_data[0].angle), 12000, Vector2.zero,
                    this.level >= AWAKEN_LEVEL ? 2 : 0
                )

                this.weapon_data[0].hitboxes = [

                ];
                this.weapon_data[0].display = false;

                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();

                this.board.spawn_projectile(proj, pos);
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        this.apply_rupture(other, dmg);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            this.apply_rupture(other, with_projectile.damage);
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )

        if (this.reload_duration > 0) { 
            this.write_desc_line(
                `Reloading... (${this.reload_duration.toFixed(1)}s)`
            )
        } else {
            this.write_desc_line(
                `Throwing...  (${this.throw_cooldown.toFixed(1)}s)`
            )
        }
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Thrown shivs bounce twice on walls.`, true
            )
        } else {
            this.write_desc_line(
                `Periodically throws shivs.`
            )
        }

        if (this.reload_duration > 0) { 
            this.write_desc_line(
                `Reloading... (${this.reload_duration.toFixed(1)}s)`
            )
        } else {
            this.write_desc_line(
                `Throwing...  (${this.throw_cooldown.toFixed(1)}s)`
            )
        }
    }
}

class CutlassBall extends WeaponBall {
    static ball_name = "Cutlass";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Cutlass";
        this.description_brief = "Has an innate chance to crit, dealing extra damage. Each hit gathers gold, which grants progressive bonuses as more is gathered.";
        this.level_description = "Gains additional base crit chance and more gold on hit.";
        this.max_level_description = "Parries provide some gold.";
        
        this.quote = "Yarr... you werrrrn't no match forrr me!";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Cutlass's lust for victory is matched only by his lust for gold, which he slakes through theft and piracy. With enough gold, the pirate world will respect him at last!";
        this.description = "";
        this.lore_description = "Cutlass was born during the golden age of piracy on Remnath, which happens to be right now. Piracy is in his family, in his soul; the only problem is that true pirates need lots and lots of treasure. Cutlass seeks to remedy this problem the only way he knows how: violence."
        this.weapon_relationship = "Ahoy! Yerrr wantin' to know about my WEAPON, eh? Well, it be rrrrreal simple. I chop, it gatherrrs! Har har har har har!"
        this.lore_origin = "Alrath"
        this.lore_temperament = "Plucky"
        this.lore_affiliation = "Alrath Super Pirate Squad"
        this.lore_alignment = "red"
        this.lore_birthday = "5th May"

        this.default_colour = Colour.from_hex("#EFBF04")

        this.tier = TIERS.B;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.BPLUS;
        }

        this.category = CATEGORIES.LOWTIER;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
            TAGS.SCALING,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(0.9, "cutlass", [
                {pos: new Vector2(100, 58), radius: 14},
                {pos: new Vector2(80, 70), radius: 10},
                {pos: new Vector2(64, 70), radius: 10},
                {pos: new Vector2(48, 70), radius: 10},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-16, 0);

        this.max_hp = this.max_hp * (70 / 100);
        this.hp = this.max_hp;

        this.damage_base = 2
        this.speed_base = 130

        this.base_crit_chance = 0.1;
        this.base_crit_mul = 2;
        
        this.dmg_to_gold = [7500, 12500];
        this.gold_mul = 1 + (this.level * 0.01);

        this.gold_on_parry = this.level >= AWAKEN_LEVEL ? 2500 : 0;

        this.gold = 0;

        // 1,000,000 gold is 100 hp (on avg)
        this.gold_thresholds = [
            // title, [dmg, speed, critchance, critdmg, heal/s], threshold
            ["Rookie Pirate",         [1, 1, 1, 1, 0], Number.NEGATIVE_INFINITY],
            ["Plucky Plunderer",      [1.5, 1.4, 1, 1, 0], 50000],
            ["Treasure Hunter",       [2, 1.7, 1.25, 1, 0.2], 175000],
            ["Infamous Extortionist", [2.5, 2, 1.5, 1.5, 0.5], 500000],
            ["Terror of the Seas",    [3, 2.5, 2, 2, 2], 1000000],
            ["The Greatest Pirate",   [4, 3.5, 3, 3, 4], 2000000],
        ];

        this.last_threshold = this.gold_thresholds[0];
        this.update_gold_threshold();

        this.heal_stored = 0;
    }

    update_gold_threshold() {
        let lastname = this.last_threshold[0];

        let set = false;
        for (let i=0; i<this.gold_thresholds.length; i++) {
            if (this.gold < this.gold_thresholds[i][2] && !set) {
                this.cur_threshold = this.gold_thresholds[i - 1];
                set = true;
                break;
            }
        }

        if (!set)
            this.cur_threshold = this.gold_thresholds[this.gold_thresholds.length - 1];

        this.last_threshold = this.cur_threshold;

        this.damage = this.damage_base * this.cur_threshold[1][0];
        this.speed = this.speed_base * this.cur_threshold[1][1];
        this.critchance = this.base_crit_chance * this.cur_threshold[1][2];
        this.critdmg = this.base_crit_mul * this.cur_threshold[1][3];
        this.heal_per_second = this.cur_threshold[1][4];

        if (lastname != this.cur_threshold[0]) {
            play_audio("tada", 0.25);

            this.board.spawn_particle(new TextParticle(
                this.position.add(new Vector2(0, -768 - 200)), 1,
                "[ RANK UP ]", this.get_current_desc_col(), this.board,
                20, 3
            ), this.position.add(new Vector2(0, -768 - 200))).add_component(new MovingParticleComponent(
                this.board, new Vector2(0, -128)
            )).add_component(new FadeOutParticleComponent(
                this.board, 2.5, 1
            ));

            this.board.spawn_particle(new TextParticle(
                this.position.add(new Vector2(0, -512 - 200)), 1,
                `- ${this.cur_threshold[0]} -`, this.get_current_desc_col(), this.board,
                14, 3
            ), this.position.add(new Vector2(0, -512 - 200))).add_component(new MovingParticleComponent(
                this.board, new Vector2(0, -128)
            )).add_component(new FadeOutParticleComponent(
                this.board, 2.5, 1
            ));
        }
    }

    get_gold(amt, source_pos) {
        if (amt <= 0)
            return;

        let render_amt = Math.min(amt, 2e5);
        for (let i=0; i<render_amt / 15000; i++) {
            let index = random_int(1, 4, this.independent_random);
            this.board.set_timer(new Timer(b => {
                play_audio(`coin_jingle_${index}`, 0.2);
            }, random_float(0, 0.25, this.independent_random)));
        }

        for (let i=0; i<render_amt/6000; i++) {
            this.board.spawn_particle(new EnergyBurstParticle(
                source_pos, 0.6, entity_sprites.get("railgun_point"), 0, 16, true,
                25000, 120000, this, Colour.from_hex("#EFBF04"), 4, 2, 0, true
            ), source_pos);

            this.board.set_timer(new Timer(b => {
                let p = this.board.spawn_particle(new Particle(
                    this.position, deg2rad(random_int(0, 4, this.independent_random) * 90),
                    random_float(0.8, 1.2, this.independent_random),
                    entity_sprites.get("coin"), random_float(16, 24, this.independent_random),
                    50, true
                ), this.position);

                let mpc = new MovingParticleComponent(
                    this.board, random_on_circle(
                        random_float(2000, 4000, this.independent_random),
                        this.independent_random
                    )
                );

                let gc = new GravityParticleComponent(
                    this.board, mpc, this.board.gravity
                );

                p.add_component(mpc).add_component(gc);
            }, random_float(0.1, 0.3, this.independent_random)));
        }

        this.board.spawn_particle(new TextParticle(
            this.position.add(new Vector2(0, -512 - 200)), 1,
            `+ ${amt.toLocaleString()} G`, this.get_current_desc_col(), this.board,
            14, 1
        ), this.position.add(new Vector2(0, -512 - 200))).add_component(new MovingParticleComponent(
            this.board, new Vector2(0, -256)
        )).add_component(new FadeOutParticleComponent(
            this.board, 0.5, 1
        ));

        this.gold += amt;
        this.update_gold_threshold();
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);

        this.heal_stored += this.heal_per_second * time_delta;
        if (this.heal_stored > 1) {
            let heal = Math.floor(this.heal_stored);

            this.gain_hp(heal, this);
            this.heal_stored -= heal;
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        
        this.get_gold(this.gold_on_parry, other_ball.position);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        
        this.get_gold(this.gold_on_parry, projectile.position);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage;

        if (this.board.random() < this.critchance) {
            dmg *= this.critdmg;
            play_audio("bloodyhit1", 0.125);
        }

        let result = super.hit_other(other, with_weapon_index, dmg);

        let finaldmg = result?.dmg ?? 0;
        if (finaldmg > 0) {
            this.get_gold(
                Math.round(random_float(...this.dmg_to_gold, this.board.random) * this.gold_mul) * finaldmg,
                other.position
            );
        }

        return result;
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `${this.cur_threshold[0]} (${this.gold.toLocaleString()} G)`
        );
        
        let line = "";
        let line2 = "";
        let line3 = "";
        if (this.cur_threshold[1][0] != 1) {
            line += `dmg: ${this.cur_threshold[1][0]}x  `
        }

        if (this.cur_threshold[1][1] != 1) {
            line += `spd: ${this.cur_threshold[1][1]}x  `
        }

        if (this.cur_threshold[1][2] != 1) {
            line2 += `crit: ${this.cur_threshold[1][2]}x chance/${this.cur_threshold[1][3]}x dmg  `
        }

        if (this.cur_threshold[1][4] != 0) {
            line3 += `heal: ${this.cur_threshold[1][4]}/s  `
        }

        this.write_desc_line(
            line
        )

        this.write_desc_line(
            line2
        )

        this.write_desc_line(
            line3
        )
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Damage: ${this.damage.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Crit: ${(this.critchance * 100).toFixed(0)}% / ${this.critdmg}x`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Gains ${this.gold_on_parry} gold on parry.`, true
            )
        }

        this.write_desc_line(
            `${this.cur_threshold[0]} (${this.gold.toLocaleString()} G)`
        );

        let line = "";
        let line2 = "";
        let line3 = "";
        if (this.cur_threshold[1][0] != 1) {
            line += `dmg: ${this.cur_threshold[1][0]}x  `
        }

        if (this.cur_threshold[1][1] != 1) {
            line += `spd: ${this.cur_threshold[1][1]}x  `
        }

        if (this.cur_threshold[1][2] != 1) {
            line2 += `crit: ${this.cur_threshold[1][2]}x chance/${this.cur_threshold[1][3]}x dmg  `
        }

        if (this.cur_threshold[1][4] != 0) {
            line3 += `heal: ${this.cur_threshold[1][4]}/s  `
        }

        this.write_desc_line(
            line
        )

        this.write_desc_line(
            line2
        )

        this.write_desc_line(
            line3
        )
    }
}

class BallBall extends WeaponBall {
    static ball_name = "Ball";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        // TODO this one should multi-awaken in campaign, having no level cap
        this.name = "Ball";
        this.description_brief = "Throws random mini-balls. Mini-balls bounce around and damage the first enemy they hit. Mini-balls are destroyed after hitting or getting hit by anything.";
        this.level_description = "Reduces throw delay.";
        this.max_level_description = "Every 100 levels, gains a new ball thrower, multiplies all damage output by 1.5x and increases max HP by 25.";
        this.quote = "...";

        this.pronoun = PRONOUN.IT;
        this.tagline = "An amalgamation of ball concept that seems to never stop growing.";
        this.description = "This ball may be able to break past level 100..."
        this.lore_description = "In the annals of history, the story of Ball has served as a cautionary reminder of why tethering another ball must never be attempted. Though the process would usually result in mutual annihilation, it was not so for Ball, who stayed alive, but more as a natural force than a conscious being. Who tethered who in the beginning is, at this point, mostly immaterial - besides, many thousands of balls have since been absorbed into the tether, despite ballkind's attempts to destroy it. Though waning belief in it has weakened it, the hushed stories told over campfires keep it alive. A run in the Grand Arena might be enough to bring it to power levels never known, even in the depths of history - but nobody would be fool enough to let that happen!"
        this.weapon_relationship = "..."
        this.lore_origin = "Beginning of Time"
        this.lore_temperament = "Hungry"
        this.lore_affiliation = "Independent"
        this.lore_alignment = "green"
        this.lore_birthday = "Unknown"

        this.default_colour = Colour.from_hex("#5062e5")

        this.awaken_tier = Math.floor((this.level+1) / 100);

        this.tier = [
            TIERS.C,
            TIERS.B,
            TIERS.A, TIERS.APLUS,
            TIERS.S, TIERS.SPLUS,
            TIERS.X
        ][Math.min(6, this.awaken_tier)]

        this.category = CATEGORIES.LOWTIER;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.level_limit = 999;

        this.weapon_data = [
            
        ];

        for (let i=0; i<(this.awaken_tier+1); i++) {
            this.weapon_data.push(new BallWeapon(0.75, "ballball_red", [
                // {pos: new Vector2(16, 64), radius: 64},
            ]));

            this.weapon_data[i].offset = new Vector2(-32, 0);
            this.weapon_data[i].reversed = i%2==1;
        }

        this.possible_cols = [
            "red", "yellow", "green", "blue", "orange", "dgreen",
            "seagreen", "magenta", "violet", "pink"
        ];

        this.get_new_cols();

        // scales based on STARTING_HP
        this.max_hp = this.max_hp * ((25 * (1 + (this.awaken_tier))) / 100) + 25;
        this.hp = this.max_hp;

        this.damage_base = 1 * Math.pow(1.5, this.awaken_tier);

        this.base_speed = 200;

        let throw_reduction = (100/99) * 0.001 * this.level;
        this.throw_cooldowns_max = [Math.max(0.1, 0.7-throw_reduction), Math.max(0.1, 1.6-throw_reduction)];
        this.throw_cooldowns = new Array(this.weapon_data.length).fill(0).map(_ => {
            return random_float(...this.throw_cooldowns_max, this.board.random);
        });
    }

    get_new_cols() {
        this.cur_cols = new Array(this.weapon_data.length).fill("red");

        for (let i=0; i<this.weapon_data.length; i++) {
            this.get_new_col(i);
        }
    }

    get_new_col(index) {
        this.cur_cols[index] = seeded_random_from_array(this.possible_cols, this.board.random)
        this.weapon_data[index].sprite = `ballball_${this.cur_cols[index]}`;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.base_speed * time_delta);
            this.throw_cooldowns[i] -= time_delta;
            if (this.throw_cooldowns[i] <= 0) {
                this.throw_cooldowns[i] += random_float(...this.throw_cooldowns_max, this.board.random);

                let position = this.get_weapon_offset(i).add(this.position);
                let velocity = new Vector2(8000 * random_float(0.5, 2, this.board.random), 0).rotate(this.weapon_data[i].angle)
                let new_ball = new BallBallBall(
                    this.board,
                    this.mass * 0.25, this.radius * 0.5, this.colour,
                    this.bounce_factor, this.friction_factor,
                    this.player, this.level, this.cur_cols[i]
                )

                new_ball.apply_invuln(BALL_INVULN_DURATION);
                new_ball.show_stats = false;

                new_ball.set_velocity(velocity);
                new_ball.parent = this;

                let part = new Particle(position, 0, 0.75, entity_sprites.get(`ballball_${this.cur_cols[i]}`), 0, 999999);
                board.spawn_particle(part, position);
                new_ball.linked_particle = part;
                part.rotation_angle = this.weapon_data[i].angle;
                
                new_ball.linked_particle.time_locked = false;

                board.spawn_ball(new_ball, position);
                
                this.get_new_col(i);
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `More ball throwers (${this.weapon_data.length}) and ${this.damage_base}x damage.`, true
            )
        } else {
            this.write_desc_line(
                `Periodically throws balls.`
            )
        }
    }
}

class BallBallBall extends WeaponBall {
    static ball_name = "BallBall Ball";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, ballcolour) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "BallBall Ball";
        this.description_brief = "Fired from the ball ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [
            new BallWeapon(0.75, `ballball_${ballcolour}`, [
                {pos: new Vector2(64, 64), radius: 25},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-69, 0);

        this.lifetime = 0;
        this.duration = Number.POSITIVE_INFINITY;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = random_float(240, 480);
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        let result = this.parent.hit_other(other, with_weapon_index);
        this.hp -= 1;

        return result;
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // this deliberately does not call its super
        // because we don't want these to count for tension
        
        this.hp -= 1;

        other_ball.weapon_data[other_weapon_id]?.reverse()
    }

    parry_projectile(with_weapon_index, projectile) {
        // this deliberately does not call its super
        // because we don't want these to count for tension

        this.hp -= 1;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.35, entity_sprites.get("explosion_small"), 24, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class LaserPointerBall extends WeaponBall {
    static ball_name = "Laser Pointer";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Laser Pointer";
        this.description_brief = "Constantly projects a narrow beam that applies burn. Hitting with the beam charges up a reflecting laser blast.";
        this.level_description = "Increases charge speed.";
        this.max_level_description = "Shoots two charged blasts at once.";

        this.quote = "Pew! Pew! Pew pew pew!";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Burns targets with her probably-illegal laser, then finishes the job with a definitely-illegal blast.";
        this.description = ""
        this.lore_description = "One of Railgun's most devoted fans, Laser Pointer can't quite replicate her tech but has settled for a similarly destructive alternative. After tethering to a laser pointer which she definitely should not have owned, she does her most earnest impression of Railgun's showballship - not quite there, but she's got the spirit!"
        this.weapon_relationship = "Oh my gosh, like, did you see Railgun last night?! She had me BLASTING on that triple-hit! I think I need to win my next bout or my prize money won't cover the repairs..."
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Curious"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "green"
        this.lore_birthday = "4th Feb"

        this.default_colour = Colour.from_hex("#FF5454")

        this.tier = TIERS.B;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.BPLUS;
        }

        this.category = CATEGORIES.LOWTIER;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.HITSCAN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "laserpointer", [
                {pos: new Vector2(20, 64), radius: 4},
                {pos: new Vector2(24, 64), radius: 4},
                {pos: new Vector2(28, 64), radius: 4},
                {pos: new Vector2(32, 64), radius: 4},
                {pos: new Vector2(36, 64), radius: 4},
            ])
        ];

        this.firing_offsets = [
            new Vector2(64, 0)
        ]

        this.max_hp = this.max_hp * (60 / 100);
        this.hp = this.max_hp;

        this.speed = 100;

        this.laser_burn_per_second = 10;
        this.laser_charge_per_second = 80;
        this.max_charge = 10 - (this.level * 0.02);
        this.charge = 0;

        this.laser_proj = null;
        this.laser_proj_cooldown = 0;

        this.blast_damage = 6;
        this.blast_reflects = 10;
    }

    get_firing_offset() {
        return this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
    }

    get_charge(amt) {
        let last_charge = this.charge;
        this.charge += amt;

        let p = 0.5;
        if (Math.floor(last_charge / p) < Math.floor(this.charge / p)) {
            let rev_sprites = entity_sprites.get("superflash3").toReversed();

            for (let i=0; i<last_charge/p; i++) {
                this.board.set_timer(new Timer(b => {
                    let pos = this.position;
                    this.board.spawn_particle(new Particle(
                        pos, random_float(0, Math.PI * 2, this.independent_random), 3,
                        rev_sprites,
                        random_float(16, 24, this.independent_random), 800
                    ), pos).add_component(new OverlayBallParticleComponent(
                        this.board, this
                    ));
                }, random_float(0.15, 0.3, this.independent_random)));
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);
        
        this.laser_proj_cooldown -= time_delta;
        if ((!this.laser_proj || !this.laser_proj.active || this.laser_proj.lifetime > this.laser_proj.duration) && this.laser_proj_cooldown <= 0) {
            let p = this.get_firing_offset();
            this.laser_proj = this.board.spawn_projectile(new LaserPointerPersistentProjectile(
                this.board, this, 0, p, 0, p
            ), p);
        }

        if (this.charge >= this.max_charge) {
            this.laser_proj.lifetime = 0;
            this.laser_proj.active_duration = 0.02;
            this.laser_proj.duration = 0.25;
            
            let deg = this.level >= AWAKEN_LEVEL ? deg2rad(10) : 0;

            for (let i=0; i<(this.level >= AWAKEN_LEVEL ? 2 : 1); i++) {
                let deg_rot = this.weapon_data[0].angle + (deg * (i == 0 ? -1 : 1));

                let spos = this.position.add(this.get_firing_offset());
                let tpos = spos.add(new Vector2(10000, 0).rotate(deg_rot));
                
                this.board.spawn_projectile(new LaserPointerBlastProjectile(
                    this.board, this, 1, spos, this.blast_damage, tpos, this.blast_reflects
                ), spos);
            }
            play_audio("explosion_1", 0.15);

            this.laser_proj_cooldown = 1;
            this.charge = 0;
        }
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            if (with_projectile instanceof LaserPointerPersistentProjectile) {
                other.apply_invuln(0, true);
                
                other.hitstop = 0;
                this.hitstop = 0;

                result.mute = true;
            }
        }

        if (with_projectile.source_weapon_index == 0) {
            other.apply_invuln(0.015, true);

            if (this.independent_random() < 1) {
                for (let i=0; i<1; i++) {
                    this.board.spawn_particle(new EnergyBurstParticle(
                        other.position, 0.6, entity_sprites.get("railgun_point"), 0, 16, true,
                        25000, 120000, this, new Colour(255, 84, 84, 255), 4, 2, 0, true
                    ), other.position)
                }
            }
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "Fires a laser to charge a reflecting blast."
        );

        this.write_desc_line(
            `Rotation speed: ${this.speed} deg/s`
        );

        this.write_desc_line(
            `Laser burn/s: ${this.laser_burn_per_second}`
        );

        this.write_desc_line(
            `Laser charge/s: ${this.laser_charge_per_second}`
        );

        let llen = 40;
        let blen = llen - 2;

        let segs = Math.floor(Math.min(1, (this.charge / this.max_charge)) * blen);
        let segs2 = blen - segs;
        this.write_desc_line(
            `[${"#".repeat(segs)}${" ".repeat(segs2)}]`
        );

        let text = `${this.charge.toFixed(2)} / ${this.max_charge.toFixed(2)}`;
        let lpad = Math.floor((llen - text.length) / 2);
        let rpad = llen - text.length - lpad;
        this.write_desc_line(
            `${" ".repeat(lpad)}${text}${" ".repeat(rpad)}`
        );
    }
}

class ShivProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel, bounces, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "shiv" + sprite_suffix;
        
        this.stored_hitboxes = [
            {pos: new Vector2(-8, 0), radius: 10},
            {pos: new Vector2(8, 0), radius: 10},
        ];

        this.set_hitboxes(this.stored_hitboxes);

        this.bounces = bounces;

        this.override_velocity = this.direction.mul(this.speed);
        this.gravity = false;

        this.override_angle = this.direction.angle();
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.override_velocity.mul(time_delta)));

        if (this.bounces > 0 && !this.board.in_bounds(this.position)) {
            let bounced = false;
            if (this.position.x <= 0 && this.override_velocity.x < 0) {
                bounced = true;
                this.override_velocity.x *= -1;
            } else if (this.position.x >= this.board.size.x && this.override_velocity.x > 0) {
                bounced = true;
                this.override_velocity.x *= -1;
            } else if (this.position.y <= 0 && this.override_velocity.y < 0) {
                bounced = true;
                this.override_velocity.y *= -1;
            } else if (this.position.y >= this.board.size.y && this.override_velocity.y > 0) {
                bounced = true;
                this.override_velocity.y *= -1;
            }

            if (bounced) {
                this.bounces--;
                this.set_dir(this.override_velocity.normalize());
            }
        }

        if (this.gravity) {
            this.override_angle += deg2rad(360 * time_delta);
            this.set_dir(Vector2.forward.rotate(this.override_angle));

            this.override_velocity = this.override_velocity.add(this.board.gravity.mul(time_delta));
        }
    }

    try_jump_in_air() {
        if (!this.gravity) {
            this.active = true;

            this.set_hitboxes([]);
            this.bounces = 0;
            this.gravity = true;
            this.override_velocity = random_on_circle(3000, this.board.random).add(new Vector2(0, -8000));

            this.board.set_timer(new Timer(b => this.set_hitboxes(this.stored_hitboxes), 0.1));
        } else {
            this.active = false;
        }
    }

    hit_other_projectile(other_projectile) {
        this.try_jump_in_air();
    }

    get_parried(by) {
        this.try_jump_in_air();
    }

    hit_ball(ball, delta_time) {
        this.try_jump_in_air();
    }
}

class LaserPointerPersistentProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 8;
        this.sprite_colour = "red";
    
        this.parriable = false;
        this.active_duration = Number.POSITIVE_INFINITY;
        this.duration = Number.POSITIVE_INFINITY;
        this.create_multiple_hitboxes = true;

        this.hit_particles_override = "hit_fire";

        this.playing_noise = true;
    }

    physics_step(time_delta) {
        let ipos = this.source.position.add(this.source.get_firing_offset());
        let tpos = ipos.add(new Vector2(10000, 0).rotate(this.source.weapon_data[0].angle));
        
        this.set_pos(ipos);
        this.target_position = tpos;

        if (this.source.hp <= 0) {
            this.active = false;
        }

        super.physics_step(time_delta);
    }

    hit_other_projectile(other_projectile) {
        this.active = true;
    }

    get_parried(by) {
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        this.active = true;

        this.source.apply_burn(ball, this.source.laser_burn_per_second * delta_time);
        
        this.board.set_timer(new Timer(b => {
            this.source.get_charge(this.source.laser_charge_per_second * delta_time);
        }, 0.2));

        if (this.playing_noise)
            play_audio("noise", 0.05);
    }
}

class LaserPointerBlastProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, hits_left) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 32;

        this.sprite_colour1 = "#ff4488";
        this.sprite_colour2 = "#ff4488";

        this.sprite_colour = this.sprite_colour1;

        this.hit_particles_override = "explosion_small";
        this.hit_particles_override_sizemul = 0.25;

        this.hits_left = hits_left;
        this.hit_delay = 0.075;
        this.spawned_child = false;

        this.stop_at_border = true;

        this.initial_offsets = null;
        this.initial_radius = 0;
    }

    physics_step(time_delta) {
        this.sprite_colour = this.hits_left > 0 && !this.spawned_child ? this.sprite_colour1 : this.sprite_colour2;

        if (this.hits_left > 0) {
            this.hit_delay -= time_delta;
            if (this.hit_delay <= 0) {
                this.spawned_child = true;
                this.hit_delay = Number.POSITIVE_INFINITY;

                let offsets = this.initial_offsets;
                let spos = offsets[offsets.length-1].add(this.position);

                let newvec = this.target_position.sub(this.position);
                
                // Reverse the position closer to the bounds
                let x_bound_dist = Math.min(spos.x, this.board.size.x - spos.x);
                let y_bound_dist = Math.min(spos.y, this.board.size.y - spos.y);

                if (x_bound_dist <= y_bound_dist) {
                    newvec.x *= -1;
                } else {
                    newvec.y *= -1;
                }

                let tpos = spos.add(newvec.mul(2));
                this.board.spawn_projectile(new LaserPointerBlastProjectile(
                    this.board, this.source, 1, spos,
                    this.source.blast_damage, tpos, this.hits_left - 1
                ), spos);
                play_audio("explosion_1", 0.075);
            }
        }

        super.physics_step(time_delta);

        if (!this.initial_offsets && this.get_hitboxes_offsets().length > 0) {
            this.initial_offsets = this.get_hitboxes_offsets();
            this.initial_radius = this.hitboxes[0].radius;
        }
    }
}

let campaign_low_tier_selectable_balls = [
    ShivBall, BallBall, CutlassBall, LaserPointerBall
]