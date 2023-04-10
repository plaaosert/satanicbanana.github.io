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
function in_bounds(val, lo, hi) {
    return val >= lo && val < hi;
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
        return this.div(this.magnitude);
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

    constructor(template, start_at, override_speed) {
        this.id = Particle.id_inc;
        Particle.id_inc++;

        this.template = template;
        this.current_frame = start_at ? start_at : 0;
        this.current_str = template.frames[this.current_frame];
        this.speed = override_speed ? override_speed : template.speed;
    }

    advance(speed_mult) {
        this.current_frame += this.speed * (speed_mult ? speed_mult : 1);
        if (this.current_frame < this.template.num_frames) {
            this.current_str = this.template.frames[Math.floor(this.current_frame)];
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

        this.pixel_chars = [];
        this.left_menu_size = new Vector2(left_menu_len, game_view_size.y);
        this.right_menu_size = new Vector2(right_menu_len, game_view_size.y);
        this.total_size = new Vector2(game_view_size.x + left_menu_len + right_menu_len, game_view_size.y);
    
        this.particle_speed = particle_speed;
        this.active_particles = [];
        this.particle_list = [];
        for (var yt=0; yt<game_view_size.y; yt++) {
            this.active_particles.push([]);

            for (var xt=0; xt<game_view_size.x/2; xt++) {
                this.active_particles[yt].push(null);
            }
        }

        this.selected_tile = null;
        this.last_selected_tiles = [];

        this.last_player_spell_state = null;
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
        var siz = this.total_size;

        // make a span for every pixel for now. this might suck but i think
        // it's better than repainting the DOM heavily every frame
        this.pixel_chars = [];
        var parent = document.getElementById("gamelines");
        parent.innerHTML = "";

        for (var y=0; y<siz.y; y++) {
            this.pixel_chars.push([]);

            for (var x=0; x<siz.x; x++) {
                var c = document.createElement("span");
                c.classList.add("gamepixel");
                c.classList.add("white");
                if (x >= this.left_menu_size.x && x < this.left_menu_size.x + this.game_view_size.x) {
                    if ((Math.floor(x/2) + y) % 2 != 0) {
                        c.classList.add("check-dark");
                    } else {
                        c.classList.add("check-light");
                    }
                }

                c.textContent = x < this.left_menu_size.x ? "<" : (x >= this.left_menu_size.x + this.game_view_size.x ? ">" : ".");
                
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

            parent.appendChild(document.createElement("br"));
        }
    }

    mouseover(event, flattened_id) {
        var resolved_pos = new Vector2(
            flattened_id % this.total_size.x,
            Math.floor(flattened_id / this.total_size.x)
        )

        if (this.selected_tile) {
            this.last_selected_tiles.push(this.selected_tile);
        }

        switch (this.get_position_panel(resolved_pos)) {
            case 0:  // left panel
                break;
            case 1:  // game screen
                // highlight current selected panel
                this.selected_tile = resolved_pos;

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
        var resolved_pos = new Vector2(
            flattened_id % this.total_size.x,
            Math.floor(flattened_id / this.total_size.x)
        )

        // convert to coords just on game space (- left tile x)
        // find screen difference between clicked tile and player tile
        // (player tile is always in the center, so half the x and y of game viewport)
        // convert that into game difference (x/2)
        // apply to player game position
        // we have our game position
        var normalised_pos = resolved_pos.sub(new Vector2(this.left_menu_size.x, 0));
        normalised_pos = new Vector2(Math.floor(normalised_pos.x / 2) * 2, Math.floor(normalised_pos.y));

        var player_screen_pos = this.game_view_size.div(2);
        var screen_diff = normalised_pos.sub(player_screen_pos);
        var game_diff = new Vector2(screen_diff.x / 2, screen_diff.y);

        var game_pos = game.player_ent.position.add(game_diff);
        target = game_pos;

        if (game.selected_player_primed_spell) {
            // temp
            test2();
        } else {
            // try to move towards the tile - use line again.
            let path = pathfind(game.player_ent.position, game_pos);

            if (path && path.length > 1) {
                game.move_entity(game.player_ent, path[1], false);
                this.move_particles(path[1].sub(game.player_ent.position).neg());
            }
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
        var game_dist_diff = pos.sub(this.game.player_ent.position);

        // convert into screen space (multiply by 2)
        var screen_diff = new Vector2(game_dist_diff.x * 2, game_dist_diff.y);

        // screen position of player is always centered so:
        var player_screen_pos = this.game_view_size.div(2);

        // sum
        var particle_pos = screen_diff.add(player_screen_pos);

        //console.log("putting particle. game", pos, "screen", particle_pos);
        this.add_particle(particle_pos, particle);
    }

    get_particle(pos) {
        var particle_pos = new Vector2(pos.x - this.left_menu_size.x, pos.y);
        return this.active_particles[particle_pos.y][particle_pos.x / 2];
    }

    remove_particle(pos) {
        this.active_particles[pos.y][pos.x / 2] = null;
    }

    set_back(pos, col) {
        var p = this.pixel_chars[pos.y][pos.x];
        p.style.backgroundColor = col;
    }

    set_back_pair(pos, col) {
        this.set_back(pos, col);

        let add_vec = pos.x % 2 == 0 ? new Vector2(1, 0) : new Vector2(-1, 0);
        this.set_back(pos.add(add_vec), col);
    }

    set_pixel(pos, char, col) {
        var p = this.pixel_chars[pos.y][pos.x];
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

    advance_particles() {
        var new_particle_list = [];
        var sthis = this;
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

    render_game_view() {
        // grab the portion of board around the player
        // since the screen space for the game is 2x1, we
        // need to factor that into our horizontal length
        // (we can only fit half as many chars as it seems)

        var hlen = this.game_view_size.x / 2;
        var vlen = this.game_view_size.y / 2;

        var player_pos = this.game.player_ent.position;

        // game positions. here we ensure we only go half as much back
        var tl = new Vector2(Math.floor(player_pos.x - (hlen / 2)), Math.floor(player_pos.y - vlen));
        var br = new Vector2(Math.ceil(player_pos.x + (hlen / 2)), Math.ceil(player_pos.y + vlen));

        var x_delta = br.x - tl.x;
        var y_delta = br.y - tl.y;

        //console.log(tl, br);

        let selected_col = "#888";
        for (let i=0; i<this.last_selected_tiles.length; i++) {
            this.set_back_pair(this.last_selected_tiles[i], null);
        }

        this.last_selected_tiles = [];

        for (var x=0; x<x_delta; x++) {
            for (var y=0; y<y_delta; y++) {
                // screen pos is twice x because it's 2x1 on screen only
                var screen_pos = new Vector2((x * 2) + this.left_menu_size.x, y);

                var screen_particle = this.get_particle(screen_pos);
                var game_pos = tl.add(new Vector2(x, y));
                if (!screen_particle) {
                    // game pos is simply the top left plus current coords
                    var ent = this.board.get_pos(game_pos);

                    //console.log("screen:", screen_pos, "game:", game_pos);

                    if (ent) {
                        this.set_pixel_pair(screen_pos, ent.template.icon, ent.template.col);
                    } else {
                        this.set_pixel_pair(screen_pos, "\u00A0\u00A0");
                    }
                } else {
                    // draw the particle instead
                    this.set_pixel_pair(screen_pos, screen_particle.current_str, screen_particle.template.col);
                }

                // now do spell range highlighting (and select highlighting),
                // including LOS if necessary
                
                // if the game has a selected player spell,
                // check if the spell is in range. if it is,
                // tint green. if not, normal tint
                //var current_state = game.selected_player_primed_spell ? "spell" : "none";

                // can do some optimisation here since we overdraw the same stuff a lot
                if (true) {
                    if (game.selected_player_primed_spell) {
                        if (game.selected_player_primed_spell.root_spell.in_range(game.player_ent, game_pos)) {
                            let range_indicator_col = (Math.floor(screen_pos.x/2) + screen_pos.y) % 2 != 0 ? "#040" : "#050";

                            this.set_back_pair(screen_pos, range_indicator_col);

                            if (this.selected_tile && new Vector2(Math.floor(this.selected_tile.x / 2) * 2, this.selected_tile.y).equals(screen_pos)) {
                                //console.log("changed");
                                selected_col = "#0a0";
                                //console.log(selected_col);
                            }
                        } else {
                            this.set_back_pair(screen_pos, null);
                        }
                    } else {
                        this.set_back_pair(screen_pos, null);
                    }

                    //this.last_player_spell_state = current_state;
                }
            }
        }

        // selected cell
        if (this.selected_tile) {
            this.set_back_pair(this.selected_tile, selected_col);
        }
    }

    test() {
        var cols = ["#fff", "#f00", "#0f0", "#00f", "#000"];
        var chars = ["#", "&", "+", "-", "\u00A0"];
        var sthis = this;
        
        for (let i=0; i<1024; i++) {
            setTimeout(function() {
                //console.log(i);
                var col = cols[i % 4];

                for (var o=0; o<50; o++) {
                    if (i-o >= 0) {
                        var loc = new Vector2((i-o) % (sthis.total_size.x + sthis.total_size.y), 0);
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
        var x = size.x;
        var y = size.y;

        this.dimensions = new Vector2(size.x, size.y);
        this.cells = [];
        for (var yt=0; yt<y; yt++) {
            this.cells.push([]);

            for (var xt=0; xt<x; xt++) {
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
        var result = this.get_pos(position);
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
    constructor(name, icon, col, desc, max_hp, max_mp, affinities, innate_spells, ai_level) {
        this.name = name
        this.icon = icon
        this.col = col
        this.desc = desc
        this.max_hp = max_hp
        this.max_mp = max_mp
        this.affinities = affinities
        this.innate_spells = innate_spells
        this.ai_level = ai_level
    }
}


class Entity {
    static id_inc = 0;

    constructor(template, team) {
        this.id = Entity.id_inc;
        Entity.id_inc++;

        this.template = template;
        this.name = template.name
        this.max_hp = template.max_hp
        this.hp = this.max_hp;
        this.max_mp = template.max_mp
        this.mp = this.max_mp;
        this.position = new Vector2(0, 0);
        this.affinities = template.affinities
        this.innate_spells = template.innate_spells
        this.ai_level = template.ai_level
        this.team = team
        this.dead = false;
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
        var spells_text = "";
        spells.forEach(spell => {
            var core_mod_st = spell.typ == SpellType.Core ? "[]" : "{}";
            spells_text += `${core_mod_st} ${spell.name}<br>`;
        })

        document.getElementById("spell-list").innerHTML = spells_text;

        // parse the spell into a primed spell first
        // then check its manacost and ensure the entity can cast it
        // then cast that spell for the game

        // until i can figure out multicasts, we're dropping them.
        // triggers only
        var root_spell = null;
        var last_spell = null;
        var draws = 1;
        var after_finishing_draws = "stop";
        var next_trigger = "";
        var cores_in_draw = [];
        var modifiers_in_draw = [];
        var finished_drawing = false;

        var manacost = 0;

        for (var i=0; i<spells.length; i++) {
            if (finished_drawing) {
                break;
            }

            var spell = spells[i];

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
                var new_primed_spell = new PrimedSpell(this, [
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
            return null;
        }
    }

    cast_spell(spells, position_target) {
        let spell_info = this.parse_spell(spells, position_target);

        if (spell_info) {
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
    }

    die() {
        this.dead = true;
        game.kill(this);
    }

    lose_hp(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    take_damage(caster, damage, damage_type) {
        if (this.dead) {
            return 0;
        }

        // compare damage type to affinities and determine total multiplier
        var dmg_mult = 1;
        this.affinities.forEach(affinity => {
            dmg_mult *= affinity_weaknesses[affinity][damage_type]
        });

        // spell source might change damage but not right now
        var final_damage = damage * dmg_mult;

        this.lose_hp(final_damage);
        console.log(`${this.name} says "ow i took ${final_damage} ${damage_type} damage (multiplied by ${dmg_mult} from original ${damage}) from ${caster.name}`);
        if (this.name == "moving guy") {
            hitcount++;
            document.getElementById("hit-text").textContent = `guy took ${final_damage} ${damage_type} damage (hit ${hitcount})`;
        }

        return final_damage;
    }
}

class Spell {
    // inventory items use references to these single objects. do not edit them
    constructor(name, typ, desc, manacost, bonus_draws, trigger_type, to_stats_fn, at_target_fn, on_hit_fn, on_affected_tiles_fn) {
        this.name = name;
        // in all cases, the core spell's functions are called first,
        // followed by modifiers in the order of placement.
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
        var old_function = this.fns[fn];
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
    Positional: 'a position',
    UnitTarget: 'a specific unit',      // includes teams for filtering
    SelfTarget: 'around the caster',    // cast location is self tile
    SelfTargetPlusCasterTile: 'at the caster\'s position'  // self target implicitly removes caster tile but this doesn't
};

const Teams = {
    PLAYER: "Player",
    ENEMY: "Enemy",
    UNTARGETABLE_NO_LOS: "Untargetable No LOS",
    UNTARGETABLE: "Untargetable",
}

function make_square(target, radius, predicate) {
    var positions = [];
    var tx = target.x;
    var ty = target.y;

    for (var y=0; y<radius; y++) {
        for (var x=0; x<radius; x++) {
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
        var newArray = array.slice();
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

            if (board.position_valid(neighbor) && !board.get_pos(neighbor)) {
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

    var x0 = a.x;
    var y0 = a.y;

    var x1 = b.x;
    var y1 = b.y;

    var coords = [];
    var dx = Math.abs(x1-x0);
    var sx = x0<x1 ? 1 : -1;
    var dy = Math.abs(y1-y0);
    var sy = y0<y1 ? 1 : -1; 
    var err = (dx>dy ? dx : -dy)/2;
    var e2 = 0;

    while (true) {
        if (just_one && coords.length >= 1) {
            return coords;
        }

        if (x0 != a.x || y0 != a.y) {
            var coord = new Vector2(x0, y0);

            if (respect_los) {
                let ent_raw = board.get_pos(coord);
                if (ent_raw && ent_raw.has_team(Teams.UNTARGETABLE_NO_LOS)) {
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

                var point_ent = game.board.get_pos(new_pos);
                var position_already_recorded = false;
                for (let i=0; i<positions.length; i++) {
                    if (positions[i].equals(new_pos)) {
                        position_already_recorded = true;
                        break;
                    }
                }

                var ent_blocks_los = point_ent ? point_ent.has_team(Teams.UNTARGETABLE_NO_LOS) : false;

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
            return "Square";
        }

        return make_square(target, radius);
    }],
    Circle: ["circle shape", function(origin, target, radius, los) {

    }],
    Ring: ["ring shape", function(origin, target, radius, los) {

    }],
    Diamond: ["burst", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "Diamond";
        }

        // make a square but filter it a little
        return propagate_diamond(target, radius, los);
    }],
    Line: ["straight line", function(origin, target, radius, los) {
        if (origin == "whoami") {
            return "Line";
        }

        //console.log(origin, target);

        return make_line(origin, target, radius, los);
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
    "Fire": "#fff",
    "Ice": "#fff",
    "Lightning": "#fff",
    "Arcane": "#fff",
    "Ghost": "#fff",
    "Chaos": "#fff",
    "Holy": "#fff",
    "Dark": "#fff",
    "Demon": "#fff",
    "Undead": "#fff",
    "Natural": "#fff",
    "Living": "#fff",
    "Insect": "#fff",
    "Construct": "#fff",
    "Order": "#fff"
}

// index 1: what type the defender is
// index 2: what type the attacker is
affinity_weaknesses = {
    "Fire": {
        "Fire": 2,  // fight fire with fire >:)
        "Ice": 0.25,  // ice very ineffective
        "Lightning": 1,  // lightning is neutral
        "Arcane": 1,  // arcane also neutral
        "Physical": 0.75,  // physical slightly ineffective
        "Dark": 2,  // dark extinguishes fire
        "Chaos": 0.5,  // fire is already chaos so ineffective
        "Holy": 1.5,  // holy beats fire because order
        "Psychic": 1,  // neutral
    },

    "Ice": {
        "Fire": 2,       // fire OWNS ice
        "Ice": 1,        // neutral
        "Lightning": 0.75,  // ice resists shocks
        "Arcane": 1.5,     // arcane beats ice because arcane crystals
        "Physical": 1.5,   // physical cracks ice
        "Dark": 1,       // neutral
        "Chaos": 1.5,      // chaos beats ice b/c kinda fire
        "Holy": 0.5,       // ice beats holy because dark-aligned
        "Psychic": 0.5,    // ice beats psychic. too big
    },

    "Lightning": {
        "Fire": 1,       // neutral
        "Ice": 1.5,        // ice wins
        "Lightning": 1,  // neutral
        "Arcane": 0.75,     // lightning wins
        "Physical": 0.75,   // lightning wins
        "Dark": 0.5,       // lightning wins
        "Chaos": 1.5,      // chaos wins
        "Holy": 1.5,       // holy wins
        "Psychic": 1,    // neutral
    },
 
    "Arcane": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Ghost": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Chaos": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Holy": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Dark": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Demon": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Undead": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Natural": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Living": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Insect": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Construct": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
 
    "Order": {
        "Fire": 1,       // justification
        "Ice": 1,        // justification
        "Lightning": 1,  // justification
        "Arcane": 1,     // justification
        "Physical": 1,   // justification
        "Dark": 1,       // justification
        "Chaos": 1,      // justification
        "Holy": 1,       // justification
        "Psychic": 1,    // justification
    },
};


class PrimedSpell {
    static id_inc = 0;

    constructor(caster, spells) {
        this.id = PrimedSpell.id_inc;
        PrimedSpell.id_inc++;

        this.caster = caster
        this.spells = spells
        this.trigger = ["none", null];  // ["at_target"/..., PrimedSpell]

        this.stats = {};
        this.calculate();
    }

    calculate() {
        this.stats.primed_spell = this;
        this.stats.mutable_info = {};

        this.stats.target_team = [Teams.ENEMY, Teams.PLAYER];
        this.stats.target_affinities = null;
        this.stats.damage = 0;
        this.stats.damage_type = DmgType.Physical;
        this.stats.targeting_predicates = [];
        this.stats.target_type = SpellTargeting.Positional;
        this.stats.radius = 0;
        this.stats.range = 0;
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
        if (caster.position.equals(position)) {
            return true;
        }

        let los_check = game.has_los(caster, position);

        if (los_check || !this.stats.los) {
            return caster.position.distance(position) <= this.stats.range;
        }
    }

    cast(board, caster, position) {
        var self_target_safe = this.stats.target_type == SpellTargeting.SelfTarget;

        var cast_locations = this.stats.shape(caster.position, position, this.stats.radius, this.stats.los);
        //console.log(cast_locations);

        if (self_target_safe) {
            cast_locations = cast_locations.filter(loc => !(loc.x == position.x && loc.y == position.y));
        }
        
        game.reset_damage_count(this.id);

        var sthis = this;
        cast_locations.forEach(location => {
            // if the location is LOS untargetable never do anything
            // unless we ignore LOS
            let ent_raw = board.get_pos(location);
            if (this.stats.los && ent_raw && ent_raw.has_team(Teams.UNTARGETABLE_NO_LOS)) {
                return;
            }

            // by default we add a particle on every location affected
            renderer.put_particle_from_game_loc(location, new Particle(
                dmg_type_particles[sthis.stats.damage_type]
            ));

            var targeting_predicate = sthis.stats.targeting_predicates.length > 0 ? function(e) { sthis.stats.targeting_predicates.every(p => p(e)) } : null;
            var ent = board.check_for_entity(
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
                    spell.fns.on_affected_tiles(sthis.caster, spell, sthis.stats, location);
                }
            })

            if (sthis.trigger[0] == "on_affected_tiles") {
                game.cast_primed_spell(sthis.trigger[1], location);
            }
        })

        // trigger point target functions
        this.spells.forEach(spell => {
            if (spell.fns.at_target) { 
                spell.fns.at_target(this.caster, spell, this.stats, position);
            }
        })

        if (this.trigger[0] == "at_target") {
            game.cast_primed_spell(this.trigger[1], position);
        }

        // get list of damaged entities from this spell
        var damaged_entities = game.get_damage_count(this.id);
        // [{ent, dmg_amount, dmg_type}]
        // each instance of damage is handled separately

        if (damaged_entities) {
            damaged_entities.forEach(dmg_instance => {
                var ent = dmg_instance.ent;
                var amt = dmg_instance.amount;
                var typ = dmg_instance.dmg_type;

                this.spells.forEach(spell => {
                    if (spell.fns.on_hit) {
                        spell.fns.on_hit(this.caster, spell, this.stats, ent, amt, typ);
                    }
                })

                if (this.trigger[0] == "on_hit") {
                    game.cast_primed_spell(this.trigger[1], ent.position);
                }
            })
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

        this.selected_player_spell = null;
        this.selected_player_primed_spell = null;

        // current turn; pops spells off this stack one by one for the purposes of animation
        // anything that casts a spell goes through here first
        this.casting_stack = []
        this.waiting_for_spell = false;
        this.checker_interval = null;

        this.spell_speed = 100;

        this.turn_index = 0  // index into entities
    }

    begin_turn() {
        this.casting_stack = [];
        this.waiting_for_spell = true;

        // shout here for the current turn entity's AI or the player to pick a move to use

        // we then periodically check the casting stack to see if there's anything on there.
        // if there is, we cast it and set waiting_for_spell to true, which means
        // that once we clear out the casting stack the current entity's turn will end.
        var me = this;
        this.checker_interval = setTimeout(function() {
            me.check_spell_stack();
        }, this.spell_speed);
    }

    cast_primed_spell(primed_spell, position_target, insert_at_bottom) {
        //console.log("enqueued", primed_spell, "at", position_target);
        if (insert_at_bottom) {
            this.casting_stack.unshift({spell: primed_spell, target: position_target});
        } else {
            this.casting_stack.push({spell: primed_spell, target: position_target});
        }
    }

    check_spell_stack() {
        // primed spells go on the spell stack so they can be cast instantly
        // they are given as a collection of {spell, target}
        //console.log("checking spell stack");
        //console.log("casting stack:", this.casting_stack, "waiting:", this.waiting_for_spell);
        if (this.casting_stack.length > 0) {
            var spell_to_cast = this.casting_stack.pop();
            //console.log("casting spell", spell_to_cast, "for",  this.entities[this.turn_index]);
            spell_to_cast.spell.cast(this.board, this.entities[this.turn_index], spell_to_cast.target);
            this.waiting_for_spell = false;

            var me = this;
            this.checker_interval = setTimeout(function() {
                me.check_spell_stack();
            }, this.spell_speed);
        } else {
            if (!this.waiting_for_spell) {
                //console.log("ending turn for", this.entities[this.turn_index]);
                this.end_turn();
            } else {
                var me = this;
                this.checker_interval = setTimeout(function() {
                    me.check_spell_stack();
                }, this.spell_speed);
            }
        }
    }

    end_turn() {
        //console.log("ending turn for", this.entities[this.turn_index].name)
        this.turn_index = (this.turn_index + 1) % this.entities.length;
        clearTimeout(this.checker_interval);
        this.checker_interval = null;
    }

    player_spell_in_range(position) {
        return this.selected_player_primed_spell.root_spell.in_range(this.player_ent, position);
    }

    select_player_spell(spells) {
        this.selected_player_spell = spells;
        this.selected_player_primed_spell = this.player_ent.parse_spell(spells, new Vector2(0, 0));
    }

    deselect_player_spell() {
        this.selected_player_spell = null;
        this.selected_player_primed_spell = null;
    }

    spawn_entity(ent_template, team, position, overwrite) {
        var ent = new Entity(ent_template, team);
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

    has_los(ent, position) {
        let line = make_line(ent.position, position, 1, true);

        // line stops at an LOS blocker,
        // so to find out if we have LOS we just check if the line
        // ends at the position we want
        if (line.length > 0 && line[line.length - 1].equals(position)) {
            return line;
        } else {
            return false;
        }
    }

    find_random_space_in_los(caster, pos, radius, shape) {
        let points = shape(
            caster.position, pos, radius, false
        );

        points.sort(() => Math.random() - 0.5);

        for (let i=0; i<points.length; i++) {
            let point = points[i];
            if (this.has_los(caster, point)) {
                return point;
            }
        }

        return null;
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
        var cnts = {};
        for (var typ in DmgType) {
            cnts[typ] = 0;
        }
        
        return cnts;
    }

    deal_damage(target, caster, spell_id, damage, damage_type) {
        var dmg_taken = target.take_damage(caster, damage, damage_type);

        if (!this.damage_counts[spell_id]) {
            this.damage_counts[spell_id] = [];
        }

        this.damage_counts[spell_id].push({
            ent: target,
            amt: dmg_taken,
            typ: damage_type
        });

        var record_name = caster.id.toString() + caster.name;
        if (this.recorded_damage[record_name]) {
            this.recorded_damage[record_name] += dmg_taken;
        } else {
            this.recorded_damage[record_name] = dmg_taken;
        }
    }

    kill(ent) {
        var current_turn_entity = this.entities[this.turn_index];
        var new_entity_list = [];
        for (var i=0; i<this.entities.length; i++) {
            if (this.entities[i].id != ent.id) {
                new_entity_list.push(this.entities[i]);
            }
        }

        if (current_turn_entity.id == ent.id) {
            var updated_turn_index = null;
            for (var i=0; i<new_entity_list.length; i++) {
                if (this.entities[i].id != current_turn_entity.id) {
                    updated_turn_index = i;
                }
            }
            
            this.turn_index = updated_turn_index;
        } else {
            this.turn_index += 1
        }

        this.entities = new_entity_list;
        this.turn_index = this.turn_index % this.entities.length;
    }
}

var no_stats = function(a, b, c) {return null};
var no_target = function(a, b, c, d) {return null};
var no_hit = function(a, b, c, d, e, f) {return null};
var no_tiles = function(a, b, c, d) {return null};

function core_spell(name, desc, damage, damage_type, range, radius, shape, manacost, target_type=SpellTargeting.Positional, teams=null) {
    var dmg_string = "";
    if (damage == 0) {
        dmg_string += "Affects tiles ";
    } else if (damage > 0) {
        dmg_string += `Deals [white]${damage} [${damage_type_cols[damage_type]}]${damage_type}[clear] damage `;
    } else if (damage < 0) {
        dmg_string += `Applies [white]${damage} [${damage_type_cols[damage_type]}]${damage_type}[clear] healing `
    }
    
    var shape_string = `in a [white]${shape[0]}[clear] with radius [white]${radius}[clear].`;
    
    var target_string = `Targets [white]${target_type}[clear].`;

    var range_string = `Range: [white]${range}[clear] tiles`;

    var mp_string = `MP cost: [white]${manacost}[clear]`;

    var desc_computed = desc.length > 0 ? desc + "\n" : "";
    var desc_str = `${desc_computed}${dmg_string}
${shape_string}
${target_string}
${range_string}
${mp_string}`;
    
    var stat_function = function(user, spell, stats) {
        stats.range = range;
        stats.damage = damage;
        stats.radius = radius;
        stats.shape = shape[1];
        stats.manacost = manacost;
        stats.damage_type = damage_type;
        stats.target_type = target_type;
        stats.target_team = teams ? teams : [Teams.ENEMY, Teams.PLAYER];
    }

    return new Spell(name, SpellType.Core, desc_str, manacost, 0, null, stat_function, no_target, no_hit, no_tiles);
}

function modifier(name, desc, manacost, to_stats, at_target, on_hit, on_affected_tiles) {
    var generated_desc = `\nMP cost: [white]${manacost}[clear]`;
    var spell_gen = new Spell(
        name, SpellType.Modifier, desc + generated_desc, manacost,
        1, null, to_stats, at_target, on_hit, on_affected_tiles
    );

    spell_gen.augment("to_stats", function(user, spell, stats) {
        stats.manacost += manacost;
    });

    return spell_gen;
}


// TODO
// [+] 1) write some helper functions to make spells easier
// [+] 2) write a few cores and modifiers
// [+] 3) test the spawning of enemies and stuff
// [+] 4) test casting of spells on enemies (also need to write the spell parser on the "wand" side)
// [-] 5) rendering!!!!!!! yippee  <- It's time.
// [+] 6) triggers
// [X] 7) multicasts
spell_cores = [
    core_spell(
        "Fireball", "", 10, DmgType.Fire, 7, 3,
        Shape.Diamond, 25
    ),

    core_spell(
        "Fireball with Target Trigger", "Triggers another spell at the target position.", 
        10, DmgType.Fire, 6, 3,
        Shape.Diamond, 60
    ).set_trigger("at_target"),

    core_spell(
        "Icicle", "", 15, DmgType.Ice, 8, 1,
        Shape.Square, 20
    )
];

spell_mods_stats = [
    modifier(
        "Damage Plus I", "Increase spell damage by 5.", 10,
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
        "Add Target Trigger", "Triggers the linked spell at the position the previous spell was cast.",
        25
    ).set_trigger("at_target"),

    modifier(
        "Add Tile Trigger", "Triggers a copy of the linked spell at every position the previous spell affected.",
        500
    ).set_trigger("on_affected_tiles"),

    modifier(
        "Add Damage Trigger", "Triggers a copy of the linked spell at the position of every instance of damage caused by the spell.",
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
        "Lightning Bolt", "", 17, DmgType.Lightning, 10, 1,
        Shape.Line, 18
    ),

    modifier(
        "Radius Plus I", "", 30,
        function(_, _, s) {
            s.radius += 1;
        }
    ),

    modifier(
        "Behind the Back", "Casts a copy of the spell behind the user.", 120,
        no_stats, function(user, spell, stats, location) {
            if (!stats.mutable_info["behind_the_back"]) {
                stats.mutable_info["behind_the_back"] = true;
                let user_vec = location.sub(user.position);

                let new_pos = user.position.sub(user_vec);
                game.cast_primed_spell(stats.primed_spell, new_pos);
            }
        }
    ),

    modifier(
        "Multicast x4", "Casts a copy of the spell four times.", 300,
        no_stats, function(user, spell, stats, location) {
            if (!stats.mutable_info["multicastx4"] || stats.mutable_info["multicastx4"] < 4) {
                stats.mutable_info["multicastx4"] = stats.mutable_info["multicastx4"] ? stats.mutable_info["multicastx4"] + 1 : 1;
                
                let new_pos = location;
                game.cast_primed_spell(stats.primed_spell, new_pos);
            }
        }
    ),

    modifier(
        "Projection", "Allows the spell to ignore line of sight for targeting and effects.", 40,
        function(user, spell, stats) {
            stats.los = false;
        }
    ),

    core_spell(
        "Gun", "", 50, DmgType.Physical, 30, 1, Shape.Line, 50
    ).augment("at_target", function(user, spell, stats, location) {
        user.cast_spell([
            core_spell(
                "gun explosion", "", 25, DmgType.Fire, 1, 1, Shape.Diamond, 0
            )
        ], location);
    }),

    modifier(
        "Uncontrolled Multicast x16", "Casts a copy of the spell sixteen times, moving the target by a random number of tiles up to the spell's radius + 1 each time.", 200,
        no_stats, function(user, spell, stats, location) {
            if (!stats.mutable_info["unc_multicastx16"] || stats.mutable_info["unc_multicastx16"] < 16) {
                stats.mutable_info["unc_multicastx16"] = stats.mutable_info["unc_multicastx16"] ? stats.mutable_info["unc_multicastx16"] + 1 : 1;
                
                let new_pos = game.find_random_space_in_los(user, location, stats.radius + 1, Shape.Diamond[1]);
                if (new_pos) {
                    game.cast_primed_spell(stats.primed_spell, new_pos, true);
                }
            }
        }
    ),

    core_spell(
        "All Elements", "all at once. testing", 1, DmgType.Physical, 20, 1, Shape.Diamond, 0
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
            game.spell_speed = 1000;
    
            user.cast_spell([
                core_spell(
                    t, "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(0, -8)));

            user.cast_spell([
                core_spell(
                    t, "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                ).augment("to_stats", function(_, _, s) { s.los = true; })
            ], location.add(new Vector2(-8, 0)));

            user.cast_spell([
                core_spell(
                    t, "", 100, DmgType[t], 1, 3, Shape.Line, 0
                ).augment("to_stats", function(_, _, s) { s.los = false; })
            ], location.add(new Vector2(8, 0)));

            user.cast_spell([
                core_spell(
                    t, "", 100, DmgType[t], 1, 3, Shape.Line, 0
                ).augment("to_stats", function(_, _, s) { s.los = true; }).augment("at_target", function(_, _, _, _) { 
                    console.log(t);
                    document.getElementById("dmg-type-display").textContent = t;
                    document.getElementById("dmg-type-display").style.color = damage_type_cols[t];
                })
            ], location.add(new Vector2(0, 8)));
        })

        if (!stats.mutable_info["aa"] || stats.mutable_info["aa"] < 1) {
            stats.mutable_info["aa"] = stats.mutable_info["aa"] ? stats.mutable_info["aa"] + 1 : 1;

            let new_spell = user.parse_spell([
                core_spell(
                    "t", "", 1, DmgType.Physical, 1, 3, Shape.Line, 0
                ).augment("at_target", function(_, _, _, _) { 
                    game.spell_speed = 100
                })
            ], location);

            game.cast_primed_spell(new_spell, location, true);
        }
    })
]


entity_templates = [
    new EntityTemplate("Player", "@=", "#0cf", "It's you.", 100, 100000, [
        Affinity.Living  // player is only living by default, can be changed by events
    ], [

    ], 0),

    new EntityTemplate("test enemy", "Gg", "#0f0", "idk goblin or smt", 1000000, 1000000, [
        Affinity.Arcane, Affinity.Construct, Affinity.Order
    ], [
        spells_list[0]
    ], 1),

    new EntityTemplate("Wall", "[]", "#ccc", "Just a wall.", Number.POSITIVE_INFINITY, 0, [
        Affinity.Construct
    ], [

    ], 0),
]

var dmg_type_particles = {
    "Fire": new ParticleTemplate(["@@", "##", "++", "\"\"", "''"], damage_type_cols["Fire"], 1),
    "Ice": new ParticleTemplate(["##", "<>", "''", "::", ".."], damage_type_cols["Ice"], 1),
    "Lightning": new ParticleTemplate(["&&", "];", "!-", ".'", " ."], damage_type_cols["Lightning"], 1),
    "Arcane": new ParticleTemplate(["@@", "OO", "{}", "::", ".."], damage_type_cols["Arcane"], 1),
    "Physical": new ParticleTemplate(["%%", "XX", "**", "++", ".."], damage_type_cols["Physical"], 1),
    "Dark": new ParticleTemplate(["##", "][", "}{", ";;", "::"], damage_type_cols["Dark"], 1),
    "Chaos": new ParticleTemplate(["@#", "%#", "$]", "X<", "/;"], damage_type_cols["Chaos"], 1),
    "Holy": new ParticleTemplate(["@@", "##", ";;", "**", "''"], damage_type_cols["Holy"], 1),
    "Psychic": new ParticleTemplate(["@@", "[]", "{}", "||", "::"], damage_type_cols["Psychic"], 1),
}

var board = new Board(new Vector2(64, 64));
var game = new Game(board);
var renderer = new Renderer(game, board, new Vector2(48, 24), 24, 24, 1/4);

game.spawn_player(entity_templates[0], new Vector2(16, 16));
game.spawn_entity(entity_templates[1], Teams.ENEMY, new Vector2(48, 48), true).name = "AAA enemy";
game.spawn_entity(entity_templates[1], Teams.ENEMY, new Vector2(46, 48), true).name = "BBB enemy";
var moving_ent = game.spawn_entity(entity_templates[1], Teams.ENEMY, new Vector2(20, 22), true);
moving_ent.name = "moving guy";

for (let xt=0; xt<game.board.dimensions.x; xt++) {
    for (let yt=0; yt<game.board.dimensions.y; yt++) {
        if (Math.random() < 0.01) {
            game.spawn_entity(entity_templates[2], Teams.UNTARGETABLE_NO_LOS, new Vector2(xt, yt), false);
        }
    }
}

//var primed_spell_test = new PrimedSpell(game.player_ent, [spells_list[0],]);
var target = new Vector2(20, 22);

// Fireball
var spell_simple = [spells_list[11], spells_list[0],];  

// Fireball, Ice Bolt (should ignore ice bolt)
var spell_extra = [spells_list[0], spells_list[2]];

// Damage Plus I, Fireball
var spell_mod = [spells_list[3], spells_list[0]];

// Damage Plus I, Damage Plus I, Fireball
var spell_mod_2 = [spells_list[3], spells_list[3], spells_list[0]];

// Fireball with Trigger, Damage Plus I, Ice Bolt
// 10 fire dmg, 20 ice dmg
var spell_complex = [spells_list[1], spells_list[3], spells_list[2]];

var spell_trigger_target = [spells_list[4], spells_list[0], spells_list[2]];
var spell_trigger_tile = [spells_list[3], spells_list[3], spells_list[5], spells_list[0], spells_list[2]];
var spell_trigger_dmg = [spells_list[6], spells_list[0], spells_list[2]];

var spell_crazy = [
    spells_list[5], spells_list[0], spells_list[5], spells_list[0], spells_list[2]
]

var spell_lightning = [
    spells_list[7]
]

var spell_all = [
    spells_list[10], spells_list[4], spells_list[7], spells_list[8], spells_list[6], spells_list[0], spells_list[2]
]

var behind_back = [
    spells_list[9], spells_list[7]
]

let gun = [
    spells_list[12]
]

let machine_gun = [
    spells_list[13], spells_list[12]
]

game.begin_turn();
//game.player_ent.cast_spell(spell_simple, target);

var selected_spells = [];

var test2 = function() {
    game.end_turn();
    game.turn_index = 0;
    game.begin_turn();

    if (selected_spells.length > 0) {
        if (game.player_spell_in_range(target)) {
            game.player_ent.cast_spell(selected_spells, target);
        }
    }

    game.deselect_player_spell();
}

var test = function(spells) {
    selected_spells = spells ? spells : spell_simple;
    game.select_player_spell(selected_spells);
    //test2();
}

var tmp = new ParticleTemplate(["@@", "##", "++", "--", ".."], "#f00", 1);
var ppos = new Vector2(0, 0);
var mov_dir = new Vector2(1, 0);

var hitcount = 0;

renderer.setup();
renderer.render_game_view();

let last_frame_time = Date.now();
let frame_times = [];

function game_loop() {
    //renderer.add_particle(ppos, new Particle(tmp));
    last_frame_time = Date.now();
    frame_times.push(Date.now());
    frame_times = frame_times.slice(-10);

    ppos = ppos.add(new Vector2(2, 1));
    ppos = ppos.wrap(new Vector2(48, 24));

    if (ppos.x % 16 == 0) {
        if (Math.random() < 0.1) {
            mov_dir = new Vector2(
                Math.floor(Math.random() * 2) - 1,
                Math.floor(Math.random() * 2) - 1
            )
        } 
        
        var moved = game.move_entity(moving_ent, moving_ent.position.add(mov_dir), false);
        if (!moved) {
            mov_dir = mov_dir.neg();
        }
    }

    renderer.render_game_view();
    renderer.advance_particles();

    let frame_duration = Date.now() - last_frame_time;
    //console.log("frame took", frame_duration, "so waiting", (1000/30) - frame_duration);
    setTimeout(game_loop, (1000/30) - frame_duration);
}

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("keydown", (event) => {
        let name = event.key;
        let code = event.code;

        console.log(name, code);
        let mov_pos = null;
        switch (name) {
            case "1":
                test();
                break;

            case "2":
                test(spell_trigger_tile);
                break;

            case "3":
                test(spell_lightning);
                break;

            case "4":
                test(spell_all);
                break;

            case "5":
                test(gun);
                break;

            case "6":
                test(machine_gun);
                break;

            case "q":
                test([spells_list[14]]);
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

        if (mov_pos) {
            game.move_entity(
                game.player_ent,
                game.player_ent.position.add(mov_pos),
                false
            );

            renderer.move_particles(mov_pos.neg());
        }
    });

    game_loop();
})