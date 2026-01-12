const BASE_URL = "https://plaao.net/balls";

let board = null;
let last_replay = "";
let last_replay_compressed = "";
let fps_checks = [
    60, 90, 120, 144, 240, 480
]

let default_cols = [
    new Colour(255, 32, 32, 255),
    Colour.yellow,
    Colour.green,
    Colour.cyan,

    Colour.from_hex("#e3910e"),
    Colour.from_hex("#228c22"),
    Colour.from_hex("#29e3a2"),
    Colour.from_hex("#e30e59"),

    Colour.from_hex("#9a39fa"),
    new Colour(255, 182, 201, 255),
    new Colour(230, 230, 230, 255),
];
let col_names = [
    "RED",
    "YLW",
    "GRN",
    "BLU",

    "ORN",
    "DGN",
    "SEA",
    "MGT",

    "VLT",
    "PNK",
    "WHT",
]

let default_positions = [
    new Vector2(512*4, 512*3),
    new Vector2(512*12, 512*11),
    new Vector2(512*5, 512*10),
    new Vector2(512*11, 512*4),
]

let last_winner = null;
let last_board = null;
let search_stored_replays = [];

let replay_history = [];
const REPLAY_HISTORY_SIZE = 50;

let replaying = false;

let readied_replay = null;

let selected_ball_info = {
    "ball1": {
        name: "SORD",
        skin: "Default",
        level: 0,
        team: 0,
        category: CATEGORIES.STANDARD,
        disabled: false,
        saved_selections: {},
        saved_skins: {},
    },

    "ball2": {
        name: "Hammer",
        skin: "Default",
        level: 0,
        team: 1,
        category: CATEGORIES.STANDARD,
        disabled: false,
        saved_selections: {},
        saved_skins: {},
    },
    
    "ball3": {
        name: "SORD",
        skin: "Default",
        level: 0,
        team: 2,
        category: CATEGORIES.STANDARD,
        disabled: true,
        saved_selections: {},
        saved_skins: {},
    },

    "ball4": {
        name: "SORD",
        skin: "Default",
        level: 0,
        team: 3,
        category: CATEGORIES.STANDARD,
        disabled: true,
        saved_selections: {},
        saved_skins: {},
    },
}

let currently_editing_ballid = "ball1";
let saved_prev_state = JSON.parse(JSON.stringify(selected_ball_info[currently_editing_ballid]));

document.addEventListener("DOMContentLoaded", async function() {
    await load_audio();
});

function spawn_testing_balls() {
    board = new Board(new Vector2(512 * 16, 512 * 16));
    // board.spawn_ball(new SordBall(board, 1, 512, Colour.red, null, null, {id: 0}), new Vector2(512*4, 512*4));
    // board.spawn_ball(new HammerBall(board, 1, 512, Colour.yellow, null, null, {id: 1}, true), new Vector2(512*12, 512*12));
    board.spawn_ball(new MagnumBall(board, 1, 512, Colour.green, null, null, {id: 2}), new Vector2(512*5, 512*11));
    board.spawn_ball(new SordBall(board, 1, 512, Colour.cyan, null, null, {id: 3}, true), new Vector2(512*11, 512*5));

    board.record_starting_balls();

    let seed = Math.random().toString().slice(2);
    board.set_random_seed(seed);

    board.balls[0].add_velocity(random_on_circle(random_float(0, 512 * 10, board.random), board.random));
    board.balls[1]?.add_velocity(random_on_circle(random_float(0, 512 * 10, board.random), board.random));
    board.balls[2]?.add_velocity(random_on_circle(random_float(0, 512 * 10, board.random), board.random));
    board.balls[3]?.add_velocity(random_on_circle(random_float(0, 512 * 10, board.random), board.random));
}

function save_replay_button(override_text, override_elem, override_return) {
    // copy the replay to the clipboard
    let elem = override_elem ? override_elem : document.getElementById("save_replay_button");
    navigator.clipboard.writeText(
        `${BASE_URL}?r=${override_text ? override_text : (last_replay_compressed ?? last_replay)}`
    ).then(function() {
		console.log('Copied replay link to clipboard!');
		
		elem.textContent = "Copied!"
		elem.classList.add("green");
		
		setTimeout(function() {
			elem.textContent = override_return ? override_return : "Copy last game's replay link"
		    elem.classList.remove("green");
		}, 2500);
	}, function(err) {
        console.error('Something went wrong: ', err);
	});
}

function load_replay_button() {
    let replay = prompt("Enter replay string below:");
    if (!replay)
        return;

    try {
        load_replay(replay);
    } catch (e) {
        alert(`There was a problem parsing the replay!!\n\nError:\n${e}`);
    }
}

function add_to_replays_tab(tab, replay_entry, to_first=true) {
    /*

        Date
        Duration
        BallIcon (BallName)(in ball colour) [StarIcon Win](if win)
        ...
    */
    let parent_elem = document.createElement("div");
    let first_elem = document.createElement("div");
    let second_elem = document.createElement("div");

    parent_elem.classList.add("parent");
    first_elem.classList.add("first");
    second_elem.classList.add("second");

    parent_elem.append(first_elem);
    parent_elem.append(second_elem);

    let main_elem = document.createElement("button");
    
    let date_span = document.createElement("span");
    let duration_span = document.createElement("span");
    
    date_span.textContent = new Date(replay_entry.replay.time_recorded).toLocaleString();
    duration_span.textContent = `Duration: ${replay_entry.replay.duration ? replay_entry.replay.duration.toFixed(1) : "?"}s`;

    date_span.classList.add("date");
    duration_span.classList.add("duration");

    main_elem.appendChild(date_span);
    main_elem.appendChild(duration_span);

    replay_entry.winners.forEach((won, index) => {
        let ball_str = replay_entry.replay.balls[index];
        if (!ball_str) {
            return;
        }

        let ball_class = selectable_balls.find(t => t?.name == ball_str);

        let entry_span = document.createElement("span");

        let img_icon = document.createElement("img");
        let name_span = document.createElement("span");

        img_icon.src = `${FILES_PREFIX}img/icons/${ball_class.ball_name.toLowerCase()}.png`;
        let e = false;
        img_icon.addEventListener("error", () => {
            if (!e) {
                img_icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
                e = true;
            }
        });

        name_span.textContent = ` ${(`${ball_class.ball_name} LV ${replay_entry.replay.levels[index]+1} `).padEnd(23, "-")} `;
        name_span.style.color = Colour.from_array(replay_entry.replay.cols[index]).css();

        entry_span.appendChild(img_icon);
        entry_span.appendChild(name_span);

        if (won) {
            let star_icon = document.createElement("img");
            let star_span = document.createElement("span");

            star_icon.src = `${FILES_PREFIX}img/icons/star.png`;
            star_span.style.color = Colour.from_array(replay_entry.replay.cols[index]).css();
            star_span.textContent = ` Win!`;

            entry_span.appendChild(star_icon);
            entry_span.appendChild(star_span);
        }

        main_elem.appendChild(entry_span);
    });

    main_elem.addEventListener("click", () => {
        load_replay(btoa(JSON.stringify(replay_entry.replay)));
    })

    first_elem.append(main_elem);

    let copy_button = document.createElement("button");
    let play_button = document.createElement("button");

    copy_button.textContent = "Copy replay";
    play_button.textContent = "Play replay";

    copy_button.addEventListener("click", () => {
        save_replay_button(btoa(JSON.stringify(replay_entry.replay_compressed ?? replay_entry.replay)), copy_button, copy_button.textContent);
    })

    play_button.addEventListener("click", () => {
        load_replay(btoa(JSON.stringify(replay_entry.replay)));
    })

    second_elem.append(copy_button);
    // second_elem.append(play_button);

    if (to_first) {
        tab.prepend(parent_elem);
    } else {
        tab.append(parent_elem);
    }
}

function update_replays_tab(refresh=false) {
    let elem = document.getElementById("sandbox_replay_panel");

    // if refresh, clear it and add all.
    // else, add the one in index zero at the start, then chop off any after the max-length
    if (refresh) {
        elem.innerHTML = "";
        replay_history.forEach(replay => add_to_replays_tab(elem, replay, false));
    } else {
        add_to_replays_tab(elem, replay_history[0]);
    }

    while (elem.childNodes.length > REPLAY_HISTORY_SIZE) {
        elem.removeChild(elem.lastChild);
    }
}

const REPLAY_BALLS_LISTS = [
    main_selectable_balls,
    additional_selectable_balls,
    powered_selectable_balls
];
function collapse_replay(replay) {
    // collapse down the replay as much as possible:
    /*
        - balls: cut off nulls at the end (and do the equivalent for cols, levels, players, skins)
        - cols+players: codependent; set to nulls IFF both are exactly the default
        - levels: set to null if [0, 0, ...]
        - skins: set to null if ['Default', 'Default', ...]
    */
    let replay_collapsed = structuredClone(replay);

    for (let i=replay_collapsed.balls.length-1; i>=0; i--) {
        let b = replay_collapsed.balls[i];
        if (!b) {
            // remove from all
            replay_collapsed.balls.splice(i, 1);

            replay_collapsed.cols?.splice(i, 1);
            replay_collapsed.levels?.splice(i, 1);
            replay_collapsed.players?.splice(i, 1);
            replay_collapsed.skins?.splice(i, 1);
        } else {
            break;
        }
    }
    
    let cols_matched = replay_collapsed.cols?.every((c, i) => Colour.from_array(c).eq(default_cols[i]));
    
    let sample_player = {
        id: -1,
        stats: {
            damage_bonus: 1,
            defense_bonus: 1,
            ailment_resistance: 1,
        }
    }

    let players_matched = replay_collapsed.players?.every((p, i) => {
        let pc = sample_player;
        pc.id = i;

        return JSON.stringify(p) == JSON.stringify(pc);
    });

    let levels_matched = replay_collapsed.levels?.every(l => l == 0);

    let skins_matched = replay_collapsed.skins?.every(s => s == "Default");

    if (cols_matched && players_matched) {
        replay_collapsed.cols = null;
        replay_collapsed.players = null;
    }

    if (levels_matched) {
        replay_collapsed.levels = null;
    }

    if (skins_matched) {
        replay_collapsed.skins = null;
    }

    // rename the balls from their names to codes
    replay_collapsed.balls = replay_collapsed.balls.map(b => {
        let list_index = -1;
        let ball_index = -1;

        for (let i=0; i<REPLAY_BALLS_LISTS.length; i++) {
            let idx = REPLAY_BALLS_LISTS[i].findIndex(bp => bp.name == b);
            if (idx != -1) {
                ball_index = idx;
                list_index = i;
                break;
            }
        }

        if (list_index != -1) {
            let char = String.fromCharCode(65 + list_index);
            return `${char}${ball_index}`;
        } else {
            return b;
        }
    });

    // then rename all the elements to shorter names (compress_replay)
    let compressed = compress_replay(replay_collapsed);

    return compressed;
}

const REPLAY_VALUES = {
    "balls": "b",
    "cols": "c",
    "duration": "d",
    "framespeed": "f",
    "game_version": "g",
    "levels": "l",
    "players": "p",
    "seed": "s",
    "skins": "k",
    "starting_hp": "h",
    "time_recorded": "t",
};

function compress_replay(replay) {
    let compressed = {};

    Object.keys(REPLAY_VALUES).forEach((k, i) => {
        if (replay[k])
            compressed[REPLAY_VALUES[k]] = replay[k]
    });

    return compressed;
}

function decompress_replay(replay) {
    let decompressed = {};

    Object.keys(REPLAY_VALUES).forEach((k, i) => {
        decompressed[k] = replay[REPLAY_VALUES[k]];
    });

    return decompressed;
} 

function exit_battle(save_replay=true) {
    if (!board)
        return;

    STARTING_HP = stored_starting_hp;

    if (!replaying && board.forced_time_deltas != 0 && save_replay && !mysterious_powers_enabled) {
        // we might have a replay
        // replay needs:
        // - framespeed
        // - starting balls + order
        // - random seed
        // that's it!
        // TODO also save colour and start positions...
        let replay = {
            game_version: GAME_VERSION,
            time_recorded: Date.now(),
            duration: board.duration,

            framespeed: board.forced_time_deltas && Math.round(1000 / board.forced_time_deltas),
            balls: board.starting_balls,
            levels: board.starting_levels,
            players: board.starting_players,
            cols: board.starting_cols,
            skins: board.starting_skins,

            seed: board.random_seed,

            starting_hp: STARTING_HP,
        }

        let replay_compressed = collapse_replay(replay);

        last_replay = btoa(JSON.stringify(replay));
        last_replay_compressed = btoa(JSON.stringify(replay_compressed));

        let rps = board.remaining_players();
        let b = null;
        let bs = [];
        if (rps.length >= 1) {
            bs = board.get_all_player_balls(rps[0]).filter(ball => ball.show_stats);
            b = bs[0];
        }

        last_winner = b;
        last_board = board;

        replay_history.unshift({
            replay: replay,
            replay_compressed: replay_compressed,
            tension: board.tension,
            winners: board.starting_players.map(ps => rps.some(p => p.id == ps.id))
        });

        replay_history = replay_history.slice(0, REPLAY_HISTORY_SIZE);

        update_replays_tab();
        localStorage.setItem("balls_replay_history", JSON.stringify(replay_history));

        // console.log(board.tension);
    }

    replaying = false;
    board = null;
    document.querySelector(".game-container").classList.add("popout");
    document.querySelector(".game-container").classList.remove("popin");

    if (last_replay) {
        document.querySelector("#save_replay_button").disabled = false;
    } else {
        document.querySelector("#save_replay_button").disabled = true;
    }

    stop_music();

    game_paused = true;
    update_sim_speed_display();
}

function enter_battle() {
    bg_changed = true;

    Object.keys(layers).forEach(k => layers[k].ctx.clearRect(0, 0, layers[k].canvas.width, layers[k].canvas.height));

    layers.bg3.ctx.fillStyle = game_normal_col;
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    document.querySelector(".game-container").classList.add("popin");
    document.querySelector(".game-container").classList.remove("popout");

    update_sim_speed_display();
    render_watermark();
}

function load_replay(replay_as_text) {
    // it might be a URL - if it is, pick out the "r" query parameter
    let replay = parse_replay(replay_as_text);

    let framespeed = replay.framespeed;
    let seed = replay.seed;

    // hardcoded... for now
    let positions = [];
    if (replay.positions) {
        positions = replay.positions.map(p => new Vector2(p[0], p[1]));
    } else {
        positions = default_positions;
    }

    let ball_classes = replay.balls.map(b => {
        return selectable_balls.find(t => t.name == b);
    })

    let ball_levels = replay.levels ?? new Array(ball_classes.length).fill(0);

    let players = [];
    let cols = [];
    // we need to gracefully handle situations where there are no players or cols
    if (replay.players && replay.cols) {
        // cols are in saveable (array) form so remember to transform them back
        for (let i=0; i<ball_classes.length; i++) {
            players.push(replay.players[i]);
            cols.push(Colour.from_array(replay.cols[i]));
        }
    } else {
        for (let i=0; i<ball_classes.length; i++) {
            players.push({
                id: i,
                stats: {
                    damage_bonus: 1,
                    defense_bonus: 1,
                    ailment_resistance: 1,
                }
            })
            cols.push(default_cols[i]);
        }
    }

    let skins = [];
    if (replay.skins) {
        skins = replay.skins;
    } else {
        for (let i=0; i<ball_classes.length; i++) {
            skins.push("Default");
        }
    }

    let starting_hp = STARTING_HP;
    if (replay.starting_hp) {
        starting_hp = replay.starting_hp;
    }

    replaying = true;
    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels,
        players, skins, starting_hp
    );
}

function spawn_selected_balls() {
    let framespeed = [...fps_checks, 0][
        document.querySelector("#fps-select").selectedIndex
    ];
    
    let seed = document.querySelector("#sandbox-random-seed").value || Math.random().toString().slice(2);
    
    let positions = default_positions;

    let infos = [
        selected_ball_info.ball1,
        selected_ball_info.ball2,
        selected_ball_info.ball3,
        selected_ball_info.ball4
    ];

    let cols_indexes = [];
    for (let i=0; i<positions.length; i++) {
        let col_team = infos[i].team;
        cols_indexes.push(col_team);
    }

    let cols = cols_indexes.map(c => default_cols[c]);

    let ball_classes = [];
    for (let i=0; i<cols.length; i++) {
        let value = infos[i].name;
        if (infos[i].disabled)
            value = null;

        let ball_proto = selectable_balls.find(t => t.ball_name == value);

        ball_classes.push(ball_proto);
    }

    let ball_levels = [];
    for (let i=0; i<cols.length; i++) {
        let lvl = infos[i].level;
        ball_levels.push(lvl);
    }

    let players = [];
    for (let i=0; i<cols.length; i++) {
        players.push({
            id: cols_indexes[i],
            stats: {
                damage_bonus: 1,
                defense_bonus: 1,
                ailment_resistance: 1,
            }
        })
    }

    let skins = [];
    for (let i=0; i<positions.length; i++) {
        let skin = infos[i].skin;
        skins.push(skin);
    }

    mysterious_powers_enabled = document.querySelector("#mysterious_powers_checkbox").checked;

    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels,
        players, skins, STARTING_HP
    );
}

let christmas = false;
let new_year = false;

function start_game(framespeed, seed, cols, positions, ball_classes, ball_levels, players, skins, starting_hp) {
    document.activeElement.blur();
    lmb_down = false;
    
    setTimeout(() => {
        stored_starting_hp = STARTING_HP;
        STARTING_HP = starting_hp;
    
        board = new Board(new Vector2(512 * 16, 512 * 16));

        screen_to_game_scaling_factor = board.size.x / canvas_width;

        let skipping = searching || document.querySelector("#skip_intro_checkbox").checked;

        // set up random seed and framespeed
        board.expected_fps = framespeed;
        board.forced_time_deltas = framespeed == 0 ? 0 : 1000 / framespeed;
        board.set_random_seed(seed);

        let balls = [];

        cols.forEach((col, index) => {
            let ball_proto = ball_classes[index];
            if (ball_proto) {
                let lvl = ball_levels[index];
                let ball = new ball_proto(
                    board,
                    1, 512, col, null, null, players[index], lvl, index % 2 == 1
                );

                ball.randomise_weapon_rotations();

                board.spawn_ball(ball, positions[index])
                
                ball.set_skin(skins[index]);
                
                if (christmas) {
                    let hat_particle = new Particle(ball.position, 0, 1, entity_sprites.get("festive red hat"), 0, 99999, false);
                    board.spawn_particle(hat_particle, ball.position);

                    ball.linked_hat_particle = hat_particle;
                }

                ball.display = skipping;

                balls.push(ball_proto);
            }
        })

        start_balls = balls;

        board.starting_balls = ball_classes.map(c => c?.name);
        board.starting_levels = ball_levels;
        board.starting_players = players;
        board.starting_cols = cols.map(c => c.data);
        board.starting_skins = skins;

        board.balls.forEach(ball => ball.add_velocity(
            random_on_circle(
                random_float(512 * 5, 512 * 10, board.random),
                board.random)
            )
        );
    
        if (board.remaining_players().length == 1) {
            match_end_timeout = 3 * 1000;
            render_victory_enabled = false;
        } else if (board.remaining_players().length == 0) {
            match_end_timeout = 1 * 1000;
            render_victory_enabled = false;
        } else {
            match_end_timeout = 5 * 1000;
            if (window.location.href.startsWith("file://")) {
                // match_end_timeout = 16 * 1000;
            }
            
            render_victory_enabled = true;
        }

        starting_fullpause_timeout = skipping ? 0 : (document.querySelector("#extend_intro_checkbox").checked ? 6 : 3);
        fullpause_timeout = starting_fullpause_timeout;
        opening_state = {};
        if (skipping) {
            opening_state.cnt = 3;
        }

        if (mysterious_powers_enabled) {
            current_mysterious_power = {
                name: "EXPLOSION",
                power: MYSTERIOUS_POWER_INFO[MYSTERIOUS_POWERS.EXPLOSION].power_start
            };

            setup_god(board);
        }

        // cache the music if not muted
        if (!muted && starting_fullpause_timeout > 1) {
            prepare_lazy_audio(`2048_${random_int(0, 13, get_seeded_randomiser(board.random_seed))+1}`);
        }

        game_paused = false;
    }, 0);

    enter_battle();
}

function update_ballinfo(ballid, save_skin=false) {
    let ball_team = document.querySelector(`select[name='${ballid}_team']`).selectedIndex;

    let ball_classname = document.querySelector(`select[name='${ballid}']:not(.nodisplay)`).value;
    let ball_proto = selectable_balls.find(t => t.ball_name == ball_classname);

    let settings_elem = document.querySelector(`#${ballid}_settings`);
    let info_parent_elem = document.querySelector(`#${ballid}_info`);
    let info_a_parent_elem = document.querySelector(`#${ballid}_a_info`);

    let info_elem = info_parent_elem.querySelector(`span`);
    let info_a_elem = info_a_parent_elem.querySelector(`span`);

    let skins = [];
    let skins_elem = document.querySelector(`select[name=${ballid}_skin]`);

    if (ball_proto) {
        let testball = new ball_proto(
            {random: Math.random, random_seed: "123"}, 1, 512, Colour.white, null, null, {}, 1, false
        );

        skins = ["Default skin", ...(ball_proto.AVAILABLE_SKINS ?? [])];

        info_elem.textContent = testball.description_brief;
        info_a_elem.textContent = testball.max_level_description;
    } else {
        info_elem.textContent = "-";
        info_a_elem.textContent = "-";
    }

    let saved_skin = 0;
    if (save_skin) {
        saved_skin = skins_elem.selectedIndex;
    }

    skins_elem.options.length = 0;
    if (skins.length > 0) {
        skins.forEach(skin => {
            skins_elem.options.add(new Option(skin));
        })
    } else {
        skins_elem.options.add(new Option("-"));
    }

    skins_elem.selectedIndex = saved_skin;

    settings_elem.style.setProperty("--col", default_cols[ball_team].css());
    info_a_parent_elem.style.setProperty("--col", default_cols[ball_team].lerp(Colour.white, 0.5).css());
    info_parent_elem.style.setProperty("--col", default_cols[ball_team].css());
    skins_elem.style.setProperty("--col", default_cols[ball_team].css());
}

function update_awaken_showhide(ballid) {
    let lv = document.querySelector(`#${ballid}_level`).value;
    document.querySelector(`#${ballid}_level_number`).textContent = lv;

    if (lv >= AWAKEN_LEVEL) {
        document.querySelector(`#${ballid}_a_info`).classList.remove("hidden");
    } else {
        document.querySelector(`#${ballid}_a_info`).classList.add("hidden");
    }
}

function update_ball_selection_popup() {
    // clear the popup first
    let ballid = currently_editing_ballid;
    if (!ballid)
        return;

    let elem = document.querySelector("#sandbox_ball_selector");

    let category_list = elem.querySelector(".category-selection-menu");
    category_list.querySelectorAll(".category-selection-item:not(.example)").forEach(e => e.remove());

    let ball_list = elem.querySelector(".ball-select.small-ball-grid");
    ball_list.querySelectorAll(".ball-item:not(.example)").forEach(e => e.remove());

    let skin_list = elem.querySelector(".skin-select.small-ball-grid");
    skin_list.querySelectorAll(".ball-item:not(.example)").forEach(e => e.remove());

    let team_list = elem.querySelector(".team-select.small-ball-grid");
    team_list.querySelectorAll(".ball-item:not(.example)").forEach(e => e.remove());

    let ballinfo_elem = elem.querySelector("#ball_info_display");

    // setup in order
    // category, ball list, selected ball info, skin, team, level
    let clone = category_list.querySelector(".example");
    Object.keys(CATEGORIES).forEach(c => {
        let new_o = clone.cloneNode(true);

        new_o.textContent = c;
        new_o.style.backgroundColor = CATEGORIES_INFO[c].col.lerp(Colour.black, 0.8).css();
        new_o.style.color = CATEGORIES_INFO[c].col.css();

        if (selected_ball_info[ballid].category == c) {
            new_o.classList.add("selected");
        }

        new_o.classList.remove("example");
        new_o.classList.remove("nodisplay");

        let cs = c;
        new_o.addEventListener("click", _ => {
            change_selected_category(cs);
        })

        category_list.append(new_o);
    });

    clone = ball_list.querySelector(".example");
    let longest_cat_len = Math.max(...Object.keys(CATEGORIES).map(k => category_to_balls_list[k].length))

    for (let i=0; i<longest_cat_len; i++) {
        let b = category_to_balls_list[selected_ball_info[ballid].category][i];

        let new_o = clone.cloneNode(true);

        if (b) {
            new_o.querySelector(".ballname").textContent = b.ball_name;
            
            let icon = new_o.querySelector(".ballicon");
            if (entity_sprites.get(`icon_${b.ball_name.toLowerCase()}`)) {
                icon.src = `${FILES_PREFIX}img/icons/${b.ball_name.toLowerCase()}.png`;
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

            new_o.style.color = CATEGORIES_INFO[selected_ball_info[ballid].category].col.lerp(Colour.white, 0.5).css();

            if (selected_ball_info[ballid].name == b.ball_name) {
                new_o.classList.add("selected");
            }

            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            new_o.addEventListener("click", _ => {
                if (selected_ball_info[ballid].name != b.ball_name)
                    change_selected_ball(b.ball_name);
            })
        } else {
            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            new_o.style.visibility = "hidden";
        }

        ball_list.append(new_o);
    }

    let ball_proto = selectable_balls.find(t => t.ball_name == selected_ball_info[ballid].name);
    let testball = new ball_proto(
        {random: Math.random, random_seed: "123"}, 1, 512, Colour.white, null, null, {}, 1, false
    );

    ballinfo_elem.querySelector(".name").textContent = testball.name;

    let icon = ballinfo_elem.querySelector(".big-ballicon");
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

    ballinfo_elem.querySelector("#tiertext").style.color = TIERS_INFO[testball.tier].col.css();
    ballinfo_elem.querySelector("#tiertext").style.backgroundColor = TIERS_INFO[testball.tier].col.lerp(Colour.black, 0.6).css();
    ballinfo_elem.querySelector("#tiertext").textContent = `${String.fromCharCode(160)}${testball.tier}${String.fromCharCode(160)}`;

    let tag_elem = ballinfo_elem.querySelector(".tags");
    while (tag_elem.hasChildNodes())
        tag_elem.firstChild.remove();

    let total_chars = 0;
    testball.tags.forEach((tag, i) => {
        let tag2 = document.createElement("span");
        tag2.classList.add("tag");

        let tag3 = document.createElement("span");

        tag3.textContent = `${String.fromCharCode(160)}${TAGS_INFO[tag].name}${String.fromCharCode(160)}`;
        
        total_chars += tag3.textContent.length;
        
        tag3.style.backgroundColor = "#333";

        let spc = document.createElement("span");
        spc.textContent = String.fromCharCode(160);
        spc.classList.add("spc");

        tag2.append(tag3);
        tag_elem.append(tag2);

        if (i+1 < testball.tags.length)
            tag2.append(spc);
    });

    while (total_chars < 69) {
        let tag2 = document.createElement("span");
        tag2.classList.add("tag");
        tag2.style.visibility = "hidden";
        tag2.textContent = String.fromCharCode(160).repeat(5);
        total_chars += 5;

        tag_elem.append(tag2);
    }

    ballinfo_elem.querySelector(".desc").textContent = testball.description_brief;
    ballinfo_elem.querySelector(".onlevelup .content").textContent = testball.level_description;
    
    ballinfo_elem.querySelector(".awakened .content").textContent = testball.max_level_description;
    if (selected_ball_info[ballid].level >= AWAKEN_LEVEL) {
        ballinfo_elem.querySelector(".awakened").classList.remove("locked");
    } else {
        ballinfo_elem.querySelector(".awakened").classList.add("locked");
    }

    let longest_skins_list = Math.max(...selectable_balls.map(b => b.AVAILABLE_SKINS.length));

    clone = skin_list.querySelector(".example");
    let li = ["Default", ...ball_proto.AVAILABLE_SKINS];
    for (let i=0; i<longest_skins_list+1; i++) {
        let c = li[i];

        let new_o = clone.cloneNode(true);

        if (c) {
            new_o.querySelector(".ballname").textContent = c;

            if (selected_ball_info[ballid].skin == c) {
                new_o.classList.add("selected");
            }

            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            let cs = c;
            new_o.addEventListener("click", _ => {
                if (selected_ball_info[ballid].skin != cs)
                    change_selected_skin(cs);
            })
        } else {
            new_o.classList.remove("example");
            new_o.classList.remove("nodisplay");

            new_o.style.visibility = "hidden";
        }

        skin_list.append(new_o);
    };

    clone = team_list.querySelector(".example");
    default_cols.forEach((col, i) => {
        let col_name = col_names[i];

        let new_o = clone.cloneNode(true);

        new_o.querySelector(".ballname").textContent = col_name;
        new_o.style.color = col.css();

        if (selected_ball_info[ballid].team == i) {
            new_o.classList.add("selected");
            new_o.style.backgroundColor = col.lerp(Colour.black, 0.7).css();
        }

        new_o.classList.remove("example");
        new_o.classList.remove("nodisplay");

        let it = i;
        new_o.addEventListener("click", _ => {
            if (selected_ball_info[ballid].team != it)
                change_selected_team(it);
        })

        team_list.append(new_o);
    })

    // final cleanup (level slider)
    let e2 = elem.querySelector(".slide-supercontainer");
    e2.querySelector("#ball_level_number").textContent = selected_ball_info[ballid].level + 1;
    e2.querySelector("input.slider").value = selected_ball_info[ballid].level + 1;
    // and team for col
    e2.querySelector("input.slider").style.setProperty("--col", default_cols[selected_ball_info[ballid].team].css());
}

function cancel_selection_button() {
    // set value back to saved_prev_state
    // then close as normal
    selected_ball_info[currently_editing_ballid] = saved_prev_state;
    save_selection_button();
}

function save_selection_button() {
    document.querySelector("#sandbox_ball_selector").classList.add("nodisplay");

    refresh_ballinfo(currently_editing_ballid);
}

function change_selected_team(to) {
    let ballid = currently_editing_ballid;

    selected_ball_info[ballid].team = to;

    update_ball_selection_popup();
}

function change_selected_skin(to) {
    let ballid = currently_editing_ballid;

    selected_ball_info[ballid].skin = to;

    update_ball_selection_popup();
}

function change_selected_ball(to) {
    let ballid = currently_editing_ballid;

    selected_ball_info[ballid].saved_skins[selected_ball_info[ballid].name] = selected_ball_info[ballid].skin;

    selected_ball_info[ballid].name = to;
    selected_ball_info[ballid].skin = selected_ball_info[ballid].saved_skins[to] ?? "Default";

    update_ball_selection_popup();
}

function change_selected_category(to) {
    let ballid = currently_editing_ballid;
    
    selected_ball_info[ballid].saved_selections[selected_ball_info[ballid].category] = selected_ball_info[ballid].name;

    selected_ball_info[ballid].category = to;

    // select the first ball from the new list, make sure to reset skin too
    selected_ball_info[ballid].name = selected_ball_info[ballid].saved_selections[to] ?? category_to_balls_list[to][0].ball_name;
    selected_ball_info[ballid].skin = selected_ball_info[ballid].saved_skins[selected_ball_info[ballid].name] ?? "Default";

    update_ball_selection_popup();
}

function update_ball_selection_level() {
    let e = document.querySelector("#ball_level");

    if (currently_editing_ballid) {
        selected_ball_info[currently_editing_ballid].level = parseInt(e.value) - 1;
    }

    update_ball_selection_popup();
}

function refresh_ballinfo(ballid) {
    // set col, bgcol, icon, name, skin, team, enabled status
    let elem = document.querySelector(`#${ballid}_info_container`);
    
    let info = selected_ball_info[ballid];

    let col = default_cols[info.team];

    elem.style.setProperty("--col", col.lerp(Colour.white, 0.5).css());
    elem.style.setProperty("--bgcol", col.lerp(Colour.black, 0.5).css());

    let icon_name = info.name.toLowerCase();
    let spr = entity_sprites.get(`icon_${icon_name}`);
    if (spr) {
        elem.querySelector(".big-ballicon").src = `${FILES_PREFIX}img/icons/${icon_name}.png`;
    } else {
        elem.querySelector(".big-ballicon").src = `${FILES_PREFIX}img/icons/unknown.png`;
    }

    elem.querySelector(".ballname").textContent = info.name;
    elem.querySelector(".skinname").textContent = info.skin;
    // if no skins, disable button
    let proto = selectable_balls.find(b => b.ball_name == info.name);
    if (proto.AVAILABLE_SKINS.length > 0) {
        elem.querySelector(".random-skin").classList.remove("disabled");
    } else {
        elem.querySelector(".random-skin").classList.add("disabled");
    }

    elem.querySelector(".ball-level").textContent = `LV ${info.level + 1}`;

    elem.querySelector(".team").textContent = `${String.fromCharCode(160)}${col_names[info.team]}${String.fromCharCode(160)}`;

    if (info.disabled) {
        elem.classList.add("disabled");
    } else {
        elem.classList.remove("disabled");
    }
}

function setup_info_containers() {
    let clone = document.querySelector("#ballX_info_container.example");
    let parent = document.querySelector(".new-ballselect");

    for (let i=0; i<4; i++) {
        let new_o = clone.cloneNode(true);

        new_o.id = `ball${i+1}_info_container`;

        new_o.classList.remove("example");
        new_o.classList.remove("nodisplay");

        parent.append(new_o);
    }
}

function toggle_disabled_ball(ballid) {
    selected_ball_info[ballid].disabled = !selected_ball_info[ballid].disabled;

    refresh_ballinfo(ballid);
}

function open_ball_edit_menu(ballid) {
    currently_editing_ballid = ballid;
    saved_prev_state = JSON.parse(JSON.stringify(selected_ball_info[currently_editing_ballid]));
	
    update_ball_selection_popup();

    document.querySelector("#sandbox_ball_selector").classList.remove("nodisplay");
}

function randomise_ball_info(ballid, rand_type) {
    // "random-ball", "random-skin", "random-everything"
    let li = [];
    let ball = null;
    let skin = null;
    let category = null;

    let info = selected_ball_info[ballid];

    switch (rand_type) {
        case "random-ball": {
            li = category_to_balls_list[info.category].filter(t => !banned_for_random.some(s => t.ball_name == s.ball_name));

            let newball = null
            while (!newball || newball == info.name)
                newball = random_from_array(li).ball_name;
            
            ball = newball;
            break;
        }
        
        case "random-skin": {
            let proto = selectable_balls.find(b => b.ball_name == info.name);
            li = ["Default", ...proto.AVAILABLE_SKINS];

            let newskin = null
            while (!newskin || newskin == info.skin)
                newskin = random_from_array(li);
            
            skin = newskin;
            break;
        }

        case "random-everything": {
            let cats = Object.keys(CATEGORIES)
            let cat = random_from_array(cats);

            category = cat;

            li = category_to_balls_list[info.category].filter(t => !banned_for_random.some(s => t.ball_name == s.ball_name));

            let newball = null
            while (!newball || newball == info.name)
                newball = random_from_array(li).ball_name;
            
            ball = newball;

            let proto = selectable_balls.find(b => b.ball_name == ball);
            li = ["Default", ...proto.AVAILABLE_SKINS];

            let newskin = li[0];
            if (li.length > 2) {
                while (!newskin || newskin == info.skin)
                    newskin = random_from_array(li);
            }

            skin = newskin;

            break;
        }
    }
    
    let last_edited = currently_editing_ballid;
    currently_editing_ballid = ballid;

    if (category)
        change_selected_category(category)

    if (ball)
        change_selected_ball(ball)

    if (skin)
        change_selected_skin(skin)

    currently_editing_ballid = last_edited;

    refresh_ballinfo(ballid);
}

function refresh_mod_text() {
    let mod_text = document.querySelector("#mod-text").value;

    // get the classes
    let matches = [...mod_text.matchAll(/^class (\w+)(?: extends \w+)? {/gm)].map(t => t[1]);

    document.querySelector("#mod-balls-to-add").innerHTML = matches.map(t => `<span style=color:${t.endsWith("Ball") ? "lime" : "forestgreen"}>${t}</span>`).join(", ");
}

function load_mod() {
    let mod_text = document.querySelector("#mod-text").value;

    let matches = [...mod_text.matchAll(/^class (\w+)(?: extends \w+)? {/gm)].map(t => t[1]);
    
    try {
        window.eval(mod_text.value);

        /*
        let newballs = 0;
        matches.forEach(m => {
            if (m.endsWith("Ball")) {
                window.eval(`selectable_balls.push(${m});`)
                newballs++;
            }
        })
        */

        alert(`It worked (added ${1} new balls from ${matches.length} new classes)`);
    } catch {
        alert("It didn't work")
    }

    document.querySelector("#mod-text").value = "";
    refresh_mod_text()
}

const MAX_SPEED_MULT = 256;
const MIN_SPEED_MULT = 1 / 256;
function mod_simulation_speed(e, by) {
    game_speed_mult *= by;
    game_speed_mult = Math.max(MIN_SPEED_MULT, Math.min(MAX_SPEED_MULT, game_speed_mult));
    update_sim_speed_display();
}

function reset_simulation_speed() {
    game_speed_mult = 1;
    update_sim_speed_display();
}

function toggle_pause_simulation() {
    if (!board)
        return;

    game_paused = !game_paused;
    update_sim_speed_display();
}

let speed_alert_elem = null;
let speed_display_elem = null;
let speed_alert_original = null;
let speed_alert_actual = null;
function update_sim_speed_display(temporary_modifiers=1) {
    let elem = speed_display_elem;
    
    if (!board) {
        elem.textContent = `Paused (Speed x${game_speed_mult * temporary_modifiers})`;
        speed_alert_elem.classList.add("hidden");
        return;
    }

    if (game_paused) {
        elem.textContent = `Paused (Speed x${game_speed_mult * temporary_modifiers})`;
    } else {
        if (game_fps_catchup_modifier != 1) {
            elem.textContent = `Speed x${game_speed_mult * temporary_modifiers} (x${game_fps_catchup_modifier.toFixed(2)})`;
            speed_alert_elem.classList.remove("hidden");
            speed_alert_original.textContent = `${board.expected_fps}fps`;
            speed_alert_actual.textContent = `${fps_current.toFixed(0)}fps`;
        } else {
            elem.textContent = `Speed x${game_speed_mult * temporary_modifiers}`;
            speed_alert_elem.classList.add("hidden");
        }
    }
}

function switch_game_layout(to) {
    let layouts = ["sandbox", "campaign"];

    // hide everything then show only the matching
    layouts.forEach(layout => {
        if (layout == to) {
            document.querySelectorAll(`.${layout}`).forEach(e => e.classList.remove("nodisplay"));
        } else {
            document.querySelectorAll(`.${layout}`).forEach(e => e.classList.add("nodisplay"));
        }
    })
}

let banned_for_random = [
    DummyBall, /* HandBall */
]

let selectable_balls_for_random = main_selectable_balls.filter(ball => !banned_for_random.some(c => c.name == ball.name));

let match_end_timeout = 0;
let render_victory_enabled = true;

let user_interacted_with_fps_select = false;

function setup_match_search_params(num_candidates, tension_threshold, winning_team, survivor_hp_bounds, num_balls_survived, duration, randomise_balls) {
    setup_match_search(num_candidates, {
        tension_threshold: tension_threshold ?? null,
        winning_team: winning_team ?? null,
        survivor_hp_bounds: survivor_hp_bounds ?? null,
        num_balls_survived: num_balls_survived ?? null,
        duration: duration ?? null,
        randomise_balls: randomise_balls ?? []
    });
}

function cancel_match_search() {
    if (board) {
        exit_battle(false);
    }

    searching = false;
    muted = searching;
    last_board = null;
    clearInterval(repeater_interval);
}

function setup_match_search(num_candidates, settings) {
    /*
        {
            winning_team: int
            survivor_hp_bounds: [number, number]
            num_balls_survived: number
            duration: number,
            randomise_balls: [int]
        }
    */
    searching = true;
    muted = searching;
    
    last_board = null;
    search_stored_replays = [];

    // set up a repeater interval to run games until we find one, then copy the replay
    repeater_interval = setInterval(() => {
        if (!board) {
            // does the last board satisfy the conditions?
            let remaining_players = last_board?.remaining_players();
            let winning_team = null;
            let survivors = last_board?.balls.filter(ball => ball.show_stats);
            if (remaining_players?.length == 1) {
                winning_team = remaining_players[0].id;
            }

            let highest_survivor_hp = null;
            let lowest_survivor_hp = null;
            if (survivors?.length > 0) {
                highest_survivor_hp = survivors?.reduce((p, c) => Math.max(p, c.hp), Number.NEGATIVE_INFINITY);
                lowest_survivor_hp = survivors?.reduce((p, c) => Math.min(p, c.hp), Number.POSITIVE_INFINITY);
            }

            let num_balls_survived = survivors?.length;

            let duration = last_board?.duration;

            let dur_lb = null;
            let dur_ub = null;
            if (settings.duration) {
                dur_lb = settings.duration[0] ?? null;
                dur_ub = settings.duration[1] ?? null;
            }

            let lb = null;
            let ub = null;
            if (settings.survivor_hp_bounds) {
                lb = settings.survivor_hp_bounds[0] ?? null;
                ub = settings.survivor_hp_bounds[1] ?? null;
            }

            let tension = last_board?.tension;

            if (
                last_board &&
                (settings.tension_threshold === null || tension >= settings.tension_threshold) &&
                (settings.winning_team === null || winning_team == settings.winning_team) &&
                (ub === null || highest_survivor_hp <= ub) &&
                (lb === null || lowest_survivor_hp >= lb) &&
                (settings.num_balls_survived === null || num_balls_survived <= settings.num_balls_survived) &&
                (dur_ub === null || duration <= dur_ub) &&
                (dur_lb === null || duration >= dur_lb)
            ) {
                // this is valid, so add to candidates list
                search_stored_replays.push({tension: last_board?.tension, replay: last_replay, replay_compressed: last_replay_compressed});
                console.log(`Found one with tension ${last_board?.tension?.toFixed(2)}`);

                if (search_stored_replays.length >= num_candidates) {
                    let replay_picked = search_stored_replays.reduce((p, c) => {
                        return p ? (c.tension > p.tension ? c : p) : c
                    }, null)

                    cancel_match_search();
                    let response = confirm("Found it!\n\nPlay now?");
                    console.log(`Tension: ${replay_picked.tension.toFixed(2)}`);
                    console.log(`Highest survivor hp: ${highest_survivor_hp}`);
                    console.log(replay_picked.replay_compressed);
                    if (response) {
                        load_replay(replay_picked.replay_compressed);
                    }

                    return;
                }
            }

            // apply the randomisation
            let rand = settings.randomise_balls ?? [];
            rand.forEach(index => {
                randomise_ball_info(`ball${index+1}`, "random-ball");
            })

            spawn_selected_balls();
        }
    }, 100);
}

function randomise_ballselect(ballid) {
    let elem = document.querySelector(`select[name='${ballid}']:not(.nodisplay)`)
    
    let list_to_use = [];
    if (elem.classList.contains("main")) {
        list_to_use = main_selectable_balls;
    } else if (elem.classList.contains("additional")) {
        list_to_use = additional_selectable_balls;
    } else {
        list_to_use = powered_selectable_balls;
    }
    elem.value = random_from_array(list_to_use.filter(c => !banned_for_random.some(b => b.name == c.name))).ball_name;
    update_ballinfo(ballid);
}

function kill_confirmation_box() {
    document.querySelector("#sandbox_load_replays").classList.add("nodisplay");
}

function load_readied_replay() {
    load_replay(readied_replay);
    readied_replay = null;
    kill_confirmation_box();
}

function setup_load_menu(replay_as_text) {
    // get the replay info, same thing as with the buttons
    let parent_elem = document.querySelector("#replay_load_balls_list");
    parent_elem.innerHTML = "";  // clear it

    // structure is <span><img> <span>BallName LV X</span></span> like in replay buttons
    let replay = parse_replay(replay_as_text);

    let cols = replay.cols ?? default_cols.map(c => c.data);
    let levels = replay.levels ?? new Array(replay.balls.length).fill(0);

    replay.balls.forEach((ball, index) => {
        let ball_str = replay.balls[index];
        if (!ball_str) {
            return;
        }

        let ball_class = selectable_balls.find(t => t?.name == ball_str);

        let entry_span = document.createElement("span");

        let img_icon = document.createElement("img");
        let name_span = document.createElement("span");

        img_icon.src = `${FILES_PREFIX}img/icons/${ball_class.ball_name.toLowerCase()}.png`;
        let e = false;
        img_icon.addEventListener("error", () => {
            if (!e) {
                img_icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
                e = true;
            }
        });

        name_span.textContent = ` ${(`${ball_class.ball_name} LV ${levels[index]+1} `)} `;
        name_span.style.color = Colour.from_array(cols[index]).css();

        entry_span.appendChild(img_icon);
        entry_span.appendChild(name_span);

        parent_elem.appendChild(entry_span);
    })
}

function is_valid_viewport() {
    // check we have enough content size AND we're not on mobile (or on desktop mode in mobile)
    return (window.innerHeight >= 919 && window.innerWidth >= 640) && (!on_mobile() || window.innerWidth > screen.availWidth);
}

function on_mobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

document.addEventListener("DOMContentLoaded", function() {
    if (window.location.href.includes("description_generator"))
        return;

    get_canvases();

    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    layers.front.canvas.addEventListener("mousemove", function(event) {
        let rect = layers.front.canvas.getBoundingClientRect();
        
        canvas_x = rect.x;
        canvas_y = rect.y;

        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
        
        game_position = mouse_position.mul(screen_to_game_scaling_factor * window.devicePixelRatio);
        //if (mouse_select_pos.x == 0 && mouse_select_pos.y == 0) {
            //mouse_select_pos = mouse_position.copy();
        //}
    });

    layers.front.canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            drag_start_pos = mouse_position.copy();
            lmb_down = true;
        } else if (event.button == 2) {
            rmb_down = true;
        }

        if (board && lmb_down) {
            if (mysterious_powers_enabled) {
                let m_info = MYSTERIOUS_POWER_INFO[current_mysterious_power.name];
                let power = current_mysterious_power.power;

                m_info.effect_click(board, power, game_position);
            }
        }

        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mouseup", function(event) {
        if (event.button == 0) {
            if (drag_start_pos) {
                drag_start_pos = null;
            }
            lmb_down = false;
        } else if (event.button == 2) {
            rmb_down = false;
        }
        /*
        if (event.button == 0) {
            if (drag_start_pos) {
                combat_control.process_dragclick(drag_start_pos, mouse_position, keys_down);

                drag_start_pos = null;
                return;
            }

            combat_control.process_mouseclick(mouse_position.copy(), keys_down);
        } else {
            combat_control.process_rightclick(mouse_position.copy(), keys_down)
        }
        */

        event.preventDefault();
    });

    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        let mysterious_powers_powermod = 0;
        let mysterious_powers_indexmod = 0;

        switch (code) {
            case "Digit1": {
                exit_battle(false);
                break;
            }

            case "Digit2": {
                BALL_RENDERING_METHOD = BALL_RENDERING_METHODS.VECTOR;
                handle_resize();
                get_canvases();
                render_watermark();
                bg_changed = true;
                BALL_DESC_BORDER_SIZE = BALL_RENDERING_METHOD == BALL_RENDERING_METHODS.AERO ? 2 : 1;
                break;
            }

            case "Digit3": {
                BALL_RENDERING_METHOD = BALL_RENDERING_METHODS.RASTER;
                handle_resize();
                get_canvases();
                render_watermark();
                BALL_DESC_BORDER_SIZE = BALL_RENDERING_METHOD == BALL_RENDERING_METHODS.AERO ? 2 : 1;
                bg_changed = true;
                break;
            }

            case "Digit4": {
                BALL_RENDERING_METHOD = BALL_RENDERING_METHODS.AERO;
                handle_resize();
                get_canvases();
                render_watermark();
                BALL_DESC_BORDER_SIZE = BALL_RENDERING_METHOD == BALL_RENDERING_METHODS.AERO ? 2 : 1;
                bg_changed = true;
                break;
            }

            case "Space":
                toggle_pause_simulation();
                break;

            // mysterious powers
            case "ArrowLeft":
            case "KeyA":
                mysterious_powers_indexmod = -1;
                break;

            case "ArrowRight":
            case "KeyD":
                mysterious_powers_indexmod = 1;
                break;
            
            case "ArrowUp":
            case "KeyW":
                mysterious_powers_powermod = 1;
                break;
            
            case "ArrowDown":
            case "KeyS":
                mysterious_powers_powermod = -1;
                break;
        }

        if (mysterious_powers_indexmod && mysterious_powers_enabled && board) {
            let idx = MYSTERIOUS_POWERS_ORDER.findIndex(t => t == current_mysterious_power.name);
            idx = positive_mod(idx + mysterious_powers_indexmod, MYSTERIOUS_POWERS_ORDER.length);

            current_mysterious_power.name = MYSTERIOUS_POWERS_ORDER[idx];
            current_mysterious_power.power = MYSTERIOUS_POWER_INFO[MYSTERIOUS_POWERS_ORDER[idx]].power_start;
        }

        if (mysterious_powers_powermod && mysterious_powers_enabled && board) {
            let info = MYSTERIOUS_POWER_INFO[current_mysterious_power.name];
            current_mysterious_power.power = Math.max(info.power_min, Math.min(info.power_max, current_mysterious_power.power + mysterious_powers_powermod));
        }

        keys_down[code] = true;
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;

        switch (code) {

        }
    });

    let interval = setInterval(function() {
        num_textures_loaded = entity_sprites.keys().reduce((p, c) => {
            let loaded = entity_sprites.get(c).reduce((pt, ct) => {
                return pt + (ct.complete && ct.naturalWidth !== 0 ? 1 : 0);
            }, 0)
            
            return p + loaded;
        }, 0)

        if (document.querySelector("#graphics_loading")) {
            document.querySelector("#graphics_loading").textContent = `${num_textures_loaded}/${num_textures_needed}`;
            if (audios_loaded >= audios_required && num_textures_loaded >= num_textures_needed) {
                document.querySelector("#loading_prompt").classList.add("hidden");
                document.querySelectorAll(".enable-on-full-load").forEach(e => e.disabled = false);
            }
        }

        if (audios_loaded >= audios_required && num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            
            handle_resize();
            game_loop();
        }
    }, 50)

    // set up to try and match the frame speed with the user's fps
    let try_detect_framerate = () => {
        if (audios_loaded < audios_required || num_textures_loaded < num_textures_needed) {
            setTimeout(try_detect_framerate, 1000);
            return;
        }

        if (user_interacted_with_fps_select) {
            console.log(`User interacted - aborting check`);
            return;  // dont fuck with the user if they already touched the page
        }

        let deltas = time_deltas.slice(12);
        if (deltas.length <= 0) {
            console.log("No deltas!");
            return;
        }

        let avg_delta = deltas.reduce((p, c) => p+c, 0) / deltas.length;
        let fps_expected = 1000 / avg_delta;
        let diffs = fps_checks.map(c => Math.abs(c - fps_expected));

        let lowest = Math.min(...diffs);
        let fps_picked = fps_checks[diffs.findIndex(t => t == lowest)];

        if (force_fps) {
            fps_picked = 144;
        }

        if (isNaN(fps_picked)) {
            console.log("Picked FPS is NaN?!");
            return;
        }

        console.log(`Detected FPS: ${fps_expected} - applying "1/${fps_picked}"`);

        document.querySelector("#fps-select").value = `1/${fps_picked}`;
    }

    setTimeout(try_detect_framerate, 500);
    setTimeout(try_detect_framerate, 750);
    
    setTimeout(try_detect_framerate, 1000);
    setTimeout(try_detect_framerate, 1250);

    window.addEventListener("resize", handle_resize);

    // set up options
    let options_elems = document.querySelectorAll("select.sandbox-ball-select.main");
    options_elems.forEach(elem => {
        elem.options.add(new Option("None"))
        main_selectable_balls.forEach(ball => elem.options.add(new Option(ball.ball_name)));

        elem.addEventListener("click", e => {
            if (!keys_down["ControlLeft"]) {
                return;
            }

            let name = elem.name;

            let showing = document.querySelectorAll(`.sandbox-ball-select[name='${name}'].additional`);
            let hidden = document.querySelectorAll(`.sandbox-ball-select[name='${name}']:is(.main, .powered)`);

            showing.forEach(e => e.classList.remove("nodisplay"));
            hidden.forEach(e => e.classList.add("nodisplay"));
        })
    });

    let additional_options_elems = document.querySelectorAll("select.sandbox-ball-select.additional");
    additional_options_elems.forEach(elem => {
        elem.options.add(new Option("None"))
        additional_selectable_balls.forEach(ball => elem.options.add(new Option(ball.ball_name)));

        elem.addEventListener("click", e => {
            if (!keys_down["ControlLeft"]) {
                return;
            }

            let name = elem.name;

            let showing = document.querySelectorAll(`.sandbox-ball-select[name='${name}'].powered`);
            let hidden = document.querySelectorAll(`.sandbox-ball-select[name='${name}']:is(.main, .additional)`);

            showing.forEach(e => e.classList.remove("nodisplay"));
            hidden.forEach(e => e.classList.add("nodisplay"));
        })
    });

    let powered_options_elems = document.querySelectorAll("select.sandbox-ball-select.powered");
    powered_options_elems.forEach(elem => {
        elem.options.add(new Option("None"))
        powered_selectable_balls.forEach(ball => elem.options.add(new Option(ball.ball_name)));

        elem.addEventListener("click", e => {
            if (!keys_down["ControlLeft"]) {
                return;
            }

            let name = elem.name;

            let showing = document.querySelectorAll(`.sandbox-ball-select[name='${name}'].main`);
            let hidden = document.querySelectorAll(`.sandbox-ball-select[name='${name}']:is(.additional, .powered)`);

            showing.forEach(e => e.classList.remove("nodisplay"));
            hidden.forEach(e => e.classList.add("nodisplay"));
        })
    });

    let teams_elems = document.querySelectorAll("select.sandbox-team-select");
    teams_elems.forEach((elem, elem_idx) => {
        default_cols.forEach((col, index) => {
            let option = new Option(col_names[index]);
            option.style.color = col.css();

            elem.options.add(option);
        })

        elem.selectedIndex = elem_idx;
    })

    randomise_ballselect('ball1');
    randomise_ballselect('ball2');

    // document.querySelector("select[name='ball1']").value = "Grenade";
    // document.querySelector("select[name='ball2']").value = "Grenade";
    // document.querySelector("select[name='ball3']").value = "Grenade";
    // document.querySelector("select[name='ball4']").value = "Grenade";


    update_ballinfo('ball1');
    update_ballinfo('ball2');
    update_ballinfo('ball3');
    update_ballinfo('ball4');

    if (winrate_tracking) {
        displayelement = document.querySelector(".spacer p");
        document.querySelector(".spacer").classList.remove("nodisplay");
        document.querySelector(".spacer").classList.remove("hidden");

        document.querySelector(".sandbox.leftpanel").classList.add("nodisplay"); - 1

        selected_ball_info.ball1.level = ball1_start_level - 1;
        selected_ball_info.ball2.level = ball2_start_level - 1;

        repeater_interval = setInterval(() => {
            if (!board) {
                // increase ball2 by 1. if this would make it > selectable_balls length,
                // increase ball1 by 1 (unless force_ball1 is enabled)
                let increment = true;

                while (increment) {
                    ball2_index++;
                    if (ball2_index >= selectable_balls_for_random.length) {
                        ball2_index = 0;
                        ball1_index = (ball1_index + 1) % selectable_balls_for_random.length;
                    }

                    if (force_ball1) {
                        ball1_index = selectable_balls_for_random.findIndex(b => b.name == force_ball1.name);
                    }

                    if (ball1_index != ball2_index) {
                        increment = false;
                    }
                }

                selected_ball_info.ball1.name = selectable_balls_for_random[ball1_index].ball_name;
                selected_ball_info.ball2.name = selectable_balls_for_random[ball2_index].ball_name;

                spawn_selected_balls();
            }
        }, 100);
    }

    speed_alert_elem = document.querySelector("#speed_alert_main");
    speed_display_elem = document.querySelector("#speed_display");
    speed_alert_original = document.querySelector("#fps_original");
    speed_alert_actual = document.querySelector("#fps_user");

    update_sim_speed_display();

    setup_info_containers();

    randomise_ball_info("ball1", "random-ball");
    randomise_ball_info("ball2", "random-ball");

    for (let i=1; i<=4; i++) {
        refresh_ballinfo(`ball${i}`);
    }

    document.querySelectorAll(".disable-button").forEach(e => e.addEventListener("click", ev => {
        let ballid = ev.target.closest(".info-container").id.split("_")[0];

        toggle_disabled_ball(ballid);
    }));

    document.querySelectorAll(".edit-button").forEach(e => e.addEventListener("click", ev => {
        let ballid = ev.target.closest(".info-container").id.split("_")[0];

        open_ball_edit_menu(ballid);
    }));

    document.querySelectorAll(".random-button").forEach(e => e.addEventListener("click", ev => {
        let ballid = ev.target.closest(".info-container").id.split("_")[0];
        let random_type = [...ev.target.classList].find(t => !t.endsWith("button"));

        randomise_ball_info(ballid, random_type);
    }));

    // document.querySelector("select[name='ball1']").value = "WandBall";

    // setTimeout(() => load_replay("eyJmcmFtZXNwZWVkIjoxNDQsImJhbGxzIjpbIk5lZWRsZUJhbGwiLCJOZWVkbGVCYWxsIiwiQ2hha3JhbUJhbGwiLCJDaGFrcmFtQmFsbCJdLCJsZXZlbHMiOlswLDAsMCwwXSwic2VlZCI6IjMzMjYxMTk3ODUxNjA1MDUifQ=="), 1000)

    // check querystring for a replay parameter - if it's present, load the replay instantly
    let search_params = new URLSearchParams(window.location.search);
    let replay = search_params.get("r");
    if (replay) {
        try {
            readied_replay = replay;
            setup_load_menu(readied_replay);
            document.querySelector("#sandbox_load_replays").classList.remove("nodisplay");
        } catch (e) {
            alert(`There was a problem parsing the replay!!\n\nError:\n${e}`);
        }
    }

    // load stored replays
    let replay_history_str = localStorage.getItem("balls_replay_history");
    try {
        replay_history = JSON.parse(replay_history_str);
        update_replays_tab(true);
    } catch {
        console.log("Our replays fucked up. Its over");
        replay_history = [];
    }

    if (window.location.href.includes("old_versions")) {
        let elem = document.querySelector("#normal-bottombar a.left-text")
    
        elem.classList.add("red");
        elem.href = FILES_PREFIX + "index.html";
        elem.textContent = elem.textContent.split("|")[0] + ` you are on an old version (${GAME_VERSION})! click here to go to the latest version!`;
    }
    
    switch_game_layout("sandbox");

    if (window.location.href.startsWith("file://")) {
        document.querySelector("#skip_intro_checkbox").checked = true;
    }

    document.querySelector("#mysterious_powers_checkbox").addEventListener("change", e => {
        if (e.target.checked) {
            document.querySelectorAll(".mysterious-powers-warning").forEach(e => e.classList.remove("faded"));
        } else {
            document.querySelectorAll(".mysterious-powers-warning").forEach(e => e.classList.add("faded"));
        }
    })

    let e = document.querySelectorAll(".mysterious-powers-warning");

    e.forEach(el => {
        el.innerHTML = `<span>${[...el.textContent].join("</span><span>")}</span>`;
    });
})

// entity_sprites late setup
selectable_balls_for_random.map(b => b.ball_name.toLowerCase()).forEach(n => {
    let t = new Image(128, 128);
    let ts = [];

    t.src = `${FILES_PREFIX}img/icons/${n}.png`;
    t.style.imageRendering = "pixelated";

    num_textures_needed++;
    t.addEventListener("load", function() {
        num_textures_loaded++;
    })

    let e = false;
    t.addEventListener("error", () => {
        if (!e) {
            t.src = `${FILES_PREFIX}img/icons/unknown.png`;
            e = true;
        }
    });

    ts.push(t);
    
    entity_sprites.set(`icon_${n}`, ts);
})


// TODO make levelling information exist somewhere - probably need to think about that when we come to RPG theming really

let searching = false;
let winrate_tracking = searching;

let force_fps = null;
if (winrate_tracking)
    force_fps = 144;

let muted = searching;

let repeater_interval = null;
let force_ball1 = RosaryBall;

let displayelement = null;

let readable_table = false;

let ball1_index = 0;
if (force_ball1) {
    ball1_index = selectable_balls_for_random.findIndex(b => b.name == force_ball1.name);
}

let ball2_index = 0;

let ball1_start_level = 1;
let ball2_start_level = 1;

let win_matrix = [];
selectable_balls_for_random.forEach(_ => win_matrix.push(new Array(selectable_balls_for_random.length).fill(0)));
let start_balls = [];
