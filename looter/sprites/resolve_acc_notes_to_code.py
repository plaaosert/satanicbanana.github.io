with open("D:/Python/twitch_war/twitchpost/looter/sprites/notes.txt", "r") as f:
	string = ""
	for line in f:
		for part in line.replace("\n", "")[2:].split(", "):
			if part:
				print("{:60}".format(part), "|" in part)
				pp = part.split("|")[0].split(" ", 1)
				pp2 = part.split("|")[1]
				string += ", [\"{}\", \"{}\", \"{}{}\"]".format(pp[0], pp[1], "stats." if "." not in pp2 else "", pp2.rstrip(","))

		string += "\n"

print(string)
input("")
