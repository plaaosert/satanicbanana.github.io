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
        // Default 1. If multiple matches, multiplies together.
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
    ),
    
    new LocationTemplate(
        "Grassy Flatlands", "#7f0", "#250",
        "Echoes of a grassy plain.", [
            WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.025, 0.075)
        ], {[Affinity.Natural]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Dense Jungle", "#5a0", "#130",
        "Echoes of a jungle teeming with wildlife.", [
            WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.2, 0.35)
        ], {[Affinity.Natural]: 2, [Affinity.Insect]: 2, [Affinity.Living]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Ravaged Town", "#ddd", "#333",
        "Echoes of a town that suffered a great calamity.", [
            WorldGen.SparseRooms(get_entity_by_name("Wall"), 0.0075, 0.015, 5, 10, 0.05, 999),
            WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.05, 0.075),
            WorldGen.RandomWalls(null, 0.2, 0.35)
        ], {}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Spirit Realm", "#f49", "#502",
        "Echoes of a realm of arcane creatures.", [
            WorldGen.Maze1Diagonal(get_entity_by_name("Magical Wall")),
            WorldGen.RandomWalls(null, 0.05, 0.075)
        ], {[Affinity.Arcane]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Underworld", "#aaa", "#222",
        "Echoes of nether reaches far below mortal ground. ", [
            WorldGen.RandomWalls(get_entity_by_name("Pile of Bones"), 0.03, 0.08),
            WorldGen.IrregularSpots(get_entity_by_name("Chasm"), 0.001, 0.0025, 4, 8)
        ], {[Affinity.Undead]: 2, [Affinity.Ghost]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Mass Grave", "#74a", "#102",
        "Echoes of graves stacked upon graves.", [
            WorldGen.IrregularSpots(get_entity_by_name("Pile of Bones"), 0.001, 0.0025, 4, 8)
        ], {[Affinity.Undead]: 2, [Affinity.Ghost]: 2, [Affinity.Dark]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Arcane Academy", "#f8c", "#534",
        "Echoes of a place of rest and learning for magic-wielding beings.", [
            WorldGen.SparseRooms(get_entity_by_name("Magical Wall"), 0.02, 0.04, 4, 12, 0.01, 2)
        ], {"~Mage": 3, "~Wizard": 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Bustling City", "#ddd", "#333",
        "Echoes of a sprawling capital city.", [
            WorldGen.SparseRooms(get_entity_by_name("Wall"), 0.02, 0.04, 4, 12, 0.015, 6)
        ], {[Affinity.Living]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Stormswept Mesa", "#d80", "#420",
        "Echoes of a dry land scoured by storm and wind.", [
            WorldGen.IrregularSpots(get_entity_by_name("Elevated Mesa"), 0.001, 0.0025, 12, 20, get_entity_by_name("Cliff Edge")),
            WorldGen.RandomWalls(get_entity_by_name("Rock Wall"), 0.02, 0.04)
        ], {[Affinity.Lightning]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Frigid Tundra", "#aff", "#244",
        "Echoes of a place where frost takes all.", [
            WorldGen.IrregularSpots(get_entity_by_name("Icy Wall"), 0.001, 0.0025, 12, 20),
            WorldGen.IrregularSpots(get_entity_by_name("Ice Wall"), 0.0015, 0.003, 6, 8)
        ], {[Affinity.Ice]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Icy Cave", "#8ff", "#044",
        "Echoes of a frozen cave's deepest reaches.", [
            WorldGen.Fill(get_entity_by_name("Icy Wall")),
            WorldGen.IrregularSpots(null, 0.001, 0.002, 8, 14),
            WorldGen.IrregularSpots(null, 0.01, 0.02, 3, 5)
        ], {[Affinity.Ice]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Heaven's Gate", "#ff9", "#442",
        "Echoes of apotheosis and divinity.", [
            WorldGen.RandomWalls(get_entity_by_name("Solid Cloud"), 0.2, 0.3)
        ], {[Affinity.Holy]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Demonic Realm", "#f00", "#300",
        "Echoes of violence and sin.", [
            WorldGen.SparseRooms(get_entity_by_name("Rock Wall"), 0.02, 0.05, 6, 10, 0.03, 8),
            WorldGen.IrregularSpots(get_entity_by_name("Magma"), 0.003, 0.006, 4, 12)
        ], {[Affinity.Demon]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Deep Cave", "#bbb", "#222",
        "Echoes of dark depths.", [
            WorldGen.Fill(get_entity_by_name("Rock Wall")),
            WorldGen.IrregularSpots(null, 0.001, 0.002, 8, 14),
            WorldGen.IrregularSpots(null, 0.01, 0.02, 3, 5)
        ], {}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Forested Grasslands", "#5d0", "#130",
        "Echoes of deep forest shade.", [
            WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.15, 0.3),
            WorldGen.IrregularSpots(null, 0.001, 0.002, 8, 14)
        ], {}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Fae Maze", "#f5a", "#523",
        "Echoes of a labyrinth half-submerged in the realm of spirits.", [
            WorldGen.Maze1(get_entity_by_name("Magical Wall")),
            WorldGen.IrregularSpots(null, 0.001, 0.002, 6, 10)
        ], {[Affinity.Arcane]: 2}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Jails of Purgatory", "#aaa", "#222",
        "Echoes of cells and chains built for the criminals of the afterlife.", [
            WorldGen.SparseRooms(get_entity_by_name("Wall"), 0.02, 0.05, 6, 10, 0.005, 999),
            WorldGen.RandomWalls(null, 0.015, 0.03),
            WorldGen.IrregularSpots(get_entity_by_name("Chasm"), 0.003, 0.006, 4, 12)
        ], {[Affinity.Undead]: 3, [Affinity.Ghost]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Catacombs", "#95a", "#204",
        "Echoes of sprawling underground hallways filled with tombs.", [
            WorldGen.IrregularSpots(get_entity_by_name("Pile of Bones"), 0.001, 0.002, 8, 14),
            WorldGen.IrregularSpots(get_entity_by_name("Chasm"), 0.001, 0.002, 8, 14)
        ], {[Affinity.Undead]: 3, [Affinity.Dark]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Infested Mineshaft", "#4a0", "#120",
        "Echoes of a mineshaft crawling with aggressive insects.", [
            WorldGen.RandomWalls(get_entity_by_name("Wall"), 0.075, 0.2),
            WorldGen.RandomWalls(get_entity_by_name("Rock Wall"), 0.1, 0.15)
        ], {[Affinity.Insect]: 3}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Ancient Castle", "#bbb", "#333",
        "Echoes of a castle built by a long-dead society.", [
            WorldGen.SparseRooms(get_entity_by_name("Castle Wall"), 0.02, 0.04, 4, 12, 0.0075, 999),
            WorldGen.RandomWalls(null, 0.005, 0.01)
        ], {}, [], LocationSpecials.NONE
    ),
    
    new LocationTemplate(
        "Profaned Fortress", "#f50", "#410",
        "Echoes of a demon family's home in the mortal realm.", [
            WorldGen.SparseRooms(get_entity_by_name("Castle Wall"), 0.02, 0.04, 4, 12, 0.015, 999),
            WorldGen.RandomWalls(null, 0.005, 0.01),
            WorldGen.IrregularSpots(get_entity_by_name("Magma"), 0.003, 0.006, 4, 12),
            WorldGen.IrregularSpots(get_entity_by_name("Chasm"), 0.001, 0.002, 4, 8)
        ], {[Affinity.Demon]: 2}, [], LocationSpecials.NONE
    ),
]
