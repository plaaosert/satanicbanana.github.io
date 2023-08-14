class Entity {
    constructor(typ, team, template) {
        this.typ = typ;
        this.team = team;

        Object.keys(template).forEach(k => {
            this[k] = template[k];
        });

        this.heading = new Vector2(0, 1);
        this.position = new Vector2(0, 0);
    }
}

class Aircraft extends Entity {
    constructor(team, template) {
        super(EntityType.AIR, team, template);
    }
}

class Airbase extends Entity {
    constructor(team, template) {
        super(EntityType.GROUND, team, template);
    }
}

class Combat {
    constructor() {
        this.aircraft = [];
    }
}

let airbase_template = new GroundEntityTemplate(
    "Airbase", "The heart of any aerial war operation. Capturing all of these is the only way to secure your victory in this area.",
    "NONE", 10000, []
)
