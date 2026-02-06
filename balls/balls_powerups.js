class Powerup extends WeaponBall {
    static ball_name = "Generic Powerup";
    static sprite_name = "empty";
    
    static burst_sprite = "white";
    static burst_line_col = new Colour(128, 128, 128, 255);

    static title = "Generic";
    static desc = "This shouldn't be here";

    constructor(board, base_radius, radius_mul) {
        super(board, 0.00001, base_radius * radius_mul, Colour.white, 1, 1, make_default_player(-3), 0, false, true);

        this.name = "Generic Powerup";
        this.show_stats = false;

        this.hp = 100000;
        this.max_hp = 100000;

        this.ignore_bounds_checking = true;

        this.linked_particle = null;

        this.base_radius = base_radius;
        this.radius_mul = radius_mul;

        this.grant_powerup_to = null;

        this.display = false;

        this.collides_cooldown = 0.2;
        this.collision = false;
    }

    late_setup() {
        super.late_setup();

        let part = new Particle(
            this.position, 0, 0.5 * this.radius_mul,
            entity_sprites.get(`powerup_${this.constructor.sprite_name}`), 0, 999999
        );
        this.board.spawn_particle(part, this.position);
        this.linked_particle = part;
    }

    powerup_movement(board, time_delta) {
        this.velocity = Vector2.zero;
        this.position = this.position.add(new Vector2(0, -1024 * time_delta));
    }

    collides_countdown(time_delta) {
        if (!this.collision && this.board.in_bounds(this.position)) {
            this.collides_cooldown -= time_delta;
            if (this.collides_cooldown <= 0) {
                this.collision = true;
            }
        }
    }

    weapon_step(board, time_delta) {
        this.powerup_movement(board, time_delta);
        this.collides_countdown(time_delta);

        this.linked_particle.position = this.position;
    }

    collide_ball(other) {
        this.grant_powerup_to = other;
        while (this.grant_powerup_to.parent) {
            this.grant_powerup_to = this.grant_powerup_to.parent;
        }

        this.hp = 0;
    }

    get_hit(source, damage, hitstop, invuln=null, round_up=true) {
        // do not call super, all we care about is dying now
        this.grant_powerup_to = source;
        while (this.grant_powerup_to.parent) {
            this.grant_powerup_to = this.grant_powerup_to.parent;
        }

        this.hp = 0;

        // don't want it to count as a kill
        return {dmg: 0, dead: false};
    }

    apply_powerup(board, to) {
        // do nothing
        board.spawn_particle(new Particle(
            to.position, 0, 0.75, entity_sprites.get("explosion_small"), 12, 3, false
        ), to.position);
    }

    die() {
        // kill own particles and make death sprite
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.9 * this.radius_mul, entity_sprites.get("explosion_small"), 12, 3, false
        ), this.position);

        // grant powerup to ball
        if (this.grant_powerup_to) {
            for (let i=0; i<8; i++) {
                let part = new EnergyBurstParticle(
                    this.position, 0.6, entity_sprites.get(`powerup_burst_${this.constructor.burst_sprite}`),
                    0, 9999, false, random_float(20000, 30000, this.independent_random), 120000,
                    this.grant_powerup_to, this.constructor.burst_line_col, 4, 1.25, 0, true
                );

                this.board.spawn_particle(part, this.position);
            }

            let apply_to = this.grant_powerup_to;
            this.board.set_timer(new Timer(board => {
                this.apply_powerup(board, apply_to);
            }, BASE_HITSTOP_TIME * 2))
        }

        play_audio("zol", 1);

        return {skip_default_explosion: true};
    }
}

class PowerupCoinBlast extends Powerup {
    static ball_name = "Coin Blast Powerup";
    static sprite_name = "coin_blast";
    
    static burst_sprite = "gold";
    static burst_line_col = new Colour(255, 242, 0, 255);

    static title = "Coin Blast";
    static desc = "Fire useless money in all directions.";

    constructor(board, base_radius, radius_mul) {
        super(board, base_radius, radius_mul);

        this.name = "Coin Blast Powerup";

        this.wave_mag = 4096;
        this.wave_amt = Math.sin(0) * this.wave_mag;
    }

    powerup_movement(board, time_delta) {
        this.velocity = Vector2.zero;

        this.wave_amt = Math.sin((this.lifetime+1) * 2) * this.wave_mag;

        this.position = this.position.add(new Vector2(this.wave_amt, -2048).mul(time_delta));
    }

    apply_powerup(board, to) {
        // do nothing
        play_audio("slot_win");
        
        let times = 0;
        let times_max = 240;
        board.set_timer(new Timer(b => {
            if (times < times_max) {
                times++;

                let proj = new MagnumCoinProjectile(
                    b, to, 999, to.position, 2, 1,
                    random_on_circle(1, b.random),
                    random_float(6000, 12000, b.random),
                    b.gravity
                )

                proj.can_hit_allied = false;
                proj.can_hit_source = false;
                proj.can_hit_source_projs = false;

                b.spawn_projectile(proj, to.position);

                return true;
            }

            return false;
        }, 0.01, true))
    }
}

class PowerupEnhancement extends Powerup {
    static ball_name = "Enhancement Powerup";
    static sprite_name = "enhancement";
    
    static burst_sprite = "pink";
    static burst_line_col = new Colour(198, 27, 228, 255);

    static title = "Enhancement";
    static desc = "Gain double defense and attack speed.";

    constructor(board, base_radius, radius_mul) {
        super(board, base_radius, radius_mul);

        this.name = "Enhancement Powerup";

        this.dir = Vector2.zero;
        this.dir_timeout_max = [0.2, 0.8];
        this.dir_timeout = this.dir_timeout_max[0];
        this.vels = [2000, 4000];
        this.vel = this.vels[0];
    }

    late_setup() { 
        super.late_setup();

        this.dir = this.get_dir();
    }

    get_dir() {
        let from_center = this.board.size.mul(0.5).sub(this.position);
        let from_center_mag = from_center.magnitude() + Number.EPSILON;
        let from_center_vec = from_center.div(from_center_mag);

        return random_on_circle(1, this.board.random).add(new Vector2(0, -1)).add(
            from_center_vec.mul(from_center_mag * 0.01)
        ).normalize();
    }

    powerup_movement(board, time_delta) {
        this.velocity = Vector2.zero;

        this.dir_timeout -= time_delta;
        if (this.dir_timeout <= 0) {
            this.dir_timeout = random_float(...this.dir_timeout_max, this.board.random);
            this.dir = this.get_dir();
            this.vel = random_float(...this.vels, this.board.random);
        }

        this.velocity = this.dir.mul(this.vel);
    }

    apply_powerup(board, to) {
        // do nothing
        play_audio("EsperRoar", 0.2);
        
        // new_player_settings.stats.damage_bonus *= 2;
        to.temp_stat_modifiers.defense_bonus *= 2;
        to.temp_stat_modifiers.ailment_resistance *= 2;
        to.temp_stat_modifiers.timespeed_mult *= 2;

        let particles_angle_diff = deg2rad(22.5);
        let dur = 10;
        let num = 4;

        for (let i=num-1; i>=0; i--) {
            let pos = to.position;
            let part = new OrbitingParticle(
                pos, 0, 2 * ((num-i)/num), entity_sprites.get("powerup_enhancement_star"),
                0, dur, false, to, Math.PI * 2, 1.5, particles_angle_diff * i
            )

            board.spawn_particle(part, pos);
        }

        board.set_timer(new Timer(b => {
            // return stats to normal
            to.temp_stat_modifiers.defense_bonus /= 2;
            to.temp_stat_modifiers.ailment_resistance /= 2;
            to.temp_stat_modifiers.timespeed_mult /= 2;
        }, dur))
    }
}

class PowerupGift extends Powerup {
    static ball_name = "Gift Powerup";
    static sprite_name = "gift";
    
    static burst_sprite = "red";
    static burst_line_col = new Colour(228, 27, 37, 255);

    static title = "Gift";
    static desc = "Summon some helpful minions.";

    constructor(board, base_radius, radius_mul) {
        super(board, base_radius, radius_mul);

        this.name = "Gift Powerup";
    }

    late_setup() { 
        super.late_setup();

        this.velocity = random_on_circle(1, this.board.random).add(new Vector2(0, -2)).normalize().mul(10000);
    }

    powerup_movement(board, time_delta) {
        if (this.position.y < (this.board.size.y - this.radius)) {
            this.ignore_bounds_checking = false;
        }
    }

    apply_powerup(board, to) {
        // do nothing
        play_audio("FullHealthItemA", 0.4);
        
        let n = 3;
        let protos = [SordBall, HammerBall, BowBall]
        for (let i=0; i<n; i++) {
            let new_ball = new protos[i](
                board, to.mass * 0.6, to.radius * 0.6, to.colour,
                to.bounce_factor, to.friction_factor, to.player, 0,
                i % 2 == 0
            )

            let pos = to.position.add(new Vector2(1, 0).mul(to.radius * 2).rotate(deg2rad(360 * (i/n))));

            board.spawn_particle(new Particle(
                pos, 0, 0.6, entity_sprites.get("explosion_small"),
                12, 3, false
            ), pos);

            new_ball.add_velocity(to.position.sub(pos).mul(5));

            new_ball.show_stats = false;
            new_ball.die = () => {
                board.spawn_particle(new Particle(
                    new_ball.position, 0, 0.6, entity_sprites.get("explosion_small"), 16, 3, false
                ), new_ball.position);

                return {skip_default_explosion: true};
            }

            new_ball.max_hp = 25;
            new_ball.hp = 25;

            new_ball.apply_burn(new_ball, 2.5, "");

            board.spawn_ball(new_ball, pos);
        }
    }
}

class PowerupHeal extends Powerup {
    static ball_name = "Heal Powerup";
    static sprite_name = "heal";
    
    static burst_sprite = "green";
    static burst_line_col = new Colour(94, 228, 27, 255);

    static title = "Heal";
    static desc = "Receive significant healing.";

    constructor(board, base_radius, radius_mul) {
        super(board, base_radius, radius_mul);

        this.name = "Heal Powerup";
    }

    late_setup() { 
        super.late_setup();
    }

    powerup_movement(board, time_delta) {
        this.velocity = new Vector2(0, -(this.position.y - (board.size.y / 2)) * 2);
    }

    apply_powerup(board, to) {
        // do nothing
        play_audio("BlueMagic", 0.2);
        
        let part = new Particle(
            to.position, 0, 2, entity_sprites.get("healing_burst"),
            12, 2, false, 0, true
        );
        part.lifetime += 0.05;
        board.spawn_particle(part, to.position)

        to.gain_hp(25, to);
    }
}

class PowerupRock extends Powerup {
    static ball_name = "Rock Powerup";
    static sprite_name = "rock";
    
    static burst_sprite = "rock";
    static burst_line_col = new Colour(255, 255, 255, 255);

    static title = "Rock";
    static desc = "Cause a landslide of dangerous rocks!";

    constructor(board, base_radius, radius_mul) {
        super(board, base_radius, radius_mul);

        this.name = "Rock Powerup";
    }

    late_setup() { 
        super.late_setup();

        this.position.y -= this.board.size.y * 1.5;
        this.bounce_factor = 0.4;
        this.friction_factor = 0.4;

        this.velocity = random_on_circle(1, this.board.random).add(new Vector2(0, 2)).normalize().mul(10000);
    }

    powerup_movement(board, time_delta) {
        if (this.position.y > this.radius) {
            this.ignore_bounds_checking = false;
        }
    }

    apply_powerup(board, to) {
        // do nothing
        play_audio("earthquake", 0.2);
        
        let rock_freq = 0.1;
        let rock_chance = 0.2;
        let total_dur = 8;

        let start_time = board.duration;
        this.board.set_timer(new Timer(b => {
            if (b.duration > start_time + total_dur) {
                return false;
            }

            if (b.random() < rock_chance) {
                let pos = new Vector2(random_float(0, b.size.x, b.random), -500);
                let proj = new RockPowerupProjectile(
                    b, to, 999, pos, 2,
                    random_float(0.3, 0.6, b.random),
                    new Vector2(1, 0).rotate(deg2rad(random_float(-45, 45, b.random))), 0
                )

                b.spawn_projectile(proj, pos);
            }

            return true;
        }, rock_freq, true));
    }
}

class RockPowerupProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    
        this.sprite = "rock";
        this.set_hitboxes([
            {pos: new Vector2(32, 0), radius: 36},
            {pos: new Vector2(0, 0), radius: 30},
            {pos: new Vector2(-32, 0), radius: 24},
        ]);

        this.fall_dir = new Vector2(0, 1);
        this.velx = Vector2.zero;
        this.rot = 0;

        this.parriable = false;

        this.hit_ground = false;
    }

    hit_other_projectile(other_projectile) {
        this.active = true;
    }

    get_parried(by) {
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        ball.set_velocity(ball.velocity.add(new Vector2(0, 10000)).normalize().mul(ball.velocity.magnitude()));

        this.active = true;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add((this.fall_dir.mul(this.speed).add(this.velx)).mul(time_delta)));
        if (this.rot) {
            let new_dir = this.direction.rotate(this.rot * time_delta);
            this.set_dir(new_dir);
        }

        this.speed += 10000 * time_delta;
        if (!this.hit_ground && this.position.y >= this.board.size.y) {
            this.hit_ground = true;
            this.speed *= -0.6;

            this.velx = new Vector2(-random_float(500, 1500, this.board.random) * this.direction_angle / (Math.PI * 0.25), 0);

            // this.velx = new Vector2(random_float(-2000, 2000, this.board.random), 0);
            this.rot = -this.direction_angle;
        }
    }
}

const DEFAULT_POWERUPS_POOL = balance_weighted_array([
    [1, PowerupCoinBlast],
    [1, PowerupEnhancement],
    [0.5, PowerupGift],
    [1, PowerupHeal],
    [0.5, PowerupRock],
])