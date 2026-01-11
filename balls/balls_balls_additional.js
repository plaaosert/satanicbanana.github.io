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
        this.quote = "You need to think a bit more outside the box to win.";

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
                let new_ball = new this.constructor(
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
        this.description_brief = "@plaaoballsit's passive the lower it gets the more strength and speed it gets // It's ability to down slam create a shockwave in a big radius stunning the opponent for 2 seconds only against the wall or whatever wall to freeze the enemy btw. // The downside it's bigger and easier to hit // Cd 5 sec ig // Base hp 115?";
        this.quote = "Thanks @jaydeniskandar9185.";

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
        ];

        this.weapon_data = [

        ];

        this.damage = 1;

        this.speed_cur = 100;

        this.down_slam_cooldown_max = 5;
        this.down_slam_cooldown = this.down_slam_cooldown_max;

        this.slamming = false;

        this.max_hp = 115;
        this.hp = this.max_hp;

        this.set_radius(this.radius * 1.25);
    }

    weapon_step(board, time_delta) {
        this.rotate_weapon(0, this.speed_cur * time_delta);

        this.down_slam_cooldown -= time_delta;
        if (this.down_slam_cooldown <= 0) {
            this.down_slam_cooldown = this.down_slam_cooldown_max;

            console.log("slam time");
            this.slamming = true;

            let particle = new Particle(this.position, Math.PI * 0.5, 1.5 * 1.25, entity_sprites.get("hand_punch_particles"), 16, 0.4, false);
            this.board.spawn_particle(particle, this.position);
        }

        if (this.slamming) {
            this.set_velocity(new Vector2(0, 17500));
        }
    }

    collide_wall() {
        if (this.slamming) {
            this.slamming = false;

            let proj = new BerserkerShockwaveProjectile(
                this.board, this, 0, this.position, 0, 5
            );

            this.board.spawn_projectile(proj, this.position);

            play_audio("wallhit");

            this.apply_hitstop(0.6);
            this.set_velocity(this.velocity.rotate(random_float(-Math.PI*0.5, Math.PI*0.5, this.board.random)));
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Down slam cooldown: ${this.down_slam_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.down_slam_cooldown / this.down_slam_cooldown_max) * 12)).padEnd(12)}]`
        )
    }
}


class BigBall extends WeaponBall {
    static ball_name = "Big";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Big";
        this.description_brief = "Add Big Ball. It's Big Ball. Big Ball.";
        this.quote = "Thanks reft.";

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.SILLY;
        this.tags = [
        ];

        this.weapon_data = [

        ];

        this.damage = 1;

        this.speed_cur = 100;

        this.max_hp = 2;
        this.hp = this.max_hp;

        this.set_radius(this.radius * 2);
    }

    weapon_step(board, time_delta) {
        this.rotate_weapon(0, this.speed_cur * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Big`
        )
    }
}


class ShieldBall extends WeaponBall {
    static ball_name = "Sheld";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Sheld";
        this.description_brief = "1.sheld ball! reflects all atacks AND have 10% chance to grow";
        this.quote = "Thanks @sPAIN_foru.";

        this.tier = TIERS.B;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.DEFENSIVE,
        ];

        this.weapon_data = [
            new BallWeapon(1, "shield", [
                {pos: new Vector2(16, 64-16), radius: 16},

                {pos: new Vector2(16, 64), radius: 16},

                {pos: new Vector2(16, 64+16), radius: 16},
            ])
        ];

        this.damage = 2;

        this.speed_cur = 80;
    }

    weapon_step(board, time_delta) {
        this.rotate_weapon(0, this.speed_cur * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    grow_chance() {
        if (this.board.random() < 0.1) {
            this.weapon_data[0].size_multiplier *= 1.1;
            this.cache_hitboxes_offsets();
            this.cache_weapon_offsets();
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);

        this.grow_chance();
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);

        // steal it!
        if (!(projectile instanceof ChakramProjectile)) {
            projectile.active = true;
            projectile.source = this;

            if (projectile instanceof StraightLineProjectile) {
                projectile.set_dir(projectile.direction.mul(-1));
            }

            if (projectile instanceof MagnumCoinProjectile) {
                projectile.proj_velocity.y *= -1;
            }
        }

        this.grow_chance();
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage.toFixed(1)}`
        )

        this.write_desc_line(
            `Rotation speed: ${this.speed_cur.toFixed(0)} deg/s`
        )

        this.write_desc_line(
            `Size: ${(this.weapon_data[0].size_multiplier / WEAPON_SIZE_MULTIPLIER).toFixed(1)}x`
        )
    }
}


class GamblerBall extends WeaponBall {
    static ball_name = "Gambler";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Gambler";
        this.description_brief = "gambler with gun (-1-101 damage,70-130hp,weaknes if miss 3 times,basicly chance from forsaken[T.L. i don't know what this is] but B A L L)";
        this.quote = "Thanks @sPAIN_foru.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.HITSCAN,
        ];

        this.entry_animation = "snipe";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(156, -16),
        ]

        this.proj_damage_base = [-1, 101];
        this.speed_base = 90;

        this.shot_cooldown_max = 0.5;
        this.shot_cooldown = this.shot_cooldown_max;

        this.weakness = false;
        this.dmg_mult = 1;
        this.weakness_cnt = 3;
        this.weakness_cnt_max = 3;
        this.weakness_dur_max = 5;
        this.weakness_dur = 0;

        this.max_hp = random_float(70, 130, this.board.random);
        this.hp = this.max_hp;
    }

    weapon_step(board, time_delta) {
        if (this.weakness) {
            this.weakness_dur -= time_delta;
            if (this.weakness_dur <= 0) {
                this.weakness = false;
                this.dmg_mult = !this.weakness ? 1 : 0.5;
                this.weakness_cnt = this.weakness_cnt_max;
            }
        }

        if (!this.weakness && this.weakness_cnt <= 0) {
            this.weakness = true;
            this.weakness_dur = this.weakness_dur_max;
            this.dmg_mult = !this.weakness ? 1 : 0.5;
        }

        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
    
        this.shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            board.spawn_projectile(
                new GamblerProjectile(
                    this.board,
                    this, 0, fire_pos, this.dmg_mult * random_float(...this.proj_damage_base, this.board.random),
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos), 0
                ), fire_pos
            )

            this.weakness_cnt--;

            // its too loud man
            // play_audio("gun1");
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (!this.weakness) {
            this.weakness_cnt = this.weakness_cnt_max;
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base[0].toFixed(0)} - ${this.proj_damage_base[1].toFixed(0)}`
        )

        if (this.weakness) {
            this.write_desc_line(
                `Weakness: YES (${this.dmg_mult.toFixed(1)}x damage dealt)`
            )
            this.write_desc_line(
                `[${"<".repeat(Math.ceil(32 * this.weakness_dur / this.weakness_dur_max))}`
            )
        } else {
            this.write_desc_line(
                `Weakness: ${this.weakness_cnt.toFixed(0)} ${this.weakness_cnt == 1 ? "miss" : "misses"} remaining`
            )
        }
    }
}


class NotSoSuperDaggerBall extends WeaponBall {
    static ball_name = "not so super dagger";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "not so super dagger";
        this.description_brief = "Same as dagger but with 5 daggers that all function independently.";
        this.level_description = "Same as dagger.";
        this.max_level_description = "Same as dagger... shudders";
        this.quote = "Yup man just do whatever";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            ...new Array(5).fill(0).map(_ => {return new BallWeapon(1, "dagger", [
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
            ...new Array(5).fill(0).map(
                _ => this.damage_base
            )
        ]

        this.speed_range = [240, 480];
        this.speeds_base = [
            ...new Array(5).fill(0).map(
                _ => random_float(...this.speed_range, this.board.random)
            )
        ];

        this.speeds = [
            ...this.speeds_base.map(s => s)
        ];

        this.hit_decays = [
            ...new Array(5).fill(0)
        ];

        this.projectiles_cooldowns = [
            ...new Array(5).fill(0)
        ];
        
        this.projectiles_cooldowns_max = [
            ...new Array(5).fill(0.2)
        ];

        this.proj_damage_base = 1;
        this.proj_speeds = [
            ...new Array(5).fill(0)
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


class RailgunIfItLockedIn extends RailgunBall {
    static ball_name = "Railgun but good"

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);

        this.name = "Railgun but good"
        this.description_brief = "Same as Railgun but actually good";
        this.level_description = "Same as Railgun.";
        this.max_level_description = "Same as Railgun.";
        this.quote = "Ez";


        this.speed_base *= 5;

        this.shot_cooldown_max_base /= 25;
        this.shot_cooldown_max = this.shot_cooldown_max_base;
        this.shot_cooldown_rapidfire /= 25;
        this.shot_cooldown = this.shot_cooldown_max;
    }
}


class SwordAndShieldBall extends WeaponBall {
    static ball_name = "Sord and Sheld";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Sord and Sheld";
        this.description_brief = "Maybe if the sword[sic] was just a little bigger it could defeat the 13 sticks? Perhaps a shield[sic] would help";
        this.quote = "Thanks @_Olar_ and @sPAIN_foru.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.DEFENSIVE,
        ];

        this.weapon_data = [
            new BallWeapon(1, "shield", [
                {pos: new Vector2(16, 64-16), radius: 16},

                {pos: new Vector2(16, 64), radius: 16},

                {pos: new Vector2(16, 64+16), radius: 16},
            ]),

            new BallWeapon(4, "LONGSORD", [
                {pos: new Vector2(116, 72), radius: 8},
                {pos: new Vector2(100, 72), radius: 8},
                {pos: new Vector2(80, 74), radius: 8},
                {pos: new Vector2(64, 74), radius: 8},
                {pos: new Vector2(48, 74), radius: 8},
                {pos: new Vector2(32, 72), radius: 8},
                {pos: new Vector2(16, 68), radius: 8},
            ])
        ];

        this.damage = 2;
        this.damage2 = 10;

        this.speed_cur = 80;
    
        this.explosions_num = 12;
        this.explosions_range_per_sord = [0,4];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
    }

    weapon_step(board, time_delta) {
        this.rotate_weapon(0, this.speed_cur * time_delta);
        this.rotate_weapon(1, this.speed_cur * 2 * time_delta);

        this.explosions_delay -= time_delta;
        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                let wp = 1;
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

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, with_weapon_index == 0 ? this.damage : this.damage2);

        return result;
    }

    grow_chance() {
        if (this.board.random() < 0.1) {
            this.weapon_data[0].size_multiplier *= 1.1;
            this.cache_hitboxes_offsets();
            this.cache_weapon_offsets();
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);

        this.grow_chance();
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);

        // only sheld
        if (with_weapon_index != 0)
            return

        // steal it!
        if (!(projectile instanceof ChakramProjectile)) {
            projectile.active = true;
            projectile.source = this;

            if (projectile instanceof StraightLineProjectile) {
                projectile.set_dir(projectile.direction.mul(-1));
            }

            if (projectile instanceof MagnumCoinProjectile) {
                projectile.proj_velocity.y *= -1;
            }
        }

        this.grow_chance();
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage.toFixed(1)}`
        )

        this.write_desc_line(
            `Rotation speed: ${this.speed_cur.toFixed(0)} deg/s`
        )

        this.write_desc_line(
            `Longswords: 1 (Long)`
        )

        this.write_desc_line(
            `Sheld size: ${(this.weapon_data[0].size_multiplier / WEAPON_SIZE_MULTIPLIER).toFixed(1)}x`
        )
    }
}


class HornetBall extends SuperNeedleBall {
    static ball_name = "Hornet Needle";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true, splitcnt=0) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone);

        this.name = "Hornet Needle";
        this.description_brief = "Same as Super Needle in every way, but also periodically releases Hornet's Thread Storm ability.";
        this.quote = "Shaaw!";
    
        this.splitcnt = splitcnt;
        
        this.category = CATEGORIES.SILLY;
        this.tier = TIERS.S;

        this.set_radius(this.radius * Math.pow(0.75, this.splitcnt));
        this.weapon_data.forEach(w => w.size_multiplier *= Math.pow(0.6, this.splitcnt));

        this.threadstorm_cooldown_max = 1.5;
        this.threadstorm_cooldown = this.threadstorm_cooldown_max;
    }

    weapon_step(board, time_delta) {
        super.weapon_step(board, time_delta);

        this.threadstorm_cooldown -= time_delta;
        if (this.threadstorm_cooldown <= 0) {
            this.threadstorm_cooldown += this.threadstorm_cooldown_max;

            let pos = this.position.add(new Vector2(8, 8).mul(2 * PROJ_SIZE_MULTIPLIER));
            let proj = new HornetThreadstormProjectile(
                this.board, this, 0, pos, 4, 2
            )

            this.board.spawn_projectile(proj, pos);

            this.apply_hitstop(0.75);
            this.apply_invuln(0.1);
            this.last_hit = 0;

            let snd = seeded_random_from_array(["gitgud", "edino", "shaw"], this.board.random);
            play_audio(`hornet_${snd}`, 0.3 * Math.pow(0.75, this.splitcnt))
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        super.render_stats(canvas, ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Thread storm cooldown: ${this.threadstorm_cooldown.toFixed(1)}s [${"<".repeat(Math.ceil(8 * this.threadstorm_cooldown / this.threadstorm_cooldown_max))}`
        )
    }
}


class HyperParrierBall extends WeaponBall {
    static ball_name = "Hyper Parrier";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hyper Parrier";
        this.description_brief = "Make a ball that flashes yellow every 3 seconds for .25 second and if something hits it in that time frame, do a cool animation or smth with more peak sound effects :D";
        this.quote = "Thanks @MyronKost2.";

        this.tier = TIERS.B;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
            TAGS.DEFENSIVE,
        ];

        this.weapon_data = [];

        this.hyper_parry_cooldown_max = 3;
        this.hyper_parry_cooldown = this.hyper_parry_cooldown_max;
        this.hyper_parry_duration = 0;

        this.custom_parry_particle = null;
        this.custom_parry_sound = null;

        this.original_colour = this.colour;
    }

    weapon_step(board, time_delta) {
        if (this.hyper_parry_duration > 0) {
            this.hyper_parry_duration -= time_delta;
            if (this.hyper_parry_duration <= 0) {
                this.set_colour(this.original_colour);
                
                this.custom_parry_particle = null;
                this.custom_parry_sound = null;

                this.weapon_data = [];
                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();
            }
        } else {
            this.hyper_parry_cooldown -= time_delta;
            if (this.hyper_parry_cooldown <= 0) {
                this.hyper_parry_cooldown += this.hyper_parry_cooldown_max;
                this.hyper_parry_duration = 0.25;
                this.set_colour(this.original_colour.lerp(Colour.yellow, 0.75));

                this.custom_parry_particle = "yomi_parry";
                this.custom_parry_sound = "sword_schwing";

                this.weapon_data = [
                    new BallWeapon(1, "", [
                        {pos: new Vector2(64, 64), radius: 34},
                    ])
                ];
                
                this.weapon_data[0].offset = new Vector2(-80, 0);

                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();
            }
        }
    }

    parry_effect(ball) {
        this.board.balls.forEach(b => b.apply_hitstop(0.25));

        play_audio("sword_schwing");

        this.board.set_timer(new Timer(() => {
            play_audio("wall_smash");

            let expl_position = ball.position.add(new Vector2(10, -13).mul(2 * PROJ_SIZE_MULTIPLIER));
            let proj = new GrenadeExplosionProjectile(
                this.board, this, 0, expl_position, 25, 2
            )

            proj.can_hit_allied = false;
            proj.can_hit_source = false;

            this.board.spawn_projectile(proj, expl_position);
        }, 0.15));
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        
        if (this.hyper_parry_duration > 0) {
            this.parry_effect(other_ball);
        }
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        
        if (this.hyper_parry_duration > 0) {
            this.parry_effect(projectile.source);
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        if (this.hyper_parry_duration > 0) {
            this.write_desc_line(
                `PARRYING  |${"<".repeat(Math.ceil(24 * this.hyper_parry_duration / 0.25))}`
            )
        } else {
            this.write_desc_line(
                `preparing |${"<".repeat(Math.ceil(24 * this.hyper_parry_cooldown / this.hyper_parry_cooldown_max))}`
            )
        }
    }
}


class ThwompBall extends WeaponBall {
    static ball_name = "Thwomp";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Thwomp";
        this.description_brief = "Periodically grows spikes and slams down, dealing 50 damage to any balls in the way. Spikes deal 5 damage while not slamming and retract shortly after the slam completes.";
        this.quote = "Thanks @CasualBinaryMan.";

        this.tier = TIERS.A;
        this.category = CATEGORIES.SILLY;
        this.tags = [
            TAGS.MELEE,
        ];

        this.weapon_data = [

        ];

        this.damage = 1;

        this.speed_cur = 100;

        this.down_slam_cooldown_max = 5;
        this.down_slam_cooldown = this.down_slam_cooldown_max;

        this.slamming = false;

        this.spike_motion = 0;  // 1 - extend, 2 - retract
        this.spike_motion_amt = 0;
        this.spike_motion_per_second = 10;
    }

    weapon_step(board, time_delta) {
        this.down_slam_cooldown -= time_delta;
        if (this.down_slam_cooldown <= 0) {
            this.spike_motion = 1;

            this.down_slam_cooldown += this.down_slam_cooldown_max;
            this.slamming = true;

            let particle = new Particle(this.position, Math.PI * 0.5, 1.5 * 1.25, entity_sprites.get("hand_punch_particles"), 16, 0.4, false);
            this.board.spawn_particle(particle, this.position);
        }

        if (this.spike_motion != 0) {
            this.spike_motion_amt -= time_delta * this.spike_motion_per_second * Math.sign(this.spike_motion - 1.5);
            this.spike_motion_amt = Math.max(0, Math.min(1, this.spike_motion_amt))

            if (this.weapon_data.length == 0 && this.spike_motion_amt > 0) {
                this.weapon_data = new Array(12).fill(0).map(() => new BallWeapon(
                    0, "spike", [{pos: new Vector2(28, 56), radius: 6}]
                ));

                this.weapon_data.forEach((w, i) => {
                    w.angle = deg2rad(360 * i / this.weapon_data.length)
                })
            }

            this.weapon_data.forEach((w, i) => {
                w.size_multiplier = (1 * WEAPON_SIZE_MULTIPLIER) * this.spike_motion_amt;
            })

            if (this.weapon_data.length != 0 && this.spike_motion_amt <= 0) {
                this.weapon_data = [];
            }

            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();
        }

        if (this.slamming) {
            this.set_velocity(new Vector2(0, 25000));
        }
    }

    collide_wall() {
        if (this.slamming) {
            this.slamming = false;

            play_audio("wallhit");

            let pos = this.position.sub(new Vector2(0, 64).mul(PARTICLE_SIZE_MULTIPLIER));
            let part = new Particle(
                pos, 0,
                2, entity_sprites.get("explosion3"), 12, 
                999
            );

            this.board.spawn_particle(part, pos);

            this.apply_hitstop(2);
            this.set_velocity(this.velocity.rotate(random_float(-Math.PI*0.5, Math.PI*0.5, this.board.random)));

            this.spike_motion = 2;
            this.spike_motion_amt = 1;
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.slamming ? 50 : 5);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Down slam cooldown: ${this.down_slam_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.down_slam_cooldown / this.down_slam_cooldown_max) * 12)).padEnd(12)}]`
        )
    }
}


class MachineGunBall extends WeaponBall {
    static ball_name = "Meachin gun";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Meachin gun";
        this.description_brief = "Meachin gun was grand lancher";
        this.quote = "Thanks @אריאליותם."

        this.tier = TIERS.S;
        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(128, -16),
        ]

        this.proj_damage_base = 6;
        this.speed_base = 80;

        this.bullet_speed = 30000;

        this.shot_cooldown_max = 1;
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishots = 10000;
        this.multishots_max = 10000;
        
        this.multishot_cooldown = 0;
        this.multishot_cooldown_max = 0.02;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;
        this.multishot_cooldown -= time_delta;
        let shooting = false;
        if (this.multishots > 0 && this.multishot_cooldown < 0) {
            this.multishots--;
            this.multishot_cooldown = this.multishot_cooldown_max;
            shooting = true;
        } else if (this.shot_cooldown < 0) {
            this.multishots = this.multishots_max;
            this.shot_cooldown = this.shot_cooldown_max;
        }

        if (shooting) {
            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let times = 2;

            for (let i=0; i<times; i++) {
                board.spawn_projectile(
                    new BulletProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10, this.board.random) * (Math.PI / 180))),
                        this.bullet_speed * random_float(0.85, 1.15, this.board.random), this.velocity.mul(0)
                    ), fire_pos
                )
            }

            play_audio("thud");
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(0)}`
        )
    }
}


class ThiccNeedleBall extends NeedleBall {
    static ball_name = "THICCNEEDLE";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone);
    
        this.name = "THICCNEEDLE";
        this.description_brief = "A THICCNEEDLE - A needle with 1000 hp (at level 100) which spawns normal needle balls whenever it is damaged. Also to mention it is THICKER";
        this.max_level_description = "Has 1000 hp (at level 100)... and needle's other awakening bonuses";
        this.quote = "Thanks @_Olar_.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.SILLY;

        if (this.level >= AWAKEN_LEVEL) {
            this.hp = 1000;
            this.max_hp = 1000;
        }

        this.set_radius(this.radius * 1.5);
    }

    clone_chance() {
        let c = this.board.random();
        if (this.can_clone && c < this.split_chance) {
            let hp_proportion = Math.floor(this.hp * this.split_ratio);

            if (hp_proportion > 0) {
                let new_ball = new NeedleBall(
                    this.board,
                    this.mass, this.radius, this.colour, this.bounce_factor,
                    this.friction_factor, this.player, this.level, this.reversed,
                    true
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.max_hp = new_ball.hp;
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        super.render_stats(canvas, ctx, x_anchor, y_anchor);

        this.write_desc_line("Children are normal Needle balls.");
    }
}


class NormalerBall extends WeaponBall {
    
}


class BerserkerShockwaveProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, damage, size) {
        super(board, source, source_weapon_index, position, damage, size, 1, "berserker_shockwave");

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(0, 0), radius: 16}],
            [{pos: new Vector2(0, 0), radius: 24}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        ball.apply_hitstop(2);
    }
}


class GamblerProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 12;
        this.sprite_colour = Colour.yellow.lerp(default_cols[8], Math.max(this.damage / 101, 0)).css();
    }
}


class HornetThreadstormProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, damage, size) {
        super(board, source, source_weapon_index, position, damage, size, 0.75, "skong_thread_storm");

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [{pos: new Vector2(-8, -8), radius: 56}],
            [],
            []
        ]

        this.alternative_layer = "fg1";
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        this.ignore_balls.clear();[]
    }
}


class BulletProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "bullet";
        this.set_hitboxes([
            {pos: new Vector2(-4, 0), radius: 4},
            {pos: new Vector2(0, 0), radius: 4},
            {pos: new Vector2(4, 0), radius: 4},
        ]);
    }
}


let additional_selectable_balls = [
    ThirteenLongswordsBall, AStickBall, ThirteenSticksBall, GreatsordBall,
    ExtralongswordBall, SuperDummyBall, SuperNeedleBall, SuperDaggerBall,
    BerserkerBall, BigBall, ShieldBall, GamblerBall, NotSoSuperDaggerBall,
    RailgunIfItLockedIn, SwordAndShieldBall, HornetBall, HyperParrierBall,
    ThwompBall, MachineGunBall, ThiccNeedleBall
]