function set_pos(x, y, to) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {pos: to});
    }
}

function modify_pos(x, y, by) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {pos: positive_mod(get_hand(x, y).pos + by, POS_MAX)})
    }
}

function set_col(x, y, col) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {col: col})
    }
}

function add_col(x, y, col) {
    if (pos_valid(x, y)) {
        let c = get_hand(x, y).col;
        c = c.map((v, i) => Math.max(0, Math.min(255, v + col[i])));

        set_hand(x, y, {col: c});
    }
}

function set_rot(x, y, rot) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {rot: rot});
    }
}

function mod_rot(x, y, amt) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {rot: (get_hand(x, y).rot + amt) % 360});
    }
}

function set_orient(x, y, orient) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {orient: orient});
    }
}

function toggle_orient(x, y) {
    if (pos_valid(x, y)) {
        set_hand(x, y, {orient: get_hand(x, y).orient == 0 ? 1 : 0});
    }
}

function point_at(x, y, to_x, to_y, away=false) {
    // horizontal wins in ties
    let x_delta = to_x - x;
    let y_delta = to_y - y;

    let chosen_rot = 0;
    if (Math.abs(x_delta) >= Math.abs(y_delta)) {
        chosen_rot = x_delta > 0 ? 90 : 270
    } else {
        chosen_rot = y_delta > 0 ? 180 : 0
    }

    set_rot(x, y, away ? chosen_rot + 180 : chosen_rot);
}

function random_col() {
    return [
        random_int(0, 256),
        random_int(0, 256),
        random_int(0, 256)
    ]
}

const hand_functions_leftclick_down = [
    // row 0
    [
        function(x, y) {},  // (0, 0)
        function(x, y) {},  // (1, 0)
        function(x, y) {},  // (2, 0)
        function(x, y) {},  // (3, 0)
        function(x, y) {},  // (4, 0)
        function(x, y) {},  // (5, 0)
        function(x, y) {},  // (6, 0)
        function(x, y) {},  // (7, 0)
    ],

    // row 1
    [
        function(x, y) {},  // (0, 1)
        function(x, y) {},  // (1, 1)
        function(x, y) {},  // (2, 1)
        function(x, y) {},  // (3, 1)
        function(x, y) {},  // (4, 1)
        function(x, y) {},  // (5, 1)
        function(x, y) {},  // (6, 1)
        function(x, y) {},  // (7, 1)
    ],

    // row 2
    [
        function(x, y) {},  // (0, 2)
        function(x, y) {},  // (1, 2)
        function(x, y) {},  // (2, 2)
        function(x, y) {},  // (3, 2)
        function(x, y) {},  // (4, 2)
        function(x, y) {},  // (5, 2)
        function(x, y) {},  // (6, 2)
        function(x, y) {},  // (7, 2)
    ],

    // row 3
    [
        function(x, y) {},  // (0, 3)
        function(x, y) {},  // (1, 3)
        function(x, y) {},  // (2, 3)
        function(x, y) {},  // (3, 3)
        function(x, y) {},  // (4, 3)
        function(x, y) {},  // (5, 3)
        function(x, y) {},  // (6, 3)
        function(x, y) {},  // (7, 3)
    ],

    // row 4
    [
        function(x, y) {},  // (0, 4)
        function(x, y) {},  // (1, 4)
        function(x, y) {},  // (2, 4)
        function(x, y) {},  // (3, 4)
        function(x, y) {},  // (4, 4)
        function(x, y) {},  // (5, 4)
        function(x, y) {},  // (6, 4)
        function(x, y) {},  // (7, 4)
    ],

    // row 5
    [
        function(x, y) {},  // (0, 5)
        function(x, y) {},  // (1, 5)
        function(x, y) {},  // (2, 5)
        function(x, y) {},  // (3, 5)
        function(x, y) {},  // (4, 5)
        function(x, y) {},  // (5, 5)
        function(x, y) {},  // (6, 5)
        function(x, y) {},  // (7, 5)
    ],

    // row 6
    [
        function(x, y) {},  // (0, 6)
        function(x, y) {},  // (1, 6)
        function(x, y) {},  // (2, 6)
        function(x, y) {
            set_col(x, y, [255, 0, 0]);
            set_pos(x, y, 25)
        },  // (3, 6)
        function(x, y) {},  // (4, 6)
        function(x, y) {},  // (5, 6)
        function(x, y) {},  // (6, 6)
        function(x, y) {},  // (7, 6)
    ],

    // row 7
    [
        function(x, y) {},  // (0, 7)
        function(x, y) {},  // (1, 7)
        function(x, y) {},  // (2, 7)
        function(x, y) {},  // (3, 7)
        function(x, y) {},  // (4, 7)
        function(x, y) {},  // (5, 7)
        function(x, y) {},  // (6, 7)
        function(x, y) {},  // (7, 7)
    ],
]

const hand_functions_rightclick_down = [
    // row 0
    [
        function(x, y) {},  // (0, 0)
        function(x, y) {},  // (1, 0)
        function(x, y) {},  // (2, 0)
        function(x, y) {},  // (3, 0)
        function(x, y) {},  // (4, 0)
        function(x, y) {},  // (5, 0)
        function(x, y) {},  // (6, 0)
        function(x, y) {},  // (7, 0)
    ],

    // row 1
    [
        function(x, y) {},  // (0, 1)
        function(x, y) {},  // (1, 1)
        function(x, y) {},  // (2, 1)
        function(x, y) {},  // (3, 1)
        function(x, y) {},  // (4, 1)
        function(x, y) {},  // (5, 1)
        function(x, y) {},  // (6, 1)
        function(x, y) {},  // (7, 1)
    ],

    // row 2
    [
        function(x, y) {},  // (0, 2)
        function(x, y) {},  // (1, 2)
        function(x, y) {},  // (2, 2)
        function(x, y) {},  // (3, 2)
        function(x, y) {},  // (4, 2)
        function(x, y) {},  // (5, 2)
        function(x, y) {},  // (6, 2)
        function(x, y) {},  // (7, 2)
    ],

    // row 3
    [
        function(x, y) {},  // (0, 3)
        function(x, y) {},  // (1, 3)
        function(x, y) {},  // (2, 3)
        function(x, y) {},  // (3, 3)
        function(x, y) {},  // (4, 3)
        function(x, y) {},  // (5, 3)
        function(x, y) {},  // (6, 3)
        function(x, y) {},  // (7, 3)
    ],

    // row 4
    [
        function(x, y) {},  // (0, 4)
        function(x, y) {},  // (1, 4)
        function(x, y) {},  // (2, 4)
        function(x, y) {},  // (3, 4)
        function(x, y) {},  // (4, 4)
        function(x, y) {},  // (5, 4)
        function(x, y) {},  // (6, 4)
        function(x, y) {},  // (7, 4)
    ],

    // row 5
    [
        function(x, y) {},  // (0, 5)
        function(x, y) {},  // (1, 5)
        function(x, y) {},  // (2, 5)
        function(x, y) {},  // (3, 5)
        function(x, y) {},  // (4, 5)
        function(x, y) {},  // (5, 5)
        function(x, y) {},  // (6, 5)
        function(x, y) {},  // (7, 5)
    ],

    // row 6
    [
        function(x, y) {},  // (0, 6)
        function(x, y) {},  // (1, 6)
        function(x, y) {},  // (2, 6)
        function(x, y) {},  // (3, 6)
        function(x, y) {},  // (4, 6)
        function(x, y) {},  // (5, 6)
        function(x, y) {},  // (6, 6)
        function(x, y) {},  // (7, 6)
    ],

    // row 7
    [
        function(x, y) {},  // (0, 7)
        function(x, y) {},  // (1, 7)
        function(x, y) {},  // (2, 7)
        function(x, y) {},  // (3, 7)
        function(x, y) {},  // (4, 7)
        function(x, y) {},  // (5, 7)
        function(x, y) {},  // (6, 7)
        function(x, y) {},  // (7, 7)
    ],
]

const hand_functions_leftclick_up = [
    // row 0
    [
        function(x, y) { modify_pos(x, y, 1) },  // (0, 0)
        function(x, y) {
            modify_pos(x+1, y, 1)
            modify_pos(x-1, y, 1)
            modify_pos(x, y+1, 1)
            modify_pos(x, y-1, 1)
        },  // (1, 0)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                modify_pos(xt, y, 1)
            }
        },  // (2, 0)
        function(x, y) {
            for (let yt=0; yt<GAME_WIDTH; yt++) {
                modify_pos(x, yt, 1)
            }
        },  // (3, 0)
        function(x, y) {
            for (let i=0; i<8; i++) {
                let xt = random_int(0, 8);
                let yt = random_int(0, 8);

                modify_pos(xt, yt, 1)
            }
        },  // (4, 0)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(xt == x && yt == y)) {
                        modify_pos(xt, yt, 1)
                    }
                }
            }
        },  // (5, 0)
        function(x, y) {
            set_hand(x, y, {pos: random_int(0, POS_MAX)})
        },  // (6, 0)
        function(x, y) {
            hands_clickable = false;
            animations.push(new HandAnimation(
                {speed: 60}, hand_random_animation_function, 1000/60, true
            ))
        },  // (7, 0)
    ],

    // row 1
    [
        function(x, y) {
            set_col(x, y, [
                random_int(0, 256),
                random_int(0, 256),
                random_int(0, 256)
            ])
        },  // (0, 1)
        function(x, y) {
            set_col(x, y, [
                255, 0, 0
            ])
        },  // (1, 1)
        function(x, y) {
            let col_base = [
                random_int(0, 256),
                random_int(0, 256),
                random_int(0, 256)
            ]

            for (let xt=0; xt<GAME_WIDTH; xt++) {
                let c = lerp_arr([64, 64, 64], col_base, (xt+1)/GAME_WIDTH, true);
                set_col(xt, y, c)
            }
        },  // (2, 1)
        function(x, y) {
            let c = get_hand(x, y).col
            let r_rem = c[0];
            let g_rem = c[1];

            add_col(x-1, y, [r_rem, 0, 0]);
            add_col(x+1, y, [0, g_rem, 0]);

            add_col(x, y, [-r_rem, -g_rem, 0])
        },  // (3, 1)
        function(x, y) {
            let c = get_hand(x, y).col
            let r_rem = c[0] - 32;
            let g_rem = c[1] - 32;
            let b_rem = c[2] - 32;

            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [r_rem, 0, 0]);
            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [0, g_rem, 0]);
            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [0, 0, b_rem]);

            add_col(x, y, [-r_rem, -g_rem, -b_rem])
        },  // (4, 1)
        function(x, y) {
            let col = get_hand(x, y).col;

            set_col(x, y, [
                255 - col[0],
                255 - col[1],
                255 - col[2]
            ])
        },  // (5, 1)
        function(x, y) {
            let hand = get_hand(x, y);

            let r_val = Math.floor(hand.col[0] / 4);
            let b_val = Math.floor(hand.col[2] / 4);

            add_col(x+1, y+1, [r_val, 0, b_val]);
            add_col(x-1, y+1, [r_val, 0, b_val]);
            add_col(x+1, y-1, [r_val, 0, b_val]);
            add_col(x-1, y-1, [r_val, 0, b_val]);

            set_col(x, y, [0, hand.col[1], 0]);
        },  // (6, 1)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(xt == x && yt == y)) {
                        set_col(xt, yt, [
                            random_int(0, 256),
                            random_int(0, 256),
                            random_int(0, 256)
                        ])
                    }
                }
            }
        },  // (7, 1)
    ],

    // row 2
    [
        function(x, y) {
            point_at(x+1, y, x, y)
            point_at(x-1, y, x, y)
            point_at(x, y+1, x, y)
            point_at(x, y-1, x, y)

            set_pos(x+1, y, 19)
            set_pos(x-1, y, 19)
            set_pos(x, y+1, 19)
            set_pos(x, y-1, 19)
        },  // (0, 2)
        function(x, y) {
            set_pos(x, y, (get_hand(x, y).pos + 1) % 5)

            let p = get_hand(x, y).pos;

            for (let xt=-1; xt<2; xt++) {
                for (let yt=-1; yt<2; yt++) {
                    set_pos(x+xt, y+yt, p);
                }
            }
        },  // (1, 2)
        function(x, y) {
            set_pos(x, y, 31);

            let this_hand = get_hand(x, y);
            for (let i=1; i<8; i++) {
                let rot_n = this_hand.rot % 360
                if (rot_n % 180 == 0) {
                    // facing either up or down
                    if (rot_n == 0) {
                        // up
                        set_pos(x-i, y-i, 5);
                        set_pos(x+i, y-i, 5);

                        set_orient(x-i, y-i, 1);
                        set_orient(x+i, y-i, 0);

                        set_rot(x-i, y-i, this_hand.rot);
                        set_rot(x+i, y-i, this_hand.rot);
                    } else {
                        // down
                        set_pos(x-i, y+i, 5);
                        set_pos(x+i, y+i, 5);

                        set_orient(x-i, y+i, 0);
                        set_orient(x+i, y+i, 1);

                        set_rot(x-i, y+i, this_hand.rot);
                        set_rot(x+i, y+i, this_hand.rot);
                    }
                } else {
                    if (rot_n == 90) {
                        // right
                        set_pos(x+i, y-i, 5);
                        set_pos(x+i, y+i, 5);

                        set_orient(x+i, y-i, 1);
                        set_orient(x+i, y+i, 0);

                        set_rot(x+i, y-i, this_hand.rot);
                        set_rot(x+i, y+i, this_hand.rot);
                    } else {
                        // left
                        set_pos(x-i, y-i, 5);
                        set_pos(x-i, y+i, 5);

                        set_orient(x-i, y-i, 0);
                        set_orient(x-i, y+i, 1);

                        set_rot(x-i, y-i, this_hand.rot);
                        set_rot(x-i, y+i, this_hand.rot);
                    }
                }
            }
        },  // (2, 2)
        function(x, y) {},  // (3, 2)
        function(x, y) {},  // (4, 2)
        function(x, y) {},  // (5, 2)
        function(x, y) {},  // (6, 2)
        function(x, y) {},  // (7, 2)
    ],

    // row 3
    [
        function(x, y) {
            toggle_orient(x, y);
        },  // (0, 3)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                toggle_orient(xt, y);
            }
        },  // (1, 3)
        function(x, y) {
            for (let yt=0; yt<GAME_WIDTH; yt++) {
                toggle_orient(x, yt);
            }
        },  // (2, 3)
        function(x, y) {
            for (let xt=-1; xt<2; xt++) {
                for (let yt=-1; yt<2; yt++) {
                    if (xt | yt) {
                        toggle_orient(x+xt, y+yt)
                    }
                }
            }
        },  // (3, 3)
        function(x, y) {
            toggle_orient(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT))
        },  // (4, 3)
        function(x, y) {
            for (let i=1; i<=GAME_WIDTH; i++) {
                toggle_orient(x+i, y);
                toggle_orient(x-i, y);
                toggle_orient(x, y+i);
                toggle_orient(x, y-i);
                
                toggle_orient(x+i, y+i);
                toggle_orient(x-i, y+i);
                toggle_orient(x+i, y-i);
                toggle_orient(x-i, y-i);
            }
        },  // (5, 3)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(x == xt && y == yt)) {
                        toggle_orient(xt, yt);
                    }
                }
            }
        },  // (6, 3)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    set_orient(xt, yt, 0);
                }
            }
        },  // (7, 3)
    ],

    // row 4
    [
        function(x, y) {
            mod_rot(x, y, 90);
        },  // (0, 4)
        function(x, y) {
            set_rot(x, y, Math.floor(Math.random() * 4) * 90)
        },  // (1, 4)
        function(x, y) {
            mod_rot(x+1, y+1, 90);
            mod_rot(x+1, y-1, 90);
            mod_rot(x-1, y-1, 90);
            mod_rot(x-1, y+1, 90);
        },  // (2, 4)
        function(x, y) {
            mod_rot(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), 90)
        },  // (3, 4)
        function(x, y) {
            for (let i=0; i<16; i++) {
                mod_rot(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), Math.random() < 0.5 ? 90 : -90);
            }
        },  // (4, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    mod_rot(xt, yt, 90);
                }
            }
        },  // (5, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    set_rot(xt, yt, Math.floor(Math.random() * 4) * 90)
                }
            }
        },  // (6, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    point_at(xt, yt, 3.5, 3.5);
                }
            }
        },  // (7, 4)
    ],

    // row 5
    [
        function(x, y) {},  // (0, 5)
        function(x, y) {},  // (1, 5)
        function(x, y) {},  // (2, 5)
        function(x, y) {},  // (3, 5)
        function(x, y) {},  // (4, 5)
        function(x, y) {},  // (5, 5)
        function(x, y) {},  // (6, 5)
        function(x, y) {},  // (7, 5)
    ],

    // row 6
    [
        function(x, y) {},  // (0, 6)
        function(x, y) {},  // (1, 6)
        function(x, y) {},  // (2, 6)
        function(x, y) {
            set_pos(x, y, 5)
            set_col(x, y, [128, 128, 128])
            animations.push(new HandAnimation(
                {x: x, y: y, n: random_int(10, 20)}, hand_shoot_anim_function(x, y), 1000/15, true
            ))
        },  // (3, 6)
        function(x, y) {},  // (4, 6)
        function(x, y) {},  // (5, 6)
        function(x, y) {},  // (6, 6)
        function(x, y) {},  // (7, 6)
    ],

    // row 7
    [
        function(x, y) {},  // (0, 7)
        function(x, y) {},  // (1, 7)
        function(x, y) {},  // (2, 7)
        function(x, y) {},  // (3, 7)
        function(x, y) {},  // (4, 7)
        function(x, y) {},  // (5, 7)
        function(x, y) {},  // (6, 7)
        function(x, y) {},  // (7, 7)
    ],
]

const hand_functions_rightclick_up = [
    // row 0
    [
        function(x, y) { modify_pos(x, y, -1) },  // (0, 0)
        function(x, y) {
            modify_pos(x+1, y, -1)
            modify_pos(x-1, y, -1)
            modify_pos(x, y+1, -1)
            modify_pos(x, y-1, -1)
        },  // (1, 0)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                modify_pos(xt, y, -1)
            }
        },  // (2, 0)
        function(x, y) {
            for (let yt=0; yt<GAME_WIDTH; yt++) {
                modify_pos(x, yt, -1)
            }
        },  // (3, 0)
        function(x, y) {
            for (let i=0; i<8; i++) {
                let xt = random_int(0, 8);
                let yt = random_int(0, 8);

                modify_pos(xt, yt, -1)
            }
        },  // (4, 0)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(xt == x && yt == y)) {
                        modify_pos(xt, yt, -1)
                    }
                }
            }
        },  // (5, 0)
        function(x, y) {
            set_hand(x, y, {pos: 0})
        },  // (6, 0)
        function(x, y) {
            hands_clickable = false;
            animations.push(new HandAnimation(
                {speed: 30}, hand_reset_animation_function, 1000/60, true
            ))
        },  // (7, 0)
    ],

    // row 1
    [
        function(x, y) {
            set_col(x, y, [
                255, 228, 171
            ])
        },  // (0, 1)
        function(x, y) {
            set_col(x, y, [
                0, 255, 0
            ])
        },  // (1, 1)
        function(x, y) {
            let col_total = [0, 0, 0];

            let hands = [
                get_hand(x-1, y),
                get_hand(x+1, y),
                get_hand(x, y-1),
                get_hand(x, y+1)
            ]

            hands.forEach(h => {
                if (h) {
                    col_total[0] += h.col[0];
                    col_total[1] += h.col[1];
                    col_total[2] += h.col[2];
                }
            });

            col_total[0] = Math.round(col_total[0] / 4);
            col_total[1] = Math.round(col_total[1] / 4);
            col_total[2] = Math.round(col_total[2] / 4);

            set_col(x, y, col_total);
        },  // (2, 1)
        function(x, y) {
            let c = get_hand(x, y).col
            let r_rem = c[0];
            let b_rem = c[2];

            add_col(x, y-1, [r_rem, 0, 0]);
            add_col(x, y+1, [0, 0, b_rem]);

            add_col(x, y, [-r_rem, 0, -b_rem])
        },  // (3, 1)
        function(x, y) {
            let c = get_hand(x, y).col
            let r_need = 255 - c[0]
            let g_need = 255 - c[1]
            let b_need = 255 - c[2]

            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [-r_need, 0, 0]);
            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [0, -g_need, 0]);
            add_col(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), [0, 0, -b_need]);

            add_col(x, y, [r_need, g_need, b_need])
        },  // (4, 1)
        function(x, y) {
            invert = col => [255 - col[0], 255 - col[1], 255 - col[2]];

            set_col(x+1, y, invert(get_hand(x+1, y).col));
            set_col(x, y+1, invert(get_hand(x, y+1).col));
            set_col(x-1, y, invert(get_hand(x-1, y).col));
            set_col(x, y-1, invert(get_hand(x, y-1).col));
        },  // (5, 1)
        function(x, y) {
            set_col(x+1, y+1, [32, 32, 32]);
            set_col(x-1, y+1, [32, 32, 32]);
            set_col(x+1, y-1, [32, 32, 32]);
            set_col(x-1, y-1, [32, 32, 32]);
        },  // (6, 1)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(xt == x && yt == y)) {
                        set_col(xt, yt, [
                            0, 0, 0
                        ])
                    }
                }
            }
        },  // (7, 1)
    ],

    // row 2
    [
        function(x, y) {
            point_at(x+1, y, x+100, y)
            point_at(x-1, y, x-100, y)
            point_at(x, y+1, x, y+100)
            point_at(x, y-1, x, y-100)

            set_pos(x+1, y, 0)
            set_pos(x-1, y, 0)
            set_pos(x, y+1, 0)
            set_pos(x, y-1, 0)
        },  // (0, 2)
        function(x, y) {
            let this_hand = get_hand(x, y);
            for (let xt=-1; xt<=1; xt++) {
                for (let yt=-1; yt<=1; yt++) {
                    if (xt | yt) {
                        let xn = x+xt;
                        let yn = y+yt;

                        switch (this_hand.pos) {
                            case 0:
                                set_pos(xn, yn, random_int(0, POS_MAX))
                                break;

                            case 1:
                                set_col(xn, yn, random_col());
                                break;

                            case 2:
                                set_orient(xn, yn, Math.round(Math.random()));
                                break;

                            case 3:
                                set_rot(xn, yn, Math.floor(Math.random() * 4) * 90);
                                break;

                            default:
                                swap_hands(xn, yn, random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT));
                                break;                                   
                        }
                    }
                }
            }
        },  // (1, 2)
        function(x, y) {
            mod_rot(x, y, 90)
        },  // (2, 2)
        function(x, y) {},  // (3, 2)
        function(x, y) {},  // (4, 2)
        function(x, y) {},  // (5, 2)
        function(x, y) {},  // (6, 2)
        function(x, y) {},  // (7, 2)
    ],

    // row 3
    [
        function(x, y) {
            toggle_orient(x, y);
            mod_rot(x, y, 180);
        },  // (0, 3)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                set_orient(xt, y, get_hand(x, y).orient);
            }
        },  // (1, 3)
        function(x, y) {
            for (let yt=0; yt<GAME_WIDTH; yt++) {
                set_orient(x, yt, get_hand(x, y).orient);
            }
        },  // (2, 3)
        function(x, y) {
            for (let xt=-1; xt<2; xt++) {
                for (let yt=-1; yt<2; yt++) {
                    if (xt | yt) {
                        set_orient(x+xt, y+yt, get_hand(x, y).orient)
                    }
                }
            }
        },  // (3, 3)
        function(x, y) {
            toggle_orient(x, y);
            toggle_orient(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT));
        },  // (4, 3)
        function(x, y) {
            toggle_orient(x+1, y+2);
            toggle_orient(x+2, y+1);
            toggle_orient(x+2, y-1);
            toggle_orient(x+1, y-2);
                
            toggle_orient(x-1, y+2);
            toggle_orient(x-2, y+1);
            toggle_orient(x-2, y-1);
            toggle_orient(x-1, y-2);
        },  // (5, 3)
        function(x, y) {
            toggle_orient(x, y);
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    if (!(x == xt && y == yt) && Math.random() > 0.5) {
                        toggle_orient(xt, yt);
                    }
                }
            }
        },  // (6, 3)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    set_orient(xt, yt, 1);
                }
            }
        },  // (7, 3)
    ],

    // row 4
    [
        function(x, y) {
            mod_rot(x, y, -90);
        },  // (0, 4)
        function(x, y) {
            let xn = x;
            let yn = y;
            let hand_rot = get_hand(x, y).rot;
            for (let i=0; i<8; i++) {
                set_rot(xn, yn, hand_rot);

                switch (hand_rot % 360) {
                    case 0:
                        yn--;
                        break;

                    case 90:
                        xn++;
                        break;

                    case 180:
                        yn++;
                        break;

                    default:
                        xn--;
                        break;
                }
            }
        },  // (1, 4)
        function(x, y) {
            mod_rot(x+1, y+1, -90);
            mod_rot(x+1, y-1, -90);
            mod_rot(x-1, y-1, -90);
            mod_rot(x-1, y+1, -90);
        },  // (2, 4)
        function(x, y) {
            mod_rot(random_int(0, GAME_WIDTH), random_int(0, GAME_HEIGHT), -90)
        },  // (3, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    mod_rot(xt, yt, 180);
                }
            }
        },  // (4, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    mod_rot(xt, yt, -90);
                }
            }
        },  // (5, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    set_rot(xt, yt, 0)
                }
            }
        },  // (6, 4)
        function(x, y) {
            for (let xt=0; xt<GAME_WIDTH; xt++) {
                for (let yt=0; yt<GAME_HEIGHT; yt++) {
                    point_at(xt, yt, 3.5, 3.5, true);
                }
            }
        },  // (7, 4)
    ],

    // row 5
    [
        function(x, y) {},  // (0, 5)
        function(x, y) {},  // (1, 5)
        function(x, y) {},  // (2, 5)
        function(x, y) {},  // (3, 5)
        function(x, y) {},  // (4, 5)
        function(x, y) {},  // (5, 5)
        function(x, y) {},  // (6, 5)
        function(x, y) {},  // (7, 5)
    ],

    // row 6
    [
        function(x, y) {},  // (0, 6)
        function(x, y) {},  // (1, 6)
        function(x, y) {},  // (2, 6)
        function(x, y) {
            set_rot(x, y, (get_hand(x, y).rot + 90) % 360)
        },  // (3, 6)
        function(x, y) {},  // (4, 6)
        function(x, y) {},  // (5, 6)
        function(x, y) {},  // (6, 6)
        function(x, y) {},  // (7, 6)
    ],

    // row 7
    [
        function(x, y) {},  // (0, 7)
        function(x, y) {},  // (1, 7)
        function(x, y) {},  // (2, 7)
        function(x, y) {},  // (3, 7)
        function(x, y) {},  // (4, 7)
        function(x, y) {},  // (5, 7)
        function(x, y) {},  // (6, 7)
        function(x, y) {},  // (7, 7)
    ],
]
