import re

with open("locations.tsv", "r") as f:
    content = f.read()
    tabs = content.split("	")

    items = [[]]
    for idx, tab in enumerate(tabs):
        if idx % 5 == 0 and idx > 0:
            items[-1].append(tab.split("\n")[0])
            items.append([])
            try:
                items[-1].append(tab.split("\n")[1])
            except:
                pass
        else:
            items[-1].append(tab)
    
    st = ""

    """
    new LocationTemplate(
        "Grassy Flatlands", "#7f0", "#250",
        "Echoes of a grassy plain.", [
            WorldGen.RandomWalls(get_entity_by_name("Tree"), 0.025, 0.075)
        ], {[Affinity.Natural]: 2}, [], LocationSpecials.NONE
    ),
    """

    for item in [i for i in items if i]:
        # print(item)
        st += """new LocationTemplate(
    "{}", "{}", "{}",
    "{}", [
        {}
    ], null /* {} */, [], LocationSpecials.NONE
),

""".format(
            item[0], item[1], item[2], item[3],
            ",\n        ".join(re.sub("WorldGen." + "\(\"((\w| )+)\"\)", "get_entity_by_name(\\1)", t).replace("\"\"", "\"").strip("\"") for t in item[4].split("\n")),
            item[5]
        )


print(st)