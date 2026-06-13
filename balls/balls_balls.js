const AWAKEN_LEVEL = 99;
const WEAPON_SIZE_MULTIPLIER = 16;
const PROJ_SIZE_MULTIPLIER = 16;

const SPOTLIGHT_LIGHT_COL = Colour.from_hex("#FE9EB1");
const SPOTLIGHT_DARK_COL = Colour.from_hex("#000080");

const DEFAULT_ULT_COST = 160 / 1;
const DEAL_DAMAGE_ULT_CHARGE = 2;

const APPLY_RUPTURE_ULT_CHARGE = 3;
const APPLY_POISON_ULT_CHARGE = 4;
const APPLY_BURN_ULT_CHARGE = 6;

const HP_LOSS_ULT_CHARGE = 0.2;
const ULT_DEFAULT_CHARGE_COOLDOWN = 8;

const ANIMATION_STANDARD_DATA = {
    impact: {
        keyframes: [
            {frame: 2, snd: "airrecover_2"},
            {frame: 9, snd: "wallhit"},
            {frame: 8, display: true},
        ],
        offset: Vector2.zero,
    },

    teleport: {
        keyframes: [
            {frame: 2, snd: "teleport2"},
            {frame: 4, display: true},
        ],
        offset: Vector2.zero,
    },

    wizard_circle: {
        keyframes: [
            {frame: 2, snd: "mase_charge"},
            {frame: 11, display: true},
        ],
        offset: new Vector2(0, 0.5),
    },

    smokebomb: {
        keyframes: [
            {frame: 7, snd: "kiblast"},
            {frame: 9, display: true},
        ],
        offset: new Vector2(0, 0.25),
    },

    snipe: {
        keyframes: [
            {frame: 1, snd: "disc_fire"},
            {frame: 9, snd: "eyebeam_fire"},
            {frame: 9, display: true},
        ],
        offset: new Vector2(-0.2, 0.25),
    },

    load: {
        keyframes: [
            {frame: 2, snd: "mase_charge"},
            {frame: 11, display: true},
        ],
        offset: new Vector2(0, 0.5),
    },

    rift_front: {
        keyframes: [
            {frame: 0, part_back: "entry_rift_back"},
            {frame: 0, pos_offset: new Vector2(-2048, 0)},
            {frame: 0, weaponsiz: 0.1},
            
            {frame: 0, snd: "shenron_eye_glow"},

            {frame: 5, pos_offset: new Vector2(2048 * 0.325, 0)},
            {frame: 6, display: true},
            {frame: 7, weaponsiz: 5},

            {frame: 7, pos_offset: new Vector2(2048 * 0.675*0.5, 0)},
            {frame: 7, weaponsiz: 2},
            
            {frame: 8, pos_offset: new Vector2(2048 * 0.675*0.25, 0)},

            {frame: 9, pos_offset: new Vector2(2048 * 0.675*0.15, 0)},
            {frame: 10, pos_offset: new Vector2(2048 * 0.675*0.1, 0)},
        ],
        offset: new Vector2(-2, 0)
    },

    translocator: {
        keyframes: [
            {frame: 0, snd: "kiblast"},
            {frame: 0, snd: "translocator_dodge", gain: 0.2},
            {frame: 1, snd: "eyebeam_fire"},
            {frame: 4, display: true},
        ],
        size_mult: 1.6,
        offset: new Vector2(0, 0.333),
    },

    bolt: {
        keyframes: [
            {frame: 3, snd: "lightningbolt4", gain: 0.375},
            {frame: 7, display: true},
        ],
        size_mult: 1.25,
        offset: new Vector2(0, 0.333),
        speed_mult: 0.85,
    },
}

const TIERS = {
    ULTRA: "ULTRA",
    X: "X",
    SPLUS: "SPLUS",
    S: "S",
    APLUS: "APLUS",
    A: "A",
    BPLUS: "BPLUS",
    B: "B",
    C: "C",
    DISMAL: "DISMAL",
}

const TIERS_INFO = {
    [TIERS.ULTRA]: {
        name: "ULTRA",
        desc: "Hugely powerful; almost unbeatable.",
        col: Colour.white,
    },
    [TIERS.X]: {
        name: "X",
        desc: "Able to easily demolish all but the strongest of opponents.",
        col: new Colour(255, 255, 192, 255),
    },
    [TIERS.SPLUS]: {
        name: "S+",
        desc: "Very strong and versatile, with an edge over even other S-tier balls.",
        col: new Colour(255, 255, 128, 255),
    },
    [TIERS.S]: {
        name: "S",
        desc: "Very strong and versatile, with significant advantages over A-tier balls.",
        col: new Colour(255, 255, 128, 255),
    },
    [TIERS.APLUS]: {
        name: "A+",
        desc: "Noticeably stronger versus A-tier balls.",
        col: new Colour(128, 255, 128, 255),
    },
    [TIERS.A]: {
        name: "A",
        desc: "Average, unremarkable strength.",
        col: new Colour(128, 255, 128, 255),
    },
    [TIERS.BPLUS]: {
        name: "B+",
        desc: "Reasonably weaker compared to A-tier but still far from ineffective.",
        col: new Colour(128, 255, 255, 255),
    },
    [TIERS.B]: {
        name: "B",
        desc: "Weak, with few redeeming factors.",
        col: new Colour(128, 255, 255, 255),
    },
    [TIERS.C]: {
        name: "C",
        desc: "Very weak, disadvantaged in almost every matchup.",
        col: new Colour(255, 128, 255, 255),
    },
    [TIERS.DISMAL]: {
        name: "DISMAL",
        desc: "Practically incapable of winning.",
        col: new Colour(128, 128, 128, 255),
    },
}

const CATEGORIES = {
    STANDARD: "STANDARD",

    LOWTIER: "LOWTIER",
    HIGHTIER: "HIGHTIER",

    SILLY: "SILLY",
    SILLY2: "SILLY2",

    POWERED: "POWERED",
}

const CATEGORIES_INFO = {
    [CATEGORIES.STANDARD]: {
        desc: "Follows the rules, always has 100 base HP and usually has a consistent power level (A-tier at LV1, A+ at LV100).",
        col: Colour.white,
    },
    [CATEGORIES.LOWTIER]: {
        desc: "Like STANDARD balls but with a lower power level - usually with lower base HP.",
        col: new Colour(128, 255, 128, 255),
    },
    [CATEGORIES.HIGHTIER]: {
        desc: "Like STANDARD balls but with a higher power level - sometimes with higher base HP.",
        col: new Colour(255, 255, 128, 255),
    },
    [CATEGORIES.SILLY]: {
        desc: "Usually made initially as a joke. Often inconsistent in power level or slightly crazy.",
        col: new Colour(255, 128, 255, 255),
    },
    [CATEGORIES.SILLY2]: {
        desc: "Page 2! Usually made initially as a joke. Often inconsistent in power level or slightly crazy.",
        col: new Colour(255, 192, 255, 255),
    },
    [CATEGORIES.POWERED]: {
        desc: "Primarily uses game-aware movement like homing, auto-aim or dodging. Almost always very strong.",
        col: new Colour(255, 128, 128, 255),
    },
}

const TAGS = {
    UNTAGGED: "UNTAGGED",
    MELEE: "MELEE",
    RANGED: "RANGED",
    HYBRID: "HYBRID",
    DEFENSIVE: "DEFENSIVE",
    OFFENSIVE: "OFFENSIVE",
    BALANCED: "BALANCED",
    ADAPTIVE: "ADAPTIVE",
    AILMENTS: "AILMENTS",
    CHILDREN: "CHILDREN",
    SCALING: "SCALING",
    TRANSFORMING: "TRANSFORMING",
    PROJECTILES: "PROJECTILES",
    AOE: "AOE",
    HITSCAN: "HITSCAN",
    HOMING: "HOMING",
    AUTOAIM: "AUTOAIM",
    SMART: "SMART",
    LEVELS_UP: "LEVELS_UP",
    CAN_AWAKEN: "CAN_AWAKEN",
}

const TAGS_INFO = {
    [TAGS.UNTAGGED]: {
        name: "Untagged",
        desc: "@plaaosert has forgotten to tag this ball. Go yell at him.",
        display_ingame: false,
    },
    [TAGS.MELEE]: {
        name: "Melee",
        desc: "Fights using only melee weapons.",
        display_ingame: true,
    },
    [TAGS.RANGED]: {
        name: "Ranged",
        desc: "Fights primarily using ranged methods.",
        display_ingame: true,
    },
    [TAGS.HYBRID]: {
        name: "Hybrid",
        desc: "Relies on both melee and ranged attacks.",
        display_ingame: true,
    },
    [TAGS.DEFENSIVE]: {
        name: "Defensive",
        desc: "Focused more on avoiding or mitigating damage than quickly dealing it.",
        display_ingame: true,
    },
    [TAGS.OFFENSIVE]: {
        name: "Offensive",
        desc: "Focused more on quickly dealing large amounts of damage than mitigating opposing hits.",
        display_ingame: true,
    },
    [TAGS.BALANCED]: {
        name: "Balanced",
        desc: "Does not significantly focus on offensive or defensive strategies.",
        display_ingame: true,
    },
    [TAGS.ADAPTIVE]: {
        name: "Adaptive",
        desc: "Balance between offense and defense can change at random or in response to situations.",
        display_ingame: true,
    },
    [TAGS.AILMENTS]: {
        name: "Ailments",
        desc: "Able to apply ailments (poison, rupture, burn) with attacks.",
        display_ingame: true,
    },
    [TAGS.CHILDREN]: {
        name: "Sub-balls",
        desc: "Creates other sub-balls to defend, attack or support the main ball.",
        display_ingame: true,
    },
    [TAGS.SCALING]: {
        name: "Scaling",
        desc: "Scales in strength as it meets a specific criterion, e.g. damage or survival time.",
        display_ingame: true,
    },
    [TAGS.TRANSFORMING]: {
        name: "Transforming",
        desc: "Has the capacity to change significantly during a battle, sometimes becoming a completely new ball.",
        display_ingame: true,
    },
    [TAGS.PROJECTILES]: {
        name: "Projectiles",
        desc: "Shoots projectiles as part of some or all attacks.",
        display_ingame: true,
    },
    [TAGS.AOE]: {
        name: "AoE",
        desc: "Weapons or projectiles create an area of effect that persists for some time and applies effects or damage.",
        display_ingame: true,
    },
    [TAGS.HITSCAN]: {
        name: "Hitscan",
        desc: "Shoots hitscan (instant) projectiles as part of some or all attacks.",
        display_ingame: true,
    },
    [TAGS.HOMING]: {
        name: "Homing",
        desc: "Projectiles are sometimes or always capable of homing towards targets.",
        display_ingame: true,
    },
    [TAGS.AUTOAIM]: {
        name: "Auto-aim",
        desc: "An aiming mechanism is sometimes or always able to override typical weapon rotation.",
        display_ingame: true,
    },
    [TAGS.SMART]: {
        name: "Smart",
        desc: "Attempts to position weapons or adjust velocity to land and/or avoid attacks.",
        display_ingame: true,
    },
    [TAGS.LEVELS_UP]: {
        name: "Levels up",
        desc: "The \"level\" stat has an effect on this ball, improving it in some way.",
        display_ingame: false,
    },
    [TAGS.CAN_AWAKEN]: {
        name: "Can awaken",
        desc: "This ball is capable of \"awakening\" at max level which provides it with additional powerful bonuses.",
        display_ingame: false,
    },
}

const PRONOUN = {
    THEY: "they/them",
    HE: "he/him",
    SHE: "she/her",
    IT: "it/its",
}

class BallWeapon {
    constructor(size_multiplier, sprite, hitboxes) {
        this.size_multiplier = size_multiplier * WEAPON_SIZE_MULTIPLIER;
        this.sprite = sprite;

        // all hitboxes are {pos, radius} - so they're circles, not boxes. sorry liberals
        this.hitboxes = hitboxes;

        this.angle = 0;

        this.reversed = false;

        this.unparriable = false;

        this.offset = new Vector2(0, 0);

        this.frame = 0;

        this.display = true;
    }

    rotate(by_deg, reverse) {
        this.angle += by_deg * (Math.PI / 180) * ((this.reversed ^ reverse) ? -1 : 1);
    }

    reverse() {
        this.reversed = !this.reversed;
    }
}

// abstract class that rotates a SORD at a base rotation speed with no other effects
// also implements weapon collision
// levels go from 1 to 7, with 7 being an "awakened" level that has a bonus effect
class WeaponBall extends Ball {
    static RUPTURE_CALCULATION_CONSTANT = Math.LN2

    static ball_name = "No Weapon";

    static AVAILABLE_SKINS = [];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, skip_aero_lookup=false) {
        super(board, mass, radius, colour, bounce_factor, friction_factor);

        this.local_id = this.board.get_local_id();

        this.name = "No Weapon";
        this.description_brief = "Does nothing. Unarmed, but not the awesome kind.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.ult_description = "No ult... or no description.";

        this.quote = "I won? I won! How'd I win?!";

        this.pronoun = PRONOUN.THEY;
        this.tagline = "I wish I had a tagline..."
        this.description = "I wish people knew what I did..."
        this.lore_description = "I wish people knew more about me..."
        this.weapon_relationship = "A quote would go here, probably."
        this.lore_origin = "Somewhere"
        this.lore_temperament = "Probably quite nice"
        this.lore_affiliation = "Independent"
        this.lore_alignment = "neutral"
        this.lore_birthday = "1st Jan"

        this.default_colour = Colour.red;

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.STANDARD;
        this.tags = [TAGS.UNTAGGED];

        this.level_limit = 99;

        this.entry_animation = "impact";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;
        this.entry_animation_size_mult = 1;
        this.entry_animation_speed_mult = 1;

        // player.stats:
        /*
            damage_bonus       [multiplier]
            defense_bonus      [multiplier]
            ailment_resistance [multiplier]
            
            unique_level   [int]
        */
        this.player = player;
        this.temp_stat_modifiers = {

        }

        if (this.player.stats) {
            Object.keys(this.player.stats).forEach(k => {
                this.temp_stat_modifiers[k] = 1;
            })
        }

        // weaponballs have a set of weapons that spin around them
        this.weapon_data = [
            new BallWeapon(0, "SORD", [
                
            ])
        ];

        // every hit deals a minimum of 1 damage and 100 hp is the max for everyone
        this.max_hp = STARTING_HP;
        this.hp = this.max_hp;
        
        // -1 means it doesn't have an ult
        this.ult_cost = -1;
        this.ult_current_charge = 0;
        this.ult_charge_cooldown = 0;
        this.ult_line = [
            {
                text: "i have ",
                initial_delay: 0,
                delay_per_char: 0.1,
            },
            {
                text: "no ult line...",
                initial_delay: 0,
                delay_per_char: 0.2,
                mods: {
                    shaking: true
                }
            }
        ]
        this.ult_special_lines = [];

        this.ult_ring_delay = 0.2;
        this.ult_ring_delay_max = 0.2;
        this.ult_particle_delay = 0.02;
        this.ult_particle_delay_max = 0.02;

        this.speak_voice = null;

        this.takes_damage = true;

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
        this.level = level;

        this.show_stats = true;
        this.display = true;
        this.display_hp = true;

        this.desc_shake_intensity = 0;
        this.desc_shake_offset = Vector2.zero;
        this.desc_shake_offset_freq_max = 0.02;
        this.desc_shake_offset_freq = this.desc_shake_offset_freq_max;

        this.lifetime = 0;

        this.rupture_intensity = 0;

        this.poison_intensity = 0;
        this.poison_duration = 0;

        this.burn_intensity = 0;

        this.ailments_particles_threshold_max = 0.5;
        this.ailments_particles_thresholds = [
            this.ailments_particles_threshold_max,
            this.ailments_particles_threshold_max,
            this.ailments_particles_threshold_max
        ];

        this.last_damage_source = null;

        this.cached_weapon_offsets = [];
        this.cached_hitboxes_offsets = [];

        this.skin_name = "Default";
        this.custom_parry_sound = "";
        this.custom_projectile_parry_sound = "";

        this.description_line_num = 0;
        this.description_line_spacing = 12;

        this.saved_ctx = null;
        this.saved_x_anchor = 0;
        this.saved_y_anchor = 0;
        this.sizedown_desc = false;

        this.desc_colour = null;
        this.alt_colour = null;
        this.border_colour = null;
        this.border_alt_colour = null;

        this.aero_normal_colour = null;
        this.aero_hit_colour = null;
        this.aero_border_colour = null;

        this.update_col_datas();

        this.alt_flash_freq = 1;
        this.alt_flash_dur = 0.2;
        this.render_alt = false;

        this.linked_hat_particle = null;

        this.aero_light_lookup_table_sums = null;
        this.aero_light_lookup_table_props = null;
        this.aero_light_lookup_table_size = 0;

        this.aero_ctxes = null;

        this.aero_radius_table = null;

        this.aero_canvases = null;
        this.needs_aero_setup = !skip_aero_lookup;

        this.opacity = 1;
        this.weapon_opacity = null;

        this.independent_random = get_seeded_randomiser(this.board.random_seed + this.local_id);
    
        this.special_hit_tag = [null, 0];

        this.gets_hit = true;
        this.can_hit = true;

        this.event_listeners = {};
    }

    add_event_listener(event_name, fn) {
        let lis = this.event_listeners[event_name] ?? [];
        lis.push(fn);

        this.event_listeners[event_name] = lis;
    }

    dispatch_event(event_name, parameters=[]) {
        // clear them out
        // call them all
        let events = this.event_listeners[event_name] ?? [];
        this.event_listeners[event_name] = [];
        events.forEach(e => {
            e(this, ...parameters);
        })
    }

    get_stat(name) {
        return (this.player?.stats[name] ?? 1) * (this.temp_stat_modifiers[name] ?? 1);
    }

    late_setup() {
        // late_setup is applied after the ball knows what the board is
        // (and is added to the board)
        // and after overridden constructors are called

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    setup_aero_light_lookup_table() {
        // console.log("aero")

        if (!this.board.size) {
            this.aero_light_lookup_table_props = null;
            this.aero_light_lookup_table_sums = null;
            return;
        }

        let ball_siz_scaled = Math.round(this.radius * scaling.true_zoom_level);

        let lb = Math.floor(-ball_siz_scaled / 1);
        let ub = Math.ceil(ball_siz_scaled / 1) + 1;

        let s = ub - lb;
        this.aero_light_lookup_table_size = s;

        this.aero_light_lookup_table_sums = new Array(s * s);
        this.aero_light_lookup_table_props = new Array(s * s);

        switch (AERO_LIGHTING_CONFIG) {
            case AERO_LIGHTING_CONFIGS.SIMPLE: {
                let light_centers = [-ball_siz_scaled * 0.05, -ball_siz_scaled * 0.3];

                for (let y=0; y<s; y++) {
                    for (let x=0; x<s; x++) {
                        let xt = x - ball_siz_scaled;
                        let yt = y - ball_siz_scaled;

                        let sum = Math.pow(xt, 2) + Math.pow(yt, 2);
                        let dist = Math.sqrt(
                            Math.pow(xt - light_centers[0], 2) + Math.pow(yt - light_centers[1], 2)
                        );
                        let prop = dist / ball_siz_scaled;

                        this.aero_light_lookup_table_sums[(y * s) + x] = sum;
                        this.aero_light_lookup_table_props[(y * s) + x] = prop;
                    }
                }

                break;
            }

            case AERO_LIGHTING_CONFIGS.VISTA:
            case AERO_LIGHTING_CONFIGS.NEON:
            case AERO_LIGHTING_CONFIGS.SPOTLIGHT: {
                let light_centers = [
                    [new Vector2(-ball_siz_scaled * 0.5, -ball_siz_scaled * 0.5), 1],
                    [new Vector2(-ball_siz_scaled * 0, -ball_siz_scaled * 0), -0.2],
                ];

                /*
                let light_rot_angle = this.position.angle();

                light_centers = light_centers.map(c => {
                    return [c[0].rotate(light_rot_angle), c[1]];
                })
                */
                let light_rot_angle = 0;

                let auroras = [
                    {
                        shiny_level: -1.1,
                        shiny_min: ball_siz_scaled * 0.75,
                        shiny_max: ball_siz_scaled * 0.9,
                        shiny_diff: null,
                        angles: [deg2rad(120), deg2rad(0)],
                        angles_length: deg2rad(45),
                        shiny_min_sqr: null,
                        shiny_max_sqr: null,
                    },

                    {
                        shiny_level: 0.5,
                        shiny_min: ball_siz_scaled * 0.8,
                        shiny_max: ball_siz_scaled,
                        shiny_diff: null,
                        angles: [deg2rad(0)],
                        angles_length: deg2rad(360),
                        shiny_min_sqr: null,
                        shiny_max_sqr: null,
                    },

                    {
                        shiny_level: -0.3,
                        shiny_min: ball_siz_scaled * 0.3,
                        shiny_max: ball_siz_scaled * 0.7,
                        shiny_diff: null,
                        angles: [deg2rad(45)],
                        angles_length: deg2rad(135),
                        shiny_min_sqr: null,
                        shiny_max_sqr: null,
                    },
                ];

                let rounding_factor = 1;
                
                if (AERO_LIGHTING_CONFIG == AERO_LIGHTING_CONFIGS.NEON) {
                    // replace with neon effect
                    light_centers = [
                        [new Vector2(-ball_siz_scaled * 0.15, -ball_siz_scaled * 0.3), 1]
                    ];

                    auroras = [
                        {
                            shiny_level: -1,
                            shiny_min: ball_siz_scaled * 1,
                            shiny_max: ball_siz_scaled * 0.75,
                            shiny_diff: null,
                            angles: [deg2rad(0)],
                            angles_length: deg2rad(36000),
                            shiny_min_sqr: null,
                            shiny_max_sqr: null,
                        },
                    ];
                } else if (AERO_LIGHTING_CONFIG == AERO_LIGHTING_CONFIGS.SPOTLIGHT) {
                    light_centers = [
                        [new Vector2(-ball_siz_scaled * 0.2, -ball_siz_scaled * 0.2), 1],
                    ];

                    auroras = [
                        {
                            shiny_level: -0.8,
                            shiny_min: ball_siz_scaled * 0.7,
                            shiny_max: ball_siz_scaled * 0.9,
                            shiny_diff: null,
                            angles: [deg2rad(0)],
                            angles_length: deg2rad(360),
                            shiny_min_sqr: null,
                            shiny_max_sqr: null,
                        },

                        {
                            shiny_level: 0.5,
                            shiny_min: ball_siz_scaled * 0.8,
                            shiny_max: ball_siz_scaled,
                            shiny_diff: null,
                            angles: [deg2rad(315)],
                            angles_length: deg2rad(135),
                            shiny_min_sqr: null,
                            shiny_max_sqr: null,
                        },

                        {
                            shiny_level: 0.5,
                            shiny_min: ball_siz_scaled * 0.8,
                            shiny_max: ball_siz_scaled,
                            shiny_diff: null,
                            angles: [deg2rad(135)],
                            angles_length: deg2rad(135),
                            shiny_min_sqr: null,
                            shiny_max_sqr: null,
                        },
                    ];
                }

                auroras.forEach(a => {
                    a.shiny_diff = a.shiny_max - a.shiny_min;
                    a.shiny_min_sqr = Math.pow(a.shiny_min, 2);
                    a.shiny_max_sqr = Math.pow(a.shiny_max, 2);
                })

                for (let y=0; y<s; y++) {
                    for (let x=0; x<s; x++) {
                        let xt = x - ball_siz_scaled;
                        let yt = y - ball_siz_scaled;

                        xt = Math.round(xt / rounding_factor) * rounding_factor;
                        yt = Math.round(yt / rounding_factor) * rounding_factor;

                        let sum = Math.pow(xt, 2) + Math.pow(yt, 2);
                        let props = light_centers.map(c => {
                            let dist = (Math.sqrt(
                                Math.pow(xt - c[0].x, 2) + Math.pow(yt - c[0].y, 2)
                            ) * c[1]);

                            let light_prop = dist / ball_siz_scaled;

                            return light_prop;
                        });

                        let aurora_light = 0;
                        let sqr_abs_dist = Math.pow(xt, 2) + Math.pow(yt, 2);
                        auroras.forEach(aurora => {
                            if (sqr_abs_dist >= aurora.shiny_min_sqr && sqr_abs_dist <= aurora.shiny_max_sqr) {
                                let vec = new Vector2(xt, yt);
                                let angle = positive_mod(vec.angle() + light_rot_angle, Math.PI * 2);

                                let dist = Math.sqrt(sqr_abs_dist);

                                let aurora_diffs = aurora.angles.map(a => Math.min((2 * Math.PI) - Math.abs(a - angle), Math.abs(a - angle)));
                                let aurora_diff = Math.min(...aurora_diffs);

                                let aurora_angle_prop = 1 - Math.min(1, aurora_diff / aurora.angles_length);

                                let aurora_dist_prop = 1 - ((Math.abs((dist - aurora.shiny_min) - (aurora.shiny_diff / 2)) * 2) / aurora.shiny_diff);

                                aurora_light += aurora.shiny_level * aurora_dist_prop * aurora_angle_prop;
                            }
                        });

                        let prop = Math.min(1, props.reduce((p, c) => p+c, 0));
                        prop += aurora_light;

                        this.aero_light_lookup_table_sums[(y * s) + x] = sum;
                        this.aero_light_lookup_table_props[(y * s) + x] = prop;
                    }
                }
                
                break;
            }
        }

        let w = 25 * scaling.screen_scaling_factor;

        let ball_cols = [
            this.aero_normal_colour,
            this.aero_hit_colour
        ]

        let sqr_radius = Math.pow(this.radius * scaling.true_zoom_level, 2);
        let sqr_inner_radius = Math.pow((this.radius * scaling.true_zoom_level) - (w * 1.2), 2);

        let lightest = Colour.white;
        let lightest_amt = 0.8;
        let darkest = Colour.black;
        let darkest_amt = 0.5;

        if (AERO_LIGHTING_CONFIG == AERO_LIGHTING_CONFIGS.SPOTLIGHT) {
            lightest = SPOTLIGHT_LIGHT_COL;
            lightest_amt = 0.95;
            darkest = SPOTLIGHT_DARK_COL;
            darkest_amt = 0.8;
        }

        let border_col = this.aero_border_colour;

        // this.setup_aero_light_lookup_table();

        let xmin = 0;
        let xmax = s;

        let ymin = 0;
        let ymax = s;

        let ctxes = this.aero_ctxes ?? [null, null];
        let imagedatas = [null, null];
        if (!this.aero_canvases) {
            this.aero_canvases = [null, null];
            for (let i=0; i<2; i++) {
                this.aero_canvases[i] = document.createElement("canvas");
                this.aero_canvases[i].width = ymax-ymin;
                this.aero_canvases[i].height = xmax-xmin;

                ctxes[i] = this.aero_canvases[i].getContext("2d");
                imagedatas[i] = ctxes[i].getImageData(0, 0, this.aero_canvases[i].width, this.aero_canvases[i].width);
            
                this.aero_ctxes = ctxes;
            }
        } else {
            for (let i=0; i<2; i++) {
                this.aero_canvases[i].width = ymax-ymin;
                this.aero_canvases[i].height = xmax-xmin;

                ctxes[i] = this.aero_canvases[i].getContext("2d");
                imagedatas[i] = ctxes[i].getImageData(0, 0, this.aero_canvases[i].width, this.aero_canvases[i].width);
            }
        }

        // TODO currently we do two loops through the ball,
        // we really only need to do one

        let cols = [null, null];
        for (let y=ymin; y<ymax; y++) {
            for (let x=xmin; x<xmax; x++) {
                let idx1 = ((y * this.aero_canvases[0].width) + x)
                let idx4 = idx1 * 4;
                // let sum = Math.pow(xt, 2) + Math.pow(yt, 2);

                // let dist = Math.sqrt(
                //     Math.pow(xt - light_center[0], 2) + Math.pow(yt - light_center[1], 2)
                // );

                let sum = this.aero_light_lookup_table_sums[idx1];

                let col = null;
                if (sum > sqr_radius) {
                    // col stays blank
                    for (let i=0; i<ball_cols.length; i++) {
                        cols[i] = null;
                    }
                } else {
                    let prop = this.aero_light_lookup_table_props[idx1];
                    let val = Math.abs(prop - 0.5) * 2;
                    for (let i=0; i<ball_cols.length; i++) {
                        col = ball_cols[i].lerp(prop < 0.5 ? lightest : darkest, (prop < 0.5 ? lightest_amt : darkest_amt) * val);
                        if (sum > sqr_inner_radius)
                            col = border_col

                        cols[i] = col;
                    }
                }

                for (let i=0; i<ball_cols.length; i++) {
                    if (cols[i]) {
                        let data = cols[i].data;

                        for (let c=0; c<4; c++) {
                            imagedatas[i].data[idx4+c] = data[c];
                        }
                    }
                }
            }
        }

        ctxes.forEach((ctx, i) => {
            ctx.putImageData(imagedatas[i], 0, 0);
        })
    }

    set_radius(to) {
        this.radius = to;
        this.needs_aero_setup = true;
    }

    set_colour(to_col) {
        this.colour = to_col;
        this.needs_aero_setup = true;
    }

    update_col_datas() {
        this.desc_colour = this.colour.lerp(Colour.white, 0.2);
        this.alt_colour = this.colour.lerp(Colour.white, 0.2);

        this.border_colour = this.colour.lerp(Colour.black, 0.9);
        this.border_alt_colour = this.alt_colour.lerp(Colour.black, 0.9);
    
        this.aero_normal_colour = this.colour.lerp(Colour.black, 0.1);
        this.aero_hit_colour = this.colour.lerp(Colour.black, 0.75).lerp(Colour.black, 0.1);
        this.aero_border_colour = this.colour.lerp(Colour.white, 0.75);
    }

    set_skin(skin_name) {
        // do nothing
        // other balls will implement skins as necessary
        // mostly it will replace the weapon sprite and maybe some particle effects
        this.skin_name = skin_name;
    }

    create_weapon_afterimage(index, opacity=0.75, duration=0.25, sprite_override=null) {
        let spr_name = sprite_override ?? this.weapon_data[index].sprite;
    
        let pos = this.get_weapon_offset(index).add(this.position);
        let part = this.board.spawn_particle(new Particle(
            pos, this.weapon_data[index].angle,
            this.weapon_data[index].size_multiplier / WEAPON_SIZE_MULTIPLIER,
            entity_sprites.get(spr_name),
            0, duration
        ), pos).add_component(new FadeOutParticleComponent(
            this.board, 0, opacity, 2
        ));

        part.time_locked = false

        part.opacity = opacity;
        part.alternative_layer = "fg3";

        return part;
    }

    create_self_afterimage(opacity=0.3, duration=0.25, alt_proto=null) {
        let part = new (alt_proto ?? SqrFadingBallParticle)(
            this.position, duration,
            this.colour, this.radius, opacity,
            this.aero_canvases
        )

        this.board.spawn_particle(part, this.position);
    
        return part;
    }
    
    start_writing_desc(ctx, x_anchor, y_anchor, sizedown=false) {
        this.sizedown_desc = sizedown;
        this.description_line_num = 0;

        this.saved_ctx = ctx;
        this.saved_x_anchor = x_anchor;
        this.saved_y_anchor = y_anchor;
    }

    get_current_desc_col() {
        return this.render_alt ? this.desc_colour : this.alt_colour;
    }

    get_current_col() {
        return this.colour;
    }

    get_current_border_col() {
        return this.render_alt ? this.border_colour : this.border_alt_colour;
    }

    write_desc_line(text, awakened, fontsiz=null, custom_col=null, previous_line=false, x_offset=0) {
        if (previous_line) {
            this.description_line_num--;
        }
        
        let ball_col = this.get_current_desc_col();

        let col = custom_col ?? (awakened ? ball_col.lerp(Colour.white, 0.5).css() : ball_col.css());

        let siz = fontsiz ?? 12;
        if (this.sizedown_desc) {
            siz = sizedown_lookup[siz] ?? siz;
        }

        let xpos = this.saved_x_anchor + x_offset;
        let ypos = this.saved_y_anchor + (
            this.description_line_num * this.description_line_spacing
        );
        let ctx = this.saved_ctx;
        let txt = text;
        let fnt = CANVAS_FONTS;

        if (BALL_DESC_BORDER_SIZE == 0) {
            write_text(
                ctx, txt, xpos, ypos, col, fnt, siz
            );
        } else {
            let border_col = "";
            if (custom_col) {
                border_col = this.get_current_border_col().css();
            } else {
                border_col = this.get_current_border_col().css();
            }

            write_pp_bordered_text(
                ctx, txt, xpos, ypos, col, fnt, siz, false, BALL_DESC_BORDER_SIZE, border_col
            );
        }

        this.description_line_num++;
    }

    get_ailment_hp_loss() {
        // returns the amount of HP that will be lost to ailments
        let rupture_amt = Math.max(0, this.rupture_intensity) / WeaponBall.RUPTURE_CALCULATION_CONSTANT;
        if (rupture_amt < 0.05) {
            rupture_amt = 0;
        }

        return {
            // i love you integral calculator
            // wow maths is so beautiful actually i should get on that shit again
            "rupture": rupture_amt,
            "poison": Math.max(0, this.poison_intensity) * Math.max(0, this.poison_duration),
            "burn": Math.max(0, this.burn_intensity) * 10  // burn doesn't go down, so take the next 10s
        }
    }

    gain_hp(amt, source, bypass_damage_prevention=false) {
        if (this.takes_damage || bypass_damage_prevention) {
            let hp_to_gain = Math.min(this.max_hp - this.hp, amt);

            // we don't care about overkill for the ball itself but we do for tension
            this.hp += hp_to_gain;

            this.board.register_hp_gain(source, this, hp_to_gain);

            return amt;
        }

        return 0;
    }

    lose_hp(amt, source, bypass_damage_prevention=false) {
        if (this.takes_damage || bypass_damage_prevention) {
            let hp_to_lose = Math.min(this.hp, amt);

            // we don't care about overkill for the ball itself but we do for tension
            this.hp -= amt;

            this.board.register_hp_loss(source, this, hp_to_lose);

            this.charge_ultimate(HP_LOSS_ULT_CHARGE * amt);
            if (source?.charge_ultimate && source.id != this.id) {
                source.charge_ultimate(DEAL_DAMAGE_ULT_CHARGE * amt);
            }

            return amt;
        }

        return 0;
    }

    allied_with(other) {
        return this.player?.id === other.player?.id;
    }

    randomise_weapon_rotations() {
        this.weapon_data.forEach(w => {
            w.angle = 0;
            w.rotate(random_float(0, 360, this.board.random));
        })
    }

    rotate_weapon(index, by_deg) {
        this.weapon_data[index]?.rotate(by_deg, this.reversed);
    }

    reverse_weapon(index) {
        this.weapon_data[index]?.reverse();
    }

    ailments_step(board, time_delta) {
        // do particles
        let predicted = this.get_ailment_hp_loss();
        let lis = ["rupture", "poison", "burn"];
        for (let i=0; i<3; i++) {
            let a = lis[i];
            this.ailments_particles_thresholds[i] -= Math.min(predicted[a], 500) * time_delta;
            while (this.ailments_particles_thresholds[i] <= 0) {
                this.ailments_particles_thresholds[i] += this.ailments_particles_threshold_max;

                let r = Math.min(random_float(0, this.radius), random_float(0, this.radius));

                let pos = this.position.add(random_on_circle(r));
                
                let part = new AilmentParticle(
                    pos, random_float(0, Math.PI * 2), 0.5, entity_sprites.get(a), 1
                );

                board.spawn_particle(part, pos);
            }
        }

        // poison deals intensity dps for duration seconds
        if (this.poison_duration <= 0) {
            this.poison_intensity = 0;
        } else {
            this.lose_hp(this.poison_intensity * time_delta, "ailment");
        }
        
        this.poison_duration -= time_delta;

        // rupture deals intensity dps and reduces by 50%/s
        if (this.rupture_intensity > 0) {
            this.lose_hp(this.rupture_intensity * time_delta, "ailment");
            this.rupture_intensity = lerp(this.rupture_intensity, 0, 1 - compat_pow(0.5, time_delta));
        }

        // burn deals constant dps and permanently increases damage taken
        if (this.burn_intensity > 0) {
            this.lose_hp(this.burn_intensity * time_delta, "ailment");
        }
    }

    physics_step(board, time_delta) {
        // TODO think about how best to make this less annoying to override
        this.lifetime += time_delta;

        this.desc_shake_intensity = lerp(this.desc_shake_intensity, 0, 1 - compat_pow(0.01, time_delta));
        this.desc_shake_offset_freq -= time_delta;
        if (this.desc_shake_offset_freq <= 0) {
            this.desc_shake_offset_freq = this.desc_shake_offset_freq_max;

            this.desc_shake_offset = [
                (Math.random() - 0.5) * this.desc_shake_intensity,
                (Math.random() - 0.5) * this.desc_shake_intensity
            ]
        }

        this.hitstop -= time_delta;
        if (this.hitstop > 0) {
            time_delta *= HITSTOP_DELTATIME_PENALTY;
        }

        super.physics_step(time_delta);

        let weapon_time_delta = time_delta * this.get_stat("timespeed_mult")
        this.weapon_step(board, weapon_time_delta);
        
        // ult charge / trigger
        this.ult_charge_cooldown -= weapon_time_delta;
        this.passive_ultimate_charge(weapon_time_delta);
        this.check_ultimate();

        this.ailments_step(board, time_delta);

        this.invuln_duration -= time_delta;
        this.weapon_data.forEach(w => w.angle = positive_mod(w.angle, (Math.PI * 2)));

        // not amazing but should at least uplift performance a bit
        // just to cache every physics step
        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();

        // do alt-colour stuff to hopefully improve compression
        let lifetime_mod = this.lifetime % this.alt_flash_freq;
        this.render_alt = lifetime_mod < this.alt_flash_dur;

        this.special_hit_tag[1] -= time_delta;

        // move linked hat particle if there is one
        this.update_particles(time_delta);

        this.do_ult_particles(time_delta);
    }

    do_ult_particles(time_delta) {
        if (!this.has_an_ultimate()) {
            return;
        }

        let amt = Math.pow((this.ult_current_charge / this.ult_cost), 5) * time_delta;

        this.ult_ring_delay -= amt;
        this.ult_particle_delay -= amt;

        while (this.ult_ring_delay <= 0) {
            this.ult_ring_delay += this.ult_ring_delay_max;

            this.board.spawn_particle(new Particle(
                this.position, 0, 2, entity_sprites.get("ult_flash"),
                12, 2
            ), this.position);
        }

        while (this.ult_particle_delay <= 0) {
            this.ult_particle_delay += this.ult_particle_delay_max;

            let pos = this.position.add(random_on_circle(
                this.radius * Math.pow(random_float(0, 1, this.independent_random), 2),
                this.independent_random
            ));

            this.board.spawn_particle(new AilmentParticle(
                pos, 0, 1, entity_sprites.get("ult_point"), 1
            ), pos);
        }
    }

    update_particles(time_delta) {
        if (this.linked_hat_particle) {
            this.linked_hat_particle.position = this.position;
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, 180 * time_delta);
    }

    cache_weapon_offsets() {
        this.cached_weapon_offsets = [];

        this.weapon_data.forEach((weapon, index) => {
            let offset = new Vector2(this.radius + ((weapon.size_multiplier * 0.75) * 128 * 0.5), 0);

            // add the weapon's personal offset
            offset = offset.add(weapon.offset.mul(weapon.size_multiplier));

            offset = offset.rotate(weapon.angle);

            this.cached_weapon_offsets[index] = offset;  // this is the center of the weapon
        });
    }

    get_weapon_offset(weapon_index) {
        return this.cached_weapon_offsets[weapon_index];
    }

    cache_hitboxes_offsets() {
        this.cached_hitboxes_offsets = [];

        this.weapon_data.forEach((weapon, index) => {
            this.cached_hitboxes_offsets[index] = weapon.hitboxes.map(hitbox => {
                return this.get_hitbox_offset(weapon, hitbox);
            })
        });
    }

    get_hitbox_offset(weapon, hitbox) {
        return hitbox.pos.sub(new Vector2(64, 64)).rotate(weapon.angle).mul(weapon.size_multiplier);
    }

    get_hitboxes_offsets(weapon_index) {
        return this.cached_hitboxes_offsets[weapon_index];
    }

    // HOW DO YOU NAME THIS
    check_weapons_hit_from(other) {
        // check if THIS BALL is hit by another ball's weapons, and if yes, return which
        let collisions = [];
        
        other.weapon_data.forEach((weapon, weapon_index) => {
            // return true if hit else false
            let hitboxes_offsets = other.get_hitboxes_offsets(weapon_index);
            let weapon_offset = other.get_weapon_offset(weapon_index);

            let collider_position = null;
            let collider_index = null;

            // then check each hitbox; the radius is simply radius * size_multiplier
            // then its classic distance checking
            let collided = hitboxes_offsets.some((hitbox_offset, index) => {
                let hitbox = weapon.hitboxes[index];

                let radius_sum = (hitbox.radius * weapon.size_multiplier) + this.radius;
                let radius_sum_sqr = compat_pow(radius_sum, 2);

                let other_hitbox_pos = other.position.add(weapon_offset).add(hitbox_offset);
                if (other_hitbox_pos.sqr_distance(this.position) <= radius_sum_sqr) {
                    collider_position = other_hitbox_pos;
                    collider_index = index;
                    
                    return true;
                } else {
                    return false;
                }
            });

            if (collided) {
                collisions.push([weapon_index, collider_position, collider_index]);
            }
        });

        return collisions;
    }

    check_weapon_to_weapon_hit_from(other) {
        // check if THIS WEAPON'S HITBOXES are hit by another ball's weapons, and if yes, return the pairs
        let collisions = [];
        this.weapon_data.forEach((weapon, index) => {
            if (weapon.unparriable) {
                return;
            }

            let this_hitboxes_offsets = this.get_hitboxes_offsets(index);
            let this_weapon_offset = this.get_weapon_offset(index);

            other.weapon_data.forEach((other_weapon, other_index) => {
                if (other_weapon.unparriable) {
                    return;
                }

                let other_hitboxes_offsets = other.get_hitboxes_offsets(other_index);
                let other_weapon_offset = other.get_weapon_offset(other_index);

                let collider_positions = null;
                let collider_indexes = null;

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (other_weapon.hitboxes[other_index].radius * other_weapon.size_multiplier);
                        let radius_sum_sqr = compat_pow(radius_sum, 2);

                        let other_hitbox_pos = other.position.add(other_weapon_offset).add(other_hitbox_offset)
                        if (this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr) {
                            collider_positions = [this_hitbox_pos, other_hitbox_pos];
                            collider_indexes = [this_index, other_index];
                            return true;
                        } else {
                            return false;
                        }
                    })
                })

                if (collided) {
                    collisions.push([index, other_index, collider_positions, collider_indexes]);
                }
            })
        })

        return collisions;
    }

    check_projectiles_hit_from(projectiles) {
        // get the projectiles' hitboxes and compare to self - super simple
        let collisions = [];

        projectiles.forEach(projectile => {
            let hitboxes_offsets = projectile.get_hitboxes_offsets();

            let collider_position = null;
            let collider_index = null;

            let collided = hitboxes_offsets.some((hitbox_offset, index) => {
                let hitbox = projectile.hitboxes[index];

                let radius_sum = (hitbox.radius * projectile.size) + this.radius;
                let radius_sum_sqr = compat_pow(radius_sum, 2);

                let other_hitbox_pos = projectile.position.add(hitbox_offset);
                if (this.position.sqr_distance(other_hitbox_pos) <= radius_sum_sqr) {
                    collider_position = other_hitbox_pos;
                    collider_index = index;
                    
                    return true;
                } else {
                    return false;
                }
            });

            if (collided) {
                collisions.push([projectile, collider_position, collider_index]);
            }
        })

        return collisions;
    }
    
    check_weapon_to_projectiles_hits(projectiles) {
        // only calculate weapon hitboxes once
        // then get the projectiles and their hitboxes, and compare to weapon hitboxes
        let collisions = [];
        this.weapon_data.forEach((weapon, index) => {
            if (weapon.unparriable) {
                return;
            }

            let this_hitboxes_offsets = this.get_hitboxes_offsets(index);
            let this_weapon_offset = this.get_weapon_offset(index);

            projectiles.forEach(projectile => {
                let collider_positions = null;
                let collider_indexes = null;

                let projectile_hitboxes_offsets = projectile.get_hitboxes_offsets();

                let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                    let this_hitbox_pos = this.position.add(this_weapon_offset).add(this_hitbox_offset)

                    return projectile_hitboxes_offsets.some((projectile_hitbox_offset, projectile_index) => {
                        let radius_sum = (weapon.hitboxes[this_index].radius * weapon.size_multiplier) + (projectile.hitboxes[projectile_index].radius * projectile.size);
                        let radius_sum_sqr = compat_pow(radius_sum, 2);

                        let projectile_hitbox_pos = projectile.position.add(projectile_hitbox_offset);
                        if (this_hitbox_pos.sqr_distance(projectile_hitbox_pos) <= radius_sum_sqr) {
                            collider_positions = [this_hitbox_pos, projectile_hitbox_pos];
                            collider_indexes = [this_index, projectile_index];
                            
                            return true;
                        } else {
                            return false;
                        }
                    })
                })

                if (collided) {
                    collisions.push([index, projectile, collider_positions, collider_indexes]);
                }
            })
        })

        return collisions;
    }

    try_get_hit(other) {
        return true;
    }

    try_get_hit_by_projectile(projectile) {
        return true;
    }

    get_closest_enemy_and_distance(predicate=null, alt_pos=null) {
        let enemylist = this.board.balls.filter(b => !this.allied_with(b));
        if (predicate) {
            enemylist = enemylist.filter(b => predicate(b));
        }

        let pos = alt_pos ?? this.position;
        let closest = enemylist.reduce((p, c) => {
            let d = pos.sqr_distance(c.position);
            if (d < p[1]) {
                return [c, d];
            }
            
            return p;
        }, [null, Number.POSITIVE_INFINITY]);

        return closest;
    }

    speak_multiline(text_segs, fontsiz, duration, linecount_start=0, text_spacing_mul=0.55, cutscene=true, shortcut_pp_text=false) {
        // there might be some newline mods. if so,
        // speak on separate lines
        let text_lines = [];
        let line_build = [];
        let delays = [];
        let delay_build = 0;
        let last_delay = 0;
        text_segs.forEach(seg => {
            if (seg.mods?.newline) {
                text_lines.push(line_build);
                delays.push(last_delay);
                last_delay = delay_build;
                
                line_build = [];
                delay_build = 0;
            }

            line_build.push(seg);

            delay_build += seg.text.length * (seg.delay_per_char ?? 0.1);
            delay_build += seg.initial_delay ?? 0;
        })

        text_lines.push(line_build);
        delays.push(last_delay);

        for (let i=0; i<text_lines.length; i++) {
            this.speak(
                text_lines[i], fontsiz, duration, linecount_start + i,
                text_spacing_mul, cutscene, delays[i], null, shortcut_pp_text
            );
        }
    }

    get_speak_voice() {
        if (this.speak_voice) {
            return this.speak_voice;
        }

        switch (this.pronoun) {
            case PRONOUN.HE: {
                return "buh1_alt";
                break;
            }

            case PRONOUN.SHE: {
                return "buh3";
                break;
            }

            case PRONOUN.IT:
            case PRONOUN.THEY: {
                return "buh10";
                break;
            }
        }
    }

    speak(text_segs, fontsiz, duration, linecount=0, text_spacing_mul=0.55, cutscene=true, initial_delay=0, voice_override=null, shortcut_pp_text=false, gain=null) {
        let voice_sound = voice_override ?? this.get_speak_voice();
        let voice_gain = gain ?? (this.speak_gain ?? 0.15);

        // set a series of timers for each letter
        // to spawn a particle
        let d = initial_delay;
        
        // because this is centered, get the total length first
        let text_total_len = text_segs.reduce((p, c) => p + c.text.length, 0);

        // fontsiz is vertical so halve it for xlen
        // if you dont use monospace 2:1 fonts are you even human ?
        let xlen = text_total_len * fontsiz * text_spacing_mul;

        // still in screen space so convert to world space
        let xt = -(xlen * 0.5) / scaling.true_zoom_level;
        
        // if youre not using 22px figure it out lol
        // todo fix later :)
        let yt = this.radius * (1.75 + (linecount * 0.6));

        let col = this.get_current_col();

        text_segs.forEach(seg => {
            d += seg.initial_delay ?? 0;

            for (let i=0; i<seg.text.length; i++) {
                let c = seg.text[i];

                let pos = this.position.add(new Vector2(
                    xt, yt
                ));

                let particle = new FollowingTextParticle(
                    pos, 1, c, col, this.board, fontsiz, duration - d, this
                )

                if (seg.mods?.shaking) {
                    particle.add_component(new ShakingComponent(
                        this.board,
                        ((fontsiz * 0.5) * 0.1) / scaling.true_zoom_level,
                        0.05, false
                    ));
                }

                if (seg.mods?.fading) {
                    particle.add_component(new FadeOutParticleComponent(
                        this.board, (duration-d) * 0.75, 1
                    ))
                }

                particle.text_border_size = 3;
                particle.text_border_col = col.lerp(Colour.black, 0.8);
                particle.alternative_layer = "text_main";
                particle.shortcut_pp_text = true;

                let timer = new Timer((b => {
                    b.spawn_particle(particle, pos);
                    if (c.match(/[a-zA-Z0-9\.\!\?\,\;\:]/))
                        play_audio(voice_sound, voice_gain);
                }), d);

                if (cutscene) {
                    particle.time_locked = false;
                    this.board.set_cutscene_timer(timer);
                } else {
                    this.board.set_timer(timer);
                }

                xt += (fontsiz * text_spacing_mul) / scaling.true_zoom_level;
                d += seg.delay_per_char ?? 0.1;
            }
        })
    }

    has_an_ultimate() {
        return this.ult_cost != -1 && this.show_stats && this.board.ultimates_enabled && !this.board.ultimates_paused;
    }

    passive_ultimate_charge(time_delta) {
        this.charge_ultimate(1 * time_delta);
    }

    charge_ultimate(by) {
        if (this.ult_charge_cooldown <= 0) {
            this.ult_current_charge += by;
        }
    }

    check_ultimate() {
        if (this.has_an_ultimate()) {
            if (this.hitstop > 0 || this.ult_charge_cooldown > 0) {
                // don't interrupt other "animations"
                // or somehow cheat multiple ults
                return;
            }

            if (this.board.ultimate_global_cooldown > 0) {
                // wait our turn!
                return;
            }

            if (this.ult_current_charge >= this.ult_cost) {
                this.trigger_ultimate();
            }
        }
    }

    ultimate_animation(variant) {
        // override me
    }

    resolve_ultimate(variant) {
        // override me
    }

    trigger_ultimate() {
        this.board.ultimate_global_cooldown = this.board.ultimate_global_cooldown_max;

        this.ult_charge_cooldown = ULT_DEFAULT_CHARGE_COOLDOWN;
        
        // super flash, reset charge
        let zoom_delay = 0.25;

        let sparkscnts = [10, 5, 25];
        sparkscnts.forEach((c, idx) => {
            for (let i=0; i<c; i++) {
                let spr = `superflash${idx+1}`;
                let delay = zoom_delay + random_float(0, 0.15, this.independent_random);

                this.board.set_cutscene_timer(new Timer(b => {
                    b.spawn_particle(new Particle(
                        this.position, random_float(0, Math.PI * 2, this.independent_random), 3,
                        entity_sprites.get(spr),
                        16, 800
                    ), this.position).time_locked = false;
                }, delay));
            }
        });

        let cutscene_duration = this.ult_cutscene_duration ?? 5;

        let ult_variant = 0;

        let allies = this.board.balls.filter(b => this.allied_with(b) && b.id != this.id);
        let enemies = this.board.balls.filter(b => !this.allied_with(b) && b.id != this.id);

        let applicable_special_lines = this.ult_special_lines.filter(l => {
            return (
                this.hp <= l.req_hp &&
                l.req_enemies.every(proto => enemies.some(b => b.name == proto.ball_name)) &&
                (l.other_enemies_allowed || enemies.every(b => l.req_enemies.some(proto => proto.ball_name == b.name))) &&
                l.req_allies.every(proto => allies.some(b => b.name == proto.ball_name))
            )
        }).sort((a, b) => a.priority - b.priority);

        let line = this.ult_line;

        if (applicable_special_lines.length > 0) {
            line = applicable_special_lines[0].text;
            ult_variant = applicable_special_lines[0].ult_variant ?? 0;
        }

        this.board.set_cutscene_timer(new Timer(b => {
            play_audio("ultimate_activate", 0.08);
            play_audio("aura_power_fluxing2", 0.18);

            this.speak_multiline(line, 22, cutscene_duration - zoom_delay, 0, 0.55, true, true);
        }, zoom_delay));

        set_camera_targets(
            this.position,
            this.board.map_config.initial_zoom_level * 1,
            0.00005,
            0.02 
        )

        cutscene_time_stop_dur = cutscene_duration;
        
        this.board.set_cutscene_timer(new Timer(b => {
            reset_camera_targets();

            this.resolve_ultimate(ult_variant);

            this.ult_current_charge = 0;
        }, cutscene_duration));

        this.ultimate_animation(ult_variant);
    }

    hit_other(other, with_weapon_index, damage=0, round_up=true) {
        // for this one, the SORD (the only weapon) just hits the other one for 1 damage and nothing else.
        // other balls might want to apply knockback, or do other stuff
        // console.log(`Hit ${other.id} with weapon index ${with_weapon_index}`);
        
        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit(this, damage * this.get_stat("damage_bonus"), hitstop, null, round_up);
        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;

        this.board.register_hit(this, other);
        return result;
    }

    get_hit(source, damage, hitstop, invuln=null, round_up=true) {
        // defense_bonus is a simple "divide damage by this" value
        let def = this.get_stat("defense_bonus");

        // reduce def by burn
        let burn_dmg_mult = 1 + Math.max(0, this.burn_intensity * 0.2);

        let final_damage = damage == 0 ? damage : Math.max(round_up ? 1 : 0, (damage * burn_dmg_mult) / def);
        
        this.lose_hp(final_damage, source);
        this.apply_invuln(invuln ?? BALL_INVULN_DURATION);
        this.apply_hitstop(hitstop);

        this.desc_shake_intensity = Math.max(0, this.desc_shake_intensity) + (final_damage * 2);

        return {dmg: final_damage, dead: this.hp <= 0};
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        // console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit_by_projectile(this, with_projectile.damage * this.get_stat("damage_bonus"), hitstop);
        
        this.apply_hitstop(hitstop);

        result.hitstop = hitstop;
        
        this.board.register_hit(this, other);
        return result;
    }

    apply_hitstop(amt) {
        // if hitstop is higher than applied, don't do anything
        this.hitstop = Math.max(this.hitstop, amt);
    }
    
    apply_invuln(amt, allow_reduction=false) {
        if (allow_reduction) {
            this.invuln_duration = amt;
        } else {
            this.invuln_duration = Math.max(this.invuln_duration, amt);
        }
    }

    apply_rupture(other, amt, scales_with_stat="damage_bonus") {
        let final_amt = amt;
        if (scales_with_stat) {
            final_amt *= this.get_stat(scales_with_stat);
        }

        if (this.charge_ultimate && other.id != this.id) {
            this.charge_ultimate(APPLY_RUPTURE_ULT_CHARGE * amt);
        }

        other.receive_rupture(this, final_amt);
    }

    receive_rupture(other, amt) {
        let final_amt = amt;
        final_amt /= this.get_stat("ailment_resistance");

        this.rupture_intensity += final_amt;

        this.board.register_rupture(other, this, amt);
    }

    apply_poison(other, amt, duration, scales_with_stat="damage_bonus") {
        // amt scales with damage
        let final_amt = amt;
        if (scales_with_stat) {
            final_amt *= this.get_stat(scales_with_stat);
        }

        if (this.charge_ultimate && other.id != this.id) {
            this.charge_ultimate(APPLY_POISON_ULT_CHARGE * (amt * duration));
        }

        other.receive_poison(this, final_amt, duration);
    }

    receive_poison(other, amt, duration) {
        // duration scales with resistance
        let final_duration = duration;
        final_duration /= this.get_stat("ailment_resistance");

        this.poison_intensity += amt;
        this.poison_duration = Math.max(
            this.poison_duration + final_duration,
            final_duration
        );

        this.board.register_poison(other, this, amt, duration);
    }

    apply_burn(other, amt, scales_with_stat="damage_bonus") {
        let final_amt = amt;
        if (scales_with_stat) {
            final_amt *= this.get_stat(scales_with_stat);
        }

        if (this.charge_ultimate && other.id != this.id) {
            this.charge_ultimate(APPLY_BURN_ULT_CHARGE * amt);
        }

        other.receive_burn(this, final_amt);
    }

    receive_burn(other, amt) {
        let final_amt = amt;
        final_amt /= this.get_stat("ailment_resistance");

        this.burn_intensity += final_amt;

        this.board.register_burn(other, this, amt);
    }

    get_hit_by_projectile(source, damage, hitstop) {
        return this.get_hit(source, damage, hitstop);
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        this.board.register_parry(this, other_ball);
    }

    parry_projectile(with_weapon_index, projectile) {
        this.board.register_projectile_parry(this, projectile.source, projectile);
    }

    get_projectile_parried(parrier, projectile) {
        // nothing
    }

    collide_ball(other) {
        // nothing
    }

    collide_wall(other) {
        // nothing
    }

    do_default_explosion() {
        // special hit tag effects
        if (this.special_hit_tag[0] && this.special_hit_tag[1] >= 0) {
            switch (this.special_hit_tag[0]) {
                case "golden": {
                    let c = Colour.from_hex("#FFD700")
                    this.set_colour(c)
                    this.setup_aero_light_lookup_table()

                    // create a gold ballparticle
                    let part = new MovingFrictionFadingBallParticle(
                        this.position, 12, c,
                        this.radius, 1, this.aero_canvases, this.velocity,
                        8000
                    )

                    this.board.spawn_particle(part, this.position);

                    if (this.show_stats) {
                        play_audio("turntogold");
                    } else {
                        play_audio("turntogold");
                    }
                }
            }
        } else {
            if (this.show_stats) {
                board.spawn_particle(new Particle(
                    this.position.add(new Vector2(256+64, -512)), 0, 2, entity_sprites.get("explosion"), 12, 3, false
                ), this.position.add(new Vector2(256+64, -512)));

                play_audio("explosion");
            } else {
                board.spawn_particle(new Particle(
                    this.position.add(new Vector2(144, -512)), 0, 1, entity_sprites.get("explosion"), 12, 3, false
                ), this.position.add(new Vector2(144, -512)));

                // TODO make this something else thats less impactful
                play_audio("explosion");
            }
        }
    }

    die() {
        return {skip_default_explosion: false};
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "This thing has no stats"
        )

        this.write_desc_line(
            "im serious"
        )
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        // do nothing by default
        return
    }
}

class DummyBall extends WeaponBall {
    // transforms into unarmedball when it takes a hit
    static ball_name = "Dummy";
    
    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
        
        this.max_level_description = "Seriously, it doesn't do anythin- wait... no...";

        this.pronoun = PRONOUN.IT;
        // "No upgrades are available for this ball aside from HP."
        this.tagline = "Though a failure in creating artificial ball life, it is uniquely able to exist without tethering to a weapon. Other balls often use it to practice strategies, appreciative of the fact that it can't fight back."
        this.description = "Has no weapon! Some say that, if it were to awaken, terrible things might happen..."
        this.lore_description = "Affectionately named Dummy, this ball was created in the early days of the convergence by biologists attempting to understand the unique physiology of ballkind. Though a well-known fact now, at the time it was not understood that a ball required something to tether its essence to, so the attempt was a failure - producing an unmoving blob of matter with only slight signs of life. Despite all predictions, it did not die; time had it remain whole and like a normal ball it simply reformed unharmed after taking conventional damage. The Grand Arena took possession of it after the closure of the lab it was created in, quickly finding a use for it as a stress toy, practice dummy or basketball for its contenders. It seems to lack any form of cognition or even perception, save for a low hum that some swear is slowly getting louder..."
        this.weapon_relationship = "..."
        this.lore_origin = "Artificial"
        this.lore_temperament = "N/A"
        this.lore_affiliation = "N/A"
        this.lore_alignment = "neutral"
        this.lore_birthday = "20th Jun"

        this.default_colour = default_cols[0];

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.CAN_AWAKEN,
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.tags.push(TAGS.TRANSFORMING);
            this.tier = TIERS.SPLUS;
        }

        this.entry_animation = "load";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.shake_duration_max = 4.5;
        this.shake_shake_start = 1.5;
        this.shake_music_start = 0;
        this.shake_shake_duration = this.shake_duration_max - this.shake_shake_start;
        this.shake_flash_start = 3;
        this.shake_flash_duration = this.shake_duration_max - this.shake_flash_start;
        this.shake_current = 0;
        this.shake_intensity_max = 1000;
        this.shake_origin = null;
        this.transforming = false;
        this.done = false;

        this.played_music = false;

        this.original_colour = this.colour;

        this.child = null;
        this.music_theme = "unarmed_theme"

        prepare_lazy_audio(this.music_theme);
    }

    weapon_step(board, time_delta) {
        if (this.transforming && !this.done) {
            this.shake_current += time_delta
            if (this.board.unarmed_cinematic_played) {
                this.shake_current += time_delta * 1000;
            }

            if (!this.played_music && !this.board.unarmed_cinematic_played && this.shake_current >= this.shake_music_start) {
                play_music(this.music_theme);
                this.played_music = true;
            }

            if (this.shake_current <= this.shake_duration_max) {
                this.set_velocity(Vector2.zero);

                this.set_pos(this.shake_origin.add(
                    random_on_circle(
                        lerp(
                            0, 
                            this.shake_intensity_max, 
                            random_float(0, 1, this.independent_random) * (Math.max(0, (this.shake_current - this.shake_shake_start) / this.shake_shake_duration))
                        ),
                        this.independent_random
                    )
                ))
                this.set_colour(this.original_colour.lerp(Colour.white, Math.max(0, (this.shake_current - this.shake_flash_start) / this.shake_flash_duration)));
            } else {
                // replace this ball with UnarmedBall
                this.child = new UnarmedBall(
                    this.board,
                    this.mass, this.radius, this.original_colour,
                    this.bounce_factor, this.friction_factor,
                    this.player, this.level, false
                )

                this.child.spawned_index = this.spawned_index;

                this.child.set_velocity(random_on_circle(25000, this.board.random));

                this.board.unarmed_cinematic_played = true;

                this.hp = 0;
                this.transforming = false;
                this.done = true;
                this.skip_physics = false;
                this.takes_damage = true;
                this.collision = true;

                let b = this.board;
                b.set_timer(new Timer(() => {
                    b.spawn_ball(this.child, this.shake_origin);
                    b.balls.forEach(ball => {
                        ball.skip_physics = false;
                        ball.takes_damage = true;
                    });
                }, 0.1))
            }
        }
    }

    die() {
        return {}
    }

    start_transforming() {
        if (!this.board.unarmed_cinematic_played) {
            stop_music();
        }

        this.hp = this.max_hp;
        this.transforming = true;
        this.shake_origin = this.position;
        this.skip_physics = false;
        this.takes_damage = false;
        this.collision = false;
        this.ignore_bounds_checking = true;
        this.board?.set_timer(new Timer(() => {
            this.skip_physics = false;
            this.takes_damage = false;
            this.hp = this.max_hp;
        }, 0.05))

        this.board?.balls.forEach(ball => {
            if (ball.id != this.id) {
                ball.skip_physics = true;
            }
        });
    }

    get_hit(source, damage, hitstop, invuln=null, round_up=true) {
        if (this.transforming || this.done) {
            return {dmg: 0, dead: false};
        }

        let result = null;
        if (this.level >= AWAKEN_LEVEL) {
            this.takes_damage = false;
            result = super.get_hit(source, damage, 0.5, invuln, round_up);

            this.start_transforming();
        } else {
            result = super.get_hit(source, damage, hitstop, invuln, round_up);
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "This thing has no stats"
        )

        this.write_desc_line(
            "im serious"
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Or does it...?`, true
            )
        }
    }
}

class UnarmedBall extends WeaponBall {
    static ball_name = "Unarmed";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Unarmed";
        this.original_name = "Unarmed";
        this.description_brief = "It's already too late.";
        this.level_description = "It's already too strong.";
        this.max_level_description = "It cannot improve on perfection.";
        this.quote = "...pathetic.";

        this.default_colour = default_cols[0];

        this.tier = TIERS.SPLUS;
        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.ADAPTIVE,
            TAGS.SCALING,
            TAGS.CAN_AWAKEN,
        ];

        // deals damage on collision instead of on hit
        // has no weapons
        // damage based on speed
        // gets faster every time it takes damage

        this.weapon_data = [
            new BallWeapon(1, "", [
                {pos: new Vector2(64, 64), radius: 34},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-80, 0);
        this.weapon_data[0].unparriable = true;

        this.intensity = 25000;
        this.intensity_per_dmg = 1000;

        this.damage_base = 1;
        this.damage_per_speed = 1 / 5000;
        this.damage_final = this.damage_base;
        
        this.defense_base = 0;
        this.defense_per_speed = 1 / 2500;
        this.defense_final = this.defense_base;

        this.ailment_resistance = 0;

        this.name_mutate_cooldown = 0;
        this.name_mutate_cooldown_max = 0.01;

        this.afterimage_delay_max = 0.01;
        this.afterimage_delay = this.afterimage_delay_max;
        this.afterimage_duration = 0.25;
    }

    lose_hp(amt, source, bypass_damage_prevention=false) {
        let taken = super.lose_hp(amt, source, bypass_damage_prevention);

        this.intensity += this.intensity_per_dmg * taken;
    }

    weapon_step(board, time_delta) {
        this.damage_final = this.damage_base + (this.damage_per_speed * this.velocity.magnitude());
        this.defense_final = this.defense_base + (this.defense_per_speed * this.velocity.magnitude());

        this.name_mutate_cooldown += time_delta;
        while (this.name_mutate_cooldown > this.name_mutate_cooldown_max) {
            this.name_mutate_cooldown -= this.name_mutate_cooldown_max
            this.name = [...this.name].map((c, i) => {
                let rand = random_float(0, 1, this.independent_random);
                if (rand < 0.9) {
                    // do nothihng
                    return c;
                } else if (rand < 0.925) {
                    // set to random symbol
                    return String.fromCharCode(random_int(32, 256, this.independent_random));
                } else if (rand < 0.95) {
                    // set to uppercase of original name
                    return this.original_name[i].toUpperCase();
                } else {
                    // set to lowercase of original name
                    return this.original_name[i].toLowerCase();
                }
            }).join("");
        }

        this.afterimage_delay -= time_delta;
        while (this.afterimage_delay <= 0) {
            this.afterimage_delay += this.afterimage_delay_max;
            
            this.create_self_afterimage(0.3, this.afterimage_duration);
        }
    }

    apply_intensity_vel() {
        this.set_velocity(this.velocity.normalize().mul(this.intensity));
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        result = super.hit_other(other, with_weapon_index, this.damage_final);

        // set speed up to intensity
        this.apply_intensity_vel();

        return result;
    }

    get_hit(source, damage, hitstop, invuln=null, round_up=true) {
        let damage_reduced = Math.max(Math.min(damage, 1), damage - this.defense_final);

        let result = super.get_hit(source, damage_reduced, hitstop, invuln, round_up);

        // this.intensity += this.intensity_per_hit;

        // set speed up to intensity
        this.apply_intensity_vel();

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "It's all over.", true
        )
        this.write_desc_line(
            `Intensity: ${this.intensity.toFixed(0)}`, true
        )
        this.write_desc_line(
            `Damage: ${this.damage_final.toFixed(2)}`, true
        )
        this.write_desc_line(
            `Defense: ${(this.defense_final).toFixed(2)}`, true
        )
    }
}

class HammerBall extends WeaponBall {
    static ball_name = "Hammer";

    static AVAILABLE_SKINS = [
        "Nostalgic",  // Original sprite
        "Squeaky",    // Refticus
        "Mogul",      // Ryn
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hammer";
        this.description_brief = "Has a huge hammer that does lots of damage each hit and knocks enemies back.";
        this.level_description = "Makes the hammer deal even more damage.";
        this.max_level_description = "Adds another smaller hammer that swings independently and faster, dealing half damage.";
        this.ult_description = "Slams the closest target into a wall at high speed, dealing huge damage.";

        this.quote = "I'm sure you understand.\nThe subject of my victory is quite the heavy topic.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "The greatest example of the principle that simplicity is not weakness. Sometimes all you need is a big hammer.";
        this.description = ""
        this.lore_description = "Hammer, alongside SORD, is one of the two original balls, appearing in our world moments after the convergence began. Soon after the first ceasefire, Hammer eagerly settled into a peacetime role, working with SORD to create the Grand Arena. Repurposing his military experience to train less experienced balls into the skilled fighters we know and love today, he provides them with a much-needed outlet for the combat impulses all balls possess. Though his hands are often full with administrative work, he takes any opportunity to fight as a contestant in his own arena, especially if SORD is on the other side."
        // this.weapon_relationship = "The younger generation, they've got it all mixed up. Some of them don't even use weapons anymore. It's just not a good idea. Tethering is a lifelong decision, but they're treating it like a fashion choice"
        this.weapon_relationship = "You're a smart one. I'm sure you can figure out why I chose this as my weapon."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Thoughtful"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "blue"
        this.lore_birthday = "5th Jan"

        this.default_colour = Colour.from_hex("#b1b4b3")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.DEFENSIVE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.2;
        this.ult_line = [
            {
                text: "Training is over.",
                initial_delay: 0,
                delay_per_char: 0.05
            },
            {
                text: "See you tomorrow.",
                initial_delay: 0.5,
                delay_per_char: 0.075,
                mods: {
                    newline: true,
                }
            }
        ]
        this.ult_special_lines = [
            {
                priority: 1,
                other_enemies_allowed: false,
                req_enemies: [SordBall],
                req_allies: [],
                req_hp: 100,
                text: [
                    {
                        text: "I might be getting old...",
                        initial_delay: 0,
                        delay_per_char: 0.05
                    },
                    {
                        text: "but I ",
                        initial_delay: 0.5,
                        delay_per_char: 0.05,
                        mods: {
                            newline: true,
                        }
                    },
                    {
                        text: "still ",
                        initial_delay: 0,
                        delay_per_char: 0.1,
                        mods: {
                            shaking: true,
                        }
                    },
                    {
                        text: "won't lose to you!",
                        initial_delay: 0,
                        delay_per_char: 0.05,
                        mods: {
                        }
                    }
                ]
            },
            {
                ult_variant: 1,
                priority: 1,
                other_enemies_allowed: false,
                req_enemies: [AxeBall],
                req_allies: [],
                req_hp: -1, // disabled :)
                text: [
                    {
                        text: "I see a story lit up in your eyes.",
                        initial_delay: 0,
                        delay_per_char: 0.03
                    },
                    {
                        text: "Burning bright, burning black,",
                        initial_delay: 0.4,
                        delay_per_char: 0.03,
                        mods: {
                            newline: true,
                        }
                    },
                    {
                        text: "burning up everything.",
                        initial_delay: 1.1,
                        delay_per_char: 0.03,
                        mods: {
                            newline: true,
                        }
                    },
                    {
                        text: "So... ",
                        initial_delay: 1.6,
                        delay_per_char: 0.03,
                        mods: {
                            newline: true,
                        }
                    },
                    {
                        text: "how do ",
                        initial_delay: 0.1,
                        delay_per_char: 0.03,
                        mods: {
                        }
                    },
                    {
                        text: "you ",
                        initial_delay: 0,
                        delay_per_char: 0.03,
                        mods: {
                            shaking: true
                        }
                    },
                    {
                        text: "want it to end?!",
                        initial_delay: 0,
                        delay_per_char: 0.03,
                        mods: {
                        }
                    }
                ]
            }
        ];

        this.speak_voice = "buh2";

        this.weapon_data = [
            new BallWeapon(0.8 + (level * 0), "hamer2", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(0.8 / 2, "hamer2", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ]));
        }

        this.damage_base = 8 + (0.1 * this.level);
        this.speed_base = 90;

        this.ultimate_hit_enabled = false;
        this.ult_impact_damage = 32;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Nostalgic": {
                this.weapon_data[0].sprite = "hamer";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "hamer";
                }
                
                break;
            }

            case "Squeaky": {
                this.weapon_data[0].sprite = "hamer_squeaky";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "hamer_squeaky";
                }

                break;
            }

            case "Mogul": {
                this.weapon_data[0].sprite = "hamer_mogul";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "hamer_mogul";
                }

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 1.6 * time_delta);
    }

    ultimate_animation(variant) {
        if (variant == 1) {
            this.ultimate_animation_hoj_variant();
            return;
        }

        // set up timer to move ball to the exact hammer incidence point
        // while also rotating hammer to the position right before impact
        let target_ball = this.get_closest_enemy_and_distance()[0];
        if (!target_ball) {
            return;
        }

        let target_vector = this.position.sub(target_ball.position).normalize();
        let target_distance = (this.weapon_data[0].size_multiplier / WEAPON_SIZE_MULTIPLIER) * (
            this.get_weapon_offset(0).magnitude() * 2
        );

        let target_position = target_ball.position.add(target_vector.mul(target_distance));
        let initial_pos = this.position.copy();

        // weapon target angle
        let initial_angle = this.weapon_data[0].angle;
        let angle_movement_req = initial_angle - (Math.PI + positive_mod(target_vector.angle(), Math.PI * 2) - (Math.PI * 0.2));
        angle_movement_req = (Math.PI * 2) + positive_mod(-angle_movement_req, Math.PI * 2);

        this.collision = false;
        this.weapon_data[0].unparriable = true;

        let delay = 2.9;
        let move_time = 2;

        let start_time = this.board.duration_plus_cutscenes;
        this.board.set_cutscene_timer(new Timer(b => {
            let t = b.duration_plus_cutscenes - start_time;

            if (t > delay) {
                let nt = t - delay;

                let prop = 1 - Math.pow(1 - Math.min(1, nt / move_time), 4);

                this.set_pos(initial_pos.lerp(target_position, prop));
                this.weapon_data[0].angle = initial_angle + (angle_movement_req * prop);
                this.cache_weapon_offsets();

                set_camera_targets(
                    this.position,
                    this.board.map_config.initial_zoom_level * 1,
                    0.00005,
                    0.02 
                )

                this.create_weapon_afterimage(0, 0.5, 0.5).time_locked = false;
                this.create_self_afterimage(0.5, 0.5).time_locked = false;
            }

            if (t > delay + move_time) {
                return false;
            }

            return true;
        }, 0.01, true));
    }

    ultimate_animation_hoj_variant() {
        let anim_orb = new Particle(
            this.position, 0, 1, entity_sprites.get("hoj_orb"),
            0, 999, true
        );

        anim_orb.add_component(new FadeInParticleComponent(
            this.board, 0.05, 1
        ));

        let fc = new FrameControlParticleComponent(this.board);
        anim_orb.add_component(fc);

        anim_orb.time_locked = false;

        let target_angle = deg2rad(90);

        // weapon target angle
        let initial_angle = this.weapon_data[0].angle;
        let angle_movement_req = initial_angle - (Math.PI + positive_mod(target_angle, Math.PI * 2) - (Math.PI * 0.11));
        angle_movement_req = positive_mod(-angle_movement_req, Math.PI * 2);

        let orb_timespeed = 1;
        let orb_velocity = new Vector2(0, -20000);
        let orb_gravity = new Vector2(0, 9810 * 5.16);

        let angle1 = -Math.PI;
        let angle2 = angle_movement_req + Math.PI;

        let initial_delay = 2.7;
        let hammer_initial_move_time = 0.4;
        let hammer_delay_time = 0.7;
        let hammer_second_move_time = 0.5;

        let ttotal = initial_delay + hammer_initial_move_time + hammer_delay_time + hammer_second_move_time;

        this.board.set_cutscene_timer(new Timer(b => {
            this.board.spawn_particle(anim_orb, this.position);
            
            // gravity control + hammer rotate
            let board_time = this.board.duration_plus_cutscenes;
            let start_time = this.board.duration_plus_cutscenes;
            this.board.set_cutscene_timer(new Timer(b2 => {
                let t = this.board.duration_plus_cutscenes - start_time;
                let delta_time = this.board.duration_plus_cutscenes - board_time;
                board_time = this.board.duration_plus_cutscenes;

                // orb
                anim_orb.set_pos(
                    anim_orb.position.add(orb_velocity.mul(delta_time * orb_timespeed))
                );

                orb_velocity = orb_velocity.add(orb_gravity.mul(delta_time * orb_timespeed));

                fc.frame = Math.max(0, Math.round(4 - Math.abs(orb_velocity.y / 5000)));

                orb_timespeed = Math.max(orb_timespeed - (delta_time * (1/1.4)), 0);

                // hammer rotate
                let angle = 0;
                if (t >= hammer_initial_move_time && t < (hammer_delay_time + hammer_initial_move_time)) {
                    // delay, do nothing
                } else {
                    let a1prop = 0;
                    let a2prop = 0;
                    if (t < hammer_initial_move_time) {
                        a1prop = 1 - Math.pow(1 - Math.min(1, t / hammer_initial_move_time), 5);
                    } else {
                        let nt = t - (hammer_initial_move_time + hammer_delay_time);
                        a1prop = 1;
                        a2prop = 1 - Math.pow(1 - Math.min(1, nt / hammer_second_move_time), 5);
                    }

                    this.weapon_data[0].angle = initial_angle + (angle1 * a1prop) + (angle2 * a2prop);
                    this.create_weapon_afterimage(0);
                    this.cache_weapon_offsets();
                }

                if (t >= (ttotal - initial_delay)) {
                    return false;
                }

                return true;
            }, 0.01, true))
        }, initial_delay));

        this.board.set_cutscene_timer(new Timer(b => {
            let delay_max = 0.01;
            let delay = 0;
            let times_max = 96;
            let times = 0;
            let lt = this.board.duration_plus_cutscenes;
            this.board.set_cutscene_timer(new Timer(b2 => {
                let time_delta = this.board.duration_plus_cutscenes - lt;
                lt = this.board.duration_plus_cutscenes;

                delay -= time_delta;
                while (delay <= 0) {
                    delay += delay_max;
                    times++;

                    for (let i=0; i<4; i++) {
                        let p = b.spawn_particle(new Particle(
                            anim_orb.position, random_float(0, Math.PI * 2, this.independent_random), 3,
                            entity_sprites.get("superflash3"),
                            16, 800
                        ), anim_orb.position);

                        p.time_locked = false;
                        p.alternative_layer = "fg3"

                        if (times % 4 == 0)
                            play_audio("impact_8bit", 0.03);
                    }
                }
                
                if (times <= times_max) {
                    return true;
                }

                play_audio("sword_schwing", 0.3);
                play_audio("lightningbolt4", 0.2);

                this.board.spawn_projectile(new HammerHojProjectile(
                    this.board, this, 0, anim_orb.position, this.ult_impact_damage,
                    2, Vector2.forward.rotate(this.weapon_data[0].angle + (Math.PI * 0.5)),
                    20000, Vector2.zero
                ), anim_orb.position);

                anim_orb.expire();
            }, 0.01, true));
        }, ttotal - 0.2));
    }

    resolve_ultimate(variant) {
        if (variant == 0) {
            let target_ball = this.get_closest_enemy_and_distance()[0];
            if (!target_ball) {
                return;
            }

            target_ball.invuln_duration = 0;

            this.collision = true;
            this.ultimate_hit_enabled = true;
            this.weapon_data[0].unparriable = true;
        }
        // this.hit_other(target_ball, 0);
    }

    spawn_monies(times, with_weapon_index) {
        let size = this.weapon_data[with_weapon_index].size_multiplier / WEAPON_SIZE_MULTIPLIER;

        for (let i=0; i<times; i++) {
            let pos = this.position.add(this.get_hitboxes_offsets(with_weapon_index)[random_int(0, 5, this.independent_random)]).add(this.get_weapon_offset(with_weapon_index));
            let part = new HammerMogulMoneyParticle(
                pos, size,
                random_on_circle(750, this.independent_random).add(new Vector2(0, random_float(-6000, -8000, this.independent_random))),
                this.board
            )

            this.board.spawn_particle(part, pos);
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = with_weapon_index == 0 ? this.damage_base : this.damage_base / 2;
        if (with_weapon_index == 998) {
            dmg = this.ult_impact_damage;
        }

        if (this.ultimate_hit_enabled) {
            dmg = 0;
        }

        let result = super.hit_other(other, with_weapon_index, dmg);

        if (this.skin_name == "Squeaky") {
            result.snd = "impact_squeak";
        }

        if (this.skin_name == "Mogul") {
            // make 4-8 monies on hit
            // don't want it to affect randomness, so it's not board.random
            let times = random_int(4, 9, this.independent_random);
            this.spawn_monies(times, with_weapon_index);
        }

        if (this.ultimate_hit_enabled) {
            // send it blasting at very hihg speed away from hammer
            // attach a listener to it
            let trail = {on: true};

            this.board.set_timer(new Timer(b => {
                if (trail.on) {
                    if (other.hitstop > 0) {
                        for (let i=0; i<8; i++) {
                            let dur = random_float(0.1, 0.25, other.independent_random);
                            other.create_self_afterimage(0.5, dur, BallParticle).add_component(new LerpOutParticleComponent(
                                this.board, 0, other.position, other.position.sub(
                                    other.velocity.mul(0.1).add(random_on_circle(1000, other.independent_random))
                                )
                            )).add_component(new FadeInParticleComponent(
                                this.board, 0.05, 0.5
                            )).add_component(new FadeOutParticleComponent(
                                this.board, dur - 0.05, 0.5
                            ));
                        }
                    } else {
                        other.create_self_afterimage(0.8, 0.6);
                    }

                    return true;
                }

                return false;
            }, 0.01, true))

            let original_speed = other.velocity.magnitude();

            other.add_event_listener("collide_wall", (b, line) => {
                this.hit_other(other, 998);

                trail.on = false;
                b.apply_hitstop(BASE_HITSTOP_TIME * 8);
                b.set_velocity(b.velocity.normalize().mul(original_speed));

                // get the line orientation
                let angle = 0;
                if (line.a != 0) {
                    if (line.c == 0) {
                        angle = 0;
                    } else {
                        angle = 180;
                    }
                } else {
                    if (line.c == 0) {
                        angle = 90;
                    } else {
                        angle = 270;
                    }
                }

                this.board.spawn_particle(new Particle(
                    b.position, deg2rad(angle + 90),
                    b.radius / 256, entity_sprites.get("explosion3"), 12, 
                    999
                ), b.position);
            })

            other.set_velocity(new Vector2(26000, 0).rotate(this.weapon_data[0].angle + (Math.PI * 0.49)))

            this.ultimate_hit_enabled = false;
            
            this.board.set_timer(new Timer(_ => {
                this.weapon_data[0].unparriable = false;
            }, BASE_HITSTOP_TIME * 10));

            result.snd = "strongpunch";

            this.apply_hitstop(BASE_HITSTOP_TIME * 3);
            other.apply_hitstop(BASE_HITSTOP_TIME * 3);

            return result;
        }

        if (with_weapon_index == 998) {
            play_audio("wall_smash");

            return result;
        }

        let diff_vec = other.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = other.velocity.magnitude();

        if (other_mag != 0) {
            let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

            other.set_velocity(new_other_velocity);
        }

        other.apply_invuln(BALL_INVULN_DURATION * 2);

        return result;
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        
        if (this.skin_name == "Mogul") {
            // make 1-3 monies on hit
            // don't want it to affect randomness, so it's not board.random
            let times = random_int(1, 4, this.independent_random);
            this.spawn_monies(times, with_weapon_index);
        }
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        
        if (this.skin_name == "Mogul") {
            // make 1-3 monies on hit
            // don't want it to affect randomness, so it's not board.random
            let times = random_int(1, 4, this.independent_random);
            this.spawn_monies(times, with_weapon_index);
        }
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "Knocks enemies back on hit."
        )

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Has another smaller hammer.`, true
            )
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            "Knocks enemies back on hit."
        )
        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Second hammer damage: ${(this.damage_base / 2).toFixed(2)}`, true
            )
            this.write_desc_line(
                `Second hammer rotation speed: ${(this.speed_base * 1.6).toFixed(0)} deg/s`, true
            )
        }
    }
}

class SordBall extends WeaponBall {
    static ball_name = "SORD";

    static AVAILABLE_SKINS = [
        "Nostalgic",  // Original sprite
        "Lightning",  // Refticus
        "Iron",       // Ryn
        "Faithful",   // Homestuck (SORD...)
        "RAM"         // Refticus
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "SORD";
        this.description_brief = "Deals more damage and rotates faster after every strike.";
        this.level_description = "Increases the base damage and rotation speed of the sord, and makes it scale faster.";
        this.max_level_description = "Also makes the sord larger(!) after every strike.";
        this.ult_description = "Channels ancestral power, temporarily increasing rotation speed and sord size while becoming unparriable.";
        
        this.quote = "I told you about those strikes, bro. I TOLD you.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Learning from every strike, SORD may start out unremarkable but rapidly becomes an unstoppable force.";
        this.description = ""
        this.lore_description = "SORD is one of the original balls, alongside Hammer. Their appearance long predates understanding of the convergence, a fact SORD is eager to remind his students when they question his teachings, usually with a stern tone he's still not quite used to using. Though Hammer was always the combat-minded one among the two, SORD finds himself fighting more often than he might have expected, Hammer's almost constant stream of administrative work forcing SORD to contend with the never-ending flow of new Arena arrivals in his place. Though always happy to fight Hammer at any opprtunity, SORD does wish that he could have a rest sometimes."
        this.weapon_relationship = "My SORD is special. It's not really a weapon, well, not originally. Once upon a time, this was actually a paintbrush! Well, that's not really true either... It's complicated."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Laid-back"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "green"
        this.lore_birthday = "13th Aug"

        this.default_colour = Colour.from_hex("#4acb20")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
            TAGS.SCALING,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 0.8;
        this.ult_line = [
            {
                text: "where doing it...",
                initial_delay: 0,
                delay_per_char: 0.05
            },
            {
                text: "where making this hapen!!!",
                initial_delay: 0.5,
                delay_per_char: 0.065,
                mods: {
                    newline: true,
                    shaking: true
                }
            }
        ]
        this.ult_special_lines = [
            {
                priority: 1,
                other_enemies_allowed: false,
                req_enemies: [HammerBall],
                req_allies: [],
                req_hp: 100,
                text: [
                    {
                        text: "BRO HAVE",
                        initial_delay: 0,
                        delay_per_char: 0.08,
                        mods: {
                            newline: true,
                            shaking: true,
                        }
                    },
                    {
                        text: "BRO HAVE YOU SEEN MY SOCKS",
                        initial_delay: 0.5,
                        delay_per_char: 0.05,
                        mods: {
                            newline: true,
                            shaking: true,
                        }
                    },
                    {
                        text: "AROUND ANYWEAR",
                        initial_delay: 1,
                        delay_per_char: 0.07,
                        mods: {
                            newline: true,
                            shaking: true,
                        }
                    },
                ]
            }
        ];

        this.speak_voice = "buh1";

        this.weapon_data = [
            new BallWeapon(1, "SORD2", [
                {pos: new Vector2(100, 58), radius: 12},
                {pos: new Vector2(80, 64), radius: 16},
                {pos: new Vector2(64, 64), radius: 16},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 2 + (0.05 * level);
        this.speed_base = 130 + (4.5 * level);

        this.size_base = 1;

        this.speed_mul = 1;
        this.size_mul = 1;

        this.ult_speed_mul = 3;
        this.ult_size_mul = 1.5;
        this.ult_duration = 6;

        this.afterimage_delay_max = 0.02;
        this.afterimage_delay = 0;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Nostalgic": {
                this.weapon_data[0].sprite = "SORD";
                break;
            }

            case "Lightning": {
                this.weapon_data[0].sprite = "SORD_lightning";
                // TODO lightning particle effects are in order once i finally add hit location detection

                break;
            }

            case "Iron": {
                this.weapon_data[0].sprite = "SORD_berserk";
                this.custom_parry_sound = "CLANG";

                break;
            }

            case "Faithful": {
                this.weapon_data[0].sprite = "SORD_faithful";
                this.custom_parry_sound = "parry_shitty";
                this.custom_projectile_parry_sound = "parry_shitty";

                break;
            }

            case "RAM": {
                this.weapon_data[0].sprite = "SORD_ram";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * this.speed_mul * time_delta);
    
        this.weapon_data[0].size_multiplier = WEAPON_SIZE_MULTIPLIER * this.size_base * this.size_mul;
        
        if (this.size_mul > 1) {
            this.afterimage_delay -= time_delta;
            while (this.afterimage_delay <= 0) {
                this.afterimage_delay += this.afterimage_delay_max;

                this.create_weapon_afterimage(0, 0.75, 0.25, seeded_random_from_array([
                    "SORD", "SORD_lightning", "SORD_berserk",
                    "SORD_faithful", "SORD_ram"
                ], this.independent_random));
            }
        }

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    make_echo(factor, size, initial_pos, pos, dir, delay, dur=5) {
        let p = pos.add(dir);
        let new_dir = dir.mul(factor);
        let new_size = size * factor;

        let opacity = Math.pow(size * 0.9, 2);
        
        let fade_after = 0;
        let total_duration = dur + fade_after - (delay * 1.2);

        let p1 = new BallParticle(p, total_duration, this.colour, size * this.radius, opacity, this.aero_canvases);

        let w_pos = p.add(this.get_weapon_offset(0).mul(size));
        let p2 = new Particle(
            w_pos, this.weapon_data[0].angle,
            (this.weapon_data[0].size_multiplier / WEAPON_SIZE_MULTIPLIER) * size,
            entity_sprites.get(seeded_random_from_array([
                "SORD", "SORD_lightning", "SORD_berserk",
                "SORD_faithful", "SORD_ram"
            ], this.independent_random)), 0, total_duration
        );

        // p1.alternative_layer = "fg3";
        p2.alternative_layer = "fg3";

        p1.add_component(new FadeInParticleComponent(
            this.board, 0.1, opacity
        ))

        p2.add_component(new FadeInParticleComponent(
            this.board, 0.1, opacity
        ))

        // p1.add_component(new FadeOutParticleComponent(
        //     this.board, total_duration - fade_after, opacity
        // ))

        // p2.add_component(new FadeOutParticleComponent(
        //     this.board, total_duration - fade_after, opacity
        // ))

        // p1.add_component(new ShakingComponent(
        //     this.board, size * this.radius * 0.05, 0.05, true,
        // ));

        // p2.add_component(new ShakingComponent(
        //     this.board, size * this.radius * 0.05, 0.05, true,
        // ));

        p1.add_component(new LerpInParticleComponent(
            this.board, 1, p.sub(dir), p, 0.1
        ));

        p2.add_component(new LerpInParticleComponent(
            this.board, 1, w_pos.sub(dir), w_pos, 0.1
        ));

        p1.add_component(new LerpOutParticleComponent(
            this.board, (total_duration - fade_after) * 0.98, p, initial_pos
        ));

        p2.add_component(new LerpOutParticleComponent(
            this.board, (total_duration - fade_after) * 0.98, w_pos, initial_pos.add(this.get_weapon_offset(0).mul(size))
        ));

        this.board.set_cutscene_timer(new Timer(b => {
            b.spawn_particle(p1, p).time_locked = false;
            b.spawn_particle(p2, w_pos).time_locked = false;

            this.board.set_cutscene_timer(new Timer(b => {
                for (let i=0; i<10; i++) {
                    let p = b.spawn_particle(new Particle(
                        initial_pos, random_float(0, Math.PI * 2, this.independent_random), 3,
                        entity_sprites.get("superflash3"),
                        16, 800
                    ), this.position);

                    p.time_locked = false;
                    p.alternative_layer = "fg3"
                }

                play_audio("impact_8bit");
            }, total_duration));
        }, delay));

        return [p1, p2, new_size, p, new_dir];
    }

    ultimate_animation(variant) {
        let factor = 0.8;
        let pos = this.position;
        let size = 1 * factor;

        let dir = random_on_circle(this.radius * 0.9, this.independent_random);
        while (rad2deg(Math.abs(dir.angle - this.weapon_data[0].angle)) < 45) {
            dir = random_on_circle(this.radius * 0.9, this.independent_random);
        }

        let ballparticles = [];
        let weaponparticles = [];

        for (let i=0; i<8; i++) {
            let res = this.make_echo(factor, size, this.position, pos, dir, i * 0.275, 5);

            ballparticles.push(res[0]);
            weaponparticles.push(res[1]);

            size = res[2];
            pos = res[3];
            dir = res[4];
        }
    }

    resolve_ultimate(variant) {
        play_audio("lightningbolt4", 0.35);
        play_audio("sword_schwing", 0.15);

        this.speed_mul = this.ult_speed_mul;
        this.size_mul = this.ult_size_mul;

        this.weapon_data[0].unparriable = true;

        let closest = this.get_closest_enemy_and_distance()[0];
        
        if (closest) {
            let vec = closest.position.sub(this.position).normalize().mul(16000);
            this.set_velocity(vec);

            let particle = new Particle(this.position, vec.angle(), 1.5, entity_sprites.get("hand_punch_particles"), 16, 0.4, false);
            this.board.spawn_particle(particle, this.position);
        }

        this.board.set_timer(new Timer(b => {
            this.speed_mul = 1;
            this.size_mul = 1;
            this.weapon_data[0].unparriable = false;

            this.add_velocity(this.velocity.mul(-0.5));
        }, this.ult_duration))
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        this.damage_base += 0.5 * (1 + (this.level * 0.0175));
        this.speed_base += (60 / 4) * (1 + (this.level * 0.015));

        if (this.level >= AWAKEN_LEVEL) {
            this.size_base += 0.04;
        }

        if (this.skin_name == "Faithful") {
            result.snd = "impact_shitty";
        }

        if (this.skin_name == "RAM") {
            result.snd = dmg >= 8 ? "impact_heavy_8bit" : "impact_8bit";
        }

        return result;
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Bonus damage and rotation speed on hit.`
        )
        this.write_desc_line(
            `Damage/speed: ${this.damage_base.toFixed(2)} / ${this.speed_base.toFixed(0)} deg/s`
        )
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Bonus damage and rotation speed on hit.`
        )
        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Size multiplier: ${(this.weapon_data[0].size_multiplier / 16).toFixed(2)}`, true
            )
        }
    }
}

class DaggerBall extends WeaponBall {
    static ball_name = "dagger";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "dagger";
        this.description_brief = "Rotates exponentially faster and deals exponentially more damage every time a dagger hit connects. These bonuses decay back to zero when not continually striking.";
        this.level_description = "Increases the delay after not striking until bonuses will decay.";
        this.max_level_description = "When spinning 1000 deg/s or more, shoots small projectiles (1 dmg) at a frequency and velocity based on rotation speed.";
        this.quote = "surely thats not all youve got.\ncome here and let me destroy you again.";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Bloodthirsty, arrogant and highly aggressive, dagger is a fearsome combo killer. Under the right circumstances, she can take down any enemy in a matter of seconds.";
        this.description = "Some powerful balls have specific methods of neutralising this highly dangerous threat."
        this.lore_description = "Though terrifying to think about, hundreds of balls just like this one were prepared after the convergence began. Remnath, talked down from the brink seconds before disaster, forbade dagger and her comrades from crossing the threshold... but a fighting group as driven as this one was bound to have some insubordination. Before the fragile peace could be shattered by the actions of one single ball, SORD and Hammer reluctantly scooped dagger up into the Grand Arena to give her an outlet. Much to the shock of everyone involved, this actually worked - though it took some time for the Arena to shrug off the reputation that came with hosting her."
        this.weapon_relationship = "my favourite part is the split second before my dagger hits them for the final time. seeing their terror makes me feel alive."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Violent"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "30th Jan"

        this.default_colour = Colour.from_hex("#c9776b")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE,
            TAGS.SCALING,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.2;
        this.ult_line = [
            {
                text: "thanks for playing with me,",
                initial_delay: 0,
                delay_per_char: 0.04
            },
            {
                text: "but i'm bored with you now.",
                initial_delay: 0.5,
                delay_per_char: 0.04,
                mods: {
                    newline: true,
                }
            },
            {
                text: "die.",
                initial_delay: 1.5,
                delay_per_char: 0.1,
                mods: {
                    newline: true,
                }
            }
        ]
        this.speak_voice = "buh11";

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "dagger", [
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 68), radius: 12},
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(16, 56), radius: 12},
                {pos: new Vector2(0, 48), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.damage_base = 1;
        this.speed_base = 360;

        this.damage_max = 1 * Math.pow(1.5, 8);
        this.speed_max = 360 * Math.pow(2, 8);

        this.hit_decay = 0;

        this.projectiles_cooldown = 0;
        this.projectiles_cooldown_max = 0.2;

        this.proj_damage_base = 1;
        this.proj_speed = 0;

        this.hit_decay_max = 1.45 + (0.025 * this.level);

        this.explosions_num = 1;
        this.explosions_range_per_sord = [1,1];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
        this.explosion_delay_speed = 0;
    
        this.afterimage_delay_max = 0.02;
        this.afterimage_delay = this.afterimage_delay_max;
        this.afterimage_duration_base = 0.02;
        this.afterimage_duration_per_spd = 0.05;
        this.afterimage_max_duration = 1;

        this.ult_cutscene_duration = 4.1;
        this.ult_attack_count_max = 16;
        this.ult_attack_delay = 0.4;
        this.ult_attack_delay_reduction = 0.9;

        this.speed_mul = 1;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * this.speed_mul * time_delta);

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 360, 1 - compat_pow(0.25, time_delta));
            this.damage_base = lerp(this.damage_base, 1, 1 - compat_pow(0.25, time_delta));
        }

        this.explosion_delay_speed = 0.25 / Math.sqrt(this.speed_base / 500);

        if (this.level >= AWAKEN_LEVEL) {
            this.projectiles_cooldown_max = this.explosion_delay_speed;
            this.proj_speed = 12000 + Math.sqrt(100 / this.projectiles_cooldown_max);

            if (this.speed_base >= 1000) {
                this.projectiles_cooldown -= time_delta;
                if (this.projectiles_cooldown <= 0) {
                    this.projectiles_cooldown = this.projectiles_cooldown_max;

                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new DaggerAwakenProjectile(
                            this.board,
                            this, 0, fire_pos, this.proj_damage_base, 1,
                            new Vector2(1, 0).rotate(this.weapon_data[0].angle),
                            this.proj_speed, this.velocity.mul(0)
                        ), fire_pos
                    )
                }
            }
        }

        this.fire_particles(time_delta)
    }

    fire_particles(time_delta) {
        let spd = Math.min(10, (1 / this.explosion_delay_speed) * 0.1 * 0.5);
        if (spd < 0.5) {
            spd = 0;
        }
        this.explosions_delay -= spd * time_delta;
        if (spd > 0)
            this.afterimage_delay -= time_delta;
        
        while (this.afterimage_delay <= 0) {
            this.afterimage_delay += this.afterimage_delay_max;
            
            let part = new FadingBallParticle(
                this.position,
                Math.min(
                    this.afterimage_max_duration,
                    this.afterimage_duration_base + (this.afterimage_duration_per_spd * spd)
                ), this.colour, this.radius, 0.3,
                this.aero_canvases
            )
            this.board.spawn_particle(part, this.position);
        }

        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                for (let wp=0; wp<this.weapon_data.length; wp++) {
                    let wp_offset = this.get_weapon_offset(wp);
                    let hitboxes = this.get_hitboxes_offsets(wp);

                    let times = random_int(...this.explosions_range_per_sord, this.independent_random);
                    for (let n=0; n<times; n++) {
                        let hitbox_index = random_int(0, hitboxes.length, this.independent_random);

                        let pos = this.position.add(wp_offset.add(hitboxes[hitbox_index]));
                        pos = pos.add(random_on_circle(
                            random_float(0, this.weapon_data[wp].hitboxes[hitbox_index].radius, this.independent_random),
                            this.independent_random
                        ))

                        let dir = pos.sub(this.position);
                        let mag = dir.magnitude() + Number.EPSILON;
                        dir = dir.div(mag).mul(Math.min(0.8, this.radius / mag) * 5000);

                        this.board.spawn_particle(new MovingFrictionParticle(
                            pos, random_float(0, Math.PI * 2, this.independent_random), 0.1,
                            entity_sprites.get("explosion").slice(3), 24, 3, false, dir, 5000, 0, true
                        ), pos);
                    }
                }
            }
        }
    }

    ultimate_animation(variant) {
        this.board.set_cutscene_timer(new Timer(b => {
            this.board.spawn_particle(new Particle(
                this.position, 0, 2, entity_sprites.get("entry_teleport"),
                24, 10
            ), this.position).time_locked = false;
        }, 4));

        this.board.set_cutscene_timer(new Timer(b => {
            this.opacity = 0;
            play_audio("teleport2")
        }, 4.1));
    }

    resolve_ultimate(variant) {
        let attack_count = -1;
        let last_attack_time = this.board.duration;
        let attack_pos = null;
        let attack_offset = null;
        let attacked_yet = false;
        let attack_target = null;

        this.collision = false;
        this.affected_by_gravity = false;
        this.ignore_bounds_checking = true;
        this.set_velocity(Vector2.zero);

        this.weapon_data[0].unparriable = true;

        let acquire_new_ult_target = (b => {
            let enemies = this.board.balls.filter(b => !this.allied_with(b));
            if (enemies.length <= 0) {
                return false;
            }

            let enemy = seeded_random_from_array(
                enemies,
                this.board.random
            );

            attack_count++;
            attacked_yet = false;

            attack_target = enemy;
            attack_pos = random_on_circle(this.radius * 4, this.board.random);
            attack_offset = random_on_circle(this.radius * 1, this.board.random);
            last_attack_time = this.board.duration;

            if (attack_count >= 1) {
                this.board.spawn_particle(new Particle(
                    this.position, 0, 2, entity_sprites.get("entry_teleport"),
                    24, 10
                ), this.position).time_locked = false;
            }
            
            this.set_pos(attack_target.position.add(attack_pos.mul(-1)).add(attack_offset));
            this.opacity = 1;
            play_audio("teleport2");

            this.board.spawn_particle(new Particle(
                this.position, 0, 2, entity_sprites.get("entry_teleport"),
                24, 10
            ), this.position).time_locked = false;

            return true;
        })

        this.board.set_timer(new Timer(b => {
            let res = acquire_new_ult_target();
            if (!res) {
                return;
            }

            // set continuous timer for movement and periodic timer for new attacks
            this.board.set_timer(new Timer(b => {
                this.set_velocity(Vector2.zero);
                let attack_end = last_attack_time + (this.ult_attack_delay * Math.pow(0.9, attack_count));

                let prop = Math.max(0, Math.min(1, (b.duration - last_attack_time) / (attack_end - last_attack_time)));

                // prop is 0-1, make it -1-1
                let factor = (prop * 2) - 1;
                this.set_pos(attack_target.position.add(attack_pos.mul(factor).add(attack_offset)));

                if (prop >= 0.5 && !attacked_yet) {
                    this.hit_other(attack_target, 998);
                    attack_target.last_hit = 0;
                    attack_target.apply_hitstop(this.ult_attack_delay);
                    this.hitstop = 0;

                    this.speed_base /= 1.9;
                    this.damage_base /= 1.45;

                    if (attack_count >= this.ult_attack_count_max) {
                        play_audio("strongpunch");
                        this.speak([{
                            text: "COME ON!",
                            initial_delay: 0,
                            delay_per_char: 0.02,
                            mods: {
                                shaking: true,
                                fading: true
                            }
                        }], 22, 3)
                    } else {
                        play_audio("impact", 0.2);
                    }

                    for (let i=0; i<10; i++) {
                        let p = this.board.spawn_particle(new Particle(
                            attack_target.position, random_float(0, Math.PI * 2, this.independent_random), 3,
                            entity_sprites.get("superflash3"),
                            16, 800
                        ), attack_target.position);
                    }

                    attacked_yet = true;
                }

                if (prop >= 1) {
                    let res = acquire_new_ult_target();

                    if (attack_count >= this.ult_attack_count_max || !res) {
                        this.collision = true;
                        this.ignore_bounds_checking = false;
                        this.affected_by_gravity = true;
                        this.weapon_data[0].unparriable = false;

                        let start = this.board.duration;
                        let factor = 0;
                        this.board.set_timer(new Timer(b => {
                            let t = Math.max(0, Math.min(1, 2 * (b.duration - start - 0.5)));
                            this.set_velocity(attack_pos.mul(4 * t));
                            this.speed_mul = t;

                            if (t >= 1) {
                                return false;
                            }

                            return true;
                        }, 0.01, true));

                        if (attack_count < this.ult_attack_count_max) {
                            play_audio("strongpunch");
                            this.speak([{
                                text: "Disappointing.",
                                initial_delay: 0,
                                delay_per_char: 0.02,
                                mods: {
                                    fading: true
                                }
                            }], 22, 3)
                        }

                        return false;
                    }
                }

                return true;
            }, 0.01, true));
        }, 1));
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.speed_base *= 2;
        this.damage_base *= 1.5;

        // if in a mode with 8 or more other balls (not counting needleballs), cap damage.
        // TODO extend to all situations, with a new game version
        if (this.board.balls.filter(b => b.name != "Needle").length >= 8) {
            this.speed_base = Math.min(this.speed_max, this.speed_base);
            this.damage_base = Math.min(this.damage_max, this.damage_base);
        }

        this.hit_decay = this.hit_decay_max

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            this.hitstop = 0;
            other.hitstop = 0;
            other.invuln_duration = 0;
        }

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        parrier.invuln_duration = 0;
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Temporary speed and damage bonus on hit.`
        )

        this.write_desc_line(
            `Damage/speed: ${this.damage_base.toFixed(2)} / ${this.speed_base.toFixed(0)} deg/s`
        )

        this.write_desc_line(
            `Bonus speed decay time: ${this.hit_decay_max.toFixed(1)}s`
        )
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Temporary speed and damage bonus on hit.`
        )

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Bonus speed decay time: ${this.hit_decay_max.toFixed(1)}s`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Projectiles/s: ${(this.speed_base >= 1000 ? 1 / this.projectiles_cooldown_max : 0).toFixed(1)}`, true
            )
        }
    }
}

class BowBall extends WeaponBall {
    static ball_name = "Bow";

    static AVAILABLE_SKINS = [
        "Cross",  // Refticus
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Bow";
        this.description_brief = "Quickly fires sets of multiple arrows at a periodic interval. Successful arrow hits increase the number of arrows in each set and their damage.";
        this.level_description = "Increases arrow speed, slightly increases arrow size and slightly reduces shot delay.";
        this.max_level_description = "Start with +1 multishot. Every shot fires an additional arrow.";
        this.quote = "Phew! Almost ran out of arrows there.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Bow believes that it isn't about your accuracy, just the number of arrows you hit."
        this.description = ""
        this.lore_description = "Given their almost complete ubiquity now, it might shock some to learn that, at the time of the convergence, ranged weapons were almost nonexistent in Remnath. As part of exploratory missions, Remnath sent untethered balls to discover new promising weapons on our plane, which, before we knew their initial intention, was highly successful. Given what they can do with little more than a stick, in retrospect this isn't so surprising. Hammer, too, was especially interested in the mechanisms behind bonding to a ranged weapon, though was quickly revolted after understanding what happened to the projectiles."
        this.weapon_relationship = "It's really not that bad! All ranged balls go through it. You really do get used to the feeling. Well, melee balls wouldn't understand."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Curious"
        this.lore_affiliation = "Independent"
        this.lore_alignment = "green"
        this.lore_birthday = "4th Feb"

        this.default_colour = Colour.from_hex("#be9667")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.SCALING,
            TAGS.PROJECTILES,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.05;
        this.ult_line = [
            {
                text: "Okay, crazy idea.",
                initial_delay: 0,
                delay_per_char: 0.06
            },
            {
                text: "I'll actually ",
                initial_delay: 0.6,
                delay_per_char: 0.06,
                mods: {
                    newline: true
                }
            },
            {
                text: "try",
                initial_delay: 0,
                delay_per_char: 0.06,
                mods: {
                    shaking: true,
                }
            },
            {
                text: " to aim this one...",
                initial_delay: 0,
                delay_per_char: 0.06
            },
        ];

        this.speak_voice = "buh7";
        this.speak_gain = 0.7;

        this.weapon_data = [
            new BallWeapon(1, "bow", [
                {pos: new Vector2(16, 72-16), radius: 12},
                {pos: new Vector2(16, 72), radius: 12},
            ])
        ];

        this.firing_offsets = [
            new Vector2(24, 0)
        ]

        this.proj_damage_base = 4;
        this.speed_base = 150;

        this.arrow_size_mult = 1 + (this.level * 0.005);
        this.arrow_speed = 10000 + (this.level * 250);

        this.shot_cooldown_max = 0.775 + (this.level * -0.005);
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishots = 0;
        this.multishots_max = 2;
        this.multishots_levelup_req = 1;

        if (this.level >= AWAKEN_LEVEL) {
            this.multishots_max += 1;
        }
        
        this.multishot_cooldown = 0;
        // 1/2th of the cooldown or 0.05, whichever is lower
        this.multishot_cooldown_max = Math.min(0.05, (this.shot_cooldown_max / 2) / this.multishots_max);
    
        this.sprite_suffix = "";

        this.ult_arrow_size = 2.5;
        this.ult_arrow_hits = 12;
        this.ult_arrow_damage = 2;
        this.ult_arrow_speed = 50000;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Cross": {
                this.weapon_data[0].sprite = "bow_crossbow";
                this.sprite_suffix = "_crossbow";
                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;
        this.multishot_cooldown -= time_delta;
        let shooting = false;
        if (this.multishots > 0 && this.multishot_cooldown < 0) {
            this.multishots--;
            this.multishot_cooldown = this.multishot_cooldown_max;
            shooting = true;
        } else if (this.shot_cooldown < 0) {
            this.multishots = this.multishots_max;
            this.shot_cooldown = this.shot_cooldown_max;
        }

        if (shooting) {
            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let times = 1;
            if (this.level >= AWAKEN_LEVEL) {
                times += 1;
            }

            for (let i=0; i<times; i++) {
                board.spawn_projectile(
                    new ArrowProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1 * this.arrow_size_mult,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10, this.board.random) * (Math.PI / 180))),
                        this.arrow_speed * random_float(0.85, 1.15, this.board.random), Vector2.zero,
                        this.sprite_suffix
                    ), fire_pos
                )
            }

            let snd_rand = this.independent_random();
            if (snd_rand < 0.5) {
                play_audio("bow1");
            } else {
                play_audio("bow2");
            }
        }
    }

    ultimate_animation(variant) {
        // quickly lock onto target and make some kind of glowing animation
        let t_last = this.board.duration_plus_cutscenes;
        let t_start = this.board.duration_plus_cutscenes;

        let target = this.get_closest_enemy_and_distance()[0];
        if (!target) {
            return;
        }

        let pointing_vector = target.position.sub(this.position);
        let pointing_angle = positive_mod(pointing_vector.angle(), Math.PI * 2);

        this.board.set_cutscene_timer(new Timer(b => {
            let time_delta = this.board.duration_plus_cutscenes - t_last;
            t_last = this.board.duration_plus_cutscenes;

            if (this.board.duration_plus_cutscenes - t_start < 1.5) {
                return true;
            }

            let cw_rot = 0;
            let ccw_rot = 0;
            let current = this.weapon_data[0].angle;
            if (pointing_angle > current) {
                cw_rot = pointing_angle - current;
                ccw_rot = (current+(Math.PI*2)) - pointing_angle;
            } else {
                ccw_rot = current - pointing_angle;
                cw_rot = pointing_angle - (current-(Math.PI*2));
            }

            let amt = Math.min(cw_rot, ccw_rot);
            let factor = 150 * amt;

            // smaller one wins
            let sign = (cw_rot > ccw_rot ? -1 : 1) * (this.weapon_data[0].reversed ^ this.reversed ? -1 : 1);

            this.rotate_weapon(0, factor * sign * time_delta);
            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();

            if (factor > 0.01)
                this.create_weapon_afterimage(0);

            if (t_last >= t_start + 4.9) {
                return false;
            }

            return true;
        }, 0.01, true));
    }

    resolve_ultimate(variant) {
        // fire a massive arrow which can multi-hit
        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
        let fire_pos = this.position.add(firing_offset);

        let n = 1;
        let angle = deg2rad(22.5);
        for (let i=0; i<(n*2)+1; i++) {
            let n_modified = i - n;
            let a = (angle / n) * n_modified;

            this.board.spawn_projectile(
                new BowUltProjectile(
                    this.board,
                    this, 0, fire_pos, this.ult_arrow_damage, 1 * this.ult_arrow_size,
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle + a),
                    this.ult_arrow_speed, Vector2.zero,
                    this.ult_arrow_hits,
                    this.sprite_suffix
                ), fire_pos
            )
        }

        play_audio("lightningbolt4", 0.4);

        this.shot_cooldown = this.shot_cooldown_max;

        let target = this.get_closest_enemy_and_distance()[0];
        if (!target) {
            return;
        }

        target.invuln_duration = 0;
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 2);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            this.multishots_levelup_req--;
            if (this.multishots_levelup_req <= 0) {
                this.multishots_max++;
                this.proj_damage_base += 1;

                this.multishots_levelup_req = Math.max(1, Math.pow(this.multishots_max - 1, 2) * 0.25);

                this.multishot_cooldown_max = Math.min(0.05, (this.shot_cooldown_max / 2) / this.multishots_max);
            }
        }

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Gain more multishots and damage each hit.`
        )
        this.write_desc_line(
            `Arrow damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Multishot: ${this.multishots_max}`
        )
        this.write_desc_line(
            `Arrow size: ${this.arrow_size_mult.toFixed(3)}x`
        )
        this.write_desc_line(
            `Arrow speed: ${this.arrow_speed}`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Shoots an additional arrow every shot.`, true, 10
            )
        }
    }
}

class MagnumBall extends WeaponBall {
    static ball_name = "Magnum";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Magnum";
        this.description_brief = "Throws coins and shoots a gun. If a gunshot hits a coin, it doubles in damage and ricochets to the nearest other coin, or enemy if there is no other coin.";
        this.level_description = "Increases coin throw and shot frequency.";
        this.max_level_description = "Get an additional coin thrower.";
        this.quote = "Do you have any idea how much this battle cost me?\nIt's a good thing I can write off these coins as business expenses.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "A lover of spectacle and an avid gambler. With the right situation, Magnum can deal lethal damage while making a clip that'll go triple platinum.";
        this.description = "No, coins from other sources will not ricochet."
        this.lore_description = "Part of the initial exploratory missions, Magnum, unlike his siblings, remained pointedly untethered until he somehow found his way into a mafia strongbox. The moment he touched its contents, he understood his purpose, clearer than any other moment in his (admittedly quite short) life. Heedless of the war, let alone the ceasefire, Magnum got to work learning everything there was to know about forming a media conglomerate, focusing around content by balls, for balls. Happily partnering with the Grand Arena upon its inauguration, the Balls Broadcasting Corporation is the official media partner for all Arena fights. Recently, it has even branched out into hybrid content!"
        this.weapon_relationship = "Are you paying me for this appearance? Hang on, do you even have permission to use my likeness? My time is too valuable for this."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Enterprising"
        this.lore_affiliation = "Balls Broadcasting Corporation"
        this.lore_alignment = "blue"
        this.lore_birthday = "11th Nov"

        this.default_colour = Colour.from_hex("#e056e4")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.HITSCAN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.25;
        this.ult_line = [
            {
                text: "Sorry that you had to face me,",
                initial_delay: 0,
                delay_per_char: 0.04
            },
            {
                text: "but don't worry.",
                initial_delay: 0.1,
                delay_per_char: 0.05,
                mods: {
                    newline: true,
                }
            },
            {
                text: "This clip will make you famous.",
                initial_delay: 1.6,
                delay_per_char: 0.04,
                mods: {
                    newline: true,
                }
            }
        ]
        this.ult_special_lines = [
            {
                priority: 1,
                other_enemies_allowed: false,
                req_enemies: [RailgunBall],
                req_allies: [],
                req_hp: 100,
                text: [
                    {
                        text: "You did a good job on that weapon.",
                        initial_delay: 0,
                        delay_per_char: 0.04
                    },
                    {
                        text: "But remember... ",
                        initial_delay: 0.2,
                        delay_per_char: 0.04,
                        mods: {
                            newline: true,
                        }
                    },
                    {
                        text: "never ",
                        initial_delay: 0.25,
                        delay_per_char: 0.1,
                        mods: {
                            shaking: true,
                        }
                    },
                    {
                        text: "discount raw skill.",
                        initial_delay: 0,
                        delay_per_char: 0.07,
                    },
                ]
            }
        ];

        this.entry_animation = "snipe";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(0.5, "gun", [
                {pos: new Vector2(32, 64-10), radius: 16},
            ]),

            new BallWeapon(1.5, "coin_weapon", [

            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            let w = new BallWeapon(1.5, "coin_weapon", [

            ]);

            this.weapon_data.push(w);
        }

        this.weapon_data[1].reverse();

        this.firing_offsets = [
            new Vector2(156, -16),
            new Vector2(32, 0)
        ]

        this.proj_damage_base = 8;
        this.coin_damage_base = 1;
        this.speed_base = 90;

        this.shot_cooldown_max = 0.525 + (this.level * -0.001);
        this.shot_cooldown = this.shot_cooldown_max;

        this.coin_shot_cooldown_max = 0.475 + (this.level * -0.001);
        this.coin_shot_cooldown = this.coin_shot_cooldown_max;

        this.ult_damage = 7;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 2.5 * time_delta);
        this.rotate_weapon(2, this.speed_base * 2.5 * 1.3 * time_delta);

        this.shot_cooldown -= time_delta;
        this.coin_shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            board.spawn_projectile(
                new MagnumProjectile(
                    this.board,
                    this, 0, fire_pos, this.proj_damage_base,
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos), 0
                ), fire_pos
            )

            // its too loud man
            // play_audio("gun1");
        }

        if (this.coin_shot_cooldown < 0) {
            this.coin_shot_cooldown = this.coin_shot_cooldown_max;

            let coin_firing_offset = this.firing_offsets[1].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
            let coin_fire_pos = this.position.add(coin_firing_offset);
            
            let coin_obj = new MagnumCoinProjectile(
                this.board,
                this, 1, coin_fire_pos, this.coin_damage_base, 1.5,
                new Vector2(1, 0).rotate(this.weapon_data[1].angle), random_int(6000, 10000, this.board.random), board.gravity
            );

            board.spawn_projectile(
                coin_obj, coin_fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                let coin2_firing_offset = this.firing_offsets[1].mul(this.weapon_data[2].size_multiplier).rotate(this.weapon_data[2].angle);
                let coin2_fire_pos = this.position.add(coin2_firing_offset);
                
                let coin2_obj = new MagnumCoinProjectile(
                    this.board,
                    this, 1, coin2_fire_pos, this.coin_damage_base, 1.5,
                    new Vector2(1, 0).rotate(this.weapon_data[2].angle), random_int(6000, 10000, this.board.random), board.gravity
                );

                board.spawn_projectile(
                    coin2_obj, coin2_fire_pos
                )
            }

            play_audio("coin");
        }
    }

    ultimate_animation(variant) {
        this.board.set_cutscene_timer(new Timer(b => {
            let vstart = 6000;
            let v = vstart;

            let coin_firing_offset = this.firing_offsets[1].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
            let coin_fire_pos = this.position.add(coin_firing_offset);

            let particle = this.board.spawn_particle(new Particle(
                coin_fire_pos, 0,
                this.weapon_data[1].size_multiplier / WEAPON_SIZE_MULTIPLIER,
                entity_sprites.get("coin"), 24, 999,
                true
            ), coin_fire_pos);

            particle.time_locked = false;

            let ts = this.board.duration_plus_cutscenes;
            let ls = this.board.duration_plus_cutscenes;
            let life = 0;

            let echo_times = 5;
            let echo_gain = 0.5;
            let echo_delay_per = 0.4;
            let echo_delay_cur = 0;

            this.board.set_cutscene_timer(new Timer(b2 => {
                let time_delta = this.board.duration_plus_cutscenes - ls;
                ls = this.board.duration_plus_cutscenes;

                echo_delay_cur -= time_delta;
                if (echo_times > 0 && echo_delay_cur <= 0) {
                    play_audio("coin", echo_gain);

                    echo_gain *= 0.75;
                    echo_delay_cur += echo_delay_per;
                    echo_times--;
                }

                let trailpart = new Particle(
                    particle.position, 0, particle.size / PARTICLE_SIZE_MULTIPLIER,
                    entity_sprites.get("coin"), 0, 0.5, true
                );

                trailpart.add_component(new FrameControlParticleComponent(
                    this.board, particle.cur_frame
                ));

                trailpart.add_component(new FadeOutParticleComponent(
                    this.board, 0, 0.5, 2
                ));

                trailpart.time_locked = false;

                this.board.spawn_particle(trailpart, particle.position);

                particle.set_pos(particle.position.add(new Vector2(0, -v * time_delta)));
                life += time_delta * (v / vstart);

                particle.lifetime = life;
                v *= Math.pow(0.1, time_delta);

                if (this.board.duration_plus_cutscenes - ts > 0.5) {
                    let pointing_vector = particle.position.sub(this.position);
                    let pointing_angle = positive_mod(pointing_vector.angle() + (deg2rad(5)), Math.PI * 2);

                    let cw_rot = 0;
                    let ccw_rot = 0;
                    let current = this.weapon_data[0].angle;
                    if (pointing_angle > current) {
                        cw_rot = pointing_angle - current;
                        ccw_rot = (current+(Math.PI*2)) - pointing_angle;
                    } else {
                        ccw_rot = current - pointing_angle;
                        cw_rot = pointing_angle - (current-(Math.PI*2));
                    }

                    let amt = Math.min(cw_rot, ccw_rot);
                    let factor = 150 * amt;

                    // smaller one wins
                    let sign = (cw_rot > ccw_rot ? -1 : 1) * (this.weapon_data[0].reversed ^ this.reversed ? -1 : 1);

                    this.rotate_weapon(0, factor * sign * time_delta);
                    this.cache_weapon_offsets();
                    this.cache_hitboxes_offsets();
                    
                    if (factor > 0.01)
                        this.create_weapon_afterimage(0);
                }

                if (this.board.duration_plus_cutscenes - ts > 2.25) {
                    return false;
                }

                return true;
            }, 0.01, true));

            this.board.set_cutscene_timer(new Timer(b => {
                let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                let fire_pos = this.position.add(firing_offset);

                this.board.spawn_projectile(new MagnumUltProjectile(
                    this.board, this, 0, fire_pos, this.ult_damage, particle.position, 1
                ), fire_pos);

                particle.expire();

                for (let i=0; i<64; i++) {
                    let p = b.spawn_particle(new Particle(
                        particle.position, random_float(0, Math.PI * 2, this.independent_random), 3,
                        entity_sprites.get("superflash3"),
                        16 * random_float(0.5, 1.5, this.independent_random), 800
                    ), particle.position);

                    p.time_locked = false;
                    p.alternative_layer = "fg3"
                }

                play_audio("parry2", 0.2);

            }, 2.1));

            let projs = [];
            this.board.set_cutscene_timer(new Timer(b => {
                // pick a random point on every wall
                let positions = [
                    new Vector2(0, random_float(0.1, 0.9, this.board.random) * this.board.size.y),
                    new Vector2(random_float(0.1, 0.9, this.board.random) * this.board.size.x, 0),
                    new Vector2(this.board.size.x, random_float(0.1, 0.9, this.board.random) * this.board.size.y),
                    new Vector2(random_float(0.1, 0.9, this.board.random) * this.board.size.x, this.board.size.y),
                ];

                positions.forEach(pos => {
                    projs.push(
                        this.board.spawn_projectile(new MagnumUltProjectile(
                            this.board, this, 0, particle.position, this.ult_damage, pos, 1
                        ), particle.position)
                    );
                })

                play_audio("gun1", 0.4);
            }, 2.35));

            this.board.set_cutscene_timer(new Timer(b => {
                projs.forEach(proj => {
                    let closest = this.get_closest_enemy_and_distance(null, proj.target_position)[0];
                    if (!closest) {
                        return;
                    }

                    this.board.spawn_projectile(new MagnumUltProjectile(
                        this.board, this, 0, proj.target_position, this.ult_damage, closest.position, 1.5
                    ), proj.target_position);

                    closest.invuln_duration = 0;
                })

                play_audio("lightningbolt4", 0.4);
                play_audio("gun3", 0.2);
                play_audio("gun_super", 0.2);
            }, 2.7));
        }, 2.7));
    }

    resolve_ultimate(variant) {
        // override me
        this.shot_cooldown = this.shot_cooldown_max;
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Shots ricochet off coins for double damage.`, false, 10
        )
        this.write_desc_line(
            `Ricochet shots can't be parried.`, false, 10
        )
        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Coin damage: ${this.coin_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Coin rotation speed: ${(this.speed_base * 2.5).toFixed(0)} deg/s`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Has an additional coin thrower.`, true
            )
        }
    }
}

class NeedleBall extends WeaponBall {
    static ball_name = "Needle";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed, can_clone=true) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Needle";
        this.description_brief = "Has three small needles. Needles apply rupture per hit (stacking DOT that decays by 50%/s). When taking damage, chance to use 12.5% current HP and create a smaller child copy with 4x the HP used that deals half damage and rupture.";
        this.level_description = "Increases split chance and reduces HP lost from splitting.";
        this.max_level_description = "Applies poison instead for 1s each. Poison deals the full DOT for its duration and refreshes when stacked.";
        this.quote = "Many thanks for your kind donation! It's always hard getting food\non the table as a mother of six trillion.";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Long-suffering mother of six trillion. Summons her children to protect her when in danger.";
        this.description = ""
        this.lore_description = "Balls' reproductive capabilities, even now, manage to elude understanding. Based on our understanding of concept sinks and how they apply to balls, it seems that they reproduce not according to biology, but instead \"when the time is right\". Unfortunately for Needle, it seems that this is true almost all the time. The reproduction process of a ball has never been observed, even for Needle, lending more credibility to the theory that ball procreation is a purely conceptual, rather than physical, event. Regardless, she keeps herself in high spirits. Caring for that many children is hard work! Most of them, especially the adults, live in Remnath, but Needle spends her time almost exclusively here, funnelling the stipend from the Grand Arena right back into her family."
        this.weapon_relationship = "Well, I wasn't always a mother. Definitely not one of this many children, either! It turns out tethering has more profound effects than most of us think when we're young... Anyway! You said you were doing a buffet after this?"
        this.lore_origin = "Convergence"
        this.lore_temperament = "Motherly"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "green"
        this.lore_birthday = "7th May"

        this.default_colour = Colour.from_hex("#a099dd")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.ADAPTIVE,
            TAGS.AILMENTS,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 0.3;
        this.ult_line = [
            {
                text: "Wait, wait... ",
                initial_delay: 0,
                delay_per_char: 0.08
            },
            {
                text: " not... ",
                initial_delay: 0.15,
                delay_per_char: 0.08,
            },
            {
                text: "now..!",
                initial_delay: 0.15,
                delay_per_char: 0.08,
            }
        ]

        this.weapon_data = [
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
            new BallWeapon(can_clone ? 1 : 0.6, "needle", [
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(40, 64), radius: 8},
                {pos: new Vector2(24, 64), radius: 8},
            ]),
        ];

        this.damage_base = 2 * (can_clone ? 1 : 0.5);
        this.rupture_base = 0.5 * (can_clone ? 1 : 0.5);
        this.poison_duration_base = 1;

        this.speed_base = 340;
        this.split_chance = 0.5 + (this.level * 0.005);
        this.split_ratio = 0.125;
        this.split_hp_save = (this.level * 0.005)

        this.children = [];
        this.parent = null;

        this.can_clone = can_clone;
        
        this.set_radius(this.radius * (can_clone ? 1 : 0.75));

        this.ult_clones = 4;
        this.ult_split_ratio = 0.25;
        this.ult_bonus_hp = 50;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        this.rotate_weapon(1, this.speed_base * 1.7 * time_delta);
        this.rotate_weapon(2, this.speed_base * 0.6 * time_delta);

        if (this.parent?.hp <= 0) {
            this.lose_hp(25 * time_delta, this, true);
        }
    }

    ultimate_animation(variant) {
        let st = this.board.duration_plus_cutscenes;
        let lt = this.board.duration_plus_cutscenes;

        let shake_delay_max = 0.02;
        let shake_delay = 0;

        let opos = this.position;

        this.board.set_cutscene_timer(new Timer(b => {
            let time_delta = this.board.duration_plus_cutscenes - lt;
            let t = this.board.duration_plus_cutscenes - st;

            lt = this.board.duration_plus_cutscenes;

            let intensity = Math.pow(t / 5, 2) * 500;

            shake_delay -= time_delta;
            if (shake_delay <= 0) {
                shake_delay += shake_delay_max;

                this.create_self_afterimage(0.75, 0.5).time_locked = false;
                this.set_pos(opos.add(random_on_circle(random_float(0, 1, this.board.random) * intensity, this.board.random)));
            }

            if (t >= 5) {
                this.set_pos(opos);
                return false;
            }

            return true;
        }, 0.01, true));
    }

    resolve_ultimate(variant) {
        for (let i=0; i<this.ult_clones; i++) {
            this.board.spawn_particle(new Particle(
                this.position, random_float(0, Math.PI * 2, this.independent_random), 1.5, entity_sprites.get("explosion"), 24, 3, false
            ), this.position);

            let ball = this.clone_chance(
                true, this.ult_split_ratio, false, this.ult_bonus_hp
            );

            if (ball) {
                let n = 128;
                this.board.set_timer(new Timer(b => {
                    ball.create_self_afterimage(0.8 * (n / 128));
                    n--;
                    return n > 0; 
                }, 0.01, true));
            }
        }

        play_audio("bottle_pop", 0.3);
        play_audio("lightningbolt4", 0.3);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        if (this.level >= AWAKEN_LEVEL) {
            this.apply_poison(other, this.rupture_base, this.poison_duration_base)
        } else {
            this.apply_rupture(other, this.rupture_base);
        }

        return result;
    }

    clone_chance(always=false, override_split_ratio=null, lose_hp=true, bonus_hp=0) {
        let c = this.board.random();
        if (this.can_clone && (always || c < this.split_chance)) {
            let hp_proportion = Math.floor(this.hp * (override_split_ratio ?? this.split_ratio));

            if (hp_proportion > 0) {
                let new_ball = new NeedleBall(
                    this.board,
                    this.mass, this.radius, this.colour, this.bounce_factor,
                    this.friction_factor, this.player, this.level, this.reversed,
                    false
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.hp += bonus_hp;

                new_ball.max_hp = new_ball.hp;
                new_ball.apply_invuln(BALL_INVULN_DURATION);

                if (christmas) {
                    let hat_particle = new Particle(new_ball.position, 0, new_ball.radius / this.radius, entity_sprites.get("festive red hat"), 0, 99999, false);
                    board.spawn_particle(hat_particle, new_ball.position);

                    new_ball.linked_hat_particle = hat_particle;
                }

                if (lose_hp) {
                    let hp_lost = hp_proportion - (hp_proportion * this.split_hp_save);

                    this.lose_hp(hp_lost, this);
                }

                new_ball.show_stats = false;

                this.board?.spawn_ball(new_ball, this.position);

                new_ball.add_impulse(random_on_circle(random_float(6000, 10000, this.board.random), this.board.random));

                this.children.push(new_ball);
                new_ball.parent = this;

                return new_ball;
            }
        }
    }

    get_hit(source, damage, hitstop, invuln=null, round_up=true) {
        let result = super.get_hit(source, damage, hitstop, invuln, round_up);

        if (damage > 0.25) {
            this.clone_chance();
        }

        return result;
    }

    // get_hit_by_projectile(damage, hitstop) {
    //     let result = super.get_hit_by_projectile(damage, hitstop);

    //     this.clone_chance();

    //     return result;
    // }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `${this.level >= AWAKEN_LEVEL ? "Poison" : "Rupture"} per hit: ${this.rupture_base.toFixed(1)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Copy chance: ${(this.split_chance * 100).toFixed(0)}%`
        )
        this.write_desc_line(
            `Copy HP ratio: ${(this.split_ratio * 100).toFixed(1)}%`
        )
        this.write_desc_line(
            `Split HP loss reduction: ${(this.split_hp_save * 100).toFixed(0)}%`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Applies poison instead of rupture.`, true
            )
        }
    }
}

class RailgunBall extends WeaponBall {
    static ball_name = "Railgun";

    static AVAILABLE_SKINS = [
        "Chicken",  // Ryn
        "Soaker"    // Boggy
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Railgun";
        this.description_brief = "Shoots a beam projectile. If the shot hits, temporarily speeds up fire rate & rotation then quickly fires another shot. -[Original design by Boggy]";
        this.level_description = "Increases shot frequency.";
        this.max_level_description = "Use two railguns that always mirror positions and always shoot together, but damage is reduced by 33%.";
        this.quote = "Wow, it's hard to hold this thing!\nSeriously, take a look- No, really, try it!";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Absorbs energy from successful hits to immediately reload the railgun and shoot again, and again, and again...";
        this.description = ""
        this.lore_description = "Magnum runs a tight ship, but has a soft spot for family. As his eldest daughter, Railgun was given unparalleled access from birth to the technologies of our modern world. Much like the ancient Ramnath dynasties, the strongest weapons often stay within the family - but Railgun had no intention of taking the easy path. Based on reverse-engineered designs of the Magnum family's many heirlooms, she created a new weapon to match her vision of the perfect tether. Aside from the weight, she couldn't be happier - and Magnum isn't too upset to have saved another treasure. Though she remains loyal to her family, Railgun found her true calling in combat at the Grand Arena."
        this.weapon_relationship = "I bet you were expecting me to riff about how this thing is so heavy. I mean, it is, but that's beside the point. What? That's it? Can I re-record this?"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Thoughtful"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "blue"
        this.lore_birthday = "31st Mar"

        this.default_colour = Colour.from_hex("#81c2e5")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.HITSCAN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.35;
        this.ult_line = [
            {
                text: "Let's kick this thing into full power!",
                initial_delay: 0,
                delay_per_char: 0.03
            },
            {
                text: "It's actually pretty dangerous to do this,",
                initial_delay: 0,
                delay_per_char: 0.03,
                mods: {
                    newline: true,
                }
            },
            {
                text: "the output isn't qui",
                initial_delay: 1.1,
                delay_per_char: 0.03,
                mods: {
                    newline: true,
                }
            },
            {
                text: "eeeEEEEEEEEEEEEwaitWAIT",
                initial_delay: 0,
                delay_per_char: 0.03,
                mods: {
                    shaking: true,
                }
            },
            {
                text: "WHOOOOAAAAAA STOP STOP STOP",
                initial_delay: 1.5,
                delay_per_char: 0.03,
                mods: {
                    newline: true,
                    shaking: true,
                }
            },
        ]
        this.ult_special_lines = [
            {
                priority: 1,
                other_enemies_allowed: false,
                req_enemies: [MagnumBall],
                req_allies: [],
                req_hp: 100,
                text: [
                    {
                        text: "Daaad! Watch...",
                        initial_delay: 0,
                        delay_per_char: 0.08
                    },
                    {
                        text: "THIS!!!",
                        initial_delay: 0.57,
                        delay_per_char: 0.12,
                        mods: {
                            newline: true,
                            shaking: true,
                        }
                    }
                ]
            }
        ];

        this.speak_voice = "buh11";

        this.entry_animation = "snipe";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "railgun2", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(64, 64), radius: 12},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(1, "railgun2", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(64, 64), radius: 12},
            ]))
        }

        this.firing_offsets = [
            new Vector2(120, -2)
        ]

        this.proj_damage_base = 15;
        if (this.level >= AWAKEN_LEVEL) {
            this.proj_damage_base *= (2/3);
        }

        this.speed_base = 100;

        this.shot_cooldown_max_base = 0.72 + (this.level * -0.002);
        this.shot_cooldown_max = this.shot_cooldown_max_base;
        this.shot_cooldown_rapidfire = 0.04 + ((0.04 / 0.666) * -0.002);
        this.shot_cooldown = this.shot_cooldown_max;

        this.hit_decay = 0;

        this.ult_ongoing = false;
        this.ult_remaining_hits = 0; // number of enhanced shots left
        this.ult_max_amount = 16; // the number of total enhanced shots per ult
        this.ult_damage = 20; // main beam damage
        this.ult_inner_damage = 5; // just a tiny bit of extra damage for the center hit
        this.ult_shot_cooldown_max = 0.09; // initial gap between railgun hyperbeam shots
        if (this.level >= AWAKEN_LEVEL) {
            this.ult_damage *= (2/3);
            this.ult_inner_damage *= (2/3);
        }
    }

    randomise_weapon_rotations() {
        super.randomise_weapon_rotations();
        if (this.weapon_data[1]) {
            this.weapon_data[1].angle = this.weapon_data[0].angle - Math.PI;
        }
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Chicken": {
                this.weapon_data[0].sprite = "railgun_chicken";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "railgun_chicken";
                }

                break;
            }

            case "Soaker": {
                this.weapon_data[0].sprite = "railgun_soaker";
                if (this.weapon_data[1]) {
                    this.weapon_data[1].sprite = "railgun_soaker";
                }

                break;
            }
        }
    }

    spawn_rail_bullet(fire_pos, end_pos) {
        if (this.ult_ongoing) {
            board.spawn_projectile(
                new RailgunUltProjectile(
                    this.board,
                    this, 0, fire_pos, this.ult_damage,
                    end_pos,
                ), fire_pos
            )
            board.spawn_projectile(
                new RailgunUltInnerProjectile(
                    this.board,
                    this, 0, fire_pos, this.ult_inner_damage,
                    end_pos,
                ), fire_pos
            )
            play_audio("lightningbolt4", 0.2);
        } else {
            board.spawn_projectile(
                new RailgunProjectile(
                    this.board,
                    this, 0, fire_pos, this.proj_damage_base,
                    end_pos,
                ), fire_pos
            )
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
        if (this.weapon_data[1]) {
            this.weapon_data[1].angle = this.weapon_data[0].angle - Math.PI;
        }

        this.shot_cooldown -= time_delta;

        this.hit_decay -= time_delta;
        if (this.hit_decay < 0) {
            this.speed_base = lerp(this.speed_base, 80, 1 - compat_pow(0.45, time_delta));
            this.shot_cooldown_max = lerp(this.shot_cooldown_max, this.shot_cooldown_max_base, 1 - compat_pow(0.2, time_delta));
        }

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;
            if (this.ult_ongoing) {
                this.shot_cooldown = this.ult_shot_cooldown_max;
            }

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let bullet1_end_pos = new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos);
            
            this.spawn_rail_bullet(fire_pos, bullet1_end_pos);

            if (this.level >= AWAKEN_LEVEL) {
                firing_offset = this.firing_offsets[0].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
                fire_pos = this.position.add(firing_offset);

                this.spawn_rail_bullet(
                    fire_pos,
                    new Vector2(1, 0).rotate(this.weapon_data[1].angle).mul(10000).add(fire_pos)
                );
            }

            this.ult_remaining_hits--;
            if (this.ult_remaining_hits == 0) {
                this.ult_ongoing = false;
                this.board.set_timer(new Timer(b => {
                    this.speak([{
                        text: "That was ",
                        mods: {
                            fading: true
                        }
                    }, {
                        text: "AWESOME!!",
                        mods: {
                            shaking: true,
                            fading: true
                        }
                    }], 22, 4)
                }, 0.5))
            }

            if (this.skin_name == "Chicken") {
                play_audio("chicken");
            }
        }
    }

    ultimate_animation(variant) {
        let initial_angle = this.weapon_data[0].angle;

        let angle_movement_req = initial_angle + Math.PI * 13.37;

        this.collision = false;
        this.weapon_data[0].unparriable = true;
        if (this.weapon_data.length > 1) {
            this.weapon_data[1].unparriable = true;
        }

        let delay = 2.9;

        let move_time = 2;

        let start_time = this.board.duration_plus_cutscenes;
        this.board.set_cutscene_timer(new Timer(b => {
            let t = b.duration_plus_cutscenes - start_time;

            if (t > delay) {
                let nt = t - delay;

                let prop = Math.pow(nt / move_time, 4);

                this.weapon_data[0].angle = initial_angle + (angle_movement_req * prop);
                if (this.weapon_data.length > 1) {
                    this.weapon_data[1].angle = initial_angle + Math.PI + (angle_movement_req * prop);
                }

                this.cache_weapon_offsets();

                set_camera_targets(
                    this.position,
                    this.board.map_config.initial_zoom_level * 1,
                    0.00005,
                    0.02 
                )

                this.create_weapon_afterimage(0, 0.5, 0.5).time_locked = false;
                if (this.weapon_data.length > 1)
                    this.create_weapon_afterimage(1, 0.5, 0.5).time_locked = false;
            }

            if (t > delay + move_time) {
                return false;
            }

            return true;
        }, 0.01, true));

    }

    resolve_ultimate(variant) {
        this.collision = true;
        this.weapon_data[0].unparriable = false;
        if (this.weapon_data.length > 1) {
            this.weapon_data[1].unparriable = false;
        }

        this.speed_base = 1200;
        this.ult_remaining_hits = this.ult_max_amount;
        this.shot_cooldown = 0.1;
        this.ult_ongoing = true;
        this.hit_decay = 0.2;
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        if (with_projectile.source_weapon_index != 999) {
            this.shot_cooldown = this.shot_cooldown_rapidfire;
            if (this.ult_ongoing) {
                // this.ult_remaining_hits++;
            } else {
                this.speed_base *= 1.5;
            }

            this.hit_decay = 0.6;
        }

        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            other.apply_invuln(0.015, true);

            for (let i=0; i<8; i++) {
                if (this.ult_ongoing) {
                    this.board.spawn_particle(new EnergyBurstParticle(
                        other.position, 0.6, entity_sprites.get("railgun_point"), 0, 16, true,
                        25000, 120000, this, new Colour(255, 100, 100, 255), 4, 2, 0, true
                    ), other.position)
                } else {
                    this.board.spawn_particle(new EnergyBurstParticle(
                        other.position, 0.6, entity_sprites.get("railgun_point"), 0, 16, true,
                        25000, 120000, this, new Colour(18, 175, 175, 255), 4, 2, 0, true
                    ), other.position)
                }
            }
        }

        return result;
    }

    get_projectile_parried(parrier, projectile) {
        /*
        this.shot_cooldown = this.shot_cooldown_rapidfire;
        this.speed_base *= 1.5;
        this.hit_decay = 0.6;

        parrier.apply_invuln(0.015, true);
        */
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `On shot hit, rotation speed increases,`, false, 10
        )
        this.write_desc_line(
            `and quickly fire another shot.`, false, 10
        )
        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Has two railguns that mirror positions.`, true
            )
        }
    }
}

class PotionBall extends WeaponBall {
    static ball_name = "Potion";

    static AVAILABLE_SKINS = [
        "Ornate",  // Refticus
    ];

    static potion_names = ["Rupture", "Poison", "Pure damage", "Time stop"];
    static potion_cols = [Colour.red, Colour.green, new Colour(0, 96, 255, 255), Colour.from_hex("#FF84F8")];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Potion";
        this.description_brief = "Throws three different potions that create debilitating puddles of chemicals on impact (red is rupture, green is poison, blue is pure damage). Parrying anything with the held potion temporarily destroys the potion, creating a puddle.";
        this.level_description = "Increases puddle duration.";
        this.max_level_description = "Adds a fourth potion that temporally affects balls, freezing them in time.";
        this.quote = "You couldn't handle my strongest potions.";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Brews powerful potions to debilitate enemies. Can block with them in a pinch, but doing so leaves her vulnerable.";
        this.description = ""
        this.lore_description = "It was anyone's guess what weapon Potion actually tethered with. She swore it was with an alembic, but ball scholars were quick to point out that there was little chance for anyone, and by her own admission, Potion herself, to consider such a thing a \"weapon\" at the time. With the convergence long since closed and nobody else to ask, they begrudgingly accepted that, maybe, it might have been an alembic. This did not answer the question of how she seemed to be able to create and throw away parts of her soul at will, with no limitations yet observed. Many generations later, when the convergence opened once more, Potion got her answer. It was an alembic."
        this.weapon_relationship = "You know, I don't use any ingredients or anything to brew the potions. It's a good thing I can't make anything actually useful, or the government might want me! Haha! Ha... ha..."
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Curious"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "24th Nov"

        this.default_colour = Colour.from_hex("#ACFF02")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.AOE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.ult_cost = DEFAULT_ULT_COST * 1.25;
        this.ult_line = [
            {
                text: "I'm gonna run out of ingredients at this rate!",
                initial_delay: 0,
                delay_per_char: 0.04
            },
            {
                text: "Wait, no I'm not! I should just go ",
                initial_delay: 0.2,
                delay_per_char: 0.04,
                mods: {
                    newline: true,
                }
            },
            {
                text: "faster ",
                initial_delay: 0,
                delay_per_char: 0.05,
                mods: {
                    shaking: true
                }
            },
            {
                text: "then!",
                initial_delay: 0,
                delay_per_char: 0.04,
            }
        ]

        this.entry_animation = "impact";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "potion1_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),

            new BallWeapon(1, "potion2_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),

            new BallWeapon(1, "potion3_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]),
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(1, "potion4_weapon", [
                {pos: new Vector2(30, 64), radius: 14},
            ]));
        }

        this.weapon_data[0].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[1].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[2].rotate(random_float(0, 360, this.board.random));
        this.weapon_data[3]?.rotate(random_float(0, 360, this.board.random));

        this.weapon_data[1].reverse();
        this.weapon_data[3]?.reverse();

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.potion_impact_damage = 2;

        this.speed_range = [135, 225]
        this.speeds = [180, 180, 180, 180].map(_ => random_float(...this.speed_range, this.board.random));

        this.shot_cooldown_max_range = [0.55, 1.1];
        this.shot_cooldowns = [0, 0, 0, 0].map(_ => random_float(...this.shot_cooldown_max_range, this.board.random));
        this.weapon_regeneration_times = [0,0,0,0];
        this.max_weapon_regeneration_time = 1.6;
        this.potions_smashed = [false, false, false, false];
        this.potion_smash_penalty = 5;

        this.duration_mult = 1.2 + (0.0125 * this.level);

        this.sprite_suffix = "";

        this.ult_potion_delay_max = 0.16;
        this.ult_potion_delay = 0;
        this.ult_potions_left = 0;
        this.ult_potions_max = 16;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Ornate": {
                this.weapon_data.forEach(w => w.sprite += "_ornate");
                this.sprite_suffix = "_ornate";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            if (this.weapon_regeneration_times[i] > 0) {
                this.weapon_regeneration_times[i] -= time_delta;
                if (this.weapon_regeneration_times[i] <= 0) {
                    this.weapon_data[i].size_multiplier = 1 * 16
                    this.speeds[i] = random_float(...this.speed_range, this.board.random);
                    this.weapon_data[i].hitboxes = [{pos: new Vector2(30, 64), radius: 14}];
                    play_audio("bottle_pop");
                }
            } else {
                this.rotate_weapon(i, this.speeds[i] * time_delta);
                this.shot_cooldowns[i] -= time_delta;
                if (this.shot_cooldowns[i] < 0) {
                    this.shot_cooldowns[i] = random_float(...this.shot_cooldown_max_range, this.board.random);
                
                    // schut
                    let firing_offset = this.firing_offsets[0].mul(this.weapon_data[i].size_multiplier).rotate(this.weapon_data[i].angle);
                    let fire_pos = this.position.add(firing_offset);

                    board.spawn_projectile(
                        new PotionBottleProjectile(
                            this.board,
                            this, i, fire_pos, this.potion_impact_damage, 1,
                            new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                            random_int(6000, 10000, this.board.random), board.gravity, i, this.duration_mult,
                            this.weapon_data[i].reversed ^ this.reversed, this.sprite_suffix
                        ), fire_pos
                    )
                    
                    this.lose_potion(i, false);
                }
            }
        }

        if (this.ult_potions_left > 0) {
            this.ult_potion_delay -= time_delta;
            while (this.ult_potion_delay <= 0) {
                this.ult_potion_delay += this.ult_potion_delay_max;
                this.ult_potions_left--;

                let fire_pos = new Vector2(
                    random_float(0.1, 0.9, this.board.random) * this.board.size.x,
                    -256
                );

                let i = random_int(0, this.weapon_data.length, this.board.random);

                let proj = board.spawn_projectile(
                    new PotionBottleProjectile(
                        this.board,
                        this, i, fire_pos, this.potion_impact_damage, 1,
                        random_on_circle(1, this.board.random).add(new Vector2(0, 2)).normalize(),
                        random_int(8000, 12000, this.board.random), board.gravity, i, this.duration_mult * 0.5,
                        this.board.random() < 0.5, this.sprite_suffix
                    ), fire_pos
                );

                this.board.set_timer(new Timer(b => {
                    proj.active = false;
                    proj.make_splash();
                }, random_float(0.1, 0.7, this.board.random)));
            }
        }
    }

    ultimate_animation(variant) {
        let st = this.board.duration_plus_cutscenes;
        let lt = this.board.duration_plus_cutscenes;

        let part_delay_max = 0.02;
        let part_delay = 4.3;

        this.board.set_cutscene_timer(new Timer(b => {
            let time_delta = this.board.duration_plus_cutscenes - lt;
            let t = this.board.duration_plus_cutscenes - st;

            lt = this.board.duration_plus_cutscenes;

            part_delay -= time_delta;
            if (part_delay <= 0) {
                part_delay += part_delay_max;

                let vel = new Vector2(0, -18000).add(random_on_circle(7000, this.independent_random));
                let pos = this.position.add(random_on_circle(this.radius * 0.5, this.independent_random));
                let part = new MovingParticle(
                    pos, random_float(0, Math.PI * 2, this.independent_random),
                    1, entity_sprites.get(`potion${random_int(
                        1, 4 + (this.level >= AWAKEN_LEVEL ? 1 : 0)
                    )}${this.sprite_suffix}`), 0, 3, true, vel, 0, true
                );

                part.add_component(new SpriteTrailParticleComponent(
                    this.board, 0, 0.4, 2, 0.3
                ));

                part.time_locked = false;

                this.board.spawn_particle(part, pos);

                play_audio("bottle_pop", 0.15);
            }

            if (t >= 5) {
                return false;
            }

            return true;
        }, 0.01, true));
    }

    resolve_ultimate(variant) {
        this.ult_potion_delay = this.ult_potion_delay_max + 1;
        this.ult_potions_left = this.ult_potions_max;
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        this.smash_potion(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        this.smash_potion(with_weapon_index);
    }

    lose_potion(index, smashed) {
        this.weapon_data[index].size_multiplier = 0;
        this.weapon_regeneration_times[index] = this.max_weapon_regeneration_time * (smashed ? this.potion_smash_penalty : 1);
    
        this.weapon_data[index].hitboxes = [];

        this.potions_smashed[index] = smashed;

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();
    }

    smash_potion(index) {
        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[index].size_multiplier).rotate(this.weapon_data[index].angle);
        let fire_pos = this.position.add(firing_offset);

        board.spawn_projectile(
            new PotionPuddleProjectile(
                this.board,
                this, 0, fire_pos, 1, 2, index, this.duration_mult
            ), fire_pos
        )

        play_audio("bottle_smash");

        this.lose_potion(index, true);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.potion_impact_damage);
    
        this.smash_potion(with_weapon_index);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = {dmg: 0, dead: false};
        if (with_projectile instanceof PotionPuddleProjectile) {
            result.mute = true;
        } else {
            result = super.hit_other_with_projectile(other, with_projectile);
        }

        return result;
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        let num = 3;
        if (this.level >= AWAKEN_LEVEL) {
            num = 4;
        }

        for (let i=0; i<num; i++) {
            // col if ready, grey if not - strikethrough if smashed
            let potion_exists = this.weapon_data[i].size_multiplier > 0
            let col = potion_exists ? PotionBall.potion_cols[i].css() : (this.potions_smashed[i] ? "#333" : "#666")
            this.write_desc_line(
                PotionBall.potion_names[i], false, null, col
            )

            if (!potion_exists) {
                if (this.potions_smashed[i]) {
                    this.write_desc_line(
                        "-".repeat(PotionBall.potion_names[i].length), false, null, col, true
                    )
                }

                // then write the respawn delay
                this.write_desc_line(
                    `${this.weapon_regeneration_times[i].toFixed(1)}s`, false, null, "#888", true, 128
                )
            }
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Brews and throws various potions.`
        )

        this.write_desc_line(
            `Potion impact damage: ${this.potion_impact_damage.toFixed(2)}`
        )

        let num = 3;
        if (this.level >= AWAKEN_LEVEL) {
            num = 4;
        }

        for (let i=0; i<num; i++) {
            // col if ready, grey if not - strikethrough if smashed
            let potion_exists = this.weapon_data[i].size_multiplier > 0
            let col = potion_exists ? PotionBall.potion_cols[i].css() : (this.potions_smashed[i] ? "#333" : "#666")
            this.write_desc_line(
                PotionBall.potion_names[i], false, null, col
            )

            if (!potion_exists) {
                if (this.potions_smashed[i]) {
                    this.write_desc_line(
                        "-".repeat(PotionBall.potion_names[i].length), false, null, col, true
                    )
                }

                // then write the respawn delay
                this.write_desc_line(
                    `${this.weapon_regeneration_times[i].toFixed(1)}s`, false, null, "#888", true, 128
                )
            }
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Gains another potion that freezes time.`, true
            )
        }
    }
}

class GrenadeBall extends WeaponBall {
    static ball_name = "Grenade";

    static AVAILABLE_SKINS = [
        "bao",        // Me (plaaosert)
        "blao",       // Grenade: Refticus | Explosion: Me (plaaosert)
        "Nostalgic",  // Boggy
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Grenade";
        this.description_brief = "Throws grenades. Grenades bounce around for up to 3 seconds before exploding. If a grenade takes damage, it will explode immediately. Explosions can trigger other grenades, and deal 70% damage to the thrower as well.";
        this.level_description = "Increases throw frequency.";
        this.max_level_description = "Increases grenades' fuse timer to 30 seconds and increases throwing frequency by an additional 1.5x.";
        this.quote = "I can't hear anything. Am I dying? Is this the end?";

        this.pronoun = PRONOUN.HE;
        this.tagline = "An old ball with a less than stable link to life. Throws highly potent grenades that are as much a danger to himself and his allies as they are to his enemies.";
        this.description = ""
        this.lore_description = "While it might come as a surprise to some, it is possible for a ball to change its tether, though usually only in times of mortal danger or high stress. Grenade, once a simple and peaceful (by ball standards...) Gardening Fork, briefly became the front line in the First War when he found himself precisely on the seam that opened into the convergence. Unwilling to fight, he tried to run and lay low, but somehow, the war always had a way of coming back to him. In the corner of a ruined farmhouse, his luck finally ran out, and he counted his final moments before he would be blown to shreds and sent back to the lifestream. In those final moments, his acceptance of his death awakened a soul he didn't know he still had. The primed grenade, tethered to him now, stopped ticking, as his gardening fork along with half of his soul faded to dust. It took him fifty years to recover enough to move. Hammer believes it will take him another hundred to feel alive again. For now, the fights and his newfound friends bring him comfort."
        this.weapon_relationship = "I don't really mind dying. Some of my friends hate it - they say it makes them uncomfortable, or it hurts, or it feels like dying... myself, I can't really feel, well, anything, most days. Best I feel is when I win. And when Hammer comes to visit."
        this.lore_origin = "Convergence"
        this.lore_temperament = "Tired"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "green"
        this.lore_birthday = "19th Jul"

        this.default_colour = Colour.from_hex("#bfd199")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.AOE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "grenade_weapon", [
                {pos: new Vector2(28, 56), radius: 14},
            ]),
        ];

        this.grenade_sprite = "grenade";
        this.grenade_explosion_sprite = "explosion_grenade";

        this.firing_offsets = [
            new Vector2(48, 0)
        ]

        this.grenade_damage_base = 16;
        this.grenade_fuse = this.level >= AWAKEN_LEVEL ? 30 : 3;
        this.damage_base = 2;

        this.speed_base = 135;

        this.shot_cooldown_max = 1.55 - (0.005 * this.level);
        if (this.level >= AWAKEN_LEVEL) {
            this.shot_cooldown_max /= 1.5;
        }

        this.shot_cooldown = this.shot_cooldown_max;
        this.self_grenade_reduction = 0.8;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "blao": {
                this.weapon_data[0].sprite = "grenade_weapon_blao";
                this.grenade_sprite = "grenade_blao";
                this.grenade_explosion_sprite = "explosion_bulao_3";

                break;
            }

            case "bao": {
                this.weapon_data[0].sprite = "grenade_weapon_bao";
                this.grenade_sprite = "grenade_bao";
                this.grenade_explosion_sprite = "explosion_bao";

                break;
            }

            case "Nostalgic": {
                this.weapon_data[0].sprite = "grenade_weapon_bomb";
                this.grenade_sprite = "grenade_bomb";

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            this.make_grenade(
                fire_pos,
                new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000)
            )
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let hitstop = BASE_HITSTOP_TIME;

        let dmg = with_projectile.damage;
        if (other.id == this.id && with_projectile instanceof GrenadeExplosionProjectile) {
            dmg *= this.self_grenade_reduction;
        }

        let result = other.get_hit_by_projectile(this, dmg * this.get_stat("damage_bonus"), hitstop);
        
        if (with_projectile.source_weapon_index != 999) {
            this.apply_hitstop(hitstop);

            result.hitstop = hitstop;
        }

        this.board.register_hit(this, other);
        return result;
    }

    make_grenade(position, velocity) {
        let new_ball = new GrenadeProjectileBall(
            this.board,
            this.mass * 0.4, this.radius * 0.4, this.colour, this.bounce_factor,
            this.friction_factor, this.player, this.level,
            this.grenade_damage_base, this.grenade_fuse,
            this.grenade_sprite, this.grenade_explosion_sprite
        );

        new_ball.apply_invuln(BALL_INVULN_DURATION);
        new_ball.show_stats = false;

        this.board?.spawn_ball(new_ball, position);

        new_ball.set_velocity(velocity);

        new_ball.parent = this;

        let part = new Particle(new_ball.position, 0, 1, entity_sprites.get(this.grenade_sprite), 0, 999999);
        this.board?.spawn_particle(part, new_ball.position);
        new_ball.linked_particle = part;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Throws dangerous grenades with self-damage.`
        )
        this.write_desc_line(
            `Grenade damage: ${this.grenade_damage_base.toFixed(0)}`
        )
        this.write_desc_line(
            `Grenade self-damage percentage: ${(this.self_grenade_reduction * 100).toFixed(0)}%`
        )

        let awakened = this.level >= AWAKEN_LEVEL;
        this.write_desc_line(
            `Grenade fuse: ${this.grenade_fuse}s`, awakened
        )

        this.write_desc_line(
            `Grenades/s: ${(1 / this.shot_cooldown_max).toFixed(2)}`, awakened
        )

        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
    }
}

class GrenadeProjectileBall extends WeaponBall {
    static ball_name = "Grenade Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, explosion_damage, fuse, sprite, explosion_sprite) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Grenade Projectile";
        this.description_brief = "Thrown from the grenade ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [];

        this.lifetime = 0;
        this.max_fuse = fuse;
        this.explosion_damage = explosion_damage;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.sprite = sprite;
        this.explosion_sprite = explosion_sprite;

        this.rotation_speed = random_float(270, 540, this.board.random);
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.max_fuse) {
            this.hp = 0;
            this.last_damage_source = null;
        }
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.last_damage_source?.weapon_data?.forEach(w => {
            w.reverse();
        })

        let expl_position = this.position.add(new Vector2(10, -13).mul(2 * PROJ_SIZE_MULTIPLIER));

        let proj = new GrenadeExplosionProjectile(
            this.board,
            this.parent, 0, expl_position, this.parent.grenade_damage_base, 2,
            this.explosion_sprite
        )

        play_audio("explosion2");

        this.parent.board.spawn_projectile(proj, expl_position);

        return {skip_default_explosion: true};
    }
}

class GlassBall extends WeaponBall {
    static ball_name = "Glass";

    static AVAILABLE_SKINS = [
        "Papercut",  // Vitawrap
        "Chainsaw",  // Me (plaaosert)
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Glass";
        this.description_brief = "Normal strikes apply rupture but deal no damage. On hit, charges up based on the rupture on the target before the strike. At max charge, next hit consumes all charge to deal a vorpal strike with damage equal to 12x base rupture. Parries release glass shards that apply minor rupture.";
        this.level_description = "Increases base rupture and makes the weapon rotate faster.";
        this.max_level_description = "Multiplies the target's rupture by 2x after each hit.";
        this.quote = "[unintelligible animalistic grunting]";

        this.pronoun = PRONOUN.IT;
        this.tagline = "More weapon than ball, terrifying and mindless in its pursuit of violence. Able to deal incredible damage after spilling enough blood.";
        this.description = ""
        this.lore_description = "Glass is an example of why a young ball must always choose their weapon carefully. Tethering is for life, after all, and one must take into account both compatibility and baseline concept. When compatibility is weak or baseline concept is too strong. the weapon will take over the ball, turning it into a tool for its own ends, rather than the other way round. It is for this reason that Glass, once thinking itself subversive and unique in its choice of weapon, now shambles through towns like a plague, descending upon anyone or anything not quick enough to escape it."
        this.weapon_relationship = "[Glass was not available for comment.]"
        this.lore_origin = "Unknown"
        this.lore_temperament = "Feral"
        this.lore_affiliation = "N/A"
        this.lore_alignment = "red"
        this.lore_birthday = "25th May"

        this.default_colour = Colour.from_hex("#edfafd")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE,
            TAGS.AILMENTS,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(0.925, "glass1", [
                {pos: new Vector2(76, 64), radius: 6},
                {pos: new Vector2(64, 64), radius: 12},
                {pos: new Vector2(48, 64), radius: 16},
                {pos: new Vector2(32, 64), radius: 16},
                {pos: new Vector2(16, 64), radius: 16},
            ])
        ];

        this.damage_base = 3 + (0.025 * level);
        this.speed_base = 330 + (2.25 * level);

        this.shard_rupture_amt = 1;
        this.shard_limit_max = 16;
        this.shard_limit = this.shard_limit_max;

        this.charge = 0;
        this.charge_decay_per_sec = 0;
        this.charge_threshold = 100;

        this.vorpal_mult = 12;

        this.skin_suffix = "";
        
        this.adaptive_sprites = true;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Papercut": {
                this.weapon_data[0].sprite = "glass_paper";
                this.skin_suffix = "_paper";

                this.adaptive_sprites = false;

                break;
            }

            case "Chainsaw": {
                this.weapon_data[0].sprite = "glass_chainsaw";
                this.skin_suffix = "_chainsaw";

                this.adaptive_sprites = false;

                break;
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shard_limit = Math.min(this.shard_limit + time_delta * 8, this.shard_limit_max);

        this.charge = Math.max(0, this.charge - (this.charge_decay_per_sec * time_delta));
        if (this.charge >= this.charge_threshold) {
            this.weapon_data[0].sprite = "glass_angry";
        } else {
            this.weapon_data[0].sprite = "glass";
            let charge_prop = this.charge / this.charge_threshold;
            let n = Math.floor(charge_prop * 5) + 1;

            if (this.adaptive_sprites) {
                this.weapon_data[0].sprite += n.toString();
            }
        }
    
        this.weapon_data[0].sprite += this.skin_suffix;
    }

    hit_other(other, with_weapon_index) {
        let result = {};
        if (this.charge >= this.charge_threshold) {
            result = super.hit_other(other, with_weapon_index, this.damage_base * this.vorpal_mult);
            this.charge = 0;
            result.snd = "strongpunch";
        } else {
            result = super.hit_other(other, with_weapon_index, 0);
            this.charge += other.rupture_intensity * 14;
            this.apply_rupture(other, this.damage_base)

            if (this.skin_name == "Papercut") {
                result.snd = "impact_paper";
            }
        }

        if (this.level >= AWAKEN_LEVEL) {
            other.rupture_intensity *= 2;
        }

        return result;
    }

    fire_glass_shards(amt) {
        let wp_offset = this.get_weapon_offset(0);
        let hitboxes = this.get_hitboxes_offsets(0);

        for (let i=0; i<amt; i++) {
            if (this.shard_limit <= 1) {
                break;
            }
            
            this.shard_limit -= 1;

            let hitbox_index = random_int(0, hitboxes.length, this.board.random);
            let pos = this.position.add(wp_offset.add(hitboxes[hitbox_index]));
            pos = pos.add(random_on_circle(
                random_float(0, this.weapon_data[0].hitboxes[hitbox_index].radius, this.board.random),
                this.board.random
            ))

            let angle = this.weapon_data[0].angle;
            let modifier = random_float(Math.PI * 0.1, Math.PI * 0.7, this.board.random);
            modifier *= !(this.weapon_data[0].reversed ^ this.reversed) ? 1 : -1;
            
            let dir = new Vector2(1, 0).rotate(angle + modifier);

            let proj = new GlassProjectile(
                this.board, this, 0, pos, 0, 0.5,
                dir, random_int(4000, 9000, this.board.random),
                this.board.gravity, this.board.random() < 0.5, this.skin_suffix
            )

            this.board.spawn_projectile(proj, pos);
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        this.fire_glass_shards(6);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        this.fire_glass_shards(3);
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Charges up to deliver vorpal strikes.`
        )
        this.write_desc_line(
            `Rupture per hit: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Vorpal strike damage: ${(this.damage_base * this.vorpal_mult).toFixed(0)}`
        )
        this.write_desc_line(
            `Charge: ${this.charge.toFixed(0)}`
        )
        if (this.charge >= this.charge_threshold) {
            this.write_desc_line(
                `[${"!".repeat(20)}]`,
                false, 12, null, true, 96
            )
        } else {
            this.write_desc_line(
                `[${">".repeat(
                    Math.floor(20 * (this.charge / this.charge_threshold))
                )}${" ".repeat(
                    20 - Math.floor(20 * (this.charge / this.charge_threshold))
                )}]`,
                false, 12, null, true, 96
            )
        }
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Shard rupture: ${this.shard_rupture_amt.toFixed(2)}`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Multiplies rupture by 2x after each hit.`, true, 10
            )
        }
    }
}

class HandBall extends WeaponBall {
    static emojis = {
        "hand_neutral": "✌",
        "hand_block": "✌",
        "hand_open": "✌",
        "hand_punch": "☝",
        "hand_grab": "✍",
        "hand_tired": "✶",
    };
    
    static hitboxes = {
        "hand_neutral": [
            // this is the same as parry, because the parry action turns the hand into the parry hand
            {pos: new Vector2(60, 16), radius: 6},
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
            {pos: new Vector2(24, 114), radius: 16},
        ],

        "hand_block": [
            {pos: new Vector2(60, 16), radius: 6},
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
            {pos: new Vector2(24, 114), radius: 16},
        ],

        "hand_open": [
            // shim off the top and bottom hitboxes
            {pos: new Vector2(60, 28), radius: 10},
            {pos: new Vector2(56, 48), radius: 12},
            {pos: new Vector2(60, 68), radius: 16},
            {pos: new Vector2(48, 96), radius: 28},
        ],

        "hand_punch": [
            {pos: new Vector2(64, 64), radius: 36},
            {pos: new Vector2(64-36, 64), radius: 18},
            {pos: new Vector2(64-36-18, 64), radius: 9},
        ],

        "hand_grab": [
            // no hitboxes because grab "cutscene"
        ],

        "hand_tired": [
            // no hitboxes because tired
        ],
    }

    static lightning_parts = (() => {
        let l = entity_sprites.get("lightning");

        return [
            l[0],
            l[1],
            l[2],

            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 

            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 
            l[3], l[3], l[3], 

            l[4],
            l[5],
            l[6],
        ]
    })();

    static ball_name = "Hand";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Hand";
        this.description_brief = "Hands move semi-randomly and independently. Hands randomly punch directly forwards. An idle hand will prepare to grab a ball if it's close, then throw it at an opposite wall at very high speed if the grab is successful.";
        this.level_description = "Speeds up punch recovery, makes hands larger and increases grab damage.";
        this.max_level_description = "Hands are now removed when they become tired (after parrying or throwing). New hands sprout every 1 second, doubled for each currently active hand.";
        this.quote = "It doesn't count as a self-insert if it's just my hands.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "The first ever fusion of ball and man. Strikes and grapples his way through fights.";
        this.description = ""
        this.lore_description = "It bears repeating that anything can be tethered if considered a weapon and, in modern times, even this rule has become less true. After human and ball reached a tenuous coexistence, the brave among them started to explore the boundaries of each others' biology. Among other things, Hand and his partner were interested about whether they could tether, perhaps assisted by our uniquely powerful, though subconscious, grasp of concept. Indeed, the idea was not unprecedented - stories exist of balls tethering with dangerous beasts on their own world since the beginning of their civilisation - but it is quite another thing to actually try it on a target with a real grasp of concept and self-identity. Hand's existence is proof enough that the attempt was successful, though the rest of his partner's physical existence was obliterated in the process. Hand has stated that he is equal parts himself and them, though of course this is impossible to prove one way or the other. Regardless, it is the opinion of the author that Hand seems to be quite happy and there's probably nothing wrong with it, though it is a little disquieting."
        this.weapon_relationship = "I kind of just let the hands do what they want, but usually I'm the one blocking. If it were up to them, we'd always be punching!"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Adventurous"
        this.lore_affiliation = "ConTech CFsR Ltd."
        this.lore_alignment = "green"
        this.lore_birthday = "2nd Aug"

        this.default_colour = Colour.from_hex("#fef43d")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.BALANCED,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.hand_size = 0.5 + (0.002 * this.level);

        this.weapon_data = [
            new BallWeapon(this.hand_size, "hand_neutral", [

            ]),

            new BallWeapon(this.hand_size, "hand_neutral", [

            ]),
        ];

        this.hands_speeds = [0, 0]; // X
        this.hands_speed_range = [-20, 60];
        this.hands_speed_timeouts = [0, 0]; // X
        this.hands_speed_timeout_range = [0.5, 2];
        this.hands_sprites = ["hand_neutral", "hand_neutral"]; // X
        this.hands_orientations = [1, -1];
        this.next_hand_orientation = 1;

        this.punch_timeout_range = [0.6, 2];
        this.punch_timeouts = [random_float(...this.punch_timeout_range, this.board.random), random_float(...this.punch_timeout_range, this.board.random)]; // X
        this.punch_recovery = 0.4 - (this.level * 0.002);
        this.punch_active_duration = 0.1;

        this.grab_ready_distance = this.radius * 4;
        this.sqr_grab_ready_distance = this.grab_ready_distance * this.grab_ready_distance;
        this.grab_seek_speed = 18000; // unused
        this.parry_delays = [0, 0]; // X

        this.punch_damage = 8;
        this.other_damage = 0;
        this.grab_damage_initial = 2;
        this.grab_damage_impact = 14 + (this.level * 0.1);
        this.grab_info = [
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0},
            {stored_velocity: null, ball: null, amount_to_rotate: null, rotated_so_far: null, speed: 0}
        ] // X
    
        this.post_grab_cooldown = 7.5;
        this.post_block_cooldown = 1.75;
        this.tired_delays = [0, 0]; // X

        this.hand_sprout_timeout = 0;
        this.hand_sprout_base = 1;

        this.debug = false;
    }

    debug_log(...msg) {
        if (this.debug) {
            console.log(...msg);
        }
    }

    weapon_step(board, time_delta) {
        if (this.level >= AWAKEN_LEVEL) {
            this.hand_sprout_timeout += time_delta;
            if (this.hand_sprout_timeout >= this.hand_sprout_base * compat_pow(2, this.hands_sprites.length)) {
                this.hand_sprout_timeout = 0;
                
                this.hands_speeds.push(0);
                this.hands_speed_timeouts.push(0);
                this.hands_sprites.push("hand_neutral");
                this.punch_timeouts.push(random_float(...this.punch_timeout_range, this.board.random));
                this.parry_delays.push(0);
                this.grab_info.push({});
                this.tired_delays.push(0);

                this.hands_orientations.push(this.next_hand_orientation);
                this.next_hand_orientation *= -1;

                let w = new BallWeapon(this.hand_size, "hand_neutral", []);
                this.weapon_data.push(w);
                w.rotate(random_float(0, 360, this.board.random));
                
                this.cache_weapon_offsets();
                this.cache_hitboxes_offsets();
            }
        }

        let deletion_indices = [];

        for (let i=0; i<this.weapon_data.length; i++) {
            let make_hitboxes = true;

            this.weapon_data[i].reversed = false;

            switch (this.hands_sprites[i]) {
                case "hand_neutral": {
                    let handpos = this.position.add(this.get_weapon_offset(i));
                    let balls_sqr_distances = board.balls.filter(ball => !ball.allied_with(this) && !ball.skip_physics).map(ball => ball.position.sqr_distance(handpos));
                    if (balls_sqr_distances.some(d => d <= this.sqr_grab_ready_distance)) {
                        this.hands_sprites[i] = "hand_open";
                        this.weapon_data[i].offset = new Vector2(0, 0);
                    } else {
                        this.punch_timeouts[i] -= time_delta;
                        this.weapon_data[i].offset = new Vector2(Math.min(0, -64 + (compat_pow(this.punch_timeouts[i], 2) * 256)), 0);
                        if (this.punch_timeouts[i] <= 0) {
                            this.hands_sprites[i] = "hand_punch";

                            this.weapon_data[i].offset = new Vector2(96, 0);
                            this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1.4;
                            this.punch_timeouts[i] = this.punch_recovery;
                            this.hands_speed_timeouts[i] = 0;

                            let pos = this.position.add(this.get_weapon_offset(i));
                            let particle = new Particle(
                                pos, this.weapon_data[i].angle, 1, entity_sprites.get("hand_punch_particles"), 24, 0.2, false
                            )

                            // board.spawn_particle(particle, pos);
                        } else {
                            this.weapon_data[i].rotate(this.hands_speeds[i] * time_delta, this.hands_orientations[i] == -1);
                            this.hands_speed_timeouts[i] -= time_delta;
                            if (this.hands_speed_timeouts[i] <= 0) {
                                this.hands_speed_timeouts[i] = random_float(...this.hands_speed_timeout_range, this.board.random);

                                this.hands_speeds[i] = random_float(...this.hands_speed_range, this.board.random) + random_float(...this.hands_speed_range, this.board.random) + random_float(...this.hands_speed_range, this.board.random);
                            }
                        }
                    }

                    break;
                }

                case "hand_open": {
                    let handpos = this.position.add(this.get_weapon_offset(i));
                    let closest = board.balls.filter(ball => !ball.allied_with(this) && !ball.skip_physics).reduce((pb, ball) => {
                        let sqr_dist = ball.position.sqr_distance(handpos);
                        if (pb) {
                            return sqr_dist < pb[1] ? [ball, sqr_dist] : pb;
                        } else {
                            return [ball, sqr_dist];
                        }
                    }, null);

                    if (closest) {
                        if (closest[1] > this.sqr_grab_ready_distance * 1.5) {
                            this.hands_sprites[i] = "hand_neutral";
                            this.weapon_data[i].offset = new Vector2(32, 0);
                        } else {
                            // quickly move hand towards it 
                            this.weapon_data[i].offset = new Vector2(32, 0);
                            
                            // let sign = Math.sign(closest[0].position.angle(this.position));

                            // this.weapon_data[i].rotate(this.grab_seek_speed * sign * time_delta * (Math.PI / 180));
                        }
                    } else {
                        this.hands_sprites[i] = "hand_neutral";
                        this.weapon_data[i].offset = new Vector2(32, 0);
                    }

                    break;
                }
                
                case "hand_punch": {
                    this.punch_timeouts[i] -= time_delta;
                    this.weapon_data[i].offset = new Vector2(Math.max(96, 96 + -8 + ((this.punch_timeouts[i] * 8) / this.punch_recovery)), 0);
                    
                    make_hitboxes = this.punch_timeouts[i] >= this.punch_recovery - this.punch_active_duration;
                    
                    if (this.punch_timeouts[i] <= 0) {
                        this.hands_sprites[i] = "hand_neutral";

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1;
                        this.punch_timeouts[i] = random_float(...this.punch_timeout_range, this.board.random);
                    }

                    break;
                }

                case "hand_block": {
                    this.parry_delays[i] -= time_delta;
                    this.weapon_data[i].offset = new Vector2(0, 0);
                    
                    if (this.parry_delays[i] <= 0) {
                        this.hands_sprites[i] = "hand_tired";
                        this.tired_delays[i] = this.post_block_cooldown;

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 0.8;
                    }

                    break;
                }

                case "hand_grab": {
                    // need to do a whole bunch of code here for the grab but for now just make sure the positions always match
                    this.grab_info[i].speed += 50 * time_delta;

                    let rot_amt = this.grab_info[i].speed * time_delta;
                    this.weapon_data[i].rotate(rad2deg(rot_amt), this.hands_orientations[i] == -1);
                    this.grab_info[i].rotated_so_far += rot_amt;
                    // this.debug_log(`Rotated ${rad2deg(this.grab_info[i].speed * time_delta)}deg, ${rad2deg(this.grab_info[i].amount_to_rotate - this.grab_info[i].rotated_so_far)}deg remaining`)

                    this.grab_info[i].ball.weapon_data.forEach(w => {
                        w.angle += rot_amt * this.hands_orientations[i]
                    });

                    this.grab_info[i].ball.cache_weapon_offsets();
                    this.grab_info[i].ball.cache_hitboxes_offsets();

                    if (this.grab_info[i].rotated_so_far >= (this.grab_info[i].amount_to_rotate + (Math.PI / 8))) {
                        let rollback = this.grab_info[i].rotated_so_far - this.grab_info[i].amount_to_rotate;
                        let throwball = this.grab_info[i].ball;
                        
                        this.weapon_data[i].rotate(rad2deg(rollback), this.hands_orientations[i] == 1);
                        throwball.weapon_data.forEach(w => {
                            w.angle += rollback * this.hands_orientations[i]
                        });

                        // throw it. for now just drop it to show we're doing something
                        this.debug_log("Thrown!");
                        this.hands_sprites[i] = "hand_tired";
                        this.tired_delays[i] = this.post_grab_cooldown;

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 0.8;

                        // We can get the wall to select by getting the current angle of the weapon
                        throwball.apply_hitstop(1);

                        let vec = new Vector2(0, 1 * this.hands_orientations[i]).rotate(this.weapon_data[i].angle);
                        let new_position = throwball.position.copy();

                        if (Math.abs(vec.x) >= 0.5) {
                            // right or left
                            if (vec.x < 0) {
                                // left
                                new_position.x = throwball.radius;
                            } else {
                                // right
                                new_position.x = this.board.size.x - throwball.radius;
                            }
                        } else {
                            // up or down
                            if (vec.y < 0) {
                                // up
                                new_position.y = throwball.radius;
                            } else {
                                // down
                                new_position.y = this.board.size.y - throwball.radius;
                            } 
                        }

                        // now make particles along the way
                        let cpos = throwball.position;
                        let stopping = 2;
                        let times = 0;
                        let size_factor = throwball.radius / this.radius;
                        let delay = 0.02 * size_factor;
                        while (stopping > 0) {
                            if (!board.in_bounds(cpos)) {
                                stopping--;
                            }

                            let part = new Particle(
                                cpos, this.weapon_data[i].angle + (this.hands_orientations[i] * Math.PI/2),
                                size_factor, HandBall.lightning_parts, 4 / delay, 
                                999, false, 0 + (times * delay)
                            );

                            board.spawn_particle(part, cpos);
                            
                            times++;
                            cpos = cpos.add(vec.mul(128 * size_factor * PARTICLE_SIZE_MULTIPLIER));
                        }

                        throwball.display = false;
                        // this.debug_log(`${throwball.id} phasing out`);

                        let timer = new Timer(
                            board => {
                                // this.debug_log(`${throwball.id} phasing back in`);
                                throwball.skip_physics = false;
                                throwball.display = true;

                                throwball.set_pos(new_position);
                                throwball.get_hit(this, this.grab_damage_impact, BASE_HITSTOP_TIME * 4);

                                play_audio("wall_smash");

                                let pos = throwball.position.sub(
                                    vec.mul(size_factor * 2 * throwball.radius)
                                )

                                let part = new Particle(
                                    pos, vec.angle() - (Math.PI /2),
                                    size_factor * 2, entity_sprites.get("explosion3"), 12, 
                                    999
                                );

                                board.spawn_particle(part, pos);
                            }, delay * (times-1)
                        );

                        board.set_timer(timer);

                        this.debug_log(`${throwball.id} set timer ID ${timer.id} for ${delay * (times-1)} to phase back in`);

                        throwball.display = false;

                        this.set_velocity((this.position.sub(new_position).normalize()).mul(this.grab_info[i].stored_velocity.magnitude()));
                    } else {
                        let ballpos = this.position.add(this.get_weapon_offset(i));
                        this.grab_info[i].ball.set_pos(ballpos);
                        this.set_velocity(new Vector2(0, 0));

                        // special case for balls with particles
                        if (this.grab_info[i].ball.update_particles) {
                            this.grab_info[i].ball.update_particles(time_delta);
                        }
                    }

                    break;
                }

                case "hand_tired": {
                    if (this.level >= AWAKEN_LEVEL) {
                        // delete it and make sure to splice out of all relevant containers
                        // wow this sounds like i should have linked them all together into an object
                        // instead of keeping track of 7 arrays...... oh well!!!
                        deletion_indices.push(i);
                    } else {
                        this.tired_delays[i] -= time_delta;
                        this.weapon_data[i].offset = new Vector2(0, 0);
                        
                        if (this.tired_delays[i] <= 0) {
                            this.hands_sprites[i] = "hand_neutral";

                            this.weapon_data[i].offset = new Vector2(0, 0);
                            this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER;
                        } else {
                            // hands drift downwards
                            let angle_rotated = positive_mod(this.weapon_data[i].angle - (Math.PI / 2), Math.PI * 2);
                            let side = seeded_random_from_array([-1, 1], this.board.random);
                            if (angle_rotated > Math.PI) {
                                side = 1;
                            } else if (angle_rotated < Math.PI) {
                                side = -1;
                            }

                            this.weapon_data[i].rotate(side * time_delta * 25);
                        }
                    }

                    break;
                }
            }

            if (make_hitboxes) {
                this.weapon_data[i].hitboxes = HandBall.hitboxes[this.hands_sprites[i]];
            } else {
                this.weapon_data[i].hitboxes = [];
            }

            this.weapon_data[i].sprite = this.hands_sprites[i] + (this.hands_orientations[i] == 1 ? "" : "_r");
        }


        for (let d_i=0; d_i<deletion_indices.length; d_i++) {
            let i = deletion_indices[d_i];

            let offset = this.get_weapon_offset(i).mul(2);
            let pos = this.position.add(offset);
            let part = new Particle(
                pos, this.weapon_data[i].angle + (Math.PI / 2), 0.75,
                entity_sprites.get("explosion_small"),
                12, 999
            );

            board.spawn_particle(part, pos);

            this.hands_speeds.splice(i, 1);
            this.hands_speed_timeouts.splice(i, 1);
            this.hands_sprites.splice(i, 1);
            this.punch_timeouts.splice(i, 1);
            this.parry_delays.splice(i, 1);
            this.grab_info.splice(i, 1);
            this.tired_delays.splice(i, 1);
            this.hands_orientations.splice(i, 1);

            this.weapon_data.splice(i, 1);

            deletion_indices = deletion_indices.map(d => {
                if (d > i) {
                    return d-1;
                }

                return d;
            })
        };
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        this.block_hand(with_weapon_index);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        this.block_hand(with_weapon_index);
    }

    block_hand(with_weapon_index) {
        this.hands_sprites[with_weapon_index] = "hand_block";
        this.weapon_data[with_weapon_index].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 1;
        this.parry_delays[with_weapon_index] = 0.5;
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        if (this.hands_sprites[with_weapon_index] == "hand_punch" || this.hands_sprites[with_weapon_index] == "hand_block") {
            let dmg = this.punch_damage;
            if (this.hands_sprites[with_weapon_index] != "hand_punch") {
                dmg = 0;
            }
            
            result = super.hit_other(other, with_weapon_index, dmg);

            let diff_vec = other.position.sub(this.position).normalize();
            let share = 1;

            let other_diff_add = diff_vec.mul(share);

            let other_mag = other.velocity.magnitude();

            if (other_mag != 0) {
                let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

                other.set_velocity(new_other_velocity);
            }

            other.apply_invuln(BALL_INVULN_DURATION * 2);
        } else if (this.hands_sprites[with_weapon_index] == "hand_open" && !(other instanceof Powerup)) {
            // GRAB!!!!!!!
            result = super.hit_other(other, with_weapon_index, this.grab_damage_initial);
            this.grab_ball(with_weapon_index, other);
        } else {
            result = super.hit_other(other, with_weapon_index, 0);
        }

        return result;
    }

    grab_ball(with_weapon_index, ball) {
        play_audio("grab");

        this.hands_sprites[with_weapon_index] = "hand_grab";
        this.weapon_data[with_weapon_index].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 2;

        this.grab_info[with_weapon_index].ball = ball;
        ball.skip_physics = true;
        
        // find the target angle by looking at the situations on all four directions.
        // remember we're checking the ball's position, not our own
        let expected_grab_ball_offset = this.get_weapon_offset(with_weapon_index);

        // rotate to 180deg and 270deg, and check distance from the board side bounds.
        // so for facing to the right, check up/down and that the ball would be in bounds
        // we always want to rotate at least 180deg, so start from the first cardinal angle >= 180deg
        let rev_orient = this.hands_orientations[with_weapon_index];
        let rotation_sign = rev_orient;

        let check_angle_begin = this.weapon_data[with_weapon_index].angle;
        let check_angle_diff = (Math.PI * (7/2) * rotation_sign) + (Math.sign(check_angle_begin) * ((Math.PI / 2) - (Math.abs(check_angle_begin) % (Math.PI / 2))));  // amount to rotate to get to the next cardinal angle
        let check_next = check_angle_diff;
        this.debug_log("its grab time bitch");
        this.debug_log(`Weapon index: ${with_weapon_index} (* ${rotation_sign})`);
        this.debug_log(`Weapon angle is ${rad2deg(this.weapon_data[with_weapon_index].angle)}deg`);
        this.debug_log(`Started at ${rad2deg(check_angle_begin)}deg`);
        this.debug_log(`Beginning checks at ${rad2deg(check_next)}deg`);
        this.debug_log(`So first composite rotation is ${rad2deg(check_angle_begin + check_next)}`);

        // TODO this still doesn't work right.
        // TODO the rest of the throw logic
        // TODO make the balls intangible while theyre doing this,
        // and make sure weapons don't do anything during this

        let angle_rotated = Math.abs(check_angle_diff);

        let possible_rotations = [];

        while (possible_rotations.length < 4) {
            if (check_next % (Math.PI * 2) == 0) {
                // skip if it's 360deg
            } else {
                let ball_rotated = this.position.add(expected_grab_ball_offset.rotate(check_next));

                let rotation_mod = (check_angle_begin + check_next) % Math.PI;
                // if closer to PI/2, it's y. if closer to 0, it's x.
                // 0 - 90 - 180
                // ABS to get 90 - 0 - 90
                let rotation_abs = Math.abs(rotation_mod - (Math.PI / 4));

                let significant_coordinate = rotation_abs <= Math.PI / 4 ? ball_rotated.x : ball_rotated.y;

                // check that the position +- radius is < / > the bound
                let lower_bound = significant_coordinate - ball.radius;
                let upper_bound = significant_coordinate + ball.radius;

                if (lower_bound >= 0) {
                    if (upper_bound < this.board.size.x) {
                        // we found it!
                        this.debug_log(`Found! Adding rotation ${rad2deg(angle_rotated)}deg`)
                        possible_rotations.push([check_next, angle_rotated]);
                    }
                }
            }

            angle_rotated += (Math.PI / 2);
            check_next += rotation_sign * (Math.PI / 2);
        }

        this.debug_log("Got two rotations.");
        let best = [null, -9999];
        possible_rotations.forEach(r => {
            let vec = new Vector2(0, 1 * rotation_sign).rotate(r[0] + check_angle_begin);
            let coord = 0;
            let target = 0;

            let score_bias = 1; 
            // a hand rotating clockwise wants to throw right or down
            // a hand rotating anticlockwise wants to throw left or up

            if (Math.abs(vec.x) >= 0.5) {
                // right or left
                coord = this.position.x;
                if (vec.x < 0) {
                    // left
                    target = 0;
                    if (rev_orient == 1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // right
                    target = this.board.size.x;
                    if (rev_orient == -1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                }
            } else {
                coord = this.position.y;
                // up or down
                if (vec.y < 0) {
                    // up
                    target = 0;
                    if (rev_orient == 1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // down
                    target = this.board.size.y;
                    if (rev_orient == -1) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                }
            }

            let result = Math.abs(target - coord) * score_bias;
            this.debug_log(`${rad2deg(r[1])} (${rad2deg((r[1] * rotation_sign) + check_angle_begin) % 360}, ${vec.toString()}) has result ${result} (${coord} <=> ${target})`)
            // we want as much distance as possible
            if (result-50 > best[1]) {
                best = [r, result];
            }
        })

        this.debug_log(`Got our best rotation - ${rad2deg(best[0][1])}`);
        this.debug_log(`So will rotate from ${rad2deg(check_angle_begin)}deg to ${rad2deg(check_angle_begin + (best[0][1] * rotation_sign))}`);

        this.grab_info[with_weapon_index].amount_to_rotate = best[0][1];
        this.grab_info[with_weapon_index].rotated_so_far = 0;
        this.grab_info[with_weapon_index].speed = 0;
        this.grab_info[with_weapon_index].stored_velocity = this.velocity;
    }

    die() {
        let result = super.die();

        // free all thrown balls
        this.grab_info.forEach(g => {
            if (g && g.ball) {
                g.ball.display = true;
                g.ball.skip_physics = false;
            }
        })

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `The hand.   `
        )
        this.hands_sprites.forEach((s, i) => {
            this.write_desc_line(
                HandBall.emojis[s], false, null, s == "hand_tired" ? "gray" : null, true, (12 * 6) + (i * 12)
            )
        })

        this.write_desc_line(
            `Punch damage: ${this.punch_damage.toFixed(2)}`
        )
        this.write_desc_line(
            `Grab damage: ${this.grab_damage_initial.toFixed(2)} + ${this.grab_damage_impact.toFixed(2)}`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Hands: ${this.hands_sprites.length}`, true, 12
            )
            let timeout = (this.hand_sprout_base * compat_pow(2, this.hands_sprites.length));
            let timeleft = (this.hand_sprout_base * compat_pow(2, this.hands_sprites.length)) - this.hand_sprout_timeout
            this.write_desc_line(
                `Time until next hand: ${timeleft.toFixed(1)}s / ${timeout.toFixed(1)}s`, true, 10
            )
            let bar_l = 32;
            let prop = timeleft / timeout;
            let empties = Math.max(0, Math.min(bar_l, Math.ceil(prop * bar_l)));
            this.write_desc_line(
                `[${"#".repeat(bar_l - empties)}${" ".repeat(empties)}]`, true, 10
            )
        } else {
            this.write_desc_line(
                `Parry tiredness duration: ${this.post_block_cooldown.toFixed(2)}s`
            )
            this.write_desc_line(
                `Throw tiredness duration: ${this.post_grab_cooldown.toFixed(2)}s`
            )
        }
    }
}

class ChakramBall extends WeaponBall {
    static ball_name = "Chakram";
    
    static AVAILABLE_SKINS = [
        "Fidget",  // Ryn
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Chakram";
        this.description_brief = "Throws a large chakram that orbits around self before returning.";
        this.level_description = "Increases the time for which the chakram remains in orbit and the damage it deals while thrown.";
        this.max_level_description = "The chakram now also applies rupture equal to damage.";
        this.quote = "它叫手里剑我一直在说";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Misunderstood and thoughtful, with a very, very large chakram.";
        this.description = ""
        this.lore_description = "Because of the hugely lengthened lifespan of most balls along with their concept porosity rapidly diminishing after tethering, it has proven reasonably difficult for them to learn languages other than Spheric, and even harder for them to understand the perspective of a ball who never learned the language at all. Though Chakram feels right at home in the Shenzhen Arena, his trips to the Grand Arena have often fallen short of comfortable. Alongside his extensive duties as a celebrity darling of the Asian ball combat scene, Chakram has spent extensive effort fighting his limitations and becoming a polyglot in order to better spread a message of inclusivity throughout all balls, especially the diaspora stuck with Spheric, or without it. Though he would very much like to go, he worries about his treatment were he to visit Remnath, but hopes that one day he might see open passage between the planes and street signs in all five major languages."
        this.weapon_relationship = "我的名字有可能改成\"手里剑\"吗?"
        this.lore_origin = "South East Asia Ball-Human Autonomous Zone"
        this.lore_temperament = "Patient"
        this.lore_affiliation = "NHK Ball Combat League"
        this.lore_alignment = "blue"
        this.lore_birthday = "6th Feb"

        this.default_colour = Colour.from_hex("#c7b9d3")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.DEFENSIVE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.tags = [
                TAGS.HYBRID,
                TAGS.DEFENSIVE,
                TAGS.AILMENTS,
                TAGS.LEVELS_UP,
                TAGS.CAN_AWAKEN,
            ];
        }

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [];
        
        this.sprite_suffix = "";

        this.reset_weapons();

        // weapon is rotated -45deg

        this.damage_base = 2;

        this.chakram_damage_base = 6 + (0.025 * level);
        this.chakram_rotation_speed = Math.PI * 4;
        this.chakram_orbit_time = 3.55 + (0.025 * level);
        this.chakram_min_dist = this.radius * 0.75;
        this.chakram_max_dist = this.radius * 4;

        this.speed_base = 75;
        this.speed_current = this.speed_base;
        this.windup_speed_mod = 900;

        this.throw_cooldown_max = [4.75, 8.75];
        this.throw_cooldown = random_float(...this.throw_cooldown_max, this.board.random);

        this.throw_windup_max = 1.5;
        this.throw_windup = this.throw_windup_max;

        this.last_throw_cooldown = this.throw_cooldown;
        this.linked_projectile = null;

        this.mode = "idle";
        this.weapon_reversed = false;
    }
        
    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Fidget": {
                this.sprite_suffix = "_fidget";
                this.weapon_data[0].sprite += this.sprite_suffix;

                break;
            }
        }
    }

    reset_weapons() {
        this.weapon_data = [
            new BallWeapon(1, "chakram_weapon" + this.sprite_suffix, [
                // {pos: new Vector2(52, 64), radius: 18},

                // {pos: new Vector2(52-16, 64-16), radius: 10},
                // {pos: new Vector2(52-24, 64-24), radius: 6},
                // {pos: new Vector2(52-36, 64-20), radius: 6},

                {pos: new Vector2(52+16, 64+16), radius: 10},
                {pos: new Vector2(52+24, 64+24), radius: 6},
                {pos: new Vector2(52+36, 64+20), radius: 6},

                {pos: new Vector2(52+16, 64-16), radius: 10},
                {pos: new Vector2(52+16, 64-28), radius: 6},
                {pos: new Vector2(52+10, 64-40), radius: 6},

                // {pos: new Vector2(52-16, 64+16), radius: 10},
                {pos: new Vector2(52-16, 64+28), radius: 6},
                {pos: new Vector2(52-10, 64+40), radius: 6},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-48, 0);
        this.weapon_data[0].reversed = this.weapon_reversed;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        if (this.mode != "thrown") {
            this.rotate_weapon(0, this.speed_current * time_delta);

            if (this.mode == "idle") {
                if (this.speed_current > this.speed_base) {
                    this.speed_current = Math.max(this.speed_base, this.speed_current - (this.windup_speed_mod * 0.5 * time_delta));
                }

                this.throw_cooldown -= time_delta;
                if (this.throw_cooldown <= 0) {
                    this.throw_cooldown = random_float(...this.throw_cooldown_max, this.board.random);
                    this.last_throw_cooldown = this.throw_cooldown;

                    this.throw_windup = this.throw_windup_max;
                    this.mode = "windup";
                    this.weapon_data[0].reverse();
                    this.speed_current = -this.speed_base;
                }
            } else if (this.mode == "windup") {
                this.throw_windup -= time_delta;
                this.speed_current += this.windup_speed_mod * time_delta;
                if (this.throw_windup <= 0) {
                    // throw projectile
                    let pos = this.position.add(this.get_weapon_offset(0));
                    let proj = new ChakramProjectile(
                        this.board,
                        this, 0, pos, this.chakram_damage_base,
                        1, this.weapon_data[0].angle, this.chakram_rotation_speed * (this.reversed ^ this.weapon_data[0].reversed ? -1 : 1),
                        this.chakram_orbit_time, this.chakram_min_dist, this.chakram_max_dist,
                        this.sprite_suffix
                    );

                    board.spawn_projectile(proj, pos);
                    
                    this.mode = "thrown";

                    this.linked_projectile = proj;
                    
                    this.weapon_reversed = this.weapon_data[0].reversed;
                    this.weapon_data = [];
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let result = {};

        result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        // projectiles have their own damage
        // console.log(`hit ${other.name} with projectile`);

        let hitstop = BASE_HITSTOP_TIME;

        let dmg = with_projectile.damage * this.get_stat("damage_bonus");
        let result = other.get_hit_by_projectile(this, dmg, hitstop);
        
        if (with_projectile.source_weapon_index != 999) {
            if (this.level >= AWAKEN_LEVEL) {
                this.apply_rupture(other, dmg, "");
            }

            this.apply_hitstop(hitstop);

            result.hitstop = hitstop;
        }

        this.board.register_hit(this, other);
        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Throws an orbiting chakram projectile.`
        )
        this.write_desc_line(
            `Chakram impact damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Chakram thrown damage: ${this.chakram_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Chakram orbit duration: ${this.chakram_orbit_time.toFixed(3)}s`
        )

        if (this.mode == "idle") {
            this.write_desc_line(
                `Chakram: held    (${this.throw_cooldown.toFixed(1)}s) [${"#".repeat(Math.ceil((this.throw_cooldown / this.last_throw_cooldown) * 12)).padEnd(12)}]`
            )
        } else {
            if (this.mode == "thrown") {
                let timeleft = this.linked_projectile.rotation_time - this.linked_projectile.lifetime;
                this.write_desc_line(
                    `Chakram: thrown! (${timeleft.toFixed(1)}s) [${"!".repeat(Math.ceil((timeleft / this.linked_projectile.rotation_time) * 12)).padEnd(12)}]`
                )
            } else {
                this.write_desc_line(
                    `Chakram: throwing...`
                )
            }
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Chakram rupture on hit: ${this.chakram_damage_base.toFixed(2)}`, true
            )
        }
    }
}

class WandBall extends WeaponBall {
    static ball_name = "Wand";

    static AVAILABLE_SKINS = [
        "Whimsy",  // Boggy
        "Brush",   // Refticus
    ];

    static spell_names = {
        "cyan": "Icicle",
        "red": "Fireball",
        "green": "Poison barbs",
        "magenta": "Lightning",
        "black": "Black ball"
    }

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Wand";
        this.description_brief = "Has a wand that uses one of 5 random spells each time it activates - a spread of icicles, a fireball, a salvo of bouncing poison barbs, chaining lightning or, rarely, a terrifying, dense black ball.";
        this.level_description = "Reduces the delay between spell casts.";
        this.max_level_description = "Upgrades each spell - more icicles, larger fireball, barbs hit up to twice, more lightning chains, more damaging black ball.";
        this.quote = "Chat did you see that guy lmao what a loser";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Really just straight up murderous and evil. Somehow the only remaining holder of arcane power in all the known planes.";
        this.description = ""
        this.lore_description = "Unbeknownst to both us and ballkind, magic users had existed on the home planes all along - we were just no good at finding them. Whether the specialised wards were keyed too strongly to our kind to trigger or Wand simply got lucky, he managed to find the last wizard before tethering to his staff and summarily killing him. Thus ended the line of wizardry, too weak to be revived now that the conceptual baseline had well and truly defined it out of existence - leaving Wand as the last true magic user in the known planes. In the wizard's final moments, he placed a curse on this invader to torment his soul for eternity, implanting a demonic mind to belittle and torment the upstart killer until the end of days. Still conceptually porous, however, Wand managed to warp the concept of this new auxilliary tether into an entity named \"Chat\", which he now quips to more often than it ever says anything back."
        this.weapon_relationship = "Ayo lmao this guy is tryna talk to me? Chat what do I say?"
        this.lore_origin = "Convergence"
        this.lore_temperament = "Temperamental"
        this.lore_affiliation = "An Evil Wizard Tower"
        this.lore_alignment = "red"
        this.lore_birthday = "12th Dec"

        this.default_colour = Colour.from_hex("#ffb33b")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.AILMENTS,
            TAGS.CHILDREN,
            TAGS.AOE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "wizard_circle";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "wand_white", [
                {pos: new Vector2(86, 64), radius: 12},
                
                {pos: new Vector2(68, 64), radius: 6},
                {pos: new Vector2(56, 64), radius: 6},
                {pos: new Vector2(44, 64), radius: 6},
                {pos: new Vector2(32, 64), radius: 6},
            ])
        ];
        this.weapon_data[0].offset = new Vector2(-24, 0);

        this.damage_base = 1;
        this.speed_base = 180;

        this.cast_delay_max = [1.6 - (this.level * 0.011), 3.175 - (this.level * 0.022)];
        this.cast_delay = random_float(...this.cast_delay_max, this.board.random);

        this.cast_flash_timeout = 0;

        this.spell_chances = balance_weighted_array([
            [0.1, "black"],
            [1, "cyan"],
            [1, "green"],
            [1, "magenta"],
            [1, "red"],
        ]);
        this.current_spell = null;
        if (this.board)
            this.pick_next_spell();

        this.icicle_damage = 10;
        this.additional_icicle_count = 2;  // 2 on each side plus the main one so 5 total
        this.icicle_velocity = 10000;
        this.icicle_velocity_per_additional = -1000;
        this.icicle_angle_per_additional = deg2rad(7.5);
        this.icicle_delay_per_additional = 0.05;

        this.fireball_damage = 16;
        this.fireball_size_mult = 1;
        this.fireball_velocity = 3000;

        this.poison_barb_count = 3;
        this.poison_barb_intensity = 2;
        this.poison_barb_hp = 1;
        this.poison_barb_duration = 2;
        this.poison_barb_velocity = 2500;
        
        this.chain_lightning_chain_chance = 0.175;
        this.chain_lightning_damage = 10;
        this.chain_lightning_distance = 1000;
        this.chain_lightning_spread = deg2rad(45);
        this.chain_lightning_delay_per_chain = 0.015;

        this.black_ball_damage = 8;
        this.black_ball_duration = 24;
        this.black_ball_velocity = 15000;

        if (this.level >= AWAKEN_LEVEL) {
            this.additional_icicle_count = 4;
            this.fireball_size_mult = 1.5;
            this.poison_barb_hp = 2;
            this.chain_lightning_chain_chance = 0.3;
            this.black_ball_damage = 12;
        }

        this.sprite_suffix = "";
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Whimsy": {
                this.weapon_data[0].sprite = "wand_black_whimsy";
                this.sprite_suffix = "_whimsy";

                break;
            }

            case "Brush": {
                this.weapon_data[0].sprite = "wand_black_brush";
                this.sprite_suffix = "_brush";

                break;
            }
        }
    }

    pick_next_spell() {
        let last_spell = this.current_spell;
        while (this.current_spell == last_spell) {
            this.current_spell = weighted_seeded_random_from_arr(this.spell_chances, this.board.random)[1];
        }
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        return result;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        if (this.cast_flash_timeout >= 0) {
            this.weapon_data[0].sprite = "wand_white";
        } else {
            this.weapon_data[0].sprite = `wand_${this.current_spell}`;
        }

        this.weapon_data[0].sprite += this.sprite_suffix;

        this.cast_flash_timeout -= time_delta;
        this.cast_delay -= time_delta;
        if (this.cast_delay <= 0) {
            // time to cast!
            this.cast_delay = random_float(...this.cast_delay_max, this.board.random);
            this.cast_flash_timeout = 0.5;

            let position = this.position.add(this.get_weapon_offset(0).mul(1.5));
            switch (this.current_spell) {
                case "black": {
                    let velocity = new Vector2(this.black_ball_velocity, 0).rotate(this.weapon_data[0].angle)
                    let new_ball = new WandBlackBall(
                        this.board,
                        this.mass * 1, this.radius * 0.75, this.colour,
                        this.bounce_factor, this.friction_factor,
                        this.player, this.level,
                        this.black_ball_damage, this.black_ball_duration
                    )

                    new_ball.apply_invuln(BALL_INVULN_DURATION);
                    new_ball.show_stats = false;

                    new_ball.set_velocity(velocity);
                    new_ball.parent = this;

                    let part = new Particle(new_ball.position, 0, 1, entity_sprites.get("super_orb"), 0, 999999);
                    board.spawn_particle(part, new_ball.position);
                    new_ball.linked_particle = part;
                    
                    board.spawn_ball(new_ball, position);
                    break;
                }

                case "cyan": {
                    // icicles
                    let initial_vector = new Vector2(1, 0).rotate(this.weapon_data[0].angle);

                    let proj = new WandIcicleProjectile(
                        this.board,
                        this, 0, position, this.icicle_damage, 1,
                        initial_vector, this.icicle_velocity, new Vector2(0, 0)
                    )
                    board.spawn_projectile(proj, position);

                    for (let i=0; i<this.additional_icicle_count; i++) {
                        board.set_timer(new Timer(() => {
                            let _position = this.position.add(this.get_weapon_offset(0).mul(1.5));

                            [1, -1].forEach(sign => {
                                let angle_mod = this.icicle_angle_per_additional * (i+1) * sign;
                                
                                let new_vector = initial_vector.rotate(angle_mod);

                                let proj = new WandIcicleProjectile(
                                    this.board,
                                    this, 0, _position, this.icicle_damage, 1,
                                    new_vector, this.icicle_velocity + ((i+1) * this.icicle_velocity_per_additional), new Vector2(0, 0)
                                )
                                board.spawn_projectile(proj, _position);
                            })
                        }, this.icicle_delay_per_additional * (i+1)))
                    }

                    break;
                }

                case "green": {
                    for (let i=0; i<this.poison_barb_count; i++) {
                        let velocity = new Vector2(this.poison_barb_velocity * random_float(0.5, 2, this.board.random), 0).rotate(this.weapon_data[0].angle)
                        let new_ball = new WandGreenBall(
                            this.board,
                            this.mass * 0.1, this.radius * 0.15, this.colour,
                            this.bounce_factor, this.friction_factor,
                            this.player, this.level,
                            this.poison_barb_duration, this.poison_barb_intensity
                        )

                        new_ball.hp = this.poison_barb_hp;
                        new_ball.max_hp = this.poison_barb_hp;

                        new_ball.apply_invuln(BALL_INVULN_DURATION);
                        new_ball.show_stats = false;

                        new_ball.set_velocity(velocity);
                        new_ball.parent = this;

                        let part = new Particle(position, 0, 1, entity_sprites.get("wand_poison_barb"), 0, 999999);
                        board.spawn_particle(part, position);
                        new_ball.linked_particle = part;
                        
                        board.spawn_ball(new_ball, position);
                    }
                    break;
                }

                case "magenta": {
                    let lightnings = [[position, this.weapon_data[0].angle]];

                    let loops = 0;
                    while (lightnings.length > 0) {
                        let new_lightnings = [];
                        lightnings.forEach(lgt => {
                            let pos = lgt[0];
                            let angle = lgt[1];

                            if (!board.in_bounds(pos)) {
                                return;
                            }

                            let repeats = 1;
                            if (random_float(0, 1, this.board.random) < this.chain_lightning_chain_chance) {
                                repeats = 2;
                            }

                            for (let i=0; i<repeats; i++) {
                                let new_angle = angle + (random_float(-1, 1, this.board.random) * this.chain_lightning_spread);

                                let direction = new Vector2(this.chain_lightning_distance, 0).rotate(new_angle);

                                let newpos = pos.add(direction);

                                // make a timer to create a hitscan projectile from pos to pos+direction
                                // then append the new lightning node
                                let timer = new Timer(() => {
                                    let proj = new WandMagentaProjectile(
                                        this.board,
                                        this, 0, pos, this.chain_lightning_damage, newpos
                                    );

                                    board.spawn_projectile(proj, pos);
                                }, this.chain_lightning_delay_per_chain * loops);

                                board.set_timer(timer);

                                new_lightnings.push([newpos, new_angle]);
                            }
                        })

                        loops++;
                        lightnings = new_lightnings;
                    }

                    break;
                }

                case "red": {
                    let initial_vector = new Vector2(1, 0).rotate(this.weapon_data[0].angle);

                    let proj = new WandFireballProjectile(
                        this.board,
                        this, 0, position, this.fireball_damage, this.fireball_size_mult,
                        initial_vector, this.fireball_velocity, new Vector2(0, 0)
                    )

                    proj.board = board;

                    board.spawn_projectile(proj, position);

                    break;
                }
            }

            this.pick_next_spell();
        }
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `All spells are empowered.`, true
            )
        } else {
            this.write_desc_line(
                `Casts random arcane spells.`
            )
        }

        this.write_desc_line(
            `Next spell: `
        )

        let col = this.current_spell == "black" ? "white" : this.current_spell;
        let name = WandBall.spell_names[this.current_spell];

        this.write_desc_line(
            `            ${name}`, false, null, col, true, 
        )
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Casts random arcane spells.`
        )

        this.write_desc_line(
            `${this.current_spell == "cyan" ? " - " : ""}Icicle: ${this.icicle_damage.toFixed(2)}dmg, ${1 + (this.additional_icicle_count * 2)} icicles`,
            false, null,
            this.current_spell == "cyan" ? "cyan" : "grey"
        )

        this.write_desc_line(
            `${this.current_spell == "red" ? " - " : ""}Fireball: ${this.fireball_damage.toFixed(2)}dmg (hit + explosion), ${this.fireball_size_mult}x size`,
            false, 10,
            this.current_spell == "red" ? "red" : "grey"
        )

        this.write_desc_line(
            `${this.current_spell == "green" ? " - " : ""}Poison: ${this.poison_barb_count} barbs, ${this.poison_barb_intensity} poison for ${this.poison_barb_duration}s, ${this.poison_barb_hp} hit(s)`,
            false, 10,
            this.current_spell == "green" ? "green" : "grey"
        )

        this.write_desc_line(
            `${this.current_spell == "magenta" ? " - " : ""}Lightning: ${this.chain_lightning_damage.toFixed(2)}dmg, ${(this.chain_lightning_chain_chance * 100).toFixed(0)}% chain chance`,
            false, null,
            this.current_spell == "magenta" ? "magenta" : "grey"
        )

        this.write_desc_line(
            `${this.current_spell == "black" ? " - " : ""}Ball: ${this.black_ball_damage.toFixed(2)}dmg, ${this.black_ball_duration}s duration`,
            false, null,
            this.current_spell == "black" ? "white" : "grey"
        )

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `More icicles, larger fireball, barbs hit twice,`, true, 10
            )
            this.write_desc_line(
                `more lightning chains, more damaging black ball.`, true, 10
            )
        }
    }
}

class WandBlackBall extends WeaponBall {
    static ball_name = "Wand Black Ball Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, hit_damage, duration) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Wand Black Ball Projectile";
        this.description_brief = "Fired from the wand ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [
            new BallWeapon(1, "super_orb", [
                {pos: new Vector2(64, 64), radius: 26},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-72, 0);

        this.lifetime = 0;
        this.duration = duration;
        this.hit_damage = hit_damage;

        this.hp = 100000;
        this.max_hp = 100000;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = 0;
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = this.hit_damage;

        let result = super.hit_other(other, with_weapon_index, dmg);

        let diff_vec = other.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = other.velocity.magnitude();

        if (other_mag != 0) {
            let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

            other.set_velocity(new_other_velocity);
        }

        other.apply_invuln(BALL_INVULN_DURATION * 2);

        return result;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.75, entity_sprites.get("explosion_small"), 12, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class WandGreenBall extends WeaponBall {
    static ball_name = "Wand Green Ball Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, poison_duration, poison_intensity) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Wand Green Ball Projectile";
        this.description_brief = "Fired from the wand ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [
            new BallWeapon(1, "wand_poison_barb", [
                {pos: new Vector2(64, 64), radius: 12},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-52.5, 0);

        this.lifetime = 0;
        this.duration = Number.POSITIVE_INFINITY;
        
        this.damage_poison_duration = poison_duration;
        this.damage_poison_intensity = poison_intensity;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = random_float(0, 0);
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally poison
        let dmg = 0;

        let result = super.hit_other(other, with_weapon_index, dmg);

        this.parent.apply_poison(
            other,
            this.damage_poison_intensity,
            this.damage_poison_duration
        )

        this.hp -= 1;

        return result;
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // this deliberately does not call its super
        // because we don't want these to count for tension
        
        this.hp -= 1;

        other_ball.weapon_data[other_weapon_id]?.reverse()
    }

    parry_projectile(with_weapon_index, projectile) {
        // this deliberately does not call its super
        // because we don't want these to count for tension

        this.hp -= 1;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.35, entity_sprites.get("explosion_small"), 24, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class AxeBall extends WeaponBall {
    static ball_name = "Axe";

    static AVAILABLE_SKINS = [
        "Reaper",   // Boggy
        "Ancient",  // Refticus
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Axe";
        this.description_brief = "Doesn't ever reverse weapon direction. Periodically lunges, swinging the axe. Attacks deal bonus damage based on rotation speed.";
        this.level_description = "Reduces lunge cooldown and increases base rotation speed.";
        this.max_level_description = "The axe also launches a damaging, piercing shockwave when swinging.";
        this.quote = "Did you get that on camera?!\nI gotta put this match in my highlight reel!";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Born for the stage, Axe sacrifices everything for the clip, charging headlong into danger with incredibly powerful axe swings.";
        this.description = ""
        this.lore_description = "Axe grew up in the first golden age of ball combat, when every fight was shown on every channel and the results of bouts regularly made the headlines. He loved the splendor, the tension, the storylines, but most importantly he loved the highlights. Rewatching the best clips from each tournament again and again, marvelling at the explosive skill of his favourite contenders, Axe spent every day wishing it could one day be him. He chose to tether a gigantic battle-axe, one of the largest weapons out of all those regularly taken to the Grand Arena, his skill with it unique enough to have him scouted long before he made it out of the rookie leagues. While he still can't quite comprehend the idea that he and dagger are in the same room, let alone fighting on even footing, he has admitted that the things she's said to him before dispatching him have distinctly changed his opinion of her. Never meet your heroes."
        this.weapon_relationship = "You know Hammer said he might be sending me on tour soon? I'll be fighting in Asia, Africa AND South America! Being able to fight Khopesh on her own turf is gonna be so awesome!"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Boisterous"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "green"
        this.lore_birthday = "23th Jul"

        this.default_colour = Colour.from_hex("#7c48ff")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "axe", [
                {pos: new Vector2(68, 50), radius: 18},
                {pos: new Vector2(68, 72), radius: 18},
                {pos: new Vector2(50, 60), radius: 6},
                {pos: new Vector2(44, 60), radius: 6},
                {pos: new Vector2(38, 60), radius: 6},
                {pos: new Vector2(32, 60), radius: 6},
                {pos: new Vector2(26, 60), radius: 6},
                {pos: new Vector2(20, 60), radius: 6},
            ])
        ];

        this.damage_base = -1.78;
        this.damage_per_speed = 16 / 360;
        this.damage = 1;

        this.speed_base = 100 + (1 * level);
        this.speed_cur = this.speed_base;

        this.lunge_cooldowns_max = [2 - (0.005 * level), 3.8 - (0.02 * level)];
        this.lunge_cooldown = random_float(...this.lunge_cooldowns_max, this.board.random);
        this.last_lunge_cooldown = this.lunge_cooldown;

        this.lunge_velocity_share = 1;

        this.lunge_swing_accel_amt = deg2rad(360 * 480);
        this.lunge_swing_accel_dur = 0.3;
        this.lunge_swing_cur = null;

        this.lunge_swing_delay_max = 0.2;
        this.lunge_swing_delay = null;

        this.speed_friction = deg2rad(360 * 180);

        this.projectile_delay_max = 0.275;
        this.projectile_delay = null;
        this.projectile_damage = 8;
        this.projectile_speed = 9000;
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Reaper": {
                this.weapon_data[0].sprite = "axe_scythe";
                // TODO this should have a ghost afterimage

                break;
            }

            case "Ancient": {
                this.weapon_data[0].sprite = "axe_ancient";

                break;
            }
        }
    }

    lunge_movement() {
        let new_angle = this.weapon_data[0].angle - deg2rad(200);
        let diff_vec = new Vector2(1, 0).rotate(new_angle);
        let share = this.lunge_velocity_share;

        let diff_add = diff_vec.mul(share);

        let this_mag = this.velocity.magnitude();

        if (this_mag != 0) {
            let new_this_velocity = this.velocity.div(this_mag).mul(1 - share).add(diff_add).normalize().mul(this_mag)

            this.set_velocity(new_this_velocity);
        }

        let particle = new Particle(this.position, new_angle, 1.5, entity_sprites.get("hand_punch_particles"), 16, 0.4, false);
        this.board.spawn_particle(particle, this.position);
    }

    weapon_step(board, time_delta) {
        this.reversed = false;
        this.weapon_data[0].reversed = false;

        // rotate the weapon
        this.lunge_cooldown -= time_delta;
        if (this.lunge_cooldown <= 0) {
            this.lunge_cooldown = random_float(...this.lunge_cooldowns_max, this.board.random);
            this.last_lunge_cooldown = this.lunge_cooldown;

            this.lunge_swing_delay = this.lunge_swing_delay_max;
            this.lunge_movement();

            if (this.level >= AWAKEN_LEVEL) {
                this.projectile_delay = this.projectile_delay_max;
            }
        }

        if (this.lunge_swing_delay !== null) {
            this.lunge_swing_delay -= time_delta;
            if (this.lunge_swing_delay <= 0) {
                this.lunge_swing_delay = null;

                this.lunge_swing_cur = this.lunge_swing_accel_dur;
            }
        }

        if (this.lunge_swing_cur !== null) {
            this.speed_cur += this.lunge_swing_accel_amt * time_delta;

            if (this.projectile_delay !== null) {
                this.projectile_delay -= time_delta;
                if (this.projectile_delay <= 0) {
                    this.projectile_delay = null;

                    let pos = this.position.add(this.get_weapon_offset(0));

                    let projectile = new AxeAwakenProjectile(
                        this.board, this, 0, pos,
                        this.projectile_damage, 1.5,
                        new Vector2(1, 0).rotate(this.weapon_data[0].angle),
                        this.projectile_speed
                    );

                    this.board.spawn_projectile(projectile, pos);
                }
            }

            this.lunge_swing_cur -= time_delta;
            if (this.lunge_swing_cur <= 0) {
                this.lunge_swing_cur = null;
            }
        }

        this.speed_cur = Math.max(this.speed_base, this.speed_cur - this.speed_friction * time_delta);

        this.rotate_weapon(0, this.speed_cur * time_delta);
        this.damage = this.damage_base + (this.damage_per_speed * this.speed_cur);
    }

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Swings a highly damaging axe.`
        )
        this.write_desc_line(
            `Damage: ${this.damage.toFixed(1).padEnd(5)} |${">".repeat(Math.floor(this.damage / 2))}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_cur.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Lunge cooldown: ${this.lunge_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.lunge_cooldown / this.last_lunge_cooldown) * 12)).padEnd(12)}]`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Projectile damage: ${this.projectile_damage.toFixed(2)}`, true
            )
        }
    }
}

class ShotgunBall extends WeaponBall {
    static ball_name = "Shotgun";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Shotgun";
        this.description_brief = "Shoots a shotgun that fires high-spread bullets which cannot be parried. Each shot knocks back the shooter.";
        this.level_description = "Increases bullet damage.";
        this.max_level_description = "Shoots twice as many bullets.";
        this.quote = "...Target eliminated.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Emotionless and calculating in battle, Shotgun makes every shot count, with the potential to immediately demolish any opponent caught in the wrong spot.";
        this.description = ""
        this.lore_description = "Shotgun was born and trained in a clandestine wing of a clandestine department in an off-record branch of Remnath's shadow government. With an identity built from the ground up to make it possible for him to execute leaders, dissidents and war enemies alike, he spent decades knowing nothing but his accommodations and his missions. After Remnath's governmental collapse post-convergence, however, Shotgun found himself, for the first time in his life, without instructions - worse, being mid-mission, he was stuck on the wrong side of the seam when it closed. He wandered aimlessly for some time, trying to find a way to feel like he hadn't just lost his life's purpose, but his concept was simply unsuited to civilian life. Soon, the violent urges kicked in, as he knew they would, and he signed up as a contestant in the Grand Arena. Thankfully, he made it through, his ability to slip back into his assassin persona in combat giving him a unique edge over the competing hopefuls. He found a kindred spirit in Grenade and a trusted friend in SORD, who helped convince him that maybe even old balls can change."
        this.weapon_relationship = "I've been using the persona less these days. It feels good to change, but... everyone knows me as the assassin. Am I even Shotgun if that isn't me anymore?"
        this.lore_origin = "Convergence"
        this.lore_temperament = "Quiet"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "blue"
        this.lore_birthday = "20th Dec"

        this.default_colour = Colour.from_hex("#ffe0b6")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.HITSCAN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "snipe";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "shotgun", [
                {pos: new Vector2(32, 64), radius: 12},
                {pos: new Vector2(48, 64), radius: 12},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(90, -12),
        ]

        this.proj_damage_base = 3 + (this.level * 0.03);
        this.speed_base = 80;

        this.shot_cooldown_max = 0.77;
        this.shot_cooldown = this.shot_cooldown_max;

        this.num_bullets = 9;
        if (this.level >= AWAKEN_LEVEL) {
            this.num_bullets *= 2;
        }

        this.width_range = [12, 20];

        this.bullet_spread = deg2rad(25);
    }

    recoil_movement() {
        let new_angle = this.weapon_data[0].angle;
        let diff_vec = new Vector2(-1, 0).rotate(new_angle);
        let share = 0.8;

        let diff_add = diff_vec.mul(share);

        let this_mag = this.velocity.magnitude();

        if (this_mag != 0) {
            let new_this_velocity = this.velocity.div(this_mag).mul(1 - share).add(diff_add).normalize().mul(this_mag)

            this.set_velocity(new_this_velocity);
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;

        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            for (let i=0; i<this.num_bullets; i++) {
                let shot_angle = this.weapon_data[0].angle + random_float(
                    -this.bullet_spread, this.bullet_spread, this.board.random
                );

                let col = Colour.yellow.lerp(Colour.orange, random_float(0, 1, this.board.random));
                let width = random_float(...this.width_range, this.board.random);

                board.spawn_projectile(
                    new ShotgunProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base,
                        new Vector2(1, 0).rotate(shot_angle).mul(10000).add(fire_pos),
                        width, col
                    ), fire_pos
                )
            }

            this.recoil_movement();
            
            let snd_rand = Math.floor(this.independent_random() * 3);
            play_audio(["shotgun", "shotgun", "shotgun3"][snd_rand], 0.2);
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Significant self-knockback on each shot.`
        )
        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )

        let awakened = this.level >= AWAKEN_LEVEL
        this.write_desc_line(
            `Bullet count: ${this.num_bullets}`, awakened
        )
    }
}

class SpearBall extends WeaponBall {
    static ball_name = "Spear";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Spear";
        this.description_brief = "Throws spears which replenish over time. Successful strikes replenish a spear immediately.";
        this.level_description = "Reduces throw delay and increases replenishment speed.";
        this.max_level_description = "If throwing the last spear, replenish another spear immediately. Whenever a spear is replenished, replenish two instead.";
        this.quote = "I knew you could do it, little spear!\nI'm gonna put you in the display case so all the others can learn from you!";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "Relentlessly pushing any advantage, Spear rapidly punishes her opponent's missteps while building defenses, then uses her gathered armaments for even more damage.";
        this.description = ""
        this.lore_description = "Exposure to our plane taught balls many things, including novel approaches to tethering. The unique human approach to concept regarding weapons may have started the first-generation balls off as alchemists and rangers, but in recent times it seems as if the concept of \"weapon\" barely applies anymore. Spear is somewhere in the middle. One misconception (not helped by her name) is that she, indeed, tethered to a spear, but in truth she tethered to a spear display case, meaning the spears she throws are very much real. Though her ability to remain tethered to her case over a kilometre away was groundbreaking in her time, she now finds herself with a cumbersome weapon lacking any advantage over the truly modern tethers. Regardless, skill beats tricks, at least according to her, and she swears her spears talk to her sometimes about new battle strategies."
        this.weapon_relationship = "I am not just tethered to Gordon! I have tethers to all my little ones - there's Jack, Maxim, Lucia, Kyle, Potemkin, Martin, Qian, Riku, Ai, Hugo, [quotation cut for brevity]"
        this.lore_origin = "Venezuelan Superstate"
        this.lore_temperament = "Calculating"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "blue"
        this.lore_birthday = "13th Mar"

        this.default_colour = Colour.from_hex("#ab658b")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.BALANCED,
            TAGS.PROJECTILES,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            
        ];

        this.firing_offset = Vector2.zero;

        this.damage_base = 5;
        this.proj_damage_base = 10;
        this.speed_range = [100, 160];
        
        this.weapon_stats = [];

        this.spear_replenish_delay_max = 1.41 - (this.level * 0.004);
        this.spear_replenish_delay = this.spear_replenish_delay_max;

        this.spear_projectile_speed_range = [10000, 13000];

        this.throw_delay_range = [0.5 - (this.level * 0.002), 2 - (this.level * 0.008)];
    
        this.replenish_spear();
    }

    replenish_spear() {
        let times = 1;
        if (this.level >= AWAKEN_LEVEL) {
            times++;
        }

        for (let i=0; i<times; i++) {
            this.weapon_data.push(new BallWeapon(1, "spear", [
                {pos: new Vector2(108, 64), radius: 4},
                {pos: new Vector2(96, 64), radius: 8},
                {pos: new Vector2(80, 64), radius: 8},
                {pos: new Vector2(68, 64), radius: 4},
                {pos: new Vector2(60, 64), radius: 4},
                {pos: new Vector2(52, 64), radius: 4},
                {pos: new Vector2(44, 64), radius: 4},
                {pos: new Vector2(36, 64), radius: 4},
            ]));

            this.weapon_data[this.weapon_data.length-1].angle += random_float(0, deg2rad(360), this.board.random);

            this.weapon_data[this.weapon_data.length-1].offset = new Vector2(-32, -24);

            this.weapon_stats.push({
                speed: random_float(...this.speed_range, this.board.random),
                throw_delay: random_float(...this.throw_delay_range, this.board.random),
            });

            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        let remove_weapon_ids = [];
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.weapon_stats[i].speed * time_delta);

            this.weapon_stats[i].throw_delay -= time_delta;
            if (this.weapon_stats[i].throw_delay <= 0) {
                // throw
                remove_weapon_ids.push(i);

                let firing_offset = this.get_weapon_offset(i);
                let fire_pos = this.position.add(firing_offset);

                board.spawn_projectile(
                    new SpearProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base, 1,
                        new Vector2(1, 0).rotate(this.weapon_data[i].angle),
                        random_float(...this.spear_projectile_speed_range, this.board.random), this.velocity.mul(0)
                    ), fire_pos
                )
            }
        }

        remove_weapon_ids.forEach(i => {
            this.weapon_data.splice(i, 1);
            this.weapon_stats.splice(i, 1);

            // no need to recache, we're about to do that in the parent anyway
        });

        this.spear_replenish_delay -= time_delta;
        if (this.level >= AWAKEN_LEVEL) {
            if (this.weapon_data.length <= 0) {
                this.spear_replenish_delay = 0;
            }
        }
        
        if (this.spear_replenish_delay <= 0) {
            this.spear_replenish_delay = this.spear_replenish_delay_max;
            this.replenish_spear();
        }
    }

    hit_other(other, with_weapon_index) {
        this.replenish_spear();

        return super.hit_other(other, with_weapon_index, this.damage_base);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            this.replenish_spear();
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Throws an endless supply of spears.`
        )

        this.write_desc_line(
            `Spear melee damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Spear thrown damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Spears: ${this.weapon_data.length.toString().padEnd(2)} - instant replenish on hit`
        )
        
        let timeout = (this.spear_replenish_delay_max);
        let timeleft = (this.spear_replenish_delay);
        this.write_desc_line(
            `Time until next spear: ${timeleft.toFixed(1)}s / ${timeout.toFixed(1)}s`
        )
        let bar_l = 32;
        let prop = timeleft / timeout;
        let empties = Math.max(0, Math.min(bar_l, Math.ceil(prop * bar_l)));
        this.write_desc_line(
            `[${"#".repeat(bar_l - empties)}${" ".repeat(empties)}]`
        )

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Replenish a spear immediately if empty.`, true
            )
            this.write_desc_line(
                `Replenish two spears at once.`, true
            )
        }
    }
}

class RosaryBall extends WeaponBall {
    static ball_name = "Rosary";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Rosary";
        this.description_brief = "Has no functional weapon! Periodically releases a burst that heals allies. Summons random balls with reduced health to assist in battle. Summoned balls burn in holy fire if their master dies.";
        this.level_description = "Healing burst is more frequent. Summoned balls also gain level bonuses.";
        this.max_level_description = "Summoned balls also gain awakening bonuses. Ball summoning delay is halved.";
        this.quote = "For this victory I may thank only the Ball Above All. Praise be.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "In the name of his god, Rosary summons echoes of legendary warriors from the aetherplane, though his power comes at a price - he is utterly defenseless without his allies!";
        this.description = ""
        this.lore_description = "Ball scientists were, and are, unable to discern the complete nature of the aetherplane. Though balls claim to have pulled upon it for millenia, the only time it ever truly opened was the convergence, and the only being who ever left it was Rosary. Though forthcoming with information, Rosary finds it utterly impossible to explain, or even recall, the aetherplane's nature in a way that language can describe, and when trying, it becomes very difficult to separate fact from scripture. Dashing the hopes of would-be neo-planerangers, Rosary's portals have been proven to only work for him and his allies; indeed, for everyone but him, they are one way only."
        this.weapon_relationship = "All I can tell you for sure is that, between my missions, the Ball Above All holds me tight in aetherspace, swaddled in Their loving embrace. Please, stay with me after this. I would love to tell you more."
        this.lore_origin = "Aetherplane"
        this.lore_temperament = "Evangelical"
        this.lore_affiliation = "Aetherist Worldwide Communion"
        this.lore_alignment = "green"
        this.lore_birthday = "25th Dec"

        this.default_colour = Colour.from_hex("#e9b3b9")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.OFFENSIVE,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "rift_front";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "rosary", []),
            new BallWeapon(1, "rosary_halo", []),
        ];

        this.firing_offsets = [
            new Vector2(this.radius * 2, 0)
        ]

        this.speed_range = [40, 100];
        this.speed_base = random_float(...this.speed_range, this.board.random);

        this.healing_cooldown_max = 2.5 - ((this.level+1) * 0.01);
        this.healing_cooldown = this.healing_cooldown_max;
        this.healing_amount = 12;

        this.summon_cooldown_range = [8, 16];
        if (this.level >= AWAKEN_LEVEL) {
            this.summon_cooldown_range = [
                this.summon_cooldown_range[0] * 0.5,
                this.summon_cooldown_range[1] * 0.5
            ]
        }

        this.last_summon_cooldown = 1;
        this.summon_self_stun = 1;
        this.summon_cooldown = 1;
        this.summon_hp = 20;
        this.summon_particle_name = "entry_rift";
        this.summon_current_dur = 0;
        this.summon_particle = null;
        this.summon_particle_lastframe = -1;
        this.summoned_ball = null;
        this.summoned_rotation = 0;

        this.children = [];
    }

    late_setup() {
        this.weapon_data[0].angle = 0;

        super.late_setup();
    }

    weapon_step(board, time_delta) {
        this.weapon_data[0].angle = 0;
        this.rotate_weapon(1, time_delta * this.speed_base);

        this.healing_cooldown -= time_delta;
        if (this.healing_cooldown <= 0) {
            this.healing_cooldown += this.healing_cooldown_max;

            let proj = new RosaryHealingBurstProjectile(
                this.board, this, 0, this.position, 3
            );

            this.board.spawn_projectile(proj, this.position);
        }

        this.summon_cooldown -= time_delta;
        if (this.summon_cooldown <= 0) {
            this.summon_cooldown += random_float(...this.summon_cooldown_range, this.board.random);
            this.last_summon_cooldown = this.summon_cooldown;

            // let pos = this.position.add(this.get_weapon_offset(1).add(this.firing_offsets[0]).rotate(this.weapon_data[1].angle));
            let pos = this.position;
            let part_pos = this.position.sub(new Vector2(this.radius * 2.25, 0).rotate(this.weapon_data[1].angle));

            this.summoned_rotation = this.weapon_data[1].angle;

            let part = new Particle(
                part_pos, this.weapon_data[1].angle, 2.5 * 0.75,
                entity_sprites.get(this.summon_particle_name + "_back"),
                18, 100, false, null, true
            );

            let part2 = new Particle(
                part_pos, this.weapon_data[1].angle, 2.5 * 0.75,
                entity_sprites.get(this.summon_particle_name + "_front"),
                18, 100
            );

            part.time_locked = true;
            part2.time_locked = true;

            board.spawn_particle(part, part_pos);
            board.spawn_particle(part2, part_pos);

            this.summon_particle = part;

            // spawn ball (skip_physics and display=false)
            let proto = seeded_random_from_array(selectable_balls_for_random, this.board.random);
            let ball = new proto(
                this.board, this.mass * 0.5, this.radius * 0.75, this.colour,
                this.bounce_factor, this.friction_factor, this.player,
                this.level, this.board.random() < 0.5
            );

            this.summoned_ball = ball;
            this.summoned_ball.skip_physics = true;
            this.summoned_ball.display = false;
            this.summoned_ball.show_stats = false;

            this.summoned_ball.max_hp = this.summon_hp;
            this.summoned_ball.hp = this.summon_hp;

            this.children.push(this.summoned_ball);

            ball.set_velocity(new Vector2(8000, 0).rotate(
                this.summoned_rotation + (deg2rad(25) * random_float(-1, 1, this.board.random))
            ));

            this.board.spawn_ball(ball, pos);

            this.summon_current_dur = 0;

            this.speed_base = random_float(...this.speed_range, this.board.random);
        }

        if (this.summon_particle) {
            // actions based on the frame; same as entry. we can even base it on the keyframes
            if (this.summon_particle.cur_frame != this.summon_particle_lastframe) {
                // do actions
                this.summon_particle_lastframe = this.summon_particle.cur_frame;

                let keyframes = this.entry_animation_keyframes.filter(f => f.frame == this.summon_particle_lastframe);
                keyframes.forEach(frame => {
                    if (frame.snd) {
                        // play custom sound? maybe?
                        play_audio("db_flying", 0.075);
                    }

                    if (frame.display !== undefined) {
                        this.summoned_ball.display = true;
                    }

                    if (frame.pos_offset) {
                        this.summoned_ball.position = this.summoned_ball.position.add(frame.pos_offset.rotate(this.summoned_rotation));
                    }

                    if (frame.weaponsiz) {
                        this.summoned_ball.weapon_data.forEach(w => w.size_multiplier *= frame.weaponsiz);
                        this.summoned_ball.cache_weapon_offsets();
                        this.summoned_ball.cache_hitboxes_offsets();
                    }
                })
            }

            this.summon_current_dur += time_delta;
            if (this.summon_particle.cur_frame >= 9) {
                this.summoned_ball.skip_physics = false;
                this.summoned_ball.display = true;
                this.summon_particle = null;
            }
        }
    }

    die() {
        this.children.forEach(c => this.apply_burn(c, random_int(15, 50, this.board.random), null));
        return super.die();
    }

    hit_heal(ball) {
        ball.gain_hp(this.healing_amount, this, true);
    }

    hit_other_with_projectile(other, with_projectile) {
        if (with_projectile.source_weapon_index != 999) {
            return {hitstop: 0, mute: true}
        } else {
            return super.hit_other_with_projectile(other, with_projectile);
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Summons allies and periodically heals them.`
        )

        this.write_desc_line(
            `Healing: ${this.healing_amount}`
        )

        this.write_desc_line(
            `Healing cooldown: ${(this.healing_cooldown.toFixed(1) + "s").padEnd(5)} [${"#".repeat(Math.ceil((this.healing_cooldown / this.healing_cooldown_max) * 12)).padEnd(12)}]`
        )

        this.write_desc_line(
            `Summon cooldown: ${(this.summon_cooldown.toFixed(1) + "s").padEnd(5)}  [${"#".repeat(Math.ceil((this.summon_cooldown / this.last_summon_cooldown) * 12)).padEnd(12)}]`
        )

        this.write_desc_line(
            `Summon count: ${this.children.length}`
        )
    }
}

class FishingRodBall extends WeaponBall {
    static ball_name = "Fishing Rod";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Fishing Rod";
        this.description_brief = "Always rotates clockwise. Casts a fishing hook that bounces around and attaches to the first ball it hits, applying rupture. After attaching, reels in the hooked ball, applying more rupture and setting up a strike with a club. Hooks can be destroyed by attacks.";
        this.level_description = "Increases rupture intensity. Every 25 levels adds another hook cast at once.";
        this.max_level_description = "Hooks now create a small fire blast when they are destroyed.";
        this.quote = "I am alone. I am empty. And yet... I fish.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Fishing Rod would rather be anywhere else, his fights a small distraction from his real passion: extreme sport fishing. Despite this, he catches his opponents just as well as his fish, reeling them close and clubbing them senseless.";
        this.description = ""
        this.lore_description = "Fishing Rod is a once-in-a-generation talent by the least generous measure and once-in-a-millenium by any normal one. For most balls, tethering is an ordeal that can have days or even weeks of side effects, debilitating the host as conceptual flexing and pushing molds both entities into a shape where the two can coexist. Fishing Rod, though, simply did it one day while out fishing with his father. Not once, but tens of times, tethering once at a time to every tool in his tackle box, as if it was nothing, with so little struggle or fanfare that his father didn't even realise until they got back and found the fishing gear could no longer be removed. Some minds have speculated that Fishing Rod's incredible love of all things fishing may have caused this, but he spends so little time at the Arena outside of matches that verifying any theory has been a struggle."
        this.weapon_relationship = "Man, I just do this to pay the bills. Did you see my ballcarp I caught over on Remnath though?! Pretty sweet, right? Well. Yeah. Anyway, that's why. Bills."
        this.lore_origin = "Gulf-Peidmont Free States"
        this.lore_temperament = "Bored"
        this.lore_affiliation = "South Water Anglers' Club (and The Grand Arena)"
        this.lore_alignment = "neutral"
        this.lore_birthday = "11th Feb"

        this.default_colour = Colour.from_hex("#3bd8fc")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.RANGED,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.AILMENTS,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "teleport";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

        this.weapon_data = [
            new BallWeapon(1, "fishing_rod", [
                {pos: new Vector2(16, 72-16), radius: 12},
                {pos: new Vector2(16, 72), radius: 12},
            ]),
        ];

        this.firing_offsets = [
            new Vector2(64, 24)
        ]

        this.speed_base = 150;
        this.speed = this.speed_base;

        this.hook_hit_rupture = 1;
        this.hook_reel_rupture = 4;
        this.rod_base_dmg = 1;
        this.club_damage = 10;

        this.swing_cur_duration = 0;
        this.swing_max_duration = 0.3;

        this.swing_accel_amt = deg2rad(360 * 480);

        this.club_accel_amt = 360 * 16;
        this.club_accel_dur = 0.3;
        this.club_dur = 0.45;
        this.club_friction_amt = 360 * 6;

        this.shot_cooldown_max = 0.75;
        this.shot_cooldown = this.shot_cooldown_max;

        this.multishot = 1 + Math.floor((this.level + 1) / 25);
        this.spread = deg2rad(22.5);

        this.fire_blast_dmg = 0.5;

        this.clubs_info = [];

        this.children = [];
        
        this.rod_thrown_offset = new Vector2(96, -14);
    }

    reel_ball(own_hook, other) {
        // apply reverse knockback force to both
        // remove own_hook from children list
        this.children = this.children.filter(c => c.id != own_hook.id);

        if (other) {
            // rupture
            super.hit_other(other, 0, 0);
            this.apply_rupture(other, this.hook_reel_rupture);
            play_audio("impact");

            // explosive force
            let diff_vec = other.position.sub(this.position).normalize();

            let share = 0.75;

            let ball_diff_add = diff_vec.mul(-share);
            let other_diff_add = ball_diff_add.mul(-1);

            let ball_mag = -this.velocity.magnitude();
            let other_mag = -other.velocity.magnitude();

            if (ball_mag != 0) {
                let new_ball_velocity = this.velocity.div(ball_mag).mul(1 - share).add(ball_diff_add).normalize().mul(ball_mag)
                this.set_velocity(new_ball_velocity);
            }

            if (other_mag != 0) {
                let new_other_velocity = other.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)
                other.set_velocity(new_other_velocity);
            }

            // setup club
            let club_weapon = new BallWeapon(
                0, "fishing_rod_club", [
                    {pos: new Vector2(96, 64), radius: 14},
                    {pos: new Vector2(80, 64), radius: 13},
                    {pos: new Vector2(64, 64), radius: 12},
                    {pos: new Vector2(48, 64), radius: 11},
                    {pos: new Vector2(32, 64), radius: 9},
                    {pos: new Vector2(16, 64), radius: 8},
                ]
            )
            club_weapon.angle = diff_vec.angle() - (Math.PI * 1);

            this.clubs_info.push({
                weapon: club_weapon,
                lifetime: 0,
                speed: 0,
            });
            this.weapon_data.push(club_weapon);
            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();
        }

        if (this.level >= AWAKEN_LEVEL && !other) {
            let blast = new FishingRodFireBlast(
                this.board, this, 0, own_hook.position, 2.5, this.fire_blast_dmg
            );

            this.board.spawn_projectile(blast, own_hook.position);
        }
    }

    weapon_step(board, time_delta) {
        this.reversed = false;
        this.weapon_data.forEach(w => w.reversed = false);

        // rotate the weapon
        if (this.children.length > 0) {
            // hook out behaviour
            // set the angle of the fishing rod to the average of all the hook positions
            // note that the club is completely separate
            this.weapon_data[0].sprite = "fishing_rod_thrown";

            let dirs = this.children.map(c => c.position.sub(this.position).normalize());
            let avg_dir = dirs.reduce((p, c) => p.add(c), Vector2.zero).div(dirs.length);
            this.weapon_data[0].angle = avg_dir.angle() - deg2rad(45);
        } else {
            this.weapon_data[0].sprite = "fishing_rod";

            let shooting = false;
            if (this.swing_cur_duration >= 0) {
                this.swing_cur_duration -= time_delta;
                this.speed += this.swing_accel_amt * time_delta;
            } else {
                if (this.shot_cooldown < 0) {
                    this.shot_cooldown = this.shot_cooldown_max;
                    shooting = true;
                    this.speed = this.speed_base;
                } else {
                    this.shot_cooldown -= time_delta;
                    if (this.shot_cooldown < 0) {
                        this.swing_cur_duration = this.swing_max_duration;
                    }
                }
            }

            // normal
            this.rotate_weapon(0, this.speed * time_delta);

            if (shooting) {
                // schut
                let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
                let fire_pos = this.position.add(firing_offset);

                for (let i=0; i<this.multishot; i++) {
                    let shot_angle = this.weapon_data[0].angle + deg2rad(90) + random_float(
                        -this.spread, this.spread, this.board.random
                    );

                    let new_ball = new FishingRodHookProjectileBall(
                        this.board, this.mass * 0.1, this.radius * 0.15,
                        this.colour, this.bounce_factor, this.friction_factor,
                        this.player, this.level, this.hook_hit_rupture
                    )

                    new_ball.add_velocity(Vector2.from_angle(shot_angle, random_float(6000, 10000, this.board.random)));

                    new_ball.hp = 1;
                    new_ball.max_hp = 1;

                    new_ball.apply_invuln(BALL_INVULN_DURATION);
                    new_ball.show_stats = false;

                    new_ball.parent = this;
                    this.children.push(new_ball);

                    let part1 = new Particle(new_ball.position, 0, 1.5, entity_sprites.get("fishing_rod_hook"), 0, 999999);
                    board.spawn_particle(part1, new_ball.position);
                    new_ball.linked_particle = part1;

                    let part2 = new LineParticle(this.position, fire_pos, 0.1, Colour.white, 99999, 0, true);
                    board.spawn_particle(part2, this.position);
                    new_ball.linked_particle_2 = part2;

                    this.board.spawn_ball(new_ball, fire_pos);
                }
            }
        }

        // clubs:
        // rapidly grow to 1x size
        // accel until lifetime above threshold
        // rapidly shrink after total duration
        // are removed when size <= 0
        let recache = false;
        let remove_indexes = [];
        this.clubs_info.forEach((info, index) => {
            recache = true;

            if (info.lifetime < this.club_dur) {
                info.weapon.size_multiplier = Math.min(
                    1 * WEAPON_SIZE_MULTIPLIER,
                    info.weapon.size_multiplier + (10 * WEAPON_SIZE_MULTIPLIER * time_delta)
                )
            } else {
                info.weapon.size_multiplier -= (10 * WEAPON_SIZE_MULTIPLIER * time_delta)
            }

            if (info.weapon.size_multiplier <= 0) {
                remove_indexes.push(index);
            } else {
                if (info.lifetime < this.club_accel_dur) {
                    info.speed += this.club_accel_amt * time_delta;
                }

                info.speed = Math.max(0, info.speed - (this.club_friction_amt * time_delta));

                info.weapon.rotate(info.speed * time_delta);
            }

            info.lifetime += time_delta;
        });

        remove_indexes.forEach(idx => {
            this.clubs_info.splice(idx, 1);
            this.weapon_data.splice(idx+1, 1);
        });

        if (recache) {
            this.cache_weapon_offsets();
            this.cache_hitboxes_offsets();
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, with_weapon_index == 0 ? this.rod_base_dmg : this.club_damage);
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Rod base damage: ${this.rod_base_dmg.toFixed(2)}`
        )
        this.write_desc_line(
            `Club swing damage: ${this.club_damage.toFixed(2)}`
        )
        this.write_desc_line(
            `Hooks cast: ${this.multishot}x`
        )
        this.write_desc_line(
            `Hook rupture on hit: ${this.hook_hit_rupture.toFixed(2)}`
        )
        this.write_desc_line(
            `Hook rupture on reel: ${this.hook_reel_rupture.toFixed(2)}`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Destroyed hooks create a fireblast for ${this.fire_blast_dmg.toFixed(1)} burn.`, true, 10
            )
        }
    }
}

class FishingRodHookProjectileBall extends WeaponBall {
    static ball_name = "Fishing Rod Hook Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, damage_rupture) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Fishing Rod Hook Projectile";
        this.description_brief = "Fired from the fishing rod ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [
            new BallWeapon(1, "fishing_rod_hook", [
                {pos: new Vector2(64, 64), radius: 12},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-52.5, 0);

        this.pre_hit_lifetime = 0;
        this.pre_hit_duration = 8;

        this.post_hit_lifetime = 0;
        this.duration = 0.33;
        
        this.damage_rupture = damage_rupture;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.hit_ball = null;

        this.linked_particle = null;
        this.linked_particle_2 = null;

        this.display = false;
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);

        // TODO make it so it matches the angle between the hook and the fishing rod tip
        let origin_pos = this.parent.position.add(this.parent.rod_thrown_offset.mul(this.parent.weapon_data[0].size_multiplier).rotate(this.parent.weapon_data[0].angle))
        
        this.linked_particle.rotation_angle = this.position.sub(origin_pos).angle();

        this.linked_particle_2.position = origin_pos;

        let pos_adjusted = this.position.add(new Vector2(-64, 0).rotate(this.linked_particle.rotation_angle - deg2rad(90)))

        this.linked_particle_2.target_position = pos_adjusted;
    }

    weapon_step(board, time_delta) {
        if (this.hit_ball) {
            this.set_pos(this.hit_ball.position);
            this.post_hit_lifetime += time_delta;
            if (this.post_hit_lifetime >= this.duration) {
                this.hp = 0;
            }
        } else {
            this.pre_hit_lifetime += time_delta;
            if (this.pre_hit_lifetime >= this.pre_hit_duration) {
                this.hp = 0;
            }
        }

        if (this.parent.hp <= 0) {
            this.hit_ball = null;
            this.hp = 0;
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally poison
        let dmg = 0;

        let result = super.hit_other(other, with_weapon_index, dmg);
        this.parent.apply_rupture(other, this.damage_rupture);

        if (!(other instanceof Powerup)) {
            this.hit_ball = other;
            this.weapon_data = [];
            this.collision = false;
            this.takes_damage = false;
        } else {
            this.hp = 0;
        }

        return result;
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // this deliberately does not call its super
        // because we don't want these to count for tension
        
        this.hp = 0;

        other_ball.weapon_data[other_weapon_id]?.reverse()
    }

    parry_projectile(with_weapon_index, projectile) {
        // this deliberately does not call its super
        // because we don't want these to count for tension

        this.hp = 0;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;
        this.linked_particle_2.lifetime = Number.POSITIVE_INFINITY;

        this.parent.reel_ball(this, this.hit_ball);

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.35, entity_sprites.get("explosion_small"), 24, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class FryingPanBall extends WeaponBall {
    static ball_name = "Frying Pan";

    static AVAILABLE_SKINS = [
        "Golden",  // plaaosert (me)
    ];

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Frying Pan";
        this.description_brief = "Cooks up delicious delicacies that heal allies or self and burn enemies. The pan does a lot of damage on hit too!";
        this.level_description = "Reduces cooking time and increases the chance of making multiple foods at once.";
        this.max_level_description = "+1 base delicacy per toss. Delicacies bounce on hit, giving them a chance to hit again.";
        this.quote = "You disrupted my energy balance. I had to do this.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "A field provisioner turned restaurateur turned food scientist, Frying Pan doles out equal parts heal and harm to his customers, able to apply the powerful burn status effect.";
        this.description = ""
        this.lore_description = "Contrary to what one may believe at first glance, balls do indeed need to eat. Ball historians often consider the conceptual overwrite that caused this to have equal importance as the one that caused gravity, or, of course, deathlessness. When the ancient planar travellers brought the concept to a not-yet-unified Remnath, the idea spread like wildfire and almost wiped out the race as a whole. Since that point, food has become a self-reinforcing concept underpinning balls' existence, much like gravity and tethering. However, the eating process is indeed quite different. Frying Pan describes it as \"more conceptual than physical\", much like birth - where the form and intent of the food is paramount and the cooking process is more like painting than cooking (to loosely translate an idiom). At first a field provisioner in the war, Frying Pan felt himself empathising more and more with the humans who seemed to care so much about things like smell, looks and taste that he was practically happy to be stuck on our side when the seam closed. A strong campaigner for peace even before talks began, Frying Pan found friends in the culinary masters of our world, enrapturing them with ballkind's cooking methods and being enraptured in turn by his colleagues' myriad creations. After he officially became a citizen of our plane, he set about founding a restaurant based on a simple idea of cultural exchange: ball food for humans and human food for balls."
        this.weapon_relationship = "Cooking in combat is quite the rush! You must remind me to tell my friends about that fried stew dish that took out Axe last week!"
        this.lore_origin = "Convergence"
        this.lore_temperament = "Curious"
        this.lore_affiliation = "Taste of Remnath"
        this.lore_alignment = "green"
        this.lore_birthday = "2nd Jun"

        this.default_colour = Colour.from_hex("#6dda7a")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.BALANCED,
            TAGS.PROJECTILES,
            TAGS.AILMENTS,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        if (this.reversed) {
            this.weapon_data = [
                new BallWeapon(1, "frying_pan_r", [
                    {pos: new Vector2(44, 58), radius: 7},
                    {pos: new Vector2(56, 58), radius: 10},
                    {pos: new Vector2(68, 58), radius: 10},
                    {pos: new Vector2(80, 58), radius: 7},
                ])
            ];
        } else {
            this.weapon_data = [
                new BallWeapon(1, "frying_pan", [
                    {pos: new Vector2(44, 70), radius: 7},
                    {pos: new Vector2(56, 70), radius: 10},
                    {pos: new Vector2(68, 70), radius: 10},
                    {pos: new Vector2(80, 70), radius: 7},
                ])
            ];
        }

        this.custom_parry_sound = "frying_pan";
        this.custom_projectile_parry_sound = "frying_pan";
        this.parry_gain_mul = 0.04;

        this.pan_toss_time_max = [0.6, 0.8];
        this.pan_toss_time = random_float(...this.pan_toss_time_max, this.board.random);
        this.last_pan_toss_time = this.pan_toss_time;

        this.toss_projectile_delay_max = 0.04;
        this.toss_projectile_delay = 0;

        this.pan_toss_speed_modifier = deg2rad(300);

        this.pan_toss_projectile_speed = [5000, 10000];
        this.pan_toss_projectile_count_base = 1;
        this.pan_toss_projectile_count_inc_chance = 0.5 + (this.level * 0.0025);
        this.pan_toss_projectile_count_chance_reduction = 0.5 + (this.level * 0.001);

        this.predicted_projectiles = this.calculate_predicted_projectiles();

        this.speed_modifier_decay = deg2rad(360 * 3);
        this.speed_modifier = 0;

        this.damage_base = 5;
        this.speed_base = 100;

        this.proj_damage_base = 0.2;
        this.proj_heal_base = 3;

        this.sprite_suffix = ""

        this.projectile_bounces = 0;
        if (this.level >= AWAKEN_LEVEL) {
            this.pan_toss_projectile_count_base += 1;
            this.projectile_bounces += Number.POSITIVE_INFINITY;
        }

        this.possible_projectiles = balance_weighted_array([
            [1, PanAppleProjectile],
            [0.85, PanAvocadoProjectile],
            [1, PanBaconProjectile],
            [1, PanBananaProjectile],
            [0.3, PanBurgerProjectile],
            [1, PanCarrotProjectile],
            [0.9, PanCeleryProjectile],
            [0.4, PanCoconutProjectile],
            [0.9, PanCucumberProjectile],
            [0.1, PanDubiousDelicacyProjectile],
            [0.95, PanEggProjectile],
            [1, PanGoldfishProjectile],
            [0.1, PanLoafProjectile],
            [0.5, PanMeatProjectile],
            [0.5, PanMushroomProjectile],
            [0.6, PanPepperProjectile],
            [0.6, PanSoupProjectile],
            [0.5, PanSushiProjectile],
        ])
    }

    set_skin(skin_name) {
        super.set_skin(skin_name);

        switch (skin_name) {
            case "Golden": {
                this.sprite_suffix = "_golden"
                this.weapon_data[0].sprite += this.sprite_suffix;
                
                break;
            }
        }
    }

    calculate_predicted_projectiles() {
        let temp_random = get_seeded_randomiser(this.board.random_seed);

        let projs = 0;
        let cnt = 10000;
        for (let i=0; i<cnt; i++) {
            projs += this.get_projectiles_from_toss(temp_random);
        }

        return projs / cnt;
    }

    get_projectiles_from_toss(random_source) {
        let cnt = this.pan_toss_projectile_count_base;
        let chance = this.pan_toss_projectile_count_inc_chance;
        while (random_source() < chance) {
            cnt++;
            chance *= this.pan_toss_projectile_count_chance_reduction;
        }

        return cnt;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

        // speed modifier ignores weapon reverse, only cares about ball reverse
        this.weapon_data[0].angle += (this.speed_modifier * time_delta) * (this.reversed ? 1 : -1);

        this.speed_modifier = Math.max(0, this.speed_modifier - (this.speed_modifier_decay * time_delta));

        this.pan_toss_time = Math.max(0, this.pan_toss_time - time_delta);
        if (this.pan_toss_time <= 0) {
            if (this.toss_projectile_delay > 0) {
                this.toss_projectile_delay -= time_delta;

                if (this.toss_projectile_delay <= 0) {
                    this.pan_toss_time = random_float(...this.pan_toss_time_max, this.board.random);
                    this.last_pan_toss_time = this.pan_toss_time;

                    let projs = this.get_projectiles_from_toss(this.board.random);
                    for (let i=0; i<projs; i++) {
                        let hitbox_index = this.board.random() < 0.5 ? 1 : 2;
                        let pos = this.position.add(
                            this.get_weapon_offset(0)
                        ).add(
                            this.get_hitboxes_offsets(0)[hitbox_index]
                        ).add(
                            random_on_circle(
                                this.weapon_data[0].hitboxes[hitbox_index].radius * this.weapon_data[0].size_multiplier,
                                this.board.random
                            )
                        );

                        /** @type {typeof PanFoodProjectile} */
                        let proj_proto = weighted_seeded_random_from_arr(
                            this.possible_projectiles, this.board.random
                        )[1];

                        let angle = this.weapon_data[0].angle - (Math.PI * 0.5);
                        if (this.reversed) {
                            angle += Math.PI;
                        }

                        angle += deg2rad(random_float(-20, 20, this.board.random));

                        this.board.spawn_projectile(new proj_proto(
                            this.board, this, 0, pos,
                            this.proj_damage_base, this.proj_heal_base,
                            0.5, new Vector2(1, 0).rotate(angle),
                            random_float(...this.pan_toss_projectile_speed, this.board.random),
                            this.board.gravity, this.projectile_bounces,
                            Vector2.zero,
                            this.board.random() < 0.5
                        ), pos).sprite += this.sprite_suffix;
                    }
                }
            } else {
                this.toss_projectile_delay = this.toss_projectile_delay_max;
                this.speed_modifier = this.pan_toss_speed_modifier;
            }
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        super.parry_weapon(with_weapon_index, other_ball, other_weapon_id);
        
        this.custom_parry_sound = "frying_pan_parry";
        this.custom_parry_sound += random_int(0, 3, this.independent_random);
    }

    parry_projectile(with_weapon_index, projectile) {
        super.parry_projectile(with_weapon_index, projectile);
        
        this.custom_parry_sound = "frying_pan_parry";
        this.custom_parry_sound += random_int(0, 3, this.independent_random);
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = this.damage_base;

        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "frying_pan";
        result.snd += random_int(0, 4, this.independent_random);

        result.gain = 0.04;

        if (this.skin_name == "Golden") {
            other.special_hit_tag = ["golden", 0.5];
        }

        return result;
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            if (with_projectile instanceof PanFoodProjectile) {
                if (this.allied_with(other)) {
                    result.snd = "munch";
                }
            }

            if (this.skin_name == "Golden") {
                other.special_hit_tag = ["golden", 0.5];
            }
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Pan damage on hit: ${this.damage_base.toFixed(2)}`
        );

        this.write_desc_line(
            `Food burn on enemy: ${this.proj_damage_base.toFixed(2)}`
        );

        this.write_desc_line(
            `Food heal on ally:  ${this.proj_heal_base.toFixed(2)}`
        );

        this.write_desc_line(
            `Toss cooldown: ${this.pan_toss_time.toFixed(1)}s [${"#".repeat(Math.ceil((this.pan_toss_time / this.last_pan_toss_time) * 12)).padEnd(12)}]`
        );

        this.write_desc_line(
            `Average food count per toss: ${this.predicted_projectiles.toFixed(2)}`
        );

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Foods bounce on hit or parry.`, true
            )
        }
    }
}

class CardsBall extends WeaponBall {
    static ball_name = "Cards";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Cards";
        this.description_brief = "Draws random cards from a deck which rotate around as damaging projectiles. Hits with rotating cards speed up draws. Once five cards are drawn, evokes an effect based on the best poker hand in the set. Completing a Pair or Two Pair grants +1 luck permanently. Junk grants +2.";
        this.level_description = "Increases card draw and reshuffle speed. Every 25 levels allows another hand draw from the deck before shuffling.";
        this.max_level_description = "Starts with +8 luck.";
        this.quote = "...Is this your card? Well, I suppose it doesn't matter now.";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Permanently banned from every casino on every plane, Cards nonetheless chases the rush of gambling, pulling out wildly different effects in combat with each new hand.";
        this.description = ""
        this.lore_description = "Because of balls' unique conceptual porosity, they often take on very significant changes based on the environment in which they spent their childhood. For Cards, this meant lots and lots of gambling. So much, in fact, that the combined wishes of every being wishing for a windfall imbued Cards with an almost inexhaustible supply of fortune. Over time, he became more and more lucky - no matter what he did or where he did it, fate favoured him, and in a game of chance he simply could not lose. Unfortunately, Cards quite liked gambling, and being unable to lose took quite a lot of the fun out of it. Once he was banned by every casino ever created in past, present and future, he realised he needed to find something else to slake his thirst. The Grand Arena seemed a choice as good as any."
        this.weapon_relationship = "There's enough moving parts in a fight that I don't just instantly rip a royal flush like I normally do, which is good! Problem is, I think my luck is still increasing... soon I'll need to move on and find something even more variable."
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Lucky"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "19th Apr"

        this.default_colour = Colour.from_hex("#df5120")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.BALANCED,
            TAGS.PROJECTILES,
            TAGS.CHILDREN,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "deck", [])
        ];

        this.draw_delay_max = 1 - (this.level * 0.0035);
        this.draw_delay = this.draw_delay_max;

        this.shuffle_delay_max = 1.25 - (this.level * 0.0075);
        this.shuffle_delay = this.shuffle_delay_max;

        this.draws = 0;
        this.draws_max = 1 + Math.floor((this.level+1) / 25);

        this.handsize = 7;

        this.luck_lookahead_cnt = this.handsize;
        this.luck_lookahead_amt = 1;
        if (this.level >= AWAKEN_LEVEL) {
            this.luck_lookahead_amt += 8;
        }

        this.orbital_dmg = 1;
        this.orbital_cnt = this.handsize;

        this.orbital_offset_per_card = deg2rad(360 / this.orbital_cnt);
        this.orbital_speed = deg2rad(360 * 0.5);
        this.orbital_distance = this.radius * 2;

        this.cdr_on_hit = 0.1;

        this.deck_ordered = [];
        this.deck = [];

        this.setup_deck();
        this.reshuffle_deck();

        this.projs = [];
        this.hand = [];

        this.particle_sets = [];

        this.particle_delay_max = 0.2;
        this.particle_delay = this.particle_delay_max;

        this.cur_calced_hand = null;
        this.cur_calced_hand_string = "";
    
        this.cardsiz = 1 * 0.825;

        // begin huge stat block
        this.pair_proj_damage = 4;
        this.pair_proj_speed = 10000;
        this.pair_rank_speed_bonus = 500;

        this.twopair_proj_damage = 5;

        this.threekind_chain_lightning_chain_chance = 0.275;
        this.threekind_chain_lightning_damage = 5;
        this.threekind_chain_lightning_damage_rank_bonus = 0.2;
        this.threekind_chain_lightning_delay_per_chain = 0.015;
        this.threekind_chain_lightning_distance = 1000;
        this.threekind_chain_lightning_spread = deg2rad(45);
    
        this.straight_buff_dur = 8;

        this.flush_projs = 2;
        this.flush_proj_angle_start = deg2rad(-22.5);
        this.flush_proj_angle_end = deg2rad(22.5);
    
        this.fullhouse_proto = SordBall;
        this.fullhouse_hp = 25;
        this.fullhouse_hp_per_rank = 1;
        this.fullhouse_num = 5;

        this.fourkind_rock_dmg = 3;
        this.fourkind_rock_size = 3;

        this.straightflush_hits_cnt = 75;
        this.straightflush_hits_delay = 0.1;
        this.straightflush_hits_dmg = 1;
        this.straightflush_finisher_dmg = 20;
    }

    late_setup() {
        this.weapon_data[0].angle = !this.reversed ? 0 : Math.PI;

        super.late_setup();
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            if (with_projectile instanceof CardsCardOrbitalProjectile)
                this.draw_delay -= this.cdr_on_hit;

            if (with_projectile instanceof CardsStraightFlushStrikeProjectile)
                other.invuln_duration = 0;
        }

        return result;
    }

    setup_deck() {
        this.deck_ordered = new Array(52).fill(0).map((_, i) => i + 4);  // cardback1, cardback2, joker1, joker2, card1, ...
        /*
        if (this.level >= AWAKEN_LEVEL) {
            this.deck_ordered = this.deck_ordered.filter(c => {
                let rank = (c - 4) % 13;
                return !(rank == 2 || rank == 3);
            })
        }
        */
    }

    reshuffle_deck() {
        this.deck = random_shuffle(this.deck_ordered, this.board.random);
    }

    get_hand_string(hand=null) {
        let hand_objs = (hand ? hand : this.hand).map(c => {
            if (c == 2 || c == 3) {
                // joker (UNIMPLEMENTED)
                return {rank: "*", suit: "*"}
            } else {
                // h, c, d, s
                let suit = Math.floor((c - 4) / 13);
                let rank = (c - 4) % 13;

                return {rank: rank, suit: suit};
            }
        });

        let suit_names = ["h", "c", "d", "s"];
        let rank_names = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

        return hand_objs.map(c => `${rank_names[c.rank]}${suit_names[c.suit].toUpperCase()}`);
    }

    get_best_hand(hand=null) {
        if (!hand && this.hand.length <= 0) {
            return [0, "Junk", true, 0, []];
        }

        let hand_objs_unsorted = (hand ? hand : this.hand).map(c => {
            if (c == 2 || c == 3) {
                // joker (UNIMPLEMENTED)
                return {rank: "*", suit: "*"}
            } else {
                // h, c, d, s
                let suit = Math.floor((c - 4) / 13);
                let rank = (c - 4) % 13;

                if (rank == 0) {
                    rank = 13;
                }

                return {rank: rank, suit: suit};
            }
        });

        let hand_objs = [...hand_objs_unsorted].sort((a, b) => a.rank - b.rank);

        /** @type {[number, string, boolean, number, [number]]} */
        let hands = [
            // Value, Name, Satisfied, Card rank, Indexes
            [0, "Junk", true, 0, []],
            [1, "Pair", true, 0, []],
            [2, "Two Pair", true, 0, []], // eclipsable
            [3, "Three of a Kind", true, 0, []], // eclipsable
            [4, "Straight", true, 0, []],
            [5, "Flush", true, 0, []],
            [6, "Full House", true, 0, []], // eclipsable
            [7, "Four of a Kind", true, 0, []],
            [8, "Straight Flush", true, 0, []],
            [9, "Royal Flush", true, 0, []],
            [10, "Five of a Kind", true, 0, []],
            [11, "Flush House", true, 0, []],
            [12, "Flush Five", true, 0, []],
        ]
        // our saving grace is that we only look at 5 cards at a time
        // so we can make searching for flushes and straights a bit simpler

        // TODO -- if we have more than 5 cards in a hand,
        // get permutations of those cards and check each one separately
        // then get the best version

        let suit_counts = {};
        let rank_counts = {};
        // Rank, Count
        let highest_count = [null, 0];

        let rankmap = [
            new Set(),
            new Set(),
            new Set(),
            new Set(),
            new Set()
        ]

        for (let i=0; i<hand_objs.length; i++) {
            let card = hand_objs[i];
            let rank = card.rank;
            let suit = card.suit;

            rankmap[0].add(rank);
            rankmap[suit+1].add(rank);

            rank_counts[rank] = (rank_counts[rank] ?? 0) + 1;
            if (rank_counts[rank] > highest_count[1] || (rank_counts[rank] == highest_count[1] && rank > highest_count[0])) {
                highest_count = [rank, rank_counts[rank]];
            }

            suit_counts[suit] = (suit_counts[suit] ?? 0) + 1;
        }

        let straight = [];
        let straight_build = [];
        ([13,12,11,10,9,8,7,6,5,4,3,2,1,13]).forEach((rank,i) => {
            if (straight.length < 5) {
                if (rankmap[0].has(rank)) {
                    straight_build.push(rank);
                } else {
                    if (straight_build.length > straight.length) {
                        straight = straight_build
                    }
                    straight_build = [];
                }
            }
        })

        if (straight_build.length > straight.length) {
            straight = straight_build
        }

        let sflushes = {};
        let sflush_builds = {};

        [0,1,2,3].forEach(suit => {
            sflushes[suit] = [];
            sflush_builds[suit] = [];

            ([13,12,11,10,9,8,7,6,5,4,3,2,1,13]).forEach(rank => {
                if (sflushes[suit].length < 5) {
                    if (rankmap[suit+1].has(rank)) {
                        sflush_builds[suit].push(rank);
                    } else {
                        if (sflush_builds[suit].length > sflushes[suit].length) {
                            sflushes[suit] = sflush_builds[suit]
                        }
                        sflush_builds[suit] = [];
                    }
                }
            })

            if (sflush_builds[suit].length > sflushes[suit].length) {
                sflushes[suit] = sflush_builds[suit]
            }
        })

        let straight_adjusted = straight.filter((v,i,a) => a.indexOf(v) == i);
        let straight_capped = [...straight_adjusted].sort((a,b)=>b-a).slice(0, 5);
        
        let sflushes_capped = [0,1,2,3].map(s => {
            let adjusted = sflushes[s].filter((v,i,a) => a.indexOf(v) == i);
            let sorted = [...adjusted].sort((a,b)=>b-a).slice(0, 5);
            return sorted;
        });

        let melds = Object.keys(rank_counts).reduce(
            (p, ck) => {
                if (!p[rank_counts[ck]]) {
                    p[rank_counts[ck]] = [];
                }
                p[rank_counts[ck]].push(Number.parseInt(ck));
                p[rank_counts[ck]].sort((a,b) => b-a);
                return p
            }, {}
        )

        for (let i=1; i<this.handsize+1; i++) {
            if (!melds[i]) {
                melds[i] = [];
            }
        }

        let valid_flushes = Object.keys(suit_counts).filter(k => suit_counts[k] >= 5);
        let flush_capped = [];
        let flush_suit = null;
        if (valid_flushes.length > 0) {
            let flush_ranks = valid_flushes.map(suit => Math.max(...hand_objs.filter(h => h.suit == suit).map(h => h.rank)));
            flush_suit = Number.parseInt(valid_flushes[flush_ranks.indexOf(Math.max(...flush_ranks))]);
            let flush_cards = hand_objs.filter(h => h.suit == flush_suit);
            flush_capped = flush_cards.slice(flush_cards.length-5);
        }

        // pair
        hands[1][2] = melds[2].length >= 1;
        hands[1][4] = hand_objs_unsorted.map((c, i) => melds[2].slice(0, 1).includes(c.rank) ? i : -1).filter(v => v != -1);
        // hands[2][3] = Math.max(hands[1][4].map(idx => hand_objs_unsorted[idx].rank));

        // two pair
        hands[2][2] = melds[2].length >= 2;
        hands[2][4] = hand_objs_unsorted.map((c, i) => melds[2].slice(0, 2).includes(c.rank) ? i : -1).filter(v => v != -1);
        // hands[2][3] = Math.max(hands[2][4].map(idx => hand_objs_unsorted[idx].rank));

        // 3ok
        hands[3][2] = melds[3].length >= 1;
        // hands[3][3] = highest_count[0];
        hands[3][4] = hand_objs_unsorted.map((c, i) => melds[3].slice(0, 1).includes(c.rank) ? i : -1).filter(v => v != -1);

        // straight
        hands[4][2] = straight_capped.length >= 5;
        // hands[4][3] = Math.max(...straight);
        let added = new Set();
        hands[4][4] = hand_objs_unsorted.map((c, i) => {
            if (straight_capped.includes(c.rank)) {
                if (!added.has(c.rank)) {
                    added.add(c.rank);
                    return i;
                } else {
                    return -1;
                }
            }

            return -1;
        }).filter(v => v != -1);

        // flush
        hands[5][2] = flush_capped.length >= 5;
        // hands[5][3] = highest_count[0];
        let cnt = 0;
        hands[5][4] = hand_objs_unsorted.map((c, i) => {
            if (c.suit == flush_suit) {
                if (cnt < 5) {
                    cnt++;
                    return i;
                } else {
                    return -1;
                }
            }

            return -1;
        }).filter(v => v != -1);

        // full house
        hands[6][2] = melds[2]?.length >= 1 && melds[3]?.length >= 1;
        // hands[6][3] = highest_count[0];
        hands[6][4] = hand_objs_unsorted.map((c, i) => (melds[2].slice(0, 1).includes(c.rank) || melds[3].slice(0, 1).includes(c.rank)) ? i : -1).filter(v => v != -1);

        // 4ok
        hands[7][2] = melds[4]?.length >= 1;
        // hands[7][3] = highest_count[0];
        hands[7][4] = hand_objs_unsorted.map((c, i) => melds[4].slice(0, 1).includes(c.rank) ? i : -1).filter(v => v != -1);
        
        // straightflush
        // get the sflush with len>5 and highest max
        let sflush_v = [-999];
        let sflush_suit = 0;
        sflushes_capped.forEach((sflush,suit) => {
            if (!sflush_v) {
                sflush_v = sflush;
                sflush_suit = suit;
                return;
            }

            if (sflush.length >= 5 && sflush[0] > sflush_v[0]) {
                sflush_v = sflush;
                sflush_suit = suit;
                return;
            }
        })
        hands[8][2] = sflush_v.length >= 5;
        // hands[8][3] = Math.max(...straight);
        added = new Set();
        cnt = 0;
        hands[8][4] = hand_objs_unsorted.map((c, i) => {
            if (c.suit == sflush_suit && sflush_v.includes(c.rank)) {
                if (cnt < 5 && !added.has(c.rank)) {
                    cnt++;
                    added.add(c.rank);
                    return i;
                } else {
                    return -1;
                }
            }

            return -1;
        }).filter(v => v != -1);

        // royalflush. if straightflush is true, it will always be the same
        hands[9][2] = hands[8][2] && sflush_v[0] == 13 && sflush_v[1] == 12;
        // hands[9][3] = highest_count[0];
        hands[9][4] = hands[8][4];

        /*
        // 5ok
        hands[10][2] = melds[5]?.length >= 1;
        // hands[10][3] = highest_count[0];
        hands[10][4] = hand_objs_unsorted.map((c, i) => melds[5].slice(0, 1).includes(c.rank) ? i : -1).filter(v => v != -1);
        
        // flush house
        hands[11][2] = flush_capped.length >= 5 && melds[2]?.length >= 1 && melds[3]?.length >= 1;
        // hands[11][3] = highest_count[0];
        hands[11][4] = hand_objs_unsorted.map((c, i) => (straight.includes(c.rank) && flush_suit == c.suit && (rank_counts[c.rank] == 2 || rank_counts[c.rank] == 3)) ? i : -1).filter(v => v != -1);
    
        // flushfive
        hands[12][2] = melds[5]?.length >= 1 && flush_capped.length >= 5;
        // hands[12][3] = highest_count[0];
        hands[12][4] = hand_objs_unsorted.map((c, i) => melds[5].slice(0, 1).includes(c.rank) ? i : -1).filter(v => v != -1);
        */
        hands[10][2] = false;
        hands[11][2] = false;
        hands[12][2] = false;

        for (let i=0; i<hands.length; i++) {
            if (hands[i][2] && hands[i][4].length > 0) {
                hands[i][3] = Math.max(
                    ...hands[i][4].map(idx => hand_objs_unsorted[idx].rank)
                );
            }
        }
        
        let valid_hands = hands.filter(h => h[2]);
        let best_hand = valid_hands.reduce((p, c) => (!p || c[0] > p[0]) ? c : p, null);
        if (!best_hand) {
            best_hand = hands[0];
        }
        
        // if (hand_objs.length >= 5) {
        //     debugger;
        // }

        /*
        let suit_names = ["h", "c", "d", "s"];
        let rank_names = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
        console.log(hand_objs.map(c => `${rank_names[c.rank]}${suit_names[c.suit].toUpperCase()}`).join("\n"));
        console.log("");
        */
        // console.log(`${best_hand[1]}`);

        return best_hand;
    }

    make_lightnings() {
        let hand = structuredClone(this.cur_calced_hand);
        hand[4].forEach(idx => {
            let lightnings = [[this.projs[idx].position, this.projs[idx].position.sub(this.position).angle()]];

            let loops = 0;
            while (lightnings.length > 0) {
                let new_lightnings = [];
                lightnings.forEach(lgt => {
                    let pos = lgt[0];
                    let angle = lgt[1];

                    if (!board.in_bounds(pos)) {
                        return;
                    }

                    let repeats = 1;
                    if (random_float(0, 1, this.board.random) < this.threekind_chain_lightning_chain_chance) {
                        repeats = 2;
                    }

                    for (let i=0; i<repeats; i++) {
                        let new_angle = angle + (random_float(-1, 1, this.board.random) * this.threekind_chain_lightning_spread);

                        let direction = new Vector2(this.threekind_chain_lightning_distance, 0).rotate(new_angle);

                        let newpos = pos.add(direction);

                        // make a timer to create a hitscan projectile from pos to pos+direction
                        // then append the new lightning node
                        let timer = new Timer(() => {
                            let proj = new WandMagentaProjectile(
                                this.board,
                                this, 0, pos,
                                this.threekind_chain_lightning_damage + (this.threekind_chain_lightning_damage_rank_bonus * hand[3]),
                                newpos
                            );

                            board.spawn_projectile(proj, pos);
                        }, this.threekind_chain_lightning_delay_per_chain * loops);

                        board.set_timer(timer);

                        new_lightnings.push([newpos, new_angle]);
                    }
                })

                loops++;
                lightnings = new_lightnings;
            }
        })
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.weapon_data[0].angle = !this.reversed ? 0 : Math.PI;

        if (this.cur_calced_hand) {
            this.particle_delay -= time_delta;
            while (this.particle_delay <= 0) {
                this.particle_delay += this.particle_delay_max;

                this.cur_calced_hand[4].forEach(idx => {
                    let proj = this.projs[idx];
                    for (let i=0; i<1; i++) {
                        this.board.spawn_particle(new EnergyBurstParticle(
                            proj.position, 0.4, entity_sprites.get("railgun_point"), 0, 16, true,
                            random_float(15000, 25000, this.independent_random), 120000, this, new Colour(18, 175, 175, 255), 4, 1, 0, true
                        ), proj.position)
                    }
                });
            }
        }

        if (this.draws >= this.draws_max) {
            this.shuffle_delay -= time_delta;
            if (this.shuffle_delay <= 0) {
                this.shuffle_delay = this.shuffle_delay_max;
                this.reshuffle_deck();
                this.draws = 0;
            }
        } else {
            this.draw_delay -= time_delta;
            let max_draws = 2;
            while (this.draw_delay <= 0 && max_draws > 0) {
                max_draws++;

                if (this.projs.length >= this.handsize) {
                    this.draw_delay += this.draw_delay_max;
                    this.draws += 1;
                    // figure out hand and activate effect
                    
                    // shuffle always happens after this so play that now
                    this.board.set_timer(new Timer(b => play_audio("cardshuffle", 0.3), 0.4));

                    /** @type {[number, string, boolean, number, [number]]} */
                    let hand = this.cur_calced_hand;
                    if (hand[1] == "Junk") {
                        play_audio("evokefail", 0.25);
                    } else {
                        play_audio("evoke", 0.25);
                    }

                    // TODO sounds for all
                    switch (hand[1]) {
                        case "Junk":
                            break;

                        case "Pair": {
                            this.cur_calced_hand[4].forEach(idx => {
                                let proj = new CardsCardBouncingProjectile(
                                    this.board, this, 0, this.cardsiz, this.pair_proj_damage,
                                    0, this.projs[idx].position.sub(this.position).normalize(),
                                    this.pair_proj_speed + (this.pair_rank_speed_bonus * this.cur_calced_hand[3])
                                );

                                this.board.spawn_projectile(
                                    proj, this.projs[idx].position
                                );
                            })
                            break;
                        }

                        case "Two Pair": {
                            this.cur_calced_hand[4].forEach(idx => {
                                let proj = new CardsCardBouncingProjectile(
                                    this.board, this, 0, this.cardsiz, this.twopair_proj_damage,
                                    0, this.projs[idx].position.sub(this.position).normalize(),
                                    this.pair_proj_speed + (this.pair_rank_speed_bonus * this.cur_calced_hand[3])
                                );

                                this.board.spawn_projectile(
                                    proj, this.projs[idx].position
                                );
                            })
                            break;
                        }

                        case "Three of a Kind": {
                            this.make_lightnings();
                            break;
                        }

                        case "Straight": {
                            play_audio("EsperRoar", 0.2);

                            this.cur_calced_hand[4].forEach(idx => {
                                let proj = this.projs[idx];
                                for (let i=0; i<8; i++) {
                                    this.board.spawn_particle(new EnergyBurstParticle(
                                        proj.position, 0.4, entity_sprites.get("powerup_burst_pink"), 0, 16, true,
                                        random_float(20000, 30000, this.independent_random), 120000, this, new Colour(198, 27, 228, 255), 4, 1.25, 0, true
                                    ), proj.position)
                                }
                            });

                            this.temp_stat_modifiers.damage_bonus *= 2;
                            this.temp_stat_modifiers.defense_bonus *= 2;
                            this.temp_stat_modifiers.ailment_resistance *= 2;
                            this.temp_stat_modifiers.timespeed_mult *= 2;

                            let particles_angle_diff = deg2rad(22.5);
                            let dur = this.straight_buff_dur;
                            let num = 3;

                            for (let i=num-1; i>=0; i--) {
                                let pos = this.position;
                                let part = new OrbitingParticle(
                                    pos, 0, 2 * ((num-i)/num), entity_sprites.get("powerup_enhancement_star"),
                                    0, dur, false, this, Math.PI * 2, 1.5, particles_angle_diff * i
                                )

                                board.spawn_particle(part, pos);
                            }

                            board.set_timer(new Timer(b => {
                                // return stats to normal
                                this.temp_stat_modifiers.damage_bonus /= 2;
                                this.temp_stat_modifiers.defense_bonus /= 2;
                                this.temp_stat_modifiers.ailment_resistance /= 2;
                                this.temp_stat_modifiers.timespeed_mult /= 2;
                            }, dur))

                            break;
                        }

                        case "Flush": {
                            this.threekind_chain_lightning_chain_chance += 0.0;
                            this.make_lightnings();
                            this.threekind_chain_lightning_chain_chance -= 0.0;

                            this.cur_calced_hand[4].forEach(idx => {
                                for (let i=0; i<this.flush_projs; i++) {
                                    let angle = this.flush_proj_angle_start + (
                                        (i / (this.flush_projs-1)) * (this.flush_proj_angle_end - this.flush_proj_angle_start)
                                    );

                                    let proj = new CardsCardBouncingProjectile(
                                        this.board, this, 0, this.cardsiz, this.twopair_proj_damage,
                                        0, this.projs[idx].position.sub(this.position).normalize().rotate(angle),
                                        this.pair_proj_speed + (this.pair_rank_speed_bonus * this.cur_calced_hand[3])
                                    );

                                    this.board.spawn_projectile(
                                        proj, this.projs[idx].position
                                    );
                                }
                            })

                            break;
                        }

                        case "Full House":
                            // summon five sordballs
                            let n = this.fullhouse_num;
                            let proto = SordBall;
                            for (let i=0; i<n; i++) {
                                let proj = this.projs[i];
                                let new_ball = new proto(
                                    board, this.mass * 0.6, this.radius * 0.6, this.colour,
                                    this.bounce_factor, this.friction_factor, this.player, 0,
                                    i % 2 == 0
                                )

                                let pos = proj.position.add(new Vector2(1, 0).mul(this.radius * 2).rotate(deg2rad(360 * (i/n))));

                                board.spawn_particle(new Particle(
                                    pos, 0, 0.6, entity_sprites.get("explosion_small"),
                                    12, 3, false
                                ), pos);

                                new_ball.add_velocity(proj.position.sub(this.position).mul(-5));

                                new_ball.show_stats = false;
                                new_ball.die = () => {
                                    board.spawn_particle(new Particle(
                                        new_ball.position, 0, 0.6, entity_sprites.get("explosion_small"), 16, 3, false
                                    ), new_ball.position);

                                    return {skip_default_explosion: true};
                                }

                                new_ball.max_hp = this.fullhouse_hp + (this.fullhouse_hp_per_rank * this.cur_calced_hand[3]);
                                new_ball.hp = this.fullhouse_hp + (this.fullhouse_hp_per_rank * this.cur_calced_hand[3]);

                                new_ball.randomise_weapon_rotations();

                                new_ball.weapon_data[0].size_multiplier *= 0.75;
                                new_ball.cache_weapon_offsets();
                                new_ball.cache_hitboxes_offsets();

                                new_ball.set_skin(seeded_random_from_array(["Default", ...proto.AVAILABLE_SKINS], this.board.random))

                                board.spawn_ball(new_ball, pos);
                            }

                            break;

                        case "Four of a Kind":
                            play_audio("earthquake", 0.2);

                            [[2,4], [2,6], [3,5], [3,7]].forEach(times => {
                                this.board.set_timer(new Timer(b => {
                                    let pos = new Vector2(random_float(0, b.size.x, b.random), -1750);
                                    let proj = new RockPowerupProjectile(
                                        b, this, 999, pos, this.fourkind_rock_dmg,
                                        this.fourkind_rock_size,
                                        new Vector2(1, 0).rotate(deg2rad(random_float(-15, 15, b.random))), 0
                                    )

                                    b.spawn_projectile(proj, pos);
                                }, random_float(...times, this.board.random), true));
                            });

                            break;

                        case "Straight Flush":
                            this.board.achievements.straightflush = true;

                            this.takes_damage = false;
                            this.cur_calced_hand[4].forEach(idx => {
                                let proj = this.projs[idx];
                                for (let i=0; i<8; i++) {
                                    this.board.balls.forEach(ball => {
                                        // do nothing to allies
                                        if (ball.id != this.id && ball.allied_with(this))
                                            return;

                                        let burst = `powerup_burst_${ball.id == this.id ? "rock" : "red"}`;
                                        let col = ball.id == this.id ? new Colour(255, 255, 255, 255) : new Colour(228, 27, 37, 255);
                                        this.board.spawn_particle(new EnergyBurstParticle(
                                            proj.position, 0.4, entity_sprites.get(burst), 0, 16, true,
                                            random_float(20000, 30000, this.independent_random), 120000, ball, col,
                                            4, 1.25, 0, true
                                        ), proj.position)
                                    });
                                }
                            });

                            let times = 0;
                            let fn = (b => {
                                times++;
                                if (times <= this.straightflush_hits_cnt) {
                                    b.balls.forEach(ball => {
                                        ball.apply_hitstop(0.2);

                                        if (!ball.allied_with(this)) {
                                            ball.invuln_duration = 0;
                                            let dir = random_on_circle(1, b.random);
                                            let siz = random_float(2, 5, b.random);
                                            b.spawn_projectile(new CardsStraightFlushStrikeProjectile(
                                                b, this, 0, siz, this.straightflush_hits_dmg,
                                                entity_sprites.get("cards_straightflush_strike"),
                                                24, dir
                                            ), ball.position)
                                            
                                            b.spawn_particle(new Particle(
                                                ball.position, dir.angle(), siz, entity_sprites.get("cards_straightflush_strike"),
                                                24, 999, false
                                            ), ball.position)

                                            let burst = `powerup_burst_red`;
                                            let col = new Colour(228, 27, 37, 255);
                                            b.spawn_particle(new EnergyBurstParticle(
                                                this.position, 0.4, entity_sprites.get(burst), 0, 16, true,
                                                random_float(20000, 30000, this.independent_random), 120000, ball, col,
                                                4, 4, 0, true
                                            ), this.position)
                                        }
                                    })

                                    let new_delay = (1 - (times / this.straightflush_hits_cnt)) * this.straightflush_hits_delay;
                                    this.board.set_timer(new Timer(fn, new_delay));
                                } else {
                                    // do nothing
                                    this.takes_damage = true;
                                    b.balls.forEach(ball => {
                                        if (!ball.allied_with(this)) {
                                            ball.invuln_duration = 0;
                                            play_audio("explosion");
                                            let proj = new GrenadeExplosionProjectile(
                                                b, this, 0, ball.position, this.straightflush_finisher_dmg, 2
                                            );
                                            proj.can_hit_allied = false;
                                            proj.can_hit_source = false;

                                            b.spawn_projectile(proj, ball.position);
                                        }
                                    });
                                }
                            });

                            this.apply_hitstop(0.2);
                            this.board.set_timer(new Timer(fn, this.straightflush_hits_delay));
                            break;

                        case "Royal Flush":
                            this.board.achievements.royalflush = true;

                            this.takes_damage = false;
                            let this_team = this.player.id;
                            let cnt = 0;
                            stop_music();
                            play_audio("poweroff");
                            play_audio("static", 0.7);
                            this.board.set_timer(new Timer(board => {
                                board.balls.forEach(b => {
                                    b.apply_hitstop(0.1);
                                    if (b.player.id != this_team) {
                                        b.set_colour(b.colour.lerp(Colour.black, 0.04))
                                        b.set_velocity(new Vector2(0, -board.gravity.y * 0.1))
                                        b.hp -= random_int(0, 2, board.random) * b.max_hp * 0.01;
                                        if (cnt >= 200) {
                                            b.hp = 0;
                                        }
                                    }
                                })

                                if (cnt >= 500) {
                                    return false;
                                }

                                cnt++;

                                return true;
                            }, 0.03, true))
                            break;

                        case "Five of a Kind":
                            break;

                        case "Flush House":
                            break;

                        case "Flush Five":
                            break;
                    }

                    let luck_gain = 0;
                    if (hand[0] <= 0) {
                        luck_gain = 2;
                    } else if (hand[0] <= 2) {
                        luck_gain = 1;
                    }

                    this.luck_lookahead_amt += luck_gain;

                    // show text particle
                    let pos = this.position.sub(new Vector2(0, this.radius * 1.75));
                    this.board.spawn_particle(new FadingFollowingTextParticle(
                        pos, 1, `- ${hand[1]} -`, this.get_current_col(), this.board, 24, 2, this
                    ), pos);

                    let pos2 = pos.add(new Vector2(0, this.radius * 0.5));
                    this.board.spawn_particle(new FadingFollowingTextParticle(
                        pos2, 1, `Luck +${luck_gain}`, this.get_current_col(), this.board, 16, 2, this
                    ), pos2);

                    // for now just pop out funniy
                    this.projs.forEach((proj, index) => {
                        proj.active = false;
                        
                        this.board.spawn_particle(new Particle(
                            proj.position, 0, 0.5, entity_sprites.get("explosion_small"), 24, 3, false
                        ), proj.position);
                    });

                    this.projs = [];
                    this.hand = [];
                    this.particle_sets = [];
                    this.cur_calced_hand = null;
                    this.cur_calced_hand_string = "";
                } else {
                    this.draw_delay += this.draw_delay_max;

                    let card = null;
                    let lookahead = this.luck_lookahead_cnt;
                    let times = this.luck_lookahead_amt;
                    if (this.hand.length + lookahead == this.handsize) {
                        // console.log(`Doing lookahead: ${lookahead} x${times}`)
                        // try 3 times to pick a card, choose the one with the best hand
                        // Hand, DrawIndex
                        // console.log(`Looking ahead ${lookahead} x${times}`)
                        let best_hand = [[0, "Junk", true, 0, []], null];
                        for (let i=0; i<times; i++) {
                            // normal order on first check
                            let card_indexes = new Array(lookahead).fill(0).map((_, idx) => {
                                return this.deck.length-1-idx;
                            })

                            if (i != 0) {
                                card_indexes = [random_int(0, this.deck.length, this.board.random)];
                                for (let i=0; i<lookahead-1; i++) {
                                    let new_idx = card_indexes[0];
                                    while (card_indexes.some(idx => idx == new_idx)) {
                                        new_idx = random_int(0, this.deck.length, this.board.random);
                                    }

                                    card_indexes.push(new_idx);
                                }
                            }
                            
                            let cards = card_indexes.map(idx => this.deck[idx]);

                            let produced_hand = this.get_best_hand([...this.hand, ...cards]);
                            // console.log(cards);
                            // console.log(produced_hand[1]);
                            if (produced_hand[0] > best_hand[0][0] || (produced_hand[0] == best_hand[0][0] && produced_hand[3] >= best_hand[0][3])) {
                                best_hand = [produced_hand, card_indexes];
                            }
                        }

                        // then reshuffle the deck to have those cards on top
                        // remember to take from end first so we don't disrupt indexes
                        let indexes_sorted = best_hand[1].sort((a, b) => b-a);
                        let cards = indexes_sorted.map(idx => this.deck.splice(idx, 1));
                        
                        this.deck.push(...cards);
                    }
                    card = this.deck.pop();

                    let proj = new CardsCardOrbitalProjectile(
                        this.board, this, 0, this.cardsiz, this.orbital_dmg,
                        card, this.projs.length * this.orbital_offset_per_card,
                        this.orbital_speed, this.orbital_distance
                    );

                    if (this.projs[0]) {
                        proj.lifetime = this.projs[0].lifetime;
                    }

                    this.board.spawn_projectile(proj, this.position);
                    this.projs.push(proj);
                    this.hand.push(card);
                    this.particle_sets.push([]);

                    this.cur_calced_hand = this.get_best_hand();
                    this.cur_calced_hand_string = this.get_hand_string();

                    play_audio(`card${random_int(1, 8, this.board.random)}`);

                    /*
                    for (let i=0; i<this.projs.length; i++) {
                        if (this.cur_calced_hand[4].includes(i)) {
                            if (this.particle_sets[i].length != 2) {
                                this.particle_sets[i].forEach(part => part.duration = 0);
                                this.particle_sets[i] = [];
                            }

                            for (let t=0; t<2; t++) {
                                let part = new FollowParticle(
                                    this.projs[i].position, 0, this.cardsiz,
                                    entity_sprites.get("playingcard_glow"), 12,
                                    Number.POSITIVE_INFINITY, true, this.projs[i], t * 0.5
                                )

                                this.board.spawn_particle(part, this.projs[i].position);
                                this.particle_sets[i].push(part);
                            }
                        } else {
                            if (this.particle_sets[i].length == 2) {
                                this.particle_sets[i].forEach(part => part.duration = 0);
                                this.particle_sets[i] = [];
                            }
                        }
                    }
                    */
                }
            }
        }
    }

    render_reduced_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        if (this.cur_calced_hand) {
            this.write_desc_line(
                ``
            )

            for (let i=0; i<this.handsize; i++) {
                let x_offset = (0 * 6) + (6 * i * 4.5);
                let in_hand = this.cur_calced_hand[4].includes(i);
                this.write_desc_line(
                    `${in_hand ? "[" : " "}${(this.cur_calced_hand_string[i] ?? " ? ").padEnd(3)}${in_hand ? "]" : " "}`,
                    false, null, this.cur_calced_hand_string[i] ? (in_hand ? null : this.get_current_desc_col().lerp(Colour.black, 0.5).css()) : "#444", true, x_offset
                )
            }

            this.write_desc_line(
                `(${this.cur_calced_hand[1]}, ${this.cur_calced_hand[3]})`, false, null, this.cur_calced_hand[0] <= 0 ? "#666" : null
            )
        }
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Draws hands of cards for unique effects.`
        )

        this.write_desc_line(
            `Card damage: ${this.orbital_dmg.toFixed(2) * this.temp_stat_modifiers.damage_bonus}`
        )

        this.write_desc_line(
            `Luck: +${(this.luck_lookahead_amt-1).toFixed(0)}`
        )

        let state = "Drawing...";
        if (this.draws >= this.draws_max) {
            state = "Shuffling...";
        } else if (this.projs.length >= this.handsize) {
            state = "Evoking!"
        }
        this.write_desc_line(
            `State: ${state.padEnd(12)}`
        )

        let delay_c = null;
        let delay_m = null;
        if (this.draws >= this.draws_max) {
            delay_c = this.shuffle_delay;
            delay_m = this.shuffle_delay_max;
        } else {
            delay_c = this.draw_delay;
            delay_m = this.draw_delay_max;
        }

        delay_c = Math.max(0, Math.min(delay_m, delay_c));
        this.write_desc_line(
            `Delay: ${delay_c.toFixed(1)}s [${"#".repeat(Math.ceil((delay_c / delay_m) * 12)).padEnd(12)}]`
        )

        if (this.cur_calced_hand) {
            this.write_desc_line(
                ``
            )

            for (let i=0; i<this.handsize; i++) {
                let x_offset = (0 * 6) + (6 * i * 6);
                let in_hand = this.cur_calced_hand[4].includes(i);
                this.write_desc_line(
                    `${in_hand ? "[" : " "}${(this.cur_calced_hand_string[i] ?? " ? ").padEnd(3)}${in_hand ? "]" : " "}`,
                    false, null, this.cur_calced_hand_string[i] ? (in_hand ? null : this.get_current_desc_col().lerp(Colour.black, 0.5).css()) : "#444", true, x_offset
                )
            }

            this.write_desc_line(
                `(${this.cur_calced_hand[1]}, ${this.cur_calced_hand[3]})`, false, null, this.cur_calced_hand[0] <= 0 ? "#666" : null
            )
        }
    }
}

class TranslocatorBall extends WeaponBall {
    static ball_name = "Translocator";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Translocator";
        this.description_brief = "Throws a teleportation device, then teleports to it after a short delay, or when it takes damage. Teleporting into an enemy deals heavy damage. Able to dodge attacks on a cooldown, warping behind the attacker and throwing knives.";
        this.level_description = "Reduces the cooldowns of teleportation and dodging.";
        this.max_level_description = "Throws a fan of knives after teleporting.";
        this.quote = "i] ;fIfeel a lllit'le b@it   uhhhhhh  =2]wooozy/.,";

        this.pronoun = PRONOUN.SHE;
        this.tagline = "With a tool much stronger than the hollow shell of intelligence wielding it, Translocator rips through time and space to dodge attacks and keep her enemies guessing.";
        this.description = ""
        this.lore_description = "Translocator ripped through space long after the convergence, summarily wiping out in a crater after the collective conceptual tide of her much more modern bretheren turned on gravity and a half dozen other physical laws around her. Whether due to the translocation or some conceptual incompatibility with our plane, she has been incoherent since, unable to vocalise more than very basic sentences or indicate any real presence of memory. Her combat instincts seem to be the only truly intact part of her and, when fighting, her clarity seemed to increase, so in the interests of science she was inaugurated into the Grand Arena as a guest, before unprecedented ratings turned her into a full-time competitor."
        this.weapon_relationship = "ih,,. hl   hah-=a.. yehi9lh.        bal;l"
        this.lore_origin = "Unknown"
        this.lore_temperament = "Delirious"
        this.lore_affiliation = "The Grand Arena"
        this.lore_alignment = "red"
        this.lore_birthday = "Unknown"

        this.default_colour = Colour.from_hex("#8bdee5")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.OFFENSIVE,
            TAGS.PROJECTILES,
            TAGS.AOE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.entry_animation = "translocator";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;
        this.entry_animation_size_mult = ANIMATION_STANDARD_DATA[this.entry_animation].size_mult;

        this.translocator_weapon = new BallWeapon(1, "translocator_weapon", [
            
        ])  

        this.weapon_data = [
            this.translocator_weapon
        ];

        this.translocator_offset = new Vector2(44, 0);

        this.damage_base = 1;
        this.speed_base = 160;
        
        this.teleport_throw_cooldown_max = 1.4 - (this.level * 0.004);
        this.teleport_throw_cooldown = this.teleport_throw_cooldown_max;
        
        this.teleport_delay_max = 0.75;
        this.teleport_delay = this.teleport_delay_max;

        this.translocator_obj = null;
        this.translocator_velocity = 7000;

        this.dodge_cooldown_max = 10 - (this.level * 0.015);
        this.dodge_cooldown = 0;

        this.telefrag_damage = 7;

        this.knife_damage = 1;
        this.knife_count = 8;
        this.knife_delay_count = 6;
        this.knife_spread = deg2rad(30);
        this.knife_delay = 0.05;
        this.knife_velocity_range = [10000, 17000];

        this.awaken_knife_count = 24;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.dodge_cooldown -= time_delta;

        if (this.weapon_data.length > 0) {
            // either knives or translocator
            if (this.weapon_data[0].sprite == "translocator_weapon") {
                this.rotate_weapon(0, this.speed_base * time_delta);

                this.teleport_throw_cooldown -= time_delta;
                if (this.teleport_throw_cooldown <= 0) {
                    this.teleport_throw_cooldown = this.teleport_throw_cooldown_max;

                    this.throw_translocator();

                    this.weapon_data.shift();
                    this.cache_weapon_offsets();
                    this.cache_hitboxes_offsets();
                }
            }
        } else {
            // translocator thrown
            // handled in child
        }
    }

    execute_teleport(to_position) {
        // make self vanish, set timer to reappear
        this.display = false;
        this.skip_physics = true;

        for (let i=0; i<10; i++) {
            this.board.spawn_particle(new EnergyBurstParticle(
                this.position, 0.4, entity_sprites.get("railgun_point"), 0, 16, true,
                random_float(15000, 25000, this.independent_random), 180000, {
                    position: to_position.copy(),
                    radius: this.radius * 0.5,
                    board: this.board,
                },
                new Colour(18, 175, 175, 255), 4, 3, 0, true
            ), this.position)
        }
        
        this.board.spawn_projectile(new TranslocatorExitProjectile(
            this.board, this, 0, this.position, 3, this.telefrag_damage
        ), this.position);

        // this.board.spawn_particle(new Particle(
        //     this.position, random_int(0, 4) * Math.PI * 0.5,
        //     3, entity_sprites.get("teleport_exit"), 20, 10
        // ), this.position)

        let vel = this.position.sub(to_position).normalize().mul(-10000);
        this.set_pos(to_position);

        this.board.spawn_projectile(new TranslocatorEntryProjectile(
            this.board, this, 0, this.position, 3, this.telefrag_damage
        ), this.position);

        let ball = this;
        this.board.set_timer(new Timer(b => {
            ball.display = true;
            ball.skip_physics = false;
            ball.set_velocity(vel);
            ball.apply_hitstop(0.15)

            if (ball.level >= AWAKEN_LEVEL) {
                let cnt = 0;
                let cnt_max = ball.awaken_knife_count;
                let delay = 0;
                let delay_max = 12;
                let knife_delay = 0.01;
                b.set_timer(new Timer(b2 => {
                    delay++;
                    if (delay < delay_max) {
                        return true;
                    }

                    cnt++;
                    if (cnt < cnt_max) {
                        let target_vector = random_on_circle(1, b.random);

                        b.spawn_projectile(new TranslocatorKnifeProjectile(
                            b, ball, 0, ball.position, ball.knife_damage,
                            0.75, target_vector, random_float(...ball.knife_velocity_range, b.random),
                            Vector2.zero
                        ), ball.position)
                        
                        return true;
                    }

                    return false;
                }, knife_delay, true));
            }
        }, 0.175))
    }

    go_teleport() {
        // get weapon back
        this.weapon_data.push(
            this.translocator_weapon
        )

        this.cache_weapon_offsets();
        this.cache_hitboxes_offsets();

        this.execute_teleport(this.translocator_obj.position);
        this.translocator_obj = null;

        this.apply_invuln(BALL_INVULN_DURATION);
        play_audio("translocator2", 0.275);
    }

    throw_translocator() {
        let position = this.position.add(
            this.translocator_offset.mul(this.weapon_data[0].size_multiplier).rotate(
                this.weapon_data[0].angle
            )
        );

        let velocity = new Vector2(this.translocator_velocity * random_float(0.5, 2, this.board.random), 0).rotate(this.weapon_data[0].angle)
        let new_ball = new TranslocatorTranslocatorBall(
            this.board,
            this.mass * 0.1, this.radius * 0.35, this.colour,
            this.bounce_factor, this.friction_factor,
            this.player, this.level, this.teleport_delay_max
        )

        new_ball.apply_invuln(BALL_INVULN_DURATION);
        new_ball.set_velocity(velocity.add(this.velocity));
        new_ball.parent = this;

        let part = new Particle(position, this.weapon_data[0].angle, 1, entity_sprites.get("translocator"), 0, 999999);
        board.spawn_particle(part, position);
        new_ball.linked_particle = part;
        
        board.spawn_ball(new_ball, position);
    
        this.translocator_obj = new_ball;
    }

    check_dodge(other) {
        if (this.dodge_cooldown <= 0) {
            play_audio("translocator_dodge", 0.5);

            this.dodge_cooldown = this.dodge_cooldown_max;

            // let direction_angle = other.position.angle(this.position);
            // let teleport_pos = null;
            let tries = 10;
            let best = [this.position, 0, 0];
            for (let i=0; i<tries; i++) {
                let direction_angle = random_float(0, Math.PI * 2, this.board.random);
                let teleport_pos = other.position.add(new Vector2(other.radius * 3, 0).rotate(direction_angle));
                if (this.board.in_bounds_with_radius(teleport_pos, this.radius)) {
                    let dist = teleport_pos.sqr_distance(this.position)
                    if (dist > best[2] || i >= tries-1) {
                        best = [teleport_pos, direction_angle, dist];
                    }
                }
            }

            let direction_angle = best[1];
            let teleport_pos = best[0];

            let mov_direction = new Vector2(0, 9000).rotate(this.position.angle(other.position));
            let times = 4;
            for (let i=0; i<times; i++) {
                let afterimages = 4;
                let afterimage_delay = 0.04;
                let afterimage_opacity = 0.1;
                for (let j=0; j<afterimages; j++) {
                    let d = mov_direction.rotate(deg2rad((360 / times) * i));
                    let opacity = j==0 ? 1 : 0.4 - (afterimage_opacity * j);
                    this.board.spawn_particle(new MovingFrictionSqrFadingBallParticle(
                        this.position, 0.4, this.colour, this.radius, opacity, this.aero_canvases, d, 26000, afterimage_delay * j
                    ), this.position)
                }
            }
            this.execute_teleport(teleport_pos);

            other.apply_hitstop(BASE_HITSTOP_TIME * 3);

            // if there's a translocator, reduce its lifetime by 0.5s so the teleports dont look silly
            if (this.translocator_obj) {
                this.translocator_obj.lifetime -= 0.5;
            }

            let cnt = 0;
            let delay = 0;
            let ball = this;
            this.board.set_timer(new Timer(b => {
                delay++;
                if (delay < ball.knife_delay_count) {
                    return true;
                }

                cnt++;
                if (cnt < ball.knife_count) {
                    let target_vector = other.position.sub(ball.position).normalize();
                    target_vector = target_vector.rotate(
                        random_float(-ball.knife_spread, ball.knife_spread, b.random)
                    );

                    b.spawn_projectile(new TranslocatorKnifeProjectile(
                        b, ball, 0, ball.position, ball.knife_damage,
                        0.75, target_vector, random_float(...ball.knife_velocity_range, b.random),
                        Vector2.zero
                    ), ball.position)
                    
                    return true;
                }

                return false;
            }, this.knife_delay, true));

            return false;
        }

        return true;
    }
    
    try_get_hit(other) {
        return this.check_dodge(other);
    }

    try_get_hit_by_projectile(projectile) {
        return this.check_dodge(projectile.source);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Throws a teleporter and dodges attacks.`
        )

        this.write_desc_line(
            `Teleport damage: ${this.telefrag_damage.toFixed(2)}`
        )
        this.write_desc_line(
            `Throw cooldown: ${this.teleport_throw_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.teleport_throw_cooldown / this.teleport_throw_cooldown_max) * 12)).padEnd(12)}]`
        )
        this.write_desc_line(
            `Knives thrown on dodge: ${this.knife_count}x${this.knife_damage}dmg`
        )
        let dodgecd = Math.max(this.dodge_cooldown, 0);
        if (dodgecd <= 0) {
            this.write_desc_line(
                `Dodge: - ready -`
            )
        } else {
            this.write_desc_line(
                `Dodge: cooldown ${this.dodge_cooldown.toFixed(1)}s [${"#".repeat(Math.ceil((this.dodge_cooldown / this.dodge_cooldown_max) * 12)).padEnd(12)}]`
            )
        }

        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Knives thrown on teleport: ${this.awaken_knife_count}x${this.knife_damage}dmg`, true
            )
        }
    }
}

class TranslocatorTranslocatorBall extends WeaponBall {
    static ball_name = "Translocator Translocator Projectile";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, duration) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, false);

        this.name = "Translocator Translocator Projectile";
        this.description_brief = "Fired from the translocator ball";
        this.level_description = "-";
        this.max_level_description = "-";

        this.tags = [];

        this.weapon_data = [];

        this.lifetime = 0;
        this.duration = duration;

        this.hp = 1;
        this.max_hp = 1;
        this.show_stats = false;

        this.parent = null;

        this.linked_particle = null;

        this.display = false;

        this.rotation_speed = random_float(480, 720, this.independent_random);
    }

    update_particles(time_delta) {
        super.update_particles(time_delta);

        this.linked_particle.set_pos(this.position);
        this.linked_particle.rotation_angle += this.rotation_speed * (time_delta * (Math.PI / 180))
    }

    weapon_step(board, time_delta) {
        this.lifetime += time_delta;
        if (this.lifetime >= this.duration) {
            this.hp = 0;
        }
    }

    parry_weapon(with_weapon_index, other_ball, other_weapon_id) {
        // this deliberately does not call its super
        // because we don't want these to count for tension
        
        this.hp -= 1;

        other_ball.weapon_data[other_weapon_id]?.reverse()
    }

    parry_projectile(with_weapon_index, projectile) {
        // this deliberately does not call its super
        // because we don't want these to count for tension

        this.hp -= 1;
    }

    die() {
        this.linked_particle.lifetime = Number.POSITIVE_INFINITY;

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.35, entity_sprites.get("explosion_small"), 24, 3, false
        ), this.position);

        // TODO sound

        this.parent.go_teleport();

        return {skip_default_explosion: true};
    }
}

class DrillBall extends WeaponBall {
    static ball_name = "Drill";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Drill";
        this.description_brief = "Perodically dashes with the drill, making it do rapid damage based on movement speed. If impacting a wall at high speed, burrows into it for a time, avoiding all attacks, before dashing out for boosted speed and damage.";
        this.level_description = "Increases the damage of the drill while dashing and reduces dash cooldown slightly.";
        this.max_level_description = "Burrowing has no cooldown but lasts for half the time.";
        this.quote = "If there's a wall in my way, I'll smash it down!\nIf there's no path forward, I'll carve one myself!!\nJust who the hell do you think I am?!";

        this.pronoun = PRONOUN.HE;
        this.tagline = "With a great appreciation of ancient East Asian animation series and a frankly enormous weapon, Drill wants to prove that the old ways of determination and friendship work just as well in the modern age.";
        this.description = ""
        this.lore_description = "Aside from archaeology labs and collector-hoarders, Drill might be one of the few people left in the world that still owns a disc player. Even fewer would be the count of those who own a collection of ancient TV series from East Asia on the original media, but Drill is one of them. Originally from his grandfather, his collection of 'anmay' was all he cared about watching - not ecasts or streams, nothing. As he grew to espouse the ancient values represented inside those disks, he collected more and more of the relics, eventually becoming the owner of the biggest collection in the world. Though most are a little boring by today's standards, some of Drill's friends - especially Axe - seem to like them."
        this.weapon_relationship = "It's kind of awesome having all these things to quote and nobody even knows what you're quoting. Believe it!"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Genki"
        this.lore_affiliation = "Remnath Anmay Appreciation Group"
        this.lore_alignment = "red"
        this.lore_birthday = "15th Jul"

        this.default_colour = Colour.from_hex("#8d6136")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.MELEE,
            TAGS.OFFENSIVE,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(0.6, "drill", [
                {pos: new Vector2(108, 66), radius: 4},
                {pos: new Vector2(92, 66), radius: 10},
                {pos: new Vector2(72, 65), radius: 16},
                {pos: new Vector2(48, 64), radius: 24},
                {pos: new Vector2(32, 64), radius: 24},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-16, 0);

        this.damage_base = 0;
        this.damage_per_speed = 0.00009 + (0.0000004 * this.level);
        this.damage = this.damage_base;
        this.temp_dmg_mult = 1;

        this.non_rapidfire_damage = 3;

        this.speed_base = 100;

        this.dash_cooldown_max = 2.1 - (0.003 * this.level);
        this.dash_cooldown = this.dash_cooldown_max;
        this.dash_velocity = 18000;
        
        this.dash_previous_velocity = 0;
        this.dash_duration_max = 0.7;
        this.dash_duration = 0;

        this.deceleration_time = 0;
        this.deceleration_power = 2;

        this.burrow_duration_max = [1.6, 2.4];
        this.burrow_last_duration = 0;
        this.burrow_duration = 0;
        this.burrow_side = 0;
        this.burrow_position = 0;
        this.burrow_movespeed = 0;
        this.burrow_accel = 10000;
        this.burrow_decel = 11000;
        this.burrow_switch_threshold = 0.5;
        this.burrow_emerge_velocity = 30000;
        this.burrow_decel_to = 4000;

        this.burrow_cooldown_max = 4;
        if (this.level >= AWAKEN_LEVEL) {
            this.burrow_cooldown_max = 0;
            this.burrow_duration_max = this.burrow_duration_max.map(t => t/2);
        }

        this.burrow_cooldown = this.burrow_cooldown_max;

        this.burrow_rocks_cooldown = 0;

        this.rapidfire_time = 0;
        this.rapidfire_animation_frame = 0;
        this.rapidfire_animation_speed = 12;

        this.rapidfire_sparks_freq = [0.01, 0.04];
        this.rapidfire_sparks_cooldown = 0;
        this.rapidfire_sparks_num = [0, 3];

        this.burrow_vectors = [
            new Vector2(1, 0),
            new Vector2(0, 1),
            new Vector2(-1, 0),
            new Vector2(0, -1)
        ];

        this.linked_particle = null;

        this.sound_source = null;
    }

    sparks_animation() {
        let num = random_int(...this.rapidfire_sparks_num, this.independent_random);
        for (let i=0; i<num; i++) {
            let pos = this.position.add(
                this.get_weapon_offset(0)
            ).add(
                seeded_random_from_array(
                    this.get_hitboxes_offsets(0),
                    this.independent_random
                )
            );

            // direction should be up or to the side
            // pick two numbers, choose the lowest,
            // rotate by +-1x
            let rot_angle = deg2rad(Math.min(
                random_float(0, 100, this.independent_random),
                random_float(0, 100, this.independent_random)
            )) * (this.independent_random() > 0.5 ? -1 : 1);

            let vec = new Vector2(
                random_float(4000, 12000, this.independent_random), 0
            ).rotate(this.weapon_data[0].angle + rot_angle).add(this.velocity.mul(0.5));

            this.board.spawn_particle(
                new MovingFrictionGravityTrailParticle(
                    pos, 0, random_float(0.1, 0.3, this.independent_random),
                    entity_sprites.get("powerup_burst_gold"), 0,
                    random_float(0.2, 0.4, this.independent_random), true,
                    vec, 18000, new Colour(255, 242, 0, 255), 0.2, this.board,
                    this.board.gravity.mul(3)
                ),
                pos
            )
        }
    }

    burrow_rocks() {
        let n = random_int(1, 4, this.independent_random);
        for (let i=0; i<n; i++) {
            this.board.spawn_particle(
                new DrillRockParticle(
                    this.position, random_float(0, Math.PI * 2, this.independent_random),
                    random_float(0.8, 1.2, this.independent_random),
                    [entity_sprites.get("drill_rock")[Math.min(
                        random_int(0, 6, this.independent_random),
                        random_int(0, 6, this.independent_random)
                    )]], 0, 6, true, random_on_circle(2000, this.independent_random).add(
                        this.burrow_vectors[this.burrow_side].mul(-2000)
                    ),
                    this.board, this.board.gravity
                ),
                this.position
            )
        }
    }

    weapon_step(board, time_delta) {
        // check if a point in front of the ball is OOB - if it is, get your ass burrowing
        this.rapidfire_time -= time_delta;
        if (this.rapidfire_time > 0) {
            this.weapon_data[0].sprite = `drilldash${Math.floor(this.rapidfire_animation_frame % 3) + 1}`;
            this.rapidfire_animation_frame += this.board.duration * this.rapidfire_animation_speed;
        
            // sparks animation
            this.rapidfire_sparks_cooldown -= time_delta;
            while (this.rapidfire_sparks_cooldown <= 0) {
                this.sparks_animation();
                this.rapidfire_sparks_cooldown += random_float(...this.rapidfire_sparks_freq, this.independent_random);
            }
        } else {
            this.weapon_data[0].sprite = "drill";
            this.temp_dmg_mult = 1;
        }

        if (this.burrow_duration <= 0 && this.burrow_cooldown <= 0 && this.velocity.sqr_magnitude() > Math.pow(8000, 2)) {            
            let check_pos = this.position.add(this.get_weapon_offset(0).mul(0.9));
            // this.board.spawn_particle(new Particle(check_pos, 0, 0.4, entity_sprites.get("red"), 36, 1, true), check_pos);

            if (!this.board.in_bounds(check_pos)) {
                this.burrow_cooldown = this.burrow_cooldown_max;

                // need to figure out which part is OOB
                let orient = 0;
                let pos = this.position.y;
                if (check_pos.y >= this.board.size.y) {
                    orient = 1;
                    pos = this.board.size.x - this.position.x;
                } else if (check_pos.x < 0) {
                    orient = 2;
                    pos = this.board.size.y - this.position.y;
                } else if (check_pos.y < 0) {
                    orient = 3;
                    pos = this.position.x;
                }

                // then just set up the variables and hide the ball
                this.burrow_duration = random_float(...this.burrow_duration_max, this.board.random);
                this.burrow_last_duration = this.burrow_duration;
                this.burrow_side = orient;
                this.burrow_position = pos;
                this.rapidfire_time = 0;

                this.collision = false;
                this.ignore_bounds_checking = true;

                let sprites = [
                    ...entity_sprites.get("drill_mound_form")
                ]
                for (let i=0; i<25; i++) {
                    sprites.push(...entity_sprites.get("drill_mound"));
                }

                for (let i=0; i<5; i++) {
                    let t = i;
                    this.board.set_timer(new Timer(b => {
                        for (let j=0; j<3; j++) {
                            this.burrow_rocks();
                        }

                        this.opacity = 0.8 - (0.2 * t);
                    }, 0.1 * i))
                }

                this.linked_particle = new Particle(
                    this.position, deg2rad(-90 + (90 * this.burrow_side)),
                    1.75, sprites, 12, 999, true
                );

                play_audio("drill_burrow", 0.15);

                play_audio("earthquake2", 0.4).then(v => this.sound_source = v?.obj?.source);

                board.spawn_particle(this.linked_particle, this.position);
            }
        }

        if (this.burrow_duration <= 0) {
            this.burrow_cooldown -= time_delta;

            if (this.dash_duration <= 0) {
                // normal behaviour
                this.rotate_weapon(0, this.speed_base * time_delta);
                if (this.deceleration_time > 0) {
                    this.deceleration_time -= time_delta;
                    if (this.velocity.sqr_magnitude() > this.dash_previous_velocity) {
                        this.set_velocity(
                            this.velocity.sub(this.velocity.mul(this.deceleration_power * time_delta))
                        )
                    }
                }

                this.dash_cooldown -= time_delta;
                if (this.dash_cooldown <= 0) {
                    this.dash_cooldown = this.dash_cooldown_max;

                    this.dash_duration = this.dash_duration_max;
                    this.rapidfire_time = this.dash_duration_max + 0.25;
                    this.dash_previous_velocity = this.velocity.sqr_magnitude();
                    this.deceleration_time = 0.5;

                    play_audio("drill_dash", 0.15);
                }
            } else {
                this.dash_duration -= time_delta;
                let factor = Math.min(1, Math.max(0, (this.dash_duration_max - this.dash_duration) * 4));
                this.set_velocity(
                    new Vector2(this.dash_velocity * factor, 0).rotate(
                        this.weapon_data[0].angle
                    )
                );
            }
        } 
        
        if (this.burrow_duration > 0) {
            let clearance = this.radius + 64;

            // this.board.spawn_particle(new Particle(this.position, 0, 0.4, entity_sprites.get("explosion"), 36, 1), this.position);

            let factor = this.burrow_duration / this.burrow_last_duration;
            if (factor > this.burrow_switch_threshold) {
                this.burrow_movespeed += this.burrow_accel * time_delta;
            } else {
                this.burrow_movespeed -= this.burrow_decel * time_delta;
            }

            this.burrow_movespeed = Math.max(this.burrow_movespeed, 0);

            this.burrow_position += this.burrow_movespeed * time_delta * ((this.reversed ^ this.weapon_data[0].reversed) ? -1 : 1);

            while (this.burrow_position < clearance) {
                this.burrow_side = positive_mod(this.burrow_side - 1, 4);
                this.burrow_position += (this.burrow_side % 2 == 1 ? this.board.size.x : this.board.size.y) - (clearance * 2);
            }

            while (this.burrow_position >= (this.burrow_side % 2 == 0 ? this.board.size.x : this.board.size.y) - clearance) {
                this.burrow_side = positive_mod(this.burrow_side + 1, 4);
                this.burrow_position -= (this.burrow_side % 2 == 1 ? this.board.size.x : this.board.size.y) - (clearance * 2);
            }

            // set position based on side and position
            switch (this.burrow_side) {
                case 0:
                    this.set_pos(
                        new Vector2(this.board.size.x - clearance, this.burrow_position)
                    )
                    break;
                
                case 1:
                    this.set_pos(
                        new Vector2(this.board.size.x - this.burrow_position, this.board.size.y - clearance)
                    )
                    break;
                
                case 2:
                    this.set_pos(
                        new Vector2(clearance, this.board.size.y - this.burrow_position)
                    )
                    break;
                
                case 3:
                    this.set_pos(
                        new Vector2(this.burrow_position, clearance)
                    )
                    break;
            }

            this.burrow_rocks_cooldown -= time_delta;
            while (this.burrow_rocks_cooldown <= 0) {
                this.burrow_rocks();

                this.burrow_rocks_cooldown += 0.2;
            }

            this.linked_particle.position = this.position;
            this.linked_particle.rotation_angle = deg2rad(-90 + (90 * this.burrow_side));

            this.burrow_duration -= time_delta;
            if (this.burrow_duration <= 0) {
                this.display = true;

                this.board.set_timer(new Timer(() =>{
                    this.collision = true;
                    this.ignore_bounds_checking = false;
                }, 0.01))

                let emerge_vec = this.burrow_vectors[this.burrow_side].rotate(
                    deg2rad(random_float(-22.5, 22.5, this.board.random))
                ).neg();

                let emerge_angle = emerge_vec.angle();

                // this.set_velocity(emerge_vec.mul(
                //     this.burrow_emerge_velocity
                // ));

                for (let i=0; i<8; i++) {
                    this.burrow_rocks();
                }

                this.weapon_data[0].angle = emerge_angle;

                this.deceleration_time = 0.5;
                this.dash_previous_velocity = this.burrow_decel_to;

                this.rapidfire_time = 0.4;
                this.temp_dmg_mult = 2;

                this.dash_cooldown = this.dash_cooldown_max;
                this.dash_duration = this.dash_duration_max * 0.25;

                this.board.spawn_particle(new Particle(
                    this.linked_particle.position, this.linked_particle.rotation_angle,
                    1.75, [...entity_sprites.get("drill_mound_form")].reverse(), 16, 999
                ), this.linked_particle.position);

                play_audio("drill_dash", 0.15);
                if (this.sound_source) {
                    try {
                        fade_out_audio(this.sound_source, 0.4, 0.1);
                        this.board.set_timer(new Timer(_ => {
                            this.sound_source.stop();
                        }, 0.15))
                    } catch {}
                }

                this.linked_particle.duration = 0;
                this.linked_particle = null;

                this.opacity = 1;
            }
        }

        // finally make sure damage is correct
        this.damage = this.damage_base + (this.damage_per_speed * this.velocity.magnitude());
        this.damage *= this.temp_dmg_mult;
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage;
        let result = null;
        if (this.rapidfire_time > 0) {
            result = super.hit_other(other, with_weapon_index, dmg, false);
            other.apply_invuln(BALL_INVULN_DURATION * 0.01, true);

            this.rapidfire_time -= 0.02;

            this.hitstop = BASE_HITSTOP_TIME * 0.3;
            other.hitstop = BASE_HITSTOP_TIME * 0.3;

            this.sparks_animation();
        } else {
            result = super.hit_other(other, with_weapon_index, this.non_rapidfire_damage, true);
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Burrows into walls to surprise enemies.`
        )

        if (this.burrow_duration <= 0) {
            if (this.rapidfire_time > 0) {
                this.write_desc_line(
                    `Damage: ${this.damage.toFixed(2)}+++ |${">".repeat(Math.floor(this.damage * 7))}`
                )
            } else {
                this.write_desc_line(
                    `Damage: ${this.non_rapidfire_damage.toFixed(2)}`
                )
            }
        } else {
            let barsiz = 20;
            let num_cells = Math.ceil(barsiz * (this.burrow_duration / this.burrow_last_duration));
            let num_empty = barsiz - num_cells;
            this.write_desc_line(
                `Burrowed: ${this.burrow_duration.toFixed(1)}s [${"#".repeat(num_cells)}${" ".repeat(num_empty)}]`,
                this.level >= AWAKEN_LEVEL
            )
        }

        if (this.dash_duration > 0) {
            this.write_desc_line(
                `Dash active!`
            )
        } else {
            let barsiz = 16;
            let num_cells = Math.ceil(barsiz * (this.dash_cooldown / this.dash_cooldown_max));
            let num_empty = barsiz - num_cells;
            this.write_desc_line(
                `Dash cooldown:   ${this.dash_cooldown.toFixed(1)}s [${"#".repeat(num_cells)}${" ".repeat(num_empty)}]`
            )
        }

        if (this.burrow_cooldown <= 0) {
            this.write_desc_line(
                `Burrow ready!`,
                this.level >= AWAKEN_LEVEL
            )
        } else {
            let barsiz = 16;
            let num_cells = Math.ceil(barsiz * (this.burrow_cooldown / this.burrow_cooldown_max));
            let num_empty = barsiz - num_cells;
            this.write_desc_line(
                `Burrow cooldown: ${this.burrow_cooldown.toFixed(1)}s [${"#".repeat(num_cells)}${" ".repeat(num_empty)}]`,
                this.level >= AWAKEN_LEVEL
            )
        }

        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
    }
}

class WrenchBall extends WeaponBall {
    static ball_name = "Wrench";

    static build_order = [
        0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,

        0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
        
        0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
        
        0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
        
        0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
        0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
        
    ]

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Wrench";
        this.description_brief = "Successfully hitting enemies with the wrench grants metal. Metal is consumed to build turrets which automatically shoot, or to upgrade existing turrets.";
        this.level_description = "Increases metal gain on hit.";
        this.max_level_description = "Damage from turrets also contributes a reduced amount of metal.";
        this.quote = "Dispenser? Never heard of anythin' like that.\nYa sure yer not confusin' me for someone else?";

        this.pronoun = PRONOUN.HE;
        this.tagline = "Capable of building powerful weapons from little more than scrap, Wrench fills the arena with his constructions and lets them do the dirty work.";
        this.description = ""
        this.lore_description = "A master artificer trained in the Magnum estate since birth, Wrench is the mastermind behind the monumental infrastructure that permits interplanar transport and broadcasting to and from the Grand Arena. Every machine and construction in Center Plane City even vaguely related to Magnum likely had Wrench's involvement, even (though she would never admit it...) Railgun's own weapon! Though his combat skills pale in comparison to his construction skills, he can nonetheless hold his own against even the arena regulars, though in a slightly more unconventional way than most. Though he is far from the most popular, a hard core of fans rejoices whenever he gets screen time - and he is deeply grateful for every single one of them."
        this.weapon_relationship = "Y'know, turrets ain't exactly new to me. Back when Railgun was jus' a lil' kid, we'd get up to all manner of roughhousin' - but don't tell Magnum I said that, y'hear?"
        this.lore_origin = "Center Plane City"
        this.lore_temperament = "Industrious"
        this.lore_affiliation = "Balls Broadcasting Corporation"
        this.lore_alignment = "blue"
        this.lore_birthday = "1st Jan"

        this.default_colour = Colour.from_hex("#bb1c1b")

        this.tier = TIERS.A;
        if (level >= AWAKEN_LEVEL) {
            this.tier = TIERS.APLUS;
        }

        this.category = CATEGORIES.STANDARD;
        this.tags = [
            TAGS.HYBRID,
            TAGS.BALANCED,
            TAGS.SCALING,
            TAGS.CHILDREN,
            TAGS.PROJECTILES,
            TAGS.HITSCAN,
            TAGS.HOMING,
            TAGS.LEVELS_UP,
            TAGS.CAN_AWAKEN,
        ];

        this.weapon_data = [
            new BallWeapon(1, "wrench", [
                {pos: new Vector2(80, 64), radius: 10},
                {pos: new Vector2(68, 66), radius: 6},
                {pos: new Vector2(56, 66), radius: 6},
                {pos: new Vector2(44, 66), radius: 6},
                {pos: new Vector2(32, 66), radius: 6},
            ])
        ];

        this.damage_base = 1;
        this.speed_base = 120;

        this.metal = 0;
        this.metal_gain_on_hit = 50 + (this.level * 1);
        this.metal_gain_on_turret_hit = 10;
        this.build_times = 0;

        this.metal_threshold = 50;
        this.metal_threshold_growth = 5;

        this.children = [];
    }

    gain_metal(amt) {
        this.metal += amt;
        this.check_metal_thresholds();

        play_audio("wrench_metal");
    }

    check_metal_thresholds() {
        while (this.metal >= this.metal_threshold) {
            this.metal -= this.metal_threshold;
            this.metal_threshold += this.metal_threshold_growth;

            let action = WrenchBall.build_order[this.build_times];
            this.build_times++;

            let particle_spawn_pos = this.position.add(
                this.get_weapon_offset(0)
            ).add(
                this.get_hitboxes_offsets(0)[3]
            )

            if (action == 0) {
                // build turret
                // pick a location and spawn the turret there
                let turret_pos = this.position;
                while (this.board.balls.some(ball => ball.position.sqr_distance(turret_pos) <= Math.pow(ball.radius + (this.radius * 0.5), 2))) {
                    turret_pos = new Vector2(
                        this.board.size.x * random_float(0.2, 0.8, this.board.random),
                        this.board.size.y * random_float(0.2, 0.8, this.board.random),
                    )
                }

                let new_ball = new WrenchTurretLv1Ball(
                    this.board, this.radius * 0.4, this.colour,
                    this.bounce_factor, this.friction_factor, this.player,
                    this.level, this.reversed
                )

                new_ball.position = turret_pos;
                new_ball.parent = this;
                this.children.push(new_ball);

                for (let i=0; i<8; i++) {
                    this.board.spawn_particle(new EnergyBurstParticle(
                        particle_spawn_pos, 0.6, entity_sprites.get("powerup_burst_white"), 0, 16, true,
                        25000, 120000, new_ball, new Colour(128, 128, 128, 255), 4, 2, 0, true
                    ), particle_spawn_pos)
                }

                this.board.set_timer(new Timer(b => {
                    b.spawn_ball(new_ball, turret_pos)
                    play_audio("wrench_build", 0.2);
                }, 0.2))
            } else {
                // upgrade turret
                let closest = this.children.reduce((p, c) => {
                    let dist = this.position.sqr_distance(c.position);
                    if (c.player.id == this.player.id && c.upgradable && dist < p[1]) {
                        return [c, dist];
                    } else {
                        return p;
                    }
                }, [null, Number.POSITIVE_INFINITY]);

                if (closest[0]) {
                    closest[0].upgradable = false;

                    for (let i=0; i<8; i++) {
                        this.board.spawn_particle(new EnergyBurstParticle(
                            particle_spawn_pos, 0.6, entity_sprites.get("powerup_burst_white"), 0, 16, true,
                            25000, 120000, closest[0], new Colour(128, 128, 128, 255), 4, 2, 0, true
                        ), particle_spawn_pos)
                    }

                    this.board.set_timer(new Timer(b => {
                        closest[0].upgrade();
                        play_audio("wrench_upgrade", 0.2);
                    }, 0.2))
                }
            }
        }
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        for (let i=0; i<8; i++) {
            this.board.spawn_particle(new EnergyBurstParticle(
                other.position, 0.6, entity_sprites.get("powerup_burst_white"), 0, 16, true,
                25000, 120000, this, new Colour(128, 128, 128, 255), 4, 2, 0, true
            ), other.position)
        }

        this.board.set_timer(new Timer(b => {
            this.gain_metal(this.metal_gain_on_hit);
        }, 0.2))

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor, sizedown) {
        this.start_writing_desc(ctx, x_anchor, y_anchor, sizedown);

        this.write_desc_line(
            `Uses metal to build and upgrade turrets.`
        )

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Metal: ${this.metal.toFixed(0)} / ${this.metal_threshold.toFixed(0)}`
        )
        this.write_desc_line(
            `Metal on hit: +${this.metal_gain_on_hit.toFixed(0)}`
        )
        if (this.level >= AWAKEN_LEVEL) {
            this.write_desc_line(
                `Metal on turret hit: +${this.metal_gain_on_turret_hit.toFixed(0)}`,
                true
            )
        }

        this.write_desc_line(
            `Next actions:`
        )
        this.write_desc_line(
            new Array(4).fill(0).map((_, i) => {
                return WrenchBall.build_order[this.build_times + i] ? "Upgrade" : " Build "
            }).join(" < ")
        )
    }
}

class WrenchTurretLv1Ball extends WeaponBall {
    constructor(board, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, Number.POSITIVE_INFINITY, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Wrench LV1 Turret";

        this.display_hp = false;

        this.weapon_data = [
            new BallWeapon(0.5, "wrench_turret_gun1", [
                {pos: new Vector2(-10, 64), radius: 26},
            ])
        ];

        this.damage_base = 1;
        this.speed_base = 120;

        this.affected_by_gravity = false;1

        this.shot_cooldown_max = 0.55;
        this.shot_cooldown = this.shot_cooldown_max;

        this.show_stats = false;
        this.gets_hit = false;
        this.can_hit = false;

        this.proj_damage_base = 3;
        this.parent = null;

        this.upgrade_class = WrenchTurretLv2Ball;

        this.shot_times = 1;
        this.upgradable = true;
    }

    make_bullet(position, direction, speed) {
        board.spawn_projectile(
            new BulletProjectile(
                this.board,
                this, 0, position, this.proj_damage_base, 1,
                direction, speed, Vector2.zero
            ), position
        )
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.hp = Number.POSITIVE_INFINITY;
        if (this.parent.hp <= 0) {
            this.hp = 0;
        }
        
        this.weapon_data[0].reversed = false;
        this.rotate_weapon(0, this.speed_base * time_delta);

        this.shot_cooldown -= time_delta;
        let shooting = false;
        if (this.shot_cooldown < 0) {
            this.shot_cooldown = this.shot_cooldown_max;
            shooting = true;
        }

        if (shooting) {
            // schut
            let firing_offset = this.get_weapon_offset(0);
            let fire_pos = this.position.add(firing_offset);

            let times = this.shot_times;

            for (let i=0; i<times; i++) {
                this.make_bullet(
                    fire_pos,
                    new Vector2(1, 0).rotate(this.weapon_data[0].angle + (random_float(-10, 10, this.board.random) * (Math.PI / 180))),
                    16000 * random_float(0.85, 1.15, this.board.random)
                )
            }

            let snd_rand = this.independent_random();
            if (snd_rand < 0.5) {
                // play_audio("bow1");
            } else {
                // play_audio("bow2");
            }
        }
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            if (this.parent.level >= AWAKEN_LEVEL) {
                for (let i=0; i<2; i++) {
                    this.board.spawn_particle(new EnergyBurstParticle(
                        this.position, 0.6, entity_sprites.get("powerup_burst_white"), 0, 16, true,
                        25000, 120000, this.parent, new Colour(128, 128, 128, 255), 4, 2, 0, true
                    ), this.position)
                }

                this.board.set_timer(new Timer(b => {
                    this.parent.gain_metal(this.parent.metal_gain_on_turret_hit);
                }, 0.2))
            }
        }

        return result;
    }

    upgrade() {
        this.hp = 0;
        
        let proto = this.upgrade_class;
        let new_ball = new proto(
            this.board, this.radius, this.colour,
            this.bounce_factor, this.friction_factor, this.player,
            this.level, this.reversed
        )

        new_ball.parent = this.parent;
        this.parent.children.push(new_ball);

        this.board.set_timer(new Timer(b => {
            b.spawn_ball(new_ball, this.position)
        }, 0.01))
    }

    die() {
        this.parent.children = this.parent.children.filter(c => c.id != this.id);

        this.board.spawn_particle(new Particle(
            this.position, 0, 0.6, entity_sprites.get("explosion_small"), 12, 3, false
        ), this.position);

        // TODO sound

        return {skip_default_explosion: true};
    }
}

class WrenchTurretLv2Ball extends WrenchTurretLv1Ball {
    constructor(board, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, radius, colour, bounce_factor, friction_factor, player, level, reversed);

        this.name = "Wrench LV2 Turret";

        this.weapon_data = [
            new BallWeapon(0.5, "wrench_turret_gun2", [
                {pos: new Vector2(-10, 64), radius: 26},
            ])
        ];

        this.shot_cooldown_max = 0.25;
        this.shot_cooldown = this.shot_cooldown_max;
        
        this.proj_damage_base = 4;

        this.upgrade_class = WrenchTurretLv3Ball;
    }
}

class WrenchTurretLv3Ball extends WrenchTurretLv2Ball {
    constructor(board, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, radius, colour, bounce_factor, friction_factor, player, level, reversed);

        this.name = "Wrench LV3 Turret";

        this.weapon_data = [
            new BallWeapon(0.5, "wrench_turret_gun3", [
                {pos: new Vector2(-10, 64), radius: 26},
            ])
        ];

        this.shot_times = 4;

        this.upgrade_class = WrenchTurretLv4Ball;
    }
}

class WrenchTurretLv4Ball extends WrenchTurretLv2Ball {
    constructor(board, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, radius, colour, bounce_factor, friction_factor, player, level, reversed);

        this.name = "Wrench LV4 Turret";

        this.weapon_data = [
            new BallWeapon(0.75, "wrench_turret_gun4", [
                {pos: new Vector2(-10, 64), radius: 26},
            ])
        ];

        this.weapon_data[0].offset = new Vector2(-16, 0);

        this.upgrade_class = WrenchTurretLv5Ball;

        this.shot_cooldown_max = 0.15;

        this.proj_damage_base = 5;
    }

    make_bullet(position, direction, speed) {
        board.spawn_projectile(
            new WrenchLV4HitscanProjectile(
                this.board, this, 0, position,
                this.proj_damage_base,
                this.position.add(direction.mul(10000))
            ), position
        )
    }
}

class WrenchTurretLv5Ball extends WrenchTurretLv2Ball {
    constructor(board, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, radius, colour, bounce_factor, friction_factor, player, level, reversed);

        this.name = "Wrench LV5 Turret";

        this.weapon_data = [
            new BallWeapon(0.75, "wrench_turret_gun5", [
                {pos: new Vector2(-10, 64), radius: 26},
            ])
        ];

        this.firing_offsets = [
            new Vector2(100, 0)
        ]

        this.weapon_data[0].offset = new Vector2(-16, 0);

        this.upgrade_class = WrenchTurretLv5Ball;
        this.upgradable = false;

        this.shot_cooldown_max = 1.6;

        this.proj_damage_base = 10;
    }

    make_bullet(position, direction, speed) {
        let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
        let fire_pos = this.position.add(firing_offset);

        position = fire_pos;

        board.spawn_projectile(
            new MissileProjectile(
                this.board,
                this, 0, position, this.proj_damage_base, 0.5,
                direction, speed * 0.4, this.velocity.mul(0)
            ), position
        )
        
        play_audio("bottle_pop")
    }
}

class Projectile {
    // projectiles have a position, a damage stat, a direction, speed and some hitboxes
    static id_inc = 0;
    
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        this.id = Projectile.id_inc;
        Projectile.id_inc++;
        
        this.active = true;
        
        // {pos, radius} same as balls
        this.hitboxes = [];

        /** @type {Board} */
        this.board = board;

        this.source = source;
        this.source_weapon_index = source_weapon_index;
        this.set_pos(position);
        this.damage = damage;
        this.size = size * PROJ_SIZE_MULTIPLIER;
        this.set_dir(direction);

        this.speed = speed;

        this.sprite = "arrow";

        this.parriable = true;
        this.collides_other_projectiles = true;
        this.play_parried_audio = true;
        this.respects_invuln_for_parry = false;

        // TODO
        // need to add source_player and source_ball
        // so we have 3 levels of team-hits:
        //  all on team, all from player ID, only from ball ID
        // also need to split out team and player ID to allow for this
        this.can_hit_allied = false;
        this.can_hit_source = false; // specifically for hit/parry from SOURCE ball
        this.can_hit_enemy = true;
        this.can_hit_source_projs = false; // turn on when you want projectiles from self to collide with each other but not the parent

        this.allied_parriable = true;

        this.ignore_balls = new Set();

        this.cached_hitboxes_offsets = [];
        this.cache_hitboxes_offsets();
    }

    set_pos(to) {
        this.position = to;
        this.position.compat_round();
    }

    set_dir(to) {
        this.direction = to;
        this.direction.compat_round();

        this.direction_angle = compat_round(this.direction.angle());

        this.cache_hitboxes_offsets();
    }

    set_hitboxes(to) {
        this.hitboxes = to;
        this.cache_hitboxes_offsets();
    }

    can_hit_ball(ball, parry=false) {
        let ally = ball.allied_with(this.source);
        return (
            this.active && 
            (ball.invuln_duration <= 0 || !this.respects_invuln_for_parry) &&
            !this.ignore_balls.has(ball.id) && 
            (!ally || this.can_hit_allied || this.can_hit_source) &&
            (this.can_hit_enemy || ally) &&
            (!parry || (this.allied_parriable || !ally)) &&
            (ball.id != this.source.id || this.can_hit_source)
        )
    }

    can_hit_projectile(other) {
        return (
            this.id !== other.id &&
            other.parriable && other.collides_other_projectiles &&
            (
                !other.source.allied_with(this.source) || (
                    this.allied_parriable && (
                        (this.can_hit_allied && other.can_hit_allied) ||
                        (this.can_hit_source && other.can_hit_source) ||
                        (this.can_hit_source_projs && other.can_hit_source_projs)
                    )
                )
            ) &&
            (this.source.id != other.source.id || (
                (this.can_hit_source && other.can_hit_source) ||
                (this.can_hit_source_projs && other.can_hit_source_projs)
            ))
        );
    }

    collides_line(line) {
        let hitboxes_offsets = this.get_hitboxes_offsets();
        for (let i=0; i<hitboxes_offsets.length; i++) {
            let hitbox_offset = hitboxes_offsets[i];
            let hitbox_index = i;

            let this_hitbox = this.hitboxes[hitbox_index];
            let hitbox_pos = this.position.add(hitbox_offset);

            if (point_collides_line(hitbox_pos, this_hitbox.radius * this.size, line)) {
                return hitbox_pos;
            }
        }
        
        return null;
    }

    physics_step(time_delta) {
        // do nothing
    }

    weapon_step(time_delta) {
        // do nothing
    }

    cache_hitboxes_offsets() {
        this.cached_hitboxes_offsets = this.hitboxes.map(hitbox => {
            // rotate the hitbox pos by the direction and multiply by size
            // no offset funnies here, luckily
            let offset = hitbox.pos.mul(this.size).rotate(this.direction_angle);
            return offset;
        })
    }

    get_hitboxes_offsets() {
        return this.cached_hitboxes_offsets;
    }

    check_projectiles_colliding(projectiles) {
        let this_hitboxes_offsets = this.get_hitboxes_offsets();

        let collisions = [];

        projectiles.forEach(projectile => {
            if (!projectile.active || projectile.id == this.id || projectile.source.id == this.source.id) {
                // projectiles never collide with themselves
                // disabled projectiles don't collide
                // projectiles also don't collide with
                // other projectiles of the same source
                return false;
            }

            let other_hitboxes_offsets = projectile.get_hitboxes_offsets();

            let collider_positions = null;
            let collider_indexes = null;

            let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                let this_hitbox = this.hitboxes[this_index];
                
                // check all of other's hitboxes
                return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                    let other_hitbox = projectile.hitboxes[other_index];
                    
                    let radius_sum = (this_hitbox.radius * this.size) + (other_hitbox.radius * projectile.size);
                    let radius_sum_sqr = compat_pow(radius_sum, 2);

                    let this_hitbox_pos = this.position.add(this_hitbox_offset);
                    let other_hitbox_pos = projectile.position.add(other_hitbox_offset);

                    if (this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr) {
                        collider_positions = [this_hitbox_pos, other_hitbox_pos];
                        collider_indexes = [this_index, other_index];
                        
                        return true;
                    } else {
                        return false;
                    }
                })
            });

            if (collided) {
                collisions.push([projectile, collider_positions, collider_indexes]);
            }
        })

        return collisions;
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = false;
    }

    get_parried(by) {
        this.active = false;
    }

    hit_ball(ball, delta_time) {
        this.active = false;
    }

    collide_wall(pos) {
        this.active = false;
    }
}

class StraightLineProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.direction.mul(this.speed * time_delta)));
    }
}

class InertiaRespectingStraightLineProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.inertia_vel = inertia_vel;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.direction.mul(this.speed).add(this.inertia_vel).mul(time_delta)));
    }
}

class HitscanProjectile extends Projectile {
    // hitscan projectiles are the same as normal ones for the most part except their sprite is
    //  "HITSCAN"
    // and they have an additional sprite_colour parameter
    // and 
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, 1, new Vector2(0, 0), 0);

        this.target_position = target_position;

        this.sprite = "HITSCAN";
        this.sprite_colour = "yellow";

        this.duration = 0.5;
        this.lifetime = 0;

        this.inactive_delay = 0;
        this.render_delay = 0;
        this.active_duration = 0.02;

        this.create_multiple_hitboxes = false;

        this.max_width = 8;
        this.min_width = 0;

        this.bearing = this.target_position.sub(this.position).normalize();
    
        this.hitboxes = [];
    
        this.nullified = false;
    }

    physics_step(time_delta) {
        // do nothing
        this.lifetime += time_delta;
    }

    weapon_step(time_delta) {
        let result = this.create_hitboxes(this.create_multiple_hitboxes);
        if (result) {
            this.set_hitboxes(result);
        }
    }

    get_width() {
        return lerp(this.max_width, this.min_width, this.lifetime / this.duration);
    }

    is_inactive() {
        return this.nullified || this.lifetime < this.inactive_delay || this.lifetime > this.active_duration;
    }

    create_hitboxes(overwrite=false) {
        // start at position, move to target_position
        // to get full circle coverage over width, use a circle of radius (width/2)
        // and move by (width/2) each time
        let hitboxes = [];
        if (this.is_inactive()) {
            return hitboxes;
        }

        if (this.hitboxes.length > 0 && !overwrite) {
            return null;
        }

        let dist = this.target_position.distance(this.position);
        let half_r = this.max_width / 2;

        let scaled_bearing = this.bearing.mul(half_r);

        let num_hitboxes = Math.floor(dist / (half_r * PROJ_SIZE_MULTIPLIER));
        let cur_pos = this.position;
        let offset = new Vector2(0, 0);

        for (let i=0; i<num_hitboxes; i++) {
            hitboxes.push({pos: offset, radius: half_r});
            cur_pos = cur_pos.add(scaled_bearing);
            offset = offset.add(scaled_bearing);
        }

        hitboxes.push({pos: offset, radius: half_r});

        return hitboxes;
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = true;
    }

    get_parried(by) {
        this.nullified = true;
    }

    hit_ball(ball, delta_time) {
        this.active = true;
    }

    collide_wall(pos) {
        this.target_position = pos;
        this.set_hitboxes(this.create_hitboxes(true));

        // console.log("collided wall as hitscan")
    }
}

class RailgunProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 32;
        this.sprite_colour = "cyan";
    }
}

class RailgunUltProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 80;
        this.sprite_colour = "red";
        this.parriable = false;
    }
}

class RailgunUltInnerProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 55;
        this.sprite_colour = "white";
        this.parriable = false;
    }
}

class MagnumProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, ricochets) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.sprite_colour = "yellow";

        this.ricochets = ricochets ? ricochets : 1

        this.duration = 0.5;
        this.lifetime = 0;

        this.inactive_delay = this.ricochets == 1 ? 0 : 0.02;
        this.render_delay = this.inactive_delay;
        this.active_duration = this.inactive_delay + 0.01;

        this.max_width = 12;
        this.min_width = 0;

        if (this.ricochets > 1) {
            this.damage *= 2;
        }
        this.max_width *= this.ricochets;
        if (this.ricochets >= 1) {
            this.sprite_colour = Colour.yellow.lerp(Colour.red, Math.min(1, (this.ricochets-1) / 3)).css();
            this.parriable = false;
        }

        this.can_hit_source_projs = true;
    }

    // Override so that it will return collisions with MagnumCoins
    check_projectiles_colliding(projectiles) {
        let this_hitboxes_offsets = this.get_hitboxes_offsets();

        let collisions = [];

        projectiles.forEach(projectile => {
            if (!projectile.active) {
                return false;
            }

            if (projectile.id == this.id) {
                return false;
            }

            if (projectile.source.id == this.source.id && !(projectile instanceof MagnumCoinProjectile && projectile.lifetime > 0.1)) {
                return false;
            }

            let other_hitboxes_offsets = projectile.get_hitboxes_offsets();

            let collider_positions = null;
            let collider_indexes = null;

            let collided = this_hitboxes_offsets.some((this_hitbox_offset, this_index) => {
                let this_hitbox = this.hitboxes[this_index];
                
                // check all of other's hitboxes
                return other_hitboxes_offsets.some((other_hitbox_offset, other_index) => {
                    let other_hitbox = projectile.hitboxes[other_index];
                    
                    let radius_sum = (this_hitbox.radius * this.size) + (other_hitbox.radius * projectile.size);
                    let radius_sum_sqr = compat_pow(radius_sum, 2);

                    let this_hitbox_pos = this.position.add(this_hitbox_offset);
                    let other_hitbox_pos = projectile.position.add(other_hitbox_offset);

                    if (this_hitbox_pos.sqr_distance(other_hitbox_pos) <= radius_sum_sqr) {
                        collider_positions = [this_hitbox_pos, other_hitbox_pos];
                        collider_indexes = [this_index, other_index];
                        
                        return true;
                    } else {
                        return false;
                    }
                })
            });

            if (collided) {
                collisions.push([projectile, collider_positions, collider_indexes]);
            }
        })

        return collisions;
    }

    hit_other_projectile(other) {
        if (other instanceof MagnumCoinProjectile && other.source.id == this.source.id) {
            // if the coin is out of bounds, ignore it
            if (!this.board.in_bounds(other.position)) {
                return;
            }

            // ricoshot
            // search for an enemy
            let enemies = this.board.balls.filter(ball => !ball.allied_with(this.source));
            let coins = this.board.projectiles.filter(proj => proj.id != other.id && proj.source.allied_with(this.source) && proj.active && proj instanceof MagnumCoinProjectile && proj.lifetime > 0.1 && this.board.in_bounds(proj.position));

            let target = null;
            if (coins.length > 0) {
                target = coins.reduce((closest, coin) => closest ? (coin.position.sqr_distance(other.position) < closest[0] ? [coin.position.sqr_distance(other.position), coin] : closest) : [coin.position.sqr_distance(other.position), coin], null)[1]
            } else if (enemies.length > 0) {
                target = enemies.reduce((closest, enemy) => closest ? (enemy.position.sqr_distance(other.position) < closest[0] ? [enemy.position.sqr_distance(other.position), enemy] : closest) : [enemy.position.sqr_distance(other.position), enemy], null)[1]
            }

            if (!target) {
                target = {position: other.position.add(random_on_circle(30000, this.board.random))}
            }

            if (target) {
                this.board.spawn_projectile(
                    new MagnumProjectile(
                        this.board,
                        this.source, this.source_weapon_index, 
                        other.position, this.damage,
                        target.position, this.ricochets + 1
                    ), other.position
                );

                // play gun2 if first ricochet, gun3 if second and _super if third, otherwise nothing
                if (this.ricochets == 0) {
                    play_audio("gun1");
                } else if (this.ricochets == 1) {
                    play_audio("gun2");
                } else if (this.ricochets == 2) {
                    play_audio("gun3");
                } else if (this.ricochets == 3) {
                    play_audio("gun_super");
                }

                // let particle = new Particle(
                //     other.position.add(new Vector2(16, -32)), 0, 0.2, entity_sprites.get("explosion"), 12, 3, false
                // )
                // particle.lifetime += 0.1;
                // this.board.spawn_particle(particle, other.position.add(new Vector2(16, -32)));

                let particle = new Particle(
                    other.position, 0, 1.25 + (0.25 * this.ricochets),
                    entity_sprites.get("hit"), 8, 4, false
                )

                board.spawn_particle(particle, other.position);

                this.target_position = other.position;

                // this.board.hitstop_time = Math.max(this.board.hitstop_time, 0.1);

                other.active = false;
            }
        } else {
            // do nothing
        }
    }
}

class MagnumUltProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, sizmul=1) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 24 * sizmul;
        this.sprite_colour = Colour.from_hex("#f80").lerp(Colour.red, Math.min(1, sizmul - 1)).css();
        this.parriable = false;
    }
}

class WandMagentaProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 9;
        this.sprite_colour = "magenta";

        this.ignore_smoothing = true;
        this.parriable = false;
    }
}

class MagnumCoinProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, gravity) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);

        this.frame = 0;
        this.framecount = 5;
        this.sprites = entity_sprites.get("coin");
        this.sprite = this.sprites[0];
        this.lifetime = 0;
        this.frame_speed = 12;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 8},
        ]);

        this.can_hit_source_projs = true;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));

        this.lifetime += time_delta;
        this.frame = Math.floor(this.lifetime * this.frame_speed)
        this.frame = this.frame % this.framecount;
        this.sprite = this.sprites[this.frame];
    }

    hit_other_projectile(other_projectile) {
        if (other_projectile instanceof MagnumProjectile) {
            return;
        }

        super.hit_other_projectile(other_projectile);
    }
}

class DaggerAwakenProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);

        this.sprite = "pellet";
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 4},
        ]);

        this.play_parried_audio = false;
    }
}

class ArrowProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "arrow" + sprite_suffix;
        this.set_hitboxes([
            {pos: new Vector2(-20, 0), radius: 4},
            {pos: new Vector2(-16, 0), radius: 4},
            {pos: new Vector2(-12, 0), radius: 4},
            {pos: new Vector2(-8, 0), radius: 4},
            {pos: new Vector2(-4, 0), radius: 4},
            {pos: new Vector2(0, 0), radius: 4},
            {pos: new Vector2(4, 0), radius: 4},
            {pos: new Vector2(8, 0), radius: 4},
            {pos: new Vector2(12, 0), radius: 4},
            {pos: new Vector2(16, 0), radius: 4},
            {pos: new Vector2(20, 0), radius: 4},
        ]);
    }
}

class BowUltProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel, arrow_hits, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "arrow" + sprite_suffix;
        this.set_hitboxes([
            {pos: new Vector2(-20, 0), radius: 4},
            {pos: new Vector2(-16, 0), radius: 4},
            {pos: new Vector2(-12, 0), radius: 4},
            {pos: new Vector2(-8, 0), radius: 4},
            {pos: new Vector2(-4, 0), radius: 4},
            {pos: new Vector2(0, 0), radius: 4},
            {pos: new Vector2(4, 0), radius: 4},
            {pos: new Vector2(8, 0), radius: 4},
            {pos: new Vector2(12, 0), radius: 4},
            {pos: new Vector2(16, 0), radius: 4},
            {pos: new Vector2(20, 0), radius: 4},
        ]);

        this.arrow_hits = arrow_hits;
        this.parriable = false;
        this.collides_other_projectiles = false;

        this.hit_map = new Map();

        this.afterimage_delay_max = 0.005;
        this.afterimage_delay = this.afterimage_delay_max;
    }

    physics_step(time_delta) {
        super.physics_step(time_delta);

        this.afterimage_delay -= time_delta;
        while (this.afterimage_delay <= 0) {
            this.afterimage_delay += this.afterimage_delay_max;
            this.board.spawn_particle(new Particle(
                this.position, this.direction_angle,
                this.size / PROJ_SIZE_MULTIPLIER,
                entity_sprites.get(this.sprite),
                0, 0.25
            ), this.position).add_component(new FadeOutParticleComponent(
                this.board, 0, 0.75
            ));
        }
    }

    hit_ball(ball, delta_time) {
        this.ignore_balls.add(ball.id);
        this.active = true;

        let n = 0;
        this.board.set_timer(new Timer(b => {
            if (n % 2 == 1)
                play_audio("impact");

            this.source.hit_other_with_projectile(
                ball, this
            )

            n++;

            return n < this.arrow_hits; 
        }, 0.01, true));
    }
}

class PotionPuddleProjectile extends Projectile {
    static mults = [1, 0.6, 1, 0.3];

    constructor(board, source, source_weapon_index, position, intensity, size, effect_index, duration_mult) {
        super(board, source, source_weapon_index, position, 0, size, new Vector2(1, 0), 0);

        this.sprite = `puddle${effect_index+1}`;
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 36},
        ]);

        this.intensity = intensity;

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.no_hit_particles = true;

        this.duration = 5 * PotionPuddleProjectile.mults[effect_index] * duration_mult;

        this.effect_index = effect_index;

        this.alternative_layer = "bg1";
    }

    physics_step(time_delta) {
        this.duration -= time_delta;
        if (this.duration <= 0) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        this.active = true;

        // console.log(`hitting ${ball.name} as ${this.effect_index}`)

        switch (this.effect_index) {
            case 0: {
                // rupture
                this.source.apply_rupture(
                    ball, 6 * this.intensity * delta_time
                )

                break;
            }

            case 1: {
                // poison
                let dur = 2 * this.intensity * delta_time;
                let amt = 0.9 * this.intensity * delta_time;
                this.source.apply_poison(
                    ball, amt, dur
                );

                break;
            }

            case 2: {
                // damage

                // orig. effect
                let dmg_mul = this.source.get_stat("damage_bonus");
                let def_mul = ball.get_stat("defense_bonus");

                let dmg = (7.25 * this.intensity * dmg_mul * delta_time) / def_mul;

                ball.get_hit(this.source, dmg, 0, 0, false);
               
                // planned rework
                // this.source.apply_burn(
                //     ball, 0.25 * this.intensity * delta_time
                // )

                break;
            }

            case 3: {
                // hitstop
                ball.apply_hitstop(0.1);
                break;
            }
        }
    }
}

class PotionBottleProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, gravity, effect_index, duration_mult, reversed, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);
        this.effect_index = effect_index;

        this.sprite = `potion${effect_index+1}${sprite_suffix}`;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 16},
        ]);

        this.rotation_speed = random_float(270, 540, this.board.random);

        this.reversed = reversed;
        this.duration_mult = duration_mult;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));
    
        let new_direction_angle = this.direction_angle + ((this.rotation_speed * (Math.PI / 180)) * (this.reversed ? -1 : 1) * time_delta);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    }

    make_splash() {
        board.spawn_projectile(
            new PotionPuddleProjectile(
                this.board,
                this.source, 0, this.position, 1, 2, this.effect_index, this.duration_mult
            ), this.position
        )

        play_audio("bottle_smash");
    }

    hit_other_projectile(other_projectile) {
        super.hit_other_projectile(other_projectile);

        this.make_splash();
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        this.make_splash();
    }

    get_parried(by) {
        super.get_parried(by);

        this.make_splash();
    }
}

class GlassProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, gravity, reversed, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);

        this.sprite = `glass_shard${sprite_suffix}`;

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 12},
        ]);

        this.rotation_speed = random_float(270, 540, this.board.random);

        this.reversed = reversed;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));
    
        let new_direction_angle = this.direction_angle + ((this.rotation_speed * (Math.PI / 180)) * (this.reversed ? -1 : 1) * time_delta);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);
        this.source.apply_rupture(ball, this.source.shard_rupture_amt);
    }
}

class PersistentAoEProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, duration, sprite) {
        super(board, source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprites = entity_sprites.get(sprite);
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        /*
        this.set_hitboxes([
            
        ]);
        */

        this.hitboxes_by_frame = new Array(this.framecount).fill(0).map(_ => []);

        this.last_frame = null;

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.lifetime = 0;
        this.duration = duration;

        this.orientation = new Vector2(1, 1);
    }

    physics_step(time_delta) {
        this.lifetime += time_delta;

        let frame = Math.floor((this.lifetime / this.duration) * this.framecount);
        this.sprite = this.sprites[frame];

        if (frame != this.last_frame) {
            this.set_hitboxes(this.hitboxes_by_frame[frame].map(v => { return {pos: v.pos.pairwise_mul(this.orientation), radius: v.radius} }));
            this.last_frame = frame;
        }

        if (this.lifetime >= this.duration) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        this.ignore_balls.add(ball.id);

        this.active = true;
    }
}

class GrenadeExplosionProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, size, sprite_override="explosion_grenade") {
        super(board, source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprites = entity_sprites.get(sprite_override);
        this.framecount = this.sprites.length;
        this.sprite = this.sprites[0];

        /*
        this.set_hitboxes([
            
        ]);
        */

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(-14, 12), radius: 24}],
            [{pos: new Vector2(-14, 12), radius: 36}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [{pos: new Vector2(-14, 12), radius: 48}],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.lifetime = 0;
        this.duration = 1.5;

        this.can_hit_allied = true;
        this.can_hit_source = true;
    }

    physics_step(time_delta) {
        this.lifetime += time_delta;

        let frame = Math.floor((this.lifetime / this.duration) * this.framecount);
        this.sprite = this.sprites[frame];

        this.set_hitboxes(this.hitboxes_by_frame[frame]);

        if (this.lifetime >= this.duration) {
            this.active = false;
        }
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        let diff_vec = ball.position.sub(this.position).normalize();
        let share = 1;

        let other_diff_add = diff_vec.mul(share);

        let other_mag = ball.velocity.magnitude();

        if (other_mag != 0) {
            let new_other_velocity = ball.velocity.div(other_mag).mul(1 - share).add(other_diff_add).normalize().mul(other_mag)

            ball.set_velocity(new_other_velocity);
        }

        ball.apply_invuln(BALL_INVULN_DURATION * 2);

        this.ignore_balls.add(ball.id);

        this.active = true;
    }
}

class ChakramProjectile extends Projectile {
    // orbits around thrower, going from origin distance to max distance then back to origin
    // before vanishing again and re-enabling the weapon on the ball
    constructor(board, source, source_weapon_index, position, damage, size, initial_angle, rotation_speed, rotation_time, min_dist, max_dist, sprite_suffix="") {
        super(board, source, source_weapon_index, position, damage, size, new Vector2(1, 0), 0);

        this.sprite = `chakram_projectile${sprite_suffix}`

        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 48},
        ]);

        this.initial_angle = initial_angle;
        this.set_dir(new Vector2(1, 0).rotate(this.initial_angle + deg2rad(45)));

        this.cur_angle = this.initial_angle;

        this.rotation_speed = rotation_speed;
        this.rotation_time = rotation_time;
        this.lifetime = 0;

        this.min_dist = min_dist;
        this.max_dist = max_dist;

        this.sprite_angle_change_speed = 1440;

        this.hitstop = 0;

        this.sprite_suffix = sprite_suffix;

        this.respects_invuln_for_parry = true;
    }

    physics_step(time_delta) {
        this.hitstop -= time_delta;
        let delta_time = time_delta;
        if (this.hitstop > 0) {
            delta_time *= HITSTOP_DELTATIME_PENALTY;
        }

        this.lifetime += delta_time;
        this.cur_angle += this.rotation_speed * delta_time;

        if (this.lifetime > this.rotation_time) {
            this.active = false;
            this.source.mode = "idle";
            this.source.reset_weapons();
            this.source.weapon_data[0].angle = this.cur_angle;
            this.source.cache_weapon_offsets();
            this.source.cache_hitboxes_offsets();
        }

        let new_direction_angle = this.direction_angle + ((this.sprite_angle_change_speed * Math.sign(this.rotation_speed) * (Math.PI / 180)) * delta_time);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    
        // dist should be min_dist at 0, max_dist at 0.5 and min_dist again at 1
        let lifetime_proportion = this.lifetime / this.rotation_time;
        let dist_lerp_amt = 2 * (0.5 - Math.abs(lifetime_proportion - 0.5));
        
        this.sprite = dist_lerp_amt < 0.1 ? `chakram` : `chakram_projectile`;
        this.sprite += this.sprite_suffix;

        let dist = lerp(this.min_dist, this.max_dist, dist_lerp_amt);
        let newpos = new Vector2(dist, 0).rotate(this.cur_angle).add(this.source.position);

        this.set_pos(newpos);
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = true;
    }

    get_parried(by) {
        this.active = true;

        by.apply_invuln(BALL_INVULN_DURATION);
    }

    hit_ball(ball, delta_time) {
        // this one is fine because it's a projectile
        this.hitstop = Math.max(this.hitstop, BASE_HITSTOP_TIME);

        this.active = true;
    }
}

class WandIcicleProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "wand_icicle";
        this.set_hitboxes([
            {pos: new Vector2(-20, 0), radius: 4},
            {pos: new Vector2(-16, 0), radius: 4},
            {pos: new Vector2(-12, 0), radius: 4},
            {pos: new Vector2(-8, 0), radius: 4},
            {pos: new Vector2(-4, 0), radius: 4},
            {pos: new Vector2(0, 0), radius: 4},
            {pos: new Vector2(4, 0), radius: 4},
            {pos: new Vector2(8, 0), radius: 4},
            {pos: new Vector2(12, 0), radius: 4},
            {pos: new Vector2(16, 0), radius: 4},
            {pos: new Vector2(20, 0), radius: 4},
        ]);
    }
}

class WandFireballProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "wand_fireball";
        this.set_hitboxes([
            {pos: new Vector2(0, 0), radius: 16},
        ]);
    }

    make_explosion() {
        let proj = new GrenadeExplosionProjectile(
            this.board,
            this.source, this.source_weapon_index,
            this.position, this.damage, 1.5
        );

        proj.can_hit_allied = false;
        proj.can_hit_source = false;

        play_audio("explosion2");

        this.board.spawn_projectile(proj, this.position);
    }

    hit_other_projectile(other_projectile) {
        this.make_explosion();
        this.active = false;
    }

    get_parried(by) {
        this.make_explosion();
        this.active = false;
    }

    hit_ball(ball, delta_time) {
        this.make_explosion();
        this.active = false;
    }
}

class AxeAwakenProjectile extends StraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed);
    
        this.sprite = "axe_projectile";
        this.set_hitboxes([
            {pos: new Vector2(6, 0), radius: 12},

            {pos: new Vector2(3, 12), radius: 12},
            {pos: new Vector2(0, 24), radius: 12},
            
            {pos: new Vector2(3, -12), radius: 12},
            {pos: new Vector2(0, -24), radius: 12},
        ]);

        this.parriable = false;
    }

    hit_other_projectile(other_projectile) {
        this.active = true;
    }

    get_parried(by) {
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        this.active = true;
    }
}

class ShotgunProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position, width, col) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = width;
        this.sprite_colour = col.css();
    
        this.parriable = false;
    }
}

class SpearProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "spear_projectile";
        this.set_hitboxes([
            {pos: new Vector2(108 - 64, 0), radius: 4},
            {pos: new Vector2(96 - 64, 0), radius: 8},
            {pos: new Vector2(80 - 64, 0), radius: 8},
            {pos: new Vector2(68 - 64, 0), radius: 4},
            {pos: new Vector2(60 - 64, 0), radius: 4},
            {pos: new Vector2(52 - 64, 0), radius: 4},
            {pos: new Vector2(44 - 64, 0), radius: 4},
            {pos: new Vector2(36 - 64, 0), radius: 4},
            {pos: new Vector2(28 - 64, 0), radius: 4},
            {pos: new Vector2(20 - 64, 0), radius: 4},
            {pos: new Vector2(12 - 64, 0), radius: 4},
        ]);
    }
}

class RosaryHealingBurstProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, size) {
        super(board, source, source_weapon_index, position, 0, size, 1, "healing_burst");

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(0, 0), radius: 24}],
            [{pos: new Vector2(0, 0), radius: 36}],
            [{pos: new Vector2(0, 0), radius: 48}],
            [{pos: new Vector2(0, 0), radius: 48}],
            [{pos: new Vector2(0, 0), radius: 48}],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]

        this.can_hit_allied = true;
        this.can_hit_source = false;
        this.can_hit_enemy = false;

        this.has_played_sound = false;
    }

    hit_ball(ball, delta_time) {
        // do not call super
        this.ignore_balls.add(ball.id);

        this.active = true;

        if (ball.hp < ball.max_hp && !this.has_played_sound) {
            this.has_played_sound = true;
            play_audio("jump");
        }

        this.source.hit_heal(ball);
    }
}

class FishingRodFireBlast extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, size, burn_amt) {
        super(board, source, source_weapon_index, position, 0, size, 0.6, "fire_blast");

        this.hitboxes_by_frame = [
            [],
            [{pos: new Vector2(0, 0), radius: 6}],
            [{pos: new Vector2(0, 0), radius: 12}],
            [{pos: new Vector2(0, 0), radius: 18}],
            [{pos: new Vector2(0, 0), radius: 24}],
            [],
            [],
        ]

        this.can_hit_allied = false;
        this.can_hit_source = false;
        this.can_hit_enemy = true;

        this.has_played_sound = false;

        this.burn_amt = burn_amt;
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        this.source.apply_burn(ball, this.burn_amt);
    }
}


class PanFoodProjectile extends Projectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, 0, size, direction, speed);

        this.burn_amt = damage;

        this.gravity = gravity;
        this.proj_velocity = this.direction.mul(this.speed);

        this.proj_velocity = this.proj_velocity.add(inertia);

        this.sprite = `burger`;

        this.hitboxes = [];
    
        this.active_hitboxes = [];
        this.hitboxes_active_timeout = 0.05;

        this.rotation_speed = random_float(135, 270, this.board.random);

        // random starting rotation
        this.set_dir(random_on_circle(1, this.board.random));

        this.reversed = reversed;

        this.heal = heal;

        this.bounces_max = bounces;
        this.bounces = this.bounces_max;

        this.source_hit_timeout = 1;

        this.can_hit_allied = true;
        this.allied_parriable = false;

        this.can_hit_source = false;
        this.can_hit_source_projs = false;
    }

    physics_step(time_delta) {
        this.hitboxes_active_timeout -= time_delta;
        if (this.hitboxes_active_timeout <= 0) {
            if (this.hitboxes.length == 0)
                this.set_hitboxes(this.active_hitboxes);
            
            this.hitboxes_active_timeout = Number.POSITIVE_INFINITY;
        }

        this.source_hit_timeout -= time_delta;
        if (this.source_hit_timeout <= 0) {
            this.can_hit_source = true;
            this.source_hit_timeout = Number.POSITIVE_INFINITY;
        }

        this.set_pos(this.position.add(this.proj_velocity.mul(time_delta)));

        this.proj_velocity = this.proj_velocity.add(this.gravity.mul(time_delta));
    
        let new_direction_angle = this.direction_angle + ((this.rotation_speed * (Math.PI / 180)) * (this.reversed ? -1 : 1) * time_delta);
        this.set_dir(new Vector2(1, 0).rotate(new_direction_angle));
    }

    try_bounce() {
        this.active = true;

        if (this.bounces <= 0) {
            this.active = false;
        } else {
            // bounce and disable hitboxes for 0.2s
            this.proj_velocity = random_on_circle(1, this.board.random).add(new Vector2(0, -1.5)).normalize().mul(this.speed);
            this.hitboxes_active_timeout = 0.1;
            this.set_hitboxes([]);
        }
        
        this.bounces--;
    }

    hit_other_projectile(other_projectile) {
        super.hit_other_projectile(other_projectile);
        this.try_bounce();
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);

        if (this.source.allied_with(ball)) {
            ball.gain_hp(this.heal, this.source);
        } else {
            this.source.apply_burn(ball, this.burn_amt);
        }

        this.try_bounce();
    }

    get_parried(by) {
        super.get_parried(by);
        this.try_bounce();
    }
}


class PanAppleProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "apple";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 16},
        ]
    }
}

class PanAvocadoProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "avocado";
        this.active_hitboxes = [
            {pos: new Vector2(-12, 0), radius: 12},
            {pos: new Vector2(6, 0), radius: 20},
        ]
    }
}

class PanBaconProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "bacon";
        this.active_hitboxes = [
            {pos: new Vector2(-24, 0), radius: 10},
            {pos: new Vector2(-12, 0), radius: 10},
            {pos: new Vector2(0, 0), radius: 10},
            {pos: new Vector2(12, -3), radius: 10},
            {pos: new Vector2(24, -6), radius: 10},
        ]
    }
}

class PanBananaProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "banana";
        this.active_hitboxes = [
            {pos: new Vector2(-24, -12), radius: 10},
            {pos: new Vector2(-22, 0), radius: 10},
            {pos: new Vector2(0, 12), radius: 10},
            {pos: new Vector2(12, 14), radius: 10},
            {pos: new Vector2(24, 18), radius: 10},
        ]
    }
}

class PanBurgerProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "burger";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 34},
        ]
    }
}

class PanCarrotProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "carrot";
        this.active_hitboxes = [
            {pos: new Vector2(8, -16), radius: 4},
            {pos: new Vector2(4, -8), radius: 6},
            {pos: new Vector2(0, 0), radius: 6},
            {pos: new Vector2(-4, 8), radius: 6},
            {pos: new Vector2(-8, 16), radius: 4},
        ]
    }
}

class PanCeleryProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "celery";
        this.active_hitboxes = [
            {pos: new Vector2(10, -16), radius: 8},
            {pos: new Vector2(4, 0), radius: 8},
            {pos: new Vector2(0, 16), radius: 8},
            {pos: new Vector2(-8, 16), radius: 8},
            {pos: new Vector2(-14, 20), radius: 8},
        ]
    }
}

class PanCoconutProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "coconut";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 28},
        ]
    }
}

class PanCucumberProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "cucumber";
        this.active_hitboxes = [
            {pos: new Vector2(-24, 8), radius: 10},
            {pos: new Vector2(-12, 4), radius: 10},
            {pos: new Vector2(0, 0), radius: 10},
            {pos: new Vector2(12, -5), radius: 10},
            {pos: new Vector2(24, -10), radius: 10},
        ]
    }
}

class PanDubiousDelicacyProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "dubious delicacy";
        this.active_hitboxes = [
            {pos: new Vector2(-16, 0), radius: 24},
            {pos: new Vector2(16, 0), radius: 24},
        ]
    }
}

class PanEggProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "egg";
        this.active_hitboxes = [
            {pos: new Vector2(4, -14), radius: 16},
            {pos: new Vector2(6, 6), radius: 16},
            {pos: new Vector2(-8, 12), radius: 12},
        ]
    }
}

class PanGoldfishProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "goldfish";
        this.active_hitboxes = [
            {pos: new Vector2(-8, 0), radius: 6},
            {pos: new Vector2(4, 0), radius: 8},
        ]
    }
}

class PanLoafProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "loaf";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 28},
        ]
    }
}

class PanMeatProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "meat";
        this.active_hitboxes = [
            {pos: new Vector2(-18, 0), radius: 10},
            {pos: new Vector2(0, 0), radius: 12},
            {pos: new Vector2(16, 0), radius: 16},
        ]
    }
}

class PanMushroomProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "mushroom";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 24},
        ]
    }
}

class PanPancakesProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "pancakes";
        this.active_hitboxes = [
            {pos: new Vector2(-20, 3), radius: 14},
            {pos: new Vector2(0, 0), radius: 20},
            {pos: new Vector2(20, 3), radius: 14},
        ]
    }
}

class PanPepperProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "pepper";
        this.active_hitboxes = [
            {pos: new Vector2(-14, 12), radius: 12},
            {pos: new Vector2(0, 0), radius: 12},
            {pos: new Vector2(12, -10), radius: 12},
        ]
    }
}

class PanSoupProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "soup";
        this.active_hitboxes = [
            {pos: new Vector2(-10, 2), radius: 14},
            {pos: new Vector2(10, 2), radius: 14},
        ]
    }
}

class PanSushiProjectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "sushi";
        this.active_hitboxes = [
            {pos: new Vector2(0, 0), radius: 16},
        ]
    }
}

class Pan_Projectile extends PanFoodProjectile {
    constructor(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed) {
        super(board, source, source_weapon_index, position, damage, heal, size, direction, speed, gravity, bounces, inertia, reversed);

        this.sprite = "_";
        this.active_hitboxes = [
            {pos: new Vector2(-24, 0), radius: 10},
            {pos: new Vector2(-12, 0), radius: 10},
            {pos: new Vector2(0, 0), radius: 10},
            {pos: new Vector2(12, -3), radius: 10},
            {pos: new Vector2(24, -6), radius: 10},
        ]
    }
}

class CardsCardOrbitalProjectile extends Projectile {
    constructor(board, source, source_weapon_index, size, damage, sprite_index, angle_offset, rotation_speed, orbit_distance) {
        super(board, source, source_weapon_index, Vector2.zero, damage, size, new Vector2(1, 0), 0);

        this.sprite = entity_sprites.get("playingcard")[sprite_index];

        this.set_hitboxes([
            {pos: new Vector2(0, -10), radius: 16},
            {pos: new Vector2(0, 0), radius: 16},
            {pos: new Vector2(0, 10), radius: 16},
        ])

        this.angle_offset = angle_offset;
        this.rotation_speed = rotation_speed;
        this.orbit_distance = orbit_distance;

        this.ease_in_time = 1;

        this.parriable = false;

        this.lifetime = 0;

        /*
        this.velocity = random_on_circle(10, this.board.random);
        this.friction = 20000;
        this.force = 125000;
        this.minforce = this.force * 0.5;
        this.maxdist = 1024;
        this.maxvel = 10000;
        */
    }

    physics_step(time_delta) {
        // do nothing
        if (this.source.hitstop > 0) {
            // time_delta *= HITSTOP_DELTATIME_PENALTY;
        }

        // this.set_pos(this.position.add(this.velocity.mul(time_delta)));
        this.lifetime += time_delta;

        let angle = this.angle_offset + (this.rotation_speed * this.lifetime);
        let pos = this.source.position.add(new Vector2(this.orbit_distance * this.ease_in_time, 0).rotate(angle));

        for (let i=0; i<4; i++) {
            this.set_pos(this.position.lerp(pos, 1 - compat_pow(0.0001, time_delta)))
        }

        /*
        let friction_force = this.velocity.normalize().mul(-1 * this.friction * time_delta);
        if (friction_force.sqr_magnitude() > this.velocity.sqr_magnitude()) {
            friction_force = this.velocity.mul(-1);
        }

        this.velocity = this.velocity.add(friction_force);

        let angle = this.angle_offset + (this.rotation_speed * this.lifetime);
        let pos = this.source.position.add(new Vector2(this.orbit_distance * this.ease_in_time, 0).rotate(angle));

        let vec_abs = pos.sub(this.position);
        let vec_mag = vec_abs.magnitude();
        if (vec_mag >= 0) {
            let vec = vec_abs.div(vec_mag);
            let dist_factor = 1 - (Math.sqrt(1 - Math.max(0, Math.min(1, vec_mag / this.maxdist))));
            let force_diff = this.force - this.minforce;
            let force_dist = this.minforce + (force_diff * dist_factor);
            let force = vec.mul(force_dist * time_delta);

            this.velocity = this.velocity.add(force);
        }

        let vel_mag = this.velocity.magnitude();
        let new_vel_mag = Math.min(this.maxvel, vel_mag);
        if (new_vel_mag != vel_mag) {
            this.velocity = this.velocity.div(vel_mag).mul(new_vel_mag);
        }
        */

        if (this.source.hp <= 0) {
            this.active = false;
        }
    }

    hit_other_projectile(other_projectile) {
        super.hit_other_projectile(other_projectile);
        this.active = true;
    }

    get_parried(by) {
        super.get_parried(by);
        this.active = true;
    }

    hit_ball(ball, delta_time) {
        super.hit_ball(ball, delta_time);
        this.active = true;
    }

    collide_wall(pos) {
        super.collide_wall(pos);
        this.active = true;
    }
}

class CardsCardBouncingProjectile extends Projectile {
    constructor(board, source, source_weapon_index, size, damage, sprite_index, move_dir, speed) {
        super(board, source, source_weapon_index, Vector2.zero, damage, size, new Vector2(1, 0), speed);

        this.sprite = entity_sprites.get("playingcard")[sprite_index];

        this.set_hitboxes([
            {pos: new Vector2(0, -10), radius: 16},
            {pos: new Vector2(0, 0), radius: 16},
            {pos: new Vector2(0, 10), radius: 16},
        ]);

        this.speed = speed;
        this.move_dir = move_dir;

        this.parriable = false;

        this.particle_delay_max = 0.1;
        this.particle_delay = this.particle_delay_max;
    }

    physics_step(time_delta) {
        this.set_pos(this.position.add(this.move_dir.mul(this.speed * time_delta)));

        if (this.position.x < 0) {
            this.position.x = 0;
            this.move_dir.x *= -1;
        } else if (this.position.x >= this.board.size.x) {
            this.position.x = this.board.size.x;
            this.move_dir.x *= -1;
        }

        if (this.position.y < 0) {
            this.position.y = 0;
            this.move_dir.y *= -1;
        } else if (this.position.y >= this.board.size.y) {
            this.position.y = this.board.size.y;
            this.move_dir.y *= -1;
        }

        this.particle_delay -= time_delta;
        if (this.particle_delay <= 0) {
            this.particle_delay += this.particle_delay_max;

            this.board.spawn_particle(new Particle(
                this.position, 0, this.size / PROJ_SIZE_MULTIPLIER,
                entity_sprites.get("playingcard_glow"), 12,
                9999, false
            ), this.position)
        }
    }

    hit_other_projectile(other_projectile) {
        // each projectile is responsible for destroying itself
        // so piercing projectiles just... don't
        this.active = true;
    }
}

class CardsStraightFlushStrikeProjectile extends Projectile {
    constructor(board, source, source_weapon_index, size, damage, sprites, framespeed, dir) {
        super(board, source, source_weapon_index, Vector2.zero, damage, size, dir, 0);

        this.sprites = sprites;
        this.framecount = this.sprites.length;

        this.cur_frame = 0;
        this.sprite = this.sprites[this.cur_frame];

        this.framespeed = framespeed;

        this.lifetime = 0;

        this.set_hitboxes([
            
        ]);

        this.active_hitboxes = [
            {pos: new Vector2(-10, 10), radius: 10},
            {pos: new Vector2(0, 0), radius: 10},
            {pos: new Vector2(10, 10), radius: 10},
        ]

        this.parriable = false;
    }

    physics_step(time_delta) {
        this.lifetime += time_delta;
        this.cur_frame = Math.floor(this.lifetime * this.framespeed);
        if (this.cur_frame >= this.framecount) {
            this.active = false;
        } else {
            this.sprite = this.sprites[this.cur_frame];
            let new_hitboxes = [];
            if (this.cur_frame >= 3 && this.cur_frame <= 5) {
                new_hitboxes = this.active_hitboxes;
            }

            if (this.hitboxes.length != new_hitboxes.length) {
                this.set_hitboxes(new_hitboxes);
            }
        }
    }
}

class TranslocatorExitProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, size, damage) {
        super(board, source, source_weapon_index, position, damage, size, 7 * 0.05, "teleport_exit");

        this.hitboxes_by_frame = [
            [{pos: new Vector2(0, 0), radius: 12}],
            [{pos: new Vector2(0, 0), radius: 14}],
            [{pos: new Vector2(0, 0), radius: 18}],
            [{pos: new Vector2(0, 0), radius: 20}],
            [{pos: new Vector2(0, 0), radius: 23}],
            [],
            [],
            [],
        ]

        this.can_hit_allied = false;
        this.can_hit_source = false;
        this.can_hit_enemy = true;

        this.has_played_sound = false;

        this.alternative_layer = "fg1";
    }
}

class TranslocatorEntryProjectile extends PersistentAoEProjectile {
    constructor(board, source, source_weapon_index, position, size, damage) {
        super(board, source, source_weapon_index, position, damage, size, 13 * 0.05, "teleport_enter");

        this.hitboxes_by_frame = [
            [],
            [],
            [{pos: new Vector2(0, 0), radius: 12}],
            [{pos: new Vector2(0, 0), radius: 14}],
            [{pos: new Vector2(0, 0), radius: 18}],
            [{pos: new Vector2(0, 0), radius: 20}],
            [{pos: new Vector2(0, 0), radius: 23}],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ]

        this.can_hit_allied = false;
        this.can_hit_source = false;
        this.can_hit_enemy = true;

        this.has_played_sound = false;
        
        this.alternative_layer = "fg1";
    }
}

class TranslocatorKnifeProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "knife";
        this.set_hitboxes([
            {pos: new Vector2(-12, 0), radius: 8},
            {pos: new Vector2(0, 0), radius: 6},
            {pos: new Vector2(8, 0), radius: 6},
            {pos: new Vector2(18, 0), radius: 3},
        ]);
    }
}

class WrenchLV4HitscanProjectile extends HitscanProjectile {
    constructor(board, source, source_weapon_index, position, damage, target_position) {
        super(board, source, source_weapon_index, position, damage, target_position);

        this.max_width = 8;
        this.sprite_colour = "#9ff";
    }
}

class HammerHojProjectile extends InertiaRespectingStraightLineProjectile {
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel) {
        super(board, source, source_weapon_index, position, damage, size, direction, speed, inertia_vel);
    
        this.sprite = "hoj_dash";
        this.set_hitboxes([
            {pos: new Vector2(-12, 0), radius: 24},
        ]);

        this.particle_cd_max = 0.01;
        this.particle_cd = this.particle_cd_max;

        this.parriable = false;
        this.collides_other_projectiles = false;
    }

    physics_step(time_delta) {
        super.physics_step(time_delta);

        // find the nearest ball and rotate towards it
        let cur_dir = this.direction.mul(this.speed);

        // add a flat value to it (scaled by time_delta)
        let closest_enemy = [...this.board.balls.filter(b => this.can_hit_ball(b))].reduce((p, c) => {
            return !p || (p[1] > c.position.sqr_distance(this.position)) ? [c, c.position.sqr_distance(this.position)] : p
        }, null);

        if (closest_enemy) {
            let vec = closest_enemy[0].position.sub(this.position).normalize();

            cur_dir = cur_dir.add(vec.mul(160000 * time_delta));
            cur_dir = cur_dir.mul(Math.pow(0.006, time_delta))
        }

        // recalculate speed and direction
        this.speed = cur_dir.magnitude();
        this.set_dir(cur_dir.normalize());

        this.particle_cd -= time_delta;
        while (this.particle_cd < 0) {
            this.particle_cd += this.particle_cd_max;

            let pos = this.position.add(this.direction.mul(-12 * this.size, 0));

            this.board.spawn_particle(new Particle(
                pos, this.direction_angle, this.size / PROJ_SIZE_MULTIPLIER, entity_sprites.get("hoj_dash"), 24, 1, false, 0, true
            ), pos).add_component(new FadeOutParticleComponent(this.board, 0, 1));
        }
    }

    hit_ball(ball, delta_time) {
        this.ignore_balls.add(ball.id);
        this.active = true;
    }
}

let main_selectable_balls = [
    DummyBall,
    HammerBall, SordBall, DaggerBall,
    BowBall, MagnumBall, NeedleBall,
    RailgunBall, PotionBall, GrenadeBall,
    GlassBall, HandBall, ChakramBall,
    WandBall, AxeBall, ShotgunBall,
    SpearBall, RosaryBall, FishingRodBall,
    FryingPanBall, CardsBall, TranslocatorBall,
    DrillBall, WrenchBall
]