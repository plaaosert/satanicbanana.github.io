entity_templates = [
    new EntityTemplate(
        "Player", "@=", "#0cf", "It's you.",
        100, 250, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Player"],
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
        0, false, false, 
    ),

    new EntityTemplate(
        "Fuckn GUy", "G#", "#480", "Stupid idiot",
        150, 250, [
            Affinity.Dark,
            Affinity.Demon
        ], 0, -1,
        entities_spells["Fuckn GUy"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Wall", "[]", "#ccc", "Just a wall.",
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, [
            Affinity.Construct
        ], 0, -1,
        entities_spells["Wall"],
        999, true, true, 
    ),

    new EntityTemplate(
        "Goblin", "G.", "#3d3", "You didn't start the interdimensional goblin combat. But you will end it.",
        50, 0, [
            Affinity.Living
        ], 10, 10,
        entities_spells["Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Hobgoblin", "G+", "#3a3", "Marginally stronger than a normal goblin. Measures up to about half your height.",
        75, 0, [
            Affinity.Living
        ], 15, 17,
        entities_spells["Hobgoblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Gobbo", "G'", "#fc3", "An absolutely tiny specimen with a piercing voice entirely unbecoming of its stature.",
        20, 0, [
            Affinity.Living,
            Affinity.Chaos
        ], 7, 12,
        entities_spells["Gobbo"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Gremlin", "g.", "#080", "While not technically goblins, gremlins and goblins live as one and the same.",
        35, 0, [
            Affinity.Living
        ], 7, 7,
        entities_spells["Gremlin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Alpha Goblin", "G#", "#3f3", "The best of the bunch. Only goblins in peak condition could ever hope to become an Alpha.",
        100, 0, [
            Affinity.Living
        ], 25, 30,
        entities_spells["Alpha Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flaming Goblin", "G\"", "#d33", "The mechanism by which these goblins remain alight remains a mystery to goblinologists to this day.",
        60, 0, [
            Affinity.Living,
            Affinity.Fire
        ], 20, 25,
        entities_spells["Flaming Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Esper Goblin", "G=", "#d9d", "Dealing with goblins sounded fine until they developed the ability to cast Mind Spike.",
        150, 50, [
            Affinity.Living,
            Affinity.Arcane
        ], 50, 60,
        entities_spells["Esper Goblin"],
        2, false, false, 
    ),

    new EntityTemplate(
        "Static Goblin", "G;", "#ff0", "Delivering static shocks at will is a much more formidable power than it appears.",
        80, 20, [
            Affinity.Living,
            Affinity.Lightning
        ], 30, 50,
        entities_spells["Static Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Possessed Bat", "Bd", "#a4f", "A regular bat posessed by forces beyond this world. Said forces will burst out when the bat dies.",
        15, 15, [
            Affinity.Living,
            Affinity.Demon
        ], 9, 30,
        entities_spells["Possessed Bat"],
        1, false, false, [
            {name: "Restless Spirit", cnt: 1},
            {name: "Ghost", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Goblin War Machine", "]G", "#898", "A terrifying construct made from hewn together junk, piloted by a crack team of two Alpha goblins.",
        250, 50, [
            Affinity.Construct
        ], 100, 200,
        entities_spells["Goblin War Machine"],
        1, false, false, [
            {name: "Alpha Goblin", cnt: 2}
        ]
    ),

    new EntityTemplate(
        "Goblin Gear", "@G", "#9a9", "The most advanced war machine ever created by goblinkind, piloted by an Esper Goblin capable of directing it telepathically.",
        700, 100, [
            Affinity.Construct
        ], 250, 500,
        entities_spells["Goblin Gear"],
        2, false, false, [
            {name: "Esper Goblin", cnt: 1}
        ]
    ),

    new EntityTemplate(
        "Giant Goblin", "G!", "#3d3", "Through some aberration of nature, goblins can reach towering heights of two metres or more.",
        150, 0, [
            Affinity.Living
        ], 40, 100,
        entities_spells["Giant Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Titanic Goblin", "GG", "#3d3", "Due to their high susceptibility to magic, goblins in the vicinity of huge magical outflows can become truly gigantic beasts.",
        500, 0, [
            Affinity.Living
        ], 120, 150,
        entities_spells["Titanic Goblin"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bat", "b^", "#84f", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bat"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Bat", "B^", "#84f", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Bat"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghost", "o-", "#ddd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ghost"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Vengeful Ghost", "o!", "#f77", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Vengeful Ghost"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Wraith", "O.", "#444", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Wraith"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Spirit Amalgam", "oO", "#ddd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Spirit Amalgam"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bucket of Ghosts", "[o", "#fff", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bucket of Ghosts"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghost Ghost", "0O", "#ddd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ghost Ghost"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Demonic Spirit", "$o", "#e33", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Demonic Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Spirit Caller", "O<", "#c77", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Spirit Caller"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Spirit", "\"S", "#d33", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fire Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Demon", "$d", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fire Demon"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flame Golem", "#\"", "#d33", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Flame Golem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flame Portal", "()", "#e00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Flame Portal"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Crazed Fire Demon", "$D", "#f08", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Crazed Fire Demon"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flame Rift", "<>", "#e00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Flame Rift"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Firebug", ".,", "#a00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Firebug"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Firebug Broodmother", "B,", "#c00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Firebug Broodmother"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Goblin Fire Mage", "G~", "#f60", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Goblin Fire Mage"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Spirit", ">S", "#aff", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ice Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Chilling Totem", "n|", "#8bb", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Chilling Totem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Frozen Totem", "N|", "#8dd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Frozen Totem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Polar Bear", "B*", "#aff", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Polar Bear"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Undead Viking Spearman", "V-", "#dff", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Undead Viking Spearman"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Frozen Ghost", "o>", "#bdd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Frozen Ghost"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Demon", "$i", "#fdf", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ice Demon"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Undead Viking Bowman", "V}", "#dff", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Undead Viking Bowman"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Lightning Spirit", "&S", "#ff3", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Lightning Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Spark Wraith", "W&", "#cc2", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Spark Wraith"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Charged Golem", "&]", "#cc7", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Charged Golem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Amphibious Eel", "~&", "#ce2", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Amphibious Eel"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Goblin Stormcrafter", "G&", "#cd5", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Goblin Stormcrafter"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Arcane Aberration", "$%", "#f49", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Arcane Aberration"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Living Wand", "=@", "#fac", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Living Wand"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Magishroom", "|>", "#8f9", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Magishroom"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Magishroom", "|]", "#8f9", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Magishroom"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Demonic Arcanist", "D=", "#f26", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Demonic Arcanist"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Possessed Wand", "=$", "#f8c", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Possessed Wand"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Arcane Spirit", "]S", "#f49", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Arcane Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Posessed Armour", "U;", "#aaa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Posessed Armour"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghost Ghost Ghost", "00", "#ddd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ghost Ghost Ghost"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Revenant", "0!", "#888", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Revenant"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Restless Spirit", "!o", "#a8a", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Restless Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ghastly Horseman", "Ho", "#fbb", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ghastly Horseman"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Fallen Knight", "Kv", "#faa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fallen Knight"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Angel of Fire", "a\"", "#e82", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Angel of Fire"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Angel of Lightning", "a&", "#dd3", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Angel of Lightning"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Angel of Judgement", "a*", "#ffa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Angel of Judgement"],
        1, false, false, 
    ),

    new EntityTemplate(
        "High Angel of Fire", "A\"", "#f70", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["High Angel of Fire"],
        1, false, false, 
    ),

    new EntityTemplate(
        "High Angel of Lightning", "A&", "#ff3", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["High Angel of Lightning"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Archangel", "A*", "#ffa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Archangel"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Holy Avatar", "!A", "#ffa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Holy Avatar"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Priest", "p!", "#ffd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Priest"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Idol", "[*", "#ffd", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Idol"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Doomsayer", "v!", "#f70", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Doomsayer"],
        1, false, false, 
    ),

    new EntityTemplate(
        "High Priest", "P!", "#ffa", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["High Priest"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Necromancer", "N,", "#92c", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Necromancer"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Thrall", "v>", "#44c", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Thrall"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Tormentor", "@(", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Tormentor"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Dark Spirit", "@S", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Dark Spirit"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Malicious Force", "#>", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Malicious Force"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Crow", "c~", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Crow"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Corvid Abomination", "C~", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Corvid Abomination"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flesh Golem", "F]", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Flesh Golem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Experiment", "&]", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Experiment"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Grand Experiment", "$}", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Grand Experiment"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Imp", "i-", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Imp"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Imp", "i\"", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fire Imp"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Frost Imp", "i>", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Frost Imp"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Chaotic Imp", "i%", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Chaotic Imp"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Primal Demon", "%D", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Primal Demon"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Demon Mage", "%-", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Demon Mage"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Demon Wizard", "%=", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Demon Wizard"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Brimstone Elemental", "R!", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Brimstone Elemental"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Brimstone Demon", "R$", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Brimstone Demon"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Shambler", "b,", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bone Shambler"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Construct", "b;", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bone Construct"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bone Hulk", "B,", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bone Hulk"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Bone Construct", "B;", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Bone Construct"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Mistake", "$!", "#93a", "A terrifying amalgam of flesh, bone and magical energy. Clearly a failed experiment of a dark wizard, but the magic coursing through it still grants it immense strength.",
        400, 0, [
            Affinity.Construct,
            Affinity.Dark,
            Affinity.Undead
        ], 800, 20000,
        entities_spells["Mistake"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Locust Swarm", ":;", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Locust Swarm"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Beetle", "O\\", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Beetle"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Lamia", "/O", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Lamia"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Frost Tiger", "Op", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Frost Tiger"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Voidtouched Lion", "Op", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Voidtouched Lion"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Treant", "/D", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Treant"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Stumpy Walker", "F\\", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Stumpy Walker"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Flytrap", "FX", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Flytrap"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Vine Lasher", "v/", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Vine Lasher"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Fire Flower", "@\"", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Fire Flower"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Posessed Sunflower", "@$", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Posessed Sunflower"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Chimera", "H#", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Chimera"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Minotaur", "#R", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Minotaur"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Werewolf", "W}", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Werewolf"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Basilisk", "Ib", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Basilisk"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Kraken", "K~", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Kraken"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ogre", "o/", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ogre"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Ogre", "O/", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Ogre"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Tiny Ogre", "./", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Tiny Ogre"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Gnome", ":.", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Gnome"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Hypergnome", "|.", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Hypergnome"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Courser", "H=", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Courser"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Bowman", "H}", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Bowman"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Centaur Spearman", "H-", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Centaur Spearman"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Phoenix", "\\P", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Phoenix"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Ice Phoenix", "\\P", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Ice Phoenix"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Hydra", "!/", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Hydra"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Scorpion", "S_", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Scorpion"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Lightning Scorpion", "&_", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Lightning Scorpion"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Acidic Scorpion", "$_", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Acidic Scorpion"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Towering Isopod", "#+", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Towering Isopod"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Mantis", "M}", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Giant Mantis"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Chaotic Construct", "%]", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Chaotic Construct"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Dark Idol", "v]", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Dark Idol"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Flesh Totem", "K]", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Flesh Totem"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Bugbeast", "B|", "#f00", "A towering entity comprised of many smaller swarm insects, all moving as one.",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Bugbeast"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Spider", "m^", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Insect
        ], 0, -1,
        entities_spells["Spider"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Spider", "M^", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Insect
        ], 0, -1,
        entities_spells["Giant Spider"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Giant Enemy Spider", "M%", "#F04031", "The giant enemy spider...",
        5000, 0, [
            Affinity.Construct,
            Affinity.Insect
        ], 2500, 10000,
        entities_spells["Giant Enemy Spider"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),

    new EntityTemplate(
        "Unnamed", "??", "#f00", "This entity is corrupted and should not be here!",
        1, 1, [
            Affinity.Living
        ], 0, -1,
        entities_spells["Unnamed"],
        1, false, false, 
    ),


]