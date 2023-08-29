const AircraftType = {
    Fighter: "Fighter",
    Interceptor: "Interceptor",
    Multirole: "Multirole",
    Bomber: "Bomber",
    Surveillance: "Surveillance",
    Experimental: "Experimental",
    NonAircraft: "Non-Aircraft"
}

const EntityType = {
    AIR: "AIR",
    GROUND: "GROUND"
}

class ProjectileBehaviour {
    constructor(is_homing, speed, render_type, colour, lifetime) {
        this.is_homing = is_homing;
        this.speed = speed / (60 * 60);  // km/h => km/s
        this.render_type = render_type;
        this.colour = colour;
        this.lifetime = lifetime;
    }
}

const ProjectileRenderType = {
    BULLET: "BULLET",
    MISSILE: "MISSILE",
    BOMB: "BOMB"
}

const ProjectileType = {
    BULLET1: "BULLET1",  // 2896.819 km/h, white
    BULLET2: "BULLET2",  // laser, green, instant
    BULLET3: "BULLET3",  // laser, cyan, instant
    BULLET4: "BULLET4",  // laser, white, instant
    MISSILE1: "MISSILE1",  // 2839.5 km/h, red
    MISSILE2: "MISSILE2",  // 3024.6 km/h, yellow
    MISSILE3: "MISSILE3",  // 3241.1 km/h, green
    MISSILE4: "MISSILE4",  // 3570.6 km/h, cyan
    ROCKET1: "ROCKET1",  // 3021.7 km/h, red
    ROCKET2: "ROCKET2",  // 3321.5 km/h, yellow
    ROCKET3: "ROCKET3",  // 3548.1 km/h, green
    ROCKET4: "ROCKET4",  // 3782.9 km/h, cyan
    BOMB1: "BOMB1",  // circle, 36 km/h, orange
    BOMB2: "BOMB2",  // circle, 36 km/h, red
    BOMB3: "BOMB3",  // circle, 36 km/h, dark red
    BOMB4: "BOMB4",  // circle, 36 km/h, black red
}

const projectile_type_to_behaviour = {
    BULLET1: new ProjectileBehaviour(false, 2896.819, ProjectileRenderType.BULLET, new Colour(128, 128, 128, 255), 10),  // 2896.819 km/h, white
    BULLET2: "BULLET2",  // laser, green, instant
    BULLET3: "BULLET3",  // laser, cyan, instant
    BULLET4: "BULLET4",  // laser, white, instant
    MISSILE1: new ProjectileBehaviour(true, 2839.5, ProjectileRenderType.MISSILE, new Colour(255, 0, 0, 255), 30),  // 2839.5 km/h, red
    MISSILE2: new ProjectileBehaviour(true, 3024.6, ProjectileRenderType.MISSILE, new Colour(255, 255, 0, 255), 30),  // 3024.6 km/h, yellow
    MISSILE3: new ProjectileBehaviour(true, 3241.1, ProjectileRenderType.MISSILE, new Colour(0, 255, 0, 255), 30),  // 3241.1 km/h, green
    MISSILE4: new ProjectileBehaviour(true, 3570.6, ProjectileRenderType.MISSILE, new Colour(0, 128, 255, 255), 30),  // 3570.6 km/h, cyan
    ROCKET1: "ROCKET1",  // 3021.7 km/h, red
    ROCKET2: "ROCKET2",  // 3321.5 km/h, yellow
    ROCKET3: "ROCKET3",  // 3548.1 km/h, green
    ROCKET4: "ROCKET4",  // 3782.9 km/h, cyan
    BOMB1: new ProjectileBehaviour(true, 72, ProjectileRenderType.BOMB, new Colour(255, 128, 0, 255), 30),  // circle, 72 km/h, orange
    BOMB2: "BOMB2",  // circle, 72 km/h, red
    BOMB3: "BOMB3",  // circle, 72 km/h, dark red
    BOMB4: "BOMB4",  // circle, 72 km/h, black red
}

class Template {
    static id_inc = 0;

    constructor(name, desc, typ, nationality, cost_p, cost_r, prereqs, slots, speed, evasion, max_hp, attacks) {
        this.template_id = Template.id_inc;
        Template.id_inc++;

        this.name = name;
        this.desc = desc;
        this.typ = typ;
        this.nationality = nationality;
        this.cost_p = cost_p;
        this.cost_r = cost_r;
        this.prereqs = prereqs;
        this.slots = slots;
        this.speed = speed / (60 * 60);  // km/h => km/s
        this.evasion = evasion;
        this.max_hp = max_hp;
        this.attacks = attacks;
    }
}

class AircraftTemplate extends Template {
    constructor(name, desc, typ, nationality, cost_p, cost_r, prereqs, slots, speed, evasion, max_hp, attacks) {
        super(name, desc, typ, nationality, cost_p, cost_r, prereqs, slots, speed, evasion, max_hp, attacks)
    }
}

class GroundEntityTemplate extends Template {
    constructor(name, desc, nationality, max_hp, attacks) {
        super(name, desc, EntityType.GROUND, nationality, -1, -1, ["Unobtainable"], 1, 0, 0, max_hp, attacks)
    }
}

class Attack {
    // MSL => 1 target, air to air, tracking, hp dmg, cooldown
    // 4AAM => 4 targets, air to air, tracking, hp dmg, cooldown
    constructor(name, num_targets, can_target, tracking, projectile_type, dmg_min, dmg_max, range, cooldown) {
        this.name = name;
        this.num_targets = num_targets;
        this.can_target = can_target;
        this.tracking = tracking;
        this.projectile_type = projectile_type
        this.dmg_min = dmg_min;
        this.dmg_max = dmg_max;
        this.range = range;
        this.cooldown = cooldown;
    }
}

aircraft_unsorted = [
    new AircraftTemplate(
        "Test Plane",
        `This is a test aircraft that does many things but also nothing`,
        AircraftType.Experimental, "Free States of Popaolutu",
        -1, -1,
        [["Unobtainable"]],
        1, 1500, 0, 1000, [
            new Attack("GP", 1, EntityType.AIR, 0, ProjectileType.BULLET1, 2, 5, 1, 0.1),
            new Attack("MSL", 1, EntityType.AIR, 7, ProjectileType.MISSILE1, 30, 55, 10.2, 10),
            new Attack("UGB", 1, EntityType.GROUND, 1000, ProjectileType.BOMB1, 100, 250, 0.17, 2)
        ]
    ),

    new AircraftTemplate(
        "Funny Plane",
        `This is a test aircraft that is very powerful`,
        AircraftType.Experimental, "Free States of Popaolutu",
        -1, -1,
        [["Unobtainable"]],
        1, 3500, 10, 10000, [
            new Attack("GP", 1, EntityType.AIR, 0, ProjectileType.BULLET1, 2, 5, 3, 0.1),
            new Attack("MSL", 1, EntityType.AIR, 7, ProjectileType.MISSILE1, 30, 55, 10.2, 2),
            new Attack("UGB", 1, EntityType.GROUND, 1000, ProjectileType.BOMB1, 100, 250, 0.17, 2)
        ]
    ),

    new AircraftTemplate(
        "Little Guy",
        `This is a small guy but he is very fast and advanced`,
        AircraftType.Experimental, "Free States of Popaolutu",
        -1, -1,
        [["Unobtainable"]],
        1, 4600, 18, 50, [
            new Attack("GP", 1, EntityType.AIR, 0, ProjectileType.BULLET1, 5, 10, 5, 0.12),
            new Attack("MSL", 2, EntityType.AIR, 15, ProjectileType.MISSILE3, 50, 75, 16.7, 2.5),
        ]
    ),
]

aircraft_lookup = Object.fromEntries(
    aircraft_unsorted.map(a => [a.name, a])
)