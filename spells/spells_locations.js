const LocationSpecials = {
    NONE: "NONE"
}

class LocationTemplate {
    static id_inc = 0;

    constructor(name, col, bgcol, desc, generators, walls, decorations, special_effect) {
        this.id = LocationTemplate.id_inc;
        LocationTemplate.id_inc++;

        this.name = name;
        this.col = col;
        this.bgcol = bgcol;
        this.desc = desc;

        // [[generator, cvr_min, cvr_max], ...]
        this.generators = generators ? generators : [[WorldGen.RandomWalls, 0.05, 0.15]];

        // [wall1, wall2, wall3, wall4, wall5]
        this.walls = walls ? walls : [
            get_entity_by_name("Wall"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Wall")
        ]

        // should be a list of particle templates
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
        "Grassy Flatlands", "#7f0", "#250", "Echoes of a grassy plain.",
        [[WorldGen.RandomWalls, 0.025, 0.075]],
        [
            get_entity_by_name("Tree"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Tree")
        ],
        [],
        LocationSpecials.NONE
    ),

    new LocationTemplate(
        "Dense Jungle", "#4a0", "#130", "Echoes of a jungle teeming with wildlife.",
        [[WorldGen.RandomWalls, 0.2, 0.35]],
        [
            get_entity_by_name("Tree"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Tree")
        ],
        [],
        LocationSpecials.NONE
    ),

    new LocationTemplate(
        "Ravaged Town", "#ddd", "#333", "Echoes of a town that suffered a great calamity.",
        [[WorldGen.RandomWalls, 0.2, 0.3]],
        [
            get_entity_by_name("Wall"),
            get_entity_by_name("Wall"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Tree"),
            get_entity_by_name("Wall")
        ],
        [],
        LocationSpecials.NONE
    ),
]
