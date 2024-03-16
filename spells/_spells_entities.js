entity_templates = [
    new EntityTemplate(
        "Player", "@=", "#0cf", "It's you.",
        100, 250, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Player"],
        entities_specials["Player"],
        "None",
        0, false, false, 
    ),

    new EntityTemplate(
        "test enemy", "Gg", "#0f0", "idk goblin or smt",
        100, 10, [
            Affinity.Ice,
            Affinity.Insect,
            Affinity.Living
        ], 15, -1,
        entities_spells["test enemy"],
        entities_specials["test enemy"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "big guy", "#+", "#f00", "scary guy who tests the description line wrapping too. really long text",
        500, 9999, [
            Affinity.Fire,
            Affinity.Ice,
            Affinity.Lightning
        ], 2500, -1,
        entities_spells["big guy"],
        entities_specials["big guy"],
        "None",
        0, false, false, 
    ),

    new EntityTemplate(
        "Fuckn GUy", "G#", "#480", "Stupid idiot",
        150, 250, [
            Affinity.Dark,
            Affinity.Demon
        ], 0, -1,
        entities_spells["Fuckn GUy"],
        entities_specials["Fuckn GUy"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Wall", "[]", "#ccc", "Just a wall.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Wall"],
        entities_specials["Wall"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Goblin", "G.", "#3d3", "You didn't start the interdimensional goblin combat. But you will end it.",
        50, 0, [
            Affinity.Living
        ], 10, 10,
        entities_spells["Goblin"],
        entities_specials["Goblin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Hobgoblin", "G+", "#3a3", "Marginally stronger than a normal goblin. Measures up to about half your height.",
        75, 0, [
            Affinity.Living
        ], 15, 35,
        entities_spells["Hobgoblin"],
        entities_specials["Hobgoblin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Gobbo", "G'", "#fc3", "An absolutely tiny specimen with a piercing voice entirely unbecoming of its stature.",
        20, 0, [
            Affinity.Living,
            Affinity.Chaos
        ], 7, 20,
        entities_spells["Gobbo"],
        entities_specials["Gobbo"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Gremlin", "g.", "#080", "While not technically goblins, gremlins and goblins live as one and the same.",
        35, 0, [
            Affinity.Living
        ], 7, 7,
        entities_spells["Gremlin"],
        entities_specials["Gremlin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Alpha Goblin", "G#", "#3f3", "The best of the bunch. Only goblins in peak condition could ever hope to become an Alpha.",
        100, 0, [
            Affinity.Living
        ], 25, 70,
        entities_spells["Alpha Goblin"],
        entities_specials["Alpha Goblin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Flaming Goblin", "G\"", "#d33", "The mechanism by which these goblins remain alight remains a mystery to goblinologists to this day.",
        60, 0, [
            Affinity.Living,
            Affinity.Fire
        ], 20, 80,
        entities_spells["Flaming Goblin"],
        entities_specials["Flaming Goblin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Esper Goblin", "G=", "#d9d", "Dealing with goblins sounded fine until they developed the ability to cast Mind Spike.",
        150, 50, [
            Affinity.Living,
            Affinity.Arcane
        ], 50, 120,
        entities_spells["Esper Goblin"],
        entities_specials["Esper Goblin"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Static Goblin", "G;", "#ff0", "Delivering static shocks at will is a much more formidable power than it appears.",
        80, 20, [
            Affinity.Living,
            Affinity.Lightning
        ], 30, 90,
        entities_spells["Static Goblin"],
        entities_specials["Static Goblin"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Possessed Bat", "Bd", "#a4f", "A regular bat posessed by forces beyond this world. Said forces will burst out when the bat dies.",
        15, 15, [
            Affinity.Living,
            Affinity.Dark
        ], 9, 75,
        entities_spells["Possessed Bat"],
        entities_specials["Possessed Bat"],
        "None",
        1, false, false, [
            {name: "Restless Spirit", cnt: 1},
            {name: "Ghost", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Goblin War Machine", "]G", "#898", "A terrifying construct made from hewn together junk, piloted by a crack team of two Alpha goblins.",
        250, 50, [
            Affinity.Construct
        ], 100, 250,
        entities_spells["Goblin War Machine"],
        entities_specials["Goblin War Machine"],
        "None",
        1, false, false, [
            {name: "Alpha Goblin", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Goblin Gear", "@G", "#9a9", "The most advanced war machine ever created by goblinkind, piloted by an Esper Goblin capable of directing it telepathically.",
        700, 100, [
            Affinity.Construct
        ], 250, 1000,
        entities_spells["Goblin Gear"],
        entities_specials["Goblin Gear"],
        "None",
        2, false, false, [
            {name: "Esper Goblin", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Giant Goblin", "G!", "#3d3", "Through some aberration of nature, goblins can reach towering heights of two metres or more.",
        150, 0, [
            Affinity.Living
        ], 40, 200,
        entities_spells["Giant Goblin"],
        entities_specials["Giant Goblin"],
        "Regenerates 5 HP per turn.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Titanic Goblin", "GG", "#3d3", "Due to their high susceptibility to magic, goblins in the vicinity of huge magical outflows can become truly gigantic beasts.",
        500, 0, [
            Affinity.Living
        ], 120, 700,
        entities_spells["Titanic Goblin"],
        entities_specials["Titanic Goblin"],
        "Regenerates 12 HP per turn.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bat", "b^", "#84f", "Annoying flappy things with a nasty bite.",
        30, 0, [
            Affinity.Living,
            Affinity.Dark
        ], 5, 10,
        entities_spells["Bat"],
        entities_specials["Bat"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Bat", "B^", "#84f", "Bats should not be this big.",
        120, 0, [
            Affinity.Living,
            Affinity.Dark
        ], 30, 70,
        entities_spells["Giant Bat"],
        entities_specials["Giant Bat"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghost", "o-", "#ddd", "The spirit of one who has already died, unable to pass away from the world.",
        10, 0, [
            Affinity.Ghost
        ], 3, 6,
        entities_spells["Ghost"],
        entities_specials["Ghost"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Vengeful Ghost", "o!", "#f77", "When a being dies with great hatred in their heart, they may refuse to pass on and instead exact vengeance on the living.",
        60, 25, [
            Affinity.Ghost,
            Affinity.Dark
        ], 48, 70,
        entities_spells["Vengeful Ghost"],
        entities_specials["Vengeful Ghost"],
        "Deals 2 Dark damage every turn to adjacent units.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Wraith", "O.", "#444", "If a ghost remains near dark energy sources long enough, they can regain a semblance of corporeality.",
        80, 20, [
            Affinity.Ghost,
            Affinity.Undead,
            Affinity.Dark
        ], 40, 60,
        entities_spells["Wraith"],
        entities_specials["Wraith"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Spirit Amalgam", "oO", "#ddd", "Often found around areas of great conflict, spirits may amalgamate into a single being before they are able to congeal into ghosts.",
        60, 60, [
            Affinity.Ghost
        ], 12, 60,
        entities_spells["Spirit Amalgam"],
        entities_specials["Spirit Amalgam"],
        "None",
        1, false, false, [
            {name: "Ghost", cnt: 4}
        ]
    ),

    new EntityTemplate(
        "Bucket of Ghosts", "[o", "#fff", "If you ask too many questions, you won't like the answers. Just kill it.",
        160, 0, [
            Affinity.Ghost,
            Affinity.Construct
        ], 10, 250,
        entities_spells["Bucket of Ghosts"],
        entities_specials["Bucket of Ghosts"],
        "None",
        1, false, false, [
            {name: "Ghost", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Ghost Ghost", "0O", "#ddd", "Even ghosts may die, after all.",
        100, 50, [
            Affinity.Ghost,
            Affinity.Ghost
        ], 20, 50,
        entities_spells["Ghost Ghost"],
        entities_specials["Ghost Ghost"],
        "None",
        1, false, false, [
            {name: "Ghost", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Demonic Spirit", "$o", "#e33", "Souls claimed by demons can retain this taint even through death of the body.",
        60, 40, [
            Affinity.Ghost,
            Affinity.Demon
        ], 30, 120,
        entities_spells["Demonic Spirit"],
        entities_specials["Demonic Spirit"],
        "If alive for 16 turns, explodes in a 3 tile burst for 16 Fire damage. (Turns remaining: [[explosion_turns_left]])",
        1, false, false, 
    ),

    new EntityTemplate(
        "Spirit Caller", "O<", "#c77", "Through mysticism and a little magic, some mages can commune with, or even bring back, spirits of the departed.",
        80, 200, [
            Affinity.Living,
            Affinity.Dark
        ], 60, 140,
        entities_spells["Spirit Caller"],
        entities_specials["Spirit Caller"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Spirit", "\"\"\"S\"", "#d33", "More a force of nature than a spirit, these beings have just one goal: to burn away everything around them.",
        60, 50, [
            Affinity.Fire
        ], 30, 80,
        entities_spells["Fire Spirit"],
        entities_specials["Fire Spirit"],
        "If witnessing any Fire damage, heals 2 HP.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Demon", "$d", "#f00", "Demons generally have a natural affinity to a single element. Can you guess this one's affinity?",
        200, 100, [
            Affinity.Demon,
            Affinity.Fire
        ], 120, 260,
        entities_spells["Fire Demon"],
        entities_specials["Fire Demon"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Flame Golem", "#\"", "#d33", "Likely created long ago by an unknown artificer, the patchwork rocky exoskeleton of these golems is filled with a roaring fire.",
        160, 40, [
            Affinity.Fire,
            Affinity.Construct
        ], 70, 220,
        entities_spells["Flame Golem"],
        entities_specials["Flame Golem"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Flame Portal", "()", "#e00", "Small-scale dimensional disturbances that can spit all manner of flame denizens from inside them.",
        300, 0, [
            Affinity.Fire,
            Affinity.Construct
        ], 120, 400,
        entities_spells["Flame Portal"],
        entities_specials["Flame Portal"],
        "None",
        4, false, false, 
    ),

    new EntityTemplate(
        "Crazed Fire Demon", "$D", "#f08", "Similarly to a typical mage, if a demon attempts to channel too much energy, they may be overwhelmed by its intensity and reshaped into a new, primal form.",
        600, 200, [
            Affinity.Demon,
            Affinity.Fire
        ], 200, 600,
        entities_spells["Crazed Fire Demon"],
        entities_specials["Crazed Fire Demon"],
        "If witnessing any Fire damage, gains 5 Shield.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Flame Rift", "<>", "#e00", "Jagged tears in reality spouting endless roaring flames... and monsters.",
        1000, 0, [
            Affinity.Fire,
            Affinity.Construct
        ], 250, 1000,
        entities_spells["Flame Rift"],
        entities_specials["Flame Rift"],
        "None",
        4, false, false, 
    ),

    new EntityTemplate(
        "Firebug", ".,", "#a00", "Mostly harmless, but their red-hot mandibles are not to be underestimated in swarms.",
        12, 0, [
            Affinity.Living,
            Affinity.Fire,
            Affinity.Insect
        ], 1, 2,
        entities_spells["Firebug"],
        entities_specials["Firebug"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Firebug Broodmother", "B,", "#c00", "The breeding cycle of firebugs is not well-studied, mostly due to the fact that broodmothers are well-armoured, aggressive and almost always surrounded by swarms of young.",
        1200, 100, [
            Affinity.Living,
            Affinity.Fire,
            Affinity.Insect
        ], 280, 1000,
        entities_spells["Firebug Broodmother"],
        entities_specials["Firebug Broodmother"],
        "Summons a Firebug on an adjacent empty tile every turn.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Goblin Fire Mage", "G~", "#f60", "You thought only humans could use magic?",
        120, 100, [
            Affinity.Living
        ], 80, 140,
        entities_spells["Goblin Fire Mage"],
        entities_specials["Goblin Fire Mage"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Ice Spirit", ">S", "#aff", "Amalgamations of frigid energy, willing and eager to turn you into an icicle.",
        75, 70, [
            Affinity.Ice
        ], 30, 60,
        entities_spells["Ice Spirit"],
        entities_specials["Ice Spirit"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Chilling Totem", "n|", "#8bb", "Totems seem to appear in response to conflict. You seem to be evidence of this.",
        80, 0, [
            Affinity.Ice,
            Affinity.Construct
        ], 25, 75,
        entities_spells["Chilling Totem"],
        entities_specials["Chilling Totem"],
        "Deals 2 Ice damage per turn to all units within 2 tiles.",
        4, false, false, 
    ),

    new EntityTemplate(
        "Frozen Totem", "N|", "#8dd", "Frozen totems are more powerful than their chilling variants, being able to freeze any would-be assailants solid.",
        240, 0, [
            Affinity.Ice,
            Affinity.Construct
        ], 120, 300,
        entities_spells["Frozen Totem"],
        entities_specials["Frozen Totem"],
        "Deals 6 Ice damage per turn to all units within 2 tiles.",
        4, false, false, 
    ),

    new EntityTemplate(
        "Polar Bear", "B*", "#aff", "Every bit as powerful and hungry as its reputation.",
        300, 0, [
            Affinity.Living,
            Affinity.Ice
        ], 80, 200,
        entities_spells["Polar Bear"],
        entities_specials["Polar Bear"],
        "Heals 25 HP per turn while Frozen.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Undead Viking Spearman", "V-", "#dff", "Many a ship has sunk in these waters. Well-preserved in ice, they have waited for your arrival.",
        80, 25, [
            Affinity.Undead,
            Affinity.Ice
        ], 30, 60,
        entities_spells["Undead Viking Spearman"],
        entities_specials["Undead Viking Spearman"],
        "Immune to Frozen.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Frozen Ghost", "o>", "#bdd", "Ghosts are especially malleable when it comes to magical energy, moulded into specific elements by their surroundings.",
        25, 80, [
            Affinity.Ghost,
            Affinity.Ice
        ], 16, 40,
        entities_spells["Frozen Ghost"],
        entities_specials["Frozen Ghost"],
        "Immune to Frozen.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Demon", "$i", "#fdf", "Demons with an affinity to Ice can learn its magic just as well as any other.",
        200, 100, [
            Affinity.Demon,
            Affinity.Ice
        ], 120, 260,
        entities_spells["Ice Demon"],
        entities_specials["Ice Demon"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Undead Viking Bowman", "V}", "#dff", "Somehow, even after centuries entombed in frost, their bowstrings work just as well.",
        60, 25, [
            Affinity.Undead,
            Affinity.Ice
        ], 30, 60,
        entities_spells["Undead Viking Bowman"],
        entities_specials["Undead Viking Bowman"],
        "Immune to Frozen.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Lightning Spirit", "&S", "#ff3", "Crackling with power, just waiting for a victim to draw near.",
        50, 100, [
            Affinity.Lightning
        ], 30, 60,
        entities_spells["Lightning Spirit"],
        entities_specials["Lightning Spirit"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Spark Wraith", "W&", "#cc2", "Absorbing enough dark and lightning energy can empower a ghost into a creature of legend.",
        180, 200, [
            Affinity.Lightning,
            Affinity.Ghost,
            Affinity.Dark
        ], 160, 400,
        entities_spells["Spark Wraith"],
        entities_specials["Spark Wraith"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Charged Golem", "&]", "#cc7", "Metal plates and rods embedded into solid stone, held together by crackling arcs of electricity.",
        220, 140, [
            Affinity.Lightning,
            Affinity.Construct
        ], 80, 240,
        entities_spells["Charged Golem"],
        entities_specials["Charged Golem"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Amphibious Eel", "~&", "#ce2", "It's \"a slight annoyance\" until it delivers a deadly shock straight into your chest.",
        40, 40, [
            Affinity.Living,
            Affinity.Lightning
        ], 12, 40,
        entities_spells["Amphibious Eel"],
        entities_specials["Amphibious Eel"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Goblin Stormcrafter", "G&", "#cd5", "Don't be fooled by the ritual garb and mysticism. This is very real magic.",
        120, 160, [
            Affinity.Living
        ], 80, 140,
        entities_spells["Goblin Stormcrafter"],
        entities_specials["Goblin Stormcrafter"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Arcane Aberration", "$%", "#f49", "A twisting, formless blob of arcane power, given a strange kind of intelligence through its immense complexity.",
        240, 200, [
            Affinity.Arcane,
            Affinity.Chaos
        ], 100, 140,
        entities_spells["Arcane Aberration"],
        entities_specials["Arcane Aberration"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Living Wand", "=@", "#fac", "Wands may, over time, become saturated with magic and gain a form of intelligence. They generally do not appreciate their prior treatment.",
        50, 120, [
            Affinity.Arcane
        ], 30, 40,
        entities_spells["Living Wand"],
        entities_specials["Living Wand"],
        "Every time this entity casts a spell, it will replace that with a new spell made up of 1-3 Common fragments.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Magishroom", "|>", "#8f9", "A walking, magical mushroom, having absorbed enough arcane energy to cast its own spells.",
        40, 40, [
            Affinity.Natural,
            Affinity.Arcane
        ], 10, 15,
        entities_spells["Magishroom"],
        entities_specials["Magishroom"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Giant Magishroom", "|]", "#8f9", "Magishrooms can grow big. Very big.",
        250, 300, [
            Affinity.Natural,
            Affinity.Arcane
        ], 100, 140,
        entities_spells["Giant Magishroom"],
        entities_specials["Giant Magishroom"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Demonic Arcanist", "D=", "#f26", "Demons are able to develop a direct affinity to mana itself. This has a very different effect to elemental affinity, instead allowing the demon to cast varied magics.",
        150, 200, [
            Affinity.Demon,
            Affinity.Arcane
        ], 120, 200,
        entities_spells["Demonic Arcanist"],
        entities_specials["Demonic Arcanist"],
        "Every time this entity casts a spell, it will replace that with a new spell made up of 2-4 Common or Uncommon fragments.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Possessed Wand", "=$", "#f8c", "Like all things, wands may also be chosen as vessels for ghostly presences.",
        80, 120, [
            Affinity.Arcane,
            Affinity.Ghost
        ], 30, 50,
        entities_spells["Possessed Wand"],
        entities_specials["Possessed Wand"],
        "Every time this entity casts a spell, it will replace that with a new spell made up of 1-3 Common fragments.",
        1, false, false, [
            {name: "Ghost", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Arcane Spirit", "]S", "#f49", "Magic is just as much a force of nature as fire or lightning - its manifestations also just as potent.",
        50, 60, [
            Affinity.Arcane
        ], 30, 50,
        entities_spells["Arcane Spirit"],
        entities_specials["Arcane Spirit"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Posessed Armour", "U;", "#aaa", "For reasons unknown, ghosts are drawn to unworn sets of armour. Some suggest it may be because of their similarity to human forms.",
        120, 0, [
            Affinity.Ghost,
            Affinity.Construct
        ], 25, 40,
        entities_spells["Posessed Armour"],
        entities_specials["Posessed Armour"],
        "None",
        1, false, false, [
            {name: "Ghost", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Ghost Ghost Ghost", "00", "#ddd", "Ghosts of ghosts may still die, after all!",
        240, 80, [
            Affinity.Ghost,
            Affinity.Ghost,
            Affinity.Ghost
        ], 30, 100,
        entities_spells["Ghost Ghost Ghost"],
        entities_specials["Ghost Ghost Ghost"],
        "None",
        1, false, false, [
            {name: "Ghost Ghost", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Revenant", "0!", "#888", "Often the byproducts of dark rituals, revenants form when latent echoes of dark magic meld with the vengeful death throes of human sacrifices.",
        90, 60, [
            Affinity.Dark,
            Affinity.Ghost
        ], 50, 120,
        entities_spells["Revenant"],
        entities_specials["Revenant"],
        "If this entity would take damage of a type it is not weak against, it instead takes no damage.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Restless Spirit", "!o", "#a8a", "Some spirits are more driven than most, not content to simply drift with the tides of undeath.",
        20, 0, [
            Affinity.Ghost
        ], 5, 8,
        entities_spells["Restless Spirit"],
        entities_specials["Restless Spirit"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghastly Horseman", "Ho", "#fbb", "It is said that when the time comes again for one who has cheated death, the horsemen ensure they do not escape a second time.",
        200, 100, [
            Affinity.Dark,
            Affinity.Undead
        ], 150, 350,
        entities_spells["Ghastly Horseman"],
        entities_specials["Ghastly Horseman"],
        "Can move twice in a single turn.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Fallen Knight", "Kv", "#faa", "A devoted knight serving a long-dead liege, still as stalwart in their mission as they were the day they pledged fealty.",
        120, 0, [
            Affinity.Undead,
            Affinity.Order
        ], 70, 120,
        entities_spells["Fallen Knight"],
        entities_specials["Fallen Knight"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Angel of Fire", "a\"", "#e82", "Angel magic is based on fealty. These angels devote themselves to the fiery wrath of the heavens.",
        300, 200, [
            Affinity.Holy,
            Affinity.Fire
        ], 140, 200,
        entities_spells["Angel of Fire"],
        entities_specials["Angel of Fire"],
        "Deals 3 Fire damage every turn to adjacent enemy units.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Angel of Lightning", "a&", "#dd3", "Angel magic is based on devotion. These angels channel bolts of cleansing lightning from the heavens to the mortal plane.",
        300, 200, [
            Affinity.Holy,
            Affinity.Lightning
        ], 140, 200,
        entities_spells["Angel of Lightning"],
        entities_specials["Angel of Lightning"],
        "If witnessing any Lightning damage, restores 10 HP.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Angel of Judgement", "a*", "#ffa", "Angel magic is based on purity. These angels consecrate the ground with bursts of holy energy.",
        500, 300, [
            Affinity.Holy
        ], 180, 300,
        entities_spells["Angel of Judgement"],
        entities_specials["Angel of Judgement"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "High Angel of Fire", "A\"", "#f70", "High angels command armies of lesser angels, blessed with greater power.",
        1000, 400, [
            Affinity.Holy,
            Affinity.Fire
        ], 320, 800,
        entities_spells["High Angel of Fire"],
        entities_specials["High Angel of Fire"],
        "If witnessing any Fire damage, restores 20 MP. Deals 5 Fire damage every turn to adjacent enemy units.",
        2, false, false, 
    ),

    new EntityTemplate(
        "High Angel of Lightning", "A&", "#ff3", "High angels command great armies of lesser angels, blessed with greater power.",
        1000, 400, [
            Affinity.Holy,
            Affinity.Lightning
        ], 320, 800,
        entities_spells["High Angel of Lightning"],
        entities_specials["High Angel of Lightning"],
        "If witnessing any Lightning damage, restores 25 MP and 10 HP.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Archangel", "A*", "#ffa", "Commanding armies of high angels and overwhelming power alike, these warleaders are sent to combat only in the direst of circumstances.",
        2000, 800, [
            Affinity.Holy
        ], 600, 2000,
        entities_spells["Archangel"],
        entities_specials["Archangel"],
        "None",
        2, false, false, [
            {name: "Holy Avatar", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Holy Avatar", "!A", "#ffa", "With their final breath, Archangels will willingly let themselves be consumed by the power that sustains them, giving their lives such that their enemy may be defeated.",
        1, 1000, [
            Affinity.Holy
        ], 400, -1,
        entities_spells["Holy Avatar"],
        entities_specials["Holy Avatar"],
        "Any damage this entity takes first removes MP before removing HP.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Priest", "p!", "#ffd", "Agents of the faith. Not quite mortal, but nowhere near angel.",
        60, 120, [
            Affinity.Living,
            Affinity.Holy
        ], 40, 70,
        entities_spells["Priest"],
        entities_specials["Priest"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Idol", "[*", "#ffd", "False or not, the people's hopes have given it power.",
        50, 0, [
            Affinity.Holy,
            Affinity.Construct
        ], 20, 60,
        entities_spells["Idol"],
        entities_specials["Idol"],
        "Holy entities within line of sight heal 10 HP per turn. Dark entities within line of sight take 6 Holy damage per turn.",
        4, false, false, 
    ),

    new EntityTemplate(
        "Doomsayer", "v!", "#f70", "Sometimes, a priest can become so enamoured with their holy status that they begin to ardently believe themselves to be prophets. Soon they find their power stemming not from heaven but instead from chaos within.",
        100, 160, [
            Affinity.Living,
            Affinity.Chaos
        ], 25, 40,
        entities_spells["Doomsayer"],
        entities_specials["Doomsayer"],
        "Explodes in a 2 tile burst for 10 Chaos damage on death.",
        2, false, false, 
    ),

    new EntityTemplate(
        "High Priest", "P!", "#ffa", "Trusted agents of the faith. Probably on first-name terms with at least one angel.",
        200, 400, [
            Affinity.Living,
            Affinity.Holy
        ], 60, 140,
        entities_spells["High Priest"],
        entities_specials["High Priest"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Necromancer", "N,", "#92c", "Mastery over life and death isn't so difficult, really. The hard part is staying alive yourself afterwards.",
        50, 300, [
            Affinity.Living,
            Affinity.Dark
        ], 40, 100,
        entities_spells["Necromancer"],
        entities_specials["Necromancer"],
        "Heals all Dark and Undead units within 3 tiles by 8 HP per turn.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Thrall", "v>", "#44c", "Typical footsoldier of a necromancer. Usually just as fragile as their masters.",
        30, 0, [
            Affinity.Dark,
            Affinity.Undead
        ], 8, 12,
        entities_spells["Thrall"],
        entities_specials["Thrall"],
        "Heals from Dark damage.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Tormentor", "@(", "#62a", "Weak and unremarkable manifestations of dark energy. Most commonly found knocking things off tables or making hinges squeak.",
        16, 20, [
            Affinity.Dark
        ], 5, 8,
        entities_spells["Tormentor"],
        entities_specials["Tormentor"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Dark Spirit", "@S", "#62a", "Unlike the elemental forces, dark has no true opposite. Spirits of darkness are instead led mostly by a compulsion to engulf and destroy everything around them.",
        80, 60, [
            Affinity.Dark
        ], 35, 60,
        entities_spells["Dark Spirit"],
        entities_specials["Dark Spirit"],
        "Heals an equal amount to all damage it causes.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Malicious Force", "#>", "#93b", "Whether from a vengeful wizard, a spiteful dying wish or a hateful curse, malicious forces are the result of negative emotions given power.",
        30, 100, [
            Affinity.Dark
        ], 40, 70,
        entities_spells["Malicious Force"],
        entities_specials["Malicious Force"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Crow", "c~", "#84f", "Crows are agile and very intelligent. They and the forces of darkness have a truce of sorts.",
        45, 0, [
            Affinity.Living,
            Affinity.Dark
        ], 7, 14,
        entities_spells["Crow"],
        entities_specials["Crow"],
        "None",
        2, false, false, 
    ),

    new EntityTemplate(
        "Corvid Abomination", "C~", "#84f", "The forces of darkness never promised they would leave the crows untouched, just unharmed.",
        240, 40, [
            Affinity.Living,
            Affinity.Dark
        ], 60, 150,
        entities_spells["Corvid Abomination"],
        entities_specials["Corvid Abomination"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Flesh Golem", "F]", "#c4f", "Necromancers soon tire of playing with single corpses. It's much more fun to graft two or three together.",
        180, 0, [
            Affinity.Construct,
            Affinity.Undead
        ], 80, 200,
        entities_spells["Flesh Golem"],
        entities_specials["Flesh Golem"],
        "Gains 5 max HP when witnessing the death of any Living entity.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Experiment", "&]", "#c4f", "A bear rib here, a lion skull there... and why not include some eagle wings too?",
        600, 0, [
            Affinity.Construct,
            Affinity.Undead
        ], 200, 700,
        entities_spells["Experiment"],
        entities_specials["Experiment"],
        "Gains 25 max HP when witnessing the death of any Living entity.",
        1, false, false, 
    ),

    new EntityTemplate(
        "Grand Experiment", "$}", "#c4f", "The longer a necromancer lives, the more lives must be defiled to entertain them. These grotesque constructions can be made of over a hundred separate corpses.",
        1500, 0, [
            Affinity.Construct,
            Affinity.Undead
        ], 400, 1300,
        entities_spells["Grand Experiment"],
        entities_specials["Grand Experiment"],
        "Gains 50 max HP when witnessing the death of any Living entity.",
        1, false, false, [
            {name: "Experiment", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Imp", "i-", "#e33", "I'll be honest, I hate these things. Nothing more to say on the matter.",
        25, 60, [
            Affinity.Demon
        ], 0, -1,
        entities_spells["Imp"],
        entities_specials["Imp"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Imp", "i\"", "#f64", "Small. Loud. Annoying. Knows Fireball.",
        40, 60, [
            Affinity.Demon,
            Affinity.Fire
        ], 0, -1,
        entities_spells["Fire Imp"],
        entities_specials["Fire Imp"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Frost Imp", "i>", "#8bb", "Small. Loud. Annoying. Knows Ice Ball.",
        40, 60, [
            Affinity.Demon,
            Affinity.Ice
        ], 0, -1,
        entities_spells["Frost Imp"],
        entities_specials["Frost Imp"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Chaotic Imp", "i%", "#f30", "They're everywhere.",
        40, 60, [
            Affinity.Demon,
            Affinity.Chaos
        ], 0, -1,
        entities_spells["Chaotic Imp"],
        entities_specials["Chaotic Imp"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Primal Demon", "%D", "#e33", "A small subset of demons spend their entire lives sequestered away in their realm, such that they never develop an affinity to any element. Such demons end up surprisingly similar to humans, barring the overwhelming strength advantage.",
        500, 0, [
            Affinity.Demon
        ], 0, -1,
        entities_spells["Primal Demon"],
        entities_specials["Primal Demon"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Demon Mage", "%-", "#f33", "Of the demons who refuse to align to a specific element are those who use the added freedom to learn magic, just like a human.",
        160, 500, [
            Affinity.Demon
        ], 0, -1,
        entities_spells["Demon Mage"],
        entities_specials["Demon Mage"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Demon Wizard", "%=", "#f33", "Surprisingly enough, demons with no affinity are just about on a level playing field with any other magic user. Don't worry, though. This demon has been training for decades.",
        180, 800, [
            Affinity.Demon
        ], 0, -1,
        entities_spells["Demon Wizard"],
        entities_specials["Demon Wizard"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Brimstone Elemental", "R!", "#c00", "Elementals that form around volcanic eruptions command a special type of fire that burns stronger, longer and hotter than any other.",
        1, 1, [
            Affinity.Fire
        ], 0, -1,
        entities_spells["Brimstone Elemental"],
        entities_specials["Brimstone Elemental"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Brimstone Demon", "R$", "#c00", "It is no coincidence that demons often build strongholds around areas of strong volcanic activity.",
        1, 1, [
            Affinity.Demon,
            Affinity.Fire
        ], 0, -1,
        entities_spells["Brimstone Demon"],
        entities_specials["Brimstone Demon"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Shambler", "b,", "#bbb", "In areas of strong necromantic activity, dark power can seep into other surrounding corpses, creating mindless amalgamations of assorted bones.",
        1, 1, [
            Affinity.Construct,
            Affinity.Undead
        ], 0, -1,
        entities_spells["Bone Shambler"],
        entities_specials["Bone Shambler"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Construct", "b;", "#bbb", "When flesh does not satisfy a necromancer's needs, they can instead construct their servants from pure bone.",
        1, 1, [
            Affinity.Construct,
            Affinity.Undead
        ], 0, -1,
        entities_spells["Bone Construct"],
        entities_specials["Bone Construct"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Hulk", "B,", "#bbb", "Left unchecked, errant bone amalgamations can absorb more and more, aggressively attacking the living to gather even more material.",
        1, 1, [
            Affinity.Construct,
            Affinity.Undead
        ], 0, -1,
        entities_spells["Bone Hulk"],
        entities_specials["Bone Hulk"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Bone Construct", "B;", "#bbb", "Unlike flesh, bone can be much more easily arranged into effective constructions.",
        1, 1, [
            Affinity.Construct,
            Affinity.Undead
        ], 0, -1,
        entities_spells["Giant Bone Construct"],
        entities_specials["Giant Bone Construct"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Mistake", "$!", "#93a", "A terrifying amalgam of flesh, bone and magical energy. Though clearly a failed experiment of a dark wizard, the magic coursing through it still grants it immense strength.",
        1000, 0, [
            Affinity.Construct,
            Affinity.Dark,
            Affinity.Undead
        ], 300, 1200,
        entities_spells["Mistake"],
        entities_specials["Mistake"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Locust Swarm", ":;", "#3c3", "Each bug is tiny on its own. Unfortunately, there's never just one of them.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Locust Swarm"],
        entities_specials["Locust Swarm"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Beetle", "O\\", "#3c3", "Life energy accumulates in forests, twisting animals into larger and stronger forms.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Giant Beetle"],
        entities_specials["Giant Beetle"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Lamia", "/O", "#6d3", "A mythological creature with the body of a snake and the appetite of a dragon.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Lamia"],
        entities_specials["Lamia"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Frost Tiger", "Op", "#3dd", "Typical animals are also susceptible to magic. Entirely new species can be created by its influence.",
        1, 1, [
            Affinity.Living,
            Affinity.Ice
        ], 0, -1,
        entities_spells["Frost Tiger"],
        entities_specials["Frost Tiger"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Voidtouched Lion", "Oq", "#d8f", "While they may not cast spells in quite the same way, animals touched by pure magic can instinctively use it to much the same effect.",
        1, 1, [
            Affinity.Living,
            Affinity.Arcane
        ], 0, -1,
        entities_spells["Voidtouched Lion"],
        entities_specials["Voidtouched Lion"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Treant", "/D", "#a60", "Simple nature spirits that choose to possess young trees, supplanting their normal processes to use as a vessel.",
        1, 1, [
            Affinity.Natural
        ], 0, -1,
        entities_spells["Treant"],
        entities_specials["Treant"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Stumpy Walker", "F\\", "#a60", "Nature spirits make no distinction between living and dead trees. They can possess a fully grown oak just as well as a long-dead stump.",
        1, 1, [
            Affinity.Natural
        ], 0, -1,
        entities_spells["Stumpy Walker"],
        entities_specials["Stumpy Walker"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Flytrap", "FX", "#1a0", "Not hugely efficient at catching flies. Much better at catching wizards, though.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Flytrap"],
        entities_specials["Giant Flytrap"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Vine Lasher", "v/", "#1a0", "Usually parts of a much larger organism, vine lashers can grow great distances through subterranean root systems and act semi-autonomously.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Vine Lasher"],
        entities_specials["Vine Lasher"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Flower", "@\"", "#ca0", "The sun is also a source of fire energy. These plants have learned to use that.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fire Flower"],
        entities_specials["Fire Flower"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Posessed Sunflower", "@$", "#94f", "I almost feel sorry for the ghost that thought it was a good idea to choose a plant as its host.",
        1, 1, [
            Affinity.Living,
            Affinity.Dark
        ], 0, -1,
        entities_spells["Posessed Sunflower"],
        entities_specials["Posessed Sunflower"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Chimera", "H#", "#fa0", "An amalgamation of animals, most often used as an example of the dangers of life energy.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Chimera"],
        entities_specials["Chimera"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Minotaur", "#R", "#950", "Huge, hulking beasts bred by mages to act as more corporeal guards for their treasures.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Minotaur"],
        entities_specials["Minotaur"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Werewolf", "W}", "#aaa", "Bearers of a magical curse linked to the deity of the moon.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Werewolf"],
        entities_specials["Werewolf"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Basilisk", "Ib", "#3b3", "A mythical creature notable for its paralyzing gaze.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Basilisk"],
        entities_specials["Basilisk"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Kraken", "K~", "#99c", "Hideous, overgrown octopus-like creatures with a voracious appetite, stopped only by a need for water.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Kraken"],
        entities_specials["Kraken"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ogre", "o/", "#3c3", "Humanoid creatures, superior in all ways to humans aside from their affinity for magic.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ogre"],
        entities_specials["Ogre"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Ogre", "O/", "#3c3", "Due to their low control over magic, ogres are affected similarly to other beasts, growing to imposible sizes if exposed to arcane energy.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Ogre"],
        entities_specials["Giant Ogre"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Tiny Ogre", "./", "#3c3", "Understand that \"small\" does not mean \"harmless\".",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Tiny Ogre"],
        entities_specials["Tiny Ogre"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Gnome", ":.", "#2d2", "While they may look like living creatures, they are in fact manifestations of magical energy. Hence why they can teleport.",
        1, 1, [
            Affinity.Natural,
            Affinity.Arcane
        ], 0, -1,
        entities_spells["Gnome"],
        entities_specials["Gnome"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Hypergnome", "|.", "#0f0", "The average lifespan of a hypergnome is around one hour, and yet you still managed to run into one. Unlucky you.",
        1, 1, [
            Affinity.Natural,
            Affinity.Arcane
        ], 0, -1,
        entities_spells["Hypergnome"],
        entities_specials["Hypergnome"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Courser", "H=", "#a60", "In the society of centaurs, coursers are the largest and strongest, wielding heavy axes to overwhelm enemy ranks.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Courser"],
        entities_specials["Centaur Courser"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Bowman", "H}", "#a60", "Bowmen are highly respected in centaur culture - and highly effective in battle.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Bowman"],
        entities_specials["Centaur Bowman"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Spearman", "H-", "#a60", "In centaur culture, spears are considered holy, regal weapons, typically wielded only by royal guards.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Spearman"],
        entities_specials["Centaur Spearman"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Phoenix", "\\P", "#f63", "While they may only be distant cousins of the great birds of old, the modern Phoenix shares much with its ancestor - including the power of rebirth.",
        1, 1, [
            Affinity.Living,
            Affinity.Fire
        ], 0, -1,
        entities_spells["Phoenix"],
        entities_specials["Phoenix"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Phoenix", "\\P", "#aff", "In mortal peril, an Ice Phoenix is able to retreat into an impenetrable shell and fully restore its health in a matter of moments.",
        1, 1, [
            Affinity.Living,
            Affinity.Ice
        ], 0, -1,
        entities_spells["Ice Phoenix"],
        entities_specials["Ice Phoenix"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Hydra", "!/", "#6d6", "I understand it may be quite shocking to see one of these in the flesh. Please don't be alarmed. Also, please use fire. It can't regenerate if it's on fire.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Hydra"],
        entities_specials["Hydra"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Scorpion", "S_", "#d80", "Nature always finds a way to put the deadliest poisons in the smallest creatures.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Scorpion"],
        entities_specials["Scorpion"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Lightning Scorpion", "&_", "#fc0", "In the storm-swept mesas at the edge of the world, lightning energy is dense enough to penetrate even the smallest beings.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect,
            Affinity.Lightning
        ], 0, -1,
        entities_spells["Lightning Scorpion"],
        entities_specials["Lightning Scorpion"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Acidic Scorpion", "$_", "#ac0", "Acidic poison. About ten times as bad as normal poison. Give or take.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Acidic Scorpion"],
        entities_specials["Acidic Scorpion"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Towering Isopod", "#+", "#b90", "Some places provide the perfect evolutionary crucible to cultivate the strangest beings. These insects, around five times the size of a human, are an example.",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Towering Isopod"],
        entities_specials["Towering Isopod"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Mantis", "M}", "#3c3", "If there's one thing magical energy loves to do, it's \"making things bigger\".",
        1, 1, [
            Affinity.Living,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Giant Mantis"],
        entities_specials["Giant Mantis"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Chaotic Construct", "%]", "#e90", "A reality-defying construction made by some chaotic force long ago.",
        1, 1, [
            Affinity.Construct,
            Affinity.Chaos
        ], 0, -1,
        entities_spells["Chaotic Construct"],
        entities_specials["Chaotic Construct"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Dark Idol", "v]", "#93a", "A once-holy idol, corrupted by sin and neglect.",
        1, 1, [
            Affinity.Construct,
            Affinity.Dark
        ], 0, -1,
        entities_spells["Dark Idol"],
        entities_specials["Dark Idol"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Flesh Totem", "K]", "#d6f", "The sure sign of a necromancer. They often use these grotesque towers of fused flesh and bone to mark their territory.",
        1, 1, [
            Affinity.Construct,
            Affinity.Dark,
            Affinity.Undead
        ], 0, -1,
        entities_spells["Flesh Totem"],
        entities_specials["Flesh Totem"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bugbeast", "B|", "#1b1", "A towering entity comprised of many smaller swarm insects, all moving as one.",
        1, 1, [
            Affinity.Construct,
            Affinity.Insect
        ], 0, -1,
        entities_spells["Bugbeast"],
        entities_specials["Bugbeast"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Spider", "m^", "#84c", "A small but deadly insect that thrives on ambushes.",
        1, 1, [
            Affinity.Insect
        ], 0, -1,
        entities_spells["Spider"],
        entities_specials["Spider"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Spider", "M^", "#84c", "A spider that has grown to incredible size as a result of magical meddling.",
        1, 1, [
            Affinity.Insect
        ], 0, -1,
        entities_spells["Giant Spider"],
        entities_specials["Giant Spider"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Enemy Spider", "M%", "#F04031", "The giant enemy spider...",
        5000, 0, [
            Affinity.Construct,
            Affinity.Insect
        ], 500, 5000,
        entities_spells["Giant Enemy Spider"],
        entities_specials["Giant Enemy Spider"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Skeleton", "s#", "#ccc", "A haphazardly animated construct of various chunks of bone.",
        1, 1, [
            Affinity.Undead,
            Affinity.Dark
        ], 0, -1,
        entities_spells["Skeleton"],
        entities_specials["Skeleton"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Skeleton", "S#", "#ccc", "If in doubt, just add more bone!",
        1, 1, [
            Affinity.Undead
        ], 0, -1,
        entities_spells["Giant Skeleton"],
        entities_specials["Giant Skeleton"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Seraphim", "A^", "#ffa", "Greatly weakened by the travel between worlds. It still recognises you as its leader, though.",
        1, 1, [
            Affinity.Holy
        ], 0, -1,
        entities_spells["Seraphim"],
        entities_specials["Seraphim"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Rock Golem", "|.", "#dca", "Perfectly formed golems raised in service of the Order of Order.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Rock Golem"],
        entities_specials["Rock Golem"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Acolyte of Order", "c|", "#fda", "As lowly as they are, these acolytes are just as capable of performing the Incantations of Order.",
        1, 1, [
            Affinity.Living,
            Affinity.Order
        ], 0, -1,
        entities_spells["Acolyte of Order"],
        entities_specials["Acolyte of Order"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Rock Titan", "|]", "#dcd", "Titanic constructions of magically hewn stone, raised in service of the Order of Order.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Rock Titan"],
        entities_specials["Rock Titan"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Granite Titan", "|&", "#dcd", "Only to be fabricated by the most orderly of the Order of Order, their construction of pure granite grants them even greater strength.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Granite Titan"],
        entities_specials["Granite Titan"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Mud Titan", "|~", "#a66", "Created specifically to oppose demons of fire and chaos, the mud titan is a necessary evil for the Order of Order to employ.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Mud Titan"],
        entities_specials["Mud Titan"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Bronze Colossus", "|>", "#c73", "With enough devotion, a Wizard of the Order of Order can perform the same golemcraft rituals as lesser adherents using solid metal rather than rock.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Bronze Colossus"],
        entities_specials["Bronze Colossus"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Steel Colossus", "|#", "#ccd", "The apex of order. Only a Master of Order could hope to bend steel into such a form.",
        1, 1, [
            Affinity.Construct,
            Affinity.Order
        ], 0, -1,
        entities_spells["Steel Colossus"],
        entities_specials["Steel Colossus"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Faithful of Order", "f|", "#fda", "The last rank in the Order of Order one can achieve by study alone. Well-trained in sorceries and rituals alike.",
        1, 1, [
            Affinity.Living,
            Affinity.Order
        ], 0, -1,
        entities_spells["Faithful of Order"],
        entities_specials["Faithful of Order"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Wizard of Order", "w|", "#fda", "Wizards of Order are allowed access to the Order of Order's secret texts as thanks for their contributions. With them, they can become even more useful to the Order.",
        1, 1, [
            Affinity.Living,
            Affinity.Order
        ], 0, -1,
        entities_spells["Wizard of Order"],
        entities_specials["Wizard of Order"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "High Wizard of Order", "W|", "#fda", "Only a few High Wizards of Order are selected out of the Order of Order every year. They form the Council of Order.",
        1, 1, [
            Affinity.Living,
            Affinity.Order
        ], 0, -1,
        entities_spells["High Wizard of Order"],
        entities_specials["High Wizard of Order"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Master of Order", "M|", "#fda", "Masters of Order are those in the Order of Order who have achieved the feat of creating a perfect Steel Colossus. The Order of Order bows to their wisdom.",
        1, 1, [
            Affinity.Living,
            Affinity.Order
        ], 0, -1,
        entities_spells["Master of Order"],
        entities_specials["Master of Order"],
        "None",
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Wall", "[]", "#aff", "A wall made out of pure ice.",
        50, 0, [
            Affinity.Ice,
            Affinity.Construct
        ], 0, -1,
        entities_spells["Ice Wall"],
        entities_specials["Ice Wall"],
        "None",
        4, false, false, 
    ),

    new EntityTemplate(
        "Target Dummy", "@!", "#fff", "He doesn't mind if you hit him.",
        1000000, 1000, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Target Dummy"],
        entities_specials["Target Dummy"],
        "Heals to max HP every turn.",
        4, false, false, 
    ),

    new EntityTemplate(
        "Refticus", "@>", "#965", "Looks like a normal pigeon. Is probably a normal pigeon.",
        1000, 100, [
            Affinity.Living,
            Affinity.Chaos
        ], 1000, 5000,
        entities_spells["Refticus"],
        entities_specials["Refticus"],
        "Takes no damage except for Physical damage. Won't attack you if they are full HP.",
        2, false, false, 
    ),

    new EntityTemplate(
        "Castle Wall", "[]", "#ccc", "Probably used to be some kind of fortification, a long time ago.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Castle Wall"],
        entities_specials["Castle Wall"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Chasm", "vv", "#666", "A bottomless pit.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Chasm"],
        entities_specials["Chasm"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Corruption", "++", "#c4f", "You probably shouldn't step in this.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Dark
        ], 0, -1,
        entities_spells["Corruption"],
        entities_specials["Corruption"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Tree", "()", "#a70", "A normal tree.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Tree"],
        entities_specials["Tree"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Deep Water", "~~", "#28d", "Deep, murky water.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Deep Water"],
        entities_specials["Deep Water"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Rock Wall", "[]", "#b87", "A rough blockage made from rock.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Ice
        ], 0, -1,
        entities_spells["Rock Wall"],
        entities_specials["Rock Wall"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Magical Wall", "[]", "#f5a", "A magical forcefield.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Arcane
        ], 0, -1,
        entities_spells["Magical Wall"],
        entities_specials["Magical Wall"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Pile of Bones", "@@", "#ccc", "A towering pile of discarded bones.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Undead
        ], 0, -1,
        entities_spells["Pile of Bones"],
        entities_specials["Pile of Bones"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Cliff Edge", "</", "#da9", "The face of a sheer cliff.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Cliff Edge"],
        entities_specials["Cliff Edge"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Elevated Mesa", "..", "#da9", "The top of a flat mesa, far above you.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Elevated Mesa"],
        entities_specials["Elevated Mesa"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Icy Wall", "[]", "#aff", "A barrier of thick, hard ice.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Ice
        ], 0, -1,
        entities_spells["Icy Wall"],
        entities_specials["Icy Wall"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Magma", "~~", "#f50", "Boiling, churning magma.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Fire
        ], 0, -1,
        entities_spells["Magma"],
        entities_specials["Magma"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Obscured", "--", "#222", "You can't see anything here.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Obscured"],
        entities_specials["Obscured"],
        "None",
        999, true, true, 
    ),

    new EntityTemplate(
        "Solid Cloud", "00", "#dff", "Clouds so thick they block everything.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Solid Cloud"],
        entities_specials["Solid Cloud"],
        "None",
        999, true, true, 
    ),


]