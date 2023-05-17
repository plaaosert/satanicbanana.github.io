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
        "Spark", "Add Target Trigger", "Fireball with Trigger",
        "Lightning Bolt with Trigger", "Magic Missile with Trigger"
    ],

    "on_hit": [
        "Add Damage Trigger"
    ],

    "on_affected_tiles": [
        "Add Tile Trigger"
    ]
}

for (let i=1; i<typs.length; i++) {
    trigger_spells[typs[i]].forEach(name => {
        let spell = get_spell_by_name(name);

        spell.set_trigger(typs[i]);
    })
}


let num_enemy_spawns = 0;

let board = new Board(new Vector2(64, 64));
let game = new Game(board);
let renderer = new Renderer(game, board, new Vector2(64, 36), 48, 48, 1/3);

game.spawn_player(get_entity_by_name("Player"), new Vector2(16, 18));

let e1 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(12, 20), true)
let e2 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(8, 20), true)
let e3 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(12, 28), true)
let e4 = game.spawn_entity(get_entity_by_name("war machine"), Teams.ENEMY, new Vector2(10, 24), true)

e1.spawn_protection = false;
e2.spawn_protection = false;
e3.spawn_protection = false;
e4.spawn_protection = false;

game.wave_entities[e1.id] = e1;
game.wave_entities[e2.id] = e2;
game.wave_entities[e3.id] = e3;
game.wave_entities[e4.id] = e4;

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
        if (Math.random() < 0.01) {
            game.spawn_entity(get_entity_by_name("Wall"), Teams.UNALIGNED, new Vector2(xt, yt), false);
        }
    }
}

//let primed_spell_test = new PrimedSpell(game.player_ent, [spells_list[0],]);
//let target = new Vector2(20, 22);

game.player_spells = [
    {spells: [get_spell_by_name("fireball")], name: "empty"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(0, 20)], name: "0-20"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(20, 40)], name: "20-40"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(40, 60)], name: "40-60"},
    {spells: [...spells_list.filter(s => !s.is_corrupt()).slice(60, 80)], name: "60-80"}
]

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


game.player_add_spells_to_inv([...spells_list.filter(s => !s.is_corrupt()).slice(80, 80 + game.player_inventory_size)].flatMap(i => i));
game.player_add_spells_to_inv([...spells_list.filter(s => s.is_red())]);
game.player_discard_edits();
game.inventory_open = true;

let xp_flash = new ParticleTemplate(["++", "''"], "#ddd", 1);
let item_flash = new ParticleTemplate(["@@", "&&", "##", "%%", "**", "++", "''"], "#fff", 0.5);
let lvl_flash = new ParticleTemplate(["**", "++", "\"\"", "''"], "#fff", 0.5);

let tmp = new ParticleTemplate(["@@", "##", "++", "--", ".."], "#f00", 1);
let ppos = new Vector2(0, 0);
let mov_dir = new Vector2(1, 0);

let hitcount = 0;

renderer.setup();

let last_frame_time = Date.now();
let frame_times = [];

renderer.render_game_checkerboard("black");

function game_loop() {
    //renderer.add_particle(ppos, new Particle(tmp));
    last_frame_time = Date.now();
    frame_times.push(Date.now());
    frame_times = frame_times.slice(-10);

    ppos = ppos.add(new Vector2(2, 1));
    ppos = ppos.wrap(new Vector2(48, 24));

    // if (ppos.x % 16 == 0) {
    //     if (Math.random() < 0.1) {
    //         mov_dir = new Vector2(
    //             Math.floor(Math.random() * 2) - 1,
    //             Math.floor(Math.random() * 2) - 1
    //         )
    //     } 
    //     
    //     let moved = game.move_entity(moving_ent, moving_ent.position.add(mov_dir), false);
    //     if (!moved) {
    //         mov_dir = mov_dir.neg();
    //     }
    // }

    renderer.render_left_panel();

    if (game.inventory_open) {
        renderer.render_inventory_menu();
    } else {
        renderer.render_game_view();
    }

    renderer.render_right_panel();
    renderer.advance_particles();

    let frame_duration = Date.now() - last_frame_time;
    //console.log("frame took", frame_duration, "so waiting", (1000/30) - frame_duration);
    setTimeout(game_loop, (1000/60) - frame_duration);
}

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

for (let i=0; i<Object.keys(spells_loot_table).length; i++) {
    let loot_group = Object.keys(spells_loot_table)[i];
    console.log("Loot group " + loot_group + ": " + spells_loot_table[loot_group].length + " items");
}

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
        if (game.inventory_open) {
            if (renderer.inventory_editing_spell_name != undefined) {
                let cur_name = game.player_spells[renderer.inventory_editing_spell_name].name;
                if (code == "Backspace" && cur_name.length > 0) {
                    game.player_spells[renderer.inventory_editing_spell_name].name = cur_name.slice(0, -1);
                } else if (code == "Enter") {
                    renderer.inventory_editing_spell_name = undefined;
                } else if (name.match(/^[a-zA-Z0-9_\-\+\.!? ]$/i) && cur_name.length < 30) {
                    if (name == " ") {
                        name = "\u00A0";
                    }
                    game.player_spells[renderer.inventory_editing_spell_name].name += name;
                }
            } else {
                if (name == "r") {
                    game.inventory_open = !game.inventory_open;
                    game.deselect_player_spell();
                    if (game.inventory_open) {
                        renderer.render_game_checkerboard("black");
                        renderer.reset_selections();
                        renderer.render_inventory_menu();
                    } else {
                        game.recent_spells_gained = [];

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
                    game.inventory_open = !game.inventory_open;
                    game.deselect_player_spell();
                    if (game.inventory_open) {
                        renderer.render_game_checkerboard("black");
                        renderer.reset_selections();
                        renderer.render_inventory_menu();
                    } else {
                        game.recent_spells_gained = [];

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
                let result = game.move_player(
                    game.player_ent.position.add(mov_pos)
                );
    
                if (result) {
                    renderer.move_particles(mov_pos.neg());
                }
    
                game.end_turn();
            }
        }
    });

    game_loop();
})

// TODO
// ADD UI:
// - Levelup dialog (pick between HP, MP, MP regen, random core, random modifier)
// - work out a way to show the effect of the whole spell for enemies (and you)
//   for enemies will probably rely on the desc written by me to show anything, then just show basic stats
// GAME LOOP:
// - status effects - currently not implemented at all
// - open inventory after beating all enemies
// - world generation between waves
/*
https://docs.google.com/spreadsheets/d/1HZQqG0wqTs9oZUu4H4hqChqNRa-kj8lPe9Y93V5l_z8/edit?usp=sharing
*/

/*
TODO BUGS:
- none!
*/