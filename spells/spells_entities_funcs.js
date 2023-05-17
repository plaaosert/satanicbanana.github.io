entities_spells = {
    "Player": [
        // None
    ],

    "test enemy": [
        // Bite; 6 physical dmg; range 1
        enemy_melee_core("Bite", 6, DmgType.Physical)
    ],

    "big guy": [
        // None
    ],

    "Fuckn GUy": [
        // KIll You BOLT; damage plus i; lightning bolt
        enemy_spell_group(
            0, "KIll You BOLT", "#fe5", gen_spells(
                "damage plus i", "lightning bolt"
            )
        ),

        // EPXLODE; 40 holy dmg; line; range 40; trigger at target; 100 psychic dmg; burst radius 2; cooldown 8 turns
        enemy_spell_group(
            8, "EPXLODE", damage_type_cols[DmgType.Psychic], [
                core_spell(
                    "EPXLODE 1", "[]", SpellSubtype.Red, "#fff", "#f00",
                    "FIRES A STUPID EXPLOSIVE, DEALING 40 HOLY DAMAGE TO ALL ENEMIES ON ITS PATH BEFORE EXPLODING FOR 100 PSYCHIC DAMAGE IN A 2 TILE BURST",
                    40, DmgType.Holy, 40, 1, Shape.Line, 0
                ).set_trigger("at_target"),

                core_spell(
                    "EPXLODE 2", "##", SpellSubtype.Red, "#fff", "#f00", "",
                    100, DmgType.Psychic, 0, 2, Shape.Diamond, 0
                )
            ]
        )
    ],

    "Wall": [
        // None
    ],

    "Goblin": [
        // Bite; 6 physical dmg; range 1
        enemy_melee_core("Bite", 6, DmgType.Physical)
    ],

    "Hobgoblin": [
        // Claw; 7 physical dmg; range 1
        enemy_melee_core("Claw", 7, DmgType.Physical)
    ],

    "Gobbo": [
        // Scream; 4 chaos dmg; line; range 3
        simple_enemy_line_core(
            0, "Scream", "", "",
            4, DmgType.Chaos, 3, 0
        )
    ],

    "Gremlin": [
        // Bite; 5 physical dmg; range 1
        enemy_melee_core("Bite", 5, DmgType.Physical)
    ],

    "Alpha Goblin": [
        // Body Slam; 10 physical dmg; range 1
        enemy_melee_core("Body Slam", 10, DmgType.Physical),

        // Uppercut; 15 physical dmg; range 1; cooldown 4 turns
        enemy_melee_core("Uppercut", 15, DmgType.Physical, 4)
    ],

    "Flaming Goblin": [
        // Tackle; 8 fire dmg; range 1
        enemy_melee_core("Tackle", 8, DmgType.Physical),

        // Firebreathing; 4 fire dmg; cone; range 3
        simple_enemy_burst_core(
            0, "Firebreathing", "", "", 4, DmgType.Fire, 3, 3, 0, Shape.Cone
        )
    ],

    "Esper Goblin": [
        // Mind Spike; 12 psychic dmg; range 6; line; 15 MP
        simple_enemy_line_core(0, "Mind Spike", "", "", 12, DmgType.Psychic, 6, 15)
    ],

    "Static Goblin": [
        // Static Bolt; 8 lightning dmg; line; range 5; 5MP
        simple_enemy_line_core(0, "Static Bolt", "", "", 8, DmgType.Lightning, 5, 5),

        // Spark Burst; 16 lightning dmg; selftarget; burst; radius 4; 20MP
        enemy_spell_group(
            0, "Spark Burst", damage_type_cols[DmgType.Lightning], [
                core_spell(
                    "Spark Burst", "[]", SpellSubtype.Core, damage_type_cols[DmgType.Lightning],
                    "#000", "", 16, DmgType.Lightning, 4, 4, Shape.Diamond, 20, SpellTargeting.SelfTarget
                )
            ]
        )
    ],

    "Possessed Bat": [
        // Bite; 4 physical dmg; range 1
        enemy_melee_core("Bite", 4, DmgType.Physical),

        // Dark Bolt; 6 dark dmg; range 3; line; 5 MP
        simple_enemy_line_core(0, "Dark Bolt", "", "", 6, DmgType.Dark, 3, 5)
    ],

    "Goblin War Machine": [
        // Metal Bash; 10 physical dmg; range 1
        // Shrapnel Salvo; unc.multicast x4 => 6 phys line; range 6; 15 MP
        // Makeshift Gun; 14 physical dmg; line; range 10; 6 turn cooldown
    ],

    "Goblin Gear": [
        // Steel Strike; 18 physical dmg; range 1
        // Missile Salvo; unc.multicast x4 => 12 fire dmg radius 3 burst; range 6; 25 MP
        // Railcannon; 22 physical dmg; range 10; 50 MP; 3 turn cooldown
    ],

    "Giant Goblin": [
        // Crush; 14 physical dmg; range 1
    ],

    "Titanic Goblin": [
        // Crush; 30 physical dmg; range 1
    ],

    "Bat": [
        // None
    ],

    "Giant Bat": [
        // None
    ],

    "Ghost": [
        // None
    ],

    "Vengeful Ghost": [
        // None
    ],

    "Wraith": [
        // None
    ],

    "Spirit Amalgam": [
        // None
    ],

    "Bucket of Ghosts": [
        // None
    ],

    "Ghost Ghost": [
        // None
    ],

    "Demonic Spirit": [
        // None
    ],

    "Spirit Caller": [
        // None
    ],

    "Fire Spirit": [
        // None
    ],

    "Fire Demon": [
        // None
    ],

    "Flame Golem": [
        // None
    ],

    "Flame Portal": [
        // None
    ],

    "Crazed Fire Demon": [
        // None
    ],

    "Flame Rift": [
        // None
    ],

    "Firebug": [
        // None
    ],

    "Firebug Broodmother": [
        // None
    ],

    "Goblin Fire Mage": [
        // None
    ],

    "Ice Spirit": [
        // None
    ],

    "Chilling Totem": [
        // None
    ],

    "Frozen Totem": [
        // None
    ],

    "Polar Bear": [
        // None
    ],

    "Undead Viking Spearman": [
        // None
    ],

    "Frozen Ghost": [
        // None
    ],

    "Ice Demon": [
        // None
    ],

    "Undead Viking Bowman": [
        // None
    ],

    "Lightning Spirit": [
        // None
    ],

    "Spark Wraith": [
        // None
    ],

    "Charged Golem": [
        // None
    ],

    "Amphibious Eel": [
        // None
    ],

    "Goblin Stormcrafter": [
        // None
    ],

    "Arcane Aberration": [
        // None
    ],

    "Living Wand": [
        // None
    ],

    "Magishroom": [
        // None
    ],

    "Giant Magishroom": [
        // None
    ],

    "Demonic Arcanist": [
        // None
    ],

    "Possessed Wand": [
        // None
    ],

    "Arcane Spirit": [
        // None
    ],

    "Posessed Armour": [
        // None
    ],

    "Ghost Ghost Ghost": [
        // None
    ],

    "Revenant": [
        // None
    ],

    "Restless Spirit": [
        // None
    ],

    "Ghastly Horseman": [
        // None
    ],

    "Fallen Knight": [
        // None
    ],

    "Angel of Fire": [
        // None
    ],

    "Angel of Lightning": [
        // None
    ],

    "Angel of Judgement": [
        // None
    ],

    "High Angel of Fire": [
        // None
    ],

    "High Angel of Lightning": [
        // None
    ],

    "Archangel": [
        // None
    ],

    "Holy Avatar": [
        // None
    ],

    "Priest": [
        // None
    ],

    "Idol": [
        // None
    ],

    "Doomsayer": [
        // None
    ],

    "High Priest": [
        // None
    ],

    "Necromancer": [
        // None
    ],

    "Thrall": [
        // None
    ],

    "Tormentor": [
        // None
    ],

    "Dark Spirit": [
        // None
    ],

    "Malicious Force": [
        // None
    ],

    "Crow": [
        // None
    ],

    "Corvid Abomination": [
        // None
    ],

    "Flesh Golem": [
        // None
    ],

    "Experiment": [
        // None
    ],

    "Grand Experiment": [
        // None
    ],

    "Imp": [
        // None
    ],

    "Fire Imp": [
        // None
    ],

    "Frost Imp": [
        // None
    ],

    "Chaotic Imp": [
        // None
    ],

    "Primal Demon": [
        // None
    ],

    "Demon Mage": [
        // None
    ],

    "Demon Wizard": [
        // None
    ],

    "Brimstone Elemental": [
        // None
    ],

    "Brimstone Demon": [
        // None
    ],

    "Bone Shambler": [
        // None
    ],

    "Bone Construct": [
        // None
    ],

    "Bone Hulk": [
        // None
    ],

    "Giant Bone Construct": [
        // None
    ],

    "Mistake": [
        // Sweep; 40 physical dmg; range 1
        // Life Drain; 32 dark dmg; range 1; heals user by damage dealt
    ],

    "Locust Swarm": [
        // None
    ],

    "Giant Beetle": [
        // None
    ],

    "Lamia": [
        // None
    ],

    "Frost Tiger": [
        // None
    ],

    "Voidtouched Lion": [
        // None
    ],

    "Treant": [
        // None
    ],

    "Stumpy Walker": [
        // None
    ],

    "Giant Flytrap": [
        // None
    ],

    "Vine Lasher": [
        // None
    ],

    "Fire Flower": [
        // None
    ],

    "Posessed Sunflower": [
        // None
    ],

    "Chimera": [
        // None
    ],

    "Minotaur": [
        // None
    ],

    "Werewolf": [
        // None
    ],

    "Basilisk": [
        // None
    ],

    "Kraken": [
        // None
    ],

    "Ogre": [
        // None
    ],

    "Giant Ogre": [
        // None
    ],

    "Tiny Ogre": [
        // None
    ],

    "Gnome": [
        // None
    ],

    "Hypergnome": [
        // None
    ],

    "Centaur Courser": [
        // None
    ],

    "Centaur Bowman": [
        // None
    ],

    "Centaur Spearman": [
        // None
    ],

    "Phoenix": [
        // None
    ],

    "Ice Phoenix": [
        // None
    ],

    "Hydra": [
        // None
    ],

    "Scorpion": [
        // None
    ],

    "Lightning Scorpion": [
        // None
    ],

    "Acidic Scorpion": [
        // None
    ],

    "Towering Isopod": [
        // None
    ],

    "Giant Mantis": [
        // None
    ],

    "Chaotic Construct": [
        // None
    ],

    "Dark Idol": [
        // None
    ],

    "Flesh Totem": [
        // None
    ],

    "Bugbeast": [
        // None
    ],

    "Spider": [
        // None
    ],

    "Giant Spider": [
        // None
    ],

    "Giant Enemy Spider": [
        // Trample; 500 physical dmg; range 1
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],

    "Unnamed": [
        // None
    ],


}