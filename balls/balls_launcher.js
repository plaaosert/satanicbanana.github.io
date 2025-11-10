let board = null;

document.addEventListener("DOMContentLoaded", async function() {
    await load_audio();
});

function spawn_testing_balls() {
    board = new Board(new Vector2(512 * 16, 512 * 16));
    // board.spawn_ball(new SordBall(1, 512, Colour.red, null, null, {id: 0}), new Vector2(512*4, 512*4));
    // board.spawn_ball(new HammerBall(1, 512, Colour.yellow, null, null, {id: 1}, true), new Vector2(512*12, 512*12));
    board.spawn_ball(new MagnumBall(1, 512, Colour.green, null, null, {id: 2}), new Vector2(512*5, 512*11));
    board.spawn_ball(new SordBall(1, 512, Colour.cyan, null, null, {id: 3}, true), new Vector2(512*11, 512*5));

    board.balls[0].add_velocity(random_on_circle(random_float(0, 512 * 10)));
    board.balls[1]?.add_velocity(random_on_circle(random_float(0, 512 * 10)));
    board.balls[2]?.add_velocity(random_on_circle(random_float(0, 512 * 10)));
    board.balls[3]?.add_velocity(random_on_circle(random_float(0, 512 * 10)));
}

function exit_battle() {
    board = null;
    document.querySelector(".game-container").classList.add("popout");
    document.querySelector(".game-container").classList.remove("popin");
}

function enter_battle() {
    Object.keys(layers).forEach(k => layers[k].ctx.clearRect(0, 0, layers[k].canvas.width, layers[k].canvas.height));

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    document.querySelector(".game-container").classList.add("popin");
    document.querySelector(".game-container").classList.remove("popout");
}

function spawn_selected_balls() {
    setTimeout(() => {
        board = new Board(new Vector2(512 * 16, 512 * 16));
        let cols = [Colour.red, Colour.yellow, Colour.green, Colour.cyan];
        let positions = [
            new Vector2(512*4, 512*4),
            new Vector2(512*12, 512*12),
            new Vector2(512*5, 512*11),
            new Vector2(512*11, 512*5),
        ]

        let balls = [];

        cols.forEach((col, index) => {
            let elem = document.querySelector(`select[name='ball${index+1}']`);
            if (elem.value != "None") {
                let ball_proto = selectable_balls.find(t => t.name == elem.value);
                if (ball_proto) {
                    let lvl = document.querySelector(`#ball${index+1}_check`).checked ? 7 : 0;

                    let ball = new ball_proto(
                        1, 512, col, null, null, {id: index}, lvl, index % 2 == 1
                    );

                    ball.randomise_weapon_rotations();

                    board.spawn_ball(ball, positions[index])
                    balls.push(ball_proto);
                }
            }
        })

        start_balls = balls;

        board.balls.forEach(ball => ball.add_velocity(random_on_circle(random_float(512 * 6, 512 * 12))));
    
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

        board.hitstop_time = 0.5;
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
            1, 512, Colour.white, null, null, {}, 1, false
        );

        info_elem.textContent = testball.description_brief;
        info_a_elem.textContent = testball.max_level_description;
    } else {
        info_elem.textContent = "-";
        info_a_elem.textContent = "-";
    }
}

function update_awaken_showhide(ballid) {
    if (document.querySelector(`#${ballid}_check`).checked) {
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

let selectable_balls = [
    DummyBall,
    HammerBall, SordBall, DaggerBall,
    BowBall, MagnumBall, NeedleBall,
    RailgunBall, PotionBall, GrenadeBall,
    GlassBall
]

let selectable_balls_for_random = selectable_balls.filter(ball => ball.name != "DummyBall");

let match_end_timeout = 0;
let render_victory_enabled = true;

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
                exit_battle();
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
    }, 200)

    window.addEventListener("resize", handle_resize);

    // set up options
    let options_elems = document.querySelectorAll("select");
    options_elems.forEach(elem => {
        elem.options.add(new Option("None"))
        selectable_balls.forEach(ball => elem.options.add(new Option(ball.name)));
    });

    document.querySelector("select[name='ball1']").value = random_from_array(selectable_balls_for_random).name;
    document.querySelector("select[name='ball2']").value = random_from_array(selectable_balls_for_random.filter(t => t.name != document.querySelector("select[name='ball1']").value)).name;

    // document.querySelector("select[name='ball1']").value = "SordBall";
    // document.querySelector("select[name='ball2']").value = "DummyBall";

    update_ballinfo('ball1');
    update_ballinfo('ball2');
    update_ballinfo('ball3');
    update_ballinfo('ball4');

    if (winrate_tracking) {
        repeater_interval = setInterval(() => {
            if (!board) {
                document.querySelector("select[name='ball1']").value = random_from_array(selectable_balls_for_random).name;
                if (force_ball1) {
                    document.querySelector("select[name='ball1']").value = force_ball1.name;
                }

                document.querySelector("select[name='ball2']").value = random_from_array(selectable_balls_for_random.filter(t => t.name != document.querySelector("select[name='ball1']").value)).name;

                update_ballinfo('ball1');
                update_ballinfo('ball2');

                spawn_selected_balls();
            }
        }, 100);
    }
})

// TODO make levelling information exist somewhere - probably need to think about that when we come to RPG theming really

let winrate_tracking = false;
let repeater_interval = null;
let force_ball1 = null;
let win_matrix = [];
selectable_balls_for_random.forEach(_ => win_matrix.push(new Array(selectable_balls_for_random.length).fill(0)));
let start_balls = [];
