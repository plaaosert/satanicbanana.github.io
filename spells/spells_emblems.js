class Emblem {
    constructor(iname, name, desc, to_core_stats, player_special_function) {
        this.iname = iname;
        this.name = name;
        this.desc = desc;
        this.to_core_stats = to_core_stats ? to_core_stats : function(user, spell, stats) {return null}
        this.player_special_function = player_special_function ? player_special_function : function(game, ent, event_info) {return null};
    }
}

function find_emblem_by_iname(iname) {
    let matches = emblems_list.filter(emblem => {
        return emblem.iname.toLowerCase().includes(iname.toLowerCase());
    });

    // pick the shortest one
    let shortest = null;
    matches.forEach(st => {
        if (!shortest || st.iname.length < shortest.iname.length) {
            shortest = st;
        }
    });

    return shortest;
}

function get_emblem_by_iname(iname) {
    return emblems_lookup.get(iname);
}

emblems_list = [
    // levelup
    new Emblem(
        "lv10_dmg", "Level Ascension: [#f80]Damage",
        "All cores gain +[#0cf]7[clear] damage value.",
        common_stat_mod({damage: 7})
    ),

    new Emblem(
        "lv10_radius", "Level Ascension: [#0f0]Radius",
        "All cores gain +[#0cf]1[clear] radius.",
        common_stat_mod({radius: 1})
    ),

    new Emblem(
        "lv10_range", "Level Ascension: [#0cf]Range",
        "All cores gain +[#0cf]3[clear] range.",
        common_stat_mod({range: 3})
    ),

    // affinity events
    new Emblem(
        "affinity_necromancer", "[#74a]Necromancer",
        "You are a necromancer."
    ),

    new Emblem(
        "affinity_elementalist_fire", "[#e52]Fire Elemental",
        "You have the aspect of a fire elemental. You gain +[#0cf]1[clear] radius to all cores.",
        common_stat_mod({radius: 1})
    ),

    new Emblem(
        "affinity_elementalist_ice", "[#aff]Ice Elemental",
        "You have the aspect of an ice elemental."
    ),

    new Emblem(
        "affinity_elementalist_lightning", "[#ff3]Lightning Elemental",
        "You have the aspect of a lightning elemental. You gain +[#0cf]12[clear] damage to all cores.",
        common_stat_mod({damage: 12})
    ),

    new Emblem(
        "affinity_order_1", "[#D5C2A5]Order of Order Acolyte",
        "You are an Acolyte of the Order of Order. One allied [#dca]Rock Golem[clear] spawns near you at the start of every combat."
    ),

    new Emblem(
        "affinity_order_2", "[#D5C2A5]Order of Order Faithful",
        "You are a Faithful of the Order of Order. One allied [#dcd]Rock Titan[clear] spawns near you at the start of every combat."
    ),
]

let emblems_lookup = new Map();
emblems_list.forEach(e => {
    emblems_lookup.set(e.iname, e);
})
