game_id = "balls";

const FILES_PREFIX = "";

const GAME_VERSION = "02/02/2026";

const AILMENT_CHARS = "➴☣♨";

const layer_names = [
    "front",
    "debug_front",
    "debug_back",
    "ui1",
    "ui2",
    "ui3",
    "ui4",
    "fg1",
    "fg2_raster",
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

const CANVAS_FONTS = "MS Gothic, terminus, Roboto Mono, monospace";

let num_textures_loaded = 0;
let num_textures_needed = 0;

const make_damage_numbers = true;

let ending_game = false;
let mysterious_powers_enabled = false;
let current_mysterious_power = {name: null, power: 5};

let STARTING_HP = 100;
let stored_starting_hp = null;

let run_function_on_match_end = null;

const BALL_RENDERING_METHODS = {
    VECTOR: "VECTOR",
    RASTER: "RASTER",
    AERO: "AERO",
}

const AERO_LIGHTING_CONFIGS = {
    SIMPLE: "SIMPLE",
    WHATS_WRONG_BRO: "WHATS_WRONG_BRO",
    NEON: "NEON",
}

const AERO_BACKGROUNDS = {
    RENDERED: "RENDERED",
    VISTA: "VISTA",
    PARALLAX_GRID: "PARALLAX_GRID",
}

let render_data = {};

let BALL_RENDERING_METHOD = BALL_RENDERING_METHODS.VECTOR;
let AERO_LIGHTING_CONFIG = AERO_LIGHTING_CONFIGS.WHATS_WRONG_BRO;
let AERO_BACKGROUND = AERO_BACKGROUNDS.VISTA;

let bg_changed = true;
let switched_to_endgame_col = false;
let balls_need_aero_recache = false;

let BALL_DESC_BORDER_SIZE = BALL_RENDERING_METHOD == BALL_RENDERING_METHODS.AERO ? 2 : 1;

// TODO - need to fix collision weirdness when hitting sides of lines
const board_obstacles = [
    board => [],
    board => {
        return [{
                // ax + by + c = 0
                id: 2,

                a: 1,
                b: 0,
                c: (-board.size.x / 2) - 512,

                lbx: null,
                ubx: null,
                lby: (board.size.y / 2) - 512,
                uby: (board.size.y / 2) + 512,

                projectile_solid: true,
            },

            {
                // ax + by + c = 0
                id: 2,

                a: 1,
                b: 0,
                c: (-board.size.x / 2) + 512,

                lbx: null,
                ubx: null,
                lby: (board.size.y / 2) - 512,
                uby: (board.size.y / 2) + 512,

                projectile_solid: true,
            },

            {
                // ax + by + c = 0
                id: 2,

                a: 0,
                b: 1,
                c: (-board.size.y / 2) - 512,

                lbx: (board.size.x / 2) - 512,
                ubx: (board.size.x / 2) + 512,
                lby: null,
                uby: null,

                projectile_solid: true,
            },

            {
                // ax + by + c = 0
                id: 2,

                a: 0,
                b: 1,
                c: (-board.size.y / 2) + 512,

                lbx: (board.size.x / 2) - 512,
                ubx: (board.size.x / 2) + 512,
                lby: null,
                uby: null,

                projectile_solid: true,
            }
        ]
    }
]

const DEFAULT_POWERUPS_FREQUENCY = [10, 20];

const entity_sprites = new Map([
    // Vista - https://www.reddit.com/r/FrutigerAero/comments/1eqwt3s/windows_vistainspired_wallpapers_i_made_in_about/
    ["vista", 1, "etc/"],

    // entries
    ["entry_impact", 16, "entries/impact/"],
    ["entry_teleport", 16, "entries/teleport/"],
    ["entry_wizard_circle", 16, "entries/wizard_circle/"],
    ["entry_smokebomb", 16, "entries/smokebomb/"],
    ["entry_snipe", 16, "entries/snipe/"],
    ["entry_load", 16, "entries/load/"],
    ["entry_rift_front", 16, "rift/front/"],
    ["entry_rift_back", 16, "rift/back/"],

    // powerups
    ["powerup_empty", 1, "powerups/"],
    ["powerup_coin_blast", 1, "powerups/"],
    ["powerup_enhancement", 1, "powerups/"],
    ["powerup_enhancement_star", 1, "powerups/"],

    ["powerup_gift", 1, "powerups/"],
    ["powerup_heal", 1, "powerups/"],
    ["powerup_rock", 1, "powerups/"],
    ["rock", 1, "etc/"],

    ["powerup_burst_white", 1, "powerups/bursts/"],
    ["powerup_burst_gold", 1, "powerups/bursts/"],
    ["powerup_burst_pink", 1, "powerups/bursts/"],
    ["powerup_burst_red", 1, "powerups/bursts/"],
    ["powerup_burst_green", 1, "powerups/bursts/"],
    ["powerup_burst_rock", 1, "powerups/bursts/"],

    // effects
    ["parry", 9, "etc/parry/"],
    
    ["yomi_parry", 9, "etc/yomi_parry/"],  // redrawn, based on Your Only Move is Hustle

    ["hit", 6, "etc/hit/"],
    ["rupture", 1, "etc/"],
    ["poison", 1, "etc/"],
    ["burn", 1, "etc/"],
    ["point", 1, "etc/"],
    
    ["railgun_point", 1, "etc/"],

    // weapons
    ["SORD", 1, "weapon/"],
    ["SORD2", 1, "weapon/"],
    ["SORD_lightning", 1, "weapon/"],
    ["SORD_berserk", 1, "weapon/"],
    ["SORD_faithful", 1, "weapon/"],
    ["SORD_ram", 1, "weapon/"],

    ["hamer", 1, "weapon/"],
    ["hamer2", 1, "weapon/"],
    ["hamer_squeaky", 1, "weapon/"],
    ["hamer_mogul", 1, "weapon/"],
    ["money_particle", 10, "money/"],
    ["money_particle_r", 10, "money_r/"],

    ["dagger", 1, "weapon/"],
    ["pellet", 1, "weapon/"],
    ["bow", 1, "weapon/"],
    ["arrow", 1, "weapon/"],
    ["bow_crossbow", 1, "weapon/"],
    ["arrow_crossbow", 1, "weapon/"],
    
    ["gun", 1, "weapon/"],

    ["railgun", 1, "weapon/"],
    ["railgun2", 1, "weapon/"],
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

    ["glass1", 1, "weapon/"],
    ["glass2", 1, "weapon/"],
    ["glass3", 1, "weapon/"],
    ["glass4", 1, "weapon/"],
    ["glass5", 1, "weapon/"],
    ["glass_angry", 1, "weapon/"],
    ["glass_shard", 1, "weapon/"],

    ["glass_paper", 1, "weapon/"],
    ["glass_angry_paper", 1, "weapon/"],
    ["glass_shard_paper", 1, "weapon/"],

    ["glass_chainsaw", 1, "weapon/"],
    ["glass_angry_chainsaw", 1, "weapon/"],
    ["glass_shard_chainsaw", 1, "weapon/"],

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

    ["wand_black_brush", 1, "weapon/"],
    ["wand_cyan_brush", 1, "weapon/"],
    ["wand_green_brush", 1, "weapon/"],
    ["wand_magenta_brush", 1, "weapon/"],
    ["wand_red_brush", 1, "weapon/"],
    ["wand_white_brush", 1, "weapon/"],

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

    ["rosary", 1, "weapon/"],
    ["rosary_halo", 1, "weapon/"],
    ["healing_burst", 11, "healing_burst/"],

    ["fishing_rod", 1, "weapon/"],
    ["fishing_rod_thrown", 1, "weapon/"],
    ["fishing_rod_hook", 1, "weapon/"],
    ["fishing_rod_club", 1, "weapon/"],
    
    ["frying_pan", 1, "weapon/"],
    ["frying_pan_r", 1, "weapon/"],

    // FOODS...
    ["apple", 1, "weapon/frying_pan/"],
    ["avocado", 1, "weapon/frying_pan/"],
    ["bacon", 1, "weapon/frying_pan/"],
    ["banana", 1, "weapon/frying_pan/"],
    ["burger", 1, "weapon/frying_pan/"],
    ["carrot", 1, "weapon/frying_pan/"],
    ["celery", 1, "weapon/frying_pan/"],
    ["coconut", 1, "weapon/frying_pan/"],
    ["cucumber", 1, "weapon/frying_pan/"],
    ["dubious delicacy", 1, "weapon/frying_pan/"],
    ["egg", 1, "weapon/frying_pan/"],
    ["goldfish", 1, "weapon/frying_pan/"],
    ["ice cube", 1, "weapon/frying_pan/"],
    ["loaf", 1, "weapon/frying_pan/"],
    ["meat", 1, "weapon/frying_pan/"],
    ["mushroom", 1, "weapon/frying_pan/"],
    ["pancakes", 1, "weapon/frying_pan/"],
    ["pepper", 1, "weapon/frying_pan/"],
    ["soup", 1, "weapon/frying_pan/"],
    ["sushi", 1, "weapon/frying_pan/"],

    ["deck", 1, "weapon/"],
    ["deck_r", 1, "weapon/"],
    ["playingcard", 56, "cards/"],  // https://drawsgood.itch.io/8bit-deck-card-assets
    ["playingcard_glow", 5, "cards/effects/glow/"],
    ["cards_straightflush_strike", 7, "cards/effects/straightflush_strike/"],

    ["fire_blast", 6, "fire_blast/"],

    ["explosion", 16, "explosion/"],  // Game Maker Classic

    ["lightning", 7, "lightning/"],

    ["explosion_grenade", 16, "explosion_grenade/"],  // Game Maker Classic

    ["explosion3", 8, "explosion3/"],  // Sonic Rush Adventure

    ["explosion_small", 10, "explosion_small/"],  // Sonic Rush Adventure

    // Additionals
    ["LONGSORD", 1, "weapon/additional/"],
    ["stick", 1, "weapon/additional/"],
    ["lansator_de_rachete", 1, "weapon/additional/"],
    ["rachete", 1, "weapon/additional/"],
    ["shield", 1, "weapon/additional/"],
    ["skong_thread_storm", 9, "etc/skong_thread_storm/"],
    ["spike", 1, "weapon/additional/"],
    ["bullet", 1, "weapon/"],
    ["shotgun-magnum", 1, "weapon/"],

    // Etc
    ["festive red hat", 1, "etc/"],
    ["berserker_shockwave", 13, "etc/berserker_shockwave/"],
].map((v, i) => {
    let ts = [];

    if (v[1] > 1) {
        for (let i=0; i<v[1]; i++) {
            let t = new Image(128, 128);
            t.src = `${FILES_PREFIX}img/${v[2]}${v[0]}_${i.toString().padStart(3, "0")}.png`;
            t.style.imageRendering = "pixelated";

            num_textures_needed++;

            if (v[3]) {
                let e = false;
                t.addEventListener("error", function() {
                    if (!e) {
                        t.src = `${FILES_PREFIX}img/icons/unknown.png`;
                        e = true;
                    }
                })
            }

            ts.push(t);
        }
    } else {
        let t = new Image(128, 128);
        t.src = `${FILES_PREFIX}img/${v[2]}/${v[0]}.png`;
        t.style.imageRendering = "pixelated";

        num_textures_needed++;
        if (v[3]) {
            let e = false;
            t.addEventListener("error", function() {
                if (!e) {
                    t.src = `${FILES_PREFIX}img/icons/unknown.png`;
                    e = true;
                }
            })
        }

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
let game_position = new Vector2(0, 0);

let screen_to_game_scaling_factor = 1;

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
let music_audio = null;

let match_cancel_enqueued = false;

function reset_audio_buffer() {
    audio_context.close();
    audio_context = new AudioContext();

    // reduce the volume
    gain_node = audio_context.createGain();
    gain_node.connect(audio_context.destination);
    gain = 0.1;
    gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

    audio_playing = [];
    music_audio = null;
}

async function load_audio_item(path, lazy=false) {
    return await load_audio_from_url(`https://plaao.net/balls/${path}`, lazy);;
}

async function decode_audio(array_buffer) {
    return await audio_context.decodeAudioData(array_buffer);
}

async function load_audio_from_url(path, lazy=false) {
    let resp = await fetch(`${path}`);
    let array_buffer = await resp.arrayBuffer();

    if (lazy) {
        return array_buffer;
    } else {
        let audio_buffer = await decode_audio(array_buffer);

        return audio_buffer;
    }
}

let audios_list = [
    // ultrakill
    ["parry", 'snd/parry.mp3'],
    ["parry2", 'snd/parry2.mp3'],
    // https://pixabay.com/sound-effects/punch-04-383965/
    ["impact", 'snd/impact.mp3'],
    ["impact_heavy", 'snd/impact_heavy.mp3'],
    // https://pixabay.com/sound-effects/stick-hitting-a-dreadlock-small-thud-83297/
    ["thud", "snd/thud.mp3"],
    // game maker classic
    ["explosion", "snd/explosion.mp3"],
    // https://pixabay.com/sound-effects/explosion-312361/
    ["explosion2", "snd/explosion2.mp3"],
    // dragon ball z
    ["strongpunch", "snd/strongpunch.wav"],
    ["birds_chirping", "snd/birds_chirping.wav"],
    ["teleport2", "snd/teleport2.wav"],
    ["land", "snd/land.mp3"],
    ["wallhit", "snd/wallhit.wav"],
    ["airrecover_2", "snd/airrecover_2.wav"],
    ["shenron_eye_glow", "snd/shenron_eye_glow.mp3"],
    ["db_flying", "snd/db_flying.wav"],
    ["mase_charge", "snd/mase_charge.wav"],
    ["kiblast", "snd/kiblast.wav"],
    ["disc_fire", "snd/disc_fire.wav"],
    ["eyebeam_fire", "snd/eyebeam_fire.wav"],
    ["jump", "snd/jump.wav"],
    ["earthquake", "snd/earthquake.mp3"],
    // dragon ball z (explosion.wav)
    ["wall_smash", "snd/wall_smash.mp3"],
    // johnny test
    ["whipcrack", "snd/whipcrack.mp3"],
    // vine thud
    ["vine_thud", "snd/vine_thud.mp3"],
    // guilty gear: strive (ADV_057.ogg)
    ["grab", "snd/grab.mp3"],
    // heat haze shadow 2nd from tekken 7
    ["unarmed_theme", "https://scrimblo.foundation/uploads/heat_haze_shadow.mp3", "Heat Haze Shadow 2nd", "Tekken 7", true],
    // berserk (2016)
    ["CLANG", "snd/CLANG.mp3"],
    // edited versions of the originals
    ["impact_shitty", 'snd/impact_shitty.mp3'],
    ["parry_shitty", 'snd/parry_shitty.mp3'],
    // edited from https://www.youtube.com/watch?v=lMQGioXwbnI
    ["chicken", 'snd/chicken.mp3'],
    // https://pixabay.com/sound-effects/retro-hurt-1-236672/
    ["impact_8bit", 'snd/impact_8bit.mp3'],
    ["impact_heavy_8bit", 'snd/impact_heavy_8bit.mp3'],
    // https://freesound.org/people/Breviceps/sounds/468443/
    ["impact_squeak", 'snd/impact_squeak.mp3'],
    
    // i have no idea (ask vitawrap)
    ["impact_paper", 'snd/impact_paper.mp3'],
    
    // https://pixabay.com/sound-effects/bow-release-85040/
    ["bow1", 'snd/bow1.mp3'],
    ["bow2", 'snd/bow2.mp3'],

    // https://www.youtube.com/watch?v=oZK79uueLqk
    ["gun1", 'snd/gun1.mp3'],
    ["gun2", 'snd/gun2.mp3'],
    ["gun3", 'snd/gun3.mp3'],

    // https://www.youtube.com/watch?v=fzKjWrFEVBs
    ["gun_super", 'snd/gun_super.mp3'],

    // https://pixabay.com/sound-effects/coin-flip-shimmer-85750/
    ["coin", 'snd/coin.mp3'],

    // https://pixabay.com/sound-effects/glass-bottle-breaking-351297/
    ["bottle_smash", 'snd/bottle_smash.mp3'],

    // https://pixabay.com/sound-effects/bottle-pop-45531/
    ["bottle_pop", 'snd/bottle_pop.mp3'],

    // Pokemon Rumble (Wii)
    ["SE-COUNTDOWN", 'snd/SE-COUNTDOWN.wav'],
    ["battle_royale_gong", 'snd/battle_royale_gong.mp3'],

    // https://pixabay.com/sound-effects/shotgun-146188/
    ["shotgun", "snd/shotgun.mp3"],
    ["shotgun2", "snd/shotgun2.mp3"],
    ["shotgun3", "snd/shotgun3.mp3"],

    // Hollow Knight (Hornet)
    ["hornet_gitgud", "snd/hornet_gitgud.mp3"],
    ["hornet_edino", "snd/hornet_edino.mp3"],
    ["hornet_shaw", "snd/hornet_shaw.mp3"],

    // https://freesound.org/people/alkanetexe/sounds/170598/
    ["sword_schwing", "snd/sword_schwing.mp3"],

    // https://www.myinstants.com/en/instant/slot-machine-44998/
    ["WINNER", "snd/WINNER.mp3"],

    // The Legend of Zelda: A Link to the Past -- zol.wav
    ["zol", "snd/zol.wav"],

    // Final Fantasy 6
    ["BlueMagic", "snd/00BlueMagic.wav"],
    ["EsperRoar", "snd/6CEsperRoar.wav"],
    ["evoke", "snd/1CIdk.wav"],
    ["evokefail", "snd/97Bark.wav"],

    // Persona 2: Innocent Sin Portable
    ["slot_win", "snd/SE_SLOT_00008.wav"],

    // Wario Land 4
    ["FullHealthItemA", "snd/FullHealthItem_A.wav"],

    // TF2 - Frying Pan
    ["frying_pan", "snd/melee_frying_pan_01.mp3"],

    // i have NO idea
    ["munch", "snd/munch.mp3"],

    ["static", "snd/static.mp3"],  // https://pixabay.com/sound-effects/technology-fuzzy-powerdown-27852/
    ["poweroff", "snd/poweroff.mp3"],  // https://pixabay.com/sound-effects/film-special-effects-power-off-96139/

    // https://pixabay.com/sound-effects/film-special-effects-card-mixing-48088/
    ["card1", "snd/card1.mp3"],
    ["card2", "snd/card2.mp3"],
    ["card3", "snd/card3.mp3"],
    ["card4", "snd/card4.mp3"],
    ["card5", "snd/card5.mp3"],
    ["card6", "snd/card6.mp3"],
    ["card7", "snd/card7.mp3"],

    // http://pixabay.com/sound-effects/film-special-effects-card-shuffle-94662/
    ["cardshuffle", "snd/cardshuffle.mp3"],
]


let titles = [
    "",
    "Sunrise", "Winter Morning", "Summer Rain", "Amazon Queen",
    "Waterfall", "Blossom Time", "Starlight", "Dolphin Play",
    "Underwater Sun", "Ice Tower", "Voyage", "Chronologica",
    "Alice"
]

if (new URLSearchParams(window.location.search).get("nomusic") !== "true") {
    for (let i=1; i<=13; i++) {
        audios_list.push([`2048_${i}`, `https://scrimblo.foundation/uploads/2048_${i}.mp3`, titles[i], "2048 (3DS)", true]);
    }
}

if (new URLSearchParams(window.location.search).get("noaudio") == "true") {
    audios_list = [];
}

let audios_required = audios_list.length;
let audios_loaded = 0;

async function load_audio() {
    audios_list.forEach(async snd => {
        if (snd[1].startsWith("https://")) {
            audio.set(snd[0], [await load_audio_from_url(snd[1], snd[4]), snd[2], snd[3], snd[4]])
        } else {
            audio.set(snd[0], [await load_audio_item(snd[1], snd[4]), snd[2], snd[3], snd[4]])
        }
    })
}

async function prepare_lazy_audio(name) {
    let audio_content = audio.get(name);
    if (!audio_content || !audio_content[3]) {
        // not lazy, just return
        return;
    }

    let buffer = await decode_audio(audio_content[0])

    // update to buffer and set to non-lazy
    audio_content[0] = buffer;
    audio_content[3] = false;
}

function stop_music() {
    if (music_audio && music_audio[0]) {
        music_audio[0].source.stop();
    }

    document.querySelector("#loading_prompt").classList.add("hidden")
}

async function play_music(name, gain=null) {
    stop_music();

    if (muted)
        return;

    let played_music = await play_audio(name, gain);
    if (played_music !== null) {
        music_audio = [audio_playing[played_music], audio.get(name)[1], audio.get(name)[2], name];

        document.querySelector("#loading_prompt").textContent = `♪ - ${music_audio[1]} - ${music_audio[2]}`
        document.querySelector("#loading_prompt").classList.remove("hidden");
    }
}

function play_audio_data(buffer_content, gain=null) {
    let source = audio_context.createBufferSource();

    source.buffer = buffer_content;

    let mod_node = gain_node;

    if (gain) {
        let new_gain_node = audio_context.createGain();
        new_gain_node.connect(audio_context.destination);
        new_gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

        mod_node = new_gain_node;
    }

    source.connect(mod_node);

    let obj = {source: source, ended: false}
    source.addEventListener("ended", () => obj.ended = true);
    audio_playing.push(obj);

    source.start();

    return audio_playing.length - 1;
}

async function play_audio(name, gain=null) {
    // this may end up needing to fetch the audio data if it isn't preloaded
    // in that case, finish loading and set up the promise to play once decoded
    if (muted)
        return;
    
    let audio_content = audio.get(name);
    if (audio_content) {
        // this could either be a full source or base response
        let idx = null;
        if (audio_content[3]) {
            // lazy and not loaded; load it now
            await prepare_lazy_audio(name);
        }

        if (!audio_content[3]) {
            idx = play_audio_data(audio_content[0], gain);
        } else {
            // for some reason it didn't load. log and don't play
            console.log(`Audio ${name} didn't load on demand for some reason`);
        }

        return idx;
    } else {
        // Tried to play a nonexistent sound. Print to console and return null
        console.log(`Tried to play nonexistent sound ${name}!`);
        return null;
    }

    // console.log(`played sound ${name}`);
}

function point_collides_line(pos, radius, line) {
    // a line is given mathematically as ax+by+c=0, with optional limits of x and/or y
    // we naively get the distance and treat the line as fully 2d (so it cannot collide on the side).
    // the only two cases we care about is "in front" and "behind" the line

    // check coordinate bounds
    // it's out of bounds if its position minus radius is > greater bound or position plus radius < lower bound
    if (line.lbx && pos.x + radius < line.lbx) {
        return false;
    }

    if (line.lby && pos.y + radius < line.lby) {
        return false;
    }

    if (line.ubx && pos.x - radius > line.ubx) {
        return false;
    }

    if (line.uby && pos.y - radius > line.uby) {
        return false;
    }

    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    let a = line.a;
    let b = line.b;
    let c = line.c;
    let distance = Math.abs(pos.x * a + pos.y * b + c) / Math.sqrt(a*a + b*b);

    // if (this.position.y >= 145 && line.id == 1) {
    //     //debugger;
    // }

    // if (distance < this.radius) {
    //     // console.log("collision: distance", distance, "with line ID", line.id);
    // }

    return distance < radius;  
}

class Particle {
    static id_inc = 0;

    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, delay=0, render_behind=false) {
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

        this.render_behind = render_behind;

        this.unarmed_cinematic_played = false;
        this.opacity = 1;
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

            return false;
        }

        this.lifetime += time_delta;
        this.cur_frame = Math.floor(this.lifetime * this.frame_speed)
        if (this.looping) {
            this.cur_frame = this.cur_frame % this.framecount;
        }

        return true;
    }
}

class MovingParticle extends Particle {
    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, velocity, delay=0, render_behind=false) {
        super(position, rotation_angle, size, sprites, frame_speed, duration, looping, delay, render_behind)
    
        this.velocity = velocity;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            this.position = this.position.add(this.velocity.mul(time_delta));
        }
        
        return result;
    }
}

class MovingFrictionParticle extends MovingParticle {
    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, velocity, friction, delay=0, render_behind=false) {
        super(position, rotation_angle, size, sprites, frame_speed, duration, looping, velocity, delay, render_behind)
    
        this.velocity = velocity;
        this.friction = friction;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            // friction force is the same direction (signs) as velocity
            // and maximum of velocity
            let friction_force = this.velocity.normalize().mul(-1 * this.friction * time_delta);
            if (friction_force.sqr_magnitude() > this.velocity.sqr_magnitude()) {
                friction_force = this.velocity.mul(-1);
            }

            this.velocity = this.velocity.add(friction_force);
        }
        
        return result;
    }
}

class EnergyBurstParticle extends MovingParticle {
    constructor(position, size, sprites, frame_speed, duration, looping, velocity_mag, friction, linked_ball, trail_col, granularity, speed_mul, delay=0, render_behind=false) {
        super(position, 0, size, sprites, frame_speed, duration, looping, random_on_circle(velocity_mag), delay, render_behind)
    
        this.trail_col = trail_col;

        this.friction = friction;
        this.linked_ball = linked_ball;

        this.trail_cooldown_max = 0.0001;
        this.trail_cooldown = this.trail_cooldown_max;

        this.last_pos = position;
        this.last_last_pos = position;

        this.granularity = granularity;
        this.speed_mul = speed_mul;
    }

    pass_time(time_delta) {
        let times = this.granularity;
        let speed_mul = this.speed_mul;
        let time_delta_section = speed_mul * (time_delta / times);
        let last_result = true;

        for (let i=0; i<times; i++) {
            let result = super.pass_time(time_delta_section);
            if (result) {
                // check if should destroy
                if (this.position.sqr_distance(this.linked_ball.position) < Math.pow(this.linked_ball.radius * 0.9, 2)) {
                    this.lifetime = 9999;
                }
            }

            if (result) {
                this.trail_cooldown -= time_delta_section;
                if (this.trail_cooldown <= 0) {
                    this.trail_cooldown = this.trail_cooldown_max;

                    this.linked_ball.board.spawn_particle(new FadingLineParticle(
                        this.last_last_pos, this.position, this.size / 1,
                        this.trail_col, 0.25, 0, true
                    ), this.last_last_pos)
                }

                // friction force is the same direction (signs) as velocity
                // and maximum of velocity
                let friction_force = this.velocity.normalize().mul(-1 * this.friction * time_delta_section);
                if (friction_force.sqr_magnitude() > this.velocity.sqr_magnitude()) {
                    friction_force = this.velocity.mul(-1);
                }

                this.velocity = this.velocity.add(friction_force);

                // then apply force towards linked ball
                let propel_vector = this.linked_ball.position.sub(this.position).normalize();
                this.velocity = this.velocity.add(propel_vector.mul(200000 * time_delta_section));

                this.last_last_pos = this.last_pos;
                this.last_pos = this.position;
            }
            
            last_result = result;
        }

        return last_result;
    }
}

class AilmentParticle extends Particle {
    // gets bigger then smaller instead of changing frames
    constructor(position, rotation_angle, size, sprites, duration) {
        super(position, rotation_angle, size, sprites, 0, duration, false);
        
        this.base_size = this.size;
        this.get_current_size();

        this.render_behind = true;
    }

    get_current_size() {
        let proportion = this.lifetime / this.duration;
        // let siz = 1 - (2 * Math.abs(proportion - 0.5));
        let siz = 1 - proportion;

        this.size = Math.max(0, siz) * this.base_size;
    }

    pass_time(time_delta) {
        if (this.delay >= 0) {
            this.delay -= time_delta;
            if (this.delay < 0) {
                this.lifetime += -this.delay;
            }

            return false;
        }

        this.lifetime += time_delta;
        this.cur_frame = 0;
        this.get_current_size();

        return true;
    }
}

class PersistentParticle extends Particle {
    // identical except caps on last frame
    pass_time(time_delta) {
        if (this.delay >= 0) {
            this.delay -= time_delta;
            if (this.delay < 0) {
                this.lifetime += -this.delay;
            }

            return false;
        }

        this.lifetime += time_delta;
        this.cur_frame = Math.floor(this.lifetime * this.frame_speed)
        if (this.looping) {
            this.cur_frame = this.cur_frame % this.framecount;
        }
        this.cur_frame = Math.min(this.framecount-1, this.cur_frame);
        return true;
    }
}

class FadingTextParticle extends Particle {
    constructor(position, size, text, col, board, text_size, duration) {
        super(position, 0, size, [text], 0, 2, false);

        this.board = board;

        this.base_col = col;
        this.text_col = col;
        this.text_border_col = this.base_col.lerp(Colour.black, 0.6);

        this.text_size = text_size;
        this.text_modifiers = "";

        this.duration = duration;
    }

    pass_time(time_delta) {
        this.lifetime += time_delta;
        
        this.opacity = 1 - (this.lifetime / this.duration);
        
        return true;
    }
}

class FadingFollowingTextParticle extends FadingTextParticle {
    constructor(position, size, text, col, board, text_size, duration, follow_target) {
        super(position, size, text, col, board, text_size, duration);

        this.follow_target = follow_target;
        this.offset = this.position.sub(this.follow_target.position);
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            this.position = this.follow_target.position.add(this.offset);
        }

        return result;
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

        return true;
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
        this.max_downward_speed = 1200;

        this.fall_breakpoints = [
            -3000, -1200, 0, 400, 700
        ]

        this.in_starting_anim = true;
        this.frame_granular = 0;

        this.render_behind = true;
    }

    pass_time(time_delta) {
        this.lifetime += time_delta;
        
        this.position = this.position.add(this.velocity.mul(time_delta));
        this.velocity = this.velocity.add(this.gravity.mul(time_delta));
        this.velocity.y = Math.sign(this.velocity.y) * Math.max(0, Math.abs(this.velocity.y) - (this.friction * time_delta));
    
        this.velocity.y = Math.min(this.velocity.y, this.max_downward_speed);

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

        return true;
    }
}

class LineParticle extends Particle {
    constructor(position, target_position, width, colour, duration, delay=0, render_behind=false) {
        super(position, 0, width, [null], 0, duration, false, delay, render_behind);

        /** @type {Vector2} */
        this.target_position = target_position;

        /** @type {Colour} */
        this.colour = colour;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            // effectively disable cur_frame
            this.cur_frame = 0;
        }

        return result;
    }
}

class FadingLineParticle extends LineParticle {
    constructor(position, target_position, width, colour, duration, delay=0, render_behind=false) {
        super(position, target_position, width, colour, duration, delay, render_behind);
    
        this.base_width = width;
        this.get_current_width()
    }

    get_current_width() {
        let proportion = this.lifetime / this.duration;
        // let siz = 1 - (2 * Math.abs(proportion - 0.5));
        let siz = 1 - proportion;

        this.size = Math.max(0, siz) * this.base_width;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            this.get_current_width();
        }

        return result;
    }
}

class FollowParticle extends Particle {
    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, target, delay=0, render_behind=false) {
        super(position, rotation_angle, size, sprites, frame_speed, duration, looping, delay, render_behind);

        this.target = target;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            this.position = this.target.position;

            if (this.target instanceof WeaponBall && this.target.hp <= 0) {
                this.lifetime = Number.POSITIVE_INFINITY;
            } else if (this.target instanceof Projectile && !this.target.active) {
                this.lifetime = Number.POSITIVE_INFINITY;
            }
        }
        
        return result;
    }
}

class OrbitingParticle extends Particle {
    constructor(position, rotation_angle, size, sprites, frame_speed, duration, looping, orbit_target, orbit_speed, orbit_distance_factor, orbit_offset, delay=0, render_behind=false) {
        super(position, rotation_angle, size, sprites, frame_speed, duration, looping, delay, render_behind);

        this.orbit_target = orbit_target;
        this.orbit_speed = orbit_speed;
        this.orbit_distance_factor = orbit_distance_factor;
        this.orbit_offset = orbit_offset;
    }

    pass_time(time_delta) {
        let result = super.pass_time(time_delta);
        if (result) {
            let amt = this.orbit_speed * this.lifetime;
            this.position = this.orbit_target.position.add(
                new Vector2(1, 0).mul(
                    this.orbit_target.radius * this.orbit_distance_factor
                ).rotate(amt - this.orbit_offset)
            )

            if (this.orbit_target instanceof WeaponBall && this.orbit_target.hp <= 0) {
                this.lifetime = Number.POSITIVE_INFINITY;
            }
        }
        
        return result;
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
                a: 1, b: 0, c: 0,
                lbx: null, ubx: null, lby: null, uby: null,
                projectile_solid: false,
            },

            {
                // ax + by + c = 0
                id: 0,
                a: 1, b: 0, c: -this.size.x,
                lbx: null, ubx: null, lby: null, uby: null,
                projectile_solid: false,
            },

            {
                // ax + by + c = 0
                id: 1,
                a: 0, b: 1, c: 0,
                lbx: null, ubx: null, lby: null, uby: null,
                projectile_solid: false,
            },

            {
                // ax + by + c = 0
                id: 1,
                a: 0, b: 1, c: -this.size.y,
                lbx: null, ubx: null, lby: null, uby: null,
                projectile_solid: false,
            },
        ]

        this.projectile_solid_lines = this.lines.filter(l => l.projectile_solid);

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

        this.powerups_enabled = false;
        this.powerups_pool = DEFAULT_POWERUPS_POOL;
        this.powerups_frequency = DEFAULT_POWERUPS_FREQUENCY;
        this.powerups_timeout = DEFAULT_POWERUPS_FREQUENCY[0] * 0.25;
        this.powerups_last_delay = this.powerups_timeout;
        this.powerups_last_spawned = null;
        this.powerups_next = null;

        this.max_game_duration = default_max_game_duration;

        this.starting_system_energy = 0;
        this.attempt_energy_conservation = true;
        this.energy_conservation_aggression = 0.5;
    }
    
    calculate_system_energy() {
        return this.balls.filter(ball => !ball.skip_physics).reduce((t, ball) => {
            let kinetic_energy = 0.5 * ball.mass * ball.velocity.sqr_magnitude();

            let height = this.size.y - ball.position.y;
            let gravitational_energy = ball.mass * this.gravity.y * height;

            return t + kinetic_energy + gravitational_energy;
        }, 0)
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

    register_hp_gain(by, on, amt) {
        if (!on.show_stats) {
            return; // dont care about adds
        }

        // do damage numbers
        // show all healing because it's rarer
        if (make_damage_numbers && by instanceof Ball && amt > 0.15) {
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
            part = new DamageNumberParticle(
                on.position, 1, `❤ ${(amt).toFixed(1)}`, on.get_current_desc_col(), on.velocity, this, size
            );

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

    register_burn(by, on, amt) {
        if (make_damage_numbers && by instanceof Ball && amt > 0.15 && on.show_stats) {
            let size = 14;
            if (amt >= 1) {
                size = 16;
                if (amt >= 2) {
                    size = 18;
                    if (amt >= 4) {
                        size = 20;
                    }
                }
            }

            let part = new DamageNumberParticle(
                on.position, 1, `${AILMENT_CHARS[2]} ${Number(amt.toFixed(2))}`, on.get_current_desc_col(), on.velocity, this, size
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

    powerups_step(time_delta) {
        if (!this.powerups_enabled)
            return;

        this.powerups_timeout -= time_delta;
        if (this.powerups_timeout <= 0) {
            this.powerups_timeout = random_float(...this.powerups_frequency, this.random);
            this.powerups_last_delay = this.powerups_timeout;

            let powerup_proto = this.powerups_next;
            this.powerups_next = null;
            this.powerups_last_spawned = powerup_proto;

            let powerup = new powerup_proto(this, 512, 2/3);
            this.spawn_ball(powerup, new Vector2(this.size.x / 2, this.size.y + 1000));
        }

        if (!this.powerups_next) {
            let powerup_proto = null;
            while (!powerup_proto || powerup_proto.name == this.powerups_last_spawned?.name) {
                powerup_proto = weighted_seeded_random_from_arr(this.powerups_pool, this.random)[1];
            }

            this.powerups_next = powerup_proto;
        }
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

            let result = trigger.func(this);

            if (trigger.repeat && result) {
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

        // make the balls move
        this.balls.forEach(ball => {
            if (ball.skip_physics)
                return;  // skip_physics balls should completely stop

            ball.physics_step(this, time_delta);
        })

        // make the projectiles move
        this.projectiles.forEach(projectile => {
            projectile.physics_step(time_delta);

            this.projectile_solid_lines.forEach(line => {
                let pos = projectile.collides_line(line)
                if (pos) {
                    projectile.collide_wall(pos);
                    // TODO -- need to disable hitscan projectiles for one physics tick,
                    // then enable them after we confirm it's been sliced by this function
                    // also cannibalise the code from hit detection to make the hitscan stop positions
                    // more accurate
                    // this can't be done until a balance update
                }
            })
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

        // any air drag?

        // check for all collisions. for each collision, calculate
        let collisions = [];
        let collisions_found = new Set();

        let sthis = this;
        this.balls.forEach(ball1 => {
            sthis.balls.forEach(ball2 => {
                if (ball1.skip_physics || ball2.skip_physics)
                    return;  // skip_physics balls should completely stop

                if (!ball1.collision || !ball2.collision) {
                    return;
                }

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

            coll.first.collide_ball(coll.second);
            coll.second.collide_ball(coll.first);

            if (thud_cooldown < 0) {
                play_audio("thud");
                thud_cooldown += 0.3;
            }
        })

        // check wall and ground bounces
        this.balls.forEach(ball => {
            if (ball.skip_physics || ball.ignore_bounds_checking || !ball.collision)
                return;  // skip_physics balls should completely stop
            /*
            ball.check_ground_bounce(sthis);
            ball.check_ceiling_bounce(sthis);
            ball.check_sides_bounce(sthis);
            */
            sthis.lines.forEach(line => {
                if (ball.collides_line(line)) {
                    ball.resolve_line_collision(sthis, line);
                    
                    ball.collide_wall();

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
        this.collision = true;
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
        return point_collides_line(this.position, this.radius, line);
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

        if (board.attempt_energy_conservation) {
            let nrg = board.calculate_system_energy();
            let prop = 1 - (nrg / board.starting_system_energy);
            if (prop > 0) {
                new_velocity = new_velocity.mul(
                    1 + (prop * board.energy_conservation_aggression)
                );
            }
        }

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

        if (board.attempt_energy_conservation) {
            let nrg = board.calculate_system_energy();
            let prop = 1 - (nrg / board.starting_system_energy);
            if (prop > 0) {
                impulse_this = impulse_this.mul(1 + (this.mass * prop * board.energy_conservation_aggression * 0.5));
                impulse_other = impulse_other.mul(1 + (this.mass * prop * board.energy_conservation_aggression * 0.5));
            }
        }

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

    const DPR = window.devicePixelRatio ?? 1;

    canvas_height = canvas_base_size;
    canvas_width = canvas_base_size;

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_smallest + "px";
        canvas.style.height = canvas_smallest + "px";
    
        // might work, might not
        if (false) {
            ctx.canvas.width = canvas_width * DPR;
            ctx.canvas.height = canvas_height * DPR;
            ctx.scale(DPR, DPR);
        } else {
            ctx.canvas.width = canvas_width;
            ctx.canvas.height = canvas_height;
        }

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

    document.querySelectorAll(".behind-canvases").forEach(elem => { if (!elem.classList.contains("popup")) { elem.style.width = canvas_smallest + "px" } else { elem.style.setProperty("--siz", canvas_smallest + "px") } });
    document.querySelectorAll(".behind-canvases").forEach(elem => { if (!elem.classList.contains("popup")) { elem.style.height = canvas_smallest + "px" } else { elem.style.setProperty("--siz", canvas_smallest + "px") } });

    document.querySelector(".everything-subcontainer").style.height = canvas_smallest + "px";

    layers.bg3.ctx.fillStyle = game_normal_col;
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);

    render_watermark();

    // show the big scary blocker screen if viewport is bad
    if (true || is_valid_viewport()) {
        document.querySelector("#desktop_mode_prompt").classList.add("nodisplay");
    } else {
        document.querySelector("#desktop_mode_prompt").classList.remove("nodisplay");
    }

    bg_changed = true;
    balls_need_aero_recache = true;

    //refresh_wtsp_stwp();

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_powerup_info(board) {
    layers.ui4.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let last_powerup = board.powerups_last_spawned;

    let yoffset = 0;
    if (AERO_BACKGROUND == AERO_BACKGROUNDS.PARALLAX_GRID) {
        yoffset += 48;
    }

    write_pp_bordered_text(
        layers.ui4.ctx,
        `Last bonus:`,
        20, 32 + yoffset,
        "white",
        CANVAS_FONTS, 20, false, 2, "black"
    );

    let col = last_powerup?.burst_line_col?.lerp(Colour.white, 0.5).css() ?? "#888";
    let subcol = last_powerup?.burst_line_col?.css() ?? "#555";

    write_pp_bordered_text(
        layers.ui4.ctx,
        `${last_powerup?.title ?? "None"}`,
        20, 32 + yoffset + 22,
        col,
        CANVAS_FONTS, 16, false, 2, "black"
    );

    write_pp_bordered_text(
        layers.ui4.ctx,
        `${last_powerup?.desc ?? "-"}`,
        20, 32 + yoffset + 20 + 20,
        subcol,
        CANVAS_FONTS, 12, false, 2, "black"
    );

    write_pp_bordered_text(
        layers.ui4.ctx,
        `Next: ${(board.powerups_timeout.toFixed(1) + "s").padEnd(5)} [${"=".repeat(Math.ceil(24 * board.powerups_timeout / board.powerups_last_delay)).padEnd(24)}]`,
        20, 32 + yoffset + 20 + 20 + 32,
        "#ccc",
        CANVAS_FONTS, 12, false, 2, "black"
    );

    if (board.powerups_next) {
        write_pp_bordered_text(
            layers.ui4.ctx,
            `${board.powerups_next.title}`,
            20, 32 + yoffset + 20 + 20 + 32 + 16,
            board.powerups_next.burst_line_col.css(),
            CANVAS_FONTS, 12, false, 2, "black"
        );
    }
}

function render_watermark() {
    layers.front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    if (new_year) {
        layers.front.ctx.globalAlpha = Math.max(0, 0.66 - ((board?.duration ?? 0) * 2));
        write_text(
            layers.front.ctx,
            `HAPPY NEW YEAR 2026 !!`,
            canvas_width / 2, canvas_height / 2,
            "#d8f", CANVAS_FONTS, 48, true
        )
    }
    
    layers.front.ctx.globalAlpha = 0.66;
    write_pp_bordered_text(
        layers.front.ctx,
        `available for free at ${BASE_URL} :)`,
        20, canvas_height - 20 - 20,
        "white", CANVAS_FONTS, 20, false, 2, "black"
    );
    write_pp_bordered_text(
        layers.front.ctx,
        `also now on discord! join at ${BASE_URL}/discord`,
        20, canvas_height - 20,
        "#8df", CANVAS_FONTS, 16, false, 2, "black"
    )
    layers.front.ctx.globalAlpha = 1;
}

function render_just_playing_around_warning() {
    write_pp_bordered_text(
        layers.front.ctx,
        `let me know what you think about this theme!`,
        20, 40,
        "white", CANVAS_FONTS, 20, false, 2, "black"
    );
}

function render_mysterious_powers(board) {
    layers.ui1.ctx.clearRect(0, canvas_height - 200, canvas_width, 200);

    layers.ui1.ctx.globalAlpha = 1;
    write_text(
        layers.ui1.ctx,
        `Mysterious powers are enabled.`,
        20, canvas_height - 20 - 30 - 20 - 20 - 20,
        "#98f", CANVAS_FONTS, 16
    );

    write_text(
        layers.ui1.ctx,
        `Activate a power by clicking. Arrow keys to switch powers and change strength.`,
        20, canvas_height - 20 - 30 - 20 - 20,
        "#98f", CANVAS_FONTS, 14
    );

    let m_data = MYSTERIOUS_POWER_INFO[current_mysterious_power.name];

    write_text(
        layers.ui1.ctx,
        `>> ${m_data.name.padEnd(16)} | Power: ${current_mysterious_power.power.toFixed(0).padEnd(3)} | ${m_data.desc_fn(board, current_mysterious_power.power)}`,
        20, canvas_height - 20 - 30 - 20,
        "#dcf", CANVAS_FONTS, 16
    );
    layers.ui1.ctx.globalAlpha = 1;

    let part = new AilmentParticle(game_position, 0, 1.5, entity_sprites.get("point"), 0.3);
    board.spawn_particle(part, game_position);
}

function render_diagnostics(board) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let avg_frame_time = last_frame_times.reduce((a, b) => a + b, 0) / last_frame_times.length;
    let fps = 1000/avg_frame_time;

    let offset = board?.powerups_enabled ? 144 : 0;

    write_text(
        layers.debug_front.ctx, `fps: ${Math.round(fps)}`, 10, offset + 16, "#fff", CANVAS_FONTS, 9
    )

    let frame_times_raw = [render_durations, calc_durations, wait_durations].map(arr => {
        return (Math.round(100 * (arr.reduce((a,b) => a+b, 0) / (arr.length+Number.EPSILON))) / 100);
    })

    let frame_time_splits = frame_times_raw.map(t => {
        return t.toString().padEnd(6);
    })

    write_text(
        layers.debug_front.ctx, `frame spread:`, 10, offset + 28, "#fff", CANVAS_FONTS, 9
    )

    let total_bar_length = 48;
    let total_time = frame_times_raw[0] + frame_times_raw[1] + frame_times_raw[2]
    let bars = [
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[0] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[1] / total_time))),
        Math.max(0, Math.ceil(total_bar_length * (frame_times_raw[2] / total_time)))
    ]

    write_text(
        layers.debug_front.ctx, frame_time_splits[0] + "draw" + " " + "#".repeat(bars[0]), 10, offset + 28+12, "#0f0", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[1] + "calc" + " " + "#".repeat(bars[1]), 10, offset + 28+12+12, "#f00", CANVAS_FONTS, 9
    )

    write_text(
        layers.debug_front.ctx, frame_time_splits[2] + "wait" + " " + "#".repeat(bars[2]), 10, offset + 28+12+12+12, "#666", CANVAS_FONTS, 9
    )

    if (!board)
        return;

    let nrg = board.calculate_system_energy();
    let snrg = board.starting_system_energy;
    write_text(
        layers.debug_front.ctx, `system energy | ${Math.round(nrg)} | ${Math.round(snrg)}`, 10, offset + 28+12+12+12+24, "white", CANVAS_FONTS, 9
    )
    write_text(
        layers.debug_front.ctx, `[${("#".repeat(Math.min(64, Math.round(64 * nrg/snrg)))).padEnd(64)}]`, 10, offset + 28+12+12+12+24+12, "white", CANVAS_FONTS, 9
    )

    let board_d_y = offset + 28+12+12+12+24+12+24;

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

    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height-200);

    let ctx = layers.ui1.ctx;

    let t = (5000 - time_until_end) / 1000;
    let rps = board.remaining_players();
    let b = null;
    if (rps.length >= 1) {
        bs = board.get_all_player_balls(rps[0]).filter(ball => ball.show_stats);
        b = bs[0];
    }

    if (!b) {
        // draw
        if (t > 0.5) {
            write_pp_bordered_text(ctx, "DRAW", canvas_width/2, 256, "white", CANVAS_FONTS, 128, true, 2, "black");
        }
    } else {
        if (t > 0.5) {
            write_pp_bordered_text(ctx, "VICTORY", canvas_width/2, 256, "white", CANVAS_FONTS, 128, true, 2, "black");
        }

        if (t > 0.75) {
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

        if (t > 1) {
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

function render_game(board, time_delta, collision_boxes=false, velocity_lines=false, background_tint=null) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);

    layers.bg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.bg2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    if (bg_changed) {
        bg_changed = false;

        if (BALL_RENDERING_METHOD == BALL_RENDERING_METHODS.AERO) {
            if (AERO_BACKGROUND == AERO_BACKGROUNDS.RENDERED) {
                let imagedata = layers.bg3.ctx.getImageData(0, 0, canvas_width, canvas_height);

                let floor_col = new Colour(96, 96, 96, 255);
                let wall_col = new Colour(60, 60, 60, 255);
                let ceiling_col = new Colour(90, 90, 90, 255);
                let back_col = new Colour(72, 72, 72, 255);

                let tint_to = game_normal_col;
                if (background_tint) {
                    tint_to = background_tint;
                }

                floor_col = floor_col.lerp(tint_to, 0.5);
                wall_col = wall_col.lerp(tint_to, 0.5);
                ceiling_col = ceiling_col.lerp(tint_to, 0.5);
                back_col = back_col.lerp(tint_to, 0.5);

                let back_size = canvas_width / 5;
                let back_size_mults = [1, 1];

                let center = canvas_width / 2;

                for (let x=0; x<canvas_width; x++) {
                    for (let y=0; y<canvas_height; y++) {
                        let xt = x - center;
                        let yt = y - center;
                        let vs = [Math.abs(xt) * back_size_mults[0], Math.abs(yt) * back_size_mults[1]];

                        xt *= back_size_mults[0];
                        yt *= back_size_mults[1];

                        let col = back_col;
                        if (vs[0] > back_size || vs[1] > back_size) {
                            // if abs(y) > abs(x), floor or ceiling, else wall
                            if (Math.abs(yt) > Math.abs(xt)) {
                                if (yt > 0) {
                                    col = floor_col;
                                } else {
                                    col = ceiling_col;
                                }
                            } else {
                                col = wall_col;
                            }
                        }

                        let idx = ((y * canvas_height) + x) * 4;
                        for (let c=0; c<4; c++) {
                            imagedata.data[idx+c] = col.data[c];
                        }
                    }
                }

                layers.bg3.ctx.putImageData(imagedata, 0, 0);
            } else if (AERO_BACKGROUND == AERO_BACKGROUNDS.VISTA) {
                write_rotated_image(
                    layers.bg3.canvas, layers.bg3.ctx,
                    canvas_width/2, canvas_height/2, entity_sprites.get("vista")[0], canvas_width, canvas_height, 0
                )
            } else if (AERO_BACKGROUND == AERO_BACKGROUNDS.PARALLAX_GRID) {
                if (background_tint) {
                    layers.bg3.ctx.fillStyle = background_tint.lerp(Colour.cyan, 0.01).css();
                    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
                } else {
                    layers.bg3.ctx.fillStyle = game_normal_col.lerp(Colour.cyan, 0.01).css();
                    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
                }

                let grids = 2;
                for (let i=grids-1; i>=0; i--) {
                    let grid_pos = render_data[`grid${i}`] ?? Vector2.zero;
                    let grid_velocity = render_data[`grid${i}velocity`] ?? [
                        new Vector2(-40, -40),
                        new Vector2(16, 20),
                        new Vector2(1, 1),
                    ][i];
                    let grid_colour = [Colour.green.lerp(Colour.black, 0.7), Colour.green.lerp(Colour.cyan, 0.5).lerp(Colour.black, 0.85), Colour.white][i];
                    let grid_freq = 128 + (i * 16)
                    let grid_size = 2;

                    // grid is real simple. it's got a colour and a frequency
                    // start at the lowest x value, increment by freq until > canvas size
                    // then repeat for y
                    /** @type {CanvasRenderingContext2D} */
                    let ctx = layers.bg3.ctx;

                    ctx.lineWidth = grid_size;
                    ctx.strokeStyle = grid_colour.css();

                    ctx.beginPath();

                    let posx = grid_pos.x - canvas_width;
                    while (posx < canvas_width) {
                        ctx.moveTo(posx, 0);
                        ctx.lineTo(posx, canvas_height);

                        posx += grid_freq;
                    }

                    let posy = grid_pos.y - canvas_width;
                    while (posy < canvas_width) {
                        ctx.moveTo(0, posy);
                        ctx.lineTo(canvas_width, posy);

                        posy += grid_freq;
                    }

                    ctx.stroke();
                    ctx.closePath();

                    render_data[`grid${i}`] = new Vector2(
                        (grid_pos.x + (grid_velocity.x * (time_delta / (1000 * 2)))) % grid_freq,
                        (grid_pos.y + (grid_velocity.y * (time_delta / (1000 * 2)))) % grid_freq,
                    );
                }

                bg_changed = true;
            }
        } else {
            if (background_tint) {
                layers.bg3.ctx.fillStyle = background_tint.css();
                layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
            } else {
                layers.bg3.ctx.fillStyle = game_normal_col.css();
                layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height);
            }
        }
    }

    if (true) {
        layers.debug_back.ctx.clearRect(0, 0, canvas_width, canvas_height);
    }

    // balls can be from 0 to 10000
    // so need to translate those positions into the canvas space
    // rely upon it being square... for now

    let screen_scaling_factor = canvas_width / board.size.x;

    let layer = layers.fg2;
    if (BALL_RENDERING_METHOD != BALL_RENDERING_METHODS.VECTOR) {
        layer = layers.fg2_raster;
        layer.ctx.clearRect(0, 0, canvas_width, canvas_height);
    }

    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let layer_normal = layers.fg2;

    let ctx = layer.ctx;
    let ctx_normal = layers.fg2.ctx;

    let w = 25 * screen_scaling_factor;

    // board collision lines
    if (collision_boxes) {
        board.lines.forEach(line => {
            let col = line.projectile_solid ? Colour.red : Colour.green;

            // line vector is simply (-b,a)
            // then find a point on the line to start from,
            // and add 10000 / -10000 on each side
            // then limit by lbxy/ubxy
            let line_point = new Vector2(
                (line.a * -line.c) / (Math.pow(line.a, 2) + Math.pow(line.b, 2)),
                (line.b * -line.c) / (Math.pow(line.a, 2) + Math.pow(line.b, 2)),
            );
            let line_vector_normalised = new Vector2(-line.b, line.a);
        
            let amt_lb_x = 10000;
            let amt_lb_y = 10000;
            let amt_ub_x = 10000;
            let amt_ub_y = 10000;

            let screen_scaling_factor = canvas_width / board.size.x;

            if (line.lbx)
                amt_lb_x = (line_point.x - line.lbx) / line_vector_normalised.x;
            
            if (line.lby)
                amt_lb_y = (line_point.y - line.lby) / line_vector_normalised.y;

            if (line.ubx)
                amt_ub_x = (line.ubx - line_point.x) / line_vector_normalised.x;

            if (line.uby)
                amt_ub_y = (line.uby - line_point.y) / line_vector_normalised.y;

            let point1 = line_point.sub(line_vector_normalised.mul(Math.min(amt_lb_x, amt_lb_y))).mul(screen_scaling_factor);
            let point2 = line_point.add(line_vector_normalised.mul(Math.min(amt_ub_x, amt_ub_y))).mul(screen_scaling_factor);

            layers.debug_back.ctx.beginPath();
            layers.debug_back.ctx.moveTo(point1.x, point1.y);
            layers.debug_back.ctx.lineTo(point2.x, point2.y);
            layers.debug_back.ctx.lineWidth = 2;
            layers.debug_back.ctx.strokeStyle = col.css();
            layers.debug_back.ctx.stroke();
            layers.debug_back.ctx.closePath();
        })
    }

    // particles
    board.particles.forEach(particle => {
        if (particle.delay > 0) {
            return;
        }

        let particle_screen_pos = particle.position.mul(screen_scaling_factor);

        let siz = particle.size * screen_scaling_factor * 128;

        particle_screen_pos = particle_screen_pos.add(new Vector2(-siz, -siz).mul(0));

        let sprite = particle.sprites[particle.cur_frame];

        let canvas_entry = particle.render_behind ? layers.bg2 : layers.fg1;
        
        /** @type {CanvasRenderingContext2D} */
        let ctx = canvas_entry.ctx;

        let old_alpha = ctx.globalAlpha;
        ctx.globalAlpha = particle.opacity ?? 1;

        if (typeof sprite === "string") {
            write_pp_bordered_text(
                ctx, sprite,
                particle_screen_pos.x, particle_screen_pos.y,
                particle.text_col.css(), CANVAS_FONTS, (particle.text_size * particle.size) / PARTICLE_SIZE_MULTIPLIER,
                true, 1, particle.text_border_col.css(), particle.text_modifiers
            );
        } else if (particle instanceof LineParticle) {
            let particle_end_pos = particle.target_position.mul(screen_scaling_factor);

            ctx.lineWidth = particle.size;
            ctx.strokeStyle = particle.colour.css();

            ctx.beginPath();
            ctx.moveTo(particle_screen_pos.x, particle_screen_pos.y);
            ctx.lineTo(particle_end_pos.x, particle_end_pos.y);
            ctx.stroke();
            ctx.closePath();
        } else {
            write_rotated_image(
                canvas_entry.canvas, ctx,
                particle_screen_pos.x, particle_screen_pos.y,
                sprite,
                siz, siz, particle.rotation_angle
            );
        }

        ctx.globalAlpha = old_alpha;
    })

    // then the projectiles. put them on fg3, same as weapons
    board.projectiles.forEach(projectile => {
        if (!projectile.active || (projectile.render_delay && projectile.lifetime < projectile.render_delay)) {
            return;
        }

        let proj_layer = projectile.alternative_layer ? layers[projectile.alternative_layer] : layers.fg3;

        if (projectile.sprite != "HITSCAN") {
            let projectile_screen_pos = new Vector2(
                (projectile.position.x) * screen_scaling_factor,
                (projectile.position.y) * screen_scaling_factor,
            );

            let siz = projectile.size * screen_scaling_factor * 128;

            write_rotated_image(
                proj_layer.canvas, proj_layer.ctx,
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

            proj_layer.ctx.strokeStyle = projectile.sprite_colour;

            let segments = 100;
            let line_start_point = 0;
            let max_width = projectile.get_width();
            let remaining_line_segs = segments - line_start_point;
            let initial_pos = projectile_screen_start_pos.lerp(projectile_screen_end_pos, line_start_point / segments);
            let last_pos = initial_pos;
            let last_last_pos = last_pos;

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

                proj_layer.ctx.lineWidth = w_factor * max_width;

                proj_layer.ctx.beginPath();
                proj_layer.ctx.moveTo(last_last_pos.x, last_last_pos.y);
                proj_layer.ctx.lineTo(pos.x, pos.y);
                proj_layer.ctx.stroke();
                proj_layer.ctx.closePath();

                last_last_pos = last_pos;
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
                    Math.max(0, (hitbox.radius * projectile.size * screen_scaling_factor) - (w2/2)),
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

    let imagedata = null;
    if (BALL_RENDERING_METHOD != BALL_RENDERING_METHODS.VECTOR) {
        imagedata = ctx.getImageData(0, 0, canvas_width, canvas_height);
    }

    // then the balls and weapons
    board.balls.forEach(ball => {
        let ball_pos = ball.position;

        let ball_screen_pos = new Vector2(
            (ball_pos.x) * screen_scaling_factor,
            (ball_pos.y) * screen_scaling_factor,
        );

        if (ball.display) {
            let ball_col = ball.get_current_col();
            if (ball.invuln_duration > 0 && ball.last_hit == 0) {
                ball_col = ball_col.lerp(Colour.black, 0.75);
            }

            switch (BALL_RENDERING_METHOD) {
                case BALL_RENDERING_METHODS.VECTOR: {
                    ctx.beginPath();
                    ctx.arc(ball_screen_pos.x, ball_screen_pos.y, Math.max(0, (ball.radius * screen_scaling_factor) - (w/2)), 0, 2 * Math.PI, false);
                    
                    ctx.fillStyle = ball_col.css();
                    ctx.fill();
                    ctx.lineWidth = w;
                    ctx.strokeStyle = ball_col.lerp(Colour.white, 0.75).css();
                    ctx.stroke();

                    break;
                }

                case BALL_RENDERING_METHODS.RASTER: {
                    let ball_siz_scaled = ball.aero_radius_table[3];

                    ball_pos = ball_pos.round();  // raster display

                    let lb = Math.floor(-ball_siz_scaled / 1);
                    let ub = Math.ceil(ball_siz_scaled / 1);

                    let sqr_radius = ball.aero_radius_table[0];
                    let sqr_inner_radius = ball.aero_radius_table[1];

                    let s = ub - lb;
                    
                    let offset = ball_pos.sub(new Vector2(ball.radius, ball.radius)).mul(screen_scaling_factor).round();

                    for (let y=0; y<s; y++) {
                        for (let x=0; x<s; x++) {
                            let idx = (((y + offset.y) * canvas_width) + (x + offset.x)) * 4;
                            let sum = ball.aero_light_lookup_table[y][x][0];

                            let col = null
                            if (sum > sqr_radius) {
                                // col stays blank
                            } else {
                                col = ball_col;
                                if (sum > sqr_inner_radius)
                                    col = ball_col.lerp(Colour.white, 0.75);
                            }

                            if (col) {
                                let data = col.data;

                                for (let c=0; c<4; c++) {
                                    imagedata.data[idx+c] = data[c];
                                }
                            }
                        }
                    }

                    break;
                }

                case BALL_RENDERING_METHODS.AERO: {
                    let ball_siz_scaled = ball.aero_radius_table[3];

                    ball_pos = ball_pos.round();  // raster display

                    let lb = Math.floor(-ball_siz_scaled / 1);
                    let ub = Math.ceil(ball_siz_scaled / 1);

                    let sqr_radius = ball.aero_radius_table[0];
                    let sqr_inner_radius = ball.aero_radius_table[1];

                    let s = ub - lb;
                    
                    let offset = ball_pos.sub(ball.aero_radius_table[2]).mul(screen_scaling_factor).round();

                    let lightest = Colour.white;
                    let lightest_amt = 0.8;
                    let darkest = Colour.black;
                    let darkest_amt = 0.5;

                    let border_col = ball_col.lerp(Colour.white, 0.75);

                    let old_ball_col = ball_col;
                    ball_col = ball_col.lerp(Colour.black, 0.1);

                    // ball.setup_aero_light_lookup_table();

                    let xmin = -Math.min(0, offset.x);
                    let xmax = Math.min(offset.x + s, canvas_width) - offset.x;

                    let ymin = -Math.min(0, offset.y);
                    let ymax = Math.min(offset.y + s, canvas_height) - offset.y;

                    for (let y=ymin; y<ymax; y++) {
                        for (let x=xmin; x<xmax; x++) {
                            let idx = (((y + offset.y) * canvas_width) + (x + offset.x)) * 4;
                            // let sum = Math.pow(xt, 2) + Math.pow(yt, 2);

                            // let dist = Math.sqrt(
                            //     Math.pow(xt - light_center[0], 2) + Math.pow(yt - light_center[1], 2)
                            // );

                            let sum = ball.aero_light_lookup_table[y][x][0];

                            let col = null;
                            if (sum > sqr_radius) {
                                // col stays blank
                            } else {
                                let prop = ball.aero_light_lookup_table[y][x][1];
                                let val = Math.abs(prop - 0.5) * 2;
                                col = ball_col.lerp(prop < 0.5 ? lightest : darkest, (prop < 0.5 ? lightest_amt : darkest_amt) * val);
                                if (sum > sqr_inner_radius)
                                    col = border_col
                            }

                            if (col) {
                                let data = col.data;

                                for (let c=0; c<4; c++) {
                                    imagedata.data[idx+c] = data[c];
                                }
                            }
                        }
                    }

                    ball_col = old_ball_col;

                    let hp = Math.max(0, ball.hp);

                    ctx_normal.fillStyle = "white";
                    ctx_normal.font = `22px ${CANVAS_FONTS}`;
                    ctx_normal.textAlign = "center";
                    ctx_normal.textBaseline = "middle";
                    ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x-1.5, ball_screen_pos.y-1.5);
                    ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x+1.5, ball_screen_pos.y-1.5);
                    ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x-1.5, ball_screen_pos.y+1.5);
                    ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x+1.5, ball_screen_pos.y+1.5);

                    break;
                }
            }

            let hp = Math.max(0, ball.hp);

            ctx_normal.fillStyle = "black";
            ctx_normal.font = `22px ${CANVAS_FONTS}`;
            ctx_normal.textAlign = "center";
            ctx_normal.textBaseline = "middle";
            ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x-0.5, ball_screen_pos.y-0.5);
            ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x+0.5, ball_screen_pos.y-0.5);
            ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x-0.5, ball_screen_pos.y+0.5);
            ctx_normal.fillText(Math.ceil(hp), ball_screen_pos.x+0.5, ball_screen_pos.y+0.5);

            // now draw the weapons
            // weapon needs to be drawn at an offset from the ball (radius to the right)
            // with that offset rotated by the angle as well
            ball.weapon_data.forEach((weapon, index) => {
                if (weapon.size_multiplier <= 0) {
                    return;
                }

                let offset = ball.get_weapon_offset(index);

                let siz = weapon.size_multiplier * screen_scaling_factor * 128;
                let pos = ball_pos.add(offset).mul(screen_scaling_factor);

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

                        let hitbox_screen_pos = ball_pos.add(hitbox_offset).mul(screen_scaling_factor);
                        let w2 = w / 8;

                        layers.debug_back.ctx.beginPath();
                        layers.debug_back.ctx.arc(
                            hitbox_screen_pos.x, hitbox_screen_pos.y, 
                            Math.max(0, (hitbox.radius * weapon.size_multiplier * screen_scaling_factor) - (w2/2)),
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

    if (imagedata) {
        ctx.putImageData(imagedata, 0, 0);
    }
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
            let l_base = layout[index];

            let l = [
                Math.round(l_base[0] + ball.desc_shake_offset[0]),
                Math.round(l_base[1] + ball.desc_shake_offset[1]),
            ]

            if (AERO_BACKGROUND == AERO_BACKGROUNDS.PARALLAX_GRID)
                l[1] += 48;

            let ball_col = ball.get_current_desc_col().css();
            let ball_border_col = ball.get_current_border_col().css();

            write_pp_bordered_text(
                layers.ui2.ctx,
                `${ball.name}  LV ${ball instanceof UnarmedBall ? "???" : ball.level+1}`.padEnd(18) + `| HP: ${Math.ceil(ball.hp)}`,
                l[0], l[1], ball_col, CANVAS_FONTS, 16,
                false, BALL_DESC_BORDER_SIZE, ball_border_col
            )

            let hp = Math.max(0, Math.min(ball.max_hp, ball.hp));
            let hp_ailments = ball.get_ailment_hp_loss();
            // we want to write first the healthy hp, then the poison hp, then the rupture hp
            // #####===:::
            
            let max_segments = 40;
            let chars = "#<=: ";

            // step 1: get the health vs empty
            // - always round health up and empty down
            let hp_bar_filled_segs = Math.ceil((ball.hp / ball.max_hp) * max_segments);
            let hp_bar_empty_segs = max_segments - hp_bar_filled_segs;

            // step 2: get the unaffected health vs affected
            // - always round affected health up
            let total_ailment = hp_ailments.rupture + hp_ailments.poison + hp_ailments.burn;
            let unailed_hp = Math.max(0, hp - total_ailment);
            let hp_bar_unaffected_segs = Math.floor((unailed_hp / hp) * hp_bar_filled_segs);
            let hp_bar_affected_segs = hp_bar_filled_segs - hp_bar_unaffected_segs;

            // step 3: split the affected health 
            // order is rupture, poison, burn
            // same deal as the other steps, burn should take the final remainder
            let hp_bar_rupture_segs = Math.floor((hp_ailments.rupture / total_ailment) * hp_bar_affected_segs);
            let hp_bar_nonrupture_segs = hp_bar_affected_segs - hp_bar_rupture_segs;

            // 3.b (poison, burn)
            let hp_bar_poison_segs = Math.ceil((hp_ailments.poison / total_ailment) * hp_bar_nonrupture_segs);
            let hp_bar_burn_segs = hp_bar_nonrupture_segs - hp_bar_poison_segs;

            let segs = [
                hp_bar_unaffected_segs, hp_bar_rupture_segs, hp_bar_poison_segs, hp_bar_burn_segs, hp_bar_empty_segs
            ];

            let str = "";
            segs.forEach((seg, i) => {
                str += chars[i].repeat(seg);
            })

            write_pp_bordered_text(
                layers.ui2.ctx,
                `[${str}]`,
                l[0], l[1] + 12, ball_col, CANVAS_FONTS, 9,
                false, BALL_DESC_BORDER_SIZE, ball_border_col
            )
            
            if (ball.poison_duration > 0) {
                write_pp_bordered_text(
                    layers.ui2.ctx,
                    `${AILMENT_CHARS[1]} ${ball.poison_intensity.toFixed(2).padEnd(5)} | ${ball.poison_duration.toFixed(1)}s`,
                    l[0], l[1] + 12 + 12, ball_col, CANVAS_FONTS, 12,
                    false, BALL_DESC_BORDER_SIZE, ball_border_col
                )
            }

            if (ball.rupture_intensity >= 0.01) {
                write_pp_bordered_text(
                    layers.ui2.ctx,
                    `${AILMENT_CHARS[0]} ${ball.rupture_intensity.toFixed(2).padEnd(5)}`,
                    l[0] + 106, l[1] + 12 + 12, ball_col, CANVAS_FONTS, 12,
                    false, BALL_DESC_BORDER_SIZE, ball_border_col
                )
            }

            if (ball.burn_intensity >= 0.01) {
                write_pp_bordered_text(
                    layers.ui2.ctx,
                    `${AILMENT_CHARS[2]} ${ball.burn_intensity.toFixed(2).padEnd(5)}`,
                    l[0] + 160, l[1] + 12 + 12, ball_col, CANVAS_FONTS, 12,
                    false, BALL_DESC_BORDER_SIZE, ball_border_col
                )
            }

            ball.render_stats(layers.ui2.canvas, layers.ui2.ctx, l[0], l[1] + 12 + 12 + 16);
        })
    }
}

function render_opening(board, time_delta) {
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let t_raw = starting_fullpause_timeout - fullpause_timeout;

    let screen_scaling_factor = canvas_width / board.size.x;

    // wait for 0.5 seconds to allow me to start recording
    let t = t_raw - 0.5;

    if (!opening_state.sound) {
        opening_state.sound = null;
    }

    if (t >= -100 && !opening_state.sound) {
        // opening_state.sound = audio_playing[play_audio("birds_chirping")];
    }

    // add opening animations 100ms apart; remember we need to manually step particles
    if (!opening_state.balls) {
        opening_state.balls = 0;
    }

    if (!opening_state.particles) {
        opening_state.particles = [];
    }

    if (!opening_state.balls_anim_snd) {
        opening_state.balls_anim_snd = [];
    }

    let balls_num = board.balls.length;
    if (opening_state.balls < balls_num) {
        let req = opening_state.balls * (1.5 / balls_num);
        if (t > req) {
            let ball = board.balls[opening_state.balls]
            let pos = ball.position.add(
                new Vector2(0, -ball.radius / 3)
            ).add(ball.entry_animation_offset.mul(ball.radius));
            let part = new PersistentParticle(pos, 0, 2.5, entity_sprites.get("entry_" + board.balls[opening_state.balls].entry_animation), 18, 100, false);
            board.spawn_particle(part, pos);
            opening_state.particles.push(part);

            if (opening_state.balls == 0 && opening_state.sound) {
                opening_state.sound.source.stop();
            }

            opening_state.balls++;
            opening_state.balls_anim_snd.push(0);
        }
    }

    board.particles_step(time_delta);
    
    // for each particle with frame 8+, start showing the respective ball
    opening_state.particles.forEach((p, i) => {
        let cur_anim_snd = opening_state.balls_anim_snd[i];
        let frame = board.balls[i].entry_animation_keyframes[cur_anim_snd];
        while (frame && p.cur_frame >= frame.frame) {
            if (frame.snd) {
                play_audio(frame.snd, 0.04);
            }

            if (frame.display !== undefined) {
                board.balls[i].display = frame.display;
            }

            if (frame.part_back) {
                let pos = board.balls[i].position.add(
                    board.balls[i].entry_animation_offset.mul(board.balls[i].radius)
                )
                let part = new PersistentParticle(
                    pos, 0, 2.5,
                    entity_sprites.get(frame.part_back),
                    18, 100, false, null, true
                );

                board.spawn_particle(part, pos);
            }

            if (frame.pos_offset) {
                board.balls[i].position = board.balls[i].position.add(frame.pos_offset);
            }

            if (frame.weaponsiz) {
                board.balls[i].weapon_data.forEach(w => w.size_multiplier *= frame.weaponsiz);
                board.balls[i].cache_weapon_offsets();
                board.balls[i].cache_hitboxes_offsets();
            }

            opening_state.balls_anim_snd[i]++;
            cur_anim_snd = opening_state.balls_anim_snd[i];
            frame = board.balls[i].entry_animation_keyframes[cur_anim_snd];
        }
    });

    let ball_stagger = 1.5;
    let base_delay = 0.4;

    board.balls.forEach((ball, i) => {
        let req = base_delay + 0.25 + (i * (ball_stagger / balls_num));

        if (t > req) {
            let pos = ball.position.add(
                new Vector2(0, ball.radius * 1.75)
            ).mul(screen_scaling_factor).add(
                new Vector2(0, 44)
            );

            write_pp_bordered_text(
                layers.ui2.ctx,
                ball.tags.filter(tag => TAGS_INFO[tag].display_ingame).map(tag => TAGS_INFO[tag].name).join(" | "),
                pos.x, pos.y,
                "#bbb",
                CANVAS_FONTS, 12, true,
                3, ball.get_current_border_col().css()
            )

            layers.ui2.ctx.beginPath();

            let start_pos = ball.position.add(ball.velocity.normalize().mul(ball.radius * 1.5)).mul(screen_scaling_factor);
            let end_pos = ball.position.add(ball.velocity.normalize().mul(ball.radius * (1.5 + (ball.velocity.magnitude() / 3500)))).mul(screen_scaling_factor);

            let dir = end_pos.sub(start_pos).normalize();

            let arr1 = start_pos.add(dir.rotate(Math.PI * 0.25).mul(-16));
            let arr2 = start_pos.add(dir.rotate(Math.PI * -0.25).mul(-16));

            layers.ui2.ctx.moveTo(start_pos.x, start_pos.y);
            // layers.ui2.ctx.moveTo(end_pos.x, end_pos.y);

            layers.ui2.ctx.lineTo(arr1.x, arr1.y);
            layers.ui2.ctx.moveTo(start_pos.x, start_pos.y);
            layers.ui2.ctx.lineTo(arr2.x, arr2.y);

            layers.ui2.ctx.strokeStyle = ball.get_current_border_col().css();
            layers.ui2.ctx.lineWidth = 8;
            layers.ui2.ctx.stroke();

            layers.ui2.ctx.strokeStyle = "white";
            layers.ui2.ctx.lineWidth = 2;
            layers.ui2.ctx.stroke();

            layers.ui2.ctx.closePath();
        }
    });

    board.balls.forEach((ball, i) => {
        let req = base_delay + 0 + (i * (ball_stagger / balls_num));

        if (t > req) {
            let pos = ball.position.add(
                new Vector2(0, ball.radius * 1.75)
            ).mul(screen_scaling_factor);

            let name = ball.name;
            if (ball.level >= AWAKEN_LEVEL) {
                name = `* Awakened ${name} *`
            }

            write_pp_bordered_text(
                layers.ui2.ctx,
                name,
                pos.x, pos.y,
                ball.get_current_desc_col().css(),
                CANVAS_FONTS, 24, true,
                3, ball.get_current_border_col().css()
            )
        }
    })

    board.balls.forEach((ball, i) => {
        let req = base_delay + 0.125 + (i * (ball_stagger / balls_num));

        if (t > req) {
            let pos = ball.position.add(
                new Vector2(0, ball.radius * 1.75)
            ).mul(screen_scaling_factor).add(
                new Vector2(0, 24)
            );

            write_pp_bordered_text(
                layers.ui2.ctx,
                ball.category,
                pos.x - 64, pos.y,
                CATEGORIES_INFO[ball.category].col.css(),
                CANVAS_FONTS, 18, true,
                3, ball.get_current_border_col().css()
            )

            write_pp_bordered_text(
                layers.ui2.ctx,
                "|",
                pos.x, pos.y,
                "white",
                CANVAS_FONTS, 18, true,
                3, ball.get_current_border_col().css()
            )

            write_pp_bordered_text(
                layers.ui2.ctx,
                "Tier: ",
                pos.x + 48, pos.y,
                "white",
                CANVAS_FONTS, 18, true,
                3, ball.get_current_border_col().css()
            )

            write_pp_bordered_text(
                layers.ui2.ctx,
                TIERS_INFO[ball.tier].name,
                pos.x + 48 + 24, pos.y,
                TIERS_INFO[ball.tier].col.css(),
                CANVAS_FONTS, 18, false,
                3, ball.get_current_border_col().css()
            )
        }
    })

    let base_req = 2.5;
    if (opening_state.cnt === undefined) {
        opening_state.cnt = -1;
    }

    if (t > base_req) {
        let local_t = t - base_req;
        let pos = new Vector2(canvas_height / 2, (canvas_width / 2));

        let speed = 1;
        let cnt = Math.floor(local_t / speed);
        if (cnt < 3) {
            let num = 3 - cnt;
            let left = local_t - (cnt * speed);

            write_pp_bordered_text(
                layers.ui2.ctx,
                num,
                pos.x, pos.y,
                "white",
                CANVAS_FONTS, 128, true,
                4, "#444"
            )
            
            let bar_len = 48;
            let proportion = (speed - left) / speed;
            proportion = Math.pow(proportion, 1.75);
            write_pp_bordered_text(
                layers.ui2.ctx,
                `${"█".repeat(Math.round(proportion * bar_len))}${" ".repeat(Math.round((1 - proportion) * bar_len))}`,
                pos.x, pos.y + 32,
                "white",
                CANVAS_FONTS, 6, true,
                2, "#444"
            )
        }

        if (opening_state.cnt != cnt) {
            opening_state.cnt = cnt;
            if (cnt >= 3) {
                // nothing
            } else {
                play_audio("SE-COUNTDOWN");
            }
        }
    }
}

function render_postopening(board) {
    layers.ui3.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let t = board.duration;

    let maxt = 0.75;

    if (opening_state.cnt !== null) {
        if (starting_fullpause_timeout > 0) {
            play_audio("battle_royale_gong");
        }
        play_music(`2048_${random_int(0, 13, get_seeded_randomiser(board.random_seed))+1}`, 0.2);
        opening_state.cnt = null;
    }

    if (t < maxt && starting_fullpause_timeout > 0) {
        let pos = new Vector2(canvas_height / 2, (canvas_width / 2));

        let freq = 1000000;
        let half_freq = freq / 2;
        let opacity = Math.abs((t % freq) - half_freq) * (1 / half_freq);

        let displacement_max = 0;
        let prop = t / maxt;
        let displacement = (1 - Math.pow(1 - prop, 1.5)) * displacement_max;

        let penalty = (1 - Math.pow(1 - prop, 1.5));

        let opac = opacity - penalty;
        layers.ui3.ctx.globalAlpha = Math.max(0, opac);
        write_pp_bordered_text(
            layers.ui3.ctx,
            "FIGHT",
            pos.x - displacement, pos.y,
            Colour.white.css(),
            CANVAS_FONTS, 128, true,
            4, (new Colour(68, 68, 68, 255)).css(),
        )

        write_pp_bordered_text(
            layers.ui3.ctx,
            "FIGHT",
            pos.x + displacement, pos.y,
            Colour.white.css(),
            CANVAS_FONTS, 128, true,
            4, (new Colour(68, 68, 68, 255)).css(),
        )

        let bar_len = 128;
        write_pp_bordered_text(
            layers.ui3.ctx,
            `${"█".repeat(Math.round(opac * bar_len))}${" ".repeat(Math.round((1 - opac) * bar_len))}`,
            pos.x, pos.y + 32,
            "white",
            CANVAS_FONTS, 6, true,
            2, "#444"
        )

        layers.ui3.ctx.globalAlpha = 1;
    }
}

function make_default_player(pid) {
    return {
        id: pid,
        stats: {
            damage_bonus: 1,
            defense_bonus: 1,
            ailment_resistance: 1,

            timespeed_mult: 1,
        }
    }
}

let last_frame = Date.now();

let colliding_parries = new Set();
let colliding_proj2projs = new Set();

const default_max_game_duration = 300;
const default_board_size = 512 * 16;
let BOARD_SIZE = default_board_size;

let game_normal_col = new Colour(8, 8, 8, 255);
let game_end_col = new Colour(36, 0, 0, 255);

let game_speed_mult = 1;
let game_paused = false;
let game_subticks = 0;  // for fixed-time

// if fps is at least this much different from the expected,
// start applying correction
let game_fps_threshold = 5;
let game_fps_catchup_modifier = 1;

let total_steps = 0;

let starting_fullpause_timeout = 0;
let fullpause_timeout = 0;
let opening_state = {};

let last_frame_start = 0;

function game_loop() {
    framecount++;

    // discard any frames 50ms or longer for fps calcs (likely anomalous)
    let filtered_frame_times = last_frame_times.filter(f => f < 50);
    let avg_frame_time = filtered_frame_times.reduce((a, b) => a + b, 0) / filtered_frame_times.length;
    fps_current = 1000/avg_frame_time;

    let frame_start_time = Date.now();

    if (match_cancel_enqueued) {
        match_cancel_enqueued = false;
        exit_battle(false);
    }

    if (board && render) {
        if (balls_need_aero_recache) {
            if (BALL_RENDERING_METHOD != BALL_RENDERING_METHODS.VECTOR) {
                board.balls.forEach(ball => ball.setup_aero_light_lookup_table());
            }

            balls_need_aero_recache = false;
        }

        if (board.duration > board.max_game_duration && !switched_to_endgame_col) {
            switched_to_endgame_col = true;
            bg_changed = true;
            render_game(board, (frame_start_time - last_frame_start), keys_down["KeyQ"], false, game_end_col);
        } else {
            render_game(board, (frame_start_time - last_frame_start), keys_down["KeyQ"], false);
        }

        if (fullpause_timeout > 0) {
            render_opening(board, (frame_start_time - last_frame_start));
        } else {
            render_postopening(board);
            render_descriptions(board);
            
            if (mysterious_powers_enabled)
                render_mysterious_powers(board);

            if (new_year)
                render_watermark();  // new year uses watermark code to fade it so need to rerun it during games
        }

        if (board.powerups_enabled)
            render_powerup_info(board);

        if (AERO_BACKGROUND == AERO_BACKGROUNDS.PARALLAX_GRID)
            render_just_playing_around_warning();
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
            // debugger;
            total_steps++;

            // COLL_GRANULARITY => do collision checks every N physics steps
            for (let i=0; i<phys_gran; i++) {
                board.physics_step(game_delta_time / (1000 * phys_gran));

                if ((i+1) % coll_gran == 0) {
                    let coll_game_delta_time = game_delta_time / (1000 * cps);

                    // if multiple weapons collide, the first one takes priority
                    let hitstop = 0;

                    // tension
                    board.tension_step(coll_game_delta_time);

                    // powerups (test code for the moment)
                    if (board.powerups_enabled) {
                        board.powerups_step(coll_game_delta_time);
                    }

                    // triggers
                    board.timers_step(coll_game_delta_time);

                    // projectile weaponsteps
                    board.projectiles.forEach(projectile => {
                        projectile.weapon_step(board, coll_game_delta_time)
                    })

                    // parrying (weapon on weapon)
                    colliding_parries.clear();
                    board.balls.forEach(ball => {
                        if (ball.skip_physics || !ball.collision)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            board.balls.forEach(other => {
                                if (other.skip_physics || !other.collision)
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

                                        let source_weapon = ball.weapon_data[source_index];
                                        let other_weapon = other.weapon_data[other_index];

                                        // 
                                        //  ## Particle effects and hit position calculation
                                        //
                                        let source_hitbox_position = colliding_pair[2][0];
                                        let other_hitbox_position = colliding_pair[2][1];

                                        let source_coll_index = colliding_pair[3][0];
                                        let other_coll_index = colliding_pair[3][1];

                                        // impact position is:
                                        // source position + (difference vector * size proportion * distance proportion)
                                        let source_hitbox = source_weapon.hitboxes[source_coll_index];
                                        let other_hitbox = other_weapon.hitboxes[other_coll_index];

                                        let total_hitbox_size = (source_hitbox.radius * source_weapon.size_multiplier) + (other_hitbox.radius * other_weapon.size_multiplier);
                                        let hitbox_distance = source_hitbox_position.distance(other_hitbox_position);

                                        let distance_proportion = hitbox_distance / total_hitbox_size;
                                        let size_proportion = (source_hitbox.radius * source_weapon.size_multiplier) / total_hitbox_size;

                                        let difference_vector = other_hitbox_position.sub(source_hitbox_position);
                                        let impact_position = source_hitbox_position.add(difference_vector.mul(distance_proportion * size_proportion));

                                        let parry_particle = "parry";
                                        if (ball.custom_parry_particle) {
                                            parry_particle = ball.custom_parry_particle;
                                        } else if (other.custom_parry_particle) {
                                            parry_particle = other.custom_parry_particle;
                                        }

                                        let particle = new Particle(
                                            impact_position, (ball.position.sub(other.position)).angle() - (Math.PI * 0.5), 2,
                                            entity_sprites.get(parry_particle), 30, 4, false
                                        )

                                        board.spawn_particle(particle, impact_position);

                                        //
                                        // Rest of logic
                                        //
                                        
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

                                        if (ball_mag != 0) {
                                            new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag)
                                            ball.set_velocity(new_ball_velocity);
                                        }

                                        if (other_mag != 0) {
                                            new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)
                                            other.set_velocity(new_other_velocity);
                                        }

                                        ball.last_hit = 1;
                                        other.last_hit = 1;

                                        ball.apply_invuln(BALL_INVULN_DURATION);
                                        other.apply_invuln(BALL_INVULN_DURATION);

                                        // if either ball has a custom parry sound, use that - if both do, use the first
                                        if (ball.custom_parry_sound || other.custom_parry_sound) {
                                            let snd = ball.custom_parry_sound || other.custom_parry_sound;
                                            let gain_mul = (ball.parry_gain_mul || other.parry_gain_mul) || null;
                                            if (snd) {
                                                play_audio(snd, gain_mul);
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
                        if (ball.skip_physics || !ball.collision)
                            return;  // skip_physics balls should completely stop

                        // don't check our own team's projectiles
                        let projectiles = board.projectiles.filter(projectile => 
                            projectile.can_hit_ball(ball, true)
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

                            // 
                            //  ## Particle effects and hit position calculation
                            //
                            let ball_hitbox_position = projectile_data[2][0];
                            let proj_hitbox_position = projectile_data[2][1];

                            let ball_coll_index = projectile_data[3][0];
                            let proj_coll_index = projectile_data[3][1];

                            let ball_weapon_data = ball.weapon_data[parry_weapon_index];

                            // impact position is:
                            // source position + (difference vector * size proportion * distance proportion)
                            let ball_hitbox = ball_weapon_data.hitboxes[ball_coll_index];
                            let proj_hitbox = projectile.hitboxes[proj_coll_index];

                            // there is a very low chance that multiple projectiles will hit a breaking potion in the same frame.
                            // this will crash if we don't protect here against it
                            // OR FOOD PROJECTILES
                            if (ball_hitbox && proj_hitbox) {
                                let total_hitbox_size = (ball_hitbox.radius * ball_weapon_data.size_multiplier) + (proj_hitbox.radius * projectile.size);
                                let hitbox_distance = ball_hitbox_position.distance(proj_hitbox_position);

                                let distance_proportion = hitbox_distance / total_hitbox_size;
                                let size_proportion = (ball_hitbox.radius * ball_weapon_data.size_multiplier) / total_hitbox_size;

                                let difference_vector = proj_hitbox_position.sub(ball_hitbox_position);
                                let impact_position = ball_hitbox_position.add(difference_vector.mul(distance_proportion * size_proportion));

                                let parry_particle = "parry";
                                if (ball.custom_parry_particle) {
                                    parry_particle = ball.custom_parry_particle;
                                }

                                let particle = new Particle(
                                    impact_position, (ball.position.sub(projectile.position)).angle() - (Math.PI * 0.5), 2,
                                    entity_sprites.get(parry_particle), 30, 4, false
                                )

                                board.spawn_particle(particle, impact_position);
                            }

                            //
                            // Rest of logic
                            //

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

                            if (ball_mag != 0) {
                                new_ball_velocity = ball.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag);
                                ball.set_velocity(new_ball_velocity);
                            }
                            
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
                        if (ball.skip_physics || !ball.collision)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            // OK to check for hits (not in invuln window)
                            board.balls.forEach(other => {
                                if (other.skip_physics || !other.collision)
                                    return;  // skip_physics balls should completely stop

                                // make sure we don't check collisions with our own team
                                if (!ball.allied_with(other)) {
                                    let colliding_weapons = ball.check_weapons_hit_from(other);
                                    if (colliding_weapons.length > 0) {
                                        let weapon_index = colliding_weapons[0][0];  // ignore all others
                                        let other_weapon = other.weapon_data[weapon_index];

                                        // 
                                        //  ## Particle effects and hit position calculation
                                        //
                                        let other_hitbox_position = colliding_weapons[0][1];

                                        let other_coll_index = colliding_weapons[0][2];

                                        // impact position is:
                                        // source position + (difference vector * size proportion * distance proportion)
                                        let other_hitbox = other_weapon.hitboxes[other_coll_index];

                                        let total_hitbox_size = (ball.radius) + (other_hitbox.radius * other_weapon.size_multiplier);
                                        let hitbox_distance = ball.position.distance(other_hitbox_position);

                                        let distance_proportion = hitbox_distance / total_hitbox_size;
                                        let size_proportion = (ball.radius) / total_hitbox_size;

                                        let difference_vector = other_hitbox_position.sub(ball.position);
                                        let impact_position = ball.position.add(difference_vector.mul(distance_proportion * size_proportion));

                                        let particle = new Particle(
                                            impact_position, 0, 2,
                                            entity_sprites.get("hit"), 16, 4, false
                                        )

                                        board.spawn_particle(particle, impact_position);

                                        //
                                        // Rest of logic
                                        //

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
                                            play_audio(result.snd, result.gain);
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
                        if (ball.skip_physics || !ball.collision)
                            return;  // skip_physics balls should completely stop

                        if (ball.invuln_duration <= 0) {
                            // don't check our own projectiles
                            let projectiles = board.projectiles.filter(projectile => 
                                projectile.can_hit_ball(ball)
                            );

                            let intersecting_projectiles = ball.check_projectiles_hit_from(projectiles);
                            
                            // same rules as normal thing except we go through the get_hit_by for projectiles instead
                            // and delete the projectile
                            intersecting_projectiles.forEach(projectile_data => {
                                if (this.invuln_duration > 0) {
                                    return;  // don't care if now invuln
                                }

                                let projectile = projectile_data[0];

                                if (!projectile.no_hit_particles) {
                                    // 
                                    //  ## Particle effects and hit position calculation
                                    //
                                    let proj_hitbox_position = projectile_data[1];

                                    let proj_coll_index = projectile_data[2]

                                    // impact position is:
                                    // source position + (difference vector * size proportion * distance proportion)
                                    let proj_hitbox = projectile.hitboxes[proj_coll_index];

                                    let total_hitbox_size = (ball.radius) + (proj_hitbox.radius * projectile.size);
                                    let hitbox_distance = ball.position.distance(proj_hitbox_position);

                                    let distance_proportion = hitbox_distance / total_hitbox_size;
                                    let size_proportion = (ball.radius) / total_hitbox_size;

                                    let difference_vector = proj_hitbox_position.sub(ball.position);
                                    let impact_position = ball.position.add(difference_vector.mul(distance_proportion * size_proportion));

                                    let particle = new Particle(
                                        impact_position, 0, 2,
                                        entity_sprites.get("hit"), 16, 4, false
                                    )

                                    board.spawn_particle(particle, impact_position);
                                }

                                //
                                // Rest of logic
                                //

                                ball.last_hit = 0;
                                let result = projectile.source.hit_other_with_projectile(ball, projectile);
                                projectile.hit_ball(ball, coll_game_delta_time);
                                ball.last_damage_source = projectile.source;

                                if (!result.mute) {
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
                                        play_audio(result.snd, result.gain);
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
                            projectile.can_hit_projectile(other)
                        );

                        let projectiles_colliding = projectile.check_projectiles_colliding(projectiles_in_scope);
                        projectiles_colliding = projectiles_colliding.filter(proj => !colliding_proj2projs.has(proj.id + (1000000 * projectile.id)))

                        projectiles_colliding.forEach(proj_data => {
                            let proj = proj_data[0];

                            let proj_hitboxes = structuredClone(proj.hitboxes);
                            let projectile_hitboxes = structuredClone(projectile.hitboxes);

                            if (proj.parriable) {
                                projectile.hit_other_projectile(proj);
                            }
                            if (projectile.parriable) {
                                proj.hit_other_projectile(projectile);
                            }
                            colliding_proj2projs.add(proj.id + (1000000 * projectile.id));

                            // if either projectile was active and now isn't, play a thud and show the particle effect
                            // Also do this if either set of hitboxes is now blank
                            if ((!proj.active || !projectile.active) && !(proj_hitboxes.length == 0 || projectile_hitboxes == 0)) {
                                // 
                                //  ## Particle effects and hit position calculation
                                //
                                let projectile_hitbox_position = proj_data[1][0];
                                let proj_hitbox_position = proj_data[1][1];

                                let projectile_coll_index = proj_data[2][0];
                                let proj_coll_index = proj_data[2][1];

                                // impact position is:
                                // source position + (difference vector * size proportion * distance proportion)
                                let projectile_hitbox = projectile_hitboxes[projectile_coll_index];
                                let proj_hitbox = proj_hitboxes[proj_coll_index];

                                let total_hitbox_size = (projectile_hitbox.radius * projectile.size) + (proj_hitbox.radius * proj.size);
                                let hitbox_distance = projectile_hitbox_position.distance(proj_hitbox_position);

                                let distance_proportion = hitbox_distance / total_hitbox_size;
                                let size_proportion = (projectile_hitbox.radius * projectile.size) / total_hitbox_size;

                                let difference_vector = proj_hitbox_position.sub(projectile_hitbox_position);
                                let impact_position = projectile_hitbox_position.add(difference_vector.mul(distance_proportion * size_proportion));

                                let particle = new Particle(
                                    impact_position, (proj.position.sub(projectile.position)).angle() - (Math.PI * 0.5), 2,
                                    entity_sprites.get("parry"), 30, 4, false
                                )

                                board.spawn_particle(particle, impact_position);

                                //
                                // Rest of logic
                                //

                                play_audio("thud");
                            }
                        });
                    })

                    // if the board duration is past the max duration, deal 5dps to all balls
                    if (board.duration > board.max_game_duration) {
                        board.balls.forEach(ball => ball.lose_hp(25 * coll_game_delta_time, "endgame"));
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
                            if (ball.linked_hat_particle) {
                                ball.linked_hat_particle.lifetime = 999999999;
                            }

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
            
            // mysterious powers
            // ....
            if (board && lmb_down) {
                if (mysterious_powers_enabled) {
                    let m_info = MYSTERIOUS_POWER_INFO[current_mysterious_power.name];
                    let power = current_mysterious_power.power;

                    m_info.effect_hold(board, power, game_position, game_delta_time);
                }
            }
            // ....

            ending_game = false;
            if (board?.remaining_players().length <= 1) {
                let players = board.remaining_players();
                if (players.length > 0) {
                    board.get_all_player_balls(players[0]).forEach(ball => ball.takes_damage = false);
                }

                if (window.location.href.startsWith("file://")) {
                    // muted = match_end_timeout < 14000;
                }

                match_end_timeout -= game_delta_time;
                ending_game = true;
                board.attempt_energy_conservation = false;
                
                if (searching) {
                    match_end_timeout -= game_delta_time * 10;
                }

                // "animation"
                render_victory(board, match_end_timeout);

                if (match_end_timeout <= 0) {
                    reset_audio_buffer();
                    document.querySelector("#loading_prompt").classList.add("hidden");

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

                                html += `${classobj.name.padEnd(24)}${wins.toFixed(0).padStart(4)} / ${total.toFixed(0).padEnd(8)}<span style="background-color: ${Colour.dgreen.lerp(lerp_to, lerp_amt).css()}">${isNaN(winrate) ? "   -   " : ((winrate * 100).toFixed(2)+"%").padEnd(8)}</span><br>`;
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

    // gambling :3
    if (screen_open == "gambling") {
        gambling_money_display = lerp(gambling_money_display, gambling_money, 1 - Math.pow(0.01, delta_time / 1000))
        if (Math.abs(gambling_money_display - gambling_money) < 0.5) {
            gambling_money_display = gambling_money;
        }
        update_gambling_money();
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
    last_frame_start = frame_start_time;

    last_frame_times.push(time_since_last_frame);
    last_frame_times = last_frame_times.slice(-120);

    // next frame should arrive (1000/fps) ms later, so get the time left and compare it with the end time
    let expected_next_frame = frame_start_time + (1000/fps_current);
    let time_to_wait = Math.max(0, expected_next_frame-last_frame_time);

    wait_durations.push(time_to_wait);
    wait_durations = wait_durations.slice(-120);

    window.requestAnimationFrame(game_loop);
}
