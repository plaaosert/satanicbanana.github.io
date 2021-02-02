import os

path = input(">> ").replace("/", "\\")
path = path if "\\" in path else ("items\\" + path)
for index, file in enumerate(sorted(os.listdir(path))):
	print("{:50}".format(os.path.join(path, file)), "{:50}".format(os.path.join(path, "{:03}.png".format(index + 1))))
	os.rename(os.path.join(path, file), os.path.join(path, "{:03}.png".format(index + 1)))
	
print("Renamed", index + 1)
input("")