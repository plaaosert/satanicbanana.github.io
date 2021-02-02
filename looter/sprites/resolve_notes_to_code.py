with open("D:/Python/twitch_war/twitchpost/looter/sprites/notes.txt", "r") as f:
    string = ""
    for line in f:
        for part in line.replace("\n", "")[2:].split(", "):
            if part:
                pp = part.split(" ", 1)
                string += ", [\"{}\", \"{}\"]".format(pp[0], pp[1])
            

        string += "\n"

print(string)
input("")
