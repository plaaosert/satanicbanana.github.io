// location is a map position linked to others on the map.
// each location has a set of "options", gated by a condition, that start an action tree (nested list of options, same type as root).
// an action tree node can also be, instead of a nested list, a "cap", such as starting an encounter, gaining an item, gaining skill XP, etc.
// also associated is an encounter the area can have and, if so, the amount of time to wait until this encounter starts.
class Dialogue {
    constructor(speaker, speaker_col, text) {
        this.speaker = speaker;
        this.speaker_col = speaker_col;
        this.text = text;
    }
}

class GameLocation {
    constructor(name, short_name, connections, options, is_safe_location, default_encounter, default_encounter_wait_time) {
        this.name = name;
        this.short_name = short_name;
        this.connections = connections;
        this.options = options;

        // safe locations will never have encounters, so it ignores default_encounter.
        this.is_safe_location = is_safe_location;

        this.default_encounter = default_encounter;
        this.default_encounter_wait_time = default_encounter_wait_time;  // if this wait time is 0, this functionally means the location is gated behind a fight
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