with open("words_big.txt") as f:
    print("words = [\n{}\n]".format(
        "\n".join("    \"{}\",".format(line.strip()) for line in f.readlines())
    ))