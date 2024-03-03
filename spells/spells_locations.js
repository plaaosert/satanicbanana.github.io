const LocationSpecials = {
    NONE: "NONE"
}

class LocationTemplate {
    static id_inc = 0;

    constructor(name, col, bgcol, desc, generators, spawn_chance_mods, decorations, special_effect) {
        this.id = LocationTemplate.id_inc;
        LocationTemplate.id_inc++;

        this.name = name;
        this.col = col;
        this.bgcol = bgcol;
        this.desc = desc;

        // {Affinity: Chance mod}
        // Must be an int (as it determines how many copies of the entity are put in the spawn list)
        // Default 1. If multiple affinity matches, picks the highest one, unless 0, in which case picks 0.
        // If prefixed with "~", fuzzy matches with name instead (cast to lowercase).
        // "~mage" => Demon Mage, Ice Mage, Fire Mage, etc.
        this.spawn_chance_mods = spawn_chance_mods ? spawn_chance_mods : {};

        // [[generator, cvr_min, cvr_max], ...]
        this.generators = generators ? generators : [];

        // should be a list of particle templates and their chances per tile:
        // [template, chance];
        // Decorations loop by default
        this.decorations = decorations ? decorations : []

        this.special_effect = special_effect ? special_effect : LocationSpecials.NONE;
    }
}

class GameLocation {
    constructor(template, events) {
        this.template = template;

        let sthis = this;
        Object.keys(template).forEach(t => {
            sthis[t] = template[t]
        })

        this.events = events;
    }
}

let location_templates = [
    new LocationTemplate(
        "test location", "#fff", "#ddd", "This is a test location :3", [
            //WorldGen.IrregularSpots(get_entity_by_name("Deep Water"), 0.001, 0.001, 3, 20, get_entity_by_name("Chasm")),
            WorldGen.SparseRooms(get_entity_by_name("Castle Wall"), 0.003, 0.003, 4, 10, 0.01, 999),
            //WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.01, 0.02),
            //WorldGen.RandomWalls(get_entity_by_name("Wall"), 0.02, 0.03),    
        ]
    )
]
