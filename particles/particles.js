game_id = "particles";

let display_canvas = null;
let canvas_img = null;
let canvas_img_buff = null;

let canvas_size = new Vector2(1, 1);

const CollisionEffect = {
    NONE: 0,
    BOUNCE: 1,
    DESTROY: 2
}

const CustomFunction = {
    FRICTION: "Friction",
    HUE_SHIFT_BY_SPEED: "Hue shift by speed",
    FADE: "Fade out"
}

const CustomFunctionParameters = {
    [CustomFunction.FRICTION]: [["Speed multiplier", "float"]],
    [CustomFunction.HUE_SHIFT_BY_SPEED]: [["Speed hue shift factor", "float"]],
    [CustomFunction.FADE]: [["Colour to fade to", "colour"]]
}

const CustomFunctionMap = {
    [CustomFunction.FRICTION]: (simulation, part, parameters) => part.velocity = part.velocity.mul(parameters[0]),
    [CustomFunction.HUE_SHIFT_BY_SPEED]: (simulation, part, parameters) => /* hue shift here TODO */ 0,
    [CustomFunction.FADE]: (simulation, part) => part.colour = part.template.colour.lerp(parameters[0], part.lifetime / part.template.life)
}

class ParticleTemplate {
    constructor(code, desc, size, life, colour, trail_length, mass, enable_collision, on_collision, gravity_settings, creation_settings, custom_onupdate, custom_timed_functions) {
        this.code = code;
        this.desc = desc;

        this.size = size;
        this.life = life;
        this.colour = colour;
        this.trail_length = trail_length;
        this.mass = mass;

        this.enable_collision = enable_collision;
        this.on_collision = on_collision;  // Map of code => effect. Mapping "any" means... any.
        this.gravity_settings = gravity_settings;  // {intensity, radius}
        this.creation_settings = creation_settings;  // [{template, delay, burst_nr, inertia_factor, random_starting_vel_factor}, ...]

        // REWORK TODO to make able to support multiple on-updates, as well as looking up from CustomFunction instead of using native code so the game can save/load correctly
        // need to load user-supplied strings and cast them to the right values - datatypes in CustomFunctionParameters
        this.custom_onupdate = custom_onupdate; // fn(simulation, delta_time, part)
        this.custom_timed_functions = custom_timed_functions;  // [{delay, fn(simulation, part, parameters)}, ...]
    }
}

class Particle {
    static id_inc = 1;

    constructor(template, position, velocity) {
        this.id = Particle.id_inc;
        Particle.id_inc++;

        this.template = template;
        this.position = position;

        this.lifetime = 0;

        this.colour = this.template.colour.copy(); //done
        this.mass = this.template.mass;

        this.gravity_radius_mul = 1; //done
        this.gravity_strength_mul = 1; //done

        this.creation_speed_mul = 1;
        this.function_speed_mul = 1;
        this.all_timespeed_mul = 1; //done

        this.velocity = velocity;

        this.creation_timers = this.template.creation_settings.map(t => t.delay);
        this.function_timers = this.template.custom_timed_functions.map(t => t.delay);
    }
}

function rgb_to_int(rgb) {
    return (rgb[3] << 24 >>> 0) + (rgb[2] << 16) + (rgb[1] << 8) + (rgb[0] << 1);
}

class SimulationController {
    constructor(canvas) {
        this.simulation_duration = 0;
        this.simulation_duration_realtime = 0;

        this.particles = new Map();
        this.gravity_particles = new Map();
        this.collider_particles = new Map();

        this.trails = new Map();

        this.canvas = canvas;

        this.temp_gravity_sources = [];  // pseudo-particles with "size" 1 and all other settings controllable

        this.particle_kill_box_offset = new Vector2(canvas_size.x / 2, canvas_size.y / 2);
        this.killbox = [
            -this.particle_kill_box_offset.x,
            canvas_size.x + this.particle_kill_box_offset.x,
            -this.particle_kill_box_offset.y,
            canvas_size.y + this.particle_kill_box_offset.y
        ]
    }

    position_to_flat(pos) {
        return (pos.y * canvas_size.x) + pos.x;
    }

    position_in_view(pos) {
        return (pos.x >= 0 && pos.x < canvas_size.x && pos.y >= 0 && pos.y < canvas_size.y);
    }

    position_in_killbox(pos) {
        return !(pos.x >= this.killbox[0] && pos.x < this.killbox[1] && pos.y >= this.killbox[2] && pos.y < this.killbox[3]);
    }

    create_particle(template, position, velocity) {
        let particle = new Particle(template, position, velocity);

        if (template.enable_collision) {
            this.collider_particles.set(particle.id, particle);
        }

        if (template.gravity_settings && template.gravity_settings.enabled) {
            this.gravity_particles.set(particle.id, particle);
        }

        this.particles.set(particle.id, particle);
        this.trails.set(particle.id, [particle, []]);
        // console.log(`Hello`);
        // console.log(particle);
    }

    delete_particle(particle) {
        // console.log(`Goodbye`);
        // console.log(particle);

        this.particles.delete(particle.id);
        this.gravity_particles.delete(particle.id);
        this.collider_particles.delete(particle.id);
    }

    particle_gravity_at_point(pos, part) {
        let dist = pos.sqr_distance(part.position);

        // gravity factor is 1 at particle edge and 0 at end of (radius+size)
        let factor = Math.min(1, 1 - ((dist - part.template.size) / Math.pow(part.template.gravity_settings.radius * part.gravity_radius_mul, 2)));

        if (factor <= 0) {
            return Vector2.zero;
        }

        // multiply a normalized vector pointing towards the particle by factor * gravity_settings.intensity
        return part.position.sub(pos).normalize().mul(factor * part.template.gravity_settings.intensity * part.gravity_strength_mul); 
    }

    source_gravity_at_point(pos, source) {
        if (!source.enabled) {
            return Vector2.zero;
        }

        let dist = pos.sqr_distance(source.position);

        // gravity factor is 1 at particle edge and 0 at end of (radius+size)
        let factor = Math.min(1, 1 - ((dist - 1) / (source.radius * source.radius)));

        if (factor <= 0) {
            return Vector2.zero;
        }

        // multiply a normalized vector pointing towards the particle by factor * gravity_settings.intensity
        return source.position.sub(pos).normalize().mul(factor * source.intensity); 
    }

    gravity_at_point(pos) {
        // gravity at point is the average from all gravity-emitting particles
        if (this.gravity_particles.size <= 0 && this.temp_gravity_sources.length <= 0) {
            return new Vector2(0, 0);
        }

        let total_gravity = new Vector2(0, 0);
        this.gravity_particles.forEach(part => total_gravity = total_gravity.add(this.particle_gravity_at_point(pos, part)));
        this.temp_gravity_sources.forEach(source => total_gravity = total_gravity.add(this.source_gravity_at_point(pos, source)));
        // total_gravity = total_gravity.div(this.gravity_particles.size + this.temp_gravity_sources.length);

        return total_gravity;
    }

    step_part(particle, delta_time) {
        let r_time = delta_time * particle.all_timespeed_mul;
        particle.lifetime += r_time;

        this.trails.get(particle.id)[1].unshift([particle.position.copy(), particle.colour, this.simulation_duration]);

        particle.position = particle.position.add(particle.velocity.mul(r_time));
        // if outside killbox, short-circuit now and delete particle
        if (this.position_in_killbox(particle.position) || particle.lifetime >= particle.template.life) {
            // console.log(particle.velocity)
            this.delete_particle(particle);
            return;
        }

        // then do creation effects
        for (let i=0; i<particle.creation_timers.length; i++) {
            let settings = particle.template.creation_settings[i];
            particle.creation_timers[i] -= r_time * particle.creation_speed_mul;

            while (particle.creation_timers[i] <= 0) {
                // template, delay, burst_nr, inertia_factor, random_starting_vel_factor
                particle.creation_timers[i] += settings.delay;

                for (let p=0; p<settings.burst_nr; p++) {
                    let start_vel = random_on_circle(settings.random_starting_vel_factor).add(particle.velocity.mul(settings.inertia_factor));
                    this.create_particle(settings.template, particle.position, start_vel);
                }
            }
        }

        // then do custom functions
        for (let i=0; i<particle.function_timers.length; i++) {
            let settings = particle.template.custom_timed_functions[i];
            particle.function_timers[i] -= r_time * particle.function_speed_mul;

            while (particle.function_timers[i] <= 0) {
                // delay, fn(simulation, part)
                particle.function_timers[i] += settings.delay;

                settings.fn(this, particle);
            }
        }

        // custom_onupdate(simulation, delta_time, part)
        if (particle.custom_onupdate) {
            particle.custom_onupdate(this, r_time * particle.function_speed_mul, particle);
        }

        // then do collisions
        // -- TODO --

        // then apply gravity
        if (particle.mass != 0) {
            particle.velocity = particle.velocity.add(this.gravity_at_point(particle.position).div(particle.mass));
        }
    }

    step_trail(particle, trail) {
        while (trail.length > 0 && this.simulation_duration - trail[trail.length-1][2] >= particle.template.trail_length) {
            trail.pop();
        }

        if (trail.length <= 0) {
            this.trails.delete(particle.id);
        }
    }

    step(delta_time, realtime_delta_time) {
        // mutating length of array. might break, but also might not - depends on if iterator object is a copy or not
        // let particles_to_step = Array.from(this.particles.values()).slice();
        this.particles.forEach(part => this.step_part(part, delta_time));
        
        this.trails.forEach(trail => this.step_trail(trail[0], trail[1]));

        this.simulation_duration += delta_time;
        this.simulation_duration_realtime += realtime_delta_time;
    }

    render() {
        // buff is a flattened list.
        // for each value, figure out the rgb by finding all particles on the same tile (+trails)

        // TODO implement showing size. this will be funky when we look @ stuff like trails as well - not sure how to approach well

        let cols = new Array(canvas_size.x * canvas_size.y).fill(0).map(_ => [0, 0, 0, 255]);
        for (let x=0; x<canvas_size; x++) {
            for (let y=0; y<canvas_size; y++) {
                canvas_img_buff[(y * canvas_size) + x] = 0;
            }
        }

        this.trails.forEach(trail_pair => {
            let part = trail_pair[0];
            let trail = trail_pair[1];
            
            let positions = [];
            let last_pos = part.position.round();
            trail.forEach(trail_item => {
                if (last_pos.equals(trail_item[0].round())) {
                    return;
                }

                let line = make_line(last_pos, trail_item[0].round());
                let timedif = this.simulation_duration - trail_item[2];
                let factor = Math.max(0, (1 - (timedif / part.template.trail_length)));
                let col = trail_item[1].data.map(t => t * factor);
                col[3] = 255;

                positions.push([line, col]);
                last_pos = trail_item[0].round();
            });

            // let positions_placed = new Set();
            positions.forEach(p => {
                let line = p[0];
                let col = p[1];

                line.forEach(pos => {
                    /*
                    if (positions_placed.has(pos.hash_code())) {
                        return;
                    }

                    positions_placed.add(pos.hash_code());
                    */

                    let pos_r = pos.round();
                    if (!this.position_in_view(pos_r)) {
                        return;
                    }

                    for (let i=0; i<3; i++) {
                        cols[this.position_to_flat(pos_r)][i] = Math.min(255, cols[this.position_to_flat(pos_r)][i] + col[i]);
                    }
                })
            })
        })

        this.particles.forEach(part => {
            // head is always alpha 1, lerp trails down to 0 based on age of trail
            if (this.position_in_view(part.position.round())) {
                cols[this.position_to_flat(part.position.round())] = part.colour.copy().data;
            }

            /*
            part.position_trail.forEach(trail_item => {
                if (!this.position_in_view(trail_item[0].round())) {
                    return;
                }

                let timedif = this.simulation_duration - trail_item[2];
                let factor = Math.max(0, (1 - (timedif / part.template.trail_length)));
                let col = trail_item[1].data.map(t => t * factor);
                col[3] = 255;

                for (let i=0; i<3; i++) {
                    cols[this.position_to_flat(trail_item[0].round())][i] = Math.min(255, cols[this.position_to_flat(trail_item[0].round())][i] + col[i]);
                }
            })
            */
        })

        let ctx = display_canvas.getContext("2d");

        for (let n=0; n<canvas_size.x * canvas_size.y; n++) {
            let rgb = cols[n];
            canvas_img_buff[n] = (Math.round(rgb[3]) << 24 >>> 0) + (Math.round(rgb[2]) << 16) + (Math.round(rgb[1]) << 8) + (Math.round(rgb[0]) << 0)
        }

        /*
        for (let x=0; x<256; x++) {
            for (let y=0; y<256; y++) {
                let rgb = [y, x, 255-x, 255];
                let n = (y * canvas_size.x) + x;
                canvas_img_buff[n] = (Math.round(rgb[3]) << 24 >>> 0) + (Math.round(rgb[2]) << 16) + (Math.round(rgb[1]) << 8) + (Math.round(rgb[0]) << 0)
            }
        }
        */

        ctx.putImageData(canvas_img, 0, 0);
    }
}

function mod_simulation_speed(event, mul) {
    // console.log(event);
    if (event && event.shiftKey) {
        mul = (mul - 1) * Number.POSITIVE_INFINITY;
    }

    timespeed_mult *= mul;

    update_sim_speed_display();
}

function reset_simulation_speed() {
    timespeed_mult = 1;
    update_sim_speed_display();
}

function update_sim_speed_display() {
    if (paused) {
        document.getElementById("speed_display").textContent = `- Paused -`;
    } else {
        document.getElementById("speed_display").textContent = `${timespeed_mult}x`;
    }

    document.getElementById("speed_display_detailed").textContent = `:)`;
}

function update_avg() {
    let behind = last_frame_time - last_processing_time;
    average_element.textContent = `Behind: ${behind}ms`;
    if (behind > largest_time_batch) {
        average_element.classList.add("darkred");
        average_element.classList.remove("darkgreen");
    } else {
        average_element.classList.remove("darkred");
        average_element.classList.add("darkgreen");
    }
}

function set_selected_category(section, typ) {
    if (section == "tools") {
        document.querySelectorAll("#particles_tools_select_buttons>*").forEach(e => {
            if (e.id == `tools_${typ}_select_button`) {
                e.classList.add("selected");
            } else {
                e.classList.remove("selected");
            }
        })
    
        document.querySelectorAll("#particles_tools_menu>.hideable-tab").forEach(e => {
            if (e.id == `tools_${typ}`) {
                e.classList.add("visible");
            } else {
                e.classList.remove("visible");
            }
        })   
    } else {
        document.querySelectorAll("#particles_settings_select_buttons>*").forEach(e => {
            if (e.id == `settings_${typ}_select_button`) {
                e.classList.add("selected");
            } else {
                e.classList.remove("selected");
            }
        })
    
        document.querySelectorAll("#particles_settings_menu>.hideable-tab").forEach(e => {
            if (e.id == `options_${typ}`) {
                e.classList.add("visible");
            } else {
                e.classList.remove("visible");
            }
        })   
    }
}


let sim_controller = null;
let last_frame_time = Date.now();
let last_processing_time = Date.now();

let timespeed_mult = 1;
const largest_time_batch = 0.1;
const aggressive_catchup_threshold = 1;

let paused = false;
let max_time_wait = 25;

let prev_steps_count = new Array(10).fill(1);
let average_element = null;

let canvas_xy = Vector2.zero;
let mouse_position = Vector2.zero;
let drag_start_pos = Vector2.zero;

let keys_down = {};

document.addEventListener("DOMContentLoaded", function(e) {
    display_canvas = document.getElementById("display-canvas");
    canvas_size = new Vector2(display_canvas.width, display_canvas.height);

    average_element = document.getElementById("speed_display_detailed_avg");
    
    // reset function code
    display_canvas.getContext("2d").clearRect(0, 0, canvas_size.x, canvas_size.y);
    
    canvas_img = new ImageData(canvas_size.x, canvas_size.y);
    canvas_img_buff = new Uint32Array(canvas_img.data.buffer);

    for (let x=0; x<canvas_size; x++) {
        for (let y=0; y<canvas_size; y++) {
            canvas_img_buff[(y * canvas_size) + x] = 0;
        }
    }

    var rect = display_canvas.getBoundingClientRect();
    canvas_xy = new Vector2(rect.x, rect.y);

    sim_controller = new SimulationController(display_canvas);
    sim_controller.create_particle(new ParticleTemplate(
        "EMIT", "Particle emitter", 1, Number.POSITIVE_INFINITY, Colour.from_hex("#0f0"), 2, 0, false, null, null, [{
            template: new ParticleTemplate(
                "PART", "Particle", 1, 30, Colour.from_hex("#a0f"), 0.15, 1, false, null, null, [], null, []
            ),
            delay: 0.05,
            burst_nr: 1,
            inertia_factor: 0,
            random_starting_vel_factor: 100
        }, {
            template: new ParticleTemplate(
                "GRAV", "Gravity emitting particle", 1, 30, Colour.from_hex("#4a4"), 0.1, 1, false, null, {
                    enabled: true,
                    intensity: 0.1,
                    radius: 128
                }, [], null, []
            ),
            delay: 4,
            burst_nr: 100,
            inertia_factor: 0,
            random_starting_vel_factor: 200
        }], null, []
    ), new Vector2(128, 128), new Vector2(0, 0))

    sim_controller.create_particle(new ParticleTemplate(
        "EMIT", "Particle emitter", 1, Number.POSITIVE_INFINITY, Colour.from_hex("#0f0"), 2, 32, false, null, {
            enabled: true,
            intensity: 1,
            radius: 1000
        }, [{
            template: new ParticleTemplate(
                "PART", "Particle", 1, 30, Colour.from_hex("#0ff"), 0.2, 1, false, null, null, [{
                    template: new ParticleTemplate(
                        "SPRK", "Spark", 1, 1, Colour.from_hex("#ff0"), 0.1, 0.1, false, null, null, [], null, []
                    ),
                    delay: 1,
                    burst_nr: 1,
                    inertia_factor: -3,
                    random_starting_vel_factor: 5
                }], null, []
            ),
            delay: 0.2,
            burst_nr: 1,
            inertia_factor: 0,
            random_starting_vel_factor: 100
        }], null, []
    ), new Vector2(384, 384), new Vector2(-25, 0))

    let mouse_grav_intens = 32;
    let mouse_gravity_source = {enabled: true, position: mouse_position, radius: 128, intensity: mouse_grav_intens};

    display_canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    })

    display_canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_xy.x, event.clientY-canvas_xy.y);
        mouse_gravity_source.position = mouse_position;
    });

    display_canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            drag_start_pos = mouse_position.copy();
            
            mouse_gravity_source.intensity = mouse_grav_intens;
            sim_controller.temp_gravity_sources.push(mouse_gravity_source);
        } else if (event.button == 2) {
            mouse_gravity_source.intensity = -mouse_grav_intens;
            sim_controller.temp_gravity_sources.push(mouse_gravity_source);
        }

        keys_down[event.button] = true;

        event.preventDefault();
    });

    display_canvas.addEventListener("mouseup", function(event) {
        if (event.button == 0) {
            if (drag_start_pos) {
                // combat_control.process_dragclick(drag_start_pos, mouse_position, keys_down);

                sim_controller.temp_gravity_sources.pop();
                sim_controller.temp_gravity_sources.pop();
                sim_controller.temp_gravity_sources.pop();
                sim_controller.temp_gravity_sources.pop();
                drag_start_pos = null;
            } else {
                // combat_control.process_mouseclick(mouse_position.copy(), keys_down);
            }
        } else {
            // combat_control.process_rightclick(mouse_position.copy(), keys_down)
            sim_controller.temp_gravity_sources.pop();
        }

        keys_down[event.button] = false;

        event.preventDefault();
    });

    set_selected_category("options", "main")
    set_selected_category("tools", "tools")

    frame_fn = function() {
        if (!paused) {
            try {
                // we don't actually care about this being real-time, it's better for it to be deterministic
                /*
                let delta_time = Date.now() - last_processing_time;
                let realtime_delta_time = Date.now() - last_frame_time;
                delta_time /= 1000;
                realtime_delta_time /= 1000;

                // if delta_time is bigger than the aggressive catch-up threshold, instantly try to calculate back up to that threshold
                if (delta_time > aggressive_catchup_threshold) {
                    delta_time = Math.min(largest_time_batch, delta_time - aggressive_catchup_threshold)
                } else {
                    // otherwise, cap at the max batch calculation
                    delta_time = Math.min(largest_time_batch, delta_time);
                }

                last_frame_time = Date.now();
                last_processing_time += (delta_time * 1000);

                delta_time *= timespeed_mult;
                */

                let realtime_delta_time = Date.now() - last_frame_time;
                realtime_delta_time /= 1000;

                last_frame_time = Date.now();

                for (let i=0; i<timespeed_mult; i++) {
                    sim_controller.step(0.01, realtime_delta_time);
                }

                /*
                prev_steps_count.push(delta_time);
                prev_steps_count.shift();
                */
            } catch (e) {
                console.log("oh no!")
            }
    
            sim_controller.render();
        }

        update_avg();
        window.requestAnimationFrame(frame_fn);
    };

    frame_fn();
});

// TODO rework trails.
// 1) remove the checking a set for already-drawn positions, replace with a check for "if start pos == end pos, skip that line"
// 2) move all trails to the sim_controller and have it manage all of them (so that if the particle is destroyed its trail doesn't just vanish).
//     trails will be stored inside a map on particle.id, and the sim_controller is responsible for removing out of date trails + deleting the key if all trails in it are removed
