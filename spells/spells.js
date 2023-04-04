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
        return new Vector2(-self.x, -self.y);
    }

    add(other) {
        return new Vector2(self.x + other.x, self.y + other.y);
    }

    sub(other) {
        return self.add(other.neg());
    }

    mul(other) {
        return new Vector2(self.x * other, self.y * other);
    }

    div(other) {
        return new Vector2(self.x / other, self.y / other);
    }

    magnitude() {
        return Math.sqrt(Math.pow(self.x, 2) + Math.pow(self.y, 2));
    }

    normalize() {
        return self.div(self.magnitude);
    }

    round() {
        return new Vector2(Math.round(self.x), Math.round(self.y));
    }
}

class Board {
    constructor(size) {
        this.dimensions = new Vector2(size.x, size.y);
        this.cells = [];
        for (var yt=0; yt<y; yt++) {
            this.cells[yt].push([]);

            for (var xt=0; xt<x; x++) {
                this.cells[yt].push(null);
            }
        }
    }

    position_valid(position) {
        return in_bounds(position.x, 0, this.dimensions.x) && in_bounds(position.y, 0, this.dimensions.y);
    }

    get_pos(position) {
        if (!this.position_valid(position)) {
            return null;
        }

        return this.cells[position.x][position.y];
    }

    set_pos(position, entity, overwrite) {
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
            if (team_mask && !(result.team_present(teams))) {
                return null;
            }

            if (affinity_mask && !(result.affinity_present(affinities))) {
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
    constructor(name, max_hp, max_mp, affinities, innate_spells, ai_level) {
        this.name = name
        this.max_hp = max_hp
        this.max_mp = max_mp
        this.affinities = affinities
        this.innate_spells = innate_spells
        this.ai_level = ai_level
    }
}


class Entity {
    constructor(template, team) {
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
        return final_damage;
    }
}

class Spell {
    // inventory items use references to these single objects. do not edit them
    constructor(name, typ, desc, bonus_draws, draw_after, to_stats, at_target, on_hit, on_affected_tiles) {
        this.name = name
        // in all cases, the core spell's functions are called first,
        // followed by modifiers in the order of placement.
        this.typ = typ
        this.desc = desc
        this.fns = {
            to_stats: to_stats,                   // during stat calculation, (user, spell, stats)
            at_target: at_target,                 // when cast on target location; (user, spell, stats, location)
            on_hit: on_hit,                       // when damaging an enemy; (user, spell, stats, enemy, damage, type)
            on_affected_tiles: on_affected_tiles  // called on every aoe location including direct target; (user, spell, stats, location)
        }
    }
}

const SpellType = {
    Core: "Core",
    Modifier: "Modifier"
}

const SpellTargeting = {
    Positional: 'Positional',
    UnitTarget: 'UnitTarget',      // includes teams for filtering
    SelfTarget: 'SelfTarget',      // cast location is self tile
    SelfTargetPlusCasterTile: 'SelfTargetPlusCasterTile'  // self target implicitly removes caster tile but this doesn't
};

const Teams = {
    Player: "Player",
    Enemy: "Enemy"
    // if you pick a random value instead, it'll be hostile to everything.
}

const Shape = {
    Square: function(origin, target, radius) {},
    Circle: function(origin, target, radius) {},
    Ring: function(origin, target, radius) {},
    Diamond: function(origin, target, radius) {},
    Line: function(origin, target, radius) {},
    PerpLine: function(origin, target, radius) {},
    Cone: function(origin, target, radius) {}
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


class PrimedSpell {
    static id_inc = 0;

    constructor(caster, spells) {
        this.id = PrimedSpell.id_inc;
        PrimedSpell.id_inc++;

        this.caster = caster
        this.spells = spells
        this.stats = {};
        this.calculate();
    }

    calculate() {
        this.spells.forEach(spell => {
            spell.fns.to_stats(this.caster, spell, this.stats);
        })
    }

    cast(board, caster, position) {
        cast_locations = this.stats.shape(caster.position, position, this.stats.radius);
        game.reset_damage_count(this.id);

        cast_locations.forEach(location => {
            var targeting_predicate = function(e) { this.stats.targeting_predicates.every(p => p(e)) };
            var ent = board.check_for_entity(
                location, this.stats.target_team, 
                this.stats.target_affinities, targeting_predicate
            )

            if (ent) {
                game.deal_damage(
                    ent, this.caster, this.id,
                    this.stats.damage, this.stats.damage_type
                );
            }

            // trigger affected tile functions
            this.spells.forEach(spell => {
                spell.fns.on_affected_tiles(this.caster, spell, this.stats, location);
            })
        })

        // trigger point target functions
        this.spells.forEach(spell => {
            spell.fns.at_target(this.caster, spell, this.stats, position);
        })

        // get list of damaged entities from this spell
        var damaged_entities = game.get_damage_count(this.id);
        // [{ent, dmg_amount, dmg_type}]
        // each instance of damage is handled separately

        damaged_entities.forEach(dmg_instance => {
            var ent = dmg_instance.ent;
            var amt = dmg_instance.amount;
            var typ = dmg_instance.dmg_type;

            this.spells.forEach(spell => {
                spell.fns.on_hit(this.caster, spell, this.stats, ent, amt, typ);
            })
        })
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

        this.turn_index = 0  // index into entities
    }

    begin_turn() {
        this.casting_stack = [];
        this.waiting_for_spell = false;

        // shout here for the current turn entity's AI or the player to pick a move to use

        // we then periodically check the casting stack to see if there's anything on there.
        // if there is, we cast it and set waiting_for_spell to true, which means
        // that once we clear out the casting stack the current entity's turn will end.
        this.checker_interval = setInterval(
            this.check_spell_stack, 100
        );
    }

    check_spell_stack() {
        // primed spells go on the spell stack so they can be cast instantly
        // they are given as a collection of {spell, target}
        if (this.casting_stack.length > 0) {
            var spell_to_cast = this.casting_stack.pop();
            spell_to_cast.spell.cast(this.board, this.entities[this.turn_index], spell_to_cast.target);
        }
    }

    end_turn() {
        this.turn_index = (this.turn_index + 1) % this.entities.length;
        clearInterval(this.checker_interval);
        this.checker_interval = null;
    }

    spawn_entity(ent, position, overwrite) {
        if (this.board.set_pos(position, ent, overwrite)) {
            ent.position = position;
            this.entities.push(ent);
            return 1;
        }

        return 0;
    }

    spawn_player(player_ent, position) {
        this.spawn_entity(player_ent, position);
        this.player_ent = player_ent;
    }

    reset_recorded_damage() {
        this.recorded_damage = {};
    }

    reset_damage_count(spell_id) {
        delete this.damage_counts[spell_id];
    }

    deal_damage(target, caster, spell_id, damage, damage_type) {
        var dmg_taken = target.take_damage(caster, damage, damage_type);

        if (this.damage_counts[spell_id]) {
            this.damage_counts[spell_id] += dmg_taken;
        } else {
            this.damage_counts[spell_id] = dmg_taken;
        }

        var record_name = caster.id.toString() + caster.name;
        if (this.recorded_damage[record_name]) {
            this.recorded_damage[record_name] += dmg_taken;
        } else {
            this.recorded_damage[record_name] = dmg_taken;
        }
    }
}

this.fns = {
    to_stats: to_stats,                   // during stat calculation, (user, spell, stats)
    at_target: at_target,                 // when cast on target location; (user, spell, stats, location)
    on_hit: on_hit,                       // when damaging an enemy; (user, spell, stats, enemy, damage, type)
    on_affected_tiles: on_affected_tiles  // called on every aoe location including direct target; (user, spell, stats, location)
}

no_stats = function(a, b, c) {};
no_target = function(a, b, c, d) {};
no_hit = function(a, b, c, d, e, f) {};
no_tiles = function(a, b, c, d) {};

spell_cores = [
    new Spell("Fire Blast", )
];

spell_mods_stats = [

];

spell_mods_dmg = [

];

spell_mods_cosmetic = [

];

spell_mods_triggers = [

];

spell_mods_shape = [

];

spell_mods_multicast = [

];

spell_mods_misc = [

];

spells_list = [

];


board = new Board(new Vector2(64, 64));
game = new Game(board, null);
