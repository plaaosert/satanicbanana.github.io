with open("entities.tsv", "r") as f:
    content = f.read()
    tabs = content.split("	")

    # every 14th element will be delimited by a "\n" instead
    new_tabs = []
    for i in range(len(tabs)):
        if i % 14 == 0 and i != 0:
            pre, _, post = tabs[i].rpartition("\n")
            new_tabs.append(pre)
            new_tabs.append(post)
        else:
            new_tabs.append(tabs[i])

    tabs = new_tabs

    subtabs = list(
        tabs[(i*15):(i*15)+15] for i in range(len(tabs) // 15) 
    )

    final_text = ""
    final_spells_text = ""
    final_specials_text = ""

    for index, sub in enumerate(subtabs):
        # constructor(name, icon, col, desc, max_hp, max_mp, affinities, xp_value, spawn_credits, innate_spells, ai_level, blocks_los, untargetable, on_death)
        # name	icon	colour	desc	hp	mp	affinity 1	affinity 2	affinity 3	xp value	spawn credits	spells	ai level	Spawns on death
        name     = sub[0].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[0] else "Unnamed"
        icon     = sub[1].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[1] else "??"
        col      = sub[2].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[2] else "#f00"
        desc     = sub[3].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[3] else "This entity is corrupted and should not be here!"
        max_hp   = sub[4].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[4] else "1"
        max_mp   = sub[5].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[5] else "1"
        aff1     = sub[6].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[6] else "Living"
        aff2     = sub[7].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[7] else ""
        aff3     = sub[8].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[8] else ""
        xp_value = sub[9].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[9] else "0"
        screds   = sub[10].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[10] else "-1"
        specials = sub[11].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[11] else "None"
        spells   = sub[12].replace("\\", "\\\\").replace("\"", "\\\"") if sub[12] else "None"
        ai_lvl   = sub[13].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[13] else "1"
        on_death = sub[14].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[14] else "None"

        max_hp = "Number.POSITIVE_INFINITY" if max_hp == "Inf" else max_hp
        max_mp = "Number.POSITIVE_INFINITY" if max_mp == "Inf" else max_mp

        affinities = ",\n".join("            Affinity.{}".format(t) for t in (aff1, aff2, aff3) if t)

        spells_parsed = "\n".join(
            "        // {}".format(s) for s in spells.replace("\\\"", "").split("\n")
        )

        blocks_los = "true" if ai_lvl == "999" else "false"
        untargetable = "true" if ai_lvl == "999" else "false"

        if (on_death and on_death != "None"):
            on_death_parsed = "[\n" + ",\n".join(
                ("            {" + "name: \"{}\", cnt: {}".format(
                    d.rpartition(" ")[0],
                    d.rpartition(" ")[2].split("x")[1],
                ) + "}") for d in on_death.replace("\\\"", "").split("\\n")
            ) + "\n        ]"
        else:
            on_death_parsed = ""
        
        t = '    new EntityTemplate(\n' \
            '        "{}", "{}", "{}", "{}",\n' \
            '        {}, {}, [\n' \
            '{}\n' \
            '        ], {}, {},\n' \
            '        entities_spells["{}"],\n' \
            '        entities_specials["{}"],\n' \
            '        "{}",\n' \
            '        {}, {}, {}, {}\n' \
            '    ),\n\n'.format(
                name, icon, col, desc,
                max_hp, max_mp,
                affinities,
                xp_value, screds,
                name, name,
                specials,
                ai_lvl, blocks_los, untargetable,
                on_death_parsed
            )
        
        final_text += t
        
        t2 = '    "{}": [\n' \
             '{}\n' \
             '    ],\n\n'.format(
                name, spells_parsed
             )

        final_spells_text += t2

        t3 = '    "{}": function(game, ent, event_type) [[[\n' \
             '        // {}\n' \
             '    ]]],\n\n'.format(
                name, specials
             ).replace("[[[", "{").replace("]]]", "}")

        final_specials_text += t3
        
    with open("_spells_entities.js", "w") as f:
        f.write(
            "entity_templates = [\n{}\n]".format(
                final_text
            )
        )

    with open("_spells_entities_funcs.js", "w", encoding="utf-8") as f:
        f.write(
            "entities_spells = {\n" + final_spells_text + "\n}\n\n"
        )

        f.write(
            "entities_specials = {\n" + final_specials_text + "\n}\n"
        )

    print("written _spells_entities.js")


with open("spells.tsv", "r") as f:
    content = f.read()
    tabs = content.split("	")

    # every 15th element will be delimited by a "\n" instead
    new_tabs = []
    for i in range(len(tabs)):
        if i % 14 == 0 and i != 0:
            pre, _, post = tabs[i].rpartition("\n")
            new_tabs.append(pre)
            new_tabs.append(post)
        else:
            new_tabs.append(tabs[i])

    tabs = new_tabs

    subtabs = list(
        tabs[(i*15):(i*15)+15] for i in range(len(tabs) // 15) 
    )

    final_text = ""
    funcs_text = ""

    for index, sub in enumerate(subtabs):
        # constructor(name, icon, col, back_col, typ, desc, manacost, bonus_draws, trigger_type, to_stats_fn, at_target_fn, on_hit_fn, on_affected_tiles_fn)
        # name	icon	type	subtype	colour	bg colour	desc	manacost	damage	damage type	range	radius	shape	target type	target teams
        name        = sub[0].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[0] else "Unknown"
        icon        = sub[1].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[1] else "??"
        typ         = sub[2].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[2] else "Modifier"
        subtyp      = sub[3].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[3] else "Red Modifier"
        colour      = sub[4].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[4] else "#fff"
        back_col    = sub[5].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[5] else "#f00"
        desc        = sub[6].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[6] else ""
        manacost    = sub[7].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[7] else "0"
        damage      = sub[8].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[8] else ""
        dmg_type    = sub[9].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[9] else ""
        range       = sub[10].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[10] else ""
        radius      = sub[11].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[11] else ""
        shape       = sub[12].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[12] else ""
        target_typ  = sub[13].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[13] else ""
        target_team = sub[14].replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") if sub[14] else ""

        desc = desc.strip("\"")

        subtyp = subtyp.replace(" ", "")

        if (typ == "Core" and not damage) or (typ == "Modifier" and not desc):
            desc = "This core is corrupted and should not be here!"
            icon = "??"
            col = "#fff"
            back_col = "#f00"
            subtyp = "Red" if typ == "Core" else "RedModifier"

        icon = icon.replace("[", "«").replace("]", "»")

        if typ == "Core" and damage:
            # core_spell(
            #     "Fireball", "@>", "red", "", "", 10, DmgType.Fire, 7, 3,
            #     Shape.Diamond, 25
            # ),
            target_team = {
                "Player + Enemy": "Teams.ENEMY, Teams.PLAYER",
                "Player": "Teams.PLAYER",
                "Enemy": "Teams.ENEMY"
            }[target_team]

            t = '    core_spell(\n' \
                '        "{}", "{}", SpellSubtype.{},\n' \
                '        "{}", "{}",\n' \
                '        "{}",\n' \
                '        {}, DmgType.{},\n' \
                '        {}, {}, Shape.{},\n' \
                '        {},\n' \
                '        SpellTargeting.{},\n' \
                '        [{}]\n' \
                '    ),\n\n'.format(
                    name, icon, subtyp,
                    colour, back_col,
                    desc,
                    damage, dmg_type,
                    range, radius, shape,
                    manacost,
                    target_typ,
                    target_team
                )
        else:
            t = '    modifier(\n' \
                '        "{}", "{}", SpellSubtype.{},\n' \
                '        "{}", "{}",\n' \
                '        "{}",\n' \
                '        {},\n' \
                '        no_stats,\n' \
                '        no_target,\n' \
                '        no_hit,\n' \
                '        no_tiles,\n' \
                '    ),\n\n'.format(
                    name, icon, subtyp,
                    colour, back_col,
                    desc,
                    manacost
                )

        final_text += t

        t2 = '    "{}": [\n' \
             '        no_stats,\n' \
             '        no_target,\n' \
             '        no_hit,\n' \
             '        no_tiles\n' \
             '    ],\n\n'.format(
                name
             )

        funcs_text += t2

    with open("_spells_spells.js", "w", encoding="utf-8") as f:
        f.write(
            "spells_list = [\n{}\n]".format(
                final_text
            )
        )

    with open("_spells_spells_funcs.js", "w", encoding="utf-8") as f:
        f.write(
            "spells_funcs = {\n" + funcs_text + "\n}"
        )

    print("written _spells_spells.js")