game_id = "plorp2";

const SAVE_KEY = "plorp2_savedata";

let scaling = {};
let zoom_level = 4;
let view_offset = Vector2.zero;

scaling.screen_scaling_factor = 1;
scaling.true_zoom_level = 1;
scaling.stwp = v => Vector2.zero;
scaling.wtsp = v => Vector2.zero;
scaling.ttwp = v => Vector2.zero;
scaling.wttp = v => Vector2.zero;
scaling.ttsp = v => scaling.wtsp(scaling.ttwp(v));
scaling.sttp = v => scaling.stwp(scaling.wttp(v));

const BASE_TILE_SCALE = 32;

const PARTICLE_SIZE_MULTIPLIER = 32;
const PARTICLE_TYPE = {
    NORMAL: 0,
    TEXT: 1,
    LINE: 2,
}

const MAX_VISIBLE_UPGRADES = 10;
const MAX_POWERCUBE_VISIBLE_UPGRADES = 6;

let ITEM_GAIN_DISPLAY_MAX_TIME = 8000;
let ITEM_GAIN_DISPLAY_MOVE_TIME = 750;
let ITEM_GAIN_DISPLAY_EXIT_TIME = ITEM_GAIN_DISPLAY_MAX_TIME - ITEM_GAIN_DISPLAY_MOVE_TIME;
let item_gain_displays = new Map();

let last_autosave_time = Date.now();
let AUTOSAVE_DELAY = 60 * 1000;

let shake_elems = [];

function refresh_wtsp_stwp(override_canvas_width=null) {
    let t_screen_scaling_factor = 1;
    let t_true_zoom_level = zoom_level * t_screen_scaling_factor;

    let t_wtsp = vec => vec.add(view_offset).mul(t_true_zoom_level);
    let t_stwp = vec => vec.div(t_true_zoom_level).sub(view_offset);

    let t_ttwp = vec => vec.mul(BASE_TILE_SCALE);
    let t_wttp = vec => vec.div(BASE_TILE_SCALE);

    let t_ttsp = v => t_wtsp(t_ttwp(v));
    let t_sttp = v => t_wttp(t_stwp(v));

    let obj = {
        screen_scaling_factor: t_screen_scaling_factor,
        true_zoom_level: t_true_zoom_level,
        wtsp: t_wtsp,
        stwp: t_stwp,

        ttwp: t_ttwp,
        wttp: t_wttp,

        ttsp: t_ttsp,
        sttp: t_sttp,
    }

    scaling = obj;
}

const TileResource = {
    BEDROCK: "Bedrock",

    CHALK: "Chalk",
    SAND: "Sand",

    AMBER: "Amber",
    AMETHYST: "Amethyst",
    PERIDOT: "Peridot",
    RUBY: "Ruby",

    CHALCOPYRITE: "Chalcopyrite",
    MALACHITE: "Malachite",
    AZURITE: "Azurite",
    CUPRITE: "Cuprite",
    COVELLITE: "Covellite",
    NATIVE_COPPER: "Native Copper",

    SIDERITE: "Siderite",
    LIMONITE: "Limonite",
    HEMATITE: "Hematite",
    MAGNETITE: "Magnetite",
}

const Item = {
    // Trash rocks
    GRANITE: "Granite",

    // Non-trash rocks
    CHALK: "Chalk",
    CLAY: "Clay",
    OBSIDIAN: "Obsidian",

    // Gems
    AMBER: "Amber",
    AMETHYST: "Amethyst",
    PERIDOT: "Peridot",
    RUBY: "Ruby",

    // Ores
    // Copper
    CHALCOPYRITE: "Chalcopyrite",
    MALACHITE: "Malachite",
    AZURITE: "Azurite",
    CUPRITE: "Cuprite",
    COVELLITE: "Covellite",

    // Iron
    SIDERITE: "Siderite",
    LIMONITE: "Limonite",
    HEMATITE: "Hematite",
    MAGNETITE: "Magnetite",

    // Pure metal nuggets
    COPPER_NUGGET: "Copper Nugget",

    // Ingots
    
    // Etc
}

const ItemRarity = {
    JUNK: -1,
    COMMON: 0,
    UNCOMMON: 1,
    RARE: 2,
    MYTHICAL: 3,
    LEGENDARY: 4,
    ANCIENT: 5,
}

const ItemRarityData = {
    [ItemRarity.JUNK]: {
        name: "JUNK",
        col: Colour.from_hex("#bbb"),
    },

    [ItemRarity.COMMON]: {
        name: "COMMON",
        col: Colour.from_hex("#fff"),
    },

    [ItemRarity.UNCOMMON]: {
        name: "UNCOMMON",
        col: Colour.from_hex("#6f6"),
    },

    [ItemRarity.RARE]: {
        name: "RARE",
        col: Colour.from_hex("#8cf"),
    },

    [ItemRarity.MYTHICAL]: {
        name: "MYTHICAL",
        col: Colour.from_hex("#a4f"),
    },

    [ItemRarity.LEGENDARY]: {
        name: "LEGENDARY",
        col: Colour.from_hex("#ed8"),
    },

    [ItemRarity.ANCIENT]: {
        name: "ANCIENT",
        col: Colour.from_hex("#f53"),
    },
}

const ItemData = {
    // Granite
    [Item.GRANITE]: {
        gold_value: 1,
        rarity: ItemRarity.JUNK,
    },

    // Rocks
    [Item.CHALK]: {
        gold_value: 2,
        rarity: ItemRarity.COMMON,
    },

    // Gems
    [Item.AMBER]: {
        gold_value: 100,
        rarity: ItemRarity.UNCOMMON
    },

    [Item.AMETHYST]: {
        gold_value: 500,
        rarity: ItemRarity.UNCOMMON
    },

    [Item.PERIDOT]: {
        gold_value: 1000,
        rarity: ItemRarity.RARE
    },

    [Item.RUBY]: {
        gold_value: 2500,
        rarity: ItemRarity.RARE
    },


    // Copper
    [Item.CHALCOPYRITE]: {
        gold_value: 5,
        rarity: ItemRarity.COMMON,
    },

    [Item.MALACHITE]: {
        gold_value: 50,
        rarity: ItemRarity.COMMON,
    },

    [Item.AZURITE]: {
        gold_value: 100,
        rarity: ItemRarity.UNCOMMON,
    },

    // Iron
    [Item.SIDERITE]: {
        gold_value: 15,
        rarity: ItemRarity.COMMON,
    },
}

const Currency = {
    GOLD: "Gold",
    POWERCUBES: "Powercubes",
}

const CurrencyIcons = {
    [Currency.GOLD]: "◕",
    [Currency.POWERCUBES]: "❒",
}

// const TrashRockSpawnSettings = [
//     {
//         rock: Item.GRANITE,
//         depth_center: 0
//     }
// ]

class TileResourceInfoEntry {
    constructor(colour, loot_table, rarity_modifier, hp_bonus, armour_bonus) {
        this.colour = colour;
        this.loot_table = balance_weighted_array(loot_table);
        this.rarity_modifier = rarity_modifier;
        this.hp_bonus = hp_bonus;
        this.armour_bonus = armour_bonus;
    }
}

// const TrashRockColours = {
//     [Item.GRANITE]: Colour.from_hex("#837E7C"),
//     [Item.CLAYSTONE]: Colour.from_hex("#837E7C"),
//     [Item.BASALT]: Colour.from_hex("#837E7C"),
//     [Item.DIORITE]: Colour.from_hex("#837E7C"),
// }

const TILE_BASE_MAX_HP = 16;
const TILE_BASE_ARMOUR = 0;
const GRANITE_CHANCE_PER_HIT = 0.5;
const TileResourceInfo = {
    [TileResource.BEDROCK]: new TileResourceInfoEntry(
        Colour.from_hex("#111"), [], 0, 10000000 - TILE_BASE_MAX_HP, 10000000
    ),

    // Rocks
    [TileResource.CHALK]: new TileResourceInfoEntry(
        Colour.from_hex("#eeeeee"), [
            [1, Item.CHALK],
        ], 1, 100, 5
    ),

    [TileResource.SAND]: new TileResourceInfoEntry(
        Colour.from_hex("#e5c69d"), [
            
        ], 1, 30, 0
    ),

    // Gems
    [TileResource.AMBER]: new TileResourceInfoEntry(
        Colour.from_hex("#ffe43a"), [
            [1, Item.AMBER]
        ], 0.03, 50, 50
    ),

    [TileResource.AMETHYST]: new TileResourceInfoEntry(
        Colour.from_hex("#b082e4"), [
            [1, Item.AMETHYST]
        ], 0.02, 50, 100
    ),

    [TileResource.PERIDOT]: new TileResourceInfoEntry(
        Colour.from_hex("#b4c39c"), [
            [1, Item.PERIDOT]
        ], 0.01, 50, 250
    ),

    [TileResource.RUBY]: new TileResourceInfoEntry(
        Colour.from_hex("#bc6675"), [
            [1, Item.RUBY]
        ], 0.005, 50, 500
    ),

    // Copper
    [TileResource.CHALCOPYRITE]: new TileResourceInfoEntry(
        Colour.from_hex("#C68346"), [
            [1, Item.CHALCOPYRITE]
        ], 1, 2500, 15
    ),
    [TileResource.MALACHITE]: new TileResourceInfoEntry(
        Colour.from_hex("#0bda51"), [
            [1, Item.MALACHITE]
        ], 0.8, 10000, 50
    ),
    [TileResource.AZURITE]: new TileResourceInfoEntry(
        Colour.from_hex("#3568a2"), [
            [1, Item.AZURITE]
        ], 0.6, 30000, 100
    ),

    // Iron
    [TileResource.SIDERITE]: new TileResourceInfoEntry(
        Colour.from_hex("#b7a87e"), [
            [1, Item.SIDERITE]
        ], 0.9, 4000, 20
    ),
}

class ResourceVeinGenerationSettings {
    constructor(tile_resources, chance_min, chance_max, depth_min, depth_max, richness_min, richness_max, richness_variance_all, richness_variance_per, depth_max_size_mul, size_min, size_max, skew_min, skew_max) {
        this.tile_resources = balance_weighted_array(tile_resources);

        // Chance min at min depth, max at max depth, then nothing after
        this.chance_min = chance_min;
        this.chance_max = chance_max;

        // Depth means distance from origin
        this.depth_min = depth_min;
        this.depth_max = depth_max;

        // Richness min at min depth, max at max depth.
        // Variance 0-1; determines random amount to lerp in a random direction after calc. initial richness
        // Lerp is to 0 or 1, whatever is closest, versus the equivalent amount in the other direction
        // So 0.9 => 0.8 - 1
        // 0.4 => 0 - 0.8
        // All is for entire vein, then per is for each tile
        // Distance modifier is applied before _per, but after _all
        this.richness_min = richness_min;
        this.richness_max = richness_max;
        this.richness_variance_all = richness_variance_all;
        this.richness_variance_per = richness_variance_per;

        // Flat modifier, *0 at depth_min and *1 at depth_max
        this.depth_max_size_mul = depth_max_size_mul;

        // True random - not based on depth
        this.size_min = size_min;
        this.size_max = size_max;

        // Multiply a random one of height or width by a random value between these two numbers
        this.skew_min = skew_min;
        this.skew_max = skew_max;
    }
}

class ResourceVein {
    constructor(tile_resources, x, y, width, height, rotation, richness, richness_variance_per) {
        this.tile_resources = tile_resources
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;

        this.richness = richness;
        this.richness_variance_per = richness_variance_per;

        this.seed = this.get_seed();
    }

    get_seed() {
        return `${this.x}#${this.y}`;
    }

    get_random(x, y) {
        return get_seeded_randomiser(`${this.seed}:${x}:${y}`)
    }

    // >1 means outside, <1 means inside,
    // value is (distance^2),
    // so 0.25 is halfway inside
    get_sqr_proximity(px, py) {
        return (
            Math.pow(
                (
                    (px - this.x) * Math.cos(this.rotation)
                ) + (
                    (py - this.y) * Math.sin(this.rotation)
                ), 2
            ) / Math.pow(this.width, 2)
        ) + (
            Math.pow(
                (
                    (px - this.x) * Math.sin(this.rotation)
                ) - (
                    (py - this.y) * Math.cos(this.rotation)
                ), 2
            ) / Math.pow(this.height, 2)
        )
    }
}

class Tile {
    static DEFAULT_TILE_COLOUR = Colour.from_hex("#333");

    constructor(richnesses, cleared, features=null) {
        this.richnesses = richnesses;
        this.cleared = cleared;

        this.max_hp = this.get_max_hp();
        this.hp = this.max_hp;

        this.armour = this.get_armour();

        this.x = null;
        this.y = null;

        this.colour = this.determine_colour();

        this.features = features ?? {};
    }

    get_armour() {
        let base_armour = TILE_BASE_ARMOUR;
        
        let total_armour_bonus = 0;
        Object.keys(this.richnesses).forEach(k => {
            total_armour_bonus += TileResourceInfo[k].armour_bonus * this.richnesses[k];
        });

        return base_armour + total_armour_bonus;
    }

    get_max_hp() {
        let base_hp = TILE_BASE_MAX_HP;
        
        let total_hp_bonus = 0;
        Object.keys(this.richnesses).forEach(k => {
            total_hp_bonus += TileResourceInfo[k].hp_bonus * this.richnesses[k];
        });

        return base_hp + total_hp_bonus;
    }

    take_damage(amt) {
        let dmg_to_take = Math.max(0, amt - this.armour);
        this.hp -= dmg_to_take;
        if (this.hp <= 0) {
            this.cleared = true;
            play_audio(`block_destroy${random_int(1, 5)}`);
        }

        return dmg_to_take;
    }

    determine_colour() {
        if (this.cleared) {
            return Colour.black;
        }

        let base_colour = Tile.DEFAULT_TILE_COLOUR;

        let lerp_total = 0;
        let cols = Object.keys(this.richnesses).map(k => {
            let col = TileResourceInfo[k].colour;
            let richness = this.richnesses[k];

            lerp_total += richness;

            return [col, richness];
        });

        if (cols.length > 0) {
            let avgcol = weighted_average_from_colours(...cols);

            return base_colour.lerp(avgcol, Math.min(1, lerp_total));
        } else {
            return base_colour;
        }
    }

    get_colour_css() {
        return this.get_colour().css();
    }

    get_colour() {
        return this.colour;
    }
}

class Mine {
    static MAX_SIZE = 1e7;
    static SIZEPAD = 1e6;

    constructor(seed, tiles, generation_settings) {
        this.seed = seed;
        this.random = get_seeded_randomiser(seed);
        
        this.tiles = tiles ?? new Map();
        this.generation_settings = generation_settings;

        this.max_additional_vein_check_radius = this.generation_settings.veins.reduce((p, c) => {
            let maxsize = c.size_max * c.depth_max_size_mul * Math.max(1, c.skew_max);
            return Math.max(p, maxsize);
        }, 0);
    }

    distance_from_origin(x, y) {
        return Math.abs(x) + Math.abs(y);
    }

    get_xy_seed(x, y) {
        return `${this.seed}${this.xy_to_index(x, y)}`
    }

    xy_to_index(x, y) {
        return (x + Mine.SIZEPAD) + ((y + Mine.SIZEPAD) * Mine.MAX_SIZE)
    }

    index_to_xy(index) {
        return [
            (index % Mine.MAX_SIZE) - Mine.SIZEPAD,
            Math.floor(index / Mine.MAX_SIZE) - Mine.SIZEPAD,
        ]
    }

    get_center_position(of_tile_x, of_tile_y) {
        return scaling.ttwp(new Vector2(of_tile_x, of_tile_y)).add(new Vector2(BASE_TILE_SCALE / 2, BASE_TILE_SCALE / 2));
    }

    get_tile(x, y) {
        return this.tiles.get(this.xy_to_index(x, y));
    }

    v_get_tile(vec) {
        return this.get_tile(vec.x, vec.y);
    }

    set_tile(x, y, tile) {
        this.tiles.set(this.xy_to_index(x, y), tile);
        tile.x = x;
        tile.y = y;
    }

    v_set_tile(vec, tile) {
        return this.set_tile(vec.x, vec.y, tile);
    }
}

class Player {
    static P_EPSILON = 0.001;
    static BASE_ATTACK_DELAY = 1;
    static MIN_ATTACK_DELAY = 0.0001;

    constructor(mine, particles_board, position, upgrades, inventory, equipment_inventory, currencies) {
        this.position = position;
        this.upgrades = upgrades;
        this.inventory = inventory;
        this.equipment_inventory = equipment_inventory;
        this.currencies = currencies;

        this.currency_records = {};
        this.currency_gain_totals = {};

        this.currency_records_alltime = {};

        this.item_gain_totals = {};
        this.item_records = {};

        this.item_records_alltime = {};

        this.reset_records = {};

        Object.keys(Item).forEach(ik => {
            this.item_gain_totals[Item[ik]] = 0;
            this.item_records[Item[ik]] = 0;
        });

        Object.keys(Currency).forEach(ck => {
            this.currency_records[Currency[ck]] = 0;
            this.currency_gain_totals[Currency[ck]] = 0;
        })

        this.radius = 7;
    
        this.last_movement = Vector2.zero;

        this.stats = null;
        this.recalculate_stats();

        this.select_particle = null;
        this.mining_target = null;
        this.mining_cooldown = this.stats.atk_delay;

        this.mine = mine;
        this.particles_board = particles_board;

        this.inventory_changed = true;
        this.target_changed = true;
        this.currencies_changed = true;
        this.upgrades_changed = true;
        this.stats_changed = true;
        this.position_changed = true;
        this.icon_changed = true;
        this.powercube_choices_changed = true;

        this.last_depth = 0;

        this.closed_helpmenu = false;
        this.custom_icon_b64 = null;

        this.spawnpoint = new Vector2(16, 16);

        this.hide_display = false;
        this.lock_input = false;
    }

    calc_collapse_gain() {
        // Collapse gain is by default based on just money
        // First one at 5000
        // Cost increases by 1.25x every time
        let score_total = this.get_currency_amt(Currency.GOLD);
        
        let powercubes_amt = Upgrade.calc_amount_from_cost(
            score_total, 5000, 1.2, 0
        ) + 1;

        return Math.max(0, Math.floor(powercubes_amt));
    }
    
    calc_next_collapse_target() {
        let cur = this.calc_collapse_gain();

        return Upgrade.calc_cost_from_amount(
            5000, 1.2, cur, 0
        );
    }

    reset_collapse() {
        // Collapse resets money, inventory and *GOLD* upgrades
        // and moves the player back to the spawnpoint
        this.reset_records["collapse"] = (this.reset_records["collapse"] ?? 0) + 1;

        let powercubes_gain = this.calc_collapse_gain();

        this.position = this.spawnpoint;
        this.get_all_items().forEach(item => {
            this.remove_item(item[0], item[1])
        });
        this.remove_currency(Currency.GOLD, this.get_currency_amt(Currency.GOLD));
        this.get_all_upgrades().forEach(upgrade => {
            let upg_obj = upgrades_lookup.get(upgrade[0]);
            if (upg_obj.cost_currency == Currency.GOLD) {
                this.set_upgrade_count(upg_obj, 0);
            }
        });

        this.add_currency(Currency.POWERCUBES, powercubes_gain);

        this.currency_records_alltime = this.currency_records;
        this.currency_records = {};

        this.item_records_alltime = this.item_records;
        this.item_records = {};

        let bonus_start_gold = this.get_upgrade_count_by_id("pc-bonus-starting-gold1") * 250;
        this.add_currency(Currency.GOLD, bonus_start_gold);

        this.mining_target = null;
        this.position_changed = true;
    }

    consume_change(on) {
        let state = this[`${on}_changed`];
        
        this[`${on}_changed`] = false;

        return state;
    }

    get_incalc_stat(key) {
        return (this.stats[key] + this.stat_additions[key]) * this.stat_multipliers[key];
    }

    add_incalc_stat(key, amt) {
        this.stat_additions[key] += amt;
    }

    mul_incalc_stat(key, amt) {
        this.stat_additions[key] += amt;
    }

    recalculate_stats() {
        this.stats_changed = true;

        let base_stats = {
            damage: 5,
            atk_speed: 1,
            atk_delay_modifier: 0,
            luck: 1,
            movespeed: 32,
            lightlevel: 8,
            lightlevel_enabled: false,

            crit_chance: 0,
            crit_damage: 3,
            flurry_chance: 0,
            flurry_effectiveness: 4,
        };

        this.stat_additions = {};
        this.stat_multipliers = {};
        
        Object.keys(base_stats).forEach(k => {
            this.stat_additions[k] = 0;
            this.stat_multipliers[k] = 1;
        })

        this.stats = base_stats;

        // Housekeeping on upgrades list
        Object.keys(this.upgrades).forEach(k => {
            if (!upgrades_lookup.get(k)) {
                this.upgrades[k] = 0;
            }
        })

        this.get_all_upgrades().sort((a, b) => upgrades_lookup.get(a[0]).priority - upgrades_lookup.get(b[0]).priority).forEach(upgrade => {
            upgrades_lookup.get(upgrade[0]).on_stats(this, upgrade[1]);
        });

        // Resolve modifiers
        Object.keys(base_stats).forEach(k => {
            this.stats[k] = this.get_incalc_stat(k);
        })

        this.stats.atk_delay = Math.max(Player.MIN_ATTACK_DELAY, (Player.BASE_ATTACK_DELAY / this.stats.atk_speed) - this.stats.atk_delay_modifier);

        // this.mining_cooldown = this.stats.atk_delay;
    }

    // Upgrades
    get_all_upgrades() {
        return Object.keys(this.upgrades).map(k => {
            return [k, this.upgrades[k], upgrades_lookup.get(k)]
        }).filter(e => e[1] != 0 && e[2]);
    }

    get_upgrade_count_by_id(upgradeid) {
        return this.upgrades[upgradeid] ?? 0;
    }

    get_upgrade_count(upgrade) {
        return this.upgrades[upgrade.id] ?? 0;
    }

    add_upgrade(upgrade, amt) {
        this.set_upgrade_count(upgrade, (this.upgrades[upgrade.id] ?? 0) + amt);
    }

    set_upgrade_count(upgrade, to) {
        this.upgrades[upgrade.id] = to;
        this.upgrades_changed = true;

        this.recalculate_stats();
    }

    buy_upgrade(upgrade, amt) {
        let cost = upgrade.get_purchase_cost(
            this.get_upgrade_count(upgrade), amt
        );

        if (this.get_currency_amt(upgrade.cost_currency) >= cost) {
            play_audio("system_decision_sound3", 0.4);
            this.remove_currency(upgrade.cost_currency, cost);
            this.add_upgrade(upgrade, amt);
        }
    }

    // Currency
    get_currency_amt(currency) {
        let cur = this.currencies[currency] ?? 0;
        return cur;
    }

    get_all_currencies() {
        // return all nonzero currency
        return Object.keys(this.currencies).map(k => {
            return [k, this.currencies[k]]
        }).filter(e => e[1] != 0);
    }

    add_currency(currency, amt) {
        let cur = this.get_currency_amt(currency);
        this.currencies[currency] = cur + amt;
        this.currencies_changed = true;

        this.currency_records[currency] = Math.max(this.currency_records[currency] ?? 0, this.currencies[currency]);
        this.currency_gain_totals[currency] = (this.currency_gain_totals[currency] ?? 0) + Math.max(0, amt);
    }

    has_currency(currency, amt) {
        let cur = this.get_currency_amt(currency);
        return cur >= amt;
    }

    remove_currency(currency, amt) {
        this.add_currency(currency, -amt);
        this.currencies_changed = true;
    }

    // Items
    get_item_amt(item) {
        let cur = this.inventory[item] ?? 0;
        return cur;
    }

    get_all_items() {
        // return all nonzero items
        return Object.keys(this.inventory).map(k => {
            return [k, this.inventory[k]]
        }).filter(e => e[1] != 0);
    }

    add_item(item, amt) {
        let cur = this.get_item_amt(item);
        this.inventory[item] = cur + amt;
        this.inventory_changed = true;

        this.item_records[item] = Math.max(this.item_records[item] ?? 0, this.inventory[item]);
        this.item_gain_totals[item] = (this.item_gain_totals[item] ?? 0) + Math.max(0, amt);
    
        if (amt > 0)
            add_item_gain(item, amt);
    }

    has_item(item, amt) {
        let cur = this.get_item_amt(item);
        return cur >= amt;
    }

    remove_item(item, amt) {
        this.add_item(item, -amt);
        this.inventory_changed = true;
    }

    sell_item(item, amt) {
        let sell_value = ItemData[item].gold_value * amt;
        if (this.has_item(item, amt)) {
            play_audio("generic_kaching", 0.15);
            this.remove_item(item, amt);
            this.add_currency(Currency.GOLD, sell_value);
        }
    }

    get_bbox(radius_mod=0, override_pos=null) {
        let p = override_pos ?? this.position;
        let r = this.radius + radius_mod;

        let tl = p.add(new Vector2(-r, -r));
        let br = p.add(new Vector2(r, r));
        let diff = br.sub(tl);

        return {
            tl: tl,
            tr: p.add(new Vector2(r, -r)),
            bl: p.add(new Vector2(-r, r)),
            br: br,
            width: diff.x,
            height: diff.y,
        }
    }

    get_depth() {
        let tilepos = scaling.wttp(this.position).floor();
        return Math.floor(Math.abs(tilepos.x) + Math.abs(tilepos.y));
    }
    
    move(by, collision=true) {
        if (this.lock_input)
            return;

        if (!collision) {
            this.position = this.position.add(by);
            return;
        }
        
        // move laterally first until hitting an object, then vertically
        let new_x_pos = this.position.add(new Vector2(by.x, 0));
        
        // test far right for rightside and far left for leftside
        let failed_x = by.x != 0;
        while (failed_x) {
            let rollback_direction = -Math.sign(by.x);
            let comp_pos = rollback_direction == 1 ? [this.get_bbox(0, new_x_pos).tl, this.get_bbox(0, new_x_pos).bl] : [this.get_bbox(0, new_x_pos).tr, this.get_bbox(0, new_x_pos).br]
            
            let tiles = comp_pos.map(p => {
                return scaling.wttp(p).floor();
            });

            failed_x = false;
            tiles.forEach(tpos => {
                let tile = this.mine.get_tile(tpos.x, tpos.y);
                if (tile && !tile.cleared) {
                    failed_x = true;
                }
            });

            if (failed_x) {
                // roll back the position to the tile before it
                // so, get the x worldspace difference between this tile and the next one
                // and add that difference to the new x pos
                let tile = tiles[0];
                let rollback_worldpos = scaling.ttwp(new Vector2(tile.x + rollback_direction, tile.y));

                // If rollback direction is +ve, put at the start of the tile,
                // else put at the end
                if (rollback_direction > 0)
                    new_x_pos.x = rollback_worldpos.x + (this.radius * rollback_direction);
                else
                    new_x_pos.x = (rollback_worldpos.x + BASE_TILE_SCALE) + (this.radius * rollback_direction) - Player.P_EPSILON;
            }
        }

        // vertically
        let new_y_pos = this.position.add(new Vector2(0, by.y));
        
        let failed_y = by.y != 0;
        while (failed_y) {
            let rollback_direction = -Math.sign(by.y);
            let comp_pos = rollback_direction == 1 ? [this.get_bbox(0, new_y_pos).tl, this.get_bbox(0, new_y_pos).tr] : [this.get_bbox(0, new_y_pos).bl, this.get_bbox(0, new_y_pos).br]
            
            let tiles = comp_pos.map(p => {
                return scaling.wttp(p).floor();
            });

            failed_y = false;
            tiles.forEach(tpos => {
                let tile = this.mine.get_tile(tpos.x, tpos.y);
                if (tile && !tile.cleared) {
                    failed_y = true;
                }
            });

            if (failed_y) {
                // roll back the position to the tile before it
                // so, get the y worldspace difference between this tile and the next one
                // and add that difference to the new y pos
                let tile = tiles[0];
                let rollback_worldpos = scaling.ttwp(new Vector2(tile.x, tile.y + rollback_direction));

                // If rollback direction is +ve, put at the start of the tile,
                // else put at the end
                if (rollback_direction > 0)
                    new_y_pos.y = rollback_worldpos.y + (this.radius * rollback_direction);
                else
                    new_y_pos.y = (rollback_worldpos.y + BASE_TILE_SCALE) + (this.radius * rollback_direction) - Player.P_EPSILON;
            }
        }

        // replace with a full replacement when we implement y-movement as well
        let old_pos = this.position;
        this.position = new Vector2(new_x_pos.x, new_y_pos.y);

        if (old_pos.sqr_distance(this.position) > Player.P_EPSILON * 2 || (this.last_movement.x * by.x == 0 && this.last_movement.y * by.y == 0)) {
            this.lose_mining_target();
        }

        this.last_movement = by;

        let new_depth = this.get_depth();
        if (new_depth != this.last_depth) {
            this.recalculate_stats();
            this.position_changed = true;
        }
        this.last_depth = new_depth;
    }

    lose_mining_target() {
        this.mining_target = null;
        this.mining_cooldown = this.stats.atk_delay;
        this.select_particle?.expire();

        this.target_changed = true;
    }

    deal_damage(to_tile, damage_amt) {
        this.target_changed = true;

        let final_damage = damage_amt;
        let crit = false;
        if (this.mine.random() < this.stats.crit_chance) {
            final_damage *= this.stats.crit_damage;
            crit = true;
        }

        return [to_tile.take_damage(final_damage), crit];
    }

    mining_target_step(delta_time) {
        if (this.lock_input)
            return;

        let target_thresh = BASE_TILE_SCALE / 4;

        if (this.mining_target) {
            this.mining_cooldown -= delta_time;
            while (this.mining_cooldown <= 0) {
                let result = this.deal_damage(this.mining_target, this.stats.damage);
                let dmg_dealt = result[0];
                let crit = result[1];

                if (dmg_dealt > 0) {
                    play_audio(`pick_${crit ? "crit" : "hit"}${random_int(1, 5)}`, crit ? 0.25 : 0.1);

                    if (this.mine.random() < this.stats.flurry_chance) {
                        this.mining_cooldown += this.stats.atk_delay / this.stats.flurry_effectiveness;
                    } else {
                        this.mining_cooldown += this.stats.atk_delay;
                    }

                    let luck = this.stats.luck;
                    if (crit) {
                        // play_audio("clink");
                        luck *= this.stats.crit_damage;
                    }

                    this.roll_loot(this.mining_target, dmg_dealt, luck)
                } else {
                    play_audio("clink");
                    this.mining_cooldown += this.stats.atk_delay;
                }

                let pos = this.mine.get_center_position(this.mining_target.x, this.mining_target.y);

                this.particles_board.spawn_particle(new Particle(
                    pos, 0, 1, entity_sprites.get("tileflash"), 0, 0.1
                ), pos);

                if (this.mining_target.cleared) {
                    this.lose_mining_target();
                }

                // console.log("dug");
            }
        } else {
            // check if player position difference from current tile origin is > threshold
            // if so, pick the target in the axis which is furthest from the center
            let cur_tile_pos = scaling.wttp(this.position).floor();
            let pos_diff = this.mine.get_center_position(cur_tile_pos.x, cur_tile_pos.y).sub(this.position);
            let ax = Math.abs(pos_diff.x);
            let ay = Math.abs(pos_diff.y);
            if (ax >= target_thresh || ay >= target_thresh) {
                let new_tile = null;
                // pick the closest one. if they're too close to call, use last movement as a tiebreaker
                let xy_diff = Math.abs(ax-ay);
                let prio_x = ax > ay;
                if (xy_diff <= 0.01) {
                    prio_x = this.last_movement.x != 0
                }

                if (prio_x) {
                    // xpos wins
                    new_tile = this.mine.get_tile(cur_tile_pos.x - Math.sign(pos_diff.x), cur_tile_pos.y)
                } else {
                    // ypos wins
                    new_tile = this.mine.get_tile(cur_tile_pos.x, cur_tile_pos.y - Math.sign(pos_diff.y))
                }

                if (!new_tile || new_tile.cleared) {
                    return;
                }

                this.mining_target = new_tile;
                this.mining_cooldown = this.stats.atk_delay;

                let new_tile_part_pos = this.mine.get_center_position(new_tile.x, new_tile.y);
                this.select_particle = new Particle(
                    new_tile_part_pos, 0, 1.1, entity_sprites.get("tile_selector"), 3, Number.POSITIVE_INFINITY, true                    
                );

                this.select_particle.add_component(new RemoveFirstFrameComponent(this.particles_board));

                this.select_particle.alternative_layer = "ui2";

                this.particles_board.spawn_particle(this.select_particle, new_tile_part_pos);
                this.target_changed = true;

                // console.log("acquired target", this.mining_target);
            }
        }
    }

    roll_loot(on_tile, damage_dealt, luck) {
        // each tile gives loot each time it's hit
        // damage dealt has limited impact on loot (up to +300% luck at 5% tile max hp)
        // (so more hits, e.g. low damage, is overall better for high value)
        // damage requirements are managed by the armour level of tiles

        // luck is the chance for additional rolls 
        // floor(luck) guaranteed rolls
        // (luck % 1) chance for one more roll
        let tile_dmg_prop = damage_dealt / on_tile.max_hp;
        let luck_bonus = Math.max(0, Math.min(3, tile_dmg_prop * 60));

        let final_luck = luck * (1 + luck_bonus);

        let rolls = Math.floor(final_luck);
        if (this.mine.random() < (final_luck % 1)) {
            rolls++;
        }

        // console.log(`Original luck ${luck}, prop ${tile_dmg_prop.toFixed(3)} => final luck ${final_luck}`)

        for (let i=0; i<rolls; i++) {
            // richness determines chance
            // + yield modifier
            // roll each richness separately
            let added_anything = false;
            Object.keys(on_tile.richnesses).forEach(k => {
                let data = TileResourceInfo[k];

                let chance = on_tile.richnesses[k];
                chance *= data.rarity_modifier;
                if (this.mine.random() < chance && data.loot_table.length > 0) {
                    let res_item = weighted_seeded_random_from_arr(data.loot_table, this.mine.random)[1];

                    this.add_item(res_item, 1);
                    added_anything = true;
                }
            })

            if (!added_anything) {
                if (this.mine.random() < GRANITE_CHANCE_PER_HIT) {
                    this.add_item(Item.GRANITE, 1);
                }
            }
        }
    }
}

const UTYP = {
    NORMAL: "Normal",
    POWERCUBE: "Powercube",
}

class Upgrade {
    static add_to_stats(...stats_and_values) {
        return ((p, n) => {
            stats_and_values.forEach(sv => {
                p.add_incalc_stat(sv[0], sv[1] * n);
            })
        })
    }

    static mul_to_stats(...stats_and_values) {
        return ((p, n) => {
            stats_and_values.forEach(sv => {
                p.mul_incalc_stat(sv[0], Math.pow(sv[1], n));
            })
        })
    }

    static calc_cost_from_amount(base_cost, cost_amp, amount_to_buy, start_amount) {
        let b = base_cost
        let c = cost_amp
        let d = amount_to_buy  // "difference"
        let s = start_amount

        return Math.ceil(
            (b * Math.pow(c, s)) * (1 - Math.pow(c, (d + 1))) / (1 - c)
        );
    }


    static calc_amount_from_cost(total_budget, base_cost, cost_amp, start_amount) {
        let a = total_budget
        let b = base_cost
        let c = cost_amp
        let s = start_amount

        return (Math.log(-((1 - c) * (a - (b * Math.pow(c, s)) / (1 - c))) / b) - s * Math.log(c) - Math.log(c)) / Math.log(c)
    }

    /**
     * Normal upgrade using exponential cost scaling.
     * @param {*} id ID of the upgrade
     * @param {*} name Name of the upgrade
     * @param {*} desc Long description
     * @param {*} base_cost Base cost (at 0x)
     * @param {*} cost_scaling Amount to scale cost per upgrade bought
     * @param {*} priority Priority of the upgrade effect. Priority is resolved lowest first. Order is not guaranteed within the same priority number. Put multiplicative after additive. Convention for additive is 0, multiplicative is 10.
     * @param {*} on_stats Function (player, number_of_upgrade) => {null} to run during stats calculation.
     * @param {*} show_unknown Show as unknown if the player hasn't been able to afford it yet.
     * @param {*} hide_logic Change the unknown logic to a different custom function: (player) => [description, condition]
     */
    constructor(id, name, col, desc, base_cost, cost_scaling, cost_currency, priority, max_cnt=null, on_stats=null, show_unknown=false, hide_logic=null, hide_if_unknown=false) {
        this.id = id;
        
        this.name = name;
        this.col = col ?? "cyan";
        this.desc = desc;
        this.base_cost = base_cost;
        this.cost_scaling = cost_scaling;
        this.cost_currency = cost_currency;
        this.on_stats = on_stats;
        this.priority = priority;
        this.max_cnt = max_cnt;
        this.show_unknown = show_unknown;
        this.hide_logic = hide_logic;
        this.hide_if_unknown = hide_if_unknown;
    }

    get_number_buyable(player, cur_owned) {
        let player_currency = player.get_currency_amt(this.cost_currency);
        let limit = this.get_max_purchasable(cur_owned);
        
        return Math.max(0, Math.min(
            limit,
            Math.floor(Upgrade.calc_amount_from_cost(player_currency, this.base_cost, this.cost_scaling, cur_owned) + 1)
        ));
    }

    get_purchase_cost(cur_owned, buy_amount) {
        return Upgrade.calc_cost_from_amount(this.base_cost, this.cost_scaling, buy_amount-1, cur_owned)
    }

    get_max_purchasable(cur_owned) {
        return (this.max_cnt ?? Number.POSITIVE_INFINITY) - cur_owned;
    }
}

class ParticleBoard {
    constructor() {
        this.random_seed = Math.random().toString();   
        this.particles = [];
    }

    spawn_particle(particle, position) {
        particle.set_pos(position);
        this.particles.push(particle);

        return particle;
    }

    particles_step(time_delta, time_stop_active=false) {
        this.particles.forEach(particle => {
            if (time_stop_active && particle.time_locked)
                return;

            particle.pass_time(time_delta);
            particle.pass_time_components(time_delta);
        });
        
        this.particles = this.particles.filter(particle => {
            // looping particles never hit the framecount bound so out-of-range frame is valid to check deletion
            return particle.lifetime < particle.duration && particle.cur_frame < particle.framecount;
        })
    }
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

        this.hide = false;

        this.typ = PARTICLE_TYPE.NORMAL;

        // time_locked particles will pause alongside other gameobjects
        // when any form of time stop happens (e.g. cutscene time stop)
        this.time_locked = true;

        /** @type {[ParticleComponent]} */
        this.components = [];
    }

    expire() {
        this.lifetime = Number.POSITIVE_INFINITY;
    }

    /** @param {ParticleComponent} component  */
    add_component(component) {
        component.on_add(this);
        this.components.push(component);

        return this;
    }

    set_pos(to) {
        this.position = to;
    }

    pass_time_components(time_delta) {
        this.components.forEach(c => c.pass_time(this, time_delta));
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

class ParticleComponent {
    static id_inc = 0;

    constructor(board) {
        this.id = ParticleComponent.id_inc;
        ParticleComponent.id_inc++;

        this.board = board;

        this.independent_random = get_seeded_randomiser(this.board.random_seed + this.id);
    }

    on_add(particle) {
        // blank
    }

    pass_time(particle, time_delta) {
        // blank
    }
}

class RemoveFirstFrameComponent extends ParticleComponent {
    constructor(board, after_time=0.01) {
        super(board);
        this.enabled = true;
        this.after_time = after_time;
    }

    pass_time(particle, time_delta) {
        if (this.enabled && particle.lifetime >= this.after_time) {
            particle.sprites = particle.sprites.slice(1);
            particle.framecount--;

            this.enabled = false;
        }
    }
}

class FadeInParticleComponent extends ParticleComponent {
    constructor(board, lifetime_end=0, initial_opacity=1, pow=1) {
        super(board);

        this.pow = pow;
        this.initial_opacity = initial_opacity;
        this.lifetime_end = lifetime_end;
    }

    pass_time(particle, time_delta) {
        if (this.lifetime_end && particle.lifetime > this.lifetime_end)
            return;

        let operant_duration = this.lifetime_end ? this.lifetime_end : particle.duration;
        let effective_lifetime = particle.lifetime;

        let prop = Math.max(0, Math.min(1, effective_lifetime / operant_duration));

        particle.opacity = this.initial_opacity * Math.pow(prop, this.pow);
    }
}

class FadeOutParticleComponent extends ParticleComponent {
    constructor(board, lifetime_start=0, initial_opacity=1, pow=1) {
        super(board);

        this.pow = pow;
        this.initial_opacity = initial_opacity;
        this.lifetime_start = lifetime_start;
    }

    pass_time(particle, time_delta) {
        if (particle.lifetime < this.lifetime_start)
            return;

        let operant_duration = particle.duration - this.lifetime_start;
        let effective_lifetime = particle.lifetime - this.lifetime_start;

        let prop = 1 - Math.max(0, Math.min(1, effective_lifetime / operant_duration));

        particle.opacity = this.initial_opacity * Math.pow(prop, this.pow);
    }
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {Mine} mine 
 */
function generate_chunk(rx, ry, radius, mine) {
    /** @type {[ResourceVein]} */
    let veins = [];

    let x = Math.floor(rx);
    let y = Math.floor(ry);

    let bonus_radius = mine.max_additional_vein_check_radius;
    let vein_search_radius = radius + bonus_radius;

    // Spawn veins
    for (let tx=-vein_search_radius; tx<=vein_search_radius; tx++) {
        for (let ty=-vein_search_radius; ty<=vein_search_radius; ty++) {
            let vx = tx+x;
            let vy = ty+y;
            if (vy < 0) {
                continue
            }

            let seed = mine.get_xy_seed(vx, vy);

            let dist = mine.distance_from_origin(vx, vy);

            let rand = get_seeded_randomiser(seed);
            rand();

            /** @type {[ResourceVeinGenerationSettings]} */
            let veins_settings = mine.generation_settings.veins;
            veins_settings.forEach(s => {
                let distance_prop = (dist - s.depth_min) / (s.depth_max - s.depth_min);
                if (distance_prop < 0 || distance_prop >= 1) {
                    // out of range
                    rand();
                    return;
                }

                let chance = lerp(s.chance_min, s.chance_max, distance_prop);
                if (rand() >= chance) {
                    if (vx == 0 && vy == 0) {
                        // spawn on a copper vein (so force the spawn)
                    } else {
                        // didnt spawn on this tile
                        rand();
                        return;
                    }
                }

                let richness_base = lerp(s.richness_min, s.richness_max, distance_prop);
                
                let richness_variance_amount = Math.min(richness_base, 1-richness_base);
                
                let richness_mod = random_float(-1, 1, rand) * s.richness_variance_all;
                
                let richness = richness_base + (richness_variance_amount * richness_mod);

                let size_mul = 1 + (s.depth_max_size_mul * distance_prop);
                let size = lerp(s.size_min, s.size_max, rand()) * size_mul;

                let width = size;
                let height = size;
                if (rand() < 0.5) {
                    width *= random_float(s.skew_min, s.skew_max, rand);
                } else {
                    height *= random_float(s.skew_min, s.skew_max, rand);
                }

                let rotation = random_float(0, Math.PI, rand);

                veins.push(new ResourceVein(
                    s.tile_resources,
                    vx, vy, width, height, rotation,
                    richness, s.richness_variance_per
                ))
            })
        }
    }

    // Then paint new tiles
    for (let tx=-radius; tx<=radius; tx++) {
        for (let ty=-radius; ty<=radius; ty++) {
            let vx = tx+x;
            let vy = ty+y;

            let tile = mine.get_tile(vx, vy);
            if (tile) {
                // don't overwrite preexisting tiles
                continue
            }

            if (vy < 0) {
                mine.set_tile(vx, vy, new Tile({[TileResource.BEDROCK]: 1}, false))
                continue;
            }

            let richnesses = {};
            veins.forEach(vein => {
                let rand = vein.get_random(vx, vy);

                let sqr_prox = vein.get_sqr_proximity(vx, vy);
                if (sqr_prox > 1) {
                    // outside
                    rand();
                    return;
                };

                let tile_richness = (1 - sqr_prox) * vein.richness;

                let richness_variance_amount = Math.min(tile_richness, 1-tile_richness);
                let richness_mod = random_float(-1, 1, rand) * vein.richness_variance_per;

                let final_richness = tile_richness + (richness_variance_amount * richness_mod);

                let gran = 10;
                for (let i=0; i<gran; i++) {
                    let resource = weighted_seeded_random_from_arr(vein.tile_resources, rand)[1];

                    let rcur = richnesses[resource[0]] ?? 0;
                    rcur += (final_richness * resource[1]) / gran;
                    richnesses[resource[0]] = Math.min(1, rcur);
                }
            })

            // console.log(vx, vy);
            mine.set_tile(vx, vy, new Tile(richnesses, false));

            if (vx == 0 && vy == 0) {
                mine.get_tile(vx, vy).cleared = true;
            }
        }
    }
}

function render_tiles(player, mine) {
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height);

    /** @type {CanvasRenderingContext2D} */
    let ctx = layers.fg3.ctx;

    // Get the tile position of what would be screenpos 0,0
    // Floor that 
    // Start from that tile
    // Render ceil(tilesize / canvas_DIMENSION) in each axis
    let start_tile = scaling.sttp(Vector2.zero);
    let sx = Math.floor(start_tile.x);
    let sy = Math.floor(start_tile.y);
    
    let s = BASE_TILE_SCALE * zoom_level;

    let nx = Math.ceil(canvas_width / s)+1;
    let ny = Math.ceil(canvas_height / s)+1;

    let breaksprites = entity_sprites.get("break");

    for (let x=0; x<nx; x++) {
        for (let y=0; y<ny; y++) {
            let tx = sx + x;
            let ty = sy + y;

            let tile = mine.get_tile(tx, ty);
            let fillcol = null;
            if (tile && !tile.cleared) {
                let col = tile.get_colour();
                fillcol = col;
            } else {
                fillcol = Colour.black;
                // no need to fill, we already cleared the canvas
                continue;
            }

            // experimental lighting
            // lighting is equal to the largest between:
            // closeness to player
            // closeness to a cleared tile
            let finalcol = fillcol;
            if (player.stats.lightlevel_enabled) {
                let closest_cleared_tile_distance = 999;
                let d = 3;
                for (let x=-d; x<=d; x++) {
                    for (let y=-d; y<=d; y++) {
                        let dist = Math.sqrt(
                            Math.pow(x, 2) + Math.pow(y, 2)
                        );

                        if (dist < closest_cleared_tile_distance && mine.get_tile(tx+x, ty+y)?.cleared) {
                            closest_cleared_tile_distance = dist;
                        }
                    }
                }

                let distance_from_player = player.position.distance(mine.get_center_position(tx, ty));

                let ll = player.stats.lightlevel * BASE_TILE_SCALE;
                let player_dist_light = Math.max(0, (ll - distance_from_player)) / ll;
                let cleared_dist_light = 0.75 * (Math.max(0, d - closest_cleared_tile_distance) / d);
                let lightlevel = Math.min(1, Math.max(player_dist_light, cleared_dist_light));
                if (!tile) {
                    lightlevel = 1;
                }

                finalcol = Colour.black.lerp(fillcol, lightlevel);
            }   

            ctx.fillStyle = finalcol.css();

            let screenpos = scaling.ttsp(new Vector2(tx, ty)).round();
            ctx.fillRect(screenpos.x, screenpos.y, s, s);

            let hp_prop = tile.hp / tile.max_hp;
            let frame = Math.ceil((1 - hp_prop) * (breaksprites.length - 1));
            if (hp_prop == 1) {
                frame = -1;
            }

            if (frame > 0) {
                let pos = screenpos
                write_rotated_image(
                    layers.fg3.canvas, layers.fg3.ctx,
                    pos.x, pos.y, breaksprites[frame],
                    PARTICLE_SIZE_MULTIPLIER * zoom_level, PARTICLE_SIZE_MULTIPLIER * zoom_level
                )
            }
        }
    }
}

function render_player(player) {
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height);

    if (player.hide_display) {
        return;
    }

    let bbox = player.get_bbox();
    let bbox_inner = player.get_bbox(-1);

    let outerpos = scaling.wtsp(bbox.tl);
    let innerpos = scaling.wtsp(bbox_inner.tl);

    // layers.fg2.ctx.fillStyle = "white";
    // layers.fg2.ctx.fillRect(outerpos.x, outerpos.y, bbox.width * zoom_level, bbox.height * zoom_level);
    // layers.fg2.ctx.fillStyle = "lime";
    // layers.fg2.ctx.fillRect(innerpos.x, innerpos.y, bbox_inner.width * zoom_level, bbox_inner.height * zoom_level);

    let ppos = scaling.wtsp(player.position).round();
    write_rotated_image(layers.fg2, layers.fg2.ctx, ppos.x, ppos.y, entity_sprites.get(player.custom_icon_b64 ? "orb_custom" : "orb")[0], bbox.width * zoom_level, bbox.height * zoom_level, 0)
}

function render_particles(particles_board) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    // layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);

    particles_board.particles.forEach(particle => {
        if (particle.delay > 0 || particle.hide) {
            return;
        }

        let particle_screen_pos = scaling.wtsp(particle.position)

        let siz = particle.size * scaling.true_zoom_level;

        particle_screen_pos = particle_screen_pos.add(new Vector2(-siz, -siz).mul(0));

        let sprite = particle.sprites[particle.cur_frame];

        let canvas_entry = particle.render_behind ? layers.bg2 : layers.fg1;
        if (particle.alternative_layer) {
            canvas_entry = layers[particle.alternative_layer];
        }

        /** @type {CanvasRenderingContext2D} */
        let ctx = canvas_entry.ctx;

        let old_alpha = ctx.globalAlpha;
        let old_filter = ctx.filter;

        if (particle.opacity != 1)
            ctx.globalAlpha = particle.opacity ?? 1;

        if (particle.filter)
            ctx.filter = particle.filter ?? "";

        if (particle.typ == PARTICLE_TYPE.TEXT) {
            write_pp_bordered_text(
                ctx, sprite,
                particle_screen_pos.x, particle_screen_pos.y,
                particle.text_col.css(), CANVAS_FONTS, (particle.text_size * particle.size) / PARTICLE_SIZE_MULTIPLIER,
                true, particle.text_border_size ?? 1, particle.text_border_col.css(), particle.text_modifiers,
                particle.shortcut_pp_text ?? false
            );
        } else if (particle.typ == PARTICLE_TYPE.LINE) {
            let particle_end_pos = scaling.wtsp(particle.target_position);

            ctx.lineWidth = particle.size * zoom_level;
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

        if (particle.opacity != 1)
            ctx.globalAlpha = old_alpha;

        if (particle.filter)
            ctx.filter = old_filter;
    })
}

function recenter_view(on_world_position) {
    let center_pos = new Vector2(canvas_width, canvas_height).div(2);
    let new_view_offset = (center_pos.sub(on_world_position.mul(scaling.true_zoom_level))).div(scaling.true_zoom_level);

    view_offset = new_view_offset;
    refresh_wtsp_stwp();
}

function begin_collapse_animation(player) {
    document.querySelector(".reset-powercubes-toggle").classList.add("disabled");
    document.querySelector(".ascend-button").classList.add("disabled");

    player.lock_input = true;
    let part = main_particles_board.spawn_particle(
        new Particle(
            player.position, 0, 99,
            entity_sprites.get("tileflash"),
            0, 3, false
        ), player.position
    );
    part.add_component(new FadeInParticleComponent(
        main_particles_board, 1.7
    ));
    part.add_component(new FadeOutParticleComponent(
        main_particles_board, 1.7
    ));

    play_audio("ascension");
    setTimeout(() => {
        player.reset_collapse();
        player.hide_display = true;
    }, 1700);

    setTimeout(() => {
        last_autosave_time = Date.now() - (AUTOSAVE_DELAY - 1000);

        player.reset_collapse();
        player.hide_display = false;
        player.lock_input = false;

        for (let i=0; i<6; i++) {
            setTimeout(() => {
                main_particles_board.spawn_particle(
                    new Particle(
                        player.position, (Math.PI / 3) * i, 2,
                        entity_sprites.get("ult_flash"),
                        24, 3, false
                    ), player.position
                ).opacity = (i / 12) + 0.5;
            }, i * 200);
        }
    }, 4300);
}

function try_reset_powercube_facets(player) {
    if (confirm(`Are you sure you want to collapse to reset your facet picks (and gain ${player.calc_collapse_gain()} powercubes)?`)) {
        powercube_choice_upgrades.forEach(upg => {
            player.set_upgrade_count(upg, 0);
        });

        begin_collapse_animation(player);
    }
}

function try_collapse(player) {
    if (player.calc_collapse_gain() > 0) {
        if (confirm(`Are you sure you want to collapse and gain ${player.calc_collapse_gain()} powercubes?`)) {
            begin_collapse_animation(player);
        }
    }
}

function render_ui_inventory(player) {
    let e = document.querySelector(".inventory-view");

    // e.querySelectorAll(".inventory-view > *:not(.template)").forEach(elem => {
    //     e.removeChild(elem);
    // });

    let template = e.querySelector(".template");

    let elems = [];
    player.get_all_items().sort((a,b) => a[0].localeCompare(b[0])).sort((a,b) => ItemData[b[0]].gold_value - ItemData[a[0]].gold_value).forEach(item => {
        let clone = template.cloneNode(true);

        clone.classList.remove("template");

        clone.querySelector(".item-name").textContent = item[0].padEnd(16, "\xa0");
        clone.querySelector(".item-name").style.setProperty("--textcol", ItemRarityData[ItemData[item[0]].rarity].col.css())        
        clone.querySelector(".item-name").style.setProperty("--bordercol", ItemRarityData[ItemData[item[0]].rarity].col.lerp(Colour.black, 0.8).css())

        clone.querySelector(".item-number").textContent = `${format_number(item[1])}x`.padEnd(10, "\xa0");
        clone.querySelector(".item-value").textContent = format_number(ItemData[item[0]].gold_value).padEnd(8, "\xa0");

        clone.querySelector(".sell-button.sell1").addEventListener("mouseup", e => {
            let n = 1;
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sell25").addEventListener("mouseup", e => {
            let n = Math.ceil(player.get_item_amt(item[0]) * 0.25);
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sell50").addEventListener("mouseup", e => {
            let n = Math.ceil(player.get_item_amt(item[0]) * 0.5);
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sellall").addEventListener("mouseup", e => {
            let n = player.get_item_amt(item[0]);
            player.sell_item(item[0], n);
        })

        elems.push(clone);
    })

    if (elems.length == 0) {
        let notif = document.createElement("span");
        notif.textContent = "No items...";
        elems.push(notif);
    }

    e.replaceChildren(template, ...elems)
}

function render_ui_tilestats(player) {
    let tile = player.mining_target;
    let e = document.querySelector(".windows .tile-info-view");
    if (!tile) {
        toggle_minimise_window(tilestats_window.window, true);

        e.querySelector(".tile-notarget").style.display = "";
        e.querySelector(".tile-hp-container").style.display = "none";
        e.querySelector(".tile-armour-container").style.display = "none";

        e.querySelector(".tile-richnesses-container").replaceChildren();
    } else {
        toggle_minimise_window(tilestats_window.window, false);

        e.querySelector(".tile-notarget").style.display = "none";
        e.querySelector(".tile-hp-container").style.display = "";
        e.querySelector(".tile-armour-container").style.display = "";

        e.querySelector(".tile-hp").textContent = format_number(Math.round(tile.hp == tile.max_hp ? tile.max_hp : (Math.max(1, Math.floor(tile.hp)))));
        e.querySelector(".tile-max-hp").textContent = format_number(Math.round(tile.max_hp));
        e.querySelector(".tile-hp-pct").textContent = Math.max(1, Math.floor(100 * tile.hp / tile.max_hp)).toFixed(0);

        e.querySelector(".tile-armour").textContent = format_number(Math.round(tile.armour * 10) / 10);

        let relem = e.querySelector(".tile-richnesses-container")
        let new_elems = [];
        Object.keys(tile.richnesses).sort().forEach(rk => {
            let ce = document.createElement("span");
            ce.textContent = `${rk.padEnd(24, "\xa0")} | richness: ${(100 * tile.richnesses[rk]).toFixed(1)}%`;
            new_elems.push(ce);
        })

        relem.replaceChildren(...new_elems);
    }
}

function render_ui_currencies(player) {
    document.querySelector(".gold-value").textContent = format_number(player.get_currency_amt(Currency.GOLD));

    let powercubes = player.get_currency_amt(Currency.POWERCUBES);
    if (powercubes > 0) {
        document.querySelector(".powercubes-container").classList.remove("nodisplay");
        document.querySelector(".powercubes-value").textContent = format_number(powercubes);
    } else {
        document.querySelector(".powercubes-container").classList.add("nodisplay");
    }
}

function shake_fn(e) {
    let vec = random_on_circle(e.getBoundingClientRect().height * 0.05);
    e.style.transform = `translate(${vec.x}px, ${vec.y}px)`
}

function setup_shaking_text() {
    document.querySelectorAll(".shaking-text").forEach(setup_shaking_text_elem);
}

function setup_shaking_text_elem(elem) {
    let elems = [];
    let txt = elem.textContent;
    for (let i=0; i<txt.length; i++) {
        let e = document.createElement("span");
        e.textContent = txt[i];
        elems.push(e);
        shake_elems.push({
            parent: elem,
            e: e,
            timeout: 0.03
        })
    }

    elem.textContent = "";
    elem.replaceChildren(...elems);
}

function add_item_gain(itemkey, amt) {
    let old_entry = item_gain_displays.get(itemkey);
    // debugger;

    item_gain_displays.set(itemkey, {
        amount: (old_entry?.amount ?? 0) + amt,
        spawn_time: old_entry === undefined ? Date.now() : Math.max(old_entry.spawn_time, Date.now() - ITEM_GAIN_DISPLAY_MOVE_TIME)
    });
}

function add_message(key, text, col=null) {
    item_gain_displays.set(key ?? `${Date.now()}-${Math.random()}`, {
        override_text: text,
        override_col: col,
        spawn_time: Date.now()
    });
}

function render_ui_item_gain_displays() {
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);

    let rect = document.querySelector(".game-container").getBoundingClientRect();
    
    let origin_pos = new Vector2(rect.right - 16, rect.bottom - 20);

    let keys = [...item_gain_displays.keys()];
    let keycnt = keys.length;

    let amt_each = 20;

    let cur_time = Date.now();
    keys.forEach((k, i) => {
        let display_data = item_gain_displays.get(k);
        let item_data = ItemData[k];
        let rarity_data = ItemRarityData[item_data?.rarity];
        let textcol = rarity_data?.col;

        let offset_x = 0;
        let offsetmax = 512;
        let opacity = 1;
        let tdiff = cur_time - display_data.spawn_time;
        if (tdiff >= ITEM_GAIN_DISPLAY_MAX_TIME) {
            item_gain_displays.delete(k);
            return;
        }

        if (tdiff < ITEM_GAIN_DISPLAY_MOVE_TIME) {
            offset_x = offsetmax * Math.pow(1 - (tdiff / ITEM_GAIN_DISPLAY_MOVE_TIME), 3);
        } else if (tdiff >= ITEM_GAIN_DISPLAY_EXIT_TIME) {
            opacity = -1 * ((tdiff - ITEM_GAIN_DISPLAY_EXIT_TIME) / ITEM_GAIN_DISPLAY_MOVE_TIME);
            opacity += 1;
        }

        let text = "";
        if (display_data.override_text) {
            text = display_data.override_text;
            textcol = display_data.override_col ?? Colour.white;
        } else {
            text = `${k} ${("◕ " + format_number(Math.floor(item_data.gold_value))).padStart(8)} ${format_number(Math.floor(display_data.amount)).padStart(6)}x`;
        }

        layers.ui1.ctx.globalAlpha = opacity;
        write_pp_bordered_text(
            layers.ui1.ctx, text,
            origin_pos.x + offset_x, origin_pos.y - (amt_each * i),
            textcol.css(), CANVAS_FONTS, 20,
            false, 2, textcol.lerp(Colour.black, 0.75).css(), null,
            false, true
        )

        layers.ui1.ctx.globalAlpha = 1;
    })
}

/**
 * 
 * @param {Player} player 
 * @param {[Upgrade]} upgrades 
 */
function render_ui_upgrades(player, upgrades, elem_classname, max_upgrade_cnt) {
    let elem = document.querySelector(`.${elem_classname}`);

    let template = elem.querySelector(".template");

    let new_elems = [];
    let shown_cnt = 0;
    upgrades.forEach(upgrade => {
        let clone = template.cloneNode(true);

        let player_upgrade_cnt = player.get_upgrade_count(upgrade);
        let cost_1 = upgrade.get_purchase_cost(player_upgrade_cnt, 1);
        let max_buy = upgrade.get_number_buyable(player, player_upgrade_cnt);
        let cost_max = upgrade.get_purchase_cost(player_upgrade_cnt, max_buy);

        let show_unknown = false;
        let unknown_string = "This upgrade is unknown until you can afford it!";
        if (!upgrade.hide_logic) {
            show_unknown = upgrade.show_unknown && (player_upgrade_cnt <= 0 && (player.currency_records[upgrade.cost_currency] ?? 0) < cost_1);
        } else {
            let d = upgrade.hide_logic(player);
            show_unknown = !d[1];
            unknown_string = d[0];

            if (show_unknown)
                max_buy = 0;
        }

        if (show_unknown && upgrade.hide_if_unknown) {
            return;
        }

        if (upgrade.get_max_purchasable(player_upgrade_cnt) <= 0) {
            cost_1 = "-"
            cost_max = "-"
            return;
        }

        shown_cnt++;
        if (shown_cnt > max_upgrade_cnt) {
            return;
        }

        clone.querySelector(".upgrade-name").textContent = show_unknown ? "???" : upgrade.name;
        clone.querySelector(".upgrade-name").style.color = show_unknown ? (upgrade.hide_logic ? "#ee9" : "#ccc") : upgrade.col;

        clone.querySelector(".upgrade-cost").textContent = `${CurrencyIcons[upgrade.cost_currency]} ${format_number(cost_1)}`;
        clone.querySelector(".upgrade-cost-max").textContent = `${CurrencyIcons[upgrade.cost_currency]} ${format_number(cost_max)}`;
        
        clone.querySelector(".upgrade-description").textContent = show_unknown ? unknown_string : upgrade.desc;
        clone.querySelector(".upgrade-description").style.color = show_unknown ? (upgrade.hide_logic ? "#995" : "#888") : "";

        clone.querySelector(".upgrade-num-owned").textContent = show_unknown ? "???/???" : (
            upgrade.max_cnt === null ? `${player_upgrade_cnt}x` : `${player_upgrade_cnt}/${upgrade.max_cnt}`
        )

        clone.querySelector(".upgrade-num-owned").style.color = (cost_1 == "-" || show_unknown) ? "gray" : "";

        clone.querySelector(".upgrade-max-amt").textContent = `${format_number(Math.max(0, max_buy))}`;
        clone.querySelector(".upgrade-max-cost").textContent = `${format_number(Math.max(0, cost_max))}`;

        if (max_buy >= 1) {
            clone.querySelector(".upgrade1").addEventListener("mouseup", e => {
                player.buy_upgrade(upgrade, 1);
            })

            clone.querySelector(".upgrademax").addEventListener("mouseup", e => {
                player.buy_upgrade(upgrade, max_buy);
            })

            clone.querySelector(".upgrademax").addEventListener("mouseenter", e => {
                clone.querySelector(".upgrade-cost").classList.add("nodisplay");
                clone.querySelector(".upgrade-cost-max").classList.remove("nodisplay");
            })

            clone.querySelector(".upgrademax").addEventListener("mouseleave", e => {
                clone.querySelector(".upgrade-cost").classList.remove("nodisplay");
                clone.querySelector(".upgrade-cost-max").classList.add("nodisplay");
            })
        } else {
            clone.querySelector(".upgrade1").classList.add("disabled");
            clone.querySelector(".upgrademax").classList.add("disabled");
        }

        clone.classList.remove("template");

        new_elems.push(clone);
    })

    if (new_elems.length == 0) {
        let notif = document.createElement("span");
        notif.textContent = "No upgrades!";
        new_elems.push(notif);
    }

    elem.replaceChildren(template, ...new_elems);
}

/**
 * 
 * @param {Player} player 
 * @param {*} choices 
 */
function render_ui_powercube_choices(player, choices_set) {
    // choices is a list of [{
    //    upgrade_req: "upgrade_key",
    //    choices: [Upgrade, Upgrade, Upgrade, ...]
    // }]
    let elem = document.querySelector(".powercubes-choices-container .powercubes-choices");

    let template1 = elem.querySelector(".powercubes-choice.template")
    let template2 = elem.querySelector(".powercubes-choice-button.template")

    let new_parent_elems = [];
    choices_set.forEach(choice => {
        if (player.get_upgrade_count_by_id(choice.upgrade_req) <= 0)
            return;

        let choice_available = choice.choices.every(upg => player.get_upgrade_count_by_id(upg.id) <= 0);

        let clone = template1.cloneNode(true);
        let new_elems = [];

        choice.choices.forEach(upg => {
            let cloneb = template2.cloneNode(true);

            if (choice_available) {
                cloneb.classList.add("choice-available");
                cloneb.addEventListener("mouseup", e => {
                    player.add_upgrade(upg, 1);
                    player.powercube_choices_changed = true;
                })
            } else if (player.get_upgrade_count_by_id(upg.id) <= 0) {
                cloneb.classList.add("unselected");
            }

            cloneb.querySelector(".choicename").textContent = upg.name;
            cloneb.querySelector(".choicedesc").textContent = upg.desc;
            cloneb.classList.remove("template");

            new_elems.push(cloneb);
        })

        clone.classList.remove("template");
        clone.replaceChildren(...new_elems);
        new_parent_elems.push(clone);
    })

    elem.replaceChildren(template1, ...new_parent_elems);
}

function render_ui_powercube_buttons(player, powercube_choices) {
    let gain = player.calc_collapse_gain();
    if (gain > 0) {
        document.querySelector(".ascend-button").classList.remove("disabled")
        document.querySelector(".ascend-text").classList.remove("disabled")

        document.querySelector(".ascend-button .powercubes-projected-gain").classList.remove("nodisplay");
        document.querySelector(".ascend-button .powercubes-projected-gain").textContent = `+❒${format_number(gain)}`;

        document.querySelector(".powercubes-projected-gain-mini").classList.remove("nodisplay");
        document.querySelector(".powercubes-projected-gain-mini").textContent = `+${format_number(gain)}`;
        
        document.querySelector(".powercubes-next-req").textContent = `next: ◕ ${format_number(player.calc_next_collapse_target())}`
    } else {
        document.querySelector(".ascend-button").classList.add("disabled");
        document.querySelector(".ascend-text").classList.add("disabled")

        document.querySelector(".powercubes-projected-gain").classList.add("nodisplay");
        document.querySelector(".powercubes-projected-gain-mini").classList.add("nodisplay");

        document.querySelector(".powercubes-next-req").textContent = `next: ◕ ${format_number(player.calc_next_collapse_target())}`
    }

    let choice_taken = powercube_choices.some(choice => {
        return choice.choices.some(upg => player.get_upgrade_count_by_id(upg.id) > 0);
    });

    if (choice_taken) {
        document.querySelector(".reset-powercubes-toggle").classList.remove("disabled");
    } else {
        document.querySelector(".reset-powercubes-toggle").classList.add("disabled");
    }
}

function render_ui_playerstats(player) {
    let e = document.querySelector(".windows .player-stats-view");

    e.querySelector(".player-damage").textContent = `${format_number(Math.round(player.stats.damage))}`;
    e.querySelector(".player-atkspeed").textContent = `${Math.round(player.stats.atk_speed * 100)}%`;
    e.querySelector(".player-luck").textContent = `${format_number(Math.round(player.stats.luck * 100) / 100)}x`;
    e.querySelector(".player-movespeed").textContent = `${player.stats.movespeed.toFixed(0)} px/s`;

    let tilepos = scaling.wttp(player.position).floor();
    e.querySelector(".player-position").textContent = tilepos.toString();
    e.querySelector(".player-depth").textContent = `${player.get_depth()}m`;

    if (player.stats.crit_chance == 0) {
        e.querySelector(".player-crit").parentElement.classList.add("nodisplay");
    } else {
        e.querySelector(".player-crit").parentElement.classList.remove("nodisplay");
        e.querySelector(".player-crit").textContent = `${(player.stats.crit_chance * 100).toFixed(0)}%, ${player.stats.crit_damage}x dmg`
    }

    if (player.stats.flurry_chance == 0) {
        e.querySelector(".player-flurry").parentElement.classList.add("nodisplay");
    } else {
        e.querySelector(".player-flurry").parentElement.classList.remove("nodisplay");
        e.querySelector(".player-flurry").textContent = `${(player.stats.flurry_chance * 100).toFixed(0)}%, ${player.stats.flurry_effectiveness}x speed`
    }
}

function switch_display_menu(bar_elem, content_parent_elem, menuname) {
    bar_elem.querySelectorAll(".select-bar-button").forEach(e => e.classList.remove("selected"));
    bar_elem.querySelector(`.${menuname}`).classList.add("selected");

    [...content_parent_elem.children].forEach(c => c.classList.remove("active"));
    content_parent_elem.querySelector(`.${menuname}`).classList.add("active");
}

function get_mine_player_modifications(mine) {
    // Cleared tiles are modified by the player.
    // No other tiles are modified by the player.
    // Worldgen always keeps all near tiles visible so it's OK to just save+load cleared tiles and nothing else.
    let modifications = [...default_mine.tiles.keys().filter(k => {
        let tile = default_mine.tiles.get(k);
        return tile.cleared || tile.hp != tile.max_hp
    })].map(k => {
        let tile = default_mine.tiles.get(k);
        let obj = {
            key: k,
            cleared: tile.cleared,
            features: tile.features,
            hp: tile.hp,
        }
        if (!tile.cleared) {
            obj.richnesses = tile.richnesses
        }

        return obj;
    });

    return modifications;
}

function save_game_to_string(player, mine) {
    let ignored_player_vars = [
        "last_depth", "mining_cooldown", "mining_target", "particles_board",
        "radius", "select_particle", "stat_additions", "stat_multipliers", "stats",
        "mine", "hide_display", "lock_input",
    ]; // plus any "_changed" variable

    let player_vars = {};
    Object.keys(player).forEach(k => {
        if (ignored_player_vars.includes(k) || k.endsWith("_changed"))
            return

        let val = player[k];
        if (val instanceof Vector2) {
            val = {typ: "Vector2", params: [val.x, val.y]};
        }

        player_vars[k] = val;
    })

    let mine_info = {};
    mine_info = {
        tiles: get_mine_player_modifications(mine),
        seed: mine.seed,
        generation_settings: mine.generation_settings.name,
        random_state: mine.random(true)
    };

    return btoa(JSON.stringify({
        player: player_vars,
        mine: mine_info
    }));
}

function save_game(msg_prefix="") {
    try {
        let start_time = Date.now();
        let save_string = save_game_to_string(player, default_mine);
        localStorage.setItem(SAVE_KEY, save_string);
        let end_time = Date.now();
        add_message(
            `${Date.now()}-savedisplay-success`,
            `Game ${msg_prefix}saved. (took ${Math.max(1, (end_time - start_time)).toFixed(0)}ms)`,
            Colour.green
        );
    } catch {
        add_message(
            `${Date.now()}-savedisplay-fail`,
            "Error saving game. Uh.... ping plaao???",
            Colour.red
        )
    }
}

/**
 * THIS CAN ONLY BE RUN AT INITIALISATION TIME!!!!!
 * @returns {[Player, Mine, ParticleBoard]} Player, mine, particle board
 */
function load_game_from_string(save_string) {
    let savedata = JSON.parse(atob(save_string));

    let newmine = new Mine(
        savedata.mine.seed, null,
        generation_settings[savedata.mine.generation_settings]
    );
    
    savedata.mine.tiles.forEach(t => {
        let newtile = new Tile(t.richnesses ?? {}, t.cleared, t.features);
        
        newtile.hp = t.hp;
        
        let xy = newmine.index_to_xy(t.key);
        newmine.set_tile(
            xy[0], xy[1], newtile
        )
    })
    
    let particles_board = new ParticleBoard();
    let player = new Player(
        newmine, particles_board,
        new Vector2(...savedata.player.position.params),
        {}, {}, [], {}
    );

    Object.keys(savedata.player).forEach(k => {
        if (savedata.player[k]?.typ == "Vector2") {
            player[k] = new Vector2(...savedata.player[k].params);
        } else {
            player[k] = savedata.player[k];
        }
    })

    // player.mine = newmine;

    player.recalculate_stats();

    return [player, newmine, particles_board];
}

function onFileSelected(event) {
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    var imgtag = document.getElementById("player_stats_icon");
    imgtag.title = selectedFile.name;

    reader.onload = function(event) {
        imgtag.src = event.target.result;
        player.custom_icon_b64 = imgtag.src;
        player.icon_changed = true;

        last_autosave_time = Date.now();
        save_game("auto");
    };

    reader.readAsDataURL(selectedFile);
}

function clear_custom_icon() {
    player.custom_icon_b64 = null;
    player.icon_changed = true;

    last_autosave_time = Date.now();
    save_game("auto");
}

let default_generation_settings = {
    name: "default",
    veins: [
        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.CHALCOPYRITE, 1]]
            ],
            0.02, 0.025,
            0, 250,
            0.25, 0.75, 0.4, 0.4,
            0.2,
            3, 5,
            0.25, 0.6
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.SIDERITE, 1]]
            ],
            0.001, 0.02,
            10, 750,
            0.15, 1, 0.4, 0.4,
            0.2,
            5, 8,
            0.2, 0.4
        ),

        new ResourceVeinGenerationSettings(
            [
                [
                    1, [TileResource.CHALK, 1],
                ]
            ],
            0.0005, 0.003,
            25, 250,
            0.6, 1, 0.4, 0.4,
            -0.8,
            11, 14,
            0.1, 0.2
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.MALACHITE, 1]],
                [0.2, [TileResource.AZURITE, 0.4]],
            ],
            0.01, 0.02,
            100, 2000,
            0.25, 0.75, 0.4, 0.4,
            2,
            3, 6,
            0.25, 0.6
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.SAND, 0.5]],
                [0.02, [TileResource.AMBER, 4]]
            ],
            0.004, 0.002,
            10, 500,
            0.6, 1, 0.4, 0.4,
            -1,
            6, 8,
            0.4, 0.7
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.AMETHYST, 1]]
            ],
            0.001, 0.002,
            50, 2000,
            0.75, 1, 0.2, 0,
            0.25,
            1, 3,
            0.9, 1
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.PERIDOT, 1]]
            ],
            0.00075, 0.002,
            100, 5000,
            0.75, 1, 0.2, 0,
            0,
            1, 2,
            0.9, 1
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.RUBY, 1]]
            ],
            0.0005, 0.0015,
            500, 10000,
            0.75, 1, 0.2, 0,
            1,
            1, 2,
            0.9, 1
        ),
    ]
}

let generation_settings = {
    default: default_generation_settings
}

let normal_upgrades = [
    // SOMNIA
    new Upgrade(
        "somnia-lightlevelplus1", "Light+", "pink", "Increases light level by +0.2px per level.",
        10, 1.35, Currency.GOLD, 0, 40,
        Upgrade.add_to_stats(["lightlevel", 0.2]), false, (p) => {
            return [
                `Choose the Somnia path.`,
                p.get_upgrade_count(upgrades_lookup.get("pcx1-darkness")) >= 1
            ]
        }, true
    ),

    new Upgrade(
        "damageplus1", "Damage+", "cyan", "Increases damage by +1 per level.",
        10, 1.15, Currency.GOLD, 0, 50,
        Upgrade.add_to_stats(["damage", 1])
    ),

    new Upgrade(
        "luckplus1", "Luck+", "cyan", "Increases luck by +0.1 per level.",
        10, 1.5, Currency.GOLD, 0, 50,
        Upgrade.add_to_stats(["luck", 0.1])
    ),

    new Upgrade(
        "miningspeedplus1", "Mining Speed+", "cyan", "Increases mining speed by 2% per level.",
        20, 1.3, Currency.GOLD, 0, 20,
        Upgrade.add_to_stats(["atk_speed", 0.02])
    ),

    new Upgrade(
        "movespeedplus1", "Movement Speed+", "cyan", "Increases movement speed by +4 px/s per level.",
        25, 1.3, Currency.GOLD, 0, 16,
        Upgrade.add_to_stats(["movespeed", 4])
    ),

    new Upgrade(
        "somnia-miningspeed_from_movespeed1", "Momentum", "pink", "Increases final mining speed by 10% for every 16 px/s of movement speed.",
        777, 1.5, Currency.GOLD, 101, 1,
        (p, n) => {
            p.add_incalc_stat("atk_speed", Math.floor(p.get_incalc_stat("movespeed") / 16) * 0.1)
        },
        true, (p) => {
            return [
                `Pick the Somnia facet.`,
                p.get_upgrade_count(upgrades_lookup.get("pcx1-darkness")) >= 1
            ]
        }, true
    ),

    new Upgrade(
        "luckplus2", "Luck++", "#8ff", "Increases luck by +0.25 per level.",
        1000, 1.5, Currency.GOLD, 0, 5,
        Upgrade.add_to_stats(["luck", 0.25]),
        true,
    ),

    new Upgrade(
        "damageplus2", "Damage++", "#8ff", "Increases damage by +10 per level.",
        2500, 1.25, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["damage", 10]),
        true,
    ),

    new Upgrade(
        "miningspeedplus2", "Mining Speed++", "#8ff", "Increases mining speed by 10% per level.",
        5000, 1.25, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["atk_speed", 0.1]),
        true,
    ),

    new Upgrade(
        "somnia-luckpluslight1", "Clarity", "orchid", "Increases final luck by +0.05 per level for every 1px of light level.",
        6666, 1.4, Currency.GOLD, 101, 10,
        (p, n) => {
            p.add_incalc_stat("luck", Math.floor(p.get_incalc_stat("lightlevel") / 1) * 0.05 * n)
        },
        true, (p) => {
            return [
                `Pick the Somnia facet.`,
                p.get_upgrade_count(upgrades_lookup.get("pcx1-darkness")) >= 1
            ]
        }, true
    ),

    new Upgrade(
        "depth_luck1", "Depth Delver", "#ffa", "Multiplies luck by 1.5x when over 100m deep.",
        20000, 1.25, Currency.GOLD, 10, 1,
        (p, n) => {
            if (p.get_depth() > 100) {
                p.mul_incalc_stat("luck", 1.5)
            }
        },
        true, (p) => {
            return [
                "Collect 1x total Azurite",
                p.item_records[Item.AZURITE] >= 1
            ]
        }
    ),

    new Upgrade(
        "somnia-miningspeed-from-depth", "Pressure", "pink", "Increases movement speed by 1px for every 3m current depth.",
        55555, 1.5, Currency.GOLD, 1, 1,
        (p, n) => {
            p.add_incalc_stat("movespeed", Math.floor(p.last_depth / 3) * 1)
        },
        true, (p) => {
            return [
                `Pick the Somnia facet.`,
                p.get_upgrade_count(upgrades_lookup.get("pcx1-darkness")) >= 1
            ]
        }, true
    ),

    new Upgrade(
        "damageplus3", "Damage++", "cyan", "Increases damage by +15 per level.",
        1e6, 1.15, Currency.GOLD, 0, 50,
        Upgrade.add_to_stats(["damage", 15]),
        true,
    ),

    new Upgrade(
        "luckplus3", "Luck++", "cyan", "Increases luck by +0.3 per level.",
        2e6, 1.5, Currency.GOLD, 0, 20,
        Upgrade.add_to_stats(["luck", 0.3]),
        true,
    ),
]

let powercube_upgrades = [
    new Upgrade(
        "pc-bonusall1", "Powercube Infusion", "coral", "Increases damage by +5, luck by +0.25, mining speed by 10% and movement speed by 8px/s per level.",
        1, 1.25, Currency.POWERCUBES, 0, 32,
        Upgrade.add_to_stats(["damage", 5], ["luck", 0.25], ["atk_speed", 0.1], ["movespeed", 8])
    ),

    new Upgrade(
        "pc-choice1", "Facet Alignment", "red", "Unlocks the first Powercube facet choice.",
        8, 2, Currency.POWERCUBES, 0, 1,
        () => null
    ),

    new Upgrade(
        "pc-bonus-starting-gold1", "Troves", "coral", "Start future collapses with ◕ 250 per level.",
        2, 1.25, Currency.POWERCUBES, 0, 8,
        () => null
    ),

    new Upgrade(
        "pc-bonus-crit-flurry-power", "Resurgence", "coral", "+0.1x crit damage/luck and +0.2x flurry speed per level. (no effect on chance)",
        16, 1.25, Currency.POWERCUBES, 0, 10,
        Upgrade.add_to_stats(["crit_damage", 0.1], ["flurry_effectiveness", 0.2])
    ),

    new Upgrade(
        "pc-bonus-crit-flurry", "Convergence", "coral", "+1% crit chance and +1% flurry chance per level.",
        64, 1.25, Currency.POWERCUBES, 0, 10,
        Upgrade.add_to_stats(["crit_chance", 0.01], ["flurry_chance", 0.01])
    ),
]

let powercube_choice_upgrades = [
    new Upgrade(
        "pcx1-darkness", "Somnia", "", "Enables darkness, but unlocks powerful ◕ upgrades.",
        1, 1, Currency.POWERCUBES, 0, 1, (p, n) => {
            p.stats.lightlevel_enabled = true;
        }
    ),

    new Upgrade(
        "pcx1-crit", "Clarity", "", "+20% base crit chance. (Crits have 3x damage and luck)",
        1, 1, Currency.POWERCUBES, 0, 1,
        Upgrade.add_to_stats(["crit_chance", 0.2])
    ),

    new Upgrade(
        "pcx1-bonus-richness", "Rage", "", "+20% base flurry chance. (Flurry hits have 0.25x cooldown)",
        1, 1, Currency.POWERCUBES, 0, 1,
        Upgrade.add_to_stats(["flurry_chance", 0.2])
    ),
]

let powercube_choices = [
    {
        upgrade_req: "pc-choice1",
        choices: [
            powercube_choice_upgrades[0],
            powercube_choice_upgrades[1],
            powercube_choice_upgrades[2],
        ]
    }
]

let upgrades_lookup = new Map();
normal_upgrades.forEach(u => upgrades_lookup.set(u.id, u));
powercube_upgrades.forEach(u => upgrades_lookup.set(u.id, u));
powercube_choice_upgrades.forEach(u => upgrades_lookup.set(u.id, u));

let default_mine = new Mine("123", null, default_generation_settings);
let main_particles_board = new ParticleBoard();
let player = new Player(default_mine, main_particles_board, new Vector2(16, 16), {}, {}, [], {});
// player.add_item(Item.CHALCOPYRITE, 1)
// player.add_currency(Currency.GOLD, 1000);

// default_mine.set_tile(0, 0, new Tile({}, true));
let render_distance = 6;

function input_handler(n) {
    if (keys_pressed_this_frame["KeyR"]) {
        save_game("manually ");
    }
    
    if (keys_pressed_this_frame["KeyQ"]) {
        // default_mine.tiles = new Map();
        if (zoom_level > 0.5) {
            render_distance *= 2;
            zoom_level /= 2;
            let tpos = scaling.wttp(player.position);

            generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
        }
    }

    if (keys_pressed_this_frame["KeyE"]) {
        // default_mine.tiles = new Map();
        if (zoom_level < 8) {
            render_distance /= 2;
            zoom_level *= 2;
            let tpos = scaling.wttp(player.position);

            generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
        }
    }

    if (keys_pressed_this_frame["KeyG"]) {
        // default_mine.tiles = new Map();
        rendering_diagnostics = !rendering_diagnostics;
        add_message(null, "Toggled diagnostics rendering")
    }

    if (keys_pressed_this_frame["KeyH"]) {
        // default_mine.tiles = new Map();
        player.stats.lightlevel_enabled = !player.stats.lightlevel_enabled;
        add_message(null, "Forced lightlevel toggle")
    }

    if (keys_down["ArrowDown"] || keys_down["KeyS"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(0, n), default_mine);
    }

    if (keys_down["ArrowUp"] || keys_down["KeyW"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(0, -n), default_mine);
    }

    if (keys_down["ArrowLeft"] || keys_down["KeyA"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(-n, 0), default_mine);
    }

    if (keys_down["ArrowRight"] || keys_down["KeyD"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(n, 0), default_mine);
    }
}

let tilestats_window = null;
let playerstats_window = null;
function setup_windows() {
    let help_window = spawn_window("minimise-only", "Help");
    help_window.content.innerHTML = help_html;
    help_window.content.querySelector(".closebutton").addEventListener("click", e => {
        toggle_minimise_window(help_window.window);
        player.closed_helpmenu = true;
    })

    if (player.closed_helpmenu) {
        toggle_minimise_window(help_window.window, true);
    }

    playerstats_window = spawn_window("minimise-only", "Stats");
    playerstats_window.content.append(
        document.querySelector(".templates .player-stats-view").cloneNode(true)
    )

    let psbbox = document.querySelector(".sidebar-ui").getBoundingClientRect();
    let psb_wnd_bbox = playerstats_window.window.getBoundingClientRect();
    move_window(playerstats_window.window, psbbox.x - psb_wnd_bbox.width - 8, 8);
    move_window(playerstats_window.window, psbbox.x - psb_wnd_bbox.width - 8, 8);

    toggle_minimise_window(playerstats_window.window, true);

    move_window(playerstats_window.window, psbbox.x - psb_wnd_bbox.width - 8, 8);
    move_window(playerstats_window.window, psbbox.x - psb_wnd_bbox.width - 8, 8);

    toggle_minimise_window(playerstats_window.window, false);

    tilestats_window = spawn_window("minimise-only", "Current tile target");
    tilestats_window.content.append(
        document.querySelector(".templates .tile-info-view").cloneNode(true)
    )

    let bbox = tilestats_window.window.getBoundingClientRect();
    move_window(tilestats_window.window, 8, window.innerHeight - bbox.height - 8);
    move_window(tilestats_window.window, 8, window.innerHeight - bbox.height - 8);

    toggle_minimise_window(tilestats_window.window, true);

    let bbox2 = tilestats_window.window.getBoundingClientRect();
    move_window(tilestats_window.window, 8, window.innerHeight - bbox2.height - 8);
    move_window(tilestats_window.window, 8, window.innerHeight - bbox2.height - 8);
}

handlers.game_postload_fn = () => {
    let load_string = localStorage.getItem(SAVE_KEY);
    if (load_string) {
        try {
            let res = load_game_from_string(load_string);

            player = res[0];
            default_mine = res[1];
            main_particles_board = res[2];

            add_message(
                `${Date.now()}-load-success`,
                "Loaded game successfully!"
            )
        } catch {
            add_message(
                `${Date.now()}-load-fail`,
                "Failed to load game. Savefile looks corrupt... ping plaao...?",
                Colour.red
            )
        }
    } else {
        add_message(
            `${Date.now()}-load-fail`,
            "There was no save. Starting new game!",
            Colour.yellow
        )
    }

    setTimeout(_ => add_message(
        `${Date.now()}-autosave-display`,
        `Autosaving every ${(AUTOSAVE_DELAY / 1000).toFixed(0)}s (press 'R' to save manually)`,
    ), 1000);

    setup_shaking_text();

    refresh_wtsp_stwp();
    recenter_view(Vector2.zero);
    let tpos = scaling.wttp(player.position);

    generate_chunk(tpos.x, tpos.y, render_distance, default_mine);

    // Set up select-bar listeners
    let main_selectbar = document.querySelector(".select-bar");
    let main_contentarea = document.querySelector(".sidebar-menu-content");
    main_selectbar.querySelectorAll(".select-bar-button").forEach(e => {
        e.addEventListener("mouseup", evt => {
            switch_display_menu(main_selectbar, main_contentarea, [...e.classList].filter(c => c != "select-bar-button")[0]);
        })
    })

    switch_display_menu(main_selectbar, main_contentarea, "upgrades");

    setup_windows();

    document.querySelector(".ascend-button").addEventListener("click", e => {
        if (player.lock_input || document.querySelector(".ascend-button").classList.add("disabled"))
            return;

        try_collapse(player);
    });

    document.querySelector(".reset-powercubes-toggle").addEventListener("click", e => {
        if (player.lock_input || document.querySelector(".reset-powercubes-toggle").classList.contains("disabled"))
            return;

        try_reset_powercube_facets(player);
    });

    // setTimeout(_ => item_gain_displays.set(Item.CHALCOPYRITE, {
    //     amount: 32,
    //     spawn_time: Date.now()
    // }), 1000);
}

handlers.calc_fn = (dt) => {
    let max_delta_time = 1/30;
    let time_delta = Math.min(max_delta_time, dt);

    let n = player.stats.movespeed * time_delta;

    input_handler(n);

    main_particles_board.particles_step(time_delta);

    player.mining_target_step(time_delta);

    shake_elems.forEach(el => {
        if (el.parent.classList.contains("disabled")) {
            el.e.style.transform = "";
            return;
        }

        el.timeout -= dt;
        while (el.timeout <= 0) {
            el.timeout += random_int(40, 50) / 1000;
            shake_fn(el.e);
        }
    })

    if (Date.now() >= last_autosave_time + AUTOSAVE_DELAY) {
        last_autosave_time = Date.now();
        save_game("auto");
    }

    if (player.consume_change("position")) {
        let tpos = scaling.wttp(player.position);
        generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
    }
}

handlers.render_fn = () => {
    recenter_view(player.position);
    render_tiles(player, default_mine);
    render_player(player);
    render_particles(main_particles_board);
    render_ui_item_gain_displays();

    if (player.consume_change("inventory")) {
        render_ui_inventory(player);
        player.upgrades_changed = true;
    }

    if (player.consume_change("target")) {
        render_ui_tilestats(player);
    }

    if (player.consume_change("currencies")) {
        render_ui_currencies(player);
        render_ui_powercube_buttons(player, powercube_choices);
        player.upgrades_changed = true;
    }

    if (player.consume_change("upgrades")) {
        render_ui_upgrades(player, normal_upgrades, "upgrades-container", MAX_VISIBLE_UPGRADES);
        render_ui_upgrades(player, powercube_upgrades, "powercubes-upgrades-container", MAX_POWERCUBE_VISIBLE_UPGRADES);
        render_ui_powercube_choices(player, powercube_choices);
    }

    if (player.consume_change("stats")) {
        render_ui_playerstats(player);
    }

    if (player.consume_change("icon")) {
        document.querySelector("#player_stats_icon").src = player.custom_icon_b64 ?? "assets/img/sprites/player/orb.png";
        entity_sprites.set("orb_custom", [document.querySelector("#player_stats_icon")]);
    }

    if (player.consume_change("powercube_choices")) {
        render_ui_powercube_choices(player, powercube_choices);
        render_ui_powercube_buttons(player, powercube_choices);
    }
}