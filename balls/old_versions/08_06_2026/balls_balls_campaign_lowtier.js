class ShivBall extends WeaponBall {
    static ball_name = "Shiv";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Shiv";
        this.description_brief = "Has a shiv which is periodically thrown. The shiv applies rupture equal to damage while thrown and bounces once on hit or parry.";
        this.level_description = "Increases shiv throw and reload frequency.";
        this.max_level_description = "The thrown shiv reflects off walls up to twice.";
        this.quote = "I'm gonna getcha! Hehehehe!";

        this.pronoun = PRONOUN.HE;
        this.tagline = "A bloodthirsty and wicked ball stopped only by the fact that he was born under three months ago.";
        this.description = ""
        this.lore_description = "In recent times, prospective Arena combatants have been warned of a terrifying entity named Shiv, so violent and terrible that his time in the Arena isn't a job but a prison sentence... until they actually fight him and realise those rumours were actually about Dagger. Shiv might one day hold that reputation too, though, if his parents don't step in soon."
        this.weapon_relationship = "Hahahahahaha!! Blood! Kill! Death! Hehehehehe!!"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Deranged"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "16th Jun"

        this.default_colour = Colour.from_hex("#da2532")

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

        // scales based on STARTING_HP
        this.max_hp = this.max_hp * (30 / 100);
        this.hp = this.max_hp;

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

class BallBall extends WeaponBall {
    static ball_name = "Ball";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        // TODO this one should multi-awaken in campaign, having no level cap
        this.name = "Ball";
        this.description_brief = "Throws random mini-balls. Mini-balls bounce around and damage the first enemy they hit. Mini-balls are destroyed after hitting or getting hit by anything.";
        this.level_description = "Reduces throw delay.";
        this.max_level_description = "Every 100 levels, gains a new ball thrower, multiplies all damage output by 1.5x and increases max HP by 25.";
        this.quote = "...";

        this.pronoun = PRONOUN.IT;
        this.tagline = "An amalgamation of ball concept that seems to never stop growing.";
        this.description = "This ball may be able to break past level 100..."
        this.lore_description = "In the annals of history, the story of Ball has served as a cautionary reminder of why tethering another ball must never be attempted. Though the process would usually result in mutual annihilation, it was not so for Ball, who stayed alive, but more as a natural force than a conscious being. Who tethered who in the beginning is, at this point, mostly immaterial - besides, many thousands of balls have since been absorbed into the tether, despite ballkind's attempts to destroy it. Though waning belief in it has weakened it, the hushed stories told over campfires keep it alive. A run in the Grand Arena might be enough to bring it to power levels never known, even in the depths of history - but nobody would be fool enough to let that happen!"
        this.weapon_relationship = "..."
        this.lore_origin = "Beginning of Time"
        this.lore_temperament = "Hungry"
        this.lore_affiliation = "Independent"
        this.lore_alignment = "green"
        this.lore_birthday = "Unknown"

        this.default_colour = Colour.from_hex("#5062e5")

        this.awaken_tier = Math.floor((this.level+1) / 100);

        this.tier = [
            TIERS.C,
            TIERS.B,
            TIERS.A, TIERS.APLUS,
            TIERS.S, TIERS.SPLUS,
            TIERS.X
        ][Math.min(6, this.awaken_tier)]

        this.category = CATEGORIES.LOWTIER;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.level_limit = 999;

        this.weapon_data = [
            
        ];

        for (let i=0; i<(this.awaken_tier+1); i++) {
            this.weapon_data.push(new BallWeapon(0.75, "ballball_red", [
                // {pos: new Vector2(16, 64), radius: 64},
            ]));

            this.weapon_data[i].offset = new Vector2(-32, 0);
            this.weapon_data[i].reversed = i%2==1;
        }

        this.possible_cols = [
            "red", "yellow", "green", "blue", "orange", "dgreen",
            "seagreen", "magenta", "violet", "pink"
        ];

        this.get_new_cols();

        // scales based on STARTING_HP
        this.max_hp = this.max_hp * ((25 * (1 + (this.awaken_tier))) / 100) + 25;
        this.hp = this.max_hp;

        this.damage_base = 1 * Math.pow(1.5, this.awaken_tier);

        this.base_speed = 200;

        let throw_reduction = (100/99) * 0.001 * this.level;
        this.throw_cooldowns_max = [Math.max(0.1, 0.7-throw_reduction), Math.max(0.1, 1.6-throw_reduction)];
        this.throw_cooldowns = new Array(this.weapon_data.length).fill(0).map(_ => {
            return random_float(...this.throw_cooldowns_max, this.board.random);
        });
    }

    get_new_cols() {
        this.cur_cols = new Array(this.weapon_data.length).fill("red");

        for (let i=0; i<this.weapon_data.length; i++) {
            this.get_new_col(i);
        }
    }

    get_new_col(index) {
        this.cur_cols[index] = seeded_random_from_array(this.possible_cols, this.board.random)
        this.weapon_data[index].sprite = `ballball_${this.cur_cols[index]}`;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.base_speed * time_delta);
            this.throw_cooldowns[i] -= time_delta;
            if (this.throw_cooldowns[i] <= 0) {
                this.throw_cooldowns[i] += random_float(...this.throw_cooldowns_max, this.board.random);

                let position = this.get_weapon_offset(i).add(this.position);
                let velocity = new Vector2(8000 * random_float(0.5, 2, this.board.random), 0).rotate(this.weapon_data[i].angle)
                let new_ball = new BallBallBall(
                    this.board,
                    this.mass * 0.25, this.radius * 0.5, this.colour,
                    this.bounce_factor, this.friction_factor,
                    this.player, this.level, this.cur_cols[i]
                )

                new_ball.apply_invuln(BALL_INVULN_DURATION);
                new_ball.show_stats = false;

                new_ball.set_velocity(velocity);
                new_ball.parent = this;

                let part = new Particle(position, 0, 0.75, entity_sprites.get(`ballball_${this.cur_cols[i]}`), 0, 999999);
                board.spawn_particle(part, position);
                new_ball.linked_particle = part;
                part.rotation_angle = this.weapon_data[i].angle;
                
                board.spawn_ball(new_ball, position);
                
                this.get_new_col(i);
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `More ball throwers (${this.weapon_data.length}) and ${this.damage_base}x damage.`, true
            )
        } else {
            this.write_desc_line(
                `Periodically throws balls.`
            )
        }
    }
}

class BallBallBall extends WeaponBall {
    static ball_name = "BallBall Ball";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, ballcolour) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "BallBall Ball";
        this.description_brief = "Fired from the ball ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [
            new BallWeapon(0.75, `ballball_${ballcolour}`, [
                {pos: new Vector2(64, 64), radius: 25},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-69, 0);

        this.lifetime = 0;
        this.duration = Number.POSITIVE_INFINITY;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = random_float(240, 480);
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        let result = this.parent.hit_other(other, with_weapon_index);
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

let campaign_low_tier_selectable_balls = [
    ShivBall, BallBall
]