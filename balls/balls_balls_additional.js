class ThirteenLongswordsBall extends WeaponBall {
    static ball_name = "13 Longswords";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "13 Longswords";
        this.description_brief = "Has 13 longswords that each do 2 damage and are also on fire.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Thanks to @XxRodxXr for the deranged idea.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.DEFENSIVE
        ];

        this.weapon_data = new Array(13).fill("").map(_ => new BallWeapon(1, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ]))

        this.damage_base = 2;
        this.speeds_range = [80, 240];

        this.speeds = new Array(this.weapon_data.length).fill(0).map(_ => random_float(...this.speeds_range, this.board.random));
        
        for (let i=0; i<this.weapon_data.length; i++) {
            if (i % 2 == 1) {
                this.reverse_weapon(i);
            }
        }

        this.explosions_num = 4;
        this.explosions_range_per_sord = [0,4];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.speeds[i] * time_delta);
        }

        this.explosions_delay -= time_delta;
        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                for (let wp=0; wp<this.weapon_data.length; wp++) {
                    let wp_offset = this.get_weapon_offset(wp);
                    let hitboxes = this.get_hitboxes_offsets(wp);

                    let times = random_int(...this.explosions_range_per_sord, this.board.random);
                    for (let n=0; n<times; n++) {
                        let hitbox_index = random_int(0, hitboxes.length, this.board.random);

                        let pos = this.position.add(wp_offset.add(hitboxes[hitbox_index]));
                        this.board.spawn_particle(new Particle(
                            pos, random_float(0, Math.PI * 2, this.board.random), 0.1, entity_sprites.get("explosion"), 24, 3, false, 0, true
                        ), pos);
                    }
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Longswords: 13`
        )
        this.write_desc_line(
            `Longswords: lit up on fire`
        )
    }
}

class AStickBall extends WeaponBall {
    static ball_name = "A Stick";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "A Stick";
        this.description_brief = "Has a stick that does 75 damage.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Thanks to @XxRodxXr for the deranged idea.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE
        ];

        this.weapon_data = [
            new BallWeapon(1, "stick", [
                {pos: new Vector2(88, 66), radius: 10},
                {pos: new Vector2(68, 74), radius: 10},
                {pos: new Vector2(48, 74), radius: 10},
                {pos: new Vector2(32, 72), radius: 10},
                {pos: new Vector2(16, 68), radius: 10},
            ])
        ];

        this.damage_base = 75
        this.speed = 160;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "strongpunch";

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Stick: That's what it is`
        )
    }
}


class ThirteenSticksBall extends WeaponBall {
    static ball_name = "13 Sticks";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "13 Sticks";
        this.description_brief = "Has 13 sticks that do 75 damage.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "I think we're going too far.";

        this.tier = TIERS.ULTRA;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
        ];

        this.weapon_data = new Array(13).fill("").map(_ => new BallWeapon(1, "stick", [
            {pos: new Vector2(88, 66), radius: 10},
            {pos: new Vector2(68, 74), radius: 10},
            {pos: new Vector2(48, 74), radius: 10},
            {pos: new Vector2(32, 72), radius: 10},
            {pos: new Vector2(16, 68), radius: 10},
        ]))

        this.speeds_range = [60, 160]

        this.speeds = new Array(this.weapon_data.length).fill(0).map(_ => random_float(...this.speeds_range, this.board.random));
        
        for (let i=0; i<this.weapon_data.length; i++) {
            if (i % 2 == 1) {
                this.reverse_weapon(i);
            }
        }

        this.damage_base = 75;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.speeds[i] * time_delta);
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "strongpunch";

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Sticks: Lots (${this.weapon_data.length} to be exact)`
        )
    }
}


class GreatsordBall extends WeaponBall {
    static ball_name = "GREATSORD";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "GREATSORD";
        this.description_brief = "Has a GREATSORD that does 50 damage.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Requested by @TheGlimGuy.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE
        ];

        this.weapon_data = [
            new BallWeapon(2, "SORD_berserk", [
                {pos: new Vector2(100, 58), radius: 12},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 50;
        this.speed = 20;
        
        this.custom_parry_sound = "CLANG";
        this.custom_projectile_parry_sound = "CLANG";
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "CLANG";

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `SORD: Great`
        )
    }
}


class ExtralongswordBall extends WeaponBall {
    static ball_name = "Extralongsword";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Extralongsword";
        this.description_brief = "Has an extralongsword that does 10 damage and is also on fire.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Suggested by @_Olar_.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED
        ];

        this.weapon_data = new Array(1).fill("").map(_ => new BallWeapon(3, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ]))

        this.damage_base = 10
        this.speeds_range = [160, 160];

        this.speeds = new Array(this.weapon_data.length).fill(0).map(_ => random_float(...this.speeds_range, this.board.random));
        
        for (let i=0; i<this.weapon_data.length; i++) {
            if (i % 2 == 1) {
                this.reverse_weapon(i);
            }
        }

        this.explosions_num = 12;
        this.explosions_range_per_sord = [0,4];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.speeds[i] * time_delta);
        }

        this.explosions_delay -= time_delta;
        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                for (let wp=0; wp<this.weapon_data.length; wp++) {
                    let wp_offset = this.get_weapon_offset(wp);
                    let hitboxes = this.get_hitboxes_offsets(wp);

                    let times = random_int(...this.explosions_range_per_sord, this.board.random);
                    for (let n=0; n<times; n++) {
                        let hitbox_index = random_int(0, hitboxes.length, this.board.random);

                        let maxn = this.weapon_data[wp].hitboxes[hitbox_index].radius * this.weapon_data[wp].size_multiplier;
                        let variance = random_on_circle(random_float(0, maxn, this.board.random), this.board.random);

                        let pos = this.position.add(wp_offset.add(hitboxes[hitbox_index])).add(variance);
                        this.board.spawn_particle(new Particle(
                            pos, random_float(0, Math.PI * 2, this.board.random), 0.1 * (this.weapon_data[wp].size_multiplier / WEAPON_SIZE_MULTIPLIER), entity_sprites.get("explosion"), 24, 3, false, 0, true
                        ), pos);
                    }
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Longswords: 1`
        )
        this.write_desc_line(
            `But also very long`
        )
    }
}


class SuperDummyBall extends WeaponBall {
    // transforms into unarmedball when it takes a hit
    static ball_name = "Super Dummy";
    
    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
        
        this.name = "Super Dummy";
        this.description_brief = "Has no weapons. Starts on 25 HP, gains more max HP per level (+25 per level).";
        this.level_description = "Gains more max HP per level (+25 per level).";
        this.max_level_description = "Constantly heals based on missing HP (max 50%/s)";

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.SILLY;
        this.tags = [

        ];

        this.entry_animation = "load";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;
    
        this.max_hp = 25 + (this.level * 25);
        this.hp = this.max_hp;

        this.heal_speed = 0;
        if (this.level >= AWAKEN_LEVEL) {
            this.heal_speed = 0.5;
        }
    }

    weapon_step(board, time_delta) {
        let heal_speed = this.max_hp * (this.heal_speed * (1 - (this.hp / this.max_hp)));

        this.hp = Math.min(this.max_hp, this.hp + (heal_speed * time_delta));
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Max HP: ${this.max_hp}`
        )
    }
}


class SuperNeedleBall extends NeedleBall {
    static ball_name = "Super Needle";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true, splitcnt=0) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone);

        this.name = "Super Needle";
        this.description_brief = "Same as Needle in every way, but children can copy too.";
        this.level_description = "Increases split chance and reduces HP lost from splitting.";
        this.max_level_description = "Applies poison instead for 1s each. Poison deals the full DOT for its duration and refreshes when stacked.";
        this.quote = "Many thanks for your kind donation! It's always hard getting food\non the table as a mother of six trillion.";
    
        this.splitcnt = splitcnt;
        
        this.category = CATEGORIES.SILLY;
        this.tier = TIERS.S;

        this.set_radius(this.radius * Math.pow(0.75, this.splitcnt));
        this.weapon_data.forEach(w => w.size_multiplier *= Math.pow(0.6, this.splitcnt));
    }

    clone_chance() {
        let c = this.board.random();
        if (this.can_clone && c < this.split_chance) {
            let hp_proportion = Math.floor(this.hp * this.split_ratio);

            if (hp_proportion > 0) {
                let new_ball = new SuperNeedleBall(
                    this.board,
                    this.mass, this.radius, this.colour, this.bounce_factor,
                    this.friction_factor, this.player, this.level, this.reversed,
                    true, this.splitcnt + 1
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.apply_invuln(BALL_INVULN_DURATION);

                if (christmas) {
                    let hat_particle = new Particle(new_ball.position, 0, new_ball.radius / this.radius, entity_sprites.get("festive red hat"), 0, 99999, false);
                    board.spawn_particle(hat_particle, new_ball.position);

                    new_ball.linked_hat_particle = hat_particle;
                }

                if (true) {
                    let hp_lost = hp_proportion - (hp_proportion * this.split_hp_save);

                    this.lose_hp(hp_lost, this);
                }

                new_ball.show_stats = false;

                this.board?.spawn_ball(new_ball, this.position);

                new_ball.add_impulse(random_on_circle(random_float(6000, 10000, this.board.random), this.board.random));

                this.children.push(new_ball);
                new_ball.parent = this;
            }
        }
    }
}


class SuperDaggerBall extends WeaponBall {
    static ball_name = "super dagger";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "super dagger";
        this.description_brief = "Same as dagger but with... 67... daggers that all function independently.";
        this.level_description = "Same as dagger.";
        this.max_level_description = "Same as dagger... shudders";
        this.quote = "help.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            ...new Array(67).fill(0).map(_ => {return new BallWeapon(1, "dagger", [
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 68), radius: 12},
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(16, 56), radius: 12},
                {pos: new Vector2(0, 48), radius: 12},
            ])})
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.damage_base = 1;
        this.damages = [
            ...new Array(67).fill(0).map(
                _ => this.damage_base
            )
        ]

        this.speed_range = [240, 480];
        this.speeds_base = [
            ...new Array(67).fill(0).map(
                _ => random_float(...this.speed_range, this.board.random)
            )
        ];

        this.speeds = [
            ...this.speeds_base.map(s => s)
        ];

        this.hit_decays = [
            ...new Array(67).fill(0)
        ];

        this.projectiles_cooldowns = [
            ...new Array(67).fill(0)
        ];
        
        this.projectiles_cooldowns_max = [
            ...new Array(67).fill(0.2)
        ];

        this.proj_damage_base = 1;
        this.proj_speeds = [
            ...new Array(67).fill(0)
        ];

        this.hit_decay_max = 1.5 + (0.025 * this.level);
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.speeds[i] * time_delta);

            this.hit_decays[i] -= time_delta;
            if (this.hit_decays[i] < 0) {
                this.speeds[i] = lerp(this.speeds[i], this.speeds_base[i], 1 - compat_pow(0.25, time_delta));
                this.damages[i] = lerp(this.damages[i], 1, 1 - compat_pow(0.25, time_delta));
            }

            if (this.level >= AWAKEN_LEVEL) {
                this.projectiles_cooldowns_max[i] = 0.5 / (this.speeds_base[i] / 500);
                this.proj_speeds[i] = 9000 + (100 / this.projectiles_cooldowns_max[i]);

                if (this.speeds_base[i] >= 1000) {
                    this.projectiles_cooldowns[i] -= time_delta;
                    if (this.projectiles_cooldowns[i] <= 0) {
                        this.projectiles_cooldowns[i] = this.projectiles_cooldowns_max[i];

                        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[i].size_multiplier).rotate(this.weapon_data[i].angle);
                        let fire_pos = this.position.add(firing_offset);

                        board.spawn_projectile(
                            new DaggerAwakenProjectile(
                                this.board,
                                this, 0, fire_pos, this.proj_damage_base, 1,
                                new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                                this.proj_speeds[i], this.velocity.mul(0)
                            ), fire_pos
                        )
                    }
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damages[with_weapon_index]);

        this.speeds[with_weapon_index] *= 2;
        this.damages[with_weapon_index] *= 1.5;

        this.hit_decays[with_weapon_index] = this.hit_decay_max

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        this.hitstop = 0;
        other.hitstop = 0;
        other.invuln_duration = 0;

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        parrier.invuln_duration = 0;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Don't say I never gave you anything.`
        )

        this.write_desc_line(
            `Fastest dagger: ${Math.max(...this.speeds).toFixed(0)}deg/s`
        )
    }
}

class BerserkerBall extends WeaponBall {
    static ball_name = "Berserker";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Berserker";
        this.description_brief = "@plaaoballsit's passive the lower it gets the more strength and speed it gets//It's ability to down slam create a shockwave in a big radius stunning the opponent for 2 seconds only against the wall or whatever wall to freeze the enemy btw.//The downside it's bigger and easier to hit//Cd 5 sec ig//Base hp 115?";
        this.level_description = "-";
        this.max_level_description = "-";
        this.quote = "Thanks @jaydeniskandar9185.";

        this.tier = TIERS.A;
        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [

        ];

        this.damage = 1;

        this.speed_cur = 100;

        this.down_slam_cooldown_max = 5;
        this.down_slam_cooldown = this.down_slam_cooldown_max;

        this.max_hp = 115;
        this.hp = this.max_hp;

        this.set_radius(this.radius * 2);
    }

    weapon_step(board, time_delta) {
        this.speed_cur = Math.max(this.speed_base, this.speed_cur - this.speed_friction * time_delta);

        this.rotate_weapon(0, this.speed_cur * time_delta);
        this.damage = this.damage_base + (this.damage_per_speed * this.speed_cur);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage.toFixed(1)}`
        )
    }
}


let additional_selectable_balls = [
    ThirteenLongswordsBall, AStickBall, ThirteenSticksBall, GreatsordBall,
    ExtralongswordBall, SuperDummyBall, SuperNeedleBall, SuperDaggerBall
]