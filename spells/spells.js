// wandcrafting mechanics similar to noita, but played on a turn based top-down grid like rift wizard
// ascii based, of course :)  kind of like dwarf fortress graphics
// spells can be:
// - cores (typical spells) with their own specific stat bases
//   - for example; Fireball => 10 range, 2 radius, 10 fire damage, 5 mana cost
// - modifiers (applied exactly the same as in noita, including multicasts)
//   - stat changes (e.g. +1 radius). usually combined with some kind of associated mana cost
//
//   - damage type changes - might fall under the umbrella of "all X damage from this spell is now Y damage".
//     can also be "half X damage is redealt as Y damage", "+5 X damage" or "+10 damage to direct spell targets"
//     when damage types are not given (e.g. "+5 damage") they will add to the base stat - otherwise they are applied separately (but still trigger other effects here)
//     assumption is that +damage applies to both direct target and aoe.
//     the particle of the spell is based on the damage type usually, except when considering:
//
//   - cosmetic changes (change particle effect, usually)
//
//   - add triggers; make the spell trigger another spell with X conditions, e.g. "cast new spell at self" or "cast new spell at target" or
//     "cast new spell X times in random locations in a circle of radius" or "cast new spell one turn later" etc
//     some spells have inbuilt triggers
//
//   - shape changes; change the spell's effect shape.
//     square, circle, ring, diamond, square border, etc
//     usually comes with a bonus or drawback depending on how good the spell is (e.g. square -3 radius or ring -5 manacost)
//     assume the "base" shape is a circle (cover less = bonus, cover more = drawback)
//     shapes usually overwrite each other but the effects don't (wink wink)
//
//   - multicasts; identical to noita, modifiers are shared but paid for only once, spells are cast at once, etcetc
//
//   - misc things, for example:
//     delay (spell appears X turns after being cast)
//     ally shield (allies are not affected by this spell)
//     piercing (allies and enemies alike are affected by this spell (this is the normal behaviour of most spells))
//     enemy shield (enemies are not affected by this spell)
//     random core, random modifier (of course)
//     blood magic (subsequent cores and modifiers are paid for using HP instead of MP)
//     shape combination (multicast, but for shapes - means the shape will be the union of the two)
//
// need to find a font which supports emojis - or just use the dwarf fortress font lol
// semi important; spells are kind of rare, especially cores.
// mana notes; gain some mana every turn, increases with levelups? i guess
// levelups let you gain skills which will help with [stuff] like mana regen or max mana etc idk
// dont want to write a skill tree so the bonuses will either be random or fixed every time
// i want the focus to be on the spells, not skills

/*
TODO:
- right panel; when mouseover enemy on screen, show their:
   - name
   - hp
   - mp
   - affinities
   - spells:
      - for each innate spell, show list of components on one side
      - and calculated stats on the other
      - don't forget cooldown (it's outside the primed spell area)

- left panel; show player info
    - hp, mp, affinities
- up to 5(?) spells can be equipped so show basic info about each
- spells can have custom names given by the player. this is stored in Game somewhere
- spells should be clickable to select them, or bound to numbers 1-5
*/

const TARGET_FPS = 60;

const sbox = {
    "h": "─",
    "v": "│",
    "tl": "┌",
    "tr": "┐",
    "bl": "└",
    "br": "┘",
    "ml": "├",
    "mr": "┤",
    "tm": "┬",
    "bm": "┴",
    "c": "┼",
    "f": "█"
}

const dbox = {
    "h": "═",
    "v": "║",
    "tl": "╔",
    "tr": "╗",
    "bl": "╚",
    "br": "╝",
    "ml": "╠",
    "mr": "╣",
    "tm": "╦",
    "bm": "╩",
    "c": "╬",
    "f": "█"
}

const tbox = {
    "h": "-",
    "v": "|",
    "tl": "+",
    "tr": "+",
    "bl": "+",
    "br": "+",
    "ml": "+",
    "mr": "+",
    "tm": "+",
    "bm": "+",
    "c": "+",
    "f": "#"
}

const boxs = {
    "s": sbox,
    "d": dbox,
    "t": tbox
}

let b = boxs["s"];

pretty_print_trigger = {
    "at_target": "At target position",
    "on_hit": "At any damage instance",
    "on_affected_tiles": "At every affected tile"
}

switch_checkerboard = 0;


function random_from_arr(arr) {
    return arr[Math.floor(game.random() * arr.length)];
}

function random_int(min_inc, max_exc) {
    return Math.floor(min_inc + (game.random() * (max_exc - min_inc)));
}

// All seeded randomness from:
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a, b, c, d) {
    return function(dump_values) {
        if (dump_values) {
            return [a, b, c, d]
        }

        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

function get_seeded_randomiser(seed) {
    let seed_hash = cyrb128(seed);

    let rand = sfc32(seed_hash[0], seed_hash[1], seed_hash[2], seed_hash[3]);

    return rand;
}

function random_from_parameters(a, b, c, d) {
    return sfc32(a, b, c, d);
}

function seeded_random(seed) {
    let rand = get_seeded_randomiser(seed)

    // generate once, discard
    rand();

    // return second number
    return rand();
}

function lerp_arr(from, to, amt, round) {
    return from.map((t, i) => {
        let diff = to[i] - from[i];

        if (round) {
            return Math.round(t + (diff * amt));
        } else {
            return t + (diff * amt);
        }
        
    })
}

function lerp_colour(from, to, amt) {
    return lerp_arr(from, to, amt, true);
}

function in_bounds(val, lo, hi) {
    return val >= lo && val < hi;
}

function random_on_circle(r) {
    let theta = game.random() * 2 * Math.PI;

    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);

    return new Vector2(x, y);
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static from_hash_code(code) {
        return new Vector2((code-1) % 1000000, Math.floor((code-1) / 1000000));
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    hash_code() {
        return (this.y * 1000000) + this.x + 1;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    neg() {
        return new Vector2(-this.x, -this.y);
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return this.add(other.neg());
    }

    mul(other) {
        return new Vector2(this.x * other, this.y * other);
    }

    div(other) {
        return new Vector2(this.x / other, this.y / other);
    }

    // TODO test it works (moved sqr_magnitude into its own function from magnitude)
    sqr_magnitude() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2)
    }

    magnitude() {
        return Math.sqrt(this.sqr_magnitude());
    }

    normalize() {
        if (this.sqr_magnitude() == 0) {
            return this;
        }

        return this.div(this.magnitude());
    }

    sqr_distance(other) {
        return this.sub(other).sqr_magnitude();
    }

    distance(other) {
        return this.sub(other).magnitude();
    }

    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    wrap(bounds) {
        return new Vector2(this.x % bounds.x, this.y % bounds.y);
    }

    rotate(rad) {
        return new Vector2(
            this.x * Math.cos(rad) - this.y * Math.sin(rad),
            this.x * Math.sin(rad) + this.y * Math.cos(rad),
        )
    }
}

class ParticleTemplate {
    constructor(frames, col, speed) {
        this.frames = frames;
        this.num_frames = frames.length;
        this.col = col;
        this.speed = speed;
    }

    change_colour(to) {
        return new ParticleTemplate(
            this.frames, to, this.speed
        )
    }
}

class Particle {
    static id_inc = 0;

    constructor(template, start_at, override_speed, override_col) {
        this.id = Particle.id_inc;
        Particle.id_inc++;

        this.template = template;
        this.col = override_col ? override_col : template.col;
        this.current_frame = start_at ? start_at : 0;
        this.current_str = template.frames[this.current_frame];
        this.speed = override_speed ? override_speed : template.speed;
        this.flipped = false;
    }

    set_flip(to) {
        this.flipped = to;

        this.current_str = this.template.frames[Math.floor(this.current_frame)];
        if (this.flipped) {
            this.current_str = this.current_str.split("").reverse().join("");
        }

        return this;
    }

    advance(speed_mult) {
        this.current_frame += this.speed * (speed_mult ? speed_mult : 1);
        if (this.current_frame < this.template.num_frames) {
            this.current_str = this.template.frames[Math.floor(this.current_frame)];
            if (this.flipped) {
                this.current_str = this.current_str.split("").reverse().join("");
            }

            return 1;
        }

        return 0;
    }
}

class MessageBoxTemplate {
    constructor(title, text, options, option_background_cols, option_actions, on_open, custom_highlight_col) {
        this.title = title;
        this.text = text;
        this.options = options;
        this.option_background_cols = option_background_cols;
        this.option_actions = option_actions;
        this.on_open = on_open
        this.custom_highlight_col = custom_highlight_col
    }

    static basic_infobox(title, text, confirm_opt_text, confirm_opt_col, on_open, custom_highlight_col) {
        return new MessageBoxTemplate(
            title, text,
            [confirm_opt_text ? confirm_opt_text : "OK"],
            [confirm_opt_col ? confirm_opt_col : "#060"],
            [function() {}],
            on_open,
            [custom_highlight_col ? custom_highlight_col : null]
        )
    }

    copy() {
        return new MessageBoxTemplate(
            this.title, this.text, [...this.options], [...this.option_background_cols], [...this.option_actions], this.on_open
        );
    }

    change_title(new_title) {
        let new_template = this.copy();
        new_template.title = new_title;

        return new_template
    }

    change_text(new_text) {
        let new_template = this.copy();
        new_template.text = new_text;

        return new_template
    }
}

class MessageBox {
    constructor(template) {
        this.template = template

        this.title = template.title;
        this.text = template.text;
        this.options = template.options;
        this.option_background_cols = template.option_background_cols;
        this.option_actions = template.option_actions;
        this.on_open = template.on_open;
        this.custom_highlight_col = template.custom_highlight_col;

        this.need_to_calculate = true;
        this.registered_option_positions = {}
        this.tl = null;
        this.br = null;
    }
}

class Renderer {
    constructor(game, board, game_view_size, left_menu_len, right_menu_len, particle_speed) {
        this.fontsiz = 16;

        this.game = game;
        this.board = board;
        this.game_view_size = game_view_size;
        this.default_text_col = "white"

        this.position_optimisation = true;

        this.pixel_chars = [];
        this.left_menu_size = new Vector2(left_menu_len, game_view_size.y);
        this.right_menu_size = new Vector2(right_menu_len, game_view_size.y);
        this.total_size = new Vector2(game_view_size.x + left_menu_len + right_menu_len, game_view_size.y);
    
        this.particle_speed = particle_speed;
        this.active_particles = [];
        this.particle_list = [];
        for (let yt=0; yt<game_view_size.y; yt++) {
            this.active_particles.push([]);

            for (let xt=0; xt<game_view_size.x/2; xt++) {
                this.active_particles[yt].push(null);
            }
        }

        this.current_frame = [];
        this.previous_frame = [];

        this.cur_mouse_flatid = null;

        this.selected_tile = null;
        this.selected_panel_id = -1;
        this.mousedown_selected_tile = null;

        this.selected_ent = null;
        this.last_selected_tiles = [];

        this.last_player_spell_state = null;

        this.selectable_spells = {};
        this.selectable_spell_icons = {};
        this.selected_spell = null;
        this.selected_full_spell = null;
        this.selected_spell_loc = null;

        this.refresh_left_panel = true;
        this.refresh_right_panel = true;

        this.inventory_spell_origins = {};  // {vec: {spell, frag_id, spell_id}}
        this.inventory_items_origins = {};  // {vec: {spell, inv_id}}
        this.inventory_spell_names = {};    // {y: spellid}

        this.inventory_editing_spell_name = undefined;
        this.inventory_editing_spell_frag = undefined;  // {frag_id, spell_id, inv_id} <- if inv_id present, ignores frag, spell

        this.inventory_selected_spell_name = undefined;
        this.inventory_selected_spell = undefined;
        this.inventory_selected_spell_loc = undefined;
        this.inventory_selected_spell_item = undefined;
        this.inventory_selected_spell_item_loc = undefined;

        this.messagebox_open = null;
        this.messagebox_queue = [];

        this.selected_messagebox_option_nr = null;
        this.selected_messagebox_option_fn = null;

        this.default_msgbox_pad_x = 62-6;
        this.default_msgbox_pad_y = 12-6;
        
        this.msgbox_pad_x = this.default_msgbox_pad_x;
        this.msgbox_pad_y = this.default_msgbox_pad_y;
    }

    reset_selections() {
        this.selected_tile = null;
        this.selected_ent = null;

        this.refresh_left_panel = true;
        this.refresh_right_panel = true;

        /*
        this.selectable_spells = {};
        this.selectable_spell_icons = {};
        this.selected_spell = null;
        this.selected_full_spell = null;
        this.selected_spell_loc = null;
        */

        this.inventory_spell_origins = {};  // {vec: {spell, frag_id, spell_id}}
        this.inventory_items_origins = {};  // {vec: {spell, inv_id}}
        this.inventory_spell_names = {};    // {y: spellid}

        this.inventory_editing_spell_name = undefined;
        this.inventory_editing_spell_frag = undefined;  // {frag_id, spell_id, inv_id, trash} <- if inv_id present, ignores frag, spell

        this.inventory_selected_spell_name = undefined;
        this.inventory_selected_spell = undefined;
        this.inventory_selected_spell_loc = undefined;
        this.inventory_selected_spell_item = undefined;
        this.inventory_selected_spell_item_loc = undefined;

        this.inventory_delete_spell_position = undefined;
        this.inventory_delete_spell_selected = undefined;
    }



    change_size(game_view_size, left_menu_len, right_menu_len) {
        this.game_view_size = game_view_size;
        this.left_menu_size = new Vector2(left_menu_len, game_view_size.y);
        this.right_menu_size = new Vector2(right_menu_len, game_view_size.y);
        this.total_size = new Vector2(game_view_size.x + left_menu_len + right_menu_len, game_view_size.y);
    
        this.setup();
    }
    
    get_position_panel(pos) {
        if (this.messagebox_open) {
            return 3;
        }

        /*
        if (this.messagebox_open && !this.messagebox_open.need_to_calculate) {
            if (pos.x >= this.messagebox_open.tl.x && pos.x <= this.messagebox_open.br.x) {
                if (pos.y >= this.messagebox_open.tl.y && pos.y <= this.messagebox_open.br.y) {
                    return 3;
                }
            }
        }
        */
        
        if (pos.x < this.left_menu_size.x) {
            return 0;
        } else if (pos.x >= this.left_menu_size.x && pos.x < this.left_menu_size.x + this.game_view_size.x) {
            return 1;
        } else {
            return 2;
        }
    }

    setup() {
        let siz = this.total_size;

        // make a span for every pixel for now. this might suck but i think
        // it's better than repainting the DOM heavily every frame
        this.pixel_chars = [];

        this.current_frame = [];
        this.previous_frame = [];

        let parent = document.getElementById("gamelines");
        parent.innerHTML = "";

        for (let y=0; y<siz.y; y++) {
            this.pixel_chars.push([]);

            this.current_frame.push([]);
            this.previous_frame.push([]);

            for (let x=0; x<siz.x; x++) {
                let c = document.createElement("span");
                c.classList.add("gamepixel");

                if (this.position_optimisation) {
                    c.classList.add("gamepixel-abs");

                    c.style.height = this.fontsiz + "px";
                    c.style.width = `${this.fontsiz/2}px`;
                }

                c.classList.add("white");
                if (x >= this.left_menu_size.x && x < this.left_menu_size.x + this.game_view_size.x) {
                    if ((Math.floor(x/2) + y) % 2 != switch_checkerboard) {
                        c.classList.add("check-dark");
                    } else {
                        c.classList.add("check-light");
                    }
                }

                c.style.gridColumn = x + 1;
                c.style.gridRow = y + 1;

                if (this.position_optimisation) {
                    // document.getElementById("game").style.left = "0px";

                    c.style.top = `${y*this.fontsiz}px`;
                    c.style.left = `${x*this.fontsiz*0.5}px`;
                }

                let text = "\u00A0";
                let pipe_points = [
                    0, this.left_menu_size.x - 1,
                    this.left_menu_size.x + this.game_view_size.x, this.total_size.x - 1
                ];

                if (pipe_points.includes(x)) {
                    text = b.v;
                }

                let within_menu = x < this.left_menu_size.x || x >= this.left_menu_size.x + this.game_view_size.x;

                if (within_menu && (y == 0 || y == this.total_size.y - 1)) {
                    if (text == b.v) {
                        // if it is vertical, change to the corresponding box drawing character
                        // tl, tr, bl, br for corners
                        // ml, mr, tm, dm for sides
                        if (x==0) {
                            // left facing corners
                            text = y==0 ? b.tl : b.bl
                        } else if (x==this.total_size.x-1) {
                            // right facing corners
                            text = y==0 ? b.tr : b.br
                        } else {
                            // top or bottom facing sides
                            text = y==0 ? b.tm : b.bm
                        }
                    } else {
                        text = b.h
                    }
                }

                text = "\u00A0";

                c.textContent = text;

                this.current_frame[y].push({txt: text, col: "", back_col: ""});
                this.previous_frame[y].push({txt: text, col: "", back_col: ""});
                
                let flattened_id = (y * siz.x) + x;
                let rdr = this;
                c.addEventListener("mouseover", (event) => {
                    rdr.mouseover(event, flattened_id);
                })

                c.addEventListener("mousedown", (event) => {
                    rdr.mousedown(event, flattened_id);
                })

                c.addEventListener("mouseup", (event) => {
                    rdr.mouseup(event, flattened_id);
                })

                c.addEventListener("click", (event) => {
                    rdr.click(event, flattened_id);
                })

                parent.appendChild(c);
                this.pixel_chars[y].push(c);
            }

            //parent.appendChild(document.createElement("br"));
        }

        this.refresh_left_panel = true;
        this.refresh_right_panel = true;
        
        this.game.needs_main_view_update = true;

        if (this.game.inventory_open) {
            renderer.render_game_checkerboard("black");
        } else {
            renderer.render_game_checkerboard("#222");
        }
    }

    paint_debug_info(display_text, display_col) {
        if (display_text) {
            let col = display_col ? display_col : "#fff";

            for (let i=0; i<display_text.length; i++) {
                this.set_pixel(new Vector2(this.total_size.x - display_text.length - 1 + i, this.total_size.y - 3), display_text[i], col)
            }
        }
    }

    request_new_frame(show_changes, show_fps, clear_debug_info) {
        let num_changes = [0, 0, 0];
        for (let yt=0; yt<this.total_size.y; yt++) {
            for (let xt=0; xt<this.total_size.x; xt++) {
                // check txt, col, back_col. if any differ, update with current_frame.
                // at the same time, set the value of previous_frame to that to bring
                // it up to date
                let current = this.current_frame[yt][xt];
                let prev = this.previous_frame[yt][xt];
                let pix_char = this.pixel_chars[yt][xt];

                if (current.txt != prev.txt) {
                    this.previous_frame[yt][xt].txt = current.txt;
                    pix_char.textContent = current.txt;
                    num_changes[0]++;
                }

                if (current.col != prev.col) {
                    this.previous_frame[yt][xt].col = current.col;
                    pix_char.style.color = current.col;
                    num_changes[1]++;
                }

                if (current.back_col != prev.back_col) {
                    this.previous_frame[yt][xt].back_col = current.back_col;
                    pix_char.style.backgroundColor = current.back_col;
                    num_changes[2]++;
                }
            }
        }

        if (show_changes || show_fps) {
            let change_str = "";

            if (show_changes) {
                change_str = num_changes[0].toString().padStart(4, "\u00A0") + " text" + 
                                num_changes[1].toString().padStart(4, "\u00A0") + " col" + 
                                num_changes[2].toString().padStart(4, "\u00A0") + " bgcol";
            }

            if (show_changes && show_fps) {
                change_str += " | "
            }

            if (show_fps) {
                change_str += "fps: " + (Math.round(show_fps * 100) / 100).toString().padStart(8, "\u00A0")
            }

            for (let i=0; i<change_str.length; i++) {
                this.pixel_chars[this.total_size.y - 2][this.total_size.x - change_str.length - 1 + i].textContent = change_str[i];
            }
        }
        
        if (clear_debug_info) {
            for (let i=0; i<this.right_menu_size.x-2; i++) {
                this.pixel_chars[this.total_size.y - 2][this.total_size.x - this.right_menu_size.x + 1 + i].textContent = " "
            }
        }
    }

    mouseover(event, flattened_id) {
        if (flattened_id == null) {
            return
        }

        this.cur_mouse_flatid = flattened_id;

        let resolved_pos = new Vector2(
            flattened_id % this.total_size.x,
            Math.floor(flattened_id / this.total_size.x)
        )

        if (this.selected_tile) {
            this.last_selected_tiles.push(this.selected_tile);
        }

        this.selected_spell = null;
        this.selected_spell_loc = null;
        this.selected_full_spell = null;

        this.selected_tile = resolved_pos;
        this.selected_panel_id = -1;

        switch (this.get_position_panel(resolved_pos)) {
            case 0:  // left panel
                this.selected_panel_id = 0;

                this.selected_tile = null;
                this.selected_ent = null;
                this.refresh_right_panel = true;
                //console.log("asking for refresh right");
                this.selected_spell = this.selectable_spell_icons[resolved_pos.hash_code()];
                if (this.selected_spell) {
                    this.selected_spell_loc = resolved_pos;
                }

                this.selected_full_spell = this.selectable_spells[resolved_pos.y];
                /*
                if (this.selected_full_spell == undefined) {
                    this.selected_full_spell = this.selectable_spells[resolved_pos.y - 1];
                }

                if (this.selected_full_spell == undefined) {
                    this.selected_full_spell = this.selectable_spells[resolved_pos.y + 1];
                }
                */
                this.inventory_selected_spell_name = undefined;
                this.inventory_selected_spell = undefined
                this.inventory_selected_spell_loc = undefined;
                this.inventory_selected_spell_item = undefined;
                this.inventory_selected_spell_item_loc = undefined;

                break;
            case 1:  // game screen
                this.selected_panel_id = 1;

                // highlight current selected panel
                if (this.game.inventory_open) {
                    // check for mouseover on spells, items and names
                    this.inventory_selected_spell_name = this.inventory_spell_names[resolved_pos.y];

                    this.inventory_selected_spell = this.inventory_spell_origins[resolved_pos.hash_code()];
                    if (this.inventory_selected_spell) {
                        this.inventory_selected_spell_loc = resolved_pos;
                    } else {
                        this.inventory_selected_spell_loc = undefined;
                    }

                    this.inventory_selected_spell_item = this.inventory_items_origins[resolved_pos.hash_code()];
                    if (this.inventory_selected_spell_item) {
                        this.inventory_selected_spell_item_loc = resolved_pos;
                        if (this.game.recent_spells_gained.indexOf(this.inventory_selected_spell_item.inv_id) != -1) {
                            this.game.recent_spells_gained.splice(this.game.recent_spells_gained.indexOf(this.inventory_selected_spell_item.inv_id), 1);
                        }
                    } else {
                        this.inventory_selected_spell_item_loc = undefined;
                    }

                    if (this.inventory_delete_spell_position) {
                        if (resolved_pos.equals(this.inventory_delete_spell_position) || resolved_pos.add(new Vector2(1, 0)).equals(this.inventory_delete_spell_position)) {
                            this.inventory_delete_spell_selected = true;
                        } else {
                            this.inventory_delete_spell_selected = false;
                        }
                    } else {
                        this.inventory_delete_spell_selected = false;
                    }

                    this.refresh_right_panel = true;
                    //console.log("asking for refresh right");
                } else {
                    if (!this.selected_tile) {
                        this.refresh_right_panel = true;
                        //console.log("asking for refresh right");
                    }
    
                    this.selected_tile = resolved_pos;
    
                    let s_normalised_pos = this.selected_tile.sub(new Vector2(this.left_menu_size.x, 0));
                    s_normalised_pos = new Vector2(Math.floor(s_normalised_pos.x / 2) * 2, Math.floor(s_normalised_pos.y));
    
                    let s_player_screen_pos = this.game_view_size.div(2);
                    let s_screen_diff = s_normalised_pos.sub(s_player_screen_pos);
                    let s_game_diff = new Vector2(s_screen_diff.x / 2, s_screen_diff.y);
    
                    let s_game_pos = this.game.player_ent.position.add(s_game_diff);
                    
                    let new_ent = this.game.board.get_pos(s_game_pos);
                    let old_ent_id = this.selected_ent ? this.selected_ent.id : null;
                    let new_ent_id = new_ent ? new_ent.id : null;
    
                    if (old_ent_id != new_ent_id) {
                        this.refresh_right_panel = true;
                        //console.log("asking for refresh right");
                    }
                    
                    this.selected_ent = new_ent;
                }

                break;
            case 2:  // right panel
                this.selected_panel_id = 2;
                this.selected_tile = null;
                this.selected_ent = null;

                break;

            case 3:  // messagebox
                this.selected_panel_id = 3;
                this.selected_tile = null;
                this.selected_ent = null;

                let button_result = this.messagebox_open.registered_option_positions[resolved_pos.hash_code()];
                if (button_result) {
                    this.selected_messagebox_option_nr = button_result[0];
                    this.selected_messagebox_option_fn = button_result[1];
                } else {
                    this.selected_messagebox_option_nr = null;
                    this.selected_messagebox_option_fn = null;
                }
                break;
        }
    }

    move_particles(delta) {
        // this.active_particles[pos.y][pos.x / 2] = particle;
        // this.particle_list.push([particle, pos]);

        let new_particle_list = [];
        for (let i=0; i<this.particle_list.length; i++) {
            let p = this.particle_list[i];
            this.active_particles[p[1].y][p[1].x / 2] = null;
        }

        for (let i=0; i<this.particle_list.length; i++) {
            let p = this.particle_list[i];
            let new_pos = p[1].add(new Vector2(delta.x * 2, delta.y));

            if (new_pos.x >= 0 && new_pos.x < this.game_view_size.x && new_pos.y >= 0 && new_pos.y < this.game_view_size.y) {
                this.active_particles[new_pos.y][new_pos.x / 2] = p[0];
                new_particle_list.push([p[0], new_pos]);
            }
        }

        //console.log(this.particle_list, new_particle_list)
        this.particle_list = new_particle_list;
    }

    mousedown(event, flattened_id) {
        if (event.button != 0) {
            return
        }

        if (flattened_id == null) {
            return
        }

        // always pass this through
        // console.log("mousedown: blocking", Math.round((flattened_id-1) / 2))
        this.mousedown_selected_tile = Math.round((flattened_id-1) / 2)
        this.mousedownup(event, flattened_id);
    }

    mouseup(event, flattened_id) {
        if (event.button != 0) {
            return
        }

        if (flattened_id == null) {
            return
        }

        // only pass this through if the selected tile changed since the mousedown
        // console.log("mouseup: checking", Math.round((flattened_id-1) / 2), "with block", this.mousedown_selected_tile)
        if (this.mousedown_selected_tile != Math.round((flattened_id-1) / 2)) {
            this.mousedownup(event, flattened_id);
        }
    }

    mousedownup(event, flattened_id) {
        if (event.button != 0) {
            return
        }

        if (flattened_id == null) {
            return
        }

        let resolved_pos = new Vector2(
            flattened_id % this.total_size.x,
            Math.floor(flattened_id / this.total_size.x)
        )

        switch (this.get_position_panel(resolved_pos)) {
            case 1:
                if (this.game.inventory_open) {
                    let added_name = false;
                    let did_something_with_spells = false;

                    if (this.inventory_selected_spell_name != undefined) {
                        /*
                        if (this.inventory_editing_spell_name == this.inventory_selected_spell_name) {
                            this.inventory_editing_spell_name = null;
                        } else {
                            this.inventory_editing_spell_name = this.inventory_selected_spell_name;
                            added_name = true;
                        }

                        this.inventory_editing_spell_frag = null;
                        */
                    } else if (this.inventory_selected_spell != undefined) {
                        if (this.inventory_editing_spell_frag) {
                            let ss = this.inventory_selected_spell;
                            let es = this.inventory_editing_spell_frag;
                            if (ss.frag_id == es.frag_id && ss.spell_id == es.spell_id) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(ss, es);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                                did_something_with_spells = true;
                            }
                        } else {
                            let ss = this.inventory_selected_spell;
                            this.inventory_editing_spell_frag = {spell: ss.spell, frag_id: ss.frag_id, spell_id: ss.spell_id};
                            this.inventory_editing_spell_name = null;
                            did_something_with_spells = true;
                        }
                    } else if (this.inventory_selected_spell_item != undefined) {
                        if (this.inventory_editing_spell_frag) {
                            let si = this.inventory_selected_spell_item;
                            let ei = this.inventory_editing_spell_frag;
                            if (si.inv_id == ei.inv_id) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(si, ei);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell_item = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                                did_something_with_spells = true;
                            }
                        } else {
                            let si = this.inventory_selected_spell_item;
                            this.inventory_editing_spell_frag = {spell: si.spell, inv_id: si.inv_id};
                            this.inventory_editing_spell_name = null;
                            did_something_with_spells = true;
                        }
                    } else if (this.inventory_delete_spell_selected) {
                        if (this.inventory_editing_spell_frag) {
                            let si = {spell: null, trash: true};
                            let ei = this.inventory_editing_spell_frag;
                            if (si.trash && ei.trash) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(si, ei);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell_item = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                                did_something_with_spells = true;
                            }
                        } else {
                            this.inventory_editing_spell_frag = {spell: null, trash: true};
                            did_something_with_spells = true;
                        }
                    }

                    if (!did_something_with_spells) {
                        this.inventory_editing_spell_frag = null;
                    }

                    /*
                    if (!added_name) {
                        this.inventory_editing_spell_name = null;
                    }
                    */

                    this.refresh_right_panel = true;
                    //console.log("asking for refresh right");
                }

                break;
        }
    }

    click(event, flattened_id) {
        if (event.button != 0) {
            return
        }

        if (flattened_id == null) {
            return
        }

        let resolved_pos = new Vector2(
            flattened_id % this.total_size.x,
            Math.floor(flattened_id / this.total_size.x)
        )

        // convert to coords just on game space (- left tile x)
        // find screen difference between clicked tile and player tile
        // (player tile is always in the center, so half the x and y of game viewport)
        // convert that into game difference (x/2)
        // apply to player game position
        // we have our game position
        switch (this.get_position_panel(resolved_pos)) {
            case 0:
                this.inventory_editing_spell_name = null;
                if (this.selected_full_spell != null) {
                    game.select_player_spell(this.selected_full_spell);
                } else {
                    this.game.deselect_player_spell();
                }
                break;

            case 1:
                if (this.game.inventory_open) {
                    let added_name = false;
                    if (this.inventory_selected_spell_name != undefined) {
                        if (this.inventory_editing_spell_name == this.inventory_selected_spell_name) {
                            this.inventory_editing_spell_name = null;
                        } else {
                            this.inventory_editing_spell_name = this.inventory_selected_spell_name;
                            added_name = true;
                        }

                        this.inventory_editing_spell_frag = null;
                    }

                    if (!added_name) {
                        this.inventory_editing_spell_name = null;
                    }
                    /*
                    let added_name = false;
                    if (this.inventory_selected_spell_name != undefined) {
                        if (this.inventory_editing_spell_name == this.inventory_selected_spell_name) {
                            this.inventory_editing_spell_name = null;
                        } else {
                            this.inventory_editing_spell_name = this.inventory_selected_spell_name;
                            added_name = true;
                        }

                        this.inventory_editing_spell_frag = null;
                    } else if (this.inventory_selected_spell != undefined) {
                        if (this.inventory_editing_spell_frag) {
                            let ss = this.inventory_selected_spell;
                            let es = this.inventory_editing_spell_frag;
                            if (ss.frag_id == es.frag_id && ss.spell_id == es.spell_id) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(ss, es);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                            }
                        } else {
                            let ss = this.inventory_selected_spell;
                            this.inventory_editing_spell_frag = {spell: ss.spell, frag_id: ss.frag_id, spell_id: ss.spell_id};
                            this.inventory_editing_spell_name = null;
                        }
                    } else if (this.inventory_selected_spell_item != undefined) {
                        if (this.inventory_editing_spell_frag) {
                            let si = this.inventory_selected_spell_item;
                            let ei = this.inventory_editing_spell_frag;
                            if (si.inv_id == ei.inv_id) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(si, ei);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell_item = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                            }
                        } else {
                            let si = this.inventory_selected_spell_item;
                            this.inventory_editing_spell_frag = {spell: si.spell, inv_id: si.inv_id};
                            this.inventory_editing_spell_name = null;
                        }
                    } else if (this.inventory_delete_spell_selected) {
                        if (this.inventory_editing_spell_frag) {
                            let si = {spell: null, trash: true};
                            let ei = this.inventory_editing_spell_frag;
                            if (si.trash && ei.trash) {
                                // same thing twice, so deselect
                                this.inventory_editing_spell_frag = null;
                            } else {
                                // different, so tell game to swap them
                                this.game.player_swap_spells(si, ei);
                                this.inventory_editing_spell_frag = null;
                                //this.inventory_selected_spell_item = undefined;
                                this.render_inventory_menu();
                                this.mouseover(null, flattened_id);
                            }
                        } else {
                            this.inventory_editing_spell_frag = {spell: null, trash: true};
                        }
                    }

                    if (!added_name) {
                        this.inventory_editing_spell_name = null;
                    }

                    this.refresh_right_panel = true;
                    //console.log("asking for refresh right");
                    */
                } else {
                    let turncount = game.turncount;

                    if (game.is_player_turn()) {
                        let normalised_pos = resolved_pos.sub(new Vector2(this.left_menu_size.x, 0));
                        normalised_pos = new Vector2(Math.floor(normalised_pos.x / 2) * 2, Math.floor(normalised_pos.y));
            
                        let player_screen_pos = this.game_view_size.div(2);
                        let screen_diff = normalised_pos.sub(player_screen_pos);
                        let game_diff = new Vector2(screen_diff.x / 2, screen_diff.y);
            
                        let game_pos = game.player_ent.position.add(game_diff);
            
                        if (game.selected_player_primed_spell) {
                            game.player_cast_selected(game_pos);
                        } else {
                            // try to move towards the tile - use line again.
                            let path = pathfind(game.player_ent.position, game_pos);
            
                            if (path && path.length > 1) {
                                let result = game.move_player(path[1]);
                                
                                if (result) {
                                    //this.move_particles(path[1].sub(game.player_ent.position).neg());
                                }
            
                                game.end_turn(game.player_ent, turncount);
                            } else if (game_pos.equals(game.player_ent.position)) {
                                game.end_turn(game.player_ent, turncount);
                            }
                        }
                    }
                }

                break;
            case 2:
                this.game.deselect_player_spell();
                this.inventory_editing_spell_name = null;
                break;

            case 3:  // messagebox
                if (this.selected_messagebox_option_fn) {
                    let fn_to_run = this.selected_messagebox_option_fn;
                    let old_msgbox = this.messagebox_open;

                    this.cleanup_messageboxes();

                    this.selected_messagebox_option_nr = null;
                    this.selected_messagebox_option_fn = null;

                    let response = fn_to_run();

                    if (response) {
                        this.add_messagebox(
                            MessageBoxTemplate.basic_infobox(
                                response.title ? response.title : old_msgbox.title,
                                response.text ? response.text : old_msgbox.text,
                                response.confirm_opt_text ? response.confirm_opt_text : null,
                                response.confirm_opt_col ? response.confirm_opt_col : null,
                                response.on_open ? response.on_open : null,
                                response.custom_highlight_col ? response.custom_highlight_col : null
                            ),
                            true
                        )
                    }

                    this.check_messagebox_queue();
                }
                break;
        }
    }

    add_particle(pos, particle) {
        if (pos.x < 0 || pos.x >= this.game_view_size.x || pos.y < 0 || pos.y >= this.game_view_size.y) {
            //console.log(pos, "out of bounds for particle; bounds:", this.game_view_size);
            return;
        }

        if (this.get_particle(pos.add(new Vector2(this.left_menu_size.x, 0)))) {
            this.remove_particle(pos);
        }

        this.active_particles[pos.y][pos.x / 2] = particle;
        this.particle_list.push([particle, pos]);
    }

    put_particle_from_game_loc(pos, particle) {
        // convert game into viewport space.
        // this isn't actually the simplest thing in the world
        // get the difference vector in game coords between the particle and the player
        let game_dist_diff = pos.sub(this.game.player_ent.position);

        // convert into screen space (multiply by 2)
        let screen_diff = new Vector2(game_dist_diff.x * 2, game_dist_diff.y);

        // screen position of player is always centered so:
        let player_screen_pos = this.game_view_size.div(2);

        // sum
        let particle_pos = screen_diff.add(player_screen_pos);

        //console.log("putting particle. game", pos, "screen", particle_pos);
        this.add_particle(particle_pos, particle);
    }

    get_particle(pos) {
        let particle_pos = new Vector2(pos.x - this.left_menu_size.x, pos.y);
        return this.active_particles[particle_pos.y][particle_pos.x / 2];
    }

    remove_particle(pos) {
        this.active_particles[pos.y][pos.x / 2] = null;
    }

    is_valid_render_pos(pos) {
        return pos.x >= 0 &&
               pos.x < this.total_size.x &&
               pos.y >= 0 &&
               pos.y < this.total_size.y;
    }

    set_back(pos, col) {
        if (!this.is_valid_render_pos(pos)) {
            return;
        }

        this.current_frame[pos.y][pos.x].back_col = col;

        /* old version before moving to a discrete frame-based method
        let p = this.pixel_chars[pos.y][pos.x];
        p.style.backgroundColor = col;
        */
    }

    set_back_pair(pos, col) {
        this.set_back(pos, col);

        let add_vec = pos.x % 2 == 0 ? new Vector2(1, 0) : new Vector2(-1, 0);
        this.set_back(pos.add(add_vec), col);
    }

    set_back_set(from, to, col) {
        for (let x=from.x; x<=to.x; x++) {
            for (let y=from.y; y<=to.y; y++) {
                this.set_back(new Vector2(x, y), col);
            }
        }
    }

    set_pixel(pos, char, col) {
        if (!this.is_valid_render_pos(pos)) {
            return;
        }

        if (char) {
            this.current_frame[pos.y][pos.x].txt = char;
        }

        if (col) {
            this.current_frame[pos.y][pos.x].col = col;
        }

        /* old version before moving to a discrete frame-based method
        let p = this.pixel_chars[pos.y][pos.x];
        p.textContent = char;

        if (col) {
            p.style.color = col;
        }
        */
    }

    set_pixel_pair(pos, chars, col) {
        this.set_pixel(pos, chars[0], col);

        let add_vec = pos.x % 2 == 0 ? new Vector2(1, 0) : new Vector2(-1, 0);
        this.set_pixel(pos.add(add_vec), chars[1], col);
    }

    wrap(s, w) {
        let lines = [];
        let cur_line = "";
        let cur_word = "";
        let string_len = 0;
        let word_len = 0;

        let in_code = false;

        for (let i=0; i<s.length; i++) {
            let char = s[i];
            if (in_code) {
                if (char == "]") {
                    in_code = false;
                }
            } else {
                if (char == "[" && (i == s.length - 1 || s[i+1] != "]")) {
                    in_code = true;
                } else {
                    if (char != "\n") {
                        if (char == " ") {
                            cur_line += cur_word + " ";
                            cur_word = "";
                            word_len = -1;
                        }

                        string_len++;
                        word_len++;
                    }
                }
            }

            if (string_len >= w || char == "\n") {
                if (char == "\n" && !(string_len > w)) {
                    cur_line += cur_word + " ";
                    cur_word = "";
                    word_len = 0;
                }

                lines.push(cur_line.trim());
                cur_line = "";
                string_len = word_len;
            }

            if (char != " " && char != "\n") {
                cur_word += char;
            }
        }

        cur_line += cur_word;
        if (cur_line.length > 0) {
            lines.push(cur_line)
        }

        return lines.join("\n");
    }
    
    code_string_len(s) {
        // Assumes no newlines
        let string_len = 0;
        let in_code = false;
        for (let i=0; i<s.length; i++) {
            let char = s[i];
            if (in_code) {
                if (char == "]") {
                    in_code = false;
                }
            } else {
                if (char == "[" && (i == s.length - 1 || s[i+1] != "]")) {
                    in_code = true;
                } else {
                    string_len++;
                }
            }
        }
    
        return string_len
    }

    set_pixel_text(pos, text, start_col, clearance_x, force_col) {
        let col = start_col;
        let reading_new_col = false;
        let col_read = "";
        let cur_pos = pos.copy();
        let wraps = 0;

        let wrapped_text = clearance_x ? this.wrap(text, clearance_x) : text;
        //console.log(text);
        //console.log(wrapped_text);

        for (let i=0; i<wrapped_text.length; i++) {
            let char = wrapped_text[i];
            if (reading_new_col) {
                if (char == "]") {
                    if (col_read == "newline") {
                        wraps++;
                        cur_pos = new Vector2(pos.x, cur_pos.y + 1);
                        if (cur_pos.y >= this.total_size.y) {
                            return wraps;  // out of bounds
                        }
                    } else {
                        col = col_read == "clear" ? this.default_text_col : col_read;
                    }

                    col_read = "";
                    reading_new_col = false;
                } else {
                    col_read += char;
                }
            } else {
                if (char == "[" && (i == wrapped_text.length - 1 || wrapped_text[i+1] != "]")) {
                    reading_new_col = true;
                } else {
                    char = char.replace("«", "[").replace("»", "]");

                    if (char != "\n") {
                        this.set_pixel(cur_pos, char, force_col ? force_col : col);
                        cur_pos = cur_pos.add(new Vector2(1, 0));
                    }

                    // line wrap if needed, keep margin from the starting pos
                    if (cur_pos.x >= this.total_size.x - 2 || char == "\n") {
                        wraps++;
                        cur_pos = new Vector2(pos.x, cur_pos.y + 1);
                        if (cur_pos.y >= this.total_size.y) {
                            return wraps;  // out of bounds
                        }
                    }
                }
            }
        }

        if (col_read || reading_new_col) {
            this.set_pixel(cur_pos, "[", "#fff");
            let fmt_codecol = col_read.replace("_", "").trim()
            let code_col = CSS.supports("color", fmt_codecol) ? fmt_codecol : "#fff"
            this.set_pixel_text(cur_pos.add(new Vector2(1, 0)), col_read, start_col, clearance_x, code_col);
        }

        return wraps;
    } 

    advance_particles() {
        let new_particle_list = [];
        let sthis = this;
        this.particle_list.forEach(particle => {
            // check if particle isn't orphaned (exists in list but not present in board)
            if (this.get_particle(particle[1].add(new Vector2(this.left_menu_size.x, 0))).id == particle[0].id) {
                if (particle[0].advance(this.particle_speed)) {
                    new_particle_list.push(particle);
                } else {
                    sthis.remove_particle(particle[1]);
                }
            }
        });

        this.particle_list = new_particle_list;
    }

    pad_str(s, len, pad_type) {
        let string_len = 0;
        let in_code = false;
        for (let i=0; i<s.length; i++) {
            let char = s[i];
            if (in_code) {
                if (char == "]") {
                    in_code = false;
                }
            } else {
                if (char == "[" && (i == s.length - 1 || s[i+1] != "]")) {
                    in_code = true;
                } else {
                    string_len++;
                }
            }
        }

        if (!pad_type) {
            return s + "\u00A0".repeat(Math.max(0, len - string_len));
        } else if (pad_type == 1) {
            return "\u00A0".repeat(Math.max(0, len - string_len)) + s;
        } else if (pad_type == 2) {
            let hlen = Math.max(0, len - string_len) / 2;
            return "\u00A0".repeat(Math.ceil(hlen)) + s + "\u00A0".repeat(Math.floor(hlen));
        } else if (pad_type == 3) {
            let hlen = Math.max(0, len - string_len) / 2;
            return "\u00A0".repeat(Math.floor(hlen)) + s + "\u00A0".repeat(Math.ceil(hlen));
        }
    }

    render_left_panel() {
        this.selectable_spell_icons = {};

        let left_mount_pos = new Vector2(
            2, 1
        );

        let clearance_x = this.left_menu_size.x - 4;

        if (this.refresh_left_panel) {
            for (let y=1; y<this.left_menu_size.y-2; y++) {
                this.set_pixel_text(left_mount_pos.add(new Vector2(0, y)), "\u00A0".repeat(clearance_x), null);
            }

            this.set_back_set(left_mount_pos, left_mount_pos.add(this.left_menu_size).sub(new Vector2(4, 2)), "black")
            this.refresh_left_panel = false;
        }

        let p = this.game.player_ent;

        // hp/mp/level
        let sp_str = game.player_skill_points > 0 ? ` [#f0f](+${game.player_skill_points})   ` : "              ";
        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 0)),
            this.pad_str(`[clear]Player LV [#8ff]${game.player_level}[clear]${sp_str}`, 4+1+4+3)
        )

        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 1)),
            this.pad_str(`[red]${p.hp}/${p.max_hp}[clear] HP`, 7+1+7+3)
        )

        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 2)),
            this.pad_str(`[cyan]${p.mp}/${p.max_mp}[clear] MP`, 7+1+7+3)
        )

        // affinities
        for (let i=0; i<Math.max(3, p.affinities.length); i++) {
            let st = "";
            if (p.affinities[i]) {
                st = `[${affinity_cols[p.affinities[i]]}]${p.affinities[i]}`
            }

            this.set_pixel_text(
                left_mount_pos.add(new Vector2(clearance_x - 10, i)),
                this.pad_str(st, 10)
            )
        }

        // xp and bar
        let xp_mount_pos = left_mount_pos.add(new Vector2(0, 4));
        let bar_len = clearance_x - 2; // for affinities
        let pct = game.player_xp / game.get_xp_for_levelup(game.player_level);
        let pips = Math.max(0, Math.floor(bar_len * pct));

        let bar_string = `[#8ff]«${"#".repeat(pips)}${"-".repeat(bar_len - pips)}»[clear]`;
        this.set_pixel_text(
            xp_mount_pos,
            this.pad_str(bar_string, clearance_x)
        );

        this.set_pixel_text(
            xp_mount_pos.add(new Vector2(0, 1)),
            this.pad_str(`[#8ff]${game.player_xp}/${game.get_xp_for_levelup(game.player_level)}[clear] XP`, bar_len + 2, 2)
        );

        this.selectable_spells = {};

        // spells
        let current_spell_point = xp_mount_pos.add(new Vector2(0, 4));
        for (let i=0; i<game.player_spells.length; i++) {
            let spells = game.player_spells[i].spells;
            let parsed = game.player_ent.parse_spell(spells, new Vector2(0, 0));
            let name = game.player_spells[i].name;
            
            let affordable = parsed.manacost <= p.mp;
            let cols = [
                affordable ? "white" : "#666",
                affordable ? "white" : "#666",
                affordable ? "cyan" : "#800",
            ]

            this.set_pixel_text(
                current_spell_point,
                this.pad_str(`[${cols[0]}](${i+1}) [${cols[1]}]${name}`, clearance_x - 8)
            );

            this.set_pixel_text(
                current_spell_point.add(new Vector2(clearance_x - 9, 0)),
                this.pad_str(`[${cols[2]}]${parsed.manacost} MP`, 8, 1)
            );

            if (game.selected_id == i) {
                this.set_back_set(current_spell_point, current_spell_point.add(new Vector2(clearance_x-1, 0)), "#666");
            } else if (this.selected_full_spell == i) {
                this.set_back_set(current_spell_point, current_spell_point.add(new Vector2(clearance_x-1, 0)), "#333");
            } else {
                this.set_back_set(current_spell_point, current_spell_point.add(new Vector2(clearance_x-1, 0)), "#000");
            }

            this.selectable_spells[current_spell_point.y] = i;

            current_spell_point = current_spell_point.add(new Vector2(0, 1));

            // show all the icons
            let spell_str = "";
            let num_spells = 0;
            for (let j=0; j<game.player_max_spell_shards; j++) {
                let spell = j < spells.length ? spells[j] : null;

                if (num_spells * 3 >= clearance_x - 11) {
                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(spell_str, clearance_x)
                    );

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));
                    spell_str = "";
                    num_spells = 0;
                }

                if (spell) {
                    let icon = spell.icon;
                    let col = spell.col;
                    let back_col = spell.back_col;
                    if (this.selected_spell && this.selected_spell.id == spell.id) {
                        if (this.selected_spell_loc.equals(current_spell_point.add(new Vector2(num_spells * 3, 0))) || this.selected_spell_loc.equals(current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)))) { 
                            back_col = "white";
                        } else {
                            back_col = "#aaa";
                        }
                        col = "black";
                    }

                    spell_str += `[${col}]${icon} `;
                    this.set_back_set(
                        current_spell_point.add(new Vector2(num_spells * 3, 0)),
                        current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                        back_col
                    )

                    this.selectable_spell_icons[current_spell_point.add(new Vector2(num_spells * 3, 0)).hash_code()] = spell;
                    this.selectable_spell_icons[current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)).hash_code()] = spell;
                } else {
                    this.set_back_set(
                        current_spell_point.add(new Vector2(num_spells * 3, 0)),
                        current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                        "black"
                    )

                    spell_str += `\u00A0\u00A0 `;
                }

                num_spells++;
            }

            this.set_pixel_text(
                current_spell_point,
                this.pad_str(spell_str, clearance_x)
            );

            current_spell_point = current_spell_point.add(new Vector2(0, 2));
        }

        let bottom_anchor = new Vector2(left_mount_pos.x, this.left_menu_size.y - 2);
        this.set_pixel_text(
            bottom_anchor,
            this.pad_str(`[${game.inventory_open ? "cyan" : "#fff"}]Inventory (R) { this is temporary lol }`, clearance_x-1, 0)
        );
    }

    render_right_panel() {
        /*
        - right panel; when mouseover enemy on screen, show their:
        - name
        - hp
        - mp
        - affinities
        - spells:
            - for each innate spell, show list of components on one side
            - and calculated stats on the other
            - don't forget cooldown (it's outside the primed spell area)
        */
        let right_mount_pos = new Vector2(
            this.left_menu_size.x + this.game_view_size.x + 2, 1
        );

        let clearance_x = this.right_menu_size.x - 4;

        if (this.refresh_right_panel) {
            let string_len = (this.right_menu_size.x - 4) * (this.right_menu_size.y - 2);
            this.set_pixel_text(right_mount_pos, "\u00A0".repeat(string_len), null);
            this.set_back_set(right_mount_pos, right_mount_pos.add(this.right_menu_size).sub(new Vector2(4, 2)), "black")
        
            this.refresh_right_panel = false;

            if (this.selected_ent && !this.selected_ent.untargetable) {
                let ent = this.selected_ent;
                this.last_selected_ent = ent;

                // name and icon
                this.set_pixel_text(
                    right_mount_pos,
                    this.pad_str(`[white]${ent.name}`, clearance_x),
                    "white"
                );

                this.set_pixel_text(
                    right_mount_pos.add(new Vector2(clearance_x - 2, 0)),
                    `[${ent.col}]${ent.icon}`,
                    null
                )

                this.set_pixel_text(
                    right_mount_pos.add(new Vector2(0, 1)),
                    "\u00A0".repeat(clearance_x * 3),
                    null
                );

                // desc
                let wraps = this.set_pixel_text(
                    right_mount_pos.add(new Vector2(0, 1)),
                    `[#aaa]${ent.desc}`,
                    null, clearance_x - 1
                )

                let stats_mount_point = right_mount_pos.add(new Vector2(0, 6));

                // hp and mp
                this.set_pixel_text(
                    stats_mount_point,
                    this.pad_str(`[red]${ent.hp}/${ent.max_hp}[clear] HP`, 4+1+4+3) // hp 4 digits twice, / (1), " HP" (3)
                )

                this.set_pixel_text(
                    stats_mount_point.add(new Vector2(0, 1)),
                    this.pad_str(`[cyan]${ent.mp}/${ent.max_mp}[clear] MP`, 4+1+4+3)
                )

                // affinities
                for (let i=0; i<ent.affinities.length; i++) {
                    this.set_pixel_text(
                        stats_mount_point.add(new Vector2(clearance_x - 10, i)),
                        this.pad_str(`[${affinity_cols[ent.affinities[i]]}]${ent.affinities[i]}`, 10) // longest affinity is 10 i hope
                    )
                }

                // weaknesses
                let dmgtypes = Object.keys(DmgType);
                let affinity_pos = stats_mount_point.add(new Vector2(clearance_x - 16, this.total_size.y - 18));

                this.set_pixel_text(
                    affinity_pos.sub(new Vector2(0, 2)),
                    this.pad_str(`[clear]Weak / Resist:`, 16)
                )

                for (let i=0; i<dmgtypes.length; i++) {
                    let dmgtype = dmgtypes[i];
                    let dmg_mult = ent.get_damage_mult(dmgtype);
                    dmg_mult = Math.round(dmg_mult * 100) / 100;

                    let col = `rgb(${Math.max(0, Math.min(255, (dmg_mult) * 256))}, ${Math.max(0, Math.min(255, (-dmg_mult+2) * 256))}, 0)`

                    if (true) {
                        this.set_pixel_text(
                            affinity_pos,
                            this.pad_str(`[${col}]${this.pad_str(dmg_mult + "x", 5, true)} [${damage_type_cols[dmgtype]}]${dmgtype}`, 16)
                        )
                    } else {
                        this.set_pixel_text(
                            affinity_pos,
                            this.pad_str(``, 16)
                        )
                    }

                    affinity_pos = affinity_pos.add(new Vector2(0, 1));
                }

                // spells
                // for each spell, show the spell list
                let current_spell_point = stats_mount_point.add(new Vector2(0, 3));
                for (let i=0; i<ent.innate_spells.length; i++) {
                    let spells = ent.innate_spells[i][0];
                    let cooldown = ent.innate_spells[i][1];
                    let name = ent.innate_spells[i][2];
                    let col = ent.innate_spells[i][3];

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`[${col}]${name}`, clearance_x - 18)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    let spell_str = "";
                    let num_spells = 0;
                    spells.forEach(spell => {
                        if (num_spells * 3 >= clearance_x - 18) {
                            this.set_pixel_text(
                                current_spell_point,
                                this.pad_str(spell_str, clearance_x)
                            );

                            current_spell_point = current_spell_point.add(new Vector2(0, 1));
                            spell_str = "";
                            num_spells = 0;
                        }

                        let icon = spell.icon;
                        let col = spell.col;
                        let back_col = spell.back_col;

                        spell_str += `[${col}]${icon} `;
                        this.set_back_set(
                            current_spell_point.add(new Vector2(num_spells * 3, 0)),
                            current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                            back_col
                        )

                        num_spells++;
                    })

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(spell_str, clearance_x)
                    );

                    current_spell_point = current_spell_point.add(new Vector2(0, 2));

                    let pstats = ent.innate_primed_spells[i][0].root_spell.stats;
                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`[#4df]${pstats.damage} [${damage_type_cols[pstats.damage_type]}]${pstats.damage_type}[clear] damage`, clearance_x - 18)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`[#4df]${pstats.range}[clear] range`, clearance_x - 18)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`[#4df]${ent.innate_primed_spells[i][0].manacost}[clear] MP cost`, clearance_x - 18)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`[#4df]${cooldown}[clear] turn cooldown`, clearance_x - 18)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    let current_cd = ent.innate_primed_spells[i][1]
                    if (current_cd > 0) {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`(${current_cd} turn${current_cd == 1 ? "" : "s"} left)`, clearance_x - 18)
                        )
                    } else {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str("", clearance_x - 18)
                        )
                    }

                    current_spell_point = current_spell_point.add(new Vector2(0, 3));
                }
            } else if (this.selected_ent) {
                this.set_pixel_text(
                    right_mount_pos,
                    this.pad_str(`[white]${this.selected_ent.name}`, clearance_x),
                    null
                );
            } else if (this.selected_spell || this.inventory_selected_spell || this.inventory_selected_spell_item || this.inventory_editing_spell_frag) {
                // show spell information here instead.
                let s = null;
                if (this.selected_spell) {
                    s = this.selected_spell;
                } else if (this.inventory_selected_spell && this.inventory_selected_spell.spell) {
                    s = this.inventory_selected_spell.spell;
                } else if (this.inventory_selected_spell_item && this.inventory_selected_spell_item.spell) {
                    s = this.inventory_selected_spell_item.spell;
                } else if (this.inventory_editing_spell_frag && this.inventory_editing_spell_frag.spell) {
                    s = this.inventory_editing_spell_frag.spell;
                }

                if (!s) {
                    this.set_pixel_text(
                        right_mount_pos,
                        this.pad_str(`Empty`, clearance_x - 3),
                        "white"
                    );
                } else {
                    this.set_pixel_text(
                        right_mount_pos,
                        this.pad_str(`[${s.col}]${s.name}`, clearance_x - 3),
                        "white"
                    );
    
                    this.set_back_set(
                        right_mount_pos,
                        right_mount_pos.add(new Vector2(s.name.length - 1, 0)),
                        s.back_col
                    );
    
                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(clearance_x - 2, 0)),
                        this.pad_str(`[${s.col}]${s.icon}`, 3),
                        "white"
                    );
    
                    this.set_back_set(
                        right_mount_pos.add(new Vector2(clearance_x - 2, 0)),
                        right_mount_pos.add(new Vector2(clearance_x - 1, 0)),
                        s.back_col
                    );
    
                    let typ_col = {
                        "Core": "#f00",
                        "Modifier": "#0af" 
                    }[s.typ];
                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 2)),
                        this.pad_str(`[${typ_col}]${s.typ}`, 3),
                        "white"
                    );
    
                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 4)),
                        this.pad_str(s.desc, clearance_x),
                        "white",
                        clearance_x - 2
                    );
                }
            } else if (this.selected_full_spell != undefined || this.game.selected_id != -1 || this.inventory_selected_spell_name != undefined || this.inventory_editing_spell_name != undefined) {
                let current_spell_point = right_mount_pos;

                let id = 0;
                if (this.selected_full_spell != undefined) {
                    id = this.selected_full_spell;
                } else if (this.game.selected_id != -1) {
                    id = this.game.selected_id;
                } else if (this.inventory_selected_spell_name != undefined) {
                    id = this.inventory_selected_spell_name;
                } else if (this.inventory_editing_spell_name != undefined) {
                    id = this.inventory_editing_spell_name;
                }

                //id = this.selected_full_spell != undefined ? this.selected_full_spell : this.game.selected_id;

                let name = game.player_spells[id].name;

                let spell_parse = game.player_ent.parse_spell(game.player_spells[id].spells, new Vector2(0, 0));
                let spell = spell_parse.root_spell;
                let pstats = spell.stats;
                let manacost = spell_parse.manacost;

                this.set_pixel_text(
                    current_spell_point,
                    this.pad_str(`[white]${name}`, clearance_x)
                )

                current_spell_point = current_spell_point.add(new Vector2(0, 2));

                this.set_pixel_text(
                    current_spell_point,
                    this.pad_str(`[#4df]${pstats.range}[clear] range`, clearance_x - 18)
                )

                current_spell_point = current_spell_point.add(new Vector2(0, 1));

                this.set_pixel_text(
                    current_spell_point,
                    this.pad_str(`[#4df]${manacost}[clear] MP cost`, clearance_x - 18)
                )

                current_spell_point = current_spell_point.add(new Vector2(0, 2));

                let diving = true;
                let margin = 0;
                while (diving) {
                    let core_spell = spell.spells.find(sp => sp.typ == SpellType.Core);

                    let core_name = null;
                    let core_col = null;

                    if (core_spell) {
                        core_name = core_spell.name;
                        core_col = core_spell.col;
                    } else {
                        core_name = "???";
                        core_col = "#fff";
                    }

                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(`${"\u00A0".repeat(margin)}[${core_col}]${core_name}`, clearance_x)
                    )

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));

                    if (core_name != "???") {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[#4df]${pstats.damage} [${damage_type_cols[pstats.damage_type]}]${pstats.damage_type}[clear] damage`, clearance_x)
                        )

                        current_spell_point = current_spell_point.add(new Vector2(0, 1));

                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[white]Affects tiles in a [#4df]${pstats.shape("whoami")}`, clearance_x)
                        )

                        current_spell_point = current_spell_point.add(new Vector2(0, 1));

                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[white]Effect radius: [#4df]${pstats.radius}`, clearance_x)
                        )
                    } else {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[white]This spell block has no core!`, clearance_x)
                        )
                    }

                    current_spell_point = current_spell_point.add(new Vector2(0, 2));

                    if (spell.trigger && spell.trigger[0] != "none") {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[#4df]${pretty_print_trigger[spell.trigger[0]]}`, clearance_x)
                        )

                        this.set_pixel_text(
                            current_spell_point.add(new Vector2(0, 1)),
                            this.pad_str(`${"\u00A0".repeat(margin)}[white]-->`, clearance_x)
                        )

                        margin += 4;
                        spell = spell.trigger[1];
                        pstats = spell.stats;

                        current_spell_point = current_spell_point.add(new Vector2(0, 2));
                    } else {
                        diving = false;
                    }
                }
            } else if (this.inventory_selected_spell) {
                
            } else if (this.inventory_selected_spell_item) {
                
            } else if (this.inventory_editing_spell_frag) {
                
            } else if (this.inventory_delete_spell_selected) {
                this.set_pixel_text(
                    right_mount_pos,
                    this.pad_str(`[white]Move a fragment here to delete it.[clear]\nThis is [#f00]permanent![clear]`, clearance_x, 0),
                    "white"
                );
            } else {
                // render recorded damage here i suppose? and other stats like wavecount
                // maybe also enemies remaining
                let current_event = game.player_location.events[this.game.player_location_progress];
                let cur_evt_string = `[${event_type_to_colour[current_event]}]${current_event}`

                if (this.game.wavecount <= 0) {
                    this.set_pixel_text(
                        right_mount_pos,
                        this.pad_str(``, clearance_x, 2),
                        "white"
                    );

                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 2)),
                        this.pad_str(``, clearance_x),
                        null
                    );

                    // location information and progress
                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 4)),
                        this.pad_str(``, clearance_x-1, 2),
                        null
                    );

                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 6)),
                        this.pad_str(``, clearance_x, 2),
                        null
                    );
                } else {
                    this.set_pixel_text(
                        right_mount_pos,
                        this.pad_str(`[white]- Shard [${game.player_location.col}]${game.location_count+1}[clear] | Area [${event_type_to_colour[current_event]}]${game.player_location_progress+1}[clear] -`, clearance_x, 2),
                        "white"
                    );

                    if (Object.keys(game.wave_entities).length > 0) {
                        this.set_pixel_text(
                            right_mount_pos.add(new Vector2(0, 2)),
                            this.pad_str(`[white]Enemies remaining: [#f80]${Object.keys(game.wave_entities).length}[clear]`, clearance_x),
                            null
                        );
                    } else {
                        this.set_pixel_text(
                            right_mount_pos.add(new Vector2(0, 2)),
                            this.pad_str(`[#0f0]Wave completed![clear]`, clearance_x),
                            null
                        );
                    }

                    // location information and progress
                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 4)),
                        this.pad_str(`[${game.player_location.col}]${game.player_location.name}[#fff] (${cur_evt_string}[#fff])`, clearance_x-1, 2),
                        null
                    );

                    let path_str = this.make_location_path_string(game, clearance_x);

                    this.set_pixel_text(
                        right_mount_pos.add(new Vector2(0, 6)),
                        this.pad_str(`[#fff]${path_str}`, clearance_x, 2),
                        null
                    );
                }

                // desc
                let text_pos = right_mount_pos.add(new Vector2(0, 9));
                this.set_pixel_text(
                    text_pos,
                    this.pad_str(this.game.wavecount <= 0 ? `` : `  [white]Damage dealt | This wave  | Total`, clearance_x),
                    "white"
                );

                let player_record_key = this.game.player_ent.id + "|" + this.game.player_ent.name;
                Object.keys(DmgType).forEach(typ => {
                    text_pos = text_pos.add(new Vector2(0, 1));
                    let dmg_amt_wave = 0;
                    let dmg_amt_total = 0;
                    if (this.game.recorded_damage[player_record_key] && this.game.recorded_damage[player_record_key][typ]) {
                        dmg_amt_total = this.game.recorded_damage[player_record_key][typ];
                    }

                    if (this.game.current_wave_damage[player_record_key] && this.game.current_wave_damage[player_record_key][typ]) {
                        dmg_amt_wave = this.game.current_wave_damage[player_record_key][typ];
                    }

                    dmg_amt_wave = dmg_amt_wave.toString().padEnd(10);
                    dmg_amt_total = dmg_amt_total.toString().padEnd(10);

                    this.set_pixel_text(
                        text_pos,
                        this.pad_str(this.game.wavecount <= 0 ? `` : `  [${damage_type_cols[typ]}]${typ.padEnd(12)}[white] |[#0cf] ${dmg_amt_wave}[white] |[#0cf] ${dmg_amt_total}[clear]`, clearance_x),
                        "white"
                    );
                })

                let emblems_pos = text_pos.add(new Vector2(0, 3));
                if (this.game.player_emblems.length > 0) {
                    this.set_pixel_text(
                        emblems_pos,
                        this.pad_str(`[#fff]Emblems ([#0f0]${this.game.player_emblems.length}[clear])`, clearance_x),
                        null
                    );

                    emblems_pos = emblems_pos.add(new Vector2(0, 2));

                    this.game.player_emblems.forEach(emblem => {
                        this.set_pixel_text(
                            emblems_pos,
                            `${emblem.name}`,
                            "#fff", clearance_x
                        );

                        emblems_pos = emblems_pos.add(new Vector2(0, 1));

                        /* description disabled for now
                        // TODO line wrapping isn't working as intended
                        let wraps = this.set_pixel_text(
                            emblems_pos,
                            `${emblem.desc}`,
                            "#fff", clearance_x
                        );

                        emblems_pos = emblems_pos.add(new Vector2(0, 2 + wraps));
                        */
                    })
                }
            }
        }
    }

    make_location_path_string(game, clearance_x, events, prog) {
        let pprog = prog ? prog : game.player_location_progress;
        let pevents = events ? events : game.player_location.events;

        let path_str = "";
        let path_pad_size = Math.floor((clearance_x-3) / pevents.length);

        if (pprog == 0) {
            path_str += "[#fff]«[#888]"
        } else {
            path_str += " "
        }

        for (let i=0; i<pevents.length; i++) {
            let evt = pevents[i];
            let path = "";
            if (i < pevents.length-1) {
                path += " "
                path += b.h.repeat(path_pad_size-2);
                path += ""

                if (i - pprog == -1) {
                    path += "[#fff]«[#888]"
                } else if (i - pprog == 0) {
                    path = "[#fff]»[#888]" + path.slice(1) + " "
                } else {
                    path += " "
                }
            }

            path_str += `[${i < pprog ? "#666" : event_type_to_colour[evt]}]${event_type_to_icon[evt]}[#888]${path}`;
        }

        if (pprog == pevents.length-1) {
            path_str += "[#fff]»[#888]"
        } else {
            path_str += " "
        }

        return path_str;
    }

    render_game_checkerboard(light_col) {
        for (let x=0; x<this.game_view_size.x; x++) {
            for (let y=0; y<this.game_view_size.y; y++) {
                let pos = new Vector2(x + this.left_menu_size.x, y);
                let light = Math.floor((x / 2) + y) % 2 == switch_checkerboard;

                if (light) {
                    this.set_back(pos, light_col);
                } else {
                    this.set_back(pos, "black");
                }

                this.set_pixel(pos, "\u00A0");
            }
        }
    }

    // this overwrites the game view
    render_inventory_menu() {
        this.inventory_spell_origins = {};
        this.inventory_items_origins = {};
        this.inventory_spell_names = {};

        let mount_pos = new Vector2(
            this.left_menu_size.x + 2, 2
        );

        let clearance_x = this.game_view_size.x - 4;

        this.set_pixel_text(
            mount_pos.sub(new Vector2(2, 2)),
            "[white]" + b.h.repeat(clearance_x + 4)
        );

        this.set_pixel_text(
            mount_pos.add(new Vector2(-2, this.game_view_size.y - 3)),
            "[white]" + b.h.repeat(clearance_x + 4)
        );

        let current_line = mount_pos.copy();
        let player_spells = this.game.player_spells_edit;
        let inventory = this.game.player_inventory;

        for (let j=0; j<player_spells.length; j++) {
            let pspell = player_spells[j];

            let spell_name = this.game.player_spells[j].name;

            if (this.inventory_editing_spell_name == j) {
                this.set_back_set(
                    current_line,
                    current_line.add(new Vector2(clearance_x - 26, 0)),
                    "#666"
                )
                
                if (spell_name.length < 30) {
                    spell_name += "_";
                }
            } else if (this.inventory_selected_spell_name == j) {
                this.set_back_set(
                    current_line,
                    current_line.add(new Vector2(clearance_x - 26, 0)),
                    "#333"
                )
            } else {
                this.set_back_set(
                    current_line,
                    current_line.add(new Vector2(clearance_x - 26, 0)),
                    "#000"
                )
            }
            
            let parsed = this.game.player_ent.parse_spell(game.player_spells[j].spells, new Vector2(0, 0));
            this.set_pixel_text(
                current_line,
                this.pad_str(`[white](${j+1}) ${spell_name}`, clearance_x - 9)
            )

            this.set_pixel_text(
                current_line.add(new Vector2(clearance_x - 9, 0)),
                this.pad_str(`[cyan]${parsed.manacost} MP`, 8, 1)
            )

            this.inventory_spell_names[current_line.y] = j;

            current_line = current_line.add(new Vector2(0, 2));

            let spell_str = "";
            let num_spells = 0;
            let current_spell_point = current_line.copy();

            for (let i=0; i<game.player_max_spell_shards; i++) {
                let spell = i < pspell.length ? pspell[i] : null;

                if (num_spells * 3 >= clearance_x) {
                    this.set_pixel_text(
                        current_spell_point,
                        this.pad_str(spell_str, clearance_x)
                    );

                    current_spell_point = current_spell_point.add(new Vector2(0, 1));
                    spell_str = "";
                    num_spells = 0;
                }

                if (spell) {
                    let icon = spell.icon;
                    let col = spell.col;
                    let back_col = spell.back_col;

                    if (this.inventory_selected_spell) {
                        //console.log(this.inventory_selected_spell, i, j);
                        if (this.inventory_selected_spell.frag_id == i && this.inventory_selected_spell.spell_id == j) {
                            back_col = "white";
                            col = "black";
                        } else if (this.inventory_selected_spell.spell && this.inventory_selected_spell.spell.id == spell.id) {
                            back_col = "#aaa";
                            col = "black";
                        }
                    }

                    if (this.inventory_selected_spell_item) {
                        //console.log(this.inventory_selected_spell, i, j);
                        if (this.inventory_selected_spell_item.spell && this.inventory_selected_spell_item.spell.id == spell.id) {
                            back_col = "#aaa";
                            col = "black";
                        }
                    }

                    if (this.inventory_editing_spell_frag) {
                        let fr = this.inventory_editing_spell_frag;
                        if (fr.frag_id != undefined && fr.spell_id != undefined) {
                            if (fr.frag_id == i && fr.spell_id == j) {
                                back_col = "#0f0";
                                col = "black";
                            }
                        }
                    }

                    spell_str += `[${col}]${icon} `;
                    this.set_back_set(
                        current_spell_point.add(new Vector2(num_spells * 3, 0)),
                        current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                        back_col
                    )
                } else {
                    let icon = "[]";
                    let col = "#888";
                    let back_col = "black";

                    if (this.inventory_selected_spell) {
                        if (this.inventory_selected_spell.frag_id == i && this.inventory_selected_spell.spell_id == j) {
                            back_col = "#aaa";
                            col = "black";
                        }
                    }

                    if (this.inventory_editing_spell_frag) {
                        let fr = this.inventory_editing_spell_frag;
                        if (fr.frag_id != undefined && fr.spell_id != undefined) {
                            if (fr.frag_id == i && fr.spell_id == j) {
                                back_col = "#0f0";
                                col = "black";
                            }
                        }
                    }

                    spell_str += `[${col}]${icon} `;
                    this.set_back_set(
                        current_spell_point.add(new Vector2(num_spells * 3, 0)),
                        current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                        back_col
                    )
                }

                this.inventory_spell_origins[current_spell_point.add(new Vector2(num_spells * 3, 0)).hash_code()] = {spell: spell, frag_id: i, spell_id: j};
                this.inventory_spell_origins[current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)).hash_code()] = {spell: spell, frag_id: i, spell_id: j};

                num_spells++;
            };

            this.set_pixel_text(
                current_spell_point,
                this.pad_str(spell_str, clearance_x)
            );

            current_line = new Vector2(mount_pos.x, current_spell_point.y + 2);
        }

        let trash_col = "#aaa";
        let trash_back_col = "black";
        if (this.inventory_delete_spell_selected) {
            trash_col = "black";
            trash_back_col = "white";
        }

        if (this.inventory_editing_spell_frag && this.inventory_editing_spell_frag["trash"]) {
            trash_col = "black";
            trash_back_col = "#0f0";
        }

        let trash_pos = current_line.add(new Vector2(0, 2));

        this.set_pixel_text(
            trash_pos.add(new Vector2(clearance_x - 11, 0)),
            this.pad_str(`[white]- Trash -`, 8, 3)
        );

        this.set_pixel_text(
            trash_pos.add(new Vector2(clearance_x - 15, 0)),
            this.pad_str(`[${trash_col}][]`, 2, 3)
        );

        this.set_back(trash_pos.add(new Vector2(clearance_x - 15, 0)), trash_back_col);
        this.set_back(trash_pos.add(new Vector2(clearance_x - 14, 0)), trash_back_col);

        this.inventory_delete_spell_position = trash_pos.add(new Vector2(clearance_x - 14, 0));

        let spell_str = "";
        let num_spells = 0;

        this.set_pixel_text(
            current_line.add(new Vector2(0, 5)),
            this.pad_str("[white]- - - Inventory - - - ", clearance_x, 3)
        );

        current_line = current_line.add(new Vector2(0, 7));
        let current_spell_point = current_line.copy();

        for (let i=0; i<game.player_inventory_size; i++) {
            let spell = game.player_inventory[i];

            if (num_spells * 3 >= clearance_x) {
                this.set_pixel_text(
                    current_spell_point,
                    this.pad_str(spell_str, clearance_x)
                );

                current_spell_point = current_spell_point.add(new Vector2(0, 2));
                spell_str = "";
                num_spells = 0;
            }

            if (spell) {
                let icon = spell.icon;
                let col = spell.col;
                let back_col = spell.back_col;

                if (this.game.recent_spells_gained.includes(i)) {
                    back_col = spell.typ == SpellType.Core ? "#0ff" : "#f0f";
                    col = "black";
                }

                if (this.inventory_selected_spell_item) {
                    //console.log(this.inventory_selected_spell, i, j);
                    if (this.inventory_selected_spell_item.inv_id == i) {
                        back_col = "white";
                        col = "black";
                    } else if (this.inventory_selected_spell_item.spell && this.inventory_selected_spell_item.spell.id == spell.id) {
                        back_col = "#aaa";
                        col = "black";
                    }
                }

                if (this.inventory_selected_spell) {
                    //console.log(this.inventory_selected_spell, i, j);
                    if (this.inventory_selected_spell.spell && this.inventory_selected_spell.spell.id == spell.id) {
                        back_col = "#aaa";
                        col = "black";
                    }
                }

                if (this.inventory_editing_spell_frag) {
                    let fr = this.inventory_editing_spell_frag;
                    if (fr.inv_id != undefined) {
                        if (fr.inv_id == i) {
                            back_col = "#0f0";
                            col = "black";
                        }
                    }
                }

                spell_str += `[${col}]${icon} `;
                this.set_back_set(
                    current_spell_point.add(new Vector2(num_spells * 3, 0)),
                    current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                    back_col
                )
            } else {
                let icon = "[]";
                let col = "#888";
                let back_col = "black";

                if (this.inventory_selected_spell_item) {
                    if (this.inventory_selected_spell_item.inv_id == i) {
                        back_col = "#aaa";
                        col = "black";
                    }
                }

                if (this.inventory_editing_spell_frag) {
                    let fr = this.inventory_editing_spell_frag;
                    if (fr.inv_id != undefined) {
                        if (fr.inv_id == i) {
                            back_col = "#0f0";
                            col = "black";
                        }
                    }
                }

                spell_str += `[${col}]${icon} `;
                this.set_back_set(
                    current_spell_point.add(new Vector2(num_spells * 3, 0)),
                    current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)),
                    back_col
                )
            }

            let collision_box_obj = {spell: spell, inv_id: i};

            for (let x_delta=0; x_delta<2; x_delta++) {
                for (let y_delta=0; y_delta<1; y_delta++) {
                    this.inventory_items_origins[current_spell_point.add(new Vector2(num_spells * 3 + x_delta, y_delta)).hash_code()] = collision_box_obj;
                }
            }
            
            num_spells++;
        };

        this.set_pixel_text(
            current_spell_point,
            this.pad_str(spell_str, clearance_x)
        );
    }

    render_game_view() {
        // grab the portion of board around the player
        // since the screen space for the game is 2x1, we
        // need to factor that into our horizontal length
        // (we can only fit half as many chars as it seems)

        let hlen = this.game_view_size.x / 2;
        let vlen = this.game_view_size.y / 2;

        let player_pos = this.game.player_ent.position;

        // game positions. here we ensure we only go half as much back
        let tl = new Vector2(Math.floor(player_pos.x - (hlen / 2)), Math.floor(player_pos.y - vlen));
        let br = new Vector2(Math.ceil(player_pos.x + (hlen / 2)), Math.ceil(player_pos.y + vlen));

        let x_delta = br.x - tl.x;
        let y_delta = br.y - tl.y;

        //console.log(tl, br);

        // selected tile needs to be scaled back by size of left,
        // then halved,
        // then used as a difference from center
        let selected_loc = this.selected_tile ? this.selected_tile : new Vector2(0, 0);

        let s_normalised_pos = selected_loc.sub(new Vector2(this.left_menu_size.x, 0));
        s_normalised_pos = new Vector2(Math.floor(s_normalised_pos.x / 2) * 2, Math.floor(s_normalised_pos.y));

        let s_player_screen_pos = this.game_view_size.div(2);
        let s_screen_diff = s_normalised_pos.sub(s_player_screen_pos);
        let s_game_diff = new Vector2(s_screen_diff.x / 2, s_screen_diff.y);

        let s_game_pos = game.player_ent.position.add(s_game_diff);

        let radius_vec_set = [];
        if (game.selected_player_primed_spell) {
            if (game.selected_player_primed_spell.root_spell.in_range(game.player_ent, s_game_pos)) {
                /*
                radius_vecs = game.selected_player_primed_spell.root_spell.stats.shape(
                    game.player_ent.position, s_game_pos,
                    game.selected_player_primed_spell.root_spell.stats.radius,
                    game.selected_player_primed_spell.root_spell.stats.los
                );
                */

                radius_vec_set = game.player_get_spell_affected_tiles(
                    s_game_pos
                )
            }
        }

        let selected_col = "#888";
        for (let i=0; i<this.last_selected_tiles.length; i++) {
            this.set_back_pair(this.last_selected_tiles[i], null);
        }

        this.last_selected_tiles = [];

        let col_lerp_triggers_to = [[48, 48, 64], [24, 24, 64]];

        let line_to_selected = [];
        if (!game.selected_player_primed_spell) {
            line_to_selected = pathfind(game.player_ent.position, s_game_pos);
        }

        for (let x=0; x<x_delta; x++) {
            for (let y=0; y<y_delta; y++) {
                // screen pos is twice x because it's 2x1 on screen only
                let screen_pos = new Vector2((x * 2) + this.left_menu_size.x, y);

                let screen_particle = this.get_particle(screen_pos);
                let game_pos = tl.add(new Vector2(x, y));
                if (!screen_particle) {
                    // game pos is simply the top left plus current coords
                    let ent = this.board.get_pos(game_pos);

                    //console.log("screen:", screen_pos, "game:", game_pos);

                    if (ent && (!this.enable_fog || game.can_see(game.player_ent, game_pos))) {
                        this.set_pixel_pair(screen_pos, ent.icon, ent.col);
                    } else {
                        this.set_pixel_pair(screen_pos, "\u00A0\u00A0");
                    }
                } else {
                    // draw the particle instead
                    this.set_pixel_pair(screen_pos, screen_particle.current_str, screen_particle.col);
                }

                // now do spell range highlighting (and select highlighting),
                // including LOS if necessary
                
                // if the game has a selected player spell,
                // check if the spell is in range. if it is,
                // tint green. if not, normal tint
                //let current_state = game.selected_player_primed_spell ? "spell" : "none";

                // can do some optimisation here since we overdraw the same stuff a lot
                let back_rgb = [0, 0, 0];
                let do_not_highlight = false;

                if (true) {
                    let pos_in_bounds = true;
                    if (!this.board.position_valid(game_pos)) {
                        pos_in_bounds = false;
                        back_rgb = [0, 0, 0];
                    } else {
                        if (game.selected_player_primed_spell) {
                            let in_radius = false;
                            for (let rvi=0; rvi<radius_vec_set.length; rvi++) {
                                let radius_vecs = radius_vec_set[rvi];
                                let cf = (1 / radius_vec_set.length) * rvi;

                                if (radius_vecs.some((v) => v.equals(game_pos))) {
                                    let effect_indicator_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? [64, 64, 128] : [48, 48, 128];
                                    let lerp_to = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? col_lerp_triggers_to[0] : col_lerp_triggers_to[1];

                                    effect_indicator_col = lerp_colour(effect_indicator_col, lerp_to, cf);

                                    back_rgb = effect_indicator_col;
    
                                    if (this.selected_tile && new Vector2(Math.floor(this.selected_tile.x / 2) * 2, this.selected_tile.y).equals(screen_pos)) {
                                        //console.log("changed");
                                        if (game.selected_player_primed_spell.root_spell.stats.target_type == SpellTargeting.UnitTarget) {
                                            selected_col = "#66f";
                                        } else {
                                            selected_col = "#66f";
                                        }
                                        //console.log(selected_col);
                                    }

                                    in_radius = true;
                                }
                            }

                            if (in_radius) {
                                // already handled above
                            } else if (game.selected_player_primed_spell.root_spell.in_range(game.player_ent, game_pos, true)) {
                                // using "hypothetical" range to show the range of unit target spells too
                                let really_in_range = game.selected_player_primed_spell.root_spell.in_range(game.player_ent, game_pos);

                                let range_indicator_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? [32, 32, 32] : [48, 48, 48];
                                if (really_in_range) {
                                    range_indicator_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? [0, 64, 0] : [0, 80, 0];
                                }

                                back_rgb = range_indicator_col;

                                if (this.selected_tile && new Vector2(Math.floor(this.selected_tile.x / 2) * 2, this.selected_tile.y).equals(screen_pos)) {
                                    //console.log("changed");
                                    if (game.selected_player_primed_spell.root_spell.stats.target_type == SpellTargeting.UnitTarget) {
                                        selected_col = "#bbb";
                                    } else {
                                        selected_col = "#0a0";
                                    }
                                    //console.log(selected_col);
                                }
                            } else {
                                let neutral_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? [0, 0, 0] : [16, 16, 16];

                                back_rgb = neutral_col;
                            }
                        } else {
                            let neutral_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != switch_checkerboard ? [0, 0, 0] : [16, 16, 16];

                            if (line_to_selected && line_to_selected.some(p => p.equals(game_pos))) {
                                neutral_col[0] += 32;
                                neutral_col[1] += 32;
                                neutral_col[2] += 32;
                            }

                            back_rgb = neutral_col;
                        }
                    }

                    //this.last_player_spell_state = current_state;
                }

                if (this.board.get_pos(game_pos) && !do_not_highlight) {
                    if (this.board.get_pos(game_pos).team == Teams.PLAYER) {
                        back_rgb[0] += 0;
                        back_rgb[1] += 32;
                        back_rgb[2] += 0;
                    } else if (this.board.get_pos(game_pos).team == Teams.ENEMY) {
                        back_rgb[0] += 32;
                        back_rgb[1] += 0;
                        back_rgb[2] += 0;
                    } else {
                        // nothing
                    }
                }

                if (this.enable_fog && !game.can_see(game.player_ent, game_pos)) {
                    back_rgb = [0, 0, 0];
                }
                
                this.set_back_pair(screen_pos, `rgb(${back_rgb[0]}, ${back_rgb[1]}, ${back_rgb[2]})`);
            }
        }

        // selected cell
        if (this.selected_tile && this.selected_panel_id == 1) {
            this.set_back_pair(this.selected_tile, selected_col);
        }
    }

    render_borders() {
        let right_border_bound = this.left_menu_size.x + this.game_view_size.x;

        for (let xn=0; xn<this.total_size.x; xn++) {
            let char_top = null;
            let char_bottom = null;

            if (xn < this.left_menu_size.x || xn >= right_border_bound) {
                char_top = b.h;
                char_bottom = b.h;
            }

            if (xn == 0 || xn == this.left_menu_size.x-1 || xn == right_border_bound || xn == this.total_size.x-1) {
                char_top = b.c;
                char_bottom = b.c;

                // if it is vertical, change to the corresponding box drawing character
                // tl, tr, bl, br for corners
                // ml, mr, tm, dm for sides
                if (xn==0) {
                    // left facing corners
                    char_top = b.tl;
                    char_bottom = b.bl;
                } else if (xn==this.total_size.x-1) {
                    // right facing corners
                    char_top = b.tr;
                    char_bottom = b.br;
                } else {
                    // top or bottom facing sides
                    // if the game board is currently open and we are at the right border bound, this needs to be corners instead
                    if (xn == right_border_bound && !this.game.inventory_open) {
                        char_top = b.tl;
                        char_bottom = b.bl;
                    } else {
                        char_top = b.tm;
                        char_bottom = b.bm;
                    }
                }
            }

            if (char_top && char_bottom) {
                this.set_pixel(new Vector2(xn, 0), char_top, "#fff");
                this.set_pixel(new Vector2(xn, this.total_size.y-1), char_bottom, "#fff");
            }
        }

        let vertical_char = b.v;
        for (let yn=1; yn<this.total_size.y-1; yn++) {
            this.set_pixel(new Vector2(0, yn), vertical_char, "#fff");
            this.set_pixel(new Vector2(this.left_menu_size.x-1, yn), vertical_char, "#fff");
            this.set_pixel(new Vector2(right_border_bound, yn), vertical_char, "#fff");
            this.set_pixel(new Vector2(this.total_size.x-1, yn), vertical_char, "#fff");
        }
    }

    render_custom_border(tl, br, horizontal_lines, vertical_lines) {
        let lines_added = {};

        // main border
        for (let x=tl.x; x<=br.x; x++) {
            let add_vec_tl = new Vector2(x, tl.y)
            let add_vec_br = new Vector2(x, br.y)

            let corner_style_top = x==tl.x ? b.tl : (x==br.x ? b.tr : b.c);
            let corner_style_bot = x==tl.x ? b.bl : (x==br.x ? b.br : b.c);

            this.set_pixel(add_vec_tl, lines_added[add_vec_tl.hash_code()] ? corner_style_top : b.h, "#fff");
            this.set_pixel(add_vec_br, lines_added[add_vec_br.hash_code()] ? corner_style_bot : b.h, "#fff");
            
            lines_added[add_vec_tl.hash_code()] = 1;
            lines_added[add_vec_br.hash_code()] = 1;
        }

        for (let y=tl.y; y<=br.y; y++) {
            let add_vec_tl = new Vector2(tl.x, y)
            let add_vec_br = new Vector2(br.x, y)

            let corner_style_l = y==tl.y ? b.tl : (y==br.y ? b.bl : b.c);
            let corner_style_r = y==tl.y ? b.tr : (y==br.y ? b.br : b.c);

            this.set_pixel(add_vec_tl, lines_added[add_vec_tl.hash_code()] ? corner_style_l : b.v, "#fff");
            this.set_pixel(add_vec_br, lines_added[add_vec_br.hash_code()] ? corner_style_r : b.v, "#fff");
            
            lines_added[add_vec_tl.hash_code()] = 1;
            lines_added[add_vec_br.hash_code()] = 1;
        }

        // additional borders
        if (horizontal_lines) {
            for (let i=0; i<horizontal_lines.length; i++) {
                let hline = horizontal_lines[i];
                for (let x=tl.x; x<=br.x; x++) {
                    let add_vec = new Vector2(x, hline + tl.y)
                    
                    // hline describes the y position of the object
                    // hline=0, top (so use tl/tr)
                    // hline=(br.y-tl.y), bottom (so use bl/br)
                    // otherwise, middle (so use ml/mr)

                    let corner_style_l = hline==0 ? b.tl : (hline==(br.y-tl.y) ? b.bl : b.ml);
                    let corner_style_r = hline==0 ? b.tr : (hline==(br.y-tl.y) ? b.br : b.mr);

                    this.set_pixel(add_vec, lines_added[add_vec.hash_code()] ? (x==tl.x ? corner_style_l : corner_style_r) : b.h, "#fff");
                    lines_added[add_vec.hash_code()] = 1;
                }
            }
        }

        if (vertical_lines) {
            for (let i=0; i<vertical_lines.length; i++) {
                let vline = vertical_lines[i];
                for (let y=tl.y; y<=br.y; y++) {
                    let add_vec = new Vector2(vline + tl.x, y)
                    
                    this.set_pixel(add_vec, lines_added[add_vec.hash_code()] ? b.c : b.v, "#fff");
                    lines_added[add_vec.hash_code()] = 1;
                }
            }
        }

        // fill with back col black and clear all other text
        for (let x=tl.x; x<=br.x; x++) {
            for (let y=tl.y; y<=br.y; y++) {
                let vec = new Vector2(x, y)

                if (!lines_added[vec.hash_code()]) {
                    this.set_pixel(vec, "\u00A0", "#fff")
                }

                this.set_back(vec, "#000")
            }
        }
    }

    cleanup_messageboxes() {
        let padx = this.msgbox_pad_x;
        let pady = this.msgbox_pad_y;

        let messagebox_size = this.total_size.sub(new Vector2(padx, pady))

        let messagebox_tl = new Vector2(Math.floor(padx / 2), Math.floor(pady / 2))
        let messagebox_br = messagebox_tl.add(messagebox_size);

        for (let x=messagebox_tl.x; x<=messagebox_br.x; x++) {
            for (let y=messagebox_tl.y; y<=messagebox_br.y; y++) {
                let pos = new Vector2(x, y);

                this.set_pixel(pos, "\u00A0", "#fff");
                this.set_back(pos, "#000")
            }
        }

        this.messagebox_open = null;
        this.selected_messagebox_option_nr = null;
        this.selected_messagebox_option_fn = null;

        this.refresh_left_panel = true;
        this.refresh_right_panel = true;
    }

    check_messagebox_queue() {
        if (!this.messagebox_open && this.messagebox_queue.length > 0) {
            console.log("messagebox not open, checking queue", this.messagebox_queue);
            this.messagebox_open = new MessageBox(this.messagebox_queue[0]);
            this.messagebox_queue = this.messagebox_queue.slice(1);

            if (this.messagebox_open.on_open) {
                this.messagebox_open.on_open(this.messagebox_open);
            }

            this.render_messageboxes();

            this.mouseover(null, this.cur_mouse_flatid);
        } else {
            console.log("tried to check queue but messagebox open, or queue empty")
        }
    }

    render_messageboxes() {
        if (this.messagebox_open) {
            let padx = this.msgbox_pad_x;
            let pady = this.msgbox_pad_y;

            let messagebox_size = this.total_size.sub(new Vector2(padx, pady))

            let messagebox_tl = new Vector2(Math.floor(padx / 2), Math.floor(pady / 2))
            let messagebox_br = messagebox_tl.add(messagebox_size);

            if (this.messagebox_open.need_to_calculate) {
                this.messagebox_open.tl = messagebox_tl;
                this.messagebox_open.br = messagebox_br;
            }

            this.render_custom_border(
                messagebox_tl,
                messagebox_br,
                [2], []
            )

            let clearance_x = messagebox_size.x - 3;
            let mount_pos = messagebox_tl.add(new Vector2(1, 1));

            let padded_title = this.pad_str(this.messagebox_open.title, clearance_x, 2)

            this.set_pixel_text(mount_pos, padded_title)

            mount_pos = mount_pos.add(new Vector2(1, 2))

            this.set_pixel_text(
                mount_pos, this.messagebox_open.text, "#fff", clearance_x
            )

            mount_pos = new Vector2(messagebox_tl.x + 3, messagebox_br.y - 2);

            let option_spacing = 4;
            let option_pad_pre = Math.floor(option_spacing / 2);
            let option_pad_post = Math.ceil(option_spacing / 2);
            
            let available_option_spaces = (clearance_x - 2 - (this.messagebox_open.options.length * option_spacing));

            let option_length_unrounded = available_option_spaces / this.messagebox_open.options.length;
            let option_length = Math.floor(option_length_unrounded);
            let remaining_option_length = Math.round((option_length_unrounded - option_length) * this.messagebox_open.options.length);

            mount_pos = mount_pos.add(new Vector2(option_pad_pre, 0))

            for (let i=0; i<this.messagebox_open.options.length; i++) {
                let selected_option_length = option_length;

                let selected_back_col = (this.messagebox_open.custom_highlight_col && this.messagebox_open.custom_highlight_col[i]) ? this.messagebox_open.custom_highlight_col[i][0] : "#fff";
                let selected_text_col = (this.messagebox_open.custom_highlight_col && this.messagebox_open.custom_highlight_col[i]) ? this.messagebox_open.custom_highlight_col[i][1] : "#000";

                let back_col = this.selected_messagebox_option_nr == i ? selected_back_col : this.messagebox_open.option_background_cols[i];
                let text_col = this.selected_messagebox_option_nr == i ? selected_text_col : "#fff";

                if (i < remaining_option_length) {
                    selected_option_length++;
                }

                for (let x=0; x<selected_option_length; x++) {
                    let vec = mount_pos.add(new Vector2(x, 0))

                    this.set_back(vec, back_col);

                    if (this.messagebox_open.need_to_calculate) {
                        this.messagebox_open.registered_option_positions[vec.hash_code()] = [i, this.messagebox_open.option_actions[i]];
                    }
                }

                let padded_option_txt = this.pad_str(this.messagebox_open.options[i], selected_option_length, 3)
                this.set_pixel_text(mount_pos, padded_option_txt, text_col);

                mount_pos = mount_pos.add(new Vector2(option_spacing + selected_option_length, 0))
            }

            this.messagebox_open.need_to_calculate = false;
        }
    }

    add_messagebox(template, immediately) {
        if (immediately && this.messagebox_open) {
            this.selected_messagebox_option_nr = null;
            this.selected_messagebox_option_fn = null;

            this.messagebox_queue.splice(0, 0, this.messagebox_open.template);
            this.messagebox_queue.splice(0, 0, template);

            this.cleanup_messageboxes();
        } else if (immediately) {
            // splice but don't cleanup
            this.messagebox_queue.splice(0, 0, template);
        } else {
            this.messagebox_queue.push(template);
        }
        
        this.check_messagebox_queue();
    }

    test() {
        let cols = ["#fff", "#f00", "#0f0", "#00f", "#000"];
        let chars = [b.f, "&", b.c, b.h, "\u00A0"];
        let sthis = this;
        
        for (let i=0; i<1024; i++) {
            setTimeout(function() {
                //console.log(i);
                let col = cols[i % 4];

                for (let o=0; o<50; o++) {
                    if (i-o >= 0) {
                        let loc = new Vector2((i-o) % (sthis.total_size.x + sthis.total_size.y), 0);
                        while (true) {
                            if (loc.x < sthis.total_size.x) {
                                sthis.set_pixel(loc, chars[Math.floor(o/10)], cols[Math.floor(o/10)]);
                            }

                            loc = new Vector2(loc.x - 1, loc.y + 1);
                            if (loc.x < 0 || loc.y >= sthis.total_size.y) {
                                break;
                            }
                        }
                    }
                }
            }, i * (1000/60));
        }
    }
}

class Board {
    constructor(size) {
        let x = size.x;
        let y = size.y;

        this.dimensions = new Vector2(size.x, size.y);
        this.num_tiles = size.x * size.y;

        this.cells = [];
        for (let yt=0; yt<y; yt++) {
            this.cells.push([]);

            for (let xt=0; xt<x; xt++) {
                this.cells[yt].push(null);
            }
        }
    }

    position_valid(position) {
        return in_bounds(position.x, 0, this.dimensions.x) && in_bounds(position.y, 0, this.dimensions.y);
    }

    clear_pos(position) {
        if (!this.position_valid(position)) {
            return 0;
        }

        this.set_pos(position, null, true);
        return 1;
    }

    get_pos(position) {
        if (!this.position_valid(position)) {
            return null;
        }

        return this.cells[position.x][position.y];
    }

    set_pos(position, entity, overwrite) {
        //console.log(position, entity, overwrite);
        if (!this.position_valid(position)) {
            return 0;
        }

        if (!this.get_pos(position) || overwrite) {
            this.cells[position.x][position.y] = entity;
            return 1;
        } else {
            return 0;
        }
    }

    check_for_entity(position, teams, affinities, predicate) {
        let result = this.get_pos(position);
        if (result) {
            if (teams && !(result.team_present(teams))) {
                return null;
            }

            if (affinities && !(result.affinity_present(affinities))) {
                return null;
            }

            if (predicate && !predicate(result)) {
                return null;
            }

            return result;
        }
    }

    check_shape(positions, teams, affinities, predicate) {
        return positions.map(pos => this.check_for_entity(pos, teams, affinities, predicate)).filter(e => e);  // remove null
    }
}


class EntityTemplate {
    static id_inc = 0;

    constructor(name, icon, col, desc, max_hp, max_mp, affinities, xp_value, spawn_credits, innate_spells, specials, specials_text, ai_level, blocks_los, untargetable, on_death) {
        this.id = EntityTemplate.id_inc;
        EntityTemplate.id_inc++;
        
        this.name = name
        this.icon = icon
        this.col = col
        this.desc = desc
        this.max_hp = max_hp
        this.max_mp = max_mp
        this.affinities = affinities != undefined ? affinities : []
        this.xp_value = xp_value != undefined ? xp_value : 0;
        this.spawn_credits = spawn_credits != undefined ? spawn_credits : -1;
        this.innate_spells = innate_spells != undefined ? innate_spells : []
        this.specials = specials != undefined ? specials : function(a, b, c) {}
        this.specials_text = specials_text != undefined ? specials_text : "None"
        this.ai_level = ai_level != undefined ? ai_level : 999
        this.blocks_los = blocks_los;
        this.untargetable = untargetable;
        this.on_death = on_death != undefined ? on_death : [];
    }
}


class Entity {
    static id_inc = 0;

    constructor(template, team) {
        this.id = Entity.id_inc;
        Entity.id_inc++;

        this.template = template;
        this.name = template.name;
        this.desc = template.desc;
        this.col = template.col;
        this.icon = template.icon;

        this.max_hp = template.max_hp;
        this.hp = this.max_hp;
        this.max_mp = template.max_mp;
        this.mp = this.max_mp;
        this.position = new Vector2(0, 0);
        this.affinities = template.affinities.slice();
        this.innate_spells = template.innate_spells.slice();
        this.innate_primed_spells = [];

        this.specials = template.specials;
        this.specials_text = template.specials_text;

        this.xp_value = template.xp_value

        this.ai_level = template.ai_level;

        this.blocks_los = template.blocks_los;
        this.untargetable = template.untargetable;

        this.spawn_credits = template.spawn_credits;
        this.on_death = template.on_death.slice();

        this.team = team;
        this.dead = false;

        this.spawn_protection = false;
        this.took_damage_last_turn = false;

        this.calculate_primed_spells(new Vector2(0, 0));
    }

    add_innate_spell(spells) {
        this.innate_spells.push(spells);
        this.innate_primed_spells = [];

        this.calculate_primed_spells(new Vector2(0, 0));
    }

    calculate_primed_spells(pos) {
        let new_primed = [];
        for (let i=0; i<this.innate_spells.length; i++) {
            let primed_spell = this.parse_spell(this.innate_spells[i][0], pos);

            // [spells, cooldown]
            let cooldown = this.innate_primed_spells[i] ? this.innate_primed_spells[i][1] - 1 : 0;
            new_primed.push([primed_spell, cooldown]);
        }

        this.innate_primed_spells = new_primed;
    }

    do_turn() {
        let turncount = game.turncount;

        this.calculate_primed_spells(game.player_ent.position);

        // sends stuff to the game if necessary, based on ai level
        //console.log("doing turn for", this.name, this.ai_level);
        switch (this.ai_level) {
            case 0:
                // player
                break;
            
            case 1:
            case 2: // TODO ai level 2 (smart), 3 (vsmart), 4 (motionless)
            case 4:
                let target_ent = game.find_closest_enemy(this);

                if (target_ent) {
                    // check if we can cast a spell
                    let cast_spell = false;
                    let spell_to_cast = [];
                    let best_mp_cd = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

                    // prioritise castable spell with the highest max cooldown and manacost
                    for (let i=0; i<this.innate_primed_spells.length; i++) {
                        let primed_spell = this.innate_primed_spells[i][0];
                        let cooldown = this.innate_primed_spells[i][1];

                        if (cooldown <= 0) {
                            if (primed_spell.manacost <= this.mp && primed_spell.root_spell.spell_would_affect(this, target_ent)) {
                                //console.log("executing spell", primed_spell);
                                if (this.innate_spells[i][1] == best_mp_cd[1] && primed_spell.manacost == best_mp_cd[0]) {
                                    spell_to_cast.push([primed_spell, i])
                                } else {
                                    if (this.innate_spells[i][1] > best_mp_cd[0]) {
                                        spell_to_cast = [[primed_spell, i]];
                                        best_mp_cd = [this.innate_spells[i][1], primed_spell.manacost];
                                    } else if (this.innate_spells[i][1] == best_mp_cd[0] && primed_spell.manacost > best_mp_cd[1]) {
                                        spell_to_cast = [[primed_spell, i]];
                                        best_mp_cd = [this.innate_spells[i][1], primed_spell.manacost];
                                    }
                                }

                                cast_spell = true;
                            }
                        }
                    }

                    if (cast_spell) {
                        let chosen = spell_to_cast[Math.floor(game.random() * spell_to_cast.length)];
                        let primed_spell = chosen[0];
                        let innate_index = chosen[1];

                        this.execute_spell(primed_spell, target_ent.position)
                        this.innate_primed_spells[innate_index][1] = this.innate_spells[innate_index][1];
                    }

                    // for ai level 2+, the entity should stay at the range of their shortest range spell
                    // they should only move towards the player if they are out of range
                    // and move away otherwise
                    if (!cast_spell) {
                        if (this.ai_level == 4) {
                            // DEFINITELY don't wait if we're ai level 4 (stationary)
                            game.end_turn(this, turncount, true);
                        } else {
                            let clear_path = pathfind(this.position, target_ent.position);
                            
                            //console.log(path, this.position, target_ent.position);
                            if (clear_path && clear_path.length > 1) {
                                let result = game.move_entity(this, clear_path[1], false);
                            } else {
                                let occupied_path = pathfind(this.position, target_ent.position, [this.team]);

                                if (occupied_path && occupied_path.length > 1) {
                                    let result = game.move_entity(this, occupied_path[1], false)
                                }
                            }
                                
                            // don't wait if we end up not casting a spell
                            game.end_turn(this, turncount, true);
                        }
                    }
                } else {
                    // experimental "do not wait" if we don't do anything
                    game.end_turn(this, turncount, true);
                }
                
                break;

            default:
                game.end_turn(this, turncount, true);
                break;
        }
    }

    do_end_turn() {
        // for now just give some mp regen
        this.restore_mp(Math.min(Math.round(this.max_mp / 25)));
        this.spawn_protection = false;
        this.took_damage_last_turn = false;
    }

    has_team(team) {
        return this.team == team;
    }

    team_present(teams) {
        return teams.some(team => this.has_team(team));
    }

    has_affinity(affinity) {
        return this.affinities.includes(affinity);
    }

    affinity_present(affinities) {
        return affinities.some(affinity => this.has_affinity(affinity));
    }

    parse_spell(spells, position_target) {
        let spells_text = "";
        spells.forEach(spell => {
            let core_mod_st = spell.typ == SpellType.Core ? "[]" : "{}";
            spells_text += `${core_mod_st} ${spell.name}<br>`;
        })

        // document.getElementById("spell-list").innerHTML = spells_text;

        // parse the spell into a primed spell first
        // then check its manacost and ensure the entity can cast it
        // then cast that spell for the game

        // until i can figure out multicasts, we're dropping them.
        // triggers only
        let root_spell = null;
        let last_spell = null;
        let draws = 1;
        let after_finishing_draws = "stop";
        let next_trigger = "";
        let cores_in_draw = [];
        let modifiers_in_draw = [];
        let finished_drawing = false;

        let manacost = 0;
        let n_transferences = 0;

        for (let i=0; i<spells.length; i++) {
            if (finished_drawing) {
                break;
            }

            let spell = spells[i];

            if (spell.name == "Spell Transference") {
                n_transferences++;
            }

            manacost += spell.manacost;

            after_finishing_draws = spell.trigger_type ? spell.trigger_type : after_finishing_draws;

            if (spell.typ == SpellType.Core) {
                if (n_transferences > 0) {
                    n_transferences--;
                    modifiers_in_draw.push(new Spell(
                        spell.name, spell.icon, spell.col, spell.back_col,
                        SpellType.Modifier, spell.subtyp, spell.desc, spell.manacost, spell.bonus_draws,
                        spell.trigger_type, no_stats, spell.fns.at_target, spell.fns.on_hit, spell.fns.on_affected_tiles
                    ))
                    draws++;
                } else {
                    cores_in_draw.push(spell);
                }
            } else {
                modifiers_in_draw.push(spell);
            }

            draws += spell.bonus_draws;
            draws--;

            if (draws <= 0) {
                let new_primed_spell = new PrimedSpell(this, [
                    ...cores_in_draw, ...modifiers_in_draw
                ]);

                if (last_spell) {
                    last_spell.trigger = [
                        next_trigger, new_primed_spell
                    ];

                    last_spell = new_primed_spell;
                } else {
                    root_spell = new_primed_spell;
                    last_spell = new_primed_spell;
                }

                next_trigger = after_finishing_draws;
                if (after_finishing_draws == "stop") {
                    finished_drawing = true;
                }
                after_finishing_draws = "stop";
                draws = 1;
                cores_in_draw = [];
                modifiers_in_draw = [];
            }
        }

        if (root_spell) {
            return {root_spell: root_spell, manacost: manacost};
        } else {
            let backup_spell = this.parse_spell([
                core_spell("???", "!!", SpellSubtype.Core, "white", "red", 
                "This is a useless spell. You didn't add a core!",
                0, DmgType.Physical, 0, 0, Shape.Diamond, 0)
            ]).root_spell;

            return {root_spell: backup_spell, manacost: 0};
        }
    }

    cast_spell(spells, position_target) {
        let spell_info = this.parse_spell(spells, position_target);

        if (spell_info) {
            this.execute_spell(spell_info, position_target);
        }
    }

    execute_spell(spell_info, position_target) {
        let root_spell = spell_info.root_spell;
        let manacost = spell_info.manacost;
        //console.log("original spells:", spells);
        //console.log("about to cast", root_spell);
        if (this.mp < manacost) {
            //console.log(`not enough mana (req: ${manacost}, have: ${this.mp}`);
        } else {
            //console.log(`spent ${manacost} MP`);
            this.lose_mp(manacost);
            game.cast_primed_spell(root_spell, position_target);
        }
    }

    has_status(status) {
        return false
        // TODO this
    }

    cleanse_effects() {
        // TODO something
    }

    refresh() {
        if (!this.dead) {
            this.hp = this.max_hp;
            this.mp = this.max_mp;
        }
    }

    die() {
        this.dead = true;
        game.kill(this);
    }

    revive() {
        this.dead = false;
        this.restore_hp(Number.POSITIVE_INFINITY);
    }

    change_hp(amount) {
        let old_hp = this.hp;

        this.hp += amount;
        this.hp = Math.max(0, Math.min(this.max_hp, this.hp));

        return this.hp - old_hp;
    }

    restore_hp(amount) {
        if (this.change_hp(amount)) {
            renderer.put_particle_from_game_loc(this.position, new Particle(
                heal_flash_particle
            ));
        };
    }

    lose_hp(amount) {
        this.change_hp(-amount);
        if (this.hp <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    change_mp(amount) {
        let old_mp = this.mp;

        this.mp += amount;
        this.mp = Math.max(0, Math.min(this.max_mp, this.mp));

        return this.mp - old_mp;
    }

    lose_mp(amount) {
        this.change_mp(-amount);
    }

    restore_mp(amount) {
        if (this.change_mp(amount)) {
            /* a bit too noisy, ignore for now
            renderer.put_particle_from_game_loc(this.position, new Particle(
                mp_flash_particle
            ));
            */
        };
    }

    get_damage_mults() {
        let res = {};
        Object.keys(DmgType).forEach(t => {
            res[t] = this.get_damage_mult(DmgType[t]);
        })

        return res;
    }

    get_damage_mult(damage_type) {
        let dmg_mult = 1;
        this.affinities.forEach(affinity => {
            dmg_mult *= affinity_weaknesses[affinity][damage_type]
        });

        return dmg_mult;
    }

    take_damage(caster, damage, damage_type) {
        if (this.dead || this.spawn_protection) {
            return 0;
        }

        // compare damage type to affinities and determine total multiplier
        let dmg_mult = 1;
        this.affinities.forEach(affinity => {
            dmg_mult *= affinity_weaknesses[affinity][damage_type]
        });

        // spell source might change damage but not right now
        let final_damage = Math.round(damage * dmg_mult);

        if (final_damage == 0) {
            return 0;
        }

        let died = this.lose_hp(final_damage);
        console.log(`${this.name} says "ow i took ${final_damage} ${damage_type} damage (multiplied by ${dmg_mult} from original ${damage}) from ${caster.name}`);
        
        renderer.refresh_right_panel = true;
        //console.log("game asked for right panel refresh");
        
        /*
        if (this.name == "moving guy") {
            hitcount++;
            // document.getElementById("hit-text").textContent = `guy took ${final_damage} ${damage_type} damage (hit ${hitcount})`;
        }
        */

        if (died && this.team != Teams.PLAYER) {
            // spawn xp particles
            // even if not killed by the player
            // (because that encourages making enemies hit each other)
            if (this.xp_value > 0) {
                // split xp into chunks
                let x = this.xp_value;
                let x_left = x;

                // chunks should be such that 10 chunks = one level of xp
                // max of 25
                let num_chunks = 1 + (9 * (x / game.get_xp_for_levelup(game.player_level)));
                num_chunks = Math.floor(Math.min(25, num_chunks));

                let sthis = this;
                for (let i=0; i<num_chunks; i++) {
                    setTimeout(function() {
                        let xp_to_give = Math.ceil(x / num_chunks);
                        if (xp_to_give > x_left) {
                            xp_to_give = x_left;
                        }
                        x_left -= xp_to_give;

                        xp_sparkle(xp_to_give, sthis.position);
                    })
                }

                game.roll_for_loot(this, this.xp_value);
            }
        }

        this.took_damage_last_turn = true;

        return final_damage;
    }
}

class Spell {
    static id_inc = 0;

    // inventory items use references to these single objects. do not edit them
    constructor(name, icon, col, back_col, typ, subtyp, desc, manacost, bonus_draws, trigger_type, to_stats_fn, at_target_fn, on_hit_fn, on_affected_tiles_fn) {
        this.id = Spell.id_inc;
        Spell.id_inc++;
        
        this.name = name;
        // in all cases, the core spell's functions are called first,
        // followed by modifiers in the order of placement.
        this.icon = icon
        this.col = col;
        this.back_col = back_col;
        
        this.typ = typ;
        this.subtyp = subtyp

        this.desc = desc;
        this.bonus_draws = bonus_draws;
        this.trigger_type = trigger_type;
        this.manacost = manacost;
        this.fns = {
            to_stats: to_stats_fn,                   // during stat calculation, (user, spell, stats)
            at_target: at_target_fn,                 // when cast on target location; (user, spell, stats, location)
            on_hit: on_hit_fn,                       // when damaging an enemy; (user, spell, stats, enemy, damage, type)
            on_affected_tiles: on_affected_tiles_fn  // called on every aoe location including direct target; (user, spell, stats, location)
        }
    }

    copy() {
        return new Spell(
            this.name, this.icon, this.col, this.back_col,
            this.typ, this.subtyp, this.desc, this.manacost, this.bonus_draws,
            this.trigger_type, this.fns.to_stats, this.fns.at_target, this.fns.on_hit, this.fns.on_affected_tiles
        )
    }

    is_corrupt() {
        return this.icon == "??";
    }

    is_red() {
        return (!this.is_corrupt()) && (this.subtyp == SpellSubtype.Red || this.subtyp == SpellSubtype.RedModifier);
    }

    is_normal() { 
        return (!this.is_corrupt()) && (!this.is_red());
    }

    augment(fn, new_fn) {
        let old_function = this.fns[fn];
        this.fns[fn] = function(a, b, c, d, e, f) {
            if (old_function) {
                old_function(a, b, c, d, e, f);
            }

            new_fn(a, b, c, d, e, f);
        }

        return this;
    }

    /**
     * 
     * @param {('at_target'|'on_hit'|'on_affected_tiles')} typ 
     * @returns {Spell}
     */
    set_trigger(typ) {
        this.trigger_type = typ;

        return this;
    }

    set_stat(stat, new_val) {
        return this.augment(
            "to_stats",
            function(user, spell, stats) {
                stats[stat] = new_val;
            }
        );
    }
}

// TODO fire these events for every entity when something happens
// [game, ent, event_info{event_type, other details, e.g. damage amount and type for DamageTaken}]
const GameEventType = {
    SelfSpawned: "SelfSpawned",  // TODO
    SelfTurnBegan: "SelfTurnBegan",  // TODO
    SelfTurnEnded: "SelfTurnEnded",  // TODO
    AnyTurnEnded: "AnyTurnEnded",  // TODO
    SelfDamageTaken: "SelfDamageTaken",  // TODO
    AnyDamageTaken: "AnyDamageTaken",  // TODO
    SelfDied: "SelfDied",  // TODO
    AnyDied: "AnyDied"  // TODO
}

const SpellType = {
    Core: "Core",
    Modifier: "Modifier"
}

const SpellSubtype = {
    Core: "Core",
    Stats: "Stats",
    Damage: "Damage",
    Cosmetic: "Cosmetic",
    Trigger: "Trigger",
    Shape: "Shape",
    Multicast: "Multicast",
    Misc: "Misc",
    Red: "Red",
    RedModifier: "Red Modifier",
}

const SpellTargeting = {
    Positional: 'a position on the ground',
    UnitTarget: 'a specific unit',      // includes teams for filtering
    SelfTarget: 'the area around the caster',    // cast location is self tile
    SelfTargetPlusCaster: 'at the caster\'s position'  // self target implicitly removes caster tile but this doesn't
};

const RetargetType = {
    None: "None",
    Self: "Self",
    Enemy: "Enemy",
    Ally: "Ally",
    Weak: "Weak",
    Strong: "Strong",
    Native: "Native",
    Pushback: "Pushback",
    Magnetism: "Magnetism",
    Compact: "Compact",
    Sparse: "Sparse",
    Mysterious: "Mysterious"
}

const Teams = {
    PLAYER: "Player",
    ENEMY: "Enemy",
    UNALIGNED: "Unaligned"
}

const DmgType = {
    Fire: "Fire",
    Ice: "Ice",
    Lightning: "Lightning",
    Arcane: "Arcane",
    Physical: "Physical",
    Dark: "Dark",
    Chaos: "Chaos",
    Holy: "Holy",
    Psychic: "Psychic"
}

const damage_type_cols = {
    "Fire": "#e25822",
    "Ice": "#A5F2F3",
    "Lightning": "#ffff33",
    "Arcane": "#ff4d94",
    "Physical": "#ddd",
    "Dark": "#7a49a2",
    "Chaos": "#e6970f",
    "Holy": "#fef19a",
    "Psychic": "#ff9eff"
}

const Affinity = {
    Fire: "Fire",
    Ice: "Ice",
    Lightning: "Lightning",
    Arcane: "Arcane",
    Ghost: "Ghost",
    Chaos: "Chaos",
    Holy: "Holy",
    Dark: "Dark",
    Demon: "Demon",
    Undead: "Undead",
    Natural: "Natural",
    Living: "Living",
    Insect: "Insect",
    Construct: "Construct",
    Order: "Order"
}

const affinity_cols = {
    "Fire": "#e25822",
    "Ice": "#A5F2F3",
    "Lightning": "#ffff33",
    "Arcane": "#ff4d94",
    "Ghost": "#ddd",
    "Chaos": "#e6970f",
    "Holy": "#fef19a",
    "Dark": "#7a49a2",
    "Demon": "#ff2812",
    "Undead": "#888",
    "Natural": "#4a4",
    "Living": "#6f6",
    "Insect": "#282",
    "Construct": "#bbb",
    "Order": "#D5C2A5"
}

const affinity_opposites = {
    "Fire": "Ice",
    "Ice": "Fire",
    "Lightning": "Natural",
    "Arcane": "Dark",
    "Ghost": "Construct",
    "Chaos": "Order",
    "Holy": "Demon",
    "Dark": "Arcane",
    "Demon": "Holy",
    "Undead": "Living",
    "Natural": "Lightning",
    "Living": "Undead",
    "Insect": "Insect",
    "Construct": "Ghost",
    "Order": "Chaos"
}

// index 1: what type the defender is
// index 2: what type the attacker is
const affinity_weaknesses = {
    "Fire": {
        "Fire": 0.5,       // resistant
        "Ice": 0.25,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 0.75,   // resistant
        "Dark": 1.5,       // weak
        "Chaos": 1.5,      // weak
        "Holy": 1,       // neutral
        "Psychic": 1.5,    // weak
    },

    "Ice": {
        "Fire": 2,       // weak
        "Ice": 0.5,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 0.75,     // resistant
        "Physical": 1.5,   // weak
        "Dark": 1,       // neutral
        "Chaos": 1.5,      // weak
        "Holy": 1,       // neutral
        "Psychic": 1,    // neutral
    },

    "Lightning": {
        "Fire": 1,       // neutral
        "Ice": 1,        // neutral
        "Lightning": 0.5,  // resistant
        "Arcane": 1,     // neutral
        "Physical": 0.75,   // resistant
        "Dark": 1.5,       // weak
        "Chaos": 1,      // neutral
        "Holy": 1,       // neutral
        "Psychic": 1.5,    // weak
    },
 
    "Arcane": {
        "Fire": 1,       // neutral
        "Ice": 0.75,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 1.5,       // weak
        "Chaos": 1,      // neutral
        "Holy": 1.25,       // weak
        "Psychic": 1.5,    // weak
    },
 
    "Ghost": {
        "Fire": 1,       // neutral
        "Ice": 0.5,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1.5,     // weak
        "Physical": 0,   // immune
        "Dark": 0.5,       // resistant
        "Chaos": 1,      // neutral
        "Holy": 2,       // weak
        "Psychic": 1.5,    // weak
    },
 
    "Chaos": {
        "Fire": 0.5,       // resistant
        "Ice": 0.5,        // resistant
        "Lightning": 0.5,  // resistant
        "Arcane": 1.75,     // weak
        "Physical": 1,   // neutral
        "Dark": 1,       // neutral
        "Chaos": 0.5,      // resistant
        "Holy": 1,       // neutral
        "Psychic": 1.5,    // weak
    },
 
    "Holy": {
        "Fire": 0.5,       // resistant
        "Ice": 1,        // neutral
        "Lightning": 0.5,  // resistant
        "Arcane": 1.5,     // weak
        "Physical": 1,   // neutral
        "Dark": 2,       // weak
        "Chaos": 1,      // neutral
        "Holy": 1,       // neutral
        "Psychic": 1.5,    // weak
    },
 
    "Dark": {
        "Fire": 1.5,       // weak
        "Ice": 0.5,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1.5,     // weak
        "Physical": 1,   // neutral
        "Dark": 0.5,       // resistant
        "Chaos": 0.75,      // resistant
        "Holy": 2,       // weak
        "Psychic": 1.5,    // weak
    },
 
    "Demon": {
        "Fire": 0.5,       // resistant
        "Ice": 0.5,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 0.25,       // resistant
        "Chaos": 0.5,      // resistant
        "Holy": 2,       // weak
        "Psychic": 1,    // neutral
    },
 
    "Undead": {
        "Fire": 1.5,       // weak
        "Ice": 0.5,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 0.25,       // resistant
        "Chaos": 1,      // neutral
        "Holy": 2,       // weak
        "Psychic": 1,    // neutral
    },
 
    "Natural": {
        "Fire": 1.5,       // weak (be aware many things will be natural and living)
        "Ice": 1.5,        // weak
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 1,       // neutral
        "Chaos": 1.25,      // weak
        "Holy": 1,       // neutral
        "Psychic": 1,    // neutral
    },
 
    "Living": {
        "Fire": 1.5,       // weak
        "Ice": 1,        // neutral
        "Lightning": 1.5,  // weak
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 1,       // neutral
        "Chaos": 1,      // neutral
        "Holy": 1,       // neutral
        "Psychic": 1,    // neutral
    },
 
    "Insect": {
        "Fire": 2,       // weak
        "Ice": 1.5,        // weak
        "Lightning": 1,  // neutral
        "Arcane": 1,     // neutral
        "Physical": 1,   // neutral
        "Dark": 1,       // neutral
        "Chaos": 1,      // neutral
        "Holy": 1,       // neutral
        "Psychic": 0.5,    // resistant
    },
 
    "Construct": {
        "Fire": 0.25,       // resistant
        "Ice": 0.25,        // resistant
        "Lightning": 0.5,  // resistant
        "Arcane": 1,     // neutral
        "Physical": 1.5,   // weak
        "Dark": 1,       // neutral
        "Chaos": 1.5,      // weak
        "Holy": 1,       // neutral
        "Psychic": 0.25,    // resistant
    },
 
    "Order": {
        "Fire": 1,       // neutral
        "Ice": 1,        // neutral
        "Lightning": 1,  // neutral
        "Arcane": 0.5,     // resistant
        "Physical": 1,   // neutral
        "Dark": 0.5,       // resistant
        "Chaos": 2,      // weak
        "Holy": 1,       // neutral
        "Psychic": 2,    // weak
    },
};

Object.keys(DmgType).forEach(typ => {
    Object.keys(Affinity).forEach(aff => {
        if (affinity_weaknesses[aff][typ] >= 1) {
            affinity_weaknesses[aff][typ] = 1 + ((affinity_weaknesses[aff][typ] - 1) * 2)
        } else {
            affinity_weaknesses[aff][typ] /= 2
        }
    })
})

console.log(Object.keys(Affinity).map(a => a.padEnd(5)).join(" "))
console.log(Object.keys(DmgType).map(t => {
    return Object.keys(Affinity).map(
        a => affinity_weaknesses[a][t].toString().padEnd(Math.max(5, a.length))
    ).join(" ")
}).join("\n"))

const StatusEffect = {
    FREEZE: "Frozen",
    SLEEP: "Sleeping",
    STUN: "Stunned",
    POISON: "Poison",
    BULWARK: "Bulwark",
    SHIELD: "Shield",
    OVERCHARGE: "Overcharge",  // +50% lightning damage dealt and taken
    BLEED: "Bleed",
    INVULNERABLE: "Invulnerable",
}

Object.keys(DmgType).forEach(typ => {
    StatusEffect["RESISTANCE_" + typ.toUpperCase()] = `Resistance (${DmgType[typ]})`;
    StatusEffect["POLARITY_" + typ.toUpperCase()] = `Polarity (${DmgType[typ]})`;
})

function make_square(target, radius, predicate) {
    let positions = [];
    let tx = target.x;
    let ty = target.y;

    for (let y=0; y<radius; y++) {
        for (let x=0; x<radius; x++) {
            if (!predicate || predicate(x, y)) {
                positions.push(new Vector2(tx + x, ty + y));
                if (x > 0) {
                    positions.push(new Vector2(tx - x, ty + y));
                }

                if (y > 0) {
                    positions.push(new Vector2(tx + x, ty - y));
                }

                if (x > 0 && y > 0) {
                    positions.push(new Vector2(tx - x, ty - y));
                }
            }
        }
    }

    return positions;
}

function pathfind(start, goal, ignore_teams) {
    let gets = 0;

    function h(pos) {
        return goal.distance(pos);
    }

    function prepend(value, array) {
        let newArray = array.slice();
        newArray.unshift(value);
        return newArray;
    }

    function reconstruct_path(cameFrom, current) {
        let total_path = [Vector2.from_hash_code(current)]
        while (cameFrom.get(current)) {
            current = cameFrom.get(current)
            total_path.push(Vector2.from_hash_code(current));
        }

        return total_path.reverse();
    }

    function get_or_inf(c, v) {
        gets++;
        return c.has(v) ? c.get(v) : Number.POSITIVE_INFINITY;
    }

    function binarySearch(array) {
        let lo = -1, hi = array.length;
        while (1 + lo < hi) {
            const mi = lo + ((hi - lo) >> 1);
            if (array[mi]) {
                hi = mi;
            } else {
                lo = mi;
            }
        }
        return hi;
    }

    // oh god
    // https://en.wikipedia.org/wiki/A*_search_algorithm
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = new Set();
    openSet.add(start.hash_code());

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    let cameFrom = new Map();

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    let gScore = new Map();
    gScore.set(start.hash_code(), 0);

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    let fScore = new Map();
    fScore.set(start.hash_code(), h(start))

    while (openSet.size > 0) {
        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
        let current = null;
        let current_score = Number.POSITIVE_INFINITY;
        openSet.forEach(pos => {
            let score = get_or_inf(fScore, pos);

            if (score < current_score) {
                current_score = score;
                current = Vector2.from_hash_code(pos);
            }
        })

        if (current.equals(goal)) {
            //console.log("gets: ", gets)
            return reconstruct_path(cameFrom, current.hash_code())
        }

        openSet.delete(current.hash_code());

        let current_hash = current.hash_code();

        let neighbours = [
            current.add(new Vector2(0, 1)),
            current.add(new Vector2(0, -1)),
            current.add(new Vector2(-1, 0)),
            current.add(new Vector2(1, 0)),
            current.add(new Vector2(-1, -1)),
            current.add(new Vector2(1, -1)),
            current.add(new Vector2(-1, 1)),
            current.add(new Vector2(1, 1)),
        ]

        for (let i=0; i<neighbours.length; i++) {
            let neighbor = neighbours[i];

            let neighbour_ent = board.get_pos(neighbor);
            if (board.position_valid(neighbor) && ((!neighbour_ent || (ignore_teams && neighbour_ent.team_present(ignore_teams))) || neighbor.equals(goal))) {
                let neighbor_hash = neighbor.hash_code();

                // d(current,neighbor) is the weight of the edge from current to neighbor
                // tentative_gScore is the distance from start to the neighbor through current
                let tentative_gScore = get_or_inf(gScore, current_hash) + (1);
                if (tentative_gScore < get_or_inf(gScore, neighbor_hash)) {
                    // This path to neighbor is better than any previous one. Record it!
                    let fscore_p = tentative_gScore + h(neighbor);

                    cameFrom.set(neighbor_hash, current_hash);
                    gScore.set(neighbor_hash, tentative_gScore);
                    fScore.set(neighbor_hash, fscore_p);
                    if (!openSet.has(neighbor_hash)) {
                        openSet.add(neighbor_hash);
                    }
                }
            }
        }
    }

    // Open set is empty but goal was never reached
    //console.log("FAILED. gets: ", gets)
    return 0
}

// http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#C
function make_line(a, b, radius, respect_los, just_one) {
    // need to later make radius too, which should just be a diamond from every point
    // pretty simple but im lazy rn

    let x0 = a.x;
    let y0 = a.y;

    let x1 = b.x;
    let y1 = b.y;

    let coords = [];
    let dx = Math.abs(x1-x0);
    let sx = x0<x1 ? 1 : -1;
    let dy = Math.abs(y1-y0);
    let sy = y0<y1 ? 1 : -1; 
    let err = (dx>dy ? dx : -dy)/2;
    let e2 = 0;

    while (true) {
        if (just_one && coords.length >= 1) {
            return coords;
        }

        if (x0 != a.x || y0 != a.y) {
            let coord = new Vector2(x0, y0);

            if (respect_los) {
                let ent_raw = board.get_pos(coord);
                if (ent_raw && ent_raw.blocks_los) {
                    // occupied so stop early
                    return coords;
                }
            }

            coords.push(coord);
        }

        if (x0==x1 && y0==y1) {
            //coords.push(b);
            return coords;
        }

        e2 = err;
        if (e2 >-dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }
}

function propagate_diamond(origin, radius, los) {
    let points = [[origin, radius]];
    let positions = [origin];

    let updated_points = [];
    while (points.length > 0 && radius > 1) {
        points.forEach(point => {
            let pos = point[0];
            let radius_left = point[1];

            let new_positions = [
                pos.add(new Vector2(-1, 0)),
                pos.add(new Vector2(1, 0)),
                pos.add(new Vector2(0, -1)),
                pos.add(new Vector2(0, 1)),
            ]

            for (let i=0; i<new_positions.length; i++) {
                let new_pos = new_positions[i];

                let point_ent = game.board.get_pos(new_pos);
                let position_already_recorded = false;
                for (let i=0; i<positions.length; i++) {
                    if (positions[i].equals(new_pos)) {
                        position_already_recorded = true;
                        break;
                    }
                }

                let ent_blocks_los = point_ent ? point_ent.blocks_los : false;

                if ((!ent_blocks_los || !los) && !position_already_recorded) {
                    // the position is empty and has not been marked yet
                    positions.push(new_pos);
                    if (radius_left > 1) {
                        updated_points.push(
                            [new_pos, radius_left - 1]
                        );
                    }
                }
            };
        })

        points = updated_points;
        updated_points = [];
    }

    return positions.reverse();
}

function maze_gen(game, board, cvr, diagonals) {
    let wall_remove_chance = cvr ? cvr : 0.1

    let walls_removed = new Set();

    let visited = new Set();
    let visit_stack = [];
    let initial_cell = game.player_ent.position;
    visit_stack.push(initial_cell);

    while (visit_stack.length > 0) {
        // Pop a cell from the stack and make it a current cell
        let current = visit_stack.pop()
        
        // If the current cell has any neighbours which have not been visited
        let neighbours = diagonals ? [
            current.add(new Vector2(0, 2)),
            current.add(new Vector2(0, -2)),
            current.add(new Vector2(-2, 0)),
            current.add(new Vector2(2, 0)),
            current.add(new Vector2(-2, -2)),
            current.add(new Vector2(2, -2)),
            current.add(new Vector2(-2, 2)),
            current.add(new Vector2(2, 2)),
        ] : [
            current.add(new Vector2(0, 2)),
            current.add(new Vector2(0, -2)),
            current.add(new Vector2(-2, 0)),
            current.add(new Vector2(2, 0)),
            //current.add(new Vector2(-2, -2)),
            //current.add(new Vector2(2, -2)),
            //current.add(new Vector2(-2, 2)),
            //current.add(new Vector2(2, 2)),
        ] 

        let unvisited_neighbours = neighbours.filter(v => game.board.position_valid(v) && !visited.has(v.hash_code()))
        if (unvisited_neighbours.length > 0) {
            // Push the current cell to the stack
            visit_stack.push(current)

            // Choose one of the unvisited neighbours
            let chosen_neighbour = unvisited_neighbours[Math.floor(game.random() * unvisited_neighbours.length)];

            // Remove the wall between the current cell and the chosen cell
            walls_removed.add(current.hash_code());
            walls_removed.add(current.add(chosen_neighbour.sub(current).div(2)).hash_code())
            walls_removed.add(chosen_neighbour.hash_code());

            // Mark the chosen cell as visited and push it to the stack
            visited.add(chosen_neighbour.hash_code());
            visit_stack.push(chosen_neighbour)
        }
    }

    let walls = game.player_location.walls;
    let walls_placed = 0;
    for (let x=0; x<board.dimensions.x; x++) {
        for (let y=0; y<board.dimensions.y; y++) {
            let t = new Vector2(x, y);
            if (game.random() > wall_remove_chance && !walls_removed.has(t.hash_code())) {
                let result = game.spawn_entity(
                    walls[0], Teams.UNALIGNED, t
                )
    
                if (result) {
                    walls_placed++;
                }
            }
        }
    }

    walls_placed += flood_fill_inaccessible(game, walls);

    // since the maze should always have a path to everywhere, it should never reject
    return true;
}

function select_random_wall(game, walls) {
    let w = walls[0];
    let w_index = 0;
    while (w_index < 4 && game.random() < 0.5) {
        w_index++;
        w = walls[w_index];
    }

    return w;
}

function flood_fill_inaccessible(game, walls) {
    // check every tile. if it is not reachable from the player tile,
    // turn it into a wall.
    let walls_placed = 0;

    let flood_set = {};
    let expands = {};

    let new_expands = {};
    new_expands[game.player_ent.position.hash_code()] = game.player_ent.position;

    while (Object.keys(new_expands).length > 0) {
        expands = new_expands;
        new_expands = {};

        Object.keys(expands).forEach(p => {
            let current = expands[p];
            let neighbours = [
                current.add(new Vector2(0, 1)),
                current.add(new Vector2(0, -1)),
                current.add(new Vector2(-1, 0)),
                current.add(new Vector2(1, 0)),
                current.add(new Vector2(-1, -1)),
                current.add(new Vector2(1, -1)),
                current.add(new Vector2(-1, 1)),
                current.add(new Vector2(1, 1)),
            ]

            neighbours.forEach(n => {
                if (board.position_valid(n)) {
                    let ent = board.get_pos(n);
                    if (!ent || !ent.blocks_los) {
                        if (!flood_set[n.hash_code()]) {
                            new_expands[n.hash_code()] = n;
                            flood_set[n.hash_code()] = n;
                        }
                    }
                }
            })
        })
    }

    for (let x=0; x<board.dimensions.x; x++) {
        for (let y=0; y<board.dimensions.y; y++) {
            let t = new Vector2(x, y);
            if (!flood_set[t.hash_code()]) {
                let result = game.spawn_entity(
                    walls[4], Teams.UNALIGNED, t
                )
    
                if (result) {
                    walls_placed++;
                }
            }
        }
    }

    return walls_placed;
}

const WorldGen = {
    RandomWalls: function(game, board, cvr) {
        let coverage = cvr ? cvr : 0.1

        let num_walls = (0.85 + (game.random() * 0.3)) * board.num_tiles * coverage;
        num_walls = Math.floor(num_walls);

        let walls = game.player_location.walls;

        let walls_placed = 0;

        for (let i=0; i<num_walls; i++) {
            let pos = new Vector2(
                Math.floor(game.random() * board.dimensions.x),
                Math.floor(game.random() * board.dimensions.y)
            );

            let result = game.spawn_entity(
                select_random_wall(game, walls), Teams.UNALIGNED, pos
            )

            if (result) {
                walls_placed++;
            }
        }

        walls_placed += flood_fill_inaccessible(game, walls);

        // finally, reject the generation if over 2x the number of tiles
        // that should be empty are now filled
        let expected_empty = board.num_tiles - num_walls;
        let actual_empty = board.num_tiles - walls_placed;
        if (actual_empty * 2 < expected_empty) {
            // console.log(actual_empty, expected_empty, "worldgen fail");
            return false;
        }

        // console.log(actual_empty, expected_empty, "worldgen success");
        return true;
    },

    Maze1: function(game, board, cvr) {
        return maze_gen(game, board, cvr, false)
    },

    Maze1Diagonal: function(game, board, cvr) {
        return maze_gen(game, board, cvr, true)
    },
}

const Shape = {
    Square: ["square shape", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "square shape";
        }

        return make_square(target, radius);
    }],
    Circle: ["circle shape", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "circle shape";
        }
        
        let pts = make_square(target, radius+1);

        let filtered = pts.filter(
            vec => {
                return (vec.sub(target).magnitude() <= radius) && (target.equals(vec) || (!los || game.has_los_pos(target, vec)))
            }
        );

        return filtered
    }],
    Ring: ["ring shape", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "ring shape";
        }
        
        let pts = make_square(target, radius+1);

        let filtered = pts.filter(
            vec => {
                return (Math.abs(vec.sub(target).magnitude() - radius) < 0.5) && (target.equals(vec) || (!los || game.has_los_pos(target, vec)))
            }
        );

        return filtered
    }],
    Diamond: ["burst", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "burst";
        }

        // make a square but filter it a little
        return propagate_diamond(target, radius, los);
    }],
    Line: ["straight line", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "straight line";
        }

        //console.log(origin, target);

        if (origin.equals(target)) {
            return [target];
        }

        let line = make_line(origin, target, radius, los);

        return line;
    }],
    PerpLine: ["line perpendicular to the target", function(origin, target, radius, los) {

    }],
    Cone: ["cone shape", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "cone shape";
        }
        
        let dist = origin.distance(target);

        let pts = make_square(origin, 2 + dist * 2);

        // the radius of the cone determines how long the circumference of the
        // circle segment can be.
        // radius 3 means it can be 3 long, etc.

        let allowed_angle = Math.max(0, Math.min(Math.PI * 1, radius / dist));

        //allowed_angle = (Math.PI / 180) * 30

        // https://stackoverflow.com/questions/13652518/efficiently-find-points-inside-a-circle-sector
        // so we need to verify if each point is ccw from the end and cw from the start.

        let target_vector = target.sub(origin);

        let start_vector = target_vector.rotate(-allowed_angle);
        let end_vector = target_vector.rotate(allowed_angle);

        //console.log("angle:", allowed_angle, `(${allowed_angle * (180 / Math.PI)} deg)`, target_vector, start_vector, end_vector)

        function are_clockwise(v1, v2) {
            return -v1.x*v2.y + v1.y*v2.x > 0;
        }

        let direct_line = make_line(origin, target, radius, los).map(p => p.hash_code())

        let filtered = pts.filter(
            vec => {
                let normalised_vec = vec.sub(origin);

                let start_ccw = !are_clockwise(start_vector, normalised_vec);
                let end_cw = are_clockwise(end_vector, normalised_vec);

                let in_range = origin.distance(vec) <= dist;

                //console.log(start_vector, start_ccw, end_vector, end_cw);

                let in_cone = (start_ccw && end_cw && in_range) && (!los || game.has_los_pos(origin, vec))
                let in_line = direct_line.includes(vec.hash_code());

                return in_cone || in_line;
            }
        );

        return filtered
    }]
}

const SpellSpecials = {
    FLAMENOVA: "FLAMENOVA",
    TURNDEAD: "TURNDEAD",
    CHAOSINCANT: "CHAOSINCANT",
    NEVERDAMAGE: "NEVERDAMAGE",
    DEATHCHAIN: "DEATHCHAIN",
    NEGATIVESPACE: "NEGATIVESPACE",
    SPELLTRANSFERENCE: "SPELLTRANSFERENCE",
    ARCANEECHO: "ARCANEECHO",
    SPREADINGARCANA: "SPREADINGARCANA",
    PURITY: "PURITY",
    UNRESOLVEDSPELL: "UNRESOLVEDSPELL"
}

const SpellMulticast = {
    NORMAL: "normal",
    CHAOSCAST: "unpredictable",
    ARC: "simultaneous",
    CHAIN: "chain",
    BEHINDTHEBACK: "btb",
    TRIANGLE: "triangle",
    SQUARE: "square"
}

class PrimedSpell {
    static id_inc = 0;

    constructor(caster, spells) {
        this.id = PrimedSpell.id_inc;
        PrimedSpell.id_inc++;

        this.caster = caster
        this.origin = null;
        this.original_cast_position = null;

        this.spells = spells
        this.trigger = ["none", null];  // ["at_target"/..., PrimedSpell]

        this.stats = {};

        this.calculate();
    }

    copy() {
        let new_primed = new PrimedSpell(this.caster, this.spells);
        
        new_primed.origin = this.origin;
        new_primed.original_cast_position = this.original_cast_position;

        if (this.trigger[0] != "none") {
            new_primed.trigger = [this.trigger[0], this.trigger[1].copy()];
        }

        new_primed.calculate();

        new_primed.stats.mutable_info = structuredClone(this.stats.mutable_info);
        new_primed.stats.multicasts = structuredClone(this.stats.multicasts);
        new_primed.stats.multicast_stack = structuredClone(this.stats.multicast_stack);

        return new_primed;
    }

    calculate() {
        //this.stats.primed_spell = this;
        this.stats.mutable_info = {};

        this.stats.target_team = [Teams.ENEMY, Teams.PLAYER];
        this.stats.target_affinities = null;
        this.stats.damage = 0;
        this.stats.damage_type = DmgType.Physical;
        this.stats.targeting_predicates = [];
        this.stats.target_type = SpellTargeting.Positional;
        this.stats.radius = 0;
        this.stats.range = 0;
        this.stats.multicasts = {
            "normal": 0,
            "unpredictable": 0,
            "chain": 0,
            "simultaneous": 0,
            "btb": 0,
            "triangle": 0,
            "square": 0
        }

        this.stats.multicast_stack = [];

        this.stats.retargets = [];

        this.stats.shape = Shape.Diamond;
        this.stats.los = true;

        this.stats.enable_particles = true;
        this.stats.custom_particles = null;
        this.stats.custom_particle_colour = null;

        this.stats.trigger_type = "none";

        this.stats.post_multipliers = {};
        this.stats.specials = [];

        Object.keys(this.stats).forEach(s => {
            if (typeof(this.stats[s]) == "number") {
                this.stats.post_multipliers[s] = 1;
            }
        });

        // REMEMBER: CORE ALWAYS FIRST, then modifiers
        // even though in the spell builder the core will be last
        this.spells.forEach((spell, index) => {
            if (spell.fns.to_stats) {
                spell.fns.to_stats(this.caster, spell, this.stats);
            }

            if (this.caster.id == game.player_ent.id && spell.typ == SpellType.Core) {
                game.player_emblems.forEach(emblem => {
                    emblem.to_core_stats(this.caster, spell, this.stats);
                })
            }
        })

        Object.keys(this.stats.post_multipliers).forEach(s => {
            if (typeof(this.stats[s]) == "number") {
                this.stats[s] *= this.stats.post_multipliers[s];
            }
        });

        // specials
        this.stats.specials.forEach(special => {
            switch (special) {
                case SpellSpecials.FLAMENOVA:
                    this.stats.damage += this.stats.radius * 5;
                    break;
                
                case SpellSpecials.UNRESOLVEDSPELL:
                    this.stats.damage = random_int(1, 200);
                    this.stats.damage_type = random_damage_type();
                    this.stats.range = random_int(6, 18);
                    this.stats.radius = random_int(1, 6);
                    // TODO perpline ?
                    this.stats.shape = random_from_arr([Shape.Circle, Shape.Cone, Shape.Diamond, Shape.Line, Shape.Ring, Shape.Square])[1];
                    break;
            }
        })

        if (this.stats.specials.includes(SpellSpecials.NEVERDAMAGE)) {
            this.stats.damage = 0;
        }

        // clamps
        this.stats.damage = Math.max(0, this.stats.damage);
        this.stats.radius = Math.max(0, this.stats.radius);
        this.stats.range = Math.max(0, this.stats.range);
    }

    shift_multicasts(kill_arcs) {
        let t = 0;
        while (kill_arcs || t <= 0) {
            t++;
            this.stats.mutable_info.last_multicast = this.stats.multicast_stack.shift();

            // shift away the next thing immediately 
            // if we just shifted an arc 
            // AND the next thing is an arc

            if (this.stats.mutable_info.last_multicast != SpellMulticast.ARC || this.stats.multicast_stack[0] != SpellMulticast.ARC) {
                break;
            }
        }
    }

    spell_would_affect(caster, ent, ignore_unit_target) {
        // check if it's in range. for a selftarget, it will instead check the shape and see if the
        // target is inside it. 
        // TODO need to also have a flag to tell AI to use it no matter what (e.g. selftarget cores)
        if ([SpellTargeting.SelfTarget, SpellTargeting.SelfTargetPlusCaster].includes(this.stats.target_type)) {
            return this.get_affected_tiles(game.board, caster, caster.position).some(vec => {
                return vec.equals(ent.position)
            });
        } else {
            return this.in_range(caster, ent.position, ignore_unit_target);
        }
    }

    in_range(caster, position, ignore_unit_target) {
        if ([SpellTargeting.SelfTarget, SpellTargeting.SelfTargetPlusCaster].includes(this.stats.target_type)) {
            return caster.position.equals(position);
        }

        if (caster.position.equals(position)) {
            // self-targeting is only valid for self-targeted spells
            // (where it is the only valid target)
            return false;
        }

        if (!game.board.position_valid(position)) {
            return false;
        }

        let los_check = game.has_los(caster, position);

        if (los_check || !this.stats.los) {
            let in_range = caster.position.distance(position) <= this.stats.range;

            if (in_range) {
                if (this.stats.target_type == SpellTargeting.UnitTarget) {
                    let ent = game.board.get_pos(position)
                    if (ent && ent.team_present(this.stats.target_team)) {
                        return true;
                    }

                    return ignore_unit_target ? true : false;
                } else {
                    return true;
                }
            } else {
                // not in range means instant fail
                return false;
            }
        }
    }

    // DOES NOT RETARGET ON ITS OWN!!! NEED TO DO THIS SEPARATELY
    get_affected_tiles(board, caster, position, force_origin) {
        let origin = this.origin ? this.origin : (
            caster.position ? caster.position : caster
        );

        if (force_origin) {
            origin = force_origin
        }

        this.origin = origin;

        let cast_locations = this.stats.shape(origin, position, this.stats.radius, this.stats.los);
        if (this.stats.specials.includes(SpellSpecials.NEGATIVESPACE)) {
            let new_cast_locations = Shape.Circle[1](origin, origin, this.stats.range, this.stats.los);
            cast_locations = new_cast_locations.filter(pos => {
                return !cast_locations.some(p => {
                    return p.equals(pos)
                })
            });
        }

        if (!force_origin) {
            this.origin = null;
        }

        return cast_locations;
    }

    get_single_retarget(board, caster, origin, old_position, original_cast_position, retarget) {
        switch (retarget) {
            case RetargetType.Self:
                return caster.position;

            case RetargetType.Enemy:  // closest enemy of CASTER
            case RetargetType.Ally:  // closest ally of CASTER
            case RetargetType.Weak:  // weakest to core dmg type, tiebreak with closest
            case RetargetType.Strong:  // strongest against core dmg type, tiebreak with closest
            case RetargetType.Native:  // filter by affinities matching dmg type, tiebreak with closest
                let positions = Shape.Circle[1](origin, old_position, this.stats.range, this.stats.los)
                let ents = game.board.check_shape(
                    positions, null, null, e => (e && !e.untargetable)
                )

                // filter this based on the retarget type:
                switch (retarget) {
                    case RetargetType.Enemy:
                        ents = ents.filter(e => !e.has_team(caster.team))
                        break;

                    case RetargetType.Ally:
                        ents = ents.filter(e => e.has_team(caster.team))
                        break;

                    case RetargetType.Weak:
                        let highest_dmg_mult = Math.max(
                            ...(ents.map(e => e.get_damage_mult(this.stats.damage_type)))
                        )
                        ents = ents.filter(e => e.get_damage_mult(this.stats.damage_type) >= highest_dmg_mult);
                        break;

                    case RetargetType.Strong:
                        let lowest_dmg_mult = Math.min(
                            ...(ents.map(e => e.get_damage_mult(this.stats.damage_type)))
                        )
                        ents = ents.filter(e => e.get_damage_mult(this.stats.damage_type) <= lowest_dmg_mult);
                        break;

                    case RetargetType.Native:
                        ents = ents.filter(e => e.has_affinity(this.stats.damage_type))
                        break;
                }

                if (ents.length <= 0) {
                    return old_position;
                }

                // now pick the closest entity
                let closest_ent = ents.reduce((prev, curr) => {
                    if (old_position.sqr_distance(prev.position) < old_position.sqr_distance(curr.position)) {
                        return prev;
                    } else {
                        return curr;
                    }
                })

                return closest_ent.position;

            case RetargetType.Pushback:
            case RetargetType.Magnetism:
            case RetargetType.Compact:
            case RetargetType.Sparse:
            case RetargetType.Mysterious:
                // use the line shape so we obey LOS. the position we target is dependent on the retarget type.
                let line_delta = new Vector2(0, 0);
                let target_pos = null;
                let max_dist = 0;
                switch (retarget) {
                    case RetargetType.Pushback:
                        // 3 tiles away from caster
                        line_delta = old_position.sub(caster.position).normalize().mul(3).round();

                        max_dist = 3;
                        break;

                    case RetargetType.Magnetism:
                        // 3 tiles towards caster
                        if (old_position.distance(caster.position) < 3) {
                            target_pos = caster.position;
                        } else {
                            line_delta = old_position.sub(caster.position).normalize().mul(-3).round();
                        }

                        max_dist = 3;
                        break;

                    case RetargetType.Compact:
                        // 2 tiles towards cast position
                        if (old_position.distance(original_cast_position) < 2) {
                            target_pos = original_cast_position;
                        } else {
                            line_delta = old_position.sub(original_cast_position).normalize().mul(-2).round();
                        }

                        max_dist = 2;
                        break;

                    case RetargetType.Sparse:
                        // 2 tiles away from cast position
                        line_delta = old_position.sub(original_cast_position).normalize().mul(2).round();

                        max_dist = 2;
                        break;

                    case RetargetType.Mysterious:
                        // seed a random generator with the target xy, modify by random r, theta values:
                        // theta = 0, 360
                        // r = 1, maxrange/2
                        let rand = get_seeded_randomiser(old_position.hash_code().toString());
                        
                        let theta = rand() * 360;
                        let r = 1 + (rand() * (this.stats.range / 2));

                        line_delta = new Vector2(1, 0).rotate(theta).mul(r).round();

                        max_dist = this.stats.range;
                        break;
                }

                let line_points = [];
                if (!target_pos) {
                    target_pos = old_position.add(line_delta);
                    line_points = Shape.Line[1](old_position, target_pos, 1, this.stats.los);
                } else {
                    line_points = [target_pos];
                }
                
                // the last thing in the line is either where it stopped due to LOS
                // or where it got to the goal position
                // so just return that here
                if (line_points.length > 0) {
                    // console.log("length comparison of retarget (max, real):", max_dist, line_points.length)
                    // console.log(line_points)
                    // console.log(line_points[line_points.length-1])
                    return line_points[line_points.length-1];
                } else {
                    return old_position;
                }
        }

        return old_position;
    }

    get_retarget_position(board, caster, origin, old_position, original_cast_position) {
        let p = old_position;
        for (let i=0; i<this.stats.retargets.length; i++) {
            p = this.get_single_retarget(board, caster, origin, p, original_cast_position, this.stats.retargets[i]);
        }

        return p;
    }

    cast(board, caster, target_position) {
        // console.log("Cast spell at", target_position);

        //console.log(this.origin);
        let position = target_position;
        if ([SpellTargeting.SelfTarget, SpellTargeting.SelfTargetPlusCaster].includes(this.stats.target_type)) {
            console.log("not forcing position for now, but would here")
            // position = caster.position;
        }

        if (this.stats.target_type == SpellTargeting.UnitTarget && !board.get_pos(position) && !this.stats.specials.includes(SpellSpecials.UNRESOLVEDSPELL)) {
            throw ReferenceError("Tried to cast a unit target spell with no unit at target position!")
        }

        // before we start, drop spawn protection on enemies.
        // TODO probably make this suck a lil less since it wastes a bunch of time rn
        game.drop_spawn_protection();

        this.caster = caster;

        let self_target_safe = this.stats.target_type == SpellTargeting.SelfTarget;

        let origin = this.origin ? this.origin : caster.position;
        this.origin = origin;

        let original_cast_position = this.original_cast_position ? this.original_cast_position : caster.position;
        this.original_cast_position = original_cast_position;
        
        position = this.get_retarget_position(board, caster, origin, position, original_cast_position);
        // if (this.stats.retarget != RetargetType.None) {
        //     console.log(`Successfully retargeted from ${target_position.toString()} to ${position.toString()}`)
        // }

        this.cast_position = position;

        let cast_locations = this.get_affected_tiles(board, caster, position, origin);

        if (this.stats.shape("whoami") == Shape.Line[0]) {
            if (!cast_locations.some(v => v.equals(origin))) {
                //console.log("hello?")
                // if the origin position is not targeted
                // check the board to see if that position is the caster.
                // if they're not the caster, add it
                if (!game.board.get_pos(origin) || game.board.get_pos(origin).id != caster.id) {
                    cast_locations.unshift(origin.copy())
                };
            }
        }
        
        //console.log(this.stats);

        //console.log(cast_locations);

        if (self_target_safe) {
            cast_locations = cast_locations.filter(loc => !(loc.x == position.x && loc.y == position.y));
        }
        
        game.reset_damage_count(this.caster.id);

        // drop some particles indicating where the spell came from
        let line_points = Shape.Line[1](origin, position, 1, false);
        line_points.forEach(p => {
            if (!p.equals(origin)) {
                renderer.put_particle_from_game_loc(p, new Particle(
                    spell_projection_particle
                ));
            }
        })

        // we really want to sell the chaos effect so do chaos stuff here if needed
        if (this.stats.specials.includes(SpellSpecials.CHAOSINCANT) || this.stats.specials.includes(SpellSpecials.UNRESOLVEDSPELL)) {
            this.spells.forEach(s => {
                //console.log(s, s.unknown_incant_dmgtype);
                // basically force a recalc on every cast
                if (s.name == "Unknown Incantation") {
                    this.stats = {};

                    this.calculate();
                } else if (s.name == "Unresolved Spell") {
                    this.stats = {};

                    this.calculate();
                }
            })
        }

        let particle_type = dmg_type_particles[this.stats.damage_type];
        if (this.stats.custom_particles) {
            particle_type = this.stats.custom_particles;
        }

        if (this.stats.custom_particle_colour) {
            particle_type = particle_type.change_colour(this.stats.custom_particle_colour);
        }

        if (!particle_type.col) {
            particle_type = particle_type.change_colour(damage_type_cols[this.stats.damage_type]);
        }

        let sthis = this;
        cast_locations.forEach(location => {
            // if we're out of bounds, exit instantly
            if (!game.board.position_valid(location)) {
                return;
            }
            
            // if the location is LOS untargetable never do anything
            // unless we ignore LOS
            let ent_raw = board.get_pos(location);
            if (this.stats.los && ent_raw && ent_raw.blocks_los) {
                return;
            }

            // by default we add a particle on every location affected
            if (this.stats.enable_particles) {
                renderer.put_particle_from_game_loc(location, new Particle(
                    particle_type
                ));
            }

            let targeting_predicate = sthis.stats.targeting_predicates.length > 0 ? function(e) { sthis.stats.targeting_predicates.every(p => p(e)) } : null;
            let ent = board.check_for_entity(
                location, sthis.stats.target_team, 
                sthis.stats.target_affinities, targeting_predicate
            )

            if (ent) {
                game.deal_damage(
                    ent, sthis.caster, sthis.caster.id,
                    sthis.stats.damage, sthis.stats.damage_type
                );
            }

            // trigger affected tile functions
            sthis.spells.forEach(spell => {
                if (spell.typ == SpellType.Core && sthis.stats.specials.includes(SpellSpecials.PURITY)) {
                    return;
                }

                if (spell.fns.on_affected_tiles) {
                    spell.fns.on_affected_tiles(sthis.caster, sthis, sthis.stats, location);
                }

                if (spell.fns.at_target && sthis.stats.specials.includes(SpellSpecials.SPREADINGARCANA)) { 
                    spell.fns.at_target(sthis.caster, sthis, sthis.stats, location);
                }

                if (spell.typ == SpellType.Core && sthis.stats.specials.includes(SpellSpecials.ARCANEECHO)) {
                    spell.fns.on_affected_tiles(sthis.caster, sthis, sthis.stats, location);
                }
            })

            if (!sthis.stats.specials.includes(SpellSpecials.PURITY) && sthis.stats.specials.includes(SpellSpecials.UNRESOLVEDSPELL) && game.random() < 0.2) {
                let spell = random_from_arr(spells_list.filter(s => s.is_normal() && s.typ == SpellType.Core));
                spell.fns.on_affected_tiles(sthis.caster, sthis, sthis.stats, location);
            }

            if (sthis.trigger[0] == "on_affected_tiles") {
                sthis.trigger[1].origin = location;
                sthis.trigger[1].original_cast_position = position;
                game.cast_primed_spell(sthis.trigger[1].copy(), location, true);
            }
        })

        // trigger point target functions
        this.spells.forEach(spell => {
            if (spell.typ == SpellType.Core && this.stats.specials.includes(SpellSpecials.PURITY)) {
                return;
            }

            if (spell.fns.at_target) { 
                spell.fns.at_target(this.caster, this, this.stats, position);
            }

            if (spell.typ == SpellType.Core && sthis.stats.specials.includes(SpellSpecials.ARCANEECHO)) {
                spell.fns.at_target(this.caster, this, this.stats, position);
            }
        })

        if (!sthis.stats.specials.includes(SpellSpecials.PURITY) && this.stats.specials.includes(SpellSpecials.UNRESOLVEDSPELL) && game.random() < 0.8) {
            let spell = random_from_arr(spells_list.filter(s => s.is_normal() && s.typ == SpellType.Core));
            spell.fns.at_target(this.caster, this, this.stats, position);
        }

        if (this.trigger[0] == "at_target") {
            this.trigger[1].origin = position;
            this.trigger[1].original_cast_position = position;
            game.cast_primed_spell(this.trigger[1].copy(), position, true);
        }

        // get list of damaged entities from this spell
        let keep_triggering_damage = true;
        let entities_killed = {};

        while (keep_triggering_damage) {
            keep_triggering_damage = false;

            let damaged_entities = game.get_damage_count(this.caster.id);
            // [{ent, dmg_amount, dmg_type}]
            // each instance of damage is handled separately

            if (damaged_entities) {
                keep_triggering_damage = true;
                let sthis = this;
                damaged_entities.forEach(dmg_instance => {
                    let ent = dmg_instance.ent;
                    let amt = dmg_instance.amt;
                    let typ = dmg_instance.typ;

                    sthis.spells.forEach(spell => {
                        if (spell.typ == SpellType.Core && sthis.stats.specials.includes(SpellSpecials.PURITY)) {
                            return;
                        }

                        if (spell.fns.on_hit) {
                            spell.fns.on_hit(sthis.caster, sthis, sthis.stats, ent, amt, typ);
                        }

                        if (spell.typ == SpellType.Core && sthis.stats.specials.includes(SpellSpecials.ARCANEECHO)) {
                            spell.fns.on_hit(sthis.caster, sthis, sthis.stats, ent, amt, typ);
                        }
                    })

                    if (!sthis.stats.specials.includes(SpellSpecials.PURITY) && sthis.stats.specials.includes(SpellSpecials.UNRESOLVEDSPELL) && game.random() < 0.15) {
                        let spell = random_from_arr(spells_list.filter(s => s.is_normal() && s.typ == SpellType.Core));
                        spell.fns.on_hit(sthis.caster, sthis, sthis.stats, ent, amt, typ);
                    }

                    if (sthis.trigger[0] == "on_hit") {
                        sthis.trigger[1].origin = ent.position;
                        sthis.trigger[1].original_cast_position = position;
                        game.cast_primed_spell(sthis.trigger[1].copy(), ent.position, true);
                    }

                    if (ent.dead && !entities_killed[ent.id]) {
                        entities_killed[ent.id] = ent;
                    } 
                })

                game.reset_damage_count(this.caster.id);
            }
        }

        if (this.stats.specials.includes(SpellSpecials.TURNDEAD)) {
            Object.keys(entities_killed).forEach(eid => {
                // need to restore their hp, change their team and affinities, then manually re-add them
                // this is so fucked
                let ent = entities_killed[eid];

                if (ent.team != this.caster.team) {
                    ent.revive();
                    ent.affinities = [
                        Affinity.Dark, Affinity.Undead
                    ]

                    ent.team = this.caster.team;

                    game.put_entity_obj_near(ent, ent.position);
                }
            })
        }

        if (this.stats.specials.includes(SpellSpecials.DEATHCHAIN)) {
            if (Object.keys(entities_killed).length > 0) {
                this.stats.multicasts["chain"] += 1;
                this.stats.multicast_stack.unshift(SpellMulticast.CHAIN);
            }
        }

        // check multicasts
        // NEW SYSTEM!!!! we now pop off a single multicast from the multicast stack
        // (don't actually pop) and do that one.
        // i think you will agree that is much saner. lol
        let need_to_retry_multicast = this.stats.multicast_stack.length > 0
        while (need_to_retry_multicast) {
            console.log(this.stats.multicast_stack);
            let popped_mc = this.stats.multicast_stack[0];
            
            let pos_target = null;
            let put_at_bottom = true;
            let wait_for_more = false;
            let new_origin = null;

            if (this.stats.mutable_info.last_multicast != popped_mc) {
                // clear chainspell list between different types of multicast
                console.log("cleared multicasts");

                this.stats.mutable_info["chainspell_ents"] = [];
            }

            switch (popped_mc) {
                case SpellMulticast.NORMAL:
                    pos_target = position.copy();
                    break;
                
                case SpellMulticast.CHAOSCAST:
                    pos_target = game.find_random_space_in_los(
                        caster, position, this.stats.radius + 1,
                        Shape.Diamond[1], !this.stats.los
                    );
                    break;
                
                case SpellMulticast.CHAIN:
                case SpellMulticast.ARC:
                    // chain: set origin to position and position to random ent
                    // arc: set position to random ent, retain origin
                    //      if this is first multicast, set origin to original position
                    //      if this is multicast after any non-arc multicast, set origin to original position

                    // target a random enemy in range and LOS
                    // add the target to a list and ensure they don't get chained to twice
                    if (game.board.get_pos(position)) {
                        if (this.stats.mutable_info["chainspell_ents"]) {
                            this.stats.mutable_info["chainspell_ents"].push(game.board.get_pos(position).id)
                        } else {
                            this.stats.mutable_info["chainspell_ents"] = [game.board.get_pos(position).id];
                        }
                    } else if (!this.stats.mutable_info["chainspell_ents"]) {
                        this.stats.mutable_info["chainspell_ents"] = [];
                    }

                    let positions = Shape.Circle[1](origin, position, this.stats.range, this.stats.los)
                    console.log(this.stats.mutable_info["chainspell_ents"]);
                    let ents = game.board.check_shape(
                        positions, this.stats.target_team, null, e => (e && !e.position.equals(position) && e.id != caster.id && !this.stats.mutable_info["chainspell_ents"].includes(e.id)) 
                    )

                    //console.log(ents, this.stats.mutable_info["chainspell_ents"]);
                    ents = ents.filter(e => !this.stats.mutable_info["chainspell_ents"].includes(e.id))

                    if (ents.length > 0) {
                        let ent = ents[Math.floor(game.random() * ents.length)];

                        this.stats.mutable_info["chainspell_ents"].push(ent.id);

                        if (popped_mc == SpellMulticast.CHAIN || !this.stats.mutable_info.last_multicast || this.stats.mutable_info.last_multicast != SpellMulticast.ARC) {
                            new_origin = position;
                        }

                        pos_target = ent.position;

                        if (popped_mc == SpellMulticast.ARC && this.stats.multicast_stack.length > 1 && this.stats.multicast_stack[1] == SpellMulticast.ARC) {
                            wait_for_more = true;
                        }
                    }
                    break;
                
                case SpellMulticast.BEHINDTHEBACK: {
                    let player_vector = position.sub(caster.position).mul(2);
                    pos_target = player_vector.neg().add(position);
                    break;
                }
                
                case SpellMulticast.TRIANGLE:
                case SpellMulticast.SQUARE: {
                    let player_vector = position.sub(caster.position);

                    let angle = (popped_mc == SpellMulticast.TRIANGLE ? 120 : 90) * (Math.PI / 180)
                    let rotated = player_vector.rotate(angle);
                    pos_target = rotated.add(caster.position).round();
                    break;
                }
            }

            if (pos_target) {
                let new_spell = this.copy();
                new_spell.shift_multicasts(true);

                if (new_origin) {
                    new_spell.origin = new_origin;
                    this.origin = new_origin;
                }

                game.cast_primed_spell(new_spell, pos_target, put_at_bottom, wait_for_more);
                need_to_retry_multicast = wait_for_more;
                if (wait_for_more) {
                    this.shift_multicasts();
                }

                console.log(new_spell.origin, pos_target, put_at_bottom, wait_for_more)
            } else {
                this.shift_multicasts();
                need_to_retry_multicast = this.stats.multicast_stack.length > 0;
            }
        }

        /*
        if (this.stats.multicasts["normal"] > 0) {
            // place a copy of this spell on the casting stack but decrement the value
            let new_pos = position.copy();
            let new_mc = this.stats.multicasts["normal"] - 1;
            let new_spell = this.copy();
            new_spell.stats.multicasts["normal"] = new_mc;

            //console.log(new_spell)
            game.cast_primed_spell(new_spell, new_pos, true);
        }

        else if (this.stats.multicasts["btb"] > 0) {
            // place a copy of this spell on the casting stack but decrement the value
            let player_vector = position.sub(caster.position).mul(2);
            let new_pos = player_vector.neg().add(position);

            let new_mc = this.stats.multicasts["btb"] - 1;
            let new_spell = this.copy();
            new_spell.stats.multicasts["btb"] = new_mc;

            //console.log(new_spell)
            game.cast_primed_spell(new_spell, new_pos, true);
        }

        else if (this.stats.multicasts["triangle"] > 0) {
            // place a copy of this spell on the casting stack but decrement the value
            let player_vector = position.sub(caster.position);

            let angle = 120 * (Math.PI / 180)
            let rotated = player_vector.rotate(angle);
            let new_pos = rotated.add(caster.position).round();

            let new_mc = this.stats.multicasts["triangle"] - 1;
            let new_spell = this.copy();
            new_spell.stats.multicasts["triangle"] = new_mc;

            //console.log(new_spell)
            game.cast_primed_spell(new_spell, new_pos, true);
        }

        else if (this.stats.multicasts["square"] > 0) {
            // place a copy of this spell on the casting stack but decrement the value
            let player_vector = position.sub(caster.position);

            let angle = 90 * (Math.PI / 180)
            let rotated = player_vector.rotate(angle);
            let new_pos = rotated.add(caster.position).round();

            let new_mc = this.stats.multicasts["square"] - 1;
            let new_spell = this.copy();
            new_spell.stats.multicasts["square"] = new_mc;

            //console.log(new_spell)
            game.cast_primed_spell(new_spell, new_pos, true);
        }
        
        else if (this.stats.multicasts["unpredictable"] > 0) {
            // same as "normal" but set the position to a random one based on radius
            let new_pos = game.find_random_space_in_los(caster, position, this.stats.radius + 1, Shape.Diamond[1], !this.stats.los);
            if (new_pos) {
                let new_mc = this.stats.multicasts["unpredictable"] - 1;
                let new_spell = this.copy();
                new_spell.stats.multicasts["unpredictable"] = new_mc;

                game.cast_primed_spell(new_spell, new_pos, true);
            }
        }
        
        else if (this.stats.multicasts["simultaneous"] > 0) {
            while (this.stats.multicasts["simultaneous"] > 0) {
                // same as chain but add them all right now
                if (game.board.get_pos(location)) {
                    if (this.stats.mutable_info["simultaneous_ents"]) {
                        this.stats.mutable_info["simultaneous_ents"].push(game.board.get_pos(position).id)
                    } else {
                        this.stats.mutable_info["simultaneous_ents"] = [game.board.get_pos(position).id];
                    }
                } else if (!this.stats.mutable_info["simultaneous_ents"]) {
                    this.stats.mutable_info["simultaneous_ents"] = [];
                }

                let positions = Shape.Circle[1](origin, position, this.stats.range, this.stats.los)
                //console.log(stats.mutable_info["chainspell"], stats.mutable_info["chainspell_ents"]);
                let ents = game.board.check_shape(
                    positions, this.stats.target_team, null, e => (e && e.id != caster.id && !this.stats.mutable_info["simultaneous_ents"].includes(e.id)) 
                )

                //console.log(ents, this.stats.mutable_info["simultaneous_ents"]);
                ents = ents.filter(e => !this.stats.mutable_info["simultaneous_ents"].includes(e.id))

                if (ents.length > 0) {
                    let ent = ents[Math.floor(game.random() * ents.length)];

                    let new_mc = 0;
                    this.stats.multicasts["simultaneous"] -= 1;
                    this.stats.mutable_info["simultaneous_ents"].push(ent.id);

                    let new_spell = this.copy();
                    new_spell.stats.multicasts["simultaneous"] = new_mc;
                    new_spell.stats.mutable_info["simultaneous_ents"].push(ent.id);

                    new_spell.origin = position;

                    let new_pos = ent.position;

                    let stop_wait = this.stats.multicasts["simultaneous"] > 0;
                    game.cast_primed_spell(new_spell, new_pos, true, stop_wait);
                } else {
                    this.stats.multicasts["simultaneous"] = 0;
                }
            }

            this.stats.multicasts["simultaneous"] = 0;
        }

        else if (this.stats.multicasts["chain"] > 0) {
            // target a random enemy in range and LOS
            // add the target to a list and ensure they don't get chained to twice
            if (game.board.get_pos(location)) {
                if (this.stats.mutable_info["chainspell_ents"]) {
                    this.stats.mutable_info["chainspell_ents"].push(game.board.get_pos(position).id)
                } else {
                    this.stats.mutable_info["chainspell_ents"] = [game.board.get_pos(position).id];
                }
            } else if (!this.stats.mutable_info["chainspell_ents"]) {
                this.stats.mutable_info["chainspell_ents"] = [];
            }

            let positions = Shape.Circle[1](origin, position, this.stats.range, this.stats.los)
            //console.log(stats.mutable_info["chainspell"], stats.mutable_info["chainspell_ents"]);
            let ents = game.board.check_shape(
                positions, this.stats.target_team, null, e => (e && e.id != caster.id && !this.stats.mutable_info["chainspell_ents"].includes(e.id)) 
            )

            //console.log(ents, this.stats.mutable_info["chainspell_ents"]);
            ents = ents.filter(e => !this.stats.mutable_info["chainspell_ents"].includes(e.id))

            if (ents.length > 0) {
                let ent = ents[Math.floor(game.random() * ents.length)];

                let new_mc = this.stats.multicasts["chain"] - 1;
                this.stats.mutable_info["chainspell_ents"].push(ent.id);

                let new_spell = this.copy();
                new_spell.stats.multicasts["chain"] = new_mc;
                new_spell.stats.mutable_info["chainspell_ents"].push(ent.id);

                new_spell.origin = position;

                let new_pos = ent.position;
                game.cast_primed_spell(new_spell, new_pos, true);
            }
        }
        */

        // reset origin (TODO test :))
        this.origin = null;
        this.original_cast_position = null;
    }
}


// TODO move to other file after we implement locations
const EventType = {
    Battle: "Battle",           
    Elite: "Elite",             
    Boss: "Boss",               
    Event: "Event",             
    GoodEvent: "Good Event",    
    RareEvent: "Rare Event",    
}

const event_type_to_icon = {
    "Battle": "X.",
    "Elite": "X!",
    "Boss": "XX",
    "Event": "??",
    "Good Event": "?+",
    "Rare Event": "?!",
}

const event_type_to_colour = {
    "Battle": "#d60",
    "Elite": "#f00",
    "Boss": "#f4f",
    "Event": "#fff",
    "Good Event": "#cfc",
    "Rare Event": "#8f8",
}


class Game {
    constructor(board) {
        this.TPS = 60;

        this.board = board;
        this.player_ent = null;
        this.entities = [];
        this.recorded_damage = {};  // indexed by caster id and name
        this.current_wave_damage = {};
        this.damage_counts = {};    // indexed by spell id

        this.wavecount = 0;
        this.turncount = 0;
        this.location_count = 0;

        this.spawn_credits_base = 30;
        this.spawn_credits_gain = 30;
        this.spawn_credits_mult = 1.0015;
        
        this.wave_entities = {};

        this.player_spells = [
            {spells: [], name: "Spell 1"},
            {spells: [], name: "Spell 2"},
            {spells: [], name: "Spell 3"},
            {spells: [], name: "Spell 4"},
            {spells: [], name: "Spell 5"}
        ];
        this.selected_id = -1;
        this.selected_player_spell = null;
        this.selected_player_primed_spell = null;
        this.player_xp = 0;
        this.player_level = 1;
        this.player_skill_points = 0;
        this.player_inventory = [];
        this.player_spells_edit = [[], [], [], [], []];
        this.player_emblems = [];

        this.player_max_spell_shards = 20;
        this.player_inventory_size = 60;

        for (let i=0; i<this.player_max_spell_shards; i++) {
            this.player_spells_edit[0].push(null);
            this.player_spells_edit[1].push(null);
            this.player_spells_edit[2].push(null);
            this.player_spells_edit[3].push(null);
            this.player_spells_edit[4].push(null);
        }

        for (let i=0; i<this.player_inventory_size; i++) {
            this.player_inventory.push(null);
        }

        // TODO dummy data
        this.player_location = new GameLocation(location_templates[0], [
            EventType.Battle,
            EventType.Elite,
            EventType.Boss,
            EventType.Event,
            EventType.GoodEvent,
            EventType.RareEvent
        ])
        this.player_location_progress = 6;

        // current turn; pops spells off this stack one by one for the purposes of animation
        // anything that casts a spell goes through here first
        this.casting_stack = []
        this.waiting_for_spell = false;
        this.checker_interval = null;

        this.max_spell_speed = 0.075;
        this.min_spell_speed = 0;

        this.spell_speed = 100;
        this.spell_stack_timeout = 0;

        this.spells_this_turn = 0;

        this.turn_index = 0  // index into entities

        this.inventory_open = false;
        this.recent_spells_gained = [];

        this.enabled = false;
        this.turn_processing = false;
        this.ready_for_wave_end = true;

        this.turn_finished = false;
        this.need_ai_call = true;
        this.safe_to_skip_wait = false;

        this.needs_main_view_update = true;

        this.random_seed = Math.random().toString()
        this.random = get_seeded_randomiser(this.random_seed)
    }

    // These are not copied by the naive copy straight from JSON. Everything else is.
    // This also refers to things which shouldn't be added to the save string.
    // Things in here will not be (automatically) added to the saved string, or copied to the entity on load.
    static ignored_entity_properties = [
        "specials", "specials_text", "is_player", "template_id", "template", "innate_spells",
        "innate_primed_spells", "position", "is_wave_entity"
    ]

    static required_save_properties = [
        "id"
    ]

    static make_game_from_save_string(save_str) {
        // the way we're gonna do this is make a new game and board instance, then return that
        let decoded_save = atob(save_str);
        let save = JSON.parse(decoded_save);

        let new_board = new Board(new Vector2(
            save.board_size.x,
            save.board_size.y,
        ))

        let new_game = new Game(new_board);

        new_game.player_xp = save.player.xp;
        new_game.player_level = save.player.level;
        new_game.player_skill_points = save.player.skill_points;
        new_game.player_emblems = save.player.emblems.map(e => get_emblem_by_iname(e));
        
        new_game.player_spells = save.player.spells.map(sp => {
            return {
                spells: gen_spells(...sp.spells),
                name: sp.name
            }
        })

        new_game.player_spells_edit = save.player.spells_edit.map(sp => {
            return sp.map(s => s ? get_spell_by_name(s) : s)
        })

        new_game.player_inventory = save.player.inventory.map(sp => {
            return sp ? get_spell_by_name(sp) : sp
        })

        new_game.wavecount = save.state.wavecount;
        new_game.turncount = save.state.turncount;
        new_game.location_count = save.state.location_count;

        new_game.player_location = new GameLocation(location_templates[save.state.player_location_id], save.state.player_location_events);
        new_game.player_location_progress = save.state.player_location_progress

        new_game.turn_index = save.state.current_turn_entity;
        new_game.inventory_open = save.state.inventory_open;
        new_game.recorded_damage = save.state.recorded_damage;
        new_game.current_wave_damage = save.state.current_wave_damage;

        // fill the board with entities
        save.entities.forEach(ent => {
            // pretty much everything from the entity can be changed,
            // so we need to bring everything over. there's a few things like
            // position, innate_primed_spells and innate_spells
            // which we need to do a bit more work to reconstruct, too
            /*
                NON-ENTITY INFORMATION TO INGEST:
                    - is this the player entity
                    - is this a wave entity
                    - template ID

                OBJECT STRUCTURES TO REMAKE:
                    - position (Vector2)
                    - innate_spells [array of spells by ID, cooldown, name, colour]
                    - innate_primed_spells (only cooldowns, the spell itself should be calculated from innate_spells)
            
                PROPERTIES TO IGNORE:
                    - specials (it's too much to copy these since they're literally functions)
                    - specials_text (if we can't modify specials, we shouldn't modify specials_text)
            */
            // so, the plan is:
            // - get the template ID, make the entity
            // - copy over all the other non-ignored properties we use.
            //       if the key is not present in the save, don't copy it (it's unchanged)
            // - manually remake the other structures
            // - make sure the game agrees with all this information
            // - make sure the board knows where the entity is (do this with move_entity)
        
            let entity_template = entity_templates[ent.template_id];
            let new_ent = new Entity(entity_template, ent.team);

            Object.keys(ent).forEach(k => {
                if (!Game.ignored_entity_properties.includes(k)) {
                    if (ent[k]) {
                        new_ent[k] = ent[k]
                    }
                }
            })

            new_ent.position = new Vector2(ent.position.x, ent.position.y);

            // untargetable entities shouldnt be saved in their entirety. that's silly
            if (!new_ent.untargetable) {
                new_ent.innate_spells = ent.innate_spells.map((s, i) => {
                    return [s[0].map((sp, j) => {
                        // If the spell has a name instead of being null,
                        // this means it's been replaced.
                        return sp ? get_spell_by_name(sp) : new_ent.template.innate_spells[i][0][j]
                    }), s[1], s[2], s[3]]
                })
                new_ent.calculate_primed_spells(new Vector2(0, 0));

                // NOTE THAT THIS IS A DIFFERENT STRUCTURE; WE REMOVE THE ARRAY [root_spell, cooldown]
                // AND INSTEAD REPLACE IT WITH JUST cooldown
                ent.innate_primed_spells.forEach((ps, i) => {
                    new_ent.innate_primed_spells[i][1] = ps
                })

                let original_record_key = ent.id.toString() + "|" + (ent.name ? ent.name : new_ent.template.name);
                let new_record_key = new_ent.id.toString() + "|" + new_ent.name;

                new_game.recorded_damage[new_record_key] = new_game.recorded_damage[original_record_key];

                new_game.current_wave_damage[new_record_key] = new_game.current_wave_damage[original_record_key];
                
                if (original_record_key != new_record_key) {
                    delete new_game.recorded_damage[original_record_key]
                    delete new_game.current_wave_damage[original_record_key]
                }
            }

            if (ent.is_player) {
                new_game.player_ent = new_ent;
            }

            if (ent.is_wave_entity) {
                new_game.wave_entities[new_ent.id] = new_ent
            }

            new_game.put_entity_obj(new_ent, new_ent.position, true);
        })

        return new_game;
    }

    to_save_string() {
        /* need to save:
        
        - board size
        - stats and position of every entity, IN THE ORDER OF THE GAME ENTITIES LIST, including if the entity is a wave entity or not
        - current entity in the turn order
        - player xp, skill points
        - the state of the random generator (a,b,c,d, pass true as the first param to rand() to get this)
        - the state of unknown incantation and its effects
        - whether we're in the inventory or in the game
        - player emblems (TODO isnt implemented yet)
        - player spells, player spell names, player inventory
        - state of the damage records? though we don't use them, would be nice to have
        */
        let save = {player: {}, state: {}};

        save.board_size = {x: this.board.dimensions.x, y: this.board.dimensions.y};

        save.player.xp = this.player_xp;
        save.player.level = this.player_level;
        save.player.skill_points = this.player_skill_points;
        save.player.emblems = this.player_emblems.map(e => e.iname);
        
        save.player.spells = this.player_spells.map(sp => {
            return {
                spells: sp.spells.map(s => s.name),
                name: sp.name
            }
        });

        save.player.spells_edit = this.player_spells_edit.map(sp => {
            return sp.map(s => s ? s.name : s)
        });

        save.player.inventory = this.player_inventory.map(sp => {
            return sp ? sp.name : sp
        });

        save.state.wavecount = this.wavecount;
        save.state.turncount = this.turncount;
        save.state.location_count = this.location_count;

        save.state.player_location_id = this.player_location.template.id;
        save.state.player_location_events = this.player_location.events;
        save.state.player_location_progress = this.player_location_progress;

        save.state.current_turn_entity = this.turn_index;
        save.state.inventory_open = this.inventory_open;
        save.state.recorded_damage = this.recorded_damage;
        save.state.current_wave_damage = this.current_wave_damage;

        save.entities = this.entities.map(ent => {
            let o = {};
            
            // - template_id, is_player, is_wave_entity
            // - copy over all the other non-ignored properties
            // - manually remake:
            //      position (Vector2), 
            //      innate_spells (same but replace spell objs with strings of the spell names),
            //      innate_primed_spells (replace [primedspell, cooldown] with just cooldown)
            o.template_id = ent.template.id;
            if (ent.id == this.player_ent.id) {
                o.is_player = true;
            }

            if (game.wave_entities[ent.id]) {
                o.is_wave_entity = true;
            }

            // untargetable entities shouldnt be saved in their entirety. that's silly
            if (!ent.untargetable) {
                Object.keys(ent).forEach(k => {
                    if (!Game.ignored_entity_properties.includes(k)) {
                        if (ent[k] != ent.template[k] || Game.required_save_properties.includes(k)) {
                            o[k] = ent[k];
                        }
                    }
                })
            }

            o.position = {x: ent.position.x, y: ent.position.y};

            if (!ent.untargetable) {
                o.innate_spells = ent.innate_spells.map((sp, i) => {
                    return [sp[0].map((s, j) => {
                        // check if the fragment at this index is present in innate_spells,
                        // and is the same fragment ID.
                        // if it is, return null, else return the fragment name
                        // (new fragments should only be added to entities if they are part of the main list; no custom fragments unless they're part of that main list)
                        if (ent.template.innate_spells[i] && ent.template.innate_spells[i][0][j].id == s.id) {
                            return null;
                        } else {
                            return s.name;
                        }
                    }), sp[1], sp[2], sp[3]]
                })

                o.innate_primed_spells = ent.innate_primed_spells.map(sp => {
                    return sp[1];
                })
            }

            return o;
        });

        console.log(save);
        return btoa(JSON.stringify(save));
    }

    setup() {
        this.turn_processing = true;
        this.enabled = true;
        this.turn_finished = true;

        let sthis = this;
        this.checker_interval = setInterval(function() {
            sthis.interval_checker(sthis);
        }, (1000/this.TPS));
    }

    spawn(ent_name, at, team) {
        let ent = get_entity_by_name(ent_name)
        let pos = at ? at : this.select_far_position(this.player_ent.position, 16, 2, 8);

        let ent_obj = null;
        if (pos) {
            ent_obj = this.spawn_entity(ent, team ? team : Teams.ENEMY, pos, false);
        }

        if (ent_obj) {
            console.log("Spawned", ent_obj, "at", pos);
        } else {
            console.log("Spawning", ent, "failed (at pos:", pos, ")");
        }
    }

    reset_with_alg(alg, cvr) {
        for (let x=0; x<this.board.dimensions.x; x++) {
            for (let y=0; y<this.board.dimensions.y; y++) {
                let p = new Vector2(x, y);
                let e = this.board.get_pos(p);
                if (e && e.id != this.player_ent.id) {
                    this.kill(e, true);
                }
            }
        }

        this.move_player(new Vector2(
            Math.floor(this.board.dimensions.x / 2),
            Math.floor(this.board.dimensions.y / 2)
        ));

        this.turn_index = 0;

        this.worldgen(alg, cvr);
    }

    worldgen(alg, cvr) {
        let success = false;

        for (let i=0; i<256; i++) {
            // console.log(`Attempting worldgen (try #${i+1})`)
            success = alg(this, this.board, cvr);
            if (success) {
                break;
            }
        }
    }

    player_discard_edits() {
        for (let i=0; i<this.player_max_spell_shards; i++) {
            for (let t=0; t<5; t++) {
                this.player_spells_edit[t][i] = i < this.player_spells[t].spells.length ? this.player_spells[t].spells[i] : null;
            }
        }
    }

    player_commit_edits() {
        for (let t=0; t<5; t++) {
            this.player_spells[t].spells = [];
        }

        for (let i=0; i<this.player_max_spell_shards; i++) {
            for (let t=0; t<5; t++) {
                if (this.player_spells_edit[t][i]) {
                    this.player_spells[t].spells.push(this.player_spells_edit[t][i]);
                }
            }
        }
    }

    player_swap_spells(a, b) {
        // spell_id, frag_id, inv_id
        if (a.inv_id != undefined) {
            this.player_inventory[a.inv_id] = b.spell;
        } else if (a.spell_id != undefined && a.frag_id != undefined) {
            this.player_spells_edit[a.spell_id][a.frag_id] = b.spell;
        }

        if (b.inv_id != undefined) {
            this.player_inventory[b.inv_id] = a.spell;
        } else if (b.spell_id != undefined && b.frag_id != undefined) {
            this.player_spells_edit[b.spell_id][b.frag_id] = a.spell;
        }

        this.player_commit_edits();
    }

    player_add_spells_to_inv(spells) {
        spells.forEach(spell => {
            this.player_add_spell_to_inv(spell);
        })
    }

    player_add_spell_to_inv(spell) {
        for (let i=0; i<this.player_inventory_size; i++) {
            if (!this.player_inventory[i]) {
                this.player_inventory[i] = spell;
                this.recent_spells_gained.push(i);
                return true;
            }
        }

        return false;
    }

    player_get_spell_affected_tiles(target_pos) {
        let vecs_added = new Set();

        let vec_set = [];
        // spell, target, origin, original_cast_position
        let dive_spells = [[this.selected_player_primed_spell.root_spell, target_pos, this.player_ent.position, this.player_ent.position]];
        while (dive_spells.length > 0) {
            let new_dive_spells = [];

            dive_spells.forEach(dive_spell => {
                // also apply retarget each time
                let retargeted_pos = dive_spell[0].get_retarget_position(
                    this.board, this.player_ent, dive_spell[2], dive_spell[1], dive_spell[3]
                )

                let full_new_vecs = dive_spell[0].get_affected_tiles(
                    this.board, dive_spell[2], retargeted_pos
                )

                let new_vecs = full_new_vecs.filter(vec => !vecs_added.has(vec.hash_code()))

                if (new_vecs.length > 0) {
                    vec_set.push(new_vecs)
                }

                new_vecs.forEach(vec => vecs_added.add(vec.hash_code()));

                if (dive_spell[0].trigger) {
                    let trigger_typ = dive_spell[0].trigger[0];
                    let trigger_spell = dive_spell[0].trigger[1];

                    switch (trigger_typ) {
                        case "at_target":
                            new_dive_spells.push([trigger_spell, retargeted_pos, retargeted_pos]);
                            break;

                        case "on_hit":
                            full_new_vecs.forEach(vec => {
                                let ent = board.get_pos(vec);

                                if (ent && ent.get_damage_mult(dive_spell[0].stats.damage_type) != 0) {
                                    // TODO may fall down on damage manipulation stuff or more complex spell interactions
                                    // will probably need to mark them somehow or something if i really want this to work
                                    new_dive_spells.push([trigger_spell, ent.position, ent.position, retargeted_pos]);
                                }
                            })
                            break;

                        case "on_affected_tiles":
                            full_new_vecs.forEach(vec => {
                                new_dive_spells.push([trigger_spell, vec, vec, retargeted_pos]);
                            })
                            break;
                    }
                }
            })

            dive_spells = new_dive_spells;
        }

        return vec_set;
    }

    trigger_event(tags, search_string) {
        let possible_events = [];
        if (tags) {
            possible_events = events_list_unsorted.filter(evt => {
                return tags.every(tag => evt.tags.includes(tag))
            })
        } else {
            possible_events = events_list_unsorted.slice()
        }

        possible_events = possible_events.filter(evt => {
            return (!search_string) || evt.name.toLowerCase().includes(search_string.toLowerCase());
        });

        let chosen_event_index = Math.floor(game.random() * possible_events.length);
        
        let msgbox = possible_events[chosen_event_index].msgbox;

        renderer.add_messagebox(msgbox);
    }

    drop_spawn_protection() {
        this.entities.forEach(ent => {
            ent.spawn_protection = false;
        })
    }

    close_inventory() {
        if (!this.inventory_open) {
            return;
        }

        this.inventory_open = false;
        this.recent_spells_gained = [];
    }

    open_inventory() {
        if (this.inventory_open) {
            return;
        }

        this.inventory_open = true;

        if (this.player_skill_points > 0) {
            let sp = this.player_skill_points;
            for (let lvm=0; lvm<sp; lvm++) {
                let lvl = this.player_level - this.player_skill_points + lvm + 1;

                let msgbox = messagebox_templates.lvlup_normal;
                if (lvl % 10 == 0) {
                    msgbox = messagebox_templates.lvlup_msgbox_lv10
                } else if (lvl % 5 == 0) {
                    msgbox = messagebox_templates.lvlup_msgbox_lv5
                }

                let new_text = msgbox.text.replace("###", lvl.toString());

                msgbox = msgbox.change_text(new_text);

                renderer.add_messagebox(msgbox);
            }
        }

        this.refresh_right_panel = true;
        this.refresh_left_panel = true;
    }

    toggle_inventory() {
        if (this.inventory_open) {
            this.close_inventory();
        } else {
            this.open_inventory();
        }
    }

    progress_location(location_entering) {
        this.player_location = location_entering;

        this.location_count++;
        this.player_location_progress = -1;
        this.ready_for_wave_end = true;

        this.check_wave_end(true);
    }

    progress_wave() {
        this.wavecount++;
        this.player_location_progress++;

        let spawn_credits = this.spawn_credits_base;
        spawn_credits += this.spawn_credits_gain * this.wavecount;
        spawn_credits *= Math.pow(this.spawn_credits_mult, this.wavecount);
        spawn_credits = Math.floor(spawn_credits);

        let max_credits = spawn_credits;

        console.log("spawn credits:", spawn_credits);

        let ids_already_picked = new Set();

        let picked_enemy_spawns = [];
        let spawning = true;
        while (spawning) {
            spawning = false;

            let lower_bound = Math.max(0, spawn_credits * 0.1);
            let upper_bound = Math.min(spawn_credits, Math.max(max_credits * 0.1, spawn_credits * 0.5));

            let possible_spawns = entity_templates.filter(
                template => template.spawn_credits >= lower_bound && template.spawn_credits <= upper_bound && !ids_already_picked.has(template.id)
            );

            if (possible_spawns.length > 0) {
                spawning = true;

                let picked_ent = possible_spawns[Math.floor(game.random() * possible_spawns.length)];
                let num_to_spawn = 1;
                let adding_enemy_count = true;
                let cost = picked_ent.spawn_credits;

                while (adding_enemy_count) {
                    adding_enemy_count = false;

                    let new_cost = cost + picked_ent.spawn_credits;

                    // multiple should only be spawned if their overall cost is <30% max credits
                    // (to make sure that "boss" entities "graduate" to fodder once wave goes high enough)
                    let can_spawn_multiple = (picked_ent.spawn_credits < (max_credits * 0.3) || num_to_spawn <= 1);

                    // if affordable
                    if (new_cost < spawn_credits && can_spawn_multiple) {
                        if (true) {
                            // if random chance (1 / (n+1)) is successful
                            if (game.random() < (1 / ((num_to_spawn / 5) + 1))) {
                                num_to_spawn++;
                                adding_enemy_count = true;
                            }
                        }
                    }

                    cost = new_cost;
                }

                spawn_credits -= cost;
                picked_enemy_spawns.push({
                    ent: picked_ent, cnt: num_to_spawn, cost: cost
                });

                ids_already_picked.add(picked_ent.id);
            }
        }

        console.log("picked spawns:\n" + picked_enemy_spawns.map(e => {
            return ("- " + e.ent.name + " x" + e.cnt).padEnd(40) + `(${e.cost})`
        }).join("\n"))

        picked_enemy_spawns.forEach(spawn => {
            // try to spawn far from the player:
            let last_spawn_pos = this.player_ent.position;

            for (let i=0; i<spawn.cnt; i++) {
                let position = null;

                let radius = 33;
                if (i != 0) {
                    radius = 2;
                }
                let tries = 200;
                while (!position && tries > 0) {
                    radius += (i == 0 ? -1 : 1);
                    tries -= 1;
                    if (radius < 4) {
                        radius = 32;
                    }

                    if (radius > 32) {
                        radius = 2;
                    }

                    let circle_pos = random_on_circle(radius).round();
                    let game_pos = last_spawn_pos.add(circle_pos);
                    if (this.board.position_valid(game_pos) && !this.board.get_pos(game_pos)) {
                        position = game_pos;
                        last_spawn_pos = game_pos;
                    }
                }

                //console.log("Spawning entity", spawn.ent);
                let ent = this.spawn_entity(spawn.ent, Teams.ENEMY, position, false);
                if (ent) {
                    this.wave_entities[ent.id] = ent;
                    ent.spawn_protection = false;  // wave enemies dont get spawn protection
                }
            }
        });
    }

    // Might select null. Ensure we check if it does
    select_far_position(from_pos, start_radius, tries_per_radius, min_radius) {
        let min_r = min_radius ? min_radius : 4;
        let tries_per_r = tries_per_radius ? tries_per_radius : 1;

        let radius = start_radius + 1;
        let tries = (start_radius - min_r) * 4;
        while (tries > 0) {
            tries -= 1;
            for (let i=0; i<tries_per_r; i++) {
                radius -= 1;
                if (radius < min_r) {
                    radius = start_radius;
                }

                let circle_pos = random_on_circle(radius).round();
                let game_pos = from_pos.add(circle_pos);
                if (this.board.position_valid(game_pos) && !this.board.get_pos(game_pos)) {
                    return game_pos;
                }
            }
        }

        return null;
    }

    interval_checker(game) {
        if (game.player_ent.dead) {
            clearInterval(game.checker_interval);
            console.log("PLAYER DIED!!! ABORT!!! ABORT!!!!");
            return;
        }

        // if the turn hasn't ended yet, check the spell stack. if it has, progress the turn.
        if (!game.turn_processing) {
            return;
        }

        if (game.turn_finished) {
            let turns_taken_at_once = 0;
            while (game.turn_finished) {
                let ent = game.entities[game.turn_index]
                ent.do_end_turn();

                let can_skip_wait = game.safe_to_skip_wait;
                game.safe_to_skip_wait = false;

                let valid_ent = false;
                while (!valid_ent) {
                    game.turn_index = (game.turn_index + 1) % game.entities.length;
                    game.turncount++;

                    if (game.entities[game.turn_index].ai_level != 999) {
                        valid_ent = true;
                    }
                }

                game.check_wave_end();

                if (renderer.selected_ent) {
                    console.log("game asked for turn-end right panel refresh");
                    renderer.refresh_right_panel = true;
                }

                game.begin_turn();

                turns_taken_at_once++;
                if (can_skip_wait) {
                    let ent = game.entities[game.turn_index];
                    ent.do_turn();
                    game.need_ai_call = false;
                } else {
                    break;
                }
            }

            //console.log(`ended turn for ${turns_taken_at_once} entities at once this time`);
        } else {
            if (game.need_ai_call) {
                let ent = game.entities[game.turn_index];
                ent.do_turn();
                game.need_ai_call = false;
            }

            game.spell_stack_timeout -= (1/game.TPS);
            if (game.spell_stack_timeout <= 0) {
                game.spell_stack_timeout = game.spell_speed;
                game.check_spell_stack();
            }
        }
    }

    check_wave_end(now) {
        if (this.ready_for_wave_end && Object.keys(this.wave_entities).length <= 0) {
            // do mid-wave stuff here too
            this.enabled = false;
            this.turn_processing = false;

            this.reset_wave_damage();

            // we need to open up a popup here before we continue - so here we show the notification
            // then exit out and let the notification popup reset our progress
            if (this.player_location_progress >= 5) {
                this.ready_for_wave_end = false;
                this.show_location_select_popup();
                return;
            }

            let sthis = this;
            setTimeout(function() {
                console.log("new wave:     ", sthis.wavecount + 1);

                // sthis.player_ent.refresh();
                sthis.move_player(new Vector2(
                    Math.floor(sthis.board.dimensions.x / 2),
                    Math.floor(sthis.board.dimensions.x / 2),
                ))

                sthis.open_inventory();
                sthis.deselect_player_spell();

                renderer.render_game_checkerboard("black");
                renderer.reset_selections();
                renderer.render_inventory_menu();

                setTimeout(function() {
                    sthis.enabled = true;

                    // TODO this might be fucked up and broken :3
                    sthis.turn_processing = true;
                    sthis.begin_turn();

                    let algs = sthis.player_location.generators;
                    let alg = algs[Math.floor(game.random() * algs.length)];
                    // TODO reset once, then each alg should do something to the map.
                    // we're gonna have algs be functions that take in a tile type (or multiple) and return a generator for that tile type
                    // so no more location.walls
                    sthis.reset_with_alg(
                        alg[0], alg[1] + (game.random() * (alg[2] - alg[1]))
                    )

                    sthis.progress_wave();

                    // show popup for selecting a location here, or the start of game popup if wave 1
                    if (sthis.player_location_progress >= 6) {
                        sthis.show_location_select_popup();
                    }

                    renderer.refresh_left_panel = true;
                    renderer.refresh_right_panel = true;
                });
            }, now ? 0 : 1000);
        }
    }

    show_location_select_popup() {
        if (this.wavecount <= 1) {
            renderer.add_messagebox(messagebox_templates.start_of_game_popup);
        } else {
            // pick 3 locations and 3 sets of events for them
            let locations = [];
            for (let i=0; i<3; i++) {
                let loc = [null, []];

                // select a random location
                let ok = false;
                while (!ok) {
                    loc[0] = location_templates[
                        Math.floor(this.random() * location_templates.length)
                    ];

                    if (!locations.some(l => l[0].name == loc[0].name)) {
                        ok = true;
                    }
                }

                // select events
                let forced_next_event = null;
                for (let e=0; e<6; e++) {
                    if (forced_next_event) {
                        loc[1].push(forced_next_event);
                        forced_next_event = null;
                    } else {
                        if (e == 0) {
                            // if this is the first event, it's a 50/50 between Battle and Event.
                            let ran = this.random();
                            if (ran < 0.5) {
                                loc[1].push(EventType.Battle);
                            } else {
                                loc[1].push(EventType.Event);
                            }
                        } else if (e == 5) {
                            // if this is the last event, it can only be
                            // a battle or an event:
                            // Battle: 40%
                            // Event: 30%
                            // Good Event: 20%
                            // Rare Event: 10%
                            let ran = this.random();
                            if (ran < 0.4) {
                                loc[1].push(EventType.Battle);
                            } else if (ran < 0.7) {
                                loc[1].push(EventType.Event);
                            } else if (ran < 0.9) {
                                loc[1].push(EventType.GoodEvent);
                            } else {
                                loc[1].push(EventType.RareEvent);
                            }
                        } else {
                            // Battle: 40%
                            // Elite: 20%
                            // Boss: 10%
                            // Event: 20%
                            // Good Event: 10%
                            // Rare Event: 0%
                            let ran = this.random();
                            if (ran < 0.4) {
                                loc[1].push(EventType.Battle);
                            } else if (ran < 0.6) {
                                loc[1].push(EventType.Elite);
                                forced_next_event = EventType.GoodEvent;
                            } else if (ran < 0.7) {
                                loc[1].push(EventType.Boss);
                                forced_next_event = EventType.RareEvent;
                            } else if (ran < 0.9) {
                                loc[1].push(EventType.Event);
                            } else {
                                loc[1].push(EventType.GoodEvent);
                            }
                        }
                    }
                }

                locations.push(loc);
            }

            // now need to build the popup
            let sthis = this;
            let msgbox_template = new MessageBoxTemplate(
                "NEXT SHARD: CHOICE",
                "As you reach the end of this shard, you glimpse paths to three more. With the world crumbling in your wake, you must choose where to go next.\n" +
                (locations.map(loc => {
                    let clearance_x = 80;
                    let path_pad_size = Math.floor((clearance_x-3) / game.player_location.events.length);

                    let names_str = loc[1].map(l => `[${event_type_to_colour[l]}]${renderer.pad_str(l, path_pad_size, 2)}[clear]`).join("  ");

                    return `
[${loc[0].col}]${loc[0].name}[clear]
[#bbb]${loc[0].desc}[clear]

${names_str}\n[#666]----${renderer.make_location_path_string(sthis, clearance_x, loc[1], -1)}[#666]---->\n`
                })).join("\n"),
                locations.map(l => l[0].name),
                locations.map(l => l[0].bgcol),
                [
                    function() {
                        renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
                        renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;

                        let entering = new GameLocation(locations[0][0], locations[0][1]);
                        game.progress_location(entering);
                    },

                    function() {
                        renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
                        renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;

                        let entering = new GameLocation(locations[1][0], locations[1][1]);
                        game.progress_location(entering);
                    },

                    function() {
                        renderer.msgbox_pad_x = renderer.default_msgbox_pad_x;
                        renderer.msgbox_pad_y = renderer.default_msgbox_pad_y;

                        let entering = new GameLocation(locations[2][0], locations[2][1]);
                        game.progress_location(entering);
                    }
                ],
                function(msgbox) { 
                    renderer.msgbox_pad_x -= 0;
                    renderer.msgbox_pad_y -= 0;
                }
            )

            renderer.add_messagebox(msgbox_template);
        }
    }

    begin_turn() {
        if (!this.turn_processing) {
            return;
        }
        
        // we then periodically check the casting stack to see if there's anything on there.
        // if there is, we cast it and set waiting_for_spell to true, which means
        // that once we clear out the casting stack the current entity's turn will end.
        this.spell_speed = this.max_spell_speed;
        this.spells_this_turn = 0;
        
        this.casting_stack = [];
        this.waiting_for_spell = true;
        this.need_ai_call = true;
        this.turn_finished = false;
    }

    cast_primed_spell(primed_spell, position_target, insert_at_bottom, wait_for_more) {
        //console.log("enqueued", primed_spell, "at", position_target);
        if (insert_at_bottom) {
            this.casting_stack.unshift({spell: primed_spell, target: position_target, wait_for_more: wait_for_more});
        } else {
            this.casting_stack.push({spell: primed_spell, target: position_target, wait_for_more: wait_for_more});
        }
    }

    check_spell_stack() {
        if (!this.turn_processing) {
            return;
        }

        let turn_ent = this.entities[this.turn_index];
        let turncount = this.turncount;

        // primed spells go on the spell stack so they can be cast instantly
        // they are given as a collection of {spell, target}
        //console.log("checking spell stack");
        //console.log("casting stack:", this.casting_stack, "waiting:", this.waiting_for_spell);
        if (this.casting_stack.length > 0) {
            let coalescing = true;
            let spells_to_cast = [];
            while (coalescing && this.casting_stack.length > 0) {
                let spell_to_cast = this.casting_stack.pop();
                //console.log("popping spell off stack:", spell_to_cast, "for",  this.entities[this.turn_index]);
                spells_to_cast.push(spell_to_cast);
            
                if (!spell_to_cast.wait_for_more) {
                    coalescing = false;
                }
            }

            for (let i=0; i<spells_to_cast.length; i++) {
                let spell_to_cast = spells_to_cast[i];
                spell_to_cast.spell.cast(this.board, this.entities[this.turn_index], spell_to_cast.target);
            }

            this.waiting_for_spell = false;

            this.spells_this_turn++;
            
            let n = Math.min(1, (this.spells_this_turn * this.spells_this_turn) / 2000);
            this.spell_speed = ((1-n) * this.max_spell_speed) + (n * this.min_spell_speed);

            /*
            let me = this;
            this.checker_interval = setTimeout(function() {
                me.check_spell_stack();
            }, this.spell_speed);
            */
        } else {
            if (!this.waiting_for_spell) {
                //console.log("ending turn for", this.entities[this.turn_index]);
                this.end_turn(turn_ent, turncount);
                /*
                let sthis = this;
                let interval = this.entities[this.turn_index].id == this.player_ent.id ? this.spell_speed * 5 : this.spell_speed;
                setTimeout(function() {
                    sthis.end_turn(turn_ent, turncount)
                }, interval);
                */
            } else {
                /*
                let me = this;
                this.checker_interval = setTimeout(function() {
                    me.check_spell_stack();
                }, this.spell_speed);
                */
            }
        }
    }

    end_turn(ent_ending_turn, turncount, do_not_wait) {
        // if (!this.enabled) {
        //     return;
        // }

        this.needs_main_view_update = true;

        if (turncount != this.turncount) {
            // ensure the turn end event was called for this specific turn
            console.log(`rejected turn end because turncount didn't match: ${turncount} != ${this.turncount}`)
            debugger;
            return;
        }

        if (ent_ending_turn.id != this.entities[this.turn_index].id) {
            // ensure the entity ending the turn is the actual entity whose turn it is
            console.log(`rejected turn end because entity didn't match: `, ent_ending_turn, `!=`, this.entities[this.turn_index])
            debugger;
            return;
        }

        this.waiting_for_spell = false;
        this.spell_speed = this.max_spell_speed;
        this.spells_this_turn = 0;
        
        this.turn_finished = true;
        this.need_ai_call = true;
        this.safe_to_skip_wait = Boolean(do_not_wait);
    }

    is_player_turn() {
        return this.entities[this.turn_index].id == this.player_ent.id && this.waiting_for_spell;
    }

    get_xp_for_levelup(level) {
        if (level == 1) {
            return 50;
        }

        return Math.round((89 + (10 * level) + Math.pow(level, 1.5)) * ((level+1) % 5 == 0 ? ((level+1) % 10 == 0 ? 2 : 1) : 0.5));
    }

    player_gain_xp(amount) {
        this.player_xp += amount;
        while (this.player_try_level_up()) {
            // make particles
            /*
            for (let x=-1; x<2; x++) {
                for (let y=-1; y<2; y++) {
                    renderer.put_particle_from_game_loc(this.player_ent.position.add(new Vector2(x, y)), new Particle(
                        lvl_flash
                    ));
                }
            }
            */
        }
    }

    player_try_level_up() {
        let xp_req = this.get_xp_for_levelup(this.player_level);
        if (this.player_xp >= this.get_xp_for_levelup(this.player_level)) {
            this.player_level++;
            this.player_skill_points++;
            this.player_xp -= xp_req;

            // TEMPORARY: +25 hp, +50 mp per level
            // this.player_ent.max_hp += 25
            // this.player_ent.max_mp += 50
            // this.player_ent.refresh()

            return true;
        }

        return false;
    }

    player_spell_in_range(position) {
        return this.selected_player_primed_spell.root_spell.in_range(this.player_ent, position);
    }

    player_cast_selected(at, ignore_turn) {
        if (!game.is_player_turn() && !ignore_turn) {
            return;
        }

        this.player_cast_spell(this.selected_player_spell, at);
        this.deselect_player_spell();
    }

    player_cast_spell(spells, at, ignore_turn) {
        if (!game.is_player_turn() && !ignore_turn) {
            return;
        }

        if (!this.enabled) {
            return;
        }

        if (spells && spells.length > 0) {
            if (this.player_spell_in_range(at)) {
                this.player_ent.cast_spell(spells, at);
            }
        }
    }

    test_xpvalue_effects(xpvalue_from, xpvalue_to, xpvalue_step, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity) {
        let outputs = [];
        for (let xp_value=xpvalue_from; xp_value<xpvalue_to; xp_value+=(xpvalue_step ? xpvalue_step : 1)) {
            let res = this.test_item_drop_chances(
                xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity
            )

            outputs.push(res)
        }

        // not sure how best to visualise this tbh
    }

    test_item_drop_chances_print(xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity) {
        let res = this.test_item_drop_chances(
            xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity
        )
        
        console.log(res.all_drops)

        console.log(
            res.output
        )
    }

    test_item_drop_chances(xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity) {
        let num_tries = itemtest_config.rounds;
        
        let all_drops = [];
        for (let i=0; i<num_tries; i++) {
            all_drops.push(this.generate_item_drops(
                xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity
            ));
        }

        let pool_counts = {};
        let drop_counts = {};
        let frag_counts = {};
        let num_fragments = 0;
        all_drops.forEach(drop_set => {
            drop_set.forEach(drop => {
                pool_counts[drop.pool_name] = (pool_counts[drop.pool_name] ?? 0) + 1;
                frag_counts[drop.item.name] = (frag_counts[drop.item.name] ?? 0) + 1;
            });
            
            drop_counts[drop_set.length] = (drop_counts[drop_set.length] ?? 0) + 1;
            num_fragments += drop_set.length;
        })

        let make_bar = function(v, t) {
            let bar_len = 16;
            let pct = v / t;
            let pips = Math.max(0, Math.floor(bar_len * pct));

            return `${"#".repeat(pips)}${" ".repeat(bar_len - pips)}`;
        }

        let to_pct = function(v, t) {
            return `${((Math.round((v * 10000) / t) / 100).toString() + "%").padEnd(8)} | ${
                make_bar(v, t)
            }`;
        }

        let output = "";
        let log = function(s) {
            output += s + "\n"
        }

        log(`${itemtest_config.rounds} drops tested\n`);
        //log(all_drops);

        log("Pools:");
        log(Object.keys(pool_counts).sort((a,b) => {
            if (a.match(/Tier\d+/) && b.match(/Tier\d+/)) {
                return Number.parseInt(a.replace("Tier", "")) - Number.parseInt(b.replace("Tier", ""))
            } else {
                return a.localeCompare(b);
            }
        }).map(t => {
            return `${t.toString().padEnd(10)} | ${pool_counts[t].toString().padEnd(8)} | ${to_pct(pool_counts[t], num_fragments)}`
        }).join("\n"))
        
        log("\nNumber of drops:")
        log(Object.keys(drop_counts).sort((a,b) => {
            return Number.parseInt(a) - Number.parseInt(b)
        }).map(t => {
            return `${t.toString().padEnd(4)} | ${drop_counts[t].toString().padEnd(8)} | ${to_pct(drop_counts[t], num_tries)}`
        }).join("\n"))

        log(`\n${num_fragments} fragments total, average ${Math.round((num_fragments * 100) / num_tries) / 100} per drop`)

        log(`\n${itemtest_config.frag_num_show} most common fragments:`)
        log(Object.keys(frag_counts).sort((a,b) => {
            return frag_counts[b] - frag_counts[a]
        }).slice(
            0, itemtest_config.frag_num_show
        ).map(t => {
            return `${t.toString().padEnd(32)} | ${frag_counts[t].toString().padEnd(8)} | ${to_pct(frag_counts[t], num_fragments)}`
        }).join("\n"))

        return {
            pool_counts: pool_counts,
            drop_counts: drop_counts,
            frag_counts: frag_counts,
            num_fragments: num_fragments,
            output: output,
            all_drops: all_drops
        }
    }

    generate_item_drops(xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity) {
        // Notes about this function:
        // 1) start_rarity will factor in xp_value increases as if the rarity started at 1 normally,
        //    so a drop with start_rarity 1 will have the same chance of dropping 2 as start_rarity 4 has for 5.
        //
        // 2) start_number works the same way as start_rarity.
        // 3) custom_pool overrides all rarity increase code, but still allows for multiple drops.
        // 4) custom_pool_name is used to define how the particle effect will look, defaulting to "default".
        
        let drops = [];
        let drop_count = start_number ? start_number : 0;

        let max_tier = max_rarity ? max_rarity : 10;

        // pick number of drops. (xp_value * 2) / 5, max chance 100%, min 20%
        // divide xp_value by 1.5 per additional drop
        let drop_increase_chance = xp_value * 2;
        while (!max_number || drop_count < max_number) {
            let roll = Math.floor(game.random() * 500);
            if (roll < (Math.max(500*0.20, Math.min(500*1, drop_increase_chance)))) {
                drop_increase_chance /= 1.5;
                drop_count++;
            } else {
                break;
            }
        }

        for (let i=0; i<drop_count; i++) {
            let pool = [];
            let pool_name = "default";

            if (custom_pool_name) {
                pool_name = custom_pool_name
            }

            if (custom_pool) {
                pool = custom_pool;
            } else {
                // Start at tier 1
                let tier = start_rarity ? start_rarity : 1;

                if (game.random() < 0.25) {
                    tier = Math.min(max_tier, tier+1)
                }

                else if (game.random() < 0.125) {
                    tier = Math.min(max_tier, tier+2)
                }

                // Chance to increase in tier starts at (xp_value / 100),
                // linear up to 0.8 then softcapping up to 0.95.
                // If increase was successful, divide chance by 1.4
                let chance = 100 + (xp_value * 5);

                let chance_linear_cap = 0.9;
                let chance_softcap_max = 0.07;

                while (tier < max_tier) {
                    let roll = Math.floor(game.random() * 1000);

                    let capped_chance = Math.min(1000*chance_linear_cap, chance);
                    let remaining_chance = chance - capped_chance;

                    let softcapped_chance = (chance_softcap_max + (-chance_softcap_max * Math.pow(
                        (remaining_chance / 1000) + 1, -1
                    ))) * 1000

                    let final_chance = capped_chance + softcapped_chance

                    if (roll < final_chance) {
                        chance /= 1.2;
                        tier++;
                    } else {
                        break;
                    }
                }

                pool = spells_loot_table["Tier" + tier];
                pool_name = "Tier" + tier;
            }

            if (pool.length > 0) {
                let item = pool[Math.floor(game.random() * pool.length)];

                drops.push({item: item, pool_name: pool_name});
            }
        }

        return drops;
    }

    make_item_sparkles(entity_killed, drops) {
        drops.forEach((item, i) => {
            if (entity_killed) {
                setTimeout(function() {
                    item_sparkle(item.item, entity_killed.position, item.pool_name)
                }, 100 + 50 * i)
            } else {
                setTimeout(function() {
                    item_sparkle(item.item, game.player_ent.position, item.pool_name)
                }, 100 + 50 * i)
            }
        })
    }

    roll_for_loot(entity_killed, xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity) {
        let drops = this.generate_item_drops(xp_value, restrict_type, custom_pool, max_number, max_rarity, start_number, custom_pool_name, start_rarity);

        this.make_item_sparkles(entity_killed, drops);

        return drops;
    }

    drop_items_of_rarity_name(rarity, n_min, n_max) {
        let rarity_spread = {
            "common": [1,3],
            "uncommon": [4,5],
            "rare": [6,8],
            "legendary": [9,10],

            "c": [1,3],
            "u": [4,5],
            "r": [6,8],
            "l": [9,10]
        }[rarity.toString().toLowerCase()]

        return this.drop_items_of_rarity_spread(
            n_min ? n_min : 1, n_max ? n_max : 1,
            rarity_spread[0], rarity_spread[1]
        )
    }

    drop_items_of_rarity_spread(n_min, n_max, r_min, r_max) {
        // All inclusive
        return this.roll_for_loot(null, 0, null, null, n_max, r_max, n_min, null, r_min)
    }

    select_player_spell(id) {
        if (this.selected_id == id) {
            this.deselect_player_spell();
            return;
        }

        let result = this.select_player_spell_list(this.player_spells[id].spells);
        
        if (result) {
            renderer.refresh_right_panel = true;
            //console.log("game asked for right panel refresh");

            this.selected_id = id;
        } else {
            this.deselect_player_spell();
        }
    }

    select_player_spell_list(spells) {
        if (!game.is_player_turn() || this.inventory_open) {
            return;
        }

        if (!this.enabled) {
            return;
        }

        let parsed = this.player_ent.parse_spell(spells, new Vector2(0, 0));

        if (this.player_ent.mp >= parsed.manacost) {
            this.selected_id = -1;
            this.selected_player_spell = spells;
            this.selected_player_primed_spell = parsed;

            return true;
        }

        return false;
    }

    deselect_player_spell() {
        this.selected_id = -1;
        this.selected_player_spell = null;
        this.selected_player_primed_spell = null;

        renderer.refresh_right_panel = true;
        //console.log("game asked for right panel refresh");
    }

    put_entity_obj(ent_obj, position, overwrite) {
        let remove_index = -1;
        if (overwrite && this.board.get_pos(position)) {
            for (let i=0; i<this.entities.length; i++) {
                let ent = this.entities[i];
                if (ent.position.equals(position)) {
                    remove_index = i;
                }
            }
        }

        if (remove_index != -1) {
            this.entities.splice(remove_index, 1);
        }

        if (this.board.set_pos(position, ent_obj, overwrite)) {
            ent_obj.position = position;
            this.entities.push(ent_obj);
            return ent_obj;
        }

        return null;
    }

    put_entity_obj_near(entity_object, position) {
        // THIS IS FOR PREMADE ENTITIES, NOT TEMPLATES
        let pos = this.find_closest_free_point(position);

        return this.put_entity_obj(entity_object, pos);
    }

    spawn_entity(ent_template, team, position, overwrite) {
        let ent = new Entity(ent_template, team);
        return this.put_entity_obj(ent, position, overwrite);
    }

    spawn_entity_near(ent_template, team, position) {
        let pos = this.find_closest_free_point(position);
        return this.spawn_entity(ent_template, team, pos);
    }

    spawn_player(player_ent, position) {
        this.player_ent = this.spawn_entity(player_ent, Teams.PLAYER, position);
    }

    has_los_pos(a, b) {
        if (!this.board.position_valid(a) || !this.board.position_valid(b)) {
            return false;
        }

        let line = make_line(a, b, 1, true);

        // line stops at an LOS blocker,
        // so to find out if we have LOS we just check if the line
        // ends at the position we want
        if (line.length > 0 && line[line.length - 1].equals(b)) {
            return line;
        } else {
            return false;
        }
    }

    can_see(ent, position) {
        // slightly differs to has_los as it
        // allows the final position if it's close
        if (!this.board.position_valid(position)) {
            return false;
        }

        let line = make_line(ent.position, position, 1, true);

        // line stops at an LOS blocker,
        // so to find out if we have LOS we just check if the line
        // ends at the position we want
        if (line.length > 0 && line[line.length - 1].sub(position).magnitude() < 2) {
            return line;
        } else if (position.sub(ent.position).magnitude() < 2) {
            return true;
        } else {
            return false;
        }
    }

    has_los(ent, position) {
        return this.has_los_pos(ent.position, position);
    }

    find_random_space_in_los(caster, pos, radius, shape, ignore_los, consider_entities_solid) {
        let points = shape(
            caster.position, pos, radius, !ignore_los
        ).filter(p => this.board.position_valid(p));

        if (consider_entities_solid) {
            points = points.filter(p => {
                return !this.board.get_pos(p)
            })
        }

        points.sort(() => game.random() - 0.5);

        for (let i=0; i<points.length; i++) {
            let point = points[i];
            if (this.has_los(caster, point) || ignore_los) {
                return point;
            }
        }

        return null;
    }

    find_closest_free_point(pos, rmax) {
        // if the actual position is clear just do this now
        if (this.board.position_valid(pos)) {
            let ent = this.board.get_pos(pos);
            if (!ent) {
                return pos;
            }
        }

        let vectors = [
            new Vector2(1, -1),  // dr
            new Vector2(-1, -1), // dl
            new Vector2(-1, 1),  // ul
            new Vector2(1, 1)    // ur
        ];

        for (let r=1; r<(rmax?rmax:64); r++) {
            let start_point = new Vector2(0, r);
            for (let v=0; v<4; v++) {
                for (let i=0; i<r; i++) {
                    // if this current point is empty, escape entirely and return the position
                    let game_pos = start_point.add(pos);
                    if (this.board.position_valid(game_pos)) {
                        let ent = this.board.get_pos(game_pos);
                        if (!ent) {
                            return game_pos;
                        }
                    }

                    let next_point = start_point.add(vectors[v]);

                    // update point
                    start_point = next_point;
                }
            }
        }

        return null;
    }

    find_closest_enemy(ent) {
        let closest_dist = Number.POSITIVE_INFINITY;
        let closest_ent = null;

        this.entities.forEach(other => {
            let dist = other.position.distance(ent.position);
            if (!other.untargetable && other.team != ent.team) {
                if (dist < closest_dist) {
                    closest_ent = other;
                    closest_dist = dist;
                }
            }
        })

        return closest_ent;
    }

    move_entity(ent, new_pos, overwrite) {
        if (!this.enabled) {
            return 0;
        }

        if (this.board.set_pos(new_pos, ent, overwrite)) {
            this.board.clear_pos(ent.position);

            if (ent.id == this.player_ent.id) {
                renderer.move_particles(ent.position.sub(new_pos));
            }

            ent.position = new_pos;

            return 1;
        }

        return 0;
    }

    move_player(new_pos) {
        if (!this.enabled) {
            return 0;
        }

        return this.move_entity(this.player_ent, new_pos, false);
    }

    reset_wave_damage() {
        this.current_wave_damage = {};
    }

    reset_recorded_damage() {
        this.recorded_damage = {};
    }

    reset_damage_count(user_id) {
        delete this.damage_counts[user_id];
    }

    get_damage_count(user_id) {
        return this.damage_counts[user_id];
    }

    setup_damage_count() {
        let cnts = {};
        for (let typ in DmgType) {
            cnts[typ] = 0;
        }
        
        return cnts;
    }

    deal_damage(target, caster, user_id, damage, damage_type, do_not_count) {
        let dmg_taken = target.take_damage(caster, damage, damage_type);

        if (dmg_taken > 0) {
            if (!do_not_count) {
                if (!this.damage_counts[user_id]) {
                    this.damage_counts[user_id] = [];
                }

                this.damage_counts[user_id].push({
                    ent: target,
                    amt: dmg_taken,
                    typ: damage_type
                });
            }

            let record_name = caster.id.toString() + "|" + caster.name;
            if (!this.recorded_damage[record_name]) {
                this.recorded_damage[record_name] = {};
            }

            if (this.recorded_damage[record_name][damage_type]) {
                this.recorded_damage[record_name][damage_type] += dmg_taken;
            } else {
                this.recorded_damage[record_name][damage_type] = dmg_taken;
            }

            if (!this.current_wave_damage[record_name]) {
                this.current_wave_damage[record_name] = {};
            }

            if (this.current_wave_damage[record_name][damage_type]) {
                this.current_wave_damage[record_name][damage_type] += dmg_taken;
            } else {
                this.current_wave_damage[record_name][damage_type] = dmg_taken;
            }
        }
    }

    kill(ent, ignore_ondeath) {
        let current_turn_entity = this.entities[this.turn_index];
        let new_entity_list = [];
        for (let i=0; i<this.entities.length; i++) {
            if (this.entities[i].id != ent.id) {
                new_entity_list.push(this.entities[i]);
            }
        }

        if (current_turn_entity.id != ent.id) {
            let updated_turn_index = null;
            for (let i=0; i<new_entity_list.length; i++) {
                if (this.entities[i].id == current_turn_entity.id) {
                    updated_turn_index = i;
                }
            }
            
            this.turn_index = updated_turn_index;
        } else {
            this.turn_index += 1
        }

        this.entities = new_entity_list;
        this.turn_index = this.turn_index % this.entities.length;

        this.board.clear_pos(ent.position);

        // if it has an on_death, spawn them here
        if (ent.on_death && !ignore_ondeath) {
            ent.on_death.forEach(d => {
                for (let i=0; i<d.cnt; i++) {
                    let r = 2;
                    let pos = this.find_random_space_in_los(
                        ent, ent.position, r, Shape.Circle[1], false, true
                    );

                    while (!pos && r < 16) {
                        r += 1;
                        pos = this.find_random_space_in_los(
                            ent, ent.position, r, Shape.Circle[1], false, true
                        );
                    }

                    // console.log("ent:", get_entity_by_name(d.name));
                    // console.log("pos:", pos);

                    if (pos) {
                        let e = this.spawn_entity(get_entity_by_name(d.name), ent.team, pos);
                        
                        if (this.wave_entities[ent.id]) {
                            this.wave_entities[e.id] = e;
                        }

                        e.spawn_protection = true;
                    }
                }
            });
        }

        delete this.wave_entities[ent.id];
    }
}

keywords = [
    "Native ", "native ", "Chain ", "chain ", "Arc ", "arc ", "Multicast ", "multicast ", "Chaoscast ", "chaoscast "
]

function format_spell_desc(st) {
    // currently, this tries to place 2 codes at things (like affinities or keywords) which would ordinarily be highlighted.

    let desc_str = st;

    desc_str = desc_str.replace(/([^#]|^)(-?\d+(?:\.\d+)?[%x]?)/g, `$1[#4df]$2[clear]`);

    Object.values(DmgType).forEach(t => {
        desc_str = desc_str.split(t).join(`[${damage_type_cols[t]}]${t}[clear]`);
    })

    Object.values(Affinity).filter(t => !Object.values(DmgType).includes(t)).forEach(t => {
        desc_str = desc_str.split(t).join(`[${affinity_cols[t]}]${t}[clear]`);
    })

    keywords.forEach(k => {
        desc_str = desc_str.split(k).join(`[#4df]${k}[clear]`);
    })

    return desc_str;
}

let no_stats = function(a, b, c) {return null};
let no_target = function(a, b, c, d) {return null};
let no_hit = function(a, b, c, d, e, f) {return null};
let no_tiles = function(a, b, c, d) {return null};

function apply_status(caster, target, status, turns) {
    // applying status effects should add to the status if already present or add it otherwise
    // call a thing in the entity, though, since we might have status immunity stuff
    console.log(`- UNIMPLEMENTED - Applying status ${status} to ${target.name} for ${turns} turns`);
    return;
}

function apply_status_tile(caster, position, status, turns) {
    let ent = game.board.get_pos(position)

    if (ent) {
        apply_status(caster, ent, status, turns);
    }
}

function instant_damage(caster, target, damage, damage_type) {
    renderer.put_particle_from_game_loc(target.position, new Particle(
        dmg_type_particles[damage_type]
    ));

    game.deal_damage(target, caster, caster.id, damage, damage_type)
}

function tile_damage(caster, position, damage, damage_type) {
    let ent = game.board.get_pos(position)

    if (ent) {
        instant_damage(caster, ent, damage, damage_type);
    }
}

function random_damage_type(excluding) {
    let typs = Object.keys(DmgType);
    if (excluding) {
        typs = typs.filter(t => !excluding.includes(DmgType[t]))
    }

    return typs[Math.floor(game.random() * typs.length)];
}

function half_redeal(of, to) {
    return redeal_dmg([of], [to], 0.5);
}

function redeal_dmg(of_typs, as_typs, ratio) {
    return function(caster, spell, stats, enemy, damage, dmgtype) {
        if (of_typs.includes(dmgtype) || (of_typs == "native" && dmgtype == stats.damage_type)) {
            let new_dmg = Math.floor(damage * ratio);

            let as_t = as_typs;
            if (as_t == "chromatic") {
                as_t = Object.values(DmgType).filter(t => t != stats.dmg_type);
            }

            as_t.forEach(typ => {
                renderer.put_particle_from_game_loc(enemy.position, new Particle(
                    dmg_type_particles[typ]
                ));

                let should_ignore = typ == stats.dmg_type
                game.deal_damage(enemy, caster, caster.id, new_dmg, typ, should_ignore)
            });
        }
    }
}

function common_stat_mod(modifiers) {
    return function(user, spell, stats) {
        Object.keys(modifiers).forEach(k => {
            if (k == "damage_type" || k == "shape") {
                stats[k] = modifiers[k]
            } else {
                stats[k] += modifiers[k];
            }
        })
    }
}

function core_spell(name, icon, subtyp, col, back_col, desc, damage, damage_type, range, radius, shape, manacost, target_type=SpellTargeting.Positional, teams=null) {
    let dmg_string = "";
    if (damage == 0) {
        dmg_string += "Affects tiles ";
    } else if (damage > 0) {
        dmg_string += `Deals [#4df]${damage} [${damage_type_cols[damage_type]}]${damage_type}[clear] damage `;
    } else if (damage < 0) {
        dmg_string += `Applies [#4df]${damage} [${damage_type_cols[damage_type]}]${damage_type}[clear] healing `
    }
    
    let shape_string = `in a [#4df]${shape[0]}[clear] with a radius of [#4df]${radius}[clear].`;
    
    let target_string = `Targets [#4df]${target_type}[clear].`;

    let range_string = `Range: [#4df]${range}[clear] tiles`;

    let mp_string = `MP cost: [#4df]${manacost}[clear]`;

    let desc_computed = desc.length > 0 ? format_spell_desc(desc) + "\n\n" : "";
    let desc_str = `${desc_computed}${dmg_string}${shape_string}

${target_string}
${range_string}
${mp_string}`;

    let stat_function = function(user, spell, stats) {
        stats.range = range;
        stats.damage = damage;
        stats.radius = radius;
        stats.shape = shape[1];
        stats.manacost = manacost;
        stats.damage_type = damage_type;
        stats.target_type = target_type;
        stats.target_team = teams ? teams : [Teams.ENEMY, Teams.PLAYER];
    }

    let back_col_checked = back_col.length > 0 ? back_col : "black";
    return new Spell(name, icon, col, back_col_checked, SpellType.Core, subtyp, desc_str, manacost, 0, null, stat_function, no_target, no_hit, no_tiles);
}

function enemy_spell_group(cooldown, name, col, spells) {
    return [
        spells, cooldown, name, col
    ];
}

function simple_enemy_core(cooldown, name, icon, col, back_col, desc, damage, damage_type, range, radius, shape, manacost, target_type=SpellTargeting.Positional, teams=null, to_stats=null) {
    let sp = core_spell(
        name, icon ? icon : "[]", SpellSubtype.Core,
        col ? col : damage_type_cols[damage_type], back_col,
        desc, damage, damage_type, range, radius, shape,
        manacost, target_type, teams
    );

    if (to_stats) {
        sp.augment("to_stats", to_stats);
    }

    return [
        [sp], cooldown, name, col ? col : damage_type_cols[damage_type]
    ];
}

function simple_enemy_line_core(cooldown, name, icon, col, damage, damage_type, range, manacost) {
    return simple_enemy_core(
        cooldown, name, icon, col, "#000", "",
        damage, damage_type, range, 1, Shape.Line, manacost
    )
}

function simple_enemy_burst_core(cooldown, name, icon, col, damage, damage_type, range, radius, manacost, alt_shape) {
    return simple_enemy_core(
        cooldown, name, icon, col, "#000", "",
        damage, damage_type, range, radius, alt_shape ? alt_shape : Shape.Diamond, manacost
    )
}

function enemy_melee_core(name, damage, damage_type, cooldown, manacost) {
    return simple_enemy_core(
        cooldown ? cooldown : 0, name, "[]", damage_type_cols[damage_type], "#000", "",
        damage, damage_type, 1, 1, Shape.Line, manacost ? manacost : 0
    )
}


function modifier(name, icon, subtyp, col, back_col, desc, manacost, to_stats, at_target, on_hit, on_affected_tiles) {
    let generated_desc = `\n\nMP cost: [#4df]${manacost}[clear]`;

    let back_col_checked = back_col.length > 0 ? back_col : "#03f";
    let spell_gen = new Spell(
        name, icon, col, back_col_checked, SpellType.Modifier, subtyp, format_spell_desc(desc) + generated_desc, manacost,
        1, null, to_stats, at_target, on_hit, on_affected_tiles
    );

    spell_gen.augment("to_stats", function(user, spell, stats) {
        stats.manacost += manacost;
    });

    return spell_gen;
}

/*
spell_cores = [
    core_spell(
        "Fireball", "@>", SpellSubtype.Core, "red", "", "", 10, DmgType.Fire, 7, 3,
        Shape.Diamond, 25
    ),

    core_spell(
        "Icicle", "V^", SpellSubtype.Core, "#A5F2F3", "", "", 15, DmgType.Ice, 8, 1,
        Shape.Diamond, 20
    ),

    core_spell(
        "Lightning Bolt", SpellSubtype.Core, "&>", "#ffff33", "", "", 17, DmgType.Lightning, 10, 1,
        Shape.Line, 18
    ),
];

spell_mods_stats = [
    modifier(
        "Damage Plus I", "D+", SpellSubtype.Modifier, "#c44", "", "Increase core damage by [#4df]5[clear].", 10,
        function(_, _, s) {
            s.damage += 5;
        }
    ),

    modifier(
        "Radius Plus I", "R+", SpellSubtype.Modifier, "#4cf", "", "Increases the core's radius by [#4df]1[clear].", 30,
        function(_, _, s) {
            s.radius += 1;
        }
    ),

    modifier(
        "Projection", ">~", SpellSubtype.Modifier, "white", "", "Allows the core to ignore line of sight for targeting and effects.", 40,
        function(user, spell, stats) {
            stats.los = false;
        }
    ),
];

spell_mods_dmg = [
    
];

spell_mods_cosmetic = [
    
];

spell_mods_triggers = [
    modifier(
        "Add Target Trigger", "+*", SpellSubtype.Modifier, "#aa0", "#26f",
        "Makes the core cast the next core at the point it was targeted.",
        25
    ).set_trigger("at_target"),

    modifier(
        "Add Tile Trigger", "+x", SpellSubtype.Modifier, "#aa0", "#26f",
        "Makes the core cast a copy of the next core at every tile the core affected.",
        500
    ).set_trigger("on_affected_tiles"),

    modifier(
        "Add Damage Trigger", "+;", SpellSubtype.Modifier, "#aa0", "#26f",
        "Makes the core cast a copy of the next core at every instance of damage the core caused.",
        400
    ).set_trigger("on_hit"),
];

spell_mods_shape = [
    
];

spell_mods_multicast = [
    modifier(
        "Behind the Back", "<$", SpellSubtype.Modifier, "white", "", "Casts a copy of the core behind the user.", 120,
        no_stats, function(user, spell, stats, location) {
            if (!stats.mutable_info["behind_the_back"]) {
                console.log(spell.origin, location);
                stats.mutable_info["behind_the_back"] = true;
                let user_vec = location.sub(spell.origin);

                let new_pos = spell.origin.sub(user_vec);
                game.cast_primed_spell(spell, new_pos);
            }
        }
    ),

    modifier(
        "Multicast x4", ">4", SpellSubtype.Modifier, "#0f0", "", "Casts a copy of the core four times.", 350,
        function(user, spell, stats) {
            stats.multicasts["normal"] += 4;
        }
    ),

    modifier(
        "Chain Spell", "/>", SpellSubtype.Modifier, "white", "", "Makes the core recast a copy of itself on a single random valid target within the core's [#4df]range[clear] as many times as the spell's [#4df]chain[clear] value.\n\nAdds [#4df]4[clear] to the core's [#4df]chain[clear] value.",
        350, function(user, spell, stats) {
            stats.multicasts["chain"] += 4;
        }
    ),

    modifier(
        "Arc Spell", "*>", SpellSubtype.Modifier, "yellow", "", "Makes the core recast a copy of itself on random valid targets within the core's [#4df]range[clear] up to the spell's [#4df]arc[clear] value.\n\nAdds [#4df]4[clear] to the core's [#4df]arc[clear] value.",
        250, function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 4;
        }
    )
];

spell_mods_misc = [
    
];

spells_red = [
    core_spell(
        "Gun", "%=", SpellSubtype.Red, "white", "red", "", 5000, DmgType.Physical, 30, 1, Shape.Line, 50, SpellTargeting.Positional, [Teams.ENEMY]
    ).augment("at_target", function(user, spell, stats, location) {
        user.cast_spell([
            core_spell(
                "gun explosion", "##", SpellSubtype.Core, "white", "black", "", 25, DmgType.Fire, 1, 1, Shape.Diamond, 0, stats.target_type, stats.target_team
            )
        ], location);
    }),

    modifier(
        "Uncontrolled Multicast x16", "!F", SpellSubtype.RedModifier, "#0f0", "red", "Casts a copy of the core sixteen times, moving the target by a random number of tiles up to the core's final radius + 1 each time.", 200,
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += 16;
        }
    ),

    core_spell(
        "All Elements", "!!", SpellSubtype.Red, "white", "red", "all at once. testing", 99999, DmgType.Physical, 1, 40, Shape.Diamond, 0, SpellTargeting.SelfTarget
    ).augment("at_target", function(user, spell, stats, location) {
        let dmgtypes = [
            "Fire",
            "Ice",
            "Lightning",
            "Arcane",
            "Physical",
            "Dark",
            "Chaos",
            "Holy",
            "Psychic"
        ].reverse();

        dmgtypes.forEach(t => {
            game.max_spell_speed = 100;
            game.min_spell_speed = 10;
    
            user.cast_spell([
                core_spell(
                    t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(0, -8)));

            user.cast_spell([
                core_spell(
                    t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = true; })
            ], location.add(new Vector2(-8, 0)));

            user.cast_spell([
                core_spell(
                    t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(8, 0)));

            user.cast_spell([
                core_spell(
                    t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
                ).augment("to_stats", function(_, _, s) { s.los = true; }).augment("at_target", function(_, _, _, _) { 
                    console.log(t);
                    // document.getElementById("dmg-type-display").textContent = t;
                    // document.getElementById("dmg-type-display").style.color = damage_type_cols[t];
                })
            ], location.add(new Vector2(0, 8)));
        })

        if (!stats.mutable_info["aa"] || stats.mutable_info["aa"] < 1) {
            stats.mutable_info["aa"] = stats.mutable_info["aa"] ? stats.mutable_info["aa"] + 1 : 1;

            let new_spell = user.parse_spell([
                core_spell(
                    "t", "##", SpellSubtype.Core, "white", "black", "", 1, DmgType.Physical, 1, 3, Shape.Line, 0
                ).augment("at_target", function(_, _, _, _) { 
                    game.max_spell_speed = 100;
                    game.min_spell_speed = 10;
                })
            ], location);

            game.cast_primed_spell(new_spell.root_spell, location, true);
        }
    }),

    core_spell(
        "pea spell", "!!", SpellSubtype.Red, "white", "red", "pea spell",
        73, DmgType.Chaos, 10, 3, Shape.Circle, 2
    ),

    core_spell(
        "summon GUY", "@]", SpellSubtype.Red, "white", "red", "Summon \"Guy\" at the target position.",
        25, DmgType.Dark, 10, 5, Shape.Circle, 120
    ).augment("at_target", function(user, spell, stats, location) {
        game.spawn_entity(get_entity_by_name("Fuckn GUy"), Teams.PLAYER, location);
    })
]

spells_list = [
    ...spell_cores,
    ...spell_mods_stats,
    ...spell_mods_dmg,
    ...spell_mods_cosmetic,
    ...spell_mods_triggers,
    ...spell_mods_shape,
    ...spell_mods_multicast,
    ...spell_mods_misc,
    ...spells_red
]
*/

/*
entity_templates = [
    new EntityTemplate("Player", "@=", "#0cf", "It's you.", 100, 1000, [
        Affinity.Living, Affinity.Chaos, Affinity.Insect  // player is only living by default, can be changed by events
    ], 0, -1, [

    ], 0, false, false),

    new EntityTemplate("test enemy", "Gg", "#0f0", "idk goblin or smt", 100, 10, [
        Affinity.Ice, Affinity.Insect, Affinity.Living
    ], 15, 10, [
        [[
            core_spell(
                "Bite", "??", SpellSubtype.Core, "white", "red", "", 6, DmgType.Physical, 1, 1,
                Shape.Diamond, 0
            )
        ], 0, "Bite", "white"],
    ], 1, false, false),

    new EntityTemplate("big guy", "#+", "#f00", "scary guy who tests the description line wrapping too. really long text", 500, 9999, [
        Affinity.Fire,
        Affinity.Ice,
        Affinity.Lightning,
        Affinity.Arcane,
        Affinity.Ghost,
        Affinity.Chaos,
        Affinity.Holy,
        Affinity.Dark,
        Affinity.Demon,
        Affinity.Undead,
        Affinity.Natural,
        Affinity.Living,
        Affinity.Insect,
        Affinity.Construct,
        Affinity.Order
    ], 2500, -1, [

    ], 1, false, false),

    new EntityTemplate("Fuckn GUy", "G#", "#480", "Stupid idiot", 150, 250, [
        Affinity.Dark,
        Affinity.Demon
    ], 0, -1, [
        [gen_spells("damage plus i", "lightning bolt"), 0, "KIll You BOLT", "yellow"],
        [[
            get_spell_by_name("add target trigger"),
            core_spell(
                "EPXLODE", "@@", SpellSubtype.Core, "red", "red", "", 25, DmgType.Holy, 40, 1,
                Shape.Line, 100
            ),
            core_spell(
                "EPXLODE 2", "@@", SpellSubtype.Core, "red", "red", "", 100, DmgType.Psychic, 1, 2,
                Shape.Diamond, 0
            ),
        ], 8, "EPXLODE", "red"]
    ], 1, false, false),

    new EntityTemplate("Wall", "[]", "#ccc", "Just a wall.", Number.POSITIVE_INFINITY, 0, [
        Affinity.Construct
    ], 0, -1, [

    ], 999, true, true),
]
*/

let dmg_type_particles = {
    "Fire": new ParticleTemplate(["@@", "##", "++", "\"\"", "''"], damage_type_cols["Fire"], 1),
    "Ice": new ParticleTemplate(["##", "<>", "''", "::", ".."], damage_type_cols["Ice"], 1),
    "Lightning": new ParticleTemplate(["&&", "];", "!-", ".'", " ."], damage_type_cols["Lightning"], 1),
    "Arcane": new ParticleTemplate(["@@", "OO", "{}", "::", ".."], damage_type_cols["Arcane"], 1),
    "Physical": new ParticleTemplate(["%%", "XX", "**", "++", ".."], damage_type_cols["Physical"], 1),
    "Dark": new ParticleTemplate(["##", "][", "}{", "++", "::"], damage_type_cols["Dark"], 1),
    "Chaos": new ParticleTemplate(["@#", "%#", "$]", "X<", "/;"], damage_type_cols["Chaos"], 1),
    "Holy": new ParticleTemplate(["@@", "##", ";;", "**", "''"], damage_type_cols["Holy"], 1),
    "Psychic": new ParticleTemplate(["@@", "[]", "{}", "||", "::"], damage_type_cols["Psychic"], 1),
}

let cosmetic_particles = {
    "Squares": new ParticleTemplate(["[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]", "[]"], "#fff", 1),
    "Arrows": new ParticleTemplate([">>", "=>", "-=", "\u00A0-"], "", 1),
    
    "FireAlt": new ParticleTemplate(["@@", "{}", "++", "..", "."], damage_type_cols["Fire"], 1),
    "IceAlt": new ParticleTemplate(["[]", "{}", "<>", "!!", "::"], damage_type_cols["Ice"], 1),
    "PhysicalAlt": new ParticleTemplate(["XX", "++", "XX", "++", ".."], damage_type_cols["Physical"], 1),
}

let spell_projection_particle = new ParticleTemplate(
    ["**", "++", ".."], "#bbb", 1
);

let heal_flash_particle = new ParticleTemplate(
    ["++", "\"\"", "''"], "#4f4", 1
)

let mp_flash_particle = new ParticleTemplate(
    ["**", ".."], "cyan", 1
)

function get_spell_by_name(name) {
    let matches = spells_list.filter(spell => {
        return spell.name.toLowerCase().includes(name.toLowerCase());
    });

    // pick the shortest one
    let shortest = null;
    matches.forEach(st => {
        if (!shortest || st.name.length < shortest.name.length) {
            shortest = st;
        }
    });

    return shortest;
}

function get_entity_by_name(name) {
    let matches = entity_templates.filter(ent => {
        return ent.name.toLowerCase().includes(name.toLowerCase());
    });

    // pick the shortest one
    let shortest = null;
    matches.forEach(st => {
        if (!shortest || st.name.length < shortest.name.length) {
            shortest = st;
        }
    });

    return shortest;
}

function gen_spells(...names) {
    return names.map(n => get_spell_by_name(n));
}

function general_sparkle(from, particle, col, info, on_hit_player) {
    let dat = {
        speed: random_on_circle((game.random() * 1.5) + 1),
        pos: from.copy(),
        col: col,
        info: info
    }

    dat.interval = setInterval(function() {
        let times = Math.ceil(dat.speed.magnitude());

        for (let i=0; i<times; i++) {
            renderer.put_particle_from_game_loc(dat.pos.round(), new Particle(
                particle, null, null, dat.col
            ));

            dat.pos = dat.pos.add(dat.speed.div(times));

            if (dat.pos.round().equals(game.player_ent.position)) {
                clearInterval(dat.interval);
                on_hit_player(dat.info);
                return;
            }
        }

        let difference_vec = game.player_ent.position.sub(dat.pos);
        dat.speed = dat.speed.add(difference_vec.normalize().mul(0.2 * particle.speed));
        if (difference_vec.magnitude() < 0.8) {
            clearInterval(dat.interval);
            on_hit_player(dat.info);
            return;
        }

        dat.speed = dat.speed.mul(1 - (0.15 * particle.speed));
    }, (1000/30));
}

function xp_sparkle(xp, from) {
    let txp = xp;
    general_sparkle(from, xp_flash, "#8ff", {xp: txp}, function(info) { game.player_gain_xp(info.xp) })
}

function item_sparkle(item, from, drop_pool) {
    let titem = item;

    console.log(drop_pool)

    let particle_col = item.typ == SpellType.Core ? "#fff" : "#4df"
    let particle = generic_item_flash
    if (drop_pool && item_tier_flashes[drop_pool]) {
        particle = item_tier_flashes[drop_pool].part
        particle_col = item.typ == SpellType.Core ? item_tier_flashes[drop_pool].col_core : item_tier_flashes[drop_pool].col_mod
    }

    general_sparkle(from, particle, particle_col, {item: titem}, function(info) { game.player_add_spell_to_inv(info.item) })
}

function load_game(save_string) {
    let new_game = Game.make_game_from_save_string(save_string);

    let new_board = new_game.board;

    game = new_game;
    board = new_board;

    renderer.game = new_game;
    renderer.board = new_game.board;

    game.setup();

    game.player_commit_edits();
    game.recent_spells_gained = [];

    game.begin_turn();

    if (game.inventory_open) {
        renderer.render_game_checkerboard("black");
        renderer.reset_selections();
        renderer.render_inventory_menu();
    } else {
        renderer.render_game_view();
    }

    renderer.refresh_left_panel = true;
    renderer.refresh_right_panel = true;

    renderer.request_new_frame();
}

function vh(percent) {
    // topbar, bottombar 128px + 64px

    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * (h - 128 - 64)) / 100;
}

function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function vmin(percent) {
    return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
    return Math.max(vh(percent), vw(percent));
}

function handle_resize(event) {
    // if position optimisation is on, reset the canvas (!) after setting fontsize

    // scale font size such that total_size.x/y characters fit
    let vn_factor = 180;
    let font_upper_scale = 2;

    // remember x size coverage is half because the font is 8x16
    // we also want to make sure it isnt way too big...
    let fontsize_x = font_upper_scale * vw(vn_factor / 2) / renderer.total_size.x;

    // if screen is very long, the font might be too big.
    // need to check for the smallest allowed font in both directions and pick the minimum
    let fontsize_y = font_upper_scale * vh(vn_factor) / renderer.total_size.y;

    fontsize = Math.min(fontsize_x, fontsize_y);

    // console.log("fontsize before floor:", fontsize, "after: ", Math.floor(fontsize));

    // MS Gothic: intervals of 2 when using box drawing, 1 when not
    // Terminus: intervals of 6(?) needs more testing
    // nec_apc: intervals of 16
    let fontsize_round = Math.floor(fontsize / 2) * 2;
    renderer.fontsiz = fontsize_round;

    if (renderer.position_optimisation) {
        renderer.setup();

        let font_cvr_x = renderer.total_size.x * (fontsize_round/2);
        let font_cvr_y = renderer.total_size.y * fontsize_round;

        console.log(font_cvr_x, vw(100), ((vw(100) - font_cvr_x)/2) + "px");

        document.getElementById("game").style.left = ((vw(100) - font_cvr_x)/2) + "px";
        document.getElementById("game").style.top = (94 + (vh(100) - font_cvr_y)/2) + "px";
    }

    let gamelines = document.getElementById("gamelines");
    let game = document.getElementById("game");

    gamelines.style.setProperty("--fontsiz_noround", `${fontsize_round}px`);
    gamelines.style.setProperty("--fontsiz_noround_half", `${fontsize_round / 2}px`);

    game.style.setProperty("--fontsiz", `${fontsize_round}px`);
}

// TODO:
// ai level 2,3,4
// selftarget/unit target not working on ai
// event chains, e.g. order of order 
// death chain not working?
// drag fragment to a position before the start of a spell (the little padding location) to append to the start
// 
// show "dangerous" tiles (tiles on which enemies will target you) in an optional overlay on keypress
// - status effects - currently not implemented at all
// - open inventory after beating all enemies, try to figure out a way to make the transition cleaner
// - more worldgen stuff
// - spell trajectory visualiser needs to show multicasts
//    (behind the back, triangle and square can all be done pretty easily)
//    (how do we show chains? or arcs? or chaoscast? since they're random)
//
// there needs to be a brief time delay between a spell cast finishing and enemies moving. im getting confused lmao
/*
https://docs.google.com/spreadsheets/d/1HZQqG0wqTs9oZUu4H4hqChqNRa-kj8lPe9Y93V5l_z8/edit?usp=sharing
*/

/*
TODO BUGS:
- selftarget spells set target and origin to caster position when they shouldn't <= fixed, might have broken something else
- tile and damage trigger should cast the spells with origin and target of the tile target, not just origin <= fixed, but might have broken something else

- multicast stack arc and chain is fucked as always
*/