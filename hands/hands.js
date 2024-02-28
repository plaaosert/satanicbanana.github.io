game_id = "hands";

class HandAnimation {
    constructor(start_data, func, default_delay, make_up_for_late_calls=false, num_calls=0) {
        this.data = structuredClone(start_data);
        this.func = func;
        this.default_delay = default_delay;
        this.num_calls = num_calls ? num_calls : 0;
        this.make_up_for_late_calls = make_up_for_late_calls;

        this.calls_left = this.num_calls;
        this.time_to_next_call = 0;
    }

    check_call(time) {
        if (time > this.time_to_next_call) {
            let lateness = this.time_to_next_call > 0 ? (time - this.time_to_next_call) : 0;

            let delay = this.call();
            if (!delay && this.default_delay) {
                delay = this.default_delay;
            }

            this.calls_left--;

            let has_calls_left = this.num_calls <= 0 || this.calls_left >= 0;
            if (delay >= 0 && has_calls_left) {
                let next_call = time + delay;
                if (this.make_up_for_late_calls) {
                    // next_call = (time + delay) - (time - this.time_to_next_call)
                    //             time + delay - time + this.time_to_next_call
                    //             delay + this.time_to_next_call
                    next_call -= lateness;
                }

                this.time_to_next_call = next_call;
                return true;
            } else {
                // Negative delay means "stop"
                return false;
            }
        } else {
            return true;
        }
    }

    call() {
        let delay = this.func(this.data);
        return delay;
    }
}

const HAND_HUE = 40/360
const HAND_SAT = 32/100
const HAND_VALUE = 100/100

// deprecated
function hand_hsv_to_rgb(hsv) {
    let hsv_original = [...hsv];

    hsv_original[0] = hsv_original[0] + HAND_HUE;
    hsv_original[0] = hsv_original[0] % 1;

    if (hsv_original[1] >= 0.5) {
        // anything above 0.5 needs to be scaled by 1-HAND_SAT, the rest is set to HAND_SAT
        hsv_original[1] = HAND_SAT + ((hsv_original[1] - 1) * 2 * (0.5-HAND_SAT));
    } else {
        // scale it by HAND_SAT
        hsv_original[1] = hsv_original[1] * 2 * HAND_SAT;
    }

    if (hsv_original[2] >= 0.5) {
        // anything above 0.5 needs to be scaled by 1-HAND_VALUE, the rest is set to HAND_VALUE
        hsv_original[2] = HAND_VALUE + ((hsv_original[2] - 1) * 2 * (0.5-HAND_VALUE));
    } else {
        // scale it by HAND_VALUE
        hsv_original[2] = hsv_original[2] * 2 * HAND_VALUE;
    }

    return hsvToRgb(...hsv_original).map(t => Math.round(t))
}

// this is wrong and bad, need to work out a solution:
// convert to some hsv delta such that the hand palm becomes the exact colour
function rgb_to_hand_hsv_old(rgb) {
    let hsv_original = rgbToHsv(...rgb);

    hsv_original[0] = hsv_original[0] - HAND_HUE - (0/360);
    if (hsv_original[0] < 0) {
        hsv_original[0] = 1 + hsv_original[0]
    }
    
    if (hsv_original[1] < HAND_SAT) {
        hsv_original[1] = (hsv_original[1] / HAND_SAT) / 1
    } else if (hsv_original[1] > HAND_SAT) {
        hsv_original[1] = 1 + (((hsv_original[1]-HAND_SAT) / (1-HAND_SAT)) / 1)
    } else {
        hsv_original[1] = 1;
    }

    if (hsv_original[2] < HAND_VALUE) {
        hsv_original[2] = (hsv_original[2] / HAND_VALUE) / 2
    } else if (hsv_original[2] > HAND_VALUE) {
        hsv_original[2] = 0.5 + (((hsv_original[2]-HAND_VALUE) / (0.5-HAND_VALUE)) / 2)
    } else {
        hsv_original[2] = 0.5;
    }

    return hsv_original;
}

// THIS DOESNT WORK EITHER
// IM SO CONFUSED...
function rgb_to_hand_hsv(rgb) {
    let hsv = rgbToHsv(...rgb);

    let hsv_diff = [
        hsv[0] - HAND_HUE - (0/360),
        (hsv[1] / HAND_SAT),
        hsv[2] / HAND_VALUE 
    ]

    return hsv_diff;
}

let hands_clickable = false;

const GAME_WIDTH = 8;
const GAME_HEIGHT = 8;

const POS_MAX = 33;

const orient_to_name = {
    0: "palm",
    1: "back"
}

let hands_container = null;
let hands_objects = [];

let animations = [];

let hand_to_hand_map = new Array(64).fill(0).map((v, i) => i);

let hand_to_fn_map = [];
let mutable_data = {};

const rgb_arr = ["r", "g", "b"];

function update_hand_obj(hand) {
    hand.objs.forEach((o, i) => {
        o.src = get_hand_path(hand, rgb_arr[i]);

        o.style.opacity = `${(hand.col[i]*100) / 255}%`;

        o.style.transform = `rotate(${hand.rot}deg)`;
    })

    // colour, opacity and other stuff here too
    /*
    let hsv = rgb_to_hand_hsv(hand.col);
    let filter_str = `hue-rotate(${hsv[0] * 360}deg) saturate(${hsv[1] * 100}%) brightness(${hsv[2] * 100}%)`;
    hand.obj.style.filter = filter_str;
    */
}

function update_all_hand_objs() {
    hands_objects.flat().forEach(update_hand_obj);
}

function pos_valid(x, y) {
    return !(x < 0 || x >= GAME_WIDTH || y < 0 || y >= GAME_HEIGHT)
}

function swap_hands(x1, y1, x2, y2) {
    // swap the values of the two hands, then swap the positions of the two hands' maps on the function map
    let buff_hand = get_hand(x1, y1);
    let buff = {}
    Object.keys(buff_hand).forEach(k => {
        if (k=="objs") {
            return;
        }

        if (k == "col") {
            buff[k] = buff_hand[k].slice();
        } else {
            buff[k] = buff_hand[k];
        }
    })

    set_hand(x1, y1, get_hand(x2, y2));
    set_hand(x2, y2, buff);

    let idx1 = (x1 * GAME_HEIGHT) + y1;
    let idx2 = (x2 * GAME_HEIGHT) + y2;

    let fn_buff = hand_to_hand_map[idx1];
    hand_to_hand_map[idx1] = hand_to_hand_map[idx2];
    hand_to_hand_map[idx2] = fn_buff; 
}

function update_hand(x, y) {
    let hand = get_hand(x, y);
    update_hand_obj(hand);
}

function get_hand(x, y) {
    if (pos_valid(x, y)) {
        return hands_objects[y][x];
    } else {
        return {error: "INVALID HAND COORD", col: [0, 0, 0], pos: 0, orient: 0, rot: 0};
    }
}

function set_hand(x, y, to) {
    if (!pos_valid(x, y)) {
        return;
    }

    let hand = get_hand(x, y);

    // update with all shared parameters
    Object.keys(to).forEach(k => {
        if (k != "obj" && k != "objs" && k in hand) {
            hand[k] = to[k];
        }
    });

    update_hand_obj(hand);

    hand_pulse_data.hand_pulses.push({x:x, y:y, t:5, max:15, scale:1, scale_min:1, scale_max:1.2})
}

function get_hand_path(hand, channel) {
    return `images/rgb_separate/${orient_to_name[hand.orient]}/${channel}/${orient_to_name[hand.orient]}${hand.pos+1}.png`;
}

function setup_hand_sprites() {
    let new_hands_objects = [];

    hands_container.innerHTML = "";
    for (let y=0; y<GAME_HEIGHT; y++) {
        new_hands_objects.push([]);
        for (let x=0; x<GAME_WIDTH; x++) {
            let hands = [];
            ["r", "g", "b"].forEach(function(t, i) {
                let new_hand = document.createElement("img");
                new_hand.src = "images/palm/palm1.png";
    
                new_hand.style.gridColumn = x+1;
                new_hand.style.gridRow = y+1;
    
                new_hand.classList.add("hand-img");

                new_hand.draggable = false;
    
                if (i==0) {
                    new_hand.addEventListener("contextmenu", function(event) {
                        event.preventDefault();
                    })
        
                    new_hand.addEventListener("mousedown", function(evt) {
                        console.log(x, y)
                        register_click(evt, "down", x, y);
                    })
        
                    new_hand.addEventListener("mouseup", function(evt) {
                        register_click(evt, "up", x, y);
                    })
                } else {
                    new_hand.classList.add("mouse-transparent");
                }

                hands.push(new_hand)
                hands_container.appendChild(new_hand);
            })

            new_hands_objects[y].push({
                objs: hands,
                col: [255, 228, 171],
                pos: 0,
                orient: 0,
                rot: 0
            });
        }
    }

    return new_hands_objects;
}

function get_hand_fn(x, y) {
    idx = hand_to_hand_map[(x*GAME_HEIGHT) + y]

    return hand_to_fn_map[idx];
}

function setup_hand_to_fn_map() {
    hand_to_fn_map = [];
    for (let y=0; y<GAME_HEIGHT; y++) {
        for (let x=0; x<GAME_WIDTH; x++) {
            hand_to_fn_map.push({
                "down": {0: hand_functions_leftclick_down[x][y], 2: hand_functions_rightclick_down[x][y]},
                "up": {0: hand_functions_leftclick_up[x][y], 2: hand_functions_rightclick_up[x][y]},
            });
        }
    }
}

function scramble_hand_to_hand_map() {
    hand_to_hand_map = shuffle(hand_to_hand_map);
}

function update_animations() {
    let new_animation_list = [];
    let time = Date.now();
    animations.forEach(animation => {
        let result = animation.check_call(time)
        if (result) {
            new_animation_list.push(animation);
        }
    })

    animations = new_animation_list;
}

function register_click(evt, ud, x, y) {
    if (hands_clickable) {
        let hand_fn = get_hand_fn(x, y);
        if (hand_fn && hand_fn[ud][evt.button]) {
            hand_fn[ud][evt.button](x, y);
        }
    }
}

let hand_random_animation_function = function(data) {
    for (let y=0; y<GAME_HEIGHT; y++) {
        for (let x=0; x<GAME_WIDTH; x++) {
            set_hand(x, y, {pos: random_int(0, POS_MAX)})
        }
    }

    data.speed -= 5;
    if (data.speed > 0) {
        return 1000 / data.speed;
    } else {
        hands_clickable = true;
        return -1;
    }
}

let hand_reset_animation_function = function(data) {
    let changed_any = false;
    for (let y=0; y<GAME_HEIGHT; y++) {
        for (let x=0; x<GAME_WIDTH; x++) {
            let hpos = get_hand(x, y).pos;
            if (hpos > 0) {
                changed_any = true;
                set_hand(x, y, {pos: Math.max(0, hpos - 1)})
            }
        }
    }

    if (changed_any) {
        return 1000 / data.speed;
    } else {
        hands_clickable = true;
        return -1;
    }
}

function hand_shoot_anim_function(x, y) {
    // Generate function
    let hand = get_hand(x, y);
    let hand_rot = hand.rot;
    let dir = [0, 0];
    switch (hand_rot) {
        case 0:
            dir = [0, -1]
            break;

        case 90:
            dir = [1, 0]
            break;

        case 180:
            dir = [0, 1]
            break;

        case 270:
            dir = [-1, 0]
            break;
    }

    return function(data) {
        if (dir[0] == 0 && dir[1] == 0) {
            hands_clickable = true;
            return -1;
        }

        data.x += dir[0];
        data.y += dir[1];
        data.n--;

        if (data.n <= 0) {
            hands_clickable = true;
            return -1;
        }

        set_pos(data.x, data.y, 0)
        set_rot(data.x, data.y, hand_rot)

        set_col(data.x, data.y, [255, 0, 0])
        set_col(data.x-dir[0], data.y-dir[1], [128, 128, 128]);

        set_rot(x, y, (get_hand(x, y).rot + 90) % 360)
    }
}

function hand_pulse_animation(data) {
    let new_pulses = [];
    data.hand_pulses.forEach(p => {
        let hand = get_hand(p.x, p.y);
        if (hand) {
            hand.objs.forEach(obj => {
                obj.style.transform = `rotate(${hand.rot}deg) scale(${p.scale})`;
            })
        } else {
            return;
        }

        p.t++;
        p.scale = p.scale_min + ((p.scale_max - p.scale_min) * Math.sin((p.t / p.max) * Math.PI))

        if (p.t < p.max) {
            new_pulses.push(p);
        }
    })

    data.hand_pulses = new_pulses;
}

function save_hand_states() {
    data = {
        hand_states: hands_objects,
        hand_to_hand_map: hand_to_hand_map
    }

    localStorage.setItem("hands_data", btoa(JSON.stringify(data)))
}

function load_hand_states() {
    data = localStorage.getItem("hands_data");

    if (data) {
        return JSON.parse(atob(data));
    } else {
        return null;
    }
}

let hand_pulse_data = {hand_pulses: []};

document.addEventListener("DOMContentLoaded", function() {
    hands_container = document.getElementById("hands-container");
    hands_objects = setup_hand_sprites();

    setup_hand_to_fn_map();

    let loaded_data = load_hand_states();

    if (false && loaded_data) {
        for (let x=0; x<8; x++) {
            for (let y=0; y<8; y++) {
                Object.keys(loaded_data.hand_states[x][y]).forEach(k => {
                    if (k != "objs") {
                        hands_objects[x][y][k] = loaded_data.hand_states[x][y][k];
                    }
                })
            }
        }

        hand_to_hand_map = loaded_data.hand_to_hand_map;
        hands_clickable = true;
    } else {
        // scramble_hand_to_hand_map();

        animations.push(new HandAnimation(
            {speed: 60}, hand_random_animation_function, 1000/60, true
        ))
    }

    let pulse_anim = new HandAnimation(
        hand_pulse_data, hand_pulse_animation, 1000/60, true
    );

    pulse_anim.data = hand_pulse_data;
    animations.push(pulse_anim)

    update_all_hand_objs();

    update_animations();
    setInterval(update_animations, 1000/60);

    hands_container.style.visibility = "visible";

    setInterval(save_hand_states, 500);
})