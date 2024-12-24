class BarStyle {
    static DisplayType = {
        GRADIENT: (s, i, v, m) => s.col1.lerp(s.col2, i/m),
        BAR_CHANGE_COL: (s, i, v, m) => s.col1.lerp(s.col2, v/m),
        STATIC: (s, i, v, m) => s.col1
    }

    constructor(display_type, col1, col2, bar_char="█", empty_char=" ", empty_col=Colour.white) {
        this.display_type = display_type;
        this.col1 = col1;
        this.col2 = col2;

        this.empty_col = empty_col;

        this.bar_char = bar_char;
        this.empty_char = empty_char;
    }

    get_col(cur_seg_index, total_len, max_len) {
        return this.display_type(
            this, cur_seg_index, total_len, max_len
        ).css();
    }
}


function make_bar_with_text(text_element, text_format_string, bar_element, bar_style, cur_val, max_val, bar_length, center_text=false, split_and_pad_inside=false) {
    make_bar(bar_element, bar_style, cur_val, max_val, bar_length);

    let fmt_text = text_format_string.replace("{{0}}", `${cur_val}/${max_val}`);
    if (center_text) {
        let num_spaces_needed = Math.max(0, bar_length - fmt_text.length);
        let spaces_before = Math.floor(num_spaces_needed / 2);
        let spaces_after = num_spaces_needed - spaces_before;

        fmt_text = " ".repeat(spaces_before) + fmt_text + " ".repeat(spaces_after);
    }

    if (split_and_pad_inside) {
        // split at a "|" char and add the necessary num of spaces in-between
        let num_spaces_needed = Math.max(0, bar_length - fmt_text.length + 1);

        let split_text = fmt_text.split("|");

        fmt_text = split_text[0] + " ".repeat(num_spaces_needed) + split_text[1];
    }

    text_element.textContent = fmt_text;
}

function make_bar(element, style, cur_val, max_val, bar_length) {
    let num_segs = Math.ceil(bar_length * (cur_val / max_val));

    render_bar(element, style, num_segs, bar_length);
}

function setup_bar(element, style, max_len) {
    for (let i=0; i<max_len; i++) {
        let elem = document.createElement("span");
        elem.style.color = style.empty_col.css();
        elem.textContent = style.empty_char;
        elem.className = "seg";

        element.appendChild(elem);
    }
}

function render_bar(element, style, cur_len, max_len) {
    let element_children = element.querySelectorAll("span");
    for (let i=0; i<max_len; i++) {
        if (i < cur_len) {
            element_children[i].style.color = style.get_col(i, cur_len, max_len);
            element_children[i].textContent = style.bar_char;
        } else {
            element_children[i].style.color = style.empty_col.css()
            element_children[i].textContent = style.empty_char;
        }
    }
}


let enemy_stats_parent_elem = null;
let player_stats_parent_elem = null;
let map_parent_elem = null;

// i'd really like to introduce a lerp + multiple coloured healthbars like IRPG here, but not right now
// it's a little tough to introduce it in a way that isn't an obvious terrible bodge, so, uh, watch this space
// dude all the bars HAVE to lerp it would look so awesome
function render_entity_stats(entity, parent_elem) {
    // HP, then 6 abilities. Set to an empty string and empty bar if no ability in that slot.
    parent_elem.querySelector("#name").textContent = entity.name;

    if (entity.check_change("hp")) {
        make_bar_with_text(
            parent_elem.querySelector("#hp p"), "hp: {{0}}", parent_elem.querySelector("#hp .bar"), entity.template.bar_style,
            entity.hp, entity.stats.MHP, ENTITY_PANEL_LENGTH, true
        )
    }

    if (entity.check_change("abilities")) {
        for (let i=0; i<6; i++) {
            if (i < entity.delays.length) {
                make_bar_with_text(
                    parent_elem.querySelector(`#ability_${i} p`), entity.template.abilities[i].name, parent_elem.querySelector(`#ability_${i} .bar`),
                    entity.template.abilities[i].bar_style, entity.template.abilities[i].max_delay - entity.delays[i], entity.template.abilities[i].max_delay, ENTITY_PANEL_LENGTH, true
                )
            } else {
                make_bar_with_text(
                    parent_elem.querySelector(`#ability_${i} p`), " ", parent_elem.querySelector(`#ability_${i} .bar`),
                    entity.template.bar_style, 0, 1, ENTITY_PANEL_LENGTH, true
                )
            }
        }
    }
}

let empty_bar_style = new BarStyle(BarStyle.DisplayType.GRADIENT, new Colour(24, 24, 64), new Colour(24, 24, 64));
let finished_skill_style = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(30, 80, 30), new Colour(30, 80, 30)
)
let map_encounter_bar_style = new BarStyle(BarStyle.DisplayType.STATIC, new Colour(100, 140, 255), null);
let map_intercombat_bar_style = new BarStyle(BarStyle.DisplayType.STATIC, new Colour(30, 80, 255), null);

function setup_bars() {
    // set up entity panel bars
    let entity_bars = [...player_stats_parent_elem.querySelectorAll(".bar"), ...enemy_stats_parent_elem.querySelectorAll(".bar")];

    entity_bars.forEach(bar => {
        setup_bar(bar, empty_bar_style, ENTITY_PANEL_LENGTH);
    })

    setup_bar(map_parent_elem.querySelector("#encounter_time .bar"), empty_bar_style, MAP_PANEL_LENGTH);
}

function render_tracked_skill_progress(player) {
    // move out into separate skill style later
    player.tracked_skills.forEach((t, i) => {
        if (t) {
            let level = player.skill_levels[t];
            let skill = skills_list[t];

            if (level >= skill.max_level) {
                make_bar_with_text(
                    player_stats_parent_elem.querySelector(`#tracked_skill_${i} p`),
                    `${skill.name} (${level})|MAX`,
                    player_stats_parent_elem.querySelector(`#tracked_skill_${i} .bar`),
                    finished_skill_style, 128, 128, ENTITY_PANEL_LENGTH, false, true
                )
            } else {
                make_bar_with_text(
                    player_stats_parent_elem.querySelector(`#tracked_skill_${i} p`),
                    `${skill.name} (${level})|{{0}}`,
                    player_stats_parent_elem.querySelector(`#tracked_skill_${i} .bar`),
                    skill.bar_style, player.skill_xp[t], skill.xp_to_next(level), ENTITY_PANEL_LENGTH, false, true
                )
            }
        } else {
            // no tracked skill
            make_bar_with_text(
                player_stats_parent_elem.querySelector(`#tracked_skill_${i} p`),
                "-|-",
                player_stats_parent_elem.querySelector(`#tracked_skill_${i} .bar`),
                empty_bar_style, 128, 128, ENTITY_PANEL_LENGTH, false, true
            )
        }
    })
}


function clear_linelist(listid) {
    let el = document.getElementById(listid);
    while (el.firstChild) {
        el.removeChild(el.lastChild);
    }
}


function setup_skills_list(player) {
    // clear div
    clear_linelist("skills");

    // re-add a bunch of bars and set them up
    let skills_sorted = Object.keys(skills_list).filter(s => player.should_show_skill(s)).sort((a, b) => {
        a.localeCompare(b)
    }).sort((a, b) => {
        a.sort_id - b.sort_id
    })

    let skills_elems_list = document.querySelector("#skills");
    let last_sort_key = 0;
    skills_sorted.forEach(skill => {
        if (skills_list[skill].sort_key != last_sort_key) {
            last_sort_key = skills_list[skill].sort_key;
            skills_elems_list.appendChild(document.createElement("br"));
        }

        let bar_parent = document.createElement("div");
        bar_parent.classList.add("line");
        bar_parent.classList.add("stacked");
        bar_parent.classList.add("clickable");

        bar_parent.addEventListener("mouseover", e => {
            console.log(`mouseover for skill ${bar_parent.getAttribute("target_skill")}`)
        })

        bar_parent.addEventListener("mouseout", e => {
            console.log(`mouseout for skill ${bar_parent.getAttribute("target_skill")}`)
        })

        let text = document.createElement("p");
        text.classList.add("shadow");

        let bar = document.createElement("div");
        bar.classList.add("bar");

        bar_parent.appendChild(bar);
        bar_parent.appendChild(text);

        skills_elems_list.appendChild(bar_parent);
        setup_bar(bar, empty_bar_style, SKILLS_VIEW_LENGTH);
    })
}


function render_skills_list(player) {
    if (player.check_change("skills_unlocked")) {
        setup_skills_list(player);
    }

    // sort by sort_id, then by alphabetical name
    let skills_sorted = Object.keys(skills_list).filter(s => player.should_show_skill(s)).sort((a, b) => {
        a.localeCompare(b)
    }).sort((a, b) => {
        a.sort_id - b.sort_id
    })

    let skills_elems = document.querySelectorAll("#skills .line.stacked");

    skills_sorted.forEach((skill_k, index) => {
        let skill_elem = skills_elems[index];
        skill_elem.setAttribute("target_skill", skill_k);

        let level = player.skill_levels[skill_k];
        let xp = player.skill_xp[skill_k];
        let skill = skills_list[skill_k];

        if (level >= skill.max_level) {
            make_bar_with_text(
                skill_elem.querySelector(`p`),
                `${skill.name} (${level})|MAX`,
                skill_elem.querySelector(`.bar`),
                finished_skill_style, 128, 128, SKILLS_VIEW_LENGTH, false, true
            )
        } else {
            make_bar_with_text(
                skill_elem.querySelector(`p`),
                `${skill.name} (${level})|{{0}}`,
                skill_elem.querySelector(`.bar`),
                skill.bar_style, xp, skill.xp_to_next(level), SKILLS_VIEW_LENGTH, false, true
            )
        }
    })
}


function render_equipped_items(player) {
    if (!player.check_change("equipment")) {
        return;
    }

    Object.keys(player.equipped_items).forEach(slot => {
        let slot_elem = document.querySelector(`#equipment_${slot.toLowerCase()}`);

        let item = player.equipped_items[slot];
        if (item) {
            let cols = item.determine_cols(player);

            slot_elem.style.color = cols[0].css();
            slot_elem.style.backgroundColor = cols[1].css();
    
            slot_elem.textContent = item.name.padEnd(MAX_ITEM_NAME_LEN+4);
        } else {
            slot_elem.style.color = "";
            slot_elem.style.backgroundColor = "";
    
            slot_elem.textContent = "---".padEnd(MAX_ITEM_NAME_LEN+4);
        }
    })
}


function render_inventory(player) {
    if (!player.check_change("inventory")) {
        return;
    }

    // update max slots
    let slotcount = document.getElementById("inventory_max_slots");
    slotcount.textContent = `(${player.inventory.length}/${player.inventory_max_slots})`;

    // clear inventory div
    clear_linelist("inventory");

    // add in every item
    // need to sort items here before display according to the value of #inventory_sort_method
    // also make sure the sorted display matches up with the original order of the list
    let indexes = new Array(player.inventory.length).fill(0).map((v, i) => i);
    let inventory_div = document.getElementById("inventory");

    player.inventory.forEach((item, index) => {
        let elem = document.createElement("p");

        elem.classList.add("line");
        elem.classList.add("shadow");
        elem.classList.add("clickable");

        let cols = item.determine_cols(player);

        elem.style.color = cols[0].css();
        elem.style.backgroundColor = cols[1].css();

        elem.innerHTML = `${item.is_new ? "<span style='color:red'>[!]</span> " : "    "}${item.name.padEnd(MAX_ITEM_NAME_LEN+4)}`;

        let idx = indexes[index];
        elem.addEventListener("mouseover", e => {
            inventory_mouseover(idx);
        });

        elem.addEventListener("mouseout", e => {
            interactable_item_mouseout();
        });

        inventory_div.appendChild(elem);
    })
}


function render_selected_item(player, item) {
    let elem = document.querySelector("#item_info_overlay_panel");
    if (!item) {
        return;
    }

    let cols = item.determine_cols(player);

    elem.querySelector(".panel-inner").style.backgroundColor = cols[3].css();

    elem.querySelector("#item_info_name").innerHTML = item.name;
    elem.querySelector("#item_info_name").style.color = cols[0].css(); 

    elem.querySelector("#item_info_subname").innerHTML = `- ${item.full_item_descriptor} -`;

    if (item.requires_skills.length > 0) {
        let reqskills_html = "";
        item.requires_skills.forEach((sk, i) => {
            let col = "";
            if (player.skill_levels[sk[0]] < sk[1]) {
                col = "#f00";
            }

            console.log(sk[0])
            reqskills_html += `<span style="color:${col}">${skills_list[sk[0]].name} (${sk[1]})</span>`
            if (i < item.requires_skills.length-1) {
                reqskills_html += ", "
            }
        })

        elem.querySelector("#item_info_reqskills").innerHTML = `Requires ${reqskills_html}`;
        elem.querySelector("#item_info_reqskills").style.display = "";
    } else {
        elem.querySelector("#item_info_reqskills").style.display = "none";
    }

    elem.querySelector("#item_info_desc").innerHTML = item.description;
    elem.querySelector("#item_info_effect").innerHTML = item.effect_desc;

    if (item.equip_component) {
        let panel = elem.querySelector(`#item_equip`)
        panel.style.display = "";
        elem.querySelector("#item_use").style.display = "none";

        if (item.equip_component.unlock_ability) {
            panel.querySelector("#item_info_skill_grant").style.display = "";
            panel.querySelector("#item_info_skill_grant span").textContent = ability_list[item.equip_component.unlock_ability].name;
        } else {
            panel.querySelector("#item_info_skill_grant").style.display = "none";
        }

        ["MHP", "ATK", "ATT", "DEF", "MDF", "SPD", "ACC", "EVA"].forEach(stat => {
            let stat_container = panel.querySelector(`#item_info_stat_${stat}`);

            let stat_flat = item.equip_component?.stats_flat[stat];
            if (stat_flat) {
                stat_container.querySelector(".stat-flat-bonus").textContent = "+" + stat_flat.toString().padEnd(SELECTED_ITEM_PAD_LEN);
            } else {
                stat_container.querySelector(".stat-flat-bonus").textContent = "".padEnd(SELECTED_ITEM_PAD_LEN+1);
            }

            let stat_mult = item.equip_component?.stats_mult[stat];
            if (stat_mult) {
                stat_container.querySelector(".stat-mult-bonus").textContent = "+" + Math.round(stat_mult * 100).toString() + "%";
            } else {
                stat_container.querySelector(".stat-mult-bonus").textContent = ""
            }
        })
    } else if (item.use_component) {
        let panel = elem.querySelector("#item_use");
        panel.style.display = "";
        elem.querySelector(`#item_equip`).style.display = "none";

        let battle_use = panel.querySelector("#item_info_use_battle");
        if (item.use_component.battle_effect) {
            battle_use.textContent = "Can be used in battle.";
            battle_use.style.color = "rgb(180, 0, 0)";
        } else {
            battle_use.textContent = "Cannot be used in battle.";
            battle_use.style.color = "rgb(96, 96, 96)";
        }

        let field_use = panel.querySelector("#item_info_use_field");
        if (item.use_component.field_effect) {
            field_use.textContent = "Can be used outside battle.";
            field_use.style.color = "rgb(0, 160, 0)";
        } else {
            field_use.textContent = "Cannot be used outside battle.";
            field_use.style.color = "rgb(96, 96, 96)";
        }

        let consumed = panel.querySelector("#item_info_use_consumed");
        if (item.use_component.consumed_when_used) {
            consumed.textContent = "Consumed on use.";
            consumed.style.color = "rgb(160, 160, 160)";
        } else {
            consumed.textContent = "Not consumed on use.";
            consumed.style.color = "rgb(64, 128, 255)";
        }
    } else {
        // hide it
        elem.querySelector(`#item_equip`).style.display = "none";
        elem.querySelector(`#item_use`).style.display = "none";
    }
}


const ENTITY_PANEL_LENGTH = 48;
const MAP_PANEL_LENGTH = 64;
const MAX_ITEM_NAME_LEN = 32;
const SKILLS_VIEW_LENGTH = 48;
const SELECTED_ITEM_PAD_LEN = 12;
