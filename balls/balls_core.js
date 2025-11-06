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

const entity_sprites = new Map([
    ["SORD", 1, "weapon/"],
    ["hamer", 1, "weapon/"],
    ["dagger", 1, "weapon/"],
    ["pellet", 1, "weapon/"],
    ["bow", 1, "weapon/"],
    ["arrow", 1, "weapon/"],
    
    ["gun", 1, "weapon/"],

    ["needle", 1, "weapon/"],
    
    ["coin_weapon", 1, "weapon/"],
    ["coin", 5, "weapon/"],

    ["explosion", 16, "explosion/"],
].map((v, i) => {
    let ts = [];

    if (v[1] > 1) {
        for (let i=0; i<v[1]; i++) {
            let t = new Image(128, 128);
            t.src = `img/${v[2]}/${v[0]}_${i.toString().padStart(3, "0")}.png`;
            t.style.imageRendering = "pixelated";

            num_textures_needed++;
            t.addEventListener("load", function() {
                num_textures_loaded++;
            })

            ts.push(t);
        }
    } else {
        let t = new Image(128, 128);
        t.src = `img/${v[2]}/${v[0]}.png`;
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        t.addEventListener("load", function() {
            num_textures_loaded++;
        })

        ts.push(t);
    }

    return [v[0], ts]
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
const COLL_GRANULARITY = PHYS_GRANULARITY / 4;  // COLL_GRANULARITY => do collision checks every N physics steps
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

let thud_cooldown = 0;

// reduce the volume
let gain_node = audio_context.createGain();
gain_node.connect(audio_context.destination);
let gain = 0.1;
gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

async function load_audio_item(path) {
    let resp = await fetch(`https://plaao.net/balls/${path}`);
    let array_buffer = await resp.arrayBuffer();

    let audio_buffer = await audio_context.decodeAudioData(array_buffer);

    return audio_buffer;
}

async function load_audio() {
    // ultrakill
    audio.set("parry", await load_audio_item('snd/parry.mp3'));
    audio.set("parry2", await load_audio_item('snd/parry2.mp3'));
    // https://pixabay.com/sound-effects/punch-04-383965/
    audio.set("impact", await load_audio_item('snd/impact.mp3'));
    audio.set("impact_heavy", await load_audio_item('snd/impact_heavy.mp3'));
    // https://pixabay.com/sound-effects/stick-hitting-a-dreadlock-small-thud-83297/
    audio.set("thud", await load_audio_item("snd/thud.mp3"));
    // game maker classic
    audio.set("explosion", await load_audio_item("snd/explosion.mp3"));
}

function play_audio(name) {
    let source = audio_context.createBufferSource();
    
    source.buffer = audio.get(name);

    source.connect(gain_node);

    source.start();

    // console.log(`played sound ${name}`);
}

class Particle {
    static id_inc = 0;

    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping) {
        this.position = position;
        this.rotation_angle = rotation_angle;
        this.size = size * 16;
        this.sprites = sprites;
        this.frame_speed = frame_speed;
        this.duration = duration;
        this.looping = looping;

        this.lifetime = 0;
        this.framecount = sprites.length;
        this.cur_frame = 0;
    }

    pass_time(time_delta) {
        this.lifetime += time_delta;
        this.cur_frame = Math.floor(this.lifetime * this.frame_speed)
        if (this.looping) {
            this.cur_frame = this.cur_frame % this.framecount;
        }
    }
}

class Board {
    constructor(size) {
        this.stepped_physics = false;

        this.size = size;
        this.projectile_delete_bounds = [
            -this.size.x * 0.1,
            this.size.x * 1.1,
            -this.size.y * 0.1,
            this.size.y * 1.1
        ]

        this.balls = [];
        this.projectiles = [];
        this.particles = [];
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
                c: -this.size.x,

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
                c: -this.size.y,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            }
        ]

        // this.gravity = new Vector2(0, 0);
        this.gravity = new Vector2(0, 9810);

        this.hitstop_time = 0;
    }
    
    remaining_players() {
        let balls_ids = this.balls.map(ball => ball.player.id);
        let players = this.balls.filter((t, i) => balls_ids.indexOf(t.player.id) === i).map(b => b.player);
        return players;
    }

    get_player_ball(player) {
        return this.balls.find(ball => ball.player.id === player.id);
    }

    get_all_player_balls(player) {
        return this.balls.filter(ball => ball.player.id === player.id);
    }

    spawn_particle(particle, position) {
        particle.position = position;
        this.particles.push(particle);

        return particle;
    }

    spawn_projectile(projectile, position) {
        projectile.position = position;
        this.projectiles.push(projectile);

        projectile.board = this;

        return projectile;
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

    particles_step(time_delta) {
        if (this.hitstop_time > 0) {
            time_delta *= Number.EPSILON;
        }

        this.particles.forEach(particle => particle.pass_time(time_delta / 1000));
        this.particles = this.particles.filter(particle => {
            // looping particles never hit the framecount bound so out-of-range frame is valid to check deletion
            return particle.lifetime < particle.duration && particle.cur_frame < particle.framecount;
        })
    }

    physics_step(time_delta) {
        this.stepped_physics = true;

        this.hitstop_time -= time_delta;
        if (this.hitstop_time > 0) {
            time_delta *= Number.EPSILON;
        }

        // make the balls move
        this.balls.forEach(ball => {
            // if the ball is in a wall, wake it up by force
            if (ball.position.x - ball.radius < -0.1 || ball.position.x + ball.radius > this.size.x+0.1 || ball.position.y + ball.radius > this.size.y+0.1) {

            }

            ball.physics_step(this, time_delta);
        })

        // make the projectiles move
        this.projectiles.forEach(projectile => {
            projectile.physics_step(time_delta);
        })

        // clean up any inactive / OOB ones
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.active ||
                (projectile instanceof HitscanProjectile && projectile.lifetime >= projectile.duration) ||
                projectile.position.x < this.projectile_delete_bounds[0] ||
                projectile.position.x > this.projectile_delete_bounds[1] ||
                projectile.position.y < this.projectile_delete_bounds[2] ||
                projectile.position.y > this.projectile_delete_bounds[3]
            ) {
                return false;
            }

            return true;
        })

        // then, apply gravity to balls
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

            if (thud_cooldown < 0) {
                play_audio("thud");
                thud_cooldown += 0.3;
            }
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
                    
                    if (thud_cooldown < 0) {
                        play_audio("thud");
                        thud_cooldown += 0.3;
                    }
                }
            })
        })

        thud_cooldown -= time_delta;

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

        // canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        // canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    document.querySelector(".behind-canvases").style.width = canvas_width + "px";
    document.querySelector(".behind-canvases").style.height = canvas_height + "px";

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

    if (!board)
        return;

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
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
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

    // particles
    board.particles.forEach(particle => {
        let particle_screen_pos = new Vector2(
            (particle.position.x) * screen_scaling_factor,
            (particle.position.y) * screen_scaling_factor,
        );

        let siz = particle.size * screen_scaling_factor * 128;

        particle_screen_pos = particle_screen_pos.add(new Vector2(-siz, -siz).mul(0.5));

        write_rotated_image(
            layers.fg1.canvas, layers.fg1.ctx,
            particle_screen_pos.x, particle_screen_pos.y,
            particle.sprites[particle.cur_frame],
            siz, siz, particle.direction_angle
        );
    })

    // then the projectiles. put them on fg3, same as weapons
    board.projectiles.forEach(projectile => {
        if (!projectile.active || (projectile.render_delay && projectile.lifetime < projectile.inactive_delay)) {
            return;
        }

        if (projectile.sprite != "HITSCAN") {
            let projectile_screen_pos = new Vector2(
                (projectile.position.x) * screen_scaling_factor,
                (projectile.position.y) * screen_scaling_factor,
            );

            let siz = projectile.size * screen_scaling_factor * 128;

            write_rotated_image(
                layers.fg3.canvas, layers.fg3.ctx,
                projectile_screen_pos.x, projectile_screen_pos.y,
                projectile.sprite instanceof Image ? projectile.sprite : entity_sprites.get(projectile.sprite)[0],
                siz, siz, projectile.direction_angle
            );
        } else {
            // draw a line from position to target with given width
            // and colour
            let projectile_screen_start_pos = new Vector2(
                (projectile.position.x) * screen_scaling_factor,
                (projectile.position.y) * screen_scaling_factor,
            );

            let projectile_screen_end_pos = new Vector2(
                (projectile.target_position.x) * screen_scaling_factor,
                (projectile.target_position.y) * screen_scaling_factor,
            );

            layers.fg3.ctx.beginPath();
            layers.fg3.ctx.moveTo(projectile_screen_start_pos.x, projectile_screen_start_pos.y);
            layers.fg3.ctx.lineTo(projectile_screen_end_pos.x, projectile_screen_end_pos.y);

            layers.fg3.ctx.lineWidth = projectile.get_width();
            layers.fg3.ctx.strokeStyle = projectile.sprite_colour;
            layers.fg3.ctx.stroke();
        }

        if (collision_boxes) {
            // render the collision boxes on debug_back as green circles
            // collision boxes are based on the original 128x128 sizing
            // so get the offset, then add the collision pos offset, then draw that
            let hitboxes = projectile.get_hitboxes_offsets();
            hitboxes.forEach((hitbox_offset, index) => {
                let hitbox = projectile.hitboxes[index];

                let hitbox_screen_pos = projectile.position.add(hitbox_offset).mul(screen_scaling_factor);
                let w2 = w / 8;

                layers.debug_back.ctx.beginPath();
                layers.debug_back.ctx.arc(
                    hitbox_screen_pos.x, hitbox_screen_pos.y, 
                    (hitbox.radius * projectile.size * screen_scaling_factor) - (w2/2),
                    0, 2 * Math.PI, false
                );
                layers.debug_back.ctx.fillStyle = new Colour(255, 255, 0, 128).css();
                layers.debug_back.ctx.fill();
                layers.debug_back.ctx.lineWidth = w2;
                layers.debug_back.ctx.strokeStyle = new Colour(255, 255, 0, 255).css();
                layers.debug_back.ctx.stroke();
                layers.debug_back.ctx.closePath();
            })
        }
    });

    // then the balls and weapons
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
        ctx.fillText(Math.ceil(ball.hp), ball_screen_pos.x-0.5, ball_screen_pos.y-0.5);
        ctx.fillText(Math.ceil(ball.hp), ball_screen_pos.x+0.5, ball_screen_pos.y-0.5);
        ctx.fillText(Math.ceil(ball.hp), ball_screen_pos.x-0.5, ball_screen_pos.y+0.5);
        ctx.fillText(Math.ceil(ball.hp), ball_screen_pos.x+0.5, ball_screen_pos.y+0.5);

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
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144], [canvas_width - 256, 28 + 144 + 144]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144], [canvas_width - 256, 28 + 144 + 144], [canvas_width - 256, 28 + 144 + 144 + 144]],
    ]

    let filtered_balls = board.balls.filter(ball => ball.show_stats);
    let layout = layouts[filtered_balls.length-1];
    
    if (layout) {
        filtered_balls.forEach((ball, index) => {
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

let colliding_parries = new Set();
let colliding_proj2projs = new Set();

function game_loop() {
    framecount++;

    let frame_start_time = Date.now();

    if (board && board.stepped_physics) {
        render_game(board, keys_down["KeyQ"], false);
        render_descriptions(board);
    }

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
        let factor = 16;

        phys_gran *= factor;
        coll_gran *= factor;
        delta_time *= factor;
    }

    if (board) {
        // COLL_GRANULARITY => do collision checks every N physics steps
        for (let i=0; i<phys_gran; i++) {
            board.physics_step(delta_time / (1000 * phys_gran));

            // additional collision step on the last frame
            if (i % coll_gran == 0 || i == phys_gran-1) {
                // if multiple weapons collide, the first one takes priority
                let hitstop = 0;

                // projectile weaponsteps
                board.projectiles.forEach(projectile => {
                    projectile.weapon_step(board, delta_time / 1000)
                })

                // parrying (weapon on weapon)
                colliding_parries.clear();
                board.balls.forEach(ball => {
                    if (ball.invuln_duration <= 0) {
                        board.balls.forEach(other => {
                            if (colliding_parries.has((ball.id * 10000000) + other.id) || ball.allied_with(other)) {
                                return;
                            }

                            if (ball.id != other.id) {
                                let colliding_pairs = ball.check_weapon_to_weapon_hit_from(other);

                                if (colliding_pairs.length > 0) {
                                    colliding_parries.add((ball.id * 10000000) + other.id);
                                    colliding_parries.add((other.id * 10000000) + ball.id);

                                    let colliding_pair = colliding_pairs[0];

                                    let source_index = colliding_pair[0];
                                    let other_index = colliding_pair[1];

                                    // parry causes an explosive force of the balls away from each other
                                    // plus the directions of the weapons reverse
                                    ball.reverse_weapon(source_index);
                                    other.reverse_weapon(other_index);

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

                // projectile parrying (weapon on projectile)
                board.balls.forEach(ball => {
                    // don't check our own team's projectiles
                    let projectiles = board.projectiles.filter(projectile => projectile.active && projectile.source.player.id != ball.player.id);
                    let intersecting_projectiles = ball.check_weapon_to_projectiles_hits(projectiles);

                    let parried = false;
                    intersecting_projectiles.forEach(projectile_data => {
                        let projectile = projectile_data[1];
                        let parry_weapon_index = projectile_data[0];

                        if (!projectile.parriable) {
                            return;
                        }

                        // if the projectile is hitscan AND colliding with both the ball and the weapon,
                        // only parry it if the closest weapon hitbox is closer to the origin than the ball
                        if (projectile instanceof HitscanProjectile) {
                            let ball_hit_by_projectile = ball.check_projectiles_hit_from([projectile]);
                            if (ball_hit_by_projectile.length > 0) {
                                // get a list of the weapon's hitboxes
                                let source_weapon = ball.weapon_data[parry_weapon_index];

                                let weapon_offset = ball.get_weapon_offset(source_weapon);
                                let hitboxes_offsets = ball.get_hitboxes_offsets(source_weapon);

                                let closest_weapon_hitbox_dist = Number.POSITIVE_INFINITY;
                                hitboxes_offsets.forEach((offset, index) => {
                                    let hitbox_pos = ball.position.add(weapon_offset).add(offset);
                                    let hitbox_dist = hitbox_pos.sqr_distance(projectile.position);

                                    // we also need to take into account hitbox radius (take away hitbox square radius from dist)
                                    closest_weapon_hitbox_dist = Math.min(closest_weapon_hitbox_dist, hitbox_dist - Math.pow(source_weapon.hitboxes[index].radius, 2));
                                })

                                // now compare. we only parry if closest_weapon_hitbox_dist is smaller
                                let ball_dist = ball.position.sqr_distance(projectile.position);

                                if (ball_dist < closest_weapon_hitbox_dist) {
                                    return;
                                }
                            }
                        }

                        parried = true;

                        // board will clean it up
                        projectile.get_parried(ball);
                        ball.reverse_weapon(parry_weapon_index);
                        projectile.source.get_projectile_parried(ball, projectile);

                        // we actually move the ball in the direction the projectile was travelling
                        let diff_vec = projectile.direction;

                        // we're going to get the magnitude of the directions, *0.25,
                        // add *0.25 of the difference vector, and remultiply
                        let share = 0.25;

                        let ball_diff_add = diff_vec.mul(share);
                        let ball_mag = ball.velocity.magnitude();
                        new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag);
                        ball.velocity = new_ball_velocity;
                        
                        ball.last_hit = 1;
                        
                        ball.invuln_duration = Math.max(ball.invuln_duration, BALL_INVULN_DURATION * 0.5);
                    })

                    if (parried) {
                        play_audio("parry2");
                    }
                });

                // hitting (weapon on ball)
                board.balls.forEach(ball => {
                    if (ball.invuln_duration <= 0) {
                        // OK to check for hits (not in invuln window)
                        board.balls.forEach(other => {
                            // make sure we don't check collisions with our own team
                            if (!ball.allied_with(other)) {
                                let colliding_weapons = ball.check_weapons_hit_from(other);
                                if (colliding_weapons.length > 0) {
                                    let weapon_index = colliding_weapons[0];  // ignore all others

                                    ball.last_hit = 0;
                                    let result = other.hit_other(ball, weapon_index);
                                    
                                    if (result.dmg >= 8) {
                                        play_audio("impact_heavy");
                                    } else {
                                        play_audio("impact");
                                    }

                                    // TODO - need to at this point do accounting on damage taken/dealt,
                                    // and end the game / remove balls if they die

                                    hitstop = Math.max(hitstop, result.hitstop ?? 0);
                                }
                            }
                        })
                    }
                })

                // projectile hitting (projectile on ball)
                board.balls.forEach(ball => {
                    if (ball.invuln_duration <= 0) {
                        // don't check our own projectiles
                        let projectiles = board.projectiles.filter(projectile => projectile.active && projectile.source.player.id != ball.player.id);
                        let intersecting_projectiles = ball.check_projectiles_hit_from(projectiles);
                        
                        // same rules as normal thing except we go through the get_hit_by for projectiles instead
                        // and delete the projectile
                        if (intersecting_projectiles.length > 0) {
                            let projectile = intersecting_projectiles[0];  // ignore all others

                            ball.last_hit = 0;
                            let result = projectile.source.hit_other_with_projectile(ball, projectile);
                            projectile.hit_ball(ball);

                            play_audio("impact");

                            hitstop = Math.max(hitstop, result.hitstop ?? 0);
                        }
                    }
                })

                // projectile collisions (projectile on projectile)
                colliding_proj2projs.clear()
                board.projectiles.forEach(projectile => {
                    if (!projectile.active) 
                        return;

                    let projectiles_in_scope = board.projectiles.filter(other => projectile.id !== other.id && (other.source.allied_with(projectile.source) || (projectile.can_hit_allied && other.can_hit_allied)));
                    let projectiles_colliding = projectile.check_projectiles_colliding(projectiles_in_scope);
                    projectiles_colliding = projectiles_colliding.filter(proj => !colliding_proj2projs.has(proj.id + (1000000 * projectile.id)))

                    projectiles_colliding.forEach(proj => {
                        projectile.hit_other_projectile(proj)
                        colliding_proj2projs.add(proj.id + (1000000 * projectile.id));

                        play_audio("thud");
                    });
                })

                // board.hitstop_time = Math.max(hitstop, board.hitstop_time);
            }

            board.balls = board.balls.filter(ball => {
                if (ball.hp > 0) {
                    return true;
                } else {
                    if (ball.show_stats) {
                        board.spawn_particle(new Particle(
                            ball.position.add(new Vector2(256+64, -512)), 0, 2, entity_sprites.get("explosion"), 12, 3, false
                        ), ball.position.add(new Vector2(256+64, -512)));

                        play_audio("explosion");
                    } else {
                        board.spawn_particle(new Particle(
                            ball.position.add(new Vector2(144, -512)), 0, 1, entity_sprites.get("explosion"), 12, 3, false
                        ), ball.position.add(new Vector2(144, -512)));

                        // TODO make this something else thats less impactful
                        play_audio("explosion");
                    }

                    return false;
                }
            });
        }

        board.particles_step(delta_time);

        
        if (board?.remaining_players().length <= 1) {
            match_end_timeout -= delta_time;
            if (match_end_timeout <= 0) {
                exit_battle();
            }
        }
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
