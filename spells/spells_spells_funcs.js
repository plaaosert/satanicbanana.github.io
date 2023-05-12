spells_funcs = {
    "Fireball": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Searing Touch": [
        function(user, spell, stats) {
            stats.post_multipliers["damage"] *= 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Flame Nova": [
        function(user, spell, stats) {
            stats.specials.push(SpellSpecials.FLAMENOVA)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Flarefrost Beam": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            tile_damage(user, location, stats.damage, DmgType.Ice)
        }
    ],

    "Cleansing Fire": [
        no_stats,
        no_target,
        redeal_dmg([DmgType.Fire], [DmgType.Holy], 0.5),
        no_tiles
    ],

    "Ice Ball": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            tile_damage(user, location, stats.damage, DmgType.Physical)
        }
    ],

    "Snap Freeze": [
        no_stats,
        function(user, spell, stats, location) {
            apply_status_tile(user, location, StatusEffect.FREEZE, 3)
        },
        no_hit,
        no_tiles
    ],

    "Chilling Burst": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Ice) {
                apply_status(caster, enemy, StatusEffect.FREEZE, 2)
            }
        },
        no_tiles
    ],

    "Frostbite": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Ice) {
                tile_damage(caster, enemy.position, stats.damage, DmgType.Dark)
            }
        },
        no_tiles
    ],

    "Absolute Zero": [
        no_stats,
        function(user, spell, stats, location) {
            apply_status_tile(user, location, StatusEffect.FREEZE, 6)
        },
        no_hit,
        no_tiles
    ],

    "Lightning Bolt": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Arc Lightning": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 3
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Chain Lightning": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += 4
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Hypercharge": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            apply_status(caster, enemy, StatusEffect.OVERCHARGE, 16)
        },
        no_tiles
    ],

    "Spark": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "15": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "16": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "17": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "18": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "19": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "20": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "21": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "22": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "23": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "24": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "25": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "26": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "27": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "28": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "29": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "30": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "31": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "32": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "33": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "34": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "35": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "36": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "37": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "38": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "39": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "40": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "41": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "42": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "43": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "44": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "45": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "46": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "47": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "48": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "49": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Damage Plus I": [
        function(user, spell, stats) {
            stats.damage += 5
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Damage Plus II": [
        function(user, spell, stats) {
            stats.damage += 15
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Damage Overcharge": [
        function(user, spell, stats) {
            stats.damage += 5 * stats.radius
            stats.radius = 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Radius Plus I": [
        function(user, spell, stats) {
            stats.radius += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Radius Plus II": [
        function(user, spell, stats) {
            stats.radius += 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Range Plus I": [
        function(user, spell, stats) {
            stats.range += 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Range Plus II": [
        function(user, spell, stats) {
            stats.range += 5
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Orbital Mirroring": [
        function(user, spell, stats) {
            stats.range += 64
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Projection": [
        function(user, spell, stats) {
            stats.los = false
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Undercharging I": [
        function(user, spell, stats) {
            stats.damage -= 7
            stats.radius -= 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Undercharging II": [
        function(user, spell, stats) {
            stats.damage -= 13
            stats.radius -= 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Power Focus": [
        function(user, spell, stats) {
            stats.range -= 6
            stats.damage += 25
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unbounded Energy": [
        function(user, spell, stats) {
            stats.damage += Math.round(user.mp / 10)
        },
        function(user, spell, stats, location) {
            user.mp -= Math.round(user.mp / 10);
        },
        no_hit,
        no_tiles
    ],

    "Synergistic Arcana": [
        function(user, spell, stats) {
            Object.keys(stats).forEach(s => {
                if (typeof(stats[s]) == 'number') {
                    stats[s] = Math.round(stats[s] * 1.25)
                }
            })
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Antisynergy": [
        function(user, spell, stats) {
            Object.keys(stats).forEach(s => {
                if (typeof(stats[s]) == 'number') {
                    stats[s] = Math.round(stats[s] * 0.75)
                }
            })
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Random Damage": [
        function(user, spell, stats) {
            stats.damage += Math.floor(Math.random() * 201) - 100;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Zenith Arcana I": [
        function(user, spell, stats) {
            stats.damage += 50
            stats.radius += 3
            stats.range += 8
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Zenith Arcana II": [
        function(user, spell, stats) {
            stats.damage += 150
            stats.radius += 5
            stats.range += 12
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "68": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "69": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "70": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "71": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "72": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "73": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "74": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "75": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "76": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "77": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "78": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "79": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Freezing Fire": [
        no_stats,
        no_target,
        half_redeal(DmgType.Fire, DmgType.Ice),
        no_tiles
    ],

    "Crystallized Flame": [
        no_stats,
        no_target,
        half_redeal(DmgType.Fire, DmgType.Arcane),
        no_tiles
    ],

    "Chaotic Immolation": [
        no_stats,
        no_target,
        half_redeal(DmgType.Fire, DmgType.Chaos),
        no_tiles
    ],

    "Sacred Flames": [
        no_stats,
        no_target,
        half_redeal(DmgType.Fire, DmgType.Holy),
        no_tiles
    ],

    "Charged Ice": [
        no_stats,
        no_target,
        half_redeal(DmgType.Ice, DmgType.Lightning),
        no_tiles
    ],

    "Crystalline Frost": [
        no_stats,
        no_target,
        half_redeal(DmgType.Ice, DmgType.Arcane),
        no_tiles
    ],

    "Stifling Frost": [
        no_stats,
        no_target,
        half_redeal(DmgType.Ice, DmgType.Dark),
        no_tiles
    ],

    "Arcane Conductance": [
        no_stats,
        no_target,
        half_redeal(DmgType.Lightning, DmgType.Arcane),
        no_tiles
    ],

    "Cracklevoid": [
        no_stats,
        no_target,
        half_redeal(DmgType.Lightning, DmgType.Dark),
        no_tiles
    ],

    "Heavenstrike": [
        no_stats,
        no_target,
        half_redeal(DmgType.Lightning, DmgType.Holy),
        no_tiles
    ],

    "Mind Bolts": [
        no_stats,
        no_target,
        half_redeal(DmgType.Lightning, DmgType.Psychic),
        no_tiles
    ],

    "Crystallized Sorcery": [
        no_stats,
        no_target,
        half_redeal(DmgType.Arcane, DmgType.Ice),
        no_tiles
    ],

    "Dark Magic": [
        no_stats,
        no_target,
        half_redeal(DmgType.Arcane, DmgType.Dark),
        no_tiles
    ],

    "Mind Magic": [
        no_stats,
        no_target,
        half_redeal(DmgType.Arcane, DmgType.Psychic),
        no_tiles
    ],

    "Falcon Fist": [
        no_stats,
        no_target,
        half_redeal(DmgType.Physical, DmgType.Fire),
        no_tiles
    ],

    "Lightning Fist": [
        no_stats,
        no_target,
        half_redeal(DmgType.Physical, DmgType.Lightning),
        no_tiles
    ],

    "Double Hit": [
        no_stats,
        no_target,
        redeal_dmg([DmgType.Physical], [DmgType.Physical], 1),
        no_tiles
    ],

    "Shadow Strike": [
        no_stats,
        no_target,
        half_redeal(DmgType.Physical, DmgType.Dark),
        no_tiles
    ],

    "Pure Strike": [
        no_stats,
        no_target,
        half_redeal(DmgType.Physical, DmgType.Holy),
        no_tiles
    ],

    "Telekinesis": [
        no_stats,
        no_target,
        half_redeal(DmgType.Physical, DmgType.Psychic),
        no_tiles
    ],

    "Blackflame": [
        no_stats,
        no_target,
        half_redeal(DmgType.Dark, DmgType.Fire),
        no_tiles
    ],

    "Deathly Frost": [
        no_stats,
        no_target,
        half_redeal(DmgType.Dark, DmgType.Ice),
        no_tiles
    ],

    "Demonic Dark": [
        no_stats,
        no_target,
        half_redeal(DmgType.Dark, DmgType.Chaos),
        no_tiles
    ],

    "Sacred Magic": [
        no_stats,
        no_target,
        half_redeal(DmgType.Holy, DmgType.Arcane),
        no_tiles
    ],

    "Apostasy": [
        no_stats,
        no_target,
        half_redeal(DmgType.Holy, DmgType.Dark),
        no_tiles
    ],

    "Chromatic Catalyst": [
        no_stats,
        no_target,
        redeal_dmg("native", "chromatic", 1 / Object.keys(DmgType).length),
        no_tiles
    ],

    "Null Magic": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            renderer.put_particle_from_game_loc(enemy.position, new Particle(
                dmg_type_particles[dmgtype]
            ));

            game.deal_damage(enemy, caster, caster.id, -damage, dmgtype, true)
        },
        no_tiles
    ],

    "Hand of Fate": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            let typ = random_damage_type([dmgtype]);

            renderer.put_particle_from_game_loc(enemy.position, new Particle(
                dmg_type_particles[typ]
            ));

            game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), typ, true)
        },
        no_tiles
    ],

    "Chromatic Convergence": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == stats.damage_type) {
                let mults = enemy.get_damage_mults();
                let typ = [null, Number.NEGATIVE_INFINITY];
                Object.keys(mults).forEach(m => {
                    if (mults[m] > typ[1] && DmgType[m] != stats.damage_type) {
                        typ = [m, mults[m]];
                    }
                })

                let final_typ = typ[0];

                renderer.put_particle_from_game_loc(enemy.position, new Particle(
                    dmg_type_particles[final_typ]
                ));

                game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), final_typ, true)
            }
        },
        no_tiles
    ],

    "Chromatic Divergence": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == stats.damage_type) {
                let mults = enemy.get_damage_mults();
                let typ = [null, Number.POSITIVE_INFINITY];
                Object.keys(mults).forEach(m => {
                    if (mults[m] < typ[1] && DmgType[m] != stats.damage_type) {
                        typ = [m, mults[m]];
                    }
                })

                let final_typ = typ[0];

                renderer.put_particle_from_game_loc(enemy.position, new Particle(
                    dmg_type_particles[final_typ]
                ));

                game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), final_typ, true)
            }
        },
        no_tiles
    ],

    "110": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "111": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "112": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "113": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "114": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "115": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "116": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "117": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "118": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "119": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "120": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "121": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "122": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "123": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "124": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Add Target Trigger": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Add Tile Trigger": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Add Damage Trigger": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "128": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "129": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "130": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "131": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "132": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "133": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "134": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Positional": [
        function(user, spell, stats) {
            stats.target_type = SpellTargeting.Positional
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unit Target": [
        function(user, spell, stats) {
            stats.target_type = SpellTargeting.UnitTarget
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Self Target": [
        function(user, spell, stats) {
            stats.target_type = SpellTargeting.SelfTarget
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Self Position": [
        function(user, spell, stats) {
            stats.target_type = SpellTargeting.SelfTargetPlusCaster
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "139": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "140": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "141": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "142": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "143": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "144": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Behind the Back": [
        function(user, spell, stats) {
            stats.multicasts["btb"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "146": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "147": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "148": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "149": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "150": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "151": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Multicast x4": [
        function(user, spell, stats) {
            stats.multicasts["normal"] += 4
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "153": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "154": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "155": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "156": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "157": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "158": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Chain Spell": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += 4
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Arc Spell": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 4
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "161": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "162": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "163": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "164": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "165": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "166": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "167": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "168": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "169": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Conjure Mana": [
        no_stats,
        function(user, spell, stats, location) {
            user.restore_mp(15)
        },
        no_hit,
        no_tiles
    ],

    "Hardening Enchantment": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == stats.damage_type) {
                apply_status(caster, enemy, StatusEffect[`RESISTANCE_${dmgtype.toUpperCase()}`], 3)
            }
        },
        no_tiles
    ],

    "Intensifying Enchantment": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == stats.damage_type) {
                apply_status(caster, enemy, StatusEffect[`POLARITY_${dmgtype.toUpperCase()}`], 4)
            }
        },
        no_tiles
    ],

    "Chromatic Impact": [
        no_stats,
        function(caster, spell, stats, position) {
            Object.keys(DmgType).forEach(typ => {
                apply_status_tile(caster, position, StatusEffect["RESISTANCE_" + typ.toUpperCase()], 10)
            })
        },
        no_hit,
        no_tiles
    ],

    "Cleanse": [
        no_stats,
        function(caster, spell, stats, position) {
            let ent = game.board.get_pos(position);

            if (ent) {
                ent.cleanse_effects();
            }
        },
        no_hit,
        no_tiles
    ],

    "175": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "176": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "177": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "178": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "179": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "180": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "181": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "182": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "183": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "184": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "185": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "186": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "187": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "188": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "189": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "190": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "191": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "192": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "193": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "194": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "195": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "196": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "197": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "198": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "199": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Gun": [
        no_stats,
        function(user, spell, stats, location) {
            user.cast_spell([
                core_spell(
                    "gun explosion", "##", SpellSubtype.Core, "white", "black", "", 25, DmgType.Fire, 1, 1, Shape.Diamond, 0, stats.target_type, stats.target_team
                )
            ], location);
        },
        no_hit,
        no_tiles
    ],

    "Uncontrolled Multicast x16": [
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += 16;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "All Elements": [
        no_stats,
        function(user, spell, stats, location) {
            let dmgtypes = [
                "Fire",
                "Ice",
                "Lightning",
                "Arcane",
                "Physical",
                "Dark",
                "Chaos",
                "Holy",
                "Psychic"
            ].reverse();
    
            dmgtypes.forEach(t => {
                game.max_spell_speed = 100;
                game.min_spell_speed = 10;
        
                user.cast_spell([
                    core_spell(
                        t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                    ).augment("to_stats", function(_, _, s) { s.los = false; })
                ], location.add(new Vector2(0, -8)));
    
                user.cast_spell([
                    core_spell(
                        t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Diamond, 0
                    ).augment("to_stats", function(_, _, s) { s.los = true; })
                ], location.add(new Vector2(-8, 0)));
    
                user.cast_spell([
                    core_spell(
                        t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
                    ).augment("to_stats", function(_, _, s) { s.los = false; })
                ], location.add(new Vector2(8, 0)));
    
                user.cast_spell([
                    core_spell(
                        t, "##", SpellSubtype.Red, "white", "black", "", 100, DmgType[t], 1, 3, Shape.Line, 0
                    ).augment("to_stats", function(_, _, s) { s.los = true; }).augment("at_target", function(_, _, _, _) { 
                        console.log(t);
                        // document.getElementById("dmg-type-display").textContent = t;
                        // document.getElementById("dmg-type-display").style.color = damage_type_cols[t];
                    })
                ], location.add(new Vector2(0, 8)));
            })
    
            if (!stats.mutable_info["aa"] || stats.mutable_info["aa"] < 1) {
                stats.mutable_info["aa"] = stats.mutable_info["aa"] ? stats.mutable_info["aa"] + 1 : 1;
    
                let new_spell = user.parse_spell([
                    core_spell(
                        "t", "##", SpellSubtype.Core, "white", "black", "", 1, DmgType.Physical, 1, 3, Shape.Line, 0
                    ).augment("at_target", function(_, _, _, _) { 
                        game.max_spell_speed = 100;
                        game.min_spell_speed = 10;
                    })
                ], location);
    
                game.cast_primed_spell(new_spell.root_spell, location, true);
            }
        },
        no_hit,
        no_tiles
    ],

    "Pea Spell": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "summon GUY": [
        no_stats,
        function(user, spell, stats, location) {
            game.spawn_entity(get_entity_by_name("Fuckn GUy"), Teams.PLAYER, location);
        },
        no_hit,
        no_tiles
    ],

    "205": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "206": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "207": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "208": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "209": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "210": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "211": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "212": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "213": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "214": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "215": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "216": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "217": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "218": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "219": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "220": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "221": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "222": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "223": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "224": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "225": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "226": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "227": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "228": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "229": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "230": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "231": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "232": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "233": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "234": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "235": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "236": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "237": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "238": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "239": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "240": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "241": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "242": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "243": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "244": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "245": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "246": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "247": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "248": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "249": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "250": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "251": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "252": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "253": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "254": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "255": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "256": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "257": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "258": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "259": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "260": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "261": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "262": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "263": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "264": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "265": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "266": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "267": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "268": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "269": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "270": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "271": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "272": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "273": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "274": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "275": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "276": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "277": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "278": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "279": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "280": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "281": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "282": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "283": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "284": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "285": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "286": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "287": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "288": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "289": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "290": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "291": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "292": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "293": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "294": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "295": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "296": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "297": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "298": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "299": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "300": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],


}