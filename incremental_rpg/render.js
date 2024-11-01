class BarStyle {
    static DisplayType = {
        GRADIENT: (s, i, v, m) => s.col1.lerp(s.col2, i/m),
        BAR_CHANGE_COL: (s, i, v, m) => s.col1.lerp(s.col2, v/m)
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

function render_bar(element, style, cur_len, max_len) {
    let element_html = "";
    for (let i=0; i<max_len; i++) {
        if (i < cur_len) {
            element_html += `<span class="seg" style="color:${style.get_col(
                i, cur_len, max_len
            )}">${style.bar_char}</span>`;
        } else {
            element_html += `<span class="seg" style="color:${style.empty_col.css()}">${style.empty_char}</span>`;
        }
    }

    element.innerHTML = element_html;
}


let enemy_stats_parent_elem = null;
let player_stats_parent_elem = null;


function render_entity_stats(entity, parent_elem) {
    // HP, then 6 abilities. Set to an empty string and empty bar if no ability in that slot.
    parent_elem.querySelector("#name").textContent = entity.name;

    make_bar_with_text(
        parent_elem.querySelector("#hp p"), "hp: {{0}}", parent_elem.querySelector("#hp .bar"), entity.template.bar_style,
        entity.hp, entity.stats.MHP, ENTITY_PANEL_LENGTH, true
    )

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

let empty_bar_style = new BarStyle(BarStyle.DisplayType.GRADIENT, new Colour(24, 24, 64), new Colour(24, 24, 64));
let finished_skill_style = new BarStyle(
    BarStyle.DisplayType.GRADIENT,
    new Colour(30, 80, 30), new Colour(30, 80, 30)
)

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


const ENTITY_PANEL_LENGTH = 48;
