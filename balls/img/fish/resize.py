from PIL import Image
import os

for file in os.listdir():
    if not file.endswith(".png"):
        continue

    img = Image.open(file)

    newimg = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    newimg.paste(img, (0, 32))

    newimg.save(f"{file}")
