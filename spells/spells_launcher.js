// set up spells here one last time:
// still need to link up the augment functions from spells_spells_funcs
typs = ["to_stats", "at_target", "on_hit", "on_affected_tiles"];
failed = [];

spells_list.forEach(spell => {
    for (let i=0; i<typs.length; i++) {
        if (spells_funcs[spell.name]) {
            spell.augment(typs[i], spells_funcs[spell.name][i])
        } else if (!failed.includes(spell.name)) {
            failed.push(spell.name);
        }
    }
});

if (failed.length > 0) {
    throw new TypeError("Spells do not have linked functions: " + failed.join(", "));
}

// will also need to re-add trigger effects to specific spells here
// (get them by name)
// e.g. the trigger-type modifiers and other assorted cores
trigger_spells = {
    "at_target": [
        "Spark", "Fireball with Trigger",
        "Lightning Bolt with Trigger", "Magic Missile with Trigger",
        "Add Target Trigger", "Chromatic Target Trigger",
        "Unreliable Target Trigger", "Multicast x3 with Trigger"
    ],

    "on_hit": [
        "Add Damage Trigger", "Unfair Damage Trigger"
    ],

    "on_affected_tiles": [
        "Add Tile Trigger", "Chromatic Tile Trigger", "Zenith Tile Trigger", "Unfair Tile Trigger"
    ],

    "none": [
        "Untrigger"
    ]
}

typs = ["none", "at_target", "on_hit", "on_affected_tiles"];
for (let i=0; i<typs.length; i++) {
    trigger_spells[typs[i]].forEach(name => {
        let spell = get_spell_by_name(name);

        spell.set_trigger(typs[i]);
        spell.augment("to_stats", function(user, spell, stats) {
            stats.trigger_type = typs[i];
        })
    })
}


let num_enemy_spawns = 0;

let board = new Board(new Vector2(64, 64));
let game = new Game(board);
let renderer = new Renderer(game, board, new Vector2(64, 36), 48, 48, 1/3);

game.spawn_player(get_entity_by_name("Player"), new Vector2(16, 18));

// let e1 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(12, 20), true)
// let e2 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(8, 20), true)
// let e3 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(12, 28), true)
// let e4 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(10, 24), true)
// 
// e1.spawn_protection = false;
// e2.spawn_protection = false;
// e3.spawn_protection = false;
// e4.spawn_protection = false;
// 
// game.wave_entities[e1.id] = e1;
// game.wave_entities[e2.id] = e2;
// game.wave_entities[e3.id] = e3;
// game.wave_entities[e4.id] = e4;

game.setup();

/*
game.spawn_entity(get_entity_by_name("test enemy"), Teams.PLAYER, new Vector2(12, 20), true).name = "friendly friend ^w^";

game.spawn_entity(get_entity_by_name("test enemy"), Teams.ENEMY, new Vector2(24, 24), true).name = "AAA enemy";
game.spawn_entity(get_entity_by_name("test enemy"), Teams.ENEMY, new Vector2(22, 24), true).name = "BBB enemy";
let moving_ent = game.spawn_entity(get_entity_by_name("test enemy"), Teams.ENEMY, new Vector2(20, 22), true);
moving_ent.name = "moving guy";
moving_ent.add_innate_spell([[
    core_spell(
        "Laser", "??", "white", "red", "", 16, DmgType.Psychic, 6, 1,
        Shape.Line, 0
    )
], 3, "Psycho-Laser", damage_type_cols["Psychic"]]);

game.spawn_entity(get_entity_by_name("big guy"), Teams.ENEMY, new Vector2(14, 22), true);

*/

for (let xt=0; xt<game.board.dimensions.x; xt++) {
    for (let yt=0; yt<game.board.dimensions.y; yt++) {
        if (game.random() < 0.01) {
            game.spawn_entity(get_entity_by_name("Wall"), Teams.UNALIGNED, new Vector2(xt, yt), false);
        }
    }
}

//let primed_spell_test = new PrimedSpell(game.player_ent, [spells_list[0],]);
//let target = new Vector2(20, 22);

game.player_spells = [
    {spells: [get_spell_by_name("fireball")], name: "Fireball"},
    {spells: gen_spells("tile trigger", "Fireball", "Retarget: Sparse", "Ice Ball"), name: "Lightning Bolt"},
    {spells: gen_spells("target trigger", "magic missile", "tile trigger", "ice ball", "tile trigger", "ice ball", "ice ball"), name: "Spell 3"},
    {spells: gen_spells("target trigger", "magic missile", "fireball"), name: "Spell 4"},
    {spells: spells_list.filter(s => s.name.startsWith("Retarget:")), name: "Spell 5"},
    /*
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(0, 20)], name: "0-20"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(20, 40)], name: "20-40"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(40, 60)], name: "40-60"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(60, 80)], name: "60-80"}
    */
]

game.player_ent.max_mp = 10000;
game.player_ent.mp = 10000;


game.player_add_spells_to_inv([
    get_spell_by_name("magic missile"),
    get_spell_by_name("damage plus i"),
    get_spell_by_name("damage plus i"),
    get_spell_by_name("range plus i"),
    get_spell_by_name("radius plus i"),
])

game.recent_spells_gained = [];

//game.player_ent.cast_spell(spell_simple, target);

/*
let test2 = function() {
    //game.end_turn();
    //game.turn_index = 0;
    //game.begin_turn();

    if (!game.is_player_turn()) {
        game.deselect_player_spell();
        return;
    }

    if (selected_spells.length > 0) {
        if (game.player_spell_in_range(target)) {
            game.player_ent.cast_spell(selected_spells, target);
        }
    }

    game.deselect_player_spell();
}

let test = function(spells) {
    if (!game.is_player_turn()) {
        return;
    }

    selected_spells = spells ? spells : spell_simple;
    game.select_player_spell(selected_spells);
    //test2();
}
*/


// game.player_add_spells_to_inv([...spells_list.filter(s => s.subtyp == SpellSubtype.Trigger || s.subtyp == SpellSubtype.Multicast)].flatMap(i => i));

// game.player_add_spells_to_inv([...spells_list.filter(s => s.is_red())]);

game.player_discard_edits();
game.open_inventory();

game.player_spells_edit[0][1] = game.player_spells_edit[0][0];
game.player_spells_edit[0][0] = null;

let xp_flash = new ParticleTemplate(["++", "''"], "#ddd", 1);

let generic_item_flash = new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "''"], "#fff", 0.5);

let item_tier_flashes = {
    "Tier1": {
        part: new ParticleTemplate(["@@", "##", "%%", "++", "''"], "#fff", 0.5),
        col_core: "#bbb",
        col_mod: "#28a"
    },
    "Tier2": {
        part: new ParticleTemplate(["@@", "##", "%%", "++", "''"], "#fff", 0.5),
        col_core: "#bbb",
        col_mod: "#28a"
    },
    "Tier3": {
        part: new ParticleTemplate(["@@", "##", "%%", "++", "''"], "#fff", 0.5),
        col_core: "#bbb",
        col_mod: "#28a"
    },
    "Tier4": {
        part: new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "''"], "#fff", 0.5),
        col_core: "#fff",
        col_mod: "#4df"
    },
    "Tier5": {
        part: new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "''"], "#fff", 0.5),
        col_core: "#fff",
        col_mod: "#4df"
    },
    "Tier6": {
        part: new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "::"], "#fff", 0.5),
        col_core: "#afa",
        col_mod: "#0fa"
    },
    "Tier7": {
        part: new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "::"], "#fff", 0.5),
        col_core: "#afa",
        col_mod: "#0fa"
    },
    "Tier8": {
        part: new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "::"], "#fff", 0.5),
        col_core: "#afa",
        col_mod: "#0fa"
    },
    "Tier9": {
        part: new ParticleTemplate(["[]", "@@", "&&", "##", "%%", "!!", "**", "++", "''"], "#fff", 0.5),
        col_core: "#72f",
        col_mod: "#41f"
    },
    "Tier10": {
        part: new ParticleTemplate(["[]", "@@", "&&", "##", "%%", "!!", "**", "++", "''"], "#fff", 0.5),
        col_core: "#f8f",
        col_mod: "#a5f"
    }
}

let lvl_flash = new ParticleTemplate(["**", "++", "\"\"", "''"], "#fff", 0.5);

let tmp = new ParticleTemplate(["@@", "##", "++", "--", ".."], "#f00", 1);
let ppos = new Vector2(0, 0);
let mov_dir = new Vector2(1, 0);

let hitcount = 0;

renderer.setup();

let last_frame_time = Date.now();
let frame_times = [];

let show_fps = false;
let show_ops = false;

let itemtest_config = {
    rounds: 100000,
    frag_num_show: 10
}

let debug_quicksaves = {

}

renderer.render_game_checkerboard("black");
renderer.request_new_frame();

let next_frame_time = 0;

// Assumes you've already sorted out the line breaks and formatting.
function make_paginated_popup(string, padx, pady) {
    let original_popup_padx = renderer.msgbox_pad_x;
    let original_popup_pady = renderer.msgbox_pad_y;

    let messagebox_size = renderer.total_size.sub(new Vector2(padx, pady))
    
    let lines = string.split("\n");
    let lines_per_page = messagebox_size.y-6;

    if (lines_per_page < 1) {
        throw RangeError(`Messagebox padding is too small (lines per page: ${lines_per_page})`);
    }

    let num_pages_needed = Math.ceil(lines.length / lines_per_page);

    let messageboxes = [];

    for (let box_id=0; box_id<num_pages_needed; box_id++) {
        let button_data = []

        if (box_id != 0) {
            // back button if there is a page before this one
            button_data.push(
                [`< Page ${box_id}`, `#026`, function() {
                    renderer.add_messagebox(messageboxes[box_id-1], true);
                }]
            )
        } else {
            button_data.push(
                [`First page`, `#111`, function() {
                    renderer.add_messagebox(messageboxes[box_id], true);
                }, [`#222`, "#fff"]]
            )
        }

        // all messageboxes have a close button
        button_data.push(
            [`Close`, `#333`, function() {
                renderer.msgbox_pad_x = original_popup_padx;
                renderer.msgbox_pad_y = original_popup_pady;
            }]
        )

        if (box_id < num_pages_needed-1) {
            // forward button if not last page
            button_data.push(
                [`Page ${box_id+2} >`, `#026`, function() {
                    renderer.add_messagebox(messageboxes[box_id+1], true);
                }]
            )
        } else {
            button_data.push(
                [`Last page`, `#111`, function() {
                    renderer.add_messagebox(messageboxes[box_id], true);
                }, [`#222`, "#fff"]]
            )
        }

        let box = new MessageBoxTemplate(
            `Page ${box_id+1}`,
            lines.slice(box_id*lines_per_page, (box_id+1)*lines_per_page).join("\n"),
            button_data.map(t => t[0]),
            button_data.map(t => t[1]),
            button_data.map(t => t[2]),
            function(msgbox) { 
                renderer.msgbox_pad_x = padx;
                renderer.msgbox_pad_y = pady;
            },
            button_data.map(t => t.length >= 4 ? t[3] : null)
        )

        messageboxes.push(box);
    }

    renderer.add_messagebox(messageboxes[0], true);
}

function handle_debug_command() {
    debug_response = "#f00I got nothing. (use command \"h\")";
    let directive = debug_cmd.slice(1).split(/ (.*)/s)[0];
    let data = debug_cmd.slice(1).split(/ (.*)/s)[1];

    try {
        switch (directive) {
            case "h":
            case "help":
            case "?":
                debug_response = "#0f0";
                renderer.add_messagebox(messagebox_templates["debug_help_msgbox"], true)
                break;
            
            case "p":
                debug_response = "#0f0[" + directive + "] [" + data + "]"
                break;

            case "repeat":
            case "rep":
                let d = data.split(" ");
                let times = Number.parseInt(d[0]);
                for (let i=0; i<times; i++) {
                    debug_cmd = " " + d.slice(1).join(" ");
                    handle_debug_command();
                }

                debug_response = `#0f0repeated "${d.slice(1).join(" ")}" ${times} times`; 
                break;

            case "r":
            case "rp":
                let keep_random_state = directive == "rp";

                let num_rolls = 5;
                let min = 1;
                let max = 100;

                let old_rand = null;
                if (keep_random_state) {
                    old_rand = game.random(true);
                }

                if (data) {
                    let segs = data.split(" ");
                    if (segs.length == 1) {
                        num_rolls = Number.parseInt(segs[0]);
                    } else if (segs.length == 2) {
                        num_rolls = Number.parseInt(segs[0]);
                        max = Number.parseInt(segs[1]);
                    } else {
                        num_rolls = Number.parseInt(segs[0]);
                        min = Number.parseInt(segs[1]);
                        max = Number.parseInt(segs[2]);
                    }
                }

                rolls = Array(num_rolls).fill(0).map(_ => Math.floor(game.random() * (max - min)) + min)

                if (keep_random_state) {
                    game.random = random_from_parameters(...old_rand);
                }

                debug_response = `#0f0${rolls.join(", ")}`;

                break;

            case "qs":
                let quicksave_slot = null;
                if (data) {
                    quicksave_slot = data;
                } else {
                    quicksave_slot = 1;
                    while (debug_quicksaves[quicksave_slot.toString()]) {
                        quicksave_slot++;
                    }

                    quicksave_slot = quicksave_slot.toString();
                }

                let overwritten = debug_quicksaves[quicksave_slot] ? true : false;

                debug_quicksaves[quicksave_slot] = game.to_save_string();

                debug_response = `#0f0${overwritten ? "saved over name" : "saved new named"} [${quicksave_slot}] (chars: ${debug_quicksaves[quicksave_slot].length})`;
                break;

            case "ql":
                if (data || Object.keys(debug_quicksaves).length == 1) {
                    let load_name = data ? data : Object.keys(debug_quicksaves)[0];

                    load_game(debug_quicksaves[load_name]);

                    debug_response = `#0f0loaded quicksave [${load_name}]`;
                } else if (Object.keys(debug_quicksaves).length <= 0) {
                    debug_response = `#f00no quicksaves. use "qs" to make one.`;
                } else {
                    debug_response = `#0cfquicksave names: ${Object.keys(debug_quicksaves).sort().join(", ")}`;
                }
                break;

            case "w":
                if (data.toLowerCase() == "start") {
                    delete game.wave_entities["WAVESTOP_OBJ"]
                    debug_response = "#0f0wave progression restarted"
                } else if (data.toLowerCase() == "stop") {
                    game.wave_entities["WAVESTOP_OBJ"] = 1;
                    debug_response = "#0f0wave progression stopped"
                }
                break;

            case "ss":
                if (data.toLowerCase() == "reset") {
                    game.max_spell_speed = 0.075;
                    game.min_spell_speed = 0;
                    game.spell_speed = 0.075;

                    debug_response = "#0f0spell speed reset";
                } else {
                    game.max_spell_speed = Number.parseFloat(data);
                    game.min_spell_speed = game.max_spell_speed
                    game.spell_speed = game.max_spell_speed;

                    debug_response = `#0f0spell speed set to ${game.max_spell_speed}`;
                }
                break;

            case "emb":
                if (data) {
                    let emb = get_emblem_by_iname(data);
                    if (!emb) {
                        emb = find_emblem_by_iname(data);
                    }

                    if (emb) {
                        game.player_emblems.push(emb);
                        renderer.refresh_right_panel = true;
                        debug_response = `#0f0added emblem: "${emb.iname}"`;
                    } else {
                        debug_response = `#f00couldn't find an emblem with iname "${data}"`;
                    }
                } else {
                    debug_response = "#0f0opened a msgbox";

                    let longest_iname = emblems_list.reduce((a, v) => Math.max(v.iname.length, a), 0) + 1;
                    let total_size = renderer.total_size.x - 2;

                    let emblem_list_str = emblems_list.map(
                        e => `[#0cf]${e.iname.padEnd(longest_iname)}[clear] | ${e.desc.length > (total_size-longest_iname) ? e.desc.slice(0, (total_size-longest_iname-3)) + "..." : e.desc}`
                    ).join("\n")
                    
                    make_paginated_popup(emblem_list_str, 1, 1);
                }
                break;

            case "emball":
                game.player_emblems.push(get_emblem_by_iname("lv10_dmg"))
                game.player_emblems.push(get_emblem_by_iname("lv10_radius"))
                game.player_emblems.push(get_emblem_by_iname("lv10_range"))
                game.player_emblems.push(get_emblem_by_iname("affinity_necromancer"))
                game.player_emblems.push(get_emblem_by_iname("affinity_elementalist_fire"))
                game.player_emblems.push(get_emblem_by_iname("affinity_elementalist_ice"))
                game.player_emblems.push(get_emblem_by_iname("affinity_elementalist_lightning"))
                game.player_emblems.push(get_emblem_by_iname("affinity_order_1"))

                debug_response = `#0f0added 8 emblems`;
                break;

            case "lprog":
                game.player_location_progress++;
                renderer.refresh_right_panel = true;

                debug_response = `#0f0progressed location progress`;
                break;

            case "m":
                if (data) {
                    let msgbox = messagebox_templates[data]
                    let opened = false;

                    if (!msgbox) {
                        if (event_messageboxes[data]) {
                            opened = true;
                            game.trigger_event([data])
                            debug_response = `#0f0opened msgbox from the \"${data}\" pool`;
                        } else {
                            let chosen_msgbox_length = Number.POSITIVE_INFINITY;
                            events_list_unsorted.forEach(evt => {
                                if (evt.name.toLowerCase().includes(data.toLowerCase()) || evt.name.toLowerCase().replace("_", "").includes(data.toLowerCase())) {
                                    if (evt.name.length < chosen_msgbox_length) {
                                        msgbox = evt.msgbox
                                        chosen_msgbox_length = evt.name.length
                                    }
                                }
                            })
                        }
                    }

                    if (msgbox) {
                        renderer.add_messagebox(msgbox);
                        debug_response = `#0f0opened msgbox \"${data}\"`
                    } else if (!opened) {
                        debug_response = `#f00couldn't find a msgbox called \"${data}\"`
                    }
                }
                break;

            case "e":
                if (data) {
                    let segs = data.split(" ")
                    let name = "";
                    let pos = null;

                    if (segs.length == 1) {
                        name = segs[0];
                    } else if (segs.length == 3) {
                        pos = new Vector2(Number.parseInt(segs[0]), Number.parseInt(segs[1]));
                        name = segs[2]
                    }

                    let team = name.charAt(0) == "#" ? Teams.PLAYER : Teams.ENEMY;

                    let search_name = name.charAt(0) == "#" ? name.slice(1) : name
                    let ent = get_entity_by_name(search_name.replaceAll("-", " "));
                    if (!pos) {
                        pos = game.select_far_position(game.player_ent.position, 32, 2, 8);
                    }

                    if (ent && pos) {
                        let obj = game.spawn_entity(ent, team, pos, false);
                        debug_response = `#0f0tried to spawn ${ent.name} at ${pos}`;
                    } else {
                        debug_response = `#f00trying to find \"${search_name}\" at ${pos} didn't work`;
                    }
                }
                break;

            case "dummies":
                let num_killed = 0;
                if (data && data[0] == "a") {
                    game.wave_entities["WAVESTOP_OBJ"] = 1;

                    game.entities.forEach(ent => {
                        if (ent.id != game.player_ent.id) {
                            game.kill(ent)
                            num_killed++;
                        }
                    })
                }

                angle = (game.random() * 360);

                for (let i=0; i<5; i++) {
                    let v = game.player_ent.position.add(new Vector2(
                        6, 0
                    ).rotate(angle * (Math.PI / 180)).round());

                    let obj = null;
                    let tries = 0;
                    while (!obj && tries < 100) {
                        obj = game.spawn_entity(
                            get_entity_by_name("target dummy"), Teams.ENEMY, 
                            v, false
                        );
                        angle += 1;
                        tries++;
                    }

                    angle += (72-5);
                }

                if (num_killed > 0) {
                    debug_response = "#0f0objects killed, wave progression stopped, dummies spawned";
                } else {
                    debug_response = "#0f0dummies spawned";
                }
                break;

            case "s":
                if (data) {
                    let spell = get_spell_by_name(data);

                    if (spell) {
                        game.player_add_spell_to_inv(spell);
                        debug_response = `#0f0added spell: \"${spell.name}\"`
                    } else {
                        debug_response = `#f00couldn't find a spell \"${data}\"`
                    }
                } else {
                    debug_response = `#f00no spell provided`
                }
                break;

            case "st":
                if (data) {
                    let sp_list = spells_list.filter(spell => spell.subtyp.toLowerCase() == data.toLowerCase());

                    game.player_add_spells_to_inv(sp_list);
                    if (sp_list.length > 0) {
                        debug_response = `#0f0added ${sp_list.length} spells`;
                    } else {
                        debug_response = `#f00no spells with subtype ${data.toLowerCase()}`
                    }
                } else {
                    debug_response = `#f00no spell subtype provided`
                }
                break;

            case "sps":
                if (data) {
                    let split = data.split(" ");
                    let spell_index = Number.parseInt(split[0])-1;
                    let slice_amt = 1;
                    if (isNaN(spell_index)) {
                        spell_index = 0;
                        slice_amt = 0;
                    }

                    let spell_list = split.slice(slice_amt).join(" ").replaceAll(", ", ",").split(",").filter(t => t);
                    let spells = gen_spells(...spell_list);

                    game.player_spells[spell_index].spells = spells;
                    game.player_spells_edit[spell_index] = [...spells, ...Array(game.player_max_spell_shards - spells.length).fill(null)];

                    debug_response = `#0f0updated spell #${spell_index+1}`
                } else {
                    debug_response = `#f00"sps [1-5] spell 1, spell 2, spell 3, ..."`
                }
                break;

            case "big":
                game.player_ent.max_mp = 5000;
                game.player_ent.mp = 5000;
                game.player_ent.max_hp = 1000;
                game.player_ent.hp = 1000;

                game.player_level = 50;

                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))

                debug_response = `#0f0ur big now`
                break;

            case "god":
                game.player_ent.max_mp = 999999;
                game.player_ent.mp = 999999;
                game.player_ent.max_hp = 999999;
                game.player_ent.hp = 999999;

                game.player_level = 999;

                game.player_spells[0] = {
                    spells: gen_spells("gun"),
                    name: "gun"
                }

                game.player_spells_edit[0][0] = get_spell_by_name("gun")

                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add target trigger"))
                
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add damage trigger"))
                
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                game.player_add_spell_to_inv(get_spell_by_name("add tile trigger"))
                
                debug_response = `#0f0ur god now`
                break;

            case "sxp":
                if (data) {
                    let xpvalue = Number.parseInt(data);

                    game.roll_for_loot(null, xpvalue, null, null, null, null, 1);

                    debug_response = `#0f0triggered drop with xpvalue ${xpvalue}`;
                }
                break;
            
            case "stp":
                if (data) {
                    let tier = data;

                    if (spells_loot_table[tier] || spells_loot_table["Tier" + tier]) {
                        game.roll_for_loot(null, 0, null, spells_loot_table[tier] ? spells_loot_table[tier] : spells_loot_table["Tier" + tier], 1, null, 1, "Tier" + tier);
                        debug_response = `#0f0spawned spell from loot table \"${data}\"`;
                    } else {
                        debug_response = `#f00couldn't find a loot table \"${data}\"`
                    }
                }
                break;
            
            case "pm":
                if (data) {
                    let amt = Number.parseInt(data);
                    game.player_ent.mp = amt;

                    debug_response = `#0f0set current mp: \"${amt}\"`
                }
                break;
            
            case "pM":
                if (data) {
                    let amt = Number.parseInt(data);
                    game.player_ent.max_mp = amt;

                    debug_response = `#0f0set max mp: \"${amt}\"`
                }
                break;

            case "ph":
                if (data) {
                    let amt = Number.parseInt(data);
                    game.player_ent.hp = amt;

                    debug_response = `#0f0set current hp: \"${amt}\"`
                }
                break;

            case "pH":
                if (data) {
                    let amt = Number.parseInt(data);
                    game.player_ent.max_hp = amt;

                    debug_response = `#0f0set max hp: \"${amt}\"`
                }
                break;

            case "xp":
                if (data) {
                    let x = Number.parseInt(data);

                    if (x > 0) {
                        let x_left = x;

                        // chunks should be such that 10 chunks = one level of xp
                        // max of 25
                        let num_chunks = 1 + (9 * (x / game.get_xp_for_levelup(game.player_level)));
                        num_chunks = Math.floor(Math.min(25, num_chunks));

                        for (let i=0; i<num_chunks; i++) {
                            setTimeout(function() {
                                let xp_to_give = Math.ceil(x / num_chunks);
                                if (xp_to_give > x_left) {
                                    xp_to_give = x_left;
                                }
                                x_left -= xp_to_give;

                                xp_sparkle(xp_to_give, game.player_ent.position.add(random_on_circle(32)));
                            })
                        }
                    } else {
                        game.player_xp += x;
                    }

                    debug_response = `#0f0added xp: \"${x}\"`
                }
                break;

            case "d":
                if (data) {
                    debug_response = `#f00no debug view called \"${data}\"`
                    switch (data) {
                        case "fps":
                        case "f":
                            debug_response = `#0f0toggled \"${data}\"`
                            show_fps = !show_fps
                            clear_debug_info = true;
                            break;

                        case "operations":
                        case "o":
                            debug_response = `#0f0toggled \"${data}\"`
                            show_ops = !show_ops
                            clear_debug_info = true;
                            break;
                    }
                }
                break;

            case "gp":
                debug_response = `#0f0${game.player_ent.position}`;
                break;

            case "tp":
                if (data) {
                    let segs = data.split(" ")
                    if (segs.length == 2) {
                        let new_pos = new Vector2(
                            Number.parseInt(segs[0]),
                            Number.parseInt(segs[1])
                        )

                        game.move_player(new_pos)
    
                        debug_response = `#0f0moved player: \"${new_pos}\"`
                    }
                }
                break;

            case "k":
                let ent = renderer.selected_ent;

                if (ent) {
                    game.kill(ent)
                    debug_response = `#0f0${ent.name} owned lmao`
                } else {
                    debug_response = "#f00no entity under cursor"
                }
                break;
            
            case "kw": {
                let num_killed = 0;
                game.entities.forEach(ent => {
                    if (ent.untargetable && ent.id != game.player_ent.id) {
                        game.kill(ent)
                        num_killed++;
                    }
                })

                debug_response = `#0f0killed every wall (${num_killed})`
                break;
            }

            case "ka": {
                let num_killed = 0;
                game.entities.forEach(ent => {
                    if (!ent.untargetable && ent.id != game.player_ent.id) {
                        game.kill(ent)
                        num_killed++;
                    }
                })

                debug_response = `#0f0killed a bunch of guys (${num_killed})`
                break;
            }

            case "scrimblo":
            case "gobbo":
                debug_response = "#f80           HEY!"
                break;
        }
    } catch (error) {
        debug_response = "#f00there was an error. :(";
    }

    debug_cmd = "";
    debug_timeout = 600;
}

let framecount = 0;
let clear_debug_info = true;

function game_loop() {
    framecount++;

    //renderer.add_particle(ppos, new Particle(tmp));
    last_frame_time = Date.now();
    if (last_frame_time < next_frame_time) {
        setTimeout(game_loop);
    }

    frame_times.push(Date.now());
    frame_times = frame_times.slice(-10);

    ppos = ppos.add(new Vector2(2, 1));
    ppos = ppos.wrap(new Vector2(48, 24));

    // if (ppos.x % 16 == 0) {
    //     if (game.random() < 0.1) {
    //         mov_dir = new Vector2(
    //             Math.floor(game.random() * 2) - 1,
    //             Math.floor(game.random() * 2) - 1
    //         )
    //     } 
    //     
    //     let moved = game.move_entity(moving_ent, moving_ent.position.add(mov_dir), false);
    //     if (!moved) {
    //         mov_dir = mov_dir.neg();
    //     }
    // }

    if (framecount % 60 == 0) {
        renderer.refresh_left_panel = true;
        renderer.refresh_right_panel = true;
        // game.needs_main_view_update = true;
    }

    renderer.render_borders();

    renderer.render_left_panel();

    if (game.needs_main_view_update) {
        if (game.inventory_open) {
            renderer.render_inventory_menu();
        } else {
            renderer.render_game_view();
        }
    }

    renderer.render_right_panel();
    renderer.advance_particles();

    renderer.render_messageboxes();

    let fps = null;
    if (frame_times.length > 1 && show_fps) {
        let time_per_frame = 0;
        for (let i=0; i<frame_times.length-1; i++) {
            time_per_frame += frame_times[i+1]-frame_times[i];
        }

        time_per_frame /= frame_times.length-1;
        fps = 1000 / time_per_frame;
    }

    // this is where the frame actually gets rendered. nowhere else (hopefully)
    debug_timeout--;

    let debug_show = debug_cmd ? (debug_cmd + " <") : (debug_response && debug_timeout > 0 ? (debug_response.slice(4) + " -") : "");
    let debug_col = debug_cmd ? "#fff" : (debug_response ? debug_response.slice(0, 4) : "");

    if (need_to_clear_cmd) {
        need_to_clear_cmd = false;
        debug_show = " ".repeat(renderer.total_size.x - 2);
    }

    if (debug_timeout <= 0 && need_to_clear_response) {
        need_to_clear_response = false;
        debug_show = " ".repeat(renderer.total_size.x - 2);
    }

    renderer.paint_debug_info(debug_show, debug_col)

    renderer.request_new_frame(show_ops, fps, clear_debug_info);
    clear_debug_info = false;

    let frame_duration = Date.now() - last_frame_time;
    //console.log("took", frame_duration, "so waiting", (1000/TARGET_FPS) - frame_duration);

    setTimeout(game_loop, (1000/TARGET_FPS) - frame_duration);
    // setTimeout(game_loop);
}

/*
let tx = 10;
setInterval(function() {
    tx -= 2;
    if (tx < 0) {
        tx = 10;
    }
}, 500)
*/

let test_msgbox = new MessageBoxTemplate(
    "THIS IS A [#0f0]TEST[clear] MESSAGE BOX!!!!!!",
    "[#f80]Gobbo[clear] Scrimblo.\nHi\n\nHello              [#4df]guys[clear]\n         :P        «-»«+»«=»\n\n\n" +
    "If you press [#0f0]Agree[clear], you will get a random spell from the tier 1 drop pool\n" +
    "If you press [#f00]Disagree[clear], you will clear your inventory\n" +
    "If you press [#aaa]Leave[clear], your current and max HP/MP will both be set to 1.",
    ["Agree", "Disagree", "Leave"],
    ["#060", "#600", "#444", "#630", "#336"],
    [
        function() { 
            let spell_select = Math.floor(game.random() * spells_loot_table["Tier1"].length);
            let spell_obj = spells_loot_table["Tier1"][spell_select];

            game.player_add_spell_to_inv(spell_obj);
        },
        function() { 
            game.player_inventory = [];
        },
        function() {
            game.player_ent.hp = 1;
            game.player_ent.mp = 1;
            game.player_ent.max_hp = 1;
            game.player_ent.max_mp = 1;
        },
        function() {},
        function() {}
    ]
)

let lvlup_msgbox_normal = new MessageBoxTemplate(
    "- - MAGICAL POWER INCREASED - -",
    "Your experiences in battle have further bolstered your magical power, raising you to [#afa]LEVEL ###[clear].\n\n" +
    "Select one of the boons below to determine where this newfound strength will be channeled.",
    ["+10 max HP", "+25 max MP", "Random common shard"],
    ["#600", "#036", "#040"],
    [
        function() {
            game.player_ent.max_hp += 10
            game.player_ent.hp += 10

            game.player_skill_points--;
        },

        function() {
            game.player_ent.max_mp += 25
            game.player_ent.mp += 25

            game.player_skill_points--;
        },

        function() {
            game.roll_for_loot(null, 0, null, null, 1, 3, 1)

            game.player_skill_points--;
        }
    ]
)

let lvlup_msgbox_lv5 = new MessageBoxTemplate(
    "- - MAGICAL POWER SURGED - -",
    "Your magical power has surged into new heights from your many experiences, granting you the status of [#afa]LEVEL ###[clear].\n\n" +
    "Select a boon to choose where this rush of power will be directed.",
    ["Restore all HP/MP", "+25/50 max HP/MP", "Random uncommon shard"],
    ["#600", "#036", "#040"],
    [
        function() {
            game.player_ent.restore_hp(99999999);
            game.player_ent.restore_mp(99999999);

            game.player_skill_points--;
        },

        function() {
            game.player_ent.max_hp += 25
            game.player_ent.hp += 25

            game.player_ent.max_mp += 50
            game.player_ent.mp += 50

            game.player_skill_points--;
        },

        function() {
            game.roll_for_loot(null, 0, null, null, 1, 5, 1, null, 4)

            game.player_skill_points--;
        }
    ]
)

let lvlup_msgbox_lv10 = new MessageBoxTemplate(
    "- - MAGICAL LIMIT SHATTERED - -",
    "Your previous limitations have been shattered, granting you the prestige of [#afa]LEVEL ###[clear].\n\n" +
    "Select how you will ascend further.",
    ["Enhance all cores", "+75/200 max HP/MP", "2 random rare shards"],
    ["#600", "#036", "#040"],
    [
        function() {
            renderer.add_messagebox(messagebox_templates.lvlup_msgbox_permanent_enhance);

            game.player_skill_points--;
        },

        function() {
            game.player_ent.max_hp += 75
            game.player_ent.hp += 75

            game.player_ent.max_mp += 200
            game.player_ent.mp += 200

            game.player_skill_points--;
        },

        function() {
            game.roll_for_loot(null, 0, null, null, 1, 8, 1, null, 6)
            game.roll_for_loot(null, 0, null, null, 1, 8, 1, null, 6)

            game.player_skill_points--;
        }
    ]
)

let lvlup_msgbox_permanent_enhance = new MessageBoxTemplate(
    "- - SPELL ENHANCEMENT - -",
    "Selecting one of these options will modify [#f00]all[clear] core fragments you use from this point forth.\n\n" +
    "This cannot be undone. Choose wisely.",
    ["+7 damage", "+1 radius", "+3 range"],
    ["#600", "#036", "#040"],
    [
        function() {
            // +7 dmg emblem
        },

        function() {
            // +1 radius emblem
        },

        function() {
            // +3 range emblem
        }
    ]
)

let debug_help_msgbox_primary = new MessageBoxTemplate(
    "DEBUG HELP -- [#f40]ENGINE",
`[#4f4]h                      [#ddd]| show this help screen                                                    | [#0cf]h
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]r(p)                   [#ddd]| roll 5 random numbers using game random state (just predict if \"rp\")     | [#0cf]r          [#ddd]| [#0cf]r          
[#4f4]     <n>               [#ddd]| set number of times to roll                                              | [#0cf]r 10       [#ddd]| [#0cf]r 10       
[#4f4]     <n> <max>         [#ddd]| set maximum roll value (default 100)                                     | [#0cf]r 10 6     [#ddd]| [#0cf]r 10 6     
[#4f4]     <n> <min> <max>   [#ddd]| set minimum and maximum roll value (default 1, 100)                      | [#0cf]r 10 50 60 [#ddd]| [#0cf]r 10 50 60 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]qs                     [#ddd]| save game to an autogenerated slot name. saves are deleted on refresh    | 
[#4f4]qs <save_name>         [#ddd]| save game to slot save_name. saves are deleted on refresh                | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]ql <save_name>         [#ddd]| load game from slot save_name. if blank and only one save, picks that    |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]ss <speed|reset>       [#ddd]| set max spell speed to value, or reset with \"reset\"                    | [#0cf]ss 0.75 [#ddd]| [#0cf]ss reset
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]d <fps|operations>     [#ddd]| toggle a debug view                                                      | [#0cf]d operations
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#f80]repeat <times> <cmd>   [#ddd]| execute \"cmd\" \"times\" times                                          | [#0cf]repeat 5 e bat
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]p                      [#ddd]| echo some text back to the console                                       | [#0cf]ping hi plaao`,
    ["< GAME", "Close", "PLAYER >"],
    ["#04a", "#333", "#060"],
    [
        function() {
            renderer.add_messagebox(debug_help_msgbox_game, true);
        },

        function() {
            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;
        },

        function() {
            renderer.add_messagebox(debug_help_msgbox_player, true);
        },
    ],
    function(msgbox) { 
        renderer.msgbox_pad_x = 1;
        renderer.msgbox_pad_y = 1;
    }
)

let debug_help_msgbox_player = new MessageBoxTemplate(
    "DEBUG HELP -- [#0f0]PLAYER",
`[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]s <name>               [#ddd]| get a spell with name                                                    | [#0cf]s fireball
[#4f4]st <subtype name>      [#ddd]| get all spells with given subtype                                        | [#0cf]st Shape
[#4f4]sps «1-5» <spell,list> [#ddd]| set spell with ID 1-5 to the comma separated list of spells given        | [#0cf]sps 1 zenith arcana i, behind, fireball
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]sxp <xp value>         [#ddd]| run the spell drop function with given xp value                          | [#0cf]sxp 250
[#4f4]stp <pool>             [#ddd]| drop a spell from a specific pool                                        | [#0cf]stp Tier4
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]pm(M) <value>          [#ddd]| set player current(max) MP to value                                      | [#0cf]pm 74  [#ddd]|[#0cf] pM 200
[#4f4]ph(H) <value>          [#ddd]| set player current(max) HP to value                                      | [#0cf]ph 102 [#ddd]|[#0cf] pH 200
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]xp <value>             [#ddd]| gain value XP                                                            | [#0cf]xp 500
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]emb <emblem_name>      [#ddd]| get emblem with iname emblem_name. if blank, lists all emblem inames     | [#0cf]emb lv10_dmg
[#4f4]emball                 [#ddd]| get a bunch of emblem (8), close to the soft limit                       | [#0cf]emball
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]gp                     [#ddd]| get player position                                                      | [#0cf]gp
[#4f4]tp <posx> <posy>       [#ddd]| teleport player to position                                              | [#0cf]tp 3 21
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]big                    [#ddd]| gain 1000 HP, 5000 MP, LV 50 and 4 of each main trigger type             | [#0cf]big
[#4f4]god                    [#ddd]| gain 999999 HP, 999999 MP, LV 999 and 4 of each main trigger type        | [#0cf]god
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | `,
    ["< ENGINE", "Close", "GAME >"],
    ["#600", "#333", "#04a"],
    [
        function() {
            renderer.add_messagebox(debug_help_msgbox_primary, true);
        },

        function() {
            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;
        },

        function() {
            renderer.add_messagebox(debug_help_msgbox_game, true);
        },
    ],
    function(msgbox) { 
        renderer.msgbox_pad_x = 1;
        renderer.msgbox_pad_y = 1;
    }
)

let debug_help_msgbox_game = new MessageBoxTemplate(
    "DEBUG HELP -- [#0cf]GAME",
`[#4f4]e               <name> [#ddd]| spawn an entity using generic spawn (for spaces, use \"-\")                | [#0cf]e bat
[#4f4]  <posx> <posy>        [#ddd]| with a specific position                                                 | [#0cf]e 4 32 bat
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]m <msgbox_name>        [#ddd]| spawn a messagebox with name                                             | [#0cf]m debug
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]k(a|w)                 [#ddd]| kill target underneath the mouse cursor (or all entities if \"a\" given)   | [#0cf]k [#ddd]|[#0cf] ka[#ddd] |[#0cf] kw
[#4f4]                       [#ddd]|                                         (or all walls if \"w\" given)      | 
[#4f4]                       [#ddd]|                                                                          |
[#4f4]dummies «a/arena»      [#ddd]| make 5 target dummies around player, if (a)rena, removes everything else | [#0cf]dummies [#ddd]|[#0cf] dummies arena
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]w <stop|start>         [#ddd]| enables/disables wave progression (waves will not finish if this is off) | [#0cf]w stop
[#4f4]                       [#ddd]|                                                                          | 
[#4f4]                       [#ddd]|                                                                          | `,
    ["< PLAYER", "Close", "ENGINE >"],
    ["#060", "#333", "#600"],
    [
        function() {
            renderer.add_messagebox(debug_help_msgbox_player, true);
        },

        function() {
            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;
        },

        function() {
            renderer.add_messagebox(debug_help_msgbox_primary, true);
        },
    ],
    function(msgbox) { 
        renderer.msgbox_pad_x = 1;
        renderer.msgbox_pad_y = 1;
    }
)

let debug_msgbox_padding_test = new MessageBoxTemplate(
    "MSGBOX PAD TEST",
    "Current padding: [[PADX]], [[PADY]]",
    ["x-", "x+", "y-", "y+", "??", "reset", "exit"],
    ["#020", "#200", "#020", "#200", "#046", "#060", "#800"],
    [
        function() {
            renderer.msgbox_pad_x--;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_x++;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_y--;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_y++;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_x = Math.floor(game.random() * 100) + 1;
            renderer.msgbox_pad_y = Math.floor(game.random() * 30) + 1;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;
            renderer.add_messagebox(messagebox_templates["debug_msgbox_padding_test"], true);
        },

        function() {
            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;
        },
    ],
    function(msgbox) {
        msgbox.text = msgbox.text.replace("\[\[PADX\]\]", renderer.msgbox_pad_x).replace("\[\[PADY\]\]", renderer.msgbox_pad_y);
    }
)

let start_of_game_popup = new MessageBoxTemplate(
    "THE GAME'S TITLE SHOULD PROBABLY GO HERE",
    "Your ancient confrontation with the lich Efrit is all you truly remember as you awaken from your centuries-long magical slumber.\n\nIn your absence, Efrit has run amok, tearing reality to shreds. Nothing remains in these shattered fragments of existence but your enemies and creatures driven mad by the chaos.\n\nYou must gather your senses, collect your lost magical power and flee from the encroaching corruption behind you.\n\nMaybe, with enough time, you may gather enough strength to live and confront him again.",
    ["OK", "Hey, wait, what? I need a tutorial."],
    ["#333", "#060"],
    [
        function() {
            // NOTHING
            game.player_location = new GameLocation(
                location_templates[0],
                [
                    EventType.Battle,
                    EventType.Battle,
                    EventType.Event,
                    EventType.Battle,
                    EventType.Elite,
                    EventType.GoodEvent
                ]
            );
            game.player_location_progress = -1;
            game.ready_for_wave_end = true;

            renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
            renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;

            game.check_wave_end(true);
        },

        function() {
            // TUTORIAL
        }
    ]
)

messagebox_templates = {
    debug: test_msgbox,

    ln: lvlup_msgbox_normal,
    l5: lvlup_msgbox_lv5,
    l10: lvlup_msgbox_lv10,
    lpe: lvlup_msgbox_permanent_enhance,

    lvlup_normal: lvlup_msgbox_normal,
    lvlup_msgbox_lv5: lvlup_msgbox_lv5,
    lvlup_msgbox_lv10: lvlup_msgbox_lv10,
    lvlup_msgbox_permanent_enhance: lvlup_msgbox_permanent_enhance,

    start_of_game_popup: start_of_game_popup,

    debug_help_msgbox: debug_help_msgbox_primary,
    debug_msgbox_padding_test: debug_msgbox_padding_test
}

/*
spells_loot_table = {
    "Tier1": [...spells_list.filter(s => s.is_normal())],
    "Tier2": [],
    "Tier3": [],
    "Tier4": [],
    "Tier5": [],
    "Tier6": [],
    "Tier7": [],
    "Tier8": [],
    "Tier9": [],
    "Tier10": [],
}
*/

for (let i=0; i<Object.keys(spells_loot_table).length; i++) {
    let loot_group = Object.keys(spells_loot_table)[i];
    console.log("Loot group " + loot_group + ": " + spells_loot_table[loot_group].length + " items");
}

let showing_debug_menu = false;
let debug_cmd = "";
let debug_response = "";
let debug_timeout = 0;
let need_to_clear_response = false;
let need_to_clear_cmd = false;
let last_debug_cmd = "";

console.log(spells_list.filter(s => s.is_normal()).length + " non-red items")
console.log(spells_list.filter(s => s.is_red()).length + " red items")
console.log(spells_list.filter(s => s.is_corrupt()).length + " corrupted items")
console.log(spells_list.filter(s => s.is_normal() && !Object.keys(spells_loot_table).some(g => spells_loot_table[g].some(sc => sc.id != s.id))).length + " non-red items have no loot group assigned");

window.addEventListener("resize", handle_resize, true);

document.addEventListener("DOMContentLoaded", function() {
    handle_resize();
    game.begin_turn();

    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        console.log(name, code);
        let mov_pos = null;
        if (showing_debug_menu) {
            if (code == "Enter") {
                last_debug_cmd = debug_cmd;
                handle_debug_command(debug_cmd);
                need_to_clear_response = true;
                need_to_clear_cmd = true;
                debug_cmd = ""
                showing_debug_menu = false;
            } else if (code == "Backspace" && debug_cmd.length > 1) {
                debug_cmd = debug_cmd.slice(0, -1);
            } else if (code == "ArrowUp") {
                debug_cmd = last_debug_cmd;
            } else if (code == "ArrowDown") {
                debug_cmd = " "
            } else if (name.toString().length == 1) {
                debug_cmd += name;
            }
        } else if (renderer.messagebox_open && code != "Backquote") { 
            return;
        } else if (game.inventory_open) {
            if (renderer.inventory_editing_spell_name != undefined) {
                let cur_name = game.player_spells[renderer.inventory_editing_spell_name].name;
                if (code == "Backspace" && cur_name.length > 0) {
                    game.player_spells[renderer.inventory_editing_spell_name].name = cur_name.slice(0, -1);
                } else if (code == "Enter") {
                    renderer.inventory_editing_spell_name = undefined;
                } else if (name.match(/^[a-zA-Z0-9_\-\+\.!? \[\]\#]$/i) && renderer.code_string_len(cur_name) < 30) {
                    if (name == " ") {
                        name = "\u00A0";
                    }
                    game.player_spells[renderer.inventory_editing_spell_name].name += name;
                }

                renderer.refresh_left_panel = true;
                renderer.refresh_right_panel = true;
            } else {
                if (code == "KeyR") {
                    game.toggle_inventory();

                    game.deselect_player_spell();
                    if (game.inventory_open) {
                        renderer.render_game_checkerboard("black");
                        renderer.reset_selections();
                        renderer.render_inventory_menu();
                    } else {
                        renderer.render_game_checkerboard("#222");
                        renderer.reset_selections();
                        renderer.render_game_view();
                    }
                }
            }
        } else {
            switch (code) {
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                    game.select_player_spell(Number.parseInt(name) - 1);
                    break;
    
                case "Escape":
                    game.deselect_player_spell();
                    break;
    
                case "KeyR":
                    game.toggle_inventory();

                    game.deselect_player_spell();
                    if (game.inventory_open) {
                        renderer.render_game_checkerboard("black");
                        renderer.reset_selections();
                        renderer.render_inventory_menu();
                    } else {
                        renderer.render_game_checkerboard("#222");
                        renderer.reset_selections();
                        renderer.render_game_view();
                    }
    
                    break;
    
                case "KeyQ":
                    game.select_player_spell_list([spells_list[14]]);
                    break;
    
                case "Numpad8":
                case "ArrowUp":
                case "KeyW":
                    mov_pos = new Vector2(0, -1);
                    break;
    
                case "Numpad2":
                case "ArrowDown":
                case "KeyS":
                    mov_pos = new Vector2(0, 1);
                    break;
    
                case "Numpad4":
                case "ArrowLeft":
                case "KeyA":
                    mov_pos = new Vector2(-1, 0);
                    break;
    
                case "Numpad6":
                case "ArrowRight":
                case "KeyD":
                    mov_pos = new Vector2(1, 0);
                    break;

                case "Numpad7":
                    mov_pos = new Vector2(-1, -1);
                    break;
            
                case "Numpad9":
                    mov_pos = new Vector2(1, -1);
                    break;
                
                case "Numpad3":
                    mov_pos = new Vector2(1, 1);
                    break;
            
                case "Numpad1":
                    mov_pos = new Vector2(-1, 1);
                    break;   
                    
                case "Numpad5":
                    mov_pos = new Vector2(0, 0);
                    break;
            }
    
            if (mov_pos && game.is_player_turn()) {
                let turncount = game.turncount;

                let result = game.move_player(
                    game.player_ent.position.add(mov_pos)
                );
    
                if (result) {
                    renderer.move_particles(mov_pos.neg());
                }
    
                game.end_turn(game.player_ent, turncount);
            }
        }

        if (code == "Backquote") {
            showing_debug_menu = true;
            debug_cmd = " ";
            debug_timeout = 0;
        }
    });

    game_loop();
})
