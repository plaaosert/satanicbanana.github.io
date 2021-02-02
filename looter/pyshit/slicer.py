# Slices a spritesheet.
from PIL import Image


def get_modal_colour(image):
    map = [[[0 for x in range(256)] for y in range(256)] for z in range(256)]
    height, width = image.size
    image_data = image.load()

    highest = [-1, (-1, -1, -1, 255)]
    for y in range(height):
        for x in range(width):
            r, g, b = image_data[x, y]
            map[r][g][b] += 1
            if map[r][g][b] > highest[0]:
                highest[0] = map[r][g][b]
                highest[1] = (r, g, b, 255)

    return highest


def remove_background(image):
    colour = (50, 201, 196)
    colour2 = (192, 192, 192)

    height, width = image.size
    image_data = image.load()
    for y in range(height):
        for x in range(width):
            rgba = image_data[y, x]
            r, g, b, a = image_data[y, x]
            image_data[y, x] = (rgba[0], rgba[1], rgba[2], 0 if (r, g, b) in (colour, colour2) else 255)


def crop_single(image, nx, ny, dimensions, path):
    remove_background(image)
    area = (nx * dimensions[0], ny * dimensions[1], (nx + 1) * dimensions[0], (ny + 1) * dimensions[1])
    cropped = image.crop(area)
    cropped.save(path)


def crop_all(path):
    image_load = Image.open(path)
    image_conv = image_load.convert("RGBA")
    fname = path.split("/")[-1].split(".")[0]
    reso = 8 if "-8" in path else (16 if "-16" in path else 24)
    print("reso", reso)
    print("expected {} file(s)".format(image_conv.size[1] // reso * image_conv.size[0] // reso))

    count = 0
    for yn in range(image_conv.size[1] // reso):
        for xn in range(image_conv.size[0] // reso):
            count += 1
            # print(count)
            crop_single(image_conv, xn, yn, (reso, reso), "../raw/generated/" + "S_" + fname + ".png")

    print(count, "file(s) sliced\n")


# image_load = Image.open("../raw/sheets/icon-1_1.png")
# image_conv = image_load.convert("RGBA")
# crop_single(image_conv, 1, 0, (24, 24), "../raw/generated/" + "test" + "_{:02}-{:02}.png".format(1, 0))
# input("")
# crop_all("../raw/sheets/" + input("name>> "))

import os
for file in os.listdir("../raw/singles/"):
    for ffile in os.listdir("../raw/singles/" + file + "/"):
        if ffile.endswith(".png"):
            print(ffile)
            crop_all("../raw/singles/" + file + "/" + ffile)
