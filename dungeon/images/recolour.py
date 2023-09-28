from PIL import Image
import os

def do():
    col_muls = (
        (73, 54, 48, 255),
        (197, 15, 31, 255),
        (19, 161, 14, 255),
        (193, 156, 0, 255),
        (0, 55, 218, 255),
        (136, 23, 152, 255),
        (58, 150, 221, 255),
        (204, 204, 204, 255),
        (118, 118, 118, 255),
        (166, 87, 48, 255),
        (22, 198, 12, 255),
        (249, 241, 165, 255),
        (59, 120, 255, 255),
        (180, 0, 158, 255),
        (97, 214, 214, 255),
        (255, 255, 255, 255),
    )

    for file in os.listdir("single"):
        for col in range(16):
            img = Image.open("single/" + file)

            for x in range(img.width):
                for y in range(img.height):
                    pix = img.getpixel((x, y))

                    new_pix = col_muls[col] if sum(pix[:3]) > 0 else (0, 0, 0, 255)

                    img.putpixel((x, y), new_pix)

            path = "multicoloured/" + file.split(".")[0] + "-" + str(col).zfill(2) + "." + file.split(".")[1]
            print("\r" + path, end="")
            img.save(path)
    
    print("")

if __name__ == "__main__":
    do()
