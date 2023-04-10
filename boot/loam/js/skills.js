const SkillTargeting = {
    OneEnemy: {enemy: true, number: 1},
    TwoEnemy: {enemy: true, number: 2},
    ThreeEnemy: {enemy: true, number: 3},
    AllEnemies: {enemy: true, number: 99},

    OneAlly: {ally: true, number: 1},
    TwoAlly: {ally: true, number: 2},
    AllAllies: {ally: true, number: 99},

    RandomTarget: {enemy: true, ally: true, number: 1},
    Everyone: {enemy: true, ally: true, number: 99}
}

class Skill {
    constructor(name, desc, targeting, action) {
        this.name = name;
        this.desc = desc;
        this.targeting = targeting;
        this.action = action;
    }

    use(user, targets, battle) {
        return this.action(user, targets, battle);
    }

    target(user, battle) {
        var num_needed = this.targeting.number;
        var targets = [];

        while (num_needed > 0) {
            var possible_targets = battle.all_combatants().filter(t => (
                (
                    (t.team == user.team && this.targeting.ally) ||
                    (t.team != user.team && this.targeting.enemy)
                ) && (t.targetable && t.alive) && (targets.indexOf(t) == -1) && (t != user)
            ));

            // if there are any targets, pick a random one and decrement num_needed. if not, set num_needed to 0.
            if (possible_targets.length > 0) {
                targets.push(
                    possible_targets[random_int(0, possible_targets.length)]
                );

                num_needed--;
            } else {
                num_needed = 0;
            }
        }

        return targets;
    }
}


class SkillActionFactory {
    constructor (first) {
        this.actions = [];
        if (first) {
            this.actions.push(first);
        }
    }

    then(f) {
        this.actions.push(f);
        return this;
    }

    compose() {
        var fn = this.actions[0];
        var index = 1;
        while (index < this.actions.length) {
            fn = skill_actions._sequential(fn, this.actions[index]);
            index++;
        }

        return fn;
    }
}


var skill_actions = {
    _sequential: function(a, b) {
        return function(user, targets, battle) {
            a(user, targets, battle);
            b(user, targets, battle);
        }
    },

    deal_dmg: function(amount) {
        return function(user, targets, battle) {
            battle.log(0, user.name + " is dealing " + amount + " damage to " + targets.map(x => x.name).join(", "));
        }
    },

    apply_effect: function(effect, duration) {
        return function(user, targets, battle) {
            battle.log(0, user.name + " is applying " + effect + " to " + targets.map(x => x.name).join(", ") + " for " + duration + " turns");
        }
    }
}


var skills_list = [
    new Skill(
        "funny skill", "it kills you", SkillTargeting.OneEnemy,
        new SkillActionFactory(skill_actions.deal_dmg(5))
            .compose()
    ),
    
    new Skill(
        "funnier skill", "it kills them", SkillTargeting.AllEnemies, 
        new SkillActionFactory(skill_actions.deal_dmg(10))
            .then(skill_actions.apply_effect(Effect.Desertification, 3))
            .compose()
    ),
];