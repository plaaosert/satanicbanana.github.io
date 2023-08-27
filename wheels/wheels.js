// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

String.prototype.toDDHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
	var days    = Math.floor(sec_num / 86400);
    var hours   = Math.floor((sec_num - (days * 86400)) / 3600);
    var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (days * 86400) - (hours * 3600) - (minutes * 60));

	if (days    < 10) {days    = "0"+days;}
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return days+":"+hours+':'+minutes+':'+seconds;
}

function win_nothing() {
    return function(wheel, reward_id, player) {
        return;
    }
}

function win_currency(t, v) {
    return function(wheel, reward_id, player) {
        player.currencies[t] += v;
    }
}

function win_currency_random(t, vmin, vmax) {
    return function(wheel, reward_id, player) {
        player.currencies[t] += Math.floor(vmin + (Math.random() * (vmax - vmin)));
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
        "wheel-amateurity-wheel", "rocks", 1,
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
    )
]

class Wheel {
    constructor(data) {
        this.data = data;
        this.cur_angle = 0;  // radians
        this.time_left = 0;  // ms
        this.last_time_calculated = 0;  // the last time the wheel's current angle and time left was calculated
        this.chosen_speed = 0;
        this.chosen_time = 0;

        this.wheel_element = document.getElementById(this.data.wheel_elem_id);
    }

    static import(data, cur_angle, time_left, chosen_speed, chosen_time, last_time_calculated) {
        let wheel = new Wheel(data);
        wheel.cur_angle = cur_angle;
        wheel.time_left = time_left;
        wheel.chosen_speed = chosen_speed;
        wheel.chosen_time = chosen_time;
        wheel.last_time_calculated = last_time_calculated;

        return wheel;
    }

    pay_for_spin(player) {
        if (player.currencies[this.data.cost_type] > this.data.cost_amt) {
            player.currencies[this.data.cost_type] -= this.data.cost_amt;

            this.start_spin();
        }
    }

    start_spin() {
        this.last_time_calculated = Date.now();

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

    update(player) {
        let time_elapsed = Date.now() - this.last_time_calculated;
        let time_to_move = Math.min(time_elapsed, this.time_left);

        let amount_to_move = (this.cur_speed() * time_to_move) + (time_to_move * (this.speed_at_time_left(this.time_left - time_to_move) - this.cur_speed()) * 0.5)

        this.cur_angle += amount_to_move;
        this.cur_angle = this.cur_angle % (2 * Math.PI);

        this.time_left -= time_elapsed;

        this.wheel_element.style.transform = `rotate(${this.cur_angle}rad)`;

        if (this.time_left <= 0) {
            this.finish_spin(player);
            return true;
        }

        this.last_time_calculated = Date.now();

        return false;
    }

    finish_spin(player) {
        this.last_time_calculated = 0;

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
            chosen_time: this.chosen_time
        }
    }

    export() {
        return JSON.stringify({
            data_id: this.data.id,
            cur_angle: this.cur_angle,
            time_left: this.time_left,
            last_time_calculated: this.last_time_calculated,
            chosen_speed: this.chosen_speed,
            chosen_time: this.chosen_time
        })
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
            "thread": 0
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

    let w = w_data.map(wheel => {
        return Wheel.import(wheel_datas[wheel.data_id], wheel.cur_angle, wheel.time_left, wheel.chosen_speed, wheel.chosen_time, wheel.last_time_calculated)
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

let load = false ? null : load_all_data();
let new_save = true;
if (load) {
    new_save = false;
}

let player = null;
let wheels = [];
if (new_save) {
    player = Player.new("plaao");
    player.currencies["rocks"] = 10000
} else {
    player = load.player;
    wheels = load.wheels;
}

document.addEventListener("DOMContentLoaded", function() {
    let test_wheel = null;
    if (new_save) {
        test_wheel = new Wheel(wheel_datas[0]);
        test_wheel.pay_for_spin(player);

        wheels.push(test_wheel);
    } else {
        test_wheel = wheels[0];
    }

    console.log(`Loading was ${new_save ? "unsuccessful" : "successful"}`);

    let test_currencies_txt = document.getElementById("debug_currencies");
    let debug_log_txt = document.getElementById("debug_log");

    let save_interval = Date.now() + 1000;

    setInterval(function() {
        if (test_wheel.update(player)) {
            test_wheel.pay_for_spin(player);
        };

        test_currencies_txt.textContent = `${player.name}\n\n${Object.keys(player.currencies).map(k => `${k}: ${player.currencies[k]}`).join("\n")}`;
        debug_log_txt.textContent = (Math.round(test_wheel.time_left) / 1000).toString().toDDHHMMSS();

        // setup keypress to save/load, then do testing to make sure the wheels always stop at the same place no matter what
        if (Date.now() > save_interval) {
            console.log("Saved game");
            save_interval = Date.now() + 1000;
            save_all_data(player, [test_wheel]);
        }
    }, 1000/60);
})