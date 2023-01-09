const SkillTargeting = {
    OneEnemy: {enemy: true, number: 1},
    TwoEnemy: {enemy: true, number: 2},
    ThreeEnemy: {enemy: true, number: 3},

    OneAlly: {ally: true, number: 1},
    TwoAlly: {ally: true, number: 2},

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