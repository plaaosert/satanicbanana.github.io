const UnitType = {
    ENTITY: "Entity",
    AIRCRAFT: "Aircraft",
    SQUADRON: "Squadron",
    AIRBASE: "Airbase",
    PROJECTILE: "Projectile"
}

class Entity {
    static id_inc = 0;

    constructor(typ, team, template) {
        this.unit_type = UnitType.ENTITY;

        this.id = Entity.id_inc;
        Entity.id_inc++;

        this.typ = typ;
        this.team = team;

        Object.keys(template).forEach(k => {
            this[k] = template[k];
        });

        this.heading = new Vector2(0, 1);
        this.position = new Vector2(0, 0);
        this.target_position = null;

        if (this.max_hp) {
            this.hp = this.max_hp;
            this.has_hp = true;
        } else {
            this.hp = 0;
            this.has_hp = false;
        }
    }

    set_target(position) {
        // by default this does nothing
    }

    check_impact(projectile) {
        // by default does nothing
    }

    take_damage(source, amount) {
        if (this.has_hp) {
            this.hp -= amount;
            return amount;
        } else {
            return 0;
        }
    }
}

// TODO refactor this to squadrons of aircraft.
// single aircraft have HP and stats (and technically positions because they're Entities)
// but don't move on their own or operate on that `position` variable.
// only squadrons do that.
// however, aircraft still step(), as they are the ones firing weapons.
// squadrons are the ones hit by missiles. the hit/evade roll is made repeatedly for all aircraft, being removed if they successfully evade else being rolled again,
// until one remains - which is the one that will be hit
// also it's probably a good idea to rename aircraft everywhere to squadrons otherwise you will get royally confused
class Squadron extends Entity {
    constructor(team, name, aircraft) {
        super(EntityType.AIR, team, {});
        this.unit_type = UnitType.SQUADRON;

        this.name = name;

        this.aircraft = aircraft;
        this.aircraft.forEach(a => a.squadron = this);

        this.throttle_pct = 1;

        let all_weapons = [];

        this.recalculate_stats();
    }

    set_target(position) {
        this.target_position = position;
    }

    recalculate_stats() {
        this.speed = Math.min(...this.aircraft.map(a => a.speed))

        let new_weapons_list = [];
        this.aircraft.forEach(a => {
            a.attacks.forEach((att, ia) => {
                new_weapons_list.push({
                    aircraft: a,
                    projectile_type: att.projectile_type,
                    cooldown: att.cooldown,
                    attack_index: ia,
                    range: att.range,
                    name: att.name,
                    attack: att
                })
            })
        })

        this.all_weapons = new_weapons_list;
    }

    check_impact(projectile) {
        let chosen_aircraft = this.aircraft[Math.floor(Math.random() * this.aircraft.length)];
        let tracking_evasion_diff = projectile.stats.tracking - chosen_aircraft.evasion;
        let chance_to_hit = Math.max(0.1, Math.min(0.9, (tracking_evasion_diff / 20) + 0.5));
        if (Math.random() < chance_to_hit) {
            let dmg_taken = chosen_aircraft.take_damage(projectile, random_int(projectile.stats.dmg_min, projectile.stats.dmg_max));
            console.log(`hit an aircraft ID ${chosen_aircraft.id} from squadron ${chosen_aircraft.squadron.name} for ${dmg_taken} damage (${Math.round(chance_to_hit * 100)}% chance to hit)`)
        } else {
            console.log(`missed an aircraft ID ${chosen_aircraft.id} from squadron ${chosen_aircraft.squadron.name} (${Math.round(chance_to_hit * 100)}% chance to hit)`)
        }
    }

    step(combat, time_delta) {
        // 1000/time_delta
        let time_delta_divmul = 1000/(time_delta+Number.EPSILON);

        if (this.target_position) {
            let p = this.target_position.position ? this.target_position.position : this.target_position;

            let mouse_heading = p.sub(this.position).normalize();

            let max_rot = (Math.PI * 1.5) / (4 * time_delta_divmul);
            let angle_to_rotate = Math.abs(this.heading.angle_between(mouse_heading));
            let angle_to_rotate2 = Math.abs(mouse_heading.angle_between(this.heading));

            angle_to_rotate = Math.min(angle_to_rotate, angle_to_rotate2);

            // if moving more than 90deg (pi/2), should be unclamped. after that, linearly reduce
            let rot_clamp = max_rot * (0.1 + (angle_to_rotate / (Math.PI)));
            let res = this.heading.rotate_towards(mouse_heading, Math.min(max_rot, rot_clamp), true);

            //console.log(`${(angle_to_rotate * (180 / Math.PI)).toString().padEnd(20)} [${"#".repeat(Math.floor((Math.min(max_rot, rot_clamp) / max_rot) * 50))}${" ".repeat(50 - Math.floor((Math.min(max_rot, rot_clamp) / max_rot) * 50))}]`)

            this.heading = res[0];
            this.throttle_pct *= 0.98 + ((1 - Math.pow(Math.abs(res[1]) / max_rot, 2)) * 0.02);
            this.throttle_pct = Math.max(0.1, this.throttle_pct);

            // slow down about 1km from the target
            this.throttle_pct *= 0.975 + (0.025 * Math.min(1, this.position.distance(p) / 1));
        }

        this.position = this.position.add(this.heading.mul((this.speed * this.throttle_pct) / (time_delta_divmul)));

        this.throttle_pct = lerp(this.throttle_pct, 1, 0.003);

        this.aircraft.forEach(a => {
            a.step(combat, time_delta);
        })
    }
}

class Aircraft extends Entity {
    constructor(team, template) {
        super(EntityType.AIR, team, template);
        this.unit_type = UnitType.AIRCRAFT;

        this.squadron = null;
        this.current_cooldowns = this.attacks.map(att => {
            return att.cooldown
        });
    }

    step(combat, time_delta) {
        let used_weapon = false;
        this.current_cooldowns.forEach((cd, i) => {
            if (cd <= 0 && !used_weapon) {
                let att = this.attacks[i];

                let targets = combat.squadrons.filter(sq => {
                    if (!att.can_target.includes(sq.typ)) {
                        return false;
                    }

                    if (sq.team != this.team && sq.position.distance(this.squadron.position) < this.attacks[i].range) {
                        // if not tracking, need to also check if the shot is within a 20 degree cone in front.
                        if (projectile_type_to_behaviour[att.projectile_type].is_homing) {
                            return true;
                        } else {
                            let vec_to_target = sq.position.sub(this.squadron.position).normalize();
                            let angle_between = vec_to_target.angle_between(this.squadron.heading);

                            if (Math.abs(angle_between) < (Math.PI / 180)*16) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                });
                if (targets.length > 0) {
                    used_weapon = true;

                    let target = targets.sort((a, b) => a.position.distance(this.squadron.position) - b.position.distance(this.squadron.position))[0];

                    // TODO
                    // we actually need to do a bit of maths here to make it fire ahead of the target, not at them
                    // this should also be baked in to the calculations above
                    let target_heading = this.squadron.heading;
                    if (!projectile_type_to_behaviour[att.projectile_type].is_homing) {
                        // this needs some actual maths as im too dumb to write it myself
                        // for now, lead the targeting by finding the time to impact of the projectile, then target the position the squadron will be there
                        // *then* rather than where it is right now
                        let projectile_speed = projectile_type_to_behaviour[att.projectile_type].speed;
                        if (att.projectile_type.slice(0, -1) == "BULLET") {
                            projectile_speed += this.squadron.speed * this.squadron.throttle_pct;
                        }
                        
                        let time_to_hit = this.squadron.position.distance(target.position) / projectile_speed;

                        let lead_position = target.position.add(
                            target.heading.mul(target.speed * target.throttle_pct * time_to_hit)
                        )

                        target_heading = this.squadron.heading.rotate_towards(lead_position.sub(this.squadron.position).normalize(), (Math.PI / 180)*16);
                        target_heading = target_heading.rotate((Math.random()-0.5) * (Math.PI / 180) * 2);
                    }

                    let proj = new Projectile(
                        this.team, 
                        projectile_type_to_behaviour[att.projectile_type],
                        {
                            bonus_speed: att.projectile_type.slice(0, -1) == "BULLET" ? this.squadron.speed * this.squadron.throttle_pct : 0, 
                            tracking: att.tracking, dmg_min: att.dmg_min, dmg_max: att.dmg_max
                        }, 
                        this.squadron.position, 
                        target_heading, target
                    );

                    combat.projectiles.push(proj);

                    this.current_cooldowns[i] = att.cooldown * ((Math.random()*0.5) + 0.75);
                }
            }
        })

        this.current_cooldowns = this.current_cooldowns.map(cd => {
            return cd - (time_delta/1000);
        })
    }
}

class Airbase extends Entity {
    constructor(team, template) {
        super(EntityType.GROUND, team, template);
        this.unit_type = UnitType.AIRBASE;
    }

    step(combat, time_delta) {
        // nothing for now
    }

    check_impact(projectile) {
        let chance_to_hit = 0.8;
        if (Math.random() < chance_to_hit) {
            let dmg_taken = this.take_damage(projectile, random_int(projectile.stats.dmg_min, projectile.stats.dmg_max));
            console.log(`hit an airbase ID ${this.id} from squadron ${this.name} for ${dmg_taken} damage (${Math.round(chance_to_hit * 100)}% chance to hit)`)
        } else {
            console.log(`missed an aircraft ID ${this.id} from squadron ${this.name} (${Math.round(chance_to_hit * 100)}% chance to hit)`)
        }
    }
}

class Projectile {
    constructor(team, behaviour, stats, position, heading, target) {
        this.unit_type = UnitType.PROJECTILE;

        this.team = team;
        this.behaviour = behaviour;
        this.stats = stats;
        this.position = position;
        this.heading = heading;
        this.target = target;

        this.tried_to_impact = false;

        this.throttle_pct = 0;
        if (this.behaviour.render_type.startsWith("BULLET")) {
            this.throttle_pct = 1;
        }

        this.lifetime = (this.behaviour.lifetime) * 1000;
        this.impact_homing_delay = 250;
    }

    step(combat, time_delta) {
        let time_delta_divmul = 1000/time_delta;

        let p = this.target.position;

        if (this.behaviour.render_type.startsWith("BOMB")) {
            let target_heading = p.sub(this.position).normalize();
            this.heading = target_heading;
        }

        if (this.behaviour.is_homing && this.impact_homing_delay > 0) {
            let target_heading = p.sub(this.position).normalize();

            let max_rot = (Math.PI * 1.2) / (4 * time_delta_divmul);
            let res = this.heading.rotate_towards(target_heading, max_rot, true);

            this.heading = res[0];
            this.throttle_pct *= 0.97 + ((1 - Math.pow(Math.abs(res[1]) / max_rot, 3)) * 0.03);
            this.throttle_pct = Math.max(0.1, this.throttle_pct);
        }

        this.position = this.position.add(this.heading.mul(((this.behaviour.speed+this.stats.bonus_speed) * this.throttle_pct) / (time_delta_divmul)));

        if (this.position.distance(p) < 0.2 && !this.tried_to_impact) {
            // 200m, close enough i think to not look jank
            this.tried_to_impact = true;
            
            this.target.check_impact(this);
        }

        if (this.tried_to_impact) {
            this.impact_homing_delay -= time_delta;
        }

        this.lifetime -= time_delta;
        if (this.lifetime <= 0) {
            return true;
        }

        this.throttle_pct = lerp(this.throttle_pct, 1, 0.075);
    }
}

const world_size = new Vector2(200000, 100000);  // km

class Combat {
    constructor() {
        this.squadrons = [];
        this.projectiles = [];

        this.zoom_offset = new Vector2(Math.floor(world_size.x / 2), Math.floor(world_size.y / 2))
        this.zoom_scale = 0.02; // 0.02km/pixel, so on a 1000x1000 pixel board it'll show 20km around
    }

    step(time_delta) {
        // manual calculation delay
        if (false) {
            var date = new Date();
            var curDate = null;
            do { curDate = new Date(); }
            while(curDate-date < 100);
        }

        this.squadrons.forEach(s => {
            s.step(this, time_delta)
        })

        let projectiles_new = [];
        this.projectiles.forEach(p => {
            let r = p.step(this, time_delta);
            if (!r) {
                projectiles_new.push(p);
            }
        })

        this.projectiles = projectiles_new;
    }
}

class PlayerCombatControl {
    constructor(combat, player_team) {
        this.combat = combat;
        this.player_team = player_team;
    
        this.control_groups = {};
        this.selected_squadrons = [];

        this.moused_over_squadrons = [];
        this.following_squadron = [];
    }

    step() {
        if (this.following_squadron.length > 0) {
            let sum_pos = new Vector2(0, 0);
            this.following_squadron.forEach(sq => {
                sum_pos = sum_pos.add(sq.position);
            })

            sum_pos = sum_pos.div(this.following_squadron.length);

            this.combat.zoom_offset = sum_pos;
            refresh_wtsp_stwp();
        }
    }

    select(squadron, buttons_held) {
        if (!buttons_held["ControlLeft"] && !buttons_held["ControlRight"]) {
            this.selected_squadrons = [];
        }

        let idx = this.selected_squadrons.findIndex(s => s.id == squadron.id);
        if (idx == -1) {
            this.selected_squadrons.push(squadron);
        } else {
            this.selected_squadrons.splice(idx, 1);
        }
    }

    select_multiple(squadrons, buttons_held, dont_deselect) {
        if (!buttons_held["ControlLeft"] && !buttons_held["ControlRight"]) {
            this.selected_squadrons = [];
        }

        squadrons.forEach(squadron => {
            let idx = this.selected_squadrons.findIndex(a => a.id == squadron.id);
            if (idx == -1) {
                this.selected_squadrons.push(squadron);
            } else if (!dont_deselect && (buttons_held["ControlLeft"] || buttons_held["ControlRight"])) {
                this.selected_squadrons.splice(idx, 1);
            }
        })
    }

    look_for_squadron(position, ignore, this_team, other_teams, return_all_matches=false) {
        let clicked_squadron = this.combat.squadrons.filter(
            a => wtsp(a.position).distance(position) < 25 && !ignore.some(i => i.id == a.id)
        ).sort(
            (a, b) => wtsp(a.position).distance(position) - wtsp(b.position).distance(position)
        );

        let filtered = clicked_squadron.filter(a => {
            if (this.player_team == a.team && this_team) {
                return true;
            }

            if (this.player_team != a.team && other_teams) {
                return true;
            }

            return false;
        })

        if (return_all_matches) {
            return filtered;
        } else {
            return filtered.length > 0 ? filtered[0] : null;
        }
    }

    process_mousemove(mouse_position, buttons_held) {
        let mouseover_squadrons = this.look_for_squadron(mouse_position, [], true, true, true);

        this.moused_over_squadrons = mouseover_squadrons;
    }

    process_mouseclick(mouse_position, buttons_held, dont_deselect) {
        let clicked_squadron = this.look_for_squadron(mouse_position, [], true, false);
        if (clicked_squadron) {
            // TODO keep a list of clicked squadrons so that if you click the same place multiple times it'll cycle through them
            // can do this by just having a list of squadrons. when one is selected it is sent to the back
            this.select(clicked_squadron, buttons_held, dont_deselect);
        } else {
            this.selected_squadrons = [];
        }
    }

    process_rightclick(mouse_position, buttons_held) {
        let clicked_squadron = this.look_for_squadron(mouse_position, this.selected_squadrons, true, true);
        if (clicked_squadron && !(buttons_held["ControlLeft"] || buttons_held["ControlRight"])) {
            this.selected_squadrons.forEach(ent => {
                ent.set_target(clicked_squadron);
            })
        } else {
            this.selected_squadrons.forEach(ent => {
                ent.set_target(stwp(mouse_position));
            })
        }
    }

    process_dragclick(from, to, buttons_held) {
        let select_rect_diff = to.sub(from);
        let abs_select_rect_diff = new Vector2(Math.abs(select_rect_diff.x), Math.abs(select_rect_diff.y));

        if (abs_select_rect_diff.sqr_magnitude() > 64) {
            let check_rect_tl = new Vector2(Math.min(to.x, from.x), Math.min(to.y, from.y));
            let check_rect_br = new Vector2(Math.max(to.x, from.x), Math.max(to.y, from.y));

            let to_select = [];
            this.combat.squadrons.forEach(a => {
                if (a.team == this.player_team && in_rect(check_rect_tl, check_rect_br, wtsp(a.position))) {
                    to_select.push(a);
                }
            })

            this.select_multiple(to_select, keys_down, true);
        } else {
            combat_control.process_mouseclick(to.copy(), buttons_held);
        }
    }

    current_selected_target_positions() {
        let target_list = [];

        this.selected_squadrons.forEach(s => {
            if (s.target_position) {
                target_list.push({pos: s.target_position, squadron: s});
            }
        })

        return target_list;
    }
}

let airbase_template = new GroundEntityTemplate(
    "Airbase", "The heart of any aerial war operation. Capturing all of these is the only way to secure your victory in this area.",
    "NONE", 10000, []
)
