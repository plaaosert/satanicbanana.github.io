// TODO write a way to mouseover items not in inventory or equipment (dialogue). make sure they aren't able to be equipped or interacted with, only viewed
//      finish the dialogue logic and display. we have a dialogue tree already so just need to render it and make the stuff clickable

let player = Player.new("plaaosert");

let mouseover_item = {
    item: null,
    index: -1,
    slot: null,

    ability_index: -1,
    ability_entity_id: -1,

    skill: null,
}

let cur_battle = null;
let last_frame = 0;
let game_speed = 1;
const SMALLEST_ALLOWED_TIME_GAP = 1;
const LARGEST_ALLOWED_TIME_GAP = 25;
const MAX_CALCS_PER_FRAME = 10;

function equip_button_pressed(keyindex) {
    // console.log(mouseover_item);
    if (mouseover_item.item) {
        if (mouseover_item.index != -1) {
            // inventory
            inventory_equip(mouseover_item.index, keyindex);
        } else if (mouseover_item.slot && keyindex == 1) {
            // equipped item
            equipped_unequip(mouseover_item.slot);
        }
    } else if (mouseover_item.skill) {
        // console.log(`Tracking skill ${mouseover_item.skill} in slot ${keyindex-1}`)
        player.tracked_skills[keyindex-1] = mouseover_item.skill;
        player.mark_change("skills");
    }
}

function update_dialog() {
    if (mouseover_item.item) {
        // refresh item view
        if (mouseover_item.slot) {
            // equipped
            equipped_mouseover(mouseover_item.slot);
        } else {
            // inventory
            inventory_mouseover(mouseover_item.index);
        }
    } else if (mouseover_item.ability_index != -1) {
        // refresh ability view
        ability_mouseover(mouseover_item.ability_entity_id, mouseover_item.ability_index);
    } else if (mouseover_item.skill) {
        // refresh skill view
        skill_mouseover(mouseover_item.skill);
    }
}

function skill_mouseover(skill) {
    document.getElementById("skill_info_overlay_panel").style.display = "";

    if (skill) {
        render_selected_skill(player, skills_list[skill]);
        mouseover_item.skill = skill;
    } else {
        skill_mouseout();
    }
}

function skill_mouseout() {
    document.getElementById("skill_info_overlay_panel").style.display = "none";
    mouseover_item.skill = null;
}

function ability_mouseover(ent_id, ability_index) {
    document.getElementById("ability_info_overlay_panel").style.display = "";

    if (cur_battle || ent_id == 1) {
        let entity = cur_battle ? cur_battle[`ent${ent_id}`] : player.stored_entity;
        let ability = entity.template.abilities[ability_index];
        if (ability) {
            render_selected_ability(entity, ability_index);

            mouseover_item.ability_index = ability_index;
            mouseover_item.ability_entity_id = ent_id;
        } else {
            ability_mouseout()
        }
    } else {
        ability_mouseout()
    }
}

function ability_mouseout() {
    document.getElementById("ability_info_overlay_panel").style.display = "none";
    mouseover_item.ability_index = -1;
    mouseover_item.ability_entity_id = -1;
}

function interactable_item_mouseover() {
    // show the panel
    document.getElementById("item_info_overlay_panel").style.display = "";
}

function interactable_item_mouseout() {
    document.getElementById("item_info_overlay_panel").style.display = "none";
    mouseover_item.item = null;
    mouseover_item.slot = null;
    mouseover_item.index = -1;
}

// TODO figure out an equipping / comparison UI (copy the item display panel ig?)
function inventory_mouseover(index) {
    interactable_item_mouseover();

    // also show the infoscreen here, but for now just mark it as not new
    if (player.inventory[index]) {
        if (player.inventory[index].is_new) {
            player.inventory[index].is_new = false;
            player.mark_change("inventory");
    
            render_inventory(player);
        }
    
        render_selected_item(player, player.inventory[index].item);
    
        mouseover_item.item = player.inventory[index].item;
        mouseover_item.index = index;
        mouseover_item.slot = null;
    } else {
        interactable_item_mouseout();
    }
}

function dialogue_mouseover(e, item) {
    interactable_item_mouseover();

    // console.log(item);

    render_selected_item(player, item);
}

function dialogue_mouseout(e, item) {
    interactable_item_mouseout();
}

function inventory_equip(index, artifact_target) {
    // artifact_target only matters if the item is an artifact.
    // can only equip while not busy (in a battle, or in an event)
    if (game.can_interact_with_inventory()) {
        let item = player.inventory[index].item;
        let slot = null;
        
        if (item.equip_component) {
            switch (item.equip_component.equippable_type) {
                case ITEM_TYPE.KNIFE:
                case ITEM_TYPE.SWORD:
                case ITEM_TYPE.POLEARM:
                case ITEM_TYPE.AXE:
                case ITEM_TYPE.HAMMER:
                case ITEM_TYPE.MARTIAL_WEAPON:
                    slot = "WEAPON";
                    break;

                case ITEM_TYPE.LIGHT_ARMOUR:
                case ITEM_TYPE.MEDIUM_ARMOUR:
                case ITEM_TYPE.HEAVY_ARMOUR:
                    slot = item.equip_component.subtype.toUpperCase();
                    break;

                case ITEM_TYPE.INNER_ARTIFACT:
                case ITEM_TYPE.OUTER_ARTIFACT:
                case ITEM_TYPE.DIVINE_ARTIFACT:
                    slot = `ARTIFACT${artifact_target}`;
                    break;
            }

            if (slot) {
                if (player.can_equip_item(item, slot)) {
                    player.remove_item_from_inventory(index);
                    let replaced_item = player.equip_item(item, slot, false);
                    if (replaced_item) {
                        player.add_item_to_inventory(replaced_item, index);
                    }
                } else {
                    // no skills, cant equip
                }
            } else {
                // no slot, cant equip
            }
        } else {
            // cant equip
        }
    }
}

function equipped_mouseover(categ) {
    interactable_item_mouseover();

    render_selected_item(player, player.equipped_items[categ]);

    mouseover_item.item = player.equipped_items[categ];
    mouseover_item.index = -1;
    mouseover_item.slot = categ;
}

function equipped_unequip(categ) {
    if (game.can_interact_with_inventory()) {
        if (player.inventory.length < player.inventory_max_slots) {
            player.unequip_item_from_slot(categ);
        } else {
            // can't unequip, inventory is full
        }
    }
}

/*
each map location has a bunch of events.
events have a check condition which usually includes flags along with some skill/item/kill check.
triggering an event causes a dialogue tree.
{
    condition: fn() -> bool,
    msg: dialogue(),          -- the message shown to the player
    items: [],                -- any items the player receives
    mouseover_ctx_items: [],  -- items to show on mouseover in the msg body, addressed by index; e.g. "%%0%%"
    options: [
        {text: }
    ],
    encounter: encounter(),   -- the encounter to trigger instead. *this makes it ignore everything else, including msg and items!*
                                 if options after the encounter exist, index 0 will be picked for a victory and index 1 will be picked for a defeat.
                                 if no options exist, the player is transported back to the closest safe zone.
}
*/

let test_location = new GameLocation(
    // TODO look @ the rework above and implement it
    "Test area", "TST", [], [
        GameEvent.simple_dialogue(
            new Dialogue(
                "You", "#ccc", "Damn, I really am feeling like a %%0%% right now... if only a level 1 training dummy would appear right now", [
                    new Item("Firecrackers", "blow up!", "---", 1, null, new UseComponent(
                        true, 1, 0
                    ))
                ]
            ), {
                "Level 1 Training Dummy: hi": {
                    col: new Colour(48, 0, 0),
                    evt: GameEvent.simple_encounter(
                        "training_dummy",
                        GameEvent.simple_dialogue(new Dialogue(
                            "-", Colour.grey, "omg you won :)"
                        )),
                        GameEvent.simple_dialogue(new Dialogue(
                            "-", Colour.grey, "omg you lost :("
                        ))
                    )
                },
                "Ignore yourself": {
                    col: new Colour(16, 16, 16), 
                    evt: null
                }
            }
        )
    ], false, new Encounter(["training_dummy", "training_dummy_2", "training_dummy_3"], 4), 10
)

let game = new GameState(
    player, test_location, {}
)

document.addEventListener("DOMContentLoaded", function() {
    enemy_stats_parent_elem = document.querySelector(".panel.enemy-panel .panel-inner#enemy-panel");
    player_stats_parent_elem = document.querySelector(".panel.player-panel .panel-inner");
    map_parent_elem = document.querySelector(".panel.map-panel .panel-inner");

    setup_bars();

    let update_fn = function() {
        let looping = true;
        let calcs = 0;

        while (looping) {
            calcs++;

            let this_frame = Date.now();
            let time_diff = this_frame - last_frame;

            // time cannot accelerate more than LARGEST_ALLOWED_TIME_GAP per tick,
            // so if the time diff is greater, only calculate the max
            let adjusted_time_diff = Math.min(LARGEST_ALLOWED_TIME_GAP, time_diff);
            last_frame = Math.min(this_frame, last_frame + adjusted_time_diff);

            let delta_time = adjusted_time_diff / 1000.0;
            // console.log(delta_time);

            let final_delta_time = delta_time * game_speed;
            if (adjusted_time_diff >= SMALLEST_ALLOWED_TIME_GAP && calcs <= MAX_CALCS_PER_FRAME) {
                game.pass_time(final_delta_time);
            } else {
                looping = false;
            }
        }

        update_dialog(player);

        render_inventory(player);
        render_equipped_items(player);

        if (player.check_change("skills")) {
            render_skills_list(player);
            render_tracked_skill_progress(player);
        }

        render_entity_stats(player.stored_entity, player_stats_parent_elem);

        if (game.cur_encounter) {
            make_bar_with_text(
                map_parent_elem.querySelector("#encounter_time p"),
                `Time until next fight (${game.encounter_index} / ${game.cur_encounter.enemies.length})|${Math.round(game.encounter_timeout * 1) / 1}s`,
                map_parent_elem.querySelector("#encounter_time .bar"),
                map_intercombat_bar_style, game.encounter_timeout, game.cur_encounter.time_between, 
                MAP_PANEL_LENGTH, false, true
            )
        } else {
            make_bar_with_text(
                map_parent_elem.querySelector("#encounter_time p"),
                `Time until encounter|${Math.round(game.time_until_encounter * 1) / 1}s`,
                map_parent_elem.querySelector("#encounter_time .bar"),
                map_encounter_bar_style, game.time_until_encounter, game.location.default_encounter_wait_time, 
                MAP_PANEL_LENGTH, false, true
            )
        }

        window.requestAnimationFrame(update_fn);
    };

    last_frame = Date.now();
    window.requestAnimationFrame(update_fn);

    player.refresh_entity();

    document.addEventListener("keydown", function(e) {
        // console.log(e.code);
        if (e.code == "Equal") {
            game_speed *= 2;
        }

        if (e.code == "Minus") {
            game_speed /= 2;
        }

        if (e.code == "KeyE") {
            equip_button_pressed(1);
        }

        if (e.code == "KeyR") {
            equip_button_pressed(2);
        }

        if (e.code == "KeyT") {
            equip_button_pressed(3);
        }

        if (e.code == "KeyQ") {
            player.add_item_to_inventory(
                new Item("Rock", "Rock!!!!!!!!!!", "Rock effect", 1, null, null, [Item.Tag.QUEST])
            )

            player.add_item_to_inventory(
                new Item("Spiritual thing", "Idk", "makes you [[#f00]]strong", 1, null, null, [Item.Tag.SPIRITUAL])
            )

            player.add_item_to_inventory(
                new Item("Crumpled Piece of Paper", "Blank.", "[[#f00]]Still [[clear]]blank", 1)
            )

            Object.keys(ITEM_TYPE).forEach(k => {
                let flats = {};
                let muls = {};
                ["MHP", "ATK", "ATT", "DEF", "MDF", "SPD", "ACC", "EVA"].forEach(stat => {
                    [flats, muls].forEach((f, index) => {
                        if (Math.random() < 0.3) {
                            f[stat] = Math.round(Math.random() * 20);
                            if (index == 1) {
                                f[stat] /= 20;
                            }
                        }
                    })
                });

                if (k.includes("ARMOUR")) {
                    [EquipComponent.SubType.HEAD, EquipComponent.SubType.BODY, EquipComponent.SubType.ARMS, EquipComponent.SubType.LEGS].forEach(sk => {
                        player.add_item_to_inventory(
                            new Item(`Equippable ${k} ${sk}`, "dont think too hard about it", "nope", 1, new EquipComponent(
                                ITEM_TYPE[k], Math.round(Math.random() * 100), flats, muls, null, [], sk
                            ))
                        )
                    })
                } else {
                    player.add_item_to_inventory(
                        new Item(`Equippable ${k}`, "dont think too hard about it", "nope", 1, new EquipComponent(
                            ITEM_TYPE[k], Math.round(Math.random() * 100), flats, muls, null, []
                        ))
                    )
                }
            })

            player.add_item_to_inventory(
                new Item(`Sword of God`, "REAL???", "Gives you power of god", 1, new EquipComponent(
                    ITEM_TYPE.SWORD, 1000, {
                        MHP: 999,
                        ATK: 999,
                        ATT: 999,
                        DEF: 999,
                        MDF: 999,
                        SPD: 999,
                        ACC: 999,
                        EVA: 999,
                    }, {
                        MHP: 9.99,
                        ATK: 9.99,
                        ATT: 9.99,
                        DEF: 9.99,
                        MDF: 9.99,
                        SPD: 9.99,
                        ACC: 9.99,
                        EVA: 9.99,
                    }, "thousandfold_divide", []
                ), null, [], [
                    ["artifact_mastery", 2,], ["sword_mastery", 6]
                ])
            )

            player.add_item_to_inventory(
                new Item("Single Blade of Grass", "just one", "1", 1, null, new UseComponent(
                    true, 1, 1
                ))
            )

            player.add_item_to_inventory(
                new Item("Firecrackers", "blow up!", "---", 1, null, new UseComponent(
                    true, 1, 0
                ))
            )

            player.add_item_to_inventory(
                new Item("Healing Salve", "it takes 12 hours to work", "Restore 50 HP", 1, null, new UseComponent(
                    true, 0, 1
                ))
            )

            player.add_item_to_inventory(
                new Item("Lots of Blades of Grass", "enough to last a lifetime", "Grants +10 ATK, +50% DEF, +10 SPD and -10 EVA", 1, null, new UseComponent(
                    false, 1, 1
                ))
            )

            player.add_item_to_inventory(
                new Item("Get out of Battle Free Card", "Lifetime membership!", "---", 1, null, new UseComponent(
                    false, 1, 0
                ))
            )

            player.add_item_to_inventory(
                new Item("Patience Test", "Restores 1HP", "---", 1, null, new UseComponent(
                    false, 0, 1
                ))
            )

            player.equipped_items["WEAPON"] = new Item(
                "Sword ass sword", "FUCKINK. SORD", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.SWORD, 5, {ATK: 2, SPD: 6}, {MHP: 2}, "wooden_sword_moment", []
                )
            )
            
            player.equipped_items["BODY"] = new Item(
                "Good Ass Everything Armour", "cloth", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.LIGHT_ARMOUR, 5, {DEF: 10, SPD: 50}, {}, "", [], EquipComponent.SubType.BODY
                )
            )

            player.equipped_items["ARTIFACT1"] = new Item(
                "Artifact That Gives You \"Parry\"", "Look, it's there now!", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.DIVINE_ARTIFACT, 0, {}, {}, "parry", []
                )
            )

            player.tracked_skills[1] = "sword_mastery";
            player.set_skill_level("sword_mastery", 0);
            player.set_skill_xp("sword_mastery", 0);

            player.tracked_skills[2] = "knife_mastery";
            player.set_skill_level("knife_mastery", 25);
            player.set_skill_xp("sword_mastery", 0);

            player.set_skill_level("divine_artifact_mastery", 100);

            player.refresh_entity();
            player.mark_change("inventory");
            player.mark_change("equipment");
            player.mark_change("skills");

            // TODO need to also refresh the display of the currently moused over item every time the inventory changes
        }
    })

    game.enter_location(game.location);
})

// TODO
// implement events fully
// including dialog box
// rendering items to mouseover in the dialog box
// Etc