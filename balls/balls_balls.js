const AWAKEN_LEVEL = 99;
const WEAPON_SIZE_MULTIPLIER = 16;
const PROJ_SIZE_MULTIPLIER = 16;

class BallWeapon {
    constructor(size_multiplier, sprite, hitboxes) {
        this.size_multiplier = size_multiplier * WEAPON_SIZE_MULTIPLIER;
        this.sprite = sprite;

        // all hitboxes are {pos, radius} - so they're circles, not boxes. sorry liberals
        this.hitboxes = hitboxes;

        this.angle = 0;

        this.reversed = false;

        this.unparriable = false;

        this.offset = new Vector2(0, 0);
    }

    rotate(by_deg, reverse) {
        this.angle += by_deg * (Math.PI / 180) * ((this.reversed ^ reverse) ? -1 : 1);
    }

    reverse() {
        this.reversed = !this.reversed;
    }
}

// abstract class that rotates a SORD at a base rotation speed with no other effects
// also implements weapon collision
// levels go from 1 to 7, with 7 being an "awakened" level that has a bonus effect
class WeaponBall extends Ball {
    static RUPTURE_CALCULATION_CONSTANT = Math.LN2

    static ball_name = "No Weapon";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor);

        this.name = "No Weapon";
        this.description_brief = "Does nothing. Unarmed, but not the awesome kind.";
        this.level_description = "It really doesn't do anything, even when levelled up.";
        this.max_level_description = "Seriously, it doesn't do anything.";
        this.quote = "I won? I won! How'd I win?!";

        // player.stats:
        /*
            damage_bonus       [multiplier]
            defense_bonus      [multiplier]
            ailment_resistance [multiplier]
            
            unique_level   [int]
        */
        this.player = player;

        // weaponballs have a set of weapons that spin around them
        this.weapon_data = [
            new BallWeapon(0, "SORD", [
                
            ])
        ];

        // every hit deals a minimum of 1 damage and 100 hp is the max for everyone
        this.max_hp = 100;
        this.hp = 100;
        
        this.takes_damage = true;

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
        this.level = level;

        this.show_stats = true;
        this.display = true;

        this.lifetime = 0;

        this.rupture_intensity = 0;

        this.poison_intensity = 0;
        this.poison_duration = 0;

        this.last_damage_source = null;

        this.cached_weapon_offsets = [];
        this.cached_hitboxes_offsets = [];

        this.skin_name = "Default";
        this.custom_parry_sound = "";
        this.custom_projectile_parry_sound = "";
    }

    late_setup() {
        // late_setup is applied after the ball knows what the board is
        // (and is added to the board)
        // and after overridden constructors are called

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    set_skin(skin_name) {
        // do nothing
        // other balls will implement skins as necessary
        // mostly it will replace the weapon sprite and maybe some particle effects
        this.skin_name = skin_name;
    }

    get_ailment_hp_loss() {
        // returns the amount of HP that will be lost to ailments
        return {
            // i love you integral calculator
            // wow maths is so beautiful actually i should get on that shit again
            "rupture": this.rupture_intensity / WeaponBall.RUPTURE_CALCULATION_CONSTANT,
            "poison": this.poison_intensity * this.poison_duration
        }
    }

    lose_hp(amt, source, bypass_damage_prevention=false) {
        if (this.takes_damage || bypass_damage_prevention) {
            let hp_to_lose = Math.min(this.hp, amt);

            // we don't care about overkill for the ball itself but we do for tension
            this.hp -= amt;

            this.board.register_hp_loss(source, this, hp_to_lose);

            return amt;
        }

        return 0;
    }

    allied_with(other) {
        return this.player?.id === other.player?.id;
    }

    randomise_weapon_rotations() {
        this.weapon_data.forEach(w => {
            w.angle = 0;
            w.rotate(random_float(0, 360, this.board.random));
        })
    }

    rotate_weapon(index, by_deg) {
        this.weapon_data[index]?.rotate(by_deg, this.reversed);
    }

    reverse_weapon(index) {
        this.weapon_data[index]?.reverse();
    }

    ailments_step(board, time_delta) {
        // poison deals intensity dps for duration seconds
        if (this.poison_duration <= 0) {
            this.poison_intensity = 0;
        } else {
            this.lose_hp(this.poison_intensity * time_delta, "ailment");
        }
        
        this.poison_duration -= time_delta;

        // rupture deals intensity dps and reduces by 50%/s
        if (this.rupture_intensity > 0) {
            this.lose_hp(this.rupture_intensity * time_delta, "ailment");
            this.rupture_intensity = lerp(this.rupture_intensity, 0, 1 - compat_pow(0.5, time_delta));
        }
    }

    physics_step(board, time_delta) {
        // TODO think about how best to make this less annoying to override
        this.lifetime += time_delta;

        this.hitstop -= time_delta;
        if (this.hitstop > 0) {
            time_delta *= HITSTOP_DELTATIME_PENALTY;
        }

        super.physics_step(time_delta);
        this.weapon_step(board, time_delta);
        this.ailments_step(board, time_delta);

        this.invuln_duration -= time_delta;
        this.weapon_data.forEach(w => w.angle = w.angle % (Math.PI * 2));

        // not amazing but should at least uplift performance a bit
        // just to cache every physics step
        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, 180 * time_delta);
    }

    cache_weapon_offsets() {
        this.cached_weapon_offsets = [];

        this.weapon_data.forEach((weapon, index) => {
            let offset = new Vector2(this.radius + ((weapon.size_multiplier * 0.75) * 128 * 0.5), 0);

            // add the weapon's personal offset
            offset = offset.add(weapon.offset.mul(weapon.size_multiplier));

            offset = offset.rotate(weapon.angle);

            this.cached_weapon_offsets[index] = offset;  // this is the center of the weapon
        });
    }

    get_weapon_offset(weapon_index) {
        return this.cached_weapon_offsets[weapon_index];
    }

    cache_hitboxes_offsets() {
        this.cached_hitboxes_offsets = [];

        this.weapon_data.forEach((weapon, index) => {
            this.cached_hitboxes_offsets[index] = weapon.hitboxes.map(hitbox => {
                return this.get_hitbox_offset(weapon, hitbox);
            })
        });
    }

    get_hitbox_offset(weapon, hitbox) {
        return hitbox.pos.sub(new Vector2(64, 64)).rotate(weapon.angle).mul(weapon.size_multiplier);
    }

    get_hitboxes_offsets(weapon_index) {
        return this.cached_hitboxes_offsets[weapon_index];
    }

    // HOW DO YOU NAME THIS
    check_weapons_hit_from(other) {
        // check if THIS BALL is hit by another ball's weapons, and if yes, return which
        return new Array(other.weapon_data.length).fill(0).map((_, i) => i).filter(weapon_index => {
            // return true if hit else false
            let weapon = other.weapon_data[weapon_index];

            let hitboxes_offsets = other.get_hitboxes_offsets(weapon_index);
            let weapon_offset = other.get_weapon_offset(weapon_index);

            // then check each hitbox; the radius is simply radius * size_multiplier
            // then its classic distance checking
            return hitboxes_offsets.some((hitbox_offset, index) => {
                let hitbox = weapon.hitboxes[index];

                let radius_sum = (hitbox.radius * weapon.size_multiplier) + this.radius;
                let radius_sum_sqr = compat_pow(radius_sum, 2);

                return other.position.add(weapon_offset).add(hitbox_offset).sqr_distance(this.position) <= radius_sum_sqr;
            })
        });
    }

    check_weapon_to_weapon_hit_from(other) {
        // check if THIS WEAPON'S HITBOXES are hit by another ball's weapons, and if yes, return the pairs
        let collisions = [];
        this.weapon_data.forEach((weapon, index) => {
            if (weapon.unparriable) {
                return;
            }

            let this_hitboxes_offsets = this.get_hitboxes_offsets(index);
            let this_weapon_offset = this.get_weapon_offset(index);

            other.weapon_data.forEach((other_weapon, other_index) => {
                if (other_weapon.unparriable) {
                    return;
                }

                let other_hitboxes_offsets = other.get_hitboxes_offsets(other_index);
                let other_weapon_offset = other.get_weapon_offset(other_index);

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (other_weapon.hitboxes[other_index].radius * other_weapon.size_multiplier);
                        let radius_sum_sqr = compat_pow(radius_sum, 2);

                        let other_hitbox_pos = other.position.add(other_weapon_offset).add(other_hitbox_offset)
                        return this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr
                    })
                })

                if (collided) {
                    collisions.push([index, other_index]);
                }
            })
        })

        return collisions;
    }

    check_projectiles_hit_from(projectiles) {
        // get the projectiles' hitboxes and compare to self - super simple
        return projectiles.filter(projectile => {
            let hitboxes_offsets = projectile.get_hitboxes_offsets();

            return hitboxes_offsets.some((hitbox_offset, index) => {
                let hitbox = projectile.hitboxes[index];

                let radius_sum = (hitbox.radius * projectile.size) + this.radius;
                let radius_sum_sqr = compat_pow(radius_sum, 2);

                let other_hitbox_pos = projectile.position.add(hitbox_offset);
                return this.position.sqr_distance(other_hitbox_pos) <= radius_sum_sqr
            })
        })
    }
    
    check_weapon_to_projectiles_hits(projectiles) {
        // only calculate weapon hitboxes once
        // then get the projectiles and their hitboxes, and compare to weapon hitboxes
        let collisions = [];
        this.weapon_data.forEach((weapon, index) => {
            if (weapon.unparriable) {
                return;
            }

            let this_hitboxes_offsets = this.get_hitboxes_offsets(index);
            let this_weapon_offset = this.get_weapon_offset(index);

            projectiles.forEach(projectile => {
                let projectile_hitboxes_offsets = projectile.get_hitboxes_offsets();

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return projectile_hitboxes_offsets.some((projectile_hitbox_offset, projectile_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (projectile.hitboxes[projectile_index].radius * projectile.size);
                        let radius_sum_sqr = compat_pow(radius_sum, 2);

                        let projectile_hitbox_pos = projectile.position.add(projectile_hitbox_offset);
                        return this_hitbox_pos.sqr_distance(projectile_hitbox_pos) <= radius_sum_sqr
                    })
                })

                if (collided) {
                    collisions.push([index, projectile]);
                }
            })
        })

        return collisions;
    }

    hit_other(other, with_weapon_index, damage=0) {
        // for this one, the SORD (the only weapon) just hits the other one for 1 damage and nothing else.
        // other balls might want to apply knockback, or do other stuff
        // console.log(`Hit ${other.id} with weapon index ${with_weapon_index}`);
        
        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit(this, damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;

        this.board.register_hit(this, other);
        return result;
    }

    get_hit(source, damage, hitstop) {
        // defense_bonus is a simple "divide damage by this" value
        let def = this.player?.stats?.defense_bonus ?? 1;
        let final_damage = damage == 0 ? damage : Math.max(1, damage / def);
        
        this.lose_hp(final_damage, source);
        this.apply_invuln(BALL_INVULN_DURATION);
        this.apply_hitstop(hitstop);

        return {dmg: final_damage, dead: this.hp <= 0};
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        // console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit_by_projectile(this, with_projectile.damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        
        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;
        
        this.board.register_hit(this, other);
        return result;
    }

    apply_hitstop(amt) {
        // if hitstop is higher than applied, don't do anything
        this.hitstop = Math.max(this.hitstop, amt);
    }
    
    apply_invuln(amt, allow_reduction=false) {
        if (allow_reduction) {
            this.invuln_duration = amt;
        } else {
            this.invuln_duration = Math.max(this.invuln_duration, amt);
        }
    }

    apply_rupture(other, amt, scales_with_stat="damage_bonus") {
        let final_amt = amt;
        if (scales_with_stat) {
            final_amt *= this.player?.stats[scales_with_stat] ?? 1;
        }

        other.receive_rupture(this, final_amt);
    }

    receive_rupture(other, amt) {
        let final_amt = amt;
        final_amt /= this.player?.stats?.ailment_resistance;

        this.rupture_intensity += final_amt;

        this.board.register_rupture(other, this, amt);
    }

    apply_poison(other, amt, duration, scales_with_stat="damage_bonus") {
        // amt scales with damage
        let final_amt = amt;
        if (scales_with_stat) {
            final_amt *= this.player?.stats[scales_with_stat] ?? 1;
        }

        other.receive_poison(this, final_amt, duration);
    }

    receive_poison(other, amt, duration) {
        // duration scales with resistance
        let final_duration = duration;
        final_duration /= this.player?.stats?.ailment_resistance;

        this.poison_intensity += amt;
        this.poison_duration = Math.max(
            this.poison_duration + final_duration,
            final_duration
        );

        this.board.register_poison(other, this, amt, duration);
    }

    get_hit_by_projectile(source, damage, hitstop) {
        return this.get_hit(source, damage, hitstop);
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        this.board.register_parry(this, other_ball);
    }

    parry_projectile(with_weapon_index, projectile) {
        this.board.register_projectile_parry(this, projectile.source, projectile);
    }

    get_projectile_parried(parrier, projectile) {
        // nothing
    }

    die() {
        return {skip_default_explosion: false};
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, "This thing has no stats", x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, "im serious", x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
    }
}

class DummyBall extends WeaponBall {
    // transforms into unarmedball when it takes a hit
    static ball_name = "No Weapon";
    
    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
        
        this.max_level_description = "Seriously, it doesn't do anythin- wait... no...";

        this.shake_duration_max = 4.5;
        this.shake_shake_start = 1.5;
        this.shake_shake_duration = this.shake_duration_max - this.shake_shake_start;
        this.shake_flash_start = 3;
        this.shake_flash_duration = this.shake_duration_max - this.shake_flash_start;
        this.shake_current = 0;
        this.shake_intensity_max = 1000;
        this.shake_origin = null;
        this.transforming = false;
        this.done = false;

        this.original_colour = this.colour;

        this.child = null;
    }

    weapon_step(board, time_delta) {
        if (this.transforming && !this.done) {
            this.shake_current += time_delta

            if (this.shake_current <= this.shake_duration_max) {
                this.set_velocity(Vector2.zero);

                this.set_pos(this.shake_origin.add(
                    random_on_circle(
                        lerp(
                            0, 
                            this.shake_intensity_max, 
                            random_float(0, 1) * (Math.max(0, (this.shake_current - this.shake_shake_start) / this.shake_shake_duration))
                        ),
                        this.board.random
                    )
                ))
                this.colour = this.original_colour.lerp(Colour.white, Math.max(0, (this.shake_current - this.shake_flash_start) / this.shake_flash_duration))
            } else {
                // replace this ball with UnarmedBall
                this.child = new UnarmedBall(
                    this.board,
                    this.mass, this.radius, this.original_colour,
                    this.bounce_factor, this.friction_factor,
                    this.player, this.level, false
                )

                this.child.set_velocity(random_on_circle(25000, this.board.random));

                this.hp = 0;
                this.transforming = false;
                this.done = true;
                this.skip_physics = false;
                this.takes_damage = true;

                let b = this.board;
                b.set_timer(new Timer(() => {
                    b.spawn_ball(this.child, this.shake_origin);
                    b.balls.forEach(ball => {
                        ball.skip_physics = false;
                        ball.takes_damage = true;
                    });
                }, 0.1))
            }
        }
    }

    die() {
        return {}
    }

    start_transforming() {
        play_audio("unarmed_theme");

        this.hp = 100;
        this.transforming = true;
        this.shake_origin = this.position;
        this.skip_physics = false;
        this.takes_damage = false;
        this.ignore_bounds_checking = true;
        this.board?.set_timer(new Timer(() => {
            this.skip_physics = false;
            this.takes_damage = false;
            this.hp = 100;
        }, 0.05))

        this.board?.balls.forEach(ball => {
            if (ball.id != this.id) {
                ball.skip_physics = true;
            }
        });
    }

    get_hit(source, damage, hitstop) {
        if (this.transforming || this.done) {
            return {dmg: 0, dead: false};
        }

        let result = null;
        if (this.level >= AWAKEN_LEVEL) {
            this.takes_damage = false;
            result = super.get_hit(source, damage, 0.5);

            this.start_transforming();
        } else {
            result = super.get_hit(source, damage, hitstop);
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, "This thing has no stats", x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, "im serious", x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Or does it...?`, x_anchor, y_anchor + 24, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class UnarmedBall extends WeaponBall {
    static ball_name = "Unarmed";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Unarmed";
        this.original_name = "Unarmed";
        this.description_brief = "It's already too late.";
        this.level_description = "It's already too strong.";
        this.max_level_description = "It cannot improve on perfection.";
        this.quote = "...pathetic.";

        // deals damage on collision instead of on hit
        // has no weapons
        // damage based on speed
        // gets faster every time it takes damage

        this.weapon_data = [
            new BallWeapon(1, "", [
                {pos: new Vector2(64, 64), radius: 34},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-80, 0);
        this.weapon_data[0].unparriable = true;

        this.intensity = 25000;
        this.intensity_per_dmg = 1000;

        this.damage_base = 1;
        this.damage_per_speed = 1 / 5000;
        this.damage_final = this.damage_base;
        
        this.defense_base = 0;
        this.defense_per_speed = 1 / 2500;
        this.defense_final = this.defense_base;

        this.ailment_resistance = 0;

        this.name_mutate_cooldown = 0;
        this.name_mutate_cooldown_max = 0.01;
    }

    lose_hp(amt, source, bypass_damage_prevention=false) {
        let taken = super.lose_hp(amt, source, bypass_damage_prevention);

        this.intensity += this.intensity_per_dmg * taken;
    }

    weapon_step(board, time_delta) {
        this.damage_final = this.damage_base + (this.damage_per_speed * this.velocity.magnitude());
        this.defense_final = this.defense_base + (this.defense_per_speed * this.velocity.magnitude());

        this.name_mutate_cooldown += time_delta;
        while (this.name_mutate_cooldown > this.name_mutate_cooldown_max) {
            this.name_mutate_cooldown -= this.name_mutate_cooldown_max
            this.name = [...this.name].map((c, i) => {
                let rand = random_float(0, 1, this.board.random);
                if (rand < 0.9) {
                    // do nothihng
                    return c;
                } else if (rand < 0.925) {
                    // set to random symbol
                    return String.fromCharCode(random_int(32, 256, this.board.random));
                } else if (rand < 0.95) {
                    // set to uppercase of original name
                    return this.original_name[i].toUpperCase();
                } else {
                    // set to lowercase of original name
                    return this.original_name[i].toLowerCase();
                }
            }).join("");
        }
    }

    apply_intensity_vel() {
        this.set_velocity(this.velocity.normalize().mul(this.intensity));
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        result = super.hit_other(other, with_weapon_index, this.damage_final);

        // set speed up to intensity
        this.apply_intensity_vel();

        return result;
    }

    get_hit(source, damage, hitstop) {
        let damage_reduced = Math.max(Math.min(damage, 1), damage - this.defense_final);

        let result = super.get_hit(source, damage_reduced, hitstop);

        // this.intensity += this.intensity_per_hit;

        // set speed up to intensity
        this.apply_intensity_vel();

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, "It's all over.", x_anchor, y_anchor, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Intensity: ${this.intensity.toFixed(0)}`, x_anchor, y_anchor + 12, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Damage: ${this.damage_final.toFixed(2)}`, x_anchor, y_anchor + 24, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Defense: ${(this.defense_final).toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
        )
    }
}

class HammerBall extends WeaponBall {
    static ball_name = "Hammer";

    static AVAILABLE_SKINS = ["Squeaky"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hammer";
        this.description_brief = "Has a huge hammer that does lots of damage each hit and knocks enemies back.";
        this.level_description = "Makes the hammer deal even more damage.";
        this.max_level_description = "Adds another smaller hammer that swings independently and faster, dealing half damage.";
        this.quote = "I'm sure you understand.\nThe subject of my victory is quite the heavy topic.";

        this.weapon_data = [
            new BallWeapon(0.8 + (level * 0), "hamer", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(0.8 / 2, "hamer", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ]));
        }

        this.damage_base = 8 + (0.1 * this.level);
        this.speed_base = 90;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Squeaky": {
                this.weapon_data[0].sprite = "hamer_squeaky";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "hamer_squeaky";
                }

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 1.6 * time_delta);
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = with_weapon_index == 0 ? this.damage_base : this.damage_base / 2;

        let result = super.hit_other(other, with_weapon_index, dmg);

        let diff_vec = other.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = other.velocity.magnitude();

        let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

        other.set_velocity(new_other_velocity);

        other.apply_invuln(BALL_INVULN_DURATION * 2);

        if (this.skin_name == "Squeaky") {
            result.snd = "impact_squeak";
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, "Knocks enemies back when striking them.", x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Second hammer damage: ${(this.damage_base / 2).toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
            write_text(
                ctx, `Second hammer rotation speed: ${(this.speed_base * 1.6).toFixed(0)} deg/s`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class SordBall extends WeaponBall {
    static ball_name = "SORD";

    static AVAILABLE_SKINS = ["Lightning", "Iron", "Faithful", "RAM"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "SORD";
        this.description_brief = "Deals more damage and rotates faster after every strike.";
        this.level_description = "Increases the base damage and rotation speed of the sord, and makes it scale faster.";
        this.max_level_description = "Also makes the sord larger(!) after every strike.";
        this.quote = "I told you about those strikes, bro. I TOLD you.";

        this.weapon_data = [
            new BallWeapon(1, "SORD", [
                {pos: new Vector2(100, 58), radius: 12},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 2 + (0.05 * level);
        this.speed_base = 135 + (4.5 * level);
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Lightning": {
                this.weapon_data[0].sprite = "SORD_lightning";
                // TODO lightning particle effects are in order once i finally add hit location detection

                break;
            }

            case "Iron": {
                this.weapon_data[0].sprite = "SORD_berserk";
                this.custom_parry_sound = "CLANG";

                break;
            }

            case "Faithful": {
                this.weapon_data[0].sprite = "SORD_faithful";
                this.custom_parry_sound = "parry_shitty";
                this.custom_projectile_parry_sound = "parry_shitty";

                break;
            }

            case "RAM": {
                this.weapon_data[0].sprite = "SORD_ram";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        this.damage_base += 0.5 * (1 + (this.level * 0.0175));
        this.speed_base += (60 / 4) * (1 + (this.level * 0.015));

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data[0].size_multiplier += 0.04 * 16;
        }

        if (this.skin_name == "Faithful") {
            result.snd = "impact_shitty";
        }

        if (this.skin_name == "RAM") {
            result.snd = dmg >= 8 ? "impact_heavy_8bit" : "impact_8bit";
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Hits harder and rotates faster every strike.`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Size multiplier: ${(this.weapon_data[0].size_multiplier / 16).toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class DaggerBall extends WeaponBall {
    static ball_name = "dagger";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "dagger";
        this.description_brief = "Rotates exponentially faster and deals exponentially more damage every strike. These bonuses decay back to zero when not continually striking.";
        this.level_description = "Increases the delay after not striking until bonuses will decay.";
        this.max_level_description = "When rotation speed is at 1000 deg/s or higher, starts shooting small projectiles (1 dmg) at a frequency and velocity based on rotation speed. Projectile hits don't count as strikes.";
        this.quote = "surely thats not all youve got.\ncome here and let me destroy you again.";

        this.weapon_data = [
            new BallWeapon(1, "dagger", [
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 68), radius: 12},
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(16, 56), radius: 12},
                {pos: new Vector2(0, 48), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.damage_base = 1;
        this.speed_base = 360;

        this.hit_decay = 0;

        this.projectiles_cooldown = 0;
        this.projectiles_cooldown_max = 0.2;

        this.proj_damage_base = 1;
        this.proj_speed = 0;

        this.hit_decay_max = 1.5 + (0.025 * this.level);
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 360, 1 - compat_pow(0.25, time_delta));
            this.damage_base = lerp(this.damage_base, 1, 1 - compat_pow(0.25, time_delta));
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.projectiles_cooldown_max = 0.5 / (this.speed_base / 500);
            this.proj_speed = 9000 + (100 / this.projectiles_cooldown_max);

            if (this.speed_base >= 1000) {
                this.projectiles_cooldown -= time_delta;
                if (this.projectiles_cooldown <= 0) {
                    this.projectiles_cooldown = this.projectiles_cooldown_max;

                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new DaggerAwakenProjectile(
                            this.board,
                            this, 0, fire_pos, this.proj_damage_base, 1,
                            new Vector2(1, 0).rotate(this.weapon_data[0].angle),
                            this.proj_speed, this.velocity.mul(0)
                        ), fire_pos
                    )
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.speed_base *= 2;
        this.damage_base *= 1.5;

        this.hit_decay = this.hit_decay_max

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
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Bonus decay time: ${this.hit_decay_max.toFixed(1)}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Faster rotation speed (x2) and damage (x1.5)`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `every strike. Bonus decays when not striking.`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Projectiles/s: ${(this.speed_base >= 1000 ? 1 / this.projectiles_cooldown_max : 0).toFixed(1)}`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class BowBall extends WeaponBall {
    static ball_name = "Bow";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Bow";
        this.description_brief = "Quickly fires sets of multiple arrows at a periodic interval. Successful arrow hits increase the number of arrows in each set and their damage.";
        this.level_description = "Increases arrow speed, slightly increases arrow size and slightly reduces shot delay.";
        this.max_level_description = "Start with +1 multishot. Every shot fires an additional arrow.";
        this.quote = "Phew! Almost ran out of arrows there.";

        this.weapon_data = [
            new BallWeapon(1, "bow", [
                {pos: new Vector2(16, 72-16), radius: 12},
                {pos: new Vector2(16, 72), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.proj_damage_base = 4;
        this.speed_base = 150;

        this.arrow_size_mult = 1 + (this.level * 0.005);
        this.arrow_speed = 10000 + (this.level * 250);

        this.shot_cooldown_max = 0.69 + (this.level * -0.005);
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishots = 0;
        this.multishots_max = 1;
        this.multishots_levelup_req = 1;

        if (this.level >= AWAKEN_LEVEL) {
            this.multishots_max += 1;
        }
        
        this.multishot_cooldown = 0;
        // 1/2th of the cooldown or 0.05, whichever is lower
        this.multishot_cooldown_max = Math.min(0.05, (this.shot_cooldown_max / 2) / this.multishots_max);
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
                    new ArrowProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1 * this.arrow_size_mult,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10, this.board.random) * (Math.PI / 180))),
                        this.arrow_speed * random_float(0.85, 1.15, this.board.random), this.velocity.mul(0)
                    ), fire_pos
                )
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        this.multishots_levelup_req--;
        if (this.multishots_levelup_req <= 0) {
            this.multishots_max++;
            this.proj_damage_base += 1;

            this.multishots_levelup_req = Math.max(1, this.multishots_max * this.multishots_max * 0.25);

            this.multishot_cooldown_max = Math.min(0.05, (this.shot_cooldown_max / 2) / this.multishots_max);
        }

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Arrow damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Multishot: ${this.multishots_max}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `Arrow size: ${this.arrow_size_mult.toFixed(3)}`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `Arrow speed: ${this.arrow_speed}`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `Multishot + damage increases with successful hits.`, x_anchor, y_anchor + 60, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `Has a weak melee attack: 2 damage.`, x_anchor, y_anchor + 72, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Shoots an additional arrow every shot.`, x_anchor, y_anchor + 84, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
        }
    }
}

class MagnumBall extends WeaponBall {
    static ball_name = "Magnum";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Magnum";
        this.description_brief = "Throws coins and shoots a gun. If a gunshot hits a coin, it doubles in damage and ricochets to the nearest other coin, or enemy if there is no other coin.";
        this.level_description = "Increases coin throw and shot frequency.";
        this.max_level_description = "Get an additional coin thrower.";
        this.quote = "Do you have any idea how much this battle cost me?\nIt's a good thing I can write off these coins as business expenses.";

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),

            new BallWeapon(1.5, "coin_weapon", [

            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            let w = new BallWeapon(1.5, "coin_weapon", [

            ]);

            this.weapon_data.push(w);
        }

        this.weapon_data[1].reverse();

        this.firing_offsets = [
            new Vector2(156, -16),
            new Vector2(32, 0)
        ]

        this.proj_damage_base = 8;
        this.coin_damage_base = 1;
        this.speed_base = 90;

        this.shot_cooldown_max = 0.55 + (this.level * -0.001);
        this.shot_cooldown = this.shot_cooldown_max;

        this.coin_shot_cooldown_max = 0.5 + (this.level * -0.001);
        this.coin_shot_cooldown = this.coin_shot_cooldown_max;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 2.5 * time_delta);
        this.rotate_weapon(2, this.speed_base * 2.5 * 1.3 * time_delta);

        this.shot_cooldown -= time_delta;
        this.coin_shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            board.spawn_projectile(
                new MagnumProjectile(
                    this.board,
                    this, 0, fire_pos, this.proj_damage_base,
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos), 0
                ), fire_pos
            )
        }

        if (this.coin_shot_cooldown < 0) {
            this.coin_shot_cooldown = this.coin_shot_cooldown_max;

            let coin_firing_offset = this.firing_offsets[1].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
            let coin_fire_pos = this.position.add(coin_firing_offset);
            
            let coin_obj = new MagnumCoinProjectile(
                this.board,
                this, 1, coin_fire_pos, this.coin_damage_base, 1.5,
                new Vector2(1, 0).rotate(this.weapon_data[1].angle), random_int(6000, 10000, this.board.random), board.gravity
            );

            board.spawn_projectile(
                coin_obj, coin_fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                let coin2_firing_offset = this.firing_offsets[1].mul(this.weapon_data[2].size_multiplier).rotate(this.weapon_data[2].angle);
                let coin2_fire_pos = this.position.add(coin2_firing_offset);
                
                let coin2_obj = new MagnumCoinProjectile(
                    this.board,
                    this, 1, coin2_fire_pos, this.coin_damage_base, 1.5,
                    new Vector2(1, 0).rotate(this.weapon_data[2].angle), random_int(6000, 10000, this.board.random), board.gravity
                );

                board.spawn_projectile(
                    coin2_obj, coin2_fire_pos
                )
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Bullet damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Coin damage: ${this.coin_damage_base.toFixed(2)}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Coin rotation speed: ${(this.speed_base * 2.5).toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Shots ricochet off coins for double damage.`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `Ricochet shots can't be parried.`, x_anchor, y_anchor + 60, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Has an additional coin thrower.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class NeedleBall extends WeaponBall {
    static ball_name = "Needle";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Needle";
        this.description_brief = "Has three small needles. Needles apply rupture per hit (stacking DOT that decays by 50%/s). When taking damage, chance to use 12.5% current HP and create a smaller child copy with 4x the HP used that deals half damage and rupture.";
        this.level_description = "Increases split chance and reduces HP lost from splitting.";
        this.max_level_description = "Applies poison instead for 1s each. Poison deals the full DOT for its duration and refreshes when stacked.";
        this.quote = "Many thanks for your kind donation! It's always hard getting food\non the table as a mother of six trillion.";

        this.weapon_data = [
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
        ];

        this.damage_base = 2 * (can_clone ? 1 : 0.5);
        this.rupture_base = 0.5 * (can_clone ? 1 : 0.5);
        this.poison_duration_base = 1;

        this.speed_base = 330;
        this.split_chance = 0.5 + (this.level * 0.005);
        this.split_ratio = 0.125;
        this.split_hp_save = (this.level * 0.005)

        this.children = [];
        this.parent = null;

        this.can_clone = can_clone;
        
        this.radius *= can_clone ? 1 : 0.75
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 1.7 * time_delta);
        this.rotate_weapon(2, this.speed_base * 0.6 * time_delta);

        if (this.parent?.hp <= 0) {
            this.lose_hp(25 * time_delta, this, true);
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        if (this.level >= AWAKEN_LEVEL) {
            this.apply_poison(other, this.rupture_base, this.poison_duration_base)
        } else {
            this.apply_rupture(other, this.rupture_base);
        }

        return result;
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
                    false
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.apply_invuln(BALL_INVULN_DURATION);

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

    get_hit(source, damage, hitstop) {
        let result = super.get_hit(source, damage, hitstop);

        this.clone_chance();

        return result;
    }

    // get_hit_by_projectile(damage, hitstop) {
    //     let result = super.get_hit_by_projectile(damage, hitstop);

    //     this.clone_chance();

    //     return result;
    // }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `${this.level >= AWAKEN_LEVEL ? "Poison" : "Rupture"} per hit: ${this.rupture_base.toFixed(1)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Copy chance: ${(this.split_chance * 100).toFixed(0)}%`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Copy HP ratio: ${(this.split_ratio * 100).toFixed(1)}%`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Split HP loss reduction: ${(this.split_hp_save * 100).toFixed(0)}%`, x_anchor, y_anchor + 60, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Applies poison instead of rupture.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class RailgunBall extends WeaponBall {
    static ball_name = "Railgun";

    static AVAILABLE_SKINS = ["Chicken", "Soaker"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Railgun";
        this.description_brief = "Shoots a beam projectile. If the shot hits or is parried, temporarily speeds up fire rate & rotation then quickly fires another shot. -[Original design by Boggy]";
        this.level_description = "Increases shot frequency.";
        this.max_level_description = "Use two railguns that always mirror positions and always shoot together, but damage is reduced by 33%.";
        this.quote = "Wow, it's hard to hold this thing!\nSeriously, take a look- No, really, try it!";

        this.weapon_data = [
            new BallWeapon(1, "railgun", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(64, 64), radius: 12},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(1, "railgun", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(64, 64), radius: 12},
            ]))
        }

        this.firing_offsets = [
            new Vector2(120, -2)
        ]

        this.proj_damage_base = 15;
        if (this.level >= AWAKEN_LEVEL) {
            this.proj_damage_base *= 1.5;
        }

        this.speed_base = 100;

        this.shot_cooldown_max_base = 0.7 + (this.level * -0.002);
        this.shot_cooldown_max = this.shot_cooldown_max_base;
        this.shot_cooldown_rapidfire = 0.04 + ((0.04 / 0.666) * -0.002);
        this.shot_cooldown = this.shot_cooldown_max;

        this.hit_decay = 0;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Chicken": {
                this.weapon_data[0].sprite = "railgun_chicken";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "railgun_chicken";
                }

                break;
            }

            case "Soaker": {
                this.weapon_data[0].sprite = "railgun_soaker";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "railgun_soaker";
                }

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        if (this.weapon_data[1]) {
            this.weapon_data[1].angle = this.weapon_data[0].angle - Math.PI;
        }

        this.shot_cooldown -= time_delta;

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 80, 1 - compat_pow(0.45, time_delta));
            this.shot_cooldown_max = lerp(this.shot_cooldown_max, this.shot_cooldown_max_base, 1 - compat_pow(0.2, time_delta));
        }

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let bullet1_end_pos = new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos);
            board.spawn_projectile(
                new RailgunProjectile(
                    this.board,
                    this, 0, fire_pos, this.proj_damage_base,
                    bullet1_end_pos,
                ), fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                firing_offset = this.firing_offsets[0].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
                fire_pos = this.position.add(firing_offset);

                board.spawn_projectile(
                    new RailgunProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base,
                        new Vector2(1, 0).rotate(this.weapon_data[1].angle).mul(10000).add(fire_pos),
                    ), fire_pos
                )
            } else {

            }

            if (this.skin_name == "Chicken") {
                play_audio("chicken");
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        this.shot_cooldown = this.shot_cooldown_rapidfire;
        this.speed_base *= 1.5;
        this.hit_decay = 0.6;

        let result = super.hit_other_with_projectile(other, with_projectile);

        other.apply_invuln(0.015, true);

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        /*
        this.shot_cooldown = this.shot_cooldown_rapidfire;
        this.speed_base *= 1.5;
        this.hit_decay = 0.6;

        parrier.apply_invuln(0.015, true);
        */
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Bullet damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `On shot hit or parry, rotation speed increases,`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 10
        )
        write_text(
            ctx, `and quickly fire another shot.`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Has two railguns that mirror positions.`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class PotionBall extends WeaponBall {
    static ball_name = "Potion";

    static AVAILABLE_SKINS = ["Ornate"];

    static potion_names = ["Rupture", "Poison", "Pure damage", "Time stop"];
    static potion_cols = [Colour.red, Colour.green, new Colour(0, 64, 255, 255), Colour.from_hex("#FF84F8")];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Potion";
        this.description_brief = "Throws three different potions that create debilitating puddles of chemicals on impact (red is rupture, green is poison, blue is pure damage). Parrying anything with the held potion temporarily destroys the potion, creating a puddle.";
        this.level_description = "Increases puddle duration.";
        this.max_level_description = "Adds a fourth potion that temporally affects balls, freezing them in time.";
        this.quote = "You couldn't handle my strongest potions.";

        this.weapon_data = [
            new BallWeapon(1, "potion1_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),

            new BallWeapon(1, "potion2_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),

            new BallWeapon(1, "potion3_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(1, "potion4_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]));
        }

        this.weapon_data[0].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[1].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[2].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[3]?.rotate(random_float(0, 360, this.board.random));

        this.weapon_data[1].reverse();
        this.weapon_data[3]?.reverse();

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.potion_impact_damage = 2;

        this.speed_range = [135, 225]
        this.speeds = [180, 180, 180, 180].map(_ => random_float(...this.speed_range, this.board.random));

        this.shot_cooldown_max_range = [0.45, 1];
        this.shot_cooldowns = [0, 0, 0, 0].map(_ => random_float(...this.shot_cooldown_max_range, this.board.random));
        this.weapon_regeneration_times = [0,0,0,0];
        this.max_weapon_regeneration_time = 1.6;
        this.potions_smashed = [false, false, false, false];
        this.potion_smash_penalty = 5;

        this.duration_mult = 1.2 + (0.0125 * this.level);

        this.sprite_suffix = "";
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Ornate": {
                this.weapon_data.forEach(w => w.sprite += "_ornate");
                this.sprite_suffix = "_ornate";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            if (this.weapon_regeneration_times[i] > 0) {
                this.weapon_regeneration_times[i] -= time_delta;
                if (this.weapon_regeneration_times[i] <= 0) {
                    this.weapon_data[i].size_multiplier = 1 * 16
                    this.speeds[i] = random_float(...this.speed_range, this.board.random);
                    this.weapon_data[i].hitboxes = [{pos: new Vector2(30, 64), radius: 14}];
                }
            } else {
                this.rotate_weapon(i, this.speeds[i] * time_delta);
                this.shot_cooldowns[i] -= time_delta;
                if (this.shot_cooldowns[i] < 0) {
                    this.shot_cooldowns[i] = random_float(...this.shot_cooldown_max_range, this.board.random);
                
                    // schut
                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[i].size_multiplier).rotate(this.weapon_data[i].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new PotionBottleProjectile(
                            this.board,
                            this, i, fire_pos, this.potion_impact_damage, 1,
                            new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                            random_int(6000, 10000, this.board.random), board.gravity, i, this.duration_mult,
                            this.sprite_suffix
                        ), fire_pos
                    )
                    
                    this.lose_potion(i, false);
                }
            }
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        this.smash_potion(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        this.smash_potion(with_weapon_index);
    }

    lose_potion(index, smashed) {
        this.weapon_data[index].size_multiplier = 0;
        this.weapon_regeneration_times[index] = this.max_weapon_regeneration_time * (smashed ? this.potion_smash_penalty : 1);
    
        this.weapon_data[index].hitboxes = [];

        this.potions_smashed[index] = smashed;

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    smash_potion(index) {
        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[index].size_multiplier).rotate(this.weapon_data[index].angle);
        let fire_pos = this.position.add(firing_offset);

        board.spawn_projectile(
            new PotionPuddleProjectile(
                this.board,
                this, 0, fire_pos, 1, 2, index, this.duration_mult
            ), fire_pos
        )

        this.lose_potion(index, true);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.potion_impact_damage);
    
        this.smash_potion(with_weapon_index);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = {dmg: 0, dead: false};
        if (with_projectile instanceof PotionPuddleProjectile) {
            result.mute = true;
        } else {
            result = super.hit_other_with_projectile(other, with_projectile);
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Potion impact damage: ${this.potion_impact_damage.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )

        let num = 3;
        if (this.level >= AWAKEN_LEVEL) {
            num = 4;
            write_text(
                ctx, `Gains another potion that freezes time.`, x_anchor, y_anchor + 12 + (12 * 4), this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }

        for (let i=0; i<num; i++) {
            // col if ready, grey if not - strikethrough if smashed
            let potion_exists = this.weapon_data[i].size_multiplier > 0
            let col = potion_exists ? PotionBall.potion_cols[i].css() : (this.potions_smashed[i] ? "#333" : "#666")
            write_text(
                ctx, PotionBall.potion_names[i], x_anchor,
                y_anchor + 12 + (12 * i),
                col, CANVAS_FONTS, 12
            )

            if (!potion_exists) {
                if (this.potions_smashed[i]) {
                    write_text(
                        ctx, "-".repeat(PotionBall.potion_names[i].length), x_anchor,
                        y_anchor + 12 + (12 * i),
                        col, CANVAS_FONTS, 12
                    )
                }

                // then write the respawn delay
                write_text(
                    ctx, `${this.weapon_regeneration_times[i].toFixed(1)}s`,
                    x_anchor + 128,
                    y_anchor + 12 + (12 * i),
                    "#888", CANVAS_FONTS, 12
                )
            }
        };
    }
}

class GrenadeBall extends WeaponBall {
    static ball_name = "Grenade";

    static AVAILABLE_SKINS = ["bao", "blao", "Nostalgic"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Grenade";
        this.description_brief = "Throws grenades. Grenades bounce around for up to 3 seconds before exploding. If a grenade takes damage, it will explode immediately. Explosions can trigger other grenades, and deal 70% damage to the thrower as well.";
        this.level_description = "Increases throw frequency.";
        this.max_level_description = "Increases grenades' fuse timer to 30 seconds and increases throwing frequency by an additional 1.5x.";
        this.quote = "I can't hear anything. Am I dying? Is this the end?";

        this.weapon_data = [
            new BallWeapon(1, "grenade_weapon", [
                {pos: new Vector2(28, 56), radius: 14},
            ]),
        ];

        this.grenade_sprite = "grenade";
        this.grenade_explosion_sprite = "explosion_grenade";

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.grenade_damage_base = 15;
        this.grenade_fuse = this.level >= AWAKEN_LEVEL ? 30 : 3;
        this.damage_base = 2;

        this.speed_base = 135;

        this.shot_cooldown_max = 1.58 - (0.005 * this.level);
        if (this.level >= AWAKEN_LEVEL) {
            this.shot_cooldown_max /= 1.5;
        }

        this.shot_cooldown = this.shot_cooldown_max;
        this.self_grenade_reduction = 0.7;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "blao": {
                this.weapon_data[0].sprite = "grenade_weapon_blao";
                this.grenade_sprite = "grenade_blao";
                this.grenade_explosion_sprite = "explosion_bulao_3";

                break;
            }

            case "bao": {
                this.weapon_data[0].sprite = "grenade_weapon_bao";
                this.grenade_sprite = "grenade_bao";
                this.grenade_explosion_sprite = "explosion_bao";

                break;
            }

            case "Nostalgic": {
                this.weapon_data[0].sprite = "grenade_weapon_bomb";
                this.grenade_sprite = "grenade_bomb";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            this.make_grenade(
                fire_pos,
                new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000)
            )
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let hitstop = BASE_HITSTOP_TIME;

        let dmg = with_projectile.damage;
        if (other.id == this.id && with_projectile instanceof GrenadeExplosionProjectile) {
            dmg *= this.self_grenade_reduction;
        }
        let result = other.get_hit_by_projectile(this, dmg * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        
        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;

        this.board.register_hit(this, other);
        return result;
    }

    make_grenade(position, velocity) {
        let new_ball = new GrenadeProjectileBall(
            this.board,
            this.mass * 0.4, this.radius * 0.4, this.colour, this.bounce_factor,
            this.friction_factor, this.player, this.level,
            this.grenade_damage_base, this.grenade_fuse,
            this.grenade_sprite, this.grenade_explosion_sprite
        );

        new_ball.apply_invuln(BALL_INVULN_DURATION);
        new_ball.show_stats = false;

        this.board?.spawn_ball(new_ball, position);

        new_ball.set_velocity(velocity);

        new_ball.parent = this;

        let part = new Particle(new_ball.position, 0, 1, entity_sprites.get(this.grenade_sprite), 0, 999999);
        this.board?.spawn_particle(part, new_ball.position);
        new_ball.linked_particle = part;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Strike damage: ${this.damage_base.toFixed(0)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Grenade damage: ${this.grenade_damage_base.toFixed(0)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Grenade fuse: ${this.grenade_fuse}s`, x_anchor, y_anchor + 24, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )

            write_text(
                ctx, `Grenades/s: ${(1 / this.shot_cooldown_max).toFixed(2)}`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        } else {
            write_text(
                ctx, `Grenade fuse: ${this.grenade_fuse}s`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
            )

            write_text(
                ctx, `Grenades/s: ${(1 / this.shot_cooldown_max).toFixed(2)}`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 12
            )
        }
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
        )
    }
}

class GrenadeProjectileBall extends WeaponBall {
    static ball_name = "Grenade Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, explosion_damage, fuse, sprite, explosion_sprite) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Grenade Projectile";
        this.description_brief = "Thrown from the grenade ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.weapon_data = [];

        this.lifetime = 0;
        this.max_fuse = fuse;
        this.explosion_damage = explosion_damage;

        this.hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.sprite = sprite;
        this.explosion_sprite = explosion_sprite;

        this.rotation_speed = random_float(270, 540, this.board.random);
    }

    update_particles(time_delta) {
        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    physics_step(board, time_delta) {
        super.physics_step(board, time_delta);

        if (this.hitstop > 0) {
            time_delta = time_delta * HITSTOP_DELTATIME_PENALTY;
        }

        this.update_particles(time_delta);
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.max_fuse) {
            this.hp = 0;
            this.last_damage_source = null;
        }
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.last_damage_source?.weapon_data?.forEach(w => {
            w.reverse();
        })

        let expl_position = this.position.add(new Vector2(10, -13).mul(2 * PROJ_SIZE_MULTIPLIER));

        let proj = new GrenadeExplosionProjectile(
            this.board,
            this.parent, 0, expl_position, this.parent.grenade_damage_base, 2,
            this.explosion_sprite
        )

        play_audio("explosion2");

        this.parent.board.spawn_projectile(proj, expl_position);

        return {skip_default_explosion: true};
    }
}

class GlassBall extends WeaponBall {
    static ball_name = "Glass";

    static AVAILABLE_SKINS = ["Papercut"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Glass";
        this.description_brief = "Normal strikes apply rupture but deal no damage. On hit, charges up based on the rupture on the target before the strike. At max charge, next hit consumes all charge to deal a vorpal strike with damage equal to 12x base rupture.";
        this.level_description = "Increases base rupture and makes the weapon rotate faster.";
        this.max_level_description = "Multiplies the target's rupture by 2x after each hit.";
        this.quote = "[unintelligible animalistic grunting]";

        this.weapon_data = [
            new BallWeapon(1, "glass", [
                {pos: new Vector2(76, 64), radius: 6},
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 3 + (0.025 * level);
        this.speed_base = 330 + (2.25 * level);

        this.charge = 0;
        this.charge_decay_per_sec = 0;
        this.charge_threshold = 100;

        this.vorpal_mult = 12;

        this.skin_suffix = "";
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Papercut": {
                this.weapon_data[0].sprite = "glass_paper";
                this.skin_suffix = "_paper";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.charge = Math.max(0, this.charge - (this.charge_decay_per_sec * time_delta));
        if (this.charge >= this.charge_threshold) {
            this.weapon_data[0].sprite = "glass_angry";
        } else {
            this.weapon_data[0].sprite = "glass";
        }
    
        this.weapon_data[0].sprite += this.skin_suffix;
    }

    hit_other(other, with_weapon_index) {
        let result = {};
        if (this.charge >= this.charge_threshold) {
            result = super.hit_other(other, with_weapon_index, this.damage_base * this.vorpal_mult);
            this.charge = 0;
            result.snd = "strongpunch";
        } else {
            result = super.hit_other(other, with_weapon_index, 0);
            this.charge += other.rupture_intensity * 14;
            this.apply_rupture(other, this.damage_base)

            if (this.skin_name == "Papercut") {
                result.snd = "impact_paper";
            }
        }

        if (this.level >= AWAKEN_LEVEL) {
            other.rupture_intensity *= 2;
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Rupture per hit: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Vorpal strike damage: ${(this.damage_base * this.vorpal_mult).toFixed(0)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Charge: ${this.charge.toFixed(0)}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.charge >= this.charge_threshold) {
            write_text(
                ctx, `[${"!".repeat(20)}]`, x_anchor + 96, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
            )
        } else {
            write_text(
                ctx, `[${">".repeat(Math.floor(20 * (this.charge / this.charge_threshold)))}${" ".repeat(20 - Math.floor(20 * (this.charge / this.charge_threshold)))}]`, x_anchor + 96, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
            )
        }
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Normal strikes apply rupture instead of damage.`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Multiplies rupture by 2x after each hit.`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
        }
    }
}

class HandBall extends WeaponBall {
    static emojis = {
        "hand_neutral": "✌",
        "hand_block": "✌",
        "hand_open": "✌",
        "hand_punch": "☝",
        "hand_grab": "✍",
        "hand_tired": "✶",
    };
    
    static hitboxes = {
        "hand_neutral": [
            // this is the same as parry, because the parry action turns the hand into the parry hand
            {pos: new Vector2(60, 16), radius: 6},
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
            {pos: new Vector2(24, 114), radius: 16},
        ],

        "hand_block": [
            {pos: new Vector2(60, 16), radius: 6},
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
            {pos: new Vector2(24, 114), radius: 16},
        ],

        "hand_open": [
            // shim off the top and bottom hitboxes
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
        ],

        "hand_punch": [
            {pos: new Vector2(64, 64), radius: 36},
            {pos: new Vector2(64-36, 64), radius: 18},
            {pos: new Vector2(64-36-18, 64), radius: 9},
        ],

        "hand_grab": [
            // no hitboxes because grab "cutscene"
        ],

        "hand_tired": [
            // no hitboxes because tired
        ],
    }

    static lightning_parts = (() => {
        let l = entity_sprites.get("lightning");

        return [
            l[0],
            l[1],
            l[2],

            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 

            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 

            l[4],
            l[5],
            l[6],
        ]
    })();

    static ball_name = "Hand";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hand";
        this.description_brief = "Hands move semi-randomly and independently. Hands randomly punch directly forwards. An idle hand will prepare to grab a ball if it's close, then throw it at an opposite wall at very high speed if the grab is successful.";
        this.level_description = "Speeds up punch recovery, makes hands larger and increases grab damage.";
        this.max_level_description = "Hands are now removed when they become tired (after parrying or throwing). New hands sprout every 1 second, doubled for each currently active hand.";
        this.quote = "It doesn't count as a self-insert if it's just my hands.";

        this.hand_size = 0.5 + (0.002 * this.level);

        this.weapon_data = [
            new BallWeapon(this.hand_size, "hand_neutral", [

            ]),

            new BallWeapon(this.hand_size, "hand_neutral", [

            ]),
        ];

        this.hands_speeds = [0, 0]; // X
        this.hands_speed_range = [-20, 60];
        this.hands_speed_timeouts = [0, 0]; // X
        this.hands_speed_timeout_range = [0.5, 2];
        this.hands_sprites = ["hand_neutral", "hand_neutral"]; // X
        this.punch_timeout_range = [0.6, 2];
        this.punch_timeouts = [random_float(...this.punch_timeout_range, this.board.random), random_float(...this.punch_timeout_range, this.board.random)]; // X
        this.punch_recovery = 0.4 - (this.level * 0.002);
        this.punch_active_duration = 0.1;

        this.grab_ready_distance = this.radius * 4;
        this.sqr_grab_ready_distance = this.grab_ready_distance * this.grab_ready_distance;
        this.grab_seek_speed = 18000; // unused
        this.parry_delays = [0, 0]; // X

        this.punch_damage = 8;
        this.other_damage = 0;
        this.grab_damage_initial = 2;
        this.grab_damage_impact = 14 + (this.level * 0.1);
        this.grab_info = [
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0},
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0}
        ] // X
    
        this.post_grab_cooldown = 8.5;
        this.post_block_cooldown = 2;
        this.tired_delays = [0, 0]; // X

        this.hand_sprout_timeout = 0;
        this.hand_sprout_base = 1;

        this.debug = false;
    }

    debug_log(...msg) {
        if (this.debug) {
            console.log(...msg);
        }
    }

    weapon_step(board, time_delta) {
        if (this.level >= AWAKEN_LEVEL) {
            this.hand_sprout_timeout += time_delta;
            if (this.hand_sprout_timeout >= this.hand_sprout_base * compat_pow(2, this.hands_sprites.length)) {
                this.hand_sprout_timeout = 0;
                
                this.hands_speeds.push(0);
                this.hands_speed_timeouts.push(0);
                this.hands_sprites.push("hand_neutral");
                this.punch_timeouts.push(random_float(...this.punch_timeout_range, this.board.random));
                this.parry_delays.push(0);
                this.grab_info.push({});
                this.tired_delays.push(0);

                let w = new BallWeapon(this.hand_size, "hand_neutral", []);
                this.weapon_data.push(w);
                w.rotate(random_float(0, 360, this.board.random));
                
                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();
            }
        }

        let deletion_indices = [];

        for (let i=0; i<this.weapon_data.length; i++) {
            let make_hitboxes = true;

            this.weapon_data[i].reversed = false;

            switch (this.hands_sprites[i]) {
                case "hand_neutral": {
                    let handpos = this.position.add(this.get_weapon_offset(i));
                    let balls_sqr_distances = board.balls.filter(ball => !ball.allied_with(this) && !ball.skip_physics).map(ball => ball.position.sqr_distance(handpos));
                    if (balls_sqr_distances.some(d => d <= this.sqr_grab_ready_distance)) {
                        this.hands_sprites[i] = "hand_open";
                        this.weapon_data[i].offset = new Vector2(0, 0);
                    } else {
                        this.punch_timeouts[i] -= time_delta;
                        this.weapon_data[i].offset = new Vector2(Math.min(0, -64 + (compat_pow(this.punch_timeouts[i], 2) * 256)), 0);
                        if (this.punch_timeouts[i] <= 0) {
                            this.hands_sprites[i] = "hand_punch";

                            this.weapon_data[i].offset = new Vector2(96, 0);
                            this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1.4;
                            this.punch_timeouts[i] = this.punch_recovery;
                            this.hands_speed_timeouts[i] = 0;

                            let pos = this.position.add(this.get_weapon_offset(i));
                            let particle = new Particle(
                                pos, this.weapon_data[i].angle, 1, entity_sprites.get("hand_punch_particles"), 24, 0.2, false
                            )

                            // board.spawn_particle(particle, pos);
                        } else {
                            this.weapon_data[i].rotate(this.hands_speeds[i] * time_delta, i % 2 == 1);
                            this.hands_speed_timeouts[i] -= time_delta;
                            if (this.hands_speed_timeouts[i] <= 0) {
                                this.hands_speed_timeouts[i] = random_float(...this.hands_speed_timeout_range, this.board.random);

                                this.hands_speeds[i] = random_float(...this.hands_speed_range, this.board.random) + random_float(...this.hands_speed_range, this.board.random) + random_float(...this.hands_speed_range, this.board.random);
                            }
                        }
                    }

                    break;
                }

                case "hand_open": {
                    let handpos = this.position.add(this.get_weapon_offset(i));
                    let closest = board.balls.filter(ball => !ball.allied_with(this) && !ball.skip_physics).reduce((pb, ball) => {
                        let sqr_dist = ball.position.sqr_distance(handpos);
                        if (pb) {
                            return sqr_dist < pb[1] ? [ball, sqr_dist] : pb;
                        } else {
                            return [ball, sqr_dist];
                        }
                    }, null);

                    if (closest) {
                        if (closest[1] > this.sqr_grab_ready_distance * 1.5) {
                            this.hands_sprites[i] = "hand_neutral";
                            this.weapon_data[i].offset = new Vector2(32, 0);
                        } else {
                            // quickly move hand towards it 
                            this.weapon_data[i].offset = new Vector2(32, 0);
                            
                            // let sign = Math.sign(closest[0].position.angle(this.position));

                            // this.weapon_data[i].rotate(this.grab_seek_speed * sign * time_delta * (Math.PI / 180));
                        }
                    } else {
                        this.hands_sprites[i] = "hand_neutral";
                        this.weapon_data[i].offset = new Vector2(32, 0);
                    }

                    break;
                }
                
                case "hand_punch": {
                    this.punch_timeouts[i] -= time_delta;
                    this.weapon_data[i].offset = new Vector2(Math.max(96, 96 + -8 + ((this.punch_timeouts[i] * 8) / this.punch_recovery)), 0);
                    
                    make_hitboxes = this.punch_timeouts[i] >= this.punch_recovery - this.punch_active_duration;
                    
                    if (this.punch_timeouts[i] <= 0) {
                        this.hands_sprites[i] = "hand_neutral";

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1;
                        this.punch_timeouts[i] = random_float(...this.punch_timeout_range, this.board.random);
                    }

                    break;
                }

                case "hand_block": {
                    this.parry_delays[i] -= time_delta;
                    this.weapon_data[i].offset = new Vector2(0, 0);
                    
                    if (this.parry_delays[i] <= 0) {
                        this.hands_sprites[i] = "hand_tired";
                        this.tired_delays[i] = this.post_block_cooldown;

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 0.8;
                    }

                    break;
                }

                case "hand_grab": {
                    // need to do a whole bunch of code here for the grab but for now just make sure the positions always match
                    this.grab_info[i].speed += 50 * time_delta;

                    let rot_amt = this.grab_info[i].speed * time_delta;
                    this.weapon_data[i].rotate(rad2deg(rot_amt), i % 2 == 1);
                    this.grab_info[i].rotated_so_far += rot_amt;
                    // this.debug_log(`Rotated ${rad2deg(this.grab_info[i].speed * time_delta)}deg, ${rad2deg(this.grab_info[i].amount_to_rotate - this.grab_info[i].rotated_so_far)}deg remaining`)

                    this.grab_info[i].ball.weapon_data.forEach(w => {
                        w.angle += rot_amt * (i % 2 == 0 ? 1 : -1)
                    });

                    this.grab_info[i].ball.cache_weapon_offsets();
                    this.grab_info[i].ball.cache_hitboxes_offsets();

                    if (this.grab_info[i].rotated_so_far >= (this.grab_info[i].amount_to_rotate + (Math.PI / 8))) {
                        let rollback = this.grab_info[i].rotated_so_far - this.grab_info[i].amount_to_rotate;
                        let throwball = this.grab_info[i].ball;
                        
                        this.weapon_data[i].rotate(rad2deg(rollback), i % 2 == 0);
                        throwball.weapon_data.forEach(w => {
                            w.angle += rollback * (i % 2 == 0 ? 1 : -1)
                        });

                        // throw it. for now just drop it to show we're doing something
                        this.debug_log("Thrown!");
                        this.hands_sprites[i] = "hand_tired";
                        this.tired_delays[i] = this.post_grab_cooldown;

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 0.8;

                        // We can get the wall to select by getting the current angle of the weapon
                        throwball.apply_hitstop(1);

                        let vec = new Vector2(0, 1 * (i % 2 == 0 ? 1 : -1)).rotate(this.weapon_data[i].angle);
                        let new_position = throwball.position.copy();

                        if (Math.abs(vec.x) >= 0.5) {
                            // right or left
                            if (vec.x < 0) {
                                // left
                                new_position.x = throwball.radius;
                            } else {
                                // right
                                new_position.x = this.board.size.x - throwball.radius;
                            }
                        } else {
                            // up or down
                            if (vec.y < 0) {
                                // up
                                new_position.y = throwball.radius;
                            } else {
                                // down
                                new_position.y = this.board.size.y - throwball.radius;
                            } 
                        }

                        // now make particles along the way
                        let cpos = throwball.position;
                        let stopping = 2;
                        let times = 0;
                        let size_factor = throwball.radius / this.radius;
                        let delay = 0.02 * size_factor;
                        while (stopping > 0) {
                            if (!board.in_bounds(cpos)) {
                                stopping--;
                            }

                            let part = new Particle(
                                cpos, this.weapon_data[i].angle + ((i % 2 == 0 ? 1 : -1) * Math.PI/2),
                                size_factor, HandBall.lightning_parts, 4 / delay, 
                                999, false, 0 + (times * delay)
                            );

                            board.spawn_particle(part, cpos);
                            
                            times++;
                            cpos = cpos.add(vec.mul(128 * size_factor * PARTICLE_SIZE_MULTIPLIER));
                        }

                        throwball.display = false;
                        this.debug_log(`${throwball.id} phasing out`);

                        let timer = new Timer(
                            board => {
                                this.debug_log(`${throwball.id} phasing back in`);
                                throwball.skip_physics = false;
                                throwball.display = true;

                                throwball.set_pos(new_position);
                                throwball.lose_hp(this.grab_damage_impact, this);

                                play_audio("wall_smash");

                                let pos = throwball.position.sub(
                                    vec.mul(size_factor * 2 * throwball.radius)
                                )

                                let part = new Particle(
                                    pos, vec.angle() - (Math.PI /2),
                                    size_factor * 2, entity_sprites.get("explosion3"), 12, 
                                    999
                                );

                                board.spawn_particle(part, pos);
                            }, delay * (times-1)
                        );

                        board.set_timer(timer);

                        this.debug_log(`${throwball.id} set timer ID ${timer.id} for ${delay * (times-1)} to phase back in`);

                        throwball.display = false;

                        this.set_velocity((this.position.sub(new_position).normalize()).mul(this.grab_info[i].stored_velocity.magnitude()));
                    } else {
                        let ballpos = this.position.add(this.get_weapon_offset(i));
                        this.grab_info[i].ball.set_pos(ballpos);
                        this.set_velocity(new Vector2(0, 0));

                        // special case for balls with particles
                        if (this.grab_info[i].ball.update_particles) {
                            this.grab_info[i].ball.update_particles(time_delta);
                        }
                    }

                    break;
                }

                case "hand_tired": {
                    if (this.level >= AWAKEN_LEVEL) {
                        // delete it and make sure to splice out of all relevant containers
                        // wow this sounds like i should have linked them all together into an object
                        // instead of keeping track of 7 arrays...... oh well!!!
                        deletion_indices.push(i);
                    } else {
                        this.tired_delays[i] -= time_delta;
                        this.weapon_data[i].offset = new Vector2(0, 0);
                        
                        if (this.tired_delays[i] <= 0) {
                            this.hands_sprites[i] = "hand_neutral";

                            this.weapon_data[i].offset = new Vector2(0, 0);
                            this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER;
                        } else {
                            // hands drift downwards
                            let angle_rotated = positive_mod(this.weapon_data[i].angle - (Math.PI / 2), Math.PI * 2);
                            let side = seeded_random_from_array([-1, 1], this.board.random);
                            if (angle_rotated > Math.PI) {
                                side = 1;
                            } else if (angle_rotated < Math.PI) {
                                side = -1;
                            }

                            this.weapon_data[i].rotate(side * time_delta * 25);
                        }
                    }

                    break;
                }
            }

            if (make_hitboxes) {
                this.weapon_data[i].hitboxes = HandBall.hitboxes[this.hands_sprites[i]];
            } else {
                this.weapon_data[i].hitboxes = [];
            }

            this.weapon_data[i].sprite = this.hands_sprites[i] + (i % 2 == 0 ? "" : "_r");
        }


        for (let d_i=0; d_i<deletion_indices.length; d_i++) {
            let i = deletion_indices[d_i];

            let offset = this.get_weapon_offset(i).mul(2);
            let pos = this.position.add(offset);
            let part = new Particle(
                pos, this.weapon_data[i].angle + (Math.PI / 2), 1,
                entity_sprites.get("explosion3"),
                12, 999
            );

            board.spawn_particle(part, pos);

            this.hands_speeds.splice(i, 1);
            this.hands_speed_timeouts.splice(i, 1);
            this.hands_sprites.splice(i, 1);
            this.punch_timeouts.splice(i, 1);
            this.parry_delays.splice(i, 1);
            this.grab_info.splice(i, 1);
            this.tired_delays.splice(i, 1);

            this.weapon_data.splice(i, 1);

            deletion_indices = deletion_indices.map(d => {
                if (d > i) {
                    return d-1;
                }

                return d;
            })
        };
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        this.block_hand(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        this.block_hand(with_weapon_index);
    }

    block_hand(with_weapon_index) {
        this.hands_sprites[with_weapon_index] = "hand_block";
        this.weapon_data[with_weapon_index].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1;
        this.parry_delays[with_weapon_index] = 0.5;
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        if (this.hands_sprites[with_weapon_index] == "hand_punch" || this.hands_sprites[with_weapon_index] == "hand_block") {
            let dmg = this.punch_damage;
            if (this.hands_sprites[with_weapon_index] != "hand_punch") {
                dmg = 0;
            }
            
            result = super.hit_other(other, with_weapon_index, dmg);

            let diff_vec = other.position.sub(this.position).normalize();
            let share = 1;

            let other_diff_add = diff_vec.mul(share);

            let other_mag = other.velocity.magnitude();

            let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

            other.set_velocity(new_other_velocity);

            other.apply_invuln(BALL_INVULN_DURATION * 2);
        } else if (this.hands_sprites[with_weapon_index] == "hand_open") {
            // GRAB!!!!!!!
            result = super.hit_other(other, with_weapon_index, this.grab_damage_initial);
            this.grab_ball(with_weapon_index, other);
        } else {
            result = super.hit_other(other, with_weapon_index, 0);
        }

        return result;
    }

    grab_ball(with_weapon_index, ball) {
        play_audio("grab");

        this.hands_sprites[with_weapon_index] = "hand_grab";
        this.weapon_data[with_weapon_index].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 2;

        this.grab_info[with_weapon_index].ball = ball;
        ball.skip_physics = true;
        
        // find the target angle by looking at the situations on all four directions.
        // remember we're checking the ball's position, not our own
        let expected_grab_ball_offset = this.get_weapon_offset(with_weapon_index);

        // rotate to 180deg and 270deg, and check distance from the board side bounds.
        // so for facing to the right, check up/down and that the ball would be in bounds
        // we always want to rotate at least 180deg, so start from the first cardinal angle >= 180deg
        let rotation_sign = with_weapon_index % 2 == 0 ? 1 : -1;

        let check_angle_begin = this.weapon_data[with_weapon_index].angle;
        let check_angle_diff = (Math.PI * (7/2) * rotation_sign) + (Math.sign(check_angle_begin) * ((Math.PI / 2) - (Math.abs(check_angle_begin) % (Math.PI / 2))));  // amount to rotate to get to the next cardinal angle
        let check_next = check_angle_diff;
        this.debug_log("its grab time bitch");
        this.debug_log(`Weapon index: ${with_weapon_index} (* ${rotation_sign})`);
        this.debug_log(`Weapon angle is ${rad2deg(this.weapon_data[with_weapon_index].angle)}deg`);
        this.debug_log(`Started at ${rad2deg(check_angle_begin)}deg`);
        this.debug_log(`Beginning checks at ${rad2deg(check_next)}deg`);
        this.debug_log(`So first composite rotation is ${rad2deg(check_angle_begin + check_next)}`);

        // TODO this still doesn't work right.
        // TODO the rest of the throw logic
        // TODO make the balls intangible while theyre doing this,
        // and make sure weapons don't do anything during this

        let angle_rotated = Math.abs(check_angle_diff);

        let possible_rotations = [];

        while (possible_rotations.length < 4) {
            if (check_next % (Math.PI * 2) == 0) {
                // skip if it's 360deg
            } else {
                let ball_rotated = this.position.add(expected_grab_ball_offset.rotate(check_next));

                let rotation_mod = (check_angle_begin + check_next) % Math.PI;
                // if closer to PI/2, it's y. if closer to 0, it's x.
                // 0 - 90 - 180
                // ABS to get 90 - 0 - 90
                let rotation_abs = Math.abs(rotation_mod - (Math.PI / 4));

                let significant_coordinate = rotation_abs <= Math.PI / 4 ? ball_rotated.x : ball_rotated.y;

                // check that the position +- radius is < / > the bound
                let lower_bound = significant_coordinate - ball.radius;
                let upper_bound = significant_coordinate + ball.radius;

                if (lower_bound >= 0) {
                    if (upper_bound < this.board.size.x) {
                        // we found it!
                        this.debug_log(`Found! Adding rotation ${rad2deg(angle_rotated)}deg`)
                        possible_rotations.push([check_next, angle_rotated]);
                    }
                }
            }

            angle_rotated += (Math.PI / 2);
            check_next += rotation_sign * (Math.PI / 2);
        }

        this.debug_log("Got two rotations.");
        let best = [null, -9999];
        possible_rotations.forEach(r => {
            let vec = new Vector2(0, 1 * rotation_sign).rotate(r[0] + check_angle_begin);
            let coord = 0;
            let target = 0;

            let score_bias = 1; 
            // a hand rotating clockwise wants to throw right or down
            // a hand rotating anticlockwise wants to throw left or up

            if (Math.abs(vec.x) >= 0.5) {
                // right or left
                coord = this.position.x;
                if (vec.x < 0) {
                    // left
                    target = 0;
                    if (with_weapon_index % 2 == 0) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // right
                    target = this.board.size.x;
                    if (with_weapon_index % 2 == 1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                }
            } else {
                coord = this.position.y;
                // up or down
                if (vec.y < 0) {
                    // up
                    target = 0;
                    if (with_weapon_index % 2 == 0) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // down
                    target = this.board.size.y;
                    if (with_weapon_index % 2 == 1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                }
            }

            let result = Math.abs(target - coord) * score_bias;
            this.debug_log(`${rad2deg(r[1])} (${rad2deg((r[1] * rotation_sign) + check_angle_begin) % 360}, ${vec.toString()}) has result ${result} (${coord} <=> ${target})`)
            // we want as much distance as possible
            if (result-50 > best[1]) {
                best = [r, result];
            }
        })

        this.debug_log(`Got our best rotation - ${rad2deg(best[0][1])}`);
        this.debug_log(`So will rotate from ${rad2deg(check_angle_begin)}deg to ${rad2deg(check_angle_begin + (best[0][1] * rotation_sign))}`);

        this.grab_info[with_weapon_index].amount_to_rotate = best[0][1];
        this.grab_info[with_weapon_index].rotated_so_far = 0;
        this.grab_info[with_weapon_index].speed = 0;
        this.grab_info[with_weapon_index].stored_velocity = this.velocity;
    }

    die() {
        let result = super.die();

        // free all thrown balls
        this.grab_info.forEach(g => {
            if (g && g.ball) {
                g.ball.display = true;
                g.ball.skip_physics = false;
            }
        })

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `The hand.   `, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        this.hands_sprites.forEach((s, i) => {
            write_text(
                ctx, HandBall.emojis[s], (12 * 6) + (i * 12) + x_anchor, y_anchor, s == "hand_tired" ? "gray" : this.colour.css(), CANVAS_FONTS, 12
            )
        })

        write_text(
            ctx, `Punch damage: ${this.punch_damage.toFixed(2)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Grab damage: ${this.grab_damage_initial.toFixed(2)} + ${this.grab_damage_impact.toFixed(2)}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Hands: ${this.hands_sprites.length}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
            let timeout = (this.hand_sprout_base * compat_pow(2, this.hands_sprites.length));
            let timeleft = (this.hand_sprout_base * compat_pow(2, this.hands_sprites.length)) - this.hand_sprout_timeout
            write_text(
                ctx, `Time until next hand: ${timeleft.toFixed(1)}s / ${timeout.toFixed(1)}s`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
            let bar_l = 32;
            let prop = timeleft / timeout;
            let empties = Math.max(0, Math.min(bar_l, Math.ceil(prop * bar_l)));
            write_text(
                ctx, `[${"#".repeat(bar_l - empties)}${" ".repeat(empties)}]`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
        } else {
            write_text(
                ctx, `Parry tiredness duration: ${this.post_block_cooldown.toFixed(2)}s`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
            )
            write_text(
                ctx, `Throw tiredness duration: ${this.post_grab_cooldown.toFixed(2)}s`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 12
            )
        }
    }
}

class ChakramBall extends WeaponBall {
    static ball_name = "Chakram";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Chakram";
        this.description_brief = "Throws a large chakram that orbits around self before returning.";
        this.level_description = "Increases the time for which the chakram remains in orbit and the damage it deals while thrown.";
        this.max_level_description = "The chakram now also applies rupture equal to damage.";
        this.quote = "它叫手里剑我一直在说";

        this.weapon_data = [];
        this.reset_weapons();

        // weapon is rotated -45deg

        this.damage_base = 2;

        this.chakram_damage_base = 6 + (0.025 * level);
        this.chakram_rotation_speed = Math.PI * 4;
        this.chakram_orbit_time = 3.75 + (0.025 * level);
        this.chakram_min_dist = this.radius * 0.75;
        this.chakram_max_dist = this.radius * 4;

        this.speed_base = 75;
        this.speed_current = this.speed_base;
        this.windup_speed_mod = 900;

        this.throw_cooldown_max = [5, 9];
        this.throw_cooldown = random_float(...this.throw_cooldown_max, this.board.random);

        this.throw_windup_max = 1.5;
        this.throw_windup = this.throw_windup_max;

        this.mode = "idle";
        this.weapon_reversed = false;
    }

    reset_weapons() {
        this.weapon_data = [
            new BallWeapon(1, "chakram_weapon", [
                // {pos: new Vector2(52, 64), radius: 18},

                // {pos: new Vector2(52-16, 64-16), radius: 10},
                // {pos: new Vector2(52-24, 64-24), radius: 6},
                // {pos: new Vector2(52-36, 64-20), radius: 6},

                {pos: new Vector2(52+16, 64+16), radius: 10},
                {pos: new Vector2(52+24, 64+24), radius: 6},
                {pos: new Vector2(52+36, 64+20), radius: 6},

                {pos: new Vector2(52+16, 64-16), radius: 10},
                {pos: new Vector2(52+16, 64-28), radius: 6},
                {pos: new Vector2(52+10, 64-40), radius: 6},

                // {pos: new Vector2(52-16, 64+16), radius: 10},
                {pos: new Vector2(52-16, 64+28), radius: 6},
                {pos: new Vector2(52-10, 64+40), radius: 6},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-48, 0);
        this.weapon_data[0].reversed = this.weapon_reversed;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        if (this.mode != "thrown") {
            this.rotate_weapon(0, this.speed_current * time_delta);

            if (this.mode == "idle") {
                if (this.speed_current > this.speed_base) {
                    this.speed_current = Math.max(this.speed_base, this.speed_current - (this.windup_speed_mod * 0.5 * time_delta));
                }

                this.throw_cooldown -= time_delta;
                if (this.throw_cooldown <= 0) {
                    this.throw_cooldown = random_float(...this.throw_cooldown_max, this.board.random);
                    this.throw_windup = this.throw_windup_max;
                    this.mode = "windup";
                    this.weapon_data[0].reverse();
                    this.speed_current = -this.speed_base;
                }
            } else if (this.mode == "windup") {
                this.throw_windup -= time_delta;
                this.speed_current += this.windup_speed_mod * time_delta;
                if (this.throw_windup <= 0) {
                    // throw projectile
                    let pos = this.position.add(this.get_weapon_offset(0));
                    let proj = new ChakramProjectile(
                        this.board,
                        this, 0, pos, this.chakram_damage_base,
                        1, this.weapon_data[0].angle, this.chakram_rotation_speed * (this.reversed ^ this.weapon_data[0].reversed ? -1 : 1),
                        this.chakram_orbit_time, this.chakram_min_dist, this.chakram_max_dist
                    );

                    board.spawn_projectile(proj, pos);
                    
                    this.mode = "thrown";
                    
                    this.weapon_reversed = this.weapon_data[0].reversed;
                    this.weapon_data = [];
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        // console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let dmg = with_projectile.damage * (this.player?.stats?.damage_bonus ?? 1);
        let result = other.get_hit_by_projectile(this, dmg, hitstop);
        
        if (this.level >= AWAKEN_LEVEL) {
            this.apply_rupture(other, dmg, "");
        }

        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;

        this.board.register_hit(this, other);
        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Chakram impact damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Chakram thrown damage: ${this.chakram_damage_base.toFixed(2)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Chakram orbit duration: ${this.chakram_orbit_time.toFixed(3)}s`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Chakram rupture on hit: ${this.chakram_damage_base.toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
        }
    }
}

class WandBall extends WeaponBall {
    static ball_name = "Wand";

    static AVAILABLE_SKINS = ["Whimsy"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Wand";
        this.description_brief = "Has a wand that uses one of 5 random spells each time it activates - a spread of icicles, a fireball, a salvo of bouncing poison barbs, chaining lightning or, rarely, a terrifying, dense black ball.";
        this.level_description = "Reduces the delay between spell casts.";
        this.max_level_description = "Upgrades each spell - more icicles, larger fireball, barbs hit up to twice, more lightning chains, more damaging black ball.";
        this.quote = "Chat did you see that guy lmao what a loser";

        this.weapon_data = [
            new BallWeapon(1, "wand_white", [
                {pos: new Vector2(86, 64), radius: 12},
                
                {pos: new Vector2(68, 64), radius: 6},
                {pos: new Vector2(56, 64), radius: 6},
                {pos: new Vector2(44, 64), radius: 6},
                {pos: new Vector2(32, 64), radius: 6},
            ])
        ];
        this.weapon_data[0].offset = new Vector2(-24, 0);

        this.damage_base = 1;
        this.speed_base = 180;

        this.cast_delay_max = [1.6 - (this.level * 0.011), 3.2 - (this.level * 0.022)];
        this.cast_delay = random_float(...this.cast_delay_max, this.board.random);

        this.cast_flash_timeout = 0;

        this.spell_chances = balance_weighted_array([
            [0.1, "black"],
            [1, "cyan"],
            [1, "green"],
            [1, "magenta"],
            [1, "red"],
        ]);
        this.current_spell = null;
        if (this.board)
            this.pick_next_spell();

        this.icicle_damage = 5;
        this.additional_icicle_count = 2;  // 2 on each side plus the main one so 5 total
        this.icicle_velocity = 10000;
        this.icicle_velocity_per_additional = -1000;
        this.icicle_angle_per_additional = deg2rad(7.5);
        this.icicle_delay_per_additional = 0.05;

        this.fireball_damage = 12;
        this.fireball_size_mult = 1;
        this.fireball_velocity = 4000;

        this.poison_barb_count = 3;
        this.poison_barb_intensity = 1;
        this.poison_barb_hp = 1;
        this.poison_barb_duration = 4;
        this.poison_barb_velocity = 2500;
        
        this.chain_lightning_chain_chance = 0.15;
        this.chain_lightning_damage = 4;
        this.chain_lightning_distance = 1000;
        this.chain_lightning_spread = deg2rad(45);
        this.chain_lightning_delay_per_chain = 0.015;

        this.black_ball_damage = 8;
        this.black_ball_duration = 16;
        this.black_ball_velocity = 15000;

        if (this.level >= AWAKEN_LEVEL) {
            this.additional_icicle_count = 4;
            this.fireball_size_mult = 1.5;
            this.poison_barb_hp = 2;
            this.chain_lightning_chain_chance = 0.3;
            this.black_ball_damage = 12;
        }

        this.sprite_suffix = "";
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Whimsy": {
                this.weapon_data[0].sprite = "wand_black_whimsy";
                this.sprite_suffix = "_whimsy";

                break;
            }
        }
    }

    pick_next_spell() {
        let last_spell = this.current_spell;
        while (this.current_spell == last_spell) {
            this.current_spell = weighted_seeded_random_from_arr(this.spell_chances, this.board.random)[1];
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        if (this.cast_flash_timeout >= 0) {
            this.weapon_data[0].sprite = "wand_white";
        } else {
            this.weapon_data[0].sprite = `wand_${this.current_spell}`;
        }

        this.weapon_data[0].sprite += this.sprite_suffix;

        this.cast_flash_timeout -= time_delta;
        this.cast_delay -= time_delta;
        if (this.cast_delay <= 0) {
            // time to cast!
            this.cast_delay = random_float(...this.cast_delay_max, this.board.random);
            this.cast_flash_timeout = 0.5;

            let position = this.position.add(this.get_weapon_offset(0).mul(1.5));
            switch (this.current_spell) {
                case "black": {
                    let velocity = new Vector2(this.black_ball_velocity, 0).rotate(this.weapon_data[0].angle)
                    let new_ball = new WandBlackBall(
                        this.board,
                        this.mass * 1, this.radius * 0.75, this.colour,
                        this.bounce_factor, this.friction_factor,
                        this.player, this.level,
                        this.black_ball_damage, this.black_ball_duration
                    )

                    new_ball.apply_invuln(BALL_INVULN_DURATION);
                    new_ball.show_stats = false;

                    new_ball.set_velocity(velocity);
                    new_ball.parent = this;

                    let part = new Particle(new_ball.position, 0, 1, entity_sprites.get("super_orb"), 0, 999999);
                    board.spawn_particle(part, new_ball.position);
                    new_ball.linked_particle = part;
                    
                    board.spawn_ball(new_ball, position);
                    break;
                }

                case "cyan": {
                    // icicles
                    let initial_vector = new Vector2(1, 0).rotate(this.weapon_data[0].angle);

                    let proj = new WandIcicleProjectile(
                        this.board,
                        this, 0, position, this.icicle_damage, 1,
                        initial_vector, this.icicle_velocity, new Vector2(0, 0)
                    )
                    board.spawn_projectile(proj, position);

                    for (let i=0; i<this.additional_icicle_count; i++) {
                        board.set_timer(new Timer(() => {
                            let _position = this.position.add(this.get_weapon_offset(0).mul(1.5));

                            [1, -1].forEach(sign => {
                                let angle_mod = this.icicle_angle_per_additional * (i+1) * sign;
                                
                                let new_vector = initial_vector.rotate(angle_mod);

                                let proj = new WandIcicleProjectile(
                                    this.board,
                                    this, 0, _position, this.icicle_damage, 1,
                                    new_vector, this.icicle_velocity + ((i+1) * this.icicle_velocity_per_additional), new Vector2(0, 0)
                                )
                                board.spawn_projectile(proj, _position);
                            })
                        }, this.icicle_delay_per_additional * (i+1)))
                    }

                    break;
                }

                case "green": {
                    for (let i=0; i<this.poison_barb_count; i++) {
                        let velocity = new Vector2(this.poison_barb_velocity * random_float(0.5, 2, this.board.random), 0).rotate(this.weapon_data[0].angle)
                        let new_ball = new WandGreenBall(
                            this.board,
                            this.mass * 0.1, this.radius * 0.15, this.colour,
                            this.bounce_factor, this.friction_factor,
                            this.player, this.level,
                            this.poison_barb_duration, this.poison_barb_intensity
                        )

                        new_ball.hp = this.poison_barb_hp;

                        new_ball.apply_invuln(BALL_INVULN_DURATION);
                        new_ball.show_stats = false;

                        new_ball.set_velocity(velocity);
                        new_ball.parent = this;

                        let part = new Particle(new_ball.position, 0, 1, entity_sprites.get("wand_poison_barb"), 0, 999999);
                        board.spawn_particle(part, new_ball.position);
                        new_ball.linked_particle = part;
                        
                        board.spawn_ball(new_ball, position);
                    }
                    break;
                }

                case "magenta": {
                    let lightnings = [[position, this.weapon_data[0].angle]];

                    let loops = 0;
                    while (lightnings.length > 0) {
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
                                    let proj = new WandMagentaProjectile(
                                        this.board,
                                        this, 0, pos, this.chain_lightning_damage, newpos
                                    );

                                    board.spawn_projectile(proj, pos);
                                }, this.chain_lightning_delay_per_chain * loops);

                                board.set_timer(timer);

                                new_lightnings.push([newpos, new_angle]);
                            }
                        })

                        loops++;
                        lightnings = new_lightnings;
                    }

                    break;
                }

                case "red": {
                    let initial_vector = new Vector2(1, 0).rotate(this.weapon_data[0].angle);

                    let proj = new WandFireballProjectile(
                        this.board,
                        this, 0, position, this.fireball_damage, this.fireball_size_mult,
                        initial_vector, this.fireball_velocity, new Vector2(0, 0)
                    )

                    proj.board = board;

                    board.spawn_projectile(proj, position);

                    break;
                }
            }

            this.pick_next_spell();
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx,
            `${this.current_spell == "cyan" ? " - " : ""}Icicle: ${this.icicle_damage.toFixed(2)}dmg, ${1 + (this.additional_icicle_count * 2)} icicles`,
            x_anchor, y_anchor,
            this.current_spell == "cyan" ? "cyan" : "grey", CANVAS_FONTS, 12
        )

        write_text(
            ctx,
            `${this.current_spell == "red" ? " - " : ""}Fireball: ${this.fireball_damage.toFixed(2)}dmg (hit + explosion), ${this.fireball_size_mult}x size`,
            x_anchor, y_anchor + 12,
            this.current_spell == "red" ? "red" : "grey", CANVAS_FONTS, 10
        )

        write_text(
            ctx,
            `${this.current_spell == "green" ? " - " : ""}Poison: ${this.poison_barb_count} barbs, ${this.poison_barb_intensity} poison for ${this.poison_barb_duration}s, ${this.poison_barb_hp} hit(s)`,
            x_anchor, y_anchor + 24,
            this.current_spell == "green" ? "green" : "grey", CANVAS_FONTS, 10
        )

        write_text(
            ctx,
            `${this.current_spell == "magenta" ? " - " : ""}Lightning: ${this.chain_lightning_damage.toFixed(2)}dmg, ${(this.chain_lightning_chain_chance * 100).toFixed(0)}% chain chance`,
            x_anchor, y_anchor + 36,
            this.current_spell == "magenta" ? "magenta" : "grey", CANVAS_FONTS, 12
        )

        write_text(
            ctx,
            `${this.current_spell == "black" ? " - " : ""}Ball: ${this.black_ball_damage.toFixed(2)}dmg, ${this.black_ball_duration}s duration`,
            x_anchor, y_anchor + 48,
            this.current_spell == "white" ? "white" : "grey", CANVAS_FONTS, 12
        )

        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `More icicles, larger fireball, barbs hit twice,`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
            write_text(
                ctx, `more lightning chains, more damaging black ball.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 10
            )
        }
    }
}

class WandBlackBall extends WeaponBall {
    static ball_name = "Wand Black Ball Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, hit_damage, duration) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Wand Black Ball Projectile";
        this.description_brief = "Fired from the wand ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.weapon_data = [
            new BallWeapon(1, "super_orb", [
                {pos: new Vector2(64, 64), radius: 26},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-72, 0);

        this.lifetime = 0;
        this.duration = duration;
        this.hit_damage = hit_damage;

        this.hp = 100000;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = 0;
    }

    update_particles(time_delta) {
        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    physics_step(board, time_delta) {
        super.physics_step(board, time_delta);

        if (this.hitstop > 0) {
            time_delta = time_delta * HITSTOP_DELTATIME_PENALTY;
        }

        this.update_particles(time_delta);
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = this.hit_damage;

        let result = super.hit_other(other, with_weapon_index, dmg);

        let diff_vec = other.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = other.velocity.magnitude();

        let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

        other.set_velocity(new_other_velocity);

        other.apply_invuln(BALL_INVULN_DURATION * 2);

        return result;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.75, entity_sprites.get("explosion_small"), 12, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class WandGreenBall extends WeaponBall {
    static ball_name = "Wand Green Ball Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, poison_duration, poison_intensity) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Wand Green Ball Projectile";
        this.description_brief = "Fired from the wand ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.weapon_data = [
            new BallWeapon(1, "wand_poison_barb", [
                {pos: new Vector2(64, 64), radius: 12},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-52.5, 0);

        this.lifetime = 0;
        this.duration = Number.POSITIVE_INFINITY;
        
        this.damage_poison_duration = poison_duration;
        this.damage_poison_intensity = poison_intensity;

        this.hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = random_float(0, 0);
    }

    update_particles(time_delta) {
        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    physics_step(board, time_delta) {
        super.physics_step(board, time_delta);

        if (this.hitstop > 0) {
            time_delta = time_delta * HITSTOP_DELTATIME_PENALTY;
        }

        this.update_particles(time_delta);
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally poison
        let dmg = 0;

        let result = super.hit_other(other, with_weapon_index, dmg);

        this.parent.apply_poison(
            other,
            this.damage_poison_intensity,
            this.damage_poison_duration
        )

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

class AxeBall extends WeaponBall {
    static ball_name = "Axe";

    static AVAILABLE_SKINS = ["Reaper"];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Axe";
        this.description_brief = "Doesn't ever reverse weapon direction. Periodically lunges, swinging the axe. Attacks deal bonus damage based on rotation speed.";
        this.level_description = "Reduces lunge cooldown and increases base rotation speed.";
        this.max_level_description = "The axe also launches a damaging, piercing shockwave when swinging.";
        this.quote = "Did you get that on camera?!\nI gotta put this match in my highlight reel!";

        this.weapon_data = [
            new BallWeapon(1, "axe", [
                {pos: new Vector2(68, 50), radius: 18},
                {pos: new Vector2(68, 72), radius: 18},
                {pos: new Vector2(50, 60), radius: 6},
                {pos: new Vector2(44, 60), radius: 6},
                {pos: new Vector2(38, 60), radius: 6},
                {pos: new Vector2(32, 60), radius: 6},
                {pos: new Vector2(26, 60), radius: 6},
                {pos: new Vector2(20, 60), radius: 6},
            ])
        ];

        this.damage_base = -1.78;
        this.damage_per_speed = 16 / 360;
        this.damage = 1;

        this.speed_base = 100 + (1 * level);
        this.speed_cur = this.speed_base;

        this.lunge_cooldowns_max = [2 - (0.01 * level), 4 - (0.02 * level)];
        this.lunge_cooldown = random_float(...this.lunge_cooldowns_max, this.board.random);
        this.last_lunge_cooldown = this.lunge_cooldown;

        this.lunge_velocity_share = 1;

        this.lunge_swing_accel_amt = deg2rad(360 * 480);
        this.lunge_swing_accel_dur = 0.3;
        this.lunge_swing_cur = null;

        this.lunge_swing_delay_max = 0.2;
        this.lunge_swing_delay = null;

        this.speed_friction = deg2rad(360 * 180);

        this.projectile_delay_max = 0.25;
        this.projectile_delay = null;
        this.projectile_damage = 8;
        this.projectile_speed = 9000;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Reaper": {
                this.weapon_data[0].sprite = "axe_scythe";
                // TODO this should have a ghost afterimage

                break;
            }
        }
    }

    lunge_movement() {
        let new_angle = this.weapon_data[0].angle - deg2rad(200);
        let diff_vec = new Vector2(1, 0).rotate(new_angle);
        let share = this.lunge_velocity_share;

        let diff_add = diff_vec.mul(share);

        let this_mag = this.velocity.magnitude();

        let new_this_velocity = this.velocity.div(this_mag).mul(1 - share).add(diff_add).normalize().mul(this_mag)

        this.set_velocity(new_this_velocity);

        let particle = new Particle(this.position, new_angle, 1.5, entity_sprites.get("hand_punch_particles"), 16, 0.4, false);
        this.board.spawn_particle(particle, this.position);
    }

    weapon_step(board, time_delta) {
        this.reversed = false;
        this.weapon_data[0].reversed = false;

        // rotate the weapon
        this.lunge_cooldown -= time_delta;
        if (this.lunge_cooldown <= 0) {
            this.lunge_cooldown = random_float(...this.lunge_cooldowns_max, this.board.random);
            this.last_lunge_cooldown = this.lunge_cooldown;

            this.lunge_swing_delay = this.lunge_swing_delay_max;
            this.lunge_movement();

            if (this.level >= AWAKEN_LEVEL) {
                this.projectile_delay = this.projectile_delay_max;
            }
        }

        if (this.lunge_swing_delay !== null) {
            this.lunge_swing_delay -= time_delta;
            if (this.lunge_swing_delay <= 0) {
                this.lunge_swing_delay = null;

                this.lunge_swing_cur = this.lunge_swing_accel_dur;
            }
        }

        if (this.lunge_swing_cur !== null) {
            this.speed_cur += this.lunge_swing_accel_amt * time_delta;

            if (this.projectile_delay !== null) {
                this.projectile_delay -= time_delta;
                if (this.projectile_delay <= 0) {
                    this.projectile_delay = null;

                    let pos = this.position.add(this.get_weapon_offset(0));

                    let projectile = new AxeAwakenProjectile(
                        this.board, this, 0, pos,
                        this.projectile_damage, 1.5,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle),
                        this.projectile_speed
                    );

                    this.board.spawn_projectile(projectile, pos);
                }
            }

            this.lunge_swing_cur -= time_delta;
            if (this.lunge_swing_cur <= 0) {
                this.lunge_swing_cur = null;
            }
        }

        this.speed_cur = Math.max(this.speed_base, this.speed_cur - this.speed_friction * time_delta);

        this.rotate_weapon(0, this.speed_cur * time_delta);
        this.damage = this.damage_base + (this.damage_per_speed * this.speed_cur);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_cur.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Lunge cooldown: ${this.lunge_cooldown.toFixed(1)}s [${"#".repeat((this.lunge_cooldown / this.last_lunge_cooldown) * 12).padEnd(12)}]`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Projectile damage: ${this.projectile_damage.toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class ShotgunBall extends WeaponBall {
    static ball_name = "Shotgun";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Shotgun";
        this.description_brief = "Shoots a shotgun that fires high-spread bullets which cannot be parried.";
        this.level_description = "Increases bullet damage.";
        this.max_level_description = "Shoots twice as many bullets.";
        this.quote = "...Target eliminated.";

        this.weapon_data = [
            new BallWeapon(1, "shotgun", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(48, 64), radius: 12},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(90, -12),
        ]

        this.proj_damage_base = 3 + (this.level * 0.03);
        this.speed_base = 80;

        this.shot_cooldown_max = 0.8;
        this.shot_cooldown = this.shot_cooldown_max;

        this.num_bullets = 8;
        if (this.level >= AWAKEN_LEVEL) {
            this.num_bullets *= 2;
        }

        this.width_range = [12, 20];

        this.bullet_spread = deg2rad(22.5);
    }

    recoil_movement() {
        let new_angle = this.weapon_data[0].angle;
        let diff_vec = new Vector2(-1, 0).rotate(new_angle);
        let share = 0.25;

        let diff_add = diff_vec.mul(share);

        let this_mag = this.velocity.magnitude();

        let new_this_velocity = this.velocity.div(this_mag).mul(1 - share).add(diff_add).normalize().mul(this_mag)

        this.set_velocity(new_this_velocity);
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            for (let i=0; i<this.num_bullets; i++) {
                let shot_angle = this.weapon_data[0].angle + random_float(
                    -this.bullet_spread, this.bullet_spread, this.board.random
                );

                let col = Colour.yellow.lerp(Colour.orange, random_float(0, 1, this.board.random));
                let width = random_float(...this.width_range, this.board.random);

                board.spawn_projectile(
                    new ShotgunProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base,
                        new Vector2(1, 0).rotate(shot_angle).mul(10000).add(fire_pos),
                        width, col
                    ), fire_pos
                )

                this.recoil_movement();
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Bullet damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Bullet count: ${this.num_bullets}`, x_anchor, y_anchor + 24, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        } else {
            write_text(
                ctx, `Bullet count: ${this.num_bullets}`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
            )
        }
    }
}

class SpearBall extends WeaponBall {
    static ball_name = "Spear";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Spear";
        this.description_brief = "Throws spears which replenish over time. Successful strikes replenish a spear immediately.";
        this.level_description = "Reduces throw delay and increases replenishment speed.";
        this.max_level_description = "If throwing the last spear, replenish another spear immediately. Whenever a spear is replenished, replenish two instead.";
        this.quote = "I knew you could do it, little spear!\nI'm gonna put you in a display case so all the others can learn from you!";

        this.weapon_data = [
            
        ];

        this.firing_offset = Vector2.zero;

        this.damage_base = 5;
        this.proj_damage_base = 10;
        this.speed_range = [100, 160];
        
        this.weapon_stats = [];

        this.spear_replenish_delay_max = 1.45 - (this.level * 0.004);
        this.spear_replenish_delay = this.spear_replenish_delay_max;

        this.spear_projectile_speed_range = [10000, 13000];

        this.throw_delay_range = [0.5 - (this.level * 0.002), 2 - (this.level * 0.008)];
    
        this.replenish_spear();
    }

    replenish_spear() {
        let times = 1;
        if (this.level >= AWAKEN_LEVEL) {
            times++;
        }

        for (let i=0; i<times; i++) {
            this.weapon_data.push(new BallWeapon(1, "spear", [
                {pos: new Vector2(108, 64), radius: 4},
                {pos: new Vector2(96, 64), radius: 8},
                {pos: new Vector2(80, 64), radius: 8},
                {pos: new Vector2(68, 64), radius: 4},
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(44, 64), radius: 4},
                {pos: new Vector2(36, 64), radius: 4},
            ]));

            this.weapon_data[this.weapon_data.length-1].angle += random_float(0, deg2rad(360), this.board.random);

            this.weapon_data[this.weapon_data.length-1].offset = new Vector2(-32, -24);

            this.weapon_stats.push({
                speed: random_float(...this.speed_range, this.board.random),
                throw_delay: random_float(...this.throw_delay_range, this.board.random),
            });

            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        let remove_weapon_ids = [];
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.weapon_stats[i].speed * time_delta);

            this.weapon_stats[i].throw_delay -= time_delta;
            if (this.weapon_stats[i].throw_delay <= 0) {
                // throw
                remove_weapon_ids.push(i);

                let firing_offset = this.get_weapon_offset(i);
                let fire_pos = this.position.add(firing_offset);

                board.spawn_projectile(
                    new SpearProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1,
                        new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                        random_float(...this.spear_projectile_speed_range, this.board.random), this.velocity.mul(0)
                    ), fire_pos
                )
            }
        }

        remove_weapon_ids.forEach(i => {
            this.weapon_data.splice(i, 1);
            this.weapon_stats.splice(i, 1);

            // no need to recache, we're about to do that in the parent anyway
        });

        this.spear_replenish_delay -= time_delta;
        if (this.level >= AWAKEN_LEVEL) {
            if (this.weapon_data.length <= 0) {
                this.spear_replenish_delay = 0;
            }
        }
        
        if (this.spear_replenish_delay <= 0) {
            this.spear_replenish_delay = this.spear_replenish_delay_max;
            this.replenish_spear();
        }
    }

    hit_other(other, with_weapon_index) {
        this.replenish_spear();

        return super.hit_other(other, with_weapon_index, this.damage_base);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        this.replenish_spear();

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Spear melee damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Spear thrown damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor + 12, this.colour.css(), CANVAS_FONTS, 12
        )
        write_text(
            ctx, `Spears: ${this.weapon_data.length.toString().padEnd(2)} - instant replenish on hit`, x_anchor, y_anchor + 24, this.colour.css(), CANVAS_FONTS, 12
        )
        
        let timeout = (this.spear_replenish_delay_max);
        let timeleft = (this.spear_replenish_delay);
        write_text(
            ctx, `Time until next spear: ${timeleft.toFixed(1)}s / ${timeout.toFixed(1)}s`, x_anchor, y_anchor + 36, this.colour.css(), CANVAS_FONTS, 12
        )
        let bar_l = 32;
        let prop = timeleft / timeout;
        let empties = Math.max(0, Math.min(bar_l, Math.ceil(prop * bar_l)));
        write_text(
            ctx, `[${"#".repeat(bar_l - empties)}${" ".repeat(empties)}]`, x_anchor, y_anchor + 48, this.colour.css(), CANVAS_FONTS, 12
        )

        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Replenish a spear immediately if empty.`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
            write_text(
                ctx, `Replenish two spears at once.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), CANVAS_FONTS, 12
            )
        }
    }
}

class Projectile {
    // projectiles have a position, a damage stat, a direction, speed and some hitboxes
    static id_inc = 0;
    
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        this.id = Projectile.id_inc;
        Projectile.id_inc++;
        
        this.active = true;
        
        // {pos, radius} same as balls
        this.hitboxes = [];

        this.board = board;

        this.source = source;
        this.source_weapon_index = source_weapon_index;
        this.set_pos(position);
        this.damage = damage;
        this.size = size * PROJ_SIZE_MULTIPLIER;
        this.set_dir(direction);

        this.speed = speed;

        this.sprite = "arrow";

        this.parriable = true;
        this.collides_other_projectiles = true;
        this.play_parried_audio = true;

        // TODO
        // need to add source_player and source_ball
        // so we have 3 levels of team-hits:
        //  all on team, all from player ID, only from ball ID
        // also need to split out team and player ID to allow for this
        this.can_hit_allied = false;
        this.can_hit_source = false; // specifically for hit/parry from SOURCE ball

        this.ignore_balls = new Set();

        this.cached_hitboxes_offsets = [];
        this.cache_hitboxes_offsets();
    }

    set_pos(to) {
        this.position = to;
        this.position.compat_round();
    }

    set_dir(to) {
        this.direction = to;
        this.direction.compat_round();

        this.direction_angle = compat_round(this.direction.angle());

        this.cache_hitboxes_offsets();
    }

    set_hitboxes(to) {
        this.hitboxes = to;
        this.cache_hitboxes_offsets();
    }

    physics_step(time_delta) {
        // do nothing
    }

    weapon_step(time_delta) {
        // do nothing
    }

    cache_hitboxes_offsets() {
        this.cached_hitboxes_offsets = this.hitboxes.map(hitbox => {
            // rotate the hitbox pos by the direction and multiply by size
            // no offset funnies here, luckily
            let offset = hitbox.pos.mul(this.size).rotate(this.direction_angle);
            return offset;
        })
    }

    get_hitboxes_offsets() {
        return this.cached_hitboxes_offsets;
    }

    check_projectiles_colliding(projectiles) {
        let this_hitboxes_offsets = this.get_hitboxes_offsets();

        return projectiles.filter(projectile => {
            if (!projectile.active || projectile.id == this.id || projectile.source.id == this.source.id) {
                // projectiles never collide with themselves
                // disabled projectiles don't collide
                // projectiles also don't collide with
                // other projectiles of the same source
                return false;
            }

            let other_hitboxes_offsets = projectile.get_hitboxes_offsets();

            return this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                let this_hitbox = this.hitboxes[this_index];
                
                // check all of other's hitboxes
                return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                    let other_hitbox = projectile.hitboxes[other_index];
                    
                    let radius_sum = (this_hitbox.radius * this.size) + (other_hitbox.radius * projectile.size);
                    let radius_sum_sqr = compat_pow(radius_sum, 2);

                    let this_hitbox_pos = this.position.add(this_hitbox_offset);
                    let other_hitbox_pos = projectile.position.add(other_hitbox_offset);

                    return this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr
                })
            })
        })
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = false;
    }

    get_parried(by) {
        this.active = false;
    }

    hit_ball(ball, delta_time) {
        this.active = false;
    }
}

class StraightLineProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.direction.mul(this.speed * time_delta)));
    }
}

class InertiaRespectingStraightLineProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.inertia_vel = inertia_vel;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.direction.mul(this.speed).add(this.inertia_vel).mul(time_delta)));
    }
}

class HitscanProjectile extends Projectile {
    // hitscan projectiles are the same as normal ones for the most part except their sprite is
    //  "HITSCAN"
    // and they have an additional sprite_colour parameter
    // and 
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, 1, new Vector2(0, 0), 0);

        this.target_position = target_position;

        this.sprite = "HITSCAN";
        this.sprite_colour = "yellow";

        this.duration = 0.5;
        this.lifetime = 0;

        this.inactive_delay = 0;
        this.render_delay = 0;
        this.active_duration = 0.02;

        this.create_multiple_hitboxes = false;

        this.max_width = 8;
        this.min_width = 0;

        this.bearing = this.target_position.sub(this.position).normalize();
    
        this.hitboxes = [];
    
        this.nullified = false;
    }

    physics_step(time_delta) {
        // do nothing
        this.lifetime += time_delta;
    }

    weapon_step(time_delta) {
        let result = this.create_hitboxes(this.create_multiple_hitboxes);
        if (result) {
            this.set_hitboxes(result);
        }
    }

    get_width() {
        return lerp(this.max_width, this.min_width, this.lifetime / this.duration);
    }

    is_inactive() {
        return this.nullified || this.lifetime < this.inactive_delay || this.lifetime > this.active_duration;
    }

    create_hitboxes(overwrite=false) {
        // start at position, move to target_position
        // to get full circle coverage over width, use a circle of radius (width/2)
        // and move by (width/2) each time
        let hitboxes = [];
        if (this.is_inactive()) {
            return hitboxes;
        }

        if (this.hitboxes.length > 0 && !overwrite) {
            return null;
        }

        let dist = this.target_position.distance(this.position);
        let half_r = this.max_width / 2;

        let scaled_bearing = this.bearing.mul(half_r);

        let num_hitboxes = Math.floor(dist / (half_r * PROJ_SIZE_MULTIPLIER));
        let cur_pos = this.position;
        let offset = new Vector2(0, 0);

        for (let i=0; i<num_hitboxes; i++) {
            hitboxes.push({pos: offset, radius: half_r});
            cur_pos = cur_pos.add(scaled_bearing);
            offset = offset.add(scaled_bearing);
        }

        hitboxes.push({pos: offset, radius: half_r});

        return hitboxes;
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = true;
    }

    get_parried(by) {
        this.nullified = true;
    }

    hit_ball(ball, delta_time) {
        this.active = true;
    }
}

class RailgunProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 32;
        this.sprite_colour = "cyan";
    }
}

class MagnumProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, ricochets) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.sprite_colour = "yellow";

        this.ricochets = ricochets ? ricochets : 1

        this.duration = 0.5;
        this.lifetime = 0;

        this.inactive_delay = this.ricochets == 1 ? 0 : 0.02;
        this.render_delay = this.inactive_delay;
        this.active_duration = this.inactive_delay + 0.01;

        this.max_width = 12;
        this.min_width = 0;

        if (this.ricochets > 1) {
            this.damage *= 2;
        }
        this.max_width *= this.ricochets;
        if (this.ricochets >= 1) {
            this.sprite_colour = Colour.yellow.lerp(Colour.red, Math.min(1, (this.ricochets-1) / 3)).css();
            this.parriable = false;
        }

        this.can_hit_allied = true;
    }

    // Override so that it will return collisions with MagnumCoins
    check_projectiles_colliding(projectiles) {
        let this_hitboxes_offsets = this.get_hitboxes_offsets();

        return projectiles.filter(projectile => {
            if (!projectile.active) {
                return false;
            }

            if (projectile.id == this.id) {
                return false;
            }

            if (projectile.source.id == this.source.id && !(projectile instanceof MagnumCoinProjectile && projectile.lifetime > 0.1)) {
                return false;
            }

            let other_hitboxes_offsets = projectile.get_hitboxes_offsets();

            return this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                let this_hitbox = this.hitboxes[this_index];
                
                // check all of other's hitboxes
                return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                    let other_hitbox = projectile.hitboxes[other_index];
                    
                    let radius_sum = (this_hitbox.radius * this.size) + (other_hitbox.radius * projectile.size);
                    let radius_sum_sqr = compat_pow(radius_sum, 2);

                    let this_hitbox_pos = this.position.add(this_hitbox_offset);
                    let other_hitbox_pos = projectile.position.add(other_hitbox_offset);

                    return this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr
                })
            })
        })
    }

    hit_other_projectile(other) {
        if (other instanceof MagnumCoinProjectile && other.source.id == this.source.id) {
            // if the coin is out of bounds, ignore it
            if (!this.board.in_bounds(other.position)) {
                return;
            }

            // ricoshot
            // search for an enemy
            let enemies = this.board.balls.filter(ball => ball.id != this.source.id);
            let coins = this.board.projectiles.filter(proj => proj.id != other.id && proj.active && proj instanceof MagnumCoinProjectile && proj.lifetime > 0.1 && this.board.in_bounds(proj.position));

            let target = null;
            if (coins.length > 0) {
                target = coins.reduce((closest, coin) => closest ? (coin.position.sqr_distance(other.position) < closest[0] ? [coin.position.sqr_distance(other.position), coin] : closest) : [coin.position.sqr_distance(other.position), coin], null)[1]
            } else if (enemies.length > 0) {
                target = enemies.reduce((closest, enemy) => closest ? (enemy.position.sqr_distance(other.position) < closest[0] ? [enemy.position.sqr_distance(other.position), enemy] : closest) : [enemy.position.sqr_distance(other.position), enemy], null)[1]
            }

            if (!target) {
                target = {position: other.position.add(random_on_circle(30000, this.board.random))}
            }

            if (target) {
                this.board.spawn_projectile(
                    new MagnumProjectile(
                        this.board,
                        this.source, this.source_weapon_index, 
                        other.position, this.damage,
                        target.position, this.ricochets + 1
                    ), other.position
                );

                play_audio("parry2");

                let particle = new Particle(
                    other.position.add(new Vector2(16, -32)), 0, 0.2, entity_sprites.get("explosion"), 12, 3, false
                )
                particle.lifetime += 0.1;
                this.board.spawn_particle(particle, other.position.add(new Vector2(16, -32)));

                this.target_position = other.position;

                // this.board.hitstop_time = Math.max(this.board.hitstop_time, 0.1);

                other.active = false;
            }
        } else {
            // do nothing
        }
    }
}

class WandMagentaProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 9;
        this.sprite_colour = "magenta";

        this.ignore_smoothing = true;
        this.parriable = false;
    }
}

class MagnumCoinProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, gravity) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);

        this.frame = 0;
        this.framecount = 5;
        this.sprites = entity_sprites.get("coin");
        this.sprite = this.sprite[0];
        this.lifetime = 0;
        this.frame_speed = 12;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 8},
        ]);

        this.can_hit_allied = true;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));

        this.lifetime += time_delta;
        this.frame = Math.floor(this.lifetime * this.frame_speed)
        this.frame = this.frame % this.framecount;
        this.sprite = this.sprites[this.frame];
    }

    hit_other_projectile(other_projectile) {
        if (other_projectile instanceof MagnumProjectile) {
            return;
        }

        super.hit_other_projectile(other_projectile);
    }
}

class DaggerAwakenProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);

        this.sprite = "pellet";
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 4},
        ]);

        this.play_parried_audio = false;
    }
}

class ArrowProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "arrow";
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
            {pos: new Vector2(20, 0), radius: 4},
        ]);
    }
}

class PotionPuddleProjectile extends Projectile {
    static mults = [1, 0.6, 1, 0.3];

    constructor(board, source, source_weapon_index, position, intensity, size, effect_index, duration_mult) {
        super(board, source, source_weapon_index, position, 0, size, new Vector2(1, 0), 0);

        this.sprite = `puddle${effect_index+1}`;
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 36},
        ]);

        this.intensity = intensity;

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.duration = 5 * PotionPuddleProjectile.mults[effect_index] * duration_mult;

        this.effect_index = effect_index;

        this.alternative_layer = "bg1";
    }

    physics_step(time_delta) {
        this.duration -= time_delta;
        if (this.duration <= 0) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        this.active = true;

        // console.log(`hitting ${ball.name} as ${this.effect_index}`)

        switch (this.effect_index) {
            case 0: {
                // rupture
                this.source.apply_rupture(
                    ball, 5 * this.intensity * delta_time
                )

                break;
            }

            case 1: {
                // poison
                let dur = 2.5 * this.intensity * delta_time;
                let amt = 1.5 * this.intensity * delta_time;
                this.source.apply_poison(
                    ball, amt, dur
                );

                break;
            }

            case 2: {
                // damage
                let dmg_mul = this.player?.stats?.damage_bonus ?? 1;
                let def_mul = ball.player?.stats?.defense_bonus ?? 1;

                let dmg = (7 * this.intensity * dmg_mul * delta_time) / def_mul;

                ball.lose_hp(dmg, this.source);

                break;
            }

            case 3: {
                // hitstop
                ball.apply_hitstop(0.1);
                break;
            }
        }
    }
}

class PotionBottleProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, gravity, effect_index, duration_mult, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);
        this.effect_index = effect_index;

        this.sprite = `potion${effect_index+1}${sprite_suffix}`;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 16},
        ]);

        this.rotation_speed = random_float(270, 540, this.board.random);

        this.duration_mult = duration_mult;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));
    
        let new_direction_angle = this.direction_angle + ((this.rotation_speed * (Math.PI / 180)) * time_delta);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    }

    make_splash() {
        board.spawn_projectile(
            new PotionPuddleProjectile(
                this.board,
                this.source, 0, this.position, 1, 2, this.effect_index, this.duration_mult
            ), this.position
        )
    }

    hit_other_projectile(other_projectile) {
        super.hit_other_projectile(other_projectile);

        this.make_splash();
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        this.make_splash();
    }

    get_parried(by) {
        super.get_parried(by);

        this.make_splash();
    }
}

class GrenadeExplosionProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, sprite_override="explosion_grenade") {
        super(board, source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprites = entity_sprites.get(sprite_override);
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        /*
        this.set_hitboxes([
            
        ]);
        */

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(-14, 12), radius: 24}],
            [{pos: new Vector2(-14, 12), radius: 36}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.lifetime = 0;
        this.duration = 1.5;

        this.can_hit_allied = true;
        this.can_hit_source = true;
    }

    physics_step(time_delta) {
        this.lifetime += time_delta;

        let frame = Math.floor((this.lifetime / this.duration) * this.framecount);
        this.sprite = this.sprites[frame];

        this.set_hitboxes(this.hitboxes_by_frame[frame]);

        if (this.lifetime >= this.duration) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        let diff_vec = ball.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = ball.velocity.magnitude();

        let new_other_velocity = ball.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

        ball.set_velocity(new_other_velocity);

        ball.apply_invuln(BALL_INVULN_DURATION * 2);

        this.ignore_balls.add(ball.id);

        this.active = true;
    }
}

class ChakramProjectile extends Projectile {
    // orbits around thrower, going from origin distance to max distance then back to origin
    // before vanishing again and re-enabling the weapon on the ball
    constructor(board, source, source_weapon_index, position, damage, size, initial_angle, rotation_speed, rotation_time, min_dist, max_dist) {
        super(board, source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprite = `chakram_projectile`

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 48},
        ]);

        this.initial_angle = initial_angle;
        this.set_dir(new Vector2(1, 0).rotate(this.initial_angle + deg2rad(45)));

        this.cur_angle = this.initial_angle;

        this.rotation_speed = rotation_speed;
        this.rotation_time = rotation_time;
        this.lifetime = 0;

        this.min_dist = min_dist;
        this.max_dist = max_dist;

        this.sprite_angle_change_speed = 1440;

        this.hitstop = 0;
    }
    
    physics_step(time_delta) {
        this.hitstop -= time_delta;
        let delta_time = time_delta;
        if (this.hitstop > 0) {
            delta_time *= HITSTOP_DELTATIME_PENALTY;
        }

        this.lifetime += delta_time;
        this.cur_angle += this.rotation_speed * delta_time;

        if (this.lifetime > this.rotation_time) {
            this.active = false;
            this.source.mode = "idle";
            this.source.reset_weapons();
            this.source.weapon_data[0].angle = this.cur_angle;
            this.source.cache_weapon_offsets();
            this.source.cache_hitboxes_offsets();
        }

        let new_direction_angle = this.direction_angle + ((this.sprite_angle_change_speed * Math.sign(this.rotation_speed) * (Math.PI / 180)) * delta_time);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    
        // dist should be min_dist at 0, max_dist at 0.5 and min_dist again at 1
        let lifetime_proportion = this.lifetime / this.rotation_time;
        let dist_lerp_amt = 2 * (0.5 - Math.abs(lifetime_proportion - 0.5));
        
        this.sprite = dist_lerp_amt < 0.1 ? `chakram` : `chakram_projectile`;
        
        let dist = lerp(this.min_dist, this.max_dist, dist_lerp_amt);
        let newpos = new Vector2(dist, 0).rotate(this.cur_angle).add(this.source.position);

        this.set_pos(newpos);
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = true;
    }

    get_parried(by) {
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        // this one is fine because it's a projectile
        this.hitstop = Math.max(this.hitstop, BASE_HITSTOP_TIME);

        this.active = true;
    }
}

class WandIcicleProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "wand_icicle";
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
            {pos: new Vector2(20, 0), radius: 4},
        ]);
    }
}

class WandFireballProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "wand_fireball";
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 16},
        ]);
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

class AxeAwakenProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    
        this.sprite = "axe_projectile";
        this.set_hitboxes([
            {pos: new Vector2(6, 0), radius: 12},

            {pos: new Vector2(3, 12), radius: 12},
            {pos: new Vector2(0, 24), radius: 12},
            
            {pos: new Vector2(3, -12), radius: 12},
            {pos: new Vector2(0, -24), radius: 12},
        ]);

        this.parriable = false;
    }

    hit_other_projectile(other_projectile) {
        this.active = true;
    }

    get_parried(by) {
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        this.active = true;
    }
}

class ShotgunProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, width, col) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = width;
        this.sprite_colour = col.css();
    
        this.parriable = false;
    }
}

class SpearProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "spear_projectile";
        this.set_hitboxes([
            {pos: new Vector2(108 - 64, 0), radius: 4},
            {pos: new Vector2(96 - 64, 0), radius: 8},
            {pos: new Vector2(80 - 64, 0), radius: 8},
            {pos: new Vector2(68 - 64, 0), radius: 4},
            {pos: new Vector2(60 - 64, 0), radius: 4},
            {pos: new Vector2(52 - 64, 0), radius: 4},
            {pos: new Vector2(44 - 64, 0), radius: 4},
            {pos: new Vector2(36 - 64, 0), radius: 4},
            {pos: new Vector2(28 - 64, 0), radius: 4},
            {pos: new Vector2(20 - 64, 0), radius: 4},
            {pos: new Vector2(12 - 64, 0), radius: 4},
        ]);
    }
}