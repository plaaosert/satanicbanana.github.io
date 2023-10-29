game_id = "wheels"

const UpgradeOperator = {
    NONE: 0,
    ADDITIVE: 1,
    MULTIPLICATIVE: 2,
    FINALADDITIVE: 3,  // final is applied after other bonuses, undefined order within final/nonfinal
    FINALMULTIPLICATIVE: 4
}

const bread_upgrades = {
    "timespeed-plus": {
        "order": 0,
        "id": "timespeed-plus",
        "desc": `All wheels spin <span class="yellow important">10%</span> faster.`,
        "cost": 100,
        "cost_mul": 1.4,
        "currency": "bread",
        "affects": "timespeed",
        "fn": function(player, upgrade_count) {
            return 0.1 * upgrade_count;
        },
        "method": UpgradeOperator.ADDITIVE,
        "stat_fmt": function(st) {
            return `${Math.round(st*100)}%`;
        }
    },

    "timespeed-plus-2": {
        "order": 1,
        "id": "timespeed-plus-2",
        "desc": `All wheels spin <span class="yellow important">1.05x</span> faster.`,
        "cost": 250,
        "cost_mul": 1.5,
        "currency": "bread",
        "affects": "timespeed",
        "fn": function(player, upgrade_count) {
            return Math.pow(1.05, upgrade_count);
        },
        "method": UpgradeOperator.MULTIPLICATIVE,
        "stat_fmt": function(st) {
            return `${Math.round(st*100) / 100}x`;
        }
    },

    "bread-plus": {
        "order": 1,
        "id": "bread-plus",
        "desc": `All <span class="important">Bread</span> gain is increased by <span class="yellow important">7%</span>.`,
        "cost": 50,
        "cost_mul": 1.2,
        "currency": "bread",
        "affects": "bread_mult",
        "fn": function(player, upgrade_count) {
            return 0.07 * upgrade_count;
        },
        "method": UpgradeOperator.ADDITIVE,
        "stat_fmt": function(st) {
            return `${Math.round(st*100)}%`;
        }
    },

    "orbs-plus": {
        "order": 1,
        "id": "orbs-plus",
        "desc": `All <span class="important">Orb</span> gain is increased by <span class="yellow important">1.01x</span>.`,
        "cost": 300,
        "cost_mul": 1.1,
        "currency": "bread",
        "affects": "orbs_mult",
        "fn": function(player, upgrade_count) {
            return Math.pow(1.01, upgrade_count);
        },
        "method": UpgradeOperator.MULTIPLICATIVE,
        "stat_fmt": function(st) {
            return `${Math.round(st*1000) / 1000}x`;
        }
    },

    "static-plus": {
        "order": 1,
        "id": "static-plus",
        "desc": `Gain <span class="yellow important">+1</span> of every currency whenever you gain it.`,
        "cost": 1000,
        "cost_mul": 2,
        "currency": "bread",
        "affects": "all_plus",
        "fn": function(player, upgrade_count) {
            return upgrade_count;
        },
        "method": UpgradeOperator.ADDITIVE,
        "stat_fmt": function(st) {
            return `+${st}`;
        }
    },

    "bread-plus-from-all": {
        "order": 1,
        "id": "bread-plus-from-all",
        "desc": `Gain more <span class="important">Bread</span> based on your <span class="important">Orb</span> value (<span class="yellow important">+0.25%</span> per <span class="important">Orb</span> per upgrade level)`,
        "cost": 400,
        "cost_mul": 1.5,
        "currency": "orbs",
        "affects": "bread_mult",
        "fn": function(player, upgrade_count) {
            return 0.0025 * upgrade_count * player.currencies["orbs"];
        },
        "method": UpgradeOperator.ADDITIVE,
        "stat_fmt": function(st) {
            return `${Math.round(st*10000)/100}%`;
        }
    },

    "hread-empower": {
        "order": 1,
        "id": "hread-empower",
        "desc": `<span class="yellow important">hread</span> grants its bonus to all currencies.`,
        "cost": 100000,
        "cost_mul": 1,
        "currency": "bread",
        "affects": "hread_empower",
        "fn": function(player, upgrade_count) {
            return upgrade_count;
        },
        "method": UpgradeOperator.ADDITIVE,
        "stat_fmt": function(st) {
            return st ? "Yes" : "No"
        },
        "max_upgrades": 1
    }
}

let ordered_bread_upgrades = [];
let bread_upgrades_open = false;

ordered_bread_upgrades = [];

Object.keys(bread_upgrades).forEach(k => {
    ordered_bread_upgrades.push(bread_upgrades[k]);
})

ordered_bread_upgrades.sort((a, b) =>
    a.order - b.order
);

const currency_to_friendly_name = {
    "bread": "Bread",
    "gold": "Gold",
    "insanium": "Insanium",
    "orbs": "Orbs",
    "rocks": "Rocks",
    "specks_of_dust": "Specks of Dust",
    "thread": "Thread",
}

let bread_upgrade_elems = [];

function get_bread_upgrade_cost(player, upgrade) {
    return Math.round(upgrade.cost * Math.pow(upgrade.cost_mul, player.get_upgrade_count(upgrade.id)));
}

function is_bread_upgrade_affordable(player, upgrade) {
    let cost = get_bread_upgrade_cost(player, upgrade);
    return player.currencies[upgrade.currency] >= cost && (!upgrade.max_upgrades || player.get_upgrade_count(upgrade.id) < upgrade.max_upgrades);
}

function try_purchase_bread_upgrade(upgrade_id) {
    let upgrade = bread_upgrades[upgrade_id];
    if (is_bread_upgrade_affordable(loaded_player, upgrade)) {
        let cost = get_bread_upgrade_cost(loaded_player, upgrade)
        
        loaded_player.currencies[upgrade.currency] -= cost;
        loaded_player.add_upgrade(upgrade.id);
    }
}

function calculate_bread_upgrade_bonuses(player) {
    let stats = {
        timespeed: 1,
        all_plus: 0,
        all_mult: 1,
        hread_empower: 0
    };

    Object.keys(currency_to_friendly_name).forEach(c => {
        stats[c + "_plus"] = 0;
        stats[c + "_mult"] = 1;
    });

    ordered_bread_upgrades.filter(u => u.method == UpgradeOperator.ADDITIVE).forEach(u => {
        let v = u.fn(player, player.get_upgrade_count(u.id));
        stats[u.affects] += v;
    })

    ordered_bread_upgrades.filter(u => u.method == UpgradeOperator.MULTIPLICATIVE).forEach(u => {
        let v = u.fn(player, player.get_upgrade_count(u.id));
        stats[u.affects] *= v;
    })
    
    ordered_bread_upgrades.filter(u => u.method == UpgradeOperator.FINALADDITIVE).forEach(u => {
        let v = u.fn(player, player.get_upgrade_count(u.id));
        stats[u.affects] += v;
    })

    ordered_bread_upgrades.filter(u => u.method == UpgradeOperator.FINALMULTIPLICATIVE).forEach(u => {
        let v = u.fn(player, player.get_upgrade_count(u.id));
        stats[u.affects] *= v;
    })

    return stats;
}

function toggle_bread_upgrade_menu() {
    bread_upgrades_open = !bread_upgrades_open;

    if (bread_upgrades_open) {
        document.getElementById("bread-upgrade-tab-button").classList.remove("collapsed");
        document.getElementById("bread-upgrade-tab-button").classList.add("expanded");
        document.getElementById("bread-upgrade-tab-button").textContent = ">";

        document.getElementById("bread-upgrades-list").classList.remove("hidden");
    } else {
        document.getElementById("bread-upgrade-tab-button").classList.add("collapsed");
        document.getElementById("bread-upgrade-tab-button").classList.remove("expanded");
        document.getElementById("bread-upgrade-tab-button").textContent = "<";

        document.getElementById("bread-upgrades-list").classList.add("hidden");
    }
}

function render_bread_upgrades(player) {
    if (!bread_upgrades_open) {
        return;
    }

    if (bread_upgrade_elems.length <= 0) {
        bread_upgrade_elems = Array.from(document.getElementsByClassName("bread-upgrade"));

        bread_upgrade_elems.sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
    }

    if (ordered_bread_upgrades.length <= 0) {
        ordered_bread_upgrades = [];

        Object.keys(bread_upgrades).forEach(k => {
            ordered_bread_upgrades.push(bread_upgrades[k]);
        })

        ordered_bread_upgrades.sort((a, b) =>
            a.order - b.order
        );
    }

    ordered_bread_upgrades.forEach((upgrade, i) => {
        // need to edit:
        //  bread-upgrade-desc-text
        //  bread-upgrade-currentstat-text
        //  bread-upgrade-cost-button ("affordable" class or "unaffordable" class)
        //  bread-upgrade-img (set src)
        //  bread-upgrade-cost-text
        let e = bread_upgrade_elems[i];

        let upgrade_efc = upgrade.fn(player, player.get_upgrade_count(upgrade.id));
        let upgrade_str = upgrade.stat_fmt(upgrade_efc);

        let infodiv = e.querySelector("#bread-upgrade-info");

        infodiv.querySelector("#bread-upgrade-desc-text").innerHTML = upgrade.desc;
        infodiv.querySelector("#bread-upgrade-currentstat-text > span").textContent = upgrade_str;
        
        let button = e.querySelector("#bread-upgrade-cost-button");

        if (player.get_upgrade_count(upgrade.id) >= upgrade.max_upgrades) {
            button.classList.remove("unaffordable");
            button.classList.remove("affordable");
        } else if (is_bread_upgrade_affordable(player, upgrade)) {
            button.classList.remove("unaffordable");
            button.classList.add("affordable");
        } else {
            button.classList.remove("affordable");
            button.classList.add("unaffordable");
        }

        button.querySelector("#bread-upgrade-img").src = `img/icons/${upgrade.currency}.png`;

        if (player.get_upgrade_count(upgrade.id) >= upgrade.max_upgrades) {
            button.querySelector("#bread-upgrade-cost-text").textContent = "-";
        } else {
            button.querySelector("#bread-upgrade-cost-text").textContent = format_number(get_bread_upgrade_cost(player, upgrade), NumberFormat.SCIENTIFIC);
        }
    });
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
        (speed) => {return (Math.random() * 2) +(speed * 100 * 5000)},
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
        () => {return (0.025 + (Math.random() * 0.1))},
        (speed) => {return (Math.random() * 5) + (speed * 9 * 15000)},
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
            sthis.pay_for_spin(loaded_player);
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
            let time_elapsed = (Date.now() - this.last_time_calculated) * (player.timespeed_override ? player.timespeed_override : player.stat_bonuses.timespeed);
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
    constructor(name, currencies, upgrade_counts) {
        this.name = name;
        this.currencies = currencies;
        this.timespeed = 1;

        if (upgrade_counts && typeof upgrade_counts === "object" && !Array.isArray(upgrade_counts)) {
            this.upgrade_counts = upgrade_counts;
        } else {
            this.upgrade_counts = {};
        }

        Object.keys(bread_upgrades).forEach(k => {
            if (!this.upgrade_counts[k]) {
                this.upgrade_counts[k] = 0;
            }
        })
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

    get_upgrade_count(id) {
        return this.upgrade_counts[id] ? this.upgrade_counts[id] : 0;
    }

    add_upgrade(id, amt=1) {
        this.upgrade_counts[id] = (this.upgrade_counts[id] ? this.upgrade_counts[id] : 0) + amt;
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
        p_data.name, p_data.currencies, p_data.upgrade_counts
    )

    p.bread_status = p_data.bread_status ? p_data.bread_status : 1
    p.hread = p_data.hread ? p_data.hread : false

    p.timespeed = p_data.timespeed ? p_data.timespeed : 1;

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
    let txt = "My currencies right now:\n\n" + Object.keys(loaded_player.currencies).map(k => `${(k=="thread" && loaded_player.hread) ? "T" : currency_to_friendly_name[k]}: ${(k=="thread" && loaded_player.hread) ? "hread" : format_number(loaded_player.currencies[k], NumberFormat.SCIENTIFIC)}`).join("\n") + "\n\nhttps://plaao.net/wheels";

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

function update_currency_view(player) {
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
            if (change > 0) {
                if ((k == "thread" || player.stat_bonuses.hread_empower) && player.hread) {
                    if (k == "thread") {
                        player.hread = false;
                    }
                    player.currencies[k] += change;
                }

                player.currencies[k] += player.stat_bonuses.all_plus;
                player.currencies[k] += change * (player.stat_bonuses.all_mult - 1);

                player.currencies[k] += player.stat_bonuses[k + "_plus"];
                player.currencies[k] += change * (player.stat_bonuses[k + "_mult"] - 1);

                player.currencies[k] = Math.floor(player.currencies[k]);

                // update change
                change = player.currencies[k] - last_currency_values[k];
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

function benchmark_wheels(time, ts=10) {
    autosaving_enabled = false;
    enable_benchmarks = true;
    save_all_data(loaded_player, wheels);

    currency_start = structuredClone(loaded_player.currencies);
    loaded_player.timespeed_override = ts;
    wheels.forEach(wheel => {
        wheel.autospinning = true;
    })

    console.log(`Benchmarking at ${loaded_player.timespeed_override}x speed for ${time/1000}s`);

    setTimeout(function() {
        // process results
        console.log("\n" + Object.keys(currency_start).map(k => `${k.padEnd(16)} | ${loaded_player.currencies[k] - currency_start[k]} (${Math.round((loaded_player.currencies[k] - currency_start[k]) * (100/(time/1000))) / 100}/s)`).join("\n"))

        loaded_player.timespeed_override = 0;

        autosaving_enabled = true;
        enable_benchmarks = false;

        let load = load_all_data();
        
        loaded_player = load.player;
        wheels = load.wheels;

        setup_game(false);
    }, time);
}

function setup_game(new_save) {
    last_currency_values = {...loaded_player.currencies};
    lerp_currency_values = {...loaded_player.currencies};
    
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
    bread_icon.src = loaded_player.bread_status == 2 ? "img/icons/bread_slice.png" : "img/icons/bread.png"

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
}

function handle_resize(event) {

}

const CLEARSAVE = false;

let autosaving_enabled = true;
let enable_benchmarks = false;

let wheel_reward_counts = {};
let currency_start = {};

let load = CLEARSAVE ? null : load_all_data();
let new_save = true;
if (load) {
    new_save = false;
}

let loaded_player = null;
let wheels = [];
if (new_save) {
    loaded_player = Player.new("plaao");
    loaded_player.currencies = {
        "bread": 0,
        "gold": 0,
        "insanium": 0,
        "orbs": 0,
        "rocks": 10,
        "specks_of_dust": 500000000,
        "thread": 0,
    }
} else {
    loaded_player = load.player;
    wheels = load.wheels;
}

let bread_icon = document.getElementById("currency-item-img-bread");
let currency_element_objs = {};
let currency_popup_objs = {};
let popup_timeouts = {};
Object.keys(loaded_player.currencies).forEach(k => {
    currency_element_objs[k] = document.getElementById("currency-item-text-" + k);
    currency_popup_objs[k] = document.getElementById("currency-item-text-popup-" + k);
})

let stat_bonuses = {};

document.addEventListener("DOMContentLoaded", function() {    
    setup_game(new_save);
    loaded_player.stat_bonuses = calculate_bread_upgrade_bonuses(loaded_player);

    //let test_currencies_txt = document.getElementById("debug_currencies");
    let debug_log_txt = document.getElementById("debug_log");
    let debug_log_txt2 = document.getElementById("debug_log2");
    let debug_log_txt3 = document.getElementById("debug_log3");

    let save_interval = Date.now() + 1000;

    setInterval(function() {
        wheels.forEach(wheel => {
            if (wheel.update(loaded_player)) {
                if (wheel.autospinning) {
                    wheel.pay_for_spin(loaded_player);
                }
            };
        })

        update_currency_view(loaded_player);

        debug_log_txt.textContent = Math.max(0, (Math.round(wheels[0].time_left) / 1000)).toString().toDDHHMMSS();
        debug_log_txt2.textContent = Math.max(0, (Math.round(wheels[1].time_left) / 1000)).toString().toDDHHMMSS();
        debug_log_txt3.textContent = Math.max(0, (Math.round(wheels[2].time_left) / 1000)).toString().toDDHHMMSS();

        render_bread_upgrades(loaded_player);
        loaded_player.stat_bonuses = calculate_bread_upgrade_bonuses(loaded_player);

        // setup keypress to save/load, then do testing to make sure the wheels always stop at the same place no matter what
        if (Date.now() > save_interval && autosaving_enabled) {
            console.log("Saved game");
            save_interval = Date.now() + 1000;
            save_all_data(loaded_player, wheels);
        }
    }, 1000/60);
})