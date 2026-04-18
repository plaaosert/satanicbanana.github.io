class ShivBall extends WeaponBall {
    static ball_name = "Shiv";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Shiv";
        this.description_brief = "Has a shiv which is periodically thrown. The shiv applies rupture equal to damage while thrown and bounces once on hit or parry.";
        this.level_description = "Increases shiv throw and reload frequency.";
        this.max_level_description = "The thrown shiv reflects off walls up to twice.";
        this.quote = "I'm gonna getcha! Hehehehe!";

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

        this.max_hp = 30;
        this.hp = 30;

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

let campaign_low_tier_selectable_balls = [
    ShivBall,
]