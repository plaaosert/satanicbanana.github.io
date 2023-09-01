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

let hands_clickable = false;

const GAME_WIDTH = 8;
const GAME_HEIGHT = 8;

const orient_to_name = {
    0: "palm",
    1: "back"
}

let hands_container = null;
let hands_objects = [];

let animations = [];

let hand_to_fn_map = [];
let mutable_data = {};

function update_hand_obj(hand) {
    hand.obj.src = get_hand_path(hand);

    // colour, opacity and other stuff here too
}

function swap_hands(x1, y1, x2, y2) {

}

function update_hand(x, y) {
    let hand = get_hand(x, y);
    update_hand_obj(hand);
}

function get_hand(x, y) {
    return hands_objects[y][x];
}

function set_hand(x, y, to) {
    let hand = get_hand(x, y);

    // update with all shared parameters
    Object.keys(to).forEach(k => {
        if (k != "obj" && k in hand) {
            hand[k] = to[k];
        }
    });

    update_hand_obj(hand);
}

function get_hand_path(hand) {
    return `images/${orient_to_name[hand.orient]}/${orient_to_name[hand.orient]}${hand.pos+1}.png`;
}

function setup_hand_sprites() {
    let new_hands_objects = [];

    hands_container.innerHTML = "";
    for (let y=0; y<GAME_HEIGHT; y++) {
        new_hands_objects.push([]);
        for (let x=0; x<GAME_WIDTH; x++) {
            let new_hand = document.createElement("img");
            new_hand.src = "images/palm/palm1.png";

            new_hand.style.gridRow = x+1;
            new_hand.style.gridColumn = y+1;

            new_hand.classList.add("hand");

            new_hand.addEventListener("contextmenu", function(event) {
                event.preventDefault();
            })

            new_hand.addEventListener("mousedown", function(evt) {
                register_click(evt, "down", x, y);
            })

            new_hand.addEventListener("mouseup", function(evt) {
                register_click(evt, "up", x, y);
            })

            new_hands_objects[y].push({
                obj: new_hand,
                pos: 0,
                orient: 0
            });

            hands_container.appendChild(new_hand);
        }
    }

    return new_hands_objects;
}

function get_hand_fn(x, y) {
    return hand_to_fn_map[(y*GAME_HEIGHT) + x];
}

function setup_hand_to_fn_map() {
    hand_to_fn_map = [];
    for (let y=0; y<GAME_HEIGHT; y++) {
        for (let x=0; x<GAME_WIDTH; x++) {
            hand_to_fn_map.push({
                "down": {0: hand_functions_leftclick_down[y][x], 2: hand_functions_rightclick_down[y][x]},
                "up": {0: hand_functions_leftclick_up[y][x], 2: hand_functions_rightclick_up[y][x]},
            });
        }
    }
}

function scramble_hand_to_fn_map() {
    hand_to_fn_map = shuffle(hand_to_fn_map);
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

document.addEventListener("DOMContentLoaded", function() {
    hands_container = document.getElementById("hands-container");
    hands_objects = setup_hand_sprites();

    setup_hand_to_fn_map();
    
    //scramble_hand_to_fn_map();

    animations.push(new HandAnimation(
        {speed: 60}, function(data) {
            for (let y=0; y<GAME_HEIGHT; y++) {
                for (let x=0; x<GAME_WIDTH; x++) {
                    set_hand(x, y, {pos: random_int(0, 33)})
                }
            }

            data.speed -= 5;
            if (data.speed > 0) {
                return 1000 / data.speed;
            } else {
                hands_clickable = true;
                return -1;
            }
        }, 1000/60, true
    ))

    setInterval(update_animations, 1000/60);
})