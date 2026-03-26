// location is a map position linked to others on the map.
// each location has a set of "options", gated by a condition, that start an action tree (nested list of options, same type as root).
// an action tree node can also be, instead of a nested list, a "cap", such as starting an encounter, gaining an item, gaining skill XP, etc.
// also associated is an encounter the area can have and, if so, the amount of time to wait until this encounter starts.
class Dialogue {
    constructor(speaker, speaker_col, text, mouseover_ctx_items=[]) {
        this.speaker = speaker;
        this.speaker_col = speaker_col;
        this.text = text;
        this.mouseover_ctx_items = [];
    }
}

class GameEvent {
    constructor(condition, redirect_event_if_fail, dialogue, gain_items, set_flags, options, encounter_enemy_name) {
        this.condition = condition;
        this.redirect_event_if_fail = redirect_event_if_fail;
        this.dialogue = dialogue;
        this.gain_items = gain_items;
        this.set_flags = set_flags;
        this.options = options;
        this.encounter_enemy_name = encounter_enemy_name;
    }

    static simple_dialogue(dialogue, options) {
        return new GameEvent(null, null, dialogue, [], [], options, null);
    }

    static simple_encounter(encounter_enemy_name) {
        return new GameEvent(null, null, null, [], [], {}, encounter_enemy_name);
    }
}

class GameLocation {
    constructor(name, short_name, connections, events, is_safe_location, default_encounter, default_encounter_wait_time) {
        this.name = name;
        this.short_name = short_name;
        this.connections = connections;

        // when entering a map, all conditions will be checked for all events, then any valid ones will be triggered in order.
        // ideally we should really only have one event triggering at once for gamefeel
        this.events = events;

        // safe locations will never have encounters, so it ignores default_encounter.
        this.is_safe_location = is_safe_location;

        this.default_encounter = default_encounter;
        this.default_encounter_wait_time = default_encounter_wait_time;  // if this wait time is 0, this functionally means the location is gated behind a fight, but you should use "events" for this.
    }
}

class Encounter {
    constructor(enemies, time_between) {
        // if an element in enemies is an array, expect a weighted array instead - [[thing1, 0.2], [thing2, 0.8]] 
        this.enemies = enemies;
        this.time_between = time_between;
    }

    get_entity_at_index(i) {
        let t = this.enemies[i];

        if (typeof t == "string" || t instanceof String) {
            return entity_template_list[t];
        } else if (t instanceof EntityTemplate) {
            return t;
        } else {
            return weighted_seeded_random_from_arr(t, grandom);
        }
    }
}