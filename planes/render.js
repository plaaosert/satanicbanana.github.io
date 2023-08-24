const layer_names = [
    "front",
    "debug_front",
    "debug_back",
    "ui1",
    "ui2",
    "fg1",
    "fg2",
    "fg3",
    "bg1",
    "bg2",
    "bg3"
]

let imgs = {};

const fps = 60;

const squadron_icon = new Image(480, 480);
squadron_icon.src = "img/plane.png";

const squadron_icon_enemy = new Image(480, 480);
squadron_icon_enemy.src = "img/plane_enemy.png";

const airbase_icon = new Image(500, 500);
airbase_icon.src = "img/airbase.png";

const airbase_icon_enemy = new Image(500, 500);
airbase_icon_enemy.src = "img/airbase_enemy.png";

const select_icon = new Image(24, 24);
select_icon.src = "img/select.png";

const line = new Image(5, 1);
line.src = "img/line.png";

const worldmap = new Image(4400, 2200);
worldmap.src = "img/map_clean.png";

let layers = {};
let keys_down = {};

let drag_start_pos = null;

//let zoom_scale = 0.02;  // km per pixel

let canvas_width = 256;
let canvas_height = 256;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);
//let mouse_select_pos = new Vector2(0, 0);

let wtsp = null;
let stwp = null;
let canvas_zoom_factor = null;

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    })
}

function handle_resize(event) {
    canvas_height = Math.round(vh(90));
    canvas_width = Math.round((canvas_height * 16) / 9);

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        ctx.canvas.width = canvas_width;
        ctx.canvas.height = canvas_height;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    layers.bg3.ctx.fillStyle = "#010"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function screen_to_world_pos_fn() {
    // with zoom level 10 and offset 5000,5000 on a 10000,10000 world,
    // the max_rect is (4500,4500 to 5500,5500), found by adding the offset then expanding it in both directions to reach (1000,1000) (world_size/zoom_scale)
    // the canvas zoom factor needs to be found, which is:
    // max(canvas_width / (max_rect.br.x - max_rect.tl.x), ...same with y)
    // then, the position of a rendered squadron in the world is given by:
    // squadron.position.div(canvas_zoom_factor).add(max_rect.tl);
    let expansion = new Vector2(canvas_width, canvas_height).div(2).mul(combat.zoom_scale);
    let max_rect = {tl: combat.zoom_offset.sub(expansion), br: combat.zoom_offset.add(expansion)};
    let canvas_zoom_factor = 1/combat.zoom_scale;

    return function(pos) {
        return pos.div(canvas_zoom_factor).add(max_rect.tl);
    }

    /*sub
    let expansion = world_size.div(combat.zoom_scale).div(2);
    let max_rect = {tl: combat.zoom_offset.sub(expansion), br: combat.zoom_offset.add(expansion)};
    let canvas_zoom_factors = [canvas_width / (max_rect.br.x - max_rect.tl.x), canvas_height / (max_rect.br.y - max_rect.tl.y)];
    let canvas_zoom_factor = Math.min(...canvas_zoom_factors);

    // the canvas needs to be realigned as it is rectangular, not square
    // (so the position needs to be adjusted by an amount based on the difference between the x zoom and the y zoom)
    // TODO ensure this works on portrait canvases too
    let xy_zoom_diff = canvas_width - canvas_height;

    return function(pos) {
        return pos.sub(new Vector2(xy_zoom_diff/2, 0)).div(canvas_zoom_factor).add(max_rect.tl);
    }
    */
}

function screen_to_world_pos(pos) {
    return screen_to_world_pos_fn()(pos);
}

function world_to_screen_pos_fn() {
    // with zoom level 10 and offset 5000,5000 on a 10000,10000 world,
    // the max_rect is (4500,4500 to 5500,5500), found by adding the offset then expanding it in both directions to reach (1000,1000) (world_size/zoom_scale)
    // the canvas zoom factor needs to be found, which is:
    // max(canvas_width / (max_rect.br.x - max_rect.tl.x), ...same with y)
    // then, the position of a squadron is given by:
    // squadron.position.sub(max_rect.tl).mul(canvas_zoom_factor)
    
    // TODO
    // zooming doesn't work right when changing the world size to a non-square value.
    // this is because max_rect is tied to the size of the world, not the canvas. therefore:
    // simplify all of this by reworking zoom to have the zoom value be km/pixel
    // so zoom_scale=1 means every pixel on the canvas is 1km.
    // then, we can get the rect using that calculation and get the canvas zoom factor using the same method
    // in fact, the canvas zoom factor IS (the reciprocal of) zoom_scale if we simplify it to this.
    let expansion = new Vector2(canvas_width, canvas_height).div(2).mul(combat.zoom_scale);
    let max_rect = {tl: combat.zoom_offset.sub(expansion), br: combat.zoom_offset.add(expansion)};
    let canvas_zoom_factor = 1/combat.zoom_scale;

    return function(pos) {
        return pos.sub(max_rect.tl).mul(canvas_zoom_factor);
    }

    /*
    let expansion = world_size.div(combat.zoom_scale).div(2);
    let max_rect = {tl: combat.zoom_offset.sub(expansion), br: combat.zoom_offset.add(expansion)};
    let canvas_zoom_factors = [canvas_width / (max_rect.br.x - max_rect.tl.x), canvas_height / (max_rect.br.y - max_rect.tl.y)];
    let canvas_zoom_factor = Math.min(...canvas_zoom_factors);

    // the canvas needs to be realigned as it is rectangular, not square
    // (so the position needs to be adjusted by an amount based on the difference between the x zoom and the y zoom)
    // TODO ensure this works on portrait canvases too
    let xy_zoom_diff = canvas_width - canvas_height;

    return function(pos) {
        return pos.sub(max_rect.tl).mul(canvas_zoom_factor).add(new Vector2(xy_zoom_diff/2, 0));
    }
    */
}

function world_to_screen_pos(pos) {
    return world_to_screen_pos_fn()(pos);
}

function refresh_wtsp_stwp() {
    wtsp = world_to_screen_pos_fn();
    stwp = screen_to_world_pos_fn();

    canvas_zoom_factor = 1/combat.zoom_scale;

    /*
    let expansion = world_size.div(combat.zoom_scale).div(2);
    let max_rect = {tl: combat.zoom_offset.sub(expansion), br: combat.zoom_offset.add(expansion)};
    let canvas_zoom_factors = [canvas_width / (max_rect.br.x - max_rect.tl.x), canvas_height / (max_rect.br.y - max_rect.tl.y)];
    canvas_zoom_factor = Math.min(...canvas_zoom_factors);
    */
}

function render_diagnostics(combat, combat_control) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16, "#fff", "MS Gothic", 12
    )

    let frame_time_splits = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100).toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28, "#fff", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw", 10+(6*(1+13)), 28, "#0f0", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc", 10+(6*(1+2+13+6+4)), 28, "#f00", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait", 10+(6*(1+2+2+13+6+4+6+4)), 28, "#666", "MS Gothic", 12
    )

    write_text(
        layers.debug_front.ctx, `avg time delta: ${Math.round(time_deltas.reduce((a,b) => a+b, 0) / (time_deltas.length+Number.EPSILON) * 100) / 100}`, 10, 40, "#fff", "MS Gothic", 12
    )
}

function render_worldmap(combat, combat_control) {
    layers.bg2.ctx.clearRect(0, 0, canvas_width, canvas_height);  // worldmap

    let world_origin_pos = wtsp(world_size.div(2));
    let world_stretch_pos = world_size.mul(canvas_zoom_factor);

    //console.log(world_origin_pos, world_stretch_pos);

    write_rotated_image(
        layers.bg2.canvas,
        layers.bg2.ctx,
        world_origin_pos.x,
        world_origin_pos.y,
        worldmap,
        world_stretch_pos.x, world_stretch_pos.y,
        0
    )
}

function render_ui(team, combat, combat_control) {
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);  // ui

    let measurement_line_length = 96;
    let screenpixels_km = stwp(new Vector2(measurement_line_length, 0)).sub(stwp(new Vector2(0, 0))).x;

    let measurement_line_start = new Vector2(canvas_width - 16 - measurement_line_length, 24);
    let measurement_line_end = new Vector2(canvas_width - 16, 24);

    layers.ui2.ctx.beginPath();
    
    layers.ui2.ctx.moveTo(measurement_line_start.x, measurement_line_start.y-8);
    layers.ui2.ctx.lineTo(measurement_line_start.x, measurement_line_start.y);
    layers.ui2.ctx.lineTo(measurement_line_end.x, measurement_line_end.y);
    layers.ui2.ctx.lineTo(measurement_line_end.x, measurement_line_end.y-8);

    layers.ui2.ctx.lineWidth = 1;
    layers.ui2.ctx.strokeStyle = "#0f0";
    
    layers.ui2.ctx.stroke();

    write_text(layers.ui2.ctx, `${Math.round(screenpixels_km * 10) / 10} km`, canvas_width - 16 - (measurement_line_length / 2), 40, "#0f0", "MS Gothic", 12, true);
}

function render_projectiles(team, combat, combat_control) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);  // projectiles

    combat.projectiles.forEach(p => {
        let canvas_position = wtsp(p.position).round();

        if (-32 < canvas_position.x && canvas_position.x <= canvas_width && -32 < canvas_position.y && canvas_position.y <= canvas_height) {
            write_rotated_image(
                layers.fg3.canvas,
                layers.fg3.ctx,
                canvas_position.x,
                canvas_position.y,
                line,
                10, 1,
                p.heading.angle()
            )
        }
    })
}

function render_units(team, combat, combat_control) {
    // manual render delay
    if (false) {
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while(curDate-date < 100);
    }

    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);  // planes
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);  // target/movement information
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);  // selection box

    combat.squadrons.forEach(sq => {
        // airbases are "squadrons" too. you should refactor this again lol
        let canvas_position = wtsp(sq.position).round();
        let is_selected = combat_control.selected_squadrons.some(s => s.id == sq.id);
        let is_on_canvas = -32 < canvas_position.x && canvas_position.x <= canvas_width && -32 < canvas_position.y && canvas_position.y <= canvas_height

        switch (sq.unit_type) {
            case UnitType.SQUADRON:
                if (is_on_canvas || is_selected) { 
                    write_rotated_image(
                        layers.fg2.canvas,
                        layers.fg2.ctx,
                        canvas_position.x,
                        canvas_position.y,
                        sq.team == team ? squadron_icon : squadron_icon_enemy,
                        24, 24,
                        sq.heading.angle()
                    )
        
                    if (is_selected) {
                        write_rotated_image(
                            layers.fg2.canvas,
                            layers.fg2.ctx,
                            canvas_position.x,
                            canvas_position.y,
                            select_icon,
                            24, 24, 0
                        )
        
                        write_text(layers.fg2.ctx, sq.name, canvas_position.x, canvas_position.y + 24, sq.team == team ? "#fff" : "#f00", "MS Gothic", 12, true);
                        write_text(layers.fg2.ctx, Math.round(60*60*sq.speed*sq.throttle_pct)+" km/h", canvas_position.x, canvas_position.y + 36, sq.team == team ? "#0f0" : "#f00", "MS Gothic", 12, true);
        
                        let drawn_coloured_for = new Set();
                        sq.all_weapons.forEach(att => {
                            let range_circle_radius = new Vector2(att.range, att.range);
                            let range_circle_screen_radius = range_circle_radius.mul(canvas_zoom_factor);
        
                            let start_angle = 0;
                            let end_angle = Math.PI * 2;
                            if (!projectile_type_to_behaviour[att.projectile_type].is_homing) {
                                start_angle = sq.heading.angle() - ((Math.PI / 180)*16);
                                end_angle = sq.heading.angle() + ((Math.PI / 180)*16);
                            }
        
                            let draw_col = {
                                "BULLET": "#fff",
                                "MISSILE": "#0cf",
                                "ROCKET": "#f80",
                                "BOMB": "#f00"
                            }[att.projectile_type.slice(0, -1)];
        
                            let cooldown_ready = att.aircraft.current_cooldowns[att.attack_index] <= 0;
        
                            if (cooldown_ready && drawn_coloured_for.has(draw_col+range_circle_screen_radius.x)) {
                                // do not draw again
                            } else if (!cooldown_ready) {
                                draw_cone(layers.fg2.ctx, canvas_position.x, canvas_position.y, range_circle_screen_radius.x, "#454", start_angle, end_angle);
                            } else {
                                draw_cone(layers.fg2.ctx, canvas_position.x, canvas_position.y, range_circle_screen_radius.x, draw_col, start_angle, end_angle);
                                drawn_coloured_for.add(draw_col+range_circle_screen_radius.x);
                            }
                        })
                    }
                }

                break;

            case UnitType.AIRBASE:
                if (is_on_canvas || is_selected) { 
                    write_rotated_image(
                        layers.fg2.canvas,
                        layers.fg2.ctx,
                        canvas_position.x,
                        canvas_position.y,
                        sq.team == team ? airbase_icon : airbase_icon_enemy,
                        24, 24, 0
                    )

                    if (is_selected) {
                        write_rotated_image(
                            layers.fg2.canvas,
                            layers.fg2.ctx,
                            canvas_position.x,
                            canvas_position.y,
                            select_icon,
                            24, 24, 0
                        )

                        write_text(layers.fg2.ctx, sq.name, canvas_position.x, canvas_position.y + 24, sq.team == team ? "#fff" : "#f00", "MS Gothic", 12, true);
                    }
                }

                break;
        }
    })

    combat_control.moused_over_squadrons.forEach(sq => {
        let canvas_position = wtsp(sq.position);
        write_text(layers.fg2.ctx, sq.name, canvas_position.x, canvas_position.y + 24, sq.team == team ? "#fff" : "#f00", "MS Gothic", 12, true);
    })

    let mouse_select_positions = combat_control.current_selected_target_positions();
    mouse_select_positions.forEach(d => {
        let dpos_position = d.pos.position ? d.pos.position : d.pos;
        let dpos_is_entity = d.pos.position ? true : false;

        let wtsp_dpos = wtsp(dpos_position).round();
        /*
        let line_points = make_line(wtsp(d.squadron.position).round(), wtsp_dpos, {tl: new Vector2(0, 0), br: new Vector2(canvas_width, canvas_height)});

        line_points.forEach(point => {
            layers.fg2.ctx.putImageData(imgs.pixel, point.x, point.y);
        })
        */

        let line_start = wtsp(d.squadron.position).round();

        layers.fg3.ctx.beginPath();
        layers.fg3.ctx.moveTo(line_start.x, line_start.y);
        layers.fg3.ctx.lineTo(wtsp_dpos.x, wtsp_dpos.y);

        layers.fg3.ctx.lineWidth = 1;
        layers.fg3.ctx.strokeStyle = "#ccc";
        if (dpos_is_entity) {
            if (d.pos.team == team) {
                layers.fg3.ctx.strokeStyle = "#0f0";
            } else {
                layers.fg3.ctx.strokeStyle = "#f00";
            }
        } else {
            layers.fg3.ctx.putImageData(imgs.brush, wtsp_dpos.x-5, wtsp_dpos.y-5);
        }
        
        layers.fg3.ctx.stroke();
    })

    if (drag_start_pos) {
        let select_rect_diff = mouse_position.sub(drag_start_pos);
        let abs_select_rect_diff = new Vector2(Math.abs(select_rect_diff.x), Math.abs(select_rect_diff.y));

        if (abs_select_rect_diff.sqr_magnitude() > 64 && abs_select_rect_diff.x > 0 && abs_select_rect_diff.y > 0) {
            let spr = layers.ui1.ctx.createImageData(abs_select_rect_diff.x, abs_select_rect_diff.y);
            write_rect_to_imagedata(spr, new Vector2(0, 0), abs_select_rect_diff, new Colour(0, 255, 0, 192));
            write_rect_to_imagedata(spr, new Vector2(1, 1), abs_select_rect_diff.sub(new Vector2(1, 1)), new Colour(0, 255, 0, 64));

            layers.ui1.ctx.putImageData(spr, Math.min(mouse_position.x, drag_start_pos.x), Math.min(mouse_position.y, drag_start_pos.y));
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    /*
    let brushes = [];

    layer_names.forEach((k,i) => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        ctx.imageSmoothingEnabled = false;

        let wh = 24 - ((i*2)+1);

        let brush = layers.bg3.ctx.createImageData(wh, wh);
        write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(wh, wh), new Colour(i*25, 255, 255, 25))
        brushes.push(brush);
    })
    */

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
        }

        event.preventDefault();
    });

    layers.front.canvas.addEventListener("mouseup", function(event) {
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

        event.preventDefault();
    });

    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = true;

        if (code == "KeyQ") {
            combat_control.selected_squadrons.forEach(a => {
                console.log("spawned missile");

                let proj = new Projectile(
                    combat_control.player_team, 
                    projectile_type_to_behaviour.MISSILE1, 
                    {tracking: 0, dmg_min: 10, dmg_max: 20}, 
                    stwp(mouse_position), 
                    new Vector2(1, 0), a
                );

                combat.projectiles.push(proj);
            });

            if (combat_control.selected_squadrons.length <= 0) {
                console.log("spawned missile");

                let mp = stwp(mouse_position);
                let a = combat.squadrons.filter(a => a.team != combat_control.player_team).sort((a,b) => a.position.distance(mp) - b.position.distance(mp))[0];

                let proj = new Projectile(
                    combat_control.player_team, 
                    projectile_type_to_behaviour.MISSILE1, 
                    {tracking: 0, dmg_min: 10, dmg_max: 20}, 
                    mp, 
                    new Vector2(1, 0), a
                );

                combat.projectiles.push(proj);
            }
        }

        if (code == "Equal") {
            combat.zoom_scale *= 1.1;

            let old_mouse_pos = stwp(mouse_position);

            refresh_wtsp_stwp();

            let new_mouse_pos = stwp(mouse_position);

            let offset = new_mouse_pos.sub(old_mouse_pos);

            combat.zoom_offset = combat.zoom_offset.sub(offset);
        }

        if (code == "Minus") {
            combat.zoom_scale /= 1.1;

            let old_mouse_pos = stwp(mouse_position);

            refresh_wtsp_stwp();

            let new_mouse_pos = stwp(mouse_position);

            let offset = new_mouse_pos.sub(old_mouse_pos);

            combat.zoom_offset = combat.zoom_offset.sub(offset);
        }

        let mov_vec = new Vector2(combat.zoom_scale, combat.zoom_scale).mul(50);
        if (keys_down["ControlLeft"] || keys_down["ControlRight"]) {
            mov_vec = mov_vec.div(10);
        } else if (keys_down["ShiftLeft"]) {
            mov_vec = mov_vec.mul(10);
        }

        if (code == "ArrowLeft") {
            combat.zoom_offset = combat.zoom_offset.add(mov_vec.mask(-1, 0));
            combat_control.following_squadron = [];
        }

        if (code == "ArrowRight") {
            combat.zoom_offset = combat.zoom_offset.add(mov_vec.mask(1, 0))
            combat_control.following_squadron = [];
        }

        if (code == "ArrowDown") {
            combat.zoom_offset = combat.zoom_offset.add(mov_vec.mask(0, 1))
            combat_control.following_squadron = [];
        }

        if (code == "ArrowUp") {
            combat.zoom_offset = combat.zoom_offset.add(mov_vec.mask(0, -1))
            combat_control.following_squadron = [];
        }

        refresh_wtsp_stwp();
    });

    document.addEventListener("keyup", (event) => {
        let name = event.key;
        let code = event.code;

        keys_down[code] = false;
    });

    handle_resize();

    imgs.pixel = layers.fg2.ctx.createImageData(1, 1);
    write_rect_to_imagedata(imgs.pixel, new Vector2(0, 0), new Vector2(1, 1), new Colour(0, 255, 0, 128))

    imgs.brush = layers.fg2.ctx.createImageData(8, 8);
    write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(8, 8), new Colour(0, 255, 0, 255))

    imgs.line = layers.fg2.ctx.createImageData(5, 1);
    write_rect_to_imagedata(imgs.brush, new Vector2(0, 0), new Vector2(5, 1), new Colour(255, 255, 255, 255));

    game_loop();
})

window.addEventListener("resize", handle_resize)

let combat = new Combat();

let test_squadrons = [];
let test_team = 0;
for (let x=(world_size.x/2)-(100); x<=(world_size.x/2)+(100); x+=Math.floor(10)) {
    for (let y=(world_size.y/2)-(100); y<=(world_size.y/2)+(100); y+=Math.floor(10)) {        
        let test_plane = new Aircraft(test_team, aircraft_lookup["Test Plane"]);
        let test_squadron = new Squadron(test_team, `Test Squadron #${test_squadrons.length+1}`, [test_plane]);

        test_squadron.position = new Vector2(x, y);
        test_squadron.heading = new Vector2(1, 0);

        combat.squadrons.push(test_squadron);
        test_squadrons.push(test_squadron);
    }
    
    test_team = 1-test_team;
}

let f_plane = new Aircraft(0, aircraft_lookup["Funny Plane"]);
let f_squadron = new Squadron(0, `Funny Plane`, [f_plane]);

f_squadron.position = combat.zoom_offset.copy();
f_squadron.heading = new Vector2(1, 0);

combat.squadrons.push(f_squadron);

let t_planes = Array(12).fill(0).map(_ => new Aircraft(0, aircraft_lookup["Little Guy"]));
let t_squadron = new Squadron(0, `Little Guys`, t_planes);

t_squadron.position = combat.zoom_offset.sub(new Vector2(20, 5));
t_squadron.heading = new Vector2(1, 0);

combat.squadrons.push(t_squadron);

let f_airbase = new Airbase(0, airbase_template);
f_airbase.position = combat.zoom_offset.add(new Vector2(5, 5));
combat.squadrons.push(f_airbase);

let f_airbase_e = new Airbase(1, airbase_template);
f_airbase_e.position = combat.zoom_offset.add(new Vector2(5, 0));
combat.squadrons.push(f_airbase_e);

let combat_control = new PlayerCombatControl(combat, 0);

//combat_control.selected_squadrons.push(f_squadron);
//combat_control.following_squadron.push(f_squadron);

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();

function game_loop() {
    let frame_start_time = Date.now();

    render_worldmap(combat, combat_control);
    render_units(combat_control.player_team, combat, combat_control);
    render_projectiles(combat_control.player_team, combat, combat_control);
    render_ui(combat_control.player_team, combat, combat_control);

    render_diagnostics(combat, combat_control);

    let render_end_time = Date.now();

    combat_control.process_mousemove(mouse_position, keys_down);

    if (keys_down["AltLeft"]) {
        combat_control.following_squadron = combat_control.selected_squadrons.slice()
    } else {
        //combat_control.following_squadron = [];
    }

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    combat.step(delta_time);
    combat_control.step();

    let calc_end_time = Date.now();

    time_deltas.push(delta_time);
    time_deltas = time_deltas.slice(-120);

    render_durations.push(render_end_time - frame_start_time);
    render_durations = render_durations.slice(-120);

    calc_durations.push(calc_end_time - render_end_time);
    calc_durations = calc_durations.slice(-120);

    let frame_end_time = Date.now();
    let time_since_last_frame = frame_end_time - last_frame_time;
    last_frame_time = frame_end_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // next frame should arrive (1000/fps) ms later, so get the time left and compare it with the end time
    let expected_next_frame = frame_start_time + (1000/fps);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    setTimeout(game_loop, time_to_wait);
}

// TODO - figure out how to draw the individual countries, then figure out a method to show a zoomed view of the map at any zoom level and zoom center
