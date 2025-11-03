game_id = "balls";

const layer_names = [
    "front",
    "debug_front",
    "debug_back",
    "ui1",
    "ui2",
    "fg1",
    "fg2",
    "fg3",
    "bg1",
    "bg2",
    "bg3"
]

let imgs = {};

const prerender_canvas = document.getElementById("hidden-prerender-canvas");
const prerender_ctx = prerender_canvas.getContext("2d");

let num_textures_loaded = 0;
let num_textures_needed = 0;

const entity_sprites = new Map(["SORD", "hamer", "dagger", "bow", "arrow"].map((v, i) => {
    let ts = [];

    let t = new Image(128, 128);
    t.src = `img/weapon/${v}.png`;
    t.style.imageRendering = "pixelated";

    num_textures_needed++;
    t.addEventListener("load", function() {
        num_textures_loaded++;
    })

    ts.push(t);

    return [v, ts]
}));

const fps = 144;

let layers = {};
let keys_down = {};

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);

const PHYS_GRANULARITY = 1280;
const COLL_GRANULARITY = 128;  // COLL_GRANULARITY => do collision checks every N physics steps
const DEFAULT_BALL_RESTITUTION = 1;
const DEFAULT_BALL_FRICTION = 1;

const BASE_HITSTOP_TIME = 0.15;
const HITSTOP_DELTATIME_PENALTY = 0.01;
const BALL_INVULN_DURATION = 0.1;

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();
let framecount = 0;

let audio = new Map();
let audio_context = new AudioContext();

async function load_audio_item(path) {
    let resp = await fetch(`https://plaao.net/balls/${path}`);
    let array_buffer = await resp.arrayBuffer();

    let audio_buffer = await audio_context.decodeAudioData(array_buffer);

    return audio_buffer;
}

async function load_audio() {
    // ultrakill
    audio.set("parry", await load_audio_item('snd/parry.mp3'));
    // https://pixabay.com/sound-effects/punch-04-383965/
    audio.set("impact", await load_audio_item('snd/impact.mp3'));
    // https://pixabay.com/sound-effects/stick-hitting-a-dreadlock-small-thud-83297/
    audio.set("thud", await load_audio_item("snd/thud.mp3"));
}

function play_audio(name) {
    let source = audio_context.createBufferSource();
    
    source.buffer = audio.get(name);

    source.connect(audio_context.destination);

    source.start();
}

class Board {
    constructor(size) {
        this.size = size;
        this.balls = [];
        this.lines = [
            // corner walls
            {
                // ax + by + c = 0
                id: 0,

                a: 1,
                b: 0,
                c: 0,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 0,

                a: 1,
                b: 0,
                c: -10000,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 1,

                a: 0,
                b: 1,
                c: 0,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 1,

                a: 0,
                b: 1,
                c: -10000,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            }
        ]

        // this.gravity = new Vector2(0, 0);
        this.gravity = new Vector2(0, 9810);
    }

    spawn_ball(ball, position) {
        ball.position = position;
        this.balls.push(ball);

        return ball;
    }

    remove_ball(ball) {
        this.balls.splice(
            this.balls.findIndex(b => b.id == ball.id), 1
        )
    }

    physics_step(time_delta) {
        // make the balls move
        this.balls.forEach(ball => {
            // if the ball is in a wall, wake it up by force
            if (ball.position.x - ball.radius < -0.1 || ball.position.x + ball.radius > this.size.x+0.1 || ball.position.y + ball.radius > this.size.y+0.1) {

            }

            ball.physics_step(time_delta);
        })

        // then, apply gravity
        this.balls.forEach(ball => {
            if (!ball.at_rest) {
                let time_delta_factor = 1;
                if (ball.hitstop > 0) {
                    time_delta_factor *= HITSTOP_DELTATIME_PENALTY;
                }

                ball.add_impulse(this.gravity.mul(time_delta * time_delta_factor).mul(ball.mass));
            }
        })

        // any air drag?

        // check for all collisions. for each collision, calculate
        let collisions = [];
        let collisions_found = new Set();

        let sthis = this;
        this.balls.forEach(ball1 => {
            sthis.balls.forEach(ball2 => {
                if (ball1.id == ball2.id) {
                    return;
                }

                if (ball1.collides(ball2)) {
                    let coll_id = ball1.id + "," + ball2.id;
                    let coll_id2 = ball2.id + "," + ball1.id;

                    if (!collisions_found.has(coll_id) && !collisions_found.has(coll_id2) && (!ball1.at_rest || !ball2.at_rest)) {
                        collisions.push({first: ball1, second: ball2});

                        collisions_found.add(coll_id);
                        collisions_found.add(coll_id2);
                    }
                }
            })
        })

        collisions.forEach(coll => {
            coll.first.resolve_collision(sthis, coll.second);
        })

        // check wall and ground bounces
        this.balls.forEach(ball => {
            /*
            ball.check_ground_bounce(sthis);
            ball.check_ceiling_bounce(sthis);
            ball.check_sides_bounce(sthis);
            */
            sthis.lines.forEach(line => {
                if (ball.collides_line(line)) {
                    ball.resolve_line_collision(sthis, line);
                }
            })
        })

        // force everything back in bounds
        this.balls.forEach(ball => {
            ball.position.x = Math.max(ball.radius, Math.min(this.size.x - ball.radius, ball.position.x));
            ball.position.y = Math.max(ball.radius, Math.min(this.size.y - ball.radius, ball.position.y));
        });
    }
}

class Ball {
    static id_inc = 0;

    constructor(mass, radius, colour, bounce_factor, friction_factor) {
        this.id = Ball.id_inc;
        Ball.id_inc++;
        
        this.position = new Vector2(0, 0);
        this.mass = mass; // g
        this.radius = radius;  // m

        this.colour = colour;

        this.bounce_factor = bounce_factor ? bounce_factor : DEFAULT_BALL_RESTITUTION;  // [0.0, 1.0]
        this.friction_factor = friction_factor ? friction_factor : DEFAULT_BALL_FRICTION; // [0.0, 1.0]

        this.velocity = new Vector2(0, 0);  // m/s
        this.acceleration = new Vector2(0, 0);

        this.rest_counter = 0;
        this.at_rest = false;
        this.rest_threshold = PHYS_GRANULARITY * 64;

        this.last_pos = new Vector2(0, 0);
    }

    set_pos(to) {
        this.position = to;
        this.disable_rest();

        return this;
    }

    add_pos(by, ignore_rest) {
        this.position = this.position.add(by);

        if (!ignore_rest) {
            this.disable_rest();
        }
    }

    disable_rest() {
        // this.at_rest = false;
        // this.rest_counter = 0;
    }

    add_impulse(force) {  // g-m/s
        // p=mv
        // dv = I/m
        this.add_velocity(force.div(this.mass));
        this.at_rest = false;
        this.rest_counter = 0;
    }

    set_velocity(vel) {
        this.velocity = vel;
        
        if (vel.sqr_magnitude() > 0) {
            this.disable_rest();
        }
    }

    add_velocity(vel, ignore_rest) {
        this.velocity = this.velocity.add(vel);

        if (vel.sqr_magnitude() > 0 && !ignore_rest) {
            this.disable_rest();
        }
    }

    physics_step(time_delta) {
        if (!this.at_rest) {
            this.add_pos(this.velocity.mul(time_delta), true);

            if (true) {
                let friction_force = Math.min(this.velocity.magnitude(), this.mass * this.friction_factor * time_delta * 0);
                this.velocity = this.velocity.sub(this.velocity.mul(friction_force));
            } else {
                this.velocity = this.velocity.mul(Math.pow(this.friction_factor, 1/PHYS_GRANULARITY))
            }
        } else {
            this.set_velocity(new Vector2(0, 0));
        }

        let threshold = 0.05 * (time_delta / PHYS_GRANULARITY);
        if (this.last_pos.sqr_distance(this.position) < threshold) {
            this.rest_counter++;
            if (this.rest_counter >= this.rest_threshold && !this.at_rest) {
                // this.at_rest = true;
                // console.log(this, "entered rest");
            }
        } else {
            this.at_rest = false;
            this.rest_counter = 0;
        }

        this.last_pos = this.position;
    }

    check_ground_bounce(board) {
        // roll back the ball by velocity until the point at which it touches the ground
        // (get the distance of the ball from the ground, then multiply velocity by the number that makes distance equal radius and sub that from position)
        // then multiply by coeff. of restitution -1
        let dist = board.size.y - this.position.y - 33;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.y) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.y;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.y = board.size.y - this.radius - 33;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.y *= -this.bounce_factor;
            } else {
                this.velocity.y = 0;
            }

            this.velocity.x *= this.friction_factor;
        }
    }

    check_ceiling_bounce(board) {
        // roll back the ball by velocity until the point at which it touches the ground
        // (get the distance of the ball from the ground, then multiply velocity by the number that makes distance equal radius and sub that from position)
        // then multiply by coeff. of restitution -1
        let dist = this.position.y - 21;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.y) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.y;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.y = 21 + this.radius;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.y *= -this.bounce_factor;
            } else {
                this.velocity.y = 0;
            }

            this.velocity.x *= this.friction_factor;
        }
    }

    check_left_bounce(board) {
        let dist = this.position.x - 21;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.x) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.x;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.x = 21 + this.radius;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.x *= -this.bounce_factor;
            } else {
                this.velocity.x = 0;
            }

            this.velocity.y *= this.friction_factor;
        }
    }

    check_right_bounce(board) {
        let dist = board.size.x - 33 - this.position.x;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.x) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.x;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.x = board.size.x - this.radius - 33;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.x *= -this.bounce_factor;
            } else {
                this.velocity.x = 0;
            }

            this.velocity.y *= this.friction_factor;
        }
    }

    check_sides_bounce(board) {
        this.check_left_bounce(board);
        this.check_right_bounce(board);
    }

    collides_line(line) {
        // a line is given mathematically as ax+by+c=0, with optional limits of x and/or y
        // we naively get the distance and treat the line as fully 2d (so it cannot collide on the side).
        // the only two cases we care about is "in front" and "behind" the line

        // check coordinate bounds
        // it's out of bounds if its position minus radius is > greater bound or position plus radius < lower bound
        if (line.lbx && this.position.x + this.radius < line.lbx) {
            return false;
        }

        if (line.lby && this.position.y + this.radius < line.lby) {
            return false;
        }

        if (line.ubx && this.position.x - this.radius > line.ubx) {
            return false;
        }

        if (line.uby && this.position.y - this.radius > line.uby) {
            return false;
        }

        // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
        let a = line.a;
        let b = line.b;
        let c = line.c;
        let distance = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);

        if (this.position.y >= 145 && line.id == 1) {
            //debugger;
        }

        if (distance < this.radius) {
            // console.log("collision: distance", distance, "with line ID", line.id);
        }

        return distance < this.radius;
    }

    resolve_line_collision(board, line) {
        // console.log("collided");

        // https://stackoverflow.com/questions/573084/how-to-calculate-bounce-angle
        // need the surface normal vector of the line. then, split the velocity into parallel and perpendicular components
        let normal_vec = new Vector2(line.a, line.b).normalize();

        // u is perpendicular to the line (so is the part we reverse, affected by restitution), w is parallel (affected by friction)
        let u = normal_vec.mul(this.velocity.dot(normal_vec))
        let w = this.velocity.sub(u);

        let new_velocity = u.mul(-this.bounce_factor).add(w.mul(this.friction_factor));

        /*
        // need to get the incidence angle, then it's just year 11 mechanics
        // incidence angle should just be the direction of motion; we then rotate that angle around the line's angle
        // (angle mod is 180-line_angle, direction of mod is based on whether the angle of approach is > 180 (-1) or not (1))
        let incidence_angle = this.velocity.angle();

        let line_vector = new Vector2(line.b, line.a); // y=mx; x=1; y=m
        let line_angle = line_vector.angle();

        let angle_mod = Math.PI - line_angle;
        let angle_mod_sign = line_vector.angle_between(this.velocity) < Math.PI ? -1 : 1;

        let result_angle = incidence_angle + (angle_mod * angle_mod_sign);

        // console.log(line_vector, incidence_angle / Math.PI * 180, line_angle / Math.PI * 180, angle_mod / Math.PI * 180);
        // console.log(`incidence: ${incidence_angle / Math.PI * 180}  rebound: ${result_angle / Math.PI * 180}`);
        */

        // roll back position to the point at which it would intersect the line
        let a = line.a;
        let b = line.b;
        let c = line.c;
        let distance = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);

        let rollback_distance = this.radius - distance;

        // console.log("original pos", this.position);

        this.add_pos(this.velocity.normalize().mul(-rollback_distance));

        // update velocity
        this.velocity = new_velocity;

        // console.log("rollback pos", this.position);

        // add the rollback amount with the new velocity (this essentially simulates the time between steps if we're catching up with an object "stuck" in a line)
        // this.add_pos(this.velocity.mul(-rollback_distance));

        // console.log("final pos", this.position);

        // let distance_after_rollback = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);
        // console.log(`distance before rollback: ${distance} | after rollback: ${distance_after_rollback}`);
        // console.log("velocity:", this.velocity);
    }

    collides(other) {
        let radius_sum = this.radius + other.radius;
        let radius_sum_sqr = Math.pow(radius_sum, 2);

        return other.position.sqr_distance(this.position) <= radius_sum_sqr;
    }

    resolve_collision(board, other, apply_push=true) {
        // need to push the balls apart after a collision
        let delta = this.position.sub(other.position);
        let dlen = delta.magnitude();

        if (dlen == 0) {
            this.add_pos(new Vector2((Math.random() * 0.0001) - 0.00005, (Math.random() * 0.0001) - 0.00005))
            return;
        }

        let mtd = delta.mul(
            ((this.radius + other.radius) - dlen) / dlen
        );

        let mtd_normalized = mtd.normalize();

        // get the inverse masses
        let inverse_mass_this = 1 / this.mass;
        let inverse_mass_other = 1 / other.mass;
        let inverse_mass_sum = inverse_mass_this + inverse_mass_other;

        // push/pull apart based on mass so that they're "rolled back" to the collision position
        if (apply_push) {
            this.set_pos(this.position.add(mtd.mul(inverse_mass_this / inverse_mass_sum)));
            other.set_pos(other.position.sub(mtd.mul(inverse_mass_other / inverse_mass_sum)));
        }

        // find the impact speed
        let impact_vector = this.velocity.sub(other.velocity);
        let vn = impact_vector.dot(mtd_normalized);

        if (vn > 0) {
            // intersecting but moving away from each other already, so don't need to do anything
            return;
        }

        // calculate impulse
        let impulse_magnitude_this = (-(1 + this.bounce_factor) * vn) / inverse_mass_sum;
        let impulse_magnitude_other = ((1 + other.bounce_factor) * vn) / inverse_mass_sum;

        let impulse_this = mtd_normalized.mul(impulse_magnitude_this);
        let impulse_other = mtd_normalized.mul(impulse_magnitude_other);

        // apply change to momentum
        this.add_impulse(impulse_this);
        other.add_impulse(impulse_other);
    }
}

class BallWeapon {
    constructor(size_multiplier, sprite, hitboxes) {
        this.size_multiplier = size_multiplier * 10;
        this.sprite = sprite;

        // all hitboxes are {pos, radius} - so they're circles, not boxes. sorry liberals
        this.hitboxes = hitboxes;

        this.angle = 0;
    }
}

// abstract class that rotates a SORD at a base rotation speed with no other effects
// also implements weapon collision
class WeaponBall extends Ball {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor);

        this.name = "Weapon";

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
            new BallWeapon(1, "SORD", [
                {pos: new Vector2(96, 64), radius: 18},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
                {pos: new Vector2(0, 64), radius: 16},
            ])
        ];

        // every hit deals a minimum of 1 damage and 100 hp is the max for everyone
        this.hp = 100;

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
    }

    physics_step(time_delta) {
        // TODO think about how best to make this less annoying to override

        this.hitstop -= time_delta;
        if (this.hitstop > 0) {
            time_delta *= HITSTOP_DELTATIME_PENALTY;
        }

        super.physics_step(time_delta);
        this.weapon_step(time_delta);

        this.invuln_duration -= time_delta;
        this.weapon_data.forEach(w => w.angle = w.angle % 360)
    }

    weapon_step(time_delta) {
        // rotate the weapon
        this.weapon_data[0].angle += 180 * (this.reversed ? -1 : 1) * (Math.PI / 180) * time_delta;
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
            let this_hitboxes_offsets = this.get_hitboxes_offsets(weapon);
            let this_weapon_offset = this.get_weapon_offset(weapon);

            other.weapon_data.forEach((other_weapon, other_index) => {
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

    hit_other(other, with_weapon_index, damage=1) {
        // for this one, the SORD (the only weapon) just hits the other one for 1 damage and nothing else.
        // other balls might want to apply knockback, or do other stuff
        console.log(`Hit ${other.id} with weapon index ${with_weapon_index}`);
        
        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit(damage * (this.player?.stats?.damage_bonus ?? 1), hitstop);
        this.hitstop = Math.max(this.hitstop, hitstop);

        result.hitstop = hitstop;
        return result;
    }

    get_hit(damage, hitstop) {
        // defense_bonus is a simple "divide damage by this" value
        let def = this.player?.stats?.defense_bonus ?? 1;
        let final_damage = Math.max(1, Math.round(damage * def));
        
        this.hp -= final_damage;
        this.invuln_duration = Math.max(this.invuln_duration, BALL_INVULN_DURATION);
        this.hitstop = Math.max(this.hitstop, hitstop);

        return {dmg: final_damage, dead: this.hp <= 0};
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
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, reversed);
    
        this.name = "Hammer";

        this.weapon_data = [
            new BallWeapon(1.25, "hamer", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ])
        ];
    }

    weapon_step(time_delta) {
        // rotate the weapon
        this.weapon_data[0].angle += 90 * (this.reversed ? -1 : 1) * (Math.PI / 180) * time_delta;
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other(other, with_weapon_index, 8);

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
            ctx, `Damage: 8.00`, x_anchor, y_anchor, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, `Rotation speed: 90 deg/s`, x_anchor, y_anchor + 12, this.colour.css(), "MS Gothic", 12
        )
        write_text(
            ctx, "Knocks enemies back when striking them.", x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 12
        )
    }
}

class SordBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, reversed);
    
        this.name = "SORD";

        this.weapon_data = [
            new BallWeapon(1.25, "SORD", [
                {pos: new Vector2(96, 64), radius: 18},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
                {pos: new Vector2(0, 64), radius: 16},
            ])
        ];

        this.damage_base = 1;
        this.speed_base = 180;
    }

    weapon_step(time_delta) {
        // rotate the weapon
        this.weapon_data[0].angle += this.speed_base * (this.reversed ? -1 : 1) * (Math.PI / 180) * time_delta;
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.damage_base += 0.5;
        this.speed_base += 12;

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
    }
}

class DaggerBall extends WeaponBall {
    constructor(mass, radius, colour, bounce_factor, friction_factor, player, reversed) {
        super(mass, radius, colour, bounce_factor, friction_factor, player, reversed);
    
        this.name = "dagger";

        this.weapon_data = [
            new BallWeapon(1.25, "dagger", [
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

    weapon_step(time_delta) {
        // rotate the weapon
        this.weapon_data[0].angle += this.speed_base * (this.reversed ? -1 : 1) * (Math.PI / 180) * time_delta;

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 360, 1 - Math.pow(0.25, time_delta));
            this.damage_base = lerp(this.damage_base, 1, 1 - Math.pow(0.25, time_delta));
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.speed_base *= 1.75;
        this.damage_base *= 1.75;

        this.hit_decay = 3;

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
            ctx, `Rotates exponentially faster every strike.`, x_anchor, y_anchor + 24, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Gains more damage every strike.`, x_anchor, y_anchor + 36, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `Loses rotation speed and damage`, x_anchor, y_anchor + 48, this.colour.css(), "MS Gothic", 10
        )
        write_text(
            ctx, `when not striking.`, x_anchor, y_anchor + 60, this.colour.css(), "MS Gothic", 10
        )
    }
}

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    })
}

function handle_resize(event) {
    let canvas_smallest = Math.min(vh(100) - 128, vw(100) - 128);

    canvas_height = canvas_smallest;
    canvas_width = canvas_smallest;

    const DPR = window.devicePixelRatio ?? 1;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        // might work, might not
        ctx.canvas.width = canvas_width * DPR;
        ctx.canvas.height = canvas_height * DPR;
        ctx.scale(DPR, DPR);

        ctx.imageSmoothingEnabled = false;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    //refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_diagnostics(board) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16, "#fff", "MS Gothic", 9
    )

    let frame_times_raw = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100);
    })

    let frame_time_splits = frame_times_raw.map(t => {
        return t.toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28, "#fff", "MS Gothic", 9
    )

    let total_bar_length = 48;
    let total_time = frame_times_raw[0] + frame_times_raw[1] + frame_times_raw[2]
    let bars = [
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[0] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[1] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[2] / total_time)))
    ]

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw" + " " + "#".repeat(bars[0]), 10, 28+12, "#0f0", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc" + " " + "#".repeat(bars[1]), 10, 28+12+12, "#f00", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait" + " " + "#".repeat(bars[2]), 10, 28+12+12+12, "#666", "MS Gothic", 9
    )

    write_text(
        layers.debug_front.ctx, `system energy | ${Math.round(board.balls.reduce((t, ball) => {
            let kinetic_energy = 0.5 * ball.mass * ball.velocity.sqr_magnitude();

            let height = board.size.y - ball.position.y;
            let gravitational_energy = ball.mass * board.gravity.y * height;

            return t + kinetic_energy + gravitational_energy;
        }, 0))}`, 10, 28+12+12+12+24, "white", "MS Gothic", 9
    )

    let board_d_y = 28+12+12+12+24+24;

    board.balls.forEach((ball, index) => {
        let t = board_d_y + (36 * index);
        write_text(
            layers.debug_front.ctx, `ball ${index} invuln | ` + "#".repeat(Math.max(0, Math.floor(ball.invuln_duration * 200))), 10, t, ball.invuln_duration > 0 ? ball.colour.css() : "gray", "MS Gothic", 9
        )

        write_text(
            layers.debug_front.ctx, `      hitstop | ` + "#".repeat(Math.max(0, Math.floor(ball.hitstop * 200))), 10, t + 12, ball.hitstop > 0 ? ball.colour.css() : "gray", "MS Gothic", 9
        )
    });
}

function render_game(board, collision_boxes=false, velocity_lines=false) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);

    if (true) {
        layers.debug_back.ctx.clearRect(0, 0, canvas_width, canvas_height);
    }

    // balls can be from 0 to 10000
    // so need to translate those positions into the canvas space
    // rely upon it being square... for now

    screen_scaling_factor = canvas_width / board.size.x;

    let ctx = layers.fg2.ctx;

    let w = 25 * screen_scaling_factor;

    board.balls.forEach(ball => {
        let ball_screen_pos = new Vector2(
            (ball.position.x) * screen_scaling_factor,
            (ball.position.y) * screen_scaling_factor,
        );

        ctx.beginPath();
        ctx.arc(ball_screen_pos.x, ball_screen_pos.y, (ball.radius * screen_scaling_factor) - (w/2), 0, 2 * Math.PI, false);
        
        let ball_col = ball.colour
        if (ball.invuln_duration > 0 && ball.last_hit == 0) {
            ball_col = ball_col.lerp(Colour.black, 0.75);
        }
        
        ctx.fillStyle = ball_col.css();
        ctx.fill();
        ctx.lineWidth = w;
        ctx.strokeStyle = ball.colour.lerp(Colour.white, 0.75).css();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "22px \"ms gothic\"";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ball.hp, ball_screen_pos.x-0.5, ball_screen_pos.y-0.5);
        ctx.fillText(ball.hp, ball_screen_pos.x+0.5, ball_screen_pos.y-0.5);
        ctx.fillText(ball.hp, ball_screen_pos.x-0.5, ball_screen_pos.y+0.5);
        ctx.fillText(ball.hp, ball_screen_pos.x+0.5, ball_screen_pos.y+0.5);

        ctx.closePath();

        // now draw the weapons
        // weapon needs to be drawn at an offset from the ball (radius to the right)
        // with that offset rotated by the angle as well
        ball.weapon_data.forEach(weapon => {
            let offset = ball.get_weapon_offset(weapon);

            let siz = weapon.size_multiplier * screen_scaling_factor * 128;
            let pos = ball.position.add(offset).mul(screen_scaling_factor);

            write_rotated_image(layers.fg3.canvas, layers.fg3.ctx, pos.x, pos.y, entity_sprites.get(weapon.sprite)[0], siz, siz, weapon.angle);
        
            if (collision_boxes) {
                // render the collision boxes on debug_back as green circles
                // collision boxes are based on the original 128x128 sizing
                // so get the offset, then add the collision pos offset, then draw that
                weapon.hitboxes.forEach(hitbox => {
                    let hitbox_offset = offset.add(ball.get_hitbox_offset(weapon, hitbox));

                    let hitbox_screen_pos = ball.position.add(hitbox_offset).mul(screen_scaling_factor);
                    let w2 = w / 8;

                    layers.debug_back.ctx.beginPath();
                    layers.debug_back.ctx.arc(
                        hitbox_screen_pos.x, hitbox_screen_pos.y, 
                        (hitbox.radius * weapon.size_multiplier * screen_scaling_factor) - (w2/2),
                        0, 2 * Math.PI, false
                    );
                    layers.debug_back.ctx.fillStyle = new Colour(0, 255, 0, 128).css();
                    layers.debug_back.ctx.fill();
                    layers.debug_back.ctx.lineWidth = w2;
                    layers.debug_back.ctx.strokeStyle = new Colour(0, 255, 0, 255).css();
                    layers.debug_back.ctx.stroke();
                    layers.debug_back.ctx.closePath();
                })
            }
        })
    })
}

function render_descriptions(board) {
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let layouts = [
        [[canvas_width - 256, 28]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 72]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 72], [canvas_width - 256, 28 + 72 + 72]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 72], [canvas_width - 256, 28 + 72 + 72], [canvas_width - 256, 28 + 72 + 72 + 72]],
    ]

    let layout = layouts[board.balls.length-1];
    if (layout) {
        board.balls.forEach((ball, index) => {
            let l = layout[index];

            write_text(
                layers.ui2.ctx, `${ball.name}`, l[0], l[1], ball.colour.css(), "MS Gothic", 16
            )

            write_text(
                layers.ui2.ctx, `[${"#".repeat(Math.ceil(ball.hp * 0.4))}${" ".repeat(Math.floor((100 - ball.hp) * 0.4))}]`, l[0], l[1] + 12, ball.colour.css(), "MS Gothic", 9
            )

            ball.render_stats(layers.ui2.canvas, layers.ui2.ctx, l[0], l[1] + 12 + 12);
        })
    }
}

let last_frame = Date.now();

function game_loop() {
    framecount++;

    let frame_start_time = Date.now();

    render_game(board, keys_down["KeyQ"], false);
    render_descriptions(board);
    render_diagnostics(board);

    let render_end_time = Date.now();

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    // delta_time can be maximum 50ms
    delta_time = Math.min(delta_time, 50);

    if (keys_down["KeyE"]) {
        delta_time /= 1000;
    }

    let phys_gran = PHYS_GRANULARITY;
    let coll_gran = COLL_GRANULARITY;

    if (keys_down["KeyR"]) {
        phys_gran *= 10;
        coll_gran *= 10;
        delta_time *= 10;
    }

    // COLL_GRANULARITY => do collision checks every N physics steps
    for (let i=0; i<phys_gran; i++) {
        board.physics_step(delta_time / (1000 * phys_gran));

        if (i % coll_gran == 0) {
            // if multiple weapons collide, the first one takes priority
            let hitstop = 0;

            // parrying (weapon on weapon)
            board.balls.forEach(ball => {
                if (ball.invuln_duration <= 0) {
                    board.balls.forEach(other => {
                        if (ball.id != other.id) {
                            let colliding_pairs = ball.check_weapon_to_weapon_hit_from(other);
                            if (colliding_pairs.length > 0) {
                                // parry causes an explosive force of the balls away from each other
                                // plus the directions of the weapons reverse
                                ball.reversed = !ball.reversed;
                                other.reversed = !other.reversed;

                                let diff_vec = other.position.sub(ball.position).normalize();

                                // we're going to get the magnitude of the directions, *0.25,
                                // add *0.75 of the difference vector, and remultiply
                                let share = 0.75;

                                let ball_diff_add = diff_vec.mul(-share);
                                let other_diff_add = ball_diff_add.mul(-1);

                                let ball_mag = ball.velocity.magnitude();
                                let other_mag = other.velocity.magnitude();

                                new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag)
                                new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

                                ball.velocity = new_ball_velocity;
                                other.velocity = new_other_velocity;

                                ball.last_hit = 1;
                                other.last_hit = 1;

                                ball.invuln_duration = Math.max(ball.invuln_duration, BALL_INVULN_DURATION);
                                other.invuln_duration = Math.max(other.invuln_duration, BALL_INVULN_DURATION);

                                play_audio("parry");
                            }
                        }
                    });
                }
            })

            // hitting (weapon on ball)
            board.balls.forEach(ball => {
                if (ball.invuln_duration <= 0) {
                    // OK to check for hits (not in invuln window)
                    board.balls.forEach(other => {
                        // make sure we don't check collisions with ourselves
                        if (ball.id != other.id) {
                            let colliding_weapons = ball.check_weapons_hit_from(other);
                            if (colliding_weapons.length > 0) {
                                let weapon_index = colliding_weapons[0];  // ignore all others

                                ball.last_hit = 0;
                                let result = other.hit_other(ball, weapon_index);

                                play_audio("impact");

                                // TODO - need to at this point do accounting on damage taken/dealt,
                                // and end the game / remove balls if they die

                                hitstop = Math.max(hitstop, result.hitstop ?? 0);
                            }
                        }
                    })
                }
            })

            board.hitstop_time = Math.max(hitstop, board.hitstop_time);
        }

        board.balls = board.balls.filter(b => b.hp > 0)
    }

    let calc_end_time = Date.now();

    time_deltas.push(delta_time);
    time_deltas = time_deltas.slice(-120);

    render_durations.push(render_end_time - frame_start_time);
    render_durations = render_durations.slice(-120);

    calc_durations.push(calc_end_time - render_end_time);
    calc_durations = calc_durations.slice(-120);

    let frame_end_time = Date.now();
    let time_since_last_frame = frame_end_time - last_frame_time;
    last_frame_time = frame_end_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // next frame should arrive (1000/fps) ms later, so get the time left and compare it with the end time
    let expected_next_frame = frame_start_time + (1000/fps);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    window.requestAnimationFrame(game_loop);
}

let board = null;

document.addEventListener("DOMContentLoaded", async function() {
    await load_audio();
});

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    layers.front.canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
        //if (mouse_select_pos.x == 0 && mouse_select_pos.y == 0) {
            //mouse_select_pos = mouse_position.copy();
        //}
    });

    layers.front.canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            drag_start_pos = mouse_position.copy();
            lmb_down = true;
        } else if (event.button == 2) {
            rmb_down = true;
        }

        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mouseup", function(event) {
        if (event.button == 0) {
            if (drag_start_pos) {
                drag_start_pos = null;
            }
            lmb_down = false;
        } else if (event.button == 2) {
            rmb_down = false;
        }
        /*
        if (event.button == 0) {
            if (drag_start_pos) {
                combat_control.process_dragclick(drag_start_pos, mouse_position, keys_down);

                drag_start_pos = null;
                return;
            }

            combat_control.process_mouseclick(mouse_position.copy(), keys_down);
        } else {
            combat_control.process_rightclick(mouse_position.copy(), keys_down)
        }
        */

        event.preventDefault();
    });

    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        switch (code) {

        }

        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;

        switch (code) {

        }
    });

    handle_resize();

    let interval = setInterval(function() {
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            game_loop();
        }
    }, 200)

    window.addEventListener("resize", handle_resize);

    // begin balls code
    board = new Board(new Vector2(10000, 10000));
    board.spawn_ball(new SordBall(1, 128 * 4, Colour.red, null, null, {}), new Vector2(2000, 2000));
    board.spawn_ball(new HammerBall(1, 128 * 4, Colour.yellow, null, null, {}, true), new Vector2(8000, 8000));
    board.spawn_ball(new DaggerBall(1, 128 * 4, Colour.green, null, null, {}), new Vector2(4000, 8000));
    // board.spawn_ball(new WeaponBall(1, 128 * 4, Colour.cyan, null, null, {}), new Vector2(2000, 8000));

    board.balls[0].add_velocity(random_on_circle(random_float(0, 10000)));
    board.balls[1]?.add_velocity(random_on_circle(random_float(0, 10000)));
    board.balls[2]?.add_velocity(random_on_circle(random_float(0, 10000)))
    board.balls[3]?.add_velocity(random_on_circle(random_float(0, 10000)))
})
