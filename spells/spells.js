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
    
        this.particle_speed= particle_speed;
        this.active_particles = [];
        this.particle_list = [];
        for (var yt=0; yt<game_view_size.y; yt++) {
            this.active_particles.push([]);

            for (var xt=0; xt<game_view_size.x/2; xt++) {
                this.active_particles[yt].push(null);
            }
        }
    }

    change_size(game_view_size, left_menu_len, right_menu_len) {
        this.game_view_size = game_view_size;
        this.left_menu_size = new Vector2(left_menu_len, game_view_size.y);
        this.right_menu_size = new Vector2(right_menu_len, game_view_size.y);
        this.total_size = new Vector2(game_view_size.x + left_menu_len + right_menu_len, game_view_size.y);
    
        this.setup();
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
                
                parent.appendChild(c);
                this.pixel_chars[y].push(c);
            }

            parent.appendChild(document.createElement("br"));
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

    set_pixel(pos, char, col) {
        var p = this.pixel_chars[pos.y][pos.x];
        p.textContent = char;

        if (col) {
            p.style.color = col;
        }
    }

    set_pixel_pair(pos, chars, col) {
        this.set_pixel(pos, chars[0], col);
        this.set_pixel(pos.add(new Vector2(1, 0)), chars[1], col);
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

        for (var x=0; x<x_delta; x++) {
            for (var y=0; y<y_delta; y++) {
                // screen pos is twice x because it's 2x1 on screen only
                var screen_pos = new Vector2((x * 2) + this.left_menu_size.x, y);

                var screen_particle = this.get_particle(screen_pos);
                if (!screen_particle) {
                    // game pos is simply the top left plus current coords
                    var game_pos = tl.add(new Vector2(x, y));
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
            }
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

    cast_spell(spells, position_target) {
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
    Player: "Player",
    Enemy: "Enemy"
    // if you pick a random value instead, it'll bef hostile to everything.
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

// http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#C
function make_line(a, b, radius) {
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
        if (x0 != a.x || y0 != a.y) {
            var coord = new Vector2(x0, y0);
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

const Shape = {
    Square: ["square shape", function(origin, target, radius) {
        if (origin == "whoami") {
            return "Square";
        }

        return make_square(target, radius);
    }],
    Circle: ["circle shape", function(origin, target, radius) {

    }],
    Ring: ["ring shape", function(origin, target, radius) {

    }],
    Diamond: ["diamond shape", function(origin, target, radius) {
        if (origin == "whoami") {
            return "Diamond";
        }

        // make a square but filter it a little
        return make_square(target, radius, (x, y) => x + y < radius);
    }],
    Line: ["straight line", function(origin, target, radius) {
        if (origin == "whoami") {
            return "Line";
        }

        return make_line(origin, target, radius);
    }],
    PerpLine: ["line perpendicular to the target", function(origin, target, radius) {

    }],
    Cone: ["cone shape", function(origin, target, radius) {

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
        this.stats.target_team = [Teams.Enemy, Teams.Player];
        this.stats.target_affinities = null;
        this.stats.damage = 0;
        this.stats.damage_type = DmgType.Physical;
        this.stats.targeting_predicates = [];
        this.stats.target_type = SpellTargeting.Positional;
        this.stats.radius = 0;
        this.stats.shape = Shape.Square;

        // REMEMBER: CORE ALWAYS FIRST, then modifiers
        // even though in the spell builder the core will be last
        this.spells.forEach(spell => {
            if (spell.fns.to_stats) {
                spell.fns.to_stats(this.caster, spell, this.stats);
            }
        })
    }

    cast(board, caster, position) {
        var self_target_safe = this.stats.target_type == SpellTargeting.SelfTarget;

        var cast_locations = this.stats.shape(caster.position, position, this.stats.radius);
        //console.log(cast_locations);

        if (self_target_safe) {
            cast_locations = cast_locations.filter(loc => !(loc.x == position.x && loc.y == position.y));
        }
        
        game.reset_damage_count(this.id);

        var sthis = this;
        cast_locations.forEach(location => {
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

    cast_primed_spell(primed_spell, position_target) {
        //console.log("enqueued", primed_spell, "at", position_target);
        this.casting_stack.push({spell: primed_spell, target: position_target});
    }

    check_spell_stack() {
        // primed spells go on the spell stack so they can be cast instantly
        // they are given as a collection of {spell, target}
        //console.log("checking spell stack");
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
            }
        }
    }

    end_turn() {
        this.turn_index = (this.turn_index + 1) % this.entities.length;
        clearTimeout(this.checker_interval);
        this.checker_interval = null;
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
        this.player_ent = this.spawn_entity(player_ent, Teams.Player, position);
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

        var updated_turn_index = null;
        for (var i=0; i<new_entity_list.length; i++) {
            if (this.entities[i].id != current_turn_entity.id) {
                updated_turn_index = i;
            }
        }

        this.turn_index = updated_turn_index;
        this.entities = new_entity_list;
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
        stats.damage = damage;
        stats.radius = radius;
        stats.shape = shape[1];
        stats.manacost = manacost;
        stats.damage_type = damage_type;
        stats.target_type = target_type;
        stats.target_team = teams ? teams : [Teams.Enemy, Teams.Player];
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
        "Fireball", "", 10, DmgType.Fire, 10, 3,
        Shape.Diamond, 25
    ),

    core_spell(
        "Fireball with Target Trigger", "Triggers another spell at the target position.", 
        10, DmgType.Fire, 10, 3,
        Shape.Diamond, 60
    ).set_trigger("at_target"),

    core_spell(
        "Icicle", "", 15, DmgType.Ice, 12, 1,
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
        "Lightning Bolt", "", 17, DmgType.Lightning, 12, 1,
        Shape.Line, 18
    ),

    modifier(
        "Radius Plus I", "", 30,
        function(_, _, s) {
            s.radius += 1;
        }
    )
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
]

var dmg_type_particles = {
    "Fire": new ParticleTemplate(["@@", "##", "++", "\"\"", "''"], damage_type_cols["Fire"], 1),
    "Ice": new ParticleTemplate(["##", "<>", "''", "--", ".."], damage_type_cols["Ice"], 1),
    "Lightning": new ParticleTemplate(["&&", "];", "!-", ".'", " ."], damage_type_cols["Lightning"], 1),
    "Arcane": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Arcane"], 1),
    "Physical": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Physical"], 1),
    "Dark": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Dark"], 1),
    "Chaos": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Chaos"], 1),
    "Holy": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Holy"], 1),
    "Psychic": new ParticleTemplate(["@@", "##", "++", "--", ".."], damage_type_cols["Psychic"], 1),
}

board = new Board(new Vector2(64, 64));
game = new Game(board);
renderer = new Renderer(game, board, new Vector2(48, 24), 24, 24, 1/4);

game.spawn_player(entity_templates[0], new Vector2(16, 16));
game.spawn_entity(entity_templates[1], Teams.Enemy, new Vector2(48, 48), true).name = "AAA enemy";
game.spawn_entity(entity_templates[1], Teams.Enemy, new Vector2(46, 48), true).name = "BBB enemy";
var moving_ent = game.spawn_entity(entity_templates[1], Teams.Enemy, new Vector2(0, 22), true);
moving_ent.name = "moving guy";

//var primed_spell_test = new PrimedSpell(game.player_ent, [spells_list[0],]);
var target = new Vector2(20, 22);

// Fireball
var spell_simple = [spells_list[0],];  

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
    spells_list[4], spells_list[7], spells_list[8], spells_list[6], spells_list[0], spells_list[2]
]


game.begin_turn();
//game.player_ent.cast_spell(spell_simple, target);

var test = function(spells) {
    game.end_turn();
    game.turn_index = 0;
    game.begin_turn();
    game.player_ent.cast_spell(spells ? spells : spell_simple, target);
}

var tmp = new ParticleTemplate(["@@", "##", "++", "--", ".."], "#f00", 1);
var ppos = new Vector2(0, 0);
var mov_dir = new Vector2(1, 0);

var hitcount = 0;

renderer.setup();
renderer.render_game_view();
setInterval(function() {
    //renderer.add_particle(ppos, new Particle(tmp));
    ppos = ppos.add(new Vector2(2, 1));
    ppos = ppos.wrap(new Vector2(48, 24));

    if (ppos.x % ((moving_ent.position.x > 24 || moving_ent.position.x < 16) ? 1 : 48) == 0) {
        var moved = game.move_entity(moving_ent, moving_ent.position.add(mov_dir), false);
        if (!moved) {
            mov_dir = mov_dir.neg();
        }
    }

    renderer.render_game_view();
    renderer.advance_particles();
}, (1000/30));
