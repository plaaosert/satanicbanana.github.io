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

function in_bounds(val, lo, hi) {
    return val >= lo && val < hi;
}

function random_on_circle(r) {
    let theta = Math.random() * 2 * Math.PI;

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

    magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    normalize() {
        return this.div(this.magnitude());
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
}

class ParticleTemplate {
    constructor(frames, col, speed) {
        this.frames = frames;
        this.num_frames = frames.length;
        this.col = col;
        this.speed = speed;
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

class Renderer {
    constructor(game, board, game_view_size, left_menu_len, right_menu_len, particle_speed) {
        this.game = game;
        this.board = board;
        this.game_view_size = game_view_size;
        this.default_text_col = "white"

        this.position_optimisation = false;

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

        this.selected_tile = null;
        this.selected_ent = null;
        this.last_selected_tiles = [];

        this.last_player_spell_state = null;

        this.selectable_spells = {};
        this.selectable_spell_icons = {};
        this.selected_spell = null;
        this.selected_full_spell = null;
        this.selected_spell_loc = null;

        this.refresh_left_panel = false;
        this.refresh_right_panel = false;

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
        let parent = document.getElementById("gamelines");
        parent.innerHTML = "";

        for (let y=0; y<siz.y; y++) {
            this.pixel_chars.push([]);

            for (let x=0; x<siz.x; x++) {
                let c = document.createElement("span");
                c.classList.add("gamepixel");

                if (this.position_optimisation) {
                    c.classList.add("gamepixel-abs");
                }

                c.classList.add("white");
                if (x >= this.left_menu_size.x && x < this.left_menu_size.x + this.game_view_size.x) {
                    if ((Math.floor(x/2) + y) % 2 != 0) {
                        c.classList.add("check-dark");
                    } else {
                        c.classList.add("check-light");
                    }
                }

                c.style.gridColumn = x + 1;
                c.style.gridRow = y + 1;

                if (this.position_optimisation) {
                    document.getElementById("game").style.left = "17%";

                    c.style.top = `${y*16}px`;
                    c.style.left = `${x*8}px`;
                }

                let text = "\u00A0";
                let pipe_points = [
                    0, this.left_menu_size.x - 1,
                    this.left_menu_size.x + this.game_view_size.x, this.total_size.x - 1
                ];

                if (pipe_points.includes(x)) {
                    text = "|";
                }

                let within_menu = x < this.left_menu_size.x || x >= this.left_menu_size.x + this.game_view_size.x;

                if (within_menu && (y == 0 || y == this.total_size.y - 1)) {
                    text = text == "|" ? "+" : "-";
                }

                c.textContent = text;
                
                let flattened_id = (y * siz.x) + x;
                let rdr = this;
                c.addEventListener("mouseover", (event) => {
                    rdr.mouseover(event, flattened_id);
                })

                c.addEventListener("click", (event) => {
                    rdr.click(event, flattened_id);
                })

                parent.appendChild(c);
                this.pixel_chars[y].push(c);
            }

            //parent.appendChild(document.createElement("br"));
        }
    }

    mouseover(event, flattened_id) {
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

        switch (this.get_position_panel(resolved_pos)) {
            case 0:  // left panel
                this.selected_tile = null;
                this.selected_ent = null;
                this.refresh_right_panel = true;
                console.log("asking for refresh right");
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
                    console.log("asking for refresh right");
                } else {
                    if (!this.selected_tile) {
                        this.refresh_right_panel = true;
                        console.log("asking for refresh right");
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
                        console.log("asking for refresh right");
                    }
                    
                    this.selected_ent = new_ent;
                }

                break;
            case 2:  // right panel
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

    click(event, flattened_id) {
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
                    console.log("asking for refresh right");
                } else {
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
                                let result = game.move_entity(game.player_ent, path[1], false);
                                
                                if (result) {
                                    this.move_particles(path[1].sub(game.player_ent.position).neg());
                                }
            
                                game.end_turn();
                            } else if (game_pos.equals(game.player_ent.position)) {
                                game.end_turn();
                            }
                        }
                    }
                }

                break;
            case 2:
                this.inventory_editing_spell_name = null;
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

    set_back(pos, col) {
        let p = this.pixel_chars[pos.y][pos.x];
        p.style.backgroundColor = col;
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
        let p = this.pixel_chars[pos.y][pos.x];
        p.textContent = char;

        if (col) {
            p.style.color = col;
        }
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
                        }

                        string_len++;
                    }
                }
            }

            if (string_len > w || char == "\n") {
                if (char == "\n" && !(string_len > w)) {
                    cur_line += cur_word + " ";
                    cur_word = "";
                }

                lines.push(cur_line.trim());
                cur_line = "";
                string_len = cur_word.length;
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
    
    set_pixel_text(pos, text, start_col, clearance_x) {
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
                    char = char.replace("{", "[").replace("}", "]");

                    if (char != "\n") {
                        this.set_pixel(cur_pos, char, col);
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
        let sp_str = game.player_skill_points > 0 ? ` [#f0f](+${game.player_skill_points})` : "";
        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 0)),
            this.pad_str(`[clear]Player LV [#8ff]${game.player_level}[clear]${sp_str}`, 4+1+4+3)
        )

        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 1)),
            this.pad_str(`[red]${p.hp}/${p.max_hp}[clear] HP`, 4+1+4+3)
        )

        this.set_pixel_text(
            left_mount_pos.add(new Vector2(0, 2)),
            this.pad_str(`[cyan]${p.mp}/${p.max_mp}[clear] MP`, 4+1+4+3)
        )

        // affinities
        for (let i=0; i<p.affinities.length; i++) {
            this.set_pixel_text(
                left_mount_pos.add(new Vector2(clearance_x - 10, i)),
                this.pad_str(`[${affinity_cols[p.affinities[i]]}]${p.affinities[i]}`, 10)
            )
        }

        // xp and bar
        let xp_mount_pos = left_mount_pos.add(new Vector2(0, 4));
        let bar_len = clearance_x - 2; // for affinities
        let pct = game.player_xp / game.get_xp_for_levelup(game.player_level);
        let pips = Math.max(0, Math.floor(bar_len * pct));

        let bar_string = `[#8ff]{${"#".repeat(pips)}${"-".repeat(bar_len - pips)}}[clear]`;
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
                this.pad_str(`[${cols[0]}](${i+1}) [${cols[1]}]${name}`, clearance_x - 8) + this.pad_str(`[${cols[2]}]${parsed.manacost} MP`, 8)
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
            for (let j=0; j<game.player_max_spell_fragments; j++) {
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

                let diving = false;
                let margin = 0;
                while (diving) {
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

                    current_spell_point = current_spell_point.add(new Vector2(0, 2));

                    if (spell.trigger && spell.trigger[0] != "none") {
                        this.set_pixel_text(
                            current_spell_point,
                            this.pad_str(`${"\u00A0".repeat(margin)}[#4df]${spell.trigger[0]}`, clearance_x)
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
                
            } else {
                // need to clear the whole panel. can do this with a well-constructed string
                // size of right panel is right panel size x - 4 (border margin) multiplied by y - 2
                /*
                let string_len = (this.right_menu_size.x - 4) * (this.right_menu_size.y - 2);
                this.set_pixel_text(right_mount_pos, "\u00A0".repeat(string_len), null);
                */
            }
        }
    }

    render_game_checkerboard(light_col) {
        for (let x=0; x<this.game_view_size.x; x++) {
            for (let y=0; y<this.game_view_size.y; y++) {
                let pos = new Vector2(x + this.left_menu_size.x, y);
                let light = Math.floor((x / 2) + y) % 2 == 0;

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
            "[white]" + "-".repeat(clearance_x + 4)
        );

        this.set_pixel_text(
            mount_pos.add(new Vector2(-2, this.game_view_size.y - 3)),
            "[white]" + "-".repeat(clearance_x + 4)
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
                this.pad_str(`[white](${j+1}) ${spell_name}`, clearance_x - 9) + this.pad_str(`[cyan]${parsed.manacost} MP`, 8, 1)
            )

            this.inventory_spell_names[current_line.y] = j;

            current_line = current_line.add(new Vector2(0, 2));

            let spell_str = "";
            let num_spells = 0;
            let current_spell_point = current_line.copy();

            for (let i=0; i<game.player_max_spell_fragments; i++) {
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

            this.inventory_items_origins[current_spell_point.add(new Vector2(num_spells * 3, 0)).hash_code()] = {spell: spell, inv_id: i};
            this.inventory_items_origins[current_spell_point.add(new Vector2(num_spells * 3 + 1, 0)).hash_code()] = {spell: spell, inv_id: i};

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

        let radius_vecs = [];
        if (game.selected_player_primed_spell) {
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

            if (game.selected_player_primed_spell.root_spell.in_range(game.player_ent, s_game_pos)) {
                radius_vecs = game.selected_player_primed_spell.root_spell.stats.shape(
                    game.player_ent.position, s_game_pos,
                    game.selected_player_primed_spell.root_spell.stats.radius,
                    game.selected_player_primed_spell.root_spell.stats.los
                );
            }
        }

        let selected_col = "#888";
        for (let i=0; i<this.last_selected_tiles.length; i++) {
            this.set_back_pair(this.last_selected_tiles[i], null);
        }

        this.last_selected_tiles = [];

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
                if (true) {
                    let pos_in_bounds = true;
                    if (!this.board.position_valid(game_pos)) {
                        pos_in_bounds = false;
                        back_rgb = [0, 0, 0];
                    } else {
                        if (game.selected_player_primed_spell) {
                            if (radius_vecs.some((v) => v.equals(game_pos))) {
                                let effect_indicator_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != 0 ? [32, 32, 64] : [24, 24, 64];

                                back_rgb = effect_indicator_col;

                                if (this.selected_tile && new Vector2(Math.floor(this.selected_tile.x / 2) * 2, this.selected_tile.y).equals(screen_pos)) {
                                    //console.log("changed");
                                    selected_col = "#44a";
                                    //console.log(selected_col);
                                }
                            } else if (game.selected_player_primed_spell.root_spell.in_range(game.player_ent, game_pos)) {
                                let range_indicator_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != 0 ? [0, 64, 0] : [0, 80, 0];

                                back_rgb = range_indicator_col;

                                if (this.selected_tile && new Vector2(Math.floor(this.selected_tile.x / 2) * 2, this.selected_tile.y).equals(screen_pos)) {
                                    //console.log("changed");
                                    selected_col = "#0a0";
                                    //console.log(selected_col);
                                }
                            } else {
                                let neutral_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != 0 ? [0, 0, 0] : [16, 16, 16];

                                back_rgb = neutral_col;
                            }
                        } else {
                            let neutral_col = (Math.floor(game_pos.x) + game_pos.y) % 2 != 0 ? [0, 0, 0] : [16, 16, 16];

                            back_rgb = neutral_col;
                        }
                    }

                    //this.last_player_spell_state = current_state;
                }

                if (this.board.get_pos(game_pos)) {
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
        if (this.selected_tile) {
            this.set_back_pair(this.selected_tile, selected_col);
        }
    }

    test() {
        let cols = ["#fff", "#f00", "#0f0", "#00f", "#000"];
        let chars = ["#", "&", "+", "-", "\u00A0"];
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
    constructor(name, icon, col, desc, max_hp, max_mp, affinities, xp_value, innate_spells, ai_level, blocks_los, untargetable) {
        this.name = name
        this.icon = icon
        this.col = col
        this.desc = desc
        this.max_hp = max_hp
        this.max_mp = max_mp
        this.affinities = affinities != undefined ? affinities : []
        this.xp_value = xp_value != undefined ? xp_value : 0
        this.innate_spells = innate_spells != undefined ? innate_spells : []
        this.ai_level = ai_level != undefined ? ai_level : 999
        this.blocks_los = blocks_los;
        this.untargetable = untargetable;
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

        this.xp_value = template.xp_value

        this.ai_level = template.ai_level;

        this.blocks_los = template.blocks_los;
        this.untargetable = template.untargetable;

        this.team = team;
        this.dead = false;

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
        this.calculate_primed_spells(game.player_ent.position);

        // sends stuff to the game if necessary, based on ai level
        //console.log("doing turn for", this.name, this.ai_level);
        switch (this.ai_level) {
            case 0:
                // player
                break;
            
            case 1:
                let target_ent = game.find_closest_enemy(this);

                if (target_ent) {
                    // check if we can cast a spell
                    let cast_spell = false;
                    let spell_to_cast = [];
                    let best_mp_cd = [0, 0];

                    // prioritise castable spell with the highest max cooldown and manacost
                    for (let i=0; i<this.innate_primed_spells.length; i++) {
                        let primed_spell = this.innate_primed_spells[i][0];
                        let cooldown = this.innate_primed_spells[i][1];

                        if (cooldown <= 0) {
                            if (primed_spell.manacost <= this.mp && primed_spell.root_spell.in_range(this, target_ent.position)) {
                                //console.log("executing spell", primed_spell);
                                if (this.innate_spells[i][1] == best_mp_cd[1] && primed_spell.manacost == best_mp_cd[0]) {
                                    spell_to_cast.push([primed_spell, i])
                                } else {
                                    if (this.innate_spells[i][1] > best_mp_cd[1] || primed_spell.manacost > best_mp_cd[0]) {
                                        spell_to_cast = [[primed_spell, i]];
                                        best_mp_cd = [this.innate_spells[i][1], primed_spell.manacost];
                                    }
                                }

                                cast_spell = true;
                            }
                        }
                    }

                    if (cast_spell) {
                        let chosen = spell_to_cast[Math.floor(Math.random() * spell_to_cast.length)];
                        let primed_spell = chosen[0];
                        let innate_index = chosen[1];

                        this.execute_spell(primed_spell, target_ent.position)
                        this.innate_primed_spells[innate_index][1] = this.innate_spells[innate_index][1];
                    }

                    // for ai level 2+, the entity should stay at the range of their shortest range spell
                    // they should only move towards the player if they are out of range
                    // and move away otherwise
                    if (!cast_spell) {
                        let path = pathfind(this.position, target_ent.position);

                        //console.log(path, this.position, target_ent.position);
                        if (path && path.length > 1) {
                            let result = game.move_entity(this, path[1], false);
                        }
                            
                        game.end_turn();
                    }
                } else {
                    game.end_turn();
                }
                
                break;

            default:
                game.end_turn();
                break;
        }
    }

    do_end_turn() {
        // for now just give some mp regen
        this.mp = Math.min(this.max_mp, this.mp + Math.round(this.max_mp / 25));
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

        for (let i=0; i<spells.length; i++) {
            if (finished_drawing) {
                break;
            }

            let spell = spells[i];

            manacost += spell.manacost;

            after_finishing_draws = spell.trigger_type ? spell.trigger_type : after_finishing_draws;

            if (spell.typ == SpellType.Core) {
                cores_in_draw.push(spell);
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
                core_spell("backup spell", "!!", "white", "red", 
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
            this.mp -= manacost;
            game.cast_primed_spell(root_spell, position_target);
        }
    }

    die() {
        this.dead = true;
        game.kill(this);
    }

    lose_hp(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    get_damage_mult(damage_type) {
        let dmg_mult = 1;
        this.affinities.forEach(affinity => {
            dmg_mult *= affinity_weaknesses[affinity][damage_type]
        });

        return dmg_mult;
    }

    take_damage(caster, damage, damage_type) {
        if (this.dead) {
            return 0;
        }

        // compare damage type to affinities and determine total multiplier
        let dmg_mult = 1;
        this.affinities.forEach(affinity => {
            dmg_mult *= affinity_weaknesses[affinity][damage_type]
        });

        // spell source might change damage but not right now
        let final_damage = Math.round(damage * dmg_mult);

        let died = this.lose_hp(final_damage);
        console.log(`${this.name} says "ow i took ${final_damage} ${damage_type} damage (multiplied by ${dmg_mult} from original ${damage}) from ${caster.name}`);
        
        renderer.refresh_right_panel = true;
        console.log("game asked for right panel refresh");
        
        /*
        if (this.name == "moving guy") {
            hitcount++;
            // document.getElementById("hit-text").textContent = `guy took ${final_damage} ${damage_type} damage (hit ${hitcount})`;
        }
        */

        if (died && this.team != Teams.PLAYER) {
            // spawn xp
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

        return final_damage;
    }
}

class Spell {
    static id_inc = 0;

    // inventory items use references to these single objects. do not edit them
    constructor(name, icon, col, back_col, typ, desc, manacost, bonus_draws, trigger_type, to_stats_fn, at_target_fn, on_hit_fn, on_affected_tiles_fn) {
        this.id = Spell.id_inc;
        Spell.id_inc++;
        
        this.name = name;
        // in all cases, the core spell's functions are called first,
        // followed by modifiers in the order of placement.
        this.icon = icon
        this.col = col;
        this.back_col = back_col;
        
        this.typ = typ;
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

const SpellType = {
    Core: "Core",
    Modifier: "Modifier"
}

const SpellTargeting = {
    Positional: 'a position on the ground',
    UnitTarget: 'a specific unit',      // includes teams for filtering
    SelfTarget: 'the area around the caster',    // cast location is self tile
    SelfTargetPlusCasterTile: 'at the caster\'s position'  // self target implicitly removes caster tile but this doesn't
};

const Teams = {
    PLAYER: "Player",
    ENEMY: "Enemy",
    UNALIGNED: "Unaligned"
}

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

function pathfind(start, goal) {
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
        while (cameFrom[current]) {
            current = cameFrom[current]
            total_path.push(Vector2.from_hash_code(current));
        }

        return total_path.reverse();
    }

    function get_or_inf(c, v) {
        if (c[v] != undefined) {
            return c[v];
        }

        return Number.POSITIVE_INFINITY;
    }

    // oh god
    // https://en.wikipedia.org/wiki/A*_search_algorithm
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = {};
    openSet[start.hash_code()] = true;

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    let cameFrom = {};

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    let gScore = {};
    gScore[start.hash_code()] = 0;

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    let fScore = {};
    fScore[start.hash_code()] = h(start)

    while (Object.keys(openSet).length > 0) {
        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
        let current = null;
        let current_score = Number.POSITIVE_INFINITY;
        Object.keys(openSet).forEach(pos => {
            let score = get_or_inf(fScore, pos);

            if (score < current_score) {
                current_score = score;
                current = Vector2.from_hash_code(pos);
            }
        })

        if (current.equals(goal)) {
            return reconstruct_path(cameFrom, current.hash_code())
        }

        delete openSet[current.hash_code()];

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

            if (board.position_valid(neighbor) && (!board.get_pos(neighbor) || neighbor.equals(goal))) {
                // d(current,neighbor) is the weight of the edge from current to neighbor
                // tentative_gScore is the distance from start to the neighbor through current
                let tentative_gScore = get_or_inf(gScore, current.hash_code()) + (current.distance(neighbor));
                if (tentative_gScore < get_or_inf(gScore, neighbor.hash_code())) {
                    // This path to neighbor is better than any previous one. Record it!
                    cameFrom[neighbor.hash_code()] = current.hash_code();
                    gScore[neighbor.hash_code()] = tentative_gScore
                    fScore[neighbor.hash_code()] = tentative_gScore + h(neighbor)
                    if (!openSet[neighbor.hash_code()]) {
                        openSet[neighbor.hash_code()] = true;
                    }
                }
            }
        }
    }

    // Open set is empty but goal was never reached
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

    }]
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
        "Ice": 1,        // resistant
        "Lightning": 1,  // neutral
        "Arcane": 1,     // weak
        "Physical": 1,   // immune
        "Dark": 1,       // resistant
        "Chaos": 1,      // neutral
        "Holy": 1,       // weak
        "Psychic": 1,    // weak
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
        "Physical": 0.5,   // resistant
        "Dark": 1,       // neutral
        "Chaos": 1,      // neutral
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

console.log(["Fire",
"Ice",
"Lightning",
"Arcane",
"Ghost",
"Chaos",
"Holy",
"Dark",
"Demon",
"Undead",
"Natural",
"Living",
"Insect",
"Construct",
"Order"].map(a => {
    return [
        "Fire",
        "Ice",
        "Lightning",
        "Arcane",
        "Physical",
        "Dark",
        "Chaos",
        "Holy",
        "Psychic"
    ].map(t => affinity_weaknesses[a][t]).join("\t")
}).join("\n"))

class PrimedSpell {
    static id_inc = 0;

    constructor(caster, spells) {
        this.id = PrimedSpell.id_inc;
        PrimedSpell.id_inc++;

        this.caster = caster
        this.origin = null;

        this.spells = spells
        this.trigger = ["none", null];  // ["at_target"/..., PrimedSpell]

        this.stats = {};
        this.calculate();
    }

    copy() {
        let new_primed = new PrimedSpell(this.caster, this.spells);
        new_primed.origin = this.origin;
        if (this.trigger[0] != "none") {
            new_primed.trigger = [this.trigger[0], this.trigger[1].copy()];
        }

        new_primed.calculate();
        new_primed.stats.mutable_info = structuredClone(this.stats.mutable_info);

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
            "simultaneous": 0
        }
        this.stats.shape = Shape.Diamond;
        this.stats.los = true;

        // REMEMBER: CORE ALWAYS FIRST, then modifiers
        // even though in the spell builder the core will be last
        this.spells.forEach(spell => {
            if (spell.fns.to_stats) {
                spell.fns.to_stats(this.caster, spell, this.stats);
            }
        })
    }

    in_range(caster, position) {
        if ([SpellTargeting.SelfTarget, SpellTargeting.SelfTargetPlusCasterTile].includes(this.stats.target_type)) {
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
            return caster.position.distance(position) <= this.stats.range;
        }
    }

    cast(board, caster, position) {
        //console.log(this.origin);

        let self_target_safe = this.stats.target_type == SpellTargeting.SelfTarget;

        let origin = this.origin ? this.origin : caster.position;
        let cast_locations = this.stats.shape(origin, position, this.stats.radius, this.stats.los);
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
        
        //console.log(cast_locations);

        if (self_target_safe) {
            cast_locations = cast_locations.filter(loc => !(loc.x == position.x && loc.y == position.y));
        }
        
        game.reset_damage_count(this.id);

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
            renderer.put_particle_from_game_loc(location, new Particle(
                dmg_type_particles[sthis.stats.damage_type]
            ));

            let targeting_predicate = sthis.stats.targeting_predicates.length > 0 ? function(e) { sthis.stats.targeting_predicates.every(p => p(e)) } : null;
            let ent = board.check_for_entity(
                location, sthis.stats.target_team, 
                sthis.stats.target_affinities, targeting_predicate
            )

            if (ent) {
                game.deal_damage(
                    ent, sthis.caster, sthis.id,
                    sthis.stats.damage, sthis.stats.damage_type
                );
            }

            // trigger affected tile functions
            sthis.spells.forEach(spell => {
                if (spell.fns.on_affected_tiles) {
                    spell.fns.on_affected_tiles(sthis.caster, sthis, sthis.stats, location);
                }
            })

            if (sthis.trigger[0] == "on_affected_tiles") {
                sthis.trigger[1].origin = position;
                game.cast_primed_spell(sthis.trigger[1].copy(), location, true);
            }
        })

        // trigger point target functions
        this.spells.forEach(spell => {
            if (spell.fns.at_target) { 
                spell.fns.at_target(this.caster, this, this.stats, position);
            }
        })

        if (this.trigger[0] == "at_target") {
            this.trigger[1].origin = position;
            game.cast_primed_spell(this.trigger[1].copy(), position, true);
        }

        // get list of damaged entities from this spell
        let damaged_entities = game.get_damage_count(this.id);
        // [{ent, dmg_amount, dmg_type}]
        // each instance of damage is handled separately

        if (damaged_entities) {
            damaged_entities.forEach(dmg_instance => {
                let ent = dmg_instance.ent;
                let amt = dmg_instance.amount;
                let typ = dmg_instance.dmg_type;

                this.spells.forEach(spell => {
                    if (spell.fns.on_hit) {
                        spell.fns.on_hit(this.caster, this, this.stats, ent, amt, typ);
                    }
                })

                if (this.trigger[0] == "on_hit") {
                    this.trigger[1].origin = position;
                    game.cast_primed_spell(this.trigger[1].copy(), ent.position, true);
                }
            })
        }

        // check multicasts
        if (this.stats.multicasts["normal"] > 0) {
            // place a copy of this spell on the casting stack but decrement the value
            let new_pos = position;
            let new_mc = this.stats.multicasts["normal"] - 1;
            let new_spell = this.copy();
            new_spell.stats.multicasts["normal"] = new_mc;

            console.log(new_spell)
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
                    let ent = ents[Math.floor(Math.random() * ents.length)];

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
                let ent = ents[Math.floor(Math.random() * ents.length)];

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
    }
}


class Game {
    constructor(board) {
        this.board = board;
        this.player_ent = null;
        this.entities = [];
        this.recorded_damage = {};  // indexed by caster id and name
        this.damage_counts = {};    // indexed by spell id

        this.player_spells = [];
        this.selected_id = -1;
        this.selected_player_spell = null;
        this.selected_player_primed_spell = null;
        this.player_xp = 0;
        this.player_level = 1;
        this.player_skill_points = 0;
        this.player_inventory = [];
        this.player_spells_edit = [[], [], [], [], []];

        this.player_max_spell_fragments = 20;
        this.player_inventory_size = 60;

        for (let i=0; i<this.player_max_spell_fragments; i++) {
            this.player_spells_edit[0].push(null);
            this.player_spells_edit[1].push(null);
            this.player_spells_edit[2].push(null);
            this.player_spells_edit[3].push(null);
            this.player_spells_edit[4].push(null);
        }

        for (let i=0; i<this.player_inventory_size; i++) {
            this.player_inventory.push(null);
        }

        // current turn; pops spells off this stack one by one for the purposes of animation
        // anything that casts a spell goes through here first
        this.casting_stack = []
        this.waiting_for_spell = false;
        this.checker_interval = null;

        this.spell_speed = 100;

        this.spells_this_turn = 0;
        this.max_spell_speed = 100;
        this.min_spell_speed = 10;

        this.turn_index = 0  // index into entities

        this.inventory_open = false;
        this.recent_spells_gained = [];
    }

    player_discard_edits() {
        for (let i=0; i<this.player_max_spell_fragments; i++) {
            for (let t=0; t<5; t++) {
                this.player_spells_edit[t][i] = i < this.player_spells[t].spells.length ? this.player_spells[t].spells[i] : null;
            }
        }
    }

    player_commit_edits() {
        for (let t=0; t<5; t++) {
            this.player_spells[t].spells = [];
        }

        for (let i=0; i<this.player_max_spell_fragments; i++) {
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

    begin_turn() {
        // shout here for the current turn entity's AI or the player to pick a move to use
        let ent = this.entities[this.turn_index];
        //console.log("beginning turn for", ent.name);
        let sthis = this;
        setTimeout(function() {
            sthis.casting_stack = [];
            sthis.waiting_for_spell = true;
            ent.do_turn();
        })

        // we then periodically check the casting stack to see if there's anything on there.
        // if there is, we cast it and set waiting_for_spell to true, which means
        // that once we clear out the casting stack the current entity's turn will end.
        this.spell_speed = this.max_spell_speed;
        this.spells_this_turn = 0;

        let me = this;
        this.checker_interval = setTimeout(function() {
            me.check_spell_stack();
        }, this.spell_speed);
    }

    cast_primed_spell(primed_spell, position_target, insert_at_bottom, do_not_wait) {
        //console.log("enqueued", primed_spell, "at", position_target);
        if (insert_at_bottom) {
            this.casting_stack.unshift({spell: primed_spell, target: position_target, do_not_wait: do_not_wait});
        } else {
            this.casting_stack.push({spell: primed_spell, target: position_target, do_not_wait: do_not_wait});
        }
    }

    check_spell_stack() {
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
            
                if (!spell_to_cast.do_not_wait) {
                    coalescing = false;
                }
            }

            for (let i=0; i<spells_to_cast.length; i++) {
                let spell_to_cast = spells_to_cast[i];
                spell_to_cast.spell.cast(this.board, this.entities[this.turn_index], spell_to_cast.target);
            }

            this.waiting_for_spell = false;

            this.spells_this_turn++;

            let n = this.spells_this_turn / 50;
            this.spell_speed = ((1-n) * this.max_spell_speed) + (n * this.min_spell_speed);

            let me = this;
            this.checker_interval = setTimeout(function() {
                me.check_spell_stack();
            }, this.spell_speed);
        } else {
            if (!this.waiting_for_spell) {
                //console.log("ending turn for", this.entities[this.turn_index]);
                let sthis = this;
                let interval = this.entities[this.turn_index].id == this.player_ent.id ? this.spell_speed * 5 : this.spell_speed;
                setTimeout(function() {
                    sthis.end_turn()
                }, interval);
            } else {
                let me = this;
                this.checker_interval = setTimeout(function() {
                    me.check_spell_stack();
                }, this.spell_speed);
            }
        }
    }

    end_turn() {
        this.waiting_for_spell = false;
        this.spell_speed = this.max_spell_speed;
        this.spells_this_turn = 0;

        //console.log("ending turn for", this.entities[this.turn_index].name)
        
        this.entities[this.turn_index].do_end_turn();

        clearTimeout(this.checker_interval);
        this.checker_interval = null;

        let valid_ent = false;
        while (!valid_ent) {
            this.turn_index = (this.turn_index + 1) % this.entities.length;
            if (this.entities[this.turn_index].ai_level != 999) {
                valid_ent = true;
            }
        }

        if (Math.random() < (0.05 + (num_enemy_spawns / 100)) && this.entities[this.turn_index].id == this.player_ent.id) {
            let loc = new Vector2(Math.floor(Math.random() * game.board.dimensions.x), Math.floor(Math.random() * game.board.dimensions.y));
            let enemy = game.spawn_entity(get_entity_by_name("test enemy"), Teams.ENEMY, loc, false);
            if (enemy) {
                enemy.name = "spawned guy #" + num_enemy_spawns;

                enemy.add_innate_spell([[
                    core_spell(
                        "Laser", "??", "white", "red", "", 16, DmgType.Psychic, 6, 1,
                        Shape.Line, 0
                    )
                ], 3, "Psycho-Laser", damage_type_cols["Psychic"]]);

                num_enemy_spawns++;
            }
        }

        let sthis = this;
        setTimeout(function() {
            sthis.begin_turn();
        });
    }

    is_player_turn() {
        return this.entities[this.turn_index].id == this.player_ent.id && this.waiting_for_spell;
    }

    get_xp_for_levelup(level) {
        return Math.round(89 + (10 * level) + Math.pow(level, 1.5));
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

        if (spells && spells.length > 0) {
            if (this.player_spell_in_range(at)) {
                this.player_ent.cast_spell(spells, at);
            }
        }
    }

    roll_for_loot(entity_killed, xp_value, restrict_type, custom_pool) {
        let drops = [];
        let drop_count = 0;
        // pick number of drops. xp_value / 500, max chance 75%, min 15%
        // divide xp_value by 1.5 per additional drop
        let drop_increase_chance = xp_value;
        while (true) {
            let roll = Math.floor(Math.random() * 500);
            if (roll < (Math.max(500*0.15, Math.min(500*0.75, drop_increase_chance)))) {
                drop_increase_chance /= 1.5;
                drop_count++;
            } else {
                break;
            }
        }

        for (let i=0; i<drop_count; i++) {
            let pool = [];
            if (custom_pool) {
                pool = custom_pool;
            } else {
                // Start at tier 1
                let tier = 1;

                // Chance to increase in tier starts at (xp_value / 100),
                // with a max of 80%.
                // If chance is 300% or greater, this max is instead 100%
                // If increase was successful, divide chance by 1.4
                let chance = xp_value;
                while (tier < 10) {
                    let roll = Math.floor(Math.random() * 100);
                    if (chance >= 300 || roll < Math.min(500*0.8, chance)) {
                        chance /= 1.4;
                        tier++;
                    }
                }

                // TODO remove debug once we finish the loot table
                tier = 1;

                pool = spells_loot_table["Tier" + tier];
            }

            if (pool.length > 0) {
                let item = pool[Math.floor(Math.random() * pool.length)];

                setTimeout(function() {
                    item_sparkle(item, entity_killed.position)
                }, 100 + 50 * i)
            }
        }
    }

    select_player_spell(id) {
        let result = this.select_player_spell_list(this.player_spells[id].spells);
        
        if (result) {
            renderer.refresh_right_panel = true;
            console.log("game asked for right panel refresh");

            this.selected_id = id;
        } else {
            this.deselect_player_spell();
        }
    }

    select_player_spell_list(spells) {
        if (!game.is_player_turn() || this.inventory_open) {
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
        console.log("game asked for right panel refresh");
    }

    spawn_entity(ent_template, team, position, overwrite) {
        let ent = new Entity(ent_template, team);
        if (this.board.set_pos(position, ent, overwrite)) {
            ent.position = position;
            this.entities.push(ent);
            return ent;
        }

        return null;
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

    find_random_space_in_los(caster, pos, radius, shape, ignore_los) {
        let points = shape(
            caster.position, pos, radius, !ignore_los
        );

        points.sort(() => Math.random() - 0.5);

        for (let i=0; i<points.length; i++) {
            let point = points[i];
            if (this.has_los(caster, point) || ignore_los) {
                return point;
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
        if (this.board.set_pos(new_pos, ent, overwrite)) {
            this.board.clear_pos(ent.position);
            ent.position = new_pos;

            return 1;
        }

        return 0;
    }

    reset_recorded_damage() {
        this.recorded_damage = {};
    }

    reset_damage_count(spell_id) {
        delete this.damage_counts[spell_id];
    }

    get_damage_count(spell_id) {
        return this.damage_counts[spell_id];
    }

    setup_damage_count() {
        let cnts = {};
        for (let typ in DmgType) {
            cnts[typ] = 0;
        }
        
        return cnts;
    }

    deal_damage(target, caster, spell_id, damage, damage_type) {
        let dmg_taken = target.take_damage(caster, damage, damage_type);

        if (!this.damage_counts[spell_id]) {
            this.damage_counts[spell_id] = [];
        }

        this.damage_counts[spell_id].push({
            ent: target,
            amt: dmg_taken,
            typ: damage_type
        });

        let record_name = caster.id.toString() + caster.name;
        if (this.recorded_damage[record_name]) {
            this.recorded_damage[record_name] += dmg_taken;
        } else {
            this.recorded_damage[record_name] = dmg_taken;
        }
    }

    kill(ent) {
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
    }
}

let no_stats = function(a, b, c) {return null};
let no_target = function(a, b, c, d) {return null};
let no_hit = function(a, b, c, d, e, f) {return null};
let no_tiles = function(a, b, c, d) {return null};

function core_spell(name, icon, col, back_col, desc, damage, damage_type, range, radius, shape, manacost, target_type=SpellTargeting.Positional, teams=null) {
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

    let desc_computed = desc.length > 0 ? desc + "\n\n" : "";
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
    return new Spell(name, icon, col, back_col_checked, SpellType.Core, desc_str, manacost, 0, null, stat_function, no_target, no_hit, no_tiles);
}

function modifier(name, icon, col, back_col, desc, manacost, to_stats, at_target, on_hit, on_affected_tiles) {
    let generated_desc = `\n\nMP cost: [#4df]${manacost}[clear]`;

    let back_col_checked = back_col.length > 0 ? back_col : "#03f";
    let spell_gen = new Spell(
        name, icon, col, back_col_checked, SpellType.Modifier, desc + generated_desc, manacost,
        1, null, to_stats, at_target, on_hit, on_affected_tiles
    );

    spell_gen.augment("to_stats", function(user, spell, stats) {
        stats.manacost += manacost;
    });

    return spell_gen;
}

spell_cores = [
    core_spell(
        "Fireball", "@>", "red", "", "", 10, DmgType.Fire, 7, 3,
        Shape.Diamond, 25
    ),

    core_spell(
        "Fireball with Target Trigger", "@*", "red", "#440", "Triggers another core at the target position.", 
        10, DmgType.Fire, 7, 3,
        Shape.Diamond, 60
    ).set_trigger("at_target"),

    core_spell(
        "Icicle", "V^", "#A5F2F3", "", "", 15, DmgType.Ice, 8, 1,
        Shape.Diamond, 20
    )
];

spell_mods_stats = [
    modifier(
        "Damage Plus I", "D+", "#c44", "", "Increase core damage by [#4df]5[clear].", 10,
        function(_, _, s) {
            s.damage += 5;
        }
    )
];

spell_mods_dmg = [
    
];

spell_mods_cosmetic = [
    
];

spell_mods_triggers = [
    modifier(
        "Add Target Trigger", "+*", "#990", "#26f",
        "Makes the core cast the next core at the point it was targeted.",
        25
    ).set_trigger("at_target"),

    modifier(
        "Add Tile Trigger", "+x", "#990", "#26f",
        "Makes the core cast a copy of the next core at every tile the core affected.",
        500
    ).set_trigger("on_affected_tiles"),

    modifier(
        "Add Damage Trigger", "+;", "#990", "#26f",
        "Makes the core cast a copy of the next core at every instance of damage the core caused.",
        400
    ).set_trigger("on_hit"),
];

spell_mods_shape = [
    
];

spell_mods_multicast = [
    
];

spell_mods_misc = [
    
];

spells_list = [
    ...spell_cores,
    ...spell_mods_stats,
    ...spell_mods_triggers,
    // lightning and other stuff here temporarily
    core_spell(
        "Lightning Bolt", "&>", "#ffff33", "", "", 17, DmgType.Lightning, 10, 1,
        Shape.Line, 18
    ),

    modifier(
        "Radius Plus I", "R+", "#4cf", "", "Increases the core's radius by [#4df]1[clear].", 30,
        function(_, _, s) {
            s.radius += 1;
        }
    ),

    modifier(
        "Behind the Back", "<$", "white", "", "Casts a copy of the core behind the user.", 120,
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
        "Multicast x4", ">4", "#0f0", "", "Casts a copy of the core four times.", 300,
        function(user, spell, stats) {
            stats.multicasts["normal"] += 4;
        }
    ),

    modifier(
        "Projection", ">~", "white", "", "Allows the core to ignore line of sight for targeting and effects.", 40,
        function(user, spell, stats) {
            stats.los = false;
        }
    ),

    core_spell(
        "Gun", "%=", "white", "red", "", 5000, DmgType.Physical, 30, 1, Shape.Line, 50, SpellTargeting.Positional, [Teams.ENEMY]
    ).augment("at_target", function(user, spell, stats, location) {
        user.cast_spell([
            core_spell(
                "gun explosion", "##", "white", "black", "", 25, DmgType.Fire, 1, 1, Shape.Diamond, 0, stats.target_type, stats.target_team
            )
        ], location);
    }),

    modifier(
        "Uncontrolled Multicast x16", "!F", "#0f0", "red", "Casts a copy of the core sixteen times, moving the target by a random number of tiles up to the core's final radius + 1 each time.", 200,
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += 16;
        }
    ),

    core_spell(
        "All Elements", "!!", "white", "red", "all at once. testing", 99999, DmgType.Physical, 1, 40, Shape.Diamond, 0, SpellTargeting.SelfTarget
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
            game.max_spell_speed = 400;
            game.min_spell_speed = 400;
    
            user.cast_spell([
                core_spell(
                    t, "##", "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(0, -8)));

            user.cast_spell([
                core_spell(
                    t, "##", "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = true; })
            ], location.add(new Vector2(-8, 0)));

            user.cast_spell([
                core_spell(
                    t, "##", "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(8, 0)));

            user.cast_spell([
                core_spell(
                    t, "##", "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
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
                    "t", "##", "white", "black", "", 1, DmgType.Physical, 1, 3, Shape.Line, 0
                ).augment("at_target", function(_, _, _, _) { 
                    game.max_spell_speed = 100;
                    game.min_spell_speed = 10;
                })
            ], location);

            game.cast_primed_spell(new_spell.root_spell, location, true);
        }
    }),

    core_spell(
        "pea spell", "!!", "white", "red", "pea spell",
        73, DmgType.Chaos, 10, 3, Shape.Circle, 2
    ),

    modifier(
        "Chain Spell", "/>", "white", "", "Makes the core recast a copy of itself on a single random valid target within the core's [#4df]range[clear] as many times as the spell's [#4df]chain[clear] value.\n\nAdds [#4df]4[clear] to the core's [#4df]chain[clear] value.",
        350, function(user, spell, stats) {
            stats.multicasts["chain"] += 4;
        }
    ),

    modifier(
        "Arc Spell", "*>", "yellow", "", "Makes the core recast a copy of itself on random valid targets within the core's [#4df]range[clear] up to the spell's [#4df]arc[clear] value.\n\nAdds [#4df]4[clear] to the core's [#4df]arc[clear] value.",
        250, function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 4;
        }
    ),

    core_spell(
        "summon GUY", "@]", "white", "red", "Summon \"Guy\" at the target position.",
        25, DmgType.Dark, 10, 5, Shape.Circle, 120
    ).augment("at_target", function(user, spell, stats, location) {
        game.spawn_entity(get_entity_by_name("Fuckn GUy"), Teams.PLAYER, location, true);
    })
]


spells_loot_table = {
    "Tier1": [...spells_list],
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

console.log(spells_list.filter(s => s.back_col != "red").length + " non-red items")
console.log(spells_list.filter(s => s.back_col == "red").length + " red items")
console.log(spells_list.filter(s => s.back_col != "red" && !Object.keys(spells_loot_table).some(g => spells_loot_table[g].some(sc => sc.id != s.id))).length + " non-red items have no loot group assigned");


entity_templates = [
    new EntityTemplate("Player", "@=", "#0cf", "It's you.", 100+5000, 2500, [
        Affinity.Living, Affinity.Chaos, Affinity.Insect  // player is only living by default, can be changed by events
    ], 0, [

    ], 0, false, false),

    new EntityTemplate("test enemy", "Gg", "#0f0", "idk goblin or smt", 100, 10, [
        Affinity.Ice, Affinity.Insect, Affinity.Living
    ], 15, [
        [[
            core_spell(
                "Bite", "??", "white", "red", "", 6, DmgType.Physical, 1, 1,
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
    ], 2500, [

    ], 1, false, false),

    new EntityTemplate("Fuckn GUy", "G#", "#480", "Stupid idiot", 150, 250, [
        Affinity.Dark,
        Affinity.Demon
    ], 0, [
        [gen_spells("damage plus i", "lightning bolt"), 0, "KIll You BOLT", "yellow"],
        [[
            get_spell_by_name("add target trigger"),
            core_spell(
                "EPXLODE", "@@", "red", "red", "", 25, DmgType.Holy, 40, 1,
                Shape.Line, 100
            ),
            core_spell(
                "EPXLODE 2", "@@", "red", "red", "", 100, DmgType.Psychic, 1, 2,
                Shape.Diamond, 0
            ),
        ], 8, "EPXLODE", "red"]
    ], 1, false, false),

    new EntityTemplate("Wall", "[]", "#ccc", "Just a wall.", Number.POSITIVE_INFINITY, 0, [
        Affinity.Construct
    ], 0, [

    ], 999, true, true),
]

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

let num_enemy_spawns = 0;

let board = new Board(new Vector2(64, 64));
let game = new Game(board);
let renderer = new Renderer(game, board, new Vector2(64, 36), 48, 48, 1/3);

game.spawn_player(get_entity_by_name("Player"), new Vector2(16, 18));
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
    {spells: gen_spells("arc spell", "lightning bolt"), name: "arc bolt"},
    {spells: [...spells_list.filter(s => s.back_col == "red")], name: "Every Dev Spell"},
    {spells: [...spells_list.filter(s => s.back_col != "red")], name: "Every Real Spell"},
    {spells: gen_spells("multicast x4", "add target trigger", "lightning bolt", "radius plus i", "add damage trigger", "fireball", "icicle"), name: "a bunch of stuff"},
    {spells: gen_spells("gun"), name: "gun"}
]

game.begin_turn();
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

function general_sparkle(from, particle, col, info, on_hit_player) {
    let dat = {
        speed: random_on_circle((Math.random() * 1.5) + 1),
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

function item_sparkle(item, from) {
    let titem = item;
    general_sparkle(from, item_flash, item.typ == SpellType.Core ? "#fff" : "#4df", {item: titem}, function(info) { game.player_add_spell_to_inv(info.item) })
}

game.player_add_spells_to_inv([...spells_list].flatMap(i => []));
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
    // scale font size such that total_size.x/y characters fit
    
    // remember x size coverage is half because the font is 8x16
    // we also want to make sure it isnt way too big...
    let fontsize_x = vw(180) / renderer.total_size.x;

    // if screen is very long, the font might be too big.
    // need to check for the smallest allowed font in both directions and pick the minimum
    let fontsize_y = vh(90) / renderer.total_size.y;

    let fontsize = Math.min(fontsize_x, fontsize_y);

    console.log("fontsize before rounding:", fontsize, "after: ", Math.round(fontsize));

    let fontsize_round = Math.floor(fontsize);

    let gamelines = document.getElementById("gamelines");
    let game = document.getElementById("game");

    gamelines.style.setProperty("--fontsiz_noround", `${fontsize_round}px`);
    gamelines.style.setProperty("--fontsiz_noround_half", `${fontsize_round / 2}px`);

    game.style.setProperty("--fontsiz", `${fontsize_round}px`);
}


window.addEventListener("resize", handle_resize, true);

document.addEventListener("DOMContentLoaded", function() {
    handle_resize();
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
            switch (name) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                    game.select_player_spell(Number.parseInt(name) - 1);
                    break;
    
                case "Escape":
                    game.deselect_player_spell();
                    break;
    
                case "r":
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
    
                case "q":
                    game.select_player_spell_list([spells_list[14]]);
                    break;
    
                case "ArrowUp":
                case "w":
                    mov_pos = new Vector2(0, -1);
                    break;
    
                case "ArrowDown":
                case "s":
                    mov_pos = new Vector2(0, 1);
                    break;
    
                case "ArrowLeft":
                case "a":
                    mov_pos = new Vector2(-1, 0);
                    break;
    
                case "ArrowRight":
                case "d":
                    mov_pos = new Vector2(1, 0);
                    break;
            }
    
            if (mov_pos && game.is_player_turn()) {
                let result = game.move_entity(
                    game.player_ent,
                    game.player_ent.position.add(mov_pos),
                    false
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
// - work out a way to show the effect of the whole spell for enemies
// GAME LOOP:
// - enemy waves
// - open inventory after beating all enemies
// - world generation between waves
// - hp/mp regen after beating wave
// - spawn credits; waves get stronger each time etc etc
/*
https://docs.google.com/spreadsheets/d/1HZQqG0wqTs9oZUu4H4hqChqNRa-kj8lPe9Y93V5l_z8/edit?usp=sharing
*/