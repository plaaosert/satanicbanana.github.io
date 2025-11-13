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
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor);

        this.name = "No Weapon";
        this.description_brief = "Does nothing. Unarmed, but not the awesome kind.";
        this.level_description = "It really doesn't do anything, even when levelled up.";
        this.max_level_description = "Seriously, it doesn't do anything.";
        this.quote = "I won? I won! How'd I win?!";

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

        // add the weapon's personal offset
        offset = offset.add(weapon.offset.mul(weapon.size_multiplier));

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
            ctx, "This thing has no stats", x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, "im serious", x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
    }
}

class DummyBall extends WeaponBall {

}

class HammerBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hammer";
        this.description_brief = "Has a huge hammer that does lots of damage each hit and knocks enemies back.";
        this.level_description = "Makes the hammer deal even more damage.";
        this.max_level_description = "Adds another smaller hammer that swings independently and faster, dealing half damage.";
        this.quote = "I'm sure you understand.\nThe subject of my victory is quite the heavy topic.";

        this.weapon_data = [
            new BallWeapon(0.95 + (level * 0), "hamer", [
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
        this.quote = "I told you about those strikes, bro. I TOLD you.";

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

        this.damage_base += 0.5 * (1 + (this.level * 0.175));
        this.speed_base += (60 / 4) * (1 + (this.level * 0.15));

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
        this.quote = "Surely that's not all you've got.\nCome here and let me destroy you again.";

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

        this.hit_decay = 1.4 + (0.2 * this.level);

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
        this.speed_base = 135;

        this.arrow_size_mult = 1 + (this.level * 0.03);
        this.arrow_speed = 10000 + (this.level * 2000);

        this.shot_cooldown_max = 0.65 + (this.level * -0.015);
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

        this.shot_cooldown_max = 0.59 + (this.level * -0.01);
        this.shot_cooldown = this.shot_cooldown_max;

        this.coin_shot_cooldown_max = 0.49 + (this.level * -0.01);
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
        this.quote = "Many thanks for your kind donation! It's always hard getting food\non the table as a mother of six trillion.";

        this.weapon_data = [
            new BallWeapon(can_clone ? 0.9 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 0.9 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 0.9 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
        ];

        this.damage_base = 2 * (can_clone ? 1 : 0.5);
        this.rupture_base = 0.5 * (can_clone ? 1 : 0.5);
        this.poison_duration_base = 1;

        this.speed_base = 300;
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

        this.proj_damage_base = 12;
        this.speed_base = 95;

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

        other.invuln_duration = 0.015;

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        this.shot_cooldown = this.shot_cooldown_rapidfire;
        this.speed_base *= 1.5;
        this.hit_decay = 0.6;

        parrier.invuln_duration = 0.015;
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
        this.potion_smash_penalty = 5;
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
        this.description_brief = "Throws grenades. Grenades bounce around for up to 3 seconds before exploding. If a grenade takes damage, it will explode immediately. Explosions can trigger other grenades, and deal 70% damage to the thrower as well.";
        this.level_description = "Increases throw frequency.";
        this.max_level_description = "Increases grenades' fuse timer to 30 seconds and increases throwing frequency by an additional 1.5x.";
        this.quote = "I can't hear anything. Am I dying? Is this the end?";

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

        this.shot_cooldown_max = 1.475 - (0.05 * this.level);
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
            dmg *= 0.70;
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

    update_particles(time_delta) {
        this.linked_particle.position = this.position;
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

class GlassBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Glass";
        this.description_brief = "Normal strikes apply rupture but deal no damage. When hitting a target with rupture, charges up the weapon based on the rupture on the target before the strike. At 25 charge or more, the next hit deals a vorpal strike with damage equal to 16x the rupture that would be applied, then loses all charge.";
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

        this.damage_base = 2.6 + (0.25 * level);
        this.speed_base = 320 + (22.5 * level);

        this.charge = 0;
        this.charge_decay_per_sec = 0;
        this.charge_threshold = 100;

        this.vorpal_mult = 16;
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
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = {};
        if (this.charge >= this.charge_threshold) {
            result = super.hit_other(other, with_weapon_index, this.damage_base * this.vorpal_mult);
            this.charge = 0;
            result.snd = "strongpunch";
        } else {
            result = super.hit_other(other, with_weapon_index, 0);
            this.charge += other.rupture_intensity * 10;
            other.rupture_intensity += this.damage_base;
        }

        if (this.level >= AWAKEN_LEVEL) {
            other.rupture_intensity *= 2;
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Rupture per hit: ${this.damage_base.toFixed(2)}`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Vorpal strike damage: ${(this.damage_base * this.vorpal_mult).toFixed(0)}`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Charge: ${this.charge.toFixed(0)}`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
        if (this.charge >= this.charge_threshold) {
            write_text(
                ctx, `[${"!".repeat(20)}]`, x_anchor + 96, y_anchor + 24, this.colour.css(), "MS Gothic", 12
            )
        } else {
            write_text(
                ctx, `[${">".repeat(Math.floor(20 * (this.charge / this.charge_threshold)))}${" ".repeat(20 - Math.floor(20 * (this.charge / this.charge_threshold)))}]`, x_anchor + 96, y_anchor + 24, this.colour.css(), "MS Gothic", 12
            )
        }
        write_text(
            ctx, `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Normal strikes apply rupture instead of damage.`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 10
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Multiplies rupture by 1.5x after each hit.`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 10
            )
        }
    }
}

class HandBall extends WeaponBall {
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
            {pos: new Vector2(60, 16), radius: 6},
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
            {pos: new Vector2(24, 114), radius: 16},
        ],

        "hand_punch": [
            {pos: new Vector2(64, 64), radius: 36},
            {pos: new Vector2(64-36, 64), radius: 18},
            {pos: new Vector2(64-36-18, 64), radius: 9},
        ],

        "hand_grab": [
            // no hitboxes because grab "cutscene"
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

    constructor(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hand";
        this.description_brief = "(INCOMPLETE!!!!!!!!!) Hands move semi-randomly and independently. Hands randomly punch directly forwards. An idle hand will prepare to grab a ball if it's close, then throw it at an opposite wall at very high speed if the grab is successful.";
        this.level_description = "Speeds up punch recovery and makes hands larger.";
        this.max_level_description = "(INCOMPLETE!!!!!!!!!) After a successful grab, punches the grabbed target multiple times for additional damage before throwing it.";
        this.quote = "It doesn't count as a self-insert if it's just my hands.";

        this.weapon_data = [
            new BallWeapon(0.5, "hand_neutral", [

            ]),

            new BallWeapon(0.5, "hand_neutral", [

            ]),
        ];

        this.hands_speeds = [0, 0];
        this.hands_speed_range = [-20, 60];
        this.hands_speed_timeouts = [0, 0];
        this.hands_speed_timeout_range = [0.5, 2];
        this.hands_sprites = ["hand_neutral", "hand_neutral"];
        this.punch_timeout_range = [0.6, 2]
        this.punch_timeouts = [random_float(...this.punch_timeout_range), random_float(...this.punch_timeout_range)];
        this.punch_recovery = 0.4 - (this.level * 0.02);
        this.punch_active_duration = 0.06;

        this.grab_ready_distance = this.radius * 4;
        this.sqr_grab_ready_distance = this.grab_ready_distance * this.grab_ready_distance;
        this.grab_seek_speed = 18000;
        this.parry_delay = 0;

        this.punch_damage = 8;
        this.other_damage = 0;
        this.grab_damage_initial = 4;
        this.grab_damage_impact = 12;
        this.grab_info = [
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0},
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0}
        ]
    
        this.board = null;
    }

    weapon_step(board, time_delta) {
        // this.velocity = new Vector2(0, 0);
        this.board = board;

        for (let i=0; i<this.weapon_data.length; i++) {
            let make_hitboxes = true;

            this.weapon_data[i].reversed = false;

            switch (this.hands_sprites[i]) {
                case "hand_neutral": {
                    let balls_sqr_distances = board.balls.filter(ball => !ball.allied_with(this)).map(ball => ball.position.sqr_distance(this.position));
                    if (balls_sqr_distances.some(d => d <= this.sqr_grab_ready_distance)) {
                        this.hands_sprites[i] = "hand_open";
                        this.weapon_data[i].offset = new Vector2(0, 0);
                    } else {
                        this.punch_timeouts[i] -= time_delta;
                        this.weapon_data[i].offset = new Vector2(Math.min(0, -64 + (Math.pow(this.punch_timeouts[i], 2) * 256)), 0);
                        if (this.punch_timeouts[i] <= 0) {
                            this.hands_sprites[i] = "hand_punch";

                            let pos = this.position.add(new Vector2(this.weapon_data[0].size_multiplier * 32, 0).rotate(this.weapon_data[0].angle));
                            let particle = new Particle(
                                pos, this.weapon_data[0].angle, 1, entity_sprites.get("hand_punch_particles"), 0, 0.2, false
                            )

                            // board.spawn_particle(particle, pos);

                            this.weapon_data[i].offset = new Vector2(96, 0);
                            this.weapon_data[i].size_multiplier = WEAPON_SIZE_MULTIPLIER * 0.7;
                            this.punch_timeouts[i] = this.punch_recovery;
                            this.hands_speed_timeouts[i] = 0;
                        } else {
                            this.weapon_data[i].rotate(this.hands_speeds[i] * time_delta, i % 2 == 1);
                            this.hands_speed_timeouts[i] -= time_delta;
                            if (this.hands_speed_timeouts[i] <= 0) {
                                this.hands_speed_timeouts[i] = random_float(...this.hands_speed_timeout_range);

                                this.hands_speeds[i] = random_float(...this.hands_speed_range) + random_float(...this.hands_speed_range) + random_float(...this.hands_speed_range);
                            }
                        }
                    }

                    break;
                }

                case "hand_open": {
                    let closest = board.balls.filter(ball => !ball.allied_with(this)).reduce((pb, ball) => {
                        let sqr_dist = ball.position.sqr_distance(this.position);
                        if (pb) {
                            return sqr_dist < pb[1] ? [ball, sqr_dist] : pb;
                        } else {
                            return [ball, sqr_dist];
                        }
                    }, null);
                    if (closest[1] > this.sqr_grab_ready_distance) {
                        this.hands_sprites[i] = "hand_neutral";
                        this.weapon_data[i].offset = new Vector2(32, 0);
                    } else {
                        // quickly move hand towards it 
                        this.weapon_data[i].offset = new Vector2(32, 0);
                        
                        // let sign = Math.sign(closest[0].position.angle(this.position));

                        // this.weapon_data[i].rotate(this.grab_seek_speed * sign * time_delta * (Math.PI / 180));
                    }

                    break;
                }
                
                case "hand_punch": {
                    this.punch_timeouts[i] -= time_delta;
                    this.weapon_data[i].offset = new Vector2(Math.max(96, 96 + -8 + ((this.punch_timeouts[i] * 8) / this.punch_recovery)), 0);
                    
                    make_hitboxes = this.punch_timeouts[i] >= this.punch_recovery - this.punch_active_duration;
                    
                    if (this.punch_timeouts[i] <= 0) {
                        this.hands_sprites[i] = "hand_neutral";

                        let pos = this.position.add(new Vector2(this.weapon_data[0].size_multiplier * 32, 0).rotate(this.weapon_data[0].angle));
                        let particle = new Particle(
                            pos, this.weapon_data[0].angle, 1, entity_sprites.get("hand_punch_particles"), 0, 0.2, false
                        )

                        // board.spawn_particle(particle, pos);

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = WEAPON_SIZE_MULTIPLIER * 0.5;
                        this.punch_timeouts[i] = random_float(...this.punch_timeout_range);
                    }

                    break;
                }

                case "hand_block": {
                    this.parry_delay -= time_delta;
                    this.weapon_data[i].offset = new Vector2(0, 0);
                    
                    if (this.parry_delay <= 0) {
                        this.hands_sprites[i] = "hand_neutral";

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = WEAPON_SIZE_MULTIPLIER * 0.5;
                    }

                    break;
                }

                case "hand_grab": {
                    // need to do a whole bunch of code here for the grab but for now just make sure the positions always match
                    this.grab_info[i].speed += 50 * time_delta;
                    this.weapon_data[i].rotate(rad2deg(this.grab_info[i].speed * time_delta), i % 2 == 1);
                    this.grab_info[i].rotated_so_far += this.grab_info[i].speed * time_delta;
                    // console.log(`Rotated ${rad2deg(this.grab_info[i].speed * time_delta)}deg, ${rad2deg(this.grab_info[i].amount_to_rotate - this.grab_info[i].rotated_so_far)}deg remaining`)

                    if (this.grab_info[i].rotated_so_far >= (this.grab_info[i].amount_to_rotate + (Math.PI / 8))) {
                        let rollback = this.grab_info[i].rotated_so_far - this.grab_info[i].amount_to_rotate;
                        this.weapon_data[i].rotate(rad2deg(rollback), i % 2 == 0);

                        // throw it. for now just drop it to show we're doing something
                        console.log("Thrown!");
                        this.hands_sprites[i] = "hand_neutral";
                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = WEAPON_SIZE_MULTIPLIER * 0.5;

                        // We can get the wall to select by getting the current angle of the weapon
                        this.grab_info[i].ball.hitstop = 1;

                        let vec = new Vector2(0, 1 * (i % 2 == 0 ? 1 : -1)).rotate(this.weapon_data[i].angle);
                        let new_position = this.grab_info[i].ball.position.copy();

                        if (Math.abs(vec.x) >= 0.5) {
                            // right or left
                            if (vec.x < 0) {
                                // left
                                new_position.x = this.grab_info[i].ball.radius;
                            } else {
                                // right
                                new_position.x = this.board.size.x - this.grab_info[i].ball.radius;
                            }
                        } else {
                            // up or down
                            if (vec.y < 0) {
                                // up
                                new_position.y = this.grab_info[i].ball.radius;
                            } else {
                                // down
                                new_position.y = this.board.size.y - this.grab_info[i].ball.radius;
                            } 
                        }

                        // now make particles along the way
                        let cpos = this.grab_info[i].ball.position;
                        let stopping = 2;
                        let times = 0;
                        let size_factor = this.grab_info[i].ball.radius / this.radius;
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

                        this.grab_info[i].ball.display = false;

                        board.set_timer(new Timer(
                            board => {
                                this.grab_info[i].ball.skip_physics = false;
                                this.grab_info[i].ball.display = true;

                                this.grab_info[i].ball.position = new_position;
                                this.grab_info[i].ball.lose_hp(this.grab_damage_impact);

                                play_audio("wall_smash");

                                let pos = this.grab_info[i].ball.position.sub(
                                    vec.mul(size_factor * 2 * this.grab_info[i].ball.radius)
                                )

                                let part = new Particle(
                                    pos, vec.angle() - (Math.PI /2),
                                    size_factor * 2, entity_sprites.get("explosion3"), 12, 
                                    999
                                );

                                board.spawn_particle(part, pos);
                            }, delay * (times-1)
                        ))

                        this.grab_info[i].ball.display = false;

                        this.velocity = (this.position.sub(this.grab_info[i].ball.position).normalize()).mul(this.grab_info[i].stored_velocity.magnitude());
                    } else {
                        let ballpos = this.position.add(this.get_weapon_offset(this.weapon_data[i]));
                        this.grab_info[i].ball.position = ballpos;
                        this.velocity = new Vector2(0, 0);

                        // special case for balls with particles
                        if (this.grab_info[i].ball.update_particles) {
                            this.grab_info[i].ball.update_particles(time_delta);
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
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // nothing
        this.block_hand(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        // nothing
        this.block_hand(with_weapon_index);
    }

    block_hand(with_weapon_index) {
        this.hands_sprites[with_weapon_index] = "hand_block";
        this.weapon_data[with_weapon_index].size_multiplier = WEAPON_SIZE_MULTIPLIER * 0.5;
        this.parry_delay = 0.5;
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
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

            other.velocity = new_other_velocity;

            other.invuln_duration *= 2;
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
        this.weapon_data[with_weapon_index].size_multiplier = WEAPON_SIZE_MULTIPLIER * 1;

        this.grab_info[with_weapon_index].ball = ball;
        ball.skip_physics = true;
        
        // find the target angle by looking at the situations on all four directions.
        // remember we're checking the ball's position, not our own
        let expected_grab_ball_offset = this.get_weapon_offset(this.weapon_data[with_weapon_index]);

        // rotate to 180deg and 270deg, and check distance from the board side bounds.
        // so for facing to the right, check up/down and that the ball would be in bounds
        // we always want to rotate at least 180deg, so start from the first cardinal angle >= 180deg
        let rotation_sign = with_weapon_index % 2 == 0 ? 1 : -1;

        let check_angle_begin = this.weapon_data[with_weapon_index].angle;
        let check_angle_diff = (Math.PI * (5/2) * rotation_sign) + (Math.sign(check_angle_begin) * ((Math.PI / 2) - (Math.abs(check_angle_begin) % (Math.PI / 2))));  // amount to rotate to get to the next cardinal angle
        let check_next = check_angle_diff;
        console.log("its grab time bitch");
        console.log(`Weapon index: ${with_weapon_index} (* ${rotation_sign})`);
        console.log(`Weapon angle is ${rad2deg(this.weapon_data[with_weapon_index].angle)}deg`);
        console.log(`Started at ${rad2deg(check_angle_begin)}deg`);
        console.log(`Beginning checks at ${rad2deg(check_next)}deg`);
        console.log(`So first composite rotation is ${rad2deg(check_angle_begin + check_next)}`);

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
                        console.log(`Found! Adding rotation ${rad2deg(angle_rotated)}deg`)
                        possible_rotations.push([check_next, angle_rotated]);
                    }
                }
            }

            angle_rotated += (Math.PI / 2);
            check_next += rotation_sign * (Math.PI / 2);
        }

        console.log("Got two rotations.");
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
            console.log(`${rad2deg(r[1])} (${rad2deg((r[1] * rotation_sign) + check_angle_begin) % 360}, ${vec.toString()}) has result ${result} (${coord} <=> ${target})`)
            // we want as much distance as possible
            if (result-50 > best[1]) {
                best = [r, result];
            }
        })

        console.log(`Got our best rotation - ${rad2deg(best[0][1])}`);
        console.log(`So will rotate from ${rad2deg(check_angle_begin)}deg to ${rad2deg(check_angle_begin + (best[0][1] * rotation_sign))}`);

        this.grab_info[with_weapon_index].amount_to_rotate = best[0][1];
        this.grab_info[with_weapon_index].rotated_so_far = 0;
        this.grab_info[with_weapon_index].speed = 0;
        this.grab_info[with_weapon_index].stored_velocity = this.velocity;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        write_text(
            ctx, `Hand`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        if (this.level >= AWAKEN_LEVEL) {
            write_text(
                ctx, `Hand...`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 10
            )
        }
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

    hit_other_projectile(other_projectile) {
        if (other_projectile instanceof MagnumProjectile) {
            return;
        }

        super.hit_other_projectile(other_projectile);
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
                ball.rupture_intensity += 5 * this.intensity * delta_time;
                break;
            }

            case 1: {
                // poison
                let dur = 2.5 * this.intensity * delta_time;
                ball.poison_duration = Math.max(ball.poison_duration + dur, dur);
                ball.poison_intensity += 1.5 * this.intensity * delta_time;
                break;
            }

            case 2: {
                // damage
                ball.lose_hp(7 * this.intensity * delta_time);
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