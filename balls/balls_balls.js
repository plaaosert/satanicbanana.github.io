const AWAKEN_LEVEL = 7;

class BallWeapon {
    constructor(size_multiplier, sprite, hitboxes) {
        this.size_multiplier = size_multiplier * 16;
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

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
        this.level = level;
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
        
        this.hp -= final_damage;
        this.invuln_duration = Math.max(this.invuln_duration, BALL_INVULN_DURATION);
        this.hitstop = Math.max(this.hitstop, hitstop);

        return {dmg: final_damage, dead: this.hp <= 0};
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit_by_projectile(with_projectile.damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        
        this.hitstop = Math.max(this.hitstop, hitstop);

        result.hitstop = hitstop;
        return result;
    }

    get_hit_by_projectile(damage, hitstop) {
        return this.get_hit(damage, hitstop);
    }

    parry_weapon(other_ball, other_weapon_id) {
        // nothing
    }

    parry_projectile(projectile) {
        // nothing
    }

    get_projectile_parried(projectile) {
        // nothing
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
        this.level_description = "Makes the hammer even bigger and deal even more damage.";
        this.max_level_description = "Adds another smaller hammer that swings independently and faster, dealing half damage.";

        this.weapon_data = [
            new BallWeapon(1 + (level * 0.02), "hamer", [
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

        let result = super.hit_other(other, with_weapon_index, this.damage_base);

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

        this.damage_base += 0.5 * (1 + (this.level * 0.25));
        this.speed_base += (45 / 4) * (1 + (this.level * 0.25));

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
        this.max_level_description = "When rotation speed is below 1000 deg/s, cannot parry or be parried.";

        this.weapon_data = [
            new BallWeapon(1, "dagger", [
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 68), radius: 12},
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(16, 56), radius: 12},
                {pos: new Vector2(0, 48), radius: 12},
            ])
        ];

        this.damage_base = 1;
        this.speed_base = 360;

        this.hit_decay = 0;
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
            this.weapon_data[0].unparriable = this.speed_base < 1000;
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
                ctx, `Parrying: ${this.weapon_data[0].unparriable ? "No" : "Yes"}`, x_anchor, y_anchor + 60, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
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
        this.max_level_description = "Start with +1 multishot. Parried shots count for 1/2 of an arrow hit.";

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

            board.spawn_projectile(
                new ArrowProjectile(
                    this, 0, fire_pos, this.proj_damage_base, 1 * this.arrow_size_mult,
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-7, 7) * (Math.PI / 180))),
                    this.arrow_speed, this.velocity.mul(0)
                ), fire_pos
            )
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other_with_projectile(other, with_weapon_index, this.damage_base);

        this.multishots_levelup_req--;
        if (this.multishots_levelup_req <= 0) {
            this.multishots_max++;
            this.proj_damage_base += 1;

            this.multishots_levelup_req = Math.max(1, this.multishots_max * this.multishots_max * 0.333);
        }

        return result;
    }

    get_projectile_parried(projectile) {
        if (this.level >= 7) {
            this.multishots_levelup_req -= 0.5;
            if (this.multishots_levelup_req <= 0) {
                this.multishots_max++;
                this.proj_damage_base += 1;

                this.multishots_levelup_req = Math.max(1, this.multishots_max * this.multishots_max * 0.333);
            }
        }
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
                ctx, `Parried shots count as 1/2 an arrow hit.`, x_anchor, y_anchor + 84, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 10
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
        this.max_level_description = "Coins can't be parried.";

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),

            new BallWeapon(1.5, "coin_weapon", [

            ])
        ];

        this.weapon_data[1].reverse();

        this.firing_offsets = [
            new Vector2(156, -16),
            new Vector2(16, 0)
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
        this.rotate_weapon(1, this.speed_base * time_delta);

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
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos),
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

            if (this.level >= AWAKEN_LEVEL) {
                coin_obj.parriable = false;
            }

            board.spawn_projectile(
                coin_obj, coin_fire_pos
            )
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other_with_projectile(other, with_weapon_index, this.damage_base);

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
                ctx, `Coins can't be parried.`, x_anchor, y_anchor + 72, this.colour.lerp(Colour.white, 0.5).css(), "MS Gothic", 12
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
        this.size = size * 16;
        this.direction = direction;
        this.direction_angle = this.direction.angle();

        this.speed = speed;

        this.sprite = "arrow";

        // {pos, radius} same as balls
        this.hitboxes = [];

        this.parriable = true;

        this.board = null;
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

    hit_ball(ball) {
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

    hit_ball(ball) {
        this.active = true;
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
        if (this.ricochets > 1) {
            this.sprite_colour = Colour.yellow.lerp(Colour.red, Math.min(1, (this.ricochets-1) / 3)).css();
            this.parriable = false;
        }
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