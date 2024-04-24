import sys
import os
from PIL import Image

path = sys.argv[1]

print(", ".join(i for i in sorted(os.listdir(path))));
for p in sorted(os.listdir(path)):
    full_path = os.path.join(path, p)
    img = Image.open(full_path)

    w, h = img.size
    st = "\n".join(
        "    [{}],".format(", ".join(
            ("0" if img.getpixel((x, y))[3] <= 0 else "1") for x in range(w)
        )) for y in range(h)
    )
    
    print("[\n{}\n],\n".format(st))
