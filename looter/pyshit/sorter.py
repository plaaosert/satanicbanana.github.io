from tkinter import *
from os import listdir, system, path
from PIL import Image

tk = Tk()
counter = -1
images_list = []
spath = "D:\\Python\\twitch_war\\twitchpost\\looter\\raw\\generated\\files\\{}\\".format(input("what>> "))
ratings = []
apath = "D:\\Python\\twitch_war\\twitchpost\\looter\\sprites\\items\\"
cur_typ = ""


class RatingButtons(Frame):
    def __init__(self, parent):
        self.bigFrame = Frame(parent)
        Frame.__init__(self, self.bigFrame, width=320, height=32, bg="red")

        Button(self, text="1", command=lambda: rate_image(1)).pack(side=LEFT, anchor=W)
        Button(self, text="2", command=lambda: rate_image(2)).pack(side=LEFT, anchor=W)
        Button(self, text="3", command=lambda: rate_image(3)).pack(side=LEFT, anchor=W)
        Button(self, text="4", command=lambda: rate_image(4)).pack(side=LEFT, anchor=W)
        Button(self, text="5", command=lambda: rate_image(5)).pack(side=LEFT, anchor=W)
        Button(self, text="6", command=lambda: rate_image(6)).pack(side=LEFT, anchor=W)
        Button(self, text="7", command=lambda: rate_image(7)).pack(side=LEFT, anchor=W)
        Button(self, text="8", command=lambda: rate_image(8)).pack(side=LEFT, anchor=W)
        Button(self, text="9", command=lambda: rate_image(9)).pack(side=LEFT, anchor=W)
        Button(self, text="10", command=lambda: rate_image(10)).pack(side=LEFT, anchor=W)

        self.bigFrame.pack()


def embiggen(path, name="t1.png", siz=256):
    # tkinter has no inbuilt image scaling function
    im_temp = Image.open(path)
    im_temp = im_temp.resize((siz, siz), Image.NEAREST)
    im_temp.save(
        name,
        "png"
    )


def resolve_all_images():
    rtxt = ""
    cname = spath.split("\\")[-2]

    system("mkdir {}".format(apath + cname))

    for index in range(len(images_list)):
        data_entry = ratings[index]
        ppath = images_list[index]
        fpath = data_entry[1].replace(" ", "_")
        if not path.exists(apath + cname + "\\" + fpath):
            system("mkdir {}".format(apath + cname + "\\" + fpath))

        orig_name = ppath.split("\\")[-1]
        rtxt += "{};{}:{}\n".format(
            orig_name, fpath, data_entry[0]
        )

        npath = apath + cname + "\\" + fpath + "\\" + orig_name
        system("copy \"{}\" \"{}\"".format(ppath, npath))

    with open("ratings_{}.txt".format(cname), "w") as f:
        f.write(rtxt)


def populate_all_images():
    global images_list
    global ratings

    images_list = [spath + d for d in listdir(spath)]
    ratings = [(-1, "none") for i in range(len(images_list))]


def rate_image(value):
    # also set ratings to the selected typ
    data = tbx.get()
    if not data:
        return

    if data[-1] in "01234567890":
        data = data[:-1]

    tbx.delete(0, END)
    tbx.insert(0, data)
    ratings[counter] = (value, data)
    t.config(text="{} | {}".format(data, value))
    next_image()


def next_image():
    global counter
    global ref_image
    global ref_old
    global ref_new

    counter += 1
    if counter == len(images_list):
        print(" - - - ")
        print("\n".join(
            images_list[i] + " " + str(ratings[i]) for i in range(len(images_list))
        ))
        resolve_all_images()
        exit(0)

    embiggen(images_list[counter])

    if counter > 0:
        embiggen(images_list[counter - 1], "t2.png", 128)

    if counter < len(images_list) - 1:
        embiggen(images_list[counter + 1], "t3.png", 128)

    num_lbl.config(text="image {}".format(counter))

    ref_image = PhotoImage(
        file="t1.png"
    )

    if counter > 0:
        ref_old = PhotoImage(
            file="t2.png"
        )

    if counter < len(images_list) - 1:
        ref_new = PhotoImage(
            file="t3.png"
        )
    canvas.create_image((0, 0), anchor=NW, image=ref_image)
    canvas.update()
    canvaso.create_image((0, 0), anchor=NW, image=ref_old)
    canvaso.update()
    canvasn.create_image((0, 0), anchor=NW, image=ref_new)
    canvasn.update()


def prev_image():
    global counter

    data = tbx.get()
    tbx.delete(0, END)
    tbx.insert(0, data[:-1])

    counter -= 2
    next_image()


ref_image = PhotoImage()
ref_old = PhotoImage()
ref_new = PhotoImage()
canvas = Canvas(tk, width=256, height=256)
canvas.pack(anchor=N)

canvaso = Canvas(tk, width=128, height=128)
canvaso.pack(anchor=W)

t = Label(tk, text="unknown")
t.pack(anchor=W)

canvasn = Canvas(tk, width=128, height=128)
canvasn.pack(anchor=NE)

# button = Button(tk, text="NEXT", command=next_image)
# button.pack(anchor=S)

num_lbl = Label(tk, text="image 0")
num_lbl.pack(anchor=S)

ratebut = RatingButtons(tk)
ratebut.pack(anchor=S)

tbx = Entry(tk, text="TYPE?")
tbx.pack(anchor=S)

tk.bind("1", lambda a: rate_image(1))
tk.bind("2", lambda a: rate_image(2))
tk.bind("3", lambda a: rate_image(3))
tk.bind("4", lambda a: rate_image(4))
tk.bind("5", lambda a: rate_image(5))
tk.bind("6", lambda a: rate_image(6))
tk.bind("7", lambda a: rate_image(7))
tk.bind("8", lambda a: rate_image(8))
tk.bind("9", lambda a: rate_image(9))
tk.bind("0", lambda a: rate_image(10))

tk.bind("`", lambda a: tbx.delete(0, END))
tk.bind("[", lambda a: prev_image())

populate_all_images()
next_image()
tk.mainloop()
