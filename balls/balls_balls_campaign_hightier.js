class FlamethrowerBall extends WeaponBall {
    static ball_name = "Flamethrower";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Flamethrower";
        this.description_brief = "Fires an endless stream of flames that applies burn. Periodically charges a large explosive fireball that explodes into flames when hitting anything, including walls.";
        this.level_description = "Fireball charges quicker and the flamethrower fires even more flames.";
        this.max_level_description = "The flamethrower does not stop shooting while charging the fireball.";
        this.quote = "Oh, oh, sorry! Just doing my job!";

        this.tier = TIERS.APLUS;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.S;
        }

        this.category = CATEGORIES.HIGHTIER;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.AILMENTS,
            TAGS.PROJECTILES,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(0.8, "flamethrower", [
                {pos: new Vector2(72, 64), radius: 12},
                {pos: new Vector2(56, 64), radius: 12},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-20, 0);

        this.firing_offsets = [
            new Vector2(114, 0),
            new Vector2(118, 6)
        ]

        // scales based on STARTING_HP
        this.max_hp = this.max_hp * (100 / 100);
        this.hp = this.max_hp;

        this.speed_base = 75;
        this.damage_base = 2;

        this.proj_burn_base = 0.04;
        this.proj_speeds = [8000, 13000];
        this.proj_spread = deg2rad(10) + deg2rad(this.level * 0.1);
        this.proj_durations = [0.4, 0.8];

        this.shot_cooldown_max = 0.008 - (this.level * 0.00003);
        this.shot_cooldown = this.shot_cooldown_max;

        this.charging = false;
        this.charge_duration = 0;
        this.charge_duration_max = 2 - (this.level * 0.008);
        
        this.charge_cooldown_max = 6;
        this.charge_cooldown = this.charge_cooldown_max;
    
        this.fireball_damage = 15;
        this.fireball_fire_particles = 256 * 2;

        this.charge_sparks_t_max = 0.02;
        this.charge_sparks_t = 0;

        this.linked_charge_particle = null;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        
        if (!this.charging || this.level >= AWAKEN_LEVEL) {
            this.shot_cooldown -= time_delta;
            while (this.shot_cooldown <= 0) {
                this.shot_cooldown += this.shot_cooldown_max;

                let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                let fire_pos = this.position.add(firing_offset);

                let fire_dir = new Vector2(
                    random_float(...this.proj_speeds, this.board.random), 0
                ).rotate(
                    this.weapon_data[0].angle + (
                        random_float(-1, 1, this.board.random) * this.proj_spread
                    )
                )

                board.spawn_projectile(
                    new FlamethrowerProjectile(
                        this.board,
                        this, 0, fire_pos, 1,
                        fire_dir,
                        this.velocity.mul(0.8),
                        0.2,
                        random_float(...this.proj_durations, this.board.random)
                    ), fire_pos
                )
            }
        }

        if (this.charging) {
            this.charge_duration -= time_delta;
            if (this.charge_duration <= 0) {
                this.charging = false;
                this.linked_charge_particle.lifetime = 1000000;
                this.linked_charge_particle = null;

                let firing_offset = this.firing_offsets[1].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                let fire_pos = this.position.add(firing_offset);

                let fire_dir = new Vector2(
                    1, 0
                ).rotate(
                    this.weapon_data[0].angle
                )

                this.board.spawn_projectile(
                    new FlamethrowerFireballProjectile(
                        this.board, this, 0, fire_pos, this.fireball_damage,
                        1.5, fire_dir, 3000
                    ), fire_pos
                )

                play_audio("explosion_1", 0.3);
            }
        } else {
            this.charge_cooldown -= time_delta;
            if (this.charge_cooldown <= 0) {
                this.charge_cooldown = this.charge_cooldown_max;
                
                this.charge_duration = this.charge_duration_max;
                this.charging = true;

                this.linked_charge_particle = new Particle(
                    this.position, this.weapon_data[0].angle, 1.5,
                    entity_sprites.get("flamethrower_charge"),
                    4 / this.charge_duration_max, 999
                )

                this.board.spawn_particle(this.linked_charge_particle, this.position);
            
                play_audio("gravity_magic_2", 0.3);
            }
        }

        if (this.linked_charge_particle) {
            let firing_offset = this.firing_offsets[1].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            this.linked_charge_particle.lifetime = this.charge_duration_max - this.charge_duration;
            this.linked_charge_particle.position = fire_pos;
            this.linked_charge_particle.rotation_angle = this.weapon_data[0].angle;
        
            let prop = this.charge_duration_max - this.charge_duration;
            this.charge_sparks_t -= time_delta * prop;
            while (this.charge_sparks_t <= 0) {
                this.charge_sparks_t += this.charge_sparks_t_max;

                let vec = random_on_circle(random_float(4000, 6000) * prop, this.independent_random);

                this.board.spawn_particle(
                    new MovingFrictionGravityTrailParticle(
                        fire_pos, 0, random_float(0.1, 0.3, this.independent_random),
                        entity_sprites.get("powerup_burst_gold"), 0,
                        random_float(0.2, 0.4, this.independent_random), true,
                        vec, 18000, new Colour(255, 242, 0, 255), 0.2, this.board,
                        this.board.gravity.mul(3)
                    ),
                    fire_pos
                )
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            if (with_projectile instanceof FlamethrowerProjectile) {
                other.apply_invuln(0, true);
                
                other.hitstop = 0;
                this.hitstop = 0;

                result.mute = true;
            }
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Fires out flames and charges big fireballs.`
        )

        this.write_desc_line(
            `Flames/s: ${(1 / this.shot_cooldown_max).toFixed(1)}`
        )

        this.write_desc_line(
            `Burn per flame: ${this.proj_burn_base.toFixed(2)}`
        )

        if (this.charging) {
            this.write_desc_line(
                `Charge: charging ${this.charge_duration.toFixed(1)}s [${"#".repeat(Math.ceil((this.charge_duration / this.charge_duration_max) * 12)).padEnd(12)}]`
            )
        } else {
            this.write_desc_line(
                `Charge: cooldown ${this.charge_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.charge_cooldown / this.charge_cooldown_max) * 12)).padEnd(12)}]`
            )
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Still shoots flames while charging fireballs.`, true
            )
        }
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Still shoots flames while charging fireballs.`, true
            )
        } else {
            this.write_desc_line(
                `Fires out flames and charges big fireballs.`
            )
        }

        if (this.charging) {
            this.write_desc_line(
                `Charge: charging ${this.charge_duration.toFixed(1)}s [${"#".repeat(Math.ceil((this.charge_duration / this.charge_duration_max) * 12)).padEnd(12)}]`
            )
        } else {
            this.write_desc_line(
                `Charge: cooldown ${this.charge_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.charge_cooldown / this.charge_cooldown_max) * 12)).padEnd(12)}]`
            )
        }
    }
}

class BallLightningBall extends WeaponBall {
    static ball_name = "Ball Lightning";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, child_depth=0) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Ball Lightning";
        this.description_brief = "Periodically explodes and releases bursts of chain lightning in random directions, faster if taking damage. Chain lightning has a chance to create more ball lightning on contact with a wall, which will explode after releasing lightning once or being hit.";
        this.level_description = "Chain lightning bursts are more frequent. Slightly increases chain lightning split chance.";
        this.max_level_description = "Additional ball lightnings can create more smaller ball lightnings!";
        this.quote = "bzzt";

        this.tier = TIERS.S;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.SPLUS;
        }

        this.category = CATEGORIES.HIGHTIER;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "bolt";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;
        this.entry_animation_size_mult = ANIMATION_STANDARD_DATA[this.entry_animation].size_mult;
        this.entry_animation_speed_mult = ANIMATION_STANDARD_DATA[this.entry_animation].speed_mult;

        this.weapon_data = [

        ];

        this.linked_particle = null;

        this.chain_lightning_start_points = [2, 5];
        this.chain_lightning_chain_chance = 0.175 + ((this.level / 100) * 0.025);
        this.chain_lightning_distance = 1000;
        this.chain_lightning_spread = deg2rad(45);
        this.chain_lightning_delay_per_chain = 0.015;
        this.chain_lightning_damage = 8;

        this.lightning_delay_max = 1 - ((this.level / 100) * 0.25);
        this.lightning_delay = this.lightning_delay_max;

        this.lightning_accel_per_damage = 0.025;

        this.explosion_damage = 12;
        this.sub_lightning_spawn_chance = 0.1;
    
        this.child_depth = child_depth;
        this.parent = null;

        if (this.child_depth >= 1) {
            this.show_stats = false;
        }

        this.can_create_children = this.child_depth == 0 || (this.child_depth == 1 && this.level >= AWAKEN_LEVEL);
    }

    late_setup() {
        super.late_setup();

        this.linked_particle = this.board.spawn_particle(new Particle(
            this.position, 0, this.radius / 256, entity_sprites.get("ball_lightning"),
            0, 9999, true
        ), this.position);

        this.linked_particle.add_component(new OverlayBallParticleComponent(this.board, this));
        this.linked_particle.add_component(new LightningBallParticleComponent(this.board));
    }

    make_lightnings() {
        let start_points = [];
        let n = random_int(...this.chain_lightning_start_points, this.board.random);
        for (let i=0; i<n; i++) {
            start_points.push(this.position.add(random_on_circle(this.radius * ((this.board.random() * 0.7) + 0.001), this.board.random)));
        }

        start_points.forEach(sp => {
            let lightnings = [[sp, sp.sub(this.position).angle()]];

            let loops = 0;
            while (lightnings.length > 0 && loops < 50) {
                let new_lightnings = [];
                lightnings.forEach(lgt => {
                    let pos = lgt[0];
                    let angle = lgt[1];

                    if (!board.in_bounds(pos)) {
                        return;
                    }

                    let repeats = 1;
                    if (random_float(0, 1, this.board.random) < this.chain_lightning_chain_chance) {
                        repeats = 2;
                    }

                    for (let i=0; i<repeats; i++) {
                        let new_angle = angle + (random_float(-1, 1, this.board.random) * this.chain_lightning_spread);

                        let direction = new Vector2(this.chain_lightning_distance, 0).rotate(new_angle);

                        let newpos = pos.add(direction);

                        // make a timer to create a hitscan projectile from pos to pos+direction
                        // then append the new lightning node
                        let timer = new Timer(() => {
                            let proj = new BallLightningLightningProjectile(
                                this.board,
                                this, 0, pos,
                                this.chain_lightning_damage,
                                newpos
                            );

                            board.spawn_projectile(proj, pos);
                        }, this.chain_lightning_delay_per_chain * loops);

                        if (this.can_create_children && !this.board.in_bounds(newpos)) {
                            if (this.board.random() <= this.sub_lightning_spawn_chance) {
                                let newball = new BallLightningBall(
                                    this.board, this.mass * 0.5, this.radius * 0.5,
                                    this.colour, this.bounce_factor, this.friction_factor,
                                    this.player, this.level, this.reversed,
                                    this.child_depth + 1
                                );

                                newball.set_velocity(newpos.sub(this.position).normalize().mul(
                                    random_float(2000, 8000, this.board.random)
                                ))

                                newball.hp = 1;
                                newball.max_hp = 1;
                                newball.parent = this.parent ?? this;

                                newball.lightning_delay *= random_float(1.25, 2, this.board.random);

                                this.board.set_timer(new Timer(_ => {
                                    this.board.spawn_ball(newball, newpos);
                                }, this.chain_lightning_delay_per_chain * loops))
                            }
                        }

                        board.set_timer(timer);

                        new_lightnings.push([newpos, new_angle]);
                    }
                })

                loops++;
                lightnings = new_lightnings;
            }
        })
    }

    lose_hp(amt, source, bypass_damage_prevention=false) {
        let taken = super.lose_hp(amt, source, bypass_damage_prevention);

        this.lightning_delay -= this.lightning_accel_per_damage * taken;
    }

    weapon_step(board, time_delta) {
        this.lightning_delay -= time_delta;
        if (this.lightning_delay <= 0) {
            this.lightning_delay += this.lightning_delay_max;
            this.make_lightnings();

            play_audio("lightningbolt2", 0.1 - (0.04 * this.child_depth));

            if (this.child_depth >= 1) {
                this.hp -= 1;
            }
        }

        if (this.parent?.hp <= 0) {
            this.hp = 0;
        }
    }

    die() {
        if (this.child_depth == 0) {
            return super.die();
        } else {
            // make an explosion projectile and skip the normal death anim
            this.last_damage_source?.weapon_data?.forEach(w => {
                w.reverse();
            })

            let s = 3 * (this.radius / 256);
            let expl_position = this.position;

            let proj = new BallLightningExplosionProjectile(
                this.board, this.parent, 0, expl_position,
                this.parent.explosion_damage, s
            )

            play_audio("lightningbolt4", 0.4 - (0.15 * this.child_depth));

            this.parent.board.spawn_projectile(proj, expl_position);
            
            return {skip_default_explosion: true};
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Constantly fires chain lightning.`
        )

        this.write_desc_line(
            `Lightning damage: ${this.chain_lightning_damage.toFixed(2)}`
        )

        this.write_desc_line(
            `Lightning delay: ${this.lightning_delay.toFixed(1)}s [${("#".repeat(Math.floor((Math.max(0, this.lightning_delay) / this.lightning_delay_max) * 20)).padEnd(20))}]`
        )

        this.write_desc_line(
            `Extra ball lightning chance: ${(this.sub_lightning_spawn_chance * 100).toFixed(0)}%`
        )

        this.write_desc_line(
            `Extra ball lightning explosion damage: ${this.explosion_damage.toFixed(2)}`
        )

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Extra ball lightnings can create even more!`,
                true
            )
        }
    }
}

class BallLightningLightningProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 8;
        this.sprite_colour = "#cff";

        this.ignore_smoothing = true;
        this.parriable = false;
    }
}

class BallLightningExplosionProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, damage, size) {
        super(board, source, source_weapon_index, position, damage, size, 0.6, "ball_lightning_explosion");

        this.hitboxes_by_frame = [
            [{pos: new Vector2(0, 0), radius: 6}],
            [{pos: new Vector2(0, 0), radius: 12}],
            [{pos: new Vector2(0, 0), radius: 18}],
            [{pos: new Vector2(0, 0), radius: 24}],
            [{pos: new Vector2(0, 0), radius: 24}],
            [{pos: new Vector2(0, 0), radius: 24}],
            [],
            [],
            [],
            [],
        ]
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        let diff_vec = ball.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = ball.velocity.magnitude();

        if (other_mag != 0) {
            let new_other_velocity = ball.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

            ball.set_velocity(new_other_velocity);
        }

        ball.apply_invuln(BALL_INVULN_DURATION * 2);
    }
}

class FlamethrowerProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, size, velocity, inertia_vel, air_res, duration) {
        super(board, source, source_weapon_index, position, 0, size, Vector2.forward, 0);

        this.sprites = entity_sprites.get("flamethrower_flame");
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        this.hitboxes_by_frame = [
            [{pos: new Vector2(0, 0), radius: 8}],
            [{pos: new Vector2(0, 0), radius: 8}],
            [{pos: new Vector2(0, 0), radius: 8}],
            [{pos: new Vector2(0, 0), radius: 8}],
            [{pos: new Vector2(0, 0), radius: 8}],
            [],
            [],
            []
        ]

        this.lifetime = 0;
        this.duration = duration;

        this.velocity = velocity.add(inertia_vel);

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.air_res = air_res;

        this.hit_particles_override = "hit_fire";

        this.playing_noise = true;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.velocity.mul(time_delta)));
        this.velocity = this.velocity.mul(Math.pow(this.air_res, time_delta))

        this.lifetime += time_delta;

        let frame = Math.floor((this.lifetime / this.duration) * this.framecount);
        this.sprite = this.sprites[frame];

        this.set_hitboxes(this.hitboxes_by_frame[frame]);

        if (this.lifetime >= this.duration) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        this.active = false;

        this.source.apply_burn(ball, this.source.proj_burn_base);

        if (this.playing_noise)
            play_audio("noise", 0.015);
    }
}

class FlamethrowerFireballProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, ) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    
        this.sprites = entity_sprites.get("flamethrower_fireball");
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        this.framespeed = 12;
        this.lifetime = 0;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 16},
        ]);
    }

    physics_step(time_delta) {
        super.physics_step(time_delta);

        this.lifetime += time_delta;

        let frame = Math.floor((this.lifetime * this.framespeed) % this.framecount);
        this.sprite = this.sprites[frame];

        if (!this.source.board.in_bounds_with_radius(this.position, 16)) {
            this.make_explosion();
            this.active = false;
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

        for (let i=0; i<this.source.fireball_fire_particles; i++) {
            let fire_dir = new Vector2(
                random_float(...this.source.proj_speeds, this.source.board.random) * random_float(0.2, 0.5, this.source.board.random), 0
            ).rotate(
                random_float(0, Math.PI * 2, this.source.board.random)
            )

            this.source.board.spawn_projectile(
                new FlamethrowerProjectile(
                    this.source.board,
                    this.source, 0, this.position, 1,
                    fire_dir,
                    Vector2.zero,
                    0.2,
                    random_float(...this.source.proj_durations, this.source.board.random) * 2
                ), this.position
            ).playing_noise = false;
        }
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

let campaign_high_tier_selectable_balls = [
    FlamethrowerBall, BallLightningBall
]