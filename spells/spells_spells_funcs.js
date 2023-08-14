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

    "Magic Missile": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Arcane Crush": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (!enemy.has_status(StatusEffect.STUN)) {
                apply_status(caster, enemy, StatusEffect.STUN, 2)
            }
        },
        no_tiles
    ],

    "Magical Explosion": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            tile_damage(user, location, stats.damage, DmgType.Physical)
        }
    ],

    "Void Laser": [
        function(user, spell, stats) {
            stats.los = false;
        },
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            apply_status(caster, enemy, StatusEffect.POLARITY_ARCANE, 16)
        },
        no_tiles
    ],

    "Conjure Spear": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Conjure Bullet": [
        no_stats,
        function(user, spell, stats, location) {
            tile_damage(user, location, stats.damage * 2, DmgType.Fire)
        },
        no_hit,
        no_tiles
    ],

    "Sonic Boom": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 2;
        },
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (!enemy.has_status(StatusEffect.STUN)) {
                apply_status(caster, enemy, StatusEffect.STUN, 1)
            }
        },
        no_tiles
    ],

    "Lacerate": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            apply_status(caster, enemy, StatusEffect.BLEED, 1)
        },
        no_tiles
    ],

    "Magnetic Launcher": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            let dist = user.position.distance(location);
            let dmg = Math.floor(stats.damage * 0.2 * dist);

            tile_damage(user, location, dmg, DmgType.Physical)
        }
    ],

    "Ball of Skulls": [
        no_stats,
        function(user, spell, stats, location) {
            game.spawn_entity(get_entity_by_name("Skeleton"), user.team, location);
        },
        no_hit,
        no_tiles
    ],

    "Mass Haunting": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            game.spawn_entity(get_entity_by_name("Ghost"), user.team, location);
        }
    ],

    "Reinforce": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            let ent = game.board.get_pos(location);
            if (ent && ent.id != game.player_ent.id && ent.has_affinity(Affinity.Dark)) {
                ent.restore_hp(Number.POSITIVE_INFINITY);
                if (!ent.innate_spells.some(s => s[2] == "Death Bolt")) {
                    let sp = get_spell_by_name("Death Bolt");
                    ent.add_innate_spell([
                        [sp], 0, "Death Bolt", sp.col 
                    ]);
                }
            }
        }
    ],

    "Death Bolt": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Turn Unwilling Dead": [
        function(user, spell, stats) {
            stats.specials.push(SpellSpecials.TURNDEAD)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unknown Incantation": [
        function(user, spell, stats) {
            let spell_obj = get_spell_by_name("Unknown Incantation");
            stats.damage_type = spell_obj.unknown_incant_dmgtype ? spell_obj.unknown_incant_dmgtype : DmgType.Chaos;
            stats.damage = spell_obj.unknown_incant_dmgval ? spell_obj.unknown_incant_dmgval : 20;

            stats.specials.push(SpellSpecials.CHAOSINCANT);
        },
        function(user, spell, stats, location) {
            let spell_obj = get_spell_by_name("Unknown Incantation");

            let current_incant = spell_obj.unknown_incant_val ? spell_obj.unknown_incant_val : 0;

            let name_strings = [
                "Nothing.",
                "Nothing...",
                "Change the damage type of this core to a random other damage type.",
                "Add 10 to the damage value of this core.",
                "Multiply this core's damage value by 0.8.",
                "Set this core's damage value to 40.",
                "Add a random affinity to the caster, or replace their third affinity if they have three already.",
                "Apply Stunned for 3 turns to the caster.",
                "Randomise the colour of this core.",
                "Summon a copy of any unit damaged by this core with their original stats and spells.",
                "Grant this core as a usable spell to any non-player unit damaged by this core.",
                "Applies 10 turns of three random effects to any unit at the target position.",
                "Removes all affinities from the caster.",
                "Reduce the caster's max HP by 1.",
                "Randomise this core's icon.",
                "Deal damage to EVERY unit equal to 10% of their current HP.",
                "Nothing...?"
            ]

            let old_dmg_val = null;
            let new_dmg_val = null;

            switch (current_incant) {
                case 0:
                case 1:
                    break;

                case 2:
                    let old_dmgtype = spell_obj.unknown_incant_dmgtype ? spell_obj.unknown_incant_dmgtype : DmgType.Chaos;
                    
                    let dmgtypes = Object.keys(DmgType);
                    let new_dmgtype = DmgType[dmgtypes[Math.floor(game.random() * dmgtypes.length)]];

                    spell_obj.desc = spell_obj.desc.replace(`[${damage_type_cols[old_dmgtype]}]${old_dmgtype}[clear]`, `[${damage_type_cols[new_dmgtype]}]${new_dmgtype}[clear]`);

                    spell_obj.desc = spell_obj.desc.replace(old_dmgtype, new_dmgtype);
                    
                    spell_obj.unknown_incant_dmgtype = new_dmgtype;
                    break;

                case 3:
                    old_dmg_val = spell_obj.unknown_incant_dmgval ? spell_obj.unknown_incant_dmgval : 20;
                    new_dmg_val = old_dmg_val + 10;

                    spell_obj.desc = spell_obj.desc.replace(`Deals [#4df]${old_dmg_val}`, `Deals [#4df]${new_dmg_val}`);
                    
                    spell_obj.unknown_incant_dmgval = new_dmg_val;
                    break;

                case 4:
                    old_dmg_val = spell_obj.unknown_incant_dmgval ? spell_obj.unknown_incant_dmgval : 20;
                    new_dmg_val = Math.round(old_dmg_val * 0.8);

                    spell_obj.desc = spell_obj.desc.replace(`Deals [#4df]${old_dmg_val}`, `Deals [#4df]${new_dmg_val}`);
                    
                    spell_obj.unknown_incant_dmgval = new_dmg_val;
                    break;

                case 5:
                    old_dmg_val = spell_obj.unknown_incant_dmgval ? spell_obj.unknown_incant_dmgval : 20;
                    new_dmg_val = 40;

                    spell_obj.desc = spell_obj.desc.replace(`Deals [#4df]${old_dmg_val}`, `Deals [#4df]${new_dmg_val}`);
                    
                    spell_obj.unknown_incant_dmgval = new_dmg_val;
                    break;

                case 6:
                    let affinities = user.affinities;
                    let possible_affs = Object.values(Affinity).filter(aff => {
                        return !affinities.includes(aff);
                    })

                    let new_aff = possible_affs[Math.floor(game.random() * possible_affs.length)];

                    if (affinities.length >= 3) {
                        affinities[2] = new_aff;
                    } else {
                        affinities.push(new_aff);
                    }
                    break;

                case 7:
                    apply_status(user, user, StatusEffect.STUN, 3);
                    break;

                case 8:
                    let new_col = Math.floor(game.random()*16777215).toString(16);

                    spell_obj.col = "#" + new_col;
                    break;

                case 9:
                    break;

                case 10:
                    break;

                case 11:
                    let ent = game.board.get_pos(location);

                    if (ent) {
                        let efc_list = Object.values(StatusEffect);
                        for (let i=0; i<3; i++) {
                            let efc = efc_list[Math.floor(game.random() * efc_list.length)];

                            apply_status(user, ent, efc, 10);
                        }
                    }

                    break;

                case 12:
                    user.affinities = [];
                    break;

                case 13:
                    user.max_hp -= 1
                    user.change_hp(0)
                    break;
                
                case 14:
                    iconchars = "qwertyuiop[]asdfghjkl;'#zxcvbnm,./\\1234567890-=!\"£$%^&*()_+QWERTYUIOP{}ASDFGHJKL:@~ZXCVBNM<>?|";
                    spell_obj.icon = "";
                    for (let i=0; i<2; i++) {
                        spell_obj.icon += iconchars[Math.floor(game.random() * iconchars.length)];
                    }

                    break;

                case 15:
                    game.entities.forEach(ent => {
                        let dmg = Math.floor(ent.hp * 0.1);
                        if (dmg < Number.POSITIVE_INFINITY && !ent.untargetable) {
                            ent.lose_hp(dmg);
                        }
                    })

                    break;

                case 16:
                    if (game.random() < 1/50) {
                        switch_checkerboard = switch_checkerboard ? 0 : 1;
                    }
                    break;
            }

            let new_incant = Math.floor(game.random() * 17);
            if (current_incant == 0 && game.random() < 0.5) {
                new_incant = 1;
            }

            spell_obj.desc = spell_obj.desc.replace(
                /Next effect: .*\n/,
                `Next effect: [${damage_type_cols[DmgType.Chaos]}]${name_strings[new_incant]}[clear]\n`
            )
            
            spell_obj.unknown_incant_val = new_incant;
        },
        function(caster, spell, stats, enemy, damage, dmgtype) {
            let spell_obj = get_spell_by_name("Unknown Incantation");

            let current_incant = spell_obj.unknown_incant_val ? spell_obj.unknown_incant_val : 0;

            switch (current_incant) {
                case 9:
                    console.log(`trying to spawn ${enemy.template}!`)
                    let ent = game.spawn_entity_near(enemy.template, enemy.team, enemy.position);

                    if (ent.ai_level == 0) {
                        // it's the player. we need to do some funny business
                        ent.ai_level = 1;

                        game.player_spells.forEach(sp => {
                            ent.add_innate_spell([
                                [...sp.spells], 0, sp.name, "#fff"
                            ])
                        })
                    }
                    break;

                case 10:
                    if (enemy.id != game.player_ent.id) {
                        if (!enemy.innate_spells.some(s => s[2] == "Unknown Incantation")) {
                            let sp = get_spell_by_name("Unknown Incantation");
                            enemy.add_innate_spell([
                                [sp], 0, "Unknown Incantation", sp.col 
                            ]);
                        }
                    }
                    break;
            }
        },
        no_tiles
    ],

    "Chromatic Shattering": [
        function(user, spell, stats) {
            let spell_obj = get_spell_by_name("Chromatic Shattering");
            stats.damage_type = spell_obj.unknown_incant_dmgtype ? spell_obj.unknown_incant_dmgtype : DmgType.Chaos;
        
            stats.specials.push(SpellSpecials.CHAOSINCANT);
        },
        function(user, spell, stats, location) {
            let spell_obj = get_spell_by_name("Chromatic Shattering");

            let old_dmgtype = spell_obj.unknown_incant_dmgtype ? spell_obj.unknown_incant_dmgtype : DmgType.Chaos;
                    
            let dmgtypes = Object.keys(DmgType);
            let new_dmgtype = DmgType[dmgtypes[Math.floor(game.random() * dmgtypes.length)]];

            spell_obj.desc = spell_obj.desc.replace(`[${damage_type_cols[old_dmgtype]}]${old_dmgtype}[clear]`, `[${damage_type_cols[new_dmgtype]}]${new_dmgtype}[clear]`);

            spell_obj.desc = spell_obj.desc.replace(old_dmgtype, new_dmgtype);
            
            spell_obj.unknown_incant_dmgtype = new_dmgtype;
        },
        no_hit,
        no_tiles
    ],

    "Cone of Chaos": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            let dmg = stats.damage;
            if (game.random() < 0.5) {
                tile_damage(user, location, dmg, DmgType.Fire)
            } else {
                tile_damage(user, location, dmg, DmgType.Lightning)
            }
        }
    ],

    "Demonic Summoning": [
        no_stats,
        function(user, spell, stats, location) {
            let demons = [
                "Fire Demon",
                "Ice Demon",
                "Primal Demon",
                "Brimstone Demon"
            ]

            let chosen_demon = demons[Math.floor(game.random() * demons.length)];

            game.spawn_entity(get_entity_by_name(chosen_demon), user.team, location);
        },
        no_hit,
        no_tiles
    ],

    "Sacred Bolt": [
        no_stats,
        function(caster, spell, stats, position) {
            let ent = game.board.get_pos(position);

            if (ent) {
                if (ent.affinity_present([
                    Affinity.Dark, Affinity.Demon, Affinity.Undead, Affinity.Ghost
                ])) {
                    apply_status(caster, ent, StatusEffect.STUN, 3);
                }
            }
        },
        no_hit,
        no_tiles
    ],

    "Shining Spear": [
        no_stats,
        no_target,
        no_hit,
        function(caster, spell, stats, position) {
            tile_damage(caster, position, stats.damage, DmgType.Physical);

            let ent = game.board.get_pos(position);

            if (ent) {
                if (ent.affinity_present([
                    Affinity.Dark, Affinity.Demon, Affinity.Undead, Affinity.Ghost
                ])) {
                    tile_damage(caster, position, stats.damage, DmgType.Holy);
                }
            }
        }
    ],

    "Angelic Chorus": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Holy && enemy.has_affinity(Affinity.Holy)) {
                enemy.restore_hp(stats.damage * 2);
            }
        },
        no_tiles
    ],

    "Consecrate": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            let weak = enemy.affinity_present([
                Affinity.Dark, Affinity.Demon, Affinity.Undead, Affinity.Ghost
            ]);

            if (dmgtype == DmgType.Holy && weak) {
                let typ = DmgType.Fire;

                renderer.put_particle_from_game_loc(enemy.position, new Particle(
                    dmg_type_particles[typ]
                ));
    
                game.deal_damage(enemy, caster, caster.id, damage, typ)
            }
        },
        no_tiles
    ],

    "Apotheosis": [
        no_stats,
        function(caster, spell, stats, position) {
            apply_status(caster, caster, StatusEffect.INVULNERABLE, 10);
            apply_status(caster, caster, StatusEffect.STUN, 10);

            game.spawn_entity_near(get_entity_by_name("Seraphim"), caster.team, position);
            game.spawn_entity_near(get_entity_by_name("Seraphim"), caster.team, position);
            game.spawn_entity_near(get_entity_by_name("Archangel"), caster.team, position);
            game.spawn_entity_near(get_entity_by_name("Archangel"), caster.team, position);
        },
        no_hit,
        no_tiles
    ],

    "Mind Spike": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Touch of Mindshattering": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Psychic) {
                if (!enemy.has_status(StatusEffect.STUN)) {
                    apply_status(caster, enemy, StatusEffect.STUN, 4);
                }
            }
        },
        no_tiles
    ],

    "Memetic Virus": [
        function(user, spell, stats) {
            stats.specials.push(SpellSpecials.NEVERDAMAGE);

            stats.multicasts["chain"] += 6;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Overwhelm": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Psychic) {
                apply_status(caster, enemy, StatusEffect.SLEEP, 3);
            }
        },
        no_tiles
    ],

    "Blink": [
        no_stats,
        function(caster, spell, stats, position) {
            let ent = game.board.get_pos(position);
            if (!ent) {
                game.move_entity(caster, position);
            }
        },
        no_hit,
        no_tiles
    ],

    "Teleport": [
        no_stats,
        function(caster, spell, stats, position) {
            let ent = game.board.get_pos(position);
            if (!ent) {
                game.move_entity(caster, position);
            }
        },
        no_hit,
        no_tiles
    ],

    "Disperse": [
        no_stats,
        no_target,
        function(caster, spell, stats, enemy, damage, dmgtype) {
            if (dmgtype == DmgType.Psychic) {
                let new_pos = game.find_random_space_in_los(enemy, enemy.position, 5, Shape.Circle[1], true, true);

                if (new_pos) {
                    game.move_entity(enemy, new_pos);
                }
            }
        },
        no_tiles
    ],

    "Dimensional Rift": [
        no_stats,
        no_target,
        no_hit,
        function(caster, spell, stats, location) {
            let ent = game.board.get_pos(location);

            if (ent && !ent.untargetable) {
                let new_pos = game.find_random_space_in_los(ent, ent.position, 64, Shape.Circle[1], true, true);

                if (new_pos) {
                    game.move_entity(ent, new_pos);
                }
            }
        }
    ],

    "Last Resort": [
        no_stats,
        function(caster, spell, stats, position) {
            caster.hp = 1;
            caster.max_hp = Math.round(caster.max_hp * 0.9);
        },
        no_hit,
        no_tiles
    ],

    "Fireball with Trigger": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Lightning Bolt with Trigger": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Magic Missile with Trigger": [
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
            stats.damage += Math.floor(game.random() * 201) - 100;
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

    "Pain Catalyst I": [
        function(user, spell, stats) {
            let hp_pct = user.hp / user.max_hp
            let factor = 10;

            let final_amt = Math.floor((1-hp_pct) * factor);

            stats.damage += Math.round(final_amt * 5);
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Pain Catalyst II": [
        function(user, spell, stats) {
            let hp_pct = user.hp / user.max_hp
            let factor = 10;

            let final_amt = Math.floor((1-hp_pct) * factor);

            stats.damage += Math.round(final_amt * 15);
            stats.radius += Math.round(final_amt * 1);
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Last Stand": [
        function(user, spell, stats) {
            let hp_pct = user.hp / user.max_hp
            if (hp_pct < 0.1) {
                stats.damage *= 2
                stats.radius *= 2
                stats.range *= 2
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Affinity Matching": [
        function(user, spell, stats) {
            if (user.has_affinity(stats.damage_type)) {
                stats.damage = Math.round(stats.damage * 1.5)
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Sympathetic Damage": [
        function(user, spell, stats) {
            let dmgmult = user.get_damage_mult(stats.damage_type);

            stats.damage = Math.round(stats.damage * dmgmult);
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Strange Shuffle": [
        function(user, spell, stats) {
            let old_dmg = stats.damage

            stats.damage = stats.radius
            stats.radius = old_dmg
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Paradigm Shift": [
        function(user, spell, stats) {
            let old_rad = stats.radius

            stats.radius = Math.round(stats.range / 2) 
            stats.range = Math.round(old_rad * 2)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Null": [
        function(user, spell, stats) {
            stats.damage = 0;
            stats.radius = 0;
            stats.range = 0;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Catch-up Damage": [
        function(user, spell, stats) {
            stats.damage = 33;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Equalisation": [
        function(user, spell, stats) {
            let orig_core = spell.spells.find(sp => sp.typ == SpellType.Core)
            if (orig_core) {
                let new_primed = new PrimedSpell(user, [orig_core]);
                new_primed.calculate();

                let stat_sum = new_primed.range + new_primed.damage + new_primed.radius;
                let stat_ratios = [
                    new_primed.range / stat_sum,
                    new_primed.radius / stat_sum,
                    new_primed.damage / stat_sum
                ];

                let spell_stat_sum = stats.range + stats.radius + stats.damage;

                let new_stats = [
                    Math.round(spell_stat_sum * stat_ratios[0]),
                    Math.round(spell_stat_sum * stat_ratios[1]),
                    Math.round(spell_stat_sum * stat_ratios[2]),
                ]

                stats.range = new_stats[0];
                stats.radius = new_stats[1];
                stats.damage = new_stats[2];
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Vowel Lover": [
        function(user, spell, stats) {
            let orig_core = spell.spells.find(sp => sp.typ == SpellType.Core)

            if (orig_core) {
                let m = orig_core.name.match(/[aeiou]/gi);
                let num_vowels = m ? m.length : 0;

                stats.damage += 5 * num_vowels;
                stats.range += 2 * num_vowels;
                stats.radius += 2 * num_vowels;
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Trigger Finger": [
        function(user, spell, stats) {
            if (user.took_damage_last_turn) {
                stats.damage *= 2
            }   
        },
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

            game.deal_damage(enemy, caster, caster.id, -damage, dmgtype, true);
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

            game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), typ)
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

                game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), final_typ)
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

                game.deal_damage(enemy, caster, caster.id, Math.floor(damage * 0.5), final_typ)
            }
        },
        no_tiles
    ],

    "Cosmetic Squares": [
        function(user, spell, stats) {
            stats.custom_particles = cosmetic_particles["Squares"];
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Cosmetic Arrows": [
        function(user, spell, stats) {
            stats.custom_particles = cosmetic_particles["Arrows"];
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Alternate Fire": [
        function(user, spell, stats) {
            if (stats.damage_type == DmgType.Fire) {
                stats.custom_particles = cosmetic_particles["FireAlt"];
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Alternate Ice": [
        function(user, spell, stats) {
            if (stats.damage_type == DmgType.Ice) {
                stats.custom_particles = cosmetic_particles["IceAlt"];
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "White Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#fff";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Orange Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#fa0";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Alternate Physical": [
        function(user, spell, stats) {
            if (stats.damage_type == DmgType.Physical) {
                stats.custom_particles = cosmetic_particles["PhysicalAlt"];
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Hide Particles": [
        function(user, spell, stats) {
            stats.enable_particles = false;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Red Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#f00";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Yellow Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#ff0";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Green Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#0f0";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Cyan Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#0ff";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Blue Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#68f";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Purple Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#c5c";
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Pink Particles": [
        function(user, spell, stats) {
            stats.custom_particle_colour = "#f9f";
        },
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

    "Chromatic Target Trigger": [
        function(user, spell, stats) {
            let dmgtypes = Object.keys(DmgType);
            let new_dmgtype = DmgType[dmgtypes[Math.floor(game.random() * dmgtypes.length)]];

            stats.damage_type = new_dmgtype;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Chromatic Tile Trigger": [
        function(user, spell, stats) {
            let dmgtypes = Object.keys(DmgType);
            let new_dmgtype = DmgType[dmgtypes[Math.floor(game.random() * dmgtypes.length)]];

            stats.damage_type = new_dmgtype;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unfair Damage Trigger": [
        function(user, spell, stats) {
            stats.damage = 0;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unreliable Target Trigger": [
        function(user, spell, stats) {
            if (game.random() < 0.5) {
                stats.radius = 0;
            }
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Zenith Tile Trigger": [
        function(user, spell, stats) {
            stats.radius *= 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Unfair Tile Trigger": [
        function(user, spell, stats) {
            stats.radius = 0
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Untrigger": [
        function(user, spell, stats) {
            switch (stats.trigger_type) {
                case "at_target":
                    stats.range += 4
                    break;

                case "on_hit":
                    stats.damage += 15
                    break;

                case "on_affected_tiles":
                    stats.radius += 2
                    break;
            }
        },
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

    "Circle": [
        function(user, spell, stats) {
            stats.shape = Shape.Circle[1]
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Ring": [
        function(user, spell, stats) {
            stats.shape = Shape.Ring[1]
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Line": [
        function(user, spell, stats) {
            stats.shape = Shape.Line[1]
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Burst": [
        function(user, spell, stats) {
            stats.shape = Shape.Burst[1]
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Perpendicular Line": [
        function(user, spell, stats) {
            stats.shape = Shape.PerpLine[1]
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Cone": [
        function(user, spell, stats) {
            stats.shape = Shape.Cone[1]
        },
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

    "Triangle Formation": [
        function(user, spell, stats) {
            stats.multicasts["triangle"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Square Formation": [
        function(user, spell, stats) {
            stats.multicasts["square"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Chaotic Multicast x2": [
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Chaotic Multicast x5": [
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += 5
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Multicast x1": [
        function(user, spell, stats) {
            stats.multicasts["normal"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Multicast x2": [
        function(user, spell, stats) {
            stats.multicasts["normal"] += 2
        },
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

    "Multicast x8": [
        function(user, spell, stats) {
            stats.multicasts["normal"] += 8
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Multicast x3 with Trigger": [
        function(user, spell, stats) {
            stats.multicasts["normal"] += 3
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Micro Chain Spell": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Micro Arc Spell": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 1
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Mini Chain Spell": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += 2
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Mini Arc Spell": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 2
        },
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

    "Chaos Intensifier": [
        function(user, spell, stats) {
            stats.multicasts["unpredictable"] += stats.multicasts["normal"];
            stats.multicasts["normal"] = 0;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Chain Refocus": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += Math.round(stats.multicasts["arc"] * 1.5);
            stats.multicasts["arc"] = 0;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Arc Refocus": [
        function(user, spell, stats) {
            stats.multicasts["arc"] += Math.round(stats.multicasts["chain"] * 1.5);
            stats.multicasts["chain"] = 0;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Duplicator Consumption": [
        function(user, spell, stats) {
            if (!stats.mutable_info["duplicator_consumption"]) {
                stats.mutable_info["duplicator_consumption"] = 0
            }

            let total_multicasts = 0;

            let multicast_types = Object.keys(stats.multicasts);
            multicast_types.forEach(typ => {
                total_multicasts += stats.multicasts[typ];
                stats.multicasts[typ] = 0;
            })

            stats.mutable_info["duplicator_consumption"] += total_multicasts;
        },
        function(caster, spell, stats, position) {
            caster.restore_mp(25 * stats.mutable_info["duplicator_consumption"])
        },
        no_hit,
        no_tiles
    ],

    "Blood Magic": [
        function(user, spell, stats) {
            let pct = user.hp / user.max_hp;
            let amt = Math.floor(pct * 5);

            stats.multicasts["normal"] += amt
        },
        function(caster, spell, stats, position) {
            let amt_lose = Math.ceil(caster.hp * 0.005);

            caster.lose_hp(amt_lose);
        },
        no_hit,
        no_tiles
    ],

    "Death Chain": [
        function(user, spell, stats) {
            stats.specials.push(SpellSpecials.DEATHCHAIN)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Subsurface Chain": [
        function(user, spell, stats) {
            stats.multicasts["chain"] += 6
            stats.specials.push(SpellSpecials.NEVERDAMAGE)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Subsurface Arc": [
        function(user, spell, stats) {
            stats.multicasts["simultaneous"] += 6
            stats.specials.push(SpellSpecials.NEVERDAMAGE)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Duplicator Amplification": [
        function(user, spell, stats) {
            let total_multicasts = 0;

            let multicast_types = Object.keys(stats.multicasts);
            multicast_types.forEach(typ => {
                total_multicasts += stats.multicasts[typ];
                stats.multicasts[typ] = 0;
            })

            stats.radius += 1 * total_multicasts;
            stats.range += 2 * total_multicasts;
            stats.damage += 8 * total_multicasts;
        },
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

    "Magic Flare": [
        function(user, spell, stats) {
            stats.damage_type = DmgType.Fire;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Formed Magic": [
        function(user, spell, stats) {
            stats.damage_type = DmgType.Physical;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Sanctity": [
        function(user, spell, stats) {
            stats.damage_type = DmgType.Holy;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Familiarity": [
        function(user, spell, stats) {
            let resists = user.get_damage_mults();

            let lowest = [null, Number.POSITIVE_INFINITY];
            Object.keys(resists).forEach(r => {
                let mul = resists[r];
                if (mul < lowest[1]) {
                    lowest = [r, mul];
                }
            })

            stats.damage_type = lowest[0];
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Vengeance": [
        function(user, spell, stats) {
            let resists = user.get_damage_mults();

            let highest = [null, Number.NEGATIVE_INFINITY];
            Object.keys(resists).forEach(r => {
                let mul = resists[r];
                if (mul > highest[1]) {
                    highest = [r, mul];
                }
            })

            stats.damage_type = highest[0];
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Affinity Attunement": [
        function(user, spell, stats) {
            let chosen_typ = null;

            let dmg_typ_strings = Object.keys(DmgType);

            user.affinities.forEach(aff => {
                if (!chosen_typ) {
                    if (dmg_typ_strings.includes(aff)) {
                        chosen_typ = DmgType[aff]
                    }
                }
            })

            stats.damage_type = chosen_typ
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Heavy Impact": [
        no_stats,
        no_target,
        no_hit,
        function(user, spell, stats, location) {
            let ent = game.board.get_pos(location);
            if (ent) {
                for (let i=0; i<2; i++) {
                    let push_dir = location.sub(spell.origin).normalized();

                    let new_pos = location.add(push_dir).round();

                    game.move_entity(ent, new_pos, false);
                }
            }
        }
    ],

    "Negative Space": [
        function(user, spell, stats) {
            stats.specials.push(SpellSpecials.NEGATIVESPACE)
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Reconversion": [
        no_stats,
        function(caster, spell, stats, position) {
            let ent = board.get_pos(position)
            if (ent && ent.id != game.player_ent.id) {
                let new_affinities = [];
                ent.affinities.forEach(aff => {
                    new_affinities.push(affinity_opposites[aff]);
                })

                ent.affinities = new_affinities;
            }
        },
        no_hit,
        no_tiles
    ],

    "Retarget: Self": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Self;
            stats.target_type = SpellTargeting.SelfTarget;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Enemy": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Enemy;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Ally": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Ally;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Weak": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Weak;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Strong": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Strong;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Native": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Native;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Pushback": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Pushback;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Magnetism": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Magnetism;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Compact": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Compact;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Sparse": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Sparse;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Retarget: Mysterious": [
        function(user, spell, stats) {
            stats.retarget = RetargetType.Mysterious;
        },
        no_target,
        no_hit,
        no_tiles
    ],

    "Spell Transference": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Arcane Echo": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Spreading Arcana": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Purity": [
        no_stats,
        no_target,
        no_hit,
        no_tiles
    ],

    "Unresolved Spell": [
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