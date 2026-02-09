const AWAKEN_LEVEL = 99;
const WEAPON_SIZE_MULTIPLIER = 16;
const PROJ_SIZE_MULTIPLIER = 16;

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
    }
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
        desc: "Noticeably stronger over A-tier balls.",
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
    SILLY: "SILLY",
    POWERED: "POWERED",
}

const CATEGORIES_INFO = {
    [CATEGORIES.STANDARD]: {
        desc: "Follows the rules and usually has a consistent power level.",
        col: Colour.white,
    },
    [CATEGORIES.SILLY]: {
        desc: "Usually made initially as a joke. Often inconsistent in power level or slightly crazy.",
        col: new Colour(255, 128, 255, 255),
    },
    [CATEGORIES.POWERED]: {
        desc: "Uses game-aware movement like homing, auto-aim or dodging. Almost always very strong.",
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

        this.name = "No Weapon";
        this.description_brief = "Does nothing. Unarmed, but not the awesome kind.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "I won? I won! How'd I win?!";

        this.tier = TIERS.DISMAL;
        this.category = CATEGORIES.STANDARD;
        this.tags = [TAGS.UNTAGGED];

        this.entry_animation = "impact";
        this.entry_animation_offset = ANIMATION_STANDARD_DATA[this.entry_animation].offset;
        this.entry_animation_keyframes = ANIMATION_STANDARD_DATA[this.entry_animation].keyframes;

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
        
        this.takes_damage = true;

        this.invuln_duration = 0;
        this.hitstop = 0;
    
        this.reversed = reversed ? true : false;

        this.last_hit = 0;  // 0 means damage, 1 means parry
        this.level = level;

        this.show_stats = true;
        this.display = true;
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

        this.desc_colour = null;
        this.alt_colour = null;
        this.border_colour = null;
        this.border_alt_colour = null;
        this.update_col_datas();

        this.alt_flash_freq = 1;
        this.alt_flash_dur = 0.2;
        this.render_alt = false;

        this.linked_hat_particle = null;

        this.aero_light_lookup_table = null;
        this.aero_radius_table = null;

        if (!skip_aero_lookup)
            this.setup_aero_light_lookup_table();

        this.independent_random = get_seeded_randomiser(this.board.random_seed);
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
        if (!this.board.size) {
            this.aero_light_lookup_table = null;
            return;
        }

        let screen_scaling_factor = canvas_width / this.board.size.x;

        let ball_siz_scaled = Math.round(this.radius * screen_scaling_factor);

        let lb = Math.floor(-ball_siz_scaled / 1);
        let ub = Math.ceil(ball_siz_scaled / 1);

        let s = ub - lb;

        switch (AERO_LIGHTING_CONFIG) {
            case AERO_LIGHTING_CONFIGS.SIMPLE: {
                let light_center = [-ball_siz_scaled * 0.05, -ball_siz_scaled * 0.3];

                this.aero_light_lookup_table = [];
                for (let y=0; y<s; y++) {
                    let arr = [];
                    this.aero_light_lookup_table.push(arr);
                    for (let x=0; x<s; x++) {
                        let xt = x - ball_siz_scaled;
                        let yt = y - ball_siz_scaled;

                        let sum = Math.pow(xt, 2) + Math.pow(yt, 2);
                        let dist = Math.sqrt(
                            Math.pow(xt - light_center[0], 2) + Math.pow(yt - light_center[1], 2)
                        );
                        let prop = dist / ball_siz_scaled;

                        arr.push([sum, prop]);
                    }
                }

                break;
            }

            case AERO_LIGHTING_CONFIGS.WHATS_WRONG_BRO: {
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
                ]

                auroras.forEach(a => {
                    a.shiny_diff = a.shiny_max - a.shiny_min;
                    a.shiny_min_sqr = Math.pow(a.shiny_min, 2);
                    a.shiny_max_sqr = Math.pow(a.shiny_max, 2);
                })

                this.aero_light_lookup_table = [];
                for (let y=0; y<s; y++) {
                    let arr = [];
                    this.aero_light_lookup_table.push(arr);
                    for (let x=0; x<s; x++) {
                        let xt = x - ball_siz_scaled;
                        let yt = y - ball_siz_scaled;

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

                        arr.push([sum, prop]);
                    }
                }
                
                break;
            }
        }

        let w = 25 * screen_scaling_factor;
        this.aero_radius_table = [
            Math.pow(this.radius * screen_scaling_factor, 2),
            Math.pow((this.radius * screen_scaling_factor) - (w * 1.2), 2),
            (new Vector2(this.radius, this.radius)),
            Math.round(this.radius * screen_scaling_factor),
        ]
    }

    set_radius(to) {
        this.radius = to;
        this.setup_aero_light_lookup_table();
    }

    set_colour(to_col) {
        this.colour = to_col;
    }

    update_col_datas() {
        this.desc_colour = this.colour.lerp(Colour.white, 0.2);
        this.alt_colour = this.colour.lerp(Colour.white, 0.2);

        this.border_colour = this.colour.lerp(Colour.black, 0.9);
        this.border_alt_colour = this.alt_colour.lerp(Colour.black, 0.9);
    }

    set_skin(skin_name) {
        // do nothing
        // other balls will implement skins as necessary
        // mostly it will replace the weapon sprite and maybe some particle effects
        this.skin_name = skin_name;
    }

    start_writing_desc(ctx, x_anchor, y_anchor) {
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
        this.weapon_step(board, time_delta * this.get_stat("timespeed_mult"));
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

        // move linked hat particle if there is one
        this.update_particles(time_delta);
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

    hit_other(other, with_weapon_index, damage=0) {
        // for this one, the SORD (the only weapon) just hits the other one for 1 damage and nothing else.
        // other balls might want to apply knockback, or do other stuff
        // console.log(`Hit ${other.id} with weapon index ${with_weapon_index}`);
        
        let hitstop = BASE_HITSTOP_TIME;

        let result = other.get_hit(this, damage * this.get_stat("damage_bonus"), hitstop);
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

    die() {
        return {skip_default_explosion: false};
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            "This thing has no stats"
        )

        this.write_desc_line(
            "im serious"
        )
    }
}

class DummyBall extends WeaponBall {
    // transforms into unarmedball when it takes a hit
    static ball_name = "Dummy";
    
    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
        
        this.max_level_description = "Seriously, it doesn't do anythin- wait... no...";

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
        this.shake_shake_duration = this.shake_duration_max - this.shake_shake_start;
        this.shake_flash_start = 3;
        this.shake_flash_duration = this.shake_duration_max - this.shake_flash_start;
        this.shake_current = 0;
        this.shake_intensity_max = 1000;
        this.shake_origin = null;
        this.transforming = false;
        this.done = false;

        this.original_colour = this.colour;

        this.child = null;

        prepare_lazy_audio("unarmed_theme");
    }

    weapon_step(board, time_delta) {
        if (this.transforming && !this.done) {
            this.shake_current += time_delta
            if (this.board.unarmed_cinematic_played) {
                this.shake_current += time_delta * 1000;
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
                        this.board.random
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

                this.child.set_velocity(random_on_circle(25000, this.board.random));

                this.board.unarmed_cinematic_played = true;

                this.hp = 0;
                this.transforming = false;
                this.done = true;
                this.skip_physics = false;
                this.takes_damage = true;

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
            play_music("unarmed_theme");
        }

        this.hp = STARTING_HP;
        this.transforming = true;
        this.shake_origin = this.position;
        this.skip_physics = false;
        this.takes_damage = false;
        this.ignore_bounds_checking = true;
        this.board?.set_timer(new Timer(() => {
            this.skip_physics = false;
            this.takes_damage = false;
            this.hp = STARTING_HP;
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
                let rand = random_float(0, 1, this.board.random);
                if (rand < 0.9) {
                    // do nothihng
                    return c;
                } else if (rand < 0.925) {
                    // set to random symbol
                    return String.fromCharCode(random_int(32, 256, this.board.random));
                } else if (rand < 0.95) {
                    // set to uppercase of original name
                    return this.original_name[i].toUpperCase();
                } else {
                    // set to lowercase of original name
                    return this.original_name[i].toLowerCase();
                }
            }).join("");
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.quote = "I'm sure you understand.\nThe subject of my victory is quite the heavy topic.";

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

        this.weapon_data = [
            new BallWeapon(0.75 + (level * 0), "hamer2", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ])
        ];

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data.push(new BallWeapon(0.75 / 2, "hamer2", [
                {pos: new Vector2(104, 32), radius: 24},
                {pos: new Vector2(104, 48), radius: 24},
                {pos: new Vector2(104, 64), radius: 24},
                {pos: new Vector2(104, 80), radius: 24},
                {pos: new Vector2(104, 96), radius: 24},
            ]));
        }

        this.damage_base = 8 + (0.1 * this.level);
        this.speed_base = 90;
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

        if (this.skin_name == "Squeaky") {
            result.snd = "impact_squeak";
        }

        if (this.skin_name == "Mogul") {
            // make 4-8 monies on hit
            // don't want it to affect randomness, so it's not board.random
            let times = random_int(4, 9, this.independent_random);
            this.spawn_monies(times, with_weapon_index);
        }

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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            "Knocks enemies back when striking them."
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
        this.quote = "I told you about those strikes, bro. I TOLD you.";

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
        this.rotate_weapon(0, this.speed_base * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        this.damage_base += 0.5 * (1 + (this.level * 0.0175));
        this.speed_base += (60 / 4) * (1 + (this.level * 0.015));

        if (this.level >= AWAKEN_LEVEL) {
            this.weapon_data[0].size_multiplier += 0.04 * 16;
        }

        if (this.skin_name == "Faithful") {
            result.snd = "impact_shitty";
        }

        if (this.skin_name == "RAM") {
            result.snd = dmg >= 8 ? "impact_heavy_8bit" : "impact_8bit";
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Hits harder and rotates faster every strike.`, false, 10
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

        this.hit_decay = 0;

        this.projectiles_cooldown = 0;
        this.projectiles_cooldown_max = 0.2;

        this.proj_damage_base = 1;
        this.proj_speed = 0;

        this.hit_decay_max = 1.55 + (0.025 * this.level);

        this.explosions_num = 1;
        this.explosions_range_per_sord = [1,1];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
        this.explosion_delay_speed = 0;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed_base * time_delta);

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

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        this.speed_base *= 2;
        this.damage_base *= 1.5;

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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Bonus decay time: ${this.hit_decay_max.toFixed(1)}`
        )
        this.write_desc_line(
            `Faster rotation speed (x2) and damage (x1.5)`, false, 10
        )
        this.write_desc_line(
            `every strike. Bonus decays when not striking.`, false, 10
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

        this.shot_cooldown_max = 0.85 + (this.level * -0.005);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.write_desc_line(
            `Multishot + damage increases with successful hits.`, false, 10
        )
        this.write_desc_line(
            `Has a weak melee attack: 2 damage.`, false, 10
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

        this.shot_cooldown_max = 0.55 + (this.level * -0.001);
        this.shot_cooldown = this.shot_cooldown_max;

        this.coin_shot_cooldown_max = 0.5 + (this.level * -0.001);
        this.coin_shot_cooldown = this.coin_shot_cooldown_max;
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

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        let result = super.hit_other_with_projectile(other, with_projectile);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.write_desc_line(
            `Shots ricochet off coins for double damage.`, false, 10
        )
        this.write_desc_line(
            `Ricochet shots can't be parried.`, false, 10
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

    hit_other(other, with_weapon_index) {
        let result = super.hit_other(other, with_weapon_index, this.damage_base);

        if (this.level >= AWAKEN_LEVEL) {
            this.apply_poison(other, this.rupture_base, this.poison_duration_base)
        } else {
            this.apply_rupture(other, this.rupture_base);
        }

        return result;
    }

    clone_chance() {
        let c = this.board.random();
        if (this.can_clone && c < this.split_chance) {
            let hp_proportion = Math.floor(this.hp * this.split_ratio);

            if (hp_proportion > 0) {
                let new_ball = new NeedleBall(
                    this.board,
                    this.mass, this.radius, this.colour, this.bounce_factor,
                    this.friction_factor, this.player, this.level, this.reversed,
                    false
                );

                new_ball.hp = hp_proportion * 4;
                new_ball.max_hp = new_ball.hp;
                new_ball.apply_invuln(BALL_INVULN_DURATION);

                if (christmas) {
                    let hat_particle = new Particle(new_ball.position, 0, new_ball.radius / this.radius, entity_sprites.get("festive red hat"), 0, 99999, false);
                    board.spawn_particle(hat_particle, new_ball.position);

                    new_ball.linked_hat_particle = hat_particle;
                }

                if (true) {
                    let hp_lost = hp_proportion - (hp_proportion * this.split_hp_save);

                    this.lose_hp(hp_lost, this);
                }

                new_ball.show_stats = false;

                this.board?.spawn_ball(new_ball, this.position);

                new_ball.add_impulse(random_on_circle(random_float(6000, 10000, this.board.random), this.board.random));

                this.children.push(new_ball);
                new_ball.parent = this;
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

            // schut
            let firing_offset = this.firing_offsets[0].mul(this.weapon_data[0].size_multiplier).rotate(this.weapon_data[0].angle);
            let fire_pos = this.position.add(firing_offset);

            let bullet1_end_pos = new Vector2(1, 0).rotate(this.weapon_data[0].angle).mul(10000).add(fire_pos);
            board.spawn_projectile(
                new RailgunProjectile(
                    this.board,
                    this, 0, fire_pos, this.proj_damage_base,
                    bullet1_end_pos,
                ), fire_pos
            )

            if (this.level >= AWAKEN_LEVEL) {
                firing_offset = this.firing_offsets[0].mul(this.weapon_data[1].size_multiplier).rotate(this.weapon_data[1].angle);
                fire_pos = this.position.add(firing_offset);

                board.spawn_projectile(
                    new RailgunProjectile(
                        this.board,
                        this, 0, fire_pos, this.proj_damage_base,
                        new Vector2(1, 0).rotate(this.weapon_data[1].angle).mul(10000).add(fire_pos),
                    ), fire_pos
                )
            } else {

            }

            if (this.skin_name == "Chicken") {
                play_audio("chicken");
            }
        }
    }

    hit_other(other, with_weapon_index) {
        return super.hit_other(other, with_weapon_index, 1);
    }

    hit_other_with_projectile(other, with_projectile) {
        if (with_projectile.source_weapon_index != 999) {
            this.shot_cooldown = this.shot_cooldown_rapidfire;
            this.speed_base *= 1.5;
            this.hit_decay = 0.6;
        }

        let result = super.hit_other_with_projectile(other, with_projectile);

        if (with_projectile.source_weapon_index != 999) {
            other.apply_invuln(0.015, true);

            for (let i=0; i<8; i++) {
                this.board.spawn_particle(new EnergyBurstParticle(
                    other.position, 0.6, entity_sprites.get("railgun_point"), 0, 16, true,
                    25000, 120000, this, new Colour(18, 175, 175, 255), 4, 2, 0, true
                ), other.position)
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `On shot hit, rotation speed increases,`, false, 10
        )
        this.write_desc_line(
            `and quickly fire another shot.`, false, 10
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

        this.shot_cooldown_max_range = [0.45, 1];
        this.shot_cooldowns = [0, 0, 0, 0].map(_ => random_float(...this.shot_cooldown_max_range, this.board.random));
        this.weapon_regeneration_times = [0,0,0,0];
        this.max_weapon_regeneration_time = 1.6;
        this.potions_smashed = [false, false, false, false];
        this.potion_smash_penalty = 5;

        this.duration_mult = 1.2 + (0.0125 * this.level);

        this.sprite_suffix = "";
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

        this.shot_cooldown_max = 1.58 - (0.005 * this.level);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Strike damage: ${this.damage_base.toFixed(0)}`
        )
        this.write_desc_line(
            `Grenade damage: ${this.grenade_damage_base.toFixed(0)}`
        )
        this.write_desc_line(
            `Grenade self-damage reduction: ${(this.self_grenade_reduction * 100).toFixed(0)}%`
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.write_desc_line(
            `Normal strikes apply rupture instead of damage.`, true, 10
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
    
        this.post_grab_cooldown = 8;
        this.post_block_cooldown = 2;
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
                            this.weapon_data[i].rotate(this.hands_speeds[i] * time_delta, i % 2 == 1);
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
                    this.weapon_data[i].rotate(rad2deg(rot_amt), i % 2 == 1);
                    this.grab_info[i].rotated_so_far += rot_amt;
                    // this.debug_log(`Rotated ${rad2deg(this.grab_info[i].speed * time_delta)}deg, ${rad2deg(this.grab_info[i].amount_to_rotate - this.grab_info[i].rotated_so_far)}deg remaining`)

                    this.grab_info[i].ball.weapon_data.forEach(w => {
                        w.angle += rot_amt * (i % 2 == 0 ? 1 : -1)
                    });

                    this.grab_info[i].ball.cache_weapon_offsets();
                    this.grab_info[i].ball.cache_hitboxes_offsets();

                    if (this.grab_info[i].rotated_so_far >= (this.grab_info[i].amount_to_rotate + (Math.PI / 8))) {
                        let rollback = this.grab_info[i].rotated_so_far - this.grab_info[i].amount_to_rotate;
                        let throwball = this.grab_info[i].ball;
                        
                        this.weapon_data[i].rotate(rad2deg(rollback), i % 2 == 0);
                        throwball.weapon_data.forEach(w => {
                            w.angle += rollback * (i % 2 == 0 ? 1 : -1)
                        });

                        // throw it. for now just drop it to show we're doing something
                        this.debug_log("Thrown!");
                        this.hands_sprites[i] = "hand_tired";
                        this.tired_delays[i] = this.post_grab_cooldown;

                        this.weapon_data[i].offset = new Vector2(0, 0);
                        this.weapon_data[i].size_multiplier = this.hand_size * WEAPON_SIZE_MULTIPLIER * 0.8;

                        // We can get the wall to select by getting the current angle of the weapon
                        throwball.apply_hitstop(1);

                        let vec = new Vector2(0, 1 * (i % 2 == 0 ? 1 : -1)).rotate(this.weapon_data[i].angle);
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
                                cpos, this.weapon_data[i].angle + ((i % 2 == 0 ? 1 : -1) * Math.PI/2),
                                size_factor, HandBall.lightning_parts, 4 / delay, 
                                999, false, 0 + (times * delay)
                            );

                            board.spawn_particle(part, cpos);
                            
                            times++;
                            cpos = cpos.add(vec.mul(128 * size_factor * PARTICLE_SIZE_MULTIPLIER));
                        }

                        throwball.display = false;
                        this.debug_log(`${throwball.id} phasing out`);

                        let timer = new Timer(
                            board => {
                                this.debug_log(`${throwball.id} phasing back in`);
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

            this.weapon_data[i].sprite = this.hands_sprites[i] + (i % 2 == 0 ? "" : "_r");
        }


        for (let d_i=0; d_i<deletion_indices.length; d_i++) {
            let i = deletion_indices[d_i];

            let offset = this.get_weapon_offset(i).mul(2);
            let pos = this.position.add(offset);
            let part = new Particle(
                pos, this.weapon_data[i].angle + (Math.PI / 2), 1,
                entity_sprites.get("explosion3"),
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
        let rotation_sign = with_weapon_index % 2 == 0 ? 1 : -1;

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
                    if (with_weapon_index % 2 == 0) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // right
                    target = this.board.size.x;
                    if (with_weapon_index % 2 == 1) {
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
                    if (with_weapon_index % 2 == 0) {
                        score_bias = 0.5;
                    } else {
                        score_bias = 2;
                    }
                } else {
                    // down
                    target = this.board.size.y;
                    if (with_weapon_index % 2 == 1) {
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.chakram_orbit_time = 3.6 + (0.025 * level);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Wand";
        this.description_brief = "Has a wand that uses one of 5 random spells each time it activates - a spread of icicles, a fireball, a salvo of bouncing poison barbs, chaining lightning or, rarely, a terrifying, dense black ball.";
        this.level_description = "Reduces the delay between spell casts.";
        this.max_level_description = "Upgrades each spell - more icicles, larger fireball, barbs hit up to twice, more lightning chains, more damaging black ball.";
        this.quote = "Chat did you see that guy lmao what a loser";

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

                        let part = new Particle(new_ball.position, 0, 1, entity_sprites.get("wand_poison_barb"), 0, 999999);
                        board.spawn_particle(part, new_ball.position);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
            this.current_spell == "white" ? "white" : "grey"
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

        this.lunge_cooldowns_max = [1.8 - (0.005 * level), 3.6 - (0.02 * level)];
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

        this.shot_cooldown_max = 0.775;
        this.shot_cooldown = this.shot_cooldown_max;

        this.num_bullets = 8;
        if (this.level >= AWAKEN_LEVEL) {
            this.num_bullets *= 2;
        }

        this.width_range = [12, 20];

        this.bullet_spread = deg2rad(22.5);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Bullet damage: ${this.proj_damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Gun rotation speed: ${this.speed_base.toFixed(0)} deg/s`
        )
        this.write_desc_line(
            `Significant knockback on each shot.`
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
        this.quote = "I knew you could do it, little spear!\nI'm gonna put you in a display case so all the others can learn from you!";

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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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
        this.club_damage = 8;

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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "Frying Pan";
        this.description_brief = "Cooks up delicious delicacies that heal allies or self and burn enemies. The pan does a lot of damage on hit too!";
        this.level_description = "Reduces cooking time and increases the chance of making multiple foods at once.";
        this.max_level_description = "+1 base delicacy per toss. Delicacies bounce on hit, giving them a chance to hit again.";
        this.quote = "You disrupted my energy balance. I had to do this.";

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

        this.pan_toss_time_max = [0.5, 0.7];
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

        this.damage_base = 6;
        this.speed_base = 100;

        this.proj_damage_base = 0.3;
        this.proj_heal_base = 3;

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
                        ), pos)
                    }
                }
            } else {
                this.toss_projectile_delay = this.toss_projectile_delay_max;
                this.speed_modifier = this.pan_toss_speed_modifier;
            }
        }
    }

    hit_other(other, with_weapon_index) {
        // additionally knock the other ball away
        let dmg = this.damage_base;

        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "frying_pan";
        result.gain = 0.04;

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
        }

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

        this.shuffle_delay_max = 1 - (this.level * 0.0075);
        this.shuffle_delay = this.shuffle_delay_max;

        this.draws = 0;
        this.draws_max = 1 + Math.floor((this.level+1) / 25);

        this.handsize = 7;

        this.luck_lookahead_cnt = this.handsize;
        this.luck_lookahead_amt = 1;
        if (this.level >= AWAKEN_LEVEL) {
            this.luck_lookahead_amt += 8;
        }

        this.orbital_dmg = 2;
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
        this.pair_proj_damage = 5;
        this.pair_proj_speed = 10000;
        this.pair_rank_speed_bonus = 500;

        this.twopair_proj_damage = 6;

        this.threekind_chain_lightning_chain_chance = 0.275;
        this.threekind_chain_lightning_damage = 6;
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
            while (this.draw_delay <= 0) {
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
                                        b.hp -= random_int(0, 2, board.random);
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

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

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

class Projectile {
    // projectiles have a position, a damage stat, a direction, speed and some hitboxes
    static id_inc = 0;
    
    constructor(board, source, source_weapon_index, position, damage, size, direction, speed) {
        this.id = Projectile.id_inc;
        Projectile.id_inc++;
        
        this.active = true;
        
        // {pos, radius} same as balls
        this.hitboxes = [];

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

        this.parriable = false;
        this.collides_other_projectiles = false;

        this.lifetime = 0;
        this.duration = duration;
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

let main_selectable_balls = [
    DummyBall,
    HammerBall, SordBall, DaggerBall,
    BowBall, MagnumBall, NeedleBall,
    RailgunBall, PotionBall, GrenadeBall,
    GlassBall, HandBall, ChakramBall,
    WandBall, AxeBall, ShotgunBall,
    SpearBall, RosaryBall, FishingRodBall,
    FryingPanBall, CardsBall
]