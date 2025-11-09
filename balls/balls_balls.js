const AWAKEN_LEVEL = 7;
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
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor);

        this.name = "No Weapon";
        this.description_brief = "Does nothing. Unarmed, but not the awesome kind.";
        this.level_description = "It really doesn't do anything, even when levelled up.";

        // player.stats:
        /*
            rotation_speed [multiplier]
            damage_bonus   [multiplier]
            defense_bonus  [multiplier]
            unique_level   [int]
        */
        this.player = player;

        // weaponballs have a set of weapons that spin around them
        this.weapon_data = [
            new BallWeapon(0, "SORD", [
                
            ])
        ];

        // every hit deals a minimum of 1 damage and 100 hp is the max for everyone
        this.hp = 100;
        this.takes_damage = true;

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
        this.level = level;

        this.show_stats = true;
        this.display = true;

        this.rupture_intensity = 0;

        this.poison_intensity = 0;
        this.poison_duration = 0;

        this.last_damage_source = null;
    }

    lose_hp(amt, bypass_damage_prevention=false) {
        if (this.takes_damage || bypass_damage_prevention) {
            this.hp -= amt;
        }
    }

    allied_with(other) {
        return this.player?.id === other.player?.id;
    }

    randomise_weapon_rotations() {
        this.weapon_data.forEach(w => {
            w.angle = random_float(0, 360);
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
        }
        this.poison_duration -= time_delta;

        this.lose_hp(this.poison_intensity * time_delta);

        // rupture deals intensity dps and reduces by 50%/s
        if (this.rupture_intensity > 0) {
            this.lose_hp(this.rupture_intensity * time_delta);
            this.rupture_intensity = lerp(this.rupture_intensity, 0, 1 - Math.pow(0.5, time_delta));
        }
    }

    physics_step(board, time_delta) {
        // TODO think about how best to make this less annoying to override

        this.hitstop -= time_delta;
        if (this.hitstop > 0) {
            time_delta *= HITSTOP_DELTATIME_PENALTY;
        }

        super.physics_step(time_delta);
        this.weapon_step(board, time_delta);

        this.invuln_duration -= time_delta;
        this.weapon_data.forEach(w => w.angle = w.angle % (Math.PI * 2))
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, 180 * time_delta);
    }

    get_weapon_offset(weapon) {
        let offset = new Vector2(this.radius + ((weapon.size_multiplier * 0.75) * 128 * 0.5), 0);
        offset = offset.rotate(weapon.angle);

        return offset;  // this is the center of the weapon
    }

    get_hitbox_offset(weapon, hitbox) {
        return hitbox.pos.sub(new Vector2(64, 64)).rotate(weapon.angle).mul(weapon.size_multiplier);
    }

    get_hitboxes_offsets(weapon) {
        return weapon.hitboxes.map(hitbox => {
            return this.get_hitbox_offset(weapon, hitbox);
        })
    }

    // HOW DO YOU NAME THIS
    check_weapons_hit_from(other) {
        // check if THIS BALL is hit by another ball's weapons, and if yes, return which
        return new Array(other.weapon_data.length).fill(0).map((_, i) => i).filter(weapon_index => {
            // return true if hit else false
            let weapon = other.weapon_data[weapon_index];

            let hitboxes_offsets = other.get_hitboxes_offsets(weapon);
            let weapon_offset = other.get_weapon_offset(weapon);

            // then check each hitbox; the radius is simply radius * size_multiplier
            // then its classic distance checking
            return hitboxes_offsets.some((hitbox_offset, index) => {
                let hitbox = weapon.hitboxes[index];

                let radius_sum = (hitbox.radius * weapon.size_multiplier) + this.radius;
                let radius_sum_sqr = Math.pow(radius_sum, 2);

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

            let this_hitboxes_offsets = this.get_hitboxes_offsets(weapon);
            let this_weapon_offset = this.get_weapon_offset(weapon);

            other.weapon_data.forEach((other_weapon, other_index) => {
                if (other_weapon.unparriable) {
                    return;
                }

                let other_hitboxes_offsets = other.get_hitboxes_offsets(other_weapon);
                let other_weapon_offset = other.get_weapon_offset(other_weapon);

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (other_weapon.hitboxes[other_index].radius * other_weapon.size_multiplier);
                        let radius_sum_sqr = Math.pow(radius_sum, 2);

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
                let radius_sum_sqr = Math.pow(radius_sum, 2);

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

            let this_hitboxes_offsets = this.get_hitboxes_offsets(weapon);
            let this_weapon_offset = this.get_weapon_offset(weapon);

            projectiles.forEach(projectile => {
                let projectile_hitboxes_offsets = projectile.get_hitboxes_offsets();

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return projectile_hitboxes_offsets.some((projectile_hitbox_offset, projectile_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (projectile.hitboxes[projectile_index].radius * projectile.size);
                        let radius_sum_sqr = Math.pow(radius_sum, 2);

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

        let result = other.get_hit(damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        this.hitstop = Math.max(this.hitstop, hitstop);

        result.hitstop = hitstop;
        return result;
    }

    get_hit(damage, hitstop) {
        // defense_bonus is a simple "divide damage by this" value
        let def = this.player?.stats?.defense_bonus ?? 1;
        let final_damage = damage == 0 ? damage : Math.max(1, Math.round(damage * def));
        
        this.lose_hp(final_damage);
        this.invuln_duration = Math.max(this.invuln_duration, BALL_INVULN_DURATION);
        this.hitstop = Math.max(this.hitstop, hitstop);

        return {dmg: final_damage, dead: this.hp <= 0};
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        // console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit_by_projectile(with_projectile.damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        
        this.hitstop = Math.max(this.hitstop, hitstop);

        result.hitstop = hitstop;
        return result;
    }

    get_hit_by_projectile(damage, hitstop) {
        return this.get_hit(damage, hitstop);
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // nothing
    }

    parry_projectile(with_weapon_index, projectile) {
        // nothing
    }

    get_projectile_parried(parrier, projectile) {
        // nothing
    }

    die() {
        return {skip_default_explosion: false};
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, "This thing has no stats bro", x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, "you shouldnt even be using it", x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
    }
}

class HammerBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hammer";
        this.description_brief = "Has a huge hammer that does lots of damage each hit and knocks enemies back.";
        this.level_description = "Makes the hammer deal even more damage.";
        this.max_level_description = "Adds another smaller hammer that swings independently and faster, dealing half damage.";

        this.weapon_data = [
            new BallWeapon(1 + (level * 0), "hamer", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(0.6, "hamer", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ]));
        }

        this.damage_base = 8 + (1 * this.level);
        this.speed_base = 90;
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

        other.velocity = new_other_velocity;

        other.invuln_duration *= 2;

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, "Knocks enemies back when striking them.", x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Second hammer damage: ${(this.damage_base / 2).toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
            write_text(
                ctx, `Second hammer rotation speed: ${(this.speed_base * 1.6).toFixed(0)} deg/s`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class SordBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "SORD";
        this.description_brief = "Deals more damage and rotates faster after every strike.";
        this.level_description = "Increases the base damage and rotation speed of the sord, and makes it scale faster.";
        this.max_level_description = "Also makes the sord larger(!) after every strike.";

        this.weapon_data = [
            new BallWeapon(1, "SORD", [
                {pos: new Vector2(96, 64), radius: 18},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 1 + (0.5 * level);
        this.speed_base = 180 + (45 * level);
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.damage_base += 0.5 * (1 + (this.level * 0.15));
        this.speed_base += (45 / 4) * (1 + (this.level * 0.15));

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data[0].size_multiplier += 0.04 * 16;
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Hits harder and rotates faster every strike.`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Size multiplier: ${(this.weapon_data[0].size_multiplier / 16).toFixed(2)}`, x_anchor, y_anchor + 36, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class DaggerBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "dagger";
        this.description_brief = "Rotates exponentially faster and deals exponentially more damage every strike. These bonuses decay back to zero when not continually striking.";
        this.level_description = "Increases the delay after not striking until bonuses will decay.";
        this.max_level_description = "When rotation speed is at 1000 deg/s or higher, starts shooting small projectiles (1 dmg) at a frequency and velocity based on rotation speed. Projectile hits don't count as strikes.";

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
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 360, 1 - Math.pow(0.25, time_delta));
            this.damage_base = lerp(this.damage_base, 1, 1 - Math.pow(0.25, time_delta));
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.projectiles_cooldown_max = 0.5 / (this.speed_base / 1000);
            this.proj_speed = 9000 + (100 / this.projectiles_cooldown_max);

            if (this.speed_base >= 1000) {
                this.projectiles_cooldown -= time_delta;
                if (this.projectiles_cooldown <= 0) {
                    this.projectiles_cooldown = this.projectiles_cooldown_max;

                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new DaggerAwakenProjectile(
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
        // additionally knock the other ball away
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.speed_base *= 2;
        this.damage_base *= 1.5;

        this.hit_decay = 1.5 + (0.2 * this.level);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        // additionally knock the other ball away
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
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Bonus decay time: ${(1.5 + (0.2 * this.level)).toFixed(1)}`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Faster rotation speed (x2) and damage (x1.5)`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `every strike. Bonus decays when not striking.`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Projectiles/s: ${(this.speed_base >= 1000 ? 1 / this.projectiles_cooldown_max : 0).toFixed(1)}`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class BowBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Bow";
        this.description_brief = "Quickly fires sets of multiple arrows at a periodic interval. Successful arrow hits increase the number of arrows in each set and their damage.";
        this.level_description = "Increases arrow speed, slightly increases arrow size and slightly reduces shot delay.";
        this.max_level_description = "Start with +1 multishot. Every shot fires an additional arrow.";

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
        this.speed_base = 135;

        this.arrow_size_mult = 1 + (this.level * 0.03);
        this.arrow_speed = 10000 + (this.level * 2000);

        this.shot_cooldown_max = 0.6 + (this.level * -0.015);
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishot_cooldown = 0;
        this.multishot_cooldown_max = 0.05;
        this.multishots = 0;
        this.multishots_max = 1;
        this.multishots_levelup_req = 1;

        if (this.level >= AWAKEN_LEVEL) {
            this.multishots_max += 1;
        }
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
                        this, 0, fire_pos, this.proj_damage_base, 1 * this.arrow_size_mult,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10) * (Math.PI / 180))),
                        this.arrow_speed * random_float(0.85, 1.15), this.velocity.mul(0)
                    ), fire_pos
                )
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_projectile) {
        // additionally knock the other ball away
        let result = super.hit_other_with_projectile(other, with_projectile);

        this.multishots_levelup_req--;
        if (this.multishots_levelup_req <= 0) {
            this.multishots_max++;
            this.proj_damage_base += 1;

            this.multishots_levelup_req = Math.max(1, this.multishots_max * this.multishots_max * 0.25);
        }

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Arrow damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Multishot: ${this.multishots_max}`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Arrow size: ${this.arrow_size_mult.toFixed(3)}`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Arrow speed: ${this.arrow_speed}`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Multishot + damage increases with successful hits.`, x_anchor, y_anchor + 60, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Has a weak melee attack: 2 damage.`, x_anchor, y_anchor + 72, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Shoots an additional arrow every shot.`, x_anchor, y_anchor + 84, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 10
            )
        }
    }
}

class MagnumBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Magnum";
        this.description_brief = "Throws coins and shoots a gun. If a gunshot hits a coin, it doubles in damage and ricochets to the nearest other coin, or enemy if there is no other coin.";
        this.level_description = "Increases coin throw and shot frequency.";
        this.max_level_description = "Get an additional coin thrower.";

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

        this.shot_cooldown_max = 0.6 + (this.level * -0.01);
        this.shot_cooldown = this.shot_cooldown_max;

        this.coin_shot_cooldown_max = 0.5 + (this.level * -0.01);
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
                this, 1, coin_fire_pos, this.coin_damage_base, 1.5,
                new Vector2(1, 0).rotate(this.weapon_data[1].angle), random_int(6000, 10000), board.gravity
            );

            board.spawn_projectile(
                coin_obj, coin_fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                let coin2_firing_offset = this.firing_offsets[1].mul(this.weapon_data[2].size_multiplier).rotate(this.weapon_data[2].angle);
                let coin2_fire_pos = this.position.add(coin2_firing_offset);
                
                let coin2_obj = new MagnumCoinProjectile(
                    this, 1, coin2_fire_pos, this.coin_damage_base, 1.5,
                    new Vector2(1, 0).rotate(this.weapon_data[2].angle), random_int(6000, 10000), board.gravity
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
        // additionally knock the other ball away
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Bullet damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Coin damage: ${this.coin_damage_base.toFixed(2)}`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Coin rotation speed: ${(this.speed_base * 2.5).toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Shots ricochet off coins for double damage.`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Ricochet shots can't be parried.`, x_anchor, y_anchor + 60, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Has an additional coin thrower.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class NeedleBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Needle";
        this.description_brief = "Has three small needles. Needles apply 0.5 rupture per hit (stacking DOT that decays by 50%/s). When taking damage, 50% chance to use 10% current HP and create a smaller child copy with 4x the HP used that deals half damage and rupture. If the parent dies, all children die.";
        this.level_description = "Increases split chance.";
        this.max_level_description = "Applies poison instead for 1s each. Poison deals the full DOT for its duration and refreshes when stacked.";

        this.weapon_data = [
            new BallWeapon(can_clone ? 1 : 0.7, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.7, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.7, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
        ];

        this.damage_base = 2 * (can_clone ? 1 : 0.5);
        this.rupture_base = 0.5 * (can_clone ? 1 : 0.5);
        this.poison_duration_base = 1;

        this.speed_base = 315;
        this.split_chance = 0.5 + (this.level * 0.04);
        this.split_ratio = 0.1;

        this.children = [];
        this.parent = null;

        this.can_clone = can_clone;
        
        this.radius *= can_clone ? 1 : 0.75
    
        this.board = null;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 1.9 * time_delta);
        this.rotate_weapon(2, this.speed_base * 0.9 * time_delta);

        if (this.parent?.hp <= 0) {
            this.lose_hp(10 * time_delta, true);
        }

        this.board = board;
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        if (this.level >= AWAKEN_LEVEL) {
            other.poison_duration = Math.max(other.poison_duration + this.poison_duration_base, this.poison_duration_base);
            other.poison_intensity += this.rupture_base;
        } else {
            other.rupture_intensity += this.rupture_base;
        }

        return result;
    }

    clone_chance() {
        let c = Math.random();
        if (this.can_clone && c < this.split_chance) {
            let hp_proportion = Math.floor(this.hp * this.split_ratio);

            if (hp_proportion > 0) {
                let new_ball = new NeedleBall(
                    this.mass, this.radius, this.colour, this.bounce_factor,
                    this.friction_factor, this.player, this.level, this.reversed,
                    false
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.invuln_duration = BALL_INVULN_DURATION;

                if (true) {
                    this.lose_hp(hp_proportion);
                }

                new_ball.show_stats = false;

                this.board?.spawn_ball(new_ball, this.position);

                new_ball.add_impulse(random_on_circle(random_float(6000, 10000)));

                this.children.push(new_ball);
                new_ball.parent = this;
            }
        }
    }

    get_hit(damage, hitstop) {
        let result = super.get_hit(damage, hitstop);

        this.clone_chance();

        return result;
    }

    get_hit_by_projectile(damage, hitstop) {
        let result = super.get_hit_by_projectile(damage, hitstop);

        this.clone_chance();

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Damage: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `${this.level >= AWAKEN_LEVEL ? "Poison" : "Rupture"} per hit: ${this.rupture_base.toFixed(1)}`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Copy chance: ${(this.split_chance * 100).toFixed(0)}%`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Copy HP ratio: ${(this.split_ratio * 100).toFixed(0)}%`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Applies poison instead of rupture.`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class RailgunBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Railgun";
        this.description_brief = "Shoots a beam projectile. If the shot hits or is parried, temporarily speeds up fire rate & rotation then quickly fires another shot. -[Original design by Boggy]";
        this.level_description = "Increases shot frequency.";
        this.max_level_description = "Use two railguns that always mirror positions and always shoot together.";

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

        this.proj_damage_base = 12;
        this.speed_base = 80;

        this.shot_cooldown_max_base = 0.7 + (this.level * -0.02);
        this.shot_cooldown_max = this.shot_cooldown_max_base;
        this.shot_cooldown_rapidfire = 0.04 + (this.level * -0.005);
        this.shot_cooldown = this.shot_cooldown_max;

        this.hit_decay = 0;
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
            this.speed_base = lerp(this.speed_base, 80, 1 - Math.pow(0.45, time_delta));
            this.shot_cooldown_max = lerp(this.shot_cooldown_max, this.shot_cooldown_max_base, 1 - Math.pow(0.2, time_delta));
        }

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let bullet1_end_pos = new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos);
            board.spawn_projectile(
                new RailgunProjectile(
                    this, 0, fire_pos, this.proj_damage_base,
                    bullet1_end_pos,
                ), fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                firing_offset = this.firing_offsets[0].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
                fire_pos = this.position.add(firing_offset);

                board.spawn_projectile(
                    new RailgunProjectile(
                        this, 0, fire_pos, this.proj_damage_base,
                        new Vector2(1, 0).rotate(this.weapon_data[1].angle).mul(10000).add(fire_pos),
                    ), fire_pos
                )
            } else {

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

        other.invuln_duration = 0.025;

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        this.shot_cooldown = this.shot_cooldown_rapidfire;
        this.speed_base *= 1.5;
        this.hit_decay = 0.6;

        parrier.invuln_duration = 0.025;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Bullet damage: ${this.proj_damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `On shot hit or parry, rotation speed increases,`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `and quickly fire another shot.`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Has two railguns that mirror positions.`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class PotionBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Potion";
        this.description_brief = "Throws three different potions that create debilitating puddles of chemicals on impact (red is rupture, green is poison, blue is pure damage). Parrying anything with the held potion temporarily destroys the potion, creating a puddle.";
        this.level_description = "Increases puddle duration.";
        this.max_level_description = "Adds a fourth potion that temporally affects balls, freezing them in time.";

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

        this.weapon_data[0].rotate(random_float(0, 360));
        this.weapon_data[1].rotate(random_float(0, 360));
        this.weapon_data[2].rotate(random_float(0, 360));
        this.weapon_data[3]?.rotate(random_float(0, 360));

        this.weapon_data[1].reverse();
        this.weapon_data[3]?.reverse();

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.potion_impact_damage = 2;

        this.speed_range = [135, 225]
        this.speeds = [180, 180, 180, 180].map(_ => random_float(...this.speed_range));

        this.shot_cooldown_max_range = [0.3, 1];
        this.shot_cooldowns = [0, 0, 0, 0].map(_ => random_float(...this.shot_cooldown_max_range));
        this.weapon_regeneration_times = [0,0,0,0];
        this.max_weapon_regeneration_time = 1.6;
        this.potion_smash_penalty = 3;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            if (this.weapon_regeneration_times[i] > 0) {
                this.weapon_regeneration_times[i] -= time_delta;
                if (this.weapon_regeneration_times[i] <= 0) {
                    this.weapon_data[i].size_multiplier = 1 * 16
                    this.speeds[i] = random_float(...this.speed_range);
                    this.weapon_data[i].hitboxes = [{pos: new Vector2(30, 64), radius: 14}];
                }
            } else {
                this.rotate_weapon(i, this.speeds[i] * time_delta);
                this.shot_cooldowns[i] -= time_delta;
                if (this.shot_cooldowns[i] < 0) {
                    this.shot_cooldowns[i] = random_float(...this.shot_cooldown_max_range);
                
                    // schut
                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[i].size_multiplier).rotate(this.weapon_data[i].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new PotionBottleProjectile(
                            this, i, fire_pos, this.potion_impact_damage, 1,
                            new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                            random_int(6000, 10000), board.gravity, i
                        ), fire_pos
                    )
                    
                    this.lose_potion(i, false);
                }
            }
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // nothing
        this.smash_potion(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        // nothing
        this.smash_potion(with_weapon_index);
    }

    lose_potion(index, smashed) {
        this.weapon_data[index].size_multiplier = 0;
        this.weapon_regeneration_times[index] = this.max_weapon_regeneration_time * (smashed ? this.potion_smash_penalty : 1);
    
        this.weapon_data[index].hitboxes = [];
    }

    smash_potion(index) {
        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[index].size_multiplier).rotate(this.weapon_data[index].angle);
        let fire_pos = this.position.add(firing_offset);

        board.spawn_projectile(
            new PotionPuddleProjectile(
                this, 0, fire_pos, 1, 2, index
            ), fire_pos
        )

        this.lose_potion(index, true);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, 1);
    
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
            ctx, `Potion impact damage: ${this.potion_impact_damage.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Gains another potion that freezes time.`, x_anchor, y_anchor + 12, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        }
    }
}

class GrenadeBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Grenade";
        this.description_brief = "Throws grenades. Grenades bounce around for up to 3 seconds before exploding. If a grenade takes damage, it will explode immediately. Explosions can trigger other grenades, and deal 75% damage to the thrower as well.";
        this.level_description = "Increases throw frequency.";
        this.max_level_description = "Increases grenades' fuse timer to 30 seconds and increases throwing frequency by an additional 1.5x.";

        this.weapon_data = [
            new BallWeapon(1, "grenade_weapon", [
                {pos: new Vector2(28, 56), radius: 14},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.grenade_damage_base = 10;
        this.grenade_fuse = this.level >= AWAKEN_LEVEL ? 30 : 3;
        this.damage_base = 2;

        this.speed_base = 135;

        this.shot_cooldown_max = 1.4 - (0.05 * this.level);
        if (this.level >= AWAKEN_LEVEL) {
            this.shot_cooldown_max /= 1.5;
        }

        this.shot_cooldown = this.shot_cooldown_max;
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

        this.board = board;
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let hitstop = BASE_HITSTOP_TIME;

        let dmg = with_projectile.damage;
        if (other.id == this.id && with_projectile instanceof GrenadeExplosionProjectile) {
            dmg *= 0.75;
        }
        let result = other.get_hit_by_projectile(dmg * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        
        this.hitstop = Math.max(this.hitstop, hitstop);

        result.hitstop = hitstop;
        return result;
    }

    make_grenade(position, velocity) {
        let new_ball = new GrenadeProjectileBall(
            this.mass * 0.4, this.radius * 0.4, this.colour, this.bounce_factor,
            this.friction_factor, this.player, this.level,
            this.grenade_damage_base, this.grenade_fuse
        );

        new_ball.invuln_duration = BALL_INVULN_DURATION;
        new_ball.show_stats = false;

        this.board?.spawn_ball(new_ball, position);

        new_ball.velocity = velocity;

        new_ball.parent = this;

        let part = new Particle(new_ball.position, 0, 1, entity_sprites.get("grenade"), 0, 1000000);
        this.board.spawn_particle(part, new_ball.position);
        new_ball.linked_particle = part;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Strike damage: ${this.damage_base.toFixed(0)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Grenade damage: ${this.grenade_damage_base.toFixed(0)}`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Grenade fuse: ${this.grenade_fuse}s`, x_anchor, y_anchor + 24, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )

            write_text(
                ctx, `Grenades/s: ${(1 / this.shot_cooldown_max).toFixed(2)}`, x_anchor, y_anchor + 48, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
            )
        } else {
            write_text(
                ctx, `Grenade fuse: ${this.grenade_fuse}s`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
            )

            write_text(
                ctx, `Grenades/s: ${(1 / this.shot_cooldown_max).toFixed(2)}`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 12
            )
        }
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 12
        )
    }
}

class GrenadeProjectileBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, explosion_damage, fuse) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, false);

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

        this.rotation_speed = random_float(270, 540);
    }

    physics_step(board, time_delta) {
        super.physics_step(board, time_delta);

        if (this.hitstop > 0) {
            time_delta = time_delta * HITSTOP_DELTATIME_PENALTY;
        }

        this.linked_particle.position = this.position;
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.max_fuse) {
            this.hp = 0;
        }
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.last_damage_source?.weapon_data?.forEach(w => {
            w.reverse();
        })

        let expl_position = this.position.add(new Vector2(10, -13).mul(2 * PROJ_SIZE_MULTIPLIER));

        let proj = new GrenadeExplosionProjectile(
            this.parent, 0, expl_position, this.parent.grenade_damage_base, 2
        )

        play_audio("explosion2");

        this.parent.board.spawn_projectile(proj, expl_position);

        return {skip_default_explosion: true};
    }
}

class Projectile {
    // projectiles have a position, a damage stat, a direction, speed and some hitboxes
    static id_inc = 0;
    
    constructor(source, source_weapon_index, position, damage, size, direction, speed) {
        this.id = Projectile.id_inc;
        Projectile.id_inc++;
        
        this.active = true;

        this.source = source;
        this.source_weapon_index = source_weapon_index;
        this.position = position;
        this.damage = damage;
        this.size = size * PROJ_SIZE_MULTIPLIER;
        this.direction = direction;
        this.direction_angle = this.direction.angle();

        this.speed = speed;

        this.sprite = "arrow";

        // {pos, radius} same as balls
        this.hitboxes = [];

        this.parriable = true;
        this.collides_other_projectiles = true;
        this.play_parried_audio = true;

        this.can_hit_allied = false;
        this.can_hit_source = false; // specifically for hit/parry from SOURCE ball

        this.board = null;

        this.ignore_balls = new Set();
    }

    physics_step(time_delta) {
        // do nothing
    }

    weapon_step(time_delta) {
        // do nothing
    }

    get_hitboxes_offsets() {
        return this.hitboxes.map(hitbox => {
            // rotate the hitbox pos by the direction and multiply by size
            // no offset funnies here, luckily
            let offset = hitbox.pos.mul(this.size).rotate(this.direction_angle);
            return offset;
        })
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
                    let radius_sum_sqr = Math.pow(radius_sum, 2);

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
    constructor(source, source_weapon_index, position, damage, size, direction, speed) {
        super(source, source_weapon_index, position, damage, size, direction, speed);
    }

    physics_step(time_delta) {
        this.position = this.position.add(this.direction.mul(this.speed * time_delta));
    }
}

class InertiaRespectingStraightLineProjectile extends StraightLineProjectile {
    constructor(source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(source, source_weapon_index, position, damage, size, direction, speed);

        this.inertia_vel = inertia_vel;
    }

    physics_step(time_delta) {
        this.position = this.position.add(this.direction.mul(this.speed).add(this.inertia_vel).mul(time_delta));
    }
}

class HitscanProjectile extends Projectile {
    // hitscan projectiles are the same as normal ones for the most part except their sprite is
    //  "HITSCAN"
    // and they have an additional sprite_colour parameter
    // and 
    constructor(source, source_weapon_index, position, damage, target_position) {
        super(source, source_weapon_index, position, damage, 1, new Vector2(0, 0), 0);

        this.target_position = target_position;

        this.sprite = "HITSCAN";
        this.sprite_colour = "yellow";

        this.duration = 0.5;
        this.lifetime = 0;

        this.inactive_delay = 0;
        this.render_delay = 0;
        this.active_duration = 0.02;

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
        this.hitboxes = this.create_hitboxes();
    }

    get_width() {
        return lerp(this.max_width, this.min_width, this.lifetime / this.duration);
    }

    create_hitboxes() {
        // start at position, move to target_position
        // to get full circle coverage over width, use a circle of radius (width/2)
        // and move by (width/2) each time
        let hitboxes = [];
        if (this.nullified || this.lifetime < this.inactive_delay || this.lifetime > this.active_duration) {
            return hitboxes;
        }

        let dist = this.target_position.distance(this.position);
        let half_r = this.max_width / 2;

        let scaled_bearing = this.bearing.mul(half_r);

        let num_hitboxes = Math.floor(dist / half_r);
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
    constructor(source, source_weapon_index, position, damage, target_position) {
        super(source, source_weapon_index, position, damage, target_position);

        this.max_width = 36;
        this.sprite_colour = "cyan";
    }
}

class MagnumProjectile extends HitscanProjectile {
    constructor(source, source_weapon_index, position, damage, target_position, ricochets) {
        super(source, source_weapon_index, position, damage, target_position);

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
                    let radius_sum_sqr = Math.pow(radius_sum, 2);

                    let this_hitbox_pos = this.position.add(this_hitbox_offset);
                    let other_hitbox_pos = projectile.position.add(other_hitbox_offset);

                    return this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr
                })
            })
        })
    }

    hit_other_projectile(other) {
        if (other instanceof MagnumCoinProjectile && other.source.id == this.source.id) {
            // ricoshot
            // search for an enemy
            let enemies = this.board.balls.filter(ball => ball.id != this.source.id);
            let coins = this.board.projectiles.filter(proj => proj.id != other.id && proj.active && proj instanceof MagnumCoinProjectile && proj.lifetime > 0.1);

            let target = null;
            if (coins.length > 0) {
                target = coins.reduce((closest, coin) => closest ? (coin.position.sqr_distance(other.position) < closest[0] ? [coin.position.sqr_distance(other.position), coin] : closest) : [coin.position.sqr_distance(other.position), coin], null)[1]
            } else if (enemies.length > 0) {
                target = enemies.reduce((closest, enemy) => closest ? (enemy.position.sqr_distance(other.position) < closest[0] ? [enemy.position.sqr_distance(other.position), enemy] : closest) : [enemy.position.sqr_distance(other.position), enemy], null)[1]
            }

            if (!target) {
                target = {position: other.position.add(random_on_circle(30000))}
            }

            if (target) {
                this.board.spawn_projectile(
                    new MagnumProjectile(
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
                board.spawn_particle(particle, other.position.add(new Vector2(16, -32)));

                this.target_position = other.position;

                // this.board.hitstop_time = Math.max(this.board.hitstop_time, 0.1);

                other.active = false;
            }
        } else {
            // do nothing
        }
    }
}

class MagnumCoinProjectile extends Projectile {
    constructor(source, source_weapon_index, position, damage, size, direction, speed, gravity) {
        super(source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.velocity = this.direction.mul(this.speed);

        this.frame = 0;
        this.framecount = 5;
        this.sprites = entity_sprites.get("coin");
        this.sprite = this.sprite[0];
        this.lifetime = 0;
        this.frame_speed = 12;

        this.hitboxes = [
            {pos: new Vector2(0, 0), radius: 8},
        ];

        this.can_hit_allied = true;
    }

    physics_step(time_delta) {
        this.position = this.position.add(this.velocity.mul(time_delta));

        this.velocity = this.velocity.add(this.gravity.mul(time_delta));

        this.lifetime += time_delta;
        this.frame = Math.floor(this.lifetime * this.frame_speed)
        this.frame = this.frame % this.framecount;
        this.sprite = this.sprites[this.frame];
    }
}

class DaggerAwakenProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);

        this.sprite = "pellet";
        this.hitboxes = [
            {pos: new Vector2(0, 0), radius: 4},
        ];

        this.play_parried_audio = false;
    }
}

class ArrowProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "arrow";
        this.hitboxes = [
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
        ];    
    }
}

class PotionPuddleProjectile extends Projectile {
    static mults = [1, 0.6, 1, 0.3];

    constructor(source, source_weapon_index, position, intensity, size, effect_index) {
        super(source, source_weapon_index, position, 0, size, new Vector2(1, 0), 0);

        this.sprite = `puddle${effect_index+1}`;
        this.hitboxes = [
            {pos: new Vector2(0, 0), radius: 36},
        ];

        this.intensity = intensity;
        this.parriable = false;
        this.collides_other_projectiles = false;

        this.duration = 5 * PotionPuddleProjectile.mults[effect_index];

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
                ball.rupture_intensity += 900 * this.intensity * delta_time;
                break;
            }

            case 1: {
                // poison
                let dur = 850 * this.intensity * delta_time;
                ball.poison_duration = Math.max(ball.poison_duration + dur, dur);
                ball.poison_intensity += 350 * this.intensity * delta_time;
                break;
            }

            case 2: {
                // damage
                ball.lose_hp(2300 * this.intensity * delta_time);
                break;
            }

            case 3: {
                // hitstop
                ball.hitstop = Math.max(ball.hitstop, 0.1);
                break;
            }
        }
    }
}

class PotionBottleProjectile extends Projectile {
    constructor(source, source_weapon_index, position, damage, size, direction, speed, gravity, effect_index) {
        super(source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.velocity = this.direction.mul(this.speed);
        this.effect_index = effect_index;

        this.sprite = `potion${effect_index+1}`

        this.hitboxes = [
            {pos: new Vector2(0, 0), radius: 16},
        ];

        this.rotation_speed = random_float(270, 540);
    }

    physics_step(time_delta) {
        this.position = this.position.add(this.velocity.mul(time_delta));

        this.velocity = this.velocity.add(this.gravity.mul(time_delta));
    
        this.direction_angle += (this.rotation_speed * (Math.PI / 180)) * time_delta;
        this.direction = new Vector2(1, 0).rotate(this.direction_angle);
    }

    make_splash() {
        board.spawn_projectile(
            new PotionPuddleProjectile(
                this.source, 0, this.position, 1, 2, this.effect_index
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
    constructor(source, source_weapon_index, position, damage, size) {
        super(source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprites = entity_sprites.get("explosion_grenade");
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        this.hitboxes = [
            
        ];

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

        this.hitboxes = this.hitboxes_by_frame[frame];

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

        ball.velocity = new_other_velocity;

        ball.invuln_duration *= 2;

        this.ignore_balls.add(ball.id);

        this.active = true;
    }
}