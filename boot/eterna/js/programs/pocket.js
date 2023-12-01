const PHYS_GRANULARITY = 64;
const DEFAULT_BALL_RESTITUTION = 0.85;
const DEFAULT_BALL_FRICTION = 0.995;

const fps = 60;

const target_canvas_width = 300;

const descaling = 1000;
const target_pixels_per_cm = (6/descaling);

let pixels_per_cm = 6;

let canvas_x = 0;
let canvas_y = 0;

class Board {
    constructor(size) {
        this.size = size;
        this.balls = [];

        this.gravity = new Vector2(0, 0);
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
            ball.check_ceiling_bounce(sthis);
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
            this.velocity = this.velocity.mul(Math.pow(this.friction_factor, 1/PHYS_GRANULARITY))
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

class PocketBall extends Ball {
    constructor(mass, radius, colour, bounce_factor, friction_factor) {
        super(mass, radius, colour, bounce_factor, friction_factor);

        this.rotation_frame = 0;
        this.angle = 0;  // deg
    }

    physics_step(time_delta) {
        let direction = this.velocity.normalize();
        let speed = this.velocity.magnitude();

        if (speed >= 0.01) {
            this.rotation_frame += (speed * time_delta * 0.5);
            this.rotation_frame = this.rotation_frame % 14;

            this.angle = direction.angle();
        }

        super.physics_step(time_delta);
    }
}

let pocket_display_markup = new EternaDisplayMarkupContainer(
    "Pocket", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "game_area",
                0, 0, "100%", "100%", {
                    backgroundColor: "#71413b"
                }, false
            ), []
        )
    ]
)

let default_pocket_kernel = new EternaProcessKernel(
    pocket_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.setup_needed = true;
        data.game_state = "game";  // eventually this will be menu

        let board = new Board(new Vector2(352, 224))
        data.game = {
            board: board,

            balls: {
                0: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(352-90, 106)),

                1: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+40, 106)),    // 1
                2: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+30, 106-6)), // 2
                3: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+30, 106+6)), // 3
                4: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+20, 106-12)), // 4
                5: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+20, 106)),    // 5
                6: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+20, 106+12)), // 6
                7: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+10, 106-18)), // 7
                8: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+10, 106-6)), // 8
                9: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+10, 106+6)), // 9
                10: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72+10, 106+18)), // 10
                11: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72, 106-24)),    // 11
                12: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72, 106-12)),    // 12
                13: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72, 106)),       // 13
                14: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72, 106+12)),    // 14
                15: board.spawn_ball(new PocketBall(1, 6, "#fff"), new Vector2(72, 106+24))     // 15
            }
        }

        return {endnow: false}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return true;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        if (data.setup_needed) {
            data.set_content_size(new Vector2(704, 448+256));
        }

        for (let i=0; i<PHYS_GRANULARITY; i++) {
            data.game.board.physics_step((1000/60) / (1000 * PHYS_GRANULARITY));
        }

        if (data.keypresses.length > 2) {
            data.game.balls[0].add_impulse(new Vector2(-400, 0));
            data.game.balls[0].at_rest = false;

            data.keypresses = [];
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {};

        if (data.setup_needed) {
            data.setup_needed = false;

            // erase everything and rebuild it based on the state
            paint_data.removals = ["game_area"];

            // we're going to create everything we need for the specific state;
            // so even if we don't use all the balls in a level we're going to spawn them all right now.
            // if they're not used, we just place them offscreen
            switch (data.game_state) {
                case "menu":
                    break;
                
                case "game": {
                    // flat "00"oh
                    // corner "1X" [0-3]
                    // side pocket "2X"
                    // corner connector 3
                    // side 4
                    // if "h", flip horizontally, if "v", flip vertically, if "d", flip both, if "n", flip none

                    // 11x7 tiles
                    let tiles = [
                        ["10n", "31v", "41n", "41n", "41n", "21n", "41n", "41n", "41n", "31n", "11n"],
                        ["30n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "32v"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["30v", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "32n"],
                        ["13n", "33n", "43n", "43n", "43n", "23n", "43n", "43n", "43n", "33v", "12n"],
                    ]

                    // TODO should be eterna paths, find a way to batch create a lot of base64 because there's a lot of sprites
                    let tile_sources = [
                        "sprites/game/pocket/tiles/center_tile.png",
                        "sprites/game/pocket/tiles/corner_pocket_tile.png",
                        "sprites/game/pocket/tiles/side_pocket_tile.png",
                        "sprites/game/pocket/tiles/corner_connector_tile.png",
                        "sprites/game/pocket/tiles/side_tile.png"
                    ]

                    let tile_objs = [];
                    for (let x=0; x<tiles[0].length; x++) {
                        for (let y=0; y<tiles.length; y++) {
                            let ct = tiles[y][x];
                            tile_objs.push(EternaDisplayObject.image(
                                `tile_${x}_${y}`, tile_sources[ct[0]],
                                x*64, y*64, 64, 64, {
                                    transform: `rotate(${Number.parseInt(ct[1]) * 90}deg) scaleX(${ct[2] == "h" || ct[2] == "d" ? -1 : 1}) scaleY(${ct[2] == "v" || ct[2] == "d" ? -1 : 1})`
                                }, false
                            ).to_empty_markup())
                        }
                    }

                    paint_data.additions = new EternaDisplayMarkupElement(
                        EternaDisplayObject.div(
                            "game_area",
                            0, 0, 704, 448+256, {
                                backgroundColor: "#71413b" 
                            }, true
                        ), [
                            new EternaDisplayMarkupElement(
                                EternaDisplayObject.div(
                                    "table_tiles", 0, 0, 704, 448, {}, false
                                ), [
                                    ...tile_objs,
                                ]
                            ),

                            // should be randomised when we get to the actual game but place them in order here
                            ...(new Array(15).fill(0).map((_,i) => {
                                return new EternaDisplayMarkupElement(
                                    EternaDisplayObject.div(
                                        `ball_${i+1}`, 144, 212, 24, 24, {}, false
                                    ), [
                                        EternaDisplayObject.image(
                                            `ball_${i+1}_sprite`, `sprites/game/pocket/balls/ball_${i % 8}.png`,
                                            0, 0, 24, 24, {}, false
                                        ).to_empty_markup(),
    
                                        EternaDisplayObject.image(
                                            `ball_${i+1}_overlay`, `sprites/game/pocket/balls/overlay/solid_ball_rotation_overlay_0.png`,
                                            0, 0, 24, 24, {}, false
                                        ).to_empty_markup(),
    
                                        EternaDisplayObject.image(
                                            `ball_${i+1}_overlay_alt`, `sprites/game/pocket/balls/overlay/striped_ball_rotation_overlay_0.png`,
                                            0, 0, 24, 24, {
                                                visibility: i < 8 ? "hidden" : "visible"
                                            }, false
                                        ).to_empty_markup(),
                                    ]
                                )
                            })),

                            new EternaDisplayMarkupElement(
                                EternaDisplayObject.div(
                                    `ball_0`, 496, 212, 24, 24, {}, false
                                ), [
                                    EternaDisplayObject.image(
                                        `ball_0_sprite`, `sprites/game/pocket/balls/ball_8.png`,
                                        0, 0, 24, 24, {}, false
                                    ).to_empty_markup(),

                                    EternaDisplayObject.image(
                                        `ball_0_overlay`, `sprites/game/pocket/balls/overlay/solid_ball_rotation_overlay_0.png`,
                                        0, 0, 24, 24, {
                                            visibility: "hidden"
                                        }, false
                                    ).to_empty_markup(),

                                    EternaDisplayObject.image(
                                        `ball_0_overlay_alt`, `sprites/game/pocket/balls/overlay/striped_ball_rotation_overlay_0.png`,
                                        0, 0, 24, 24, {
                                            visibility: "hidden"
                                        }, false
                                    ).to_empty_markup(),
                                ]
                            )
                        ]
                    ).to_initial_paint();
                    break;
                }
            }
        } else {
            // if we're in game mode, update ball positions
            paint_data.edits = [];

            switch (data.game_state) {
                case "menu":
                    break;
                
                case "game": {
                    for (let i=0; i<16; i++) {
                        let ball = data.game.balls[i];
                        paint_data.edits.push({
                            edit_id: `ball_${i}`,
                            changes: {
                                styles: {
                                    left: `${Math.round(ball.position.x * 2)}px`,
                                    top: `${Math.round(ball.position.y * 2)}px`,
                                }
                            }
                        })

                        paint_data.edits.push({
                            edit_id: `ball_${i}_overlay`,
                            changes: {
                                styles: {
                                    "ott-tag-src": `sprites/game/pocket/balls/overlay/solid_ball_rotation_overlay_${Math.floor(ball.rotation_frame)}.png`,
                                    transform: `rotate(${ball.angle}rad)`
                                }
                            }
                        })

                        paint_data.edits.push({
                            edit_id: `ball_${i}_overlay_alt`,
                            changes: {
                                styles: {
                                    "ott-tag-src": `sprites/game/pocket/balls/overlay/striped_ball_rotation_overlay_${Math.floor(ball.rotation_frame)}.png`,
                                    transform: `rotate(${ball.angle}rad)`
                                }
                            }
                        })
                    }
                }
            }
        }

        return paint_data;
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
        disallow_resize: true
    }
)