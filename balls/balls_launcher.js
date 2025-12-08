let board = null;
let last_replay = "";
let fps_checks = [
    60, 90, 120, 144, 240, 480
]

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

function save_replay_button() {
    // copy the replay to the clipboard
    navigator.clipboard.writeText(last_replay).then(function() {
		console.log('Copied replay to clipboard!');
		
		document.getElementById("save_replay_button").textContent = "Copied!"
		document.getElementById("save_replay_button").classList.add("green");
		
		setTimeout(function() {
			document.getElementById("save_replay_button").textContent = "Copy last game's replay"
		document.getElementById("save_replay_button").classList.remove("green");
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

function exit_battle(save_replay=true) {
    if (!board)
        return;

    if (board.forced_time_deltas != 0 && save_replay) {
        // we might have a replay
        // replay needs:
        // - framespeed
        // - starting balls + order
        // - random seed
        // that's it!
        // TODO also save colour and start positions...
        let replay = {
            framespeed: board.forced_time_deltas && Math.round(1000 / board.forced_time_deltas),
            balls: board.starting_balls,
            levels: board.starting_levels,
            seed: board.random_seed
        }

        last_replay = btoa(JSON.stringify(replay));
    }

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
}

function load_replay(replay_as_text) {
    let replay = JSON.parse(atob(replay_as_text));

    if (!(replay.framespeed && replay.seed && replay.balls)) {
        throw Error("Replay doesn't have all necessary fields!");
    }

    let framespeed = replay.framespeed;
    let seed = replay.seed;

    // hardcoded... for now
    let cols = [Colour.red, Colour.yellow, Colour.green, Colour.cyan];
    let positions = [
        new Vector2(512*4, 512*4),
        new Vector2(512*12, 512*12),
        new Vector2(512*5, 512*11),
        new Vector2(512*11, 512*5),
    ]

    let ball_classes = replay.balls.map(b => {
        return selectable_balls.find(t => t.name == b);
    })

    let ball_levels = replay.levels ?? [0, 0, 0, 0];

    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels
    );
}

function spawn_selected_balls() {
    let framespeed = [...fps_checks, 0][
        document.querySelector("#fps-select").selectedIndex
    ];
    
    let seed = document.querySelector("#sandbox-random-seed").value || Math.random().toString().slice(2);

    let cols = [Colour.red, Colour.yellow, Colour.green, Colour.cyan];
    let positions = [
        new Vector2(512*4, 512*4),
        new Vector2(512*12, 512*12),
        new Vector2(512*5, 512*11),
        new Vector2(512*11, 512*5),
    ]

    let ball_classes = [];
    for (let i=0; i<cols.length; i++) {
        let elem = document.querySelector(`select[name='ball${i+1}']`);
        let ball_proto = selectable_balls.find(t => t.name == elem?.value);

        ball_classes.push(ball_proto);
    }

    let ball_levels = [];
    for (let i=0; i<cols.length; i++) {
        let lvl = document.querySelector(`#ball${i+1}_level`).value - 1;
        ball_levels.push(lvl);
    }

    start_game(
        framespeed, seed,
        cols, positions,
        ball_classes, ball_levels
    );
}

function start_game(framespeed, seed, cols, positions, ball_classes, ball_levels) {
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
                    1, 512, col, null, null, {
                        id: index,
                        stats: {
                            damage_bonus: 1,
                            defense_bonus: 1,
                            ailment_resistance: 1,
                        }
                    }, lvl, index % 2 == 1
                );

                ball.randomise_weapon_rotations();

                board.spawn_ball(ball, positions[index])
                balls.push(ball_proto);
            }
        })

        start_balls = balls;

        board.starting_balls = ball_classes.map(c => c?.name);
        board.starting_levels = ball_levels;

        board.balls.forEach(ball => ball.add_velocity(
            random_on_circle(
                random_float(512 * 6, 512 * 12, board.random),
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

        board.hitstop_time = winrate_tracking ? 0 : 0.5;
    }, 0);

    enter_battle();
}

function update_ballinfo(ballid) {
    let ball_classname = document.querySelector(`select[name='${ballid}']`).value;
    let ball_proto = selectable_balls.find(t => t.name == ball_classname);

    let info_elem = document.querySelector(`#${ballid}_info span`);
    let info_a_elem = document.querySelector(`#${ballid}_a_info span`);

    if (ball_proto) {
        let testball = new ball_proto(
            {random: Math.random}, 1, 512, Colour.white, null, null, {}, 1, false
        );

        info_elem.textContent = testball.description_brief;
        info_a_elem.textContent = testball.max_level_description;
    } else {
        info_elem.textContent = "-";
        info_a_elem.textContent = "-";
    }
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
    if (!board)
        return;

    game_speed_mult *= by;
    game_speed_mult = Math.max(MIN_SPEED_MULT, Math.min(MAX_SPEED_MULT, game_speed_mult));
    update_sim_speed_display();
}

function reset_simulation_speed() {
    if (!board)
        return;

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
        elem.textContent = "- Paused -";
        speed_alert_elem.classList.add("hidden");
        return;
    }

    if (game_paused) {
        elem.textContent = "- Paused -";
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

let selectable_balls = [
    DummyBall,
    HammerBall, SordBall, DaggerBall,
    BowBall, MagnumBall, NeedleBall,
    RailgunBall, PotionBall, GrenadeBall,
    GlassBall, HandBall, ChakramBall,
    WandBall
]

let banned_for_random = [
    DummyBall, /* HandBall */
]

let selectable_balls_for_random = selectable_balls.filter(ball => !banned_for_random.some(c => c.name == ball.name));

let match_end_timeout = 0;
let render_victory_enabled = true;

let user_interacted_with_fps_select = false;

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

    handle_resize();

    let interval = setInterval(function() {
        if (num_textures_loaded >= num_textures_needed) {
            document.getElementById("game-container").style.display = "";
            clearInterval(interval);
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
    let options_elems = document.querySelectorAll("select.sandbox-ball-select");
    options_elems.forEach(elem => {
        elem.options.add(new Option("None"))
        selectable_balls.forEach(ball => elem.options.add(new Option(ball.name)));
    });

    document.querySelector("select[name='ball1']").value = random_from_array(selectable_balls_for_random).name;
    document.querySelector("select[name='ball2']").value = random_from_array(selectable_balls_for_random.filter(t => t.name != document.querySelector("select[name='ball1']").value)).name;

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

    // document.querySelector("select[name='ball1']").value = "WandBall";

    // setTimeout(() => load_replay("eyJmcmFtZXNwZWVkIjoxNDQsImJhbGxzIjpbIk5lZWRsZUJhbGwiLCJOZWVkbGVCYWxsIiwiQ2hha3JhbUJhbGwiLCJDaGFrcmFtQmFsbCJdLCJsZXZlbHMiOlswLDAsMCwwXSwic2VlZCI6IjMzMjYxMTk3ODUxNjA1MDUifQ=="), 1000)
})

// TODO make levelling information exist somewhere - probably need to think about that when we come to RPG theming really

let winrate_tracking = false;
let muted = false;

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
