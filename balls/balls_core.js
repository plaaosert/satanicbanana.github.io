game_id = "balls";

const GAME_VERSION = "15/12/2025";

const AILMENT_CHARS = "➴☣";

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

const prerender_canvas = document.getElementById("hidden-prerender-canvas");
const prerender_ctx = prerender_canvas.getContext("2d");

const PARTICLE_SIZE_MULTIPLIER = 16;

const CANVAS_FONTS = "MS Gothic, Roboto Mono, monospace";

let num_textures_loaded = 0;
let num_textures_needed = 0;

const make_damage_numbers = true;

const entity_sprites = new Map([
    ["SORD", 1, "weapon/"],
    ["SORD_lightning", 1, "weapon/"],
    ["SORD_berserk", 1, "weapon/"],
    ["SORD_faithful", 1, "weapon/"],
    ["SORD_ram", 1, "weapon/"],

    ["hamer", 1, "weapon/"],
    ["hamer_squeaky", 1, "weapon/"],
    ["hamer_mogul", 1, "weapon/"],
    ["money_particle", 10, "money/"],
    ["money_particle_r", 10, "money_r/"],

    ["dagger", 1, "weapon/"],
    ["pellet", 1, "weapon/"],
    ["bow", 1, "weapon/"],
    ["arrow", 1, "weapon/"],
    
    ["gun", 1, "weapon/"],

    ["railgun", 1, "weapon/"],
    ["railgun_chicken", 1, "weapon/"],
    ["railgun_soaker", 1, "weapon/"],

    ["needle", 1, "weapon/"],
    
    ["coin_weapon", 1, "weapon/"],
    ["coin", 5, "weapon/"],

    ["potion1", 1, "weapon/"],
    ["potion1_weapon", 1, "weapon/"],
    ["puddle1", 1, "weapon/"],
    ["potion2", 1, "weapon/"],
    ["potion2_weapon", 1, "weapon/"],
    ["puddle2", 1, "weapon/"],
    ["potion3", 1, "weapon/"],
    ["potion3_weapon", 1, "weapon/"],
    ["puddle3", 1, "weapon/"],
    ["potion4", 1, "weapon/"],
    ["potion4_weapon", 1, "weapon/"],
    ["puddle4", 1, "weapon/"],

    ["potion1_ornate", 1, "weapon/"],
    ["potion1_weapon_ornate", 1, "weapon/"],
    ["potion2_ornate", 1, "weapon/"],
    ["potion2_weapon_ornate", 1, "weapon/"],
    ["potion3_ornate", 1, "weapon/"],
    ["potion3_weapon_ornate", 1, "weapon/"],
    ["potion4_ornate", 1, "weapon/"],
    ["potion4_weapon_ornate", 1, "weapon/"],

    ["grenade", 1, "weapon/"],
    ["grenade_weapon", 1, "weapon/"],

    ["grenade_blao", 1, "weapon/"],
    ["grenade_weapon_blao", 1, "weapon/"],
    ["explosion_bulao_3", 13, "explosion_bulao_3/"],

    ["grenade_bao", 1, "weapon/"],
    ["grenade_weapon_bao", 1, "weapon/"],
    ["explosion_bao", 13, "explosion_bao/"],

    ["grenade_bomb", 1, "weapon/"],
    ["grenade_weapon_bomb", 1, "weapon/"],

    ["glass", 1, "weapon/"],
    ["glass_angry", 1, "weapon/"],

    ["glass_paper", 1, "weapon/"],
    ["glass_angry_paper", 1, "weapon/"],

    ["hand_neutral", 1, "weapon/hands/"],
    ["hand_open", 1, "weapon/hands/"],
    ["hand_grab", 1, "weapon/hands/"],
    ["hand_block", 1, "weapon/hands/"],
    ["hand_punch", 1, "weapon/hands/"],
    ["hand_tired", 1, "weapon/hands/"],

    ["hand_neutral_r", 1, "weapon/hands/"],
    ["hand_open_r", 1, "weapon/hands/"],
    ["hand_grab_r", 1, "weapon/hands/"],
    ["hand_block_r", 1, "weapon/hands/"],
    ["hand_punch_r", 1, "weapon/hands/"],
    ["hand_tired_r", 1, "weapon/hands/"],

    ["FLIPS_YOU_OFF", 1, "weapon/hands/"],

    ["hand_punch_particles", 7, "weapon/hands/hand_punch_particles/"],

    ["chakram", 1, "weapon/"],
    ["chakram_weapon", 1, "weapon/"],
    ["chakram_projectile", 1, "weapon/"],

    ["chakram_fidget", 1, "weapon/"],
    ["chakram_weapon_fidget", 1, "weapon/"],
    ["chakram_projectile_fidget", 1, "weapon/"],

    ["wand_black", 1, "weapon/"],
    ["wand_cyan", 1, "weapon/"],
    ["wand_green", 1, "weapon/"],
    ["wand_magenta", 1, "weapon/"],
    ["wand_red", 1, "weapon/"],
    ["wand_white", 1, "weapon/"],

    ["wand_black_whimsy", 1, "weapon/"],
    ["wand_cyan_whimsy", 1, "weapon/"],
    ["wand_green_whimsy", 1, "weapon/"],
    ["wand_magenta_whimsy", 1, "weapon/"],
    ["wand_red_whimsy", 1, "weapon/"],
    ["wand_white_whimsy", 1, "weapon/"],

    ["wand_fireball", 1, "weapon/"],
    ["wand_icicle", 1, "weapon/"],
    ["wand_poison_barb", 1, "weapon/"],
    ["super_orb", 1, "weapon/"],

    ["axe", 1, "weapon/"],
    ["axe_projectile", 1, "weapon/"],
    ["axe_scythe", 1, "weapon/"],
    ["axe_ancient", 1, "weapon/"],

    ["shotgun", 1, "weapon/"],

    ["spear", 1, "weapon/"],
    ["spear_projectile", 1, "weapon/"],

    ["explosion", 16, "explosion/"],  // Game Maker Classic

    ["lightning", 7, "lightning/"],

    ["explosion_grenade", 16, "explosion_grenade/"],  // Game Maker Classic

    ["explosion3", 8, "explosion3/"],  // Sonic Rush Adventure

    ["explosion_small", 10, "explosion_small/"],  // Sonic Rush Adventure
].map((v, i) => {
    let ts = [];

    if (v[1] > 1) {
        for (let i=0; i<v[1]; i++) {
            let t = new Image(128, 128);
            t.src = `img/${v[2]}${v[0]}_${i.toString().padStart(3, "0")}.png`;
            t.style.imageRendering = "pixelated";

            num_textures_needed++;
            t.addEventListener("load", function() {
                num_textures_loaded++;
            })

            ts.push(t);
        }
    } else {
        let t = new Image(128, 128);
        t.src = `img/${v[2]}/${v[0]}.png`;
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        t.addEventListener("load", function() {
            num_textures_loaded++;
        })

        ts.push(t);
    }

    return [v[0], ts]
}));

let fps_current = 0;

let layers = {};
let keys_down = {};

let drag_start_pos = null;

let lmb_down = false;
let rmb_down = false;

let canvas_width = 0;
let canvas_height = 0;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);

const PHYS_GRANULARITY = 2;
const COLL_GRANULARITY = PHYS_GRANULARITY / 2;  // COLL_GRANULARITY => do collision checks every N physics steps
const COLLS_PER_FRAME = PHYS_GRANULARITY / COLL_GRANULARITY;
const DEFAULT_BALL_RESTITUTION = 1;
const DEFAULT_BALL_FRICTION = 1;

const BASE_HITSTOP_TIME = 0.15;
const HITSTOP_DELTATIME_PENALTY = 0.001;
const BALL_INVULN_DURATION = 0.1;

let last_frame_times = [];
let render_durations = [];
let calc_durations = [];
let wait_durations = [];
let time_deltas = [];

let last_calc_time = Date.now();
let last_frame_time = Date.now();
let framecount = 0;

let audio = new Map();
let audio_context = new AudioContext();

let thud_cooldown = 0;

// reduce the volume
let gain_node = audio_context.createGain();
gain_node.connect(audio_context.destination);
let gain = 0.1;
gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

let audio_playing = [];

async function load_audio_item(path) {
    return await load_audio_from_url(`https://plaao.net/balls/${path}`);;
}

async function load_audio_from_url(path) {
    let resp = await fetch(`${path}`);
    let array_buffer = await resp.arrayBuffer();

    let audio_buffer = await audio_context.decodeAudioData(array_buffer);

    return audio_buffer;
}

async function load_audio() {
    // ultrakill
    audio.set("parry", await load_audio_item('snd/parry.mp3'));
    audio.set("parry2", await load_audio_item('snd/parry2.mp3'));
    // https://pixabay.com/sound-effects/punch-04-383965/
    audio.set("impact", await load_audio_item('snd/impact.mp3'));
    audio.set("impact_heavy", await load_audio_item('snd/impact_heavy.mp3'));
    // https://pixabay.com/sound-effects/stick-hitting-a-dreadlock-small-thud-83297/
    audio.set("thud", await load_audio_item("snd/thud.mp3"));
    // game maker classic
    audio.set("explosion", await load_audio_item("snd/explosion.mp3"));
    // https://pixabay.com/sound-effects/explosion-312361/
    audio.set("explosion2", await load_audio_item("snd/explosion2.mp3"));
    // dragon ball z
    audio.set("strongpunch", await load_audio_item("snd/strongpunch.wav"));
    // johnny test
    audio.set("whipcrack", await load_audio_item("snd/whipcrack.mp3"));
    // vine thud
    audio.set("vine_thud", await load_audio_item("snd/vine_thud.mp3"));
    // guilty gear: strive (ADV_057.ogg)
    audio.set("grab", await load_audio_item("snd/grab.mp3"));
    // dragon ball z (explosion.wav)
    audio.set("wall_smash", await load_audio_item("snd/wall_smash.mp3"));
    // heat haze shadow from tekken 7
    audio.set("unarmed_theme", await load_audio_from_url("https://scrimblo.foundation/uploads/heat_haze_shadow.mp3"))
    // berserk (2016)
    audio.set("CLANG", await load_audio_item("snd/CLANG.mp3"));
    // edited versions of the originals
    audio.set("impact_shitty", await load_audio_item('snd/impact_shitty.mp3'));
    audio.set("parry_shitty", await load_audio_item('snd/parry_shitty.mp3'));
    // edited from https://www.youtube.com/watch?v=lMQGioXwbnI
    audio.set("chicken", await load_audio_item('snd/chicken.mp3'));
    // https://pixabay.com/sound-effects/retro-hurt-1-236672/
    audio.set("impact_8bit", await load_audio_item('snd/impact_8bit.mp3'));
    audio.set("impact_heavy_8bit", await load_audio_item('snd/impact_heavy_8bit.mp3'));
    // https://freesound.org/people/Breviceps/sounds/468443/
    audio.set("impact_squeak", await load_audio_item('snd/impact_squeak.mp3'));
    
    // i have no idea (ask vitawrap)
    audio.set("impact_paper", await load_audio_item('snd/impact_paper.mp3'));
    
}

function play_audio(name) {
    if (muted)
        return;

    let source = audio_context.createBufferSource();
    
    source.buffer = audio.get(name);

    source.connect(gain_node);

    let obj = {source: source, ended: false}
    source.addEventListener("ended", () => obj.ended = true);
    audio_playing.push(obj);

    source.start();

    return audio_playing.length-1;

    // console.log(`played sound ${name}`);
}

class Particle {
    static id_inc = 0;

    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, delay=0) {
        this.set_pos(position);
        this.rotation_angle = rotation_angle;
        this.size = size * PARTICLE_SIZE_MULTIPLIER;
        this.sprites = sprites;
        this.frame_speed = frame_speed;
        this.duration = duration;
        this.looping = looping;

        this.lifetime = 0;
        this.framecount = sprites.length;
        this.cur_frame = 0;

        this.delay = delay;
    }

    set_pos(to) {
        this.position = to;
    }

    pass_time(time_delta) {
        if (this.delay >= 0) {
            this.delay -= time_delta;
            if (this.delay < 0) {
                this.lifetime += -this.delay;
            }

            return;
        }

        this.lifetime += time_delta;
        this.cur_frame = Math.floor(this.lifetime * this.frame_speed)
        if (this.looping) {
            this.cur_frame = this.cur_frame % this.framecount;
        }
    }
}

class DamageNumberParticle extends Particle {
    constructor(position, size, number, col, inertia_force, board, text_size) {
        super(position, 0, size, [number], 0, 2, false);

        this.base_col = col;
        this.text_col = col;
        this.text_border_col = this.base_col.lerp(Colour.black, 0.6);

        this.text_size = text_size;
        this.text_modifiers = "";

        this.velocity = inertia_force.mul(0.2);
        this.velocity = this.velocity.add(random_on_circle(1000, board.random).add(new Vector2(0, random_float(-2000, -3000, board.random))));
        this.gravity = board.gravity.mul(0.5);
        
        this.flash_period = 0.1;
    }

    pass_time(time_delta) {
        this.lifetime += time_delta;
        
        this.position = this.position.add(this.velocity.mul(time_delta));
        this.velocity = this.velocity.add(this.gravity.mul(time_delta));

        let lifetime_mod = this.lifetime % this.flash_period;
        if (lifetime_mod > this.flash_period/2) {
            this.text_col = this.base_col;
        } else {
            this.text_col = Colour.white.lerp(this.base_col, this.lifetime / this.duration);
        }
    }
}

class HammerMogulMoneyParticle extends Particle {
    constructor(position, size, velocity, board) {
        super(position, 0, size, [], 0, 30, false);

        this.velocity = velocity;
        this.flipped = this.velocity.x > 0;
        this.suffix = this.flipped ? "_r" : "";

        this.sprite_list = entity_sprites.get("money_particle" + this.suffix);

        this.sprites = [this.sprite_list[0]];
        this.framecount = 1;

        this.gravity = board.gravity.mul(0.5);
        this.friction = 3500;

        this.fall_breakpoints = [
            -3000, -1200, 0, 400, 700
        ]

        this.in_starting_anim = true;
        this.frame_granular = 0;
    }

    pass_time(time_delta) {
        this.lifetime += time_delta;
        
        this.position = this.position.add(this.velocity.mul(time_delta));
        this.velocity = this.velocity.add(this.gravity.mul(time_delta));
        this.velocity.y = Math.sign(this.velocity.y) * Math.max(0, Math.abs(this.velocity.y) - (this.friction * time_delta));
    
        if (this.in_starting_anim) {
            let sprite_n = 0;
            for (let i=0; i<this.fall_breakpoints.length; i++) {
                if (this.velocity.y > this.fall_breakpoints[i]) {
                    sprite_n++;
                } else {
                    break;
                }
            }
            if (sprite_n >= 5) {
                this.in_starting_anim = false;
            }

            this.sprites = [this.sprite_list[sprite_n]];
        } else {
            // animate it moving from left to right
            this.frame_granular += time_delta * 3.5;
            
            this.frame_granular = this.frame_granular % 8;

            let frame_actual = 4 - Math.abs(Math.floor(this.frame_granular) - 4);

            this.sprites = [this.sprite_list[5 + frame_actual]];
        }
    }
}

class Timer {
    static id_inc = 0;

    constructor(func, trigger_time, repeat=false) {
        this.id = Timer.id_inc;
        Timer.id_inc++;
        
        this.func = func;
        this.trigger_time = trigger_time;
        this.original_trigger_time = trigger_time;
        this.repeat = repeat;
    }

    reset() {
        this.trigger_time = this.original_trigger_time;
    }
}

class Board {
    constructor(size) {
        this.stepped_physics = false;

        this.size = size;
        this.projectile_delete_bounds = [
            -this.size.x * 0.5,
            this.size.x * 1.5,
            -this.size.y * 0.5,
            this.size.y * 1.5
        ]

        this.duration = 0;

        this.balls = [];
        this.projectiles = [];
        this.particles = [];
        this.timers = [];
        this.lines = [
            // corner walls
            {
                // ax + by + c = 0
                id: 0,

                a: 1,
                b: 0,
                c: 0,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 0,

                a: 1,
                b: 0,
                c: -this.size.x,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 1,

                a: 0,
                b: 1,
                c: 0,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            },

            {
                // ax + by + c = 0
                id: 1,

                a: 0,
                b: 1,
                c: -this.size.y,

                lbx: null,
                ubx: null,
                lby: null,
                uby: null,
            }
        ]

        // this.gravity = new Vector2(0, 0);
        this.gravity = new Vector2(0, 9810);

        this.hitstop_time = 0;

        this.played_whipcrack = false;

        this.forced_time_deltas = 0;
        this.expected_fps = 0;

        this.random = null;
        this.random_seed = null;

        this.starting_balls = null;
        this.starting_levels = null;
        this.starting_players = null;

        this.tension_loss_from_parry_time = 1  // for each second since last parry
        this.tension_loss_from_hit_time = 0.5  // for each second since last hit
        this.tension_loss_from_total_hp = 0.01 // for each point of hp remaining
        this.tension_gain_from_missing_hp = 0.003 // for each missing point of hp
        this.tension_gain_per_damage = 1 // on hit, per hp lost by either ball
        this.tension_gain_per_damage_multiplier_for_missing_hp = 3; // multiply by up to X for mising hp
        this.tension_gain_per_damage_multiplier_for_hp_difference = 3;
        this.tension_projectile_parry_time_per_damage = 10; // recover 1/16 of parry time per damage of projectile

        this.tension = 0;
        this.time_since_parry = 0;
        this.time_since_hit = 0;
    }
    
    register_hit(by, on) {
        this.time_since_hit = 0;
    }

    register_parry(by, on) {
        this.time_since_parry = 0;
    }

    register_projectile_parry(by, on, projectile) {
        let dmg = projectile.damage ?? 1;

        this.time_since_parry -= this.time_since_parry * Math.min(1, dmg / this.tension_projectile_parry_time_per_damage);
    }

    register_hp_loss(by, on, amt) {
        if (!on.show_stats) {
            return; // dont care about adds
        }

        let proportion_missing = 1 - (on.hp / on.max_hp);
        let proportion_other = proportion_missing;
        if (by?.hp) {
            proportion_other = 1 - (by.hp / by.max_hp);
        }

        // get the difference between proportions and add it to the multiplier
        let proportion_difference = proportion_missing - proportion_other;
        
        let multiplier = proportion_missing * this.tension_gain_per_damage_multiplier_for_missing_hp;
        multiplier -= proportion_difference * this.tension_gain_per_damage_multiplier_for_hp_difference;
        
        let tension_to_add = this.tension_gain_per_damage * multiplier * amt;
        
        this.tension += tension_to_add;

        // do damage numbers
        if (make_damage_numbers && by instanceof Ball && amt > 0.15 && on.show_stats) {
            let size = 14;
            if (amt >= 8) {
                size = 16;
                if (amt >= 16) {
                    size = 18;
                    if (amt >= 32) {
                        size = 20;
                    }
                }
            }

            let part = null;
            if (on.id == by.id) {
                // self-damage
                part = new DamageNumberParticle(
                    on.position, 1, `✶ ${(-amt).toFixed(1)}`, on.get_current_desc_col(), on.velocity, this, size
                );
            } else {
                part = new DamageNumberParticle(
                    on.position, 1, (-amt).toFixed(1), on.get_current_desc_col(), on.velocity, this, size
                );
            }

            this.spawn_particle(part, on.position);
        }
    }

    register_rupture(by, on, amt) {
        if (make_damage_numbers && by instanceof Ball && amt > 0.15 && on.show_stats) {
            let size = 14;
            if (amt >= 8) {
                size = 16;
                if (amt >= 16) {
                    size = 18;
                    if (amt >= 32) {
                        size = 20;
                    }
                }
            }

            let part = new DamageNumberParticle(
                on.position, 1, `${AILMENT_CHARS[0]} ${amt.toFixed(1)}`, on.get_current_desc_col(), on.velocity, this, size
            );

            this.spawn_particle(part, on.position);
        }
    }

    register_poison(by, on, amt, dur) {
        if (make_damage_numbers && by instanceof Ball && amt > 0.15 && dur > 0.15 && on.show_stats) {
            let size = 14;
            let final_amt = amt * dur;
            if (final_amt >= 8) {
                size = 16;
                if (final_amt >= 16) {
                    size = 18;
                    if (final_amt >= 32) {
                        size = 20;
                    }
                }
            }

            let part = new DamageNumberParticle(
                on.position, 1, `${AILMENT_CHARS[1]} ${amt.toFixed(1)} | ${dur.toFixed(1)}s`, on.get_current_desc_col(), on.velocity, this, size
            );

            this.spawn_particle(part, on.position);
        }
    }

    set_random_seed(seed) {
        this.random_seed = seed;
        this.random = get_seeded_randomiser(seed);
    }

    set_timer(timer) {
        let index = get_sorted_index_with_property(this.timers, timer.trigger_time, "trigger_time");

        this.timers.splice(index, 0, timer);
    }

    in_bounds(pos) {
        return (
            pos.x >= 0 &&
            pos.x < this.size.x &&
            pos.y >= 0 &&
            pos.y < this.size.y)
    }

    remaining_players() {
        let balls_ids = this.balls.map(ball => ball.player.id);
        let players = this.balls.filter((t, i) => t.show_stats && balls_ids.indexOf(t.player.id) === i).map(b => b.player);
        return players;
    }

    get_player_ball(player) {
        return this.balls.find(ball => ball.player.id === player.id);
    }

    get_all_player_balls(player) {
        return this.balls.filter(ball => ball.player.id === player.id);
    }

    spawn_particle(particle, position) {
        particle.set_pos(position);
        this.particles.push(particle);

        return particle;
    }

    spawn_projectile(projectile, position) {
        projectile.set_pos(position);
        this.projectiles.push(projectile);

        projectile.board = this;

        return projectile;
    }

    spawn_ball(ball, position) {
        ball.set_pos(position);
        this.balls.push(ball);

        ball.board = this;

        ball.late_setup();

        return ball;
    }

    remove_ball(ball) {
        this.balls.splice(
            this.balls.findIndex(b => b.id == ball.id), 1
        )
    }

    tension_step(time_delta) {
        this.tension -= this.tension_loss_from_parry_time * this.time_since_parry * time_delta;
        this.tension -= this.tension_loss_from_hit_time * this.time_since_hit * time_delta;
        
        let relevant_balls = this.balls.filter(ball => ball.show_stats);
        let total_ball_hp = relevant_balls.reduce((p, c) => {
            return p + c.hp
        }, 0); // only counting balls that matter
        this.tension -= total_ball_hp * this.tension_loss_from_total_hp * time_delta;

        let total_missing_hp = relevant_balls.reduce((p, c) => {
            return p + (c.max_hp - c.hp)
        }, 0); // only counting balls that matter
        this.tension += total_missing_hp * this.tension_gain_from_missing_hp * time_delta;

        this.time_since_parry += time_delta;
        this.time_since_hit += time_delta;
    }

    timers_step(time_delta) {
        this.timers.forEach(timer => timer.trigger_time -= time_delta);
        /*
        if (this.timers.length > 0) {
            console.log(`${this.timers.length} timers left`);
        }
        */
        while (this.timers[0]?.trigger_time <= 0) {
            // remove, then re-add if repeat
            let trigger = this.timers.shift();
            
            // console.log(`Triggering timer ID ${trigger.id}`);

            trigger.func(this);

            if (trigger.repeat) {
                trigger.reset();
                this.set_timer(trigger);
            }
        }
    }

    particles_step(time_delta) {
        if (this.hitstop_time > 0) {
            time_delta *= Number.EPSILON;
        }

        this.particles.forEach(particle => particle.pass_time(time_delta / 1000));
        this.particles = this.particles.filter(particle => {
            // looping particles never hit the framecount bound so out-of-range frame is valid to check deletion
            return particle.lifetime < particle.duration && particle.cur_frame < particle.framecount;
        })
    }

    physics_step(time_delta) {
        this.stepped_physics = true;

        this.hitstop_time -= time_delta;
        if (this.hitstop_time > 0) {
            time_delta *= 0;
            return;
        }

        // make the balls move
        this.balls.forEach(ball => {
            if (ball.skip_physics)
                return;  // skip_physics balls should completely stop

            ball.physics_step(this, time_delta);
        })

        // make the projectiles move
        this.projectiles.forEach(projectile => {
            projectile.physics_step(time_delta);
        })

        // clean up any inactive / OOB ones
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.active ||
                (projectile instanceof HitscanProjectile && projectile.lifetime >= projectile.duration) ||
                projectile.position.x < this.projectile_delete_bounds[0] ||
                projectile.position.x > this.projectile_delete_bounds[1] ||
                projectile.position.y < this.projectile_delete_bounds[2] ||
                projectile.position.y > this.projectile_delete_bounds[3]
            ) {
                return false;
            }

            return true;
        })

        // then, apply gravity to balls
        this.balls.forEach(ball => {
            if (ball.skip_physics)
                return;  // skip_physics balls should completely stop

            if (!ball.at_rest) {
                let time_delta_factor = 1;
                if (ball.hitstop > 0) {
                    time_delta_factor *= HITSTOP_DELTATIME_PENALTY;
                }

                ball.add_impulse(this.gravity.mul(time_delta * time_delta_factor).mul(ball.mass));
            }
        })

        // any air drag?

        // check for all collisions. for each collision, calculate
        let collisions = [];
        let collisions_found = new Set();

        let sthis = this;
        this.balls.forEach(ball1 => {
            sthis.balls.forEach(ball2 => {
                if (ball1.skip_physics || ball2.skip_physics)
                    return;  // skip_physics balls should completely stop

                if (ball1.id == ball2.id) {
                    return;
                }

                if (ball1.collides(ball2)) {
                    let coll_id = ball1.id + "," + ball2.id;
                    let coll_id2 = ball2.id + "," + ball1.id;

                    if (!collisions_found.has(coll_id) && !collisions_found.has(coll_id2)) {
                        collisions.push({first: ball1, second: ball2});

                        collisions_found.add(coll_id);
                        collisions_found.add(coll_id2);
                    }
                }
            })
        })

        collisions.forEach(coll => {
            coll.first.resolve_collision(sthis, coll.second);

            if (thud_cooldown < 0) {
                play_audio("thud");
                thud_cooldown += 0.3;
            }
        })

        // check wall and ground bounces
        this.balls.forEach(ball => {
            if (ball.skip_physics || ball.ignore_bounds_checking)
                return;  // skip_physics balls should completely stop
            /*
            ball.check_ground_bounce(sthis);
            ball.check_ceiling_bounce(sthis);
            ball.check_sides_bounce(sthis);
            */
            sthis.lines.forEach(line => {
                if (ball.collides_line(line)) {
                    ball.resolve_line_collision(sthis, line);
                    
                    if (thud_cooldown < 0) {
                        play_audio("thud");
                        thud_cooldown += 0.3;
                    }
                }
            })
        })

        thud_cooldown -= time_delta;

        // force everything back in bounds
        this.balls.forEach(ball => {
            if (ball.skip_physics || ball.ignore_bounds_checking)
                return;  // skip_physics balls should completely stop

            ball.position.x = Math.max(ball.radius, Math.min(this.size.x - ball.radius, ball.position.x));
            ball.position.y = Math.max(ball.radius, Math.min(this.size.y - ball.radius, ball.position.y));
            ball.position.compat_round();
        });

        this.duration += time_delta;
    }
}

class Ball {
    static id_inc = 0;

    constructor(board, mass, radius, colour, bounce_factor, friction_factor) {
        this.id = Ball.id_inc;
        Ball.id_inc++;
        
        this.board = board;

        this.position = new Vector2(0, 0);
        this.mass = mass; // g
        this.radius = radius;  // m

        this.colour = colour;

        this.bounce_factor = bounce_factor ? bounce_factor : DEFAULT_BALL_RESTITUTION;  // [0.0, 1.0]
        this.friction_factor = friction_factor ? friction_factor : DEFAULT_BALL_FRICTION; // [0.0, 1.0]

        this.velocity = new Vector2(0, 0);  // m/s
        this.acceleration = new Vector2(0, 0);

        this.rest_counter = 0;
        this.at_rest = false;
        this.rest_threshold = PHYS_GRANULARITY * 64;

        this.last_pos = new Vector2(0, 0);

        this.skip_physics = false;
    }

    set_pos(to) {
        this.position = to;
        this.position.compat_round();
        
        return this;
    }

    add_pos(by, ignore_rest) {
        this.set_pos(this.position.add(by));
    }

    disable_rest() {
        // this.at_rest = false;
        // this.rest_counter = 0;
    }

    add_impulse(force) {  // g-m/s
        // p=mv
        // dv = I/m
        this.add_velocity(force.div(this.mass));
    }

    set_velocity(vel) {
        this.velocity = vel;
        this.velocity.compat_round();
    }

    add_velocity(vel, ignore_rest) {
        this.set_velocity(this.velocity.add(vel));
    }

    physics_step(time_delta) {
        this.add_pos(this.velocity.mul(time_delta), true);

        this.last_pos = this.position;
    }

    collides_line(line) {
        // a line is given mathematically as ax+by+c=0, with optional limits of x and/or y
        // we naively get the distance and treat the line as fully 2d (so it cannot collide on the side).
        // the only two cases we care about is "in front" and "behind" the line

        // check coordinate bounds
        // it's out of bounds if its position minus radius is > greater bound or position plus radius < lower bound
        if (line.lbx && this.position.x + this.radius < line.lbx) {
            return false;
        }

        if (line.lby && this.position.y + this.radius < line.lby) {
            return false;
        }

        if (line.ubx && this.position.x - this.radius > line.ubx) {
            return false;
        }

        if (line.uby && this.position.y - this.radius > line.uby) {
            return false;
        }

        // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
        let a = line.a;
        let b = line.b;
        let c = line.c;
        let distance = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);

        // if (this.position.y >= 145 && line.id == 1) {
        //     //debugger;
        // }

        // if (distance < this.radius) {
        //     // console.log("collision: distance", distance, "with line ID", line.id);
        // }

        return distance < this.radius;
    }

    resolve_line_collision(board, line) {
        // console.log("collided");

        // https://stackoverflow.com/questions/573084/how-to-calculate-bounce-angle
        // need the surface normal vector of the line. then, split the velocity into parallel and perpendicular components
        let normal_vec = new Vector2(line.a, line.b).normalize();

        // u is perpendicular to the line (so is the part we reverse, affected by restitution), w is parallel (affected by friction)
        let u = normal_vec.mul(this.velocity.dot(normal_vec))
        let w = this.velocity.sub(u);

        let new_velocity = u.mul(-this.bounce_factor).add(w.mul(this.friction_factor));

        /*
        // need to get the incidence angle, then it's just year 11 mechanics
        // incidence angle should just be the direction of motion; we then rotate that angle around the line's angle
        // (angle mod is 180-line_angle, direction of mod is based on whether the angle of approach is > 180 (-1) or not (1))
        let incidence_angle = this.velocity.angle();

        let line_vector = new Vector2(line.b, line.a); // y=mx; x=1; y=m
        let line_angle = line_vector.angle();

        let angle_mod = Math.PI - line_angle;
        let angle_mod_sign = line_vector.angle_between(this.velocity) < Math.PI ? -1 : 1;

        let result_angle = incidence_angle + (angle_mod * angle_mod_sign);

        // console.log(line_vector, incidence_angle / Math.PI * 180, line_angle / Math.PI * 180, angle_mod / Math.PI * 180);
        // console.log(`incidence: ${incidence_angle / Math.PI * 180}  rebound: ${result_angle / Math.PI * 180}`);
        */

        // roll back position to the point at which it would intersect the line
        let a = line.a;
        let b = line.b;
        let c = line.c;
        let distance = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);

        let rollback_distance = this.radius - distance;

        // console.log("original pos", this.position);

        this.add_pos(this.velocity.normalize().mul(-rollback_distance));

        // update velocity
        this.set_velocity(new_velocity);

        // console.log("rollback pos", this.position);

        // add the rollback amount with the new velocity (this essentially simulates the time between steps if we're catching up with an object "stuck" in a line)
        // this.add_pos(this.velocity.mul(-rollback_distance));

        // console.log("final pos", this.position);

        // let distance_after_rollback = Math.abs(this.position.x * a + this.position.y * b + c) / Math.sqrt(a*a + b*b);
        // console.log(`distance before rollback: ${distance} | after rollback: ${distance_after_rollback}`);
        // console.log("velocity:", this.velocity);
    }

    collides(other) {
        let radius_sum = this.radius + other.radius;
        let radius_sum_sqr = compat_pow(radius_sum, 2);

        return other.position.sqr_distance(this.position) <= radius_sum_sqr;
    }

    resolve_collision(board, other, apply_push=true) {
        // need to push the balls apart after a collision
        let delta = this.position.sub(other.position);
        let dlen = delta.magnitude();

        if (dlen == 0) {
            this.add_pos(new Vector2((this.board.random() * 0.0001) - 0.00005, (this.board.random() * 0.0001) - 0.00005))
            return;
        }

        let mtd = delta.mul(
            ((this.radius + other.radius) - dlen) / dlen
        );

        let mtd_normalized = mtd.normalize();

        // get the inverse masses
        let inverse_mass_this = 1 / this.mass;
        let inverse_mass_other = 1 / other.mass;
        let inverse_mass_sum = inverse_mass_this + inverse_mass_other;

        // push/pull apart based on mass so that they're "rolled back" to the collision position
        if (apply_push) {
            this.set_pos(this.position.add(mtd.mul(inverse_mass_this / inverse_mass_sum)));
            other.set_pos(other.position.sub(mtd.mul(inverse_mass_other / inverse_mass_sum)));
        }

        // find the impact speed
        let impact_vector = this.velocity.sub(other.velocity);
        let vn = impact_vector.dot(mtd_normalized);

        if (vn > 0) {
            // intersecting but moving away from each other already, so don't need to do anything
            return;
        }

        // calculate impulse
        let impulse_magnitude_this = (-(1 + this.bounce_factor) * vn) / inverse_mass_sum;
        let impulse_magnitude_other = ((1 + other.bounce_factor) * vn) / inverse_mass_sum;

        let impulse_this = mtd_normalized.mul(impulse_magnitude_this);
        let impulse_other = mtd_normalized.mul(impulse_magnitude_other);

        // apply change to momentum
        this.add_impulse(impulse_this);
        other.add_impulse(impulse_other);
    }
}

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
    // 8 for topbar, 16 for bottombar, 8 for top span item
    let canvas_smallest = Math.min(vh(100 - 8 - 8 - 16, true), vw(100) - 128);

    // size on a 1920x1080p monitor on chrome because my
    // personal experience is more important than all of yalls.
    // i would apologise but im not sorry
    canvas_base_size = 625;

    canvas_height = canvas_base_size;
    canvas_width = canvas_base_size;

    const DPR = window.devicePixelRatio ?? 1;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_smallest + "px";
        canvas.style.height = canvas_smallest + "px";
    
        // might work, might not
        ctx.canvas.width = canvas_width * DPR;
        ctx.canvas.height = canvas_height * DPR;
        ctx.scale(DPR, DPR);

        ctx.imageSmoothingEnabled = false;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        // canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        // canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    document.querySelectorAll(".behind-canvases").forEach(elem => { if (elem.id != "sandbox_load_replays") { elem.style.width = canvas_smallest + "px" } });
    document.querySelectorAll(".behind-canvases").forEach(elem => { if (elem.id != "sandbox_load_replays") { elem.style.height = canvas_smallest + "px" } });

    document.querySelector(".everything-subcontainer").style.height = canvas_smallest + "px";

    layers.bg3.ctx.fillStyle = "#000"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    // show the big scary blocker screen if viewport is bad
    if (true || is_valid_viewport()) {
        document.querySelector("#desktop_mode_prompt").classList.add("nodisplay");
    } else {
        document.querySelector("#desktop_mode_prompt").classList.remove("nodisplay");
    }

    //refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_watermark() {
    layers.front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    layers.front.ctx.globalAlpha = 0.5;
    write_text(
        layers.front.ctx,
        `available for free at ${BASE_URL} :)`,
        20, canvas_height - 20,
        "white", CANVAS_FONTS, 20
    );
    layers.front.ctx.globalAlpha = 1;
}

function render_diagnostics(board) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, 16, "#fff", CANVAS_FONTS, 9
    )

    let frame_times_raw = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100);
    })

    let frame_time_splits = frame_times_raw.map(t => {
        return t.toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, 28, "#fff", CANVAS_FONTS, 9
    )

    let total_bar_length = 48;
    let total_time = frame_times_raw[0] + frame_times_raw[1] + frame_times_raw[2]
    let bars = [
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[0] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[1] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[2] / total_time)))
    ]

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw" + " " + "#".repeat(bars[0]), 10, 28+12, "#0f0", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc" + " " + "#".repeat(bars[1]), 10, 28+12+12, "#f00", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait" + " " + "#".repeat(bars[2]), 10, 28+12+12+12, "#666", CANVAS_FONTS, 9
    )

    if (!board)
        return;

    write_text(
        layers.debug_front.ctx, `system energy | ${Math.round(board.balls.filter(ball => !ball.skip_physics).reduce((t, ball) => {
            let kinetic_energy = 0.5 * ball.mass * ball.velocity.sqr_magnitude();

            let height = board.size.y - ball.position.y;
            let gravitational_energy = ball.mass * board.gravity.y * height;

            return t + kinetic_energy + gravitational_energy;
        }, 0))}`, 10, 28+12+12+12+24, "white", CANVAS_FONTS, 9
    )

    let board_d_y = 28+12+12+12+24+24;

    board.balls.forEach((ball, index) => {
        let t = board_d_y + (36 * index);
        write_text(
            layers.debug_front.ctx, `ball ${index} invuln | ` + "#".repeat(Math.max(0, Math.floor(Math.min(128, ball.invuln_duration * 200)))), 10, t, ball.invuln_duration > 0 ? ball.get_current_desc_col().css() : "gray", CANVAS_FONTS, 9
        )

        write_text(
            layers.debug_front.ctx, `      hitstop | ` + "#".repeat(Math.max(0, Math.floor(Math.min(128, ball.hitstop * 200)))), 10, t + 12, ball.hitstop > 0 ? ball.get_current_desc_col().css() : "gray", CANVAS_FONTS, 9
        )
    });
}

function render_victory(board, time_until_end) {
    if (!render_victory_enabled) {
        return;
    }

    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let ctx = layers.ui1.ctx;

    let t = (8000 - time_until_end) / 1000;
    let rps = board.remaining_players();
    let b = null;
    if (rps.length >= 1) {
        bs = board.get_all_player_balls(rps[0]).filter(ball => ball.show_stats);
        b = bs[0];
    }

    if (!b) {
        // draw
        if (t > 3) {
            write_pp_bordered_text(ctx, "DRAW", canvas_width/2, 256, "white", CANVAS_FONTS, 128, true, 2, "black");
        }
    } else {
        if (t > 2) {
            write_pp_bordered_text(ctx, "VICTORY", canvas_width/2, 256, "white", CANVAS_FONTS, 128, true, 2, "black");
        }

        if (t > 3) {
            if (b instanceof HandBall) {
                // special stupid behaviour for this thing in specific
                if (!board.played_whipcrack) {
                    b.skip_physics = true;
                    b.weapon_data = [];

                    let part_pos = b.position.add(new Vector2(
                        b.radius * 1,
                        b.radius * 0.9
                    ));

                    let part = new Particle(part_pos, 0, 1, entity_sprites.get("FLIPS_YOU_OFF"), 0, 100);
                    board.spawn_particle(part, part_pos);

                    play_audio("whipcrack");
                    board.played_whipcrack = true;
                }
            }

            write_pp_bordered_text(ctx, `${b.name}${bs.length > 1 ? ` +${bs.length-1}`: ""}`, canvas_width/2, 256 + 72, b.get_current_col().css(), CANVAS_FONTS, 72, true, 2, "black");
        }

        if (t > 4.25) {
            let quote = b.quote.split("\n");
            quote.forEach((q, i) => {
                write_pp_bordered_text(
                    ctx, (i == 0 ? "\"" : "") + q + (i >= quote.length-1 ? "\"" : ""),
                    canvas_width/2, 256 + 72 + 36 + (16 * i),
                    b.get_current_desc_col().css(), CANVAS_FONTS, 16, true, 2, "black"
                )
            });
        }
    }
}

function render_game(board, collision_boxes=false, velocity_lines=false, background_tint=null) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);

    layers.bg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    if (background_tint) {
        layers.bg3.ctx.fillStyle = background_tint;
        layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
    }

    if (true) {
        layers.debug_back.ctx.clearRect(0, 0, canvas_width, canvas_height);
    }

    // balls can be from 0 to 10000
    // so need to translate those positions into the canvas space
    // rely upon it being square... for now

    screen_scaling_factor = canvas_width / board.size.x;

    let ctx = layers.fg2.ctx;

    let w = 25 * screen_scaling_factor;

    // particles
    board.particles.forEach(particle => {
        if (particle.delay > 0) {
            return;
        }

        let particle_screen_pos = new Vector2(
            (particle.position.x) * screen_scaling_factor,
            (particle.position.y) * screen_scaling_factor,
        );

        let siz = particle.size * screen_scaling_factor * 128;

        particle_screen_pos = particle_screen_pos.add(new Vector2(-siz, -siz).mul(0));

        let sprite = particle.sprites[particle.cur_frame];

        if (typeof sprite === "string") {
            write_pp_bordered_text(
                layers.fg1.ctx, sprite,
                particle_screen_pos.x, particle_screen_pos.y,
                particle.text_col.css(), CANVAS_FONTS, (particle.text_size * particle.size) / PARTICLE_SIZE_MULTIPLIER,
                true, 1, particle.text_border_col.css(), particle.text_modifiers
            );
        } else {
            write_rotated_image(
                layers.fg1.canvas, layers.fg1.ctx,
                particle_screen_pos.x, particle_screen_pos.y,
                sprite,
                siz, siz, particle.rotation_angle
            );
        }
    })

    // then the projectiles. put them on fg3, same as weapons
    board.projectiles.forEach(projectile => {
        if (!projectile.active || (projectile.render_delay && projectile.lifetime < projectile.render_delay)) {
            return;
        }

        let layer = projectile.alternative_layer ? layers[projectile.alternative_layer] : layers.fg3;

        if (projectile.sprite != "HITSCAN") {
            let projectile_screen_pos = new Vector2(
                (projectile.position.x) * screen_scaling_factor,
                (projectile.position.y) * screen_scaling_factor,
            );

            let siz = projectile.size * screen_scaling_factor * 128;

            write_rotated_image(
                layer.canvas, layer.ctx,
                projectile_screen_pos.x, projectile_screen_pos.y,
                projectile.sprite instanceof Image ? projectile.sprite : entity_sprites.get(projectile.sprite)[0],
                siz, siz, projectile.direction_angle
            );
        } else {
            // draw a line from position to target with given width
            // and colour
            let projectile_screen_start_pos = new Vector2(
                (projectile.position.x) * screen_scaling_factor,
                (projectile.position.y) * screen_scaling_factor,
            );

            let projectile_screen_end_pos = new Vector2(
                (projectile.target_position.x) * screen_scaling_factor,
                (projectile.target_position.y) * screen_scaling_factor,
            );

            let projectile_lifetime_proportion = (projectile.lifetime - projectile.render_delay) / (projectile.duration - projectile.render_delay);
            // every line can be 1000 segments. start the line at 1000 * proportion segments down
            // then scale the rest from 0% up to 100% at the end

            layer.ctx.strokeStyle = projectile.sprite_colour;

            let segments = 100;
            let line_start_point = 0;
            let max_width = projectile.get_width();
            let remaining_line_segs = segments - line_start_point;
            let initial_pos = projectile_screen_start_pos.lerp(projectile_screen_end_pos, line_start_point / segments);
            let last_pos = initial_pos;

            for (let i=line_start_point+1; i<segments; i++) {
                let pos = projectile_screen_start_pos.lerp(projectile_screen_end_pos, i / segments);

                let w_factor = (i - line_start_point) / remaining_line_segs; // 0.8
                let w_reduction_factor = 1 - w_factor; // 0.2
                let scaled_w_reduction_factor = w_reduction_factor * projectile_lifetime_proportion; // 0.1
                w_factor = 1 - scaled_w_reduction_factor // 0.9

                if (w_factor <= 0) {
                    continue;
                }

                if (projectile.ignore_smoothing) {
                    w_factor = 1;
                }

                layer.ctx.lineWidth = w_factor * max_width;

                layer.ctx.beginPath();
                layer.ctx.moveTo(last_pos.x, last_pos.y);
                layer.ctx.lineTo(pos.x, pos.y);
                layer.ctx.stroke();
                layer.ctx.closePath();

                last_pos = pos;
            }
        }

        if (collision_boxes) {
            // render the collision boxes on debug_back as green circles
            // collision boxes are based on the original 128x128 sizing
            // so get the offset, then add the collision pos offset, then draw that
            let hitboxes = projectile.get_hitboxes_offsets();
            hitboxes.forEach((hitbox_offset, index) => {
                let hitbox = projectile.hitboxes[index];

                let hitbox_screen_pos = projectile.position.add(hitbox_offset).mul(screen_scaling_factor);
                let w2 = w / 8;

                layers.debug_back.ctx.beginPath();
                layers.debug_back.ctx.arc(
                    hitbox_screen_pos.x, hitbox_screen_pos.y, 
                    (hitbox.radius * projectile.size * screen_scaling_factor) - (w2/2),
                    0, 2 * Math.PI, false
                );
                layers.debug_back.ctx.fillStyle = new Colour(255, 255, 0, 128).css();
                layers.debug_back.ctx.fill();
                layers.debug_back.ctx.lineWidth = w2;
                layers.debug_back.ctx.strokeStyle = new Colour(255, 255, 0, 255).css();
                layers.debug_back.ctx.stroke();
                layers.debug_back.ctx.closePath();
            })
        }
    });

    // then the balls and weapons
    board.balls.forEach(ball => {
        let ball_screen_pos = new Vector2(
            (ball.position.x) * screen_scaling_factor,
            (ball.position.y) * screen_scaling_factor,
        );

        if (ball.display) {
            ctx.beginPath();
            ctx.arc(ball_screen_pos.x, ball_screen_pos.y, Math.max(0, (ball.radius * screen_scaling_factor) - (w/2)), 0, 2 * Math.PI, false);
            
            let ball_col = ball.get_current_col();
            if (ball.invuln_duration > 0 && ball.last_hit == 0) {
                ball_col = ball_col.lerp(Colour.black, 0.75);
            }
            
            ctx.fillStyle = ball_col.css();
            ctx.fill();
            ctx.lineWidth = w;
            ctx.strokeStyle = ball_col.lerp(Colour.white, 0.75).css();
            ctx.stroke();

            let hp = Math.max(0, ball.hp);

            ctx.fillStyle = "black";
            ctx.font = `22px ${CANVAS_FONTS}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(Math.ceil(hp), ball_screen_pos.x-0.5, ball_screen_pos.y-0.5);
            ctx.fillText(Math.ceil(hp), ball_screen_pos.x+0.5, ball_screen_pos.y-0.5);
            ctx.fillText(Math.ceil(hp), ball_screen_pos.x-0.5, ball_screen_pos.y+0.5);
            ctx.fillText(Math.ceil(hp), ball_screen_pos.x+0.5, ball_screen_pos.y+0.5);

            ctx.closePath();

            // now draw the weapons
            // weapon needs to be drawn at an offset from the ball (radius to the right)
            // with that offset rotated by the angle as well
            ball.weapon_data.forEach((weapon, index) => {
                if (weapon.size_multiplier <= 0) {
                    return;
                }

                let offset = ball.get_weapon_offset(index);

                let siz = weapon.size_multiplier * screen_scaling_factor * 128;
                let pos = ball.position.add(offset).mul(screen_scaling_factor);

                if (weapon.sprite) {
                    write_rotated_image(layers.fg3.canvas, layers.fg3.ctx, pos.x, pos.y, entity_sprites.get(weapon.sprite)[0], siz, siz, weapon.angle);
                }

                if (collision_boxes) {
                    // render the collision boxes on debug_back as green circles
                    // collision boxes are based on the original 128x128 sizing
                    // so get the offset, then add the collision pos offset, then draw that
                    let hitboxes_offsets = ball.get_hitboxes_offsets(index);
                    weapon.hitboxes.forEach((hitbox, index) => {
                        let hitbox_offset = offset.add(hitboxes_offsets[index]);

                        let hitbox_screen_pos = ball.position.add(hitbox_offset).mul(screen_scaling_factor);
                        let w2 = w / 8;

                        layers.debug_back.ctx.beginPath();
                        layers.debug_back.ctx.arc(
                            hitbox_screen_pos.x, hitbox_screen_pos.y, 
                            (hitbox.radius * weapon.size_multiplier * screen_scaling_factor) - (w2/2),
                            0, 2 * Math.PI, false
                        );
                        layers.debug_back.ctx.fillStyle = new Colour(0, 255, 0, 128).css();
                        layers.debug_back.ctx.fill();
                        layers.debug_back.ctx.lineWidth = w2;
                        layers.debug_back.ctx.strokeStyle = new Colour(0, 255, 0, 255).css();
                        layers.debug_back.ctx.stroke();
                        layers.debug_back.ctx.closePath();
                    })
                }
            })
        }
    })
}

function render_descriptions(board) {
    // layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let layouts = [
        [[canvas_width - 256, 28]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144], [canvas_width - 256, 28 + 144 + 144]],
        [[canvas_width - 256, 28], [canvas_width - 256, 28 + 144], [canvas_width - 256, 28 + 144 + 144], [canvas_width - 256, 28 + 144 + 144 + 144]],
    ]

    let filtered_balls = board.balls.filter(ball => ball.show_stats);
    let layout = layouts[filtered_balls.length-1];
    
    if (layout) {
        filtered_balls.forEach((ball, index) => {
            let l = layout[index];

            let ball_col = ball.get_current_desc_col().css();
            let ball_border_col = ball.get_current_border_col().css();

            write_pp_bordered_text(
                layers.ui2.ctx,
                `${ball.name}  LV ${ball instanceof UnarmedBall ? "???" : ball.level+1}`.padEnd(17) + `| HP: ${Math.ceil(ball.hp)}`,
                l[0], l[1], ball_col, CANVAS_FONTS, 16,
                false, 1, ball_border_col
            )

            let hp = Math.max(0, Math.min(100, ball.hp));
            let hp_ailments = ball.get_ailment_hp_loss();
            // we want to write first the healthy hp, then the poison hp, then the rupture hp
            // #####===:::
            let hp_after_ailments = Math.max(0, Math.min(100, hp - (hp_ailments.poison + hp_ailments.rupture)));
            let str = "";
            let max_segments = 40;
            let remaining_segments = max_segments;
            let hp_segments = (hp_after_ailments / 100) * max_segments;
            let rupture_segments = (Math.min(hp_ailments.rupture, hp) / 100) * max_segments;
            let poison_segments = (Math.min(hp_ailments.poison, hp) / 100) * max_segments;
            let empty_segments = Math.max(0, max_segments - (hp_segments + rupture_segments + poison_segments));

            // now we have all our segments
            let chars = "#<= ";
            let adjustment = 0;
            // i need to think more on how to "rasterize" these segments so that:
            // - hp never shows empty if the ball is alive
            // - even if all hp is taken up by ailments
            // (so need to ceil pretty much all the hp)
            // (but this causes the issue of making ailments take up too much space on the bar)
            str = "#".repeat(Math.ceil(hp_segments + rupture_segments + poison_segments)) + " ".repeat(Math.floor(empty_segments));

            write_pp_bordered_text(
                layers.ui2.ctx,
                `[${str}]`,
                l[0], l[1] + 12, ball_col, CANVAS_FONTS, 9,
                false, 1, ball_border_col
            )
            
            if (ball.poison_duration > 0) {
                write_pp_bordered_text(
                    layers.ui2.ctx,
                    `${AILMENT_CHARS[1]} ${ball.poison_intensity.toFixed(2).padEnd(5)} | ${ball.poison_duration.toFixed(1)}s`,
                    l[0], l[1] + 12 + 12, ball_col, CANVAS_FONTS, 12,
                    false, 1, ball_border_col
                )
            }

            if (ball.rupture_intensity >= 0.01) {
                write_pp_bordered_text(
                    layers.ui2.ctx,
                    `${AILMENT_CHARS[0]} ${ball.rupture_intensity.toFixed(2).padEnd(5)}`,
                    l[0] + 128, l[1] + 12 + 12, ball_col, CANVAS_FONTS, 12,
                    false, 1, ball_border_col
                )
            }

            ball.render_stats(layers.ui2.canvas, layers.ui2.ctx, l[0], l[1] + 12 + 12 + 16);
        })
    }
}

let last_frame = Date.now();

let colliding_parries = new Set();
let colliding_proj2projs = new Set();

let max_game_duration = 300;
let game_end_col = new Colour(36, 0, 0).css();

let game_speed_mult = 1;
let game_paused = false;
let game_subticks = 0;  // for fixed-time

// if fps is at least this much different from the expected,
// start applying correction
let game_fps_threshold = 5;
let game_fps_catchup_modifier = 1;

let total_steps = 0;

let fullpause_timeout = 0;

function game_loop() {
    framecount++;

    // discard any frames 50ms or longer for fps calcs (likely anomalous)
    let filtered_frame_times = last_frame_times.filter(f => f < 50);
    let avg_frame_time = filtered_frame_times.reduce((a, b) => a + b, 0) / filtered_frame_times.length;
    fps_current = 1000/avg_frame_time;

    let frame_start_time = Date.now();

    if (board) {
        if (board.duration > max_game_duration) {
            render_game(board, keys_down["KeyQ"], false, game_end_col);
        } else {
            render_game(board, keys_down["KeyQ"], false);
        }
        render_descriptions(board);
    }

    // render_diagnostics(board);
    
    let render_end_time = Date.now();

    let calc_start_time = Date.now();
    let delta_time = calc_start_time - last_calc_time;
    last_calc_time = calc_start_time;

    // clean up old audio
    audio_playing = audio_playing.filter(audio => !audio.ended);
    
    if (board) {
        let game_delta_time = delta_time;
        let speed_mult = game_speed_mult;
        game_fps_catchup_modifier = 1;

        if (game_paused) {
            speed_mult *= 0;
        }

        fullpause_timeout -= delta_time / 1000;
        if (fullpause_timeout > 0) {
            speed_mult *= 0;
        }

        if (board.forced_time_deltas == 0) {
            // delta_time can be maximum 50ms when running realtime
            game_delta_time = Math.min(game_delta_time, 50);
        } else {
            // if forced, set to forced
            game_delta_time = board.forced_time_deltas;

            // now let's calculate our catchup modifier if needed
            // and add it to speed_mult
            let expected_fps = board.expected_fps;
            let expected_fps_diff = Math.abs(expected_fps - fps_current);
            if (expected_fps_diff > game_fps_threshold) {
                // we need to multiply the game speed so that it reaches the threshold
                // e.g. expected 144fps, running 60fps => run 144/60 = 2.4x faster
                game_fps_catchup_modifier = expected_fps / fps_current;

                speed_mult *= game_fps_catchup_modifier;
            }
        }

        let temporary_modifiers = 1;
        if (keys_down["KeyE"]) {
            speed_mult /= 8;
            temporary_modifiers /= 8;
        }

        if (keys_down["KeyF"]) {
            speed_mult *= 8;
            temporary_modifiers *= 8;
        }

        if (keys_down["KeyR"] ^ searching) {
            speed_mult *= 512;
            temporary_modifiers *= 512;
        }

        update_sim_speed_display(temporary_modifiers);

        let phys_gran = PHYS_GRANULARITY;
        let coll_gran = COLL_GRANULARITY;
        let cps = COLLS_PER_FRAME;

        // realtime does things differently (interpolates frames),
        // fixed-time doesn't have that luxury
        let num_repeats = 1;

        if (board.forced_time_deltas == 0) {
            phys_gran *= speed_mult;
            game_delta_time *= speed_mult;

            cps = phys_gran / coll_gran;
        } else {
            game_subticks += speed_mult;
            num_repeats = Math.floor(game_subticks);
            game_subticks -= num_repeats;
        }

        // the "for" component only comes into effect when we're fixed-time
        for (let tick_repeats=0; tick_repeats<num_repeats; tick_repeats++) {
            total_steps++;

            // COLL_GRANULARITY => do collision checks every N physics steps
            for (let i=0; i<phys_gran; i++) {
                board.physics_step(game_delta_time / (1000 * phys_gran));

                if ((i+1) % coll_gran == 0) {
                    let coll_game_delta_time = game_delta_time / (1000 * cps);

                    // if multiple weapons collide, the first one takes priority
                    let hitstop = 0;

                    board.tension_step(coll_game_delta_time);

                    // triggers
                    board.timers_step(coll_game_delta_time);

                    // projectile weaponsteps
                    board.projectiles.forEach(projectile => {
                        projectile.weapon_step(board, coll_game_delta_time)
                    })

                    // parrying (weapon on weapon)
                    colliding_parries.clear();
                    board.balls.forEach(ball => {
                        if (ball.skip_physics)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            board.balls.forEach(other => {
                                if (other.skip_physics)
                                    return;  // skip_physics balls should completely stop

                                if (colliding_parries.has((ball.id * 10000000) + other.id) || ball.allied_with(other)) {
                                    return;
                                }

                                if (ball.id != other.id) {
                                    let colliding_pairs = ball.check_weapon_to_weapon_hit_from(other);

                                    if (colliding_pairs.length > 0) {
                                        colliding_parries.add((ball.id * 10000000) + other.id);
                                        colliding_parries.add((other.id * 10000000) + ball.id);

                                        let colliding_pair = colliding_pairs[0];

                                        let source_index = colliding_pair[0];
                                        let other_index = colliding_pair[1];

                                        // parry causes an explosive force of the balls away from each other
                                        // plus the directions of the weapons reverse
                                        ball.reverse_weapon(source_index);
                                        other.reverse_weapon(other_index);

                                        ball.parry_weapon(source_index, other, other_index);
                                        other.parry_weapon(other_index, ball, source_index);

                                        let diff_vec = other.position.sub(ball.position).normalize();

                                        // we're going to get the magnitude of the directions, *0.25,
                                        // add *0.75 of the difference vector, and remultiply
                                        let share = 0.75;

                                        let ball_diff_add = diff_vec.mul(-share);
                                        let other_diff_add = ball_diff_add.mul(-1);

                                        let ball_mag = ball.velocity.magnitude();
                                        let other_mag = other.velocity.magnitude();

                                        new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag)
                                        new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

                                        ball.set_velocity(new_ball_velocity);
                                        other.set_velocity(new_other_velocity);

                                        ball.last_hit = 1;
                                        other.last_hit = 1;

                                        ball.apply_invuln(BALL_INVULN_DURATION);
                                        other.apply_invuln(BALL_INVULN_DURATION);

                                        // if either ball has a custom parry sound, use that - if both do, use the first
                                        if (ball.custom_parry_sound || other.custom_parry_sound) {
                                            let snd = ball.custom_parry_sound || other.custom_parry_sound;
                                            if (snd) {
                                                play_audio(snd);
                                            }
                                        } else {
                                            play_audio("parry");
                                        }
                                    }
                                }
                            });
                        }
                    })

                    // projectile parrying (weapon on projectile)
                    board.balls.forEach(ball => {
                        if (ball.skip_physics)
                            return;  // skip_physics balls should completely stop

                        // don't check our own team's projectiles
                        let projectiles = board.projectiles.filter(projectile => 
                            projectile.active && 
                            !projectile.ignore_balls.has(ball.id) && 
                            (!ball.allied_with(projectile.source) || projectile.can_hit_allied) &&
                            (ball.id != projectile.source.id || projectile.can_hit_source)
                        );
                        
                        let intersecting_projectiles = ball.check_weapon_to_projectiles_hits(projectiles);

                        let play_parried_audio = false;
                        intersecting_projectiles.forEach(projectile_data => {
                            let projectile = projectile_data[1];
                            let parry_weapon_index = projectile_data[0];

                            if (!projectile.parriable) {
                                return;
                            }

                            // if the projectile is hitscan AND colliding with both the ball and the weapon,
                            // only parry it if the closest weapon hitbox is closer to the origin than the ball
                            if (projectile instanceof HitscanProjectile) {
                                let ball_hit_by_projectile = ball.check_projectiles_hit_from([projectile]);
                                if (ball_hit_by_projectile.length > 0) {
                                    // get a list of the weapon's hitboxes
                                    let source_weapon = ball.weapon_data[parry_weapon_index];

                                    let weapon_offset = ball.get_weapon_offset(parry_weapon_index);
                                    let hitboxes_offsets = ball.get_hitboxes_offsets(parry_weapon_index);

                                    let closest_weapon_hitbox_dist = Number.POSITIVE_INFINITY;
                                    hitboxes_offsets.forEach((offset, index) => {
                                        let hitbox_pos = ball.position.add(weapon_offset).add(offset);
                                        let hitbox_dist = hitbox_pos.sqr_distance(projectile.position);

                                        // we also need to take into account hitbox radius (take away hitbox square radius from dist)
                                        closest_weapon_hitbox_dist = Math.min(closest_weapon_hitbox_dist, hitbox_dist - compat_pow(source_weapon.hitboxes[index].radius, 2));
                                    })

                                    // now compare. we only parry if closest_weapon_hitbox_dist is smaller
                                    let ball_dist = ball.position.sqr_distance(projectile.position);

                                    if (ball_dist < closest_weapon_hitbox_dist) {
                                        return;
                                    }
                                }
                            }

                            if (ball.invuln_duration <= 0 && projectile.play_parried_audio) {
                                play_parried_audio = true;
                            }

                            // board will clean it up
                            projectile.get_parried(ball);

                            ball.reverse_weapon(parry_weapon_index);
                            ball.parry_projectile(parry_weapon_index, projectile);
                            
                            projectile.source.get_projectile_parried(ball, projectile);

                            // we actually move the ball in the direction the projectile was travelling
                            let diff_vec = projectile.direction;

                            // we're going to get the magnitude of the directions, *0.25,
                            // add *0.25 of the difference vector, and remultiply
                            let share = 0.25;

                            let ball_diff_add = diff_vec.mul(share);
                            let ball_mag = ball.velocity.magnitude();
                            new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag);
                            ball.set_velocity(new_ball_velocity);
                            
                            ball.last_hit = 1;
                            
                            ball.apply_invuln(BALL_INVULN_DURATION * 0.5);
                        })

                        if (play_parried_audio) {
                            if (ball.custom_projectile_parry_sound) {
                                play_audio(ball.custom_projectile_parry_sound);
                            } else {
                                play_audio("parry2");
                            }
                        }
                    });

                    let impact_sounds = 0;

                    // hitting (weapon on ball)
                    board.balls.forEach(ball => {
                        if (ball.skip_physics)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            // OK to check for hits (not in invuln window)
                            board.balls.forEach(other => {
                                if (other.skip_physics)
                                    return;  // skip_physics balls should completely stop

                                // make sure we don't check collisions with our own team
                                if (!ball.allied_with(other)) {
                                    let colliding_weapons = ball.check_weapons_hit_from(other);
                                    if (colliding_weapons.length > 0) {
                                        let weapon_index = colliding_weapons[0];  // ignore all others

                                        ball.last_hit = 0;
                                        let result = other.hit_other(ball, weapon_index);
                                        ball.last_damage_source = other;
                                        
                                        if (!result.snd) {
                                            if (impact_sounds < 4) {
                                                if (result.dmg >= 8) {
                                                    impact_sounds++;
                                                    play_audio("impact_heavy");
                                                } else {
                                                    impact_sounds++;
                                                    play_audio("impact");
                                                }
                                            }
                                        } else {
                                            // always play special impact sounds
                                            impact_sounds++;
                                            play_audio(result.snd);
                                        }

                                        // TODO - need to at this point do accounting on damage taken/dealt,
                                        // and end the game / remove balls if they die

                                        hitstop = Math.max(hitstop, result.hitstop ?? 0);
                                    }
                                }
                            })
                        }
                    })

                    // projectile hitting (projectile on ball)
                    board.balls.forEach(ball => {
                        if (ball.skip_physics)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            // don't check our own projectiles
                            let projectiles = board.projectiles.filter(projectile => 
                                projectile.active && 
                                !projectile.ignore_balls.has(ball.id) && 
                                (!ball.allied_with(projectile.source) || projectile.can_hit_allied) &&
                                (ball.id != projectile.source.id || projectile.can_hit_source)
                            );

                            let intersecting_projectiles = ball.check_projectiles_hit_from(projectiles);
                            
                            // same rules as normal thing except we go through the get_hit_by for projectiles instead
                            // and delete the projectile
                            intersecting_projectiles.forEach(projectile => {
                                if (this.invuln_duration > 0) {
                                    return;  // don't care if now invuln
                                }

                                ball.last_hit = 0;
                                let result = projectile.source.hit_other_with_projectile(ball, projectile);
                                projectile.hit_ball(ball, coll_game_delta_time);
                                ball.last_damage_source = projectile.source;

                                if (!result.mute) {
                                    if (impact_sounds < 4) {
                                        impact_sounds++;
                                        play_audio("impact");
                                    }
                                }

                                hitstop = Math.max(hitstop, result.hitstop ?? 0);
                            });
                        }
                    })

                    // projectile collisions (projectile on projectile)
                    colliding_proj2projs.clear()
                    board.projectiles.forEach(projectile => {
                        if (!projectile.active || !projectile.collides_other_projectiles) 
                            return;

                        let projectiles_in_scope = board.projectiles.filter(other => 
                            projectile.id !== other.id &&
                            other.parriable && other.collides_other_projectiles &&
                            (!other.source.allied_with(projectile.source) || (projectile.can_hit_allied && other.can_hit_allied))
                        );

                        let projectiles_colliding = projectile.check_projectiles_colliding(projectiles_in_scope);
                        projectiles_colliding = projectiles_colliding.filter(proj => !colliding_proj2projs.has(proj.id + (1000000 * projectile.id)))

                        projectiles_colliding.forEach(proj => {
                            if (proj.parriable) {
                                projectile.hit_other_projectile(proj);
                            }
                            if (projectile.parriable) {
                                proj.hit_other_projectile(projectile);
                            }
                            colliding_proj2projs.add(proj.id + (1000000 * projectile.id));

                            // if either projectile was active and now isn't, play a thud
                            if (!proj.active || !projectile.active) {
                                play_audio("thud");
                            }
                        });
                    })

                    // if the board duration is past the max duration, deal 5dps to all balls
                    if (board.duration > max_game_duration) {
                        board.balls.forEach(ball => ball.lose_hp(5 * coll_game_delta_time, "endgame"));
                    }

                    // cull any dead balls
                    board.balls = board.balls.filter(ball => {
                        // keep skip_physics balls around
                        if (ball.skip_physics) {
                            return true
                        }

                        if (ball.hp > 0) {
                            return true;
                        } else {
                            let result = ball.die();

                            if (!result.skip_default_explosion) {
                                if (ball.show_stats) {
                                    board.spawn_particle(new Particle(
                                        ball.position.add(new Vector2(256+64, -512)), 0, 2, entity_sprites.get("explosion"), 12, 3, false
                                    ), ball.position.add(new Vector2(256+64, -512)));

                                    play_audio("explosion");
                                } else {
                                    board.spawn_particle(new Particle(
                                        ball.position.add(new Vector2(144, -512)), 0, 1, entity_sprites.get("explosion"), 12, 3, false
                                    ), ball.position.add(new Vector2(144, -512)));

                                    // TODO make this something else thats less impactful
                                    play_audio("explosion");
                                }
                            }

                            return false;
                        }
                    });

                    // board.hitstop_time = Math.max(hitstop, board.hitstop_time);
                }
            }

            board.particles_step(game_delta_time);
            
            if (board?.remaining_players().length <= 1) {
                let players = board.remaining_players();
                if (players.length > 0) {
                    board.get_all_player_balls(players[0]).forEach(ball => ball.takes_damage = false);
                }

                match_end_timeout -= game_delta_time;
                if (searching) {
                    match_end_timeout = 0;
                }

                // "animation"
                render_victory(board, match_end_timeout);

                if (match_end_timeout <= 0) {
                    audio_playing.forEach(audio => audio.source.stop());

                    if (board.remaining_players().length == 1 && winrate_tracking) {
                        let winning_balls = board.get_all_player_balls(board.remaining_players()[0]).filter(ball => ball.show_stats);
                        if (winning_balls.length >= 1) {
                            let winning_ball = winning_balls[0];
                            let winning_ball_class = selectable_balls_for_random.find(t => winning_ball instanceof t);

                            let losing_balls = start_balls.filter(b => b.name != winning_ball_class.name);
                            
                            if (losing_balls.length >= 1) {
                                let winning_ball_index = selectable_balls_for_random.findIndex(t => winning_ball instanceof t);
                                let losing_ball_index = selectable_balls_for_random.findIndex(t => losing_balls[0].name == t.name);
                                
                                win_matrix[winning_ball_index][losing_ball_index] += 1;
                            }

                            if (readable_table) {
                                displayelement.textContent = (" ".repeat(12) + selectable_balls_for_random.map(t => t.name.padEnd(12)).join("") + "\n" + win_matrix.map((a, i) => `${selectable_balls_for_random[i].name.padEnd(12)}` + a.map((b, j) => `${b === 0 ? "-" : b}`.padEnd(12)).join("")).join("\n"));
                            } else {
                                displayelement.textContent = (win_matrix.map(t => t.map(v => v == 0 ? "-" : v).join("\t")).join("\n"));
                            }

                            // to get wins of ball, get row
                            // to get losses, get col
                            let html = "";
                            selectable_balls_for_random.forEach((classobj, index) => {
                                let wins = win_matrix[index].reduce((p,c) => p+c, 0);
                                let losses = win_matrix.map(t => t[index]).reduce((p,c) => p+c, 0);;
                                let total = wins + losses;
                                let winrate = wins / total;

                                let lerp_to = winrate > 0.5 ? Colour.blue : Colour.red;
                                let lerp_amt = Math.min(1, Math.max(Math.abs(winrate-0.5)-0.02, 0) * 20);

                                html += `${classobj.name.padEnd(16)}${wins.toFixed(0).padStart(4)} / ${total.toFixed(0).padEnd(8)}<span style="background-color: ${Colour.dgreen.lerp(lerp_to, lerp_amt).css()}">${isNaN(winrate) ? "   -   " : ((winrate * 100).toFixed(2)+"%").padEnd(8)}</span><br>`;
                            });

                            document.querySelector("#game_winrates").innerHTML = html;

                            let html2 = "";

                            selectable_balls_for_random.forEach((class1, index1) => {
                                selectable_balls_for_random.forEach((class2, index2) => {
                                    // class1 wr vs class2
                                    let wins = win_matrix[index1][index2];
                                    let losses = win_matrix[index2][index1];
                                    let total = wins + losses;
                                    let winrate = wins / total;

                                    let lerp_to = winrate > 0.5 ? Colour.blue : Colour.red;
                                    let lerp_amt = Math.min(1, Math.max(Math.abs(winrate-0.5)-0.1, 0) * 5);

                                    html2 += `<span style="background-color: ${Colour.dgreen.lerp(lerp_to, lerp_amt).css()}"> ${isNaN(winrate) ? "   -   " : ((winrate * 100).toFixed(2)+"%").padEnd(7)}</span>`;
                                })

                                html2 += "<br>";
                            });

                            document.querySelector("#game_winrates_split").innerHTML = html2;
                        }
                    }
                    
                    exit_battle(true);
                    break;
                }
            }
        }
    }

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
    let expected_next_frame = frame_start_time + (1000/fps_current);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    window.requestAnimationFrame(game_loop);
}
