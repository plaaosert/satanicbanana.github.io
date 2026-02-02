class SmartLongsword extends WeaponBall {
    static ball_name = "Smart Longsword";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Smart Longsword";
        this.description_brief = "Has a smart longsword that does 4 damage, always tries to point at the nearest enemy and is also on fire.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Taste true power.";

        this.tier = TIERS.X;
        this.category = CATEGORIES.POWERED;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
            TAGS.AUTOAIM,
            TAGS.SMART
        ];

        this.weapon_data = new Array(1).fill("").map(_ => new BallWeapon(1, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ]))

        this.damage_base = 10
        this.speeds_range = [72, 72];
        this.speed_max_bonus = 6;

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
            // find the angle of the closest enemy
            let closest_enemy = [...this.board.balls.filter(b => !b.allied_with(this)), ...this.board.projectiles.filter(p => p.can_hit_ball(this))].reduce((p, c) => {
                return !p || (p[1] > c.position.sqr_distance(this.position)) ? [c, c.position.sqr_distance(this.position)] : p
            }, null)

            if (closest_enemy) {
                let pointing_vector = closest_enemy[0].position.sub(this.position);
                let pointing_angle = positive_mod(pointing_vector.angle(), Math.PI * 2);

                // so now, we need to check our current angle and our target angle, and figure out if we're closer CW or CCW
                // remember that it can loop, so:
                /*
                    0 -- 180 -- 360
                                 X 330
                              320>
                     <20
                    X 10
                */
                // if target > current, our CW rotation (+) is unchanged
                //                      our CCW rotation (-) is +360 start
                // else other way round (but CW is -360)
                let cw_rot = 0;
                let ccw_rot = 0;
                let current = this.weapon_data[i].angle;
                if (pointing_angle > current) {
                    cw_rot = pointing_angle - current;
                    ccw_rot = (current+(Math.PI*2)) - pointing_angle;
                } else {
                    ccw_rot = current - pointing_angle;
                    cw_rot = pointing_angle - (current-(Math.PI*2));
                }

                // smaller one wins
                let sign = (cw_rot > ccw_rot ? -1 : 1) * (this.weapon_data[i].reversed ^ this.reversed ? -1 : 1);

                let speed_bonus = this.speed_max_bonus * (Math.min(cw_rot, ccw_rot) * Math.PI);

                this.rotate_weapon(i, this.speeds[i] * speed_bonus * sign * time_delta);
            }
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
            `But also very smart`
        )
    }
}

class SmartBowBall extends WeaponBall {
    static ball_name = "Smart Bow";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Smart Bow";
        this.description_brief = "Fires arrows. Locks onto the closest target and tries to predict its movement.";
        this.quote = "My creator did not endow me with a victory quote.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.POWERED;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.AUTOAIM,
            TAGS.SMART
        ];

        this.weapon_data = [
            new BallWeapon(1, "bow", [
                {pos: new Vector2(16, 72-16), radius: 12},
                {pos: new Vector2(16, 72), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.proj_damage_base = 8;
        this.speed_base = 720;

        this.arrow_size_mult = 1
        this.arrow_speed = 25000;
        this.sqr_arrow_speed = Math.pow(this.arrow_speed, 2);

        this.shot_cooldown_max = 0.8;
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishots = 0;
        this.multishots_max = 1;
        
        this.multishot_cooldown = 0;
        // 1/2th of the cooldown or 0.05, whichever is lower
        this.multishot_cooldown_max = Math.min(0.001, (this.shot_cooldown_max / 20) / this.multishots_max);

        this.bow_sound_random = get_seeded_randomiser(this.board.random_seed);
    
        this.arrow_proto = ArrowProjectile;

        this.speed_spread = 0;
        this.deg_spread = 2;
    }

    weapon_step(board, time_delta) {
        layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

        // rotate the weapon
        let closest_enemy = [...this.board.balls.filter(b => !b.allied_with(this))].reduce((p, c) => {
            return !p || (p[1] > c.position.sqr_distance(this.position)) ? [c, c.position.sqr_distance(this.position)] : p
        }, null)

        let pointing_vector = null;
        if (closest_enemy) {
            // debug canvas code
            let screen_scaling_factor = canvas_width / board.size.x;
            let ctx = layers.debug_front.ctx;
            let w = 25 * screen_scaling_factor;

            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            // predict movement - get distance, divide by arrow speed, add that*velocity
            let t = (closest_enemy[0].position.distance(fire_pos)) / this.arrow_speed;

            // v = u+at
            let predicted_velocity_no_gravity = closest_enemy[0].velocity;

            // refine
            let cur_nt = t;
            let predicted_velocity = predicted_velocity_no_gravity;
            let times = 32;

            let predicted_movement = null;
            let predicted_position = null;
            for (let i=0; i<times; i++) {
                let new_cur_nt = (closest_enemy[0].position.add(predicted_velocity.mul(cur_nt)).distance(fire_pos)) / this.arrow_speed;

                cur_nt = new_cur_nt;

                let new_predicted_velocity = predicted_velocity_no_gravity.add(this.board.gravity.mul(cur_nt));
                predicted_velocity = new_predicted_velocity;

                predicted_movement = predicted_velocity.mul(cur_nt);
                predicted_position = closest_enemy[0].position.add(predicted_movement);
                draw_circle(
                    ctx, predicted_position.x * screen_scaling_factor, predicted_position.y * screen_scaling_factor,
                    closest_enemy[0].radius * screen_scaling_factor,
                    Colour.red.lerp(Colour.green, i / times).css()
                );
            }

            pointing_vector = predicted_position.sub(this.position);

            // draw_circle(ctx, predicted_position.x * screen_scaling_factor, predicted_position.y * screen_scaling_factor, closest_enemy[0].radius * screen_scaling_factor, "white");

            ctx.beginPath();

            ctx.moveTo(this.position.x * screen_scaling_factor, this.position.y * screen_scaling_factor);
            ctx.lineTo(predicted_position.x * screen_scaling_factor, predicted_position.y * screen_scaling_factor);

            ctx.strokeStyle = "yellow";
            ctx.stroke();

            ctx.closePath();

            let pointing_angle = positive_mod(pointing_vector.angle(), Math.PI * 2);

            let cw_rot = 0;
            let ccw_rot = 0;
            let current = this.weapon_data[0].angle;
            if (pointing_angle > current) {
                cw_rot = pointing_angle - current;
                ccw_rot = (current+(Math.PI*2)) - pointing_angle;
            } else {
                ccw_rot = current - pointing_angle;
                cw_rot = pointing_angle - (current-(Math.PI*2));
            }

            // smaller one wins
            let sign = (cw_rot > ccw_rot ? -1 : 1) * (this.weapon_data[0].reversed ^ this.reversed ? -1 : 1);

            this.rotate_weapon(0, this.speed_base * sign * time_delta);
        }

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

            let times = 1;
            if (this.level >= AWAKEN_LEVEL) {
                times += 1;
            }

            for (let i=0; i<times; i++) {
                board.spawn_projectile(
                    new (this.arrow_proto)(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1 * this.arrow_size_mult,
                        new Vector2(1, 0).rotate((pointing_vector ? pointing_vector.angle() : this.weapon_data[0].angle) + deg2rad(this.deg_spread * random_float(-1, 1, this.board.random))),
                        this.arrow_speed + (this.speed_spread > 0 ? (this.speed_spread * random_float(-1, 1, this.board.random)) : 0), this.velocity.mul(0)
                    ), fire_pos
                )
            }

            let snd_rand = this.bow_sound_random();
            if (snd_rand < 0.5) {
                play_audio("bow1");
            } else {
                play_audio("bow2");
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        // other.hitstop = 0;
        // this.hitstop = 0;
        // other.invuln_duration = 0;

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Arrow damage: ${this.proj_damage_base.toFixed(2)}`
        )
    }
}

class MissileLauncherBall extends WeaponBall {
    static ball_name = "Missile Launcher";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Missile Launcher";
        this.description_brief = "Fires an explosive homing missile.";
        this.quote = "My creator did not endow me with a victory quote.";

        this.tier = TIERS.S;
        this.category = CATEGORIES.POWERED;
        this.tags = [
            TAGS.RANGED,
            TAGS.PROJECTILES,
            TAGS.AOE,
            TAGS.HOMING,
        ];

        this.weapon_data = [
            new BallWeapon(1, "lansator_de_rachete", [
                {pos: new Vector2(16, 64), radius: 12},
                {pos: new Vector2(32, 64), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(128, 0)
        ]

        this.proj_damage_base = 12;
        this.speed_base = 150;

        this.arrow_size_mult = 1
        this.arrow_speed = 10000;

        this.shot_cooldown_max = 0.75
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishots = 0;
        this.multishots_max = 1;
        
        this.multishot_cooldown = 0;
        // 1/2th of the cooldown or 0.05, whichever is lower
        this.multishot_cooldown_max = Math.min(0.05, (this.shot_cooldown_max / 2) / this.multishots_max);

        this.bow_sound_random = get_seeded_randomiser(this.board.random_seed);
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

            let times = 1;
            if (this.level >= AWAKEN_LEVEL) {
                times += 1;
            }

            for (let i=0; i<times; i++) {
                board.spawn_projectile(
                    new MissileProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 0.7 * this.arrow_size_mult,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10, this.board.random) * (Math.PI / 180))),
                        this.arrow_speed * random_float(0.85, 1.15, this.board.random), this.velocity.mul(0)
                    ), fire_pos
                )
            }

            play_audio("bottle_pop")
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Missile impact damage: ${this.proj_damage_base.toFixed(2)}`
        )

        this.write_desc_line(
            `Missile explosion damage: ${this.proj_damage_base.toFixed(2)}`
        )
    }
}

class ClusterfuckBall extends WeaponBall {
    static ball_name = "Clusterfuck"

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Clusterfuck";
        this.description_brief = "Has entirely too much.";
        this.quote = "My creator did not endow me with a victory quote.";

        this.tier = TIERS.ULTRA;
        this.category = CATEGORIES.POWERED;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
            TAGS.SMART
        ];
        
        this.weapon_data = [];

        this.weapon_data.push(...new Array(13).fill("").map(_ => new BallWeapon(1, "stick", [
            {pos: new Vector2(88, 66), radius: 10},
            {pos: new Vector2(68, 74), radius: 10},
            {pos: new Vector2(48, 74), radius: 10},
            {pos: new Vector2(32, 72), radius: 10},
            {pos: new Vector2(16, 68), radius: 10},
        ])));

        this.weapon_data.push(...new Array(13).fill("").map(_ => new BallWeapon(1, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ])));

        this.weapon_data.push(...new Array(13).fill("").map(_ => {
            return new BallWeapon(2, "SORD_berserk", [
                {pos: new Vector2(100, 58), radius: 12},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        }));

        this.weapon_data.push(...new Array(13).fill("").map(_ => new BallWeapon(3, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ])));

        this.longsword_damage_base = 2;
        this.longsword_speeds_range = [80, 240];
        this.longsword_speeds = new Array(13).fill(0).map(_ => random_float(...this.longsword_speeds_range, this.board.random));

        this.stick_damage_base = 75;
        this.stick_speed = 160;

        this.greatsword_damage_base = 50;
        this.greatsword_speed = 20;

        this.smart_extralongsword_damage_base = 10;
        this.smart_extralongsword_speed = 72;
        this.smart_extralongsword_speed_max_bonus = 6;

        this.explosions_num = 2;
        this.explosions_range_per_sord = [0,4];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
    }

    weapon_step(board, time_delta) {
        for (let i=0; i<13; i++) {
            this.rotate_weapon(i + 0, this.longsword_speeds[i] * time_delta);
        }

        for (let i=0; i<13; i++) {
            this.rotate_weapon(i + 13, this.stick_speed * time_delta);
        }

        for (let i=0; i<13; i++) {
            this.rotate_weapon(i + 26, this.greatsword_speed * time_delta);
        }

        for (let i=0; i<13; i++) {
            // find the angle of the closest enemy
            let closest_enemy = [...this.board.balls.filter(b => !b.allied_with(this)), ...this.board.projectiles.filter(p => p.can_hit_ball(this))].reduce((p, c) => {
                return !p || (p[1] > c.position.sqr_distance(this.position)) ? [c, c.position.sqr_distance(this.position)] : p
            }, null)

            if (closest_enemy) {
                let pointing_vector = closest_enemy[0].position.sub(this.position);
                let pointing_angle = positive_mod(pointing_vector.angle(), Math.PI * 2);
                pointing_angle += deg2rad((i - 6) * 5);

                // so now, we need to check our current angle and our target angle, and figure out if we're closer CW or CCW
                // remember that it can loop, so:
                /*
                    0 -- 180 -- 360
                                 X 330
                              320>
                     <20
                    X 10
                */
                // if target > current, our CW rotation (+) is unchanged
                //                      our CCW rotation (-) is +360 start
                // else other way round (but CW is -360)
                let cw_rot = 0;
                let ccw_rot = 0;
                let current = this.weapon_data[i + 39].angle;
                if (pointing_angle > current) {
                    cw_rot = pointing_angle - current;
                    ccw_rot = (current+(Math.PI*2)) - pointing_angle;
                } else {
                    ccw_rot = current - pointing_angle;
                    cw_rot = pointing_angle - (current-(Math.PI*2));
                }

                // smaller one wins
                let sign = (cw_rot > ccw_rot ? -1 : 1) * (this.weapon_data[i + 39].reversed ^ this.reversed ? -1 : 1);

                let speed_bonus = this.smart_extralongsword_speed_max_bonus * (Math.min(cw_rot, ccw_rot) * Math.PI);

                this.rotate_weapon(i + 39, this.smart_extralongsword_speed * speed_bonus * sign * time_delta);
            }
        }

        this.explosions_delay -= time_delta;
        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                for (let wp=0; wp<this.weapon_data.length; wp++) {
                    if (this.weapon_data[wp].sprite != "LONGSORD")
                        continue;

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
        let dmg = 0;
        let snd = undefined;

        if (with_weapon_index < 13) {
            dmg = this.longsword_damage_base;
        } else if (with_weapon_index < 26) {
            dmg = this.stick_damage_base;
            snd = "strongpunch"
        } else if (with_weapon_index < 39) {
            dmg = this.greatsword_damage_base;
        } else {
            dmg = this.smart_extralongsword_damage_base
        }

        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = snd;

        return result;
    }
}

class TurretBall extends SmartBowBall {
    static ball_name = "Smart Turret";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Smart Turret";
        this.description_brief = "Fires a whole lot of bullets. Locks onto the closest target and tries to predict its movement.";
        this.quote = "Thanks @TheGlimGuy.";

        this.tier = TIERS.ULTRA;

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(128, -16),
        ]

        this.arrow_proto = BulletProjectile;

        this.shot_cooldown_max = 0.001;
        this.shot_cooldown = this.shot_cooldown_max;

        this.arrow_speed = 30000;
        this.speed_spread = 5000;
        this.deg_spread = 10;
    }

    weapon_step(board, time_delta) {
        this.velocity = Vector2.zero;

        super.weapon_step(board, time_delta);
    }
}

class MissileProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "rachete";
        this.set_hitboxes([
            {pos: new Vector2(-20, 0), radius: 4},
            {pos: new Vector2(-16, 0), radius: 4},
            {pos: new Vector2(-12, 0), radius: 4},
            {pos: new Vector2(-8, 0), radius: 4},
            {pos: new Vector2(-4, 0), radius: 4},
            {pos: new Vector2(0, 0), radius: 4},
            {pos: new Vector2(4, 0), radius: 4},
            {pos: new Vector2(8, 0), radius: 4},
            {pos: new Vector2(12, 0), radius: 4},
            {pos: new Vector2(16, 0), radius: 4},
            {pos: new Vector2(20, 0), radius: 8},
        ]);

        this.particle_cd_max = 0.002;
        this.particle_cd = this.particle_cd_max;
    }

    physics_step(time_delta) {
        super.physics_step(time_delta);

        // find the nearest ball and rotate towards it
        let cur_dir = this.direction.mul(this.speed);

        // add a flat value to it (scaled by time_delta)
        let closest_enemy = [...this.board.balls.filter(b => this.can_hit_ball(b))].reduce((p, c) => {
            return !p || (p[1] > c.position.sqr_distance(this.position)) ? [c, c.position.sqr_distance(this.position)] : p
        }, null);

        if (closest_enemy) {
            let vec = closest_enemy[0].position.sub(this.position).normalize();

            cur_dir = cur_dir.add(vec.mul(60000 * time_delta));
        }

        // recalculate speed and direction
        this.speed = cur_dir.magnitude();
        this.set_dir(cur_dir.normalize());

        this.particle_cd -= time_delta;
        while (this.particle_cd < 0) {
            this.particle_cd += this.particle_cd_max;

            let pos = this.position.add(this.direction.mul(-12 * this.size, 0));

            this.board.spawn_particle(new Particle(
                pos, random_float(0, Math.PI * 2, this.board.random), 0.1, entity_sprites.get("explosion"), 24, 3, false, 0, true
            ), pos);
        }
    }

    make_explosion() {
        let proj = new GrenadeExplosionProjectile(
            this.board,
            this.source, this.source_weapon_index,
            this.position, this.damage, 1.5
        );

        proj.can_hit_allied = false;
        proj.can_hit_source = false;

        play_audio("explosion2");

        this.board.spawn_projectile(proj, this.position);
    }

    hit_other_projectile(other_projectile) {
        this.make_explosion();
        this.active = false;
    }

    get_parried(by) {
        this.make_explosion();
        this.active = false;
    }

    hit_ball(ball, delta_time) {
        this.make_explosion();
        this.active = false;
    }
}

// TODO eye of cthulhu

let powered_selectable_balls = [
    SmartLongsword, SmartBowBall, MissileLauncherBall, ClusterfuckBall, TurretBall
]