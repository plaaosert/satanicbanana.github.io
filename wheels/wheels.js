game_id = "wheels"

const currency_to_friendly_name = {
    "bread": "Bread",
    "gold": "Gold",
    "insanium": "Insanium",
    "orbs": "Orbs",
    "rocks": "Rocks",
    "specks_of_dust": "Specks of Dust",
    "thread": "Thread",
}

function win_nothing() {
    return function(wheel, reward_id, player) {
        return;
    }
}

function win_currency(t, v) {
    let ct = t == "bread_slice" ? "bread" : t;
    let bread_status = null;
    if (t == "bread") {
        bread_status = 1;
    }

    if (t == "bread_slice") {
        bread_status = 2;
    }

    return function(wheel, reward_id, player) {
        player.currencies[ct] += v;

        if (bread_status) {
            player.bread_status = bread_status;
        }
    }
}

function win_currency_random(t, vmin, vmax) {
    let ct = t == "bread_slice" ? "bread" : t;
    let bread_status = null;
    if (t == "bread") {
        bread_status = 1;
    }

    if (t == "bread_slice") {
        bread_status = 2;
    }

    return function(wheel, reward_id, player) {
        player.currencies[ct] += Math.floor(vmin + (Math.random() * (vmax - vmin)));

        if (bread_status) {
            player.bread_status = bread_status;
        }
    }
}

class WheelData {
    static id_inc = 0;

    constructor(name, desc, wheel_elem_id, cost_type, cost_amt, spin_speed, time_taken, rewards) {
        this.id = WheelData.id_inc;
        WheelData.id_inc++;
        
        this.name = name;                    // the name of the wheel
        this.desc = desc;                    // the description of the wheel
        this.wheel_elem_id = wheel_elem_id;  // the ID of the wheel in the DOM
        this.cost_type = cost_type;          // what currency it costs to spin
        this.cost_amt = cost_amt;            // how much it costs to spin
        this.spin_speed = spin_speed;        // function returning speed where 1 is a full rotation every second and 0 is stationary
        this.time_taken = time_taken;        // function taking speed and returning time in ms
        this.rewards = rewards;              // list of functions of the form function(wheel, reward_id, player)
    }
}

const wheel_datas = [
    new WheelData(
        "Wheel of Amateurity", "We found this wheel in our garbage dump outside. You can spin it if you want, but put it away after you're done. It looks terrible.",
        "wheel-amateurity", "rocks", 1,
        () => {return (0.005 + (Math.random() * 0.01))},
        (speed) => {return (speed * 100 * 5000)},
        [
            win_currency("bread", 2),
            win_currency("gold", 7),
            win_currency_random("gold", 1, 20),
            win_currency("specks_of_dust", 17000000000),
            win_currency("thread", 12478),
            win_nothing(),
            win_currency("bread", 1),
            win_currency("orbs", 1),
            win_currency("insanium", 27),
            win_nothing(),
        ]
    ),

    new WheelData(
        "Wheel of Mediocre Wealth", ".",
        "wheel-mediocre-wealth", "specks_of_dust", 50000000,
        () => {return (0.05 + (Math.random() * 0.1))},
        (speed) => {return (speed * 10 * 15000)},
        [
            win_currency("insanium", 13),
            function(wheel, reward_id, player) {
                // bones
                SKULL();
            },
            win_currency("orbs", 2),
            function(wheel, reward_id, player) {
                // Thread thread
                // change the number shown on Thread to "hread", until it's next updated. the next gain of thread is doubled
                player.hread = true;
            },
            win_currency("bread", 3),
            win_nothing(),
            function(wheel, reward_id, player) {
                // +20% orbs or -10% orbs
                if (Math.random() < 0.5) {
                    player.currencies.orbs += Math.round(player.currencies.orbs * 0.1);
                } else {
                    player.currencies.orbs -= Math.round(player.currencies.orbs * 0.2);
                }
            },
            win_currency("gold", 300),
            win_currency("gold", -300),
            win_currency("bread_slice", 1),
        ]
    ),

    new WheelData(
        "WHEEL OF ROCKS", "This will eventually become the Wheel of Monotony.",
        "wheel-rocks", "rocks", 0,
        () => {return (0.005 + (Math.random() * 0.01))},
        (speed) => {return (speed * 500 * 15000)},
        [
            win_currency_random("rocks", 1, 10),
            win_currency_random("rocks", 1, 10),
            win_currency_random("rocks", 5, 50),
            win_currency_random("rocks", 1, 4),
            win_currency_random("rocks", 1, 5),
            win_currency_random("rocks", 1, 4),
            win_currency_random("rocks", 1, 10),
            win_currency_random("rocks", 1, 100),
        ]
    ),
]

class Wheel {
    constructor(data) {
        this.data = data;
        this.cur_angle = 0;  // radians
        this.time_left = 0;  // ms
        this.last_time_calculated = 0;  // the last time the wheel's current angle and time left was calculated
        this.chosen_speed = 0;
        this.chosen_time = 0;
        this.autospinning = false;

        this.wheel_element = document.getElementById(this.data.wheel_elem_id + "-wheel");
        let sthis = this;
        this.wheel_element.addEventListener("click", function() {
            sthis.pay_for_spin(player);
        })
    }

    static import(data, cur_angle, time_left, chosen_speed, chosen_time, last_time_calculated, autospinning) {
        let wheel = new Wheel(data);
        wheel.cur_angle = cur_angle ? cur_angle : 0;
        wheel.time_left = time_left ? time_left : 0;
        wheel.chosen_speed = chosen_speed ? chosen_speed : 0;
        wheel.chosen_time = chosen_time ? chosen_time : 0;
        wheel.last_time_calculated = last_time_calculated ? last_time_calculated : 0;
        wheel.autospinning = autospinning ? autospinning : false;

        wheel.update_visuals();

        return wheel;
    }

    pay_for_spin(player) {
        if (this.chosen_speed == 0 && player.currencies[this.data.cost_type] >= this.data.cost_amt) {
            player.currencies[this.data.cost_type] -= this.data.cost_amt;

            this.start_spin();
        }
    }

    start_spin() {
        this.last_time_calculated = Date.now();
        this.update_visuals();

        this.chosen_speed = this.data.spin_speed();
        this.chosen_time = this.data.time_taken(this.chosen_speed);
        this.time_left = this.chosen_time;

        console.log("speed:", this.chosen_speed, "time:", this.chosen_time);
    }

    speed_at_time_left(t) {
        return t * (this.chosen_speed/this.chosen_time);
    }

    cur_speed() {
        return this.speed_at_time_left(this.time_left);
    }

    update_visuals() {
        if (this.chosen_speed == 0) {
            this.wheel_element.classList.add("ready-to-spin");
        } else {
            this.wheel_element.classList.remove("ready-to-spin");
        }

        this.wheel_element.style.transform = `rotate(${this.cur_angle}rad)`;
    }

    update(player) {
        if (this.chosen_speed != 0) {
            let time_elapsed = Date.now() - this.last_time_calculated;
            let time_to_move = Math.min(time_elapsed, this.time_left);

            let amount_to_move = (this.cur_speed() * time_to_move) + (time_to_move * (this.speed_at_time_left(this.time_left - time_to_move) - this.cur_speed()) * 0.5)

            this.cur_angle += amount_to_move;
            this.cur_angle = this.cur_angle % (2 * Math.PI);

            this.time_left -= time_elapsed;

            this.update_visuals();

            if (this.time_left <= 0) {
                this.finish_spin(player);
                return true;
            }

            this.last_time_calculated = Date.now();
            return false;
        } else {
            return true;
        }
    }

    finish_spin(player) {
        this.last_time_calculated = 0;
        this.chosen_speed = 0;
        this.chosen_time = 0;

        this.update_visuals();

        let angle_per_reward = (2 * Math.PI) / this.data.rewards.length;
        let reward_id = Math.floor(((this.cur_angle + (angle_per_reward / 2)) % (2 * Math.PI)) / angle_per_reward);

        console.log(this.cur_angle, this.cur_angle * (180 / Math.PI), angle_per_reward)
        console.log(`reward id ${reward_id} given`);

        this.data.rewards[reward_id](this, reward_id, player);
    }

    export_as_obj() {
        return {
            data_id: this.data.id,
            cur_angle: this.cur_angle,
            time_left: this.time_left,
            last_time_calculated: this.last_time_calculated,
            chosen_speed: this.chosen_speed,
            chosen_time: this.chosen_time,
            autospinning: this.autospinning
        }
    }

    export() {
        return JSON.stringify(this.export_as_obj())
    }
}

class Player {
    constructor(name, currencies) {
        this.name = name;
        this.currencies = currencies;
    }

    static new(name) {
        return new Player(name, {
            "bread": 0,
            "gold": 0,
            "insanium": 0,
            "orbs": 0,
            "rocks": 0,
            "specks_of_dust": 0,
            "thread": 0,
        })
    }

    export() {
        return JSON.stringify(this);
    }
}

function load_all_data() {
    let p_load = localStorage.getItem("wheels_player_data");
    let w_load = localStorage.getItem("wheels_wheel_data");

    if (!p_load || !w_load) {
        return null;
    }

    let p_data = JSON.parse(p_load);
    let w_data = JSON.parse(w_load);

    let p = new Player(
        p_data.name, p_data.currencies
    )

    p.bread_status = p_data.bread_status;
    p.hread = p_data.hread;

    let w = w_data.map(wheel => {
        return Wheel.import(wheel_datas[wheel.data_id], wheel.cur_angle, wheel.time_left, wheel.chosen_speed, wheel.chosen_time, wheel.last_time_calculated, wheel.autospinning)
    })

    return {
        player: p,
        wheels: w
    }
}

function save_all_data(player, wheels) {
    localStorage.setItem("wheels_player_data", player.export());
    localStorage.setItem("wheels_wheel_data", JSON.stringify(wheels.map(wheel => wheel.export_as_obj())))
}

function copy_currencies_to_clipboard() {
    let txt = "My currencies right now:\n\n" + Object.keys(player.currencies).map(k => `${(k=="thread" && player.hread) ? "T" : currency_to_friendly_name[k]}: ${(k=="thread" && player.hread) ? "hread" : format_number(player.currencies[k], NumberFormat.SCIENTIFIC)}`).join("\n") + "\n\nhttps://plaao.net/wheels";

    navigator.clipboard.writeText(txt).then(function() {
        console.log('Copied');
        
        document.getElementById("currency-copy-button").innerHTML = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Copied!\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
        
        setTimeout(function() {
            document.getElementById("currency-copy-button").innerHTML = "Copy currencies to clipboard"
        }, 2500);
    }, function(err) {
        console.error('Failed due to error: ', err);
    });
}

function update_currency_view() {
    Object.keys(last_currency_values).forEach(k => {
        if (currency_element_objs[k]) {
            if (k == "thread" && player.hread) {
                currency_element_objs[k].textContent = "hread";
            } else {
                currency_element_objs[k].textContent = format_number(Math.round(lerp_currency_values[k]), NumberFormat.SCIENTIFIC);
            }

            if (lerp_currency_values[k] <= 0 && !(k == "thread" && player.hread)) {
                if (!currency_element_objs[k].classList.contains("red")) {
                    currency_element_objs[k].classList.add("red");
                }
            } else {
                currency_element_objs[k].classList.remove("red");
            }

            let lerped = lerp(lerp_currency_values[k], player.currencies[k], 0.05);
            if (Math.abs(lerped - player.currencies[k]) < 1) {
                lerp_currency_values[k] = player.currencies[k];
            } else {
                lerp_currency_values[k] = lerped;
            }
        }

        let change = player.currencies[k] - last_currency_values[k];
        if (change != 0) {
            if (k == "thread" && player.hread) {
                player.hread = false;
                player.currencies[k] += change;
                change *= 2;
            }

            currency_popup_objs[k].classList.remove("closed");
            currency_popup_objs[k].classList.add("open");
            if (change < 0) {
                currency_popup_objs[k].classList.add("red");
            } else {
                currency_popup_objs[k].classList.remove("red");
            }

            currency_popup_objs[k].textContent = `${change > 0 ? "+" : ""}${format_number(change, 0)}`;

            if (popup_timeouts[k]) {
                clearTimeout(popup_timeouts[k]);
            }

            popup_timeouts[k] = setTimeout(function() {
                currency_popup_objs[k].classList.add("closed");
                currency_popup_objs[k].classList.remove("open");
            }, 2000)

            bread_icon.src = player.bread_status == 2 ? "img/icons/bread_slice.png" : "img/icons/bread.png"
        }
    });

    last_currency_values = {...player.currencies}
}

function SKULL() {
    let img = document.createElement("img");
    img.src = "img/icons/BONES.png";
    img.className = "SKULL";

    document.body.appendChild(img);

    setTimeout(function() {
        removeFadeOut(img, 6000)
    }, 100);
}

function handle_resize(event) {

}

const CLEARSAVE = false;

let load = CLEARSAVE ? null : load_all_data();
let new_save = true;
if (load) {
    new_save = false;
}

let player = null;
let wheels = [];
if (new_save) {
    player = Player.new("plaao");
    player.currencies = {
        "bread": 0,
        "gold": 0,
        "insanium": 0,
        "orbs": 0,
        "rocks": 10,
        "specks_of_dust": 500000000,
        "thread": 0,
    }
} else {
    player = load.player;
    wheels = load.wheels;
}

let bread_icon = document.getElementById("currency-item-img-bread");
let currency_element_objs = {};
let currency_popup_objs = {};
let popup_timeouts = {};
Object.keys(player.currencies).forEach(k => {
    currency_element_objs[k] = document.getElementById("currency-item-text-" + k);
    currency_popup_objs[k] = document.getElementById("currency-item-text-popup-" + k);
})

let last_currency_values = {...player.currencies};
let lerp_currency_values = {...player.currencies};

document.addEventListener("DOMContentLoaded", function() {    
    //let test_wheel = null;
    if (new_save) {
        wheels = [];
        wheel_datas.forEach(d => {
            let wh = new Wheel(d);
            wheels.push(wh);
        })

        //wheels.push(test_wheel);
    } else {
        wheel_datas.forEach(d => {
            if (!wheels.some(w => w.data.name == d.name)) {
                let wh = new Wheel(d);
                wheels.push(wh);
            }
        })
    }

    wheels = wheels.filter(w => wheel_datas.some(d => d.name == w.data.name));
    bread_icon.src = player.bread_status == 2 ? "img/icons/bread_slice.png" : "img/icons/bread.png"

    console.log(`Loading was ${new_save ? "unsuccessful" : "successful"}`);

    wheels.forEach(w => {
        let autospin_button = document.getElementById(`${w.data.wheel_elem_id}-autospin-button`);
        autospin_button.addEventListener("click", function() {
            w.autospinning = !w.autospinning;
    
            if (w.autospinning) {
                autospin_button.textContent = "Spinning automatically";
    
                autospin_button.classList.remove("red");
                autospin_button.classList.add("green");
            } else {
                autospin_button.textContent = "Spinning manually";
    
                autospin_button.classList.remove("green");
                autospin_button.classList.add("red");
            }
        });

        if (w.autospinning) {
            autospin_button.textContent = "Spinning automatically";
    
            autospin_button.classList.remove("red");
            autospin_button.classList.add("green");
        } else {
            autospin_button.textContent = "Spinning manually";
    
            autospin_button.classList.remove("green");
            autospin_button.classList.add("red");
        }
    })

    //let test_currencies_txt = document.getElementById("debug_currencies");
    let debug_log_txt = document.getElementById("debug_log");
    let debug_log_txt2 = document.getElementById("debug_log2");
    let debug_log_txt3 = document.getElementById("debug_log3");

    let save_interval = Date.now() + 1000;

    setInterval(function() {
        wheels.forEach(wheel => {
            if (wheel.update(player)) {
                if (wheel.autospinning) {
                    wheel.pay_for_spin(player);
                }
            };
        })

        update_currency_view();

        debug_log_txt.textContent = (Math.round(wheels[0].time_left) / 1000).toString().toDDHHMMSS();
        debug_log_txt2.textContent = (Math.round(wheels[1].time_left) / 1000).toString().toDDHHMMSS();
        debug_log_txt3.textContent = (Math.round(wheels[2].time_left) / 1000).toString().toDDHHMMSS();

        // setup keypress to save/load, then do testing to make sure the wheels always stop at the same place no matter what
        if (Date.now() > save_interval) {
            console.log("Saved game");
            save_interval = Date.now() + 1000;
            save_all_data(player, wheels);
        }
    }, 1000/60);
})