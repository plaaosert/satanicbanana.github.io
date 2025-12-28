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
        
        this.tier = TIERS.S;

        this.radius = this.radius * Math.pow(0.75, this.splitcnt);
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


let additional_selectable_balls = [
    ThirteenLongswordsBall, AStickBall, ThirteenSticksBall, GreatsordBall,
    ExtralongswordBall, SuperDummyBall, SuperNeedleBall
]