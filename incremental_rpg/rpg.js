let player = Player.new("plaaosert");

let mouseover_item = {
    item: null,
    index: -1,
    slot: null
}

let cur_battle = null;
let last_frame = 0;
let game_speed = 8;
const SMALLEST_ALLOWED_TIME_GAP = 1;
const LARGEST_ALLOWED_TIME_GAP = 25;
const MAX_CALCS_PER_FRAME = 10;

function equip_button_pressed(keyindex) {
    console.log(mouseover_item);
    if (mouseover_item.item) {
        if (mouseover_item.index != -1) {
            // inventory
            inventory_equip(mouseover_item.index, keyindex);
        } else if (mouseover_item.slot && keyindex == 1) {
            // equipped item
            equipped_unequip(mouseover_item.slot);
        }
    }
}

function interactable_item_mouseover() {
    // show the panel
    document.getElementById("item_info_overlay_panel").style.display = "";
}

function interactable_item_mouseout() {
    document.getElementById("item_info_overlay_panel").style.display = "none";
    mouseover_item = {
        item: null,
        index: -1,
        slot: null
    }
}

// TODO figure out an equipping / comparison UI (copy the item display panel ig?)
function inventory_mouseover(index) {
    interactable_item_mouseover();

    // also show the infoscreen here, but for now just mark it as not new
    if (player.inventory[index].is_new) {
        player.inventory[index].is_new = false;
        player.mark_change("inventory");

        render_inventory(player);
    }

    render_selected_item(player, player.inventory[index]);

    mouseover_item.item = player.inventory[index];
    mouseover_item.index = index;
    mouseover_item.slot = null;
}

function inventory_equip(index, artifact_target) {
    // artifact_target only matters if the item is an artifact.
    // can only equip while not busy (in a battle, or in an event)
    if (!(cur_battle || game_state.cur_option_state)) {
        let item = player.inventory[index];
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
    if (!(cur_battle || game_state.cur_option_state)) {
        if (player.inventory.length < player.inventory_max_slots-1) {
            player.unequip_item_from_slot(categ);
        } else {
            // can't unequip, inventory is full
        }
    }
}

let test_location = new GameLocation(
    "Test area", "TST", [], [
        [{msg: "This is a test dialogue tree", next: [
            {msg: "Next option", next: [
                {msg: "End encounter"}
            ]},
            {msg: "Next option (dangerous)", encounter: new Encounter([
                entity_template_list["training_dummy"]
            ])}
        ]}]
    ], false, new Encounter(["training_dummy", "training_dummy_2", "training_dummy_3"], 4), 10
)

let game_state = {
    time_until_encounter: Number.POSITIVE_INFINITY,
    encounter_timeout: -1,
    encounter_index: -1,

    location: test_location,
    cur_encounter: null,

    cur_option_state: null,
}


document.addEventListener("DOMContentLoaded", function() {
    enemy_stats_parent_elem = document.querySelector(".panel.enemy-panel .panel-inner");
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
                if (cur_battle) {
                    render_entity_stats(cur_battle.ent2, enemy_stats_parent_elem);

                    cur_battle.step(final_delta_time);

                    render_entity_stats(cur_battle.ent1, player_stats_parent_elem);
                    render_entity_stats(cur_battle.ent2, enemy_stats_parent_elem);
                    
                    // need to check for victory here and grant skill XP and stuff.
                    // then, regenerate the entity.
                    if (cur_battle.ent1.hp == 0) {
                        // player lost battle - teleport to most recent safe zone and refresh entity

                        // just refresh entity for now
                        game_state.cur_encounter = null;
                        cur_battle = null;
                        player.refresh_entity(null, false, 100);
                    } else if (cur_battle.ent2.hp == 0) {
                        // skill XP granted is base XP of enemy, multiplied by number of items equipped that the skill grants proficiency to,
                        // divided by the maximum number of items that could be
                        // so, weapon is /1, artifact is /2, armour is /4, Combat is static 1x always
                        let equipped_item_types = player.get_equipped_item_types();
                        
                        // for each skill, check the number of relevant item types and divide by max num applicable items. Combat is ignored and done separately
                        Object.keys(skills_list).forEach(sk => {
                            let skill_info = skills_list[sk];

                            if (sk != "unarmed_mastery" && sk != "combat") {
                                let total_relevant_items = skill_info.items_for_proficiency.reduce((prev, cur) => prev + (equipped_item_types[cur] ? equipped_item_types[cur] : 0), 0);
                                
                                let final_xp_mul = total_relevant_items / skill_info.max_num_applicable_items;

                                player.gain_skill_xp(sk, Math.ceil(final_xp_mul * cur_battle.ent2.template.xp_value));
                            } else {
                                switch (sk) {
                                    case "unarmed_mastery":
                                        // check for unarmed flag
                                        if (equipped_item_types.unarmed) {
                                            player.gain_skill_xp(sk, Math.ceil(1 * cur_battle.ent2.template.xp_value));
                                        }
                                        break;

                                    case "combat":
                                        // always
                                        player.gain_skill_xp(sk, Math.ceil(1 * cur_battle.ent2.template.xp_value));
                                        break;
                                }
                            }

                            // TEST
                            // player.gain_skill_xp(sk, Math.ceil(Math.random() * 30));
                        });

                        // TODO item drops, cultivation skills, etc

                        // destroy the battle object and recreate the player entity (skills, effects etc reset but hp not restored)
                        render_entity_stats(cur_battle.ent2, enemy_stats_parent_elem);
                        cur_battle = null;
                        player.refresh_entity(null, true);
                    }
                } else if (game_state.cur_encounter) {
                    game_state.encounter_timeout -= final_delta_time;
                    if (game_state.encounter_index >= game_state.cur_encounter.enemies.length || game_state.encounter_timeout <= 0) {
                        if (game_state.encounter_index >= game_state.cur_encounter.enemies.length) {
                            // end encounter, including rewards(?). for now just destroy it
                            game_state.cur_encounter = null;
                            cur_battle = null;
                            player.refresh_entity(null, false, 100);
                        } else {
                            let template = game_state.cur_encounter.get_entity_at_index(game_state.encounter_index);
                            cur_battle = new Battle(
                                player.stored_entity,
                                new Entity(template, template.name, [])
                            )

                            game_state.encounter_timeout = game_state.cur_encounter.time_between;
                            game_state.encounter_index += 1;
                        }
                    }
                } else {
                    // should probably have some kind of Game object that handles this, then would call step() on this
                    game_state.time_until_encounter -= final_delta_time;
                    if (game_state.time_until_encounter <= 0) {
                        game_state.time_until_encounter = game_state.location.default_encounter_wait_time;

                        // start encounter
                        game_state.cur_encounter = game_state.location.default_encounter;
                        game_state.encounter_timeout = 0;
                        game_state.encounter_index = 0;

                        // still need to implement safe zones. will do navigation and movement and all of that once multiple in-a-row battles are tested
                    }
                }
            } else {
                looping = false;
            }
        }

        render_inventory(player);
        render_equipped_items(player);

        if (player.check_change("skills")) {
            render_skills_list(player);
            render_tracked_skill_progress(player);
        }

        render_entity_stats(player.stored_entity, player_stats_parent_elem);

        if (game_state.cur_encounter) {
            make_bar_with_text(
                map_parent_elem.querySelector("#encounter_time p"),
                `Time until next fight (${game_state.encounter_index} / ${game_state.cur_encounter.enemies.length})|${Math.round(game_state.encounter_timeout * 1) / 1}s`,
                map_parent_elem.querySelector("#encounter_time .bar"),
                map_intercombat_bar_style, game_state.encounter_timeout, game_state.cur_encounter.time_between, 
                MAP_PANEL_LENGTH, false, true
            )
        } else {
            make_bar_with_text(
                map_parent_elem.querySelector("#encounter_time p"),
                `Time until encounter|${Math.round(game_state.time_until_encounter * 1) / 1}s`,
                map_parent_elem.querySelector("#encounter_time .bar"),
                map_encounter_bar_style, game_state.time_until_encounter, game_state.location.default_encounter_wait_time, 
                MAP_PANEL_LENGTH, false, true
            )
        }

        window.requestAnimationFrame(update_fn);
    };

    last_frame = Date.now();
    window.requestAnimationFrame(update_fn);

    player.refresh_entity();

    document.addEventListener("keydown", function(e) {
        console.log(e.code);
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
                                ITEM_TYPE[k], 1, flats, muls, null, [], sk
                            ))
                        )
                    })
                } else {
                    player.add_item_to_inventory(
                        new Item(`Equippable ${k}`, "dont think too hard about it", "nope", 1, new EquipComponent(
                            ITEM_TYPE[k], 1, flats, muls, null, []
                        ))
                    )
                }
            })

            player.add_item_to_inventory(
                new Item(`Sword of God`, "REAL???", "Gives you power of god", 1, new EquipComponent(
                    ITEM_TYPE.SWORD, 1, {
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
                ), null, [], true, [
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
                "Wooden Sword", "This is a wooden sword for testing purposes", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.SWORD, 5, {ATK: 2, SPD: 6}, {MHP: 2}, "wooden_sword_moment", []
                )
            )
            
            // TODO actually make sure armour items are restricted to a certain slot (LOL)
            player.equipped_items["BODY"] = new Item(
                "Good Ass Everything Armour", "cloth", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.LIGHT_ARMOUR, 5, {DEF: -10}, {}, "", [], EquipComponent.SubType.BODY
                )
            )

            player.equipped_items["ARTIFACT1"] = new Item(
                "Artifact That Gives You \"Parry\"", "Look, it's there now!", "---", 1,
                new EquipComponent(
                    ITEM_TYPE.DIVINE_ARTIFACT, 0, {}, {}, "parry", []
                )
            )

            player.tracked_skills[1] = "sword_mastery";
            player.skill_levels["sword_mastery"] = 0;
            player.skill_xp["sword_mastery"] = 0;

            player.tracked_skills[2] = "knife_mastery";
            player.skill_levels["knife_mastery"] = 0;
            player.skill_xp["knife_mastery"] = 0;

            player.skill_levels["divine_artifact_mastery"] = 100;
            player.skill_xp["combat"] = 0;

            player.refresh_entity();
            player.mark_change("inventory");
            player.mark_change("equipment");
            player.mark_change("skills");

            // TODO need to also refresh the display of the currently moused over item every time the inventory changes

            game_state.time_until_encounter = game_state.location.default_encounter_wait_time;
        }
    })
})

