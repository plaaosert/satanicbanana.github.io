game_id = "plorp2";

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

const ItemData = {
    // Granite
    [Item.GRANITE]: {
        gold_value: 1
    },

    // Rocks
    [Item.CHALK]: {
        gold_value: 2
    },

    // Copper
    [Item.CHALCOPYRITE]: {
        gold_value: 5
    },

    [Item.MALACHITE]: {
        gold_value: 50
    },

    [Item.AZURITE]: {
        gold_value: 100
    },

    // Iron
    [Item.SIDERITE]: {
        gold_value: 15
    },
}

const Currency = {
    GOLD: "Gold"
}

const CurrencyIcons = {
    [Currency.GOLD]: "◕"
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
            [1, Item.CHALK]
        ], 1, 100, 5
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

    constructor(richnesses, cleared) {
        this.richnesses = richnesses;
        this.cleared = cleared;

        this.max_hp = this.get_max_hp();
        this.hp = this.max_hp;

        this.armour = this.get_armour();

        this.x = null;
        this.y = null;

        this.colour = this.determine_colour();
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
        return this.colour.css();
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

    constructor(mine, particles_board, position, upgrades, inventory, equipment_inventory, currencies) {
        this.position = position;
        this.upgrades = upgrades;
        this.inventory = inventory;
        this.equipment_inventory = equipment_inventory;
        this.currencies = currencies;

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
    }

    consume_change(on) {
        let state = this[`${on}_changed`];
        
        this[`${on}_changed`] = false;

        return state;
    }

    recalculate_stats() {
        this.stats_changed = true;

        let base_stats = {
            damage: 5,
            atk_delay: 1,
            luck: 1,
            movespeed: 32,
        };

        this.stats = base_stats;

        this.get_all_upgrades().forEach(upgrade => {
            upgrades_lookup.get(upgrade[0]).on_stats(this, upgrade[1]);
        });

        // this.mining_cooldown = this.stats.atk_delay;
    }

    // Upgrades
    get_all_upgrades() {
        return Object.keys(this.upgrades).map(k => {
            return [k, this.upgrades[k]]
        }).filter(e => e[1] != 0);
    }

    get_upgrade_count(upgrade) {
        return this.upgrades[upgrade.id] ?? 0;
    }

    add_upgrade(upgrade, amt) {
        this.set_upgrade_count(upgrade, (this.upgrades[upgrade.id] ?? 0) + amt);
        this.upgrades_changed = true;
        
        this.recalculate_stats();
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
            play_audio("generic_kaching", 0.225);
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

    move(by, collision=true) {
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
    }

    lose_mining_target() {
        this.mining_target = null;
        this.mining_cooldown = this.stats.atk_delay;
        this.select_particle?.expire();

        this.target_changed = true;
    }

    deal_damage(to_tile, damage_amt) {
        this.target_changed = true;
        return to_tile.take_damage(damage_amt);
    }

    mining_target_step(delta_time) {
        let target_thresh = BASE_TILE_SCALE / 4;

        if (this.mining_target) {
            this.mining_cooldown -= delta_time;
            while (this.mining_cooldown <= 0) {
                this.mining_cooldown += this.stats.atk_delay;

                let dmg_dealt = this.deal_damage(this.mining_target, this.stats.damage);
                play_audio(`pick_hit${random_int(1, 5)}`);
                
                if (dmg_dealt > 0) {
                    this.roll_loot(this.mining_target, dmg_dealt, this.stats.luck)
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
                if (this.mine.random() < chance) {
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

class Upgrade {
    static add_to_stats(...stats_and_values) {
        return ((p, n) => {
            stats_and_values.forEach(sv => {
                p.stats[sv[0]] += sv[1] * n;
            })
        })
    }

    static mul_to_stats(...stats_and_values) {
        return ((p, n) => {
            stats_and_values.forEach(sv => {
                p.stats[sv[0]] *= Math.pow(sv[1], n);
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
     */
    constructor(id, name, col, desc, base_cost, cost_scaling, cost_currency, priority, max_cnt=null, on_stats=null) {
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
    }

    get_number_buyable(player, cur_owned) {
        let player_currency = player.get_currency_amt(this.cost_currency);
        let limit = (this.max_cnt ?? Number.POSITIVE_INFINITY - cur_owned);
        
        return Math.min(
            limit,
            Math.floor(Upgrade.calc_amount_from_cost(player_currency, this.base_cost, this.cost_scaling, cur_owned) + 1)
        );
    }

    get_purchase_cost(cur_owned, buy_amount) {
        return Upgrade.calc_cost_from_amount(this.base_cost, this.cost_scaling, buy_amount-1, cur_owned)
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

function render_tiles(mine) {
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
            if (tile && !tile.cleared) {
                let col = tile.get_colour_css();
                ctx.fillStyle = col;
            } else {
                ctx.fillStyle = Colour.black.css();
                // no need to fill, we already cleared the canvas
                continue;
            }

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

    let bbox = player.get_bbox();
    let bbox_inner = player.get_bbox(-1);

    let outerpos = scaling.wtsp(bbox.tl);
    let innerpos = scaling.wtsp(bbox_inner.tl);

    // layers.fg2.ctx.fillStyle = "white";
    // layers.fg2.ctx.fillRect(outerpos.x, outerpos.y, bbox.width * zoom_level, bbox.height * zoom_level);
    // layers.fg2.ctx.fillStyle = "lime";
    // layers.fg2.ctx.fillRect(innerpos.x, innerpos.y, bbox_inner.width * zoom_level, bbox_inner.height * zoom_level);

    let ppos = scaling.wtsp(player.position).round();
    write_rotated_image(layers.fg2, layers.fg2.ctx, ppos.x, ppos.y, entity_sprites.get("orb")[0], bbox.width * zoom_level, bbox.height * zoom_level, 0)
}

function render_particles(particles_board) {
    layers.fg1.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui2.ctx.clearRect(0, 0, canvas_width, canvas_height);
    layers.ui1.ctx.clearRect(0, 0, canvas_width, canvas_height);

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

function render_ui_inventory(player) {
    let e = document.querySelector(".inventory-view");

    // e.querySelectorAll(".inventory-view > *:not(.template)").forEach(elem => {
    //     e.removeChild(elem);
    // });

    let template = e.querySelector(".template");

    let elems = [];
    player.get_all_items().sort((a,b) => a[0].localeCompare(b[0])).sort((a,b) => ItemData[a[0]].gold_value - ItemData[b[0]].gold_value).forEach(item => {
        let clone = template.cloneNode(true);

        clone.classList.remove("template");

        clone.querySelector(".item-name").textContent = item[0].padEnd(16, "\xa0");
        clone.querySelector(".item-number").textContent = `${item[1]}x`.padEnd(10, "\xa0");
        clone.querySelector(".item-value").textContent = ItemData[item[0]].gold_value.toString().padEnd(8, "\xa0");

        clone.querySelector(".sell-button.sell1").addEventListener("click", e => {
            let n = 1;
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sell25").addEventListener("click", e => {
            let n = Math.ceil(player.get_item_amt(item[0]) * 0.25);
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sell50").addEventListener("click", e => {
            let n = Math.ceil(player.get_item_amt(item[0]) * 0.5);
            player.sell_item(item[0], n);
        })

        clone.querySelector(".sell-button.sellall").addEventListener("click", e => {
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

        e.querySelector(".tile-hp").textContent = (tile.hp == tile.max_hp ? tile.max_hp : (Math.max(1, Math.floor(tile.hp)))).toFixed(0);
        e.querySelector(".tile-max-hp").textContent = tile.max_hp.toFixed(0);
        e.querySelector(".tile-hp-pct").textContent = Math.max(1, Math.floor(100 * tile.hp / tile.max_hp)).toFixed(0);

        e.querySelector(".tile-armour").textContent = tile.armour.toFixed(1);

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
    document.querySelector(".gold-value").textContent = player.get_currency_amt(Currency.GOLD);
}

/**
 * 
 * @param {Player} player 
 * @param {[Upgrade]} upgrades 
 */
function render_ui_normal_upgrades(player, upgrades) {
    let elem = document.querySelector(".upgrades-container");

    let template = elem.querySelector(".template");

    let new_elems = [];
    upgrades.forEach(upgrade => {
        let clone = template.cloneNode(true);

        let player_upgrade_cnt = player.get_upgrade_count(upgrade);
        let cost_1 = upgrade.get_purchase_cost(player_upgrade_cnt, 1);
        let max_buy = upgrade.get_number_buyable(player, player_upgrade_cnt);
        let cost_max = upgrade.get_purchase_cost(player_upgrade_cnt, max_buy);

        clone.querySelector(".upgrade-name").textContent = upgrade.name;
        clone.querySelector(".upgrade-name").style.color = upgrade.col;

        clone.querySelector(".upgrade-cost").textContent = `${CurrencyIcons[upgrade.cost_currency]} ${cost_1}`;
        clone.querySelector(".upgrade-cost-max").textContent = `${CurrencyIcons[upgrade.cost_currency]} ${cost_max}`;
        
        clone.querySelector(".upgrade-description").textContent = upgrade.desc;
        clone.querySelector(".upgrade-num-owned").textContent = upgrade.max_cnt === null ? `${player_upgrade_cnt}x` : `${player_upgrade_cnt}/${upgrade.max_cnt}`

        clone.querySelector(".upgrade-max-amt").textContent = `${max_buy}`;
        clone.querySelector(".upgrade-max-cost").textContent = `${cost_max}`;

        if (max_buy >= 1) {
            clone.querySelector(".upgrade1").addEventListener("click", e => {
                player.buy_upgrade(upgrade, 1);
            })

            clone.querySelector(".upgrademax").addEventListener("click", e => {
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
        notif.textContent = "No upgrades?!";
        new_elems.push(notif);
    }

    elem.replaceChildren(template, ...new_elems);
}

let default_generation_settings = {
    veins: [
        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.CHALCOPYRITE, 1]]
            ],
            0.02, 0.025,
            0, 250,
            0.25, 0.75, 0.4, 0.4,
            0.2,
            3, 6,
            0.25, 0.6
        ),

        new ResourceVeinGenerationSettings(
            [
                [1, [TileResource.SIDERITE, 1]]
            ],
            0.001, 0.02,
            5, 750,
            0.15, 1, 0.4, 0.4,
            0.2,
            5, 8,
            0.2, 0.4
        ),

        new ResourceVeinGenerationSettings(
            [
                [
                    1, [TileResource.CHALK, 1],
                    1, [TileResource.CHALK, 2],
                    0.5, [TileResource.CHALK, 3],
                    0.25, [TileResource.CHALK, 4],
                ]
            ],
            0.0005, 0.003,
            25, 250,
            0.15, 1, 0.4, 0.4,
            0.2,
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
        )
    ]
}

let upgrades = [
    new Upgrade(
        "damageplus1", "Damage+", "cyan", "Increases damage by +1 per level.",
        10, 1.5, Currency.GOLD, 0, 25,
        Upgrade.add_to_stats(["damage", 1])
    ),

    new Upgrade(
        "luckplus1", "Luck+", "cyan", "Increases luck by +0.1 per level.",
        10, 3, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["luck", 0.1])
    ),

    new Upgrade(
        "miningspeedplus1", "Mining Speed+", "cyan", "Reduces base mining delay by 0.01s per level.",
        50, 1.5, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["atk_delay", -0.01])
    ),

    new Upgrade(
        "movespeedplus1", "Movement Speed+", "cyan", "Increases movement speed by +4 per level.",
        25, 1.75, Currency.GOLD, 0, 16,
        Upgrade.add_to_stats(["movespeed", 4])
    ),

    new Upgrade(
        "damageplus2", "Damage++", "#8ff", "Increases damage by +10 per level.",
        1000, 1.5, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["damage", 10])
    ),

    new Upgrade(
        "luckplus2", "Luck++", "#8ff", "Increases luck by +0.5 per level.",
        2500, 2, Currency.GOLD, 0, 5,
        Upgrade.add_to_stats(["luck", 0.5])
    ),

    new Upgrade(
        "miningspeedplus2", "Mining Speed++", "#8ff", "Reduces base mining delay by 0.02s per level.",
        5000, 1.5, Currency.GOLD, 0, 10,
        Upgrade.add_to_stats(["atk_delay", -0.02])
    ),
]

let upgrades_lookup = new Map();
upgrades.forEach(u => upgrades_lookup.set(u.id, u));

let default_mine = new Mine("123", null, default_generation_settings);
let main_particles_board = new ParticleBoard();
let player = new Player(default_mine, main_particles_board, new Vector2(16, 16), {}, {}, [], {});
// player.add_item(Item.CHALCOPYRITE, 1)
// player.add_currency(Currency.GOLD, 1000);

// default_mine.set_tile(0, 0, new Tile({}, true));
let render_distance = 6;

function input_handler(n) {
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

    if (keys_down["ArrowDown"] || keys_down["KeyS"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(0, n), default_mine);
        let tpos = scaling.wttp(player.position);

        generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
    }

    if (keys_down["ArrowUp"] || keys_down["KeyW"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(0, -n), default_mine);
        let tpos = scaling.wttp(player.position);
        
        generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
    }

    if (keys_down["ArrowLeft"] || keys_down["KeyA"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(-n, 0), default_mine);
        let tpos = scaling.wttp(player.position);
        
        generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
    }

    if (keys_down["ArrowRight"] || keys_down["KeyD"]) {
        // default_mine.tiles = new Map();
        player.move(new Vector2(n, 0), default_mine);
        let tpos = scaling.wttp(player.position);
        
        generate_chunk(tpos.x, tpos.y, render_distance, default_mine);
    }
}

let tilestats_window = null;
handlers.game_postload_fn = () => {
    refresh_wtsp_stwp();
    recenter_view(Vector2.zero);
    let tpos = scaling.wttp(player.position);

    generate_chunk(tpos.x, tpos.y, render_distance, default_mine);

    let help_window = spawn_window("minimise-only", "Help");
    help_window.content.innerHTML = help_html;
    help_window.content.querySelector(".closebutton").addEventListener("click", e => {
        toggle_minimise_window(help_window.window);
    })

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

handlers.calc_fn = (dt) => {
    let max_delta_time = 1/30;
    let time_delta = Math.min(max_delta_time, dt);

    let n = player.stats.movespeed * time_delta;

    input_handler(n);

    main_particles_board.particles_step(time_delta);

    player.mining_target_step(time_delta);
}

handlers.render_fn = () => {
    recenter_view(player.position);
    render_tiles(default_mine);
    render_player(player);
    render_particles(main_particles_board);

    if (player.consume_change("inventory")) {
        render_ui_inventory(player);
    }

    if (player.consume_change("target")) {
        render_ui_tilestats(player);
    }

    if (player.consume_change("currencies")) {
        render_ui_currencies(player);
        render_ui_normal_upgrades(player, upgrades);
    }

    if (player.consume_change("upgrades")) {
        render_ui_normal_upgrades(player, upgrades);
    }
}