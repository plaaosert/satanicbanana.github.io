game_id = "circles";

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

let layers = {};

const PHYS_GRANULARITY = 64;
const DEFAULT_BALL_RESTITUTION = 0.3;
const DEFAULT_BALL_FRICTION = 1 - (0.1 / PHYS_GRANULARITY);

const fps = 60;

const target_canvas_width = 300;
const target_pixels_per_cm = 6;

let pixels_per_cm = 6;

let canvas_x = 0;
let canvas_y = 0;

class Board {
    constructor(size) {
        this.size = size;
        this.balls = [];
        this.particles = [];

        this.gravity = new Vector2(0, 9.81*100);
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

    particle_step(time_delta) {
        let new_particles = [];
        this.particles.forEach(particle => {
            particle.time_left -= time_delta;

            if (particle.time_left > 0) {
                let lerp_amt = Math.min(1, Math.max(0, 1 - (particle.time_left / particle.lifetime)));
                console.log(lerp_amt)
                particle.radius = lerp(particle.min_radius, particle.max_radius, lerp_amt);
                particle.colour = particle.start_colour.lerp(particle.end_colour, lerp_amt);
                particle.position = particle.start_position.lerp(particle.end_position, lerp_amt)

                console.log(particle, particle.radius, particle.colour);

                new_particles.push(particle);
            }
        })

        this.particles = new_particles;
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
                ball.add_velocity(this.gravity.mul(time_delta), true);
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
            ball.check_ground_bounce(sthis);
            ball.check_sides_bounce(sthis);
        })
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
        } else {
            this.set_velocity(new Vector2(0, 0));
        }

        let threshold = 0.05 * (time_delta / PHYS_GRANULARITY);
        if (this.last_pos.sqr_distance(this.position) < threshold) {
            this.rest_counter++;
            if (this.rest_counter >= this.rest_threshold && !this.at_rest) {
                this.at_rest = true;
                console.log(this, "entered rest");
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
        let dist = board.size.y - this.position.y;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.y) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.y;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.y = board.size.y - this.radius;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.y *= -this.bounce_factor;
            } else {
                this.velocity.y = 0;
            }

            this.velocity.x *= this.friction_factor;
        }
    }

    check_left_bounce(board) {
        let dist = this.position.x;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.x) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.x;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.x = 0 + this.radius;

            if (dist>0.0005 && this.velocity.sqr_magnitude() > 0.005) {
                this.velocity.x *= -this.bounce_factor;
            } else {
                this.velocity.x = 0;
            }

            this.velocity.y *= this.friction_factor;
        }
    }

    check_right_bounce(board) {
        let dist = board.size.x - this.position.x;
        if (!this.at_rest && dist <= this.radius && Math.abs(this.velocity.x) > 0.000000001) {
            let vel_rollback_mag = dist / this.velocity.x;

            //this.add_pos(this.velocity.mul(-vel_rollback_mag));
            this.position.x = board.size.x - this.radius;

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

    collides(other) {
        let radius_diff = this.radius + other.radius;
        let radius_diff_sqr = Math.pow(radius_diff, 2);

        return other.position.sqr_distance(this.position) <= radius_diff_sqr;
    }

    resolve_collision(board, other) {
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
        this.set_pos(this.position.add(mtd.mul(inverse_mass_this / inverse_mass_sum)));
        other.set_pos(other.position.sub(mtd.mul(inverse_mass_other / inverse_mass_sum)));

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

class MergeGameBall extends Ball {
    static level_properties = [
        {mass: Math.pow(1.8, 0), radius: 2, colour: Colour.from_hex("#4f4")},
        {mass: Math.pow(1.8, 1), radius: 3.5, colour: Colour.from_hex("#e63")},
        {mass: Math.pow(1.8, 2), radius: 4.75, colour: Colour.from_hex("#16c")},
        {mass: Math.pow(1.8, 3), radius: 6.5, colour: Colour.from_hex("#412")},
        {mass: Math.pow(1.8, 4), radius: 7.25, colour: Colour.from_hex("#28e")},
        {mass: Math.pow(1.8, 5), radius: 8, colour: Colour.from_hex("#48c")},
        {mass: Math.pow(1.8, 6), radius: 9, colour: Colour.from_hex("#a47")},
        {mass: Math.pow(1.8, 7), radius: 10, colour: Colour.from_hex("#ff0")},
        {mass: Math.pow(1.8, 8), radius: 11, colour: Colour.from_hex("#e92")},
        {mass: Math.pow(1.8, 9), radius: 13, colour: Colour.from_hex("#ad3")},
        {mass: Math.pow(1.8, 10), radius: 15, colour: Colour.from_hex("#fd1")},
        {mass: Math.pow(1.8, 11), radius: 17.5, colour: Colour.from_hex("#370")}
    ]

    constructor(level) {
        let lv_props = MergeGameBall.level_properties[level];
        super(lv_props.mass, lv_props.radius, lv_props.colour);

        this.level = level;
        this.merge_cooldown = 0;
    }

    physics_step(time_delta) {
        if (this.merge_cooldown <= 0) {
            super.physics_step(time_delta);
        }

        this.merge_cooldown -= time_delta;
    }

    resolve_collision(board, other) {
        if (this.merged || other.merged) {
            return;
        }

        super.resolve_collision(board, other);

        // if levels are equal between this and other:
        // increase own level by 1, update mass, radius and colour, delete other
        if (other.level == this.level && this.merge_cooldown <= 0 && other.merge_cooldown <= 0) {
            board.remove_ball(other);
            other.merged = true;
            
            this.level++;
            this.merge_cooldown = 0.1;

            let lv_props = MergeGameBall.level_properties[this.level];

            board.particles.push({
                min_radius: other.radius,
                max_radius: lv_props.radius,
                radius: other.radius,
                start_position: other.position,
                end_position: this.position,
                position: other.position,
                lifetime: 0.1,
                time_left: 0.1,
                start_colour: other.colour,
                end_colour: lv_props.colour,
                colour: other.colour
            })

            this.mass = lv_props.mass;
            this.radius = lv_props.radius;
            this.colour = lv_props.colour;

            score += Math.pow(this.level, 2) * 10;
            highest_ball_level = Math.max(Math.floor((this.level) / 2), highest_ball_level)

            highscore = Math.max(highscore, score);
            if (highscore > highscore_ever) {
                highscore_ever = highscore;
                localStorage.setItem("circles-game-highscore", highscore_ever);
            }
        }
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
    canvas_height = Math.round(vh(90));
    canvas_width = Math.round((canvas_height * 9) / 16);

    // aim for 6 pixels per cm on a 374x665 canvas. e.g. a canvas twice the size will have 12 pixels per cm
    pixels_per_cm = (canvas_width / target_canvas_width) * target_pixels_per_cm;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        ctx.canvas.width = canvas_width;
        ctx.canvas.height = canvas_height;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    })

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    //refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_diagnostics() {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16+40+40, "#fff", "MS Gothic", 12
    )

    let frame_time_splits = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100).toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28+40+40, "#fff", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw", 10+(6*(1+13)), 28+40+40, "#0f0", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc", 10+(6*(1+2+13+6+4)), 28+40+40, "#f00", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait", 10+(6*(1+2+2+13+6+4+6+4)), 28+40+40, "#666", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, `avg time delta: ${Math.round(time_deltas.reduce((a,b) => a+b, 0) / (time_deltas.length+Number.EPSILON) * 100) / 100}`, 10, 40+40+40, "#fff", "MS Gothic", 12
    )
}

function render_board(board, debug=false) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height); // balls
    
    let canvas = layers.fg2.canvas;
    let ctx = layers.fg2.ctx;

    board.balls.forEach(ball => {
        if (ball.merge_cooldown && ball.merge_cooldown > 0) {
            return;
        }

        let w = (5/6) * pixels_per_cm;

        ctx.beginPath();
        ctx.arc(ball.position.x * pixels_per_cm, ball.position.y * pixels_per_cm, (ball.radius * pixels_per_cm) - (w/2), 0, 2 * Math.PI, false);
        ctx.fillStyle = ball.colour.css();
        ctx.fill();
        ctx.lineWidth = w;
        ctx.strokeStyle = ball.colour.lerp(Colour.black, 0.5).css();
        ctx.stroke();
        ctx.closePath();

        if (debug) {
            let mg = `vel: ${(Math.round(ball.velocity.magnitude() * 100) / 100).toString()}`;
            let mg2 = `pdlx6: ${ball.last_pos.sqr_distance(ball.position)}`;
            let slen = mg.length;
            write_text(
                ctx, mg2, (-10 * 6 * 0.5) + ball.position.x * pixels_per_cm, -74 + (ball.position.y * pixels_per_cm), Colour.white.css(), "MS Gothic", 12
            )

            write_text(
                ctx, mg, (-10 * 6 * 0.5) + ball.position.x * pixels_per_cm, -60 + (ball.position.y * pixels_per_cm), Colour.white.css(), "MS Gothic", 12
            )

            write_text(
                ctx, `${ball.at_rest ? "REST": "MOVING"}`, (-10 * 6 * 0.5) + ball.position.x * pixels_per_cm, -46 + (ball.position.y * pixels_per_cm), ball.at_rest ? Colour.red.css() : Colour.green.css(), "MS Gothic", 12
            )
        }
    })
}

function render_particles(board) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height); // particles
    
    let canvas = layers.fg1.canvas;
    let ctx = layers.fg1.ctx;

    board.particles.forEach(part => {
        let w = (5/6) * pixels_per_cm;

        ctx.beginPath();
        ctx.arc(part.position.x * pixels_per_cm, part.position.y * pixels_per_cm, (part.radius * pixels_per_cm) - (w/2), 0, 2 * Math.PI, false);

        ctx.fillStyle = part.colour.css();
        ctx.fill();

        ctx.lineWidth = (5/6) * pixels_per_cm;
        ctx.strokeStyle = part.colour.lerp(Colour.black, 0.5).css();
        ctx.stroke();
        ctx.closePath();
    })
}

function render_ui() {
    // render the next ball to be created and a line showing its trajectory
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height); // ball ghost
    
    let canvas = layers.fg1.canvas;
    let ctx = layers.fg1.ctx;

    if (ball_drop_cd <= 0) {
        ctx.beginPath();
        ctx.moveTo(ball_drop_pos.x * pixels_per_cm, ball_drop_pos.y * pixels_per_cm);
        ctx.lineTo(ball_drop_pos.x * pixels_per_cm, canvas_height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#888";
        
        ctx.stroke();
        ctx.closePath();


        let props = MergeGameBall.level_properties[next_ball_level];
        let w = (5/6) * pixels_per_cm;

        ctx.beginPath();
        ctx.arc(
            ball_drop_pos.x * pixels_per_cm, ball_drop_pos.y * pixels_per_cm,
            (props.radius * pixels_per_cm) - (w/2),
            0, 2 * Math.PI, false
        );

        ctx.fillStyle = props.colour.css();
        ctx.fill();

        ctx.lineWidth = (5/6) * pixels_per_cm;
        ctx.strokeStyle = props.colour.lerp(Colour.black, 0.5).css();
        ctx.stroke();
        ctx.closePath();
    }

    ctx.beginPath();
    ctx.moveTo(0, pixels_per_cm * board.size.y * 0.3);
    ctx.lineTo(board.size.x * pixels_per_cm, pixels_per_cm * board.size.y * 0.3);

    ctx.lineWidth = 4 + (Math.sin(Math.pow(lose_timer, 3)/1.5) * 2);
    ctx.strokeStyle = "#f44";
    
    ctx.stroke();
    ctx.closePath();

    // then render score as well
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height); // score text
    
    canvas = layers.ui1.canvas;
    ctx = layers.ui1.ctx;

    write_text(
        ctx, `you have `, 10, 24, Colour.white.css(), "nec_apc", 16
    )

    write_text(
        ctx, `${format_number(score, NumberFormat.SCIENTIFIC)}`, 10+(9*8), 24, Colour.green.css(), "nec_apc", 16
    )

    write_text(
        ctx, ` points :)`, 10+(9*8)+(`${format_number(score, NumberFormat.SCIENTIFIC)}`.length*8), 24, Colour.white.css(), "nec_apc", 16
    )

    write_text(
        ctx, `best score (this session): `, 10, 24+16+2, Colour.white.css(), "nec_apc", 16
    )

    write_text(
        ctx, `${format_number(highscore, NumberFormat.SCIENTIFIC)}`, 10+(27*8), 24+16+2, Colour.green.css(), "nec_apc", 16
    )

    write_text(
        ctx, `best score (all time): `, 10, 24+32+4, Colour.white.css(), "nec_apc", 16
    )

    write_text(
        ctx, `${format_number(highscore_ever, NumberFormat.SCIENTIFIC)}`, 10+(27*8), 24+32+4, Colour.green.css(), "nec_apc", 16
    )
}

function game_loop() {
    framecount++;

    let frame_start_time = Date.now();

    render_board(board);
    render_particles(board);
    render_ui();

    // render_diagnostics();

    let render_end_time = Date.now();

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    for (let i=0; i<PHYS_GRANULARITY; i++) {
        board.physics_step(delta_time / (1000 * PHYS_GRANULARITY));
    }

    board.particle_step(delta_time / 1000);
    ball_drop_cd -= delta_time / 1000;

    let lose_threshold = board.size.y * 0.27;
    if (board.balls.some(ball => ball.position.y-ball.radius <= lose_threshold)) {
        lose_timer += delta_time / 1000;
        if (lose_timer > 5) {
            board.balls = [];
            board.particles = [];

            score = 0;
            next_ball_level = 0;
            highest_ball_level = 3;
            ball_drop_cd = 0.5;
        }
    } else {
        lose_timer = 0;
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

    setTimeout(game_loop, time_to_wait);
}

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();

let board = null;

let mouse_down = false;
let mouse_position = null;

let player_ball = null;

let score = 0;
let next_ball_level = 0;
let highest_ball_level = 3;

let ball_drop_pos = null;
let ball_drop_cd = 0;

let framecount = 0;

let highscore = 0;
let highscore_ever = 0;

let lose_timer = 0;

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    bdp = function() {
        ball_drop_pos = mouse_position.div(pixels_per_cm)
        ball_drop_pos.y = Math.floor(board.size.y * 0.2);

        ball_drop_pos.x = Math.max(MergeGameBall.level_properties[next_ball_level].radius, Math.min(
            board.size.x - MergeGameBall.level_properties[next_ball_level].radius, ball_drop_pos.x
        ))
    }

    db = function() {
        if (ball_drop_cd <= 0) {
            board.spawn_ball(
                new MergeGameBall(next_ball_level),
                ball_drop_pos
            )

            next_ball_level = random_int(0, highest_ball_level);
            ball_drop_cd = 0.25;
        }
    }

    layers.front.canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);

        bdp();
    });

    layers.front.canvas.addEventListener("touchstart", function(event) {
        mouse_position = new Vector2(event.changedTouches[0].clientX-canvas_x, event.changedTouches[0].clientY-canvas_y);

        bdp();
    });

    layers.front.canvas.addEventListener("touchmove", function(event) {
        mouse_position = new Vector2(event.changedTouches[0].clientX-canvas_x, event.changedTouches[0].clientY-canvas_y);

        bdp();
    });

    layers.front.canvas.addEventListener("mousedown", function(event) {
        db();
        
        mouse_down = true;
    });

    layers.front.canvas.addEventListener("touchend", function(event) {
        db();

        mouse_down = false;
    });


    layers.front.canvas.addEventListener("mouseup", function(event) {
        mouse_down = false;
    });

    window.addEventListener("resize", handle_resize)

    handle_resize();

    board = new Board(new Vector2(
        canvas_width / pixels_per_cm, canvas_height / pixels_per_cm
    ));

    document.getElementById("game-container").style.display = "";

    highscore_ever = localStorage.getItem("circles-game-highscore");
    try {
        highscore_ever = Number.parseInt(highscore_ever);
    } catch {
        
    }

    if (!highscore_ever) {
        highscore_ever = 0;
    }

    setTimeout(function() {
        var rect = layers.front.canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;

        ball_drop_pos = new Vector2(
            Math.floor(board.size.x / 2), Math.floor(board.size.y * 0.2)
        )
        
        game_loop();
    })

    /*
    board.spawn_ball(
        new Ball(1, 25 / pixels_per_cm, Colour.red),
        new Vector2(30, 0)
    )

    for (let i=0; i<100; i++) {
        board.spawn_ball(
            new Ball(10, 5 / pixels_per_cm, Colour.green),
            new Vector2(Math.floor(board.size.x / 2) + 35, -200)
        )
    }

    player_ball = board.spawn_ball(
        new Ball(1, 100 / pixels_per_cm, Colour.blue),
        new Vector2(29, board.size.y-30)
    )
    player_ball.set_velocity(new Vector2(200/pixels_per_cm, 0));

    board.spawn_ball(
        new Ball(1, 50 / pixels_per_cm, Colour.white),
        new Vector2(board.size.x-30, board.size.y-30)
    )

    board.spawn_ball(
        new Ball(1, 100 / pixels_per_cm, Colour.green.lerp(Colour.red, 0.5)),
        new Vector2(Math.floor(board.size.x / 2), Math.floor(board.size.y / 2))
    )

    board.spawn_ball(
        new Ball(1, 10 / pixels_per_cm, Colour.green.lerp(Colour.red, 0.2)),
        new Vector2(Math.floor(board.size.y / 4), Math.floor(board.size.y / 1.2))
    ).set_velocity(new Vector2(2000 / pixels_per_cm, -1000 / pixels_per_cm))
    */
})
