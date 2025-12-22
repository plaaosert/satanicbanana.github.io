const BASE_URL = "https://plaao.net/balls";

let board = null;
let last_replay = "";
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
    new Vector2(512*4, 512*4),
    new Vector2(512*12, 512*12),
    new Vector2(512*5, 512*11),
    new Vector2(512*11, 512*5),
]

let last_winner = null;
let last_board = null;
let search_stored_replays = [];

let replay_history = [];
const REPLAY_HISTORY_SIZE = 50;

let replaying = false;

let readied_replay = null;

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
        `${BASE_URL}?r=${override_text ? override_text : last_replay}`
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
        img_icon.addEventListener("error", () => { 
            img_icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
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
        save_replay_button(btoa(JSON.stringify(replay_entry.replay)), copy_button, copy_button.textContent);
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

function exit_battle(save_replay=true) {
    if (!board)
        return;

    if (!replaying && board.forced_time_deltas != 0 && save_replay) {
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
        }

        last_replay = btoa(JSON.stringify(replay));

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

    game_paused = true;
    update_sim_speed_display();
}

function enter_battle() {
    Object.keys(layers).forEach(k => layers[k].ctx.clearRect(0, 0, layers[k].canvas.width, layers[k].canvas.height));

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    document.querySelector(".game-container").classList.add("popin");
    document.querySelector(".game-container").classList.remove("popout");

    game_paused = false;
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

    replaying = true;
    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels,
        players, skins
    );
}

function spawn_selected_balls() {
    let framespeed = [...fps_checks, 0][
        document.querySelector("#fps-select").selectedIndex
    ];
    
    let seed = document.querySelector("#sandbox-random-seed").value || Math.random().toString().slice(2);
    
    let positions = default_positions;

    let cols_indexes = [];
    for (let i=0; i<positions.length; i++) {
        let col_team = document.querySelector(`select[name='ball${i+1}_team']`).selectedIndex;
        cols_indexes.push(col_team);
    }

    let cols = cols_indexes.map(c => default_cols[c]);

    let ball_classes = [];
    for (let i=0; i<cols.length; i++) {
        let elem = document.querySelector(`select[name='ball${i+1}']:not(.nodisplay)`);
        let ball_proto = selectable_balls.find(t => t.ball_name == elem?.value);

        ball_classes.push(ball_proto);
    }

    let ball_levels = [];
    for (let i=0; i<cols.length; i++) {
        let lvl = document.querySelector(`#ball${i+1}_level`).value - 1;
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
        let skin = document.querySelector(`select[name='ball${i+1}_skin']`).value;
        skins.push(skin);
    }

    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels,
        players, skins
    );
}

function start_game(framespeed, seed, cols, positions, ball_classes, ball_levels, players, skins) {
    setTimeout(() => {
        board = new Board(new Vector2(512 * 16, 512 * 16));

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
            match_end_timeout = 8 * 1000;
            render_victory_enabled = true;
        }

        fullpause_timeout = searching ? 0 : 1;
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
                (settings.duration === null || duration <= settings.duration)
            ) {
                // this is valid, so add to candidates list
                search_stored_replays.push({tension: last_board?.tension, replay: last_replay});
                console.log(`Found one with tension ${last_board?.tension?.toFixed(2)}`);

                if (search_stored_replays.length >= num_candidates) {
                    let replay_picked = search_stored_replays.reduce((p, c) => {
                        return p ? (c.tension > p.tension ? c : p) : c
                    }, null)

                    cancel_match_search();
                    let response = confirm("Found it!\n\nPlay now?");
                    console.log(`Tension: ${replay_picked.tension.toFixed(2)}`);
                    console.log(replay_picked.replay);
                    if (response) {
                        load_replay(replay_picked.replay);
                    }

                    return;
                }
            }

            // apply the randomisation
            let rand = settings.randomise_balls ?? [];
            rand.forEach(index => {
                randomise_ballselect(`ball${index+1}`);
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
    elem.value = random_from_array(list_to_use).ball_name;
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
        img_icon.addEventListener("error", () => { 
            img_icon.src = `${FILES_PREFIX}img/icons/unknown.png`;
        });

        name_span.textContent = ` ${(`${ball_class.ball_name} LV ${replay.levels[index]+1} `)} `;
        name_span.style.color = Colour.from_array(replay.cols[index]).css();

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
    get_canvases();

    layers.front.canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    layers.front.canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);
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

        switch (code) {
            case "Digit1": {
                exit_battle(false);
                break;
            }
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
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
            
            handle_resize();
            game_loop();
        }
    }, 50)

    // set up to try and match the frame speed with the user's fps
    let try_detect_framerate = () => {
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

    setTimeout(try_detect_framerate, 200);
    setTimeout(try_detect_framerate, 400);
    setTimeout(try_detect_framerate, 600);

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

    // document.querySelector("select[name='ball1']").value = "DummyBall";
    // document.querySelector("select[name='ball2']").value = "SordBall";

    update_ballinfo('ball1');
    update_ballinfo('ball2');
    update_ballinfo('ball3');
    update_ballinfo('ball4');

    if (winrate_tracking) {
        displayelement = document.querySelector(".spacer p");
        document.querySelector(".spacer").classList.remove("nodisplay");
        document.querySelector(".spacer").classList.remove("hidden");

        document.querySelector("#ball1_level").value = ball1_start_level;
        document.querySelector("#ball2_level").value = ball2_start_level;

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

                document.querySelector("select[name='ball1']").value = selectable_balls_for_random[ball1_index].name;
                document.querySelector("select[name='ball2']").value = selectable_balls_for_random[ball2_index].name;

                update_ballinfo('ball1');
                update_ballinfo('ball2');

                spawn_selected_balls();
            }
        }, 100);
    }

    speed_alert_elem = document.querySelector("#speed_alert_main");
    speed_display_elem = document.querySelector("#speed_display");
    speed_alert_original = document.querySelector("#fps_original");
    speed_alert_actual = document.querySelector("#fps_user");

    update_sim_speed_display();

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
})

// TODO make levelling information exist somewhere - probably need to think about that when we come to RPG theming really

let searching = false;
let winrate_tracking = searching;

let force_fps = null;
if (winrate_tracking)
    force_fps = 144;

let muted = searching;

let repeater_interval = null;
let force_ball1 = null;

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
