from PIL import Image
import os

def do():
    print("singles ", end="")
    for file in os.listdir("single"):
        img = Image.open("single/" + file)

        img = img.resize((320, 320), Image.NEAREST)

        img.save("single_big/" + file)
        print("\r" + "singles (" + file + ")", end="")

    print("\n\nmultis")
    for file in os.listdir("multicoloured"):
        img = Image.open("multicoloured/" + file)

        img = img.resize((320, 320), Image.NEAREST)

        img.save("multicoloured_big/" + file)
        print("\r" + "multis (" + file + ")", end="")

if __name__ == "__main__":
    do()
