let player = Player.new("plaaosert");

let cur_battle = null;
let last_frame = 0;
let game_speed = 8;
const SMALLEST_ALLOWED_TIME_GAP = 1;
const LARGEST_ALLOWED_TIME_GAP = 25;
const MAX_CALCS_PER_FRAME = 10;

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
    ], false, new Encounter(["training_dummy", "training_dummy", "training_dummy"], 4), 10
)

let game_state = {
    time_until_encounter: Number.POSITIVE_INFINITY,
    encounter_timeout: -1,
    encounter_index: -1,

    location: test_location,
    cur_encounter: null
}


document.addEventListener("DOMContentLoaded", function() {
    enemy_stats_parent_elem = document.querySelector(".panel.enemy-panel .panel-inner");
    player_stats_parent_elem = document.querySelector(".panel.player-panel .panel-inner");

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
                    
                    // need to check for victory here and grant skill XP and stuff.
                    // then, regenerate the entity.
                } else if (game_state.cur_encounter) {
                    game_state.encounter_timeout -= final_delta_time;
                    if (game_state.encounter_index > game_state.cur_encounter.enemies.length || game_state.encounter_timeout <= 0) {
                        if (game_state.encounter_index > game_state.cur_encounter.enemies.length) {
                            // end encounter, including rewards(?). for now just destroy it
                            game_state.cur_encounter = null;
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
                        game_state.time_until_encounter += game_state.location.default_encounter_wait_time;

                        // start encounter
                        game_state.cur_encounter = game_state.location.default_encounter;
                        game_state.encounter_timeout = 0;
                        game_state.encounter_index = 0;

                        // still need to implement safe zones. will do all of that once multiple in-a-row battles are tested
                    }
                }
            } else {
                looping = false;
            }
        }

        render_tracked_skill_progress(player);
        render_entity_stats(player.stored_entity, player_stats_parent_elem);

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

        if (e.code == "KeyQ") {
            player.equipped_items["WEAPON"] = new Item(
                "Wooden Knife", "This is a wooden knife for testing purposes", ITEM_TYPE.KNIFE,
                5, {ATK: 15, SPD: 6}, {MHP: 2}, "wooden_sword_moment", []
            )
            
            player.tracked_skills[1] = "knife_mastery";
            player.skill_levels["knife_mastery"] = 100;
            player.skill_xp["knife_mastery"] = 0;

            player.tracked_skills[2] = "hammer_mastery";
            player.skill_levels["hammer_mastery"] = 72;
            player.skill_xp["hammer_mastery"] = 1832;

            player.skill_levels["combat"] = 49;
            player.skill_xp["combat"] = 2532;

            player.refresh_entity();

            game_state.time_until_encounter = game_state.location.default_encounter_wait_time;
        }
    })
})

