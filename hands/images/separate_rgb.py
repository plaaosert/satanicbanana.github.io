from PIL import Image
import os
import numpy
import math

for f in os.listdir("back"):
    img = Image.open("back/" + f)
    
    w, h = img.size

    red = Image.new(size=(w, h), mode="RGBA", color=(0, 0, 0, 0))
    green = Image.new(size=(w, h), mode="RGBA", color=(0, 0, 0, 0))
    blue = Image.new(size=(w, h), mode="RGBA", color=(0, 0, 0, 0))

    for x in range(w):
        for y in range(h):
            pix = img.getpixel((x, y))

            red.putpixel((x, y), (pix[0], 0, 0, pix[3]))
            green.putpixel((x, y), (0, min(255, math.floor(pix[1] * 1.14)), 0, pix[3]))
            blue.putpixel((x, y), (0, 0, min(255, math.floor(pix[2] * 1.21)), pix[3]))

    red.save("rgb_separate/back/r/" + f)
    green.save("rgb_separate/back/g/" + f)
    blue.save("rgb_separate/back/b/" + f)
