const patterns_to_html = {
    "money": `<img src="${FILES_PREFIX}/img/icons/coin.png" class="generic-icon">`
}

function format_mixed_string_to_html(str) {
    return str.replaceAll(
        /:((?:\w|\d)+):/gm,
        (_, group) => patterns_to_html[group]
    );
}

class PlayerBall {
    constructor(nickname, ball_proto_name, level, xp, upgrades) {
        this.nickname = nickname;
        this.ball_proto_name = ball_proto_name;
        this.level = level;
        this.xp = xp;
        this.upgrades = upgrades;
    }
}

class Player {
    static id_inc = 0;

    constructor(name, money, materials, ball_inventory, ball_storage) {
        this.id = Player.id_inc;
        Player.id_inc++;
        
        this.name = name;
        this.money = money; // used for buying balls, entering tournaments, etc
        this.materials = materials; // used for upgrading ball stats
        this.ball_inventory = ball_inventory; // list of up to 6 - "active" balls
        this.ball_storage = ball_storage; // unlimited list of inactive balls
    }

    static get_empty_materials() {
        return {
            "green": 0,
            "red": 0,
            "cyan": 0,
            "white": 0,
        }
    }

    static init(name) {
        return new Player(
            name, 0, Player.get_empty_materials(), [], []
        )
    }
}

const TournamentBracket = {
    SINGLE_ELIM: "SINGLE_ELIM",
}

const TournamentFormat = {
    DUEL: "Duel",  // 1v1
    DOUBLE_BATTLE: "Double Battle",  // 2v2
    TRIPLE_KNOCKOUT: "Triple Knockout",  // 1v1 with 3 balls total
    FFA: "Free For All",  // 1v1v1v1
}

const tournament_format_info = {
    [TournamentFormat.DUEL]: {
        playercount: 2,

        ballcount_player: 1,
        ballcount_nonplayer: 1,

        initial_balls: 1,
        balls_insertable_anytime: false,
        balls_insertable_after_kill: false,
    },
    [TournamentFormat.DOUBLE_BATTLE]: {
        playercount: 2,

        ballcount_player: 2,
        ballcount_nonplayer: 2,

        initial_balls: 2,
        balls_insertable_anytime: false,
        balls_insertable_after_kill: false,
    },
    [TournamentFormat.TRIPLE_KNOCKOUT]: {
        playercount: 2,

        ballcount_player: 3,
        ballcount_nonplayer: 3,

        initial_balls: 1,
        balls_insertable_anytime: false,
        balls_insertable_after_kill: true,
    },
    [TournamentFormat.FFA]: {
        playercount: 4,

        ballcount_player: 1,
        ballcount_nonplayer: 1,

        initial_balls: 1,
        balls_insertable_anytime: false,
        balls_insertable_after_kill: false,
    },
}

const RewardType = {
    MONEY: "MONEY",
    MATERIALS: "MATERIALS",
    GAME_FN: "GAME_FN",  // call a specific function when winning. include a "desc" property so it can display
    BALL: "BALL", // PlayerBall object, will be copied into the player's inventory on win
}

class Reward {
    static money(amt) {
        return new Reward(
            RewardType.MONEY,
            p => p.get_money(amt),
            `:money: ${format_number(amt)}`
        )
    }

    static material(amt, typ) {
        return new Reward(
            RewardType.MATERIALS,
            p => p.get_materials(amt, typ),
            `:material_${typ}: ${format_number(amt)}`
        )
    }

    constructor(type, fn, desc) {
        this.type = type;
        this.fn = fn;
        this.desc = desc;
    }

    get(player) {
        this.fn(player);
    }
}

class TournamentGeneratedPlayerSettings {
    constructor(num_balls_range, selectable_balls, levels_range, money_range, materials_range) {
        this.num_balls_range = num_balls_range;
        this.selectable_balls = selectable_balls; // weighted array
        this.levels_range = levels_range;
        this.money_range = money_range;
        this.materials_range = materials_range;
    }

    generate(name) {
        // might be just one int for convenience so expand out if it is
        let num_balls = random_int(...(this.num_balls_range[1] ? this.num_balls_range : [this.num_balls_range, this.num_balls_range]));
        
        let balls_protos = new Array(num_balls).fill(0).map(_ => weighted_random_from_arr(this.selectable_balls)[1]);

        let levels = balls_protos.map(_ => random_int(...this.levels_range));
        
        let money = balls_protos.map(_ => random_int(...this.money_range));
        let materials = balls_protos.map(_ => random_int(...this.materials_range));

        // based on money, do rounds of buying upgrades for each ball (each ball gets a different generated money and materials amount)
        // apply some basic intelligence (based on tags), but essentially random
        // for now...
        //  TODO :)

        return new Player(
            name, 0, Player.get_empty_materials(),
            balls_protos.map((p, i) => new PlayerBall("", p, levels[i], 0, {})),
            [],
        )
    }
}

class Tournament {
    constructor(name, entry_price, prizes, bracket, format, num_players, match_frequency, gen_players_settings) {
        this.name = name;
        this.entry_price = entry_price;  // always in money

        // [1st, 2nd, 3rd, ...]
        this.prizes = prizes;

        this.bracket = bracket;
        this.format = format;

        this.num_players = num_players;

        this.match_frequency = match_frequency;

        // weighted array, randomly chosen from
        this.gen_players_settings = gen_players_settings;
    }
}

function raw_date_to_wd(date) {
    return `W${Math.floor(date / 7)+1}D${(date % 7)+1}`
}

function set_new_tournament(player, date, tournament) {
    current_tournament = tournament;
    current_tournament_info = {};

    // generate players
    current_tournament_info.players = [...new Array(tournament.num_players - 1).fill(0).map(_ => {
        return tournament.gen_players_settings.generate("test")
    }), player]

    // shuffle
    current_tournament_info.players = random_shuffle(current_tournament_info.players);

    current_tournament_info.selected_balls = new Array(tournament_format_info[tournament.format].ballcount_player).fill(null);
    current_tournament_info.selected_balls = player.ball_inventory.slice(0, tournament_format_info[tournament.format].ballcount_player)

    current_tournament_info.selected_indexes = current_tournament_info.selected_balls.map((_, i) => i);
    current_tournament_info.selected_slot = 0;

    setup_next_tournament_match(player, date, current_tournament);
}

function setup_next_tournament_match(player, date, tournament) {
    current_tournament_info.matches = [];
    let building_match = [];
    current_tournament_info.players.forEach(p => {
        // shuffle player balls unless theyre the player player
        if (p.id != player.id) {
            p.ball_inventory = random_shuffle(p.ball_inventory);
        }

        building_match.push(p);
        if (building_match.length >= tournament_format_info[tournament.format].playercount) {
            // push the match into the array
            current_tournament_info.matches.push(building_match);
            if (building_match.some(pl => pl.id == player.id)) {
                current_tournament_info.player_match_index = current_tournament_info.matches.length-1;
            }

            building_match = [];
        }
    });

    // if there is spare, put them into 1-person matches (bye rounds)
    building_match.forEach(spare => {
        current_tournament_info.matches.push([spare]);
        if (spare.id == player.id) {
            current_tournament_info.player_match_index = current_tournament_info.matches.length-1;
        }
    });

    current_tournament_info.next_match_date = date + tournament.match_frequency;
}

function layout_tournament_screen() {
    let tournament = current_tournament;
    let info = current_tournament_info;

    let e = document.querySelector(".campaign .active-tournament-view");

    // text info
    e.querySelector(".tournament-name").textContent = tournament.name;
    e.querySelector(".tournament-format").textContent = tournament.format;
    e.querySelector(".tournament-stage").textContent = {
        8: "Quarterfinals",
        4: "Semifinals",
        2: "Finals",
    }[current_tournament_info.players.length] ?? `${current_tournament_info.players.length}s`;

    let next_fight_elem = e.querySelector(".tournament-next-fight");
    let distance = info.next_match_date - campaign_cur_date;

    next_fight_elem.textContent = distance <= 0 ? "now" : `${distance} days`;
    next_fight_elem.classList.remove("now");
    next_fight_elem.classList.remove("soon");
    if (distance == 0) {
        next_fight_elem.classList.add("now");
    } else if (distance <= 3) {
        next_fight_elem.classList.add("soon");
    }

    e.querySelector(".tournament-next-fight-date").textContent = `(${raw_date_to_wd(info.next_match_date)})`;

    // player
    let player_entries = e.querySelectorAll(".player-balls.balls-list.player .ball-info-display");
    
    player_entries.forEach((el, i) => {
        if (i < tournament_format_info[tournament.format].ballcount_player) {
            el.classList.remove("nodisplay");

            // PlayerBall object
            let ball_entry = info.selected_balls[i];

            if (ball_entry) {
                let ball_proto = selectable_balls.find(t => t.name == ball_entry.ball_proto_name);
                let testball = create_testball(ball_proto, ball_entry.level);

                update_ball_info_widget(ball_proto, testball, ball_entry.level, el);

                if (ball_entry.nickname) {
                    el.querySelector(".name").textContent = ball_entry.nickname;
                }

                el.querySelector(".resources-spent-number").textContent = format_number(
                    /* TODO -- ball_entry.upgrades.total_value() */ 0, NumberFormat.SCIENTIFIC, 1e6
                )
            } else {
                el.querySelector(".big-ballicon").src = `${FILES_PREFIX}img/icons/unknown.png`;
                
                el.querySelector(".name").textContent = `Unselected`;
                
                el.querySelector(".tiertext").textContent = `${String.fromCharCode(160)}?${String.fromCharCode(160)}`;
                el.querySelector(".tiertext").style.backgroundColor = `#888`;
                el.querySelector(".tiertext").style.color = `#ddd`;

                el.querySelector(".level").textContent = `LV ?`;
                el.querySelector(".resources-spent-number").textContent = `?`;
            }
        } else {
            el.classList.add("nodisplay");
        }
    })

    // opponent
    let opponent_entries = e.querySelectorAll(".player-balls.balls-list.opponent .ball-info-display");
    
    let balls_to_show = (tournament_format_info[tournament.format].playercount-1) * tournament_format_info[tournament.format].ballcount_nonplayer;

    campaign_tournament_info_objs = [];
    opponent_entries.forEach((el, i) => {
        if (i < balls_to_show) {
            el.classList.remove("nodisplay");

            // PlayerBall object
            // find the player index (there might be multiple!)
            let player_index = Math.floor(i / tournament_format_info[tournament.format].ballcount_nonplayer);
            let ball_index = i % tournament_format_info[tournament.format].ballcount_nonplayer;

            ball_entry = info.matches[info.player_match_index].filter(p => p.id != user_player.id)[player_index].ball_inventory[ball_index];

            if (ball_entry) {
                let ball_proto = selectable_balls.find(t => t.name == ball_entry.ball_proto_name);
                let testball = create_testball(ball_proto, ball_entry.level);

                update_ball_info_widget(ball_proto, testball, ball_entry.level, el);
                
                if (ball_entry.nickname) {
                    el.querySelector(".name").textContent = ball_entry.nickname;
                }

                el.querySelector(".resources-spent-number").textContent = format_number(
                    /* TODO -- ball_entry.upgrades.total_value() */ 0, NumberFormat.SCIENTIFIC, 1e6
                )

                campaign_tournament_info_objs.push([[ball_proto, testball, ball_entry.level], ball_entry]);
            } else {
                // this should never happen
                console.log("fuck");
            }
        } else {
            el.classList.add("nodisplay");
        }
    })
}

function show_campaign_info_popup(index) {
    let popup = document.querySelector("#campaign_ball_extra_info");

    update_ball_info_widget(
        ...campaign_tournament_info_objs[index][0], popup
    )

    popup.querySelector(".resources-spent-number").textContent = /* TODO -- campaign_tournament_info_objs[index][1].upgrades.total_value() */ 0;

    popup.classList.remove("nodisplay");
}

function campaign_try_select_ball(slot_index, ball_index) {
    // check all slot indexes to make sure we're not selecting an already selected one
    // if we are, swap
    let info = current_tournament_info;

    let already_selected_slot_index = info.selected_indexes.findIndex(v => v == ball_index);
    if (already_selected_slot_index != -1) {
        if (already_selected_slot_index == slot_index) {
            // selecting self, short circuit
            return;
        }

        // set to original value of current slot
        info.selected_indexes[already_selected_slot_index] = info.selected_indexes[slot_index];
    }

    // set current slot to new index
    info.selected_indexes[slot_index] = ball_index;

    layout_campaign_selection_popup();
}

function close_campaign_info_popup() {
    document.querySelector("#campaign_ball_extra_info").classList.add("nodisplay");
}

function layout_campaign_selection_popup() {
    // show selected balls (plus other balls in quieter colour)
    // then update the info widget
    let info = current_tournament_info;
    let el_popup = document.querySelector("#campaign_ball_selector");

    // TODO update ball grid and add event listeners
    let ball_list = el_popup.querySelector(".ball-select.small-ball-grid");
    ball_list.querySelectorAll(".ball-item:not(.example)").forEach(e => e.remove());

    let clone = ball_list.querySelector(".example");
    user_player.ball_inventory.forEach((ball_entry, i) => {
        let ball_proto = selectable_balls.find(t => t.name == ball_entry?.ball_proto_name);

        let new_o = clone.cloneNode(true);
        if (ball_proto) {
            new_o.querySelector(".ballnickname").textContent = ball_entry.nickname || ball_proto.ball_name;
            
            let icon = new_o.querySelector(".ballicon");
            if (entity_sprites.get(`icon_${ball_proto.ball_name.toLowerCase()}`)) {
                icon.src = `${FILES_PREFIX}img/icons/${ball_proto.ball_name.toLowerCase()}.png`;
            } else {
                icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
            }

            let e = false;
            icon.addEventListener("error", () => {
                if (!e) {
                    icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
                    e = true;
                }
            });

            new_o.style.color = Colour.white.css();

            if (info.selected_indexes[info.selected_slot] == i) {
                new_o.classList.add("selected");
            } else if (info.selected_indexes.some(idx => idx == i)) {
                new_o.classList.add("other-selected");
            }

            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            let idx = i;
            new_o.addEventListener("click", _ => {
                campaign_try_select_ball(info.selected_slot, idx);
            })
        } else {
            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            new_o.style.visibility = "hidden";
        }

        ball_list.append(new_o);
    })

    let ball_item = user_player.ball_inventory[info.selected_indexes[info.selected_slot]];

    let ball_proto = selectable_balls.find(t => t.name == ball_item.ball_proto_name);
    let level = ball_item.level;
    let upgrades = ball_item.upgrades;
    let upgrades_total_value = /* TODO -- upgrades.total_value() */ 0;    

    let testball = create_testball(ball_proto, level);

    let widget = el_popup.querySelector(".ball-info-display");
    update_ball_info_widget(
        ball_proto, testball, level, widget
    )

    if (ball_item.nickname) {
        widget.querySelector(".name-surround").classList.remove("nodisplay");
        widget.querySelector(".nickname").textContent = ball_item.nickname;
    } else {
        widget.querySelector(".name-surround").classList.add("nodisplay");
        widget.querySelector(".nickname").textContent = ball_proto.ball_name;
    }

    widget.querySelector(".resources-spent-number").textContent = format_number(
        upgrades_total_value, NumberFormat.SCIENTIFIC, 1e6
    )
}

function open_campaign_selection_popup(index) {
    // save backup to go back if cancelled
    current_tournament_info.prev_selected_indexes = [...current_tournament_info.selected_indexes];
    current_tournament_info.selected_slot = index;

    layout_campaign_selection_popup();

    document.querySelector("#campaign_ball_selector").classList.remove("nodisplay");
}

function save_campaign_selection_button() {
    // close
    document.querySelector("#campaign_ball_selector").classList.add("nodisplay");
    
    // update set indexes' balls
    current_tournament_info.selected_balls = current_tournament_info.selected_indexes.map(
        idx => user_player.ball_inventory[idx]
    )

    layout_tournament_screen();
}

function cancel_campaign_selection_button() {
    // reset back to backup
    current_tournament_info.selected_indexes = current_tournament_info.prev_selected_indexes;

    save_campaign_selection_button();
}

// +1 = 1 day
let campaign_cur_date = 0;

let test_tournament = new Tournament(
    "test", 25, [
        Reward.money(500),
        Reward.money(250),
        Reward.money(100),
    ],
    TournamentBracket.SINGLE_ELIM,
    TournamentFormat.DUEL,
    16, 7, 
    new TournamentGeneratedPlayerSettings(
        3, balance_weighted_array(selectable_balls_for_random.map(b => [1, b.name])), [10, 20],
        [4000, 8000], [100, 150]
    )
)

let user_player = Player.init("plaao");
user_player.ball_inventory = [
    new PlayerBall(
        "my guy", "SordBall",
        20, 0, {}
    ),

    new PlayerBall(
        "chat", "HammerBall",
        12, 0, {}
    ),

    new PlayerBall(
        "THE HATED ONE", "HandBall",
        16, 0, {}
    ),

    new PlayerBall(
        "", "RosaryBall",
        16, 0, {}
    ),,
    null,
    null,
]

let campaign_tournament_info_objs = [

]

let current_tournament = null;
let current_tournament_info = {};


// TODO:
// Make nicknames show correctly
// Add selection UI for player balls
// Show materials spent in "more info" section
// Show summary of upgrades (this one should happen later once we determine how exactly upgrades will look)
// and whateevr the fuck else
// also change week/day display stuff, you know
// and then actually make tournaments HAPPEN