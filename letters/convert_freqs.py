words = set()
with open("words_big.txt") as f:
    for line in f:
        words.add(line.strip().upper())

with open("freqs.txt") as f:
    print("freqs = ~(\n{}\n)~".format(
        "\n".join("    \"{}\": {},".format(*line.upper().strip().split(" ")) for line in f.readlines() if line.upper().strip().split(" ")[0] in words)
    ).replace("~(", "{").replace(")~", "}"))