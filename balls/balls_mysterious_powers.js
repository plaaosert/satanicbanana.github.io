let GOD = null;

function setup_god(board) {
    GOD = new WeaponBall(
        board, 1, 1, Colour.white, 1, 1, {
            id: -1,
            stats: {
                damage_bonus: 1,
                defense_bonus: 1,
                ailment_resistance: 1,
            }
        }, 0
    );

    GOD.id = -1;
}

const MYSTERIOUS_POWERS = {
    EXPLOSION: "EXPLOSION",
    BLACK_HOLE: "BLACK_HOLE",
    WHITE_HOLE: "WHITE_HOLE",
    ARROW_STORM: "ARROW_STORM",
    TOUCH_OF_PAIN: "TOUCH_OF_PAIN",
    SHRINKIFY: "SHRINKIFY",
    LARGEIFY: "LARGEIFY",
}

const MYSTERIOUS_POWERS_ORDER = [
    MYSTERIOUS_POWERS.EXPLOSION,
    MYSTERIOUS_POWERS.BLACK_HOLE,
    MYSTERIOUS_POWERS.WHITE_HOLE,
    MYSTERIOUS_POWERS.ARROW_STORM,
    MYSTERIOUS_POWERS.TOUCH_OF_PAIN,
    MYSTERIOUS_POWERS.SHRINKIFY,
    MYSTERIOUS_POWERS.LARGEIFY,
]

const MYSTERIOUS_POWER_INFO = {
    [MYSTERIOUS_POWERS.EXPLOSION]: {
        name: "Explosion",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            let pos = gamepos.add(new Vector2(6, -14).mul(128/96).mul(1 + (power * 0.2)).mul(PARTICLE_SIZE_MULTIPLIER));

            let proj = new GrenadeExplosionProjectile(
                board, GOD, 0, pos, power * 5, 1 + (power * 0.2)
            );

            board.spawn_projectile(proj, pos);

            play_audio("explosion2");
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            return;
        },
        desc_fn: (board, power) => {
            return `Damage: ${(power * 5).toFixed(0)} | Size: ${(1 + (power * 0.2)).toFixed(1)}`;
        }
    },
    [MYSTERIOUS_POWERS.BLACK_HOLE]: {
        name: "Black Hole",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            return;
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            // pull all balls in
            board.balls.forEach(ball => {
                let pointing_vector = gamepos.sub(ball.position);
                let distance = pointing_vector.magnitude();
                let max_distance = 10000;

                let distance_prop = 1 - (distance / max_distance);

                let normalised = pointing_vector.div(distance);
                let g = 10 + (power * 7.5);

                ball.add_impulse(normalised.mul((time_delta * g) * distance_prop));
            })
        },
        desc_fn: (board, power) => {
            return ``;
        }
    },
    [MYSTERIOUS_POWERS.WHITE_HOLE]: {
        name: "White Hole",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            return;
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            // push all balls out
            board.balls.forEach(ball => {
                let pointing_vector = gamepos.sub(ball.position);
                let distance = pointing_vector.magnitude();
                let max_distance = 10000;

                let distance_prop = 1 - (distance / max_distance);

                let normalised = pointing_vector.div(distance);
                let g = 10 + (power * 7.5);

                ball.add_impulse(normalised.mul((time_delta * -g) * distance_prop));
            })
        },
        desc_fn: (board, power) => {
            return ``;
        }
    },
    [MYSTERIOUS_POWERS.ARROW_STORM]: {
        name: "Arrow Storm",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            let arrows = Math.pow(power, 2);
            for (let i=0; i<arrows; i++) {
                let angle = random_float(0, Math.PI * 2);
                let offset = new Vector2(24, 0).rotate(angle);

                let firepos = gamepos.add(offset);

                board.spawn_projectile(
                    new ArrowProjectile(
                        board,
                        GOD, 0, firepos, 4, 1,
                        new Vector2(1, 0).rotate(angle),
                        10000 * random_float(0.75, 1.25), Vector2.zero
                    ), firepos
                )
            }
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            return;
        },
        desc_fn: (board, power) => {
            return `Arrows: ${Math.pow(power, 2).toFixed(0)}`;
        }
    },
    [MYSTERIOUS_POWERS.TOUCH_OF_PAIN]: {
        name: "Touch of Pain",
        power_start: 2,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            return;
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            let targeted_ball = board.balls.reduce((p, c) => {
                if (c.invuln_duration > 0)
                    return p;

                // first check if the current ball is in range
                let ball_dist = c.position.sqr_distance(gamepos);
                if (ball_dist <= Math.pow(c.radius, 2)) {
                    if (!p || ball_dist < p[1]) {
                        return [c, ball_dist];
                    }
                }

                return p;
            }, null);

            if (targeted_ball) {
                let ball = targeted_ball[0];
                GOD.hit_other(ball, 0, power * 5);

                ball.last_hit = 0;
                ball.last_damage_source = GOD;

                let particle = new Particle(
                    gamepos, 0, 2,
                    entity_sprites.get("hit"), 16, 4, false
                )

                board.spawn_particle(particle, gamepos);
            }
        },
        desc_fn: (board, power) => {
            return `Damage: ${(power * 5).toFixed(0)}`;
        }
    },
    [MYSTERIOUS_POWERS.SHRINKIFY]: {
        name: "Shrinkify",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            return;
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            let targeted_ball = board.balls.reduce((p, c) => {
                // first check if the current ball is in range
                let ball_dist = c.position.sqr_distance(gamepos);
                if (ball_dist <= Math.pow(c.radius, 2)) {
                    if (!p || ball_dist < p[1]) {
                        return [c, ball_dist];
                    }
                }

                return p;
            }, null);

            if (targeted_ball) {
                let ball = targeted_ball[0];

                ball.radius -= power * 0.25 * time_delta;

                let particle = new Particle(
                    gamepos, 0, 2,
                    entity_sprites.get("hit"), 16, 4, false
                )

                board.spawn_particle(particle, gamepos);
            }
        },
        desc_fn: (board, power) => {
            return `Shrinkage rate: ${power * 0.25}/s`;
        }
    },
    [MYSTERIOUS_POWERS.LARGEIFY]: {
        name: "Largeify",
        power_start: 5,
        power_min: 1,
        power_max: 20,
        effect_click: (board, power, gamepos) => {
            return;
        },
        effect_hold: (board, power, gamepos, time_delta) => {
            let targeted_ball = board.balls.reduce((p, c) => {
                // first check if the current ball is in range
                let ball_dist = c.position.sqr_distance(gamepos);
                if (ball_dist <= Math.pow(c.radius, 2)) {
                    if (!p || ball_dist < p[1]) {
                        return [c, ball_dist];
                    }
                }

                return p;
            }, null);

            if (targeted_ball) {
                let ball = targeted_ball[0];

                ball.radius += power * 0.25 * time_delta;

                let particle = new Particle(
                    gamepos, 0, 2,
                    entity_sprites.get("hit"), 16, 4, false
                )

                board.spawn_particle(particle, gamepos);
            }
        },
        desc_fn: (board, power) => {
            return `Growth rate: ${power * 0.25}/s`;
        }
    },
}