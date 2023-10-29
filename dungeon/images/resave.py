from PIL import Image
import os
import cv2
import numpy
import subprocess

print("compressing singles")
old_sizes = []
new_sizes = []
for file in os.listdir("single_big"):
    path = "single_big/" + file

    old_sizes.append(os.path.getsize(path))

    subprocess.call(["optipng", "-o7", path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    new_sizes.append(os.path.getsize(path))

    print("\r{:20} (change: {:<6}%)".format(path, round(100 * sum(new_sizes) / sum(old_sizes), 2)), end="")


print("compressing multis")
old_sizes = []
new_sizes = []
for file in os.listdir("multicoloured_big"):
    path = "multicoloured_big/" + file

    old_sizes.append(os.path.getsize(path))

    subprocess.call(["optipng", "-o7", path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    new_sizes.append(os.path.getsize(path))

    print("\r{:20} (change: {:<6}%)".format(path, round(100 * sum(new_sizes) / sum(old_sizes), 2)), end="")
